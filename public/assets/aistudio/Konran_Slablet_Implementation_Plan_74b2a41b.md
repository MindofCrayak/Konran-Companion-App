# Konran Slablet: Implementation Plan

*Compiled Oct 27, 2026 from the audit of the konra-app upload and your canon answers. Draft for review.*

## 1. How to read this plan

Phases are ordered by dependency: canon first, then the clock, then quiz and badge logic, then security and LegendKeeper, then polish and new features. Each task has an ID, the files it touches, and a "done when" test. Items marked **(OPEN)** depend on a question you haven’t answered yet. For each one the plan states the default I’ll use, so work can proceed and be corrected cheaply later.

Sizes: **S** is under an hour, **M** is a few hours, **L** is a day or more.

## 2. Locked canon (from you)

- **Day:** 36 hours, Rule of 9. The "32 hours" line in the grounding doc was a typo.
- **Gods (The Nyne):** Lyricia, Oray, Ousava, Ay, Kayzoku, Vevayun, Psyon, Krayvuk, Slavyna. Celeste was renamed Vevayun. Ay is the short name and Ayan the full name (a title/pronoun/personality distinction).
- **Months:** the dial’s set, in the dial’s order: Ousavyn, Verdanya, Etheris, Anvylor, Solisvara, Tempestys, Aequitas, Velamyr, Kraytonis. The year starts with Ousava (birth) and ends with Krayvuk (death). 9 months of 27 days, a 243-day year.
- **Days:** the nine-day week named for The Nyne: Lyridi, Oraydi, Savadi, Aydi, Kaydi, Celestdi, Psyondi, Kraydi, Slavydi (from the grounding doc). The dial’s old day names (Pacem, Fortudo…) were working names and are retired.
- **Retired working names:** the engine’s months ("Lyricia’s Ledger"…), the festival dates written against "Ousava’s Renewal"/"Vevayun’s Forge", and the engine’s divine-plane names.
- **Planes and classified lore:** your deity records and classified lore are canon. The engine’s plane names are not.
- **Houses:** only four K.A.M.P. houses: Hydra, Gryffon, Spynx, Unycorn. No new assignments for seeded characters until the K.A.M.P. sorting quiz ships.
- **Time:** track real time for now.
- **Dial:** "XIIX" for 18 is intentional, and 18 is noon on the 36-hour day.
- **Domains:** Ay is not a temporal-stasis god; Krayvuk is time. You’ll update the deity text later.

## 3. Open decisions and the defaults used

- **O1. Moons.** Is Eyenath another name for Ayanath, or a third body? What are the real orbital periods (the grounding doc says 16.2 h and 41.4 h; the engine uses 28 and 60 days)? *Default:* two moons, Olysphere and Ayanath; periods live in one config constant; engine values kept until you confirm.
- **O2. Noon and the passes.** With 18 as noon, hour 0 is midnight. What do Pass I and Pass II (Daywatch/Nightwatch) now mean? *Default:* label by hour 0–17 = "Dawnward pass", 18–35 = "Duskward pass" as neutral text, and the sun peaks at hour 18 at the top of the dial.
- **O3. In-world date for today.** *Default:* keep the current anchor so nothing jumps, but compute Age/Year instead of hard-coding them. The anchor lives in one place for you to edit.
- **O4. Fixed weekdays.** Because 27 and 243 both divide by 9, every month starts on Lyridi, so day-of-month fixes the weekday. *Default:* yes, that’s intended.
- **O5. Vevayun’s weekday.** Is "Celestdi" renamed? Should the code ID change from `Celeste` to `Vevayun`? *Default:* rename the ID, and keep the weekday string "Celestdi" as one editable config value.
- **O6. The O Order.** The grounding doc says Lyricia, Ousava, Vevayun; the deity records say Lyricia, Oray, Ousava. *Default:* leave the data as is, flag it in the validation test.
- **O7. Minutes and seconds.** *Default:* 60 minutes × 60 seconds, as now.
- **O8. Tides and eclipses.** Canon or engine inventions? *Default:* keep tides (derived from Olysphere’s phase), switch eclipses off behind a flag.

