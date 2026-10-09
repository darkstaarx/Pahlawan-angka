# D1–D6 question depth — v3.85.43

Scope: all 117 active skill IDs, both low and high learner states, legacy curriculum layers and the live D3 v2 bridge. This is an active-bank depth audit, not certification that every DSKP standard and every possible generated answer has been manually reviewed.

Changes:

- Prefer application/reasoning after at least three evidence units and sufficient mastery/confidence. Retain an easier retrieval target every fifth skill encounter; preserve the selected Y1/Y6 curriculum node.
- Record subcompetency and curriculum-node IDs in encounter history, enabling real node rotation.
- Replace the single D2 decimal repair format with reading, fraction/decimal matching, two-point comparison, claim checking, ordering and contextual comparison. Values remain in tenths from 0.1 to 0.9.
- Add D2 missing values, error checks and contextual tasks for arithmetic, money, time, measurement and data. Foundation/recovery routes keep their original tasks.
- Preserve money archetype differences instead of stamping every variant with one name.
- Prefer deeper live D3 templates within the selected standard; add a missing-place-value template to 1.1.1. Rebuild the runtime from source.
- Add depth to the D3 fallback fraction, decimal and measurement routes. Fix legacy D3 decimal operands and addition to stay within 0.99.
- Historical mistakes no longer permanently force a now-secure D6 learner to foundation. Current weak mastery/confidence with a high error ratio still triggers foundation.

Validation:

- `node audit/grade-depth-validation.cjs`: 7,488 generated items across 117 skills; all six grades contain application/reasoning for every active skill at the tested strong state. Report: `grade-depth-report.json`.
- `node questions/v2/validation/phase3a2-semantic-hardening-qa.js`: 187,000 semantic samples, including an independent arithmetic oracle for the new missing-place-value template.
- `node questions/v2/validation/phase3a4-production-activation-qa.js`: 300 checks pass; all 44 mapped non-T7 standards remain live.
- `node questions/v2/build/build.js --check`: compiled runtime matches authored sources.
- Existing decimal no-leak regression passes.

Limitations:

- Mobile browser screenshots could not be produced: Playwright Chromium is absent and its download returned invalid archives. Phone layout has not been visually verified in this environment.
- Three older standalone audits do not run cleanly: Y1 lacks its now-required `formatClockTime` helper; the old depth harness lacks `attachFractionShade`; Y6 asserts every high item is reasoning although its current bank deliberately contains written arithmetic. The integrated audit loads the actual helpers and banks and tests real dispatch instead.
- Depth is evaluated from authored demand plus generated behavior, not difficultyBand alone. A narrow recognition standard can still legitimately produce basic items, and a retrieval target may fall back to the nearest available demand within that same standard.
