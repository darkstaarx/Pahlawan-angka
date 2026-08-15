# Build 3.10.0 — Mastery Knowledge Base v1

## What changed

- Added a Year 1–6 mastery profile for every skill in the existing KSSR graph.
- Profiles distinguish curriculum mapping, research-backed misconception hypotheses and thresholds that still require calibration.
- Mastery now requires independent, varied and transfer/application evidence in Auto Coach.
- Correct-after-hint remains recovery evidence and schedules a fresh unassisted confirmation question.
- Repeated misconceptions must occur on distinct generated items before intervention.
- Added anonymous, on-device response telemetry for later calibration.

## Telemetry boundary

No name, email, answer text or device identifier is recorded. Events remain in local storage under
`pa_learning_events_v1`. They can be inspected with `PATelemetry.read()`, exported with
`PATelemetry.exportData()` or erased with `PATelemetry.clear()` in Developer Mode/console.

Server upload is intentionally disabled until parental consent, retention policy and backend access controls exist.

## Current evidence status

- Curriculum structure: curriculum-backed.
- Misconception families: research-backed starting hypotheses.
- Mastery thresholds and sequencing weights: hypotheses to calibrate with real learners.
