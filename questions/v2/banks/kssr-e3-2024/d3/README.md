# banks/kssr-e3-2024/d3/ — intentionally empty (Phase 1 / 1.1)

This folder is a placeholder. Phase 1 and Phase 1.1 do not add any question
template file here.

**Source-of-truth rule (Phase 1.1):** a bank file here is **JSON only** —
e.g. `space.json`, tagged `"schema": "pa.qsv2.template-set.v1"` with a
`templates: [...]` array validated against
`questions/v2/schema/question-template.schema.json`. There is no `.js`
bank file and never will be; executable code for a template's question
belongs in `questions/v2/generators/` and `questions/v2/renderers/` only,
referenced from the JSON record by `generator`/`renderer` key. See
`docs/question-system-v2/PA-QUESTION-SYSTEM-V2-BLUEPRINT.md` §17.1.

Per blueprint §13 and `PA-QS-V2-MIGRATION-GATES.md`, Topic 7 ("Ruang") is
the planned Phase 2 pilot. When Phase 2 begins, this folder is expected to
gain a `space.json` template set wiring the six Topic 7 archetypes
(competencyIds already reviewed and locked — see
`questions/v2/curriculum/kssr-e3-2024/d3.json`, `competencyIdStatus:
"canonical"`) to generator/renderer keys.

Until then:

- `questions/v2/curriculum/kssr-e3-2024/d3.json` lists all 50 SPs as
  `status: "mapped"`.
- No SP in this file may be marked `"enabled"` until a template that
  targets it exists here and passes `questions/v2/validation/self-test.js`.
- Nothing in this folder is read by production. Battle continues to source
  questions from `questions/d3/core.js` via `questions/index.js`.
