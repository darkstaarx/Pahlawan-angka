# v3.62.24 — Production redraw for Wira Chibi attack

- Replaced the cleaned low-resolution source with a newly rendered 2,560 × 1,024 character-only spritesheet.
- Locked Wira's face, hair, headband, blue-and-gold armor, shield emblem and crystal sword to the canonical idle artwork.
- Removed all generated smoke, checkerboard, baked effects, blur and compression noise from the 17 animation cells.
- Re-measured every frame's centre and foot pivots for the new artwork while preserving the approved movement timing and arena baseline.
- Adjusted runtime scale to match the idle character instead of inheriting the old sheet's oversized cell ratio.
- Damage, contact timing, pet lead, enemy reaction and reduced-motion behaviour are unchanged.
