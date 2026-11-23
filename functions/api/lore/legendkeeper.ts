interface Env {
  LEGENDKEEPER_API_KEY?: string;
  LK_API_KEY?: string;
  LEGENDKEEPER_PROJECT_ID?: string;
  LK_ROOT_MAP_ID?: string;
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
  const slug = (parentPin.resourceId || '').toLowerCase();
  const box = CONTINENT_BOUNDING_BOXES[slug];
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

function buildCredentialsRequiredResponse(reason: string, httpStatus = 200): Response {
  return new Response(
    JSON.stringify({
      data: [],
      status: 'CREDENTIALS_REQUIRED',
      diagnostic: '[LK BRIDGE: CREDENTIALS REQUIRED]',
      error: reason,
    }),
    {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    }
  );
}

/**
 * Recursively crawls a LegendKeeper v3 resource's `kind: "map"` document tab across arbitrary zoom depths:
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
      isCapital: depth <= 2,
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
  const apiKey = (context.env.LEGENDKEEPER_API_KEY || context.env.LK_API_KEY || '').trim();
  const { LEGENDKEEPER_PROJECT_ID, LK_ROOT_MAP_ID, LORE_CACHE } = context.env;
  const url = new URL(context.request.url);

  if (!apiKey) {
    return buildCredentialsRequiredResponse(
      'LEGENDKEEPER_API_KEY (or LK_API_KEY) is not configured in Cloudflare Worker environment secrets.'
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  // Resolve project ID from live LegendKeeper v3 API
  let projectId: string | undefined;
  try {
    const projRes = await fetch('https://www.legendkeeper.com/api/v3/projects', { headers });
    if (projRes.status === 401 || projRes.status === 403) {
      return buildCredentialsRequiredResponse(
        `LegendKeeper API rejected bearer token (HTTP ${projRes.status}).`
      );
    }
    if (projRes.ok) {
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : projData.data || [];
      projectId = projects[0]?.id;
    }
  } catch (err: any) {
    return buildCredentialsRequiredResponse(
      `LegendKeeper v3 endpoint unreachable: ${err?.message || 'network failure'}.`
    );
  }

  if (!projectId && LEGENDKEEPER_PROJECT_ID) {
    projectId = LEGENDKEEPER_PROJECT_ID.split('/').pop();
  }
  if (!projectId) {
    return buildCredentialsRequiredResponse('Could not resolve LegendKeeper Project ID.');
  }

  const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;

  // 1. RECURSIVE MULTI-TIER MAP CRAWLER (?pins=1 or /maptree)
  if (url.searchParams.has('pins') || url.pathname.endsWith('/pins') || url.pathname.endsWith('/maptree')) {
    const cacheKey = `lk_live_pins_v3_${projectId}`;
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

    try {
      const resList = await fetch(`${baseUrl}/resources?limit=100`, { headers });
      if (resList.status === 401 || resList.status === 403) {
        return buildCredentialsRequiredResponse(`Unauthorized reading project resources (HTTP ${resList.status}).`);
      }
      if (!resList.ok) {
        return buildCredentialsRequiredResponse(`Failed to list LegendKeeper resources (HTTP ${resList.status}).`);
      }
      const resData: any = await resList.json();
      const allResources = resData.data || [];

      const konranRes =
        (LK_ROOT_MAP_ID && allResources.find((r: any) => r.id === LK_ROOT_MAP_ID)) ||
        allResources.find(
          (r: any) =>
            r.name?.toLowerCase().includes('konran') && r.documents?.some((d: any) => d.kind === 'map')
        ) ||
        allResources.find((r: any) => r.documents?.some((d: any) => d.kind === 'map'));

      if (!konranRes) {
        return buildCredentialsRequiredResponse(
          'Root Konran map resource (with kind="map" document tab) not found in LegendKeeper project.'
        );
      }

      const mapDoc = konranRes.documents.find((d: any) => d.kind === 'map');
      if (!mapDoc) {
        return buildCredentialsRequiredResponse('Root Konran resource does not contain a kind="map" tab.');
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

      const payload = JSON.stringify({
        data: crawledPins,
        status: 'LIVE',
        source: 'legendkeeper_v3_live',
        rootResourceId: konranRes.id,
      });

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
    } catch (err: any) {
      return buildCredentialsRequiredResponse(
        `LegendKeeper map crawl failed: ${err?.message || 'unknown error'}`
      );
    }
  }

  // 2. LIVE SEARCH & RESOURCE PROXY
  try {
    const q = url.searchParams.get('q');
    const resourceId = url.searchParams.get('resource_id') || url.searchParams.get('article_id');
    const docId = url.searchParams.get('doc_id');

    let targetUrl = `${baseUrl}/resources?limit=50`;
    if (q) {
      targetUrl = `${baseUrl}/search?q=${encodeURIComponent(q)}&limit=25`;
    } else if (resourceId && docId) {
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}/docs/${encodeURIComponent(docId)}/blocks`;
    } else if (resourceId) {
      targetUrl = `${baseUrl}/resources/${encodeURIComponent(resourceId)}`;
    }

    const response = await fetch(targetUrl, { headers });
    if (response.status === 401 || response.status === 403) {
      return buildCredentialsRequiredResponse(`LegendKeeper auth rejected (HTTP ${response.status}).`);
    }
    if (!response.ok) {
      return buildCredentialsRequiredResponse(`LegendKeeper API returned HTTP ${response.status}.`);
    }
    const rawText = await response.text();

    return new Response(rawText, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' },
    });
  } catch (err: any) {
    return buildCredentialsRequiredResponse(err?.message || 'Failed to reach LegendKeeper API.');
  }
};
