# Phase 2D-3 — D3 Topic 7 KSSR Task Diversity & Anti-Repeat QA Report

**Target production base:** `8a8f9bbbcc726a9bea332013ebdebf7192cddcc2`  
**Target release:** `3.41.0`  
**LIVE safety:** unchanged — default remains **SHADOW** and learner-visible LIVE still requires the Phase 2D-2 DEV/admin controlled cutover.

## Why this phase exists

The production phone smoke test proved the Phase 2D-2 route works, but it also exposed a content-quality issue: the learner can see correct Year 3 curriculum content while the experience still feels narrow when several questions reduce to naming a shape or recognising a repeated sequence.

The review also found two learner-language problems:

- `Apakah unit ulangan TERKECIL bagi corak ini?` is unnecessarily abstract for a 9-year-old;
- the generic symmetry hint said `Bayangkan bentuk dilipat pada garis itu` even on questions where no candidate line was displayed.

This phase hardens **assessment variety**, not curriculum identity.

## KSSR / textbook grounding used for the redesign

The Year 3 textbook sequence for **Bentuk** includes:

- identify prisms and non-prisms;
- compare prism properties;
- identify regular polygons;
- create polygon patterns;
- identify symmetry axes;
- solve simple problems using those ideas.

The textbook problem-solving examples are especially useful for diversity. They include tasks such as:

- choosing a prism from several solids and giving a reason based on its properties;
- inferring **heptagon** from a clue such as “2 vertices more than a pentagon”;
- choosing a shape using symmetry information rather than simply naming the shape.

Phase 2D-3 uses those *task forms* as inspiration while keeping all generated wording and code original.

## Content change

A new additive bank is introduced:

`questions/v2/banks/kssr-e3-2024/d3/space-diversity.json`

It adds **8 battle-compatible MCQ templates** without modifying the six reviewed curriculum competencies.

### New archetypes

| Standard | Competency | New evidence archetype |
|---|---|---|
| 7.1.2 | describe_prism_features | choose the true feature statement for a shown prism |
| 7.1.3 | classify_prism_vs_non_prism | explain why a shown solid is a prism |
| 7.1.3 | classify_prism_vs_non_prism | explain why a shown solid is **not** a prism |
| 7.2.1 | identify_regular_polygon | infer a polygon from a relative side/vertex clue |
| 7.2.1 | identify_regular_polygon | explain why a shown polygon is regular |
| 7.2.2 | create_regular_polygon_pattern | identify a later position in a repeating polygon pattern |
| 7.3.1 | identify_and_draw_symmetry_axis | choose a valid fold line in a card-folding context |
| 7.3.1 | identify_and_draw_symmetry_axis | choose a shape from an exact symmetry-axis count |

Authored Topic 7 totals become:

- **26 templates total**
- **24 battle-compatible MCQ**
- **2 interactive performance templates**, unchanged:
  - `sequence_build`
  - `draw_axis`

The two interactive templates remain outside battle. Therefore battle evidence still cannot falsely establish full construction/drawing mastery.

## Learner-language fixes

### Pattern wording

Old:

`Apakah unit ulangan TERKECIL bagi corak ini?`

New:

`Bahagian manakah yang diulang untuk membina corak ini?`

The concept remains the same while removing unnecessary terminology.

### Pattern hint

The hint now tells the pupil to find the **bahagian bentuk yang berulang** and inspect the sequence from the beginning, instead of using `unit pola` language.

### Symmetry hint

The hint now works for both count and line-selection items:

`Bayangkan bentuk dilipat dua. Garis paksi simetri mesti membuat kedua-dua bahagian bertindih tepat.`

### Prism base wording

The existing base-shape item now explicitly tells the learner that a prism is named from its two matching bases before asking for the base shape.

## Anti-repeat scheduler

The bridge scheduler remains deterministic under injected QA RNG but now adds stronger diversity controls.

### Competency cooldown

When alternatives exist, the same competency cannot be selected if it appeared in either of the previous **2 visible questions**.

### Exact-template cooldown

The bridge prefers a template not used in the previous **6 visible questions**. If every template for the selected competency is still cooling down, it safely falls back to the full template set rather than failing generation.

### Long-window balancing

Template usage over the most recent **60 history rows** is scored strongly. This prevents a small subset of templates from permanently winning tie-breaks while other valid templates starve.

The selector also gives stronger penalties for recently repeated:

- archetype;
- representation;
- cognitive demand.

This is still a **content-diversity scheduler**, not a new mastery/adaptive policy. Target evidence weighting can be introduced separately after enough controlled-LIVE data exists.

## Safety invariants retained

Phase 2D-3 does **not** change:

- `D3.SHAPE` persistent compatibility ID;
- the six reviewed Topic 7 competencies;
- evidence epoch `D3.T7:qsv2:v1`;
- historical perimeter evidence exclusion;
- Phase 2D-2 DEV/admin LIVE authorization;
- default mode `shadow`;
- kill switch / legacy fallback;
- battle answer-resolution logic;
- Cikgu Dimensi routing;
- parent controls;
- Supabase schema or RLS.

No database migration is required.

## Local authoring checks completed before packaging

The new pure generator file was exercised independently with **4,000 generated items** across all eight new modes.

