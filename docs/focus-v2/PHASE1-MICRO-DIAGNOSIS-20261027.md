# Focus Micro Diagnosis — Phase 1 shadow pilot

**Branch:** \`feature/focus-micro-diagnosis-phase1-20261027\`
**Status:** READ-ONLY prototype. **Not registered in the app, not live, not deployed, not connected to Supabase.**

## What was built

- \`js/engine/focus-micro-diagnosis-v1.js\`: deterministic, dependency-free, browser/CommonJS-compatible, pure shadow evaluator of existing \`diagLog\` records.
- \`audit/focus-micro-phase1.test.js\`: automated test cases for candidate generation, abstention, cross-grade use, mathematics, non-mutation, evidence deduplication, speed/hint/guided exclusions and recovery.
- No changes to existing production files, gameplay, adaptive routing, learner mastery, cloud schema, PWA registration, UI or rewards.
- Existing \`diagLog\` stores operations, operands (\`a\`), first-try correctness (\`k\`), context (\`c\`), representation (\`f\`), response time, hint/guided flags, skill and event identity. This supports *provisional retest signals*, **not cognitive root-cause diagnosis**.

## 19 candidate patterns (not 19 proven impairments)

| Pattern ID | Based on current first-attempt log? | Correct interpretation |
|---|---|---|
| \`mul.table.6\` | Yes | Several failed facts involving factor 6 |
| \`mul.table.7\` | Yes | Several failed facts involving factor 7 |
| \`mul.table.8\` | Yes | Several failed facts involving factor 8 |
| \`mul.table.9\` | Yes | Several failed facts involving factor 9 |
| \`mul.fact.7x8\` | Yes | Retest exact commutative fact 7×8/8×7 |
| \`div.fact.56by8\` | Yes | Retest 56÷8 (not proof that all division is weak) |
| \`add.fact.7plus8\` | Yes | Retest 7+8/8+7 |
| \`sub.fact.15minus7\` | Yes | Retest 15−7 |
| \`add.carry.ones\` | Yes | Candidate difficulty when ones require carrying |
| \`add.carry.tens\` | Yes | Candidate difficulty when tens require carrying |
| \`sub.borrow.ones\` | Yes | Candidate difficulty borrowing at ones |
| \`sub.borrow.cross_zero\` | Yes | Candidate difficulty borrowing across zero |
| \`div.remainder\` | Yes | Remainder contexts versus exact-division controls |
| \`word.context_vs_symbolic\` | Yes, **non-matched** | Contrast needed; cannot distinguish reading vs operation choice |
| \`money.context_vs_plain\` | Yes, **non-matched** | Contrast needed; cannot distinguish money concepts vs harder arithmetic |
| \`measurement.cm_to_m\` | **No — pending authored tags** | Must preserve conversion direction/unit metadata |
| \`time.minutes_to_hours\` | **No — pending authored tags** | Must preserve actual time conversion and representation |
| \`decimal.column_alignment\` | **No — pending authored tags** | Must preserve column-position evidence and distractor type |
| \`fraction.unlike_denominators\` | **No — pending authored tags** | Must preserve specific denominators and operations |

Patterns are curriculum/design hypotheses only; **no claim that the Ministry of Education has published their national prevalence**. They can apply to a Year 6 child practising earlier skills; the child's grade is not used as a proxy for mastery.

## How it decides

1. Read the latest 600 answer records without modifying them. Exclude malformed/out-of-scope records, guided answers, demo/dev records when marked, and unusually rapid responses. One question token = one encounter.
2. Derive arithmetic characteristics from **actual logged operands**, not only curriculum topic. Detect carrying and borrowing algorithmically; canonicalise commutative facts (7×8 = 8×7).
3. Require at least two recorded failures before emitting even a \`needs_more_evidence\` signal.
4. \`probe_candidate\` requires at least two distinct failed equations (except an exact fact that can be reattempted over separate days/formats), plus independent correct contrast on two *other* equations. For table candidates, failures must involve at least two different partners.
5. Later correct unaided answers can retire a previous flag. This is a provisional heuristic, **not a psychometrically validated confidence score**.
6. Output a next-probe **foundation ID** and evidence counts. Do **not** label behaviour or intent, assign diagnoses, lower mastery, or automatically route into a mini-game.

### Example (synthetic only)

\`\`\`js
const Micro = require('./js/engine/focus-micro-diagnosis-v1.js');
const result = Micro.evaluate({ diagLog: profile.diagLog });
// e.g. find id === 'mul.table.8', status === 'probe_candidate',
// nextProbe === 'mul.facts'. Nobody gets routed by this API.
\`\`\`

## Risks and missing prerequisites

- \`diagLog\` does **not** store a guaranteed stable item-family/variant hash or valid matched contrast pair. Different questions with the same numerical fact may not be truly independent. **Do not equate a provisional flag with a confirmed misconception.**
- A failure on 7×8 can be related to knowledge of 7, knowledge of 8, concept of groups, recall, attention or a misread item. The current shadow module does not disentangle these.
- Word-story and money comparisons use nonmatched arithmetic examples. They are prompts for **matched contrast design**, not diagnosis of weak reading/money.
- Current \`focusDiagnosticV1\` tags and Focus v2 learner review already offer richer semantics in some banks. New authoring must extend those contracts rather than create a competing production decision engine.
- Missing unit/decimal/fraction metadata means \`measurement.cm_to_m\`, \`decimal.column_alignment\`, etc. remain **deferred** even if child results look suggestive.
- Retest selections are *recommendations* only. Next phase requires fresh independent contrast items and correct remediation-to-transfer gameplay.
- No private learner data was read or migrated for this change.

## Tests / reproducibility

\`\`\`sh
node --test audit/focus-micro-phase1.test.js
node --test audit/*.test.js
node audit/focus-v2-diagnosis-shadow.cjs
node audit/focus-v2-foundation-contract.cjs
\`\`\`

The 15 specific test bodies were executed in an isolated JavaScript V8 runner with Node \`test\` and assertion shims: **15/15 passed**. This is **not equivalent** to having executed Node CLI or the complete existing suite on a checkout. Prior to any release, rerun the commands above in CI/Work on a full repository checkout and validate a real mobile encounter.

## Controlled next step — do not enable routing yet

- Verify generated D1–D6 question tags *after* wrappers and identify the actual coverage of the 15 immediately observable candidates.
- Add unit direction, decimal columns, fraction operation metadata to authored questions, preserving privacy and the existing Focus v2 schema; do not infer it from arbitrary wrong answer strings.
- Add a reusable **matched probe bank** for multiplication/equal groups, carry/borrow, unit direction and word-versus-symbolic contrasts. Two independent items per contrast level; no duplicate questions counted.
- Validate false positive/negative rates with consented, de-identified primary-school pilot responses; have teachers review ambiguous cases. Compare matched transfer accuracy before and after proposed remediation.
- Gate on browser/Android performance, existing 240-test baseline, school-grade boundaries, profile integrity, Supabase RLS, and no unintended routing. Only then discuss a separately reviewed user-facing rollout.

**Release verdict:** Safe for code review as a standalone shadow experiment; **NO-GO** for automatic remediation, parent diagnosis, live data writes or production release.
