# Sidma Time Lab — implementation and verification

Base: `211d3d8793296921de99ad236cd3dd567720caeb`, version 3.56.3.
Local candidate only. No commit, push or production deployment.

## Scope

D2.5.3 teaching steps 0–2 use fixed Sidma regardless of selected battle hero.
Transparent pushing-pose PNG is included. Its palm tracks the minute-hand tip;
the sprite remains upright. Both clock hands share elapsed-minute state.
Teacher demonstrates +5 minutes, pupil then starts again and controls +5/-5,
can overshoot and undo, explicitly checks, then recalls the end time with the
clock hidden. Existing independent/transfer checkpoints remain unchanged.
Other topics, intervention thresholds, question banks, adaptive logic,
account state, rewards and persistence are not modified.

Recognized end-time prompts supply the time/duration. Unsupported templates
use an explicitly labelled training example, 7:15 +30 minutes.
No new animation timers. Reduced-motion CSS suppresses transitions.

## Verification

- 14,405 pure/runtime checks: extraction, moves, bounds, undo, midnight wrap,
  and unchanged checkpoint fallback.
- Existing time-coach-pdf: 1,616 checks passed.
- Existing manipulatives invariants and runtime audits passed.
- Adaptive-coach: 13 checks passed.
- Syntax and git diff --check passed.
- Real Chromium browser, 390×844 iframe fixture: demonstrated 7:15→7:20,
  reset to initial time for pupil control, moved to +35, undid to +30,
  checked and recalled 7:45, then answered existing stage3/4 checkpoint
  functions. Fixture completion displayed. Screenshot inspected for pose,
  palm placement and mobile layout.
- Browser exposed stale feedback after moving; final source now clears it.

## Limits

Browser used actual shipped lesson functions with a deterministic host fixture,
not a logged-in account. Real battle return, account persistence, service-worker
upgrade and actual reduced-motion preference remain unverified. This is NOT a
claim that the old comprehensive A–H suite passed. The final feedback-clear
change passed static checks but was not re-run in the browser.

## Cache / integration

Candidate keeps base application version. Unique time-lab-1 query suffixes on
pwa.js and manipulatives JS/CSS, plus a unique SW cache suffix and precached
pose, avoid reuse of the old assets. Assign the final app release version during
approved release preparation. Do not silently treat this as already deployed.

## Reproduce

Serve repository root over HTTP and open audit/time-hero-lab-preview.html.
Fixture has a Mula semula button; if initial rendering is blank, click it.
Fixture contains synthetic checkpoint questions and intentionally no save,
reward or real battle return. Do not wire this fixture into the production UI.

Run node audit/time-hero-lab-v1.js and the existing audit commands named above.
Review diff against the stated base before applying to any newer main.
