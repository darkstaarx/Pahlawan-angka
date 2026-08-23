# Phase 2D-1 — D3 Topic 7 Evidence Epoch / Mastery Compatibility QA Report

**Target base:** production `main` commit `7207afb9d34be6fc62566ff4c7b7c79e37af1cc0` (Phase 2D-0).

## Why this phase exists

The persistent production skill key `D3.SHAPE` predates the reviewed D3 Topic 7 curriculum mapping. Its historical learner-visible bank measures rectangle perimeter / missing side / rectangle side count, while the reviewed QS v2 target is:

- 7.1.1 identify prism
- 7.1.2 describe prism features
- 7.1.3 classify prism vs non-prism
- 7.2.1 identify regular polygon
- 7.2.2 create regular polygon pattern
- 7.3.1 identify/draw symmetry axis

Phase 2D-0 corrected curriculum identity while deliberately preserving the save key and legacy learner title during SHADOW. Phase 2D-1 now prevents historical perimeter evidence from being silently reinterpreted as mastery of the new Topic 7 target.

## Storage design

New additive save extension:

`db.qsv2Evidence.topics['D3.T7']`

No existing `db.skills['D3.SHAPE']` fields are rewritten.

The topic store contains:

- schema version 1
- evidence epoch `D3.T7:qsv2:v1`
- compatibility key `D3.SHAPE`
- historical legacy baseline snapshot
- explicit `legacy.acceptedForTarget = false`
- six independent competency evidence buckets
- bounded attempt dedupe IDs
- no prompt or answer content

The existing `game_saves.state` cloud path already persists the entire game-state JSON snapshot. Therefore this additive nested state needs **no Supabase schema migration**.

## Mastery/evidence rule for the new epoch

This phase intentionally does **not** overwrite the legacy numeric `D3.SHAPE.mastery` field and does not expose a new learner-facing mastery score yet.

Each Topic 7 competency has a separate evidence status:

- `unproven`
- `developing`
- `secure`

Provisional `secure` evidence requires:

- at least 3 clean correct responses;
- at least 2 distinct **clean** evidence families;
- at least one clean reasoning/application/transfer response;
- no hint / no first-attempt error for evidence counted as clean.

For standards that explicitly require producing/drawing, MCQ evidence alone is insufficient:

- `create_regular_polygon_pattern` additionally requires a clean `sequence_build` interactive performance;
- `identify_and_draw_symmetry_axis` additionally requires a clean `draw_axis` interactive performance.

This means battle MCQ can provide useful evidence without falsely claiming full KSSR performance mastery.

## Privacy / data-minimisation

The evidence store never reads or persists:

- question prompt;
- correct answer;
- chosen answer text;
- child name/email;
- free-form text.

Only allowlisted categorical metadata is retained. Unexpected family/template/demand/representation values are reduced to `unknown` instead of being copied into the cloud-synced save blob.

## Lazy migration

A small additive hook runs from `initAll()`:

`window.PAD3Topic7Evidence?.ensure?.(db)`

For a Year 3 profile, or a profile with historical `D3.SHAPE` evidence, it creates the parallel epoch state once and persists it. Re-running is idempotent and does not reset evidence.

Profiles with no applicable D3 evidence are not expanded unnecessarily.

## LIVE safety

Phase 2D-1 remains **SHADOW only**.

The evidence API explicitly refuses LIVE authorization:

`phase2d2_cutover_required`

The Phase 2D-0 gate `requiresEpochMigrationBeforeLive:true` remains unchanged. Phase 2D-2 must perform the explicit cutover/seal and answer-routing integration.

No learner-facing title is changed in this phase.

## Dedicated QA

`node questions/v2/validation/phase2d1-evidence-epoch-qa.js`

**102/102 checks passed locally.**

Coverage includes:

- exact six standards and competencies;
- old `D3.SHAPE` state byte-equivalent after migration;
- historical perimeter evidence excluded from Topic 7 target evidence;
- idempotent migration;
- cloud/local save scheduling only when state changes;
- legacy/non-v2 questions rejected by recorder;
- standard/competency mismatch rejected;
- duplicate attempts rejected;
- clean vs assisted evidence separation;
- clean family diversity only;
- performance requirement for pattern construction;
- performance requirement for symmetry drawing;
- wrong interaction type cannot satisfy performance requirement;
- incorrect final responses never become clean evidence;
- prompt/answer not persisted;
- unsafe categorical metadata sanitised to `unknown`;
- unsupported future schema refuses mutation;
- irrelevant profiles skipped;
- historical D3 evidence on later-grade profiles protected;
- bounded dedupe history;
- explicit Phase 2D-2 LIVE gate.

## Deployment integration QA

After guarded apply on the full production repo, run:

`node questions/v2/validation/phase2d1-evidence-integration-qa.js`

It verifies release wiring, script order, app migration hook, SHADOW default, Phase 2D-0 gates, no answer recorder integration yet, no direct Supabase write, and no new SQL migration.

## Existing regressions required before commit

The deployment agent must also run all existing QS v2 and production regressions:

- build check
- self-test
- CLI
- prism QA
- polygon/symmetry QA
- Phase 2B routing QA
- Phase 2C shadow QA
- Phase 2C.1 central telemetry QA
- Phase 2D-0 curriculum route QA
- Phase 2D-1 evidence epoch QA
- Phase 2D-1 integration QA
- production content-integrity audit
- production adaptive E2E audit

## Intended file scope

New:

- `data/kssr/d3-topic7-evidence-epoch-v3.39.0.js`
- `questions/v2/validation/phase2d1-evidence-epoch-qa.js`
- `questions/v2/validation/phase2d1-evidence-integration-qa.js`
- `PHASE2D1-D3-TOPIC7-EVIDENCE-EPOCH-QA-REPORT.md`

Modified by guarded installer:

- `js/app.js` — one lazy migration hook in `initAll()`
- `index.html` — load evidence module + release cache bust
- `sw.js` — precache evidence module + release header
- `js/version.js` — `3.38.0 -> 3.39.0`

Not changed:

- battle answer resolution
- adaptive scoring
- legacy `D3.SHAPE` question bank
- mastery knowledge thresholds
- Cikgu Dimensi
- parent controls
- Supabase schema
- QS v2 bridge default mode

