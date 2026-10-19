# D5 question language aligned with UASA model papers

Darjah 5 questions now follow the wording and number format of the myUASA Matematik Tahun 5 model papers 1 and 2 (practice papers, not official KPM papers). The changes cover wording and format only: no Darjah 5 skill, topic or difficulty band is added or removed.

- Questions are full sentences ("Nyatakan nilai digit bagi digit 4 dalam 946 718.", "Berapakah baki wang Devi?") in place of note-style endings such as "Baki?", "Nilai asal?" and "Penilaian?". Story items use penjodoh bilangan and everyday Malaysian names.
- Darjah 5 numbers use UASA digit grouping (485 362, RM1 250), as Darjah 6 already did. Liquid volume uses ℓ and mℓ.
- Fraction multiplication asks for the simplest form; improper results are mixed numbers and operands are in simplest form. Expanded form leaves out zero terms.
- Coordinates are written (3, 2), stay in the first quadrant, and use "jarak mengufuk / mencancang … dalam unit".
- Removed "latihan", "hipotetikal", "ditunjukkan/ditanya", "mata peratus", "Berapakah hasilnya?" and containers that hold km.

Shared fixes that also reach other grades:
- Number words use "seratus" (not "satu ratus").
- Estimation questions keep every wrong choice a full rounding step from the answer, so the item is solvable by estimating.
- Written-column addition no longer offers 0 as a choice.
- Option de-duplication keeps mixed numbers apart ("1 1/11" is not "11/11").
- Ratio items (D4–D6) are written 2 : 3 and never 1 : 1; rate items use penjodoh bilangan.

## Validation

- `node audit/d5-uasa-language-qa.js` (new): 10,800 D5 questions across 18 skills and three learner stages, 207,754 checks covering wording, number format, units, simplest-form fractions, distinct and meaningful choices, and independent arithmetic for single-operation sentences.
- 4,500 D5 questions sampled in headless Chromium through the full release loader: no runtime errors.
- All 117 D1–D6 skills generate without errors or duplicate choices (14,040 samples, same as before the change).
- Existing audits: the same pass/fail set as before the change. `audit/reasonableness-choice-v3.26.5.js` and `audit/money-d45-release.cjs` were updated to the new wording. `audit/d4-completion-qa.js` compares `questions/helpers.js` with the last commit, so it passes once this change is committed. `audit/year6-money-real-v3.60.5.js` fails intermittently on the old code as well (`formatClockTime is not defined`).

A separate production release is required before the live site receives these changes.
