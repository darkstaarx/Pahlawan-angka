# Pahlawan Angka — Diagnostic Brain (north star for every agent)

> **Read this before changing questions, scoring, telemetry, parent reports,
> worksheets, mini games or locks.** It is the agreed product direction
> (owner: Fiiierul, 21 Oct 2026). If a task conflicts with it, stop and ask.

## 1. The goal in one paragraph

Pahlawan Angka (PA) behaves like a private maths teacher for Malaysian
primary pupils (KSSR, Darjah 1–6, Bahasa Malaysia). For each child it must
(1) tell the parent **precisely** what the problem is, (2) say **why**, in
plain BM, backed by evidence from the child's own answers, and (3) **act on
it automatically** — retarget practice, mini games and worksheets, and pull
the parent in when needed. "Betul 72%" is not a diagnosis.

Example parent summary the system must be able to produce:

> **Ringkasan Aisyah (7 hari)**
> 1. Hebat dalam sifir — cuma **sifir 7 dan 3** masih lambat (masih mengira).
> 2. **Wang: 30% betul**, hampir semua salah pada **operasi tolak**.
> 3. **Bentuk lazim** semua betul, tetapi keliru bila soalan dalam **ayat**.
> 4. Banyak soalan dijawab **terlalu cepat** — kemungkinan meneka.
>
> **Apa Pahlawan Angka akan buat**
> 1. Lebih banyak latihan sifir 7 dan 3 (mini game).
> 2. Fokus latihan operasi tolak dalam wang (mini game).
> 3. Worksheet soalan berayat (bukan bentuk lazim); ibu bapa semak cara kerja.
> 4. Game dikunci selepas 3 salah berturut-turut yang terlalu cepat; ibu bapa buka dengan PIN.

## 2. Principles (non-negotiable)

1. **Evidence before labels.** Never state a finding below the evidence
   threshold for that lens (§4). Below threshold say "bukti awal" or say
   nothing. Wrong diagnoses destroy parent trust faster than no diagnosis.
2. **Speed alone is not guessing.** Strong pupils are fast. Guessing = fast
   **and** wrong (or fast and inconsistent), relative to the item's reading load.
3. **Separate maths from reading.** A word-problem failure is not a maths
   failure until the same maths succeeds in symbolic form.
4. **Name the pattern, not the child.** "Corak: tolak digit kecil dari besar"
   — never "anak lemah", "malas", "lambat belajar".
5. **Every finding maps to an action PA takes** (practice, mini game,
   worksheet, lock, parent tip). No finding without an action.
6. **Privacy.** Child data only under the guardian account and consent
   (`guardian_consents`). No child data in guest/demo telemetry. No raw
   answers leave the device unless the guardian has consented (PDPA).
7. **BM copy rules.** Short sentences, everyday words, no jargon (no
   "misconception", "representasi"). Numbers as evidence ("7/10 betul").

## 3. Data each answer must carry (facet tags)

Every generated question object gets a `facets` object. Generators set it
deterministically — never infer facets later from text.

```js
q.facets = {
  skill: 'D3.MULT',            // existing KSSR skill id (q.skill)
  fact: '7x8',                 // basic facts only: 'a+b','a-b','axb','a÷b'
  table: 7,                    // multiplication/division table, if any
  op: 'sub',                   // add | sub | mul | div | mixed | none
  context: 'money',            // money | time | measure | plain | ...
  format: 'lazim',             // lazim (column) | horizontal | word | choice | typed | visual
  rep: 'pictorial',            // concrete | pictorial | abstract  (CPA)
  schema: 'compare_less',      // word problems: part_whole | change | compare_more |
                               // compare_less | multiplicative | multi_step
  reading: 2,                  // 1 short … 3 long/complex BM wording
  regroup: true,               // needs borrowing/carrying
  interleaved: false           // set by the session: mixed set vs blocked run
};
```

