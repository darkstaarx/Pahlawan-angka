# Year 2 KSSR Curriculum Audit & Repair — v3.62.12

## Scope

Source of truth: **DSKP KSSR Semakan 2017 Matematik Tahun 2**. The Year 2 curriculum is treated as 8 units with **70 unique Standard Pembelajaran (SP)**. The existing game exposes 46 D2 skill IDs; those IDs remain unchanged for save/progression compatibility, while an internal SP layer now tracks the full curriculum.

## Main gaps found in the legacy D2 bank

1. **Curriculum evidence was too compressed.** The 46 visible skills did not independently prove all 70 SPs.
2. **Unit 2 — Operasi:** `2.5.1` (mereka cerita masalah) was not independently tracked as its own learning evidence.
3. **Unit 3 — Pecahan/Perpuluhan:** 13 SPs were compressed into four skills, especially separate requirements to name, represent, write, show and compare fractions/decimals.
4. **Unit 5 — Masa:** the legacy `D2.5.2` generator included `minggu → hari`. The verified Year 2 `5.2.1` target is day↔hour and hour↔minute, so the new v2 bank removes week conversion from this competency.
5. **Unit 6 — Ukuran:** the legacy bank covered reading/unit/comparison well, but did not independently target the estimation SPs `6.1.3`, `6.2.3`, and `6.3.3`.
6. **Unit 7 — Ruang:** the legacy bank included 3D/2D and nets, but `7.1.2` (basic 2D shapes on 3D surfaces) and `7.2.2` (drawing basic 2D shapes) were not independently tracked.
7. **Unit 8 — Data:** broad coverage existed, but evidence was still skill-level rather than exact-SP level.
8. Some daily stories were generic and repetitive. The new bank rotates Malaysian child-life contexts and does not use `pelekat` as a default story crutch.

## SP coverage map

| Existing game skill | SPs now tracked independently |
|---|---|
| D2.1.1 | 1.1.1, 1.1.2 |
| D2.1.2 | 1.2.1 |
| D2.1.3 | 1.3.1, 1.3.2 |
| D2.1.4 | 1.4.1, 1.4.2 |
| D2.1.5 | 1.5.1 |
| D2.1.6 | 1.6.1 |
| D2.1.7 | 1.7.1, 1.7.2 |
| D2.1.8 | 1.8.1 |
| D2.2.1 | 2.1.1, 2.1.2 |
| D2.2.2 | 2.2.1, 2.2.2 |
| D2.2.3 | 2.3.1, 2.3.2 |
| D2.2.4 | 2.4.1, 2.4.2 |
| D2.2.5 | 2.5.1, 2.5.2 |
| D2.3.1 | 3.1.1–3.1.5 |
| D2.3.2 | 3.2.1–3.2.6 |
| D2.3.3 | 3.3.1 |
| D2.3.4 | 3.4.1 |
| D2.4.1 | 4.1.1, 4.1.2 |
| D2.4.2 | 4.2.1, 4.2.2 |
| D2.4.3 | 4.3.1, 4.3.2 |
| D2.4.4 | 4.4.1 |
| D2.4.5 | 4.5.1 |
| D2.4.6 | 4.6.1 |
| D2.4.7 | 4.7.1 |
| D2.5.1 | 5.1.1–5.1.4 |
| D2.5.2 | 5.2.1 |
| D2.5.3 | 5.3.1 |
| D2.6.1 | 6.1.1–6.1.3 |
| D2.6.2 | 6.2.1–6.2.3 |
| D2.6.3 | 6.3.1–6.3.3 |
| D2.6.4 | 6.4.1 |
| D2.7.1 | 7.1.1–7.1.3 |
| D2.7.2 | 7.2.1, 7.2.2 |
| D2.7.3 | 7.3.1 |
| D2.8.1 | 8.1.1 |
| D2.8.2 | 8.2.1 |
| D2.8.3 | 8.3.1 |

## Difficulty policy

- **Foundation:** concrete/recognition/procedure first; no forced reasoning.
- **Core:** procedure plus simple application.
- **Strong evidence/mastery:** missing values, error checking, representation reasoning, strategy choice and daily problem solving while staying inside Year 2 curriculum limits.
- **Normal numeric battle:** fast four-choice response.
- **Boss numeric battle:** constructed/game-native response.
- The existing manual-boss rule remains separate: one boss question may be a deliberate **+1-grade stretch probe**; a D2 pupil may therefore receive exactly one D3 boss-stretch question.

## Malaysian context policy

The new v2 generator uses familiar contexts such as school canteen, koperasi sekolah, pasar pagi, kedai runcit, local fruit/food, Ringgit Malaysia and diverse Malaysian names. It avoids repetitive sticker-based stories.

## Representation notes

`3.1.3`, `3.2.3` and `3.2.4` now carry explicit representation evidence. `7.2.2` carries explicit shape-drawing/construction evidence. At this release these are assessed through game questions about constructing/checking the representation rather than a freehand drawing canvas; the exact SP metadata is still retained for adaptive evidence.

## Adaptive evidence

Every new Year 2 v2 question is tagged with exact `standardRef`, `competencyId` and `subcompetencyId`. The adaptive router prioritises SPs without independent clean evidence. A correct response after retry is not counted as fresh clean proof.

## Regression audit

`audit/year2-curriculum-v2-v3.62.12.js` checks:
- exact 70-SP list;
- 46 existing D2 skill IDs preserved;
- 70 generators;
- exact SP metadata;
- unique four-choice sets;
- foundation reasoning guard;
- reasoning ceiling across all 8 units;
- Malaysian-context coverage and zero `pelekat` use in the new v2 bank;
- no week-conversion drift in `5.2.1`;
- explicit estimation/representation/drawing evidence;
- least-proven SP adaptive targeting;
- retry-safe clean evidence;
- normal numeric = quick choice, boss numeric = constructed response.
