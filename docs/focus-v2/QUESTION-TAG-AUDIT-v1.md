# Focus Diagnosis v2 — Question Tag Audit (Phase B)

**Status: audited selected production source paths, no live runtime modifications.** Scope: source-level tag coverage for high-value Operasi/Wang overlap and published Question System v2 templates. This is **not** a claim that all 114 generators have been exercised, nor a count of actual runtime output distributions.

## Source findings

| Source (repo paths) | Verified finding | Diagnostic gap / action |
|---|---|---|
| `questions/helpers.js` `Q()` (around line 68) | Common constructor returns prompt, answer, distractors, hint, kind, diagnostic, formatShift. | Does not attach shared atomic foundations, operand sizes or regrouping. Add **optional** authored tags within generators; do not infer diagnosis from `kind`. |
| `questions/helpers.js` `moneyQ()` (around lines 166–255) | D2.4.2: sum; D2.4.3: subtraction; D2.4.4: multiplication; D2.4.5: division (divisor chosen from **2,4,5,10**); D2.4.7: mixed everyday money scenarios. | Precise skills and operand profiles exist at generation time; capture them before returning `Q()`. Avoid generic `D2.4.7 = all operations weak`. |
| `questions/d2/topic-2.js` (lines 19–31) | `D2.2.4` branches for `exact`, `remainder`, `ten` and can assess quite different division concepts. | Tag branch and operands separately; a remainder mistake is not proof of deficient exact division facts. |
| `questions/d2/topic-4.js` | D2 Wang dispatch delegates all `D2.4.*` to `moneyQ()`. | Tag near `moneyQ()`, not merely in wrapper. |
| `questions/d3/core.js` | D3 division mixes simple equal-sharing and bare equations. D3 subtraction contains a **conditional** `q.dimensional` record on regrouping. | Reuse existing rich metadata; avoid duplicating classifications when tag already exists. |
| `questions/d5/core.js` | One `D5.MONEY` route explicitly generates percentage discount + subtract. | Distinguish `percent.part_whole`, `money.discount`, multiplication and subtraction via individual probes. |
| `questions/d6/core.js` | `D6.OPS` legacy example is `a + b*c`; D6.MONEY legacy example is budget minus two costs. | D6 is not simply “divide harder”; tag actual arithmetic **steps**. |
| `questions/kssr-year6-money-real-v3.60.5.js` | `mark()` attaches `standardRef`, `competencyId`, `archetypeId`, `representation`, `demand`, `difficultyBand` and `misconceptionTargets`; includes discounts, profit/loss and other money concepts. | **Rich metadata already exists**. Extend with operand profile and atomic foundation IDs only where needed; don't overwrite tags. |
| `questions/kssr-archetypes-v3.9.0.js` | Wrapper `meta()` decorates questions with archetype, representation, demand, context, difficulty, misconception targets. | Some runtime outputs are richer than raw legacy `Q()`. Measure effective final output, not lexical `Q()` alone. |
| `questions/v2/banks/kssr-e3-2024/d3/p0-operations.json` | **13** authored operation templates contain competency/archetype/difficulty/targets. | Good metadata base for a pilot; still need explicit atomic operand profiles. |
| `questions/v2/banks/kssr-e3-2024/d3/full-money.json` | **15** authored money templates contain competency/archetype/difficulty/targets. | Link money operations and context concepts using tagged template-specific dependencies. |
| `questions/index.js` | `questionHistory` carries competency, subcompetency, archetype, representation, demand and difficulty where provided; otherwise uses broad defaults. | Do not confuse a default `legacy` / `procedure` label with observed diagnostic precision. |
| `js/engine/learner-review-v1.js` | Records question key, skill, archetype, representation, demand, hint, wrong tag and one of independent/corrected/assisted/unresolved. | Good evidence observer; does **not** explicitly retain operand-level diagnostic traits. Preserve schema and extend in shadow-mode later. |
| `js/guardian-focus.js` | At least 5 encounters and 2 question keys; picks up to three same-grade skills with independent rate below 80%. | It's a **weak-skill selector**, not root-cause diagnosis; do not silently relabel weakness. |
| `js/engine/adaptive.js` | Recovery is grade-constrained; `prereqReady` accepts prior-year prerequisites as ready by grade alone. | Future cross-year diagnosis **cannot** rely on this existing readiness check as proof of mastery. |

