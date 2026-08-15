# Pahlawan Angka v3.20.0

## Daily Quest + Spaced Review

This release turns the existing passive daily counter into a short, evidence-driven daily review loop. It does not alter KSSR question generation, mastery formulas, curriculum integrity contracts, Cikgu Wajar teaching logic, battle layout, or parental time-limit controls.

### Product rules
- 8 questions per day; one completion reward; no daily streak mechanic.
- Prioritise fragile mastery, recent/repeated misconceptions, overdue practice, incomplete mandatory competency evidence, and Parent Focus.
- Parent Focus may occupy at most 3 of 8 questions so the daily review remains broad.
- Avoid immediate same-skill repetition when the available skill pool allows it.
- A clean confirmation scheduled after help/intervention outranks the prebuilt queue.
- Completion is based on finishing the short review, not achieving perfect accuracy; mistakes become tomorrow's review evidence rather than a punishment loop.

### New files
- `js/daily-spaced-review-v3.20.0.js`
- `css/daily-spaced-review-v3.20.0.css`
- `DAILY-REVIEW-LOCK-v3.20.md`
- `audit/daily-spaced-review-v3.20.0.js`
- `audit/daily-spaced-review-runtime-v3.20.0.js`

### Release layering
- Curriculum integrity: v3.18.1
- Sensory learning: v3.19.0
- Cikgu Wajar manipulatives: v3.19.1
- Daily Quest / Spaced Review: v3.20.0

Baseline: `809dc2a2ab4452206d7489a47677050140fdf340` (`.nojekyll` live Pages recovery commit above v3.19.1).
