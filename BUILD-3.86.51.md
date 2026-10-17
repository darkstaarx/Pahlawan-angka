# v3.86.51 — No more same answer twice in a row (all grades)

## Check
After the D1 Pecahan fix, every skill D1–D6 (117) was run through the live `generate()` chain, 30–40 questions each, measuring the most common answer, back-to-back repeats and repeated prompts.
- D2 and D6: nothing as bad as D1 Pecahan (top answer at most 33%). Three D2 skills had runs:
  - Bentuk 3D: 12/40 back to back, e.g. kuboid ×3.
  - Gundalan: answer 2 in 6 of 14.
  - Menganggar: 40 repeated.
- D3 Bentuk: every second question was the same fixed "Segi empat tepat mempunyai berapa sisi?" (also Year 1 level).

## Fixes
- `questions/index.js`: when choosing among candidates, a candidate with the same answer as the previous question of that skill costs +25 (+8 if it matches the one before). History now stores `answerKey`. This applies to every bank that goes through the selection loop.
- `questions/kssr-assessment-depth-v3.22.1.js` D3.SHAPE property: Year 3 polygons (3–8 sides), asking sides, vertices (bucu) or name, with a drawn regular polygon.

## Verification
- All 117 skills × 30 questions (3,510): 4 back-to-back repeats in total (was 12 in D2.7.1 alone).
- Bentuk 3D, Gundalan and Menganggar now show varied answers.
- Audit suite: same failures as the baseline. `year6-money-real` is intermittent (missing `formatClockTime` in the sandbox).
