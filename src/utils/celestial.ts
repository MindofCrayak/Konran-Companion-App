/**
 * KONRAN GRAND CELESTIAL & LITURGICAL CALENDAR ENGINE
 * 
 * Canonical Setting:
 * - Planetary Diurnal Day: 36 Konran hours (scaled 1.5 from Earth's 24 hours).
 * - Master Dial Chapter Ring: 18-hour dial (Pass I: Daywatch, Pass II: Nightwatch).
 * - Year: 243 Konran solar days (9 months of 27 days each).
 * - Week: 9 liturgical days named for The Nyne.
 * - Divine Planes: 9 outer realms with sidereal rotation and Voyd Rete aspects.
 * - Lunar Cycles: 
 *     * Lyra (Olysphere / Gold Sentinel): 28.0-day tidal cycle
 *     * Eyenath (Ayanath / Violet Watchtower): 60.0-day retrograde ward cycle
 * - Lyra Tidal Regulator: Spring, Neap, Flood, Slack
 * - Dracontic Syzygy & Eclipse Mechanics
 */

export interface KonranMonth {
  index: number; // 0 to 8
  name: string;
  patronGod: string;
  virtue: string;
  gemstone: string;
  color: string;
}

export interface LiturgicalDay {
  index: number; // 0 to 8
  name: string;
  god: string;
  domain: string;
  color: string;
  stepAngle: number; // 0 to 320 in 40° steps
}

export interface DivinePlane {
  index: number;
  name: string;
  deity: string;
  planeType: string;
  themeColor: string;
  baseAngle: number; // 0 to 320 in 40° steps
  currentSiderealAngle: number;
}

export type TidalState = 'Spring' | 'Neap' | 'Flood' | 'Slack';

export interface LunarBodyState {
  name: string;
  orbitalPeriodDays: number;
  progress: number; // 0 to 1
  orbitalAngle: number; // 0 to 360 deg
  elongation: number; // angle from sun
  phaseName: string;
  phaseSprite: string;
  phaseIndex: number; // 0: New, 1: Crescent, 2: Half, 3: Gibbous, 4: Full
  isWaxing: boolean;
  reticleAngle: number;
}

export interface KonranGrandState {
  timestamp: number; // ms
  totalKonranSeconds: number;
  totalKonranDays: number;

  // Epoch & Year
  epoch: string; // 'AGE V // YR 118'
  age: number; // 5
  year: number; // 118
  yearProgress: number; // 0 to 1
  dayOfYear: number; // 1 to 243

  // Month & Day
  month: KonranMonth;
  monthProgress: number; // 0 to 1
  dayOfMonth: number; // 1 to 27
  retrogradeDayAngle: number; // fan angle across gauge

  // Diurnal Day Time (36-hour)
  daySeconds: number; // 0 to 129,599
  hour: number; // 0 to 35
  minute: number; // 0 to 59
  second: number; // 0 to 59
  fractionalSecond: number;
  timeString: string; // 'HH:MM:SS'
  isNightwatch: boolean;
  passName: 'DAYWATCH (PASS I)' | 'NIGHTWATCH (PASS II)';
  passHour: number; // 0 to 17

  // Hand Angles (true center arbor)
  hourAngle: number; // 0 to 360 (20° per hour on 18h dial)
  minuteAngle: number; // 0 to 360 (6° per min)
  secondAngle: number; // 0 to 360 (6° per sec)
  solarDiurnalAngle: number; // 0 to 360 (diurnal sun rotation)

  // Liturgical Week & Feasts
  liturgicalDay: LiturgicalDay;
  sanctoraleFeast: string;
  sanctoraleObservance: string;

  // Concentric Sub-Dial Rotations
  monthRingAngle: number; // outer sub-ring
  siderealVoydReteAngle: number; // middle sub-ring
  dayRingAngle: number; // inner sub-ring (steps 40° each day)
  divinePlanes: DivinePlane[];

