# v3.86.32 — Answer-option integrity and Darjah 6 number format

## Answer options (all grades)
- New `PAOptionIntegrity` layer in `questions/index.js`, run on every generated question.
- Removes wrong options that repeat each other or repeat the correct answer, so a pupil can no longer tap a second copy of the right answer and be marked wrong.
- Removes negative distractors when the answer is a non-negative number.
- Refills removed numeric options with near values in the answer's own format (RM, units, decimal places), so questions keep four choices.

## Darjah 6 root-cause fixes
- 1.1.1 order numbers: wrong orders are always distinct.
- 1.1.4 decimal million: replaced the distractor that always equalled `p/10`.
- 1.1.5 next term: replaced the `start+3` distractor with `answer + 2 × step`.
- 1.2.1 unknown: replaced `x+5` (often equal to `total ÷ b`) with an added-instead-of-subtracted distractor.
- 1.2.1 story: removed negative distractors; uses forgot-to-subtract, added-instead and one-box-off errors.
- 2.1.1 `whole ÷ 1/d`: `whole + d` equalled the answer for 2 ÷ 1/2; replaced with the unchanged whole number.
- 2.1.1 `fraction ÷ whole`: removed the repeated 1/2 for 3/4 ÷ 2; uses the undivided fraction.
- 3.x profit/loss value: `profit + cost` and `loss + sell` repeated another option; now cost + sell.
- 4.1.1 offsets: distractors filtered for distinctness when one city is UTC+0.
- 4.1.2 simple conversion: replaced the unconverted time with the wrong-direction conversion.
- 4.1.1 / 4.1.2 wording: "lebih awal" replaced with "di hadapan" for time-zone comparisons.

## Darjah 6 digit grouping
- Prompts, hints, answers and option labels group digits with spaces, as in UASA papers: 7 050 410, 6 000, RM1 302.50.
- Runs after `PAGameQuestionInteractions.prepare()`, so typed-answer specs keep plain numeric values.
- Bare arithmetic prompts (for example `50219 + 11550 = ?`) are left unchanged for the written-column renderer.
- Text inside HTML tags and SVG is never changed; decimals, times, fractions and coordinates are left as they are.

## Verification
- 2,850 generated Darjah 6 questions across all 38 KSSR nodes and three ability bands: 0 duplicate options, 0 answer echoes, 0 negative distractors, 0 comma-grouped numbers, every question has 3 wrong options.
- Audit suite: same pass/fail set as v3.86.31. `year6-money-real-v3.60.5.js` is intermittent on both versions (immediate-repeat check is random).
