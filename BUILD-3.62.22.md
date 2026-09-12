# v3.62.22 — Wira Chibi ice combo

Wira Chibi's normal attack now plays the supplied transparent 17-frame ice-combo sprite sheet through the production canvas renderer.

- The source rows are isolated into a clean 5 × 4 transparent grid, and only its 17 populated frames play.
- The runtime sheet is delivered as a 1,280 × 512 transparent WebP to cut the mobile download from about 1.9 MB to 179 KB.
- Damage, sound and enemy reaction land on the final slash at 1,050 ms.
- The running frames close the measured arena gap before the final slash, then hand back to the anchored idle pose.
- Pet-equipped Wira Chibi keeps the existing pet-first 420 ms lead, then plays the same full combo.
- Reduced-motion mode holds two readable poses instead of rapidly cycling the sheet.
- Wira, Wira Chibi's existing finisher, other heroes, questions, adaptive logic, HP rules and rewards are unchanged.
