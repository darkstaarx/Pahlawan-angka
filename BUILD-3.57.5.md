# v3.57.5 — Complete Sidma combat pass

Sidma now shares the grounded, journey-owned renderer used by Wira while keeping
Jejak Sigma as the regular dash attack and Rumus Penamat as the solo finisher.
Existing red/gold artwork is reused without modifying source images. Source-space
foot pivots preserve Sidma's body scale when the cape and large Sigma ring appear.

- Normal attack: stance, dash, Sigma contact, short hold, return and recovery.
- Counterattack: enemy advances, Sidma reacts, displayed HP changes at contact.
- Pet combo: existing pet animation leads by 420ms; Sidma contacts at 1070ms and
  finishes at 1820ms. The total gameplay damage remains 4.
- Finisher: actual painted enemy geometry anchors Sigma effects. HP and damage
  appear at 1430ms, before defeat begins. Pets do not participate in finishers.
- All Sidma fallback and finisher timers use battle journey ownership and are
  removed immediately on cancellation. Reduced-motion finishers remain visible.
- Existing Wira dispatch, Bunga behavior, retry/Coach rules and rewards remain.

## Validation

`node audit/combat-motion-v1.js` covers HP timing and gameplay-state integrity,
both heroes and attack directions, phase rendering, reduced motion, pet-first
timing, finisher routing/HP/defeat ordering, stale callbacks and release wiring.
Browser checks used a guest demo: desktop and 390px Sidma strike screenshots,
mobile Rumus Penamat, transition to the next enemy, and two incorrect attempts
followed by counterattack. Hero HP ended at 85%; no active motion or finisher
classes remained after the next question. Pet routing is covered by the script
fixture; the browser demo has no equipped pet.
