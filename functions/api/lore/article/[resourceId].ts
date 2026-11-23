import { CANONICAL_FALLBACK_PINS } from '../legendkeeper';

interface Env {
  LEGENDKEEPER_API_KEY?: string;
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
        // Extract @page mentions
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { LEGENDKEEPER_API_KEY, LEGENDKEEPER_PROJECT_ID, LORE_CACHE } = context.env;
  const rawParam = context.params?.resourceId;
  const resourceId = (Array.isArray(rawParam) ? rawParam[0] : rawParam || 'konran').toString();

  const cacheKey = `lk_article_v3_${resourceId}`;
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

  const matchedPin = CANONICAL_FALLBACK_PINS.find(
    (p) => p.resourceId === resourceId || p.id === resourceId || p.name.toLowerCase() === resourceId.toLowerCase()
  );
  const subPins = CANONICAL_FALLBACK_PINS.filter(
    (p) => p.parentId === matchedPin?.id || p.parentResourceId === (matchedPin?.resourceId || resourceId)
  );

  const buildFallback = () =>
    new Response(
      JSON.stringify({
        id: resourceId,
        resourceId,
        name: matchedPin?.name || resourceId.replace(/-/g, ' ').toUpperCase(),
        tier: matchedPin ? `Tier ${matchedPin.tierLevel || 2} // ${matchedPin.tier.toUpperCase()}` : 'Tier 1 // Archive',
        tierLevel: matchedPin?.tierLevel || 2,
        hasSubMap: Boolean(matchedPin?.hasSubMap || subPins.length > 0),
        subMapChildren: subPins.map((s) => ({
          id: s.resourceId || s.id,
          name: s.name,
          tier: `Tier ${s.tierLevel || 3} // ${s.tier}`,
        })),
        mentions: subPins.map((s) => ({ id: s.resourceId || s.id, label: `@${s.name}` })),
        images: [],
        markdown: `### ${matchedPin?.name || resourceId.replace(/-/g, ' ').toUpperCase()}\n\n*Archival dossier synchronized from the Konran Planetary Lore Engine (LegendKeeper v3).*\n\n${
          subPins.length > 0
            ? `**Sub-Map Portals Available:** ${subPins.map((s) => `@${s.name}`).join(', ')}\n\nSelect any sub-map portal below to dive into regional cities, street districts, or building interiors.`
            : 'Local guilds, couriers, and covenant wards maintain active telemetry across this sector via the Ley-Lattice.'
        }`,
        source: 'canonical_fallback',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  if (!LEGENDKEEPER_API_KEY) {
    return buildFallback();
  }

  const headers = {
    Authorization: `Bearer ${LEGENDKEEPER_API_KEY.trim()}`,
    Accept: 'application/json',
  };

  try {
    const projRes = await fetch('https://www.legendkeeper.com/api/v3/projects', { headers });
    let projectId: string | undefined;
    if (projRes.ok) {
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : projData.data || [];
      projectId = projects[0]?.id;
    }
    if (!projectId && LEGENDKEEPER_PROJECT_ID) {
      projectId = LEGENDKEEPER_PROJECT_ID.split('/').pop();
    }
    if (!projectId) return buildFallback();

    const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;
    const resResp = await fetch(`${baseUrl}/resources/${encodeURIComponent(resourceId)}`, { headers });
    if (!resResp.ok) return buildFallback();

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

    const payload = JSON.stringify({
      id: resObj.id || resourceId,
      resourceId: resObj.id || resourceId,
      name: resObj.name || matchedPin?.name || resourceId,
      tier: mapDoc ? 'Interactive Sub-Map Resource' : 'Lore Dossier',
      tierLevel: matchedPin?.tierLevel || 2,
      hasSubMap: Boolean(mapDoc || subPins.length > 0),
      subMapChildren: subPins.map((s) => ({
        id: s.resourceId || s.id,
        name: s.name,
        tier: `Tier ${s.tierLevel || 3} // ${s.tier}`,
      })),
      mentions,
      images,
      markdown,
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
  } catch {
    return buildFallback();
  }
};
