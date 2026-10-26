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
> 4. Portal Restu dibuka selepas 3 tekaan terlalu cepat berturut-turut; ibu bapa buka dengan PIN.

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

**Phase 1.5 (done):** basic facts to 20 (`fx` add20/sub20, `fk` the fact;
weak / right-but-slow "masih mengira jari", most-missed facts named),
regrouping lens (`rg`: right without borrowing/carrying vs wrong with it;
steps aside when a borrowing bug already explains it), retention lens 4.7
(mastered before, slipping in the last 3 days, per table / fact family),
and more bugs: borrow_no_decrement, borrow_from_zero, mul_no_placeholder,
plus answer-based money_unit (sen vs RM) and place_value_shift using the
stored correct answer (`x`) on wrong records.

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
- **Implemented (3.86.95):** facet `rep` (concrete | pictorial | abstract) is
  recorded as `rp` (c/p/a). Derived: `representation: 'manipulative'` →
  concrete, `'visual'` or an svg/img/canvas prompt → pictorial, anything else
  → abstract; a data `table` and mini game rounds without an explicit `rep`
  stay unknown. Gudang Harta sends `rep` for every round (rack/build →
  concrete, picture → pictorial, card/text → abstract). Rule per skill **and
  operation** (so both sides ask the same thing): latest 10 picture/blocks vs
  latest 10 numbers-only, ≥6 each, gap ≥25 pts, rapid guesses excluded; steps
  aside for a skill already explained by a sifir / basic-facts finding.
  Finding `rep_cpa` → plan step `fade` ("Dari gambar ke nombor", no worksheet
  section) → Gudang Harta `focus_target {kind:'fade'}`: the mode's own
  picture/blocks step and its first numbers-only step; level 0 P,P,A →
  level 1 P,A,A → level 2 A,A,A (clean numbers-only answer up, a miss down);
  a re-check (`check`) is numbers only. Re-check key `fade:<skill>:<op>`
  counts numbers-only answers of that skill. Dummy child: `hana`
  (`tools/diagnostic-sim.js`). Tests: `audit/diagnostic-cpa.test.js`, fade
  rounds in `audit/minigame-targets-browser.test.js`.

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
- **Guided facts (owner, 2026-10-23):** "lepas dia 3x salah, kita guide pun dia
  salah, itu maknanya dia memang lemah situ." Each step of "Jom tengok cara" that
  is one basic fact (a column with no carried digit, `d × ? = D`, `N ÷ g`, `a × m`,
  a 2-term numerator sum, …; never × 1 / ÷ 1) reports its **first pick** as its own
  item with `facets {op, operands, guided:true}` (`PAWorked.reportFact`); the brain
  stores it with `g:1`. Rule: **2 guided misses in one table** (explain-away as
  above) mark it "belum dikuasai — salah juga semasa Wira bimbing langkah demi
  langkah", even before 8 tries, unless the child's own answers in that table are
  ≥80%. Same for add20 / sub20 ("belum kukuh"). Guided records feed only 4.2
  (sifir and basic facts); every other lens, rapid guessing included, ignores them.

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
- **Implemented (3.87.3):** every answer record gets `il` when the brain
  records it (`applyResponse`): 0 = blocked, the two answers just before (same
  sitting, ≤15 min) had the same operation; 1 = mixed, at least one had
  another; no tag with fewer than two answers before. A page that knows its run
  may set `facets.interleaved` instead. The lens looks at word problems only
  (`f === 'word'`, a sign is not shown, so the child must choose): latest 12
  blocked vs latest 12 mixed, ≥6 each, blocked ≥80% and mixed ≤55%, rapid
  guesses left out; it steps aside when most mixed misses are explained by a
  weak sifir / basic fact (4.2), a long wording (4.8) or another 4.3 bug.
  Parent text is one sentence: "Faris keliru memilih operasi bila soalan
  bercampur (6/12 betul)."; the blocked score and the count of mixed misses
  that used the other operation (`wrong_operation`) stay in `evidence`.
  Finding `strategy_choice`
  replaces `format_word` (4.4) and `bug_wrong_operation` (4.3) for the same
  misses. Plan step `choose` ("Soalan bercampur") → Gudang
  Harta `focus_target {kind:'choose'}` in every operation mode: the story's
  operation changes every round (never twice in a row); first choose the
  number sentence (3 choices, no bar drawn), after two clean answers the story
  alone; the mode badge reads "BERCAMPUR" and the pet does not name the
  operation; a re-check is the story alone. Worksheet section: short stories
  (`js/engine/reading-pairs-v1.js`) with the operation changing every item and
  a working box. Re-check key `choose` counts mixed word problems. Dummy child:
  `faris` (`tools/diagnostic-sim.js`). Tests: `audit/diagnostic-strategy.test.js`,
  choose rounds and the real-app card in `audit/minigame-targets-browser.test.js`.

### 4.7 Retention (spaced review)
- **Input:** skill/fact correct in a past session, wrong now.
- **Rule:** ≥2 such reversals after ≥3 days.
- **Parent:** "Sifir 6 dah dikuasai minggu lepas, tapi mula lupa."
- **Action:** spaced review queue (1, 3, 7, 14 days); reuse `daily-spaced-review`.
- **Implemented (3.87.5):** groups = each sifir, each basic-fact family, and
  every other answer by its KSSR skill (an answer with a sifir or basic fact
  counts only there). Rule: latest 10 answers from before the last 3 days ≥85%
  right (≥5 answers, "mastered"), and in the last 3 days ≥4 answers, ≤50% right,
  ≥2 misses; rapid guesses left out. Parent text is one sentence, one score:
  "Tolak hingga 10,000 sudah dikuasai sebelum ini, tetapi mula lupa (2/18 betul
  dalam 3 hari)." (several slips: no score). `target.slips` lists each slip
  (`key`, `label`, `tables` / `facts` / `skills`). Review queue
  `js/engine/review-queue-v1.js` (`PAReviewQueue`, stored as
  `db.diagReviewV1.items[key] = {at, label, tables, facts, skills}`, every state
  derived from `db.diagLog`): steps at 1, 3, 7 and 14 days; a step is passed by
  the first matching answer on or after its due time, right on the first try
  without a hint; a miss starts again at 1 day; earlier answers and guesses do
  not move it; done after the 14-day step (a slip that comes back starts a new
  schedule). Not `daily-spaced-review`: the Ulang Kaji Harian card is no longer
  on the Menu V2 home, so the queue feeds **Kembara Dimensi** instead
  (`js/engine/production-journey.js`, adaptive route): every 4th question from
  the 2nd is a due review skill the run has not asked yet. Plan step `review`
  ("Ulang kaji berjadual") carries `skills`; the re-check key for a skill-only
  review is `review:<skills>`; a skill review has no worksheet section. Dummy
  child: `nadia` (`tools/diagnostic-sim.js`). Tests:
  `audit/diagnostic-retention.test.js`.

### 4.8 Language load (BM reading)
- **Input:** same item family at `reading: 1` vs `reading: 3`.
- **Rule:** short wording ≥80%, long ≤50% → reading barrier.
- **Parent:** "Matematik anak ok — yang menyukarkan ialah ayat panjang."
- **Action:** read-aloud (existing speaker), shorter wording first, then
  gradually longer. Important for Malaysian multilingual pupils.
- **Implemented (3.86.99, PR #75, merged, light version):** facet `reading` (1 short … 3
  long) is recorded as `rd`; only a generator that wrote both wordings sets it,
  never inferred from text. `js/engine/reading-pairs-v1.js` (`PAReadingPairs`)
  has six families: jumlah (tambah), beza (tolak), kali ganda (darab), agih
  sama rata (bahagi), wang jumlah, wang baki. Each has a short wording (one
  sentence, ≤12 words) and a long one (2–3 sentences, extra names and detail)
  from the same numbers and schema, sized per grade (D3 to 10 000, D4 to
  100 000, D5–D6 to 1 000 000; money D3 to RM100 … D6 to RM100 000; numbers
  10 000 and up use a no-break space). `generate()` in `questions/index.js`
  serves one for about 1 in 4 questions of D3–D6 ADD/SUB/MUL/DIV/MONEY (D6:
  NUMBERS → jumlah/beza, MONEY), short or long at random; not in
  recover/teach/confirm mode, not for a boss, not below mastery 35. Read aloud: the Segel speaker
  marks the question (`q.readAloud`) → `ra:1` (heard before answering) or
  `ra:2` (heard after a wrong first try). Rule per family (operation +
  context): latest 10 short vs latest 10 long read alone (`ra` not 1), ≥6 each,
  short ≥80% and long ≤50%, rapid guesses excluded; steps aside when a sifir,
  basic-fact or bug finding explains half or more of the long misses. Read
  aloud right (≥2 heard first, or ≥2 misses right after hearing) adds a line
  and makes it "tinggi". When it fires, 4.4 `format_word` steps aside (short
  word problems are right, so it is the reading, not the structure). Finding
  `reading_load` → plan step `reading` ("Baca soalan panjang"): worksheet
  (short first, then long, Cara kerja box) and Gudang Harta
  `focus_target {kind:'reading'}`: short wording → long with the question
  sentence highlighted (`reading: 2`, not evidence) → long alone; a re-check is
  the long wording alone. A money finding has no mini game target (Gerai
  Wirayung has no story rounds). Re-check key `reading:<op>:<context>` (long
  answers read alone). Segel shows a prompt over 150 characters at a calmer
  size, left aligned. Dummy child: `zara`. Tests:
  `audit/diagnostic-reading.test.js`; reading rounds and the real-app card in
  `audit/minigame-targets-browser.test.js`. Not done: mini games have no
  speaker; bank items other than the pairs stay untagged; thresholds are a
  design guess until phase 5.

Also keep the existing **independence** signal: correct only with hints →
"boleh dengan bantuan".

## 5. Portal Restu (lock after rapid guessing, parent unlock)

- Trigger: **3 wrong first attempts in a row, each faster than the effort
  floor** (§4.5). 2 in a row → Cikgu Dimensi warning. Genuine-effort wrong
  streaks go to Cikgu coaching (`js/engine/intervention.js`), never a lock.
- On lock, Wira falls into the Portal Restu (`assets/cinematics/portal-restu-jatuh-v1.mp4`,
  ~1 MB, loaded only when it happens; sound follows the game mute), then the
  Portal Restu card asks for the guardian PIN (reuses `pageLockParentPin`;
  parents without a PIN create one there).
