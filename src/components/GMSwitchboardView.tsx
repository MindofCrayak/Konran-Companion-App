import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Send,
  Radio,
  Users,
  UserCheck,
  Sparkles,
  BookOpen,
  CalendarClock,
  Lock,
  Unlock,
  GraduationCap,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Flame,
  Landmark,
  History,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { DEITIES } from '../data/deities';
import { NyneDeityId, KAMPHouseId } from '../types';
import {
  PRESTIGE_ENTITIES,
  PrestigeLedgerState,
  loadPrestigeLedger,
  adjustEntityStanding,
  applyMonthlyStandingDrift,
  evaluatePrestigeClearance,
  formatPrestigeStanding,
} from '../utils/prestige';
import { useGMFeed, publishLocalGMFeedEvent, GMFeedEvent } from '../hooks/useGMFeed';
import { playKeyClick, playOptionSelect } from '../utils/audio';

export interface GMSwitchboardViewProps {
  onClose?: () => void;
  className?: string;
}

interface LKHandoutOption {
  resourceId: string;
  title: string;
  category: string;
  summary: string;
}

interface CampaignOption {
  id: string;
  code: string;
  name: string;
  layerIndex: number;
}

const CANONICAL_CAMPAIGNS: CampaignOption[] = [
  {
    id: 'cmp_caldera_covenant',
    code: 'CMP-6',
    name: 'Campaign 6: The Caldera Void Covenant',
    layerIndex: 6,
  },
  {
    id: 'cmp_syzygy_eclipse',
    code: 'CMP-7',
    name: 'Campaign 7: Shadow of Kestox Syzygy',
    layerIndex: 7,
  },
  {
    id: 'cmp_kamp_trials',
    code: 'CMP-8',
    name: 'Campaign 8: K.A.M.P. Sovereign Crucible',
    layerIndex: 8,
  },
];

const FALLBACK_LK_HANDOUTS: LKHandoutOption[] = [
  {
    resourceId: 'crafton-cove',
    title: 'Crafton Cove Harbormaster Manifest & Ley-Chart',
    category: 'City Map & Handout',
    summary: 'Confidential shipping ledger detailing magnetic-ore shipments through Kray Providence.',
  },
  {
    resourceId: 'vantya',
    title: 'Vantya Imperial Airship Drydock Clearance Writ',
    category: 'Imperial Decree',
    summary: 'Signed sovereign pass granting drydock priority and diplomatic passage across Oray Core.',
  },
  {
    resourceId: 'mydnight-rendezvous',
    title: 'The Mydnight Rendezvous — Floorplan & Cipher Dead-Drop',
    category: 'Tier 4 Interior Handout',
    summary: 'Annotated tavern interior layout with Spyder Systerhood whisper-booth locations.',
  },
  {
    resourceId: 'sunfire-observatory',
    title: 'Sunfire Chrysoberyl Observatory Syzygy Tables',
    category: 'Astronomical Dossier',
    summary: '36-hour orbital predictions for when Keztox eclipses Krayvuk’s Singularity Eye.',
  },
  {
    resourceId: 'kamp-citadel',
    title: 'K.A.M.P. Academy Citadel — Quad & Dormitory Charter',
    category: 'Academy Handout',
    summary: 'Official enrollment rules, 4-House sorting rubrics, and restricted archive protocols.',
  },
  {
    resourceId: 'padd-city',
    title: 'Padd City — Lyricia Courier Escrow Ledger',
    category: 'Commerce Handout',
    summary: 'Triangular copper & electrum mint exchange rates verified by the Treasurers of Kelth.',
  },
];

const KAMP_HOUSES: KAMPHouseId[] = [
  'Pyros',
  'Umbra',
  'Thalassa',
  'Aethelgard',
  'Astralis',
  'Bellona',
  'Paradox',
  'Duath',
  'Hydra',
  'Gryffon',
  'Spynx',
  'Unycorn',
];

