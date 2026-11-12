interface Env {
  LEGENDKEEPER_API_KEY: string;
  LEGENDKEEPER_PROJECT_ID?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { LEGENDKEEPER_API_KEY, LEGENDKEEPER_PROJECT_ID } = context.env;

  if (!LEGENDKEEPER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "LEGENDKEEPER_API_KEY is not set in Cloudflare secrets." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const headers = {
    Authorization: `Bearer ${LEGENDKEEPER_API_KEY.trim()}`,
    Accept: "application/json",
  };

  try {
    // 1. Automatically resolve Project ID if not supplied or mismatched
    let projectId = LEGENDKEEPER_PROJECT_ID?.trim();
    if (projectId && projectId.includes('/')) {
      // If user copied URL path like "workspaceId/projectId", extract the actual project ID (last segment)
      projectId = projectId.split('/').filter(Boolean).pop();
    }

    if (!projectId) {
      const projRes = await fetch("https://www.legendkeeper.com/api/v3/projects", { headers });
      if (!projRes.ok) {
        const errText = await projRes.text();
        return new Response(
          JSON.stringify({ error: `LegendKeeper project lookup failed (${projRes.status}): ${errText}` }),
          { status: projRes.status, headers: { "Content-Type": "application/json" } }
        );
      }
      const projData: any = await projRes.json();
      projectId = projData.data?.[0]?.id || projData.projects?.[0]?.id;
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "No projects found associated with this API key.", details: projData }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const url = new URL(context.request.url);
    const q = url.searchParams.get("q");
    const resourceId = url.searchParams.get("resource_id");
    const docId = url.searchParams.get("doc_id");

    const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;
    let targetUrl = `${baseUrl}/resources?limit=50`;

    if (q) {
      targetUrl = `${baseUrl}/search?q=${encodeURIComponent(q)}&limit=25`;
    } else if (resourceId && docId) {
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}/docs/${encodeURIComponent(docId)}/blocks`;
    } else if (resourceId) {
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}`;
    }

    const response = await fetch(targetUrl, { headers });
    const rawText = await response.text();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `LegendKeeper API returned status ${response.status}`,
          details: rawText,
          targetUrl,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    let parsed = JSON.parse(rawText);

    // If search had 0 results, fall back to listing matching resources by name
    if (q && Array.isArray(parsed.data) && parsed.data.length === 0) {
      const listRes = await fetch(`${baseUrl}/resources?limit=100`, { headers });
      if (listRes.ok) {
        const listData: any = await listRes.json();
        const lowerQ = q.toLowerCase();
        const matches = (listData.data || []).filter((r: any) =>
          r.name?.toLowerCase().includes(lowerQ) ||
          r.tags?.some((t: string) => t.toLowerCase().includes(lowerQ))
        );
        parsed = {
          data: matches.map((r: any) => ({
            resource: r,
            document: r.documents?.[0] ? { id: r.documents[0].id, name: r.documents[0].name } : undefined,
          })),
        };
      }
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to reach LegendKeeper API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
