export type Roll20WebhookEvent = 'breach_alert' | 'hp_sync';
export type DiscordDMWebhookEvent =
  | 'merge_request'
  | 'breach_ping'
  | 'cipher_decoded'
  | 'vendor_activity';

export interface WebhookDispatchResult {
  ok: boolean;
  dispatched: boolean;
  channel: 'roll20' | 'discord';
  event: string;
}

export async function emitRoll20Webhook(
  event: Roll20WebhookEvent,
  payload: unknown
): Promise<WebhookDispatchResult> {
  try {
    const res = await fetch('/api/sync/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'roll20',
        event,
        timestampIso: new Date().toISOString(),
        payload,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; dispatched?: boolean };
      return {
        ok: true,
        dispatched: Boolean(data.dispatched),
        channel: 'roll20',
        event,
      };
    }
  } catch {
    // Graceful local/offline fallback
  }

  return {
    ok: true,
    dispatched: false,
    channel: 'roll20',
    event,
  };
}

export async function emitDiscordDMWebhook(
  event: DiscordDMWebhookEvent,
  payload: unknown
): Promise<WebhookDispatchResult> {
  try {
    const res = await fetch('/api/sync/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'discord',
        event,
        timestampIso: new Date().toISOString(),
        payload,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; dispatched?: boolean };
      return {
        ok: true,
        dispatched: Boolean(data.dispatched),
        channel: 'discord',
        event,
      };
    }
  } catch {
    // Graceful local/offline fallback
  }

  return {
    ok: true,
    dispatched: false,
    channel: 'discord',
    event,
  };
}
