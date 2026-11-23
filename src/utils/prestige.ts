import { saveToVault, loadFromVault, enqueueVaultSync } from './vault';

export const PRESTIGE_VAULT_KEY = 'konran.vault.prestige';

export type PrestigeEntityCategory = 'church' | 'city';

export interface PrestigeEntityDefinition {
  id: string;
  name: string;
  category: PrestigeEntityCategory;
  deityOrProvince: string;
  color: string;
  sects: Array<{
    name: string;
    minPrestige: number;
    minStanding: number;
    description: string;
  }>;
}

export interface RememberedDeed {
  id: string;
  entityId: string;
  entityName: string;
  delta: number;
  standingAfter: number;
  prestigeAfter: number;
  rumorNote: string;
  timestamp: string;
  rememberedByHighInsightNPCs: boolean;
}

export interface EntityPrestigeRecord {
  entityId: string;
  standing: number; // -100.00 to +100.00 (0.00 baseline)
  prestige: number; // 0, 1, 2, 3, 4+ (or negative if dishonored below -100)
  peakPrestige: number;
  lastUpdated: string;
}

export interface PrestigeLedgerState {
  records: Record<string, EntityPrestigeRecord>;
  rememberedDeeds: RememberedDeed[];
  lastDriftTimestamp: string | null;
}

export interface PrestigeClearanceResult {
  granted: boolean;
  currentPrestige: number;
  currentStanding: number;
  reason?: string;
  unlockedSects: string[];
}

