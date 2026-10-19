# D5 UASA completion: item types from the model papers

Adds `questions/d5/completion-v1.js`. It is loaded straight after the final Year 5 bank and wraps only `PAQuestionBanks.d5`. It adds the Darjah 5 item types in the myUASA Matematik Tahun 5 model papers 1 and 2 (practice papers, not official KPM papers) that the bank did not assess yet. Existing D5 families stay in rotation.

| Skill | New item types (minimum learner stage) |
|---|---|
| D5.N1000000 | Smallest/largest whole number that rounds to a given value (core) |
| D5.MONEY | Subtraction up to RM1 000 000 (beginner); missing value, down payment, receipt line/total/change, first-year interest (core); second-year compound interest (secure) |
| D5.MEASURE | `45 × 380 mℓ = ___ ℓ`, rope lengths in m/cm, packets in kg (beginner); three mixed-unit terms in kg/g and km/m/cm, syrup shared into bottles (core); percentage of rope left, remaining mass in kg and g (secure) |
| D5.TIME | Decimal hours to hours and minutes (beginner); trip time in hours and minutes, fraction of a year plus months, inclusive days between two dates (core) |
| D5.RATIO | Part to total, in simplest form (beginner: class counts; core: mass/volume with unit conversion) |
| D5.RATE | Distance from fuel used (core); time for a larger job in hours and minutes (secure) |
| D5.DATA | Pictograph difference and total (beginner); pictograph mean, median from a frequency table, mean over five days (core); projection from the mean (secure) |
| D5.OPS | "Saya fikir satu nombor" inverse operations and a multi-step stock story (core) |

Stages follow the Year 5 bank (beginner: mastery < 35 or evidence < 2; secure: mastery ≥ 70 and confidence ≥ 55). `generate()` picks the deepest unseen candidate out of up to 16, so secure learners see mostly the new items. The old secure TIME items are three fixed questions that repeat. Existing families keep at least 10% of the questions for every skill and stage.

Years such as 2024 are wrapped in `<span data-no-group>`, and `groupText` leaves them unchanged.

## Validation

- `node audit/d5-completion-qa.js` (new): all 31 item types generated directly (250 each) and through the real dispatcher at three learner stages. Every answer is recomputed independently from `qaEvidence`. It also checks that each item reaches its learner stage and that existing families remain. 81,613 checks, all passing.
- `node audit/d5-uasa-language-qa.js` still passes with the new items in rotation.
- 5,400 D5 questions sampled in headless Chromium through the full release loader: no runtime errors, no duplicate choices. Eight new diagrams rendered at 390 px with no horizontal overflow.
- Existing audits: the same pass/fail set as before, except `audit/year45-curriculum-release.cjs`, which now also accepts `d5-completion-v1` as a D5 source. `audit/year6-money-real-v3.60.5.js` fails intermittently on the old code as well.

A separate production release is required before the live site receives these changes.
