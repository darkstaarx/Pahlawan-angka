# Pahlawan Angka v3.23.0 — Tahun 6 Space + Data Curriculum Repair

Expected baseline:
`d0a7a5d8acf4b6dcf348d05bddc0ed5ae3cf813e`

## Why this release exists

v3.22.0 fixed grade depth and variety, but a second curriculum audit found two structural Tahun 6 gaps:

1. The active `D6.AREA` node still represented rectangle area, perimeter and cuboid volume. The Tahun 6 KSSR Space unit instead requires regular polygons/angles, circle parts/construction, and daily problems involving space.
2. The active `D6.DATA` / `D6.PROB` paths still mixed bar-chart/mean work with numeric fractional probability. The Tahun 6 Data unit specifically requires pie-chart work using 45°, 90° and 180° sectors plus qualitative probability language with reasonable justification.

This is a graph/evidence repair, not just another question-template patch.

## Active graph migration

Retired from active Year 6 mastery:
- `D6.AREA`
- `D6.DATA`

Added:
- `D6.ANGLE` — standards 6.1.1 / 6.1.2
- `D6.CIRCLE` — standards 6.2.1 / 6.2.2
- `D6.SPACE_PROBLEM` — standard 6.3.1
- `D6.PIE` — standard 8.1.1
- `D6.DATA_PROBLEM` — standard 8.3.1

Corrected existing nodes:
- `D6.PROB` — standards 8.2.1 / 8.2.2; qualitative probability only.
- `D6.COORD` — domain corrected from `Ruang` to `Koordinat`, mapped to textbook Unit 7.

The live v3.22 graph has 114 active nodes before this migration. v3.23.0 retires 2 and adds 5, so the active graph becomes 117 nodes.

## Evidence integrity

Old learner state is archived under `db.legacySkills` but is **not credited** to the new competencies.

Mandatory clean competency evidence:

### D6.ANGLE
- measure an angle using a protractor;
- identify/form a requested angle;
- read a regular-polygon interior angle through a measurement representation.

### D6.CIRCLE
- identify centre/radius/diameter;
- demonstrate radius-based circle construction or radius/diameter relationship.

### D6.SPACE_PROBLEM
- one angle problem;
- one circle problem.

### D6.PIE
- complete a missing sector angle;
- determine a quantity from a sector;
- interpret a pie chart.

### D6.PROB
- decide whether an event may/not occur with a reason;
- use the qualitative scale `mustahil → kecil kemungkinan → sama kemungkinan → besar kemungkinan → pasti` with a reason.

### D6.DATA_PROBLEM
- multi-step pie-chart problem;
- data-to-probability reasoning problem.

### D6.COORD
- scaled distance/route evidence;
- direction/missing-point evidence.

## Question design

New KSSR-style inline SVG/HTML diagrams include:
- protractor / angle rays;
- regular polygons;
- angle-choice figures;
- labelled circles and radius/diameter figures;
- pie charts restricted to the relevant 45°/90°/180° sector structure;
- qualitative probability bags with visually distinct but restrained colours;
- data tables.

Graphics are part of the mathematical representation and are not RPG decoration.

## Explicit removals from Year 6 paths

- No `D6.AREA` cuboid-volume generator.
- No legacy `D6.DATA` bar-chart/mean generator as Year 6 core evidence.
- No `prob_fraction` archetype.
- No numeric fraction as the answer to a Year 6 probability competency.

## Architecture / load order

1. Existing banks
2. v3.18.1 integrity
3. v3.22.0 assessment depth
4. **v3.23.0 Year 6 Space/Data repair**
5. sensory / coach / daily / combat layers

The v3.23.0 layer is deliberately after v3.22.0 so it is authoritative only for the affected Year 6 graph/content paths.

## Preserved

No changes to:
- battle / FX
- hero / pet assets
- typed-answer logic/UI
- Daily Quest
- parent mode
- Supabase schema
- global mastery thresholds
- Cikgu Wajar intervention logic
- Year 1–5 question banks
- World Response (remains retired)