  // Moons
  lyra: LunarBodyState; // 28-day cycle
  eyenath: LunarBodyState; // 60-day cycle

  // Tidal Regulator
  tidalState: TidalState;
  tidalCoefficient: number; // 0 to 100%
  tidalDescription: string;

  // Dracontic Syzygy & Eclipse
  draconticAngle: number; // 0 to 360
  syzygyAngle: number; // Sun-Moon-Earth syzygy angle
  syzygyPhase: 'Conjunction (New Moon)' | 'Opposition (Full Moon)' | 'Quadrature' | 'Intermediate';
  nodeName: 'Caput Draconis (Ascending Node)' | 'Cauda Draconis (Descending Node)';
  isEclipseImminent: boolean;
  eclipseProximity: number; // 0 (far) to 1 (exact alignment)
  eclipseType: 'Solar Total' | 'Solar Annular' | 'Lunar Blood' | 'Penumbra' | 'None';
}

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

export const KONRAN_HOURS_PER_DAY = 36;
export const KONRAN_DAY_SECONDS = KONRAN_HOURS_PER_DAY * 3600; // 129,600 sec
export const KONRAN_DAYS_PER_YEAR = 243;
export const KONRAN_DAYS_PER_MONTH = 27;
export const KONRAN_MONTHS_COUNT = 9;
export const KONRAN_HOURS_PER_PASS = 18;

// Scaled 1.5 from Earth: 1 Konran Day = 1.5 Earth Days (36h = 1.5 * 24h)
export const EARTH_TO_KONRAN_DAY_RATIO = 1.5;

export const KONRAN_MONTHS: KonranMonth[] = [
  { index: 0, name: "Lyricia's Ledger", patronGod: 'Lyricia', virtue: 'Enlightenment & Truth', gemstone: 'Phosphor Sapphire', color: '#ea32ca' },
  { index: 1, name: "Oray's Scale", patronGod: 'Oray', virtue: 'Choice & Arcane Will', gemstone: 'Argentite Silver', color: '#c0c0c0' },
  { index: 2, name: "Ousava's Bloom", patronGod: 'Ousava', virtue: 'Life & Compassion', gemstone: 'Verdant Beryl', color: '#10b981' },
  { index: 3, name: "Ay's Equinox", patronGod: 'Ay', virtue: 'Equilibrium & Time', gemstone: 'Chronosphere Quartz', color: '#38bdf8' },
  { index: 4, name: "Kayzoku's Tempest", patronGod: 'Kayzoku', virtue: 'Liberty & Fortune', gemstone: 'Storm Aquamarine', color: '#06b6d4' },
  { index: 5, name: "Celeste's Horizon", patronGod: 'Celeste', virtue: 'Dreams & Radiance', gemstone: 'Starlight Diamond', color: '#f59e0b' },
  { index: 6, name: "Psyon's Labyrinth", patronGod: 'Psyon', virtue: 'Mind & Discord', gemstone: 'Violet Amethyst', color: '#a855f7' },
  { index: 7, name: "Krayvuk's Eclipse", patronGod: 'Krayvuk', virtue: 'Entropy & Secrets', gemstone: 'Obsidian Jet', color: '#64748b' },
  { index: 8, name: "Slavyna's Decree", patronGod: 'Slavyna', virtue: 'Covenants & Law', gemstone: 'Imperial Ruby', color: '#ef4444' }
];

export const NYNE_LITURGICAL_DAYS: LiturgicalDay[] = [
  { index: 0, name: 'Lyridi', god: 'Lyricia', domain: 'Industry, Ledger & Mints', color: '#ea32ca', stepAngle: 0 },
  { index: 1, name: 'Oraydi', god: 'Oray', domain: 'Arcane Mastery & Dragons', color: '#c0c0c0', stepAngle: 40 },
  { index: 2, name: 'Savadi', god: 'Ousava', domain: 'Flora, Healing & Harvest', color: '#10b981', stepAngle: 80 },
  { index: 3, name: 'Aydi', god: 'Ay', domain: 'Temporal Stasis & Balance', color: '#38bdf8', stepAngle: 120 },
  { index: 4, name: 'Kaydi', god: 'Kayzoku', domain: 'Oceanic Currents & Gales', color: '#06b6d4', stepAngle: 160 },
  { index: 5, name: 'Celestdi', god: 'Celeste', domain: 'Starsong & Dawn Flight', color: '#f59e0b', stepAngle: 200 },
  { index: 6, name: 'Psyondi', god: 'Psyon', domain: 'Mental Resonance & Paradox', color: '#a855f7', stepAngle: 240 },
  { index: 7, name: 'Kraydi', god: 'Krayvuk', domain: 'Shadow Vigil & Crypts', color: '#64748b', stepAngle: 280 },
  { index: 8, name: 'Slavydi', god: 'Slavyna', domain: 'Blood Oaths & Iron Laws', color: '#ef4444', stepAngle: 320 }
];

export const DIVINE_PLANES_DEF = [
  { index: 0, name: 'Lona Uyn', deity: 'Lyricia', planeType: 'Crystal Floating Spires', themeColor: '#ea32ca', baseAngle: 0 },
  { index: 1, name: 'Yngolcina', deity: 'Oray', planeType: 'Obsidian Magma Calderas', themeColor: '#c0c0c0', baseAngle: 40 },
  { index: 2, name: 'Ousa Vey', deity: 'Ousava', planeType: 'Living Primordial Canopy', themeColor: '#10b981', baseAngle: 80 },
  { index: 3, name: 'Aethelgard', deity: 'Ay', planeType: 'Clockwork Continuum Lattice', themeColor: '#38bdf8', baseAngle: 120 },
  { index: 4, name: 'Vortexis', deity: 'Kayzoku', planeType: 'Abyssal Maelstrom Skies', themeColor: '#06b6d4', baseAngle: 160 },
  { index: 5, name: 'Astralis', deity: 'Celeste', planeType: 'Aurora Star Nebulae', themeColor: '#f59e0b', baseAngle: 200 },
  { index: 6, name: 'Pandemonium', deity: 'Psyon', planeType: 'Shifting Psychic Labyrinth', themeColor: '#a855f7', baseAngle: 240 },
  { index: 7, name: 'Umbra', deity: 'Krayvuk', planeType: 'Monolithic Void Necropolis', themeColor: '#64748b', baseAngle: 280 },
  { index: 8, name: 'Dis', deity: 'Slavyna', planeType: 'Iron Brass Citadel Courts', themeColor: '#ef4444', baseAngle: 320 }
];

// Reference anchor: Age V, Year 118, Month 1 (Lyricia), Day 1, 08:00:00
const BASE_EPOCH_MS = 1760659200000; // Base reference anchor
const INITIAL_KONRAN_OFFSET_DAYS = 118 * 243 + 0; // Year 118, Day 1
const INITIAL_KONRAN_OFFSET_SECONDS = (8 * 3600); // 08:00:00

// Dynamic Sanctorale Feasts
const FEAST_DAYS: Record<string, { feast: string; observance: string }> = {
  '0-1': { feast: 'Feast of the Golden Ledger', observance: 'Solemn consecration of weights and measures across the mints of Kelth.' },
  '0-9': { feast: 'Vigil of the Three Wise Elves', observance: 'Subterranean crystal lattice meditation in Lona Uyn.' },
  '0-27': { feast: 'The Grand Balance Audit', observance: 'Auditing of holy debts, forgiveness of minor tithes, and scholar ordination.' },
  '1-15': { feast: "Oray's Dragonfire Conclave", observance: 'Volcanic rites of communion with primal wyrms atop the spires of Yngolcina.' },
  '2-1': { feast: 'The First Sprout of Ousa Vey', observance: 'Planting of the soul-saplings under the living world-tree canopy.' },
  '3-14': { feast: 'The Zenith of Ay', observance: 'Equinoctial stasis rite; planetary clocks synchronized across all continents.' },
  '4-9': { feast: 'Tempest Bacchanal of Kayzoku', observance: 'Casting of silver coins into the roaring maelstroms for favorable winds.' },
  '5-21': { feast: 'The Night of the Starsong', observance: 'Choral celestial vigils as aurora bridges illuminate the twin moons.' },
  '6-13': { feast: 'The Labyrinth Awakening', observance: 'Psionic mind-shield calibration against the whispers of the deep cosmos.' },
  '7-27': { feast: "Krayvuk's Midnight Veil", observance: 'Extinguishing of all fires; remembrance of fallen heroes before the dawn.' },
  '8-9': { feast: 'The Tribunal of Iron Covenants', observance: 'Sealing of divine pacts and renewal of holy municipal charters.' }
};

