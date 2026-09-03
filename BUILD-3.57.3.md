# Pahlawan Angka v3.57.3 — Battle Presentation Runtime Hardening

## Scope

This release implements only the three independently confirmed v3.57.2 blockers:

1. stale transient battle presentation crossing a new-journey boundary;
2. an unowned demo boss-checkpoint timer firing after session restoration;
3. Sidma ordinary attacks alternating into the unapproved stationary ranged move.

No question, curriculum, adaptive-selection, learner-review, scoring, mastery, reward, progression, worksheet, cloud, Supabase or approved artwork behavior is changed.

## Root causes and fixes

- Battle callbacks previously used loose timers. `battle.js` now owns them under a journey generation. A new journey cancels the old generation and performs one idempotent DOM/FX reset.
- Demo boss completion previously scheduled the normal mission checkpoint. Demo now schedules only its victory presentation, and `PADemo.finish()` cancels remaining journey-owned timers before restoring the prior session. `showBossCheckpoint()` also safely returns when no valid skill exists.
- Sidma's normal dispatcher previously alternated `runSidmaAttack()` and `runSidmaSkill2()`. Every ordinary attack now dispatches the existing Jejak Sigma dash; Rumus Penamat remains the enemy-defeating ranged finisher.

## Journey boundaries

The reset is installed centrally for new normal/Cikgu/DEV missions and called explicitly for demo and Guardian Focus starts. It is not called by `battle()` repaint or browser resume.

## Regression evidence

`audit/battle-runtime-blockers-v3.57.3.js` runs behavioral VM tests for:

- clean streak/transient DOM;
- idempotence and protected-state preservation;
- demo versus normal checkpoint scheduling;
- null checkpoint safety;
- stale-generation isolation;
- five consecutive Sidma dash dispatches;
- Rumus Penamat dispatch;
- pet-first timing;
- Wira/Bunga implementation hash locks.

## Browser limitation

The implementation environment's controlled cloud browser rejected the local server with `net::ERR_BLOCKED_BY_CLIENT`. The patch was therefore not represented as browser-verified. Organic post-build viewport, reduced-motion, pet-fixture and seven-second post-result observation remain required before deployment.
