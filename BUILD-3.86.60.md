# v3.86.60 — D2.1.5 Menganggar with a known reference

Set A always contains exactly 10 objects. Pupils estimate unknown Set B by comparison; both sets use identical objects with readable staggered spacing, without ten-object trays. Five variants cover roughly half, almost equal, one-and-a-half, double and triple the reference (21 possible target counts). Answer choices are positive, unique and have exactly one closest estimate. Hints compare B to A. D2.1.6 rounding is unchanged.

The core bank, content wrapper and both integrity versions share the same builder. Updated entry-point asset versions and PA_APP_VERSION invalidate the service-worker cache; the integrity loader already keys its URL to PA_APP_VERSION.

Validation:
- 2,250 generated questions across core/content/integrity/assessment-depth; correct visual quantities, unique closest answer, no overlap, five relation modes.
- Existing content-integrity regression: 4,160 samples / 52 skills; zero failures. Harness now loads actual helpers to satisfy shared generator/tagging dependencies.
- Existing D1 fraction regression passed.
- Headless Edge visual fixture passed at 320, 375, 390 and 768px for all modes; labels visible, no horizontal clipping, 44px answer targets. This is a question-rendering fixture, not a complete signed-in gameplay test.
- Independent Dimensi review: PASS.
- GitHub Actions regression added, including Chromium mobile fixture.

Run from repository root:

    node audit/d2-estimation-reference.test.js
    node audit/content-integrity-v3.18.1.js
    node audit/d1-fraction-variety.test.js
    node audit/d2-estimation-mobile.test.cjs

The browser check needs Playwright plus Chromium; PA_PLAYWRIGHT_PATH and PA_BROWSER_CHANNEL can select an existing local installation/browser.
