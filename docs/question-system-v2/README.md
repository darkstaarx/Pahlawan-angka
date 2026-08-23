# Question System v2 — docs

These documents were provided as an external handoff pack and are checked
in here as the authoritative Phase 1 specification, per instruction. They
did not previously exist in this repository.

- `PA-QUESTION-SYSTEM-V2-BLUEPRINT.md` — architecture, contracts, D3 pilot
  plan. §17 is a Phase 1.1 addendum documenting the browser-runtime build
  boundary, the JSON-only bank/template rule, the hardened cross-reference
  validator, the enabled-readiness gate, and the canonical Topic 7
  competencyIds.
- `PA-QS-V2-MIGRATION-GATES.md` — what to keep/reject from the six D1–D6
  audit ZIPs, and the Phase 1 / Phase 2 gate checklist.
- `examples/` — the audited D3 SP curriculum source, D3 coverage baseline
  snapshot, and a sample Topic 7 question-template record, kept for
  provenance. The live, schema-conformant import derived from
  `examples/d3-sp-curriculum-source-v1.json` lives at
  `questions/v2/curriculum/kssr-e3-2024/d3.json`.

The executable Phase 1 foundation itself lives under `questions/v2/` —
see `questions/v2/README.md`.
