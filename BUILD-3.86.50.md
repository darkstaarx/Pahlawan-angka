# v3.86.50 — Darjah 1 Pecahan no longer keeps asking for 1/2

## Cause
- The D1.FRAC deck alternated by denominator: half, quarter, half, quarter … Every "denominator 2" item can only have the answer 1/2.
- 90 of the 240 templates are half-only (fold, share between 2, "setengah", half remaining).
- So in a live session about 10 of 12 answers meant half (1/2, 2/4 or setengah).

## Fix (`questions/d1/fractions-audit-v1.js`)
- Rotate by answer instead: the next target is an answer (1/4, 1/2, 3/4, 2/4) not used in the last two questions, and never the same value as the previous one (no 1/2 → 2/4 → setengah runs).
- The target is worked out from `sess.questionHistory` (the questions actually shown), because `generate()` may call the bank several times and keep only one candidate.
- A template is still never repeated before the deck is used up.
- `audit/d1-fraction-variety.test.js` now checks the new rule (no same value back to back in the first 100; each of 1/4, ½, 3/4 appears at least 20 times) instead of enforcing the old half/quarter alternation.

## Verification
- Live chain in the app, 200 questions: 1/4 ×61, 3/4 ×61, 2/4 ×42, 1/2 ×36. 0 same answer back to back, 0 half-valued answers back to back.
- d1-fraction-variety passes. d1-hardening fails on the same D1.MONEY check as before this change.