export const GMSwitchboardView: React.FC<GMSwitchboardViewProps> = ({
  className = '',
}) => {
  const {
    characters,
    activeCharacter,
    declareDeity,
    updateKAMPAcademics,
    updateCharacter,
    customPortals,
  } = useCharacter();

  const [activeTab, setActiveTab] = useState<'handouts' | 'prestige' | 'approvals'>('prestige');

  // Campaign & Handout Dropper State
  const allCampaigns: CampaignOption[] = [
    ...CANONICAL_CAMPAIGNS,
    ...customPortals
      .filter((p) => p.isCampaign || p.index >= 6)
      .map((p) => ({
        id: `cmp_custom_${p.index}`,
        code: p.code,
        name: `Layer ${p.index}: ${p.name}`,
        layerIndex: p.index,
      })),
  ];

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(allCampaigns[0]?.id || 'cmp_caldera_covenant');
  const [lkSearchQuery, setLkSearchQuery] = useState<string>('');
  const [lkResults, setLkResults] = useState<LKHandoutOption[]>(FALLBACK_LK_HANDOUTS);
  const [isSearchingLK, setIsSearchingLK] = useState<boolean>(false);
  const [selectedHandoutId, setSelectedHandoutId] = useState<string>(FALLBACK_LK_HANDOUTS[0].resourceId);
  const [deliveryMode, setDeliveryMode] = useState<'public_broadcast' | 'targeted_drop'>('public_broadcast');
  const [targetCharacterId, setTargetCharacterId] = useState<string>(
    activeCharacter?.id || characters[0]?.id || 'char_oray_invoker_01'
  );

  // Prestige & Reputation Stepper State
  const [prestigeLedger, setPrestigeLedger] = useState<PrestigeLedgerState>(() => loadPrestigeLedger());
  const [entityCategoryFilter, setEntityCategoryFilter] = useState<'all' | 'church' | 'city'>('all');
  const [rumorNote, setRumorNote] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Progression Approvals State
  const [approvalCharId, setApprovalCharId] = useState<string>(
    activeCharacter?.id || characters[0]?.id || 'char_oray_invoker_01'
  );
  const selectedApprovalChar =
    characters.find((c) => c.id === approvalCharId) || activeCharacter || characters[0];

  const [selectedDeityToApprove, setSelectedDeityToApprove] = useState<NyneDeityId>(
    selectedApprovalChar?.declaredDeity || 'Oray'
  );
  const [deityLocked, setDeityLocked] = useState<boolean>(true);
  const [selectedKampHouse, setSelectedKampHouse] = useState<KAMPHouseId>(
    selectedApprovalChar?.kampProfile?.houseId || 'Pyros'
  );

  const { events: recentFeedEvents } = useGMFeed({
    characterId: activeCharacter?.id,
    pollIntervalMs: 5000,
  });

  useEffect(() => {
    if (selectedApprovalChar?.declaredDeity) {
      setSelectedDeityToApprove(selectedApprovalChar.declaredDeity);
    }
    if (selectedApprovalChar?.kampProfile?.houseId) {
      setSelectedKampHouse(selectedApprovalChar.kampProfile.houseId);
    }
  }, [selectedApprovalChar]);

  // Query `/api/lore/legendkeeper?q=` with fallback to canonical handouts
  const handleSearchLegendKeeper = useCallback(async (query: string) => {
    setLkSearchQuery(query);
    if (!query.trim()) {
      setLkResults(FALLBACK_LK_HANDOUTS);
      return;
    }

    const lower = query.toLowerCase();
    const localMatches = FALLBACK_LK_HANDOUTS.filter(
      (h) =>
        h.title.toLowerCase().includes(lower) ||
        h.resourceId.toLowerCase().includes(lower) ||
        h.summary.toLowerCase().includes(lower)
    );

    setIsSearchingLK(true);
    try {
      const res = await fetch(`/api/lore/legendkeeper?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const payload: any = await res.json();
        const remoteItems: LKHandoutOption[] = (payload?.data || []).map((item: any) => ({
          resourceId: item?.resource?.id || item?.id || 'lk-resource',
          title: item?.resource?.name || item?.document?.name || item?.name || 'LegendKeeper Handout',
          category: (item?.resource?.tags || ['LK Article']).join(', '),
          summary: `Synced LegendKeeper v3 article (${item?.resource?.id || 'live'})`,
        }));
        const merged = [...remoteItems, ...localMatches].filter(
          (v, idx, arr) => arr.findIndex((x) => x.resourceId === v.resourceId) === idx
        );
        setLkResults(merged.length > 0 ? merged : FALLBACK_LK_HANDOUTS);
        if (merged[0]) setSelectedHandoutId(merged[0].resourceId);
      } else {
        setLkResults(localMatches.length > 0 ? localMatches : FALLBACK_LK_HANDOUTS);
      }
    } catch {
      setLkResults(localMatches.length > 0 ? localMatches : FALLBACK_LK_HANDOUTS);
    } finally {
      setIsSearchingLK(false);
    }
  }, []);

  const postGMActionToBackend = async (event: GMFeedEvent) => {
    // 1. Immediately broadcast via BroadcastChannel('konran-gm-feed') & CustomEvent
    publishLocalGMFeedEvent(event);

    // 2. POST to Cloudflare Pages Function `/api/gm/action`
    try {
      await fetch('/api/gm/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch {
      // Offline / local mode already handled via publishLocalGMFeedEvent
    }
  };

  // Dispatch Handout Drop (Public Broadcast or Targeted Drop)
  const handleDropHandout = async () => {
    playOptionSelect();
    const campaign = allCampaigns.find((c) => c.id === selectedCampaignId) || allCampaigns[0];
    const handout =
      lkResults.find((h) => h.resourceId === selectedHandoutId) || FALLBACK_LK_HANDOUTS[0];
    const targetChar = characters.find((c) => c.id === targetCharacterId);

    const now = Date.now();
    const event: GMFeedEvent = {
      id: `gm_drop_${now}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'handout_drop',
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      campaignId: campaign.id,
      campaignName: campaign.name,
      deliveryMode,
      targetCharacterId: deliveryMode === 'targeted_drop' ? targetCharacterId : undefined,
      targetCharacterName: deliveryMode === 'targeted_drop' ? targetChar?.name : 'All Party Members',
      handout: {
        resourceId: handout.resourceId,
        title: handout.title,
        summary: handout.summary,
        layerTarget: deliveryMode === 'public_broadcast' ? campaign.layerIndex : 3,
      },
    };

    // If Targeted Drop, also append to that player's notes/inventory in CharacterContext
    if (deliveryMode === 'targeted_drop' && targetChar) {
      const existingNote = targetChar.playerNotes?.general || '';
      const dropStamp = `\n[GM HANDOUT DROP // ${handout.title}]: ${handout.summary}`;
      updateCharacter(targetChar.id, {
        playerNotes: {
          ...targetChar.playerNotes,
          general: (existingNote + dropStamp).trim(),
        },
      });
    }

    await postGMActionToBackend(event);
    setFeedbackToast(
      deliveryMode === 'public_broadcast'
        ? `Public Broadcast dispatched: "${handout.title}" → ${campaign.name}`
        : `Targeted Drop delivered to ${targetChar?.name || 'Player'}: "${handout.title}"`
    );
  };

  // One-Tap Reputation Stepper: [-0.50] [-0.25] [+0.25] [+0.50]
  const handleReputationStep = async (entityId: string, delta: number) => {
    playKeyClick();
    const entityDef = PRESTIGE_ENTITIES.find((e) => e.id === entityId);
    const defaultRumor =
      rumorNote.trim() ||
      `World Wire // ${entityDef?.name || entityId} standing shifted by ${
        delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)
      } for ${activeCharacter?.name || 'the party'}.`;

    const { record, ledger } = adjustEntityStanding(entityId, delta, defaultRumor);
    setPrestigeLedger({ ...ledger });

    const now = Date.now();
    const event: GMFeedEvent = {
      id: `gm_rep_${now}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'reputation_step',
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      deliveryMode: 'public_broadcast',
      targetCharacterId: activeCharacter?.id,
      targetCharacterName: activeCharacter?.name,
      reputation: {
        entityId,
        entityName: entityDef?.name || entityId,
        delta,
        newStanding: record.standing,
        newPrestige: record.prestige,
        rumorNote: defaultRumor,
      },
    };

    await postGMActionToBackend(event);
    setFeedbackToast(
      `${entityDef?.name}: ${delta > 0 ? '+' : ''}${delta.toFixed(2)} → Prestige ${
        record.prestige
      } (${record.standing >= 0 ? '+' : ''}${record.standing.toFixed(2)}) · Rumor posted to The Nyne Net (1)`
    );
  };

  // Apply Konran Month Drift ±0.50
  const handleApplyMonthlyDrift = async () => {
    playOptionSelect();
    const updatedLedger = applyMonthlyStandingDrift(0.5);
    setPrestigeLedger({ ...updatedLedger });

    const now = Date.now();
    const event: GMFeedEvent = {
      id: `gm_drift_${now}`,
      type: 'monthly_drift',
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      deliveryMode: 'public_broadcast',
      reputation: {
        entityId: 'all_entities',
        entityName: 'All Konran Churches & Cities',
        delta: 0.5,
        newStanding: 0,
        newPrestige: 0,
        rumorNote:
          'Liturgical Month Pass // Public standings drifted ±0.50 toward 0.00 baseline. High-Insight NPCs retain memory of past deeds.',
      },
    };

    await postGMActionToBackend(event);
    setFeedbackToast(
      'Applied Konran Month Drift (±0.50 toward 0.00). High-Insight NPC deed memory preserved.'
    );
  };

  // Approve & Lock Official Deity Declaration
  const handleApproveDeityDeclaration = async () => {
    if (!selectedApprovalChar) return;
    playOptionSelect();

    declareDeity(selectedApprovalChar.id, selectedDeityToApprove, Math.max(1, selectedApprovalChar.deityDevotionTier || 1));
    updateCharacter(selectedApprovalChar.id, {
      declaredDeity: selectedDeityToApprove,
      hasCompletedDeityTrial: true,
    });

    const now = Date.now();
    const event: GMFeedEvent = {
      id: `gm_deity_${now}`,
      type: 'deity_declaration_lock',
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      deliveryMode: 'targeted_drop',
      targetCharacterId: selectedApprovalChar.id,
      targetCharacterName: selectedApprovalChar.name,
      progression: {
        characterId: selectedApprovalChar.id,
        characterName: selectedApprovalChar.name,
        declaredDeity: selectedDeityToApprove,
        deityLocked,
      },
    };

    await postGMActionToBackend(event);
    setFeedbackToast(
      `Deity Declaration Approved & ${deityLocked ? 'Locked' : 'Updated'}: ${
        selectedApprovalChar.name
      } → Patron ${selectedDeityToApprove}`
    );
  };

  // Toggle K.A.M.P. Student / Alumni Status
  const handleSetKampStatus = async (status: 'enrolled' | 'alumnus' | 'restricted') => {
    if (!selectedApprovalChar) return;
    playOptionSelect();

    if (status === 'restricted') {
      updateKAMPAcademics(selectedApprovalChar.id, {
        attended: false,
        yearOfStudy: 'Expelled',
        academicStanding: 'Probationary',
      });
    } else {
      updateKAMPAcademics(selectedApprovalChar.id, {
        attended: true,
        houseId: selectedKampHouse,
        houseName: `House ${selectedKampHouse}`,
        yearOfStudy: status === 'alumnus' ? 'Alumnus' : 'Senior',
        academicStanding: status === 'alumnus' ? 'Distinguished Magus' : 'Good Standing',
      });
    }

    const now = Date.now();
    const event: GMFeedEvent = {
      id: `gm_kamp_${now}`,
      type: 'kamp_enrollment_approval',
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      deliveryMode: 'targeted_drop',
      targetCharacterId: selectedApprovalChar.id,
      targetCharacterName: selectedApprovalChar.name,
      progression: {
        characterId: selectedApprovalChar.id,
        characterName: selectedApprovalChar.name,
        kampStatus: status,
        kampHouseId: selectedKampHouse,
      },
    };

    await postGMActionToBackend(event);
    setFeedbackToast(
      `K.A.M.P. Layer 4 Access updated for ${selectedApprovalChar.name}: ${status.toUpperCase()} (${selectedKampHouse})`
    );
  };

  const filteredEntities = PRESTIGE_ENTITIES.filter(
    (e) => entityCategoryFilter === 'all' || e.category === entityCategoryFilter
  );

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#09080d] text-amber-100 font-mono text-xs overflow-hidden ${className}`}
    >
      {/* Top Switchboard Header */}
      <div className="px-4 py-3 border-b border-amber-500/30 bg-black/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-500/15 border border-amber-400/50 text-amber-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider uppercase text-amber-300 flex items-center gap-2">
              <span>DISCORD GM SWITCHBOARD &amp; PRESTIGE ENGINE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-200 border border-purple-400/50">
                DM ROLE BRIDGE
              </span>
            </div>
            <div className="text-[10px] text-amber-200/60">
              Live 3–8s Pulse • Rollover Prestige (-100.00 to +100.00) • Dynamic Layer 2 &amp; Layer 4 Clearance
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              setActiveTab('prestige');
            }}
            className={`px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer border transition-colors ${
              activeTab === 'prestige'
                ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Reputation Steppers
          </button>
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              setActiveTab('handouts');
            }}
            className={`px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer border transition-colors ${
              activeTab === 'handouts'
                ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Campaign &amp; LK Dropper
          </button>
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              setActiveTab('approvals');
            }}
            className={`px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer border transition-colors ${
              activeTab === 'approvals'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Deity &amp; K.A.M.P. Approvals
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackToast && (
        <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 text-[11px] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-[10px] text-emerald-300/70 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Scrollable Body */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {/* TAB 1: ONE-TAP REPUTATION STEPPERS & PRESTIGE CLEARANCE ENGINE */}
        {activeTab === 'prestige' && (
          <div className="space-y-4">
            {/* Rumor Input + Monthly Drift Control Bar */}
            <div className="p-3 rounded bg-black/60 border border-amber-500/30 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span>1-Line Rumor Dispatch → Posts to The Nyne Net (Layer 1)</span>
                </div>

                <button
                  type="button"
                  onClick={handleApplyMonthlyDrift}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-bold text-[11px] cursor-pointer transition-colors"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Apply Konran Month Drift ±0.50</span>
                </button>
              </div>

              <input
                type="text"
                value={rumorNote}
                onChange={(e) => setRumorNote(e.target.value)}
                placeholder="Optional 1-line World Wire rumor note (e.g. 'Spotted aiding Oray pyromancers at the Caldera rim')..."
                className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-amber-500/35 text-xs text-white placeholder-amber-200/35 focus:outline-none focus:border-amber-400"
              />

              {/* Category Filter */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {(['all', 'church', 'city'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setEntityCategoryFilter(cat);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold cursor-pointer border ${
                        entityCategoryFilter === cat
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-black/50 text-amber-200/70 border-amber-500/25 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Churches & Cities' : cat === 'church' ? 'The Nyne Churches' : 'Major Cities'}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-amber-200/50">
                  Rollover at ±100.00 → Prestige 1, 2, 3, 4+
                </span>
              </div>
            </div>

            {/* Entity Cards with [-0.50] [-0.25] [+0.25] [+0.50] Steppers */}
            <div className="grid grid-cols-1 gap-2.5">
              {filteredEntities.map((entity) => {
                const rec = prestigeLedger.records[entity.id] || {
                  entityId: entity.id,
                  standing: 0,
                  prestige: 0,
                  peakPrestige: 0,
                  lastUpdated: '',
                };
                const evalRes = evaluatePrestigeClearance(entity.id, 1, 0);

                return (
                  <div
                    key={entity.id}
                    className="p-3 rounded bg-black/55 border border-white/10 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entity.category === 'church' ? (
                          <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        )}
                        <span className="font-bold text-white text-xs">{entity.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-amber-200/80">
                          {entity.deityOrProvince}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            rec.prestige > 0 || rec.standing > 0
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : rec.prestige < 0 || rec.standing < 0
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {formatPrestigeStanding(rec)}
                        </span>
                      </div>

                      {/* Unlocked Internal Sects / Revocation Status */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        {evalRes.unlockedSects.length > 0 ? (
                          evalRes.unlockedSects.map((sect) => (
                            <span
                              key={sect}
                              className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-200 border border-purple-500/40 flex items-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                              {sect}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/45">
                            {rec.peakPrestige > rec.prestige
                              ? 'CLEARANCE REVOKED // Standing below threshold'
                              : 'No inner-sect invitations active (Prestige 1–4+ required)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* One-Tap Reputation Steppers */}
                    <div className="flex items-center gap-1 shrink-0">
                      {([-0.5, -0.25, 0.25, 0.5] as const).map((step) => {
                        const isPositive = step > 0;
                        return (
                          <button
                            key={step}
                            type="button"
                            onClick={() => handleReputationStep(entity.id, step)}
                            className={`px-2 py-1.5 rounded font-bold text-[11px] cursor-pointer border transition-colors ${
                              isPositive
                                ? 'bg-emerald-950/70 hover:bg-emerald-800/80 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-950/70 hover:bg-rose-800/80 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {isPositive ? `+${step.toFixed(2)}` : step.toFixed(2)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* High-Insight / "In The Know" NPC Remembered Deeds Log */}
            {prestigeLedger.rememberedDeeds.length > 0 && (
              <div className="p-3 rounded bg-black/50 border border-purple-500/30 space-y-2">
                <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>
                    High-Insight / &quot;In The Know&quot; NPC Deed Memory ({prestigeLedger.rememberedDeeds.length})
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {prestigeLedger.rememberedDeeds.slice(0, 8).map((deed) => (
                    <div
                      key={deed.id}
                      className="text-[10px] p-2 rounded bg-zinc-950/90 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-bold text-amber-300">{deed.entityName}:</span>{' '}
                        <span className="text-white/80">{deed.rumorNote}</span>
                      </div>
                      <span className="text-purple-300 shrink-0">
                        {deed.delta > 0 ? `+${deed.delta.toFixed(2)}` : deed.delta.toFixed(2)} (P{deed.prestigeAfter})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAMPAIGN & LEGENDKEEPER HANDOUT DROPPER */}
        {activeTab === 'handouts' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded bg-black/60 border border-purple-500/35 space-y-3">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Campaign &amp; LegendKeeper Handout Dropper</span>
              </div>

              {/* Campaign Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-purple-200/70">
                  Active Campaign Portal (Layer 6+)
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-950 border border-purple-500/40 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {allCampaigns.map((cmp) => (
                    <option key={cmp.id} value={cmp.id} className="bg-zinc-900">
                      [{cmp.code}] {cmp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LegendKeeper Article / Handout Search */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-purple-200/70">
                  Search LegendKeeper Handout / Article (/api/lore/legendkeeper?q=)
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-purple-300/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={lkSearchQuery}
                    onChange={(e) => void handleSearchLegendKeeper(e.target.value)}
                    placeholder="Filter canonical handouts or search live LegendKeeper..."
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-zinc-950 border border-purple-500/40 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Handout Picker List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {isSearchingLK && (
                  <div className="text-[11px] text-purple-300/70 py-2">
                    Querying LegendKeeper v3 endpoint...
                  </div>
                )}
                {lkResults.map((item) => {
                  const isSelected = item.resourceId === selectedHandoutId;
                  return (
                    <button
                      key={item.resourceId}
                      type="button"
                      onClick={() => {
                        playKeyClick();
                        setSelectedHandoutId(item.resourceId);
                      }}
                      className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-400 text-white'
                          : 'bg-zinc-950/70 border-white/10 text-white/75 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-purple-200">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/60 mt-1">{item.summary}</div>
                    </button>
                  );
                })}
              </div>

              {/* Delivery Mode Toggle: Public Broadcast vs Targeted Drop */}
              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playOptionSelect();
                      setDeliveryMode('public_broadcast');
                    }}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                      deliveryMode === 'public_broadcast'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-black/40 border-white/10 text-white/60'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Public Broadcast</span>
                    </div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      Drops onto all party members&apos; Campaign 6+ / active layer
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playOptionSelect();
                      setDeliveryMode('targeted_drop');
                    }}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                      deliveryMode === 'targeted_drop'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-black/40 border-white/10 text-white/60'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Targeted Drop</span>
                    </div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      Routes directly into one player&apos;s inventory &amp; notes
                    </div>
                  </button>
                </div>

                {deliveryMode === 'targeted_drop' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-emerald-300/80">
                      Target Party Member
                    </label>
                    <select
                      value={targetCharacterId}
                      onChange={(e) => setTargetCharacterId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-emerald-500/40 text-xs text-white"
                    >
                      {characters.map((ch) => (
                        <option key={ch.id} value={ch.id} className="bg-zinc-900">
                          {ch.name} — Lvl {ch.level} {ch.characterClass}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDropHandout}
                  className="w-full py-2.5 px-4 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {deliveryMode === 'public_broadcast'
                      ? 'Broadcast Handout to Campaign Layer (3–8s Pulse)'
                      : 'Deliver Targeted Handout to Player Notes'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESSION APPROVALS (DEITY DECLARATIONS & K.A.M.P. STATUS) */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {/* Character Selector */}
            <div className="p-3 rounded bg-black/60 border border-emerald-500/35 space-y-2">
              <label className="block text-[10px] uppercase text-emerald-300/80 font-bold">
                Select Character for GM Progression Approval
              </label>
              <select
                value={approvalCharId}
                onChange={(e) => setApprovalCharId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-emerald-500/40 text-xs text-white"
              >
                {characters.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">
                    {c.name} ({c.characterClass}) — Patron: {c.declaredDeity || 'Undeclared'}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Deity Declaration Approval & Lock */}
            <div className="p-3.5 rounded bg-black/60 border border-amber-500/35 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Official Deity Declaration &amp; Covenant Lock</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  Layer 2 (Declared) Gate
                </span>
              </div>

              <p className="text-[11px] text-white/70">
                Following the advisory Nyne Quiz and post-creation Fated Questionnaire, approve and lock the player&apos;s official Patron Deity covenant.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
                    Declared Patron Deity (The Nyne)
                  </label>
                  <select
                    value={selectedDeityToApprove}
                    onChange={(e) => setSelectedDeityToApprove(e.target.value as NyneDeityId)}
                    className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-amber-500/40 text-xs text-white"
                  >
                    {Object.keys(DEITIES).map((dId) => (
                      <option key={dId} value={dId} className="bg-zinc-900">
                        {DEITIES[dId].name} — {DEITIES[dId].title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      playKeyClick();
                      setDeityLocked((prev) => !prev);
                    }}
                    className={`w-full px-3 py-1.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      deityLocked
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                        : 'bg-zinc-900 border-white/20 text-white/70'
                    }`}
                  >
                    {deityLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{deityLocked ? 'Covenant Locked (Immutable)' : 'Unlocked for Trial Revision'}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApproveDeityDeclaration}
                className="w-full py-2 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer transition-colors"
              >
                Approve &amp; Bind Official Deity Declaration
              </button>
            </div>

            {/* K.A.M.P. Student / Alumni Intranet Toggle */}
            <div className="p-3.5 rounded bg-black/60 border border-emerald-500/35 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>K.A.M.P. Academy Enrollment &amp; Alumni Status</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
                  Layer 4 (K.A.M.P.) Gate
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-emerald-200/70">
                  Assigned K.A.M.P. House
                </label>
                <select
                  value={selectedKampHouse}
                  onChange={(e) => setSelectedKampHouse(e.target.value as KAMPHouseId)}
                  className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-emerald-500/40 text-xs text-white"
                >
                  {KAMP_HOUSES.map((house) => (
                    <option key={house} value={house} className="bg-zinc-900">
                      House {house}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => void handleSetKampStatus('enrolled')}
                  className="py-2 px-2.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400 text-emerald-200 font-bold text-[11px] cursor-pointer"
                >
                  Approve Student
                </button>
                <button
                  type="button"
                  onClick={() => void handleSetKampStatus('alumnus')}
                  className="py-2 px-2.5 rounded bg-sky-600/30 hover:bg-sky-600/50 border border-sky-400 text-sky-200 font-bold text-[11px] cursor-pointer"
                >
                  Grant Alumnus
                </button>
                <button
                  type="button"
                  onClick={() => void handleSetKampStatus('restricted')}
                  className="py-2 px-2.5 rounded bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold text-[11px] cursor-pointer"
                >
                  Restrict / Expel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent GM Feed Pulse Log */}
        <div className="p-3 rounded bg-black/40 border border-white/10 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60 flex items-center justify-between">
            <span>Recent GM Switchboard Feed Pulse ({recentFeedEvents.length})</span>
            <span className="text-emerald-400">BroadcastChannel + /api/gm/feed Active</span>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {recentFeedEvents.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="text-[10px] px-2 py-1 rounded bg-zinc-950/80 border border-white/5 flex items-center justify-between gap-2"
              >
                <span className="truncate text-white/80">
                  <strong className="text-amber-300 uppercase">[{ev.type.replace(/_/g, ' ')}]</strong>{' '}
                  {ev.handout?.title ||
                    ev.reputation?.rumorNote ||
                    (ev.progression
                      ? `${ev.progression.characterName}: ${
                          ev.progression.declaredDeity || ev.progression.kampStatus
                        }`
                      : '')}
                </span>
                <span className="text-white/40 shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GMSwitchboardView;
