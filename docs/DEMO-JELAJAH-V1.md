# Demo Jelajah V1 — development preview

Base: `origin/main` at `3bee537`. Branch: `codex/demo-jelajah-v1`.
Production has **not** been deployed. No production entry, commercial gate,
payment handler, database schema or curriculum/mastery engine was changed.

## Preview

From this checkout:

```powershell
node tools/build-jelajah-preview.cjs
node tools/serve-jelajah-preview.cjs
```

Open <http://127.0.0.1:4173/demo-jelajah.html>. This is a local development URL.
The server binds only to localhost. Stop its process to end the preview.

Local landing-entry fix (28 October 2026): the preview server redirects both
`/?landing_action=demo` and `/index.html?landing_action=demo` to this tour.
When serving `/index.html`, it injects a preview-only listener for the original
embedded landing CTA. No production landing or entry script is edited.
`node audit/jelajah-landing-entry.cjs` passed both query aliases, standalone and
embedded landing button clicks, and the real first battlefield question.

The build derives `jelajah-runtime.html` and `jelajah-offer.html` from the real
`index.html`. Rebuild after updating that source. The production entry remains
unchanged. Do not use `--prod`, merge or release without owner approval.

## What to try

1. Select Darjah 1–6. Other cards initially require a completed battle.
2. Answer questions 1–6 yourself; each answer resolves one question, including
   an incorrect answer. This preview deliberately uses fixed examples.
3. Questions 7–12 run automatically with the fixed pattern
   wrong, wrong, wrong, correct, wrong, correct. Questions 9–10 show a smaller
   preset scaffold after repeated errors. The simulation label stays visible.
4. After the real Wira/Aurora rescue animation, all remaining cards unlock.
5. Play the original interactive mini-game and Cikgu Dimensi models. Both use
   the selected scenario below. Each requires a separate model-free question.
   A wrong response triggers a diagnostic, another representation/context,
   then a fresh parallel question. Guided completion never claims mastery.
6. Otak Pahlawan explicitly presents sample analysis of the preset script;
   answers to the first six questions do not determine that sample.
7. Completed cards turn grey and remain replayable. Replaying battle preserves
   unlocked cards. Changing grade starts a fresh tour.
8. Expand Daftar / Beli. The footer grows outside the play area, keeping both
   offers available without covering controls. Offers open the existing real
   registration/pricing flow in a separate tab, with its normal access checks.

## Fixed scenarios

| Darjah | Simulated weak topic | Original mini-game |
| --- | --- | --- |
| 1 | Addition: make ten | Jambatan Sepuluh |
| 2 | Division: equal sharing/grouping | Kem Bekalan Sidma |
| 3 | Money: change | Pasar Baki Sidma |
| 4 | Equivalent fractions | Dapur Wira |
| 5 | Multiplication: distribution | Kebun Susunan Bunga |
| 6 | Symmetry and rotation | Gerbang Simetri |

These are deliberately selected **foundation remediation examples**, including
for the later grades. They are not a claim of comprehensive grade coverage,
real adaptive diagnosis, or an estimate of any child's ability.

## Isolation and original assets

- The actual production Gembok WebGL stage, Wira/Aurora assets, question UI,
  strike/rescue animations and existing mini-game reducers/renderers are reused.
- Small Gembok hooks require both explicit guest `jelajah` mode and the preview
  bridge. Production runs are excluded; normal guest retry behavior is retained.
- Before any runtime game script, storage is replaced with in-memory storage.
  Cloud, entry, commercial, telemetry funnel and sync scripts are omitted from
  the battle runtime. Fetch/XHR permit only same-origin reads; beacon and real
  service-worker registration are disabled. No actual learner state is read.
- Parent navigation/completion is memory-only. No demo session writes mastery,
  currency, rewards, paid entitlements, quotas or real learner evidence.
- Messages require the current battle iframe, same origin and selected grade.
  Removing a frame destroys its callbacks; old battles cannot unlock a new tour.
- `sources/` was not edited.

## Verification

Automated Chromium used the real WebGL game at 390×844 for Darjah 1–5 and
320×844 for Darjah 6. `review/jelajah-browser-results.json` records all six
completed 12-question runs, exact autopilot outcomes, original mini-game and
coach interactions, wrong-answer diagnostic/fresh checks, grade reset,
sample analysis, zero network writes and unchanged paid-learner storage sentinels.
Screenshots are in `review/jelajah-d*-coach.png` and `*-analysis.png`.

The extra edge run tests a manually incorrect answer, completed-battle replay,
navigation out of the live replay and footer bounds. It is recorded separately
in `review/jelajah-edge-results.json`.
The desktop check also passed at 1365×900, including opening the actual free
registration entry and the original pricing overlay from the two CTA links.

```powershell
node --test audit/jelajah-v1.test.cjs
node --test audit/commercial-production-access.test.js audit/demo-session-behaviour.test.js audit/demo-funnel.test.js audit/page-lock-demo-exit.test.js
# Requires Playwright; PA_BROWSER_PATH may select an installed Chromium.
node audit/jelajah-v1-browser.cjs
node audit/jelajah-layout-offers.cjs
```

Results: 8 new focused unit tests and 39 existing access/demo regression tests
passed. Independent Dimensi teaching validation passed after correction of
repeated/revealed independent items. Code review found replay relocking; fixed
by retaining unlock state until grade changes.

Known existing audit issue: `node audit/coach-games-v1.js` fails at line 12,
because it expects `/4 pet/` while the existing reducer says `4 Teman`.
Both this audit and the mini-game source are byte-identical to `origin/main`;
this change does not modify them. The browser tests exercise all six actual
interactive solutions successfully. No live purchase or account creation was
performed; paid access is covered by existing entitlement/quota regression tests.

Browser automation is a mobile viewport check, not a physical-device test.
