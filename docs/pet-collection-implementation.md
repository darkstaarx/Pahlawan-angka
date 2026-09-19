# Pet Collection + Kembara Dimensi implementation

## Plan and ownership (before delegation)

1. Audit existing Aurora and approved roster; establish actual asset contract and preserve original art.
2. Implement additive, idempotent collection/save migration and independent-practice rewards, with deterministic RNG tests.
3. Implement silhouette collection, owned companion picker before expedition, calm encounter result and cosmetic evolution labels.
4. Integrate HTML/service worker; independently audit migration, guided-flow isolation, assets and browser flows; make small scoped commits and push current main if accepted.

| Owner | Exclusive writes |
| --- | --- |
| Agent 1 Asset Director | `assets/pets/**`, `docs/pet-assets.md` |
| Agent 2 Pet Systems | `js/pet-collection-system.js`, `js/rewards-v2.js`, `js/progression.js`, `js/pet-collection-system.test.js` |
| Agent 3 Collection UI | `js/pet-collection-ui.js`, `css/pet-collection.css` |
| Agent 4 QA / Integration (next available slot) | `audit/pet-collection-*`, QA report; other fixes only after ownership transfer |
| Lead | this design document, `index.html`, `sw.js`, `js/version.js`, integration report and Git |

No parallel writes to a shared file. Agents report findings, changed files, tests, blockers and handoff. Three available child slots mean QA follows the first completed implementation agent.

## Contract and invariants

- Retain existing pet IDs: aurora, ketupatKura, harimauBunga, kumbangManggis, arnabKekLapis, durianKerbau.
- Collection state: unseen → encountered → tamed. Aurora starts tamed and available; retain legitimate legacy ownership and all unrelated save keys.
- `db.petCollection[id]`: state, rarity, encounters, tameProgress, bondXp, level, evolutionStage, unlockedAt; `db.expedition`: rank, xp, activePetId, encounterPity plus replay protection.
- Independent completed practice exclusively grants rank XP, active-pet Bond EXP and two-stage encounter/tame rolls. Guided Cikgu Dimensi, demos, incomplete sessions and replayed completions grant none.
- Suggested rarity weights: Common 50, Uncommon 28, Rare 14, Epic 6, Legendary 2. Base tame rates: 85%, 65%, 45%, 28%, 12%. Per-pet trace increases follow-up tame chance with a finite guaranteed sighting cap.
- Rank unlocks encounter zones/tables independently from per-pet level; evolution stages at levels 10, 25 and 45. All pet benefits remain cosmetic. Duplicate encounters convert to cosmetic trace.
- Evolution art remains base fallback until reviewed art exists. Asset Director documents the Base/Evolution I/Evolution II/Final matrix and directions; no invented evolution images.
- Systems exposes a shared `PetCollection` API; agents agree exact calls before wiring. UI renders from system data, never duplicates reward calculations.

## Existing user work

At start, tracked modifications existed in game CSS, Bunga CSS/JS, index, learning, rewards-v2 and service worker, plus untracked collection and teaching assets. Preserve these changes; stage only task-owned new files and task-specific hunks. Existing collection art is input, not permission to replace unrelated assets.