Each **response** record (already partly in `PATelemetry.response`,
`PALearnerReview`, `production-journey.js recordResolved/mutateFirstWrong`)
must keep: `facets`, `correct`, `value` (the actual wrong answer), `seconds`,
`attempt` (1st/retry), `hint` level used, `sessionId`, `at`.

The wrong **value** is essential: bug detection (§4.3) needs it.

**Phase 1 implementation (done):** `js/engine/diagnostic-brain-v1.js`
(`PADiagnostic`). `facets(q)` uses explicit `q.facets` when a generator sets
them (written arithmetic already does: `op`, `operands`, `format:'lazim'`);
otherwise it derives them centrally from skill metadata (`META.domain`,
`title`), `archetypeId`/`familyKey`, `contextId`, `representation` and the
equation in the prompt. New generators should set `q.facets` explicitly.
Answers are logged per profile in `db.diagLog` (max 500, first attempt +
retry outcome, wrong value, seconds, hint) via `PATelemetry.response(...,
value)`. `analyze()` implements lenses 4.2, 4.3, 4.4, 4.5 and
operation-within-context; tests in `audit/diagnostic-brain.test.js`. The
parent dashboard shows the result as the "Ringkasan Cikgu Dimensi" card.

## 4. The eight lenses

Each lens = input → detection rule → parent sentence → PA action.
Thresholds are **starting values**; calibrate with real data (§7).

### 4.1 Representation (Concrete–Pictorial–Abstract)
- **Research:** CRA/CPA, core of Singapore maths; meta-analysis of 30 studies
  (Ebner et al., 2025, *Learning Disabilities Research & Practice*) found a
  significant, large effect.
- **Input:** same skill answered as `rep: pictorial` vs `abstract`.
- **Rule:** ≥6 attempts in each; pictorial accuracy − abstract accuracy ≥ 25 pts.
- **Parent:** "Anak mudah jawab bila ada gambar (8/10), tapi tanpa gambar 3/10."
- **Action:** fade support: pictorial → pictorial+number → abstract over
  sessions; re-check abstract every 3rd item.

### 4.2 Fact fluency (sifir, tambah/tolak asas)
- **Research:** automatic retrieval frees working memory for problem solving
  (Geary); retrieval speed predicts concept, word and reasoning performance
  (Royer et al., 1999); subtraction and division usually lag (National Math
  Panel 2008). Fluency = accurate **and** quick recall.
- **Input:** per `fact` / `table`: accuracy + median seconds.
- **Rule:** per table ≥8 attempts. `accuracy ≥ 80% && median > 3s` → "masih
  mengira"; `accuracy < 70%` → "belum kuasai". Fluent = ≥90% and ≤ 3s.
- **Parent:** "Sifir 7: betul 9/10 tapi purata 6 saat — anak masih mengira, belum ingat."
- **Action:** retrieval mini game limited to the weak facts, mixed with 30%
  known facts; spaced (§4.7).

### 4.3 Systematic error patterns ("bugs")
- **Research:** Brown & Burton / VanLehn (Repair Theory): children's errors
  are systematic variants of the right procedure, e.g. Smaller-From-Larger,
  Borrow-From-Zero, Doesn't-Borrow.
- **Input:** the wrong `value` + operands.
- **Rule:** a bug detector reproduces the wrong answer from the operands;
  same bug ≥3 times across ≥2 different items.
- **Parent:** "Corak: anak tolak digit kecil daripada besar dalam setiap lajur
  (52 − 38 jadi 26)."
- **Action:** targeted items that break the bug (regrouping cases), worked
  example via Cikgu, parent tip. Extend existing misconception tags
  (`option.tag`, `REPORT_ACTIONS`, `PARENT_MISCONCEPTION_COPY`).
- **Initial bug library:** smaller_from_larger, borrow_no_decrement,
  borrow_from_zero, add_no_carry, place_value_shift, wrong_operation,
  times_table_neighbour (7×8 answered as 7×7/7×9), money_unit (sen vs RM).

