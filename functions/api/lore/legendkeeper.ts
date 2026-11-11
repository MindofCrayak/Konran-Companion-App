interface Env {
  LEGENDKEEPER_PROJECT_ID: string;
  LEGENDKEEPER_API_KEY: string;
}

// GET: /api/lore/legendkeeper
// Query params:
//   - q: search term (full text search)
//   - resource_id: fetch specific resource metadata & docs
//   - doc_id: fetch specific document blocks (when paired with resource_id)
//   - list: set to 'true' to get top-level resources
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { LEGENDKEEPER_PROJECT_ID, LEGENDKEEPER_API_KEY } = context.env;

  if (!LEGENDKEEPER_PROJECT_ID || !LEGENDKEEPER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing LegendKeeper credentials in environment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(context.request.url);
  const q = url.searchParams.get("q");
  const resourceId = url.searchParams.get("resource_id");
  const docId = url.searchParams.get("doc_id");
  const list = url.searchParams.get("list");

  const baseUrl = "https://www.legendkeeper.com/api/v3/projects/" + LEGENDKEEPER_PROJECT_ID;
  const headers = {
    Authorization: `Bearer ${LEGENDKEEPER_API_KEY}`,
    Accept: "application/json",
  };

  try {
    let targetUrl = "";

    if (q) {
      // 1. Full-text search
      targetUrl = `${baseUrl}/search?q=${encodeURIComponent(q)}&limit=10`;
    } else if (resourceId && docId) {
      // 2. Fetch specific document content blocks
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}/docs/${encodeURIComponent(docId)}/blocks`;
    } else if (resourceId) {
      // 3. Fetch specific resource details
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}`;
    } else if (list === "true") {
      // 4. List top-level resources
      targetUrl = `${baseUrl}/resources?limit=50&parentId=root`;
    } else {
      // Default: Project Overview
      targetUrl = baseUrl;
    }

    const response = await fetch(targetUrl, { headers });
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache responses for 1 minute
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to reach LegendKeeper API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
