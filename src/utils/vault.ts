import { useState, useEffect, useCallback } from 'react';

export const VAULT_PREFIX = 'konran.vault.';
export const CACHE_PREFIX = 'konran.cache.';
export const SYNC_QUEUE_KEY = 'konran.vault.syncQueue';

// Legacy/existing protected character keys that must never be wiped by media cache clears
const PROTECTED_LEGACY_KEYS = [
  'konra_player_account_v1',
  'konra_character_roster_v1',
  'konran_wheel_prefs_v1',
  'konran_custom_portals_v1',
];

export interface VaultSyncQueueItem {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  attempts: number;
}

export interface VaultStats {
  vaultKeyCount: number;
  vaultBytes: number;
  cacheKeyCount: number;
  cacheBytes: number;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  isOnline: boolean;
}

const VAULT_CHANGE_EVENT = 'konran:vault-change';
const LAST_SYNC_KEY = 'konran.vault.lastSyncedAt';

function dispatchVaultChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VAULT_CHANGE_EVENT));
  }
}

function normalizeVaultKey(key: string): string {
  return key.startsWith(VAULT_PREFIX) ? key : `${VAULT_PREFIX}${key}`;
}

/**
 * Save a value to the Protected Local User Vault (`konran.vault.*`).
 * Never wiped by lore/media cache clears.
 */
export function saveToVault<T>(key: string, val: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const fullKey = normalizeVaultKey(key);
    window.localStorage.setItem(fullKey, JSON.stringify(val));
    dispatchVaultChange();
    return true;
  } catch (err) {
    console.warn('[Konran Vault] Failed to save key:', key, err);
    return false;
  }
}

/**
 * Load a value from the Protected Local User Vault (`konran.vault.*`).
 */
export function loadFromVault<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const fullKey = normalizeVaultKey(key);
    const raw = window.localStorage.getItem(fullKey);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Remove a specific key from the Protected Local User Vault.
 */
export function removeFromVault(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const fullKey = normalizeVaultKey(key);
    window.localStorage.removeItem(fullKey);
    dispatchVaultChange();
  } catch {
    // Ignore storage error
  }
}

/**
 * Retrieve the current offline sync queue persisted in `konran.vault.syncQueue`.
 */
export function getVaultSyncQueue(): VaultSyncQueueItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVaultSyncQueue(queue: VaultSyncQueueItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    dispatchVaultChange();
  } catch {
    // Ignore quota errors
  }
}

/**
 * Enqueue a dirty-flag mutation into `konran.vault.syncQueue`.
 * Auto-flushes immediately if `navigator.onLine` is true.
 */
export function enqueueVaultSync(type: string, payload: unknown): VaultSyncQueueItem {
  const queue = getVaultSyncQueue();
  const item: VaultSyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    attempts: 0,
  };
  queue.push(item);
  saveVaultSyncQueue(queue);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    void flushVaultSyncQueue();
  }

  return item;
}

let isFlushing = false;

/**
 * Flush pending offline mutations by POSTing to `/api/sync/sheet`.
 */
export async function flushVaultSyncQueue(): Promise<{
  flushed: number;
  remaining: number;
  success: boolean;
  error?: string;
}> {
  const queue = getVaultSyncQueue();
  if (queue.length === 0) {
    return { flushed: 0, remaining: 0, success: true };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      flushed: 0,
      remaining: queue.length,
      success: false,
      error: 'Device is offline; mutations queued in local vault.',
    };
  }

  if (isFlushing) {
    return { flushed: 0, remaining: queue.length, success: true };
  }

  isFlushing = true;
  let flushedCount = 0;
  const remaining: VaultSyncQueueItem[] = [];
  let lastError: string | undefined;

  try {
    const res = await fetch('/api/sync/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'konran_protected_vault',
        batch: queue,
        timestamp: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      flushedCount = queue.length;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      }
      saveVaultSyncQueue([]);
    } else {
      lastError = `Ledger webhook returned HTTP ${res.status}`;
      for (const item of queue) {
        remaining.push({ ...item, attempts: item.attempts + 1 });
      }
      saveVaultSyncQueue(remaining);
    }
  } catch (err: any) {
    lastError = err?.message || 'Network unreachable while syncing vault';
    for (const item of queue) {
      remaining.push({ ...item, attempts: item.attempts + 1 });
    }
    saveVaultSyncQueue(remaining);
  } finally {
    isFlushing = false;
    dispatchVaultChange();
  }

  return {
    flushed: flushedCount,
    remaining: remaining.length,
    success: remaining.length === 0,
    error: lastError,
  };
}

