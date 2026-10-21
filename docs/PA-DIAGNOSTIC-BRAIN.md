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
- Targeted practice + worksheet composer: `js/engine/diagnostic-targets-v1.js`
  (`PATargets`, incl. `skillFor` for Kemahiran Fokus cards in
  `js/guardian-focus.js`). Dummy children: `tools/diagnostic-sim.js`, lab
  `tools/diagnostic-sim-lab.html`.
- PIN lock: `js/page-lock-v1.js`.
- Cloud tables (schema only, not yet sent): `supabase/schema/adaptive_learner_telemetry_v1.sql`.

## 8a. Handoff — current status and next work (update this when you finish a step)

Last updated: 2026-10-21. Read this section first if you are picking up the work.

**Status on GitHub.** PRs #55–#63 and #65–#68 are merged into `main`
(2026-10-21) but NOT deployed to Netlify yet; the owner deploys after a
real-device test.
Open: PR #69 (Next item 3, mini games drill the brain finding, 3.86.90),
base `main`, not merged.
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
3. ✅ *Done (2026-10-21, 3.86.90, PR #69, not merged yet), KSSR + Singapore style.*
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
   - Not done: bar model (Model Method) for word problems exists in no mini
     game yet (proposed next); basic facts (D1) are not targeted beyond the
     existing make-ten tiers; other games (pecahan, ukuran, ...) take no target.
   Original notes:
   *Mini game targeting.* Gudang Harta takes `focus_limits` (mode + tier range)
   from `js/gudang-harta-router.js`. Add target params, e.g. `focus_tables=7,3`
   for `darab` and "borrow only" for `tolak`, read them in `gudang-harta.html`
   `makeQ()`. Other games: only where a finding maps to them (money → Gerai
   Wirayung). Done when: a round for a "sifir 7" finding is ≥70% sifir 7.
4. *Re-check loop.* After a targeted set, schedule a short mixed check 2–3 days
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

**Then** phase 4 (lenses 4.1, 4.6, 4.7 full, 4.8 — need item variants) and
phase 5 (consented cloud telemetry), see §7.

**Not done / owner tasks**
- Real-device test (iPhone/Android): Portal Restu video and PIN, mini game
  telemetry, worksheet PDF download.
- Owner checks the "3 fast wrong answers → lock" rule feels fair for Darjah 1.

**How to verify your change**
- `node --test audit/diagnostic-*.test.js audit/minigame-telemetry.test.js audit/rapid-lock.test.js`
- `node --test audit/*.test.js` → must be 0 failures (Next item 5 cleared the
  old 12). The two browser tests need Playwright; set `PA_BROWSER_PATH` if
  your Chromium/Edge is not found automatically.
- `node questions/v2/build/build.js --check` after touching `questions/v2/`
  (rebuild with `node questions/v2/build/build.js`).
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
