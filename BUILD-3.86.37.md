# v3.86.37 — Darjah 1 choices and wording

## Sensible choices for Year 1
- New `PAOptionIntegrity.refineYoung` (D1 only), after `sanitize` in `generate()`:
  - Replaces Q()'s generic fillers (110, 12, "13" beside betul/salah) and any number above 100.
  - Numbers stay within 0–100 (tens for rounding answers); money uses sen/RM near values; ordered lists get other orderings; number words get neighbouring number words; fractions use halves/quarters and never an equivalent fraction (no 1/2 beside 2/4).
  - "Semak kewajaran" items keep distractors ≥30 from the answer, so they stay far from the estimate.
- Authored distractors fixed: coin and note choices are real Malaysian money (no RM4, 15 sen, 500 sen, "30 RM", "0 sen"); betul/salah items no longer mix in a number or a rule.

## Simpler wording for 7-year-olds
- "Penilaian?" → "Betulkah?"; "paling munasabah" → "paling dekat" / "Apakah yang berlaku…"; "Bila kenyataan Hakim betul?" → "Betulkah kata Hakim?"; "Jisim relatif beg" → "Beg itu seberat berapa blok?"; the measurement-vocabulary hint lists the word pairs instead of "perbendaharaan kata".

## Kept on purpose
- Counting by 4 in Year 1: Year 2 stretch item for the Segel Emas advanced-learner check.

## Audit
- `reasonableness-choice-v3.26.5.js` now reads grouped digits (37 425). Since v3.86.32 it misread D6 prompts as "425 − 37", which looked like a random failure.

## Verification
- 3,360 D1 samples across all 56 standards: 0 duplicates, 0 choices above 100, 0 equivalent-fraction distractors, every question has 3 wrong options.