export const PRESTIGE_ENTITIES: PrestigeEntityDefinition[] = [
  // The Nyne Churches
  {
    id: 'church_lyricia',
    name: 'The Radiant Concordat (Lyricia)',
    category: 'church',
    deityOrProvince: 'Lyricia',
    color: '#ea32ca',
    sects: [
      {
        name: 'Institute of Enlightenment Scholars',
        minPrestige: 1,
        minStanding: 25,
        description: 'Junior ledger archivists and technological researchers.',
      },
      {
        name: 'Treasurers of Kelth',
        minPrestige: 2,
        minStanding: 50,
        description: 'Sovereign mint auditors and escrow arbiters.',
      },
      {
        name: 'Sage Pryestesshood',
        minPrestige: 3,
        minStanding: 0,
        description: 'High inner-circle priestesses guarding Lona Uyn & Lyvia vaults.',
      },
    ],
  },
  {
    id: 'church_oray',
    name: 'Temple of the Wyrmheart (Oray)',
    category: 'church',
    deityOrProvince: 'Oray',
    color: '#c0c0c0',
    sects: [
      {
        name: 'Practitioners of Magic',
        minPrestige: 1,
        minStanding: 25,
        description: 'Licensed spellwrights and ley-line wardens.',
      },
      {
        name: 'Dragon Worshippers',
        minPrestige: 2,
        minStanding: 50,
        description: 'Sworn caldera emissaries to the elder wyrms of Yngolcina.',
      },
      {
        name: 'Causalyti & Substantyaliti Inner Conclave',
        minPrestige: 3,
        minStanding: 25,
        description: 'Archmages stabilizing the crumbling arcane void core.',
      },
    ],
  },
  {
    id: 'church_ousava',
    name: 'Sanctuary of the Vital Tide (Ousava)',
    category: 'church',
    deityOrProvince: 'Ousava',
    color: '#9900ff',
    sects: [
      {
        name: 'Servants of the Seas',
        minPrestige: 1,
        minStanding: 20,
        description: 'Tidal navigators and coral city stewards.',
      },
      {
        name: 'The Kabal of Lyfe',
        minPrestige: 3,
        minStanding: 0,
        description: 'High elemental druids of the Tree of Life and Lantyca.',
      },
    ],
  },
  {
    id: 'church_ay',
    name: 'Golden Loom of Destiny (Ay)',
    category: 'church',
    deityOrProvince: 'Ay',
    color: '#ff9900',
    sects: [
      {
        name: 'Foremen of Fate',
        minPrestige: 1,
        minStanding: 25,
        description: 'Keepers of the Fated Lottery and polar gateways.',
      },
      {
        name: 'Agents of the Arrow',
        minPrestige: 3,
        minStanding: 0,
        description: 'Clandestine fate-enforcers executing Ay’s golden threads across Konran.',
      },
    ],
  },
  {
    id: 'church_kayzoku',
    name: 'House of the Spiked Chain (Kayzoku)',
    category: 'church',
    deityOrProvince: 'Kayzoku',
    color: '#8e7cc3',
    sects: [
      {
        name: 'Link of Trickery',
        minPrestige: 1,
        minStanding: 25,
        description: 'High-stakes brokers and loophole advocates.',
      },
      {
        name: 'Link of Balance & Order',
        minPrestige: 3,
        minStanding: 25,
        description: 'Arbiters of the dual plane Kay-Kee during The Passing.',
      },
    ],
  },
  {
    id: 'church_celeste',
    name: 'Chantry of the Resonant Bell (Celeste)',
    category: 'church',
    deityOrProvince: 'Celeste',
    color: '#00cccc',
    sects: [
      {
        name: 'Order of Expression & Hearth',
        minPrestige: 1,
        minStanding: 20,
        description: 'Bards, sculptors, and hearth-defenders of Cadence.',
      },
      {
        name: 'The Stone Enclave High Command',
        minPrestige: 3,
        minStanding: 25,
        description: 'Sororal vanguard officers commanding Konran’s protectorate.',
      },
    ],
  },
  {
    id: 'church_psyon',
    name: 'Veil of Fractured Glass (Psyon)',
    category: 'church',
    deityOrProvince: 'Psyon',
    color: '#e2e8f0',
    sects: [
      {
        name: 'Delusyona & Manya',
        minPrestige: 1,
        minStanding: 25,
        description: 'Initiate dream-benders of the Patchwork Isles.',
      },
      {
        name: 'Lunaci & Dementia Inner Mind',
        minPrestige: 3,
        minStanding: 25,
        description: 'Masters of Duathyer’s monochromatic acid mists.',
      },
    ],
  },
  {
    id: 'church_krayvuk',
    name: 'The Void Foundry (Krayvuk)',
    category: 'church',
    deityOrProvince: 'Krayvuk',
    color: '#00ff66',
    sects: [
      {
        name: 'Cyrcutry System & Necros',
        minPrestige: 1,
        minStanding: 25,
        description: 'Clockwork morticians and temporal calculators.',
      },
      {
        name: 'Vergence (Lords of Time)',
        minPrestige: 3,
        minStanding: 25,
        description: 'Elite temporal engineers aligned with Krayvuk’s Great Mission.',
      },
    ],
  },
  {
    id: 'church_slavyna',
    name: 'The Silent Loom (Slavyna)',
    category: 'church',
    deityOrProvince: 'Slavyna',
    color: '#ff2233',
    sects: [
      {
        name: 'Spyder Systerhood',
        minPrestige: 1,
        minStanding: 25,
        description: 'Covert whisper brokers and velvet blackmailers.',
      },
      {
        name: 'Brotherhood of Blood',
        minPrestige: 3,
        minStanding: 0,
        description: 'Hemalod blood-ritual enforcers and crimson inquisitors.',
      },
      {
        name: 'School of Shadows',
        minPrestige: 4,
        minStanding: 0,
        description: 'Odahs grandmaster assassins and umbral phantom operatives.',
      },
    ],
  },

  // Major Konran Cities
  {
    id: 'city_vantya',
    name: 'Vantya (Imperial Capital)',
    category: 'city',
    deityOrProvince: 'Oray Core Domain',
    color: '#ffd700',
    sects: [
      {
        name: 'Imperial Airship Drydock Clearance',
        minPrestige: 1,
        minStanding: 25,
        description: 'Priority berth access and 10% municipal tariff reduction.',
      },
      {
        name: 'Vantya Sovereign Privy Council',
        minPrestige: 3,
        minStanding: 50,
        description: 'Diplomatic immunity and direct audience with the Arch-Magistrates.',
      },
    ],
  },
  {
    id: 'city_padd_city',
    name: 'Padd City',
    category: 'city',
    deityOrProvince: 'Olyvia (Golden Basin)',
    color: '#fbbf24',
    sects: [
      {
        name: 'Lyricia Courier Escrow Guild',
        minPrestige: 1,
        minStanding: 25,
        description: 'Verified cross-continental item escrow and zero-fee currency exchange.',
      },
      {
        name: 'Golden Basin Mint Directorate',
        minPrestige: 3,
        minStanding: 25,
        description: 'Access to high-security treasury auctions and relic vaults.',
      },
    ],
  },
  {
    id: 'city_crafton_cove',
    name: 'Crafton Cove',
    category: 'city',
    deityOrProvince: 'Kray Providence',
    color: '#38bdf8',
    sects: [
      {
        name: 'Harbormaster Privateer Registry',
        minPrestige: 1,
        minStanding: 25,
        description: 'Discounted ship repairs and coastal salvage rights.',
      },
      {
        name: 'Admiralty of the Magnetic Straits',
        minPrestige: 3,
        minStanding: 25,
        description: 'Command authority over naval escorts and magnetic-ore convoy routes.',
      },
    ],
  },
  {
    id: 'city_creston_cove',
    name: 'Creston Cove',
    category: 'city',
    deityOrProvince: 'Kray Providence',
    color: '#34d399',
    sects: [
      {
        name: 'Creston Clockwork Shipyards',
        minPrestige: 2,
        minStanding: 0,
        description: 'Custom magitech hull plating and chrono-compass calibration.',
      },
    ],
  },
  {
    id: 'city_skreeton_harbor',
    name: 'Skreeton Harbor',
    category: 'city',
    deityOrProvince: 'Kray Providence',
    color: '#2dd4bf',
    sects: [
      {
        name: 'Skree Free-Port Smuggler Accord',
        minPrestige: 2,
        minStanding: 25,
        description: 'Uninspected cargo passage through Kray Providence checkpoints.',
      },
    ],
  },
  {
    id: 'city_crescent_moon_harbor',
    name: 'Crescent Moon Harbor',
    category: 'city',
    deityOrProvince: 'Olyvia',
    color: '#c084fc',
    sects: [
      {
        name: 'Lunar Tide Cartographers',
        minPrestige: 2,
        minStanding: 0,
        description: 'Charts to hidden Olysphere & Ayanath syzygy reefs.',
      },
    ],
  },
  {
    id: 'city_undercrust',
    name: 'The Dark UnderCrust',
    category: 'city',
    deityOrProvince: 'Subterranean Konran',
    color: '#f43f5e',
    sects: [
      {
        name: 'Shifting Passage Safe-Conduct',
        minPrestige: 1,
        minStanding: 50,
        description: 'Wayfinder tokens through the subterranean shadow-glass tunnels.',
      },
      {
        name: 'Velvet Syndicate High Table',
        minPrestige: 3,
        minStanding: 0,
        description: 'Sanctuary inside Slavyna’s hidden subterranean pleasure-palaces.',
      },
    ],
  },
];

