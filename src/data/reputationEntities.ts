import { ReputationEntity } from '../types';

export interface ReputationTierDefinition {
  tier: number;
  label: string;
  color: string;
  badgeClass: string;
  description: string;
}

export const REPUTATION_TIERS: Record<number, ReputationTierDefinition> = {
  [-3]: {
    tier: -3,
    label: 'Blacklisted',
    color: '#ef4444',
    badgeClass: 'bg-red-950/80 text-red-400 border-red-600',
    description: 'Kill-on-sight order active. Assets frozen, safehouses compromised, bounty hunters dispatched.',
  },
  [-2]: {
    tier: -2,
    label: 'Hostile',
    color: '#f97316',
    badgeClass: 'bg-orange-950/80 text-orange-400 border-orange-600',
    description: 'Active sanctions. Envoys refuse audience, tariffs quadrupled, guards shadow your movements.',
  },
  [-1]: {
    tier: -1,
    label: 'Distrusted',
    color: '#eab308',
    badgeClass: 'bg-yellow-950/80 text-yellow-400 border-yellow-600',
    description: 'Viewed with suspicion. Denied entry to inner compounds; transactions strictly monitored.',
  },
  [0]: {
    tier: 0,
    label: 'Neutral',
    color: '#9ca3af',
    badgeClass: 'bg-neutral-900/80 text-neutral-400 border-neutral-600',
    description: 'Standard pilgrim status. No special favor, normal marketplace access.',
  },
  [1]: {
    tier: 1,
    label: 'Recognized',
    color: '#38bdf8',
    badgeClass: 'bg-sky-950/80 text-sky-400 border-sky-500',
    description: 'Favorable reputation. Entry to lower archives, standard diplomatic lodging, 10% market discount.',
  },
  [2]: {
    tier: 2,
    label: 'Honored',
    color: '#a855f7',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500',
    description: 'Trusted ally. Audience with high priests and governors, safehouse access, emergency reinforcements.',
  },
  [3]: {
    tier: 3,
    label: 'Revered',
    color: '#39ff14',
    badgeClass: 'bg-emerald-950/80 text-[#39ff14] border-[#39ff14]',
    description: 'Living Planar Champion. Commands local detachments, granted sovereign immunity, classified codex access.',
  },
};

