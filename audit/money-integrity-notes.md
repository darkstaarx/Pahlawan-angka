# Money integrity — v3.85.44

Scope: all 12 active money skills across D1–D6, actual runtime bank order, live D3 bridge, beginner/core/secure learner states, and the production typed-answer matcher.

Fixed:

- D1: RM amounts and equivalent sen amounts could be presented as separate options (RM1 / 100 sen; RM2 / 200 sen). Shared semantic choice keys now normalize both units and reject duplicate correct choices. The ringgit-combination generator also supplies genuinely different distractors.
- D2: the v3.85.43 depth additions used only integer ringgit amounts, reducing sen practice at higher demand. New depth tasks generate integer sen, include mixed RM/sen amounts, stay within RM100, and use savings-specific contexts for the saving skill. Multiplication/division inverse tasks ask for the missing number of items/recipients rather than presenting a plain division item under a multiplication title.
- D3: multiplication visuals showed at most six prices even when the prompt specified seven to nine items. Price-card count now equals the stated quantity. The source runtime has been rebuilt.
- D4/D5: budget generators could overspend and silently ask for a negative ordinary balance. Expenses now stay within the available budget. D4 adds missing income and missing saving record tasks.
- D5: the cheaper package was always B. Either A or B can now be cheaper, with the opposing package as a genuinely incorrect option.
- D6: the insufficient-money task had overlapping verdict choices. It now asks for the exact balance or shortfall after discount and purchase.
- Typed money answers now support sen and accept explicitly equivalent RM/sen forms. Bare numbers use the displayed answer unit: `50` for a sen answer, `0.50` for an RM answer. Both legacy and rescue typed inputs display the expected unit; presentation polish preserves it. Numbers and percentages retain their original matching behavior.
- Release query versions refresh all changed runtime files, including typed matcher and presentation scripts.

Validation:

- `node audit/money-integrity.cjs`: 9,000 real dispatched money items, 4,634 independent numeric checks, explicit D1 generator regressions, both D5 package winners, and typed RM/sen/number/percent cases. Results in `money-integrity-report.json`.
- `node audit/grade-depth-validation.cjs`: 7,488 D1–D6 items pass general generation and choice checks.
- `node questions/v2/validation/phase3a2-semantic-hardening-qa.js`: 187,000 samples pass, including the added D3 money visual-count/total oracle.
- Runtime build consistency, 300 D3 live activation checks, typed UI idempotence audit, syntax and whitespace checks pass.

Limits: this is generator and matcher validation, not a complete manual curriculum certification. Phone/browser visual QA has not been performed; the previous Chromium download failure remains unresolved.
