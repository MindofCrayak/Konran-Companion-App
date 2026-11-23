export interface CyberdeckRigSchemaItem {
  id: string;
  name: string;
  faction: string;
  tier: number;
  ramBuffer: number;
  jackInSpikeTier: number;
  signalSkimmerTier: number;
  dudPruningCount: number;
  traceSlowdownPct: number;
  description: string;
}

export interface RigsSchema {
  schemaVersion: string;
  rigs: CyberdeckRigSchemaItem[];
}

export interface CyberwareSchemaItem {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  timerBonusSeconds: number;
  retryBonus: number;
  frequencyDriftMultiplier: number;
  passivePerceptionBonus: number;
  ramBonus?: number;
  description: string;
}

export interface CyberwareSchema {
  schemaVersion: string;
  cyberware: CyberwareSchemaItem[];
}

export interface LinguisticScriptSchemaItem {
  id: string;
  name: string;
  dc: number;
  requiredLanguage: string;
  glyphFontClass?: string;
  sampleLockedText: string;
  sampleDecodedText: string;
  hiddenLayerHint: string;
}

export interface LinguisticsSchema {
  schemaVersion: string;
  scripts: LinguisticScriptSchemaItem[];
}

export interface MinigameLaunchModuleSchema {
  id: string;
  index: number;
  name: string;
  inspiration: string;
  baseTimerSeconds: number;
  baseGridSize: number;
  baseRetries: number;
  supportsFamiliarityBypass: boolean;
  description: string;
}

export interface MinigameFutureModuleSchema {
  id: string;
  index: number;
  phase: 2 | 3;
  name: string;
  status: string;
}

export interface MinigamesSchema {
  schemaVersion: string;
  launchModules: MinigameLaunchModuleSchema[];
  futureModules: MinigameFutureModuleSchema[];
}

const memoryCache = new Map<string, unknown>();

function getSchemaUrl(name: string): string {
  const cdnBase = (import.meta.env?.VITE_SCHEMA_CDN_BASE as string | undefined)?.replace(/\/$/, '');
  if (cdnBase) {
    return `${cdnBase}/${name}.schema.json`;
  }
  return `/schemas/${name}.schema.json`;
}

async function fetchSchema<T>(name: string, fallback: T): Promise<T> {
  if (memoryCache.has(name)) {
    return memoryCache.get(name) as T;
  }
  try {
    const res = await fetch(getSchemaUrl(name));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    memoryCache.set(name, data);
    return data;
  } catch {
    memoryCache.set(name, fallback);
    return fallback;
  }
}

export async function loadRigSchema(): Promise<RigsSchema> {
  return fetchSchema<RigsSchema>('rigs', {
    schemaVersion: '1.0.0',
    rigs: [
      {
        id: 'deck_novice_slate',
        name: 'Novice Slate Mk-I',
        faction: 'Drifters',
        tier: 1,
        ramBuffer: 4,
        jackInSpikeTier: 1,
        signalSkimmerTier: 1,
        dudPruningCount: 0,
        traceSlowdownPct: 0,
        description: 'Salvaged civilian datapad retrofitted with an exposed copper jack-in spike.',
      },
      {
        id: 'deck_oray_mk4',
        name: 'Oray Tactical Slablet Mk-IV',
        faction: 'Oray',
        tier: 2,
        ramBuffer: 6,
        jackInSpikeTier: 2,
        signalSkimmerTier: 2,
        dudPruningCount: 1,
        traceSlowdownPct: 15,
        description: 'Military-grade Oray field deck with hardened daemon buffers.',
      },
      {
        id: 'deck_slavyna_whisper',
        name: 'Slavyna Whisper-Weave Deck',
        faction: 'Slavyna',
        tier: 3,
        ramBuffer: 8,
        jackInSpikeTier: 3,
        signalSkimmerTier: 3,
        dudPruningCount: 2,
        traceSlowdownPct: 30,
        description: 'Bio-luminescent resonant deck engineered to mask intrusion ripples.',
      },
      {
        id: 'deck_krayvuk_void',
        name: 'Krayvuk Void-Engine Prime',
        faction: 'Krayvuk',
        tier: 4,
        ramBuffer: 10,
        jackInSpikeTier: 4,
        signalSkimmerTier: 4,
        dudPruningCount: 3,
        traceSlowdownPct: 45,
        description: 'Black-ice obsidian mainframe shard capable of deep-layer daemon injection.',
      },
    ],
  });
}

