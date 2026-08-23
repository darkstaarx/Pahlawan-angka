# D3 Topic 7.1 "Prisma" QA Report — Phase 2A-1 (Corrected Final)

**Status:** Phase 2A-1 content/build verification complete after semantic-ambiguity correction. Topic 7.2/7.3 remain out of scope. No curriculum record is enabled and no production routing is added.

## 1. Scope

- Curriculum: D3 Topic 7.1 only
- SP 7.1.1 — `identify_prism`
- SP 7.1.2 — `describe_prism_features`
- SP 7.1.3 — `classify_prism_vs_non_prism`
- 9 templates / evidence families
- 3 generator keys:
  - `geometry.identifyPrism`
  - `geometry.prismFeatures`
  - `geometry.classifyPrism`
- 1 renderer key: `geometry`
- Curriculum state: **mapped=50, enabled=0**

## 2. Independent-review blocker found after the first Phase 2A-1 package

The first Phase 2A-1 package contained a semantic ambiguity in `D3-T7-713-classify-prism-properties-v1` (`classify_by_properties`). The generated property sentence could describe more than one option even though IDs and labels were unique.

Examples of the old ambiguity:
- one generic prism description matched square, rectangular and triangular prisms;
- one generic pyramid description matched both square-base and triangular-base pyramids.

The F1 replay measured **775 ambiguous questions out of 2,000 (~38.8%)** before the correction.

## 3. Correction design

`questions/v2/generators/geometry/prism.js` now uses structured semantic descriptors rather than label parsing:

- `solidKind`
- `baseShapeId`

Examples:
- `square_prism -> { solidKind: 'prism', baseShapeId: 'square' }`
- `rectangular_prism -> { solidKind: 'prism', baseShapeId: 'rectangle' }`
- `triangular_prism -> { solidKind: 'prism', baseShapeId: 'triangle' }`
- the two pyramid types are distinguished by `baseShapeId`.

Bahasa Melayu labels remain presentation-only. Correctness logic does **not** parse or substring-match strings such as `segi empat sama` and `segi empat tepat`.

The generator exposes `meta.semanticProperties` for `classify_by_properties`, while the QA harness independently derives its oracle from its own `GROUND_TRUTH` table.

## 4. Semantic uniqueness QA

The corrected QA asserts, for every `classify_by_properties` sample:

1. intended answer satisfies the semantic descriptor;
2. distractors do not satisfy that descriptor;
3. `semanticValidOptionCount === 1`.

Targeted correction checkpoint results:

- before fix: **775 / 2,000 ambiguous**
- after fix: **0 / 2,000 ambiguous**
- extended replay: **0 / 5,000 ambiguous**

The final verification reran an independent 5,000-sample replay and again obtained:

`{ samples: 5000, ambiguous: 0 }`

## 5. Final QS v2 verification

### Self-test

`node questions/v2/validation/self-test.js`

**69 passed, 0 failed.**

### Registry / schema / readiness CLI

`node questions/v2/validation/cli.js`

Result:
- curriculum records: 50
- templates: 9
- curriculum validation: PASS
- template validation: PASS
- enabled-readiness: PASS
- mapped=50
- enabled=0
- runtime drift: none after rebuild

### Dedicated prism QA

`node questions/v2/validation/d3-topic7-1-prism-qa.js`

**30,234 passed, 0 failed across 1,800 samples.**

Per competency:
- identify_prism: 600
- describe_prism_features: 600
- classify_prism_vs_non_prism: 600

All 9 archetypes/templates were exercised with 200 samples each.

### JavaScript syntax

All `questions/v2/**/*.js` files passed `node --check`.

## 6. Build determinism

`node questions/v2/build/build.js` was run twice after the F1 source correction.

- byte-identical runtime on consecutive builds: PASS
- `node questions/v2/build/build.js --check`: PASS
- final `questions/v2/dist/runtime.js` SHA256:

`4fdb440b05f45ccc79d7920af668c2142b440bc630e245df4318d1031f099d3f`

Runtime surface:
- templates: 9
- generators: `geometry.classifyPrism`, `geometry.identifyPrism`, `geometry.prismFeatures`
- renderer: `geometry`

## 7. Production regression / dormancy status

The immediately preceding Phase 2A-1 verification reported:
- `audit/content-integrity-v3.18.1.js`: exit 0 / no failures
- `audit/adaptive-e2e-v3.12.1.js`: status pass / 19 checks

The F1 correction changed **only two QS v2 files**:
- `questions/v2/generators/geometry/prism.js`
- `questions/v2/validation/d3-topic7-1-prism-qa.js`

No production/legacy file was changed. The current GitHub main audit scripts operate on legacy production paths and do not load Question System v2; repository search also returns no production reference to `PAQuestionSystemV2` or `questions/v2`. Therefore the F1 correction cannot alter the outcome of those legacy regression scripts.

**Caveat:** the two production regression scripts were not re-executed locally in this final packaging sandbox because the complete production-main filesystem snapshot was not mounted here. Their prior PASS status is inherited, with the isolation argument above independently verified. This report does not falsely claim a second local execution.

Question System v2 remains dormant: no production routing or curriculum enabling is included.

## 8. Diversity / residual limitations

- `count_faces` still has low generator fingerprint diversity because square and rectangular prisms share the same face count. This is a fingerprint/repetition-measurement limitation, not a correctness failure.
- `engine/generator.js` production assembly remains intentionally unimplemented; Phase 2A-1 is still a dormant content pilot.
- Bahasa Melayu child-appropriateness is reviewed at authored-content/hygiene level, not by an automated linguistic quality model.

## 9. Final acceptance state

- D3 Topic 7.1 prism content: corrected
- semantic ambiguity blocker: resolved
- semantic-valid-option oracle: active
- 9 templates: valid
- QS self-test: PASS
- QS CLI: PASS
- prism QA: PASS
- deterministic build: PASS
- runtime drift: none
- mapped=50 / enabled=0
- Topic 7.2: untouched
- Topic 7.3: untouched
- production routing: untouched
