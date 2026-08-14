# Cikgu Wajar — Repair Report: Darjah 2 Bab 4 Wang

## Scope
Repaired only D2.4.1–D2.4.7 based on the findings in `CIKGU-WAJAR-AUDIT.md`. No adaptive-engine, battle, hero, monster, or unrelated UI changes were made.

## What changed

### D2.4.1 Nilai wang hingga RM100
- Added schematic local visuals for Malaysian-style RM notes and sen coins.
- Added denomination recognition, total-value and comparison variants.
- Supports sen, ringgit and mixed RM/sen values up to RM100.

### D2.4.2 Tambah wang
- Added 2-value and 3-value addition.
- Added sen-only, ringgit-only, mixed RM/sen and ringgit+sen combinations.
- Enforces result <= RM100.

### D2.4.3 Tolak wang
- Added 1 deduction and 2 deductions from a starting value.
- Supports sen and mixed RM/sen.
- Prevents negative answers.

### D2.4.4 Darab wang
- Added sen, mixed RM/sen and ringgit values.
- Added equal-price shopping context.
- Enforces result <= RM100.

### D2.4.5 Bahagi wang
- Added equal-sharing contexts.
- Uses exact divisible money values.
- Supports sen, mixed RM/sen and ringgit values.

### D2.4.6 Simpanan & kewangan
- Removed the invalid yes/no wording where the expected answer was a money amount.
- Replaced with natural questions asking the amount saved / remaining.

### D2.4.7 Masalah wang
- Added varied contexts: balance/change, multiple items, enough/not-enough, savings, total cost.
- Added price-tag visuals where appropriate.

## Visual helper additions
Added reusable helpers in `questions/helpers.js`:
- `moneyFmt(cents)`
- `moneyPieceSvg(cents)`
- `moneyVisual(cents)`
- `priceTag(label,cents)`
- denomination and distractor helpers

Visuals are schematic curriculum visuals, not emoji and not photorealistic currency reproductions.

## Validation
Generated 1,000 samples for each D2.4.x skill (7,000 total).

| Skill | Unique prompts / 1000 | Unique answers | Failures |
|---|---:|---:|---:|
| D2.4.1 | 200 | 38 | 0 |
| D2.4.2 | 900 | 495 | 0 |
| D2.4.3 | 639 | 325 | 0 |
| D2.4.4 | 297 | 99 | 0 |
| D2.4.5 | 237 | 38 | 0 |
| D2.4.6 | 520 | 233 | 0 |
| D2.4.7 | 571 | 212 | 0 |

Automated checks covered:
- runtime exceptions
- duplicate answer options
- negative money answers
- answers exceeding RM100 where restricted
- old `Boleh simpan?` wording regression
- basic prompt/hint integrity

Full machine report: `audit/wang-regression-report.json`.

## Status
**REPAIRED AGAINST CURRENT CIKGU WAJAR AUDIT.**

This does not by itself certify the entire Darjah 2 bank as formally KSSR compliant. Other chapters remain subject to the original audit findings and human curriculum verification where noted.
