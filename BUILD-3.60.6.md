# Pahlawan Angka v3.60.6 — Gelombang Operasi ice lands on contact

## Scope

One timing fix to Wira's `pulse` variant (Gelombang Operasi), plus the release cache-busting it needs. It follows the v3.60.2–v3.60.5 Year 6 curriculum releases and changes nothing they touched. No question, curriculum, adaptive-selection, scoring, mastery, reward, progression, cloud or artwork behavior is changed.

## The bug

The ice was appearing after Wira had already returned to his mark. Two things caused it, and one of them was a mistake in v3.60.1.

**The ice is the strike artwork, not an FX layer.** `js/action-variety-v3.30.0.js` creates `<img id="heroStrike">` and points it at the variant asset — for `pulse` that is `attack-pulse-v2.webp`, a single flat image containing both Wira and the erupting ice. The frame lives inside `.sprite`, so it rides the body transform. Its visibility is driven purely by the phase classes: on at `phase-contact`, off at `phase-recover`.

**v3.60.1 tuned dead CSS.** That release rewrote `@keyframes paPulseTrail` and the `.pa-attack-pulse .paAttackFx` rule to make a ring "erupt at the plant point". Nothing in `index.html` or `js/` ever creates an element with class `paAttackFx` — that whole block (`css/action-variety-v3.30.0.css`) is dead, so those edits never drew anything. They are reverted here to their original values, with a comment marking the block as unused.

**The timing was mapped against the wrong duration.** `paHeroPulse` was written assuming a 620ms animation. The rule that actually wins the cascade is `css/game.css:356` — `.unit#hero.attacking .sprite{animation:lungeRight2 .52s}` at specificity (1,3,0) — so the real duration was **520ms**; `css/action-variety-v3.30.0.css` only overrode `animation-name`.

That left this timeline (ms from animation start, which is `heroLead`):

| | ms |
|---|---|
| Body at enemy | 234 → 364 |
| Body home | 520 |
| Ice on (`phase-contact`) | 320 |
| Ice off (`phase-recover`) | 620 |

The ice window is 320–620ms but the body was only at the enemy 234–364ms — a 44ms overlap out of 300ms. After 364ms the ice was dragged backwards with the body and stayed lit for a full 100ms after Wira was home.

## The fix

`css/action-variety-v3.30.0.css` only:

- Give the pulse variant its own `animation-duration:700ms!important` alongside the existing `animation-name` override. It must stay under 720ms, because `js/battle.js` drops `.attacking` and the variant class at `heroLead+720` — past that the transform would snap home mid-flight.
- Re-map `paHeroPulse` onto that 700ms base: wind-back at 12% (84ms), arrive at 42% (294ms, just before the ice turns on at 320ms), hold to 93% (651ms), home at 100%. The hold runs past the nominal 620ms ice-off on purpose: the phase classes are `setTimeout`-driven and drift later under load, while the animation keeps its own clock — without that slack the ice reappears during the return on a heavy page.

The body is now planted beside the enemy for the entire time the ice is on screen. The other three variants (`original`, `dash`, `arc`) are untouched and still run the shared 520ms lunge.

## Verification

The v3.60.1 check missed this because it measured the body transform and forced `phase-contact` **separately** — never on one real timeline. This release's check samples both together while driving the real `triggerImpact()`, with a pet equipped so the DOM variant path runs:

- Animation resolves to `paHeroPulse` at `0.7s`, measured gap 106px.
- Across two runs (166 and 136 ice-visible samples), translateX is **106px on every one** — 100% at full extension, none anywhere near home.
- By the last sample while `.attacking` is still set, translateX is back to 0 — no snap.
- Variant duration check: `original`/`dash` → `lungeRight2` 0.52s, `arc` → `paHeroArc` 0.52s, `pulse` → `paHeroPulse` 0.7s.
- No console or page errors.

These are automated checks against a local static server, not play-testing on the deployed site.
