export type GMActionType =
  | 'handout_drop'
  | 'reputation_step'
  | 'monthly_drift'
  | 'deity_declaration_lock'
  | 'kamp_enrollment_approval';

export interface GMFeedEvent {
  id: string;
  type: GMActionType;
  timestamp: number;
  isoTimestamp: string;
  campaignId?: string;
  campaignName?: string;
  deliveryMode?: 'public_broadcast' | 'targeted_drop';
  targetCharacterId?: string;
  targetCharacterName?: string;
  // Handout payload
  handout?: {
    resourceId: string;
    title: string;
    summary?: string;
    layerTarget?: number;
  };
  // Reputation payload
  reputation?: {
    entityId: string;
    entityName: string;
    delta: number;
    newStanding: number;
    newPrestige: number;
    rumorNote?: string;
  };
  // Progression Approval payload
  progression?: {
    characterId: string;
    characterName?: string;
    declaredDeity?: string;
    deityLocked?: boolean;
    kampStatus?: 'enrolled' | 'alumnus' | 'restricted';
    kampHouseId?: string;
  };
}

interface Env {
  GM_FEED?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
  GOOGLE_SHEET_WEBHOOK_URL?: string;
}

const KV_FEED_KEY = 'konran_gm_feed_v1';

// Shared in-memory buffer for local dev / edge isolates when KV is not bound
const globalStore = globalThis as unknown as {
  __KONRAN_GM_FEED_BUFFER__?: GMFeedEvent[];
};

if (!globalStore.__KONRAN_GM_FEED_BUFFER__) {
  globalStore.__KONRAN_GM_FEED_BUFFER__ = [];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json().catch(() => ({}));
    const now = Date.now();

    const event: GMFeedEvent = {
      id: body.id || `gm_${now}_${Math.random().toString(36).slice(2, 7)}`,
      type: body.type || 'reputation_step',
      timestamp: typeof body.timestamp === 'number' ? body.timestamp : now,
      isoTimestamp: new Date(now).toISOString(),
      campaignId: body.campaignId,
      campaignName: body.campaignName,
      deliveryMode: body.deliveryMode,
      targetCharacterId: body.targetCharacterId,
      targetCharacterName: body.targetCharacterName,
      handout: body.handout,
      reputation: body.reputation,
      progression: body.progression,
    };

    // 1. Store in in-memory isolate buffer
    const memoryFeed = globalStore.__KONRAN_GM_FEED_BUFFER__ || [];
    memoryFeed.unshift(event);
    globalStore.__KONRAN_GM_FEED_BUFFER__ = memoryFeed.slice(0, 150);

    // 2. Store in Cloudflare KV `GM_FEED` if bound
    if (context.env?.GM_FEED) {
      try {
        const raw = await context.env.GM_FEED.get(KV_FEED_KEY);
        const existing: GMFeedEvent[] = raw ? JSON.parse(raw) : [];
        const updated = [event, ...existing.filter((e) => e.id !== event.id)].slice(0, 150);
        await context.env.GM_FEED.put(KV_FEED_KEY, JSON.stringify(updated));
      } catch {
        // Ignore KV error in local preview
      }
    }

    // 3. Forward to Google Sheets Webhook Ledger if configured
    let sheetForwarded = false;
    if (context.env?.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const webhookRes = await fetch(context.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'konran_gm_switchboard',
            event,
          }),
        });
        sheetForwarded = webhookRes.ok;
      } catch {
        sheetForwarded = false;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        event,
        sheetForwarded,
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
    // Always return 200 JSON so local/offline demo works seamlessly
    return new Response(
      JSON.stringify({
        ok: true,
        fallback: true,
        message: err?.message || 'Processed locally',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
