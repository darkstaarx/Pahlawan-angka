# Focus Diagnosis v2 — Phase A/B isolated workspace

**Status:** branch-only design + D2 source-generator pilot. **Not live.** No main-branch changes, schema migrations, mobile/PWA deploy changes, saved-state changes or mastery-score recalculations.

## Deliverables
- `data/focus-v2/foundation-map-v1.json`: 33 atomic foundations, 23 Operasi curriculum anchors, all 12 Wang skills, six representative cross-topic context mappings.
- `docs/focus-v2/FOUNDATION-SKILL-MAP-v1.md`: educational rules, cross-grade remediation and abstention boundaries.
- `docs/focus-v2/QUESTION-TAG-AUDIT-v1.md`: source-level audit covering D2–D6 selected generators, legacy dispatcher, new bank template layers, adaptive and learner review.
- `data/focus-v2/question-tag-contract-v1.json`: proposed per-question tag contract + five example records.
- `data/focus-v2/diagnosis-fixtures-v1.json`: 17 gold specifications of expected root-cause diagnosis/probe next-step behaviours.
- `questions/helpers.js`, D1–D4 generators and the final KSSR content wrapper: branch-only authored addition/subtraction feature tags, plus existing D2 pilot tags.
- `audit/focus-v2-foundation-contract.cjs`: structural integrity checks.
- `audit/focus-v2-d2-tag-smoke.cjs`: deterministic 500-question bank/tag smoke check.

## Reproduce tests
```sh
node audit/focus-v2-foundation-contract.cjs
node audit/focus-v2-d2-tag-smoke.cjs
node audit/focus-v2-diagnosis-shadow.cjs
node audit/focus-v2-add-sub-shadow.cjs
```

The initial structural assertions were executed against checked-in files in a V8-compatible test runner, and a deterministic 500-question comparison with untouched `main` reported 0 changes to legacy prompt/answer/distractors. Full browser end-to-end and Node CLI runs on a checked-out repository are follow-up gates, not claimed completed.

## Phase C delivery

- `js/engine/focus-diagnosis-v2.js` — **pure** root-cause candidate evaluator and scoped production encounter-tag adapter.
- `js/engine/focus-diagnosis-shadow-v1.js` — optional ephemeral question-key/tag collector used in testing only (no app registration).
- `audit/focus-v2-diagnosis-shadow.cjs` — 17/17 golden cases and 114 assertions on a simulated learner-review integration.
- `audit/focus-v2-add-sub-shadow.cjs` — generated D1–D4 addition/subtraction examples joined through learner review; verifies digit-depth, place-value, carry/borrow and exact one-digit fact retest candidates without profile mutation.
- `docs/focus-v2/PHASE-C-SHADOW-REPORT.md` — test details, conservative D6 oracle correction, current integration limits and release gates.
- Current `main` and `index.html` are unchanged. **No live shadow observer is installed yet.**

## Blockers before Focus v2 roll-out
See [Phase C browser audit](PHASE-C-BROWSER-E2E-REPORT.md) for the final browser/shadow results, runtime metadata gaps and branch-only regression fixes. User-facing integration remains NO-GO.

The [D2 metadata and shadow recovery follow-up](D2-SHADOW-RECOVERY-FOLLOWUP.md) closes the final-wrapper D2 tag gap and adds a bounded, opt-in probe/prerequisite/transfer prototype. An addition/subtraction shadow slice now distinguishes basic facts (including exact facts to retest), larger place values and carry/borrow from generated D1–D4 items. Its practice round uses matching authored questions, records answers in memory only and requires two fresh independent checks before showing a provisional verification result. It remains branch-only, needs classroom validation, and does not enable live Focus routing. Multiplication, discount, other cross-topic banks and authenticated journeys remain release gates.

1. Extend the verified D2 division and D1–D4 addition/subtraction metadata to the remaining diagnostic families and validate output **after** applicable runtime wrappers.
2. Build and audit diagnosis-style contrast banks with distinct equation, manipulative and contextual forms across root levels; don't assume all forms are already present.
3. Preserve the implemented *pure shadow-only* evaluator and bounded D2 controller; audit a pupil-facing teaching and original-topic return flow before connecting routing.
4. Validate with all 17 gold fixture specifications and larger blinded/edge-case families before making any user-visible Focus routing change.
5. Preserve existing gameplay/mastery algorithm until oracle parity and accuracy gates pass.