export const REPUTATION_ENTITIES: ReputationEntity[] = [
  // Providences
  {
    id: 'prov_caldera',
    name: 'Grand Duchy of Caldera',
    category: 'providence',
    description: 'The volcanic industrial heartland of Konran, where magma-forges power the continent’s airships and arcane artillery.',
    currentTier: 0,
    perk: 'Tier +1: Caldera Forge discount. Tier +2: Airship drydock landing priority. Tier +3: Imperial Fire-Writ immunity.',
  },
  {
    id: 'prov_synthelavor',
    name: 'Synthelavor Undercrust',
    category: 'providence',
    description: 'The shifting subterranean realm beneath the continental plate, illuminated by bioluminescent fungi and shadow-glass.',
    currentTier: 0,
    perk: 'Tier +1: Undercrust guide safe-passage. Tier +2: Black-market poison/alchemy dispensary. Tier +3: Sovereign shadow sanctuary.',
  },
  {
    id: 'prov_ousava_spires',
    name: 'Sunken Spires of Ousava',
    category: 'providence',
    description: 'Submerged crystalline libraries and oceanic trench vaults maintained by the fathombound scholars of Ousava.',
    currentTier: 0,
    perk: 'Tier +1: Water-breathing magitech glyphs. Tier +2: Deep Archive scroll retrieval. Tier +3: Leviathan beacon summon.',
  },
  {
    id: 'prov_aethelgard',
    name: 'Aethelgard High Steppes',
    category: 'providence',
    description: 'The windswept mesa plateau and floating skydocks celebrated by avian nomads, druids of Ay, and bards of Lyricia.',
    currentTier: 0,
    perk: 'Tier +1: Gryphon and sky-skiff rental. Tier +2: Wind-weaver storm protection. Tier +3: High Chieftain celestial banner.',
  },

  // Churches
  {
    id: 'church_wyrmheart',
    name: 'Temple of the Wyrmheart (Oray)',
    category: 'church',
    description: 'The fiery draconic cathedral atop Mount Vhaer, venerating Oray’s golden sovereignty and primal flame.',
    currentTier: 0,
    perk: 'Tier +1: Free spell component consecration. Tier +2: Draconic language communion. Tier +3: Wyrmfire blessing (+1 to all spell save DCs for 24h).',
  },
  {
    id: 'church_silent_loom',
    name: 'The Silent Loom (Slavyna)',
    category: 'church',
    description: 'A secretive enclave weaving the threads of mortal secrets, political blackmail, and umbral covenants.',
    currentTier: 0,
    perk: 'Tier +1: Whisper network rumors. Tier +2: Forged identity documentation. Tier +3: Planar assassination contract protection.',
  },
  {
    id: 'church_chantry_bell',
    name: 'Chantry of the Resonant Bell (Celeste)',
    category: 'church',
    description: 'Harmonic sanctuary high in the crystalline towers, preserving musical leylines and celestial balance.',
    currentTier: 0,
    perk: 'Tier +1: Harmonic tonic (advantage on initiative once/day). Tier +2: Cleansing chime (removes any curse). Tier +3: Resonant aegis.',
  },
  {
    id: 'church_void_foundry',
    name: 'The Void Foundry (Krayvuk)',
    category: 'church',
    description: 'A grim basalt monolith housing the chronometers of finality, entropy, and temporal balance.',
    currentTier: 0,
    perk: 'Tier +1: Death ward talisman. Tier +2: Entropy dissipation field. Tier +3: Chrono-rewind feather (reroll one lethal strike).',
  },
  {
    id: 'church_radiant_concordat',
    name: 'The Radiant Concordat (Lyricia)',
    category: 'church',
    description: 'The sunlit halls of artistic creation, solar renewal, and sovereign truth in Central Konran.',
    currentTier: 0,
    perk: 'Tier +1: Luminescent blessing. Tier +2: High-society performance patronage. Tier +3: Solar flare radiant mantle.',
  },

  // Syndicates
  {
    id: 'synd_spyder',
    name: 'The Spyder Systerhood',
    category: 'syndicate',
    description: 'An elite clandestine syndicate of information brokers, poisoners, and shadow operatives operating in all major capitals.',
    currentTier: 0,
    perk: 'Tier +1: Coded pigeon network. Tier +2: Safehouse skeleton key. Tier +3: Untraceable assassination squad intervention.',
  },
  {
    id: 'synd_brass_cartel',
    name: 'The Brass Cartel',
    category: 'syndicate',
    description: 'Free-booting privateers, airship smugglers, and black-market arms merchants aligned with Kayzoku’s chaotic seas.',
    currentTier: 0,
    perk: 'Tier +1: Contraband smuggling clearance. Tier +2: Black-market firearms & munitions. Tier +3: Privateer frigate escort.',
  },
  {
    id: 'synd_cogsmith',
    name: 'The Cogsmith Conclave',
    category: 'syndicate',
    description: 'Renegade cyber-artificers and rogue automatons pushing the forbidden edges of Psyon’s cerebral machine-weaves.',
    currentTier: 0,
    perk: 'Tier +1: Clockwork repair kits. Tier +2: Overclocked magitech cyber-implants. Tier +3: Sentient automaton construct bodyguard.',
  },

  // Law Enforcement
  {
    id: 'law_justiciars',
    name: 'Konran High Justiciars',
    category: 'law_enforcement',
    description: 'The sworn magistrate-knights patrolling city thoroughfares, empowered to enforce celestial decrees and arrest blasphemers.',
    currentTier: 0,
    perk: 'Tier +1: Bypass mundane checkpoint inspections. Tier +2: Deputy warrant authority. Tier +3: Imperial Justiciar badge.',
  },
  {
    id: 'law_chronometer_wardens',
    name: 'Temporal Inquisitors',
    category: 'law_enforcement',
    description: 'Elite investigators tasked with hunting chronomantic fugitives, anomalous time-travel artifacts, and causality rifts.',
    currentTier: 0,
    perk: 'Tier +1: Detect temporal anomalies. Tier +2: Paradox containment sphere. Tier +3: Timeline anchor privilege.',
  },
];