- After the PIN the parent sees the 3 items (question, child's answer, right
  answer, seconds) and chooses:
  - **Teruskan main** — portal stays armed and re-locks on the next 3 guesses.
  - **Biar teroka hari ini** (marked not recommended) — portal off until
    midnight MYT for this child (`db.portalRestu.offUntil`); Cikgu warnings
    stay; guesses are still logged for the report.
  The choice is stored in `db.rapidLockLog`.
- Never in guest demo or dev battlefield; defers to the older Restu lock.
- Implementation: `js/rapid-lock-v1.js` (`PARapidLock`), fed from
  `PATelemetry.response`. Dev lab: `tools/rapid-lock-lab.html`.
  Tests: `audit/rapid-lock.test.js`.
- Covers every mode that takes answers: battle, Gembok, Wirayung and all nine
  Fokus mini games (see §8, mini game answers). The overlay sits above the
  full-screen mini game frame.

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
| 2 ✅ | Portal Restu (§5) | Lock only on rapid-wrong streak; PIN unlock shows the 3 items; parent can allow exploring for the day; never in demo |
| 3 (worksheet ✅, rest: see §8a) | Actions: mini-game targeting by finding (weak tables, op=sub), worksheet composer (word problems, show-working box, mixed sets). Worksheet done: "Disyorkan" PDF takes ~60% items from `PATargets.worksheetItems` (FOKUS tag, Cara Kerja box for word/money/regroup, "Kenapa latihan ini" box, step-by-step skema from `PATargets.explain`); rest from the bank; falls back to mastery logic without findings | Mini game round composition reflects findings; worksheet PDF has the right mix |
| 4 ✅ (4.1, 4.6, 4.7, light 4.8; thresholds not calibrated) | Lenses 4.1, 4.6, 4.7, 4.8 (need item variants: pictorial/abstract pairs, reading levels, mixed sets) | Each lens has tests + calibrated thresholds |
| 5 (partly there, see §8a "Phase 5: what already exists") | Consented cloud telemetry (`adaptive_question_exposures`, `adaptive_interaction_events`) for calibration across devices | Only with guardian consent; dashboards for threshold tuning |

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
  `js/worksheet-graphics-v1.js`. Ringkasan tab cards: `js/parent-glance-v1.js`
  (rendered by `renderParent()` in `js/parent.js`).
- Mini-game routing by skill: `js/focus-mini-games-live-bridge.js` (`gameFor`);
  brain targets: `PATargets.miniGameTarget`, `focus_target` in `gudang-harta.html`.
- Mini game answers: every game page (`gudang-harta`, `kedai-kek`, `bengkel-ajaib`,
  `dapur-ramuan`, `pos-peninjau`, `lombong-permata`, `tapak-bina`, `menara-jam`,
  `gerai-wirayung`) posts `PA_MINIGAME_ATTEMPT` for each try via `paAttempt(ok)`
  ({key, prompt, answer, ok, first, ms, hints}). `js/minigame-telemetry-v1.js`
  turns these into `PATelemetry.response` with modes `minigame`,
  `minigame-first-attempt`, `minigame-retry` (same contract as battle). A new
  mini game must call `paAttempt(false)` before `misses++` and `paAttempt(true)`
  on success, or the brain and Portal Restu cannot see it.
  Tests: `audit/minigame-telemetry.test.js`.
- "Kemungkinan punca" foundation tags: D1/D6 in their v2 runtimes, D2–D5 (and
  the wording items) in `questions/focus-tags-d2-d5-v1.js`; read by
  `js/engine/focus-foundation-v1.js`, shown by `js/guardian-focus.js`.
- Short/long wordings (lens 4.8): `js/engine/reading-pairs-v1.js`
  (`PAReadingPairs`), served by `generate()` in `questions/index.js`
  (`READING_PAIR_SKILLS`) and by Gudang Harta reading rounds.
- Targeted practice + worksheet composer: `js/engine/diagnostic-targets-v1.js`
  (`PATargets`, incl. `skillFor` for Kemahiran Fokus cards in
  `js/guardian-focus.js`). Dummy children: `tools/diagnostic-sim.js`, lab
  `tools/diagnostic-sim-lab.html`.
- PIN lock: `js/page-lock-v1.js`.
- Cloud tables (schema only, not yet sent): `supabase/schema/adaptive_learner_telemetry_v1.sql`.

## 8a. Handoff — current status and next work (update this when you finish a step)

**Restu stays in the battle stage (3.87.65, 2026-10-26).** Owner on phone: when Cikgu dives, the arena "resized" into a non-battle layout. Cause: `body.pa-restu-cinematic` turned `.segelStage` full-screen, so a phone went from the 40% battle strip to a tall portrait canvas (huge sky, tiny actors). `css/rapid-lock-v1.css` no longer resizes the stage; the question panel is only dimmed and inert during the cinematic, and the screen-level 7vh bars are gone (the stage has its own letterbox for the face shot). Checked at 390x844, 768x1024 and 1280x800. Known pre-existing failure on main: `audit/restu-cinematic.test.js` "missing, rejected, and hanging Cikgu hooks…" (fails before and after this change).

**Cikgu Restu entrance (3.87.64 draft, 2026-10-26).** Before the existing Restu fall clip,
`PARapidLock` awaits the real Segel stage entrance: left-facing WebP teacher between Wira
and the rescue pet, held face close-up, parallax pull-back, descent and palm-contact FX.
Owner confirmed the existing three rapid wrong first-attempt trigger stays unchanged.
Entry assets load lazily; cancellation/profile checks and bounded fallbacks always retain
the guardian PIN/review flow. Production input resumes on the same retry question.
`audit/cikgu-dimensi-entry-preview.html` now loads the real arena/entry/Restu flow locally
(PIN 1234, no learner saves); the old pose-only preview is retained separately.
Owner-approved cinematic: 0.9s face hold, fast dive, impact at 1.25s, full landing at
1.5s; hold 1.5s then hand directly to the existing video at 3s. Owner clarified:
add 0.5s back relative to the approved 2.5s cut; the 0.5s total hold in 3.87.60 was
a misinterpretation. Camera settles over the original 1s, then rests for 0.5s. The wide shot
fits Wira + equipped companion / teacher / pet+dome into three separated groups using
real alpha bounds, viewport FOV and impact zoom. Render-only transforms are restored
before each tick, resize and cancellation. Teacher particles follow the same transform.
Responsive geometry tested at 9 viewport shapes with all 3 real WebP dome tiers.
During Restu only, arena image and ground-overlay transforms counter the actor-camera
crop zoom/center per layer depth; the background no longer expands during the dive.
Owner then reported perceived zoom after impact: the independent foreground canvas
was still scaling grass/motes with camera zoom^1.25 after WebGL rendered. That layer
now uses fixed center/scale throughout the wide shot. Opening parallax and actor
framing remain. Regression tests cover the canvas draw geometry as well as actual
Three.js projection matrices; previous plane-only checks missed this layer.
Wira instantly says “Eh, Cikgu Dimensi!”
in a burst bubble on the wide reveal, including the optional-art fallback. Cleanup
removes it before video or cancellation. Background landmarks and bubble lifecycle are
covered by `audit/restu-background-bubble.test.js`.
Grounding correction: surprise-pose swaps adjust the canvas offset in the same tick.
After the pull-back reaches the arena, each render cluster anchors to the original
screen floor row using the actual camera crop and layer depth; particles share Cikgu's
anchor. Prior hops/pet lifts finish when Restu successfully takes ownership and cannot
replay after video/cancellation. Loading failures leave normal motion alone.
`audit/restu-grounding.test.js` checks actual Three.js floor projections, real asset
anchors, the first surprise frame, and the next normal tick after completion/cancel.
Companion/target audit: 169 independent choices (none/fallback plus all six species in
Asas/Bara) pass 172,800 frame checks across nine viewport shapes and all dome tiers.
Production config/sizing/animation helpers are executed with 118 logical frame measurements
from 59 real asset files; evidence is hash-locked and generated by
`tools/generate-restu-pet-audit.cjs`. Browser access became available: desktop and phone
390x844 samples visually checked with Kukupat/Keryan, Riya Bara/Bunnis and Keryan Bara/Kumbis,
plus Bunnis Bara/Kukupat; the live animation/video reaches the PIN screen without console errors.
The preview has independent pet selectors and a local-audit-only held landing checkbox.
Normal production flow remains three seconds; visual samples complement the exhaustive
geometry matrix rather than claiming every combination was screenshot-tested.
Targeted regressions: `audit/restu-cinematic.test.js`, `audit/restu-layout-timing.test.js`. This source update does not enable
automatic Netlify publishing; a production release remains a separate owner decision.


**Gembok player XP (3.87.57, 2026-10-25).** Real manual/adaptive/focus answers now grant
12 player XP per resolved correct answer. A per-profile, per-run `gembok.xpAwards` ledger
prevents repeat awards and recovers missing XP from saved eligible completions on load,
persisting the correction once. Stale callbacks after profile switches are rejected. Coins,
pet rewards, mastery rules and diagnostic thresholds are unchanged. Regression suite:
`node --test audit/gembok-xp.test.js` (including serialized reload and live profile switching).