// Legacy entity ID aliases so existing components (`church_wyrmheart`, `church_silent_loom`, etc.) map cleanly
const ENTITY_ID_ALIASES: Record<string, string> = {
  church_wyrmheart: 'church_oray',
  church_silent_loom: 'church_slavyna',
  church_chantry_bell: 'church_celeste',
  church_void_foundry: 'church_krayvuk',
  church_radiant_concordat: 'church_lyricia',
  oray: 'church_oray',
  slavyna: 'church_slavyna',
  lyricia: 'church_lyricia',
  ousava: 'church_ousava',
  ay: 'church_ay',
  kayzoku: 'church_kayzoku',
  celeste: 'church_celeste',
  psyon: 'church_psyon',
  krayvuk: 'church_krayvuk',
};

export function resolvePrestigeEntityId(rawId: string): string {
  const trimmed = rawId.trim();
  const lower = trimmed.toLowerCase();
  if (ENTITY_ID_ALIASES[lower]) return ENTITY_ID_ALIASES[lower];
  return trimmed;
}

function roundToQuarter(val: number): number {
  return Math.round(val * 4) / 4;
}

function createInitialLedger(): PrestigeLedgerState {
  const records: Record<string, EntityPrestigeRecord> = {};
  const now = new Date().toISOString();
  for (const ent of PRESTIGE_ENTITIES) {
    records[ent.id] = {
      entityId: ent.id,
      standing: 0.0,
      prestige: 0,
      peakPrestige: 0,
      lastUpdated: now,
    };
  }
  return {
    records,
    rememberedDeeds: [],
    lastDriftTimestamp: null,
  };
}

/**
 * Load the Prestige Ledger from Protected Local User Vault (`konran.vault.prestige`).
 */
export function loadPrestigeLedger(): PrestigeLedgerState {
  const initial = createInitialLedger();
  const saved = loadFromVault<PrestigeLedgerState | null>(PRESTIGE_VAULT_KEY, null);
  if (!saved || !saved.records) return initial;

  return {
    records: {
      ...initial.records,
      ...saved.records,
    },
    rememberedDeeds: Array.isArray(saved.rememberedDeeds) ? saved.rememberedDeeds : [],
    lastDriftTimestamp: saved.lastDriftTimestamp || null,
  };
}