## 4. Phase 0: Housekeeping and foundation (S–M)

- **0.1 Rewrite the grounding doc (S).** One consistent canon: 36-hour day, the month list, the weekday list, the moon periods once known. Remove the 32-hour line and the contradictory moon values. *Done when:* the doc has no internal conflicts.
- **0.2 Create a single source of truth (M).** New `src/data/canon.ts` exporting GODS, MONTHS, DAYS, HOUSES, MOONS and ANCHOR. Everything else (engine, dial, codex, quiz) imports from it. *Done when:* no month, day, god or house name is typed anywhere else.
- **0.3 Fix the asset folder (S).** Rename `public/assests` to `public/assets`, update the 11 references and the sprite path in `celestial.ts`, and delete the duplicate folder and unused ring images (or wire them in).
- **0.4 Remove AI Studio leftovers (S).** Drop unused `@google/genai`, `express` and `dotenv`; rename the package from `react-example`; replace the README banner; remove `metadata.json` and `.env.example`; point the `@` alias at `src`; fix the `clean` script.
- **0.5 Add a test runner (S).** Vitest, with the first tests landing in Phase 2.

## 5. Phase 1: Propagate canon through the code (M–L)

- **1.1 Vevayun rename (M).** Change `NyneDeityId`, the deity map key and name, quiz option IDs and the weekday/month data. Add a localStorage migration that rewrites saved `Celeste` keys in quiz scores, declared deities and party records. *Done when:* a profile saved before the change loads with no lost data.
- **1.2 Houses (M).** Replace `KAMPHouseId` with the four canon houses. Remove the eight legacy houses from the types, the character-creation dropdown (replace with the four plus "Unsorted"), the seed characters and the lore requirement. Seeded characters become Unsorted, with their house boons hidden. Add a migration that clears any stored legacy house. The Oray lore entry that required House Pyros is changed to a deity-only requirement. *Done when:* a search for the eight legacy names returns nothing.
- **1.3 Calendar names (S).** Build the engine’s months and weekdays from `canon.ts`. The engine’s invented month virtues and gemstones are kept as placeholders marked for your review.
- **1.4 Festivals (M).** Rewrite festival entries in `worldLore.ts` and `deities.ts` against the real months, and rebuild the engine’s feast table from that single list. Two entries sit on days that don’t exist (28th Ousava’s Renewal, 30th Psyon’s Veil) and need a real day from you. Add a validation test (day ≤ 27, month exists).
- **1.5 Planes (S).** Delete the engine’s invented plane list and derive planes from each deity’s `homePlane` (plus Duathyer from the classified lore). *Done when:* no plane name appears that isn’t in your records.
- **1.6 Ay and Ayan (S).** Show "Ay" in short UI and "Ayan" in the codex full title.
- **1.7 Domain text (S).** Replace the engine’s invented day and month blurbs with each deity’s own `domains` string. You fix the Ay and Krayvuk text later.
- **1.8 Canon validation test (S).** Every god appears in the months, days, deity records and quiz; no legacy house string appears; every festival date is valid; the O Order membership is flagged (O6).

## 6. Phase 2: Clock engine rewrite (L)

All bugs below were reproduced by running the current `celestial.ts`.

- **2.1 Single time pipeline (M).** One function converts a real timestamp into in-world days and seconds. Remove the `input < 100000000` heuristic that guesses whether a number is a timestamp or a simulation offset. Give simulation its own explicit entry point and drop the stray ÷1.5.
- **2.2 Fix date rollover (S).** The date currently flips when the clock reads 08:00, because an 8-hour offset is added to the clock but not the calendar. Apply it to both. *Done when:* the date changes exactly at 00:00:00.
- **2.3 Compute the epoch label (S).** "AGE V // YR 118" is hard-coded while the computed year is 119. Derive it from the anchor. Age boundaries need a rule from you; until then Age stays V.
- **2.4 Anchor config (S).** (O3) One ANCHOR constant in `canon.ts`.
- **2.5 Weekday rule (S).** (O4) weekday = (day of month − 1) mod 9.
- **2.6 Moon phases (M).** The current phase is measured against the sun’s daily rotation, so Olysphere cycles from full to new in about 16 hours. Compute phase from the moon’s own orbital angle only, with periods from `canon.ts` (O1) and Ayanath retrograde. Remove the `Lyra`/`Eyenath` working names.
- **2.7 Tides and eclipses (M).** (O8) Derive tides from the corrected phase. Eclipses are currently "imminent" about 14% of the time; put them behind a flag, off until the rules are confirmed, and retune so they’re rare when enabled.
- **2.8 Noon and passes (S).** (O2) Rework hour-hand, sun position and pass labels to match "18 is noon".
- **2.9 Engine tests (M).** Date flips at midnight; the weekday cycle repeats every 9 days; the month and year roll over at 27 and 243; a moon’s phase cycle equals its configured period; results are deterministic for a given timestamp; eclipse frequency stays under 1%.

