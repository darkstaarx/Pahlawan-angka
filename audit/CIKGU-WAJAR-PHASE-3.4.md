# CIKGU WAJAR — Phase 3.4 Full Darjah 2 Repair

Date: 9 Aug 2026

## Scope
Repair all 37 Darjah 2 skills against the findings in the prior `CIKGU-WAJAR-AUDIT.md`, while preserving the adaptive coach, battle flow, Restu Parent, hero selection, and existing UI.

This phase is an engineering/curriculum repair against the current DSKP mapping used by the project. It is not a claim of formal KPM certification.

## Main repairs

### Bab 1 — Nombor
- Added comparison in both directions and > / < symbol questions.
- Added base-10 representation.
- Split number sequence and number-pattern behaviour.
- Expanded number writing to angka -> perkataan and perkataan -> angka.
- Removed awkward `+ 0` expanded-form output.
- Added visual estimation and number-line rounding to tens/hundreds.
- Expanded word problems to addition, subtraction and comparison.

### Bab 2 — Operasi
- Addition now covers 2 and 3 addends within 1000.
- Subtraction now covers one deduction and two deductions from one starting number.
- Multiplication covers one-digit x one-digit and one-digit x 10.
- Division covers fact families, division by 10, and remainder variants.
- Word problems now rotate across addition, subtraction, multiplication and division.

### Bab 3 — Pecahan & Perpuluhan
- Rebuilt fraction distractors; invalid strings such as `2/101` are no longer generated.
- Added fraction visuals and actual fraction comparison.
- Added tenths visuals, number-line representation and decimal comparison.
- Separated relationship questions from story/application questions.
- D2.3.4 now generates actual daily-context problems rather than sharing D2.3.3 code.

### Bab 4 — Wang
- Retains the prior Cikgu Wajar repaired money bank.
- 2/3-value addition, 1/2 deductions, sen/RM/mixed, multiplication, division, savings and varied word problems remain active.
- Existing 7,000-sample Wang regression remains included.

### Bab 5 — Masa
- Rebuilt clock reading around an actual analog clock visual.
- Expanded time relationships beyond only day -> hour.
- Added hour/minute and week/day relationships.
- Added visual timelines and non-whole-hour durations.

### Bab 6 — Ukuran
- Replaced fixed unit-only questions with actual ruler, weighing-scale and measuring-cylinder reading.
- Keeps unit-selection and comparison variants as supporting assessment, not the whole skill.
- D2.6.4 now rotates length, mass and liquid-volume problems with addition/subtraction.

### Bab 7 — Ruang
- Uses the Year 2 3D set currently mapped by the audit: cube, cuboid, square-based pyramid, cylinder and cone; sphere removed.
- Added visual identification and cube/cuboid nets.
- Removed ambiguous 2D property prompts where square and rectangle could both be accepted.
- Increased shape prompt diversity and contextual applications.

### Bab 8 — Data
- D2.8.1 now assesses collection/organisation through tally tables and raw-data grouping.
- D2.8.2 uses a real visual bar chart with scale.
- D2.8.3 uses sum/difference/two-step chart questions.
- Unique generated bar values prevent ambiguous ties in max/min questions.

## Anti-repeat change
`questions/index.js` now keeps visual markup in the question fingerprint. Different clock/ruler/chart states are therefore recognised as different questions, while an exact repeated visual+stem+answer remains blocked by the recent-question history.

This is important for visual topics where the old fingerprint removed all HTML/SVG before comparison.

## DSKP cross-check resolved
The earlier audit marked D2.2.3 and D2.2.4 for human review. Phase 3.4 cross-checked the Year 2 DSKP text and aligned the generators to:
- multiplication: basic facts for one-digit x one-digit plus one-digit x 10;
- division: basic division facts including without/with remainder, and division of a two-digit number by 10.

Sources reviewed: DSKP KSSR Semakan 2017 Matematik Tahun 2 reproductions carrying the KPM/BPK document text (FlipHTML5 / AnyFlip mirrors).

## Automated regression
Harness: `audit/full-d2-regression.js`
Report: `audit/full-d2-regression-report.json`

- 37 skills
- 1,000 generated questions per skill
- 37,000 generated samples total
- Runtime exceptions: 0
- Duplicate answer-option samples: 0
- Invalid fraction regression samples: 0
- Required visual generators exercised: PASS
- Full regression failures: 0

## Status
**READY FOR USER FEEDBACK TESTING.**

Important: this means the known findings from the current Cikgu Wajar audit have been repaired/tested in code. It does not replace a formal curriculum/content sign-off by KPM or a human mathematics curriculum specialist.
