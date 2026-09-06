# Pahlawan Angka v3.60.0 — Rumus Sigma restored, Gelombang Operasi closes to melee

## Scope

Two combat-presentation changes, plus the release cache-busting they need.

1. Sidma's ordinary attacks alternate again — Rumus Sigma (stationary ranged cast) and Jejak Sigma (dash).
2. Wira's Gelombang Operasi now closes the distance before planting the sword, instead of reading as a ranged shockwave.

No question, curriculum, adaptive-selection, scoring, mastery, reward, progression, cloud or artwork behavior is changed.

## Supersedes the v3.57.3 Sidma lock

`BUILD-3.57.3.md` locked every ordinary Sidma attack to Jejak Sigma, listing "Sidma ordinary attacks alternating into the unapproved stationary ranged move" as a release blocker. That lock is now lifted, but not by simply re-enabling the old path — the ranged move has been rebuilt in the canvas renderer, which is what actually draws Sidma's ordinary attacks.

The DOM module (`js/hero-sidma-v1.0.0.js`) was never the visible path for a healthy load: `triggerImpact()` calls `PACombatMotion.begin()` first and returns early when it succeeds, which for Sidma it always did. The canvas renderer only knew the dash — `cast-start-v1.webp` and `release-v1.webp` were never even loaded. Re-enabling the dispatcher alone would have changed nothing on screen.

What the ranged cast looks like now, in `js/combat-motion-v1.js`:

- Its own stationary pose timeline (`ready` → `cast` → `release` → `follow`), every phase interpolated through the existing `ease()`/`mix()` helpers, so there are no hard pose cuts.
- A charge swell during the cast hold, and a forward recoil on release, rather than a still frame held for 675ms.
- The Sigma bolt drawn on canvas, travelling from Sidma to the enemy between the release beat and contact (900ms), after which the existing impact ring and damage number take over.

`getNextNormalSkill` in `js/hero-sidma-v1.0.0.js` is a real alternating counter again and is the single source of truth: it is peeked by the canvas renderer, by the DOM fallback dispatcher, and by `js/battle.js`'s fallback timing, and advanced once by whichever path actually plays the attack.

The DOM fallback was tidied at the same time so it no longer looks broken on the rare loads that use it: `.sidma-frame` crossfades instead of cutting, and the recovery pose now holds until the enemy burst finishes (`T_IDLE_RETURN` previously fired at 1270ms, before the 1495ms impact-end, snapping Sidma to idle mid-explosion).

## Gelombang Operasi

The artwork (`assets/heroes/wira/frames/attack-pulse-v2.webp`) shows Wira driving his sword into the ground with ice erupting from the impact point, so it only reads correctly when he is standing beside the enemy. Two things stopped that:

- `paHeroPulse` moved him `34px` — the smallest travel of the four variants, against an arena gap of roughly 200px — so he struck the ground back at his own mark.
- `paPulseTrail` then flew the ring `62px` forward, which read as a projectile leaving him.

`js/action-variety-v3.30.0.js` now measures the real hero→enemy gap and publishes it as `--pa-pulse-dash-x`; `paHeroPulse` travels that measured distance, holds through the contact window so the plant lands next to the enemy, then returns. `paPulseTrail` expands radially at the plant point instead of flying, and the FX sits at ground level rather than mid-body. The other three variants are untouched.

Note this DOM variant path is what pet-equipped players see; without a pet, Wira's ordinary attacks are drawn by the canvas renderer, which already travelled to the enemy.

## Release wiring

`PA_APP_VERSION` is `3.60.0`, and the `?v=` cache-bust is bumped for every file changed here: `js/action-variety-v3.30.0.js`, `css/action-variety-v3.30.0.css`, `js/combat-motion-v1.js`, `js/hero-sidma-v1.0.0.js`, `css/hero-sidma-v1.0.0.css`, plus `js/version.js` and `js/pwa.js`. Files pulled in by `js/pwa.js`'s dynamic loader need no tag edit — their query is derived from `PA_APP_VERSION` at runtime.

## Verification

Headless Chromium against a local static server:

- Sidma alternates: consecutive ordinary attacks report contact delays 900ms (ranged) then 650ms (dash), with the shared counter advancing 1 → 2 → 1.
- The ranged cast is stationary: grouping per-frame canvas draws by pose, every hero pose group moves ≤2px, against a 149px travel group on the dash.
- The bolt is drawn only on the ranged attack, across 15 frames spanning 626–890ms.
- Gelombang Operasi: `--pa-pulse-dash-x` resolves to the measured gap (106px in the test viewport, against a 34px hardcoded nudge before), and the sprite's translateX ramps to it, holds through contact, then returns to 0.
- No console or page errors.

`audit/battle-runtime-blockers-v3.57.3.js` is left untouched as the frozen record of that release. It pins `?v=3.57.3` and `PA_APP_VERSION='3.57.3'`, so it has not passed since v3.57.5 and is not a living gate; its `sidma-five-dashes` assertion describes v3.57.3 behavior, which this release deliberately supersedes.
