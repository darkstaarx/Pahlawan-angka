# Cikgu Dimensi — six mini-games, local review candidate

Verified base (git fetch origin main, 2026-08-30):
`211d3d8793296921de99ad236cd3dd567720caeb` / application 3.56.3.
No commit, push, account mutation or deployment was performed.
The earlier unpushed Sidma Time Lab changes are preserved and included.

## Implemented, not mockups

| Activity | Fixed hero | Model-strategy entry | Interaction and completion |
|---|---|---|---|
| Dapur Wira | Wira | D2.3.1 | Equal/unequal cuts; distribute 4 pieces; reject unequal sizes or shares; subdivide quarters into eighths; recall without model |
| Jambatan Sepuluh | Wira | D1.ADD20, D1.ADD100, D2.2.1 | Move/undo boards; explicitly make ten from 8+5; reject overshoot; recall on 9+4 |
| Kem Bekalan | Sidma | D2.2.4 | Share 12 among 3; then group 12 in threes; distinguish unit of answer; independent 15-in-threes check |
| Kebun Susunan | Bunga | D2.2.3 | Build 4x6 array; decompose 5+1 columns; rotate to 6x4; independent distributive-property check |
| Pasar Baki | Sidma | D2.4.3 | Count up RM7→RM10 using RM1/RM2; undo overshoot; independent RM8→RM12 check |
| Gerbang Simetri | Bunga | D3.SHAPE only when original prompt mentions simetri | Test vertical/horizontal/diagonal folds of non-square rectangle; rotate; require two valid axes |

All scenarios explicitly say CONTOH LATIHAN; they do not pretend to reproduce
the original generated question. The make-ten example is a simpler conceptual
bridge, not a full three-digit regrouping lesson. This release does not claim
all Year 1–6 topics have mini-games. Unsupported skills keep existing teaching.

## Research decisions preserved

- One fixed hero per activity, no new complex art; existing idle/anticipation
  images reused with scoped CSS gestures. Mathematical objects are SVG/HTML.
- Concrete/virtual action → linked representation/symbol → model-hidden recall.
- One focal concept at a time. No timer, HP penalty or reward in the mini-game.
- Reject unequal shares, wrong array structure, overshoots and invalid folds.
- Keep original contrast/micro strategy fallback, triggers and prerequisites.
- Stage 2 recall does not save mastery. Existing stages 3–4 remain responsible
  for their ordinary independent checkpoint/transfer and downstream completion.
- No new diagnostic claims or child telemetry. Delayed retention and meaningful
  intervention comparison must be validated through the existing larger system;
  completing these games alone is not proof of efficacy or a proven moat.

## QA actually performed

Commands (repository root):

```
node --check js/cikgu-mini-games-v1.0.0.js
node --check js/dev-coach-games-v1.0.0.js
node --check js/cikgu-manipulatives-v3.19.1.js
node --check js/pwa.js
node --check sw.js
node audit/coach-games-v1.js
node audit/dev-coach-games-v1.js
node audit/time-hero-lab-v1.js
node audit/cikgu-manipulatives-runtime-v3.19.1.js
node audit/cikgu-manipulatives-v3.19.1.js
node audit/time-coach-pdf-v3.56.3.js
node audit/adaptive-coach-v3.8.24.js
node audit/demo-mode-v3.56.0.js
git diff --check
```

Results: 64,130 checks for the six games (deterministic reducer fuzzing,
conservation, exact solutions/wrong paths, scoped mapping, actual wrapper/event
dispatch, reset and re-entry); Time Lab 14,405; time/coach/PDF 1,616;
Dev launcher 28; adaptive coach 13; demo 19; both existing manipulatives audits pass.
Counts are assertions, not numbers of pupils, questions or browser sessions.

Real Chromium with a 390x844 iframe (375px content width after scrollbar):
Dapur Wira cut → distribute to four pets → quarters/eighths → hide model →
recall 1/4 was exercised with UI clicks. No captured page error, no horizontal
overflow (clientWidth=scrollWidth=375). The fixture uses real shipped teaching
functions with a synthetic host and does NOT exercise authenticated gameplay.

Visual finding: Wira's attack image contained blue combat FX. The final source
uses anticipation instead; that image-switch correction is statically checked,
but was not rechecked visually in the bounded browser pass. Browser startup
snapshot was taken before fixture initialization completed; selecting Dapur Wira
started the test. Screenshots included are evidence, not polished mockups.

Dev launcher was then tested separately in Chromium: all six named buttons
appeared under `Mini-game Cikgu Dimensi`; Jambatan Sepuluh opened in a native
modal, accepted two board moves and validated 8 + 5 = 10 + 3 = 13; closing it
and immediately opening Dapur Wira left exactly one visible modal. The launcher
does not call battle, save, reward or account code and is unavailable unless
the existing Dev Mode gate is active.

Outstanding: visual/UI completion of the other five activities; final pose
recheck; real-account exit/return-to-battle; reduced-motion device preference;
offline/update lifecycle; whole-app A–H suite. Do not mark these as passed.

An extra legacy audit `audit/version-sync.js` fails expecting 3.24.0. It is
unchanged from the base. Do not weaken it or claim every repository audit passes.

## Existing-code observation (not changed)

`renderLearningCheckpoint` in js/learning.js has a legacy stage-3 divide-mode
question about cutting one stone in half. This patch preserves it rather than
silently changing question/checkpoint semantics. Review separately before claiming
the whole division learning flow tests equal-group understanding end-to-end.

## Cache / deployment

The app version remains 3.56.3 for this local candidate. pwa.js uses a new
coach-games-2 query; the mini-game core/CSS use a dev-menu cache suffix and the
Dev launcher uses a 1.0.0 path; SW cache has a coach-games-2 suffix. New modules,
CSS and the earlier Sidma time pose are
precached. Both document.write and post-load branches load games AFTER the
existing manipulatives; the Dev launcher loads only after the mini-game core.
Assign a final application release version and update its relevant audits during
approved release preparation. No claim that current live Pages serves this patch.

## Reviewer workflow

1. Fetch current main and report full SHA. Stop on base drift; preserve local work.
2. Read the complete diff, this file and TIME-HERO-LAB.md before applying.
3. Verify manifest before/after SHA256 per file. Apply only to a clean matching base.
4. Run required QA above. Do not modify tests just to force green results.
5. In the actual app, enable existing Dev Mode, open the Dev panel and use the
   `Mini-game Cikgu Dimensi` section. It contains six isolated preview buttons.
6. Also verify normal Learning Camp entry with an appropriate
   skill and model strategy. Do not add an auth bypass or alter intervention triggers.
7. Report remaining findings and obtain approval before commit/push/deploy.

Protected code unchanged: questions/, js/learning.js, js/battle.js, js/cloud.js,
js/engine/, js/progression.js, pricing, parent dashboard and hero definitions.
