import { useState, useEffect, useCallback, useRef } from 'react';
import { loadFromVault, saveToVault } from '../utils/vault';

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
  handout?: {
    resourceId: string;
    title: string;
    summary?: string;
    layerTarget?: number;
  };
  reputation?: {
    entityId: string;
    entityName: string;
    delta: number;
    newStanding: number;
    newPrestige: number;
    rumorNote?: string;
  };
  progression?: {
    characterId: string;
    characterName?: string;
    declaredDeity?: string;
    deityLocked?: boolean;
    kampStatus?: 'enrolled' | 'alumnus' | 'restricted';
    kampHouseId?: string;
  };
}

export const GM_FEED_CHANNEL_NAME = 'konran-gm-feed';
export const GM_FEED_DOM_EVENT = 'konran:gm-feed-event';
const GM_FEED_VAULT_KEY = 'konran.vault.gmFeed';

/**
 * Broadcast a newly created GM Feed event across open tabs (`BroadcastChannel('konran-gm-feed')`),
 * same-tab listeners (`CustomEvent`), and persist in the Protected User Vault.
 */
export function publishLocalGMFeedEvent(event: GMFeedEvent): void {
  if (typeof window === 'undefined') return;

  const existing = loadFromVault<GMFeedEvent[]>(GM_FEED_VAULT_KEY, []);
  const next = [event, ...existing.filter((e) => e.id !== event.id)].slice(0, 100);
  saveToVault(GM_FEED_VAULT_KEY, next);

  // Same-tab CustomEvent
  window.dispatchEvent(new CustomEvent<GMFeedEvent>(GM_FEED_DOM_EVENT, { detail: event }));

  // Cross-tab BroadcastChannel
  if ('BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(GM_FEED_CHANNEL_NAME);
      bc.postMessage(event);
      bc.close();
    } catch {
      // Ignore BroadcastChannel error
    }
  }
}

export interface UseGMFeedOptions {
  characterId?: string | null;
  pollIntervalMs?: number; // Default 5000ms (within 3-8s background sync pulse)
  onEventReceived?: (event: GMFeedEvent) => void;
}

/**
 * Polls `/api/gm/feed` every 5s (3–8s pulse) and listens to `BroadcastChannel('konran-gm-feed')`
 * and local custom events so actions triggered in `GMSwitchboardView` appear immediately.
 */
export function useGMFeed(options: UseGMFeedOptions = {}) {
  const { characterId, pollIntervalMs = 5000, onEventReceived } = options;

  const [events, setEvents] = useState<GMFeedEvent[]>(() =>
    loadFromVault<GMFeedEvent[]>(GM_FEED_VAULT_KEY, [])
  );
  const [lastPollTime, setLastPollTime] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const seenIdsRef = useRef<Set<string>>(new Set(events.map((e) => e.id)));
  const latestTsRef = useRef<number>(
    events.reduce((max, e) => Math.max(max, e.timestamp || 0), 0)
  );
  const onEventCallbackRef = useRef(onEventReceived);
  onEventCallbackRef.current = onEventReceived;

  const ingestEvents = useCallback(
    (incoming: GMFeedEvent[]) => {
      if (!incoming || incoming.length === 0) return;

      const fresh: GMFeedEvent[] = [];
      for (const ev of incoming) {
        if (!ev || !ev.id) continue;
        // Filter targeted drops intended for a different character
        if (
          characterId &&
          ev.deliveryMode === 'targeted_drop' &&
          ev.targetCharacterId &&
          ev.targetCharacterId !== characterId
        ) {
          continue;
        }

        if (!seenIdsRef.current.has(ev.id)) {
          seenIdsRef.current.add(ev.id);
          fresh.push(ev);
          if (ev.timestamp > latestTsRef.current) {
            latestTsRef.current = ev.timestamp;
          }
        }
      }

      if (fresh.length > 0) {
        setEvents((prev) => {
          const merged = [...fresh, ...prev]
            .filter((v, idx, arr) => arr.findIndex((x) => x.id === v.id) === idx)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100);
          saveToVault(GM_FEED_VAULT_KEY, merged);
          return merged;
        });

        for (const f of fresh) {
          onEventCallbackRef.current?.(f);
        }
      }
    },
    [characterId]
  );

  const pollNow = useCallback(async () => {
    setIsPolling(true);
    try {
      const params = new URLSearchParams();
      if (latestTsRef.current > 0) {
        params.set('since', String(latestTsRef.current));
      }
      if (characterId) {
        params.set('character', characterId);
      }
      const res = await fetch(`/api/gm/feed?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data: any = await res.json();
        if (Array.isArray(data?.events)) {
          ingestEvents(data.events);
        }
        setLastPollTime(Date.now());
      }
    } catch {
      // Offline / local fallback works seamlessly via BroadcastChannel + Protected Vault
    } finally {
      setIsPolling(false);
    }
  }, [characterId, ingestEvents]);

  // Background 5s (3-8s) sync pulse
  useEffect(() => {
    void pollNow();
    const clampedInterval = Math.max(3000, Math.min(8000, pollIntervalMs));
    const timer = window.setInterval(() => {
      void pollNow();
    }, clampedInterval);
    return () => window.clearInterval(timer);
  }, [pollNow, pollIntervalMs]);

  // Listen to BroadcastChannel('konran-gm-feed') and local custom event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDomEvent = (e: Event) => {
      const custom = e as CustomEvent<GMFeedEvent>;
      if (custom.detail) {
        ingestEvents([custom.detail]);
      }
    };

    window.addEventListener(GM_FEED_DOM_EVENT, handleDomEvent);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel(GM_FEED_CHANNEL_NAME);
        bc.onmessage = (msg: MessageEvent<GMFeedEvent>) => {
          if (msg.data && msg.data.id) {
            ingestEvents([msg.data]);
          }
        };
      } catch {
        bc = null;
      }
    }

    return () => {
      window.removeEventListener(GM_FEED_DOM_EVENT, handleDomEvent);
      try {
        bc?.close();
      } catch {
        // Ignore
      }
    };
  }, [ingestEvents]);

  // Derived slices for convenient consumer rendering
  const broadcasts = events.filter((e) => e.deliveryMode === 'public_broadcast');
  const targetedDrops = events.filter(
    (e) =>
      e.deliveryMode === 'targeted_drop' &&
      (!characterId || !e.targetCharacterId || e.targetCharacterId === characterId)
  );
  const rumors = events.filter(
    (e) => e.type === 'reputation_step' && e.reputation?.rumorNote
  );
  const approvals = events.filter(
    (e) => e.type === 'deity_declaration_lock' || e.type === 'kamp_enrollment_approval'
  );

  return {
    events,
    broadcasts,
    targetedDrops,
    rumors,
    approvals,
    lastPollTime,
    isPolling,
    pollNow,
    publishEvent: publishLocalGMFeedEvent,
  };
}