Result:

- **17,500 assertions passed**
- exactly three distractors per MCQ;
- four unique learner-visible choice labels;
- structured semantic metadata present;
- pattern-position oracle correct;
- symmetry fold answer always belongs to the true axis set.

A standalone scheduler simulation over 1,800 selections confirmed:

- all **24** intended battle templates can surface;
- six competencies remain balanced;
- no competency repeats inside the 2-question cooldown;
- no exact template repeats inside the 6-question cooldown in the tested sequence.

The full checked-in runtime cannot be rebuilt in the packaging container because the container has no GitHub/network checkout. Therefore the deployment agent must regenerate `questions/v2/dist/runtime.js` from the full repository and run the complete regression suite before commit.


## R2 deployment-gate corrections

The first deployment attempt correctly stopped before commit. The substantive content/runtime checks passed, but five package integration issues were exposed:

1. Phase-1 `self-test.js` still expected 18 templates / 2 generator files / 6 generator keys.
2. Historical prism QA still expected 9 templates instead of 12.
3. Historical polygon/symmetry QA still expected 9 templates instead of 14.
4. `index.html` had not bumped the unchanged `js/app.js` cache query from 3.40.0 to 3.41.0, causing the existing Phase 2D-1 release/cache gate to fail. R2 fixes the cache-bust instead of weakening that historical test.
5. The new Phase 2D-3 QA compared a VM-realm array to a host-realm array with `assert.deepStrictEqual`; R2 normalizes the template-id list using host `Array.from(...)`.

These are deployment/validation corrections only. The eight new task archetypes, generators, scheduler policy and Controlled-LIVE behavior are unchanged from R1.

Observed R1 test totals before correction establish the expected R2 historical totals:

- self-test: 68/71 before the three stale expectations are corrected → expected **71/71**;
- prism QA: 40,442 pass + 1 stale-count failure → expected **40,443 pass / 0 fail**;
- polygon/symmetry QA: 53,651 pass + 1 stale-count failure → expected **53,652 pass / 0 fail**.

## Mandatory deployment QA

After guarded apply, run the **write build first** because authored sources have intentionally changed:

```bash
node questions/v2/build/build.js
node questions/v2/build/build.js --check
```

Then run:

```bash
node questions/v2/validation/self-test.js
node questions/v2/validation/cli.js
node questions/v2/validation/d3-topic7-1-prism-qa.js
node questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js
node questions/v2/validation/phase2b-integration-qa.js
node questions/v2/validation/phase2c-shadow-observability-qa.js
node questions/v2/validation/phase2c1-central-shadow-sync-qa.js
node questions/v2/validation/phase2d0-curriculum-route-qa.js
node questions/v2/validation/phase2d1-evidence-epoch-qa.js
node questions/v2/validation/phase2d1-evidence-integration-qa.js
node questions/v2/validation/phase2d2-controlled-live-qa.js
node questions/v2/validation/phase2d2-integration-qa.js
node questions/v2/validation/phase2d3-content-diversity-qa.js
node questions/v2/validation/phase2d3-integration-qa.js
node audit/content-integrity-v3.18.1.js
node audit/adaptive-e2e-v3.12.1.js
```

Expected new gates:

- Phase 2D-3 content diversity: **PASS**, `battleCompatible=24`, `interactive=2`
- Phase 2D-3 integration: **PASS**, release `3.41.0`
- Phase 2B and Phase 2C historical tests now expect **24 battle-compatible MCQs**
- Phase 2D-2 historical integration accepts release versions `>=3.40.0` while preserving the original controlled-LIVE contract

## Intended production file scope

### New authored/runtime-validation files

- `questions/v2/generators/geometry/kssr-diversity.js`
- `questions/v2/banks/kssr-e3-2024/d3/space-diversity.json`
- `questions/v2/validation/phase2d3-content-diversity-qa.js`
- `questions/v2/validation/phase2d3-integration-qa.js`
- `PHASE2D3-D3-TOPIC7-CONTENT-DIVERSITY-QA-REPORT.md`

### Modified by guarded installer

- `questions/v2/generators/geometry/polygon-symmetry.js`
- `questions/v2/generators/geometry/prism.js`
- `questions/v2/engine/legacy-adapter.js`
- `questions/v2/validation/self-test.js`
- `questions/v2/validation/d3-topic7-1-prism-qa.js`
- `questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js`
- `questions/v2/validation/phase2b-integration-qa.js`
- `questions/v2/validation/phase2c-shadow-observability-qa.js`
- `questions/v2/validation/phase2d2-controlled-live-qa.js`
- `questions/v2/validation/phase2d2-integration-qa.js`
- `js/dev-qsv2-live-v3.40.0.js`
- `index.html`
- `sw.js`
- `js/version.js`

### Generated after apply

- `questions/v2/dist/runtime.js` via `node questions/v2/build/build.js`

### Explicitly not changed

- `js/battle.js`
- `js/app.js`
- `questions/index.js`
- `js/engine/adaptive.js`
- `data/kssr/d3-topic7-live-cutover-v3.40.0.js`
- `data/kssr/d3-topic7-evidence-epoch-v3.39.0.js`
- Supabase schema/migrations
