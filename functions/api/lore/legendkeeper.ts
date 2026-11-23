interface Env {
  LEGENDKEEPER_API_KEY?: string;
  LEGENDKEEPER_PROJECT_ID?: string;
  LORE_CACHE?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
}

const CONTINENT_BOUNDING_BOXES: Record<
  string,
  { minLat: number; maxLat: number; minLng: number; maxLng: number }
> = {
  'kray-providence': { minLat: 20, maxLat: 58, minLng: 40, maxLng: 110 },
  'olyvia': { minLat: -45, maxLat: 10, minLng: 15, maxLng: 75 },
  'oray-core': { minLat: 15, maxLat: 65, minLng: -110, maxLng: -40 },
  'ousava-marches': { minLat: -60, maxLat: -10, minLng: -120, maxLng: -45 },
  'celeste-reaches': { minLat: -30, maxLat: 35, minLng: 120, maxLng: 180 },
  'slavyna-bastion': { minLat: 40, maxLat: 80, minLng: -30, maxLng: 40 },
  'psyon-spire': { minLat: -75, maxLat: -35, minLng: -30, maxLng: 35 },
};

// Canonical Multi-Tier Fallback Pins (Tiers 1..4) when API key is missing or LK offline
export const CANONICAL_FALLBACK_PINS = [
  // Tier 1: Continents & Provinces (hasSubMap: true)
  {
    id: 'pin-kray-providence',
    name: 'Kray Providence',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'kray-providence',
    lat: 42.5,
    lng: 78.2,
    pos: [0.65, 0.35],
    iconGlyph: 'Mountain',
    iconColor: '#22c55e',
    articleUrl: 'https://app.legendkeeper.com/a/kray-providence',
    isCapital: false,
    hasSubMap: true,
  },
  {
    id: 'pin-olyvia',
    name: 'Olyvia (Golden Basin)',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'olyvia',
    lat: -18.2,
    lng: 48.0,
    pos: [0.55, 0.62],
    iconGlyph: 'Landmark',
    iconColor: '#eab308',
    articleUrl: 'https://app.legendkeeper.com/a/olyvia',
    isCapital: false,
    hasSubMap: true,
  },
  {
    id: 'pin-oray-core',
    name: 'Oray Core Domain',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'oray-core',
    lat: 38.0,
    lng: -75.4,
    pos: [0.22, 0.38],
    iconGlyph: 'Shield',
    iconColor: '#60a5fa',
    articleUrl: 'https://app.legendkeeper.com/a/oray-core',
    isCapital: false,
    hasSubMap: true,
  },
  {
    id: 'pin-ousava-marches',
    name: 'Ousava Marches',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'ousava-marches',
    lat: -36.5,
    lng: -82.0,
    pos: [0.20, 0.72],
    iconGlyph: 'TreePine',
    iconColor: '#a855f7',
    articleUrl: 'https://app.legendkeeper.com/a/ousava-marches',
    isCapital: false,
    hasSubMap: true,
  },
  {
    id: 'pin-celeste-reaches',
    name: 'Celeste Reaches',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'celeste-reaches',
    lat: 5.0,
    lng: 152.0,
    pos: [0.88, 0.48],
    iconGlyph: 'Sparkles',
    iconColor: '#06b6d4',
    articleUrl: 'https://app.legendkeeper.com/a/celeste-reaches',
    isCapital: false,
    hasSubMap: true,
  },
  {
    id: 'pin-slavyna-bastion',
    name: 'Slavyna Bastion',
    tier: 'province',
    tierLevel: 1,
    resourceId: 'slavyna-bastion',
    lat: 62.0,
    lng: 5.0,
    pos: [0.45, 0.22],
    iconGlyph: 'Flame',
    iconColor: '#ef4444',
    articleUrl: 'https://app.legendkeeper.com/a/slavyna-bastion',
    isCapital: false,
    hasSubMap: true,
  },
  // Tier 2/3: Cities & Settlements
  {
    id: 'pin-crafton-cove',
    name: 'Crafton Cove',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-kray-providence',
    parentResourceId: 'kray-providence',
    resourceId: 'crafton-cove',
    lat: 44.2,
    lng: 82.5,
    pos: [0.67, 0.33],
    iconGlyph: 'Anchor',
    iconColor: '#38bdf8',
    articleUrl: 'https://app.legendkeeper.com/a/crafton-cove',
    isCapital: true,
    hasSubMap: true,
  },
  {
    id: 'pin-creston-cove',
    name: 'Creston Cove',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-kray-providence',
    parentResourceId: 'kray-providence',
    resourceId: 'creston-cove',
    lat: 41.8,
    lng: 76.1,
    pos: [0.64, 0.36],
    iconGlyph: 'Navigation',
    iconColor: '#34d399',
    articleUrl: 'https://app.legendkeeper.com/a/creston-cove',
    isCapital: true,
    hasSubMap: false,
  },
  {
    id: 'pin-skreeton-harbor',
    name: 'Skreeton Harbor',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-kray-providence',
    parentResourceId: 'kray-providence',
    resourceId: 'skreeton-harbor',
    lat: 38.6,
    lng: 85.0,
    pos: [0.69, 0.40],
    iconGlyph: 'Sailboat',
    iconColor: '#2dd4bf',
    articleUrl: 'https://app.legendkeeper.com/a/skreeton-harbor',
    isCapital: true,
    hasSubMap: false,
  },
  {
    id: 'pin-padd-city',
    name: 'Padd City',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-olyvia',
    parentResourceId: 'olyvia',
    resourceId: 'padd-city',
    lat: -14.5,
    lng: 52.3,
    pos: [0.57, 0.60],
    iconGlyph: 'Building2',
    iconColor: '#fbbf24',
    articleUrl: 'https://app.legendkeeper.com/a/padd-city',
    isCapital: true,
    hasSubMap: true,
  },
  {
    id: 'pin-crescent-moon-harbor',
    name: 'Crescent Moon Harbor',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-olyvia',
    parentResourceId: 'olyvia',
    resourceId: 'crescent-moon-harbor',
    lat: -22.0,
    lng: 44.8,
    pos: [0.53, 0.65],
    iconGlyph: 'Moon',
    iconColor: '#c084fc',
    articleUrl: 'https://app.legendkeeper.com/a/crescent-moon-harbor',
    isCapital: true,
    hasSubMap: false,
  },
  {
    id: 'pin-vantya',
    name: 'Vantya (Imperial Capital)',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-oray-core',
    parentResourceId: 'oray-core',
    resourceId: 'vantya',
    lat: 47.2,
    lng: -72.0,
    pos: [0.24, 0.31],
    iconGlyph: 'Crown',
    iconColor: '#ffd700',
    articleUrl: 'https://app.legendkeeper.com/a/vantya',
    isCapital: true,
    hasSubMap: true,
  },
  {
    id: 'pin-kamp-academy',
    name: 'K.A.M.P. Academy Citadel',
    tier: 'city',
    tierLevel: 3,
    parentId: 'pin-oray-core',
    parentResourceId: 'oray-core',
    resourceId: 'kamp-citadel',
    lat: 45.1,
    lng: -68.4,
    pos: [0.26, 0.33],
    iconGlyph: 'GraduationCap',
    iconColor: '#39ff14',
    articleUrl: 'https://app.legendkeeper.com/a/kamp-citadel',
    isCapital: true,
    hasSubMap: true,
  },
  {
    id: 'pin-sunfire-observatory',
    name: 'Sunfire Chrysoberyl Observatory',
    tier: 'landmark',
    tierLevel: 3,
    parentId: 'pin-oray-core',
    parentResourceId: 'oray-core',
    resourceId: 'sunfire-observatory',
    lat: 48.9,
    lng: -76.2,
    pos: [0.21, 0.29],
    iconGlyph: 'Compass',
    iconColor: '#f59e0b',
    articleUrl: 'https://app.legendkeeper.com/a/sunfire-observatory',
    isCapital: false,
    hasSubMap: false,
  },
  {
    id: 'pin-titans-trench',
    name: "Titan's Trench",
    tier: 'landmark',
    tierLevel: 3,
    parentId: 'pin-celeste-reaches',
    parentResourceId: 'celeste-reaches',
    resourceId: 'titans-trench',
    lat: 2.1,
    lng: 156.4,
    pos: [0.90, 0.51],
    iconGlyph: 'Waves',
    iconColor: '#06b6d4',
    articleUrl: 'https://app.legendkeeper.com/a/titans-trench',
    isCapital: false,
    hasSubMap: false,
  },
  // Tier 4+: Street View / Districts / Interiors
  {
    id: 'pin-mydnight-rendezvous',
    name: 'The Mydnight Rendezvous',
    tier: 'district',
    tierLevel: 4,
    parentId: 'pin-crafton-cove',
    parentResourceId: 'crafton-cove',
    resourceId: 'the-mydnight-rendezvous',
    lat: 44.35,
    lng: 82.68,
    pos: [0.58, 0.44],
    iconGlyph: 'Sparkles',
    iconColor: '#ec4899',
    articleUrl: 'https://app.legendkeeper.com/a/the-mydnight-rendezvous',
    isCapital: false,
    hasSubMap: false,
  },
  {
    id: 'pin-gilded-ledger-exchange',
    name: 'Gilded Ledger Courier Exchange',
    tier: 'district',
    tierLevel: 4,
    parentId: 'pin-padd-city',
    parentResourceId: 'padd-city',
    resourceId: 'gilded-ledger-exchange',
    lat: -14.38,
    lng: 52.44,
    pos: [0.52, 0.49],
    iconGlyph: 'Building2',
    iconColor: '#fbbf24',
    articleUrl: 'https://app.legendkeeper.com/a/gilded-ledger-exchange',
    isCapital: false,
    hasSubMap: false,
  },
  {
    id: 'pin-wyrmfire-chancery',
    name: 'Wyrmfire High Chancery',
    tier: 'district',
    tierLevel: 4,
    parentId: 'pin-vantya',
    parentResourceId: 'vantya',
    resourceId: 'wyrmfire-chancery',
    lat: 47.32,
    lng: -71.88,
    pos: [0.49, 0.51],
    iconGlyph: 'Crown',
    iconColor: '#60a5fa',
    articleUrl: 'https://app.legendkeeper.com/a/wyrmfire-chancery',
    isCapital: false,
    hasSubMap: false,
  },
];