Last updated: 2026-10-24 (PRs #107–#109 merged: Segel stage polish, see "Segel stage polish" below). Read this section first if you are picking up the work.

**Affiliate page (3.87.56, owner 2026-10-25).** `affiliate.html` + `js/affiliate-page-v1.js`: sign up as an
affiliate without entering the app (Google or e-mail; consent to Terma/Privasi), give name and phone, and get
the referral link at once (`https://pahlawanangka.netlify.app/?ref=CODE`) with Salin, WhatsApp, native share
and a ready caption. Same Supabase project and default session as the app, so the account works in the app.
It calls the existing `affiliate-application` edge function (approved at registration; welcome e-mail
queued). The front page (`landing-approved-v1.html` 1.4.1) has "Jana komisen: jadi rakan affiliate"
(`target=_top`, out of the app frame). The welcome e-mail (`_shared/affiliate-email.ts`) now links the
affiliate page and adds "Cuba sendiri dulu" with a demo button; **it needs `send-payment-emails` redeployed**.
Owner offer (2026-10-25, all affiliates, **limited time**): an affiliate who buys Akses Keluarga RM19 is
upgraded to Family Plus by hand (claim by e-mail with account e-mail and order reference). Shown on the
affiliate page, in the welcome e-mail (owner's style: dark header, Telegram group, "why PA, not a plain
practice app", greeting by name) and as a note in the app's affiliate panel; the commission rates are also
marked limited time. If Google sign-in comes back to the home page instead of this page, add `…/affiliate.html` to Supabase Auth
→ Redirect URLs. Test: `audit/affiliate-page-browser.test.js`.

**Status at a glance (2026-10-25).**
- Merged into `main`: every PR up to #130 (3.87.56). #119 (an older status note) was closed unmerged.
- Netlify: 3.87.56 is live (2026-10-25, deploy 6addc9b7e84bd97b9538fef5; checked: the live `js/version.js`
  says 3.87.56 and `affiliate.html` is up). Deployed from this cloud session through the Netlify connector
  from a clean `git archive` of `main` (the owner allowed the Netlify domains in Admin settings →
  Capabilities). The owner decides when to deploy; check the live version before assuming.
- Supabase `send-payment-emails` v17 is live (2026-10-25): the new affiliate welcome e-mail and RFC 2047
  subjects (emoji, en dash). The cron job `payment-email-worker` runs it every 5 minutes.
- Mini games: all nine KSSR topic families have a mini game, and all nine have
  "Jom tengok cara" (#84–#103). D2.4.5 Bahagi wang and D2.4.6 Simpanan already go to
  Gerai Wirayung (`bahagi` / `simpanan` modes, `js/wirayung-live-bridge.js`); the old note
  that they went to battle was wrong. #118 (3.87.46) fixed them: Simpanan shelf prices
  showed "RMNaN" (only the bought item had a price), its receipt said "Wang dibelanjakan ?"
  although the story gives it, and it now alternates with a **sasaran** kind ("Aina mahu
  beli X berharga RMa. Dia sudah simpan RMb. Berapa lagi perlu disimpan?", as in the
  D2.4.6 bank) with its own "Jom tengok cara" (a − b) and DEV button; Bahagi wang share
  slots read "Kawan 1" (was "Pet 1"). Open idea: money boards for whole-ringgit sums
  still start with two "0 − 0" sen steps (engine-wide, `PAWorked.build`).
- Phase 5: brain facets now go to the cloud and admin/kalibrasi.html shows the
  findings (3.87.37, see "Phase 5: what already exists" under item 2 below).
- Known small issues: on a 360×600 screen Wira's bubble still covers the pet's
  head in 8 of 9 mini games and drops to 10 px; a Gerai Wirayung hint reads
  "Pecahkan 50 sen: RM0 dan 50 sen." (the RM0 part).

**Segel stage polish (PRs #107–#109, 3.87.39–3.87.41, all in `js/segel-demo-v2.1.0.js`).**
Goal (owner, 2026-10-24): make the Gembok/pet rescue stage feel like an anime battle
(reference: a Threads clip), tuned first in a throwaway canvas prototype, then moved
into the live Three.js stage.
- #107 pet intro: when the arena is revealed (normal or after "Langkau"), the camera
  starts close on the trapped pet with black cinema bars, holds ~1.1 s, pulls back;
  Wira's blue particles start during the pull-back. Tap the stage to skip to the
  pull-back. Zoom is a **2D crop** of the full view (`camera.setViewOffset`), not a
  camera move, so the pet stays on the same spot of the map (owner caught the
  parallax version making the pet slide sideways).
- #108 hit feel: the dome now bounces and greys **at sword contact** (before, it
  reacted ~210 ms late, when `hitSeal()` ran); 110 ms hit-stop; camera push-in and
  punch; blue dash afterimages; a 2D effects canvas over WebGL (slash arc, sparks,
  shock ring, + − × ÷ symbols, short flash, hit counter like "2/3"); cracks on the
  dome that grow every hit (a canvas child of the dome mesh; line width is in
  screen pixels so phones and tablets look the same; cracks stop before the pet's
  face). Gangsa/Perak break: longer hit-stop, tier-colour flash, two shock rings,
  then the next dome grows in.
- #109 finisher (Gembok Emas): the original **aura farming frame** (Wira raises the
  sword on black) is kept, with an absorb layer drawn on top (energy to the sword
  tip, rings at the feet, rising sparks, sword glow that bursts white); the
  **eye cut-in + JURUS PENAMAT** stays; then a dark arena with cinema bars, dash,
  X-slash, 170 ms hit-stop, glacier in 0.6× slow motion (each thunder flashes and
  cracks the dome), gold burst, then the existing Aurora-bebas / coins / BERJAYA flow.
  `placeFinalImpact()` now follows the camera crop. Normal attacks got a stronger
  absorb (more energy, short aura). Wrong answer: the dome sends out tier-colour
  rings, Wira is pushed back ~0.4 s, text "Gembok menolak!" (no damage).
  Fix: an answer given before Wira has formed (intro/particles) now shows Wira first.
- **Owner rules:** the pet's sad animation speed must never change (only the camera
  moves; hit-stop and slow motion freeze `fdt`, never `tAcc`, which drives pet
  frames); keep the aura farming frame and the eye cut-in; on-screen text says
  "Gembok". `reduceMotion` keeps the old behaviour (static cracks only).
- Tunables (top of the hit-feel block): `HITSTOP` .11, punch `S.camPunch`, glacier
  `S.slow` .6, hop `S.hopDur` .34 / height .55, pet intro `PET_INTRO_*`.
- How it was tested: guest Demo in headless Chromium (no GPU, so it runs slower
  than a phone): `PADemo.open(); PADemo.selectGrade(2); PADemo.start()`, then
  answer with `PASegelDemo.submitInteraction({tag:'correct'}, button, PASegelDemo.state().q)`
  (14 correct answers reach the finisher; `tag:'wrong'` for a wrong answer).
  `node --test audit/segel-hero-visibility.test.js audit/segel-result-lifecycle.test.js` → 11/11.
- #111 (3.87.42, owner after a phone test): crack width is based on the dome's own
  border (core ~7 px in the 1536 px art → crack core ×1.15, glow ×2.4), so cracks
  match the dome lines on every screen; aura farming is 1.6 s (`LIVE_FINISHER.chargeMs`
  and the `wiraChargeSheet` CSS animation must stay equal).
- #113 (3.87.43, owner after a phone test: "tak sama macam lab"): normal attacks keep
  the **full view** (no push-in zoom, only a small punch) and Wira **hops back** to his
  place in an arc (`S.hopT`, prepare pose); the hit is applied **at sword contact**
  (`strike()` calls `applyHit()` and stores it in `S.earlyHit`; `hitSeal()` returns
  that result), so a dome breaks with no ~0.3 s delay; the finisher attack and
  glacier have **no zoom** (the glacier keeps its full size); screen flashes fade
  on real time, not slow motion. Camera zoom is now used only in the pet intro.
- #115 (3.87.44, owner): the "1/2" hit counter above the dome is removed (the seal
  bar shows it). **Wira's opening line:** when Wira finishes forming after the pet
  close-up, a speech bubble greets the player by name and names the trapped pet
  (`GREET_LINES` per pet id, 2–3 short lines each, `{n}` = `resultPlayerName()`,
  "Pahlawan" if empty); it hides when the pupil answers. **Event banner**
  (`.segelToast`: "… DITEMUI!", "… BEBAS!", "KUNCI … PECAH!"): Lilita One game font
  (OFL, bundled in `assets/fonts/` so it works offline), gold fill, thick outline,
  3D shadow, bounce-in; `toast()` shows it 1.5 s.
- #117 (3.87.45, owner): the greeting uses the **main-menu dialogue box style**
  (same look as `#wiraBubble` in `css/menu-v2-v1.0.0.css`: white, double border, no
  tail, typewriter 90 ms per letter, then 2.4 s). A broken dome shows the tier name on
  top and "PECAH!" below ("GANGSA / PECAH!", "PERAK / PECAH!", "EMAS / PECAH!"), same
  gold style, in the demo and in production missions (`toast()` keeps line breaks).
