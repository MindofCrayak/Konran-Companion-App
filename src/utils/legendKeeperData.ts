import { GlobePin } from '../types/slabletOS';

/**
 * Continent Geographic Bounding Boxes on Planet Konran
 * Maps each continent resource to its spherical [minLat, maxLat, minLng, maxLng]
 * to project nested child-map pins (e.g. Crafton Cove) into global Konran 3D space.
 */
export const CONTINENT_BOUNDING_BOXES: Record<
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

/**
 * Canonical Two-Pass LegendKeeper Pins for Planet Konran
 * Includes Top-Level Provinces and Nested Regional Cities/Landmarks
 */
export const CANONICAL_GLOBE_PINS: GlobePin[] = [
  // --- TIER 1: CONTINENTS & PROVINCES (hasSubMap: true) ---
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

  // --- TIER 2 & 3: CITIES & SETTLEMENTS (Nested Inside Continents) ---
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

  // --- TIER 4+: STREET VIEW / DISTRICTS & BUILDING INTERIORS ---
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

export interface LoreArticleDossier {
  id: string;
  resourceId: string;
  name: string;
  tier: string;
  tierLevel: number;
  summary: string;
  markdown: string;
  mentions: { id: string; label: string }[];
  hasSubMap: boolean;
  subMapChildren: { id: string; name: string; tier: string }[];
  bannerStyle?: string;
}

export const CANONICAL_LORE_ARTICLES: Record<string, LoreArticleDossier> = {
  'kray-providence': {
    id: 'kray-providence',
    resourceId: 'kray-providence',
    name: 'Kray Providence (Continent & Maritime Dominion)',
    tier: 'Tier 2 // Continent Map',
    tierLevel: 2,
    summary: 'Rugged maritime continent of deep fjords, emerald cliffs, and clockwork harbors under the vigilant gaze of Krayvuk and Kayzoku.',
    markdown: `### Kray Providence // Planetary Sector II\n\nKray Providence spans the north-eastern hemisphere of **Konran**, famed for its sheltered smuggling coves, storm-carved cliffs, and deep-water shipyards.\n\n* **Primary Ports:** @Crafton Cove, @Creston Cove, and @Skreeton Harbor.\n* **Liturgical Resonance:** Strong devotion to **Krayvuk** (All-Seeing) and **Kayzoku** (Chance & Chains).\n* **Sub-Map Telemetry:** Dive into the regional map below to inspect harbor districts and street-level safe houses.`,
    mentions: [
      { id: 'crafton-cove', label: '@Crafton Cove' },
      { id: 'creston-cove', label: '@Creston Cove' },
      { id: 'skreeton-harbor', label: '@Skreeton Harbor' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'crafton-cove', name: 'Crafton Cove (City Map)', tier: 'Tier 3 // City' },
      { id: 'creston-cove', name: 'Creston Cove', tier: 'Tier 3 // City' },
      { id: 'skreeton-harbor', name: 'Skreeton Harbor', tier: 'Tier 3 // City' },
    ],
  },
  'crafton-cove': {
    id: 'crafton-cove',
    resourceId: 'crafton-cove',
    name: 'Crafton Cove (Free Port & Smuggler Anchorage)',
    tier: 'Tier 3 // City Map',
    tierLevel: 3,
    summary: 'Lantern-lit cliffside port in Kray Providence where Lyricia courier sloops and privateers trade beneath basalt sea-arches.',
    markdown: `### Crafton Cove // Kray Providence\n\nCarved into tiered basalt sea-caverns along the eastern shelf of @Kray Providence, **Crafton Cove** operates as both a legitimate merchant anchorage and a covert neutral ground for Fated operatives.\n\n* **Notable Interior / Street View:** @The Mydnight Rendezvous — velvet-draped tavern and dead-drop exchange suspended on iron chains above the tide pool.\n* **Tidal Hazard:** During **Lyra (Olysphere)** Spring Tides, the lower smuggling locks flood completely.`,
    mentions: [
      { id: 'kray-providence', label: '@Kray Providence' },
      { id: 'the-mydnight-rendezvous', label: '@The Mydnight Rendezvous' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'the-mydnight-rendezvous', name: 'The Mydnight Rendezvous (Street / Interior)', tier: 'Tier 4 // Building Interior' },
    ],
  },
  'the-mydnight-rendezvous': {
    id: 'the-mydnight-rendezvous',
    resourceId: 'the-mydnight-rendezvous',
    name: 'The Mydnight Rendezvous (Tavern & Whisper Exchange)',
    tier: 'Tier 4 // Building Interior (Street View)',
    tierLevel: 4,
    summary: 'Iconic cliff-chain tavern in Crafton Cove where School of Shadows brokers and Lyricia couriers trade encrypted slablet shards.',
    markdown: `### The Mydnight Rendezvous // Crafton Cove Interior\n\nSuspended over the surging surf of @Crafton Cove by four anchor-chains forged in Synthelavor, **The Mydnight Rendezvous** is illuminated by violet Ayanath phosphor lamps.\n\n* **Proprietor:** Madame Vespera (rumored Prestige 3 initiate of the *School of Shadows*).\n* **House Rules:** No unsheathed steel past the brass threshold; blood debts and courier escrow contracts are settled at Booth IX.\n* **Connected Links:** Return to @Crafton Cove or @Kray Providence.`,
    mentions: [
      { id: 'crafton-cove', label: '@Crafton Cove' },
      { id: 'kray-providence', label: '@Kray Providence' },
    ],
    hasSubMap: false,
    subMapChildren: [],
  },
  'olyvia': {
    id: 'olyvia',
    resourceId: 'olyvia',
    name: 'Olyvia (The Golden Basin)',
    tier: 'Tier 2 // Continent Map',
    tierLevel: 2,
    summary: 'Mercantile heartland of Konran governed by Lyricia mints, terraced crystal canals, and the towering exchanges of Padd City.',
    markdown: `### Olyvia // The Golden Basin\n\nBlessed by **Lyricia**, **Olyvia** is the commercial and banking nerve center of Planet Konran.\n\n* **Major Settlements:** @Padd City and @Crescent Moon Harbor.\n* **Currency Standard:** Gold Crowns (gc), Silver Shillings (ss), and Brass Pence (bp) are minted under the Grand Balance Audit.`,
    mentions: [
      { id: 'padd-city', label: '@Padd City' },
      { id: 'crescent-moon-harbor', label: '@Crescent Moon Harbor' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'padd-city', name: 'Padd City (Metropolis Map)', tier: 'Tier 3 // City' },
      { id: 'crescent-moon-harbor', name: 'Crescent Moon Harbor', tier: 'Tier 3 // City' },
    ],
  },
  'padd-city': {
    id: 'padd-city',
    resourceId: 'padd-city',
    name: 'Padd City (Grand Mercantile Metropolis)',
    tier: 'Tier 3 // City Map',
    tierLevel: 3,
    summary: 'Sprawling canal-crossed metropolis housing the Gilded Ledger Courier Exchange and the central Lyricia Mint.',
    markdown: `### Padd City // Olyvia Capital\n\nRising from the lotus-lined estuary of @Olyvia, **Padd City** never sleeps across either 18-hour Pass.\n\n* **Key Interior:** @Gilded Ledger Courier Exchange — hub for verified cross-campaign item escrow.\n* **Civic Standing:** High Prestige with Lyricia unlocks discounted trans-continental teleportation waybills.`,
    mentions: [
      { id: 'olyvia', label: '@Olyvia' },
      { id: 'gilded-ledger-exchange', label: '@Gilded Ledger Courier Exchange' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'gilded-ledger-exchange', name: 'Gilded Ledger Courier Exchange', tier: 'Tier 4 // Building Interior' },
    ],
  },
  'oray-core': {
    id: 'oray-core',
    resourceId: 'oray-core',
    name: 'Oray Core Domain',
    tier: 'Tier 2 // Continent Map',
    tierLevel: 2,
    summary: 'Arcane highland continent crowned by Imperial Vantya, K.A.M.P. Academy Citadel, and the Sunfire Chrysoberyl Observatory.',
    markdown: `### Oray Core Domain // Arcane Highlands\n\nBathed in raw sapphire ley-currents, **Oray Core** anchors the academic and imperial institutions of Konran.\n\n* **Capitals & Citadels:** @Vantya (Imperial Capital), @K.A.M.P. Academy Citadel, and @Sunfire Chrysoberyl Observatory.`,
    mentions: [
      { id: 'vantya', label: '@Vantya (Imperial Capital)' },
      { id: 'kamp-citadel', label: '@K.A.M.P. Academy Citadel' },
      { id: 'sunfire-observatory', label: '@Sunfire Chrysoberyl Observatory' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'vantya', name: 'Vantya (Imperial Capital)', tier: 'Tier 3 // City' },
      { id: 'kamp-citadel', name: 'K.A.M.P. Academy Citadel', tier: 'Tier 3 // City' },
      { id: 'sunfire-observatory', name: 'Sunfire Chrysoberyl Observatory', tier: 'Tier 3 // Landmark' },
    ],
  },
  'vantya': {
    id: 'vantya',
    resourceId: 'vantya',
    name: 'Vantya (Imperial Capital)',
    tier: 'Tier 3 // City Map',
    tierLevel: 3,
    summary: 'Sapphire-spired capital of Oray Core where dragon-wardens and high exarchs convene.',
    markdown: `### Vantya // Imperial Capital of Oray Core\n\nRinged by floating ley-conductors, **Vantya** is the seat of the High Exarchs of Oray and the @Wyrmfire High Chancery.`,
    mentions: [
      { id: 'oray-core', label: '@Oray Core Domain' },
      { id: 'wyrmfire-chancery', label: '@Wyrmfire High Chancery' },
    ],
    hasSubMap: true,
    subMapChildren: [
      { id: 'wyrmfire-chancery', name: 'Wyrmfire High Chancery', tier: 'Tier 4 // Building Interior' },
    ],
  },
  'kamp-citadel': {
    id: 'kamp-citadel',
    resourceId: 'kamp-citadel',
    name: 'K.A.M.P. Academy Citadel',
    tier: 'Tier 3 // City & Campus Map',
    tierLevel: 3,
    summary: 'Konran Academy of Might & Proficiency — home to the four canonical houses: Hydra, Gryffon, Spynx, and Unycorn.',
    markdown: `### K.A.M.P. Academy Citadel // Oray Core\n\nThe premier academy of adventuring, magitech engineering, and arcane mastery on Planet Konran.\n\n* **The Four Canonical Houses:** **Hydra** (Magic & Psionics), **Gryffon** (Martial Vigilance), **Spynx** (Magitech & Discovery), and **Unycorn** (Arts & Diplomacy).`,
    mentions: [
      { id: 'oray-core', label: '@Oray Core Domain' },
    ],
    hasSubMap: true,
    subMapChildren: [],
  },
};

export function resolveCanonicalLoreArticle(queryOrId: string): LoreArticleDossier {
  const key = queryOrId.toLowerCase().trim().replace(/^@/, '').replace(/\s+/g, '-');
  if (CANONICAL_LORE_ARTICLES[key]) {
    return CANONICAL_LORE_ARTICLES[key];
  }
  const byName = Object.values(CANONICAL_LORE_ARTICLES).find(
    (a) => a.name.toLowerCase().includes(queryOrId.toLowerCase().trim()) || a.id.includes(key)
  );
  if (byName) return byName;

  const pin = CANONICAL_GLOBE_PINS.find(
    (p) =>
      p.resourceId?.toLowerCase() === key ||
      p.id.toLowerCase() === key ||
      p.name.toLowerCase().includes(queryOrId.toLowerCase().trim())
  );
  const children = pin
    ? CANONICAL_GLOBE_PINS.filter((c) => c.parentId === pin.id || c.parentResourceId === pin.resourceId)
    : [];

  return {
    id: pin?.resourceId || key || 'konran-archive',
    resourceId: pin?.resourceId || key || 'konran-archive',
    name: pin?.name || queryOrId || 'Konran Planetary Dossier',
    tier: pin ? `Tier ${pin.tierLevel || 2} // ${pin.tier.toUpperCase()}` : 'Tier 1 // Planetary Archive',
    tierLevel: pin?.tierLevel || 1,
    summary: `Canonical LegendKeeper archival record for ${pin?.name || queryOrId}.`,
    markdown: `### ${pin?.name || queryOrId}\n\n*Synchronized from the Konran Planetary Lore Engine (LegendKeeper v3).* \n\nCoordinates: \`${pin ? `${pin.lat.toFixed(1)}° N, ${pin.lng.toFixed(1)}° E` : 'Planetary Meridian'}\`\n\nThis location resonates with the ley-lattice of Planet Konran. Use the @page mentions and sub-map portals below to traverse deeper into local districts or return to the parent province.`,
    mentions: [
      { id: 'kray-providence', label: '@Kray Providence' },
      { id: 'crafton-cove', label: '@Crafton Cove' },
      { id: 'the-mydnight-rendezvous', label: '@The Mydnight Rendezvous' },
      { id: 'vantya', label: '@Vantya' },
    ],
    hasSubMap: Boolean(pin?.hasSubMap || children.length > 0),
    subMapChildren: children.map((c) => ({
      id: c.resourceId || c.id,
      name: c.name,
      tier: `Tier ${c.tierLevel || 3} // ${c.tier}`,
    })),
  };
}
