# v3.86.42 — Gerai Wirayung Focus check and Year 1 "=" question

## Gerai Wirayung (Kemahiran Fokus · Wang)
- Plain-number checks ("Kira nombor tanpa wang") now use the answer of the sum shown. Before, the second check showed `3 + 5 = ?` with the money answer (6), so 8 was missing from the choices. Multiply, divide and profit checks had the same mismatch.
- Reports from the faulty version (`2.2.0-live-gerai`) are ignored in Kemahiran Fokus and the parent report, so they no longer push the child into operation practice. New reports are tagged `2.2.1-live-gerai`.
- The child plays a full set of 8 orders before the check: orders 1–6 are normal, 7–8 are the matched money orders, then the two plain-number checks.
- After the check, "Sambung berniaga →" shows the set summary and play continues. Before, the game stopped on the check card.

## Year 1 · 2.1.2 Makna Sama Dengan
- Removed the "hasil operasi" option: 9 is the result of 6 + 3, so a pupil choosing it should not be marked wrong. Replaced with "tanda untuk tolak".
- Numbers now vary (a + b = c up to 9) instead of always 6 + 3 = 9; feedback names the two equal values.

## Verification
- Playwright, D1 Gerai Focus: 6 normal orders → 2 matched orders → checks `1 + 4` (answer 5) and `3 + 5` (answer 8) both offered → set summary → orders 9 and 10 play normally.
