# Question System v2 — Phase 2B Controlled Integration QA Report

**Status:** Ready for repository-level apply + final production regression before push.

## Scope

Phase 2B wires the completed D3 Topic 7 Question System v2 pilot into the existing production dispatcher behind a single controlled adapter path.

Live-eligible legacy skill: `D3.SHAPE` only.

Curriculum status after Phase 2B:

- D3 total SP records: 50
- `enabled`: 6 — exactly 7.1.1, 7.1.2, 7.1.3, 7.2.1, 7.2.2, 7.3.1
- `mapped`: 44
- no other D3 topic enabled

Authored Topic 7 templates: 18.

Current battle UI compatibility:

- 16 MCQ templates are eligible for live routing.
- 2 interactive templates remain authored/QA-validated but are deliberately excluded from battle routing:
  - `D3-T7-722-polygon-pattern-construct-v1`
  - `D3-T7-731-symmetry-draw-axis-v1`

This avoids falsely pretending answer-button recognition is literal construction/drawing evidence.

## Integration design

`questions/v2/engine/legacy-adapter.js` is now a UMD browser/Node bridge.

Production `questions/index.js` explicitly calls `PAQuestionSystemV2Bridge.tryGenerate(...)` before the existing legacy bank loop. The bridge does not monkey-patch `window.PAQuestionBanks`, does not replace `generate()`, and does not change adaptive/mastery semantics.

Modes:

- `off` — default. Adapter returns `null`; legacy bank runs unchanged.
- `shadow` — v2 item is generated for inspection but adapter returns `null`; learner receives legacy item.
- `live` — only `D3.SHAPE` may receive a v2 battle-compatible MCQ.
- `killSwitch=true` — forces immediate legacy fallback regardless of configured mode.

Additional fallback paths:

- runtime missing -> legacy
- no enabled compatible template -> legacy
- generator/renderer/adaptation error -> legacy
- non-pilot skill -> legacy

## Selection / anti-repetition

The pilot selector operates within the bridge and:

- selects enabled Topic 7 competencies first, rather than randomising over all templates;
- penalises recently used competency/template/archetype/representation;
- targets difficulty band from current mastery without changing mastery itself;
- retries against the production recent exact-fingerprint window;
- never routes the two interactive response types into the current battle MCQ UI.

## Battle compatibility fix found during Phase 2B

Three visual gallery archetypes stored answer choices using solid/polygon names while the actual task was to choose a displayed figure. Direct legacy adaptation would therefore reveal the answer in the answer-button label.

Affected families:

- prism discriminate gallery
- prism-vs-non-prism selection gallery
- regular polygon named selection gallery

Fix:

- gallery renderers now visibly mark figures `A`–`D`;
- the legacy adapter maps figure-id choices to `A`–`D` for battle answer buttons;
- semantic answer IDs inside the generator remain unchanged.

This preserves the visual task without leaking the target name through the answer buttons.

## Validation results

### Deterministic build

`node questions/v2/build/build.js` built twice byte-identically.

Runtime SHA256:

`8f5d5dd84277ea86212e8e98c9230e9dda1417b2044ec6557fefeb9804c8c7d2`

`node questions/v2/build/build.js --check` -> PASS.

### QS v2 self-test

`node questions/v2/validation/self-test.js`

**71 passed, 0 failed.**

### Registry CLI

`node questions/v2/validation/cli.js`

PASS:

- curriculum valid
- templates valid
- enabled-readiness valid for all six Topic 7 SPs
- `mapped=44`
- `enabled=6`
- runtime build drift: none

### Prisma regression

`node questions/v2/validation/d3-topic7-1-prism-qa.js`

**30,234 passed, 0 failed across 1,800 samples.**

### Polygon + symmetry regression

`node questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js`

**37,037 passed, 0 failed across 1,800 samples.**

### Phase 2B browser/dispatcher integration QA

`node questions/v2/validation/phase2b-integration-qa.js`

**13,559 checks passed across 1,800 live-routed samples.**

Verified:

- default mode OFF
- exactly six enabled Topic 7 competencies
- exactly 16 battle-compatible templates
- all six competencies surface under live routing
- all 16 compatible templates surface
- every battle item has exactly one answer + 3 unique distractors
- no interactive template leaks into battle routing
- gallery A–D adaptation works
- non-`D3.SHAPE` skills remain legacy
- shadow mode returns legacy while producing inspectable v2 output
- kill switch returns legacy
- missing runtime returns legacy
- forced bridge exception returns legacy
- additive v2 metadata is written to `sess.questionHistory`

Content/pilot/integration automated checks total: **80,830 passed, 0 failed**, plus the 71 core self-tests.

### Guarded deployment installer QA

The supplied `tools/apply-phase2b.js` was exercised end-to-end in a disposable git repository before packaging.

Verified:

- guarded `--dry-run` performs no mutation;
- apply copies the complete `repo-overlay/`;
- exact production anchors are transformed only in `index.html`, `questions/index.js`, `sw.js`, and `js/version.js`;
- default pilot mode remains `off`;
- the applied repository then passes build drift, self-test, CLI, prism QA, polygon/symmetry QA, and Phase 2B integration QA;
- the installer has no force path for a real production hash mismatch.

The test-only environment variable used in the disposable repository bypasses hash equality only for fabricated fixture files. The production instructions do **not** use it; real apply requires the audited Git blob hashes below.

## Planned production files touched by apply step

Only four existing production files are changed:

1. `index.html`
   - statically loads `questions/v2/dist/runtime.js`
   - statically loads `questions/v2/engine/legacy-adapter.js`
   - bumps cache-bust values for `questions/index.js`, `js/version.js`, `js/pwa.js`

2. `questions/index.js`
   - adds one explicit adapter consultation before the legacy generation loop
   - stores additive `competencyId`, `templateId`, and `source` history metadata

3. `sw.js`
   - precaches the runtime + adapter
   - updates release comment

4. `js/version.js`
   - planned release version `3.35.0`

No intended modification to:

- `js/battle.js`
- adaptive/mastery/intervention/frontier logic
- Supabase/cloud/auth
- parent controls
- Cikgu Dimensi logic
- legacy D1/D2/D3/D4/D5/D6 banks

## Repository-level final gate

This environment can validate the complete QS v2 tree and the exact intended production-dispatcher fixture, and the production apply tool is guarded by current Git blob hashes from GitHub `main`.

Immediately before final packaging, the four guarded production blob SHAs were re-read from GitHub `main` and still matched the audited values:

- `index.html` — `cc282667b831fe3642c9c7ecea5e2da86a4d1a7a`
- `questions/index.js` — `76666b66dc099d2552550da241860f5606d5a781`
- `sw.js` — `ba7bc43dac808fdd047e49db16224ebd01d8ae18`
- `js/version.js` — `1107be1f814d62d90143f247662c6a170c8031ab`

The full existing repository production regression scripts must still be rerun **after applying the package into the actual pulled repository and before commit/push**:

```bash
node audit/content-integrity-v3.18.1.js
node audit/adaptive-e2e-v3.12.1.js
```

The supplied apply instructions make those tests mandatory. A failure means do not push.

## Rollback

Runtime rollback does not require reverting a commit:

```js
PAQuestionSystemV2Bridge.setPilotMode('off')
```

or hard kill:

```js
window.PA_QSV2_FLAGS = window.PA_QSV2_FLAGS || {}
window.PA_QSV2_FLAGS.killSwitch = true
```

With the flag OFF, current production still loads the v2 files but serves the legacy question bank.
