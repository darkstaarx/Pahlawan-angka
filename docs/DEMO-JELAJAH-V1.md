# Demo Jelajah V1 — final brief implementation

Branch: `codex/demo-jelajah-v1`; production base `3bee537`.
The user's final implementation brief supersedes the earlier tour prototype.
**Netlify production has NOT been deployed.** A draft development deployment
may be used for phone review; it does not replace the production site.

## Run locally

Phone review: [open the draft preview](https://6ae16a4a2768e3b827eaa948--pahlawanangka.netlify.app/demo-jelajah.html).
This unique development deployment is separate from the unchanged production URL.

```powershell
node tools/build-jelajah-preview.cjs
node tools/serve-jelajah-preview.cjs
```

Open <http://127.0.0.1:4173/demo-jelajah.html>. Root demo query aliases and the
original embedded/standalone landing CTA enter this grade selector on the local
preview server. `index.html` and production landing scripts are unchanged.

## The playable flow

Select Darjah 1–6 to enter the original Segel interface. The four compact
navigation cards sit above it; the actual battlefield/question layout is retained.
Questions 1–6 use the real correct/wrong feedback, hints, written-answer controls
where supported, and original guest retry behavior. A wrong answer can be retried.

After question 6, the visitor explicitly selects **Mulakan Autopilot**. Questions
7–12 show a preset sequence: repeated mistakes, follow-up variation, a simpler
visual scaffold using the existing Cikgu model, then recovery. The subtle simulation
label and advance button remain visible. Inputs are inert while autopilot runs,
including written arithmetic forms. The bridge fills those forms and submits them
through their existing validation rather than painting fake answer text.

The canonical Wira/Aurora strike, seal progression and rescue finish the mission.
The three remaining cards unlock. Completed cards show **✓ Selesai**, grey out,
and remain replayable. Replaying battle retains unlocked cards for that grade.
Changing grade, refresh or leaving the page resets this temporary guest tour.

## Real production activities

| Darjah | Preset skill | Actual mini-game | Scope |
| --- | --- | --- | --- |
| 1 | Puluh dan sa (`D1.PV100`) | Gudang Harta Wira | `d1-bina@2`, place-value stages 2–3 |
| 2 | Addition with regrouping (`D2.2.1`) | Gudang Harta Wira | `d2-tambah@0`, regroup-add target |
| 3 | Equivalent fractions (`D3.FRAC`) | Kedai Kek | `d3-setara@0` |
| 4 | Length conversion (`D4.MEASURE`) | Bengkel Ajaib | `d4-panjang@2`, stages 2–3 (m/cm) |
| 5 | Decimals (`D5.DEC`) | Lombong Permata | `d5-perpuluhan@0` |
| 6 | Ratios (`D6.RATIO`) | Dapur Ramuan | `d6-nisbah@0` |

The mapping follows the existing game routers/generators. D3 is narrowed to
equivalent fractions, and D4 to length conversion, so the battle, game and coach
teach the same relationship. These are predefined scenarios, not real diagnosis.

The mini-game card opens isolated copies of the **actual production HTML pages**,
with original art, tools, keypad, tasks and success animation. Two distinct successful
rounds complete the short demo. A narrow current-frame/nonce/skill registry permits
only this scoped preview launch; no subscription entitlement is changed.

Cikgu Dimensi opens the **existing Learning Camp DOM and renderer**, including
Faham → Bina → Sambung → Cuba → Guna, real manipulative interactions, existing
character poses and calm teaching models. Two fresh independent questions do not
appear in battle. Errors trigger a diagnostic question and another representation,
then a separate replacement question. D4's metre bars use equal centimetre segments;
fractions use a shared number-line point; ratios use a scaling table.

Otak Pahlawan explicitly says:
“Contoh laporan berdasarkan simulasi demo. Ini bukan penilaian sebenar anak anda.”
It separates six manual session answers from the preset script, explains the
related game and Cikgu support, and gives an illustrative recommendation. It does
not manufacture mastery percentages or diagnose the visitor.

## Registration and pricing

The compact bottom-right **Daftar / Beli** pill is always present. It expands into
Daftar Percuma / Lihat Pakej, collapses on gameplay interaction, respects safe areas,
and occupies a reserved compact strip outside game controls. The original registration
and current pricing flow open in an in-app modal. Closing it preserves the live game
iframe and temporary tour state. No payment/account creation was submitted in tests.

## Isolation and unchanged production boundaries

- Battle/coach storage is replaced with in-memory storage before game code loads.
- Cloud, academic tracking, commercial, entry and sync scripts are omitted from
  the isolated gameplay runtime. Writes and external fetch/XHR are blocked; beacon
  and real service-worker registration are disabled there.
- Mini-game events are consumed only by the scoped demo bridge; no learner-review,
  mastery, reward, frontier, entitlement or quota write occurs.
- Production `PACommercial`, feature gates, app entry, paid mini-game pages,
  curriculum, assets and adaptive engine remain unchanged.
- Small Segel hooks require explicit guest Jelajah mode and exclude production runs.
- Stale frames/messages cannot complete the current activity. Timers die when the
  iframe is removed. Double submissions are blocked by existing run locks.

## Verification and limits

`audit/jelajah-final-browser.cjs` exercises the real WebGL battle for all grades:
manual wrong-answer retry, twelve resolved questions, explicit autopilot start,
Escape handling, exact scripted outcomes, original Learning Camp interactions,
diagnostic/replacement checks, labelled analysis and preserved learner-storage sentinel.
Mobile viewports: 390×844, with Darjah 6 at 320×844. No physical phone test is claimed.

`audit/jelajah-real-games-browser.cjs` tests actual production mini-game rounds.
`audit/jelajah-v1.test.cjs` validates scenario contracts, isolation and production gates.
`audit/jelajah-minigame-v2.test.cjs` validates scoped game mapping/build contracts.
Existing commercial, demo-session, funnel and page-lock regression tests are retained.

Independent code review and **Dimensi validation: PASS** after correcting the
autopilot cancel/input paths and mathematical proportions in alternate models.

Final validation: all six 12-question battle/coach runs passed, including written
arithmetic entry, one wrong manual answer/retry, explicit start, diagnostic support
and replacement checks. All six real mini-games passed two distinct successful
rounds through their original UI/validation. The in-app current-price modal opened
and closed while preserving the tour. Unit/regression counts and the phone preview
URL are recorded in `review/jelajah-final-verification.md`.

The older `audit/coach-games-v1.js` still has a pre-existing text mismatch: it
expects `4 pet` while the unchanged production reducer says `4 Teman`. This branch
does not modify that game or old audit. Report new browser results independently.

## Main changed files

- `js/jelajah-scenarios-v1.js`: six separate fixed scenario packages.
- `js/jelajah-battle-bridge-v1.js`: scoped stage/autopilot adapter.
- `js/segel-demo-v2.1.0.js`: guarded guest hooks, preserving manual retries.
- `js/jelajah-minigame-v2.js`, `tools/build-jelajah-minigames.cjs`: real game adapters.
- `js/jelajah-coach-v2.js`: original Learning Camp adapter.
- `demo-jelajah.html`, `js/jelajah-v1.js`, scoped CSS: navigation/state/CTA.
- Build/server/package tools and focused browser/unit audits.

No unrelated redesign, curriculum overhaul, marketing change or production release.
