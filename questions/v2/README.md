# Question System v2 — D3 Topic 7 controlled pilot (Phase 2B)

Status: **pilot-ready, default OFF.** The browser runtime and legacy adapter
are now safe to load from production, but the D3 Topic 7 route remains behind
one feature flag. With the flag OFF (the default), `questions/index.js` uses
the existing legacy bank exactly as before. A kill switch also forces legacy
fallback immediately.

## Current scope

- Curriculum: 50 Darjah 3 SP records.
- Enabled: exactly the six canonical D3 Topic 7 SPs (7.1.1–7.3.1).
- Mapped/not live: remaining 44 D3 SPs.
- Authored Topic 7 templates: 18 total.
- Battle-compatible live pilot templates: 16 MCQs.
- Literal construction/drawing templates: 2 interactive templates remain
  authored and QA-validated, but are intentionally not routed into the current
  battle answer-button UI in Phase 2B.

## Production bridge

`engine/legacy-adapter.js` is a UMD bridge loaded after `dist/runtime.js` and
before `questions/index.js`.

Production calls it explicitly; it does **not** monkey-patch a bank or the
`generate()` function.

Modes:

- `off` — default; returns `null`, so the legacy bank runs.
- `shadow` — generates a v2 item for inspection but returns `null`, so the
  learner still receives the legacy item.
- `live` — only `D3.SHAPE` may receive a v2 Topic 7 battle-compatible MCQ.
- `PA_QSV2_FLAGS.killSwitch = true` — always forces legacy fallback.

For controlled browser testing:

```js
PAQuestionSystemV2Bridge.setPilotMode('shadow')
PAQuestionSystemV2Bridge.setPilotMode('live')
PAQuestionSystemV2Bridge.setPilotMode('off')
PAQuestionSystemV2Bridge.getStatus()
```

The mode is persisted to `localStorage` unless `setPilotMode(mode, false)` is
used. Production ships with no persisted value and therefore starts OFF.

## Layout

```text
questions/v2/
├── schema/        curriculum/template schemas
├── curriculum/    KSSR source-of-truth registry
├── banks/         JSON template metadata
├── generators/    reusable authored generation scripts
├── renderers/     reusable SVG/HTML renderers
├── engine/        registry, validation, browser pilot bridge, future general engine contracts
├── build/         deterministic browser runtime build
├── dist/          generated `window.PAQuestionSystemV2` runtime
└── validation/    structural, pedagogical, semantic and Phase 2B integration QA
```

## Rollback guarantee

No D1/D2/D4/D5/D6 route is eligible for v2. `D3.SHAPE` also falls back to the
legacy bank when the flag is OFF, the kill switch is on, the runtime is absent,
or the bridge/generator/renderer cannot produce a valid battle MCQ.

No mastery, adaptive, battle, Supabase, parent-control, or Cikgu Dimensi logic
is replaced by this pilot.