### 4.4 Word-problem structure (Model / Bar Method)
- **Research:** bar model lifted Year 4 success 31% → 52% (Bao, 2016, APMC);
  "fewer than" / compare items stayed hardest. Singapore Model Method.
- **Input:** `format: word` + `schema`, compared with the same `op`/skill in
  symbolic form.
- **Rule:** symbolic ≥80% and word ≤50% (≥6 each) → reading/structure gap;
  name the weakest `schema`.
- **Parent:** "Bentuk lazim semua betul, tapi keliru bila soalan guna 'kurang daripada'."
- **Action:** bar-model scaffolds in BM; worksheets with word problems and a
  "tunjuk cara kerja" box for the parent to check.

### 4.5 Effort and rapid guessing
- **Research:** very short response times signal low effort; a fast answer may
  be a lucky guess, but able pupils are also fast (Wise & Kong 2005; Wise 2019).
- **Input:** `seconds` vs a per-item floor from reading load (see
  `js/effort-guard-v3.32.0.js limit()`), plus correctness.
- **Rule:** ≥40% of wrong answers in a session are under the floor → "meneka".
  Rapid-wrong answers are **excluded** from mastery estimates (do not mark
  the skill weak because of guesses).
- **Parent:** "Banyak soalan dijawab terlalu cepat — kemungkinan meneka."
- **Action:** slow-down prompt; **lock** (§5).

### 4.6 Interleaving / strategy choice
- **Research:** randomized study, 787 Grade 7 pupils, 54 classes: interleaved
  practice 61% vs 38% on a delayed test, d = 0.83 (Rohrer et al., IES).
- **Input:** accuracy on `interleaved: false` runs vs `true` mixed sets.
- **Rule:** blocked ≥80% and mixed ≤55% → cannot choose the strategy.
- **Parent:** "Anak tahu cara kira, tapi keliru memilih operasi bila soalan bercampur."
- **Action:** mixed sets in worksheets and review; "which operation?" items.

### 4.7 Retention (spaced review)
- **Input:** skill/fact correct in a past session, wrong now.
- **Rule:** ≥2 such reversals after ≥3 days.
- **Parent:** "Sifir 6 dah dikuasai minggu lepas, tapi mula lupa."
- **Action:** spaced review queue (1, 3, 7, 14 days); reuse `daily-spaced-review`.

### 4.8 Language load (BM reading)
- **Input:** same item family at `reading: 1` vs `reading: 3`.
- **Rule:** short wording ≥80%, long ≤50% → reading barrier.
- **Parent:** "Matematik anak ok — yang menyukarkan ialah ayat panjang."
- **Action:** read-aloud (existing speaker), shorter wording first, then
  gradually longer. Important for Malaysian multilingual pupils.

Also keep the existing **independence** signal: correct only with hints →
"boleh dengan bantuan".

## 5. Lock after repeated wrong answers (parent unlock)

- Trigger (default, owner may change): **3 wrong in a row where the answers
  were faster than the effort floor** (§4.5). Genuine-effort wrong streaks
  go to Cikgu coaching instead (`js/engine/intervention.js`), not a lock.
- Unlock: guardian PIN (reuse `js/page-lock-v1.js` PIN, `pageLockParentPin`).
- On unlock, show the parent the 3 items and the child's answers, then call
  `PAEffortGuard.resetAfterParent()`.
- Never lock in guest demo.
- **Phase 2 implementation (done):** `js/rapid-lock-v1.js` (`PARapidLock`),
  fed from `PATelemetry.response`. 2 rapid wrong first attempts → warning
  toast; 3 → lock overlay; at most one lock per play session; skipped while
  the older Restu lock is active. Dev lab: `tools/rapid-lock-lab.html`.
  Tests: `audit/rapid-lock.test.js`.

## 6. Parent report output

`js/parent-learning-tools-v3.26.0.js` (`reportDiagnosis`, report PDF) becomes:
1. **Ringkasan** — up to 4 findings, highest confidence first, one sentence
   each with evidence numbers.
2. **Apa Pahlawan Angka akan buat** — one action per finding, generated from
   the same finding ids.
