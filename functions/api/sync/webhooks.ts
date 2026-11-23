export interface WebhookEnv {
  ROLL20_MOD_WEBHOOK_URL?: string;
  DISCORD_DM_WEBHOOK_URL?: string;
}

export interface IncomingWebhookBody {
  channel?: 'roll20' | 'discord';
  event?: string;
  timestampIso?: string;
  payload?: unknown;
}

export const onRequestPost = async (context: {
  request: Request;
  env: WebhookEnv;
}): Promise<Response> => {
  let body: IncomingWebhookBody = {};
  try {
    body = (await context.request.json()) as IncomingWebhookBody;
  } catch {
    body = {};
  }

  const channel = body.channel ?? 'discord';
  const event = body.event ?? 'unknown_event';
  let dispatched = false;

  try {
    if (channel === 'roll20' && context.env?.ROLL20_MOD_WEBHOOK_URL) {
      const upstream = await fetch(context.env.ROLL20_MOD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'konran_slablet_mk4',
          event,
          timestampIso: body.timestampIso ?? new Date().toISOString(),
          payload: body.payload,
        }),
      });
      dispatched = upstream.ok;
    } else if (channel === 'discord' && context.env?.DISCORD_DM_WEBHOOK_URL) {
      const contentSummary = `**[Konran Slablet Mk-IV :: ${event.toUpperCase()}]**\n\`\`\`json\n${JSON.stringify(
        body.payload ?? {},
        null,
        2
      ).slice(0, 1600)}\n\`\`\``;

      const upstream = await fetch(context.env.DISCORD_DM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'CoreNet Telemetry Relay',
          content: contentSummary,
        }),
      });
      dispatched = upstream.ok;
    }
  } catch {
    dispatched = false;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      dispatched: Boolean(dispatched),
      channel,
      event,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
