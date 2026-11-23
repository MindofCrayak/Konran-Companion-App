export const DB_NAME = 'konran_slablet_mk4_idb';
export const DB_VERSION = 1;

export type VaultStoreName =
  | 'characters'
  | 'rigs'
  | 'offline_edits'
  | 'familiarity_signatures';

const STORE_NAMES: VaultStoreName[] = [
  'characters',
  'rigs',
  'offline_edits',
  'familiarity_signatures',
];

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openVaultDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        for (const store of STORE_NAMES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

function lsKey(store: VaultStoreName, key: string): string {
  return `${DB_NAME}::${store}::${key}`;
}

export async function idbGet<T>(store: VaultStoreName, key: string): Promise<T | null> {
  const db = await openVaultDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  try {
    const raw = localStorage.getItem(lsKey(store, key));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function idbPut<T>(store: VaultStoreName, key: string, value: T): Promise<void> {
  const db = await openVaultDB();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  try {
    localStorage.setItem(lsKey(store, key), JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export async function idbGetAll<T>(store: VaultStoreName): Promise<T[]> {
  const db = await openVaultDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve((req.result as T[]) ?? []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  const results: T[] = [];
  const prefix = `${DB_NAME}::${store}::`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const raw = localStorage.getItem(k);
        if (raw) results.push(JSON.parse(raw) as T);
      }
    }
  } catch {
    // ignore
  }
  return results;
}

export function computeStateHash(obj: unknown): string {
  const str = JSON.stringify(obj) ?? '';
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export async function getFamiliaritySignature(tag: string): Promise<string[] | null> {
  return idbGet<string[]>('familiarity_signatures', tag);
}

export async function saveFamiliaritySignature(tag: string, signature: string[]): Promise<void> {
  await idbPut<string[]>('familiarity_signatures', tag, signature);
}
