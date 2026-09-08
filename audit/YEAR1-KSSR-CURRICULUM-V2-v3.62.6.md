# Year 1 KSSR Curriculum Audit & Repair — v3.62.6

## Source of truth
Audit is based on KSSR Semakan 2017 Matematik Tahun 1 DSKP. The curriculum contains 8 units and 56 unique Standard Pembelajaran (SP).

## Before this repair
The production game exposed 14 adaptive Year 1 skill IDs. The v3.22.1 depth layer improved variety, but those 14 IDs still compressed the curriculum heavily.

Major gaps found:
- Unit 1: combination of numbers, explicit counting/range patterns, estimation, rounding, pattern identification/completion and dedicated daily number problems were not all represented as independently tracked curriculum evidence.
- Unit 2: vocabulary and symbols for add/subtract, constructing mathematical sentences from situations, creating a problem story, repeated addition and repeated subtraction were not independently tracked.
- Unit 4: Malaysian currency recognition existed, but representation, exchange, source of money, savings/expense records and the full money problem-solving strand were not independently tracked.
- Unit 5: days, months, clock hands and quarter/three-quarter clock concepts were underrepresented.
- Unit 6: the prior Year 1 depth layer had introduced ruler/cm tasks. DSKP Year 1 specifies measurement using relative/non-standard units for this unit, so that was too far ahead of the intended standard.
- Unit 7: the full 3D set (including square-based pyramid), 3D/2D properties, patterns, combinations and daily spatial problem solving were too compressed.
- Unit 8: data collection/tally and dedicated daily data problem solving were not separate evidence targets.

## Repair architecture
The existing 14 pupil-facing skill IDs remain unchanged. A new internal competency layer maps all 56 SPs to those skills, following the Year 6 competency-v2 architecture.

| Skill | DSKP SP coverage |
|---|---|
| D1.N20 | 1.1.1, 1.4.1 |
| D1.N100 | 1.2.1, 1.3.1, 1.5.1, 1.5.2, 1.7.1, 1.8.1, 1.9.1, 1.9.2, 1.10.1 |
| D1.PV100 | 1.6.1 |
| D1.CMP100 | 1.2.2 |
| D1.ADD20 | 2.1.1, 2.1.2, 2.1.3, 2.2.1, 2.5.1 |
| D1.ADD100 | 2.2.2, 2.4.1 |
| D1.SUB20 | 2.3.1, 2.6.2 |
| D1.SUB100 | 2.3.2, 2.4.2 |
| D1.FRAC | 3.1.1, 3.2.1 |
| D1.MONEY | 4.1.1–4.1.3, 4.2.1–4.2.2, 4.3.1 |
| D1.TIME | 5.1.1–5.1.4, 5.2.1–5.2.3, 5.3.1 |
| D1.MEASURE | 6.1.1–6.1.3, 6.2.1 |
| D1.SHAPE | 7.1.1–7.1.4, 7.2.1–7.2.4, 7.3.1 |
| D1.DATA | 8.1.1, 8.2.1, 8.3.1 |

## Difficulty policy
- Foundation: concrete/concept first, no reasoning forced early.
- Core: concept + procedure + simple application.
- Strong evidence/mastery: reasoning and daily problem solving, while staying inside Year 1 number/content limits.
- Normal numeric battle: quick 4-choice response.
- Boss numeric battle: constructed/game-native response.

## Malaysian context policy
Story contexts rotate through familiar Malaysian child-life settings and objects: school canteen, pasar pagi, kedai runcit, school bus, local fruit, karipap/pau/kuih/roti canai, Malaysian currency and diverse Malaysian names. Repetitive “sticker” stories are excluded from the new Year 1 v2 generator.

## Measurement correction
Unit 6 now follows the DSKP Year 1 emphasis on relative/non-standard measurement (jengkal, clips, cups, blocks, comparisons). Standard cm/kg/L measurement is not used as the curriculum target for this Year 1 unit.

## Evidence
Each generated question is tagged with its exact SP id as standardRef / competencyId / subcompetencyId. The adaptive router prioritises SPs without independent clean evidence, and the integrity gate uses the same SP list.
