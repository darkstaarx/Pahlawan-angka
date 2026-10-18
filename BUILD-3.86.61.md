# 3.86.61 — smaller artwork and persistent asset caching

- Converted the logo, loading shield and two onboarding illustrations to WebP.
- Converted five pets' sad/happy images and sprite sheets to pixel-exact lossless WebP; original PNGs remain for compatibility.
- App-shell code keeps its release cache. Artwork uses a separate persistent cache keyed by content hash so an app-only release can reuse existing artwork.
- `tools/generate-asset-manifest.cjs` hashes the actual `assets/` bytes. Run it after changing assets; Netlify regenerates and checks the manifest during its build to handle checkout line endings correctly.
- The immutable HTTP rules apply only to the newly versioned WebP URLs. Change the filename when changing an immutable image's contents. Other asset URLs retain their existing HTTP policy.
- Cached artwork from older releases is only migrated after verifying its bytes against the manifest. Historical content hashes remain available for older tabs and rollback.

Verification includes service-worker migration/update/failure tests, browser update/offline tests, and pet asset URL/precache checks. Four existing production-route pet test failures reproduce on the previous commit and are unrelated to artwork conversion.