function projectNestedCoordinates(
  rawCoords: [number, number],
  parentPin?: { resourceId?: string; lat: number; lng: number }
): { lat: number; lng: number } {
  const [nx, ny] = rawCoords;
  if (!parentPin) {
    return {
      lat: (0.5 - ny) * 180,
      lng: (nx - 0.5) * 360,
    };
  }
  const box = parentPin.resourceId ? CONTINENT_BOUNDING_BOXES[parentPin.resourceId] : undefined;
  if (box) {
    return {
      lat: box.minLat + (1 - ny) * (box.maxLat - box.minLat),
      lng: box.minLng + nx * (box.maxLng - box.minLng),
    };
  }
  return {
    lat: parentPin.lat + (0.5 - ny) * 12,
    lng: parentPin.lng + (nx - 0.5) * 16,
  };
}

/**
 * Recursively crawls a LegendKeeper resource's `kind: "map"` document tab across arbitrary zoom depths:
 * Tier 1 (Planetary Globe) -> Tier 2 (Continent/Region) -> Tier 3 (City) -> Tier 4+ (District / Street / Building Interior).
 */
async function crawlMapTreeRecursively(
  baseUrl: string,
  headers: Record<string, string>,
  resourceId: string,
  mapDocId: string,
  depth: number,
  maxDepth: number,
  visited: Set<string>,
  budget: { remaining: number },
  parentPin?: { id: string; resourceId?: string; lat: number; lng: number }
): Promise<any[]> {
  if (depth > maxDepth || budget.remaining <= 0) return [];
  budget.remaining--;

  const featuresRes = await fetch(`${baseUrl}/resources/${resourceId}/docs/${mapDocId}/features`, { headers });
  if (!featuresRes.ok) return [];
  const featuresData: any = await featuresRes.json();
  const rawPins = (featuresData.data || []).filter(
    (f: any) => f.type === 'pin' || f.geometry?.type === 'Point'
  );

  const collected: any[] = [];

  for (const p of rawPins) {
    const rawCoords: [number, number] = p.geometry?.coordinates || p.position || [0.5, 0.5];
    const linkedUri: string = p.uri || p.properties?.uri || '';
    const match = linkedUri.match(/lk:\/\/resources\/([^/]+)/);
    const childResourceId: string | undefined = match ? match[1] : p.properties?.resourceId;

    const { lat, lng } = projectNestedCoordinates(rawCoords, parentPin);
    const tierName =
      depth === 1 ? 'province' : depth === 2 ? 'city' : depth === 3 ? 'city' : 'district';
    const pinId = p.id || `pin-${(p.name || 'node').toLowerCase().replace(/\s+/g, '-')}`;

    let hasSubMap = false;
    let childMapDocId: string | undefined;

    if (childResourceId && !visited.has(childResourceId) && depth < maxDepth && budget.remaining > 0) {
      visited.add(childResourceId);
      budget.remaining--;
      try {
        const childRes = await fetch(`${baseUrl}/resources/${childResourceId}`, { headers });
        if (childRes.ok) {
          const childObj: any = await childRes.json();
          const childMapDoc = (childObj.documents || []).find((d: any) => d.kind === 'map');
          if (childMapDoc) {
            hasSubMap = true;
            childMapDocId = childMapDoc.id;
          }
        }
      } catch {
        // continue
      }
    }

    const pinRecord: any = {
      id: pinId,
      name: p.name || p.properties?.name || 'Unnamed Locale',
      tier: tierName,
      tierLevel: depth,
      parentId: parentPin?.id,
      parentResourceId: parentPin?.resourceId,
      resourceId: childResourceId,
      pos: rawCoords,
      lat,
      lng,
      iconGlyph: p.properties?.icon || (depth === 1 ? 'Mountain' : depth === 2 ? 'Anchor' : 'Sparkles'),
      iconColor: p.properties?.color || (depth === 1 ? '#22c55e' : depth === 2 ? '#38bdf8' : '#ec4899'),
      articleUrl: childResourceId ? `https://app.legendkeeper.com/a/${childResourceId}` : undefined,
      isCapital:
        depth === 2 ||
        ['crafton cove', 'creston cove', 'padd city', 'vantya', 'skreeton harbor'].includes(
          (p.name || '').toLowerCase()
        ),
      hasSubMap,
    };

    collected.push(pinRecord);

    if (hasSubMap && childResourceId && childMapDocId) {
      const subPins = await crawlMapTreeRecursively(
        baseUrl,
        headers,
        childResourceId,
        childMapDocId,
        depth + 1,
        maxDepth,
        visited,
        budget,
        { id: pinId, resourceId: childResourceId, lat, lng }
      );
      collected.push(...subPins);
    }
  }

  return collected;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { LEGENDKEEPER_API_KEY, LEGENDKEEPER_PROJECT_ID, LORE_CACHE } = context.env;
  const url = new URL(context.request.url);

  // 1. RECURSIVE MULTI-TIER MAP CRAWLER (?pins=1 or /maptree)
  if (url.searchParams.has('pins') || url.pathname.endsWith('/pins') || url.pathname.endsWith('/maptree')) {
    const cacheKey = 'lk_recursive_pins_v3';
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
        // ignore KV error
      }
    }

    if (!LEGENDKEEPER_API_KEY) {
      return new Response(JSON.stringify({ data: CANONICAL_FALLBACK_PINS, source: 'fallback_canonical' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    }

    const headers = {
      Authorization: `Bearer ${LEGENDKEEPER_API_KEY.trim()}`,
      Accept: 'application/json',
    };

    try {
      const projRes = await fetch('https://www.legendkeeper.com/api/v3/projects', { headers });
      if (!projRes.ok) throw new Error('LK /projects unreachable');
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : projData.data || [];
      const projectId = projects[0]?.id || LEGENDKEEPER_PROJECT_ID?.split('/').pop();

      if (!projectId) throw new Error('No project ID');

      // IMPORTANT: Never pass PROJECT_ID directly to map feature endpoints; locate resource -> map doc tab first
      const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;
      const resList = await fetch(`${baseUrl}/resources?limit=100`, { headers });
      if (!resList.ok) throw new Error('Failed to list resources');
      const resData: any = await resList.json();
      const allResources = resData.data || [];

      const konranRes =
        allResources.find(
          (r: any) =>
            r.name?.toLowerCase().includes('konran') && r.documents?.some((d: any) => d.kind === 'map')
        ) || allResources.find((r: any) => r.documents?.some((d: any) => d.kind === 'map'));

      if (!konranRes) {
        return new Response(JSON.stringify({ data: CANONICAL_FALLBACK_PINS, source: 'fallback_no_map_doc' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const mapDoc = konranRes.documents.find((d: any) => d.kind === 'map');
      if (!mapDoc) {
        return new Response(JSON.stringify({ data: CANONICAL_FALLBACK_PINS, source: 'fallback_no_map_tab' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const visited = new Set<string>([konranRes.id]);
      const budget = { remaining: 40 };
      const crawledPins = await crawlMapTreeRecursively(
        baseUrl,
        headers,
        konranRes.id,
        mapDoc.id,
        1,
        4,
        visited,
        budget
      );

      const finalPins = crawledPins.length > 0 ? crawledPins : CANONICAL_FALLBACK_PINS;
      const payload = JSON.stringify({ data: finalPins, source: 'legendkeeper_v3_recursive' });

      if (LORE_CACHE && crawledPins.length > 0) {
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
      return new Response(JSON.stringify({ data: CANONICAL_FALLBACK_PINS, source: 'fallback_error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. ARTICLE READER ENDPOINT (?article_id=<id> or ?resource_id=<id>)
  const articleId = url.searchParams.get('article_id') || url.searchParams.get('resource_id');
  if (articleId && !url.searchParams.has('q')) {
    const matchedPin = CANONICAL_FALLBACK_PINS.find(
      (p) => p.resourceId === articleId || p.id === articleId || p.name.toLowerCase() === articleId.toLowerCase()
    );
    const subPins = CANONICAL_FALLBACK_PINS.filter(
      (p) => p.parentId === matchedPin?.id || p.parentResourceId === (matchedPin?.resourceId || articleId)
    );

    const fallbackDossier = {
      id: articleId,
      name: matchedPin?.name || articleId.replace(/-/g, ' ').toUpperCase(),
      title: matchedPin?.name || articleId.replace(/-/g, ' ').toUpperCase(),
      tierLevel: matchedPin?.tierLevel || 2,
      hasSubMap: Boolean(matchedPin?.hasSubMap || subPins.length > 0),
      subMapChildren: subPins.map((s) => ({ id: s.resourceId || s.id, name: s.name, tier: s.tier })),
      mentions: subPins.map((s) => ({ id: s.resourceId || s.id, label: `@${s.name}` })),
      text: `### ${matchedPin?.name || articleId.replace(/-/g, ' ').toUpperCase()}\n\n*Archival dossier synchronized from the Konran Planetary Lore Engine (LegendKeeper v3).*\n\n${
        subPins.length > 0
          ? `**Sub-Map Portals Available:** ${subPins.map((s) => `@${s.name}`).join(', ')}\n\nDive into any sub-map portal below to inspect district and street-level interiors.`
          : 'Local guilds, couriers, and covenant wards maintain active telemetry across this sector via the Ley-Lattice.'
      }`,
      source: 'canonical_fallback',
    };

    if (!LEGENDKEEPER_API_KEY) {
      return new Response(JSON.stringify(fallbackDossier), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 3. SEARCH & RESOURCE PROXY (Always falls back to 200 canonical results on error)
  const q = url.searchParams.get('q') || '';
  const buildFallbackSearch = (queryStr: string) => {
    const lower = queryStr.toLowerCase().trim();
    const matches = lower
      ? CANONICAL_FALLBACK_PINS.filter(
          (p) => p.name.toLowerCase().includes(lower) || p.resourceId?.toLowerCase().includes(lower)
        )
      : CANONICAL_FALLBACK_PINS;
    const list = matches.length > 0 ? matches : CANONICAL_FALLBACK_PINS.slice(0, 8);
    return new Response(
      JSON.stringify({
        data: list.map((m) => ({
          resource: {
            id: m.resourceId || m.id,
            name: m.name,
            tags: [m.tier, `Tier ${m.tierLevel || 2}`],
            hasSubMap: m.hasSubMap,
          },
          document: {
            id: `doc-${m.resourceId || m.id}`,
            name: m.name,
            highlights: [
              {
                segment: `${m.name} (${m.tier.toUpperCase()}) — Lat ${m.lat.toFixed(1)}°, Lng ${m.lng.toFixed(1)}°`,
              },
            ],
          },
        })),
        source: 'fallback_canonical',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  if (!LEGENDKEEPER_API_KEY) {
    return buildFallbackSearch(q);
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
    if (!projectId) {
      return buildFallbackSearch(q);
    }

    const resourceId = url.searchParams.get('resource_id');
    const docId = url.searchParams.get('doc_id');

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
    if (!response.ok) {
      return buildFallbackSearch(q || resourceId || '');
    }
    const rawText = await response.text();

    return new Response(rawText, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' },
    });
  } catch {
    return buildFallbackSearch(q);
  }
};
