interface Env {
  GOOGLE_SHEET_WEBHOOK_URL: string;
}

// GET: /api/sync/sheet?discord_id=123
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const discordId = url.searchParams.get("discord_id");

  if (!discordId) {
    return new Response(JSON.stringify({ error: "discord_id parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const targetUrl = `${context.env.GOOGLE_SHEET_WEBHOOK_URL}?discord_id=${encodeURIComponent(discordId)}`;
    const response = await fetch(targetUrl);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch from sheet" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// POST: /api/sync/sheet (send JSON body with player updates)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    const response = await fetch(context.env.GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to post to sheet" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};
