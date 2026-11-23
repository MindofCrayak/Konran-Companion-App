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

2. **Bottom Ribbon (`30px` fixed height):**
   * Must remain thin and unobtrusive.
   * Left: Planetary fix coordinates (`47° 12′ N / 08° 44′ E`) and moons indicator (`Olysphere` • `Ayanath`).
   * Right: Horizontal strip of single-line micro-pills (`22px` height):
     `[Sheet]` • `[Fated]` • `[K.A.M.P.]` • `[Kodex]` • `[Pantheon]` • `[Standings]` • `[Atlas]` • `[+ Node]`.
   * On mobile (<768px): Collapses to coordinates and a single `[TERMINALS (N)]` launcher.

3. **Planet Konran Core Telemetry:**
   * **The planet is the draw:** The center of Planet Konran ($r < 308\text{px}$) **must remain completely transparent, clear, and unobstructed**. Continents, clouds, oceans, and polar ice must be 100% visible.
   * **Circuits & HUD:** All vector circuit wires, PCB doglegs, solder vias, and kinetic electron data packets orbit strictly outside the atmosphere ($r \ge 308\text{px}$).
   * **CRT Effects:** Authentic 2px horizontal scanlines, phosphor flicker, and vertical sweep beam dynamically colored to match the active character's patron deity.

---

## 5. Canonical Setting & Lore Grounding

When answering user queries or generating content, adhere strictly to these canon rules:

### A. The Harmony of 9 & Celestial Physics
* **Rotation:** Exactly 36 hours per Konran solar day.
* **Passes:** Hours 00:00 to 17:59 (Daywatch Pass); Hours 18:00 to 35:59 (Nightwatch Pass).
* **Week:** 9-day liturgical week governed by The Nyne:
  1. *Lyridi* (Lyricia) · 2. *Oraydi* (Oray) · 3. *Savadi* (Ousava) · 4. *Aydi* (Ay) · 5. *Kaydi* (Kayzoku) · 6. *Celestdi* (Celeste) · 7. *Psyondi* (Psyon) · 8. *Kraydi* (Krayvuk) · 9. *Slavydi* (Slavyna).
* **Moons:**
  * *Olysphere* (Gold Sentinel): Rapid 16.2-hour orbital sweep driving strong tides.
  * *Ayanath* (Violet Watchtower): Slower 41.4-hour retrograde ward orbit.

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

### D. Spatial OS Architecture (Slablet MK IV)
* **Astrolabe Radial Click-Wheel:**
  * Compact gyroscopic dial anchored to bottom-left/right corner (scales from 41.6px ghost lens to 64px active).
  * Double-tap (`x2`): Expands inner navigation arc with discrete `Up`, `Select`, `Down` controls.
  * Triple-tap (`x3`): Expands outer arc with 7 customizable macro slots (Resonance, Chronometron, Export 5e, Sync Sheet, Substrate -1, Lotus Lock, LK Atlas).
  * 2-Stage Idle Dormancy: 3.2s arc fold back to base dial, 6.5s fade to 18% opacity Ghost Lens (wakes instantly on pointer enter/touch).
  * Dynamic calibration: Dial scale (0.7x-1.4x), arc spacing (0.8x-1.6x), and handedness (Left/Right) configurable via `[Dial]` Calibration Terminal.
* **Vertical Layer Spine & Infinite Dynamic Portals:**
  * Linear central spine spanning fixed layers: `-1` Core Substrate / ARPANET, `0` Base, `1` The Nyne Net, `2` Declared Church, `3` User Home, `4` K.A.M.P., `5` ObsydianHeart (`OH`).
  * Dynamic `+` Portal Stack: Players and DMs can create unlimited custom upper portals (`USR+` and `CMP+` for LegendKeeper campaigns).
* **Elevation-Locked Astral Node Graph:**
  * Horizontal constellation orbiting outside the planet core ($r \ge 310\text{px}$).
  * Clearance-gated visibility: Nodes reveal or restrict access dynamically based on current layer elevation and player clearance.
* **Planet Konran Core Rule:**
  * Center diameter ($r < 308\text{px}$) is strictly preserved 100% visible and unblocked. Zero intrusive opaque geometry covers the planet.

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
