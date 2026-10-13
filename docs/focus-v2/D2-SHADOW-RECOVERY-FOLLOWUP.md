# D2 final metadata and bounded shadow recovery follow-up

Date: 2026-10-12. Branch: `feature/focus-diagnosis-foundations-v1`.

**Result: D2 pilot follow-up PASS; whole Focus v2 rollout remains NO-GO.**

This report supplements the historical [browser audit](PHASE-C-BROWSER-E2E-REPORT.md). Its original totals remain historical; these results are not added to them as though they were independent full journeys.

## Implemented

- Authored division tags now survive the actual integrity, assessment and grade-depth wrapper chain for `D2.2.4` and `D2.4.5`. Missing-divisor/inverse tasks carry explicit unknown-task provenance and abstain from direct fact diagnosis. Integer digit widths and money minor-unit digit widths remain distinct; money regrouping is conservatively unknown.
- Stable equation fingerprints exclude wording and representation. Within a diagnostic family, rewording a calculation cannot manufacture another independent equation. Money versus plain division remains an intentional cross-family contrast.
- The collector rejects a learner-review skill that differs from the question's authored origin. Tag revision survives sanitization.
- A remainder failure with two clean exact-division equations requests a remainder contrast instead of labelling all division weak.
- A bounded, test-only in-memory session issues seven authored contrasts, then prerequisite probes for `div.facts` or `div.regroup`, then fresh transfer questions. One question may be pending at a time. Two independent prerequisite equations and two consecutive independent transfers are required; assistance/correction cannot satisfy them. All recovery equations are distinct, and failed recovery terminates. Regrouping examples are checked using the actual tens remainder.
- The explicitly opted-in audit harness renders symbolic division, money stories and equal-group dot models. Answer/hint buttons use the real learner-review module against a disposable clone. The API never calls save/cloud/mastery/reward functions. No production registration was added in `index.html`, PWA loading or service-worker wiring.

## Evidence and reproduction

| Check | Result | Limit |
|---|---|---|
| Final browser generator, desktop and 360×640 Android viewport | 117 skills × 3 bands × 20: 7,020 valid outputs per run; D2 pilot 120/120 tagged | Other diagnostic families remain untagged |
| Follow-up browser checks | 18 PASS, zero page errors | Isolated shadow; deliberately simulated wrong outcomes, real rendered correct-answer clicks |
| Facts/regroup recovery, school grades 2 and 6 | Both reach fresh independent transfer | D6 session identity retained; this is a foundational pilot, not an authenticated D6 topic journey |
| Assisted recovery | Both families terminate without transfer certification | No teaching intervention or learner efficacy measured |
| State isolation | Mastery, school grade, XP and coins unchanged; learner profile storage remains absent | Disposable clone contains learner-review encounters |
| Visible Computer Use | Wrong 7 → hint → correct 6 for 24÷4; next question RM24÷4; encounter remains assisted | One manual local sequence; remaining checks automated |
| Final wrapper regression | 120 authored-tag samples; 480 seeded before/after questions identical after stripping diagnostic metadata | Before/after comparator uses Git HEAD at execution time |
| Probe regression | 309 assertions PASS | Synthetic learning outcomes |
| Diagnosis regression | 10 oracle fixtures, 79 assertions PASS | Oracle validation does not prove classroom accuracy |
| Existing regression | 500 source tag samples; 9,120 Focus samples; 8 guardian checks; 16 persistence checks; foundation contract PASS | Existing gameplay remains separate from v2 |
| Independent review | Three material issues found and fixed; no remaining material findings in targeted changes | Browser layout/isolation validated by parent audit |

Commands:

```sh
node audit/focus-v2-final-d2-tags.cjs
node audit/focus-v2-probe-session.cjs
node audit/focus-v2-diagnosis-shadow.cjs
node audit/focus-v2-followup-browser.cjs
node audit/focus-v2-foundation-contract.cjs
node audit/focus-v2-d2-tag-smoke.cjs
node audit/focus-practice-v3.85.68.js
node audit/guardian-focus-v3.8.30.js
node audit/focus-v2-demo-persistence.cjs
```

Browser artifacts: [results](../../audit/focus-v2-e2e/followup/browser-results.json), [final runtime metadata](../../audit/focus-v2-e2e/followup/runtime-metadata.json), [manual assisted sequence](../../audit/focus-v2-e2e/followup/manual-wrong-hint-correct.png), [equal-group model](../../audit/focus-v2-e2e/followup/group-model.png).

For local manual inspection, serve the repository and open `audit/focus-v2-shadow-harness.html?shadow=1`. Without that query the engine and probe session are not loaded. The Hint used control records assistance; it does not provide a finished teaching explanation. Correct answers are intentionally first in this audit UI to make deterministic verification possible; this UI is not pupil-facing practice.

## Remaining gates / what next

1. Author and verify addition/subtraction facts, carrying, borrowing and place-value contrasts, then multiplication facts/equal groups/multi-digit contrasts. These are not implemented by this D2 division pilot.
2. Add final-runtime D5 percentage/discount and other cross-topic tags and mathematically validated probe banks. Existing synthetic oracle cases still do not prove live diagnosis there.
3. Design and audit the pupil-facing remediation/teaching flow and original-topic return. The new controller is a shadow verification prototype; it does not route Focus cards or remove them, change mastery, teach autonomously, or certify recovery.
4. Run authenticated onboarding/save/reload and cumulative Kembara journeys with an authorized isolated test account. No account was supplied, so those checks remain blocked.
5. Resolve release review and the historical production baseline failures before deployment. This work was neither merged into main nor pushed/deployed.
