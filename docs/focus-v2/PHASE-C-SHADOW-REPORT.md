# Focus Diagnosis v2 — Phase C shadow evaluator report

**Status: Phase C algorithm + offline adapter pilot is implemented and tested on a feature branch.** It is NOT loaded by `index.html`, not deployed on GitHub Pages, and does not influence mastery, question selection, Kembara, Kemahiran Fokus or Gerai Wirayung.

## Delivered implementation

- `js/engine/focus-diagnosis-v2.js`: UMD/CommonJS **pure evaluator** (`PAFocusDiagnosisV2.evaluate`) and adapter (`fromReview`) for the actual `PALearnerReview` record shape and explicitly keyed authored question tags.
- `js/engine/focus-diagnosis-shadow-v1.js`: optional in-memory collector, captured only when a future runtime explicitly passes `beginQuestion` and authored tags. It stores no raw question text and can be erased with `close()`.
- `audit/focus-v2-diagnosis-shadow.cjs`: executable oracle test + safety/contamination/production-like record assertions.
- `data/focus-v2/diagnosis-fixtures-v1.json`: 10 specification scenarios; one initially overconfident D6 regroup oracle was revised to `needs_contrast`, as a single regrouping error cannot isolate root cause.

## Verified test results (2026-10-12)

| Test | Result | Boundary |
|---|---|---|
| Ten golden oracle specifications | **10/10 pass** | Expected recommendation, cause candidate and state; fixtures are *authored scenarios*, not real pupil labels |
| Additional safety and integration assertions | **77 total assertions pass**, counting oracle assertions | Tested by executing checked-in CommonJS test content in V8 with virtual file reads; native `node` execution after a repository checkout remains an independent CI gate |
| D2 tag pilot | **500** seeded original-versus-feature source question outputs equal after removing optional tag | 250 D2.4.5 and 250 D2.2.4; checks source-generator parity, not all runtime wrappers |
| Cross-grade D6 example | Two regrouping errors + strong basic division → `candidate: div.regroup` | A single regrouping error → `needs_contrast`, **no rootCause yet** |
| Safety/abstention | Single repeated item, missing tags, assisted/corrected, whole-profile without scoped keys, unknown domain | No unsupported root diagnosis |
| Data mutation | `writes:0`, full snapshot equality after evaluate/fromReview | No modifications to skills, learning history or browser |

## Example outputs

**A. D2 Bahagi Wang, first failed encounter**

```json
{"state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts"}
```

Do not send every money failure directly back to Gerai Wirayung. The next requirement is **independent plain-division contrast evidence**.

**B. D2 Bahagi Wang wrong twice; plain division independent twice**

```json
{"state":"needs_contrast","rootCause":null,"nextProbe":"money.ringgit_sen"}
```

This is not yet proof of a money conversion difficulty. Request targeted money-unit / contextual probes.

**C. D6 monetary budget contains division; plain basic division strong; regroup twice wrong**

```json
{"state":"candidate","rootCause":"div.regroup","nextProbe":"div.regroup"}
```

The learner remains D6; no global grade or unrelated curriculum mastery is reduced.

**D. D5 diskaun problem; arithmetic strong but two percent-concept probes wrong**

```json
{"state":"candidate","rootCause":"percent.part_whole","nextProbe":"fraction.equal_parts"}
```

## Crucial integration design

`fromReview(profile, tagsByQuestionKey, {originSkillId, questionKeys})` requires explicit **question-key scope** and an authored `focusDiagnosticV1` tag joined by the key from actual `PALearnerReview.beginQuestion` / `resolve`. If either is missing, the engine **abstains** rather than scanning arbitrary saved encounters or reverse-inferring from a prompt.

In Phase B, source generators tag `D2.2.4` and `D2.4.5`; however, existing `PALearnerReview` persistent encounter fields do **not yet carry those tags**, and the full app runtime has **no live shadow collector**. The adapter and ephemeral collector were verified with real `PALearnerReview.beginQuestion` / `resolve` outputs from generated pilot D2 questions in a test environment. **No production pupil histories have been analyzed.**

The next controlled milestone is a **reviewed opt-in runtime wiring** of the existing branch-only collector (not yet present), plus representative bank-runtime checks, and expanded rich tag coverage to Tambah/Tolak/Darab and topic contexts.

## Explicit GO/NO-GO gates

- **GO for Phase C branch inspection and further shadow development.**
- **NO-GO for live diagnostic routing** until real runtime tag coverage, independent contrast bank coverage, multi-context blinded fixtures, cross-grade learning evidence and browser UI integration tests pass.
- **NO-GO for modifying global mastery** as part of this feature. The evaluator is not the authority for grades or marks.
