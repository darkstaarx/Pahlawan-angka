# Wira visibility recovery — v3.86.72

An image-loading error resolves to a null texture. Non-reference idle frames previously remained in the animation loop, so the cinematic could select a null texture after hiding Wira. `prepareEntrance()` then threw while reading the image, and the reveal callback consumed its timeout and silently caught the error. Wira could remain invisible while the arena, pet and question continued working. The failure was reproduced using the production entrance methods in a Node VM; the deployed script contained the same unguarded access.

Failed hero frame slots now use another loaded hero frame without changing the authored frame cadence. The entrance restores an opaque, visible idle hero if its silhouette is unavailable or preparation throws. The current module also initializes once across the static and production-refresh script URLs, preserving the same host and cinematic wrappers. Existing art is unchanged.

Validation:

- Hero visibility regression tests, result lifecycle tests and entry-flow tests pass.
- Runtime and production-journey syntax checks pass.
- Commercial-access checks retain two pre-existing fixture failures (`overlay.addEventListener` and missing `dataset.mode`); both reproduce when changed inputs are replaced with the committed baseline. No commercial-access behavior is modified.
- Actual browser rendering and service-worker upgrade were not exercised: local browser use is disabled in Work settings.

GitHub Pages receives this release through its existing deployment workflow. Netlify remains a separate manual release.
