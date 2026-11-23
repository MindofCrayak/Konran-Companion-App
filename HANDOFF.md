# Agent Handoff & Architecture Blueprint: Konran Companion App

> **Target Audience:** Incoming AI Chat Agents, Engineers, and Archivists working on the **Konran Companion App** (`ObsydianHeart Slablet MK IV`).
> **Repository:** `MindofCrayak/Konran-Companion-App` (Branch: `main`)
> **Live Domain:** `https://konranapp.gamemasterondemand.com`
> **Local Demo URL:** `http://localhost:3001/`

---

## 1. Executive Summary & Design Mental Model

The **Konran Companion App** is an in-universe crystalpunk spatial operating system—the **ObsydianHeart Slablet MK IV**—built for players and Game Masters in the homebrew **Konran** setting (5.5e / Fifth Edition D&D).

### Key Pillars:
1. **Spatial OS Desktop:** The root viewport is a heads-up display (HUD). At the center rotates a 3D Three.js globe of Planet Konran with its two moons (`Olysphere` and `Ayanath`).
2. **Multi-Window Floating Nodes:** Character sheets, academy intranets, celestial chronometers, and lore atlases open as draggable, resizable, minimizable glassmorphism windows.
3. **Canonical Celestial Time:** A 36-hour planetary day (two 18-hour passes: Daywatch Pass and Nightwatch Pass), 9-day liturgical weeks named after The Nyne deities, and realistic tidal/lunar cycles.
4. **Third-Party Integrations:**
   * **LegendKeeper Live Lore Engine:** Queries real worldbuilding documents and maps via edge proxy.
   * **Fifth Edition Character Sheet (Walter Kammerer) Exporter:** Generates XML/JSON save files using mathematical delimiters (`⊠`, `⊡`, `⊟`) to import custom Konran races, classes, and boons onto mobile devices.
   * **Google Sheets Ledger:** Syncs player state to a centralized Google Apps Script.
   * **Discord OAuth2 & Guild Verification:** Synchronizes player roles and handles character authentication.

---

## 2. Tech Stack & Environment

* **Frontend Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4.
* **3D Planetary Engine:** Three.js (Procedural PBR standard material, seamless cloud layer, atmosphere shader, celestial moons).
* **Audio Synthesis:** Web Audio API procedural synthesizer (`src/utils/audio.ts`). Zero external audio asset dependencies.
* **Motion & Styling:** Custom CSS animations, CRT scanline gradients, phosphor flicker, and `canvas-confetti`.
* **Hosting & Edge Compute:** Cloudflare Pages + Cloudflare Pages Edge Functions (`/functions` directory).

---

## 3. Directory Layout & Key Modules

```
Konran-Companion-App/
├── functions/                     # Cloudflare Pages Edge Functions
│   └── api/
│       ├── auth/discord/          # Discord OAuth2 login & callback verification
│       ├── lore/                  # LegendKeeper v3 REST API edge proxy
│       └── sync/                  # Google Sheets Apps Script proxy
├── public/
│   └── assets/                    # Clock dials, lunar phases, planetary textures
├── src/
│   ├── components/
│   │   ├── SlabletDesktop.tsx     # Primary spatial desktop OS & window manager
│   │   ├── SlabletDesktop.css     # HUD ribbons, 38px top bar, 30px footer styles
│   │   ├── KonranGlobe.tsx        # Three.js 3D planetary rendering
│   │   ├── KonranMandalaOverlay.tsx # Orbiting circuit wires, CRT scanlines & sweep beam
│   │   ├── ColdStartIgnition.tsx  # 3-phase biometric ignition & liturgical handshake
│   │   ├── CharacterSheetView.tsx # 5.5e stats, resonance dice, inventory, boons
│   │   ├── ExportCharacterModal.tsx # Walter Kammerer 5e XML/JSON mobile export
│   │   ├── KAMPTerminalView.tsx   # K.A.M.P. Academy intranet slate & course catalog
│   │   ├── KAMPSortingQuiz.tsx    # 10-question evaluation for the 4 canonical houses
│   │   ├── FatedQuestionnaire.tsx # Divine Sect & Lifepath questionnaire
│   │   ├── GrandChronometronModal.tsx # 36-hour physical/digital analog clock
│   │   ├── LoreAtlasModal.tsx     # LegendKeeper live documentation search & reader
│   │   └── ReputationTrackerModal.tsx # Faction & Municipal standing ledger (-3 to +3)
│   ├── context/
│   │   └── CharacterContext.tsx   # Player roster, active character state, localStorage
│   ├── types/                     # TypeScript definitions (feExport, celestial, windows)
│   └── utils/
│       ├── celestial.ts           # Konran astronomical time, tides, and orbital physics
│       ├── feExporter.ts          # XML mathematical delimiter serialization
│       └── audio.ts               # Procedural audio clicks, chimes, and alerts
```

