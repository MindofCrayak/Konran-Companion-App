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
    const url = new URL(context.request.url);

    // Debug endpoint: return list of all projects authorized for this API key
    if (url.searchParams.has("projects")) {
      const projRes = await fetch("https://www.legendkeeper.com/api/v3/projects", { headers });
      const raw = await projRes.text();
      return new Response(raw, {
        status: projRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Authoritative Project ID lookup via LegendKeeper /projects API
    // Since LegendKeeper API keys are strictly project-scoped, querying /api/v3/projects guarantees the correct ID.
    let projectId: string | undefined;
    const projRes = await fetch("https://www.legendkeeper.com/api/v3/projects", { headers });
    if (projRes.ok) {
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : (projData.data || projData.projects || []);
      if (projects.length > 0) {
        // If a specific project was requested via query param or env var, check if it exists in the authorized list
        const desired = url.searchParams.get("project_id") || (LEGENDKEEPER_PROJECT_ID ? LEGENDKEEPER_PROJECT_ID.split('/').pop() : undefined);
        const match = desired ? projects.find((p: any) => p.id === desired || p.name?.toLowerCase() === desired.toLowerCase()) : null;
        projectId = match ? match.id : projects[0].id;
      }
    }

    // Fallback if projects lookup did not yield an ID
    if (!projectId) {
      if (LEGENDKEEPER_PROJECT_ID) {
        projectId = LEGENDKEEPER_PROJECT_ID.split('/').filter(Boolean).pop();
      }
    }

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "Could not resolve a valid LegendKeeper project ID for this API key." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
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
