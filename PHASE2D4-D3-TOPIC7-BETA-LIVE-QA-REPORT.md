# Phase 2D-4 — D3 Topic 7 Beta LIVE Rollout QA Report

**Base:** `858eb9ad63e9d4f0f52021c7bb2e187607e7dc57`  
**Target release:** `3.42.0`  
**Scope:** move the already-approved D3 Topic 7 QS v2 pilot from DEV/admin-only LIVE to a remotely gated closed-beta audience.

## Rollout audience

Learner-visible QS v2 LIVE is allowed only when ALL are true:

1. authenticated guardian session exists;
2. active child exists and matches the loaded cloud save;
3. loaded child `schoolGrade === 3`;
4. guardian has the current Beta Privacy + Terms consent versions;
5. Supabase `qsv2_rollout_config.d3_topic7_beta_live.enabled = true`;
6. config audience/topic/skill exactly match `consented_beta_guardians / D3.T7 / D3.SHAPE`;
7. the config result is fresh (5-minute refresh, 15-minute authorization TTL);
8. the local QS v2 kill switch is not active;
9. the existing D3.T7 evidence epoch is prepared and excludes legacy perimeter evidence.

Any missing/error/stale gate fails closed to SHADOW/legacy.

## Central rollback

Production migration `qsv2_beta_rollout_v1` creates a non-PII single-row remote flag. It has already been applied to Supabase project `pxxekdeqlxwqwaqvfbnh` with:

- rollout key: `d3_topic7_beta_live`
- enabled: `true`
- audience: `consented_beta_guardians`
- topic: `D3.T7`
- skill: `D3.SHAPE`

RLS permits SELECT to authenticated users only. The client has no grant to update the flag.

Emergency rollback is a single database update setting `enabled=false`; online clients re-check every 5 minutes and authorization expires after 15 minutes even without a successful refresh.

## What remains unchanged

- `questions/v2/engine/legacy-adapter.js` default is still `shadow`.
- The bridge still falls back to legacy on unauthorized LIVE, missing runtime, missing generator or exceptions.
- Admin/DEV Controlled LIVE remains available independently for inspection.
- D3 Topic 7 remains the only LIVE QS v2 skill (`D3.SHAPE`).
- 26 Topic 7 templates / 24 battle MCQs / 2 interactive performance templates remain unchanged from Phase 2D-3.
- Interactive `sequence_build` and `draw_axis` remain outside battle.
- Legacy `db.skills['D3.SHAPE']` mastery/evidence isolation remains unchanged.
- Existing `qsv2_pilot_events` telemetry remains metadata-only.
- No question prompt, answer text, display name or email is added to the rollout config or rollout module.
- No battle animation, reward, Cikgu Dimensi, parent control or other topic routing change is part of this phase.

## New files

- `js/qsv2-beta-rollout-v3.42.0.js`
- `supabase/schema/qsv2_beta_rollout_v1.sql`
- `questions/v2/validation/phase2d4-beta-rollout-qa.js`
- `questions/v2/validation/phase2d4-integration-qa.js`
- `PHASE2D4-D3-TOPIC7-BETA-LIVE-QA-REPORT.md`

## Modified files

- `data/kssr/d3-topic7-live-cutover-v3.40.0.js`
- `js/cloud.js`
- `js/dev-qsv2-live-v3.40.0.js`
- `index.html`
- `sw.js`
- `js/version.js`
- `questions/v2/validation/phase2d2-controlled-live-qa.js`
- `questions/v2/validation/phase2d2-integration-qa.js`
- `questions/v2/validation/phase2d3-integration-qa.js`

## Local package QA completed

Standalone beta-rollout + cutover simulation:

- **36 checks passed**
- beta guardian can LIVE without DEV mode/local unlock when every remote/consent gate is valid;
- remote OFF → SHADOW;
- stale consent → SHADOW;
- non-D3 learner → SHADOW;
- config/consent lookup error → SHADOW;
- local kill switch blocks LIVE;
- historical admin Controlled LIVE still works while remote beta is OFF;
- rollout module persists no eligibility/user ID in localStorage;
- SQL config contains no user/child PII.

All new JS files and installer pass `node --check` before packaging.

## Mandatory repository regression before commit

Run every existing Phase 2B–2D-3 regression plus:

```bash
node questions/v2/validation/phase2d4-beta-rollout-qa.js
node questions/v2/validation/phase2d4-integration-qa.js
```

Also run:

```bash
node questions/v2/build/build.js --check
node audit/content-integrity-v3.18.1.js
node audit/adaptive-e2e-v3.12.1.js
```

Do not commit if any mandatory regression fails.


## R2 deployment-gate correction

The first deployment attempt correctly stopped before commit after 17/18 mandatory regression suites passed. `phase2d3-integration-qa.js` detected that the Phase 2D-4 DEV-panel replacement had accidentally removed the existing approved scope wording `battle-compatible yang diluluskan`. R2 restores that wording exactly and adds the same invariant to `phase2d4-integration-qa.js`. This is a validation/copy correction only; beta eligibility, remote rollout gating, fail-closed behavior, evidence isolation, telemetry and database state are unchanged from R1.