---

## 4. UI Layout & Strict Styling Rules

1. **Top HUD Ribbon (`38px` fixed height):**
   * Must remain a **single unified bar**. Never stack a separate bar above or below it.
   * Left: Persona selector dropdown button (`[Valerius Drake ▾]`), Covenant badge (`[Oray]`).
   * Center: Active open window tabs (`Nodes: [Sheet] [Atlas] [+]`).
   * Right: Mini Chronometron (20px dial + digital time string) and `Lotus Lock` button.

2. **Bottom Ribbon (`30px` fixed height) — DELETED FOR THUMB ERGONOMICS:**
   * In Slablet MK IV, the 30px bottom status/pill bar is **completely removed** to prevent touch collisions and provide full ergonomic thumb access to the corner Astrolabe controller.
   * No buttons, pills, or status texts sit along the bottom screen edge.
   * The corner click-wheel (`AstrolabeController.tsx`) is positioned at `bottom: 12px`, `left/right: 12px` (based on handedness) with 100% unobstructed touch capture.

3. **Docked Spyglass & Zoom-Lock Control:**
   * Removed from top bar. Docked directly adjacent to the corner Astrolabe click-wheel (`astrolabe-docked-spyglass`).
   * Single-Tap cycles 3 Z-depth tiers: `[🔭 SURFACE]` (World Map $z=2.35$) ↔ `[🔭 PLANET]` (Orbit $z=5.8$) ↔ `[🔭 SYSTEM]` (Solar System $z=18.0$).
   * Long-press / Hold / Right-click engages **Zoom Lock**; while locked, spinning/scrubbing the click-wheel smoothly zooms the Three.js camera across space with haptic vibration (`navigator.vibrate`) and detent audio clicks.

4. **Planet Konran Core Telemetry:**
   * **The planet is the draw:** The center of Planet Konran ($r < 308\text{px}$) **must remain completely transparent, clear, and unobstructed**. Continents, clouds, oceans, and polar ice must be 100% visible.
   * **Circuits & HUD:** All vector circuit wires, PCB doglegs, solder vias, and kinetic electron data packets orbit strictly outside the atmosphere ($r \ge 308\text{px}$).
   * **CRT Effects:** Authentic 2px horizontal scanlines, phosphor flicker, and vertical sweep beam dynamically colored to match the active character's patron deity.

---

## 5. Canonical Setting, Lore Grounding & Spatial OS Features

When answering user queries or generating content, adhere strictly to these canon rules:

### A. The Harmony of 9 & Celestial Physics
* **Rotation:** Exactly 36 hours per Konran solar day.
* **Passes:** Hours 00:00 to 17:59 (Daywatch Pass); Hours 18:00 to 35:59 (Nightwatch Pass).
* **Week:** 9-day liturgical week governed by The Nyne:
  1. *Lyridi* (Lyricia) · 2. *Oraydi* (Oray) · 3. *Savadi* (Ousava) · 4. *Aydi* (Ay) · 5. *Kaydi* (Kayzoku) · 6. *Celestdi* (Celeste) · 7. *Psyondi* (Psyon) · 8. *Kraydi* (Krayvuk) · 9. *Slavydi* (Slavyna).
* **Moons:**
  * *Olysphere* (Gold Sentinel): Rapid 16.2-hour orbital sweep driving strong tides ($r = 1.68$).
  * *Ayanath* (Violet Watchtower): Slower 41.4-hour retrograde ward orbit ($r = -1.86$).

