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
| 4 (4.1 ✅, 4.6 ✅, light 4.8 ✅, rest open) | Lenses 4.1, 4.6, 4.7, 4.8 (need item variants: pictorial/abstract pairs, reading levels, mixed sets) | Each lens has tests + calibrated thresholds |
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

Last updated: 2026-10-21 (main merged into PR #78; PR #78 open, owner said do NOT merge yet). Read this section first if you are picking up the work.

**Start here (next agent).**
1. Merged into `main`: PRs #69–#77. #69 Next item 3 + question-first mini
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
   **Open: PR #78 short Fokus card line + "Punca utama" for parents (3.87.4
   after `main` was merged in; it was 3.87.1), branch `ccr-ed8f705d-ym2tc0`,
   NOT merged. The owner said "jangan merge" for now; merge only when the
   owner asks again.** What it does (owner: "taknak serabut" for the child or
   the parent): each Fokus card has one short line ("Punca: Nilai tempat",
   else "Ketepatan N%" or the brain label; money/time checks "Punca: soalan
   wang / baca jam / ..."), and the parent Ringkasan "Perlu dikuatkan" card
   adds one sentence "Punca utama: Nilai tempat nombor." (details under "How
   it works" below). If main moved before the merge: merge main into the
   branch, re-run `node --test audit/*.test.js`, then follow the merge
   convention in item 3.
2. **Next task: full lens 4.7 (retention), the last lens of phase 4.** Ask
   the owner before starting. Today 4.7 covers only sifir and basic facts
   (mastered earlier, slipping in the last 3 days). Full 4.7 (§4.7): per skill
   (≥2 reversals after ≥3 days: right in a past session, wrong now), feeding a
   1/3/7/14-day review queue (reuse `daily-spaced-review`), with a re-check
   like the other targets. After 4.7: phase 5 (consented cloud telemetry, §7),
   which needs owner decisions (consent, privacy, Supabase) first.
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
   A Kemahiran Fokus card shows one short line (PR #78 `focusCardLine()`, open),
   so a plan step's `card` label is 3 words or fewer. A finding's parent
   `text` is one plain sentence with at most one score; extra numbers go in
   `evidence`, not on screen. Every new lens follows this.

**Status on GitHub.** PRs #55–#63 and #65–#77 are merged into `main`
(2026-10-21) but NOT deployed to Netlify yet; the owner deploys after a
real-device test.
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
