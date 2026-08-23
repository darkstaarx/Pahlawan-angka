# D3 Topic 7.2–7.3 Polygon + Symmetry QA Report — Phase 2A-2 FINAL

**Status: Phase 2A-2 complete.** This extends the accepted Phase 2A-1 Prisma pilot with D3 Topic 7.2 (Poligon Sekata) and 7.3 (Paksi Simetri). Question System v2 remains dormant: no curriculum record is enabled and no production routing is included.

## 1. Curriculum scope

Source of truth for this phase is the existing `questions/v2/curriculum/kssr-e3-2024/d3.json` registry:

- 7.2.1 `identify_regular_polygon` — Kenal pentagon, heksagon, heptagon, oktagon sekata.
- 7.2.2 `create_regular_polygon_pattern` — Hasilkan corak berasaskan poligon sekata.
- 7.3.1 `identify_and_draw_symmetry_axis` — Kenal dan lukis paksi simetri.

All three remain `status: "mapped"`. Global D3 status remains **mapped=50, enabled=0**.

## 2. Authored evidence families

Phase 2A-2 adds 9 templates, 3 per competency.

### 7.2.1 — `identify_regular_polygon`

1. `identify_polygon_from_picture` — identify a regular polygon from SVG.
2. `identify_polygon_from_sides` — identify from a structured side count.
3. `select_named_regular_polygon` — select the requested regular polygon from a four-shape gallery.

The structured polygon set is exactly: pentagon=5, hexagon=6, heptagon=7, octagon=8 sides.

### 7.2.2 — `create_regular_polygon_pattern`

1. `continue_regular_polygon_pattern` — infer and continue an AB/ABC/AAB/ABB-style repeating pattern.
2. `identify_smallest_repeating_unit` — identify the smallest repeating unit.
3. `construct_regular_polygon_pattern` — **interactive constrained construction** (`sequence_build`) using a displayed repeating unit and shape palette.

The third family is intentionally interactive rather than pretending an MCQ fully assesses the KSSR action word *hasilkan*.

### 7.3.1 — `identify_and_draw_symmetry_axis`

1. `identify_symmetry_axis_count` — identify the number of symmetry axes.
2. `select_valid_symmetry_axis` — select the one valid axis from four candidate lines.
3. `draw_valid_symmetry_axis` — **interactive drawing contract** accepting a valid axis angle only when the line also passes through the shape centre within tolerance.

The third family is intentionally interactive so the *lukis* requirement is represented explicitly.

## 3. New authored sources

- `questions/v2/banks/kssr-e3-2024/d3/space-polygon-symmetry.json`
- `questions/v2/generators/geometry/polygon-symmetry.js`
- `questions/v2/renderers/geometry/polygon-symmetry.js`
- `questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js`

Generator keys added:

- `geometry.identifyRegularPolygon`
- `geometry.regularPolygonPattern`
- `geometry.symmetryAxis`

Renderer key added:

- `geometry2d`

The final Phase 2A browser runtime therefore exposes **6 generator keys, 2 renderer keys, and 18 templates** across all six canonical D3 Topic 7 SPs.

## 4. Dedicated Phase 2A-2 QA

Command:

```bash
node questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js
```

Result:

- **37,037 passed, 0 failed**
- **1,800 generated samples**
- 600 samples per competency
- 200 samples per template
- all 9 archetypes exercised
- all 4 regular polygon types exercised
- all 6 symmetry shapes exercised
- both repeating-unit lengths 2 and 3 exercised
- identical seeds reproduce byte-identical generated JSON
- alternate seeds produce meaningful variation

### Semantic checks

The QA oracle is independent of Bahasa Melayu labels. It verifies structured IDs, side counts, repeating sequences, and symmetry-angle sets.

Key checks include:

- polygon side count uniquely identifies the intended regular polygon;
- gallery answers point at the correct rendered polygon;
- next-pattern answers are independently derived from the shortest repeating period;
- the reported smallest repeating unit is independently derived from the shown sequence;
- interactive construction's expected sequence exactly repeats the displayed unit;
- symmetry axis count matches an independent shape oracle;
- `select_valid_symmetry_axis` has **semanticValidOptionCount === 1** for every sample;
- every wrong candidate axis is outside the true-axis set;
- wrong candidate axes stay at least **12 degrees** from every true axis for visual fairness;
- candidate axis orientations are distinct;
- draw-axis accepted angles exactly match the independent symmetry oracle;
- draw-axis interaction requires `mustPassThroughCenter: true` as well as angle tolerance.

## 5. Stress tests beyond the main harness

### Symmetry selector

10,000 generated `select_axis` questions:

