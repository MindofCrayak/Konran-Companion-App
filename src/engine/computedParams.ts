import { CharacterProfile } from '../types';

export interface ComputedMinigameParams {
  timerSeconds: number;
  gridSize: number;
  retryAllowance: number;
  frequencyDriftSpeed: number;
  dudRemovalCount: number;
  ramBufferSize: number;
  traceSpeedMultiplier: number;
  passivePerception: number;
  intMod: number;
  dexMod: number;
  wisMod: number;
}

export interface ComputeCharacterInput {
  stats?: {
    int?: number;
    dex?: number;
    wis?: number;
    proficiencyBonus?: number;
  };
  level?: number;
}

const WARE_CATALOG: Record<
  string,
  {
    timerBonusSeconds: number;
    retryBonus: number;
    frequencyDriftMultiplier: number;
    passivePerceptionBonus: number;
    ramBonus: number;
  }
> = {
  ware_neural_co_processor: {
    timerBonusSeconds: 4,
    retryBonus: 1,
    frequencyDriftMultiplier: 0.9,
    passivePerceptionBonus: 1,
    ramBonus: 1,
  },
  ware_ocular_glyph_scanner: {
    timerBonusSeconds: 2,
    retryBonus: 0,
    frequencyDriftMultiplier: 0.85,
    passivePerceptionBonus: 3,
    ramBonus: 0,
  },
  ware_reflex_synapse_boost: {
    timerBonusSeconds: 6,
    retryBonus: 0,
    frequencyDriftMultiplier: 0.8,
    passivePerceptionBonus: 0,
    ramBonus: 0,
  },
  ware_harmonic_ear_dampener: {
    timerBonusSeconds: 2,
    retryBonus: 1,
    frequencyDriftMultiplier: 0.65,
    passivePerceptionBonus: 2,
    ramBonus: 0,
  },
  ware_ice_breaker_coproc: {
    timerBonusSeconds: 3,
    retryBonus: 2,
    frequencyDriftMultiplier: 0.9,
    passivePerceptionBonus: 1,
    ramBonus: 2,
  },
  ware_biometric_spoof_skin: {
    timerBonusSeconds: 3,
    retryBonus: 1,
    frequencyDriftMultiplier: 0.95,
    passivePerceptionBonus: 1,
    ramBonus: 0,
  },
};

export function abilityMod(score = 10): number {
  return Math.floor((score - 10) / 2);
}

export function computeMinigameParams(
  character?: CharacterProfile | ComputeCharacterInput | null,
  rigTier = 2,
  installedWareIds: string[] = []
): ComputedMinigameParams {
  const clampedTier = Math.max(1, Math.min(4, Math.round(rigTier)));

  const intScore = character?.stats?.int ?? 14;
  const dexScore = character?.stats?.dex ?? 14;
  const wisScore = character?.stats?.wis ?? 12;
  const profBonus = character?.stats?.proficiencyBonus ?? 2;

  const intMod = abilityMod(intScore);
  const dexMod = abilityMod(dexScore);
  const wisMod = abilityMod(wisScore);

  let wareTimerBonus = 0;
  let wareRetries = 0;
  let wareDriftMultiplier = 1.0;
  let warePerceptionBonus = 0;
  let wareRamBonus = 0;

  for (const id of installedWareIds) {
    const w = WARE_CATALOG[id];
    if (w) {
      wareTimerBonus += w.timerBonusSeconds;
      wareRetries += w.retryBonus;
      wareDriftMultiplier *= w.frequencyDriftMultiplier;
      warePerceptionBonus += w.passivePerceptionBonus;
      wareRamBonus += w.ramBonus;
    }
  }

  const baseRamByTier: Record<number, number> = { 1: 4, 2: 6, 3: 8, 4: 10 };
  const baseDudByTier: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 };
  const baseTraceSlowdownByTier: Record<number, number> = { 1: 0, 2: 0.15, 3: 0.3, 4: 0.45 };

  const timerSeconds = Math.max(
    15,
    24 + clampedTier * 3 + Math.max(0, intMod * 2) + Math.max(0, dexMod) + wareTimerBonus
  );

  const gridSize = Math.max(4, Math.min(7, 3 + clampedTier));

  const retryAllowance = Math.max(1, 1 + Math.floor(clampedTier / 2) + Math.max(0, Math.floor(intMod / 2)) + wareRetries);

  const skimmerFactor = 1 - (clampedTier - 1) * 0.12;
  const wisFactor = Math.max(0.65, 1 - Math.max(0, wisMod) * 0.06);
  const frequencyDriftSpeed = Number(
    Math.max(0.25, 1.2 * skimmerFactor * wisFactor * wareDriftMultiplier).toFixed(2)
  );

  const dudRemovalCount = baseDudByTier[clampedTier] + (intMod >= 3 ? 1 : 0);

  const ramBufferSize = Math.min(
    14,
    (baseRamByTier[clampedTier] ?? 6) + Math.max(0, Math.floor(intMod / 2)) + wareRamBonus
  );

  const traceSpeedMultiplier = Number(
    Math.max(0.35, 1 - (baseTraceSlowdownByTier[clampedTier] ?? 0) - Math.max(0, intMod) * 0.04).toFixed(2)
  );

  const passivePerception = 10 + wisMod + profBonus + warePerceptionBonus;

  return {
    timerSeconds,
    gridSize,
    retryAllowance,
    frequencyDriftSpeed,
    dudRemovalCount,
    ramBufferSize,
    traceSpeedMultiplier,
    passivePerception,
    intMod,
    dexMod,
    wisMod,
  };
}
