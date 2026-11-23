// Service Worker for Konran Companion App // Slablet MK IV
// Implements Stale-While-Revalidate with Strict Asset Budgeting:
// 1. CORE_PINNED_CACHE: Critical UI shell, WOFF2 fonts, core icons, and modular /schemas/*.json
// 2. RUNTIME_MEDIA_CACHE: Clearable lore/media cache with strict entry & byte budget caps

const CORE_PINNED_CACHE = 'konran-slablet-core-v2';
const RUNTIME_MEDIA_CACHE = 'konran-runtime-media-v2';
const MAX_MEDIA_ENTRIES = 60;
const MAX_SINGLE_ASSET_BYTES = 1500000; // 1.5 MB cap per cached runtime asset

const PRECACHE_CORE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/assets/clock-face.png',
  '/assets/clock-face-outer.png',
  '/schemas/rigs.schema.json',
  '/schemas/cyberware.schema.json',
  '/schemas/linguistics.schema.json',
  '/schemas/minigames.schema.json',
];

async function enforceCacheBudget(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      const overflow = keys.length - maxEntries;
      for (let i = 0; i < overflow; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch {
    // Ignore quota trimming errors
  }
}

function isPinnedCoreAsset(pathname) {
  return (
    pathname === '/' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/schemas/') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CORE_PINNED_CACHE)
      .then((cache) => cache.addAll(PRECACHE_CORE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const allowed = new Set([CORE_PINNED_CACHE, RUNTIME_MEDIA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (!allowed.has(key) ? caches.delete(key) : Promise.resolve())))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Bypass live API endpoints (handled by edge functions + IndexedDB vault)
  if (url.pathname.startsWith('/api/')) return;

  const targetCache = isPinnedCoreAsset(url.pathname) ? CORE_PINNED_CACHE : RUNTIME_MEDIA_CACHE;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const contentLength = Number(networkResponse.headers.get('content-length') || '0');
            if (!contentLength || contentLength <= MAX_SINGLE_ASSET_BYTES) {
              const clone = networkResponse.clone();
              const cache = await caches.open(targetCache);
              await cache.put(event.request, clone);
              if (targetCache === RUNTIME_MEDIA_CACHE) {
                enforceCacheBudget(RUNTIME_MEDIA_CACHE, MAX_MEDIA_ENTRIES);
              }
            }
          }
          return networkResponse;
        })
        .catch(() => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return undefined;
        });

      // Stale-while-revalidate: return cached immediately if present, revalidate in background
      return cachedResponse || networkFetch;
    })
  );
});
