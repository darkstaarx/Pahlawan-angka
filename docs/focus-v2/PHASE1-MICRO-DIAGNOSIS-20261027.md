# Focus Micro Diagnosis — Phase 1: generalised, DEV-only pilot

**Branch:** `feature/focus-micro-diagnosis-phase1-20261027`  
**PR:** #133 (draft)  
**Release status:** Shadow + authorised DEV test lab on this branch only. **Not merged, not deployed, no automatic remediation.**

## Architecture decision

Do not hardcode every multiplication or division fact, and do not create a second live adaptive brain. The pure shadow evaluator accepts first-attempt evidence from existing `diagLog` and infers *retest candidates* conservatively.

The algorithm now loops through **tables 2–12** automatically and generates exact-fact IDs from the actual numbers in failed equations:

- `mul.fact.4x9` and `mul.fact.7x8` (commutative equations share one identity); factors 1–12 as long as at least one factor is 2–12.
- `div.fact.48by6`, `div.fact.56by8` and other exact division facts with divisor 2–12 and quotient 1–12.
- `add.fact.4plus9`, `add.fact.7plus8` and other addition facts with individual addends up to 10.
- `sub.fact.13minus6`, `sub.fact.15minus7` and other basic subtraction facts with minuend up to 20, subtrahend up to 10 and result up to 10.

Arithmetic fact ID generation is **data-driven**; adding a new combination does not require another source-code case. Arbitrary larger calculations are not automatically labelled as these one-step facts.

## Other coverage and exclusions

Static catalog contains 22 entries: 11 multiplication tables and seven other observable feature families (addition carrying, subtraction borrowing, division remainder, word-context contrast and money-context contrast) plus four *deferred* domains. The exact-fact families above are dynamic and are not enumerated in the catalog. These counts describe code capability, not the real question-bank coverage or national weakness rates.

Deferred until authored, verified per-item metadata exists:

- centimetre to metre conversion and direction;
- minute-hour conversion;
- decimal place-value alignment;
- unlike-denominator fraction operations.

Context matters: measurements, word problems and money are not treated as independent proofs of weakness in plain arithmetic. Unsupported items return insufficient evidence rather than guessed root causes.

## Evidence and safety contract

1. Only valid first-attempt profile-style records for Year 1–6 skills and simple, recognised operations are eligible; attempts that are obviously too rapid, guided, or marked demo/dev are excluded.
2. One question/attempt token counts once. Repeated errors require at least two observations. Exact-fact candidates require separated days or distinct forms and two other independently correct control equations.
3. Table candidates require repeated failures with at least two distinct multiplication partners and independent correct controls excluding the target table.
4. Retest candidates are **not confirmed misconceptions**, diagnoses of attention or proof of cognitive root causes.
5. The evaluator is read-only. It never changes student mastery, scores, rewards, routing, existing Supabase data or saved profile state. Cross-grade fundamentals can be probed without assuming mastery by age.
6. `probe_candidate` is a request for future independent contrast questions, not an instruction to launch a mini-game automatically.

## Implementation

- `js/engine/focus-micro-diagnosis-v1.js`: pure evaluator; generated fact IDs and generic tables 2–12.
- `js/dev-focus-micro-fixtures-v1.js`: test-only predefined scenarios plus generated sifir 2–12 scenarios.
- `js/dev-focus-micro-lab-v1.js`: authorised Developer Mode panel with manual quiz, automatic scenarios and optional in-memory capture of DEV Test Skill first answers.
- `index.html`: loads the three modules on the experiment branch; access is governed by the existing `isDevMode()` gate.
- `audit/focus-micro-phase1.test.js`, `audit/focus-micro-dev.test.js`: tests for absence of false labels, cross-grade functionality, generated facts, math, context separation, security gating, and purity.
- `.github/workflows/focus-micro-phase1.yml`: GitHub Actions runs the two new test suites and three existing Focus/mapping/mini-game regression groups on PR changes.

## Testing in staging / local

Run this branch in an isolated local server or separate staging site. Use a **disposable DEV profile**. Open the existing authorised `DEV` panel, click `Buka Makmal Diagnosis`, then:

1. Choose `Jawab sendiri` to answer fixed diagnostic examples. The timer value attached to the demo is synthetic (8 seconds), not a measurement of a pupil.
2. Choose `Simulasi automatik` and select *any sifir 2–12*; the scenario generator produces different wrong multiplication facts and correct controls, with candidate output for that table. Also test one wrong answer (must abstain), cross-day exact fact, borrowing across zero, remainder and cm→m (must abstain without unit tags).
3. Choose `DEV Test sebenar` and `Mula pantauan`; close the lab, run `Test Skill` from the normal DEV Question Bank Tester, then reopen to inspect captured first attempts. Records stay in memory until reset/reload.

The observer delegates to the original telemetry function without changing return values. However, the original game's DEV battles can still have their own state/telemetry effects. Do **not** test using a real child's profile.

## Reproducible CI checks

```sh
node --test audit/focus-micro-phase1.test.js
node --test audit/focus-micro-dev.test.js
node audit/focus-v2-diagnosis-shadow.cjs
node audit/focus-v2-foundation-contract.cjs
node audit/focus-mini-games-router-qa.cjs
```

All five groups passed for the generic engine and DEV scenario changes on GitHub Actions run **40450025761**. This is automated code verification, **not yet an actual visual browser/mobile smoke test** or classroom-validity study. Real item coverage after generator wrappers, independent probe banks, transfer after remediation and full production regression are separate release gates.

**GO** for draft PR review and staging/manual DEV testing; **NO-GO** for production release, automatic learner intervention, parent-facing diagnoses, or any claims that a specific multiplication table is nationally most difficult.
