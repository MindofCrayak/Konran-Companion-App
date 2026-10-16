import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff
} from 'lucide-react';
import { GatedLoreBlock } from '../types';
import { useCharacter } from '../context/CharacterContext';
import { playDivineReveal, playKeyClick } from '../utils/audio';

interface RedactedLoreProps {
  lore: GatedLoreBlock;
  className?: string;
  defaultExpanded?: boolean;
  forceHideIfLocked?: boolean;
}

export const RedactedLore: React.FC<RedactedLoreProps> = ({ 
  lore, 
  className = '',
  defaultExpanded = true,
  forceHideIfLocked = false
}) => {
  const { evaluateClearance, account, activeCharacter } = useCharacter();
  const clearance = evaluateClearance(lore.requirement);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
  const visibilityMode = lore.visibilityMode || 'cloaked';

  // Evaluate whether the character genuinely meets criteria without the DM master override
  const characterHasNaturalAccess = (() => {
    if (!activeCharacter) return false;
    const checks: boolean[] = [];

    if (lore.requirement.requiredDeity) {
      const isFollower = activeCharacter.declaredDeity === lore.requirement.requiredDeity;
      const minTier = lore.requirement.minimumDevotionTier ?? 1;
      const tierMet = (activeCharacter.deityDevotionTier ?? 0) >= minTier;
      checks.push(isFollower && tierMet);
    }

    if (lore.requirement.requiredFactionId) {
      const faction = activeCharacter.factions.find(f => f.factionId === lore.requirement.requiredFactionId);
      const minTier = lore.requirement.minimumFactionTier ?? 1;
      checks.push(!!faction && faction.rankTier >= minTier);
    }

    if (lore.requirement.requiredKAMPHouse) {
      const houseMet = activeCharacter.kampProfile.attended && activeCharacter.kampProfile.houseId === lore.requirement.requiredKAMPHouse;
      checks.push(houseMet);
    }

    if (checks.length === 0) return true;
    return lore.requirement.requiresAll ? checks.every(Boolean) : checks.some(Boolean);
  })();

  // Sound effect trigger upon true player clearance
  useEffect(() => {
    if (clearance.hasAccess && !hasPlayedSound) {
      try {
        playDivineReveal();
      } catch {
        // Safe fallback
      }
      setHasPlayedSound(true);
    }
  }, [clearance.hasAccess, hasPlayedSound]);

  // CLOAKING LOGIC:
  // If the active character does NOT have natural clearance:
  if (!characterHasNaturalAccess) {
    if (visibilityMode === 'cloaked') {
      // If user is DM / Archivist, render the special GM inspection wrapper
      if (!isDM) {
        // Zero DOM footprint for regular unaligned pilgrims
        return null;
      }
    } else if (visibilityMode === 'redacted' && forceHideIfLocked && !isDM) {
      return null;
    }
  }

  const getClassificationBadgeClass = (level: string) => {
    switch (level) {
      case 'TOP_SECRET':
        return 'bg-red-950/80 text-red-400 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
      case 'EYES_ONLY':
        return 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]';
      case 'CLASSIFIED':
        return 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
      case 'RESTRICTED':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'assassination_ledger': return 'Clandestine Assassination Ledger';
      case 'clandestine_conspiracy': return 'Deep Cover Conspiratorial Directive';
      case 'divine_history': return 'Sacred Eschatological History';
      case 'artifact_schematic': return 'Clockwork Planar Cosmometry';
      default: return 'Restricted Dossier';
    }
  };

  // 1. SPECIAL GM INSPECTION WRAPPER FOR CLOAKED CONTENT VIEWED BY DM
  if (!characterHasNaturalAccess && isDM && visibilityMode === 'cloaked') {
    return (
      <div className={`relative rounded-sm overflow-hidden border border-purple-600/70 bg-gradient-to-br from-[#1b0a24]/90 via-[#0e0414]/95 to-[#020205] shadow-[0_0_25px_rgba(168,85,247,0.2)] font-sans ${className}`}>
        <div className="absolute inset-0 crt-overlay pointer-events-none opacity-25" />

        {/* DM Vision Header */}
        <div 
          onClick={() => {
            playKeyClick();
            setIsExpanded(!isExpanded);
          }}
          className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-purple-600/40 bg-purple-950/40 hover:bg-purple-900/30 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-purple-900/40 border border-purple-400 text-purple-300 shrink-0">
              <Eye className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-400 font-bold uppercase tracking-wider">
                  [DM VISION: Cloaked From Unaffiliated Pilgrims]
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getClassificationBadgeClass(lore.classification)}`}>
                  {lore.classification}
                </span>
                <span className="text-xs font-mono uppercase text-purple-300/80">
                  // {getCategoryLabel(lore.loreCategory)}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-purple-200 truncate mt-0.5 font-mono">
                ZERO-KNOWLEDGE CIPHER: {lore.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-purple-300 hidden sm:inline">
              CLOAKED PROTOCOL ACTIVE
            </span>
            <button className="text-purple-300 hover:text-white p-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* DM Unredacted Content */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono bg-purple-950/60 p-2.5 rounded border border-purple-500/40 text-purple-300">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">STATUS: REVEALED VIA ARCHIVIST / DM OVERRIDE</span>
              </div>
              <span className="text-[10px] text-purple-300/70">
                ACTIVE CHARACTER: {activeCharacter?.name || 'No Active Alias'} (UNQUALIFIED)
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#ded7f0] leading-relaxed bg-black/40 p-4 rounded border border-purple-500/20 space-y-3 font-sans">
              {lore.unredactedContent.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-base font-bold text-[#ffcc00] font-mono tracking-wide border-b border-[#ffcc00]/30 pb-1 mt-2">
                      {paragraph.replace('### ', '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                  return (
                    <div key={idx} className="pl-3 border-l-2 border-purple-400 my-1 text-[#ffcc00]/90">
                      {paragraph}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-purple-200/80 bg-purple-950/40 p-2.5 rounded border border-purple-500/30 flex items-start gap-2">
              <EyeOff className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-300 font-semibold">Player Omission Notice: </span>
                Normal players see zero DOM footprint for this block until they declare allegiance to {lore.requirement.requiredDeity || 'the required faction'}.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. UNLOCKED STATE (Character genuinely qualifies OR Redacted Mode with DM override)
  if (clearance.hasAccess) {
    return (
      <div className={`relative rounded-sm overflow-hidden border border-[#39ff14]/60 bg-gradient-to-br from-[#041a0d]/90 via-[#020b06]/95 to-[#020205] shadow-[0_0_20px_rgba(57,255,20,0.15)] font-sans ${className}`}>
        <div className="absolute inset-0 crt-overlay pointer-events-none opacity-25" />

        <div 
          onClick={() => {
            playKeyClick();
            setIsExpanded(!isExpanded);
          }}
          className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#39ff14]/30 bg-black/40 hover:bg-[#39ff14]/10 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] shrink-0">
              <Unlock className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold tracking-wider ${getClassificationBadgeClass(lore.classification)}`}>
                  {lore.classification}
                </span>
                <span className="text-xs font-mono uppercase text-[#ded7f0]/70 tracking-wider">
                  // {getCategoryLabel(lore.loreCategory)}
                </span>
                {isDM && !characterHasNaturalAccess && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-400">
                    DM OVERRIDE ACTIVE
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-[#ffcc00] truncate mt-0.5 font-mono">
                CIPHER ID: {lore.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#39ff14] text-[11px] font-mono flex items-center gap-1 hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5" /> DECRYPTED
            </span>
            <button className="text-[#ffcc00]/70 hover:text-[#ffcc00] p-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-mono bg-black/60 p-2.5 rounded border border-[#39ff14]/40 text-[#39ff14]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">STATUS: CLEARANCE GRANTED // CIPHER DECRYPTED</span>
              </div>
              <span className="text-[10px] text-[#ded7f0]/60">
                ACTIVE AGENT: {activeCharacter?.name || account.displayName}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#ded7f0] leading-relaxed bg-black/30 p-4 rounded border border-[#39ff14]/20 space-y-3 font-sans">
              {lore.unredactedContent.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="text-base font-bold text-[#ffcc00] font-mono tracking-wide border-b border-[#ffcc00]/30 pb-1 mt-2">
                      {paragraph.replace('### ', '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                  return (
                    <div key={idx} className="pl-3 border-l-2 border-[#39ff14]/40 my-1 text-[#ffcc00]/90">
                      {paragraph}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#ded7f0]/70 bg-black/50 p-2.5 rounded border border-[#ffcc00]/20 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ffcc00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#ffcc00] font-semibold">Classification Protocol: </span>
                {lore.classificationReason}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. LOCKED REDACTED STATE (Only shown if visibilityMode === 'redacted')
  return (
    <div className={`relative rounded-sm overflow-hidden border border-red-500/50 bg-gradient-to-br from-[#240c0c]/80 via-[#140606]/90 to-[#020205] shadow-[0_0_20px_rgba(239,68,68,0.15)] font-sans ${className}`}>
      <div className="absolute inset-0 crt-overlay pointer-events-none opacity-25" />

      <div 
        onClick={() => {
          playKeyClick();
          setIsExpanded(!isExpanded);
        }}
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-red-500/30 bg-black/50 hover:bg-red-500/10 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded bg-red-500/20 border border-red-500 text-red-400 shrink-0 animate-pulse">
            <Lock className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold tracking-wider ${getClassificationBadgeClass(lore.classification)}`}>
                {lore.classification}
              </span>
              <span className="text-xs font-mono uppercase text-[#ded7f0]/70 tracking-wider">
                // {getCategoryLabel(lore.loreCategory)}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold tracking-wide text-[#ffcc00] truncate mt-0.5 font-mono">
              CIPHER ID: {lore.id}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-red-400 text-[11px] font-mono flex items-center gap-1 animate-pulse hidden sm:flex">
            <ShieldAlert className="w-3.5 h-3.5" /> LOCKED
          </span>
          <button className="text-[#ffcc00]/70 hover:text-[#ffcc00] p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono bg-red-950/50 p-3 rounded border border-red-500/50 text-red-300 gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-bold">SECURITY LOCKOUT: CLASSIFIED ARCHIVAL ENCRYPTION</span>
            </div>
            <span className="text-[11px] text-red-400/80">
              TERMINAL PROTOCOL 5.5-NYNE
            </span>
          </div>

          <div className="bg-black/60 p-4 rounded border border-red-950 space-y-2 select-none relative overflow-hidden">
            <div className="text-xs sm:text-sm font-mono text-red-400/90 leading-relaxed">
              {lore.redactedSummary}
            </div>
            <div className="space-y-1.5 pt-2 font-mono text-[11px] text-neutral-500">
              <div className="h-4 bg-neutral-900/90 rounded px-2 flex items-center text-neutral-600 tracking-widest overflow-hidden">
                ██████████████████████████████████████████████████████████████
              </div>
              <div className="h-4 bg-neutral-900/90 rounded px-2 flex items-center text-neutral-600 tracking-widest overflow-hidden">
                ████████████ [SECURITY LOCKOUT // LEVEL {lore.classification}] ████████████████
              </div>
              <div className="h-4 bg-neutral-900/90 rounded px-2 flex items-center text-neutral-600 tracking-widest overflow-hidden">
                ██████████████████████████████████████████████████████████████
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-amber-500/30 p-3.5 rounded space-y-2">
            <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>CLEARANCE PREREQUISITES REQUIRED TO DECRYPT:</span>
            </div>
            <ul className="list-disc list-inside text-xs font-mono space-y-1 text-[#ffcc00]/90">
              {clearance.missingRequirements.length > 0 ? (
                clearance.missingRequirements.map((req, i) => (
                  <li key={i} className="text-red-300">
                    {req}
                  </li>
                ))
              ) : (
                <li className="text-amber-300">
                  Designate an active character affiliated with this deity or faction.
                </li>
              )}
            </ul>
            <p className="text-[11px] text-[#ded7f0]/60 italic font-sans pt-1">
              Tip: Switch active characters using the top bar or declare allegiance to unlock divine secrets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