- ambiguous questions: **0**
- duplicate candidate angles: **0**
- answer not equal to the unique valid axis: **0**
- all six symmetry shapes exercised broadly

This specifically protects against the earlier design risk where rare candidate angles could accidentally create more than one valid symmetry line.

### Polygon patterns

5,000 samples for each of the three pattern modes (15,000 total):

- wrong independently-derived next shape: **0**
- wrong smallest repeating unit: **0**
- malformed constructed repeating sequence: **0**

## 6. Cross-regression with Phase 2A-1 Prisma

The Phase 2A-1 prism QA initially exposed a validation-scope defect after 7.2/7.3 were added: it selected every `topicId === D3.T7` template instead of only standards 7.1.1–7.1.3. That caused false failures when it attempted to treat polygon templates as prism templates.

The old QA harness was corrected to scope itself explicitly to:

- 7.1.1
- 7.1.2
- 7.1.3

No prism content/generator logic was changed.

After correction:

```text
D3 Topic 7.1 prism QA
30,234 passed, 0 failed
1,800 samples
```

Combined dedicated Topic 7 QA now covers **3,600 generated questions** and **67,271 checks**, all passing.

## 7. Self-test / validator / deterministic build

`node questions/v2/validation/self-test.js`

- **69 passed, 0 failed**

`node questions/v2/validation/cli.js`

- curriculum records: 50
- templates: 18
- curriculum validation: PASS
- template validation: PASS
- readiness gate: PASS
- mapped=50
- enabled=0
- runtime drift: none

Runtime was rebuilt repeatedly from the same authored sources and remained byte-identical.

**Final `questions/v2/dist/runtime.js` SHA256:**

`f0d02053bc525f8ee0743bfc5107909a55cd1fd0eee32dc0298b050466b7a298`

## 8. Visual QA finding and correction

A rasterized renderer check found that a mathematically invalid symmetry distractor could still be too close visually to a true axis (for example, 15° versus a pentagon's valid 18° axis). This would be unfair to a child even though the semantic oracle correctly called one line wrong.

The candidate generator was changed to use shape-specific mid-gap distractor angles. QA now enforces a minimum 12° distance from every valid axis. A second rasterized pentagon check confirmed the candidates are visually distinguishable.

## 9. Files changed from accepted Phase 2A-1 FINAL

New:

1. `questions/v2/banks/kssr-e3-2024/d3/space-polygon-symmetry.json`
2. `questions/v2/generators/geometry/polygon-symmetry.js`
3. `questions/v2/renderers/geometry/polygon-symmetry.js`
4. `questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js`
5. `D3-TOPIC7-2-3-POLYGON-SYMMETRY-QA-REPORT.md`

Modified:

1. `questions/v2/dist/runtime.js` — deterministic rebuild.
2. `questions/v2/validation/self-test.js` — exact Phase 2A counts/keys/templates.
3. `questions/v2/validation/d3-topic7-1-prism-qa.js` — scope fix only, from all Topic 7 templates to 7.1.1–7.1.3.
4. `MANIFEST.md` — Phase 2A-2 package manifest.

No curriculum record was changed. No production routing file is included or modified by this package.

## 10. Residual limitations

- `construct_regular_polygon_pattern` is constrained construction using a specified repeating unit. It is stronger evidence than MCQ, but it does **not** yet assess completely free-form creative pattern design.
- `draw_valid_symmetry_axis` now defines both angular and centre-position requirements, but the live gesture capture/scorer that consumes this contract is not implemented in this dormant content phase.
- The four-name 7.2.1 concept set is naturally finite, so picture/side-count families have four semantic fingerprints. Variety should come from rotating evidence families/representations, not by inventing fake mathematical variation.
- `engine/generator.js` production assembly/routing remains intentionally unwired. Phase 2A-2 validates authored content and contracts, not live battle integration.
- Production regression scripts were not rerun inside this local QS-only package environment because the full production checkout is not present and outbound git access is unavailable. This phase changes only dormant `questions/v2/**` plus documentation/manifest; no `index.html`, legacy question routing, battle, adaptive/mastery, or Supabase source is part of the delta.

## 11. Phase result

**Phase 2A is now complete for all six canonical D3 Topic 7 standards:**

- 7.1.1 Prisma identification — complete pilot content
- 7.1.2 Prisma features — complete pilot content
- 7.1.3 Prisma vs non-prisma — complete pilot content
- 7.2.1 Regular polygons — complete pilot content
- 7.2.2 Regular-polygon patterns — complete pilot content contract
- 7.3.1 Symmetry axis — complete identification + drawing contract

All remain dormant (`mapped=50`, `enabled=0`). The next architectural step is Phase 2B controlled routing/integration, not additional Topic 7 content.
