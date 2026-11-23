interface Env {
  LEGENDKEEPER_API_KEY?: string;
  LEGENDKEEPER_PROJECT_ID?: string;
}

// Canonical Fallback Pins when API key is missing or LK offline
const CANONICAL_FALLBACK_PINS = [
  {
    id: 'pin-kray-providence',
    name: 'Kray Providence',
    tier: 'province',
    resourceId: 'kray-providence',
    lat: 42.5,
    lng: 78.2,
    pos: [0.65, 0.35],
    iconGlyph: 'Mountain',
    iconColor: '#22c55e',
    articleUrl: 'https://app.legendkeeper.com/a/kray-providence',
    isCapital: false,
  },
  {
    id: 'pin-olyvia',
    name: 'Olyvia (Golden Basin)',
    tier: 'province',
    resourceId: 'olyvia',
    lat: -18.2,
    lng: 48.0,
    pos: [0.55, 0.62],
    iconGlyph: 'Landmark',
    iconColor: '#eab308',
    articleUrl: 'https://app.legendkeeper.com/a/olyvia',
    isCapital: false,
  },
  {
    id: 'pin-oray-core',
    name: 'Oray Core Domain',
    tier: 'province',
    resourceId: 'oray-core',
    lat: 38.0,
    lng: -75.4,
    pos: [0.22, 0.38],
    iconGlyph: 'Shield',
    iconColor: '#60a5fa',
    articleUrl: 'https://app.legendkeeper.com/a/oray-core',
    isCapital: false,
  },
  {
    id: 'pin-ousava-marches',
    name: 'Ousava Marches',
    tier: 'province',
    resourceId: 'ousava-marches',
    lat: -36.5,
    lng: -82.0,
    pos: [0.20, 0.72],
    iconGlyph: 'TreePine',
    iconColor: '#a855f7',
    articleUrl: 'https://app.legendkeeper.com/a/ousava-marches',
    isCapital: false,
  },
  {
    id: 'pin-celeste-reaches',
    name: 'Celeste Reaches',
    tier: 'province',
    resourceId: 'celeste-reaches',
    lat: 5.0,
    lng: 152.0,
    pos: [0.88, 0.48],
    iconGlyph: 'Sparkles',
    iconColor: '#06b6d4',
    articleUrl: 'https://app.legendkeeper.com/a/celeste-reaches',
    isCapital: false,
  },
  {
    id: 'pin-slavyna-bastion',
    name: 'Slavyna Bastion',
    tier: 'province',
    resourceId: 'slavyna-bastion',
    lat: 62.0,
    lng: 5.0,
    pos: [0.45, 0.22],
    iconGlyph: 'Flame',
    iconColor: '#ef4444',
    articleUrl: 'https://app.legendkeeper.com/a/slavyna-bastion',
    isCapital: false,
  },
  // Tier 2 Child-Map Pins
  {
    id: 'pin-crafton-cove',
    name: 'Crafton Cove',
    tier: 'city',
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
  },
  {
    id: 'pin-creston-cove',
    name: 'Creston Cove',
    tier: 'city',
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
  },
  {
    id: 'pin-skreeton-harbor',
    name: 'Skreeton Harbor',
    tier: 'city',
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
  },
  {
    id: 'pin-padd-city',
    name: 'Padd City',
    tier: 'city',
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
  },
  {
    id: 'pin-crescent-moon-harbor',
    name: 'Crescent Moon Harbor',
    tier: 'city',
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
  },
  {
    id: 'pin-vantya',
    name: 'Vantya (Imperial Capital)',
    tier: 'city',
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
  },
  {
    id: 'pin-kamp-academy',
    name: 'K.A.M.P. Academy Citadel',
    tier: 'city',
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
  },
  {
    id: 'pin-sunfire-observatory',
    name: 'Sunfire Chrysoberyl Observatory',
    tier: 'landmark',
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
  },
  {
    id: 'pin-titans-trench',
    name: "Titan's Trench",
    tier: 'landmark',
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
  },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { LEGENDKEEPER_API_KEY, LEGENDKEEPER_PROJECT_ID } = context.env;
  const url = new URL(context.request.url);

  // 1. PIN CRAWLER ENDPOINT (?pins=1)
  if (url.searchParams.has('pins') || url.pathname.endsWith('/pins')) {
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
      // Resolve project ID
      const projRes = await fetch('https://www.legendkeeper.com/api/v3/projects', { headers });
      if (!projRes.ok) throw new Error('LK /projects unreachable');
      const projData: any = await projRes.json();
      const projects = Array.isArray(projData) ? projData : (projData.data || []);
      const projectId = projects[0]?.id || LEGENDKEEPER_PROJECT_ID;

      if (!projectId) throw new Error('No project ID');

      const baseUrl = `https://www.legendkeeper.com/api/v3/projects/${projectId}`;

      // List resources to find the Konran world map
      const resList = await fetch(`${baseUrl}/resources?limit=100`, { headers });
      if (!resList.ok) throw new Error('Failed to list resources');
      const resData: any = await resList.json();
      const allResources = resData.data || [];

      const konranRes = allResources.find((r: any) =>
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

      // PASS 1: Fetch Top-Level Pins on Konran World Map
      const featuresRes = await fetch(`${baseUrl}/resources/${konranRes.id}/docs/${mapDoc.id}/features`, { headers });
      const featuresData: any = featuresRes.ok ? await featuresRes.json() : { data: [] };
      const rawPins = (featuresData.data || []).filter((f: any) => f.type === 'pin' || f.geometry?.type === 'Point');

      const mergedPins: any[] = [];

      for (const p of rawPins) {
        const rawCoords = p.geometry?.coordinates || p.position || [0.5, 0.5];
        const linkedUri = p.uri || p.properties?.uri || '';
        const match = linkedUri.match(/lk:\/\/resources\/([^/]+)/);
        const childResourceId = match ? match[1] : undefined;

        const provincePin = {
          id: p.id || `pin-${p.name?.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.name || p.properties?.name || 'Unnamed Province',
          tier: 'province',
          resourceId: childResourceId,
          pos: rawCoords,
          lat: (0.5 - rawCoords[1]) * 180,
          lng: (rawCoords[0] - 0.5) * 360,
          iconGlyph: p.properties?.icon || 'Mountain',
          iconColor: p.properties?.color || '#22c55e',
          articleUrl: childResourceId ? `https://app.legendkeeper.com/a/${childResourceId}` : undefined,
          isCapital: false,
        };
        mergedPins.push(provincePin);

        // PASS 2: If province has a linked resource, inspect for child map tab (e.g. Kray Providence -> Crafton Cove)
        if (childResourceId) {
          try {
            const childRes = await fetch(`${baseUrl}/resources/${childResourceId}`, { headers });
            if (childRes.ok) {
              const childObj: any = await childRes.json();
              const childMapDoc = (childObj.documents || []).find((d: any) => d.kind === 'map');
              if (childMapDoc) {
                const subFeatures = await fetch(`${baseUrl}/resources/${childResourceId}/docs/${childMapDoc.id}/features`, { headers });
                if (subFeatures.ok) {
                  const subData: any = await subFeatures.json();
                  const subPins = (subData.data || []).filter((f: any) => f.type === 'pin' || f.geometry?.type === 'Point');
                  for (const sp of subPins) {
                    const sc = sp.geometry?.coordinates || sp.position || [0.5, 0.5];
                    mergedPins.push({
                      id: sp.id || `pin-${sp.name?.toLowerCase().replace(/\s+/g, '-')}`,
                      name: sp.name || sp.properties?.name || 'Regional City',
                      tier: 'city',
                      parentId: provincePin.id,
                      parentResourceId: childResourceId,
                      resourceId: sp.properties?.resourceId,
                      pos: sc,
                      lat: provincePin.lat + (sc[1] - 0.5) * 15,
                      lng: provincePin.lng + (sc[0] - 0.5) * 20,
                      iconGlyph: sp.properties?.icon || 'Anchor',
                      iconColor: sp.properties?.color || '#38bdf8',
                      articleUrl: sp.properties?.resourceId ? `https://app.legendkeeper.com/a/${sp.properties.resourceId}` : undefined,
                      isCapital: ['crafton cove', 'creston cove', 'padd city', 'vantya', 'skreeton harbor'].includes(sp.name?.toLowerCase()),
                    });
                  }
                }
              }
            }
          } catch {
            // continue
          }
        }
      }

      // If LK returned no pins, seamlessly merge with canonical pins
      const finalPins = mergedPins.length > 0 ? mergedPins : CANONICAL_FALLBACK_PINS;
      return new Response(JSON.stringify({ data: finalPins, source: 'legendkeeper_v3_live' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    } catch {
      return new Response(JSON.stringify({ data: CANONICAL_FALLBACK_PINS, source: 'fallback_error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. ARTICLE READER ENDPOINT (?article_id=<id>)
  const articleId = url.searchParams.get('article_id') || url.searchParams.get('resource_id');
  if (articleId && url.searchParams.has('view')) {
    if (!LEGENDKEEPER_API_KEY) {
      return new Response(
        JSON.stringify({
          id: articleId,
          title: articleId.replace(/-/g, ' ').toUpperCase(),
          content: `### Lore Dossier // ${articleId.replace(/-/g, ' ').toUpperCase()}\n\n*Archival record retrieved from the Konran planetary ledger.*\n\nThis province/city holds significant historical, geographical, and covenant resonance in the current liturgical pass. Local guilds and clergy maintain active communication via the Ley-Lattice network.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. STANDARD SEARCH / RESOURCE PROXY
  if (!LEGENDKEEPER_API_KEY) {
    const q = url.searchParams.get('q');
    if (q) {
      const lower = q.toLowerCase();
      const matches = CANONICAL_FALLBACK_PINS.filter((p) =>
        p.name.toLowerCase().includes(lower) || p.resourceId?.toLowerCase().includes(lower)
      );
      return new Response(
        JSON.stringify({
          data: matches.map((m) => ({
            resource: { id: m.resourceId, name: m.name, tags: [m.tier] },
            document: { id: `doc-${m.resourceId}`, name: m.name },
          })),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'LEGENDKEEPER_API_KEY is not set in Cloudflare secrets.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
      return new Response(JSON.stringify({ error: 'Could not resolve project ID' }), { status: 404 });
    }

    const q = url.searchParams.get('q');
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
    const rawText = await response.text();

    return new Response(rawText, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to reach LegendKeeper API' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