## 7. Phase 3: Clock UI (M–L)

- **3.1 Dial labels from canon (S).** Replace the dial’s month and day arrays with `canon.ts`. The sub-rings must show the real names, in order, with each god’s glyph.
- **3.2 Make the Chronometron live (M).** It currently opens at a fixed "Day 1, 08:00" while the mini-clock shows real time. Default both to real time, with an explicit Simulate mode and a "Return to now" button. One shared time hook feeds both clocks.
- **3.3 Fix the Liturgical Week tab (S).** It reads `.patron` and `.significance`, which don’t exist, and shows "undefined". Use the real fields, and add the day’s feast and the next feast.
- **3.4 Legibility (M).** Nothing smaller than 10 px at phone width. Complication gauges are enlarged or open a tap-to-expand panel. Size the dial as min(92vw, 460px) so it can’t overflow a 360 px screen.
- **3.5 Performance (M).** The modal re-renders about 60 times per second. Update the digital readout at 1 Hz, animate only what must sweep, pause when the tab is hidden, and memoize the engine call.
- **3.6 Globe tie-in (M).** Drive the globe’s moons from the engine’s angles instead of arbitrary spin speeds, and pause rendering while a full-screen overlay covers the globe.
- **3.7 Accessibility (M).** Focus trap and `role="dialog"` on every modal, Escape closes all of them, labels on icon buttons, and a global reduced-motion rule.

## 8. Phase 4: Quiz, trials and badge logic (M–L)

- **4.1 Balance the quiz (M).** A random answerer currently lands on Lyricia 16.5% of the time and Psyon 6.2%, and 21% of runs tie. Give every god the same number of primary and secondary slots (Psyon has only 8 primary slots), and keep a simulation script in the repo. *Target:* every god within about ±1.5 points of 11.1%. You approve any rewritten option text, since it’s your lore voice.
- **4.2 Tie handling (S).** Break ties first with secondary-slot counts, then the Crossroads screen only for true ties.
- **4.3 Guest isolation (S).** The "guest persona" path currently overwrites the active character’s sealed trial. Guest runs must never write to a character.
- **4.4 Explicit covenant binding (M).** The quiz currently auto-binds the god, so the "Seal Divine Covenant?" prompt never appears. The quiz records scores only; binding is a separate confirmed action (or DM-granted).
- **4.5 Save once (M).** The result screen saves a roster entry and posts to the Google Sheet on every view, including read-only inspections. Move saving into the quiz-completion step, keyed by a trial ID, so viewing is read-only and duplicates are impossible.
- **4.6 The Google Sheet endpoint (S–M).** The Apps Script URL is hard-coded and public, so anyone can post junk, and the "synced" status always shows success because of `no-cors`. Rotate the URL, move it to an env var, relabel the status "Sent", add a one-line disclosure that names are submitted, and route it through the Phase 5 proxy when ready.
- **4.7 Retake policy (S).** Players get one attempt; DM overrides are logged and prior results kept as history.
- **4.8 Edge cases (S).** No saved scores shows "No result yet" instead of defaulting to Lyricia. The secondary god can never equal the primary.
- **4.9 Quiz tests (S).** Scoring, back-navigation score reversal, tie resolution and guest isolation.

## 9. Phase 5: Security and LegendKeeper (L)