export async function loadCyberwareSchema(): Promise<CyberwareSchema> {
  return fetchSchema<CyberwareSchema>('cyberware', {
    schemaVersion: '1.0.0',
    cyberware: [
      {
        id: 'ware_neural_co_processor',
        name: 'Neural Co-Processor Mk.II',
        slot: 'neural',
        rarity: 'Uncommon',
        timerBonusSeconds: 4,
        retryBonus: 1,
        frequencyDriftMultiplier: 0.9,
        passivePerceptionBonus: 1,
        ramBonus: 1,
        description: 'Offloads hexadecimal matrix arithmetic to a secondary sub-cranial silicon bridge.',
      },
      {
        id: 'ware_ocular_glyph_scanner',
        name: 'Ocular Glyph Scanner',
        slot: 'ocular',
        rarity: 'Rare',
        timerBonusSeconds: 2,
        retryBonus: 0,
        frequencyDriftMultiplier: 0.85,
        passivePerceptionBonus: 3,
        ramBonus: 0,
        description: 'Highlights micro-fractures, steganographic script layers, and packet parity anomalies.',
      },
      {
        id: 'ware_reflex_synapse_boost',
        name: 'Reflex Synapse Accelerator',
        slot: 'nervous',
        rarity: 'Rare',
        timerBonusSeconds: 6,
        retryBonus: 0,
        frequencyDriftMultiplier: 0.8,
        passivePerceptionBonus: 0,
        ramBonus: 0,
        description: 'Superconducts motor-cortex pathways for high-speed conduit routing.',
      },
      {
        id: 'ware_harmonic_ear_dampener',
        name: 'Harmonic Cochlear Stabilizer',
        slot: 'auditory',
        rarity: 'Uncommon',
        timerBonusSeconds: 2,
        retryBonus: 1,
        frequencyDriftMultiplier: 0.65,
        passivePerceptionBonus: 2,
        ramBonus: 0,
        description: 'Locks carrier waves and dampens oscillator phase drift.',
      },
      {
        id: 'ware_ice_breaker_coproc',
        name: 'Black-ICE Breaker Co-Proc',
        slot: 'neural',
        rarity: 'Very Rare',
        timerBonusSeconds: 3,
        retryBonus: 2,
        frequencyDriftMultiplier: 0.9,
        passivePerceptionBonus: 1,
        ramBonus: 2,
        description: 'Expands volatile daemon buffer capacity.',
      },
      {
        id: 'ware_biometric_spoof_skin',
        name: 'Chameleon Biometric Sub-Derm',
        slot: 'dermal',
        rarity: 'Uncommon',
        timerBonusSeconds: 3,
        retryBonus: 1,
        frequencyDriftMultiplier: 0.95,
        passivePerceptionBonus: 1,
        ramBonus: 0,
        description: 'Emits synthetic handshake signatures.',
      },
    ],
  });
}

export async function loadLinguisticsSchema(): Promise<LinguisticsSchema> {
  return fetchSchema<LinguisticsSchema>('linguistics', {
    schemaVersion: '1.0.0',
    scripts: [],
  });
}

export async function loadMinigamesSchema(): Promise<MinigamesSchema> {
  return fetchSchema<MinigamesSchema>('minigames', {
    schemaVersion: '1.0.0',
    launchModules: [],
    futureModules: [],
  });
}
