# SYSTEM GROUNDING: OBSYDIANHEART SLABLET MK IV & KONRAN OS

## 1. Core Architecture & Mental Model
- The application is NOT a standard website or character builder. It is an in-world crystalpunk datapad: the "ObsydianHeart Slablet MK IV".
- The root viewport is a spatial desktop OS canvas. At the center sits a persistent, interactive 3D Three.js holographic globe of Planet Konran with its two orbiting moons: Olysphere (tide sentinel) and Ayanath (watchtower moon).
- Windows, dossiers, and tools render as floating HUD modal containers over the planetary canvas with blurred backdrops and CRT phosphor scanline overlays.

## 2. Canonical Setting & Mechanics
- World: Konran, capital planet of the Konra System. 32-hour rotational days, 9-day liturgical weeks named for The Nyne deities.
- The Nyne Pantheon:
  * Good (The O Order): Lyricia (LG), Ousava (NG), Celeste/Vevayun (CG)
  * Neutral: Oray (LN), Ay (TN), Kayzoku (CN)
  * Evil: Slavyna (LE), Krayvuk (NE), Psyon (CE)
- K.A.M.P. (Konran Academy of Might & Proficiency): Exactly FOUR canonical houses:
  * Hydra (Magic, Psionics & Arcane Mastery)
  * Gryffon (Martial Vigilance & Arena Glory)
  * Spynx (Magitech Engineering & Discovery)
  * Unycorn (Arts, Performance & Diplomacy)
  * Note: Legacy house names (Pyros, Umbra, Aethelgard, Thalassa, Astralis, Bellona, Paradox, Duath) are obsolete and forbidden.
- Fated Characters & Receipts: Every player character carries verified documentation:
  * Declared Divine Covenant (Immutable for players; DM/Archivist override only)
  * 30-Credit K.A.M.P. Transcript (or alternative holy order ordination charter for non-attendees)
  * Municipal Standing Matrix (-3 Blacklisted to +3 Revered)
- Security Model: Zero-knowledge cloaked lore. Unaffiliated adventurers see zero DOM footprint for classified entries; DMs in Archivist mode see violet inspection wrappers.

## 3. Engineering Constraints
- React 19 + TypeScript + Vite + Tailwind CSS v4.
- 3D Rendering: Three.js (`SphereGeometry` textured with `public/assests/konran-map.jpg`).
- Audio: Lightweight Web Audio API synthesizer (`src/utils/audio.ts`). No external audio files.
- Modular Components: Every feature (globe, badge, KAMP intake, codex) lives in self-contained component modules. Never regenerate monolithic files.



# CANONICAL CELESTIAL TIMELINES: THE HARMONY OF 9

- The Core Rule of 9: All time, orbital cycles, and liturgical structures divide by 9.
- Planetary Rotation: Exactly 36 hours per Konran solar day (NOT 32 hours).
- Dial Anatomy: Physical and digital clocks feature an 18-hour chapter ring (1 through 18).
  * Hours 00:00 to 17:59: Daywatch Pass (Solar transit apex at Hour 9)
  * Hours 18:00 to 35:59: Nightwatch Pass (Midnight perigee at Hour 27)
- Calendar: 9-day weeks governed by The Nyne:
  1. Lyridi  2. Oraydi  3. Savadi  4. Aydi  5. Kaydi
  6. Celestdi  7. Psyondi  8. Kraydi  9. Slavydi
- Lunar Cycles:
  * Olysphere (Gold Sentinel): Rapid 16.2-hour tidal sweep
  * Ayanath (Violet Watchtower): Slower 41.4-hour retrograde ward orbit