- **5.1 Decide the threat model (S).** Table of friends, or a wider audience? This decides how far to go. The current setup has a visible Archivist toggle that any player can click, roles stored in localStorage, and classified lore shipped in plaintext in the bundle.
- **5.2 Read the API docs first (S).** From what’s public: LegendKeeper has an official TypeScript SDK; keys are created per project under Project Settings → Developers → API Keys, and require the owner to be on a paid plan; a key acts as the user who created it, limited by its role; keys must stay server-side, and the API doesn’t accept requests from other sites’ browser pages. Before building, read the API reference and OpenAPI spec for rate limits and what’s readable.
- **5.3 Build a small proxy (L).** A Cloudflare Worker or Vercel function holds the key and returns only what a given requester is cleared to see. CORS locked to your origin.
- **5.4 Real identity (M).** The DM issues each character a signed badge token (code or link); the server validates it and derives role and clearance. Remove the Archivist toggle from the player UI; the DM gets a separate authenticated entry.
- **5.5 Move secrets out of the bundle (M).** Remove `unredactedContent` from `classifiedLore.ts`. Keep only the non-secret requirement rules locally. Full text comes from LegendKeeper through the proxy, and cloaked entries return nothing at all.
- **5.6 Content mapping (M).** Decide how LegendKeeper pages map to classification and requirements (tags or page metadata). Replace the hand-rolled markdown renderer with one that handles LegendKeeper blocks.
- **5.7 Cache, rate limit and fall back (S).** Cache responses, and fall back to bundled public lore if the API is down.
- **5.8 Cross-device persistence (M).** Characters and trials currently live only in localStorage. Move them to a small server store so a player’s badge works on their phone and laptop, with a one-time import of existing local data.

## 10. Phase 6: Performance and polish (M)

- **6.1 Image weight (M).** Assets total about 15 MB. The moon and sun PNGs are 1–2 MB each but display near 14 px. Resize sprites to 256–512 px WebP and the globe map to about 2048 px. *Target:* under 3 MB excluding the map.
- **6.2 Remove third-party dependencies (M).** Self-host the deity portraits (imgur) and the three custom fonts (currently hot-linked from a GitHub repo); confirm font licenses. Load `html2pdf` as an npm module, not from a CDN.
- **6.3 Define the missing animation (S).** `animate-fadeIn` is used 12 times and never defined. Add it to the Tailwind theme.
- **6.4 Markup cleanup (S).** Remove the nested duplicate `<main>` landmark; check non-standard z-index classes.
- **6.5 Persist the audio setting (S).** The account already has an audio flag that isn’t wired up.
- **6.6 Footer coordinates (S).** 47°12′N / 08°44′E is a real place in Switzerland. Keep as an Easter egg or replace.

## 11. Phase 7: Features (L, as scheduled)

- **7.1 Badge v2.** A full-screen, shareable credential: DM-issued, QR code, a "present to NPC" view, and standings at a glance.
- **7.2 K.A.M.P. sorting quiz.** Replaces the temporary Unsorted state and assigns one of the four houses. Needs your house descriptions and boons.
- **7.3 K.A.M.P. Terminal and Obsydian Exchange.** Currently placeholder buttons. Decide scope or hide until ready.
- **7.4 DM tools.** In-world date override, session panel and clearance grants.
- **7.5 Codex from LegendKeeper.** Pull deity and world entries live.

## 12. Suggested milestones

1. **M1: Canon and clock correct.** Phases 0, 1, 2 and 3.1–3.3. Everything visible is right and testable.
2. **M2: Quiz and badge integrity.** Phase 4.
3. **M3: Light, fast, accessible.** Phase 3.4–3.7 and Phase 6.
4. **M4: Secure and connected.** Phase 5.
5. **M5: New features.** Phase 7.

## 13. Definition of done

- All canon tests pass, and a search for any retired name returns nothing.
- The clock matches a hand calculation at five chosen timestamps.
- A quiz simulation shows no god above 12.5% or below 9.7%.
- Viewing a saved result creates no new records and sends no data.
- A player can’t reach classified text through the UI, DevTools or the network tab.
- The first load is under 3 MB excluding the globe map, and passes a keyboard-only walkthrough.
