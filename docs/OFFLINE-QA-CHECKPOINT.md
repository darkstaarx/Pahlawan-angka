# Offline R&D QA checkpoint — 2026-10-09

**NO-GO for production.** Staged code is not linked to live PWA/backend.

## Static cache audit
- Service worker APP_SHELL has 436 paths; all exist in main Git tree.
- Combined original Git blob sizes are 86,093,375 bytes (~86.1MB raw). NOT HTTP transferred bytes.
- Included 104 PNG assets = 65,973,008 bytes and 114 WebP = 16,999,802 bytes.
- SW cache.addAll on every release plus activation deletion of all older caches makes updates wasteful and unsafe for offline continuity.
- Cross-origin Supabase UMD script (jsdelivr) is outside same-origin SW caching.

## Staged modules
- Account-bound save wrapper (js/account-save-guard-v1.js) retains existing DB schema and partitions copies by user UUID and child UUID. Durable dirty snapshot, CAS response, conflict stop, switching tests.
- SQL migration for revision CAS (STAGED, NOT APPLIED). Old direct upserts must be fenced in coordinated rollout.
- Edge Function pa-offline-entitlement (STAGED, NOT DEPLOYED) signs authenticated paid access with env-stored P-256 private key.
- Offline receipt JS verifier currently FAILS CLOSED because PINNED_PUBLIC_JWK is deliberately null until production key provision.
- tools/generate-offline-signing-key.cjs and .gitignore support key generation without leaking private material.
- Offline pack downloader validates manifest and scopes, verifies same-origin fetches, resumes interrupted downloads, reuses unchanged hash-checked assets across versions, and retains old ready packs.
- Inventory report docs/OFFLINE-CACHE-INVENTORY-v1.json contains Git blob sizes, NOT network bytes.

## Release blockers
1. Wire guard to all cloud.js, app.js, account switch, child select and logout flows.
2. Deploy/test signed receipt issuer and pin matching public JWK. No subscription/expiry invented.
3. Deploy/test CAS and prevent old direct upserts; conflicts must preserve both states and not duplicate rewards.
4. Create complete entitlement-scoped asset manifest for all supported grades, including dynamic audio, assets, scripts and questions.
5. Replace mandatory oversized SW precache and add atomic update, status, safe delete.
6. Run A-I browser tests including Android Chrome/PWA, iPhone Safari, interrupted update and offline gameplay.
7. Measure transferred network bytes via real browser instrumentation. None measured.

Prices RM19/RM29 and game rules unchanged. Main production, Netlify and Supabase production untouched.
