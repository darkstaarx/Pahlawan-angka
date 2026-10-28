# Demo Jelajah V1 — real gameplay preview

Branch: `codex/demo-jelajah-v1`. Production is not deployed by this work.

## Run locally

```powershell
node tools/build-jelajah-preview.cjs
node tools/serve-jelajah-preview.cjs
```

Open http://127.0.0.1:4173/demo-jelajah.html. Build before packaging with
`node tools/package-jelajah-preview.cjs`. Publish only a Netlify draft, never `--prod`.

## Flow and source of behavior

- Select Darjah 1–6. Four 32px navigation tabs preserve gameplay space.
- First six battle questions sample different grade domains from the actual bank,
  retaining the original Segel renderer, interactions, art and animations.
- The next six are explicitly simulated. Presets contain only a seed, weak skill,
  and correct/wrong intentions. `chooseModeAndSkill`, production journey
  `firstWrong`/`recordResolved`, and intervention confirmation choose and validate
  follow-ups. No handwritten demo question bank or invented adaptive percentages.
- After battle all cards unlock. Completed cards remain replayable. If scripted misses leave seals intact,
  the original finisher focus/charge/strike sequence plays before rescue.
- Mini-game opens an explanatory popup, then a copied original production game
  selected for the same simulated weak skill. Three manual successful rounds lead
  to an explicit hand-off to two actual PAWorked / Jom tengok cara rounds.
- Cikgu Dimensi opens an explanatory popup and six mixed original bank questions.
  The isolated focus is set to the same weak skill; the real confirmation queue
  starts focused follow-ups, then the actual selector chooses further practice.
  The old Learning Camp UI is not mounted.
- Otak Pahlawan renders the current parent Ringkasan Anak using the original
  parentGlanceMarkup / PAParentGlance helpers and parent dashboard stylesheet.
  Ringkasan and Kemahiran tabs separate the concise summary from diagnostic detail.
  The obsolete Cara Belajar Sekarang card is not included. Actual evidence thresholds apply;
  short evidence can display Bukti awal rather than an invented diagnosis.
- Daftar / Beli remains in a reserved compact footer. Offers open the original
  registration/pricing UI in a separate modal.

## Isolation and production access

The runtime loads memory-only storage and blocks non-GET/external network writes
before app scripts. The six manual answers are excluded from simulated analysis.
Simulation clones profile/session state; synchronous production helpers swap to
that clone and restore the original state in finally blocks. No actual learner
mastery, rewards, entitlement, quota or cloud record is updated.

Production changes are narrow guards: the explicit `jelajahEngine` guest bypasses
legacy PADemo skill selection, and a guarded pure simulation entry calls existing
journey functions. Normal production authorization and response paths remain.
Original mini-game files and the production landing page are untouched.

## Verification

`audit/jelajah-v3-engine-browser.cjs` covers six grades at mobile widths, mixed
manual skills, actual confirmation follow-ups, focus practice, real report markup,
storage protection and browser errors. Manual answers in this integration audit
use the existing submitInteraction API; it does not test every bank widget by hand.

`audit/jelajah-real-games-browser.cjs` drives real mini-game DOM controls for three
manual successes and two guided rounds in each grade. The commercial access,
funnel, page-lock and isolation regression suites cover the protected paid paths.
Evidence is stored under `review/`.

Current draft preview: https://6ae1bbb6a46529568116f833--pahlawanangka.netlify.app/demo-jelajah.html

Worked examples now advance only through Seterusnya clicks. There is no timed step advancement; each finished example remains visible until Contoh seterusnya or Selesai is clicked.
