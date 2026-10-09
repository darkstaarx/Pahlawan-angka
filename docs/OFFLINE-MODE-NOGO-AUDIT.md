# Pahlawan Angka — Offline Mode Audit (NO-GO)

Status: **not implemented end-to-end, not deployed**. This is a feature branch only. No production Supabase/Netlify changes.

## Existing offline capabilities
- PWA manifest and service worker exist. SW pre-caches a large APP_SHELL automatically and runtime-caches same-origin assets.
- Current SW install uses cache.addAll with reload, then skipWaiting; activation deletes all older app caches. This is not an explicit validated download, and large content is re-fetched on release.
- Navigation and JS/CSS are network-first with cache fallback. Graphics/audio are mostly cache-first; several dynamic assets are not guaranteed installed.
- Questions, rescue combat, Khazanah, and worksheet PDF generation are client JS. But complete offline dependencies and gameplay on a disconnected real browser are unverified.
- Supabase JS is loaded from jsdelivr, a cross-origin dependency outside the SW cache. Offline auth boot is not supported reliably.

## Purchase and user-data gates
- Plans in live Supabase schema: free, premium, family_plus. RM19/RM29 are one-time prices in current pricing UI; do not add a new expiry/subscription policy.
- PACommercial.refresh calls get_commercial_access and falls back to free when unreachable. A user-bound signed receipt issuer/verifier does not yet exist. A plain editable paid flag is not acceptable.
- Existing game save uses localStorage pa_coach_v6_full shared between children. Profile selection checks cloudChildId, but no per-user/per-child durable offline save isolation.
- Cloud game_saves uses full upsert; there is no revision-checked atomic merge for concurrent offline/online changes. This is a risk for lost progress and duplicate replay of rewards.
- Never write offline deltas to a different account. Migrate old shared storage only following confirmed identity.

## Staged implementation
- js/offline-pack-core-v1.js is a self-contained, NOT WIRED download component. Validates same-origin manifest, checks an external entitlement-verification callback, writes the completion marker last, preserves previous packs, supports retrying partial packs, SHA-256 if manifest provides hashes, remove-assets only, browser storage persistence request.
- Limitations: manifest coverage for a real battle flow has not been assembled; no authentic signed receipt issuer; no UI; no cloud offline queue/CAS; no signed manifest. Cached resources may be publicly fetched regardless of UI entitlement checks.
- Body-byte counts from JS responses are not reliable HTTP transferred-byte measurements (compression/service worker transfers). Real Network-panel measurements remain required.

## Release criteria
1. Secure server-signed entitlement receipt with backend-managed private key and client-pinned public key, bound to guardian identity. Offline startup must verify it and limit accessible content to current server entitlements on activation.
2. Full manifest by paid/free scope, listing all same-origin scripts, styles, 3D libraries, fonts, battle arenas, sprites, audio, question banks, Khazanah and rescue pet assets; audit dynamic dependencies.
3. Per-account/per-child local state, durable pending operation queue, server-side compare-and-swap (CAS) revision and conflict policy; prove duplicate rewards are not issued.
4. Incremental atomic SW cache updates with old ready packs retained; remove only download assets. Handle browser quota, eviction and failed updates.
5. Integrate existing mobile BM menu and status indicators only after all of the above; worksheet offline only after verified test.
6. Run browser tests A-I including Android Chrome installed PWA and iOS Safari; measure actual transferred network bytes on first download, repeat, and update.

## Evidence & constraints
- AGENTS.md absent from repository root. No instructions were assumed.
- Existing JS data paths and Supabase plan RPC were inspected. No user data queried.
- No genuine browser automation, airplane-mode device, or Netlify deployment tool is available in this session.
- Current staging library static syntax and mock checks are not evidence that offline gameplay is ready.
