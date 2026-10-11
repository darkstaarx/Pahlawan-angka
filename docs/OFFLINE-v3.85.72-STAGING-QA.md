# Offline mode v3.85.72 — staging integration, release NO-GO

Repo branch: `feature/offline-mode-audit-and-core`. Base merged from `main` v3.85.71; `main`/Netlify/Supabase untouched.

## Implemented in staging
- Service worker shrinks the mandatory `APP_SHELL` to JS/CSS/HTML/manifest/app icons instead of precaching large images. New install creates an atomic ready marker, retains a previous shell, delays update activation when controlled windows are open, uses Git blob IDs as deployment-to-deployment reuse fingerprints, and saves the exact existing Supabase CDN SDK response.
- `js/account-save-guard-v1.js` mirrors the original game JSON snapshot per guardian UUID and child UUID and keeps dirty state across restarts. Cross-child saves are rejected before touching the shared legacy key. Server acknowledgements use a revision and stale cloud data cannot replace dirty local data.
- `js/cloud.js` staging version wires the local guard to game save, child selection, logout, offline reopen and reconnection. It *requires* `save_game_snapshot_cas` and does not fall back to unsafe full upserts.
- `js/commercial-foundation-v3.25.0.js` attempts a signed receipt online after the existing commercial RPC. Offline access is derived only from a cryptographically verified, account-bound receipt.
- `js/offline-entitlement-v1.js` signature verifier rejects all paid access until a real public signing key is pinned. Edge issuer source is staged but not deployed and signing secret has NOT been provisioned.
- `js/offline-pack-core-v1.js` supports hash-checked manifest files, scoped download, retry, quota preflight, reuse of unchanged old/core assets, complete-marker check and remove-assets-only.
- `js/offline-manager-v1.js` presents a Bahasa Melayu selector, estimated bytes, progress, retry, remove assets and save/sync label. It cannot mark ready when manifest/entitlement is not verified.
- `tools/build-offline-manifests.cjs` can generate hashed six-grade manifests from a complete checkout. It is not run here: full asset bytes and browser tests are required, so manifests are not shipped.

## Source audit
- Latest source SW before this patch listed 447 resources, including ~86 MB of raw media (not transferred traffic).
- Media inventory includes 249 current/likely runtime files, ~92.73 MB original asset bytes. This is a candidate input, NOT verified gameplay completeness.
- Worksheet uses local question generation and Canvas/PDF code but has NOT been tested offline.
- AGENTS.md was not found in root at initial audit. Search full tree before final release.

## Tests executed
- JavaScript syntax checks for staged SW/Cloud/Commercial/Download Manager/Downloader/account guard/client verifier.
- Downloader mock tests: manifest and scope rejection, retry after network interruption, SHA-256 reuse of old packs, old-ready-pack preservation, remove-assets-only.
- Account guard mock tests: account/child partition, stale-cloud prevention, pending edits while RPC is in flight, conflict preserved, logout isolation.
- Service worker simulated CacheStorage tests: install ready marker, reuse fingerprints, wait for safe activation, old-shell preservation after update, fail-closed interrupted update.
- These are MOCK tests. No genuine end-to-end A-I, browser Network transferred bytes or Android/iOS tests have passed.

## Mandatory gates before merge/deploy
1. Configure a private Supabase P-256 JWK via secret dashboard, pin matching public key, and verify signed receipts online/offline with a test paid account. No subscription or expiry should be introduced.
2. Test CAS SQL migration on staging DB, upgrade all direct-upsert clients before revoking direct writes; prove restore/rollbacks and no duplicate reward.
3. Run manifest generator in a checked-out repo, verify dependency closure of D1-D6 battles/rescue/Khazanah, and publish hashes only for tested packs.
4. Test genuine Chrome/PWA airplane-mode restart, wrong/right answers, rescue, restart saved progress, reconnect, account switch, partial download, update and Safari iOS.
5. Collect true transferred bytes for first download, cached return and update via Network panel; do not substitute raw Git blob size.
6. Ensure no production deployment until tests and backend provisioning clear gates; show clear platform-not-tested disclosure.

## Security / limitations
- Paid download of ordinary static HTML/CSS/JS/images cannot be made cryptographically inaccessible on a client device. A signed receipt protects the UI/access flow; determined users can copy content.
- Browser cache, especially on iOS, may be evicted or cleared. Persistent storage is requested where supported and this is not a backup for cloud sync.
- Local client snapshots are not a secure anti-cheat ledger. Never silently merge competing XP, pet unlocks or coins.

Current status: **UNFINISHED, NOT DEPLOYED**.
