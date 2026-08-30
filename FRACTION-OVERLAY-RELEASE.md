# Fraction overlay — 3.56.4

Approved preview: Cikgu Dimensi teaches through a non-blocking overlay; Wira's
cake uses equal-area crops; guided half/quarters/whole, independent 3/4,
free play (2–10 equal parts), and transfer to 2/3 of a six-part strip.

Base: `2f54cf5774c2da038ac4ef707352e90f3aa5655e`.
Live version observed before release: 3.56.3 (not the old brief's 3.56.0).

## Integration

- `js/fraction-lesson-v1.js`: approved component, scoped styling, embedded existing
  approved assets, bounded local state, observer/timer cleanup and completion gate.
- `js/cikgu-mini-games-v1.0.0.js`: replaces only the cake activity at teaching
  stage 1; existing stage 2 recall and stages 3–4 remain unchanged.
- `js/dev-coach-games-v1.0.0.js`: Dapur Wira launches the same component, without
  touching profile state. Other five activities are unchanged.
- `js/pwa.js`, `sw.js`, `index.html`, `js/version.js`: both script-loading paths,
  offline precache and cache-busting, version 3.56.4.
- Dedicated audit and browser fixture; two old audit expectations updated for
  the new intro text and loader version (no checks removed).

## Verification

- 138 dedicated fraction checks: staged progression, incorrect-answer gates,
  completion lock, help, free play, transfer, equal areas and quantity conservation.
- Existing mini-games: 64,130 checks; Dev launcher: 28; Time Lab: 14,405.
- Syntax checks and `git diff --check` pass.
- No changes to battle, cloud, progression, question banks, or `js/learning.js`.

Browser QA NOT passed: the cloud browser refused the local fixture with
`net::ERR_BLOCKED_BY_CLIENT`. The fixture constrains content to a 390px-wide
surface, but mobile rendering, actual pointer dragging, live Learning Camp
entry, reduced motion and offline/update lifecycle remain unverified.
The general A–H demo/account/PDF regression suite was not rerun in this change.
Previously flagged division-checkpoint mismatch remains untouched.

Test route after deployment: Dev Mode → Mini-game Cikgu Dimensi → Dapur Wira.
Normal route: Learning Camp D2.3.1, model strategy → Jom belajar.
