# Phase 2C — Shadow Observability QA Report

**Status:** ready for guarded deployment on top of Phase 2B commit `c9262bb2c8649fce8429b558a431bd408730eedc`.

## Purpose
Phase 2C turns the D3 Topic 7 Question System v2 pilot from default `off` to default `shadow` while preserving the exact learner-visible legacy question path. It adds local, privacy-first technical observability and DEV controls. It does **not** make v2 questions visible to learners.

## Behaviour
- default mode: `shadow`
- explicit `off` remains available and overrides the default
- hard kill switch forces `off`
- `live` capability remains in the bridge for a later controlled phase, but Phase 2C DEV controls do not expose a LIVE button
- shadow generation returns `null` to the production dispatcher, so the existing legacy bank still supplies the visible question
- missing runtime / no template / missing generator / exception all fall back safely

## Shadow telemetry
Successful and failed shadow attempts record a `qsv2_shadow` event through existing `PATelemetry.record()` when available.

Allowed payload fields only:
- `mode`
- `outcome`
- `reason`
- `generationMs`
- `standardId`
- `competencyId`
- `templateId`
- `fingerprint`

Not recorded:
- prompt text
- answer / distractor content
- child ID
- name
- email
- user ID

The bridge also exposes session-only aggregate counters through `getStatus().shadowMetrics` / `getShadowMetrics()`:
- attempts
- generated
- fallbacks
- errors
- last duration/outcome/reason/template/competency/fingerprint

**Important limitation:** existing `PATelemetry` is local-device telemetry stored in `localStorage`. Phase 2C does not add a Supabase analytics table or remote cohort upload. This is useful for device/DEV verification but does not yet provide central analytics across beta users.

## DEV Mode observability
New file: `js/dev-qsv2-v3.36.0.js`

DEV panel shows:
- current OFF / SHADOW / LIVE status
- runtime readiness
- enabled SP count
- battle-compatible MCQ count
- session generated/fallback/error counters
- last generation duration
- number of local-device `qsv2_shadow` events

DEV actions included:
- set OFF
- set SHADOW
- toggle kill switch
- reset session-only bridge counters

No LIVE button is exposed in Phase 2C.

## Validation
### Question System v2 build
`node questions/v2/build/build.js --check`

PASS — checked-in runtime remains current. Phase 2C changes the external legacy adapter, not authored runtime content.

### QS self-test
`node questions/v2/validation/self-test.js`

**71 passed, 0 failed**.

### Registry CLI
`node questions/v2/validation/cli.js`

PASS:
- total D3 records: 50
- mapped: 44
- enabled: 6
- templates: 18
- build drift: none

### Prisma QA
`node questions/v2/validation/d3-topic7-1-prism-qa.js`

**30,234 passed, 0 failed across 1,800 samples.**

### Polygon + symmetry QA
`node questions/v2/validation/d3-topic7-2-3-polygon-symmetry-qa.js`

**37,037 passed, 0 failed across 1,800 samples.**

### Phase 2B routing regression
`node questions/v2/validation/phase2b-integration-qa.js`

**13,559 checks, status pass.**
- all six competencies still route in LIVE test mode
- all 16 battle-compatible templates exercised
- default mode expectation updated to SHADOW
- rollback paths retained

### Phase 2C shadow observability QA
`node questions/v2/validation/phase2c-shadow-observability-qa.js`

**46 checks, status pass.**

It independently verifies:
- new-install default is SHADOW
- shadow always returns null to the visible dispatcher
- successful shadow generation is private/inspectable
- metadata-only telemetry whitelist
- prompt/answer/PII exclusion
- duration and counters
- explicit OFF rollback
- kill-switch rollback
- missing-runtime fallback telemetry
- exception telemetry uses stable reason code without leaking raw error text
- missing telemetry API cannot break learner flow
- learner-visible prompt/answer/options are exactly equal between OFF and SHADOW in the production dispatcher fixture
- shadow does not write a v2 item into learner-visible question history

### Total automated assertion count
71 + 30,234 + 37,037 + 13,559 + 46 = **80,947 passing assertions/checks**, with zero failures in the local Phase 2C validation set.

## Production regression requirement at deployment
The deployment agent must additionally run against the full current production repo:
- `node audit/content-integrity-v3.18.1.js`
- `node audit/adaptive-e2e-v3.12.1.js`

Both must exit 0 before commit/push.

## Files changed by Phase 2C
Modified:
- `questions/v2/engine/legacy-adapter.js`
- `questions/v2/validation/phase2b-integration-qa.js`
- `index.html` (cache bust + DEV observability loader)
- `sw.js` (release header + DEV file precache)
- `js/version.js` (`3.35.0` -> `3.36.0`)

New:
- `questions/v2/validation/phase2c-shadow-observability-qa.js`
- `js/dev-qsv2-v3.36.0.js`
- `PHASE2C-SHADOW-OBSERVABILITY-QA-REPORT.md`

No battle, adaptive, mastery, Supabase schema, question-bank content, curriculum mapping, Cikgu Dimensi logic, parent controls, or legacy D1-D6 bank logic is changed.
