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

## Follow-up: space items, 2.5D graphics and planned choices

- D5.AREA gains three item types from the model papers. Area of a square joined to a rectangle, given the square's area (core). Perimeter of a square joined to a regular pentagon, hexagon or octagon, given the square's perimeter (core). Volume of a cube joined to a cuboid whose width equals the cube's edge (secure).
- Every graphic in the completion layer is a labelled 2.5D SVG scene in the Year 1 measurement style (`kssrDiagram paU6Scene`): raised slabs with side faces, oblique cube/cuboid, bucket, road with map pins, and person tokens for pictographs. Info cards get a raised edge. Each scene carries an `aria-label` with the values needed to solve it.
- D5 choices no longer fall back to `Q()` padding ("903 010", "13", "Tidak pasti"). Templates whose candidates could collide now carry spare misconceptions. `Q()` keeps the first three unique choices instead of throwing when more than three are supplied.

Validation: `audit/d5-completion-qa.js` (34 item types, 96,161 checks, and every graphic must be a 2.5D SVG scene) and `audit/d5-uasa-language-qa.js` (no filler choices, 218,395 checks) pass. 5,400 D5 questions in headless Chromium: no errors, no duplicate or placeholder choices. All 117 D1–D6 skills generate as before. Existing audits keep the same pass/fail set; `audit/d4-completion-qa.js` passes once `questions/helpers.js` is committed.

## Follow-up: balance, varied Year 5 items, grouped sentences and D4 format

Every change is checked against the myUASA Tahun 5 model papers.

- **Balance.** The D5 layer decides once per question slot instead of per bank call. The slot is keyed by the newest history entry. Core and secure learners now see about half Bahagian B-style items (stories with a Rajah) and half existing families, as in the papers; beginners see about 30%. Before this change, `generate()` picked the new item in almost every slot. D4's completion layer had the opposite problem (its new tasks reached learners about once in 6 000 questions) and now uses the same per-slot decision with its original chances.
- **Varied Year 5 items.** Thirteen Year 5 items that always showed the same numbers are now generated. TIME: missing_duration, compare_duration, time_claim. DATA: pie_read, pie_quantity, pie_compare, pie_claim, stat_claim, range_change. AREA: composite_area, composite_volume, missing_angle, perimeter_claim, volume_claim. MEASURE: claim. Each claim can now be true or false. Beginner pools are wider: polygons with 3–8 sides and more decimal and fraction values.
- **2.5D graphics.** Year 5 graphics (regular polygon, rectangle + triangle, L-shape, pie chart as a thick disc) come from `questions/d5/scenes-v1.js`, a scene kit shared with the completion layer and loaded before the Year 5 bank.
- **Number and unit format.**
  - Bare arithmetic sentences are digit-grouped for Darjah 4–6 (`91 368 ÷ 8 = ?`, as in the papers). The written-column renderer reads grouped operands and answers, and worksheet solutions ignore digit-group spaces.
  - Darjah 4 joins UASA digit grouping, and its liquid volume uses ℓ and mℓ. The interaction layer accepts ℓ/mℓ answers.
- **Small fixes.**
  - Decimal rounding stays within three decimal places (`Bundarkan 4.519 kepada dua tempat perpuluhan`).
  - Ratio items write masses of 1 000 g or more in kg (`1.5 kg`, `600 g`), as in the papers.

Validation: `audit/d5-completion-qa.js` additionally checks the per-skill share of new items for each learner stage. `audit/d5-uasa-language-qa.js` checks grouping in bare sentences and no filler choices. `audit/d4-completion-qa.js`, `audit/year45-curriculum-release.cjs` and `audit/written-arithmetic-v1.0.0.js` pass. In headless Chromium: D4, D5 and D6 sampled (2 040, 2 160 and 1 920 questions) with no errors or duplicate choices, and column forms render for grouped sentences. All 117 D1–D6 skills generate as before. Existing audits keep the same pass/fail set.

Not covered: Darjah 6 still writes L/mL and has note-style questions. It needs its own pass against Tahun 6 papers.

A separate production release is required before the live site receives these changes.
