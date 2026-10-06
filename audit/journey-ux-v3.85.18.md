# Journey and device UX verification — 2026-10-06

Prepared release: 3.85.18. Local changes only; live remains 3.85.17.

## Behavior

- Both side Glaciers start together after 120 ms, run the 11 frames over 780 ms, and fade before the central 1080 ms animation. Total impact duration stays 1700 ms; aura charge stays 1000 ms.
- All same-grade mission cards are enabled in Menu V2, original progression renderer and compatibility override. Grade filters and learning evidence remain intact. Ordinary adaptive and daily review pools no longer exclude later chapters using coreFrontier.
- Adaptive production runs retain their first selected skill's arena across subsequent topics and viewport changes. New runs get a new anchor.
- Weighted rescue includes Aurora and owned pets. Aurora/Kura become less frequent once normal level/ownership reaches Kumbang. Early access is bounded to two tiers, measured from independent correct first responses or completed missions; rescue thresholds and once-per-run Bond XP remain unchanged.
- Tablet portrait uses up to 720 px. Wide landscape uses battlefield and question columns. Narrow headers use two rows, touch audio/hint targets are 44 px, and short-screen cards retain readable question space with scrolling.

## Evidence

- `node --test js/pet-collection-system.test.js js/dev-pet-reward-debug-v1.0.0.test.js`: 23 passed. Includes saved weighted schedule replay, owned-pet repeats, early access, hint/retry metrics, invalid later-tier award, migration preservation and idempotency.
- `node audit/finisher-polish.cjs`: phone and desktop passed, including synchronized side frames, faster side advancement, thunder cue and cleanup.
- `node audit/journey-device-ux.cjs`: eight viewport cases passed: 390×844, 768×1024, 1024×768, 1440×900, 844×390, 360×640, 720×844, 960×844. Includes both maps for grades 1–6, last mission scrolling, stable actual arena URL across three topics, question/pet preservation on resize, readable short prompts and reachable result buttons. No page errors.
- Syntax checks passed for modified JavaScript; git diff whitespace check passed.
- Two existing read-only agents traced and reviewed changes. Astra spawn was rejected by session thread limit; no Astra review is claimed.

Browser coverage is headless Edge on the development computer with simulated viewports. Physical tablet/phone GPU performance, Safari and cross-device cloud accounts were not exercised. Cloud saves serialize the full profile state, including new access/schedule fields.
