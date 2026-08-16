# Pahlawan Angka v3.24.1 — Cache Chain Hotfix

Expected base:
`bc6ae24bea485ede9bf5a747d8db3f43c3ab6aeb`

## Root cause

The approved happy profile assets and updated Profile Manager were correctly committed in `bc6ae24`, but `index.html` still loaded:

`js/pwa.js?v=3.18.0`

That stale top-level cache key allowed an old loader / old Profile Manager resource to remain active on an installed/mobile PWA.

## Fix

- index cache key -> `js/pwa.js?v=3.24.1`
- app version -> 3.24.1
- Profile Manager gets a new URL:
  - `js/profile-manager-v3.24.1.js`
  - `css/profile-manager-v3.24.1.css`
- service-worker cache -> `pahlawan-angka-v3.24.1`
- service-worker install explicitly fetches shell assets with `cache: reload`
- scripts/styles/navigation use fresh network requests before cache fallback
- new SW claims clients and reloads currently open Pahlawan Angka tabs once after activation

Approved assets remain:
- `assets/heroes/wira/profile-happy-v1.webp`
- `assets/heroes/bunga/profile-happy-v1.webp`

No battle assets or learning logic are changed.
