# Account-safe offline save & signed access — WIP gates

Branch only. Do not merge or deploy until mandatory release gates are met.

## Pieces completed in this branch
- `js/account-save-guard-v1.js` adds account UUID + child UUID keyed mirrors **of the same game snapshot**; not a new game-state schema. Legacy key is imported only for a cloudChildId already confirmed to belong to the active signed-in guardian. Profile bound copies survive switching; logout clears the global legacy mirror. Existing `db` gameplay is not yet wired to this facade.
- `supabase/migrations/20261009_offline_save_cas_STAGED.sql` adds a server_revision and a guardian-owned CAS save RPC. Its return value signals conflict and does not overwrite remote history. No schema changes were applied.
- `supabase/functions/pa-offline-entitlement/index.ts` authenticates the guardian, checks the existing `get_commercial_access` RPC, and signs a compact one-time-plan proof with ECDSA P-256. **Not deployed**. Reads its private JWK only from the `PA_OFFLINE_SIGNING_JWK` Supabase secret.
- `js/offline-entitlement-v1.js` verifies ECDSA signatures and user binding. Its `PINNED_PUBLIC_JWK` is intentionally NULL until a managed production signing key is generated, public key audited, and key-rotation approach documented. Therefore it fails closed.

## Implementation risks still requiring resolution
1. Production still uses `pa_coach_v6_full` for active global gameplay. All save, child switching, app startup and session restoration paths must be changed consistently before enabling offline; otherwise unbound snapshots can still leak between profiles.
2. Old web clients use direct `game_saves.upsert`; they can bypass CAS while they remain installed. Plan an atomic migration/compatibility gate before revoking direct INSERT/UPDATE; an immediate revoke would break older clients.
3. Conflict resolution intentionally pauses on divergent snapshots rather than summing coins, pet rewards or XP. Automatic merge could double-award. A specific user-safe resolution/replay design is required.
4. Key issuance + public-key pinning + server code deployment must be tested on Supabase staging. A proof never expires merely because the user purchased one time; server-side cancellation/revocation cannot propagate while offline. Downloaded client assets cannot be perfectly protected against local tampering.
5. Offline cached auth identity must be bound to verified receipt and user-selected account. Explicit signout/account switching must not reveal earlier user's local snapshot.
6. Full offline manifest, user menu, atomic SW update, cross-origin Supabase SDK bundling, worksheet QA, real Android/iOS tests and network byte measurements are not complete.

## Invariants for safe rollout
- First login + purchase activation need internet.
- Progress captured to account-bound localStorage before network writes.
- Pending state survives restart. When reconnecting, CAS uses the server revision observed when snapshot was acquired.
- A revision conflict never discards either copy and never silently reapplies a reward.
- Signed entitlement is bound to guardian UUID; the backend remains authoritative whenever online.
- No policy changes to the RM19/RM29 one-time pricing or level mechanics.

## Test evidence
- Account save module: mock tests exercised verified identity requirement, separate child state, cross-child rejection, local-before-cloud, acknowledgement, conflict retention and logout legacy-mirror removal.
- Downloader tests: manifest validation, entitlement callback, cache ready state, reuse and remove-assets.
- Real browser, Android PWA and iOS Safari tests not yet run. No measured transferred network bytes.

Deployment status: **NO-GO**. Production `main`, Netlify and Supabase untouched.