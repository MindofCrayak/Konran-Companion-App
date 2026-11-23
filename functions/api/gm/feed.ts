import type { GMFeedEvent } from './action';

interface Env {
  GM_FEED?: {
    get: (key: string) => Promise<string | null>;
  };
}

const KV_FEED_KEY = 'konran_gm_feed_v1';

const globalStore = globalThis as unknown as {
  __KONRAN_GM_FEED_BUFFER__?: GMFeedEvent[];
};

const SEED_RUMORS: GMFeedEvent[] = [
  {
    id: 'gm_seed_rumor_01',
    type: 'reputation_step',
    timestamp: Date.now() - 1000 * 60 * 30,
    isoTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    deliveryMode: 'public_broadcast',
    reputation: {
      entityId: 'city_vantya',
      entityName: 'Vantya (Imperial Capital)',
      delta: 0.25,
      newStanding: 0.25,
      newPrestige: 0,
      rumorNote:
        'World Wire // Imperial drydocks at Vantya report heightened airship patrols along the Caldera ley-conduits.',
    },
  },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const sinceParam = url.searchParams.get('since');
    const characterId = url.searchParams.get('character');
    const sinceTs = sinceParam ? Number(sinceParam) || 0 : 0;

    let events: GMFeedEvent[] = [];

    // 1. Read from Cloudflare KV `GM_FEED` if bound
    if (context.env?.GM_FEED) {
      try {
        const raw = await context.env.GM_FEED.get(KV_FEED_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            events = parsed;
          }
        }
      } catch {
        // Fallback to in-memory buffer
      }
    }

    // 2. Merge with in-memory isolate buffer
    const memEvents = globalStore.__KONRAN_GM_FEED_BUFFER__ || [];
    const seenIds = new Set(events.map((e) => e.id));
    for (const m of memEvents) {
      if (!seenIds.has(m.id)) {
        events.push(m);
        seenIds.add(m.id);
      }
    }

    if (events.length === 0) {
      events = [...SEED_RUMORS];
    }

    // Filter by timestamp and target character (include public broadcasts + targeted drops for this character)
    const filtered = events
      .filter((ev) => {
        if (sinceTs > 0 && ev.timestamp <= sinceTs) return false;
        if (
          characterId &&
          ev.deliveryMode === 'targeted_drop' &&
          ev.targetCharacterId &&
          ev.targetCharacterId !== characterId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    return new Response(
      JSON.stringify({
        ok: true,
        events: filtered,
        serverTime: Date.now(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: true,
        events: SEED_RUMORS,
        serverTime: Date.now(),
        fallback: true,
        message: err?.message,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