/**
 * Calculates the comprehensive celestial, horological, and liturgical state of Planet Konran.
 * Accepts either:
 * - standard unix millisecond timestamp (or Date)
 * - simulated Konran seconds offset (e.g. 28800 for 08:00)
 */
export function getKonranGrandState(input?: number | Date): KonranGrandState {
  let ms: number;
  let simulatedDirectSeconds: number | null = null;

  if (input instanceof Date) {
    ms = input.getTime();
  } else if (typeof input === 'number') {
    if (input < 100000000) {
      // Direct simulated Konran seconds counter
      simulatedDirectSeconds = input;
      ms = BASE_EPOCH_MS + (input / (1.5)) * 1000;
    } else {
      ms = input;
    }
  } else {
    ms = Date.now();
  }

  // Calculate elapsed time in Konran units
  let totalKonranSeconds: number;
  let totalKonranDays: number;

  if (simulatedDirectSeconds !== null) {
    totalKonranSeconds = simulatedDirectSeconds;
    totalKonranDays = INITIAL_KONRAN_OFFSET_DAYS + (totalKonranSeconds / KONRAN_DAY_SECONDS);
  } else {
    const elapsedEarthSeconds = (ms - BASE_EPOCH_MS) / 1000;
    // Scale 1.5: 1 Konran Day (36h) takes 1.5 Earth Days (36h)
    const elapsedKonranDays = elapsedEarthSeconds / (36 * 3600);
    totalKonranDays = INITIAL_KONRAN_OFFSET_DAYS + elapsedKonranDays;
    totalKonranSeconds = (totalKonranDays % 1) * KONRAN_DAY_SECONDS + INITIAL_KONRAN_OFFSET_SECONDS;
  }

  // 1. Diurnal Day Time (36-hour cycle)
  const daySeconds = ((totalKonranSeconds % KONRAN_DAY_SECONDS) + KONRAN_DAY_SECONDS) % KONRAN_DAY_SECONDS;
  const hour = Math.floor(daySeconds / 3600);
  const minute = Math.floor((daySeconds % 3600) / 60);
  const second = Math.floor(daySeconds % 60);
  const fractionalSecond = daySeconds % 1;

  const isNightwatch = hour >= KONRAN_HOURS_PER_PASS;
  const passHour = hour % KONRAN_HOURS_PER_PASS; // 0 to 17
  const passName = isNightwatch ? 'NIGHTWATCH (PASS II)' : 'DAYWATCH (PASS I)';

  // 18-Hour Astronomical Dial Angles: 360° / 18 = 20° per hour
  const hourAngle = (passHour * 20) + (minute / 60) * 20 + (second / 3600) * 20;
  const minuteAngle = (minute * 6) + (second / 60) * 6;
  const secondAngle = second * 6;
  const solarDiurnalAngle = (daySeconds / KONRAN_DAY_SECONDS) * 360;

  // 2. Year & Month Structure (243 days per year, 9 months of 27 days)
  const absoluteDays = Math.floor(totalKonranDays);
  const year = Math.floor(absoluteDays / KONRAN_DAYS_PER_YEAR);
  const dayOfYearZeroBased = ((absoluteDays % KONRAN_DAYS_PER_YEAR) + KONRAN_DAYS_PER_YEAR) % KONRAN_DAYS_PER_YEAR;
  const dayOfYear = dayOfYearZeroBased + 1; // 1 to 243
  const yearProgress = (dayOfYearZeroBased + daySeconds / KONRAN_DAY_SECONDS) / KONRAN_DAYS_PER_YEAR;

  const monthIndex = Math.floor(dayOfYearZeroBased / KONRAN_DAYS_PER_MONTH) % 9;
  const month = KONRAN_MONTHS[monthIndex];
  const dayOfMonthZeroBased = dayOfYearZeroBased % KONRAN_DAYS_PER_MONTH;
  const dayOfMonth = dayOfMonthZeroBased + 1; // 1 to 27
  const monthProgress = (dayOfMonthZeroBased + daySeconds / KONRAN_DAY_SECONDS) / KONRAN_DAYS_PER_MONTH;

  // Retrograde Day-of-Month fan gauge (-65° to +65° across 27 divisions)
  const retrogradeDayAngle = -65 + ((dayOfMonth - 1) / 26) * 130;

  // 3. Liturgical Week (9-day cycles)
  const liturgicalDayIndex = ((absoluteDays % 9) + 9) % 9;
  const liturgicalDay = NYNE_LITURGICAL_DAYS[liturgicalDayIndex];

  // Sanctorale holy feast day calculation
  const feastKey = `${monthIndex}-${dayOfMonth}`;
  const feastData = FEAST_DAYS[feastKey] || {
    feast: `Liturgical Mass of ${liturgicalDay.god}`,
    observance: `Daily prayer of ${liturgicalDay.domain} on the sacred altars of ${liturgicalDay.name}.`
  };

  // 4. Concentric Sub-Dial Rotations
  // Outer sub-ring: Rotates with the 9 months (360° / 9 = 40° per month + sub-month drift)
  const monthRingAngle = (monthIndex * 40) + (monthProgress * 40);
  
  // Middle sub-ring: Sidereal Voyd Rete rotation (drifts with celestial sidereal year)
  const siderealVoydReteAngle = (yearProgress * 360) % 360;

  // Inner sub-ring: Steps 40° each 36-hour day
  const dayRingAngle = (liturgicalDayIndex * 40) + ((daySeconds / KONRAN_DAY_SECONDS) * 40);

  // Divine Planes sidereal positions
  const divinePlanes: DivinePlane[] = DIVINE_PLANES_DEF.map((plane) => {
    const currentSiderealAngle = (plane.baseAngle + siderealVoydReteAngle) % 360;
    return {
      ...plane,
      currentSiderealAngle
    };
  });

  // 5. Lunar Cycles: Lyra (28-day) and Eyenath (60-day)
  // Lyra (Olysphere): 28.0 Konran days orbital period
  const lyraOrbitDays = 28.0;
  const lyraProgress = ((totalKonranDays % lyraOrbitDays) + lyraOrbitDays) % lyraOrbitDays / lyraOrbitDays;
  const lyraOrbitalAngle = lyraProgress * 360;
  // Elongation: angular distance from Sun
  const lyraElongation = ((lyraOrbitalAngle - solarDiurnalAngle) % 360 + 360) % 360;

  const getPhaseDetails = (elongation: number, prefix: 'olysphere' | 'ayanath') => {
    let phaseName: string;
    let spriteSuffix: string;
    let phaseIndex: number;
    const isWaxing = elongation < 180;

    if (elongation < 22.5 || elongation >= 337.5) {
      phaseName = 'New Moon';
      spriteSuffix = 'new';
      phaseIndex = 0;
    } else if (elongation < 67.5) {
      phaseName = 'Waxing Crescent';
      spriteSuffix = 'crescent';
      phaseIndex = 1;
    } else if (elongation < 112.5) {
      phaseName = 'First Quarter (Half)';
      spriteSuffix = 'half';
      phaseIndex = 2;
    } else if (elongation < 157.5) {
      phaseName = 'Waxing Gibbous';
      spriteSuffix = 'gibbous';
      phaseIndex = 3;
    } else if (elongation < 202.5) {
      phaseName = 'Full Moon';
      spriteSuffix = 'full';
      phaseIndex = 4;
    } else if (elongation < 247.5) {
      phaseName = 'Waning Gibbous';
      spriteSuffix = 'gibbous';
      phaseIndex = 3;
    } else if (elongation < 292.5) {
      phaseName = 'Last Quarter (Half)';
      spriteSuffix = 'half';
      phaseIndex = 2;
    } else {
      phaseName = 'Waning Crescent';
      spriteSuffix = 'crescent';
      phaseIndex = 1;
    }

    return {
      phaseName,
      phaseSprite: `/assests/${prefix}_${spriteSuffix}.png`,
      phaseIndex,
      isWaxing
    };
  };

  const lyraPhase = getPhaseDetails(lyraElongation, 'olysphere');
  const lyra: LunarBodyState = {
    name: 'Lyra (Olysphere)',
    orbitalPeriodDays: lyraOrbitDays,
    progress: lyraProgress,
    orbitalAngle: lyraOrbitalAngle,
    elongation: lyraElongation,
    phaseName: lyraPhase.phaseName,
    phaseSprite: lyraPhase.phaseSprite,
    phaseIndex: lyraPhase.phaseIndex,
    isWaxing: lyraPhase.isWaxing,
    reticleAngle: (monthRingAngle + lyraOrbitalAngle) % 360
  };

  // Eyenath (Ayanath): 60.0 Konran days retrograde ward orbit
  const eyenathOrbitDays = 60.0;
  const eyenathProgress = ((totalKonranDays % eyenathOrbitDays) + eyenathOrbitDays) % eyenathOrbitDays / eyenathOrbitDays;
  const eyenathOrbitalAngle = (360 - (eyenathProgress * 360)) % 360; // Retrograde
  const eyenathElongation = ((eyenathOrbitalAngle - solarDiurnalAngle) % 360 + 360) % 360;
  const eyenathPhase = getPhaseDetails(eyenathElongation, 'ayanath');

  const eyenath: LunarBodyState = {
    name: 'Eyenath (Ayanath)',
    orbitalPeriodDays: eyenathOrbitDays,
    progress: eyenathProgress,
    orbitalAngle: eyenathOrbitalAngle,
    elongation: eyenathElongation,
    phaseName: eyenathPhase.phaseName,
    phaseSprite: eyenathPhase.phaseSprite,
    phaseIndex: eyenathPhase.phaseIndex,
    isWaxing: eyenathPhase.isWaxing,
    reticleAngle: (dayRingAngle + eyenathOrbitalAngle) % 360
  };

  // 6. Lyra Tidal Regulator State
  // Spring tides at Syzygy (New / Full Moon, elongation near 0° or 180°)
  // Neap tides at Quadrature (Half Moons, elongation near 90° or 270°)
  // Flood tides during tidal surge (waxing intermediate)
  // Slack tides during tidal reversal
  const syzygyDist = Math.min(
    Math.abs(lyraElongation - 0),
    Math.abs(lyraElongation - 180),
    Math.abs(lyraElongation - 360)
  );
  const quadDist = Math.min(
    Math.abs(lyraElongation - 90),
    Math.abs(lyraElongation - 270)
  );

  let tidalState: TidalState;
  let tidalCoefficient = 50;
  let tidalDescription = '';

  if (syzygyDist <= 18) {
    tidalState = 'Spring';
    tidalCoefficient = Math.round(85 + (1 - syzygyDist / 18) * 15);
    tidalDescription = 'Maximum tidal amplitude; sea waters swell toward the moonline.';
  } else if (quadDist <= 18) {
    tidalState = 'Neap';
    tidalCoefficient = Math.round(25 + (quadDist / 18) * 15);
    tidalDescription = 'Minimal tidal range; calm water balance across coastal trenches.';
  } else if (lyra.isWaxing) {
    tidalState = 'Flood';
    tidalCoefficient = Math.round(55 + Math.sin((lyraElongation * Math.PI) / 180) * 25);
    tidalDescription = 'Strong inward current flooding the archipelago channels.';
  } else {
    tidalState = 'Slack';
    tidalCoefficient = Math.round(40 + Math.cos((lyraElongation * Math.PI) / 180) * 15);
    tidalDescription = 'Transitional slack water; current velocity briefly pauses.';
  }

  // 7. Dracontic Syzygy & Eclipse Mechanics
  // Dracontic cycle (nodal precession): 27.21 days
  const draconticNodePeriod = 27.21;
  const nodeProgress = ((totalKonranDays % draconticNodePeriod) + draconticNodePeriod) % draconticNodePeriod / draconticNodePeriod;
  const ascendingNodeAngle = nodeProgress * 360;
  
  // Angle between Lyra and ascending node
  const draconticAngle = ((lyraOrbitalAngle - ascendingNodeAngle) % 360 + 360) % 360;

  // Syzygy angle between Sun and Lyra
  const syzygyAngle = Math.min(
    Math.abs(lyraElongation - 0),
    Math.abs(lyraElongation - 180),
    Math.abs(lyraElongation - 360)
  );

  let syzygyPhase: KonranGrandState['syzygyPhase'];
  if (Math.abs(lyraElongation - 0) < 30 || Math.abs(lyraElongation - 360) < 30) {
    syzygyPhase = 'Conjunction (New Moon)';
  } else if (Math.abs(lyraElongation - 180) < 30) {
    syzygyPhase = 'Opposition (Full Moon)';
  } else if (Math.abs(lyraElongation - 90) < 25 || Math.abs(lyraElongation - 270) < 25) {
    syzygyPhase = 'Quadrature';
  } else {
    syzygyPhase = 'Intermediate';
  }

  // Node proximity
  const nodeDist = Math.min(
    Math.abs(draconticAngle - 0),
    Math.abs(draconticAngle - 180),
    Math.abs(draconticAngle - 360)
  );
  const nodeName = draconticAngle < 90 || draconticAngle > 270 
    ? 'Caput Draconis (Ascending Node)' 
    : 'Cauda Draconis (Descending Node)';

  const isEclipseImminent = syzygyDist < 12 && nodeDist < 10;
  const alignmentFactor = Math.max(0, 1 - (syzygyDist / 12 + nodeDist / 10) / 2);
  const eclipseProximity = Number(alignmentFactor.toFixed(3));

  let eclipseType: KonranGrandState['eclipseType'] = 'None';
  if (isEclipseImminent) {
    if (syzygyPhase === 'Conjunction (New Moon)') {
      eclipseType = nodeDist < 4 ? 'Solar Total' : 'Solar Annular';
    } else {
      eclipseType = nodeDist < 5 ? 'Lunar Blood' : 'Penumbra';
    }
  }

  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

  return {
    timestamp: ms,
    totalKonranSeconds,
    totalKonranDays,
    epoch: 'AGE V // YR 118',
    age: 5,
    year,
    yearProgress,
    dayOfYear,
    month,
    monthProgress,
    dayOfMonth,
    retrogradeDayAngle,
    daySeconds,
    hour,
    minute,
    second,
    fractionalSecond,
    timeString,
    isNightwatch,
    passName,
    passHour,
    hourAngle,
    minuteAngle,
    secondAngle,
    solarDiurnalAngle,
    liturgicalDay,
    sanctoraleFeast: feastData.feast,
    sanctoraleObservance: feastData.observance,
    monthRingAngle,
    siderealVoydReteAngle,
    dayRingAngle,
    divinePlanes,
    lyra,
    eyenath,
    tidalState,
    tidalCoefficient,
    tidalDescription,
    draconticAngle,
    syzygyAngle,
    syzygyPhase,
    nodeName,
    isEclipseImminent,
    eclipseProximity,
    eclipseType
  };
}