### B. The Nyne Pantheon & Mineral Palettes
* **Lyricia** (LG): Tourmaline (#ec4899)
* **Ousava** (NG): Amethyst (#a855f7)
* **Celeste / Vevayun** (CG): Aquamarine (#06b6d4)
* **Oray** (LN): Sapphire (#60a5fa)
* **Ay** (TN): Amber (#f59e0b)
* **Kayzoku** (CN): Topaz (#c084fc)
* **Psyon** (CE): Moonstone (#e2e8f0)
* **Krayvuk** (NE): Emerald (#22c55e)
* **Slavyna** (LE): Ruby (#ef4444)

### C. K.A.M.P. (Konran Academy of Might & Proficiency)
* Exactly **FOUR** canonical houses:
  1. **Hydra:** Magic, Psionics & Arcane Mastery.
  2. **Gryffon:** Martial Vigilance & Arena Glory.
  3. **Spynx:** Magitech Engineering & Discovery.
  4. **Unycorn:** Arts, Performance & Diplomacy.
* *Note:* Legacy names (Pyros, Umbra, Aethelgard, Thalassa, Astralis, Bellona, Paradox, Duath) are obsolete and forbidden.

### D. Canonical 3D Solar System, Smart Globes & Screensaver Mode
Rendered in Three.js at $z = 18.0$ (`KonranGlobe.tsx`), driven by `useCelestialClock()` (`src/hooks/useCelestialClock.ts`) as the single source of truth for time across the top-bar mini clock, the rigid `1:1` circular `GrandChronometronModal.tsx` (`240px × 240px` mobile / `280px × 280px` desktop), and 3D orbital mechanics:
* **Performance-Optimized Focus LOD:** Only the focused planet renders full high-res procedural shaders, day/night terminator, emissive night city lights, weather clouds, and moons; unfocused planes use lightweight proxy meshes except for the canonical landmarks:
  1. **Ayan (The Sun):** Blazing white plasma core with yellow/blue filaments and corona flares.
  2. **Kay-Kee (Kayzoku):** Counter-rotating hemispheres (Kay arid mushroom cap clockwise & Kee ocean basin counterclockwise) aligning for **The Passing** + 2 moons.
  3. **Synthelavor (Slavyna):** Hyper-volcanic basalt sphere, glowing magma cracks, glittering red dust rings, diffuse nebula cloud + 5 moons (Tatyon, Odahs, Kark, Syndavaria, Hemalod).
  4. **Lona Uyn (Lyricia):** Azure/emerald garden sphere, floating aerial rock islands, crystal veins, ring halo + 3 moons (Kelth, Zorm, Sylef).
  5. **Konran (Capital):** Primary mortal sphere ($r < 308\text{px}$ clear) with 36h day/night solar terminator, emissive night city lights (*Vantya*, *Padd City*, *Crafton Cove*, *Skreeton Harbor*), live animated weather cloud sphere, Gold Sentinel *Olysphere* and Violet Watchtower *Ayanath*.
  6. **Cadence (Celeste / Vevayun):** Classical Greco-Roman marble valleys, emerald forests, amphitheater peaks + violet moon.
  7. **Dyata / Yngolcina (Oray):** Concentric dragon-eye caldera with deep sapphire void core + 2 moons.
  8. **Vaya Marr & Lantyca (Ousava):** Giant oceanic sphere, giant rainforest moon *Lantyca*, animated sky-waterspout bridge during close tidal pass + 2 moons.
  9. **Duathyer (Psyon):** Obsidian spires, pale violet toxic mists, fractured acid craters + 1 moon.
  10. **Kestok / Keztox (Krayvuk) & The Singularity Eye:** Biomechanical two-lobed battle station split by a glowing yellow acid equator trench (**Kes** green/yellow toxic left lobe; **Tox** purple steel clockwork right lobe), accompanied by **Krayvuk's high-definition Singularity Eyeball** that visibly watches Konran and detects when Keztox eclipses its line of sight (*Keztox Blind-Spot Festival*).
* **Screensaver / Attract Mode:** Slow cinematic orbital camera drift around the lit day/night planet and moons.

### E. Recursive "Google Earth" LegendKeeper v3 Crawler & 3D Map Projection
* **Edge Proxy (`functions/api/lore/legendkeeper.ts` & `functions/api/lore/article/[resourceId].ts`):**
  * Recursively crawls `kind: "map"` document tabs across arbitrary zoom depths: Tier 0 (Solar System) → Tier 1 (Planetary Globe `Konran`) → Tier 2 (Continent/Region `Kray Providence`) → Tier 3 (City `Crafton Cove`, `Vantya`, `Padd City`) → Tier 4+ (District / Street / Building Interior e.g. `The Mydnight Rendezvous`).
  * Pins whose target LK resource contains a `kind: "map"` tab render a pulsing **sub-map portal reticle** on the 3D globe and interactive sub-map portal buttons inside `LoreAtlasModal.tsx`.
  * Caches normalized map trees and article dossiers in Cloudflare Cache / KV (`LORE_CACHE`) and gracefully falls back to canonical multi-tier data with HTTP 200 if offline.
* **3D Spherical Projection & Horizon Culling:** Projects nested Tier 2+ coordinates via continent bounding boxes (`CONTINENT_BOUNDING_BOXES` with parent-anchor offset fallback), culls far-hemisphere pins (`dot(cameraDir, pinNormal) < 0`), and smoothly reveals city/district pins as Spyglass zooms toward the surface.

### F. Fullscreen PWA, Two-Tier Offline Vault & Aether-Wave Radio
* **Manifest & Service Worker:** `public/manifest.webmanifest` (`"display": "standalone"`, `"display_override": ["fullscreen", "standalone", "minimal-ui"]`, `#09090b`) and `public/sw.js` with install triggers in `ColdStartIgnition.tsx` and `OSCalibrationPanel.tsx`.
* **Two-Tier Offline Storage Separation (`src/utils/vault.ts` & `src/components/StorageVaultPanel.tsx`):**
  * **Protected Local User Vault (`konran.vault.*`):** Character sheet, inventory, Resonance dice, User Home (Layer 3) palette, murder-board layout, Prestige ledger, and wheel calibration — never wiped by media cache clears, with an offline dirty-flag sync queue (`enqueueVaultSync`, `flushVaultSyncQueue`).
  * **Clearable Media/Lore Cache (`konran.cache.*` & Cache Storage):** Clears cached lore & map assets with explicit confirmation (*"Clears cached lore & map assets; your character sheet and local OS data remain safe"*).
* **"Aether-Wave Radio" Miniplayer (`src/components/AetherWaveRadio.tsx`):**
  * Glowing Nixie tubes (`CH-01`..`CH-09`, `TRK-01`), live animated phosphor oscilloscope `<canvas>`, curated YouTube Music playlist selector + custom playlist ID input, YouTube IFrame Player API transport controls (`loadPlaylist`, `playVideo`, `pauseVideo`, `nextVideo`, `previousVideo`) with procedural Web Audio synth ambient fallback, collapsible into a top-right corner Nixie badge.

### G. Discord GM Switchboard, Revocable Prestige Clearance (`-100` to `+100` Rollover) & Layer Apps
* **Revocable Prestige Clearance Engine (`src/utils/prestige.ts` & `ReputationTrackerModal.tsx`):**
  * Tracks standing from `-100.00` to `+100.00` (`0.00` baseline) in `0.25` / `0.50` steps, rolling over at `+100.00` into **Prestige 1, 2, 3, 4+** (`0.00` on the new tier) with monthly `±0.50` drift and an "In The Know" high-Insight NPC memory log.
  * Dynamically evaluates and revokes internal sect invitations (*Brotherhood of Blood*, *School of Shadows*, *Sage Pryestesshood*, *Agents of the Arrow* at Prestige 3–4+).
* **Discord GM Switchboard (`src/components/GMSwitchboardView.tsx`, `functions/api/gm/action.ts`, `functions/api/gm/feed.ts`, `src/hooks/useGMFeed.ts`):**
  * Campaign & LegendKeeper handout dropper (Public Broadcast vs. Targeted Drop on a `3–8s` background sync pulse), one-tap `[-0.50] [-0.25] [+0.25] [+0.50]` reputation steppers posting rumors to `The Nyne Net (1)`, and Deity Declaration / K.A.M.P. progression approvals.
* **Layer `-1` CoreNet ICE Breach Minigames (`src/components/CoreNetBreachMinigameView.tsx`):** Fallout terminal glyph/word matrix, ley-circuit flow routing, and frequency wire-patching scaled to character Intelligence/Arcana.
* **Layer `1` The Nyne Net Board & Escrow (`src/components/NyneNetBoardEscrowView.tsx`):** Cross-Campaign Message Board (*World Wire* auto-rumors, *Bounties & Contracts*, *Dead Drops / Tavern Notes*) and *Lyricia Courier Escrow* item trading.

### G. Spatial OS Architecture (Slablet MK IV)
* **Astrolabe Radial Click-Wheel (`AstrolabeController.tsx`):**
  * Anchored to bottom thumb corner (`bottom: 12px`, `left/right: 12px`), 80px base diameter.
  * Central biometric thumbprint/fingerprint SVG glyph with live pulse.
  * Knurled outer track ring that visibly rotates with `rotaryAngle` and lights up detent notches.
  * **Single-Touch Drag:** Horizontal drag strictly scrubs through nodes in the active layer. Vertical swipes NEVER jump OS layers (elevation is strictly intentional).
  * **Single-Tap (`x1`, ~180ms):** Collapses open radial arcs, or focuses/launches highlighted node.
  * **Single-Tap + Hold (~320ms):** Opens **Wayfinder / History Radial** displaying `Home (⌂)` and recent nodes.
  * **Center Long-Press (>750ms):** Snaps immediately to User Home (Layer 3) with full-scale haptic burst.
  * **Double-tap (`x2`):** Expands inner navigation arc with discrete `Up (↑)`, `Center (Neutral / Empty Buffer)`, and `Down (↓)` controls.
  * **Triple-tap (`x3`):** Expands outer customizable macro ring (7 slots along alien SVG PCB dogleg traces).
  * **2-Stage Idle Dormancy:** 3.2s arc fold back to base dial, 6.5s fade to 18% opacity Ghost Lens.
  * **Dynamic Calibration:** Dial scale (0.7x-1.4x), arc spacing (0.8x-1.6x), handedness (Left/Right), User Home color picker, PWA install trigger, and OS Tutorial replay configurable via `OSCalibrationPanel.tsx`.

* **Dynamic OS Layer Stack (`Layers -1 to 6+`), Themes & Cover-Layer Masking:**
  * **Layer -1 (CoreNet Substrate):** Dark Plum (`#2e1065`) & Glowing Gold Matrix (`#fbbf24`), digital rainfall, patron deity colored packets, static packets, and covert transit spaces.
  * **Layers 0 & 1 (Base & Nyne Net):** Nyne's Electric Lilac/Lavender (`#c084fc`/`#a855f7`).
  * **Layer 2 (Declared Church):** Dynamic Patron God mineral palette.
  * **Layer 3 (User Home):** Customizable user color scheme.
  * **Layer 4 (K.A.M.P.):** Tactile E-Ink (`#f4f1ea` / `#1c1917`).
  * **Layer 5 (ObsydianHeart):** Classic Fallout retro-green meets 90s Amazon directory.
  * **Layer 6+ (Dynamic & Campaign Portals):** Unlimited `+` stack for DM campaign boards with LegendKeeper sync.
  * **Cipher Lens Masking:** Restricts unauthorized character nodes with an official clearance seal or spoofed decoy cover.

* **Layer-Scoped Persistent Windows & Murder Board Canvas:**
  * Floating windows automatically persist their coordinates, size, and state per `layerIndex`.
  * Window headers feature `"Send To..."` layer dropdowns, Pin toggle, Hide toggle, and Up/Down layer steppers.
  * Murder Board workspace allows pinning sticky-notes and drawing dynamic red thread connections between clues and nodes.

* **Touch & Pointer Isolation:**
  * Strict containment ensures the `SLABLET TERMINAL HUB` drawer **only** opens via explicit button clicks (`[+ New Terminal Node]`).
  * Blank desktop clicks safely close an open hub drawer while passing through cleanly when closed to allow 3D globe panning and zooming.

---

## 6. Cloudflare Pages & Backend Configuration

Cloudflare Pages project: `konran-companion-app`.

### Required Environment Variables:
| Variable | Description | Live Status |
| :--- | :--- | :--- |
| `LEGENDKEEPER_API_KEY` | Bearer token for LegendKeeper API v3 | **Configured & Working** |
| `LEGENDKEEPER_PROJECT_ID` | Project ID (auto-resolves `Konran` if unset) | **Working** |
| `GOOGLE_SHEET_WEBHOOK_URL` | Apps Script URL for player ledger sync | **Needs Value in CF Dashboard** |
| `DISCORD_CLIENT_ID` | Discord Application Client ID | **Needs Value in CF Dashboard** |
| `DISCORD_CLIENT_SECRET` | Discord Application Client Secret | **Needs Value in CF Dashboard** |
| `DISCORD_REDIRECT_URI` | `https://konranapp.gamemasterondemand.com/api/auth/discord/callback` | **Needs Value in CF Dashboard** |

---

## 7. Developer Quick Reference

```bash
# Install dependencies
npm install

# Start local dev server (Runs on port 3001 if 3000 is occupied by PM2)
npx vite --port 3001 --host 0.0.0.0

# Type-check without compiling
npx tsc --noEmit

# Production build (Outputs to /dist)
npm run build

# Push to GitHub (Triggers automatic Cloudflare Pages deployment)
git add .
git commit -m "your descriptive commit message"
git push origin main
```

---

## 8. Current Backlog & Immediate Next Steps

1. **Cloudflare Dashboard Secrets:** Add `GOOGLE_SHEET_WEBHOOK_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI` to enable full Google Sheets syncing and live Discord OAuth.
2. **Walter Kammerer 5e Import Verification:** Confirm end-to-end import of custom Konran subrace and class features on physical iOS/Android devices running the app.
3. **DM Campaign Portal Integration:** Connect dynamic `CMP+` upper portals directly to specific LegendKeeper project boards and permission groups.
