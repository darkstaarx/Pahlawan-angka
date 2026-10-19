# D4 question polish and currency clue correction

Adds payment-instrument questions, pictograph interpretation (including half symbols, missing rows and legends), and mass/liquid-volume operations alongside the existing final D4 bank. Existing D4 families remain available. Pictograph modes follow the final bank's learner stages; the advanced measurement additions require stage 3. Other grades delegate unchanged through this wrapper; no money, fraction or mini-game image assets are replaced.

The D3 QSv2 currency-to-country generator now displays "Peso" without "Filipina" and asks within ASEAN. Ambiguous bare-dollar reverse questions are excluded; country-to-currency and code questions retain those countries. The generated runtime is rebuilt from the current sources.

## Validation

- `node audit/d4-completion-qa.js`: 9,000 direct questions, 18,000 final-dispatcher samples, 2,400 learner-stage regression samples and 630 protected-skill comparisons; independent answer checks and both dynamic loader paths.
- `node audit/currency-country-leak-qa.js`: 3,000 samples and source/bundle parity.
- `node questions/v2/build/build.js --check`.
- `node questions/v2/validation/phase3a2-semantic-hardening-qa.js`.
- Existing D2 estimation, content integrity, D1 fraction variety and Year 4/5 curriculum release checks.

The loader tests simulate the DOM; these results do not assert device/browser rendering or production publication. GitHub publication preserves the repository's manual-only Netlify policy. A separate production release is required before the live site receives these changes.
