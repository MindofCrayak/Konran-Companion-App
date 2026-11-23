interface Env {
  LEGENDKEEPER_API_KEY?: string;
  LK_API_KEY?: string;
  LEGENDKEEPER_PROJECT_ID?: string;
  LORE_CACHE?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
}

function blocksToMarkdown(blocks: any[]): {
  markdown: string;
  mentions: { id: string; label: string }[];
  images: string[];
} {
  const lines: string[] = [];
  const mentions: { id: string; label: string }[] = [];
  const images: string[] = [];

  const walk = (list: any[]) => {
    for (const b of list || []) {
      const text: string = b.text || b.content || b.title || '';
      if (b.type === 'heading' || b.kind === 'heading') {
        lines.push(`### ${text}`);
      } else if (b.type === 'image' && b.url) {
        images.push(b.url);
        lines.push(`![${b.alt || 'Lore Image'}](${b.url})`);
      } else if (text) {
        const mentionMatches = text.matchAll(/@([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?)/g);
        for (const m of mentionMatches) {
          const id = m[1].toLowerCase().replace(/\s+/g, '-');
          if (!mentions.some((x) => x.id === id)) {
            mentions.push({ id, label: `@${m[1]}` });
          }
        }
        lines.push(text);
      }
      if (Array.isArray(b.children) && b.children.length > 0) {
        walk(b.children);
      }
    }
  };

  walk(blocks);
  return {
    markdown: lines.join('\n\n'),
    mentions,
    images,
  };
}

function buildCredentialsRequiredArticle(resourceId: string, reason: string): Response {
  return new Response(
    JSON.stringify({
      id: resourceId,
      resourceId,
      status: 'CREDENTIALS_REQUIRED',
      diagnostic: '[LK BRIDGE: CREDENTIALS REQUIRED]',
      error: reason,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    }
  );
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const apiKey = (context.env.LEGENDKEEPER_API_KEY || context.env.LK_API_KEY || '').trim();
  const { LEGENDKEEPER_PROJECT_ID, LORE_CACHE } = context.env;
  const rawParam = context.params?.resourceId;
  const resourceId = (Array.isArray(rawParam) ? rawParam[0] : rawParam || 'konran').toString();

  if (!apiKey) {
    return buildCredentialsRequiredArticle(
      resourceId,
      'LEGENDKEEPER_API_KEY (or LK_API_KEY) is not configured in Cloudflare Worker secrets.'
    );
  }

  const cacheKey = `lk_live_article_v3_${resourceId}`;
  if (LORE_CACHE) {
    try {
      const cached = await LORE_CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
        });
      }
    } catch {
      // continue
    }
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  try {
    const projRes = await fetch('https://www.legendkeeper.com/api/v3/projects', { headers });
    if (projRes.status === 401 || projRes.status === 403) {
      return buildCredentialsRequiredArticle(resourceId, `LegendKeeper auth rejected (HTTP ${projRes.status}).`);
    }
    let projectId: string | undefined;
    if (projRes.ok) {
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : projData.data || [];
      projectId = projects[0]?.id;
    }
    if (!projectId && LEGENDKEEPER_PROJECT_ID) {
      projectId = LEGENDKEEPER_PROJECT_ID.split('/').pop();
    }
    if (!projectId) {
      return buildCredentialsRequiredArticle(resourceId, 'Could not resolve LegendKeeper Project ID.');
    }

    const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;
    const resResp = await fetch(`${baseUrl}/resources/${encodeURIComponent(resourceId)}`, { headers });
    if (resResp.status === 401 || resResp.status === 403) {
      return buildCredentialsRequiredArticle(resourceId, `LegendKeeper auth rejected (HTTP ${resResp.status}).`);
    }
    if (!resResp.ok) {
      return buildCredentialsRequiredArticle(
        resourceId,
        `Resource "${resourceId}" not found or inaccessible in LegendKeeper (HTTP ${resResp.status}).`
      );
    }

    const resObj: any = await resResp.json();
    const docs: any[] = resObj.documents || [];
    const pageDoc = docs.find((d: any) => d.kind === 'page' || d.kind === 'wiki') || docs[0];
    const mapDoc = docs.find((d: any) => d.kind === 'map');

    let markdown = `### ${resObj.name || resourceId}\n\n`;
    let mentions: { id: string; label: string }[] = [];
    let images: string[] = [];

    if (pageDoc) {
      const blocksResp = await fetch(
        `${baseUrl}/resources/${encodeURIComponent(resourceId)}/docs/${encodeURIComponent(pageDoc.id)}/blocks`,
        { headers }
      );
      if (blocksResp.ok) {
        const blocksData: any = await blocksResp.json();
        const blockList = Array.isArray(blocksData) ? blocksData : blocksData.data || [];
        const parsed = blocksToMarkdown(blockList);
        if (parsed.markdown) markdown = parsed.markdown;
        mentions = parsed.mentions;
        images = parsed.images;
      }
    }

    // If this resource has a map tab, fetch its child pin links for interactive sub-map diving
    const subMapChildren: { id: string; name: string; tier: string }[] = [];
    if (mapDoc) {
      try {
        const featResp = await fetch(
          `${baseUrl}/resources/${encodeURIComponent(resourceId)}/docs/${encodeURIComponent(mapDoc.id)}/features`,
          { headers }
        );
        if (featResp.ok) {
          const featData: any = await featResp.json();
          const pins = (featData.data || []).filter(
            (f: any) => f.type === 'pin' || f.geometry?.type === 'Point'
          );
          for (const p of pins) {
            const uri: string = p.uri || p.properties?.uri || '';
            const m = uri.match(/lk:\/\/resources\/([^/]+)/);
            const childId = m ? m[1] : p.properties?.resourceId || p.id;
            if (childId) {
              subMapChildren.push({
                id: childId,
                name: p.name || p.properties?.name || childId,
                tier: 'Nested Map Pin',
              });
            }
          }
        }
      } catch {
        // ignore
      }
    }

    const payload = JSON.stringify({
      id: resObj.id || resourceId,
      resourceId: resObj.id || resourceId,
      name: resObj.name || resourceId,
      tier: mapDoc ? 'Interactive Sub-Map Resource' : 'Lore Dossier',
      tierLevel: 2,
      hasSubMap: Boolean(mapDoc || subMapChildren.length > 0),
      subMapChildren,
      mentions,
      images,
      markdown,
      status: 'LIVE',
      source: 'legendkeeper_v3_live',
    });

    if (LORE_CACHE) {
      try {
        await LORE_CACHE.put(cacheKey, payload, { expirationTtl: 3600 });
      } catch {
        // ignore
      }
    }

    return new Response(payload, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' },
    });
  } catch (err: any) {
    return buildCredentialsRequiredArticle(resourceId, err?.message || 'LegendKeeper v3 fetch failed.');
  }
};