- 3.87.53 (owner: "artifact punya final scene lagi cantik … bila last hit patutnya dia ada zoom in mcm
  entrance tu"): the **final strike zooms in again**, with **parallax**, like the Gembok Epik Lab artifact.
  As Wira dashes, the camera crop eases (k 11) to `FIN_ZOOM` 1.42 between Wira and the dome; punch .14 at
  contact; after `FIN_HOLD_MS` 260 it pulls back slowly (k `FIN_PULL_K` 2.4) so the glacier rises into the
  full view. Parallax (`S.par`): the background and ground overlay grow less than the crop (`z^-0.42`,
  never smaller than needed to cover the crop window), and a front layer on the 2D effects canvas (dark
  grass silhouettes + light motes, `drawParallaxFront`) grows `z^1.25` and moves 1.45× the crop shift.
  Normal attacks still keep the full view. `reduceMotion` skips it (returns before the zoom).
- 3.87.54 (owner: the pieces should fly "macam 3D … ke kiri ke kanan" while still zoomed, and the
  lightning should "turun daripada langit dan kena segel"):
  - The camera stays close through the glacier (eases from 1.42 to `FIN_GLACIER_ZOOM` 1.24) and the seal
    breaks while zoomed; `applyHit()` pulls back to the full view `FIN_BREAK_HOLD_MS` 750 after the break
    (`finalBreakFx` no longer resets the zoom; its flash is softer, .55, so the pieces show).
  - The last seal's 10 pieces fly in 3D (`shatter(s,true)`): towards the camera (`vz`), out to the left or
    right of the screen, tumbling on x/y (double-sided); they vanish before reaching the camera.
  - `drawSkyBolts`: once a glacier sheet reaches its bolt frames (7+), a flickering jagged bolt (glow, core,
    two branches, redrawn every ~60 ms) joins the top of the stage to the bolt tip, with a sky flash.
- 3.87.55 (owner on a phone: "tak sama … masa pecah final blow … kat mana pecah?"): in 3.87.54 the final
  pieces flew towards the camera so fast that, with the dome near the right edge of the zoomed frame, they
  left the screen in ~0.3 s and the break could not be seen. Now the final break reads like the other
  breaks (glass pieces from the dome that spin and fall), with 18 pieces instead of 10, ~1.5–1.9 s life, a
  small pull towards the camera (`vz` .35–1.25) and a lean towards the middle of the screen; during the
  glacier the camera also moves its centre onto the dome. `host._shardInfo()` (tests only) lists live
  pieces in screen space.
- **Next:** owner tests on a real phone. Likely tweaks: glacier slow-motion speed,
  hop height (`.55`), greeting wording. Not done: the old battle screen
  (`#battleArena`) was not changed.

**Start here (next agent).**
1. Merged into `main`: PRs #48, #69–#78, #80–#83 (#79 closed as a duplicate of #75). #69 Next item 3 + question-first mini
   game layout (3.86.93); #70 re-check loop + `tools/recheck-lab.html`
   (3.86.94); #71 lens 4.1 CPA (3.86.95); #72 question bank repair
   (3.86.96); #73 bar model for word problems (3.86.97); #74 small-phone fix
   for all mini games + one-row number keypad on short web screens so Wira is
   not cropped (3.86.98); #75 light lens 4.8, short vs long wording + Segel
   speaker signal (3.86.99, see §4.8 "Implemented"); #76 "Kemungkinan
   punca" tags for D2–D5 (3.87.0, see "Kemungkinan punca tags" below).
   #77 docs: "How it works" under "Kemungkinan punca tags" below. #80 mini
   game fix: every round gets its own brain record (3.87.2).
   #81 lens 4.6 strategy choice (3.87.3, see §4.6 "Implemented").
   #78 short Fokus card line + "Punca utama" for parents (3.87.4; owner:
   "taknak serabut" for the child or the parent): each Fokus card has one
   short line ("Punca: Nilai tempat", else "Ketepatan N%" or the brain label;
   money/time checks "Punca: soalan wang / baca jam / ..."), and the parent
   Ringkasan "Perlu dikuatkan" card adds one sentence "Punca utama: Nilai
   tempat nombor." (details under "How it works" below).
   #82 full lens 4.7 retention + 1/3/7/14-day review queue in Kembara
   Dimensi (3.87.5, see §4.7 "Implemented"). #48 (from 2026-10-20, merged
   now): the BERJAYA victory crest pops in, a light streak sweeps the banner,
   gold stars reveal once then sparkle; all stop under reduced motion (#46
   cheering Wira + pet and #47 arena layout stay closed, owner choice).
   #83 bug fixes (3.87.7): Menara Jam calendar rounds printed "undefined" on
   the stamp (no `ansText`); a profile saved before newer skills existed
   crashed the parent worksheet tab on load (`snapshot()` read
   `scoreState(id).correct` before `initAll()`). Current
   version 3.87.8. **"Jom tengok cara"** (guided worked example), first part merged as
   PR #84 (3.87.8, owner: ship now to deploy): Gudang Harta two-number pad rounds only.
   `js/minigame-worked-v1.js` (`PAWorked`: `parse`, `build`, `run`) +
   `css/minigame-worked-v1.css`. After 3 wrong tries (or 2 and both hints) the
   hint button becomes "Jom tengok cara"; Wira walks through the written method
   place by place from the round's own numbers; the pupil taps each step (3
   tiles = right + real slips; "Pinjam 1"; a lone digit "turun"); a story first
   asks for the number sentence right under Wira's line, the board comes in
   after; tiles bounce in; the round ends without stars ("SIAP! Cara Wira") and
   the next round is the same kind with new numbers; the board runs only when
   its answer equals the round's answer. **Owner rules:** interactive, not
   slop; every kind that needs tapping gets proper tap-by-tap steps in its own
   widget (no text-only fallback in the shipped version); show the preview
   (video + screenshots) before shipping. Plan: (1) finish Gudang (rack bina /
   add / sub, pick kinds such as compare / round / place value, two-step), (2)
   the other eight games with their own widgets, starting where step text is
   missing (Menara Jam, Pos Peninjau, Lombong Permata). Original request: "Jom tengok cara" worked example after 3 wrong tries in all
   nine mini games (every kind knows its answer; step text is missing in
   Menara Jam, most of Pos Peninjau and early Lombong Permata).
   #85 (3.87.10) battle stage: on a tall arena (laptop, aspect < 1) Wira and
   the seal move closer and the camera zooms ~1.28x (phones unchanged); the
   battle entry video goes to dark at 6.4 s on Wira's close-up, before the
   tower wide shot with a tiny Wira. #45 (3.87.11) money comparison cards:
   at ≤560 px and ≤400 px the notes and coins shrink so both groups fit side
   by side, and each group starts at the top.
   #86 (3.87.12) battle questions fit small phones: on ≤560 px money of the
   same value forms one overlapping pile (edges countable, top piece shows
   value; owner: colour and value are enough), notes and coins in two rows;
   `fitPrompt()` shrinks prompt text to 75% then pictures to 65% before the
   box scrolls. Money compare now asks "Berapakah nilai kumpulan yang lebih
   besar?" (choices are values, as before).
   **Deployed:** 3.87.12 is live on Netlify (2026-10-22, owner checked on a
   phone; the laptop size was not checked).
   **"Jom tengok cara" part 2 (3.87.13, PR #87 merged):** a place-value board in
   `PAWorked.buildPV` for round, compare (bigger/smaller/symbol), place name
   and digit value (Gudang D1–D5 bina and banding). The pupil taps the digit on
   the board (a wrong digit shakes, the right one glows), then picks.
   Generators pass the board spec as `q.wk`. A pick with 2 choices is offered
   after 1 miss, with 3 after 2 (the next try would be a guess). Compare:
   the places that match go grey, the first place that differs gets a pulsing
   red frame ("sini yang tak sama"), then "Mana lebih besar? Tekan digit itu."
   **Owner (2026-10-22), all nine mini games:** the pet speaks once a round;
   when Wira talks (a hint or "Belum tepat"), the pet's line goes and does not
   come back. Pets use their short names (Kukupat, Kumbis, Riya, Bunnis,
   Keryan, as in js/pet-collection-system.js), not the species names.
   #88 (3.87.14) loading screen: only the shield with + − × ÷, the bar and
   one line "Menyambung profil dan kemajuan kamu…" (owner: too much to read;
   no kicker, title, tagline, tip, motto or frame).
   **"Jom tengok cara" part 3 (3.87.15, PR #89 merged):** rack "bina": Wira lights one place
   at a time (biggest first) and only its + works, up to that digit; a 0
   place is left empty. Rack add/sub rounds use the written board (the rack
   already lays them out in columns). Two-step and mixed (`q.wk.t='chain'`):
   `PAWorked.buildChain`/`runChain`, two boards left to right; a story first
   asks for the whole sentence (a − b + d). Next in Gudang: order,
   expanded / words, ops with × first or brackets.
   #90 (3.87.16) D1 "X menulis 100 sebagai …": n − 10 equalled the wrong
   spelling, so one choice became "Tidak pasti"; now n − 20. This was the rare
   failure of the "Darjah 1–2: every choice is real" test.
   **"Jom tengok cara" part 4 (3.87.17, PR #91 merged; the Gudang card label
   "GULUNG ARAHAN" is now "KIRA", owner: plain school words):** number patterns
   (`PAWorked.buildSeq`, `q.wk.t='seq'|'apply'`): a trail of boxes; a known
   pair lights up → bertambah/berkurang → beza → hop from the neighbour into
   the "?" (the first box goes back from the next). Compose (`'compose'`): the
   pupil taps each part's place on an empty row; a place with no part gets 0.
   Missing part (`'missingPart'`, incl. D1 "34 = ___ + 4"): the written places
   go grey, tap the digit left, pick its value. Three numbers (126 + 183 +
   233, 439 − 96 − 139): two boards via `chain`.
   **Part 5 (3.87.18, PR #92 merged):** order (`'order'`): all numbers on the board; the first
   place that differs among the numbers left gets the red frame, the pupil taps
   the smallest (or biggest), it gets a green rank and goes quiet; last, the
   round's own choices. Number → words (`'toWords'`): one word group at a time
   (juta / ribu / ratus / puluh+sa), slips as tiles (digits read the other way,
   a place too high; seratus, sepuluh, seribu). Words → number (`'fromWords'`,
   incl. D6 juta pad): like compose, each word group's digits tapped into
   place, a place not said gets 0. Expanded (`'expanded'`): the value of each
digit, then the round's choices.
   **Part 6 (3.87.19, PR #93 merged):** facts as hops on the trail (`PAWorked.buildHops`):
   8 + 4 buat 10 dulu; 17 − ___ = 9 count up through 10; k × t skip counting
   (from 5 × t when k > 5; 1 × t one step); groups; ÷ in a story counts the
   hops; take away again and again hops back; count coins "1 uncang = 10".
   × ÷ by 10/100/1000 (`buildPow10`). A division with a remainder field uses
   the written board (both fields). Two-digit × (`buildLong`, 567 × 37):
   567 × 7, 567 × 3 with a 0 at the end, then add; `runChain` takes N boards.
   `workedPlan()` in gudang-harta.html picks the plan (tests: `__gudangGen.planFor`).
   Coverage: 76% of sampled Gudang rounds have a worked plan. Still text-only
   (~40 generators): two-digit ÷, × first / brackets, rule picks, compare
   statements / between / clues / more-less, estimate / check, choose the
   operation, D6 juta fractions/decimals and primes.
   **Other mini games (owner, 2026-10-23: "mini game lain dulu").** Lombong
   Permata first (3.87.20, PR #94 merged). **Owner: breadth first** — in each
   game cover the most common kinds to about half, then move to the next game,
   so all nine have real steps sooner; rare kinds later. the same plumbing as Gudang (offer after 3 misses,
   `workedPlan()`, `finishWorked`, repeat the kind; `__lbGen.planFor` for
   tests), and `PAWorked.build(op,a,b,{dp})` for decimals: numbers come scaled
   to whole numbers, columns below sa are persepuluh / perseratus / perseribu
   (head 1/10, 1/100, 1/1000), every column up to sa holds a real digit, the
   point is drawn after sa, and the 0 before the point is written. Decimal
   lazim add/sub (2 rows, and 3 rows as a chain) is covered: about 7% of
   Lombong rounds. Lombong has ~70 generators (decimal pads, percent, grids,
   number lines, compare); the next ones need their own boards.
   **Lombong part 2 (3.87.21, PR #95 merged):** 46% of sampled Lombong rounds (most of D2–D5)
   have a plan. `PAWorked` 1.7.0: decimal × and ÷ by one digit (the 0 at sa
   is written); the place-value board takes `dp` (compare place by place,
   never by digit count; round to n places; place name / digit value);
   `buildDec` boards: fraction → decimal (`decFrac`), the point moves for
   ÷ 10/100/1000 and p% → decimal (`decShift`), hundred grid (`grid`: full
   rows, then squares; also the unshaded %), p% of Q via 10% and 5%
   (`pctOf`, also > 100% and "BUKAN" stories), fraction → % (`fracToPct`),
   % → simplest fraction (`pctToFrac`), n daripada 100, the smallest /
   biggest of four (`extreme`). Left in Lombong: shading and number-line
   rounds (they are their own widgets), D6 × ÷ decimals by decimals,
   percent change, BODMAS with fractions.
   **DEV shortcut (3.87.22, PR #96 merged):** the mini game DEV sheet (Gudang, Lombong) has
   "Cuba Jom tengok cara": one button per worked-example kind; it finds a
   round of that kind (`forcedQ`) and offers "Jom tengok cara" at once.
   **Gerai Wirayung (3.87.23, PR #97 merged; owner: used in every demo, so it jumped the
   queue).** At KIRA, after 3 wrong counts (2 + both hints) "Jom tengok cara":
   money boards (`PAWorked.build(op,a,b,{money:true})`: columns RM10 / RM1 /
   10 sen / 1 sen, RM text, the multiplier a whole number) chained per order:
   bayar (2 items: add; × quantity: mul), baki (total then paid − total),
   simpanan, bahagi bil (÷), diskaun (% via 10%/5% `pctOf{money}`, or RM cut;
   then the change), untung/rugi (sales = price × qty, then "Untung atau
   rugi?" and the difference; or cost = sales − profit). After the board the
   pupil lays the amount on the counter (SERAH) with "Jawapan Wira: RMx" as a
   reminder; the round ends without stars and the next is the same kind. DEV
   sheet: 9 "Cuba Jom tengok cara" buttons. A one-item bayar (read the tag)
   has no board.
   **Small fixes (PRs #98–#100 merged):** #98 (3.87.24) Gerai Wirayung: the
   hanging sign is gone, the basket is empty (its green liner repainted) and
   sits on the counter. #99 (3.87.25) no Android tap-highlight box
   (`-webkit-tap-highlight-color: transparent` in the app and every mini game).
   #100 (3.87.28) front page: logo-only hero on the log-in background, Log masuk
   (Wira blue) above Cuba Demo, compact plan cards that open on tap, squad art
   with "Game yang faham anak anda"; the free plan is now **Akses Mesra**
   everywhere it is shown; the landing frame asks for its height again (it
   stayed at 1800px).
   **Kedai Kek (3.87.29, this PR).** `PAWorked.buildFrac(spec,{final})` 1.9.0: a
   fraction working line, row by row, the numbers are slots the steps fill. Kinds
   (`q.wk.t`): `read` (a strip model: count all → penyebut, count the asked part →
   pengangka; also tanpa krim / tinggal / diambil), `parts` (story: add, then
   d − that), `equiv` (×k from the known side; `shade`: B parts ÷ A parts),
   `simp` (biggest common factor, ÷ both; `gcf` lists the factors), `toMixed`,
   `readMixed`, `toImp`, `add` (2–3 terms, same or related denominators, + / −),
   `cmp`, `order`, `tenth`, `tenthCmp`, `qty` (÷ d then × n; `rest`), `mulW`,
   `mulF`, `div` (× salingan). Every plan ends in the simplest form the round
   asks for (whole / mixed / fraction). `run(...,{html})` lets a page draw its
   own notation in the say line and tiles. Plans cover D1 92%, D2–D5 100%, D6 50%
   of generators; left: D1 everyday names, D6 BODMAS (gabung), two D6 problems.
   Offer after 3 misses (2 for a 3-choice pick, 1 for a 2-choice pick); the
   board replaces the widget, the round ends without stars, the next is the same
   kind. DEV sheet: 16 "Cuba Jom tengok cara" buttons. Test API
   `__kekGen.planFor/showNormal/current`.
   **Guided facts (3.87.30, next PR after #101).** A fact step in any game's
   "Jom tengok cara" (Gudang, Lombong, Wirayung, Kedai Kek) sends its first pick
   to the brain (see §4.2 "Guided facts"): two guided misses in one sifir = not
   mastered, the Fokus card then opens sifir practice.
   **Pos Peninjau (3.87.31).** `PAWorked.buildList(spec,{final})` 1.10.0: a work
   card for data rounds. `q.wk.lines` = read the chart row by row (`hl` lights
   the row: tally `tr`, pictograph `.prow`, bar `.col` and its label, pie
   legend, table cell all carry `data-r`), then work it out (+, −, ×, ÷ lines
   tagged as guided facts). Tagged: tally read / total / difference / compare,
   pictograph read (★ keys), most, difference, total, key, claim, money; bar
   read, compare, sum / all / difference / high−low, more, target, money; mean
   (table, bar, new member, target), missing mean, median (odd, even), range,
   range change, mode from a table; pie % read / compare / quantity / claim /
   more; D3 pie counts and fractions; D6 pie in degrees (read quantity, total,
   sector angle, compare, missing angle, check 360°). Plans cover D1 69%, D2 88%,
   D3 44%, D4 85%, D5 83%, D6 26%; left: the build rounds (draw tally /
   pictograph / bars, sort cards), D1 classify, D6 chance (kebolehjadian).
   DEV sheet: 17 buttons. Test API `__posGen.planFor/showNormal/current`.
   **Bengkel Ajaib (3.87.32).** `buildList` again, with the tool (ruler, scale,
   cylinder) left in view: unit lines for every measure (split `230 cm = 2 m
   30 cm`, join `2 kg 300 g = 2300 g`, decimals `1.25 ℓ = 1250 mL`, ¼ ½ ¾),
   + − × ÷ with units, D6 relations (how many times, then × that). Compare
   rounds (`cmpPick`) build their lines from `q.cmp` (change the big unit, then
   compare). A build round's plan ends at `q.target`; read / pad rounds at
   every field (m and cm). Plans cover D1 67%, D2 40%, D3–D5 100%, D6 94%;
   left: plain tool tasks (measure 7 cm) and estimates. DEV sheet: 13 buttons.
   **Dapur Ramuan (3.87.33).** `buildList`: ratio lines (the multiplier, × it;
   simplest form by the biggest common factor; units made the same first; a
   share from the total via one part), rate lines (one unit first, then × or ÷),
   compare (cross-multiply, or the price of one), map scale and costs. The
   cauldron (`mix` fix) ends at `need.v`. Plans cover D4 91%, D5 100%, D6 87%;
   left: "make it bigger" mixes (no single answer) and the true/false claims.
   DEV sheet: 14 buttons.
   **Menara Jam (3.87.34).** Lines are built on the page from the round (`wkSpec()`,
   no generator tags): read the clock (hour hand, minute hand ÷ 5), end / start
   time (hours first, then minutes), elapsed time (to the next whole hour, then
   on), unit changes (× or ÷ by 60, 24, 7, 12, 10, 100), time operations, 24-hour
   (+ 12 after 1 p.m., 00 at midnight) and time zones / flights. The clock stays
   in view. Plans cover D1 44% (calendar left), D2 100%, D3 94%, D4 96%, D5 86%,
   D6 100%. DEV sheet: 8 buttons. Test API `__menaraGen`.
   **Tapak Bina (3.87.35).** Generators carry `wk` (`buildList`): perimeter (one
   length + one width, then double; a missing side by − then ÷ 2; L shapes by
   the hidden side, then (bottom + left) × 2), area (× , ÷ for a missing side,
   L shapes as big − missing), faces / vertices / edges of prisms and pyramids
   counted from the base, distance on a grid and with a scale, D6 polygon
   perimeter and side, interior angles (sum, one angle, difference),
   radius ↔ diameter; compare picks (bigger area, bigger perimeter) end on A or
   B. The figure stays in view, the keypad is hidden. Plans cover D1 0%, D2 8%,
   D3 8%, D4 38%, D5 52%, D6 42%; left: the touch tasks (pick a shape, grid
   points and rectangles, patterns, symmetry lines, protractor, compass),
   which have no sums to walk. No DEV sheet on this page: DEV test API
   `__tapakGen.tryWorked(grade, archetype)`.
   **Where to look (3.87.38, owner 2026-10-24: "aku tak perasan pun 1 × 2 tu. Dan nak letak mana").**
   `PAWorked.run` 1.12.0, all nine mini games:
   - Each step, Wira's line pops and a "?" that stands for a number turns into a pulsing berry
     blank. A sentence-end "?" stays plain, for example "Jadi jawapannya?".
   - The slot the answer goes into pulses berry with a "?" (`.wk-next`).
   - On boards without columns, the numbers of a fact step (a × b) glow gold (`.wk-src`), for example
     "1" and "× 2". Column boards keep their lit column.
   - 1.12.0: when the number is not a board cell, it glows where the pupil can see it: a cell in the
     page's data table or work card (`.wk-look`), or the number inside a work line (`span.wk-lookt`, for
     example "3 kg = **3 000** g"). Steps without a fact glow the numbers Wira names ("Lihat 447 dan 449").
     The hundred grid outlines the full rows, the part row or the empty squares (`step.look`).
   - When nothing on the board takes the answer, the choice buttons pulse (`.wk-pickhere`).
   - A number that is shown nowhere (for example 6 × 100 when changing hours) stays in Wira's line only.
   - A fraction row is shown early, empty, only when it holds the target slot and no visible number
     gives the answer away.
   - A work-card line (lists: Pos, Bengkel, Dapur, Menara) holds its answer, so it stays hidden
     behind a pulsing "?" ghost line.
   - All cues go as soon as the step is answered. Reduced motion keeps them still.
   - `window.__wkStep()` is for tests only. Tests: `audit/worked-cues-browser.test.js`.
   - **Calm and focus (3.87.48, owner on a phone: "1 page tapi semua scream for attention"; "zoom tunjuk
     cara full screen, tak perlu ada page wira").** `PAWorked` 1.13.0:
     - Only ONE thing moves: the answer place (`.wk-next`), or the choices when the board has no slot
       (`.wk-pickhere`). Wira's "?" is a still berry pill. Numbers to look at are still and soft
       (gold tint, underline), never pulsing. The trail's target box no longer pulses.
     - A number glows once, nearest first: the board, then the page's own card or table. Inside a grid or
       flex cell the whole cell is marked (a split span broke "100% = RM6.60" into two lines).
     - (Superseded by the card in 3.87.50.) While Wira showed the way, the scene with Wira was hidden. `minigame-panel-fit-v1.js` 1.2.0 stops zooming when the panel would run under the buttons.
     - Choices of 5–6 characters ("RM4.00", "40 sen") use a smaller font (`.wk-mid`).
     - Test: "Focus mode" in `audit/worked-cues-browser.test.js`.
   - **One card (3.87.50, owner: "tak suka view yg tiba tiba screen penuh dan user kena scan apa patut tgk";
     chose "Kad timbul").** `PAWorked.run`/`runChain` 1.15.0 (`withCard`): the page's walkthrough panel
     (Wira's line, board) and its choice row move into ONE card at the bottom over the dimmed game, read top
     to bottom: "Jom tengok cara · Langkah i/n", Wira's line, the board, the choices. The scene is no longer
     hidden (3.87.48's full screen is gone), except Gerai, whose receipt is the question. With the card up,
     each page's panel keeps its question data at the top, above the card, and the numbers still glow there
     (`opt.lookHome`). When the last step is done (or the page removes its panel) the card closes and the
     finished walkthrough is back in the page. `opt.inline` keeps the old in-page layout.
     Test: "Focus card" in `audit/worked-cues-browser.test.js`.
   - **Percent trail reads by itself (3.87.51, owner on the Gerai 50% card: "better tapi still mcm tak
     betul").** `pctOf` boxes carry a name above (`plan.labels`: 100%, 10%, 5%, p%) and hold only the
     amount, so the pupil knows what each "?" is; Wira's lines are shorter ("10% = RM5.80 ÷ 10 = ?");
     a 10% question stops at the 10% box (no "1 × 10%" step). Wira's sentence and its "?" stay on one
     line (the line is a grid; they are wrapped in one span). In the card, choices look like buttons in
     every game. `PAWorked` 1.16.0.
   - **Gerai one-item total in the card (3.87.52, owner: "Ini belum buat?").** A one-item Bayar has no
     board, so it skipped the card. `PAWorked.card(el,opt)` 1.17.0 opens the same card for a page that fills
     it itself: "Langkah 1/1", "Satu barang sahaja: jumlah = harganya, RM2.40.", Faham. The receipt's
     "Jumlah ?" is outlined while the card is up and gets the amount on Faham.
   - **Gerai stuck screen (3.87.49, owner on a phone: "takle tekan apa apa").** A one-item Bayar round has
     no board, so "Jom tengok cara" shows the mode's `answer` text with a Faham card. `val()` called mode
     methods without their mode, `this.sum` threw, and the pupil was left with an empty panel (and, since
     3.87.48, no scene). `val(x,o,owner)` now calls with the mode. Test: "one item to pay".
     Same PR, owner: "cerita hal baki tapi jom cara still tanya jumlah dlm card". The receipt now shows one
     "?" per thing to find, and says which one Wira is finding: a one-item Baki shows Jumlah as the price
     (no "?"); the "?" of the current part is outlined gold (`.now`), later ones fade (`.later`), and a part
     found on the way (the total, the discount) is written into its "?" (`PAWorked.runChain` 1.14.0
     `opt.onPlanDone(k, plan)`).
   - Known, older and DEV only: some "Cuba Jom tengok cara" buttons throw in `makeQ` when the kind
     is not in the current grade (Menara Jam, Pos, Kedai Kek).
   **Wira's bubble (3.87.36).** `js/minigame-wsay-v1.js` (all 9 mini games): Wira's
   speech bubble sits right of his face, up to the scene edge, and steps its
   text down (12 → 11 → 10 px) until it clears the pet's head; hidden during
   "Jom tengok cara" (the steps speak in the panel). Owner: the bubble covered
   Wira's or the pet's face.
2. **Phase 4 is done with 4.7 (all eight lenses).** Next: phase 5
   (consented cloud telemetry for calibration, §7). It needs owner decisions
   first (guardian consent, privacy, which Supabase tables), so ask before
   any code. Smaller leftovers the owner may pick instead: other mini games
   send `rep` (4.1, only Gudang Harta today); more pictures in D4–D6; 4.8 for
   D3 and D6; a speaker in mini games.
   **Phase 5: what already exists (checked 2026-10-24 on the live Supabase
   project "Pahlawan Angka" and in `main`).**
   - Cloud answer log is live. `js/cloud.js` wraps `PATelemetry.response` and
     inserts one row per answer into `public.learning_attempts`: skill, grade,
     correct, used hint, response ms, misconception tag, battle type. About
     6,950 battle rows from 59 children since 2026-08-15. Mini game rounds go
     through the same path (`js/minigame-telemetry-v1.js`), but only 20 rows so
     far, because the newer mini games are not on Netlify yet.
   - Guardian consent is live. A checkbox at log in accepts the Privacy Notice
     and Beta Terms; `public.guardian_consents` (57 rows) stores the version
     (`js/beta-trust-v3.29.0.js`).
   - Not there yet:
     1. The brain's data does not reach the cloud: facets (operation,
        operands), the wrong value, representation (`rep`), wording length,
        and the lens readings.
     2. `supabase/schema/adaptive_learner_telemetry_v1.sql` is a local file
        only ("LOCAL SOURCE ONLY"). `adaptive_question_exposures` and
        `adaptive_interaction_events` do not exist in the live database.
     3. There is no dashboard for tuning thresholds.
     4. The owner should decide whether the current Privacy Notice covers using
        answers to calibrate thresholds, or whether a new consent version is
        needed.
   - So phase 5 is: add the brain fields to the answer log (or apply the
     adaptive tables), then a threshold dashboard.
   - **Built (3.87.37, PR "Phase 5: brain facets in the cloud + Kalibrasi Otak").**
     Owner decisions (2026-10-24):
     - one `facets` jsonb column on `learning_attempts`, not the adaptive tables;
     - keep the wrong answer, numbers only (RM and sen allowed);
     - the current Privacy Notice is enough, so no new consent version;
     - an admin page in the app.

     What was built:
     - `PADiagnostic.cloudFacets()` copies one diagLog record into the cloud. It
       keeps only whitelisted short keys, so there is never any question text.
     - `cloudFacetsAfter()` picks the record that was just written. A retry row
       gets `rt`.
     - `fromCloudRows()` rebuilds the log. For all 7 dummy children,
       `analyze()` on the rebuilt log gives the same findings and evidence as the
       original.
     - `js/cloud.js` sends `facets` with each attempt. If the column is missing,
       it sends the row again without `facets`.
     - Migration `supabase/migrations/20261024_learning_attempts_facets.sql` (already
       applied to the live project on 2026-10-24) adds:
       - the `facets` column, which must be an object of 2 kB or less;
       - `admin_calibration_rows(p_days)`. It is admin only and returns each
         child as a hash (no names), plus a `mine` flag for the admin's own test
         children.
     - `admin/kalibrasi.html` (+ `kalibrasi-core.js`, `kalibrasi.js`; same log in
       as `admin/`):
       - rebuilds each child's log and runs the same `analyze()`;
       - shows children per finding, % of eligible children, high confidence,
         median evidence and an example sentence;
       - has a per-child list and a CSV download.
     - Tests: `audit/cloud-facets.test.js`.

     Next for phase 5:
     - wait until there is real data (the old rows have no facets);
     - then tune each threshold in `analyze()` against this page;
     - later: `rep` from the other 8 mini games, so lens 4.1 sees them. Lens 4.1 `rep` is still sent
     by Gudang Harta only. No mini game has a speaker yet.
   Note on 4.6 as built: the sketch said "per skill", but the evidence is
   pooled across operations (a child chooses among operations, not within
   one skill), and blocked/mixed is read from the answers before, not from
   the screen (see §4.6).
3. Owner style: reply in Bahasa Malaysia, short and plain; one task per
   branch/PR, base `main`; merge only when the owner says so (convention:
   first push a commit marking the PR merged here in §8a, then merge with a
   merge commit); screenshots of the real app help the owner decide
   (Playwright via `audit/lib/browser.js`; mini game pages open standalone on
   localhost with `localStorage.pa_dev_unlocked='1'`; Chromium is at
   `/opt/pw-browsers`). The owner often asks "kau dah semak sendiri?" — run
   the real app before reporting.
   **No clutter (owner, 2026-10-21):** "Aku taknak kat situ serabut dgn info."
   A Kemahiran Fokus card shows one short line (PR #78, `focusCardLine()`),
   so a plan step's `card` label is 3 words or fewer. A finding's parent
   `text` is one plain sentence with at most one score; extra numbers go in
   `evidence`, not on screen. Every new lens follows this.

**Status on GitHub.** Older note; the current status is "Status at a glance" in §8a.
PR #80 (3.87.2, merged): mini game fix, every round now gets its own brain
record (before, the 40-character token cut the round number, so a session
kept one answer). Mini game evidence before 3.87.2 is thin.
Start new work from `main`, one task per branch and PR, base `main`.
GitHub is the test stage; Netlify is production and only the owner deploys it.

**Done**
- Brain (`js/engine/diagnostic-brain-v1.js`): lenses 4.2, 4.3, 4.4, 4.5, retention,
  basic facts, regrouping; latest-N evidence, guesses excluded from bug
  evidence, "Semakin baik" recovery lines, 4×7 explain-away, Wilson guard.
- Portal Restu (`js/rapid-lock-v1.js`), fed by battle, Gembok, Wirayung and all
  nine Fokus mini games (`js/minigame-telemetry-v1.js`).
- Targeted practice generators + plan (`js/engine/diagnostic-targets-v1.js`).
- Worksheet "Disyorkan" uses the plan (~60% targeted, FOKUS tags, Cara Kerja box,
  "Kenapa latihan ini", step-by-step skema), 2.5D canvas graphics
  (`js/worksheet-2p5d-v1.js`).
- v2 D3 visuals no longer print answers (grouping, unit meters, number line order).
- Test suite clean: `node --test audit/*.test.js` → 0 failures (Next item 5).
- Kemahiran Fokus cards follow the brain (Next item 1, PR #67).
- Parent Ringkasan tab at a glance (owner request, 3.86.89, PR #68):
  `js/parent-glance-v1.js` (`PAParentGlance`) builds two cards on top of the
  first parent tab. *Aktiviti 7 hari*: questions in 7 days / today and active
  days (brain log, journey encounters as fallback), then praise first (effort,
  fluent sifir / basic facts, comfortable skills, "semakin baik" for cleared
  bugs). *Perlu dikuatkan*: up to 3 short plan labels ("Menjawab terlalu
  cepat" first when guessing), one note, "Lihat butiran" → Kemahiran tab
  (full Ringkasan Cikgu Dimensi). Replaces the old hero, all-time stats and
  strong/next insight boxes. Tests: `audit/parent-glance.test.js`.

**Next (phase 3 remainder), in this order**
1. ✅ *Done (2026-10-21, 3.86.88, PR #67, merged).* Each brain finding now
   carries `skills` (KSSR skill ids of its evidence, most mistakes first).
   `PATargets.plan()` steps keep `skills`; `PATargets.skillFor(step, gradeSkills)`
   picks the card skill: the evidence skill if it is in the child's grade,
   else the grade's skill for that practice kind (tables → Darab, money sub →
   Tolak wang, ...; word problems in Darjah 3–4 have none, worksheet only).
   `brainFocusSteps()` in `js/guardian-focus.js` puts those cards first
   (`diagnostic: true`, reason = the short practice label `step.card`, e.g.
   "Sifir 3"; the full finding stays in the parent tab's Ringkasan Cikgu
   Dimensi; `brainStep` = the plan step for item 2), merges with an existing card for the same skill, and leaves a
   skill to a money/time check that moved the focus away from it. Menu V2
   tile falls back to the old note when a brain card has no journey answers.
   Tests: `audit/diagnostic-focus-cards.test.js`. Original notes:
   *Kemahiran Fokus cards show brain findings.* `focusPracticeSummary()` in
   `js/guardian-focus.js` builds the 3 cards from mastery + foundation hints.
   Add: when `PADiagnostic.current()` has findings, map them with
   `PATargets.plan()` and put the finding text as the card reason (e.g.
   "Sifir 7 belum dikuasai (3/13 betul)"); keep the old order when there are no
   findings. Done when: dummy children (tools/diagnostic-sim.js) produce the
   expected first card; no change for profiles without findings.
2. ✖ *Replaced (owner decision 2026-10-21).* Kemahiran Fokus cards open the
   mini games (Operasi/Nombor → Gudang Harta, Wang → Gerai Wirayung, Masa →
   Menara Jam, ...), never Gembok, and the owner wants them to stay mini games.
   So targeted practice lives in the mini games (item 3). A Gembok version was
   built and dropped (commit 3b3362f, reverted). Original notes:
   *Gembok uses targeted items.* (A brain card item carries
   `brainStep`; `startFocusChoice(id)` passes only the id today.) `nextQuestion()` in
   `js/engine/production-journey.js` calls `generate(id,…)`. When the run comes
   from a brain-backed Fokus card, serve `PATargets.practice(step,…)` items
   (they already carry facets, choices with bug distractors, hints) for about
   70% of turns, the normal generator for the rest. Done when: telemetry from
   those items flows back (facets survive) and a recovered bug shows
   "Semakin baik".
3. ✅ *Done (2026-10-21, 3.86.90–3.86.93, PR #69, merged), KSSR + Singapore style.*
   `startFocusChoice()` turns the card's `brainStep` into
   `PATargets.miniGameTarget(step)` and hands it to the bridges.
   - Gudang Harta (`focus_target` URL param, read in `gudang-harta.html`):
     7 of 10 rounds (`NORMAL_TURNS` 2, 5, 8 stay normal) drill the target on a
     CPA ladder that starts concrete/pictorial and climbs with the existing
     adapt rule. Sifir: uncang array → "Pecahkan: 5 × t + …" → recall →
     missing factor. Meminjam / kumpul semula: place-value rack → written sum →
     story; every pair needs borrowing/carrying, `zero` borrows through 0.
   - Gerai Wirayung: a money finding narrows the modes (sub → `baki`,
     div → `bahagi`, add → `bayar`); the live money diagnostic reads the same
     first mode (baki → money_change).
   - Telemetry: `PA_MINIGAME_ATTEMPT` may carry `facets` (op, operands, table,
     format; cleaned in `js/minigame-telemetry-v1.js`) and the wrong `value`;
     Gudang Harta also puts one-operator cards in the prompt. So mini game
     answers feed the brain lenses and a cleared bug shows "Semakin baik".
   - Tests: `audit/minigame-targets.test.js`, `audit/minigame-targets-browser.test.js`.
   - Question first (owner request, 3.86.91): in Gudang Harta the question
     panel gets more room than the scene. `css/minigame-question-first-v1.css`
     caps the scene (~30% height, Wira/visitor zoomed in, props kept) and gives
     the panel the rest; `js/minigame-panel-fit-v1.js` enlarges the panel
     content to fill it (`--qz`, 1–1.6, 5% spare). A choice question without a
     picture shows big full-width choices. Wira stands waist-up (about 1.6×
     bigger): his belt (`--belt`, `--aspect` per image) sits at `--waist` (the
     counter top, or the scene edge). All nine mini games link both files
     (3.86.93); each has a small "Question first" style block for its counter
     height and the props that moved out from behind Wira (e.g. cake stand,
     cauldron, basket, shield rack, bubble). Tapak Bina shows 4 picture
     choices as 2×2; Gerai Wirayung lowers its counter on short screens.
   - Not done: bar model (Model Method) for word problems exists in no mini
     game yet (proposed next); basic facts (D1) are not targeted beyond the
     existing make-ten tiers; other games (pecahan, ukuran, ...) take no target.
   Original notes:
   *Mini game targeting.* Gudang Harta takes `focus_limits` (mode + tier range)
   from `js/gudang-harta-router.js`. Add target params, e.g. `focus_tables=7,3`
   for `darab` and "borrow only" for `tolak`, read them in `gudang-harta.html`
   `makeQ()`. Other games: only where a finding maps to them (money → Gerai
   Wirayung). Done when: a round for a "sifir 7" finding is ≥70% sifir 7.
4. ✅ *Done (2026-10-21, 3.86.94, PR #70, merged).* `js/engine/diagnostic-recheck-v1.js`
   (`PARecheck`). Opening a brain-backed Fokus card calls `PARecheck.start()`,
   which stores only `db.diagRecheckV1.starts[key] = {at, step}` (key from
   the target: `tables:3,7`, `facts:sub20`, `regroup:sub`, `money:sub`,
   `units`; word problems and operation choice are not re-checked). Every
   state is derived from `db.diagLog` (non-rapid answers that practise the
   target): *practising* until 8 answers → *waiting* 2 days → *due* until 6
   answers after the due time, from any source → 5/6 right on the first try
   = *passed* ("Semakin baik", shown 7 days, then *settled*), else back to
   practising (round 2, ...). Cards in `js/guardian-focus.js`: waiting
   "Sifir 3 · Semakan semula lusa" (below other brain cards), due
   "Semakan semula: Sifir 3" (first card; the game gets `check: true`),
   passed "Semakin baik: Sifir 3 (5/6)" (below the open focus). The stored
   step keeps waiting/due/passed cards alive after the brain drops the
   finding. Gudang Harta `check`: target on every other round, starting at
   the abstract step (recall / written), no picture scaffold. Gerai Wirayung
   ignores `check` (narrowed money mode only). Tests:
   `audit/diagnostic-recheck.test.js`, check mode in
   `audit/minigame-targets-browser.test.js`. Original notes:
   *Re-check loop.* After a targeted set, schedule a short mixed check 2–3 days
   later (spaced, lens 4.7) and let the card show "Semakin baik" or keep the
   focus.

5. ✅ *Done (2026-10-21, PR #66, merged): the 12 known failing
   tests are fixed; `node --test audit/*.test.js` → 158 pass, 0 fail.* What
   changed: `audit/lib/browser.js` resolves `playwright` normally and takes
   the browser from `PA_BROWSER_PATH`, then `$PLAYWRIGHT_BROWSERS_PATH/chromium`,
   then the old path; `audit/lib/segel-close.js` gives both page-lock tests the
   real `closeSegelDemo` slice with `guestCompleted`, `$` and
   `setDoneBackLabel`; the demo harness includes `markWrongAnswer`; stubs and
   expectations follow the current app (SVG padlock with `data-lock-state`,
   typed retry keeps the wrong answer selected, WebP avatars, full pricing
   overlay). No app code changed. Original notes:
   They are test problems, not app bugs, but they hide real breakage:
   - Environment paths: `audit/affiliate-admin-browser.test.js` requires
     Playwright from a Codex cache path; `audit/page-lock-v1.test.js` launches
     `/usr/bin/chromium`. Resolve `playwright` normally and take the browser
     from `PLAYWRIGHT_BROWSERS_PATH` / an env var, with the old path as fallback.
   - Stale harness after the guest demo work (#53/#54):
     `audit/demo-session-behaviour.test.js` (6 tests, `markWrongAnswer is not
     defined`) and `audit/page-lock-demo-exit.test.js` (`guestCompleted is not
     defined`) copy slices of `js/segel-demo-v2.1.0.js`; include the new helper
     and state in the slice.
   - Old screen stubs: `audit/commercial-production-access.test.js`
     ("pricing presents Plus then standard then Free" — stub needs
     `addEventListener`; "Free and RM19 focus entry cannot open the picker" —
     `Cannot set properties of undefined`) and `audit/onboarding-review.test.js`
     ("step four keeps the selected avatar…", cause not checked yet).
   Done when `node --test audit/*.test.js` has 0 failures, without weakening
   what each test checks.

**Question bank check (2026-10-21, 3.86.96, PR #72, merged; owner request before 4.8).** 150
questions per skill for all 117 D1–D6 skills in the real app: no broken text,
no repeated choice. Repaired: "tidak pasti"/"tidak tahu" filler choices in
D1–D2 (D2 ukuran now compares three things; D1 betul/salah items carry a
short reason, e.g. "salah, sepatutnya 60"; tenths use 0.0n as the real slip),
an "8 lebih banyak daripada 8" claim, D2.5.2 time units (back conversion and
"1 jam 15 minit"), D2 3D shapes (count faces / tepi / bucu), D2 2D (total
sides), D5 Peratus (any multiple of 5). Guard: `audit/question-bank-choices.test.js`.
Still open: few pictures in D4–D6 (13–18%) for lens 4.1. Done since: tags for
"Kemungkinan punca" (were D1 65%, D6 70%, D2 9%, D5 11%, D3–D4 0%; now D2 89%,
D3 80%, D4 91%, D5 94% in 3.87.0, see below); short/long wording pairs (lens
4.8, 3.86.99, as separate pair items).

**"Kemungkinan punca" tags for D2–D5 (3.87.0, PR #76, merged; owner order after 4.8).**
The Kemahiran Fokus card shows "Kemungkinan punca: …" when
`PAFocusFoundationV1.evaluate()` (`js/engine/focus-foundation-v1.js`) finds one
foundation failing in ≥3 questions across ≥2 topics while the same topics'
other questions go well (rules in that file). It reads only authored
`focusDiagnosticV1` tags stored on learner-review encounters, and D2–D5 had
almost none. `questions/focus-tags-d2-d5-v1.js` (`PAFocusTagsD2D5`) now tags
every live D2–D5 archetype (like the D6 runtime): `SHARED` by archetype name
(the D3 question system reuses names across skills; the short/long wording
items of D3–D6), `BY_SKILL` where a name means different things per skill
(`depth_story`). Entry = [domain, operations, foundations, concepts], ids
from `data/focus-v2/foundation-map-v1.json`. `generate()` calls it after the
D1/D6 taggers. Deliberately untagged (`ABSTAIN`): shapes, position and
coordinates (no foundation in the map), estimating a set against a reference,
percent notation words, currency names and needs/wants judgements. Where the
generator knows the numbers, the tag is exact (`attachAddSubFocusTag`):
D2.2.1/D2.2.2 integrity sums and D4 Tambah/Tolak bentuk lazim and three-step,
so `add.regroup` / `sub.regroup` appear only when the sum needs carrying or
borrowing. Also fixed: the D2.4.1 money tag used `money.denomination` (not in
the map, so the finder ignored it) → `money.denominations`; short/long wording
items now carry their own `competencyId`, so written arithmetic no longer
swaps them for a bentuk lazim card. Coverage (all D2–D5 questions, abstain
topics included): D2 89%, D3 80%, D4 91%, D5 94%. Tests:
`audit/focus-tags-d2-d5.test.js` (contract per question, no silent gaps, exact
regrouping, Darjah 4 place value → "Kemungkinan punca: Nilai tempat nombor" on
the card, Darjah 3 stories → "Memilih operasi daripada cerita", no cause when
everything fails or only one topic fails). The finder's thresholds are
unchanged (design values, phase 5 calibrates).

*How it works, as explained to the owner (2026-10-21, with real-app screenshots).*
- Where it shows (owner: "taknak serabut", 3.87.1): the Kemahiran Fokus card
  (home → "Kemahiran Fokus" tile, Family Plus) has ONE short line under the
  title: "Punca: Nilai tempat" (`PAFocusFoundationV1.SHORT`, ≤3 words), else
  "Ketepatan 20%", or the brain card label ("Sifir 3"). Money/time checks say
  "Punca: soalan wang / operasi asas / baca jam / unit masa / tempoh masa";
  their long sentence stays in `item.reason` and is not shown
  (`focusCardLine()` in `js/guardian-focus.js`). Parents get one sentence in
  the Ringkasan "Perlu dikuatkan" card, only when it lists something:
  "Punca utama: Nilai tempat nombor." before the usual note
  (`PAParentGlance.compose({cause})`, `parentGlanceMarkup()` in `js/parent.js`).
- Step 1: every question carries the foundations it tests. Example, Darjah 4:
  "Apakah nilai digit … 405 6 7?" (Nilai tempat), "Bundarkan 36 651 kepada
  1 000 terdekat" (Nilai tempat), "Bundarkan 357 kepada ratus terdekat,
  kemudian anggarkan hasil darab dengan 3" (Nilai tempat + Fakta sifir), but
  "278 × 4" (Fakta sifir + Darab lebih satu digit, no place value).
- Step 2: the finder compares the child's first tries. Dummy child Danial: 42
  of 53 place-value questions wrong (79%) across 3 topics, while the other
  questions in the same topics were 5% wrong (19 questions). Plain
  multiplication right, the rounding-then-multiply item wrong → the cause is
  place value, not multiplication.
- Step 3: the two weakest Fokus cards (Nombor hingga 100,000; Nilai tempat
  hingga 100,000) show "Kemungkinan punca: Nilai tempat nombor". Order, marks
  and routing do not change; it only explains.
- It shows when one foundation is wrong in ≥3 questions, in ≥2 topics and ≥2
  question kinds, wrong ≥50% of the time, and ≥30 points more often than the
  other questions of those topics (`RULES` in `js/engine/focus-foundation-v1.js`,
  latest 150 tagged answers of the child's grade, demo answers ignored). It
  does not show when the child gets almost everything wrong (no contrast),
  when it is one topic only, or after 1–2 slips.
- Reproduce the screenshots: serve the repo, open `index.html` in Playwright
  (`audit/lib/browser.js`), stub `PACommercial`, set a Darjah 4 `db`, play
  ~150 generated D4 questions through `PALearnerReview.beginQuestion/resolve`
  with place-value items mostly wrong, then `renderHub()` and
  `PAFocusPractice.open()` (same steps as the scenarios in
  `audit/focus-tags-d2-d5.test.js`).

**Phase 4 (started 2026-10-21)**
- ✅ Lens 4.1 Representation (CPA), 3.86.95, PR #71, merged: see §4.1
  "Implemented". Not done: other mini games do not send `rep` yet (only
  Gudang Harta), and only Gudang Harta fades pictures; thresholds are the
  §4.1 defaults, not calibrated on real children (phase 5).
- ✅ Bar model (Model Method) for word problems, 3.86.97, PR #73, merged. The
  4.4 finding `format_word` → plan step `word` → `PATargets.miniGameTarget` →
  `{kind:'bar'}` → Gudang Harta (`focus_target`): 7 of 10 rounds in any
  operation mode (tambah, tolak, darab, bahagi, gabung, masalah) are word
  problems on a CPA ladder: `target_bar_read` (story + bar model, type the
  answer) → `target_bar_sentence` (story + bar, choose the number sentence;
  wrong ones are the wrong operation / the reversed order) →
  `target_bar_story` (story alone; the hint says how to draw the bar).
  Schemas per mode: tambah = jumlah (part-whole) / lebih daripada (compare
  more); tolak = cari bahagian / beza (compare less); darab = kali ganda;
  bahagi = agih sama rata; gabung/masalah = all. Rows share one scale (one
  fixed name column, bar widths `calc((100% − 5px) × ratio + 5px)`, dividers
  as inset shadows), numbers kept within a ratio so equal amounts look equal;
  style = Gudang palette (gold / ice segments, berry hatching for "?", gold
  brace pill). `.bm` min-width 270px so the panel auto-fit stops before
  labels clip. Telemetry: bar rounds `format:'visual'`, `rep:'pictorial'`;
  story rounds `format:'word'`, `rep:'abstract'` (so only the unaided story
  counts as word-problem evidence for 4.4). Re-check key `word` (answers with
  `f === 'word'`); a due re-check is the story alone. Tests: model bar test in
  `audit/minigame-targets-browser.test.js` (ladder, answers, right sentence,
  one scale ±2.5 px, no clipped label, no sideways scroll at 360 px).
  Found while testing: inside the app the mini game frame is the screen minus
  the "Kembali" bar and the status line, so on short phones buttons sat below
  the frame (no scroll). ✅ Fixed in 3.86.98 (owner request, PR #74, merged):
  `css/minigame-question-first-v1.css` lets every mini game scroll when the
  content is taller than the frame and pins the "Tanya Wira / Semak" row to
  the bottom (sticky, solid backing, no extra padding); the answer keys and
  the action row never shrink, so the panel auto-fit only uses free room; the
  scene is shorter below 620 px (a 1366×768 laptop gives the frame ~568 px); the three bridges (mini games, Tapak Bina, Gerai Wirayung)
  use a compact "Kembali" bar and status line below 700 px. Before: 7 of 9
  games had controls out of reach at 320–375 px, two even at 390 px. Test:
  "small phones" in `audit/minigame-targets-browser.test.js` (all nine games
  at 320×500 and 360×575).
  Web (owner: "gambar wira kena potong"): on a wide but short frame
  (`min-width:440px` and `max-height:760px`) the number keypad is one row of
  11 keys (1–0, ⌫) and the scene gets `clamp(130px,28dvh,210px)`; at
  1366×768 the scene grows from 97 px to 159 px. Phones keep two rows;
  typing on the keyboard works in the six keypad games. Sweep: 9 games ×
  10 sizes (320×500 … 1920×960), no control out of reach.
- ✅ Light lens 4.8 (language load), 3.86.99, PR #75, merged: see §4.8 "Implemented".
- ✅ Lens 4.6 Strategy choice (interleaving), 3.87.3, PR #81, merged: see §4.6
  "Implemented". Thresholds are the §4.6 defaults (phase 5 calibrates).
- ✅ Lens 4.7 Retention (full) + spaced review queue, 3.87.5, PR #82, merged:
  see §4.7 "Implemented". Phase 4 has all eight lenses now.
- Owner decision (2026-10-21): after the bar model, a light 4.8 (short/long pairs only for the common
  word-problem families in D3–D6, plus a read-aloud-then-right signal), then
  "Kemungkinan punca" tags for D2–D5. 4.6 and full 4.7 after that.
  4.8 research: Abedi et al. (CRESST 1998, 2001) linguistic modification;
  Daroczy et al. (2015) review; read-aloud effects on maths are small
  (Elbaum 2007; Buzick & Stone 2014). The 80% / 50% thresholds are a design
  guess until phase 5 data.

**Then** phase 5 (consented cloud telemetry), see §7.

**Not done / owner tasks**
- Real-device test (iPhone/Android): Portal Restu video and PIN, mini game
  telemetry, worksheet PDF download, and the new mini game layout (only the
  first screen of each game was checked; other question kinds rely on the
  panel auto-fit).
- Owner checks the "3 fast wrong answers → lock" rule feels fair for Darjah 1.

**How to verify your change**
- `node --test audit/diagnostic-*.test.js audit/minigame-telemetry.test.js audit/rapid-lock.test.js`
- `node --test audit/*.test.js` → must be 0 failures (Next item 5 cleared the
  old 12). The two browser tests need Playwright; set `PA_BROWSER_PATH` if
  your Chromium/Edge is not found automatically.
- `node questions/v2/build/build.js --check` after touching `questions/v2/`
  (rebuild with `node questions/v2/build/build.js`).
- Re-check loop without waiting 2 days: `tools/recheck-lab.html` (same site as the
  app; edits the saved profile, keeps a copy, "Pulihkan profil asal" restores it).
- Dummy children: `tools/diagnostic-sim-lab.html`; 2.5D graphics:
  `tools/worksheet-2p5d-lab.html`; Portal Restu: `tools/rapid-lock-lab.html`
  (serve the repo root, open in a browser).
- Bump `js/version.js` and the `?v=` of every changed script in `index.html`;
  add new scripts to `APP_SHELL` in `sw.js`.

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
