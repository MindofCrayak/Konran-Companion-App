# Konran OS / ObsydianHeart Slablet MK IV
## Update & Implementation Plan

This document outlines the actionable steps to resolve the issues identified in the technical audit and implement the recommended features. It is divided into three phases based on priority and architectural impact.

---

### Phase 1: Immediate Triage & Cleanup
*Focus: Fixing typos, resolving documentation conflicts, and optimizing the client bundle.*

- [ ] **1.1 Standardize Asset Directory**
  - Rename `public/assests/` to `public/assets/`.
  - Perform a global find-and-replace in the codebase to update all paths from `/assests/...` to `/assets/...`.
    - *Key files to check:* `src/components/KonranGlobe.tsx`, `src/components/FatedCharacterBadge.tsx`, `src/components/GrandChronometronModal.tsx`, `scripts/generate_clock_assets.cjs`.
  - Delete any duplicated asset folders to prevent build confusion.

- [ ] **1.2 Correct World-Building Documentation**
  - Open `PROJECT_GROUNDING.md`.
  - Navigate to Section 2 (Canonical Setting & Mechanics).
  - Update the text from "32-hour rotational days" to "Exactly 36 hours per Konran solar day" to match the mathematical logic in the celestial engine.

- [ ] **1.3 Clean Up Dependencies**
  - Run `npm uninstall framer-motion` to remove the redundant package.
  - Ensure all animation imports reference `motion/react` (part of the `motion` package).
  - Run `npm install html2pdf.js` to manage it locally via npm.
  - Remove the hardcoded `<script>` tag for `html2pdf.js` in `index.html`.
  - Refactor `src/components/DossierView.tsx` to use a dynamic import (`await import('html2pdf.js')`) so the library only loads when a user initiates a PDF export.

---

### Phase 2: Security & Backend Architecture
*Focus: Securing the LegendKeeper API and enforcing true Zero-Knowledge cloaking.*

- [ ] **2.1 Initialize Express Backend Proxy**
  - Set up an Express server (if not already fully configured) to serve the Vite frontend and handle API routes.
  - Create a secure route: `GET /api/lore/:slug`.
  - Store the LegendKeeper API key in a server-side `.env` file (never exposed to the client).
  - Implement a caching layer (e.g., Redis or a simple in-memory Node cache) for LegendKeeper API responses to minimize latency and avoid rate limits.

- [ ] **2.2 Implement Server-Side Zero-Knowledge Lore Filtration**
  - Move the `CLASSIFIED_LORE` array and the `evaluateClearance` logic from the client to the backend.
  - When the client requests a dossier or lore block, it must send the active character's ID and authentication token.
  - The server evaluates the character's clearance level (Deity, Faction, Rank).
  - The server responds with either:
    - The fully unredacted lore (if cleared or if the user is a DM).
    - A stripped-down JSON payload (if cloaked/redacted), completely omitting sensitive strings before they ever reach the browser.
  - Remove classified plain-text strings from the client bundle (`src/data/classifiedLore.ts`).

---

### Phase 3: Core Feature Expansion
*Focus: Deepening the diegetic crystalpunk immersion and multiplayer tabletop utility.*

- [ ] **3.1 Interactive Dual-Faced Badge**
  - Update `FatedCharacterBadge.tsx` to include CSS 3D transforms (`preserve-3d`, `backface-visibility: hidden`).
  - **Front:** Render the character portrait, active deity/house crest, and current clearance sigil.
  - **Back:** Render a municipal record including active infractions, bail bond balances, and verified academy/ordination stamps.
  - Add click/tap handlers to trigger the flip animation with a mechanical audio cue.

- [ ] **3.2 Master DM Chronometer Sync**
  - Set up a WebSocket (e.g., `socket.io`) or Server-Sent Events (SSE) connection on the Express backend.
  - Create a DM Control Panel component that allows the Archivist to advance time (e.g., "+1 Hour", "Long Rest (+8 Hours)").
  - Broadcast time-state updates to all connected clients.
  - Update `GrandChronometronModal.tsx` and the mini-clock in `SlabletDesktop.tsx` to listen for server time overrides, syncing the celestial state across the entire party's devices simultaneously.

- [ ] **3.3 K.A.M.P. Elective Audit (Interactive Transcript)**
  - Expand the `KAMPAcademicProfile` type in `src/types.ts` to include an array of `completedCourses`.
  - Build a new tab or modal for the "K.A.M.P. Terminal" (currently showing "NO ACTIVE LINK").
  - Allow players to select a 30-credit loadout of courses (e.g., *Spynx 201: Aetheric Circuitry*).
  - Map specific courses to minor mechanical proficiencies or lore unlocks on the character profile.