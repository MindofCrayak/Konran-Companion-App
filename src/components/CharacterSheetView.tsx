import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Zap,
  Backpack,
  ScrollText,
  Sparkles,
  Lock,
  Plus,
  Trash2,
  Coins,
  Radio,
  Cpu,
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { InventoryItem, CharacterSheetStats } from '../types';
import { DEITIES } from '../data/deities';
import { playKeyClick, playOptionSelect, playDivineReveal } from '../utils/audio';

const DEFAULT_STATS: CharacterSheetStats = {
  str: 10,
  dex: 14,
  con: 14,
  int: 16,
  wis: 12,
  cha: 13,
  hpCurrent: 38,
  hpMax: 38,
  tempHp: 0,
  ac: 15,
  speed: 30,
  proficiencyBonus: 3,
  initiativeBonus: 2,
  goldGp: 450,
  hitDice: '6d8',
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_slablet_mk4',
    name: 'ObsydianHeart Slablet MK IV',
    category: 'Magitech',
    quantity: 1,
    valueGp: 1200,
    attuned: true,
    description:
      'Dual-OS magitech slate running Konra/Nyne OS (Lyricia & Krayvuk kernel) with ObsydianHeart OH-OS interface and K.A.M.P. Kodex e-ink relay.',
  },
  {
    id: 'inv_stone_decl',
    name: '42mm Stone of Declaration & Church Bezel',
    category: 'Relic',
    quantity: 1,
    valueGp: 500,
    attuned: true,
    description:
      'Sanctified liturgical covenant token that locks True North to your Declared Deity and modulates your OS frequency.',
  },
  {
    id: 'inv_kray_cell',
    name: 'Vertazyum Mana Condenser Cell',
    category: 'Consumable',
    quantity: 3,
    valueGp: 85,
    attuned: false,
    description: 'Restores 1 expended level-1 spell slot or Magitech Boon charge on a Bonus Action.',
  },
];

interface ClergyMessage {
  id: string;
  minTier: number;
  sender: string;
  rankRequired: string;
  subject: string;
  body: string;
}

