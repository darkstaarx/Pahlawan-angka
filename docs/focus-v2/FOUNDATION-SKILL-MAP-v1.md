# Focus Diagnosis v2 — Foundation Map (Phase A)

> **Branch-only design artifact. NOT active in the Pahlawan Angka app.** This map is a hypothesis for tagging and testing, not a verdict on individual children.

## Verified baseline
- Main curriculum graph: `data/kssr/knowledge-graph.json` has **114 skill IDs**, of which **23** are `Operasi` and **12** are `Wang`.
- Legacy skill IDs describe curricular topics, **not fine-grained arithmetic mastery**. D6 `D6.OPS` covers mixed operations: it cannot uniquely identify a failing operation without question metadata.
- Legacy recovery is primarily tied to previous-year curriculum skill IDs. Earlier-year prerequisites cannot be assumed mastered purely because grade is higher.
- The new `foundation-map-v1.json` proposes **33 reusable diagnostic foundation nodes** across arithmetic, place value, domain concepts, and applications. Prerequisite references and graph IDs were validated at creation.

## Design contract (locked for Phase A/B)
1. **OPERASI is the primary calculation foundation**, not an exclusive explanation for every error. Conceptions (money value, percent, units, reading) remain independent diagnostic candidates.
2. **Question origin != cause of error.** `D2.4.5` (Bahagi Wang) may indicate `div.facts`, `div.two_digit_one_digit`, `money.ringgit_sen`, or failure to select the correct operation.
3. **Diagnostic sequence compares forms**: a contextual item -> same arithmetic without context -> a simpler prerequisite -> revised contextual transfer. Use multiple **independent, different** questions. Do not diagnose from a single wrong answer.
4. **Grade is a content ceiling, not a foundation floor.** A D6 child can be diagnosed at D2-level arithmetic; this must not imply all D2 chapter content is weak.
5. **No cross-topic score penalty.** One failed monetary division item cannot decrease `D2.2.4` directly. Diagnose, then issue independent arithmetic evidence.
6. **Separate** `originSkillId`, `rootCauseCandidate`, `recommendedFoundationId`, `verificationSkillId`, and evidence sufficiency.
7. **Keep all existing app/runtime/mastery semantics unchanged** until shadow diagnostics demonstrate adequate evidence and regression tests pass.

## Core example: D2.4.5
| Encounter | Probe | Decision |
|---|---|---|
| RM24 ÷ 3 incorrect | 24 ÷ 3 | Incorrect -> investigate divide basics; correct -> investigate RM, context/reading |
| 24 ÷ 3 incorrect | 8 ÷ 2 and 12 ÷ 3 across different forms | If basic division is sound, investigate two-digit patterns or times-table facts |
| 24 ÷ 3 correct | RM24.60 ÷ 3 | Investigate RM/sen / decimal place value, **not** label weak division immediately |
| Diagnosis suggested | Separate operation-only or domain-concept focus exercise | Do not overwrite existing mastery |
| Later | Recheck new Bahagi Wang question independently | Confirm skill transfer; do not repeat exact earlier question |

## Data model
- `foundations[]`: atomic foundation ID + prerequisites + curriculum anchors; anchors mean **candidate coverage only**, not evidence that the generator can emit every subskill.
- `operationCurriculumCrosswalk[]`: all **23** existing operation skills. Composite `D5.OPS` and `D6.OPS` marked `must_use_question_metadata`.
- `topicContexts.money[]`: all **12** existing Wang skills and possible calculation dependencies; every mapping marked *hypothesis requiring item tags*.
- `topicContexts.otherExamples[]`: representative non-money context overlaps (Masa, Ukuran, Pecahan, Peratus, Nisbah, Data).

## Out of scope and validation gates
- This does **not** implement a live detector or recalculate mastery.
- Each foundation candidate needs tagged generator coverage and at least two mathematically distinct questions per probe level (ideally multiple representations).
- Diagnose `operation.choose` separately from calculation fluency.
- Route to Focus v2 only after shadow tests prove: insufficient-evidence abstention, no cross-domain false labels, recovery at lowest unmastered prerequisite, independent transfer verification and no regression to existing battles/mini-games.

See `docs/focus-v2/QUESTION-TAG-AUDIT-v1.md` for concrete bank gaps and `data/focus-v2/question-tag-contract-v1.json` for the proposed metadata fields.