## Branch-only D2 pilot (implemented after the source audit)

- `questions/helpers.js` now attaches optional `focusDiagnosticV1` to D2.4.5 source-generator output, with operation family, money minor units, divisor, context, candidate foundations and stable family ID.
- `questions/d2/topic-2.js` now attaches the same optional metadata to D2.2.4 exact division, divide-by-ten and remainder cases.
- This metadata is **not consumed by app Focus, adaptive routing, db.skills, Supabase or rewards**. The existing generated prompt/answer/choices are unchanged.
- Deterministic seeded comparison against `main`: **250 D2.4.5 + 250 D2.2.4 = 500 question outputs, 0 content differences** after removing the new tag. Mathematical division invariants and emitted tag shape were also checked.
- Added `audit/focus-v2-d2-tag-smoke.cjs` to repeat structural and numeric validation using local Node; `audit/focus-v2-foundation-contract.cjs` validates JSON graph references and fixtures.
- **Known limitation**: other D1–D6 generators and later runtime wrappers can be richer or replace output; final effective-question coverage remains to be assessed before connecting shadow diagnosis.

## Remaining priority tags to author before engine roll-out

1. **D2.2.4 / D2.4.5**: `division.equal_sharing`, `division_fact`, 2-digit/1-digit, regrouping, remainder, RM/sen conversion. Crucial to distinguish a money/context failure from pure arithmetic.
2. **D2.4.2–D2.4.3 / D2.2.1–D2.2.2**: add/tolak facts, place value, regrouping and money handling.
3. **D2.4.4 / D2.2.3**: multiplication facts vs equal-group concept vs money multiplication.
4. **D5.MONEY / D5.PERCENT**: discount meaning, percent part-whole, the calculation of discount, subtraction for final price.
5. **D6.MONEY / D6.OPS**: exact operation sequence, profit/loss, budget and finance conceptual tags. D6 money includes modes not reducible to simple operations (insurance, terms, etc).
6. **Transfer contexts**: Masa, Ukuran, Pecahan, Peratus, Nisbah and Data, only after operation-vs-context probes are validated.

## Pilot acceptance checklist

- [ ] Item emitted from D2 money generator carries `originSkillId`, stable archetype, explicit operation(s), concept(s), numeric operand features, and source/provenance.
- [ ] Equivalent plain operation item can be generated at same arithmetic load (without RM/context), without repeating the exact source item.
- [ ] Diagnostics **abstain** on one error or ambiguous/untagged data; doesn't invent cause.
- [ ] “Bahagi Wang wrong / Bahagi nombor correct / sen conversion wrong” surfaces `money.ringgit_sen` as a **candidate**, not automatically `div.facts`.
- [ ] “Bahagi Wang wrong / Bahagi nombor wrong across independently varied items” investigates `div.facts` and appropriate number-length/regrouping.
- [ ] A D6 pupil can receive D2-equivalent arithmetic probes without global grade downgrades or claiming they failed every D2 competency.
- [ ] No changes to `db.skills`, production Focus router, rewards, player save, or live PWA cache in this branch.
- [ ] Regression: current original Battle/Focus/Gerai routes remain unchanged; new data is read-only until Phase C shadow passes.

## Authoring and evidence safety

Keep arithmetic computation features and optional normalized tags in question-generator outputs. Don't store raw questions, raw child answers or child names in cloud diagnostic events. Never infer an attention or behavioural diagnosis from a single quick wrong answer. Question family diversity, independent retries and transfer matter more than raw mistake counts.

## Next implementation after Phase A/B

Build **shadow-only** `FocusDiagnosisV2.evaluate(encounters,taggedItems)`: it must produce `candidate|insufficient_evidence|needs_contrast|verified` and a recommended *probe*, without mutating scores or routing. Pilot D2.4.5 ↔ D2.2.4. Activate user-facing Focus routing only after oracle fixtures and real question-variant coverage pass.
