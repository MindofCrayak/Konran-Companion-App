import { computeStateHash } from './indexedDbVault';

export interface CharacterSyncSnapshot {
  characterId: string;
  characterName: string;
  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  inventoryHash: string;
  inventoryItems?: string[];
  statusFlags: string[];
  stateHash: string;
  lastModifiedIso: string;
  source?: 'local_idb' | 'cloud_sheet';
}

export interface SplitBrainFieldDiff {
  field: 'hpCurrent' | 'hpMax' | 'tempHp' | 'inventoryHash' | 'statusFlags';
  label: string;
  localValue: string | number | string[];
  remoteValue: string | number | string[];
}

export interface SplitBrainConflictReport {
  hasConflict: boolean;
  characterId: string;
  characterName: string;
  local: CharacterSyncSnapshot;
  remote: CharacterSyncSnapshot;
  diffs: SplitBrainFieldDiff[];
  detectedAtIso: string;
}

export type MergeResolutionStrategy = 'Keep Local' | 'Accept Cloud' | 'Merge Both';

export interface MergeResolutionPayload {
  characterId: string;
  characterName: string;
  strategy: MergeResolutionStrategy;
  resolvedSnapshot: CharacterSyncSnapshot;
  localSnapshot: CharacterSyncSnapshot;
  remoteSnapshot: CharacterSyncSnapshot;
  submittedAtIso: string;
}

export function detectSplitBrainConflict(
  local: CharacterSyncSnapshot,
  remote: CharacterSyncSnapshot
): SplitBrainConflictReport {
  const diffs: SplitBrainFieldDiff[] = [];

  if (local.hpCurrent !== remote.hpCurrent) {
    diffs.push({
      field: 'hpCurrent',
      label: 'Current HP',
      localValue: local.hpCurrent,
      remoteValue: remote.hpCurrent,
    });
  }

  if (local.hpMax !== remote.hpMax) {
    diffs.push({
      field: 'hpMax',
      label: 'Max HP',
      localValue: local.hpMax,
      remoteValue: remote.hpMax,
    });
  }

  if (local.tempHp !== remote.tempHp) {
    diffs.push({
      field: 'tempHp',
      label: 'Temp HP',
      localValue: local.tempHp,
      remoteValue: remote.tempHp,
    });
  }

  if (local.inventoryHash !== remote.inventoryHash) {
    diffs.push({
      field: 'inventoryHash',
      label: 'Inventory Manifest Hash',
      localValue: local.inventoryItems?.join(', ') || local.inventoryHash,
      remoteValue: remote.inventoryItems?.join(', ') || remote.inventoryHash,
    });
  }

  const localFlags = [...local.statusFlags].sort().join('|');
  const remoteFlags = [...remote.statusFlags].sort().join('|');
  if (localFlags !== remoteFlags) {
    diffs.push({
      field: 'statusFlags',
      label: 'Active Status Flags',
      localValue: local.statusFlags,
      remoteValue: remote.statusFlags,
    });
  }

  return {
    hasConflict: local.stateHash !== remote.stateHash && diffs.length > 0,
    characterId: local.characterId,
    characterName: local.characterName,
    local,
    remote,
    diffs,
    detectedAtIso: new Date().toISOString(),
  };
}

export function buildMergedSnapshot(
  local: CharacterSyncSnapshot,
  remote: CharacterSyncSnapshot,
  strategy: MergeResolutionStrategy
): CharacterSyncSnapshot {
  if (strategy === 'Keep Local') {
    return {
      ...local,
      lastModifiedIso: new Date().toISOString(),
    };
  }

  if (strategy === 'Accept Cloud') {
    return {
      ...remote,
      lastModifiedIso: new Date().toISOString(),
    };
  }

  const mergedItems = Array.from(
    new Set([...(local.inventoryItems ?? []), ...(remote.inventoryItems ?? [])])
  );
  const mergedFlags = Array.from(new Set([...local.statusFlags, ...remote.statusFlags]));
  const base = {
    characterId: local.characterId,
    characterName: local.characterName,
    hpCurrent: Math.min(local.hpCurrent, remote.hpCurrent),
    hpMax: Math.max(local.hpMax, remote.hpMax),
    tempHp: Math.max(local.tempHp, remote.tempHp),
    inventoryItems: mergedItems,
    inventoryHash: computeStateHash(mergedItems),
    statusFlags: mergedFlags,
  };

  return {
    ...base,
    stateHash: computeStateHash(base),
    lastModifiedIso: new Date().toISOString(),
    source: 'local_idb',
  };
}

export async function submitMergeResolution(
  payload: MergeResolutionPayload
): Promise<{ ok: boolean; queued: boolean }> {
  let ok = false;

  try {
    const sheetRes = await fetch('/api/sync/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetTab: 'Merge_Queue',
        action: 'enqueue_merge_resolution',
        payload,
      }),
    });
    if (sheetRes.ok) ok = true;
  } catch {
    // offline fallback
  }

  try {
    const webhookRes = await fetch('/api/sync/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'discord',
        event: 'merge_request',
        targetTab: 'Merge_Queue',
        payload,
      }),
    });
    if (webhookRes.ok) ok = true;
  } catch {
    // offline fallback
  }

  return { ok: true, queued: ok };
}
