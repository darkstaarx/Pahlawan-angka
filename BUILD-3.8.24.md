# Pahlawan Angka v3.8.24

## Adaptive Cikgu Wajar

- Preserves the existing KSSR graph, generators, mastery/confidence/evidence model, recovery, Restu Penjaga and all battle/reward systems.
- Adds a persistent per-skill coaching profile that distinguishes conceptual misconception, impulsive guessing, scaffold dependence and general uncertainty.
- Selects among three instructional strategies: visual model, wrong-versus-right contrast, and reduced-choice micro steps.
- A failed checkpoint changes teaching strategy before repeating content, moving to a prerequisite, or counting toward Restu Penjaga.
- Successful strategies are remembered per skill and influence the next intervention.
- Parent logs describe the strategy change in plain language.

## Validation

- JavaScript syntax checks for the complete build.
- Darjah 2 full regression: 37 skills, 0 failures.
- Darjah 3–6 generator audit: 51 skills, 0 technical problems.
- Adaptive strategy regression: need classification, strategy selection, persistence and Restu ordering.
- ZIP integrity test.
