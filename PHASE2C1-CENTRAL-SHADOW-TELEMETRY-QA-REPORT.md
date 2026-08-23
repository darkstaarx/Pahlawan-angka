# Phase 2C.1 — Central Shadow Telemetry QA Report

**Status:** database migration applied and verified; guarded frontend deployment ready on top of `6770bed8193f86db9bf4be2071215ceea0eb8251`.

## Purpose
Phase 2C.1 centralizes only QS v2 shadow technical metadata so beta cohort behaviour can be inspected without exposing v2 questions to learners. D3 Topic 7 remains default `shadow`; the production dispatcher still receives `null` and shows legacy questions.

## Supabase migration
Applied to project `Pahlawan Angka` as migration `qsv2_shadow_telemetry_v1`.

Table: `public.qsv2_shadow_events`.

Stored fields only:
- `client_event_id` (UUID retry key)
- `child_id` (pseudonymous ownership/RLS reference)
- schema/app version/runtime source hash
- mode/outcome/reason
- generation duration
- standard/competency/template IDs
- generator fingerprint
- timestamps

Never stored:
- question prompt
- answer/distractor text
- child display name
- guardian name/email
- auth user ID

### RLS / grants
- RLS enabled.
- `anon`: no table access.
- `authenticated`: INSERT + SELECT table grants, constrained by RLS.
- INSERT policy: only a `child_id` belonging to the authenticated guardian's family.
- SELECT policy: admin role only.
- No client UPDATE or DELETE grant/policy.

An authenticated owner INSERT was executed inside a transaction and rolled back successfully, verifying the ownership policy without leaving test telemetry.

Supabase security advisor found no new table-specific security issue. The existing unrelated Auth warning about leaked-password protection remains outside this phase.

## Frontend delivery design
New `js/qsv2-shadow-sync-v3.37.0.js`:
- receives the same metadata-only shadow payload from the Phase 2C bridge;
- attaches active `child_id`, app version and runtime source hash only at the central-upload boundary;
- queues locally with a UUID event key;
- uploads in small batches to `qsv2_shadow_events`;
- uses `client_event_id` conflict handling for retry idempotency;
- retains queue on network/database failure;
- retries when online;
- never blocks or throws into question generation.

### Privacy gate
`PATelemetry` now exposes `enabled()` and `record()` returns whether the existing telemetry gate accepted an event. The bridge calls the central uploader **only when `PATelemetry.record(...) === true`**. Therefore the existing `db.telemetryOptOut` governs both local and central telemetry. A user who opts out cannot enqueue or flush central shadow events.

## Validation
- QS build check: PASS
- self-test: **71/71**
- registry CLI: PASS (`mapped=44 enabled=6`)
- Prisma QA: **30,234/30,234**
- Polygon/symmetry QA: **37,037/37,037**
- Phase 2B routing QA: **13,559 checks, pass**
- Phase 2C shadow QA: **46/46, visible parity `off===shadow`**
- Phase 2C.1 central sync QA: **36/36**

Central sync QA verifies:
- strict remote field allowlist;
- no prompt/answer/name/email/user ID fields;
- no-auth child context cannot enqueue;
- opt-out blocks enqueue and flush;
- failed upload keeps queue for retry;
- successful upload clears queue;
- idempotent conflict key/options;
- bridge forwards centrally only after the established local privacy gate accepts the event;
- shadow still returns `null` to the learner-visible dispatcher.

## Deployment regressions required
Before commit/push on full production repo:
- `node audit/content-integrity-v3.18.1.js`
- `node audit/adaptive-e2e-v3.12.1.js`

Both must exit 0.
