# Agent guide — Pahlawan Angka

Before working on questions, scoring, telemetry, parent reports, worksheets,
mini games or game locks, read **docs/PA-DIAGNOSTIC-BRAIN.md**. It is the
product north star: what PA must detect about each child, the evidence
thresholds, the parent report format, and the phased build plan.
Its section **8a (Handoff)** says what is done, the open PR stack, and the next task.

House rules:
- UI copy is Bahasa Malaysia; short, plain sentences.
- Netlify does not auto-deploy on push (`ignore = "exit 0"`); the owner deploys.
- Regenerate `js/asset-manifest.js` (`node tools/generate-asset-manifest.cjs`) when files under `assets/` change.
- Never commit secrets; payment keys live in Supabase secrets only.