const CLERGY_COMMISSIONS: Record<string, ClergyMessage[]> = {
  Oray: [
    {
      id: 'oray_msg_1',
      minTier: 1,
      sender: 'Caldera Initiate Registry',
      rankRequired: 'Tier 1+ (Pilgrim)',
      subject: 'Welcome to the Wyrmfire Conduit',
      body: 'Pilgrim: Keep your Stone of Declaration warm near volcanic vents. Your OH-OS telemetry has been tinted to Oray Sunfire Chrysoberyl.',
    },
    {
      id: 'oray_msg_2',
      minTier: 2,
      sender: 'Arch-Magus of the Tower of the Dragon',
      rankRequired: 'Tier 2+ (Adherent / Clergy)',
      subject: 'RESTRICTED: Leyline Surge in Southern Konran',
      body: 'Clergy Notice: Unstable pyromantic fractures detected beneath the Steam Labs. Adherents of Oray are authorized to requisition Grade-II Vertazyum stabilizers.',
    },
    {
      id: 'oray_msg_3',
      minTier: 3,
      sender: 'High Conclave of Yngolcina',
      rankRequired: 'Tier 3+ (High Clergy / Disciple)',
      subject: 'EYES ONLY: The 18 Ashes & Ayan/Ai Surveillance',
      body: 'High Clergy Cipher: Agents of Ayan/Ai have been spotted near the Caldera Core attempting to audit our Earth-Survivor bloodline ledgers. Use your Wyrmfire Resonance boon to purge unauthorized scrying sensors.',
    },
  ],
  Slavyna: [
    {
      id: 'slav_msg_1',
      minTier: 1,
      sender: 'Whisper Network Relay',
      rankRequired: 'Tier 1+ (Pilgrim)',
      subject: 'Your Blood-Silk Cipher is Active',
      body: 'Little Spider: Your Slablet now listens on the crimson sub-band. Never speak the Dark Mother’s true bargains over unencrypted Lyricia lines.',
    },
    {
      id: 'slav_msg_2',
      minTier: 2,
      sender: 'Matron of the Spyder Systerhood',
      rankRequired: 'Tier 2+ (Adherent / Operative)',
      subject: 'RESTRICTED: Vantya Mint Sub-Tunnel Key',
      body: 'Operative: The counter-rotating basalt lock beneath the Vantya Central Mint opens at 24:00 Konran Standard Time. Deliver the leverage dossiers before dawn.',
    },
    {
      id: 'slav_msg_3',
      minTier: 3,
      sender: 'Her Imperial Viciousness — Inner Sanctum',
      rankRequired: 'Tier 3+ (High Clergy / Disciple)',
      subject: 'TOP SECRET: Operation Ayvilo Maintenance',
      body: 'High Priestess Cipher: Ensure Lyricia’s inquisitors never link our Kestox alloy shipments to the Patchwork Isles. High Clergy may requisition Sovereign Venom vials from any Lust Lyne sanctuary.',
    },
  ],
  Lyricia: [
    {
      id: 'lyr_msg_1',
      minTier: 1,
      sender: 'Grand Library of Lyvia',
      rankRequired: 'Tier 1+ (Pilgrim)',
      subject: 'Konra/Nyne OS Kernel Verification',
      body: 'Scholar: As a follower of Lyricia, your Slablet runs direct diagnostic parity with the First Kernel co-engineered with Krayvuk.',
    },
    {
      id: 'lyr_msg_2',
      minTier: 2,
      sender: 'Tresurer Marketplace Audit Bureau',
      rankRequired: 'Tier 2+ (Adherent / Clergy)',
      subject: 'RESTRICTED: Counterfeit Gold Siphon Alert',
      body: 'Clergy Notice: Unaccounted bullion losses detected in Vantya’s lower vaults. Use your Archivist/Tinkerer bonuses to inspect subterranean foundations.',
    },
    {
      id: 'lyr_msg_3',
      minTier: 3,
      sender: 'Order of the Overseer — High Synod',
      rankRequired: 'Tier 3+ (High Clergy / Disciple)',
      subject: 'EYES ONLY: Anomalous Echoes in Krayvuk’s Kernel',
      body: 'High Clergy Cipher: Deep-kernel telemetry shows Krayvuk’s half of the Konra/Nyne OS is diverting 0.0004% of soul-lattice bandwidth toward an unknown Kestox coordinate. Investigate discreetly.',
    },
  ],
};

function getClergyMessagesForDeity(deityId?: string): ClergyMessage[] {
  if (!deityId) return [];
  if (CLERGY_COMMISSIONS[deityId]) return CLERGY_COMMISSIONS[deityId];
  return [
    {
      id: `${deityId}_msg_1`,
      minTier: 1,
      sender: `Holy Synod of ${deityId}`,
      rankRequired: 'Tier 1+ (Pilgrim)',
      subject: `Liturgical OS Attunement: ${deityId}`,
      body: `Your ObsydianHeart Slablet has been attuned to the sacred chromatic frequency of ${deityId}.`,
    },
    {
      id: `${deityId}_msg_2`,
      minTier: 2,
      sender: `Clergy Directorate of ${deityId}`,
      rankRequired: 'Tier 2+ (Adherent / Clergy)',
      subject: `RESTRICTED: Sect Directives & Provincial Standing`,
      body: `Ordained Adherent: You are granted access to restricted temple reliquaries and sectarian supply caches across Konran.`,
    },
    {
      id: `${deityId}_msg_3`,
      minTier: 3,
      sender: `High Templar Conclave of ${deityId}`,
      rankRequired: 'Tier 3+ (High Clergy / Disciple)',
      subject: `EYES ONLY: Sovereign Pantheon Dispatch`,
      body: `High Clergy Clearance Verified: You are authorized to read sealed apostolic dispatches, invoke divine intervention miracles, and command lower-tier initiates of ${deityId}.`,
    },
  ];
}

