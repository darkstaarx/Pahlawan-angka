# Phase 2D-2 R2 — D3 Topic 7 Controlled LIVE QA Report

**Target base:** `2f7906215baa846b005cdda2cc7c585a55110998` (Phase 2D-1).
**Release target:** `3.40.0`.

## R2 regression-drift correction
The first guarded package exposed two stale historical QA assumptions during full-repo deployment and was correctly stopped before commit. Production logic was not the failing surface. R2 adds both tests to guarded scope:
- `phase2b-integration-qa.js` explicitly provides a controlled-cutover authorization fixture before exercising the LIVE path; direct un-authorized LIVE remains blocked in production and is covered by Phase 2D-2 QA.
- `phase2d1-evidence-integration-qa.js` retains all Phase 2D-1 evidence-contract assertions while resolving release/cache-bust checks dynamically from `PA_APP_VERSION`, so later releases do not fail a historical compatibility test merely because the app version advanced.


## Purpose
Phase 2D-2 is the first learner-visible QS v2 cutover, but it is deliberately limited to an authenticated DEV/admin device. The production default remains **SHADOW**.

## Safety model
- Persistent compatibility/save key remains `D3.SHAPE`.
- Only D3 Topic 7 can be authorized LIVE.
- Directly forcing bridge mode to `live` is insufficient: the adapter requires a separate controlled-cutover authorization bound to a DEV/admin device, local cutover flag, and prepared evidence epoch.
- Existing bridge kill switch remains an immediate fail-closed rollback to legacy.
- Explicit `Kembali SHADOW` clears the per-device LIVE flag without deleting target evidence.
- Runtime/generator/template errors always return `null` to the dispatcher, which invokes the legacy bank.
- Learner title changes to `Prisma, Poligon Sekata & Paksi Simetri` only for an actual QS v2 question. A legacy fallback keeps the legacy title instead of mislabelling the item.

## Evidence isolation
QS v2 battle responses are written to `db.qsv2Evidence.topics['D3.T7']` through the Phase 2D-1 evidence API.

Historical `db.skills['D3.SHAPE']` remains a legacy perimeter aggregate. During controlled LIVE:
- first-attempt wrong QS v2 responses do not mutate the legacy aggregate or legacy coach/frontier recorders;
- final QS v2 answer resolution may temporarily use the existing battle path, then restores the legacy skill object before persistence/reward/frontier operations;
- the final response is recorded once in the Topic 7 evidence epoch;
- legacy confirmation/intervention logic is bypassed for QS v2 until a dedicated adaptive integration phase.

This prevents old perimeter mastery and new prism/polygon/symmetry evidence from becoming one ambiguous score.

## Battle coverage
The current bridge exposes **16 battle-compatible MCQ templates** across all six enabled Topic 7 standards.

The authored performance items remain outside the answer-button battle UI:
- 7.2.2 `sequence_build`
- 7.3.1 `draw_axis`

Therefore those two competencies cannot reach full `secure` evidence from battle MCQ alone; the Phase 2D-1 performance requirement remains intact.

## Pilot telemetry
A neutral table `public.qsv2_pilot_events` was created for SHADOW/LIVE generation metadata.

Migration: `qsv2_pilot_telemetry_v1` **already applied to production Supabase before package sealing**.

The table stores only:
- child reference for RLS/segmentation;
- app/source version;
- mode/outcome/stable reason;
- generation time;
- standard/competency/template/fingerprint IDs;
- timestamp.

No prompt, answer, chosen answer, child name, or email is uploaded.

RLS:
- family owner can INSERT only for their own child;
- SELECT is admin-only;
- no client UPDATE/DELETE grant.

Existing telemetry opt-out remains the gate for central pilot upload.

## New dedicated QA
`phase2d2-controlled-live-qa.js`: **48/48 checks passed locally**.

Coverage includes:
- admin/dev-only activation;
- kill-switch activation refusal;
- local cutover flag;
- evidence epoch contract;
- legacy cutover snapshot;
- direct authorization rejection without seal/flag;
- D3.SHAPE-only scope;
- conditional learner title;
- bounded non-PII attempt IDs;
- legacy skill snapshot/restore;
- clean vs retry/hint evidence arguments;
- rollback retains evidence;
- neutral SHADOW/LIVE telemetry sanitization;
- no prompt/answer fields;
- telemetry opt-out blocks upload.

`phase2d2-integration-qa.js`: **53/53 checks passed** on the disposable post-installer fixture, including explicit verification of both regression-drift corrections. It must also run after guarded apply on the full production repository.

Guarded installer simulation: dry-run PASS without mutation; real apply PASS; modified JS syntax PASS; integration QA PASS.

## Production regression requirements
Before push, deployment agent must run:
- QS v2 build check
- self-test
- CLI
- prism QA
- polygon/symmetry QA
- Phase 2B routing QA
- Phase 2C shadow QA
- Phase 2C.1 central shadow sync QA
- Phase 2D-0 curriculum route QA
- Phase 2D-1 evidence epoch QA
- Phase 2D-1 evidence integration QA
- Phase 2D-2 controlled LIVE QA
- Phase 2D-2 integration QA
- content-integrity regression
- adaptive E2E regression

## Intended production scope
New:
- `data/kssr/d3-topic7-live-cutover-v3.40.0.js`
- `js/qsv2-pilot-sync-v3.40.0.js`
- `js/dev-qsv2-live-v3.40.0.js`
- `questions/v2/validation/phase2d2-controlled-live-qa.js`
- `questions/v2/validation/phase2d2-integration-qa.js`
- `supabase/schema/qsv2_pilot_telemetry_v1.sql` (source-of-truth only; migration already applied)
- this report

Guarded modifications:
- `index.html`
- `sw.js`
- `js/version.js`
- `js/app.js`
- `js/battle.js`
- `questions/index.js`
- `questions/v2/engine/legacy-adapter.js`
- `questions/v2/validation/phase2b-integration-qa.js` — controlled LIVE fixture authorization
- `questions/v2/validation/phase2d1-evidence-integration-qa.js` — release/cache checks follow current app version

No legacy question bank, Cikgu Dimensi content, parent controls, rewards tables, or general adaptive engine file is modified.