3. **Bagaimana ibu bapa boleh bantu** — one concrete 5-minute tip.
Finding ids drive everything: report text, mini-game targeting, worksheet
composition, lock policy.

## 7. Phases and acceptance criteria

| Phase | Scope | Done when |
|---|---|---|
| 1 ✅ | Facet tags (§3, central derivation + explicit for written arithmetic); response records keep facets + wrong value + seconds; finding engine for lenses 4.2, 4.3, 4.4, 4.5; new report sections (§6) | Unit tests for each rule with synthetic answer logs; report shows the 4-line summary from real play; no finding below threshold |
| 2 ✅ | Lock + parent PIN unlock (§5) | Lock only on rapid-wrong streak; PIN unlock shows the 3 items; never in demo |
| 3 | Actions: mini-game targeting by finding (weak tables, op=sub), worksheet composer (word problems, show-working box, mixed sets) | Mini game round composition reflects findings; worksheet PDF has the right mix |
| 4 | Lenses 4.1, 4.6, 4.7, 4.8 (need item variants: pictorial/abstract pairs, reading levels, mixed sets) | Each lens has tests + calibrated thresholds |
| 5 | Consented cloud telemetry (`adaptive_question_exposures`, `adaptive_interaction_events`) for calibration across devices | Only with guardian consent; dashboards for threshold tuning |

## 8. Where things live (current code)

- Question objects / generators: `questions/*.js`, `questions/v2/generators/`
  (already carry `archetypeId`, `representation`, `demand`, `familyKey`).
- Answer recording: `js/engine/production-journey.js` (`mutateFirstWrong`,
  `recordResolved`), `js/battle.js`, `js/engine/telemetry.js`
  (`PATelemetry.response`, on-device), `js/engine/learner-review-v1.js`.
- Per-skill stats: `db.skills[skill]` (`correct`, `wrong`, `hints`, `mis{tag:n}`).
- Coaching / intervention: `js/engine/intervention.js` (wrong-window, guessSec),
  `js/effort-guard-v3.32.0.js`.
- Parent report + worksheets: `js/parent-learning-tools-v3.26.0.js`,
  `js/worksheet-graphics-v1.js`.
- Mini-game routing by skill: `js/focus-mini-games-live-bridge.js` (`gameFor`).
- PIN lock: `js/page-lock-v1.js`.
- Cloud tables (schema only, not yet sent): `supabase/schema/adaptive_learner_telemetry_v1.sql`.

## 9. What makes PA different (keep it true)

- KSSR/UASA + Bahasa Malaysia, with Singapore-style Model Method.
- Parent-first: **apa masalahnya, kenapa, apa PA akan buat** — not just
  topic strengths/weaknesses.
- One-time payment (competitors like KooBits are subscriptions).
- Local heroes, pets and game world.

## 10. Sources

- Ebner, MacDonald, Grekov & Aspiranti (2025). Meta-analytic review of the CRA approach. *LDRP* 40(1). https://scholars.uky.edu/en/publications/a-meta-analytic-review-of-the-concrete-representational-abstract-/
- Fact fluency research summary (Geary; Royer et al. 1999; National Math Panel 2008). https://reflex.explorelearning.com/user_area/content_media/raw/Reflex_White_Paper.pdf
- Brown & VanLehn, Repair Theory (systematic "bugs"). https://www.lri.fr/~mbl/Stanford/CS477/papers/RepairTheory-SeelyBrown.pdf
- Bao (2016). Bar model and word problems, APMC 21(3). https://files.eric.ed.gov/fulltext/EJ1115069.pdf
- Rapid responding and effort (Wise & Kong 2005; Wise 2019), review in Frontiers in Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.892317/pdf
- Rohrer et al., interleaved mathematics practice efficacy study (IES). https://ies.ed.gov/use-work/awards/efficacy-study-interleaved-mathematics-practice?ID=1790
- KooBits Math feature set (competitor reference). https://www.koobits.com/math