export const CharacterSheetView: React.FC = () => {
  const { activeCharacter, account, updateCharacter, setPlayerNote } = useCharacter();
  const [activeTab, setActiveTab] = useState<'sheet' | 'inventory' | 'clergy' | 'notes'>('sheet');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Magitech');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemDesc, setNewItemDesc] = useState('');

  if (!activeCharacter) {
    return (
      <div className="p-6 text-center font-mono text-xs text-white/70">
        No active character selected. Use the top bar to select or enroll an adventurer.
      </div>
    );
  }

  const isDM = account.role === 'dungeon_master' || account.role === 'archivist';
  const stats: CharacterSheetStats = activeCharacter.stats || DEFAULT_STATS;
  const inventory: InventoryItem[] = activeCharacter.inventory || DEFAULT_INVENTORY;
  const deityMeta = activeCharacter.declaredDeity ? DEITIES[activeCharacter.declaredDeity] : null;
  const devotionTier = activeCharacter.deityDevotionTier || 0;

  const formatMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleStatChange = (key: keyof CharacterSheetStats, val: number) => {
    updateCharacter(activeCharacter.id, {
      stats: {
        ...stats,
        [key]: val,
      },
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    playDivineReveal();
    const item: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      description: newItemDesc.trim() || 'Recorded via ObsydianHeart OH-OS Quartermaster.',
    };
    updateCharacter(activeCharacter.id, {
      inventory: [...inventory, item],
    });
    setNewItemName('');
    setNewItemDesc('');
    setNewItemQty(1);
  };

  const handleDeleteItem = (id: string) => {
    playKeyClick();
    updateCharacter(activeCharacter.id, {
      inventory: inventory.filter((i) => i.id !== id),
    });
  };

  const clergyMessages = getClergyMessagesForDeity(activeCharacter.declaredDeity);

  return (
    <div className="w-full h-full flex flex-col ohos-crystal-hull text-[#e2e8f0] font-sans select-text overflow-hidden">
      {/* OH-OS CrystalPunk / Goa'uld / Dark Crystal Corporate Header Banner */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#1d082b] via-[#0e151f] to-[#261006] border-b border-amber-400/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/konran/stones/fronts/lens_1_0.png"
            alt="OH-OS Shard"
            className="w-7 h-7 object-contain animate-crystal-shard"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                {activeCharacter.name} // 5.5e Bio-Crystal Operative Matrix
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-600/25 border border-fuchsia-400/60 text-fuchsia-200 font-bold">
                OH-OS v4.2 // CRYSTALPUNK-PRIME
              </span>
            </div>
            <p className="text-[10px] font-mono text-fuchsia-200/70">
              Underlying Kernel: Konra/Nyne OS (Lyricia &amp; Krayvuk) • Slotted Stone:{' '}
              <strong className="data-stream-text">
                {activeCharacter.declaredDeity || 'Undeclared'} (Clergy Tier {devotionTier})
              </strong>
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded border border-white/15 font-mono text-[11px]">
          <button
            onClick={() => {
              playOptionSelect();
              setActiveTab('sheet');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'sheet'
                ? 'bg-[var(--patron-primary,#39ff14)]/20 text-[var(--patron-primary,#39ff14)] border border-[var(--patron-primary,#39ff14)] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>5.5e Sheet</span>
          </button>
          <button
            onClick={() => {
              playOptionSelect();
              setActiveTab('inventory');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'inventory'
                ? 'bg-[var(--patron-primary,#39ff14)]/20 text-[var(--patron-primary,#39ff14)] border border-[var(--patron-primary,#39ff14)] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" />
            <span>Inventory ({inventory.length})</span>
          </button>
          <button
            onClick={() => {
              playOptionSelect();
              setActiveTab('clergy');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'clergy'
                ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00] font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span>Clergy Comms</span>
          </button>
          <button
            onClick={() => {
              playOptionSelect();
              setActiveTab('notes');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'notes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Field Journal</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: 5.5e CHARACTER SHEET */}
        {activeTab === 'sheet' && (
          <div className="space-y-4">
            {/* Top Vitals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
              <div className="p-2.5 bg-black/70 border border-red-500/40 rounded text-center">
                <div className="text-[10px] text-red-300 uppercase flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" /> Hit Points
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="number"
                    value={stats.hpCurrent}
                    onChange={(e) => handleStatChange('hpCurrent', parseInt(e.target.value) || 0)}
                    className="w-12 bg-black border border-white/20 rounded text-center font-bold text-white py-0.5"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={stats.hpMax}
                    onChange={(e) => handleStatChange('hpMax', parseInt(e.target.value) || 1)}
                    className="w-12 bg-black border border-white/20 rounded text-center font-bold text-white/80 py-0.5"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-black/70 border border-cyan-500/40 rounded text-center">
                <div className="text-[10px] text-cyan-300 uppercase">Armor Class</div>
                <input
                  type="number"
                  value={stats.ac}
                  onChange={(e) => handleStatChange('ac', parseInt(e.target.value) || 10)}
                  className="w-14 mt-1 bg-black border border-white/20 rounded text-center font-bold text-lg text-cyan-300 py-0.2"
                />
              </div>

              <div className="p-2.5 bg-black/70 border border-amber-500/40 rounded text-center">
                <div className="text-[10px] text-amber-300 uppercase">Proficiency</div>
                <div className="text-lg font-bold text-amber-300 mt-1">
                  +{stats.proficiencyBonus}
                </div>
              </div>

              <div className="p-2.5 bg-black/70 border border-emerald-500/40 rounded text-center">
                <div className="text-[10px] text-emerald-300 uppercase">Speed</div>
                <div className="text-lg font-bold text-emerald-300 mt-1">{stats.speed} ft</div>
              </div>

              <div className="p-2.5 bg-black/70 border border-[#ffcc00]/40 rounded text-center">
                <div className="text-[10px] text-[#ffcc00] uppercase flex items-center justify-center gap-1">
                  <Coins className="w-3 h-3" /> Treasury (GP)
                </div>
                <input
                  type="number"
                  value={stats.goldGp}
                  onChange={(e) => handleStatChange('goldGp', parseInt(e.target.value) || 0)}
                  className="w-20 mt-1 bg-black border border-[#ffcc00]/40 rounded text-center font-bold text-[#ffcc00] py-0.5"
                />
              </div>
            </div>

            {/* 6 Core Ability Scores */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 font-mono">
              {(
                [
                  ['str', 'STR'],
                  ['dex', 'DEX'],
                  ['con', 'CON'],
                  ['int', 'INT'],
                  ['wis', 'WIS'],
                  ['cha', 'CHA'],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="p-3 bg-black/75 border border-[var(--patron-primary,#39ff14)]/40 rounded text-center space-y-1"
                >
                  <div className="text-[10px] text-white/60 uppercase">{label}</div>
                  <div className="text-xl font-bold data-stream-text">
                    {formatMod(stats[key])}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={stats[key]}
                    onChange={(e) => handleStatChange(key, parseInt(e.target.value) || 10)}
                    className="w-12 bg-black/90 border border-white/20 rounded text-center text-xs text-white py-0.5"
                  />
                </div>
              ))}
            </div>

            {/* Konran Soul Lottery Dice (Fate d4, Fame d6, Favor d12) & Sect Modifiers */}
            <div className="p-3.5 bg-black/70 border border-[#d4af37]/50 rounded space-y-2.5">
              <div className="flex items-center justify-between font-mono text-xs text-[#ffcc00] uppercase font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#39ff14]" />
                  <span>Soul Lottery Resonance &amp; Declared Sect Modifiers</span>
                </span>
                {activeCharacter.lifepath?.sect && (
                  <span className="text-[#39ff14]">{activeCharacter.lifepath.sect}</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                <div className="p-2 bg-purple-950/30 border border-purple-500/50 rounded">
                  <div className="text-[10px] text-purple-300">FATE DIE (d4)</div>
                  <div className="text-base font-bold text-white">
                    {activeCharacter.lifepath?.fateScore ?? 0}
                  </div>
                </div>
                <div className="p-2 bg-amber-950/30 border border-amber-500/50 rounded">
                  <div className="text-[10px] text-amber-300">FAME DIE (d6)</div>
                  <div className="text-base font-bold text-white">
                    {activeCharacter.lifepath?.fameScore ?? 0}
                  </div>
                </div>
                <div className="p-2 bg-emerald-950/30 border border-[#39ff14]/50 rounded">
                  <div className="text-[10px] text-[#39ff14]">FAVOR DIE (d12)</div>
                  <div className="text-base font-bold text-white">
                    {activeCharacter.lifepath?.favorScore ?? activeCharacter.deityDevotionTier * 2}
                  </div>
                </div>
              </div>

              {activeCharacter.lifepath && (
                <div className="text-xs font-mono text-[#ded7f0] bg-black/60 p-2.5 rounded border border-white/10 space-y-1">
                  <div>
                    <strong className="text-[#ffcc00]">Aspect ({activeCharacter.lifepath.aspect}):</strong>{' '}
                    <span className="text-[#39ff14]">{activeCharacter.lifepath.aspectMods}</span>
                  </div>
                  <div>
                    <strong className="text-[#ffcc00]">Invocations:</strong> +1 {activeCharacter.lifepath.secondDeity}, +1 {activeCharacter.lifepath.thirdDeity} •{' '}
                    <span className="text-red-400">Enemy: -1 {activeCharacter.lifepath.divineEnemy}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Active 5.5e Boons (Deity + K.A.M.P. House) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {activeCharacter.deityBoon && (
                <div className="p-3 bg-black/75 border border-[#ffcc00]/50 rounded space-y-1">
                  <div className="text-[#ffcc00] font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#39ff14]" />
                    <span>Deity Boon: {activeCharacter.deityBoon.name}</span>
                  </div>
                  <p className="text-[11px] text-white/90">{activeCharacter.deityBoon.dndMechanic}</p>
                </div>
              )}
              {activeCharacter.kampProfile?.houseBoon && (
                <div className="p-3 bg-black/75 border border-[#8b1e1e] rounded space-y-1">
                  <div className="text-[#ff8a8a] font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>K.A.M.P. Boon: {activeCharacter.kampProfile.houseBoon.name}</span>
                  </div>
                  <p className="text-[11px] text-white/90">
                    {activeCharacter.kampProfile.houseBoon.dndMechanic}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & RELIC VAULT */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddItem}
              className="p-3 bg-black/70 border border-[var(--patron-primary,#39ff14)]/40 rounded space-y-2.5 font-mono text-xs"
            >
              <div className="font-bold text-[var(--patron-primary,#39ff14)] uppercase">
                + Requisition / Log New Equipment or Relic
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Item or Relic Name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="sm:col-span-2 px-2.5 py-1.5 bg-black border border-white/25 rounded text-white"
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as InventoryItem['category'])}
                  className="px-2.5 py-1.5 bg-black border border-white/25 rounded text-white"
                >
                  {['Magitech', 'Relic', 'Weapon', 'Armor', 'Consumable', 'Gear'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 bg-black border border-white/25 rounded text-white text-center"
                  />
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--patron-primary,#39ff14)]/20 hover:bg-[var(--patron-primary,#39ff14)]/30 border border-[var(--patron-primary,#39ff14)] text-[var(--patron-primary,#39ff14)] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Optional properties, charges, or D&D 5.5e mechanics..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black border border-white/20 rounded text-white/90"
              />
            </form>

            <div className="space-y-2">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-black/75 border border-white/15 hover:border-[var(--patron-primary,#39ff14)]/50 rounded flex items-start justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#ffcc00]">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#39ff14]">×{item.quantity}</span>
                      {item.attuned && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-400 text-purple-200">
                          ATTUNED
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-white/40 hover:text-red-400 cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLERGY-GATED COMMUNION & SECRET DISPATCHES */}
        {activeTab === 'clergy' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 bg-black/80 border border-[#ffcc00]/50 rounded flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[#ffcc00] font-bold uppercase flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#39ff14]" />
                  <span>
                    Encrypted Liturgical Sub-Band //{' '}
                    {deityMeta ? `${deityMeta.name} (${deityMeta.title})` : 'Unaligned'}
                  </span>
                </div>
                <p className="text-[11px] text-white/70 font-sans mt-0.5">
                  High-ranking clergy members unlock secret apostolic dispatches, ciphered orders, and sanctum privileges invisible to uninitiated mortals.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#39ff14]/15 border border-[#39ff14] text-[#39ff14] rounded font-bold">
                  Clergy Rank: Tier {devotionTier}
                </span>
                {isDM && (
                  <select
                    value={devotionTier}
                    onChange={(e) =>
                      updateCharacter(activeCharacter.id, {
                        deityDevotionTier: parseInt(e.target.value) || 1,
                      })
                    }
                    className="px-2 py-1 bg-purple-950 border border-purple-400 text-purple-200 rounded text-[11px]"
                    title="DM Override: Adjust Character Clergy Devotion Tier"
                  >
                    <option value={0}>Tier 0 (Undeclared)</option>
                    <option value={1}>Tier 1 (Pilgrim)</option>
                    <option value={2}>Tier 2 (Adherent / Clergy)</option>
                    <option value={3}>Tier 3 (Disciple / High Clergy)</option>
                    <option value={4}>Tier 4 (High Templar)</option>
                    <option value={5}>Tier 5 (Chosen Avatar)</option>
                  </select>
                )}
              </div>
            </div>

            {!activeCharacter.declaredDeity ? (
              <div className="p-6 bg-black/60 border border-white/15 rounded text-center text-white/60">
                You are currently an Undeclared Pilgrim. Declare a Patron Deity via the Pilgrimage Trials or Questionnaire of the Fated to receive Church transmissions.
              </div>
            ) : (
              <div className="space-y-3">
                {clergyMessages.map((msg) => {
                  const unlocked = isDM || devotionTier >= msg.minTier;
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded border ${
                        unlocked
                          ? 'bg-black/80 border-[#39ff14]/60'
                          : 'bg-black/40 border-red-500/40 opacity-75'
                      } space-y-1.5`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-[#ffcc00]">{msg.subject}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            unlocked
                              ? 'bg-[#39ff14]/15 border-[#39ff14] text-[#39ff14]'
                              : 'bg-red-950/60 border-red-500 text-red-300'
                          }`}
                        >
                          {unlocked ? `DECRYPTED // ${msg.rankRequired}` : `LOCKED // REQUIRES ${msg.rankRequired}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50">From: {msg.sender}</div>
                      {unlocked ? (
                        <p className="text-xs text-white/90 font-sans leading-relaxed pt-1">
                          {msg.body}
                        </p>
                      ) : (
                        <div className="p-2.5 bg-red-950/20 border border-red-500/30 rounded text-[11px] text-red-300 flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            [CIPHER REDACTED BY CHURCH OF {(activeCharacter.declaredDeity || 'THE NYNE').toUpperCase()} — ELEVATE CLERGY STANDING TO TIER {msg.minTier} TO READ]
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: UNIFIED CHARACTER NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-3 h-full flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between text-[#ffcc00]">
              <span className="font-bold uppercase">
                Personal Campaign Dossier &amp; Session Ledger ({activeCharacter.name})
              </span>
              <span className="text-[10px] text-[#39ff14]">✓ Synced to Character &amp; Discord Profile</span>
            </div>
            <textarea
              value={activeCharacter.playerNotes?.general || activeCharacter.notes || ''}
              onChange={(e) => setPlayerNote(activeCharacter.id, 'general', e.target.value)}
              placeholder="Record session logs, NPC names, quest objectives, K.A.M.P. assignments, or secret clergy contacts..."
              className="w-full flex-1 min-h-[260px] bg-black/80 border border-[#ffcc00]/40 rounded p-3 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-[#39ff14]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSheetView;
