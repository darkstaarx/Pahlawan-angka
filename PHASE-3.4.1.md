# Phase 3.4.1 — KSSR Estimate/Rounding Separation

Targeted correction for Darjah 2 Topic 1.

## D2.1.5 Menganggar
- Removed wording that mixed object estimation with "puluh terdekat" rounding.
- Prompt now asks for a reasonable estimate of the number of objects.
- Exact object count is no longer used as a distractor.
- Choices are approximate quantities only.
- Coach hint explicitly treats estimation as a near/reasonable value, not a rounding procedure.

## D2.1.6 Membundar
- Remains a separate skill using explicit numeric rounding to nearest tens/hundreds with a number line.

## Learning Camp
- D2.1.5 lesson language now explicitly distinguishes estimation from exact counting and rounding.

## Validation
- JavaScript syntax checks passed.
- Full D2 regression rerun: 1,000 samples per skill, 37 skills; no duplicate options or invalid-answer failures reported.