/**
 * Clears cached lore, map assets, and planet textures from Cache Storage and `konran.cache.*`
 * while strictly preserving `konran.vault.*` and all character sheet keys in `localStorage`.
 */
export async function clearLoreAndMediaCache(): Promise<{
  clearedLocalStorageKeys: number;
  clearedCacheBuckets: number;
}> {
  let clearedLocalStorageKeys = 0;
  let clearedCacheBuckets = 0;

  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;

      // Never touch Protected Vault or Character keys
      if (k.startsWith(VAULT_PREFIX) || PROTECTED_LEGACY_KEYS.includes(k)) {
        continue;
      }

      if (
        k.startsWith(CACHE_PREFIX) ||
        k.includes('lk_cache') ||
        k.includes('lore_cache') ||
        k.includes('map_cache') ||
        k.includes('texture_cache')
      ) {
        keysToDelete.push(k);
      }
    }

    for (const k of keysToDelete) {
      window.localStorage.removeItem(k);
      clearedLocalStorageKeys++;
    }
  }

  // Clear Cache Storage buckets for lore, maps, and planet textures
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await window.caches.keys();
      for (const name of cacheNames) {
        const lower = name.toLowerCase();
        if (
          lower.includes('lore') ||
          lower.includes('map') ||
          lower.includes('texture') ||
          lower.includes('media') ||
          lower.includes('legendkeeper') ||
          lower.includes('konran')
        ) {
          const cache = await window.caches.open(name);
          const requests = await cache.keys();
          for (const req of requests) {
            const url = req.url.toLowerCase();
            if (
              url.includes('/api/lore') ||
              url.includes('legendkeeper') ||
              url.includes('texture') ||
              url.includes('map') ||
              url.endsWith('.png') ||
              url.endsWith('.jpg') ||
              url.endsWith('.webp') ||
              lower.includes('lore') ||
              lower.includes('media') ||
              lower.includes('map')
            ) {
              await cache.delete(req);
            }
          }
          if (lower.includes('lore') || lower.includes('media') || lower.includes('map') || lower.includes('texture')) {
            await window.caches.delete(name);
          }
          clearedCacheBuckets++;
        }
      }
    } catch {
      // Cache API unavailable or restricted
    }
  }

  dispatchVaultChange();
  return { clearedLocalStorageKeys, clearedCacheBuckets };
}

/**
 * Compute byte & key metrics for Protected Local User Vault vs Clearable Media/Lore Cache.
 */
export function getVaultStats(): VaultStats {
  let vaultKeyCount = 0;
  let vaultBytes = 0;
  let cacheKeyCount = 0;
  let cacheBytes = 0;
  let lastSyncedAt: string | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    lastSyncedAt = window.localStorage.getItem(LAST_SYNC_KEY);

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      const val = window.localStorage.getItem(k) || '';
      const size = (k.length + val.length) * 2; // UTF-16 estimate in bytes

      if (k.startsWith(VAULT_PREFIX) || PROTECTED_LEGACY_KEYS.includes(k)) {
        vaultKeyCount++;
        vaultBytes += size;
      } else if (
        k.startsWith(CACHE_PREFIX) ||
        k.includes('lk_cache') ||
        k.includes('lore_cache') ||
        k.includes('map_cache') ||
        k.includes('texture_cache')
      ) {
        cacheKeyCount++;
        cacheBytes += size;
      }
    }
  }

  const queue = getVaultSyncQueue();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return {
    vaultKeyCount,
    vaultBytes,
    cacheKeyCount,
    cacheBytes,
    pendingSyncCount: queue.length,
    lastSyncedAt,
    isOnline,
  };
}

// Register global online listener once in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    dispatchVaultChange();
    void flushVaultSyncQueue();
  });
  window.addEventListener('offline', () => {
    dispatchVaultChange();
  });
}

/**
 * React hook tracking Protected Local User Vault stats, online status, and sync queue operations.
 */
export function useVaultSyncStatus() {
  const [stats, setStats] = useState<VaultStats>(() => getVaultStats());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStats(getVaultStats());
  }, []);

  useEffect(() => {
    refresh();
    const handleChange = () => refresh();
    window.addEventListener(VAULT_CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);
    return () => {
      window.removeEventListener(VAULT_CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    };
  }, [refresh]);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      const res = await flushVaultSyncQueue();
      if (!res.success && res.error) {
        setLastSyncError(res.error);
      }
      refresh();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [refresh]);

  const clearCache = useCallback(async () => {
    const res = await clearLoreAndMediaCache();
    refresh();
    return res;
  }, [refresh]);

  return {
    ...stats,
    isSyncing,
    lastSyncError,
    syncNow,
    clearCache,
    refresh,
  };
}