/**
 * Save the Prestige Ledger to Protected Local User Vault (`konran.vault.prestige`).
 */
export function savePrestigeLedger(state: PrestigeLedgerState): void {
  saveToVault(PRESTIGE_VAULT_KEY, state);
}

/**
 * Apply a standing delta (e.g. -0.50, -0.25, +0.25, +0.50 or larger) with rollover at ±100.00.
 * - Rolling over +100.00 advances Prestige tier (+1, +2, +3, +4+) and resets standing to the remainder (0.00 at exact 100.00).
 * - Dropping below -100.00 demotes Prestige tier and wraps standing accordingly.
 */
export function adjustEntityStanding(
  rawEntityId: string,
  delta: number,
  rumorNote?: string
): {
  record: EntityPrestigeRecord;
  deed?: RememberedDeed;
  ledger: PrestigeLedgerState;
} {
  const entityId = resolvePrestigeEntityId(rawEntityId);
  const ledger = loadPrestigeLedger();
  const existing = ledger.records[entityId] || {
    entityId,
    standing: 0.0,
    prestige: 0,
    peakPrestige: 0,
    lastUpdated: new Date().toISOString(),
  };

  let standing = roundToQuarter(existing.standing + delta);
  let prestige = existing.prestige;

  // Rollover above +100.00 into Prestige 1, 2, 3, 4+ (0.00 on the new tier)
  while (standing >= 100.0) {
    standing = roundToQuarter(standing - 100.0);
    prestige += 1;
  }

  // Demotion if dropping below -100.00 (or crossing down when negative)
  while (standing <= -100.0) {
    standing = roundToQuarter(standing + 100.0);
    prestige -= 1;
  }

  const peakPrestige = Math.max(existing.peakPrestige, prestige);
  const now = new Date().toISOString();

  const updatedRecord: EntityPrestigeRecord = {
    entityId,
    standing,
    prestige,
    peakPrestige,
    lastUpdated: now,
  };

  ledger.records[entityId] = updatedRecord;

  let deed: RememberedDeed | undefined;
  if (rumorNote && rumorNote.trim().length > 0) {
    const def = PRESTIGE_ENTITIES.find((e) => e.id === entityId);
    deed = {
      id: `deed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      entityId,
      entityName: def?.name || entityId,
      delta: roundToQuarter(delta),
      standingAfter: standing,
      prestigeAfter: prestige,
      rumorNote: rumorNote.trim(),
      timestamp: now,
      rememberedByHighInsightNPCs: true,
    };
    ledger.rememberedDeeds = [deed, ...ledger.rememberedDeeds].slice(0, 100);
  }

  savePrestigeLedger(ledger);
  enqueueVaultSync('prestige_step', {
    entityId,
    delta,
    standing,
    prestige,
    rumorNote,
  });

  return { record: updatedRecord, deed, ledger };
}

/**
 * Directly set an entity's Prestige tier and standing (-100.00 to +100.00).
 */
export function setEntityPrestigeAndStanding(
  rawEntityId: string,
  prestige: number,
  standing: number
): EntityPrestigeRecord {
  const entityId = resolvePrestigeEntityId(rawEntityId);
  const ledger = loadPrestigeLedger();
  const clampedStanding = roundToQuarter(Math.max(-99.75, Math.min(99.75, standing)));
  const existing = ledger.records[entityId];

  const updated: EntityPrestigeRecord = {
    entityId,
    standing: clampedStanding,
    prestige: Math.trunc(prestige),
    peakPrestige: Math.max(existing?.peakPrestige ?? 0, Math.trunc(prestige)),
    lastUpdated: new Date().toISOString(),
  };

  ledger.records[entityId] = updated;
  savePrestigeLedger(ledger);
  return updated;
}

/**
 * Apply the slow ±0.50 monthly drift toward 0.00 baseline across all churches and major cities.
 * Preserves `rememberedDeeds` so high-Insight / "In The Know" NPCs still remember past deeds.
 */
export function applyMonthlyStandingDrift(stepAmount: number = 0.5): PrestigeLedgerState {
  const ledger = loadPrestigeLedger();
  const now = new Date().toISOString();
  const driftMag = Math.abs(stepAmount) || 0.5;

  for (const key of Object.keys(ledger.records)) {
    const rec = ledger.records[key];
    if (rec.standing > 0) {
      rec.standing = roundToQuarter(Math.max(0, rec.standing - driftMag));
      rec.lastUpdated = now;
    } else if (rec.standing < 0) {
      rec.standing = roundToQuarter(Math.min(0, rec.standing + driftMag));
      rec.lastUpdated = now;
    }
  }

  ledger.lastDriftTimestamp = now;
  savePrestigeLedger(ledger);
  enqueueVaultSync('prestige_monthly_drift', {
    driftMag,
    timestamp: now,
  });
  return ledger;
}

/**
 * Dynamic Revocation Evaluator:
 * Evaluates live against current Prestige & standing. Dropping below a threshold immediately
 * revokes clearance back to "LACK OF CLEARANCE" / cover-layer decoys and revokes sect invitations.
 */
export function evaluatePrestigeClearance(
  rawEntityId: string,
  requiredPrestige: number = 1,
  minStanding: number = 0.0
): PrestigeClearanceResult {
  const entityId = resolvePrestigeEntityId(rawEntityId);
  const ledger = loadPrestigeLedger();
  const rec = ledger.records[entityId] || {
    entityId,
    standing: 0.0,
    prestige: 0,
    peakPrestige: 0,
    lastUpdated: new Date().toISOString(),
  };

  const entityDef = PRESTIGE_ENTITIES.find((e) => e.id === entityId);

  // Compute all currently unlocked internal sects for this entity
  const unlockedSects: string[] = [];
  if (entityDef) {
    for (const sect of entityDef.sects) {
      const meetsSect =
        rec.prestige > sect.minPrestige ||
        (rec.prestige === sect.minPrestige && rec.standing >= sect.minStanding);
      if (meetsSect) {
        unlockedSects.push(sect.name);
      }
    }
  }

  // Also check canonical global high-prestige sect invitations (Prestige 3–4+)
  if (entityId === 'church_slavyna') {
    if (rec.prestige >= 3 && rec.standing >= 0 && !unlockedSects.includes('Brotherhood of Blood')) {
      unlockedSects.push('Brotherhood of Blood');
    }
    if (rec.prestige >= 4 && rec.standing >= 0 && !unlockedSects.includes('School of Shadows')) {
      unlockedSects.push('School of Shadows');
    }
  } else if (entityId === 'church_lyricia') {
    if (rec.prestige >= 3 && rec.standing >= 0 && !unlockedSects.includes('Sage Pryestesshood')) {
      unlockedSects.push('Sage Pryestesshood');
    }
  } else if (entityId === 'church_ay') {
    if (rec.prestige >= 3 && rec.standing >= 0 && !unlockedSects.includes('Agents of the Arrow')) {
      unlockedSects.push('Agents of the Arrow');
    }
  }

  const meetsRequirement =
    rec.prestige > requiredPrestige ||
    (rec.prestige === requiredPrestige && rec.standing >= minStanding);

  if (meetsRequirement) {
    return {
      granted: true,
      currentPrestige: rec.prestige,
      currentStanding: rec.standing,
      reason: `CLEARANCE GRANTED // Prestige ${rec.prestige} (${rec.standing >= 0 ? '+' : ''}${rec.standing.toFixed(2)})`,
      unlockedSects,
    };
  }

  const wasRevoked = rec.peakPrestige >= requiredPrestige;
  return {
    granted: false,
    currentPrestige: rec.prestige,
    currentStanding: rec.standing,
    reason: wasRevoked
      ? `LACK OF CLEARANCE // REVOKED: Standing dropped below Prestige ${requiredPrestige} (${minStanding.toFixed(2)}). Cover-layer decoy active.`
      : `LACK OF CLEARANCE // Requires Prestige ${requiredPrestige} (${minStanding >= 0 ? '+' : ''}${minStanding.toFixed(2)}); current is Prestige ${rec.prestige} (${rec.standing >= 0 ? '+' : ''}${rec.standing.toFixed(2)}).`,
    unlockedSects,
  };
}

/**
 * Format standing and prestige tier for UI badges, e.g. `P2 · +42.50`
 */
export function formatPrestigeStanding(record: EntityPrestigeRecord): string {
  const sign = record.standing >= 0 ? '+' : '';
  return `Prestige ${record.prestige} · ${sign}${record.standing.toFixed(2)}`;
}
