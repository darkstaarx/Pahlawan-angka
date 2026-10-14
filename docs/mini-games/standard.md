# Pahlawan Angka Mini-game Standard

Every mini-game that supports Kemahiran Fokus must meet these release requirements. A game's visual polish or question count does not make it ready unless its diagnosis and evidence path also work.

1. **Pahlawan Angka brand:** Use approved Pahlawan Angka characters, sprites, iconography, colors, typography, and visual language. A game's setting may differ, but it must still look and feel like it belongs to the same product.
2. **Real weakness tags:** Questions carry the learner's actual grade, skill ID, diagnostic archetype, representation, demand, and tier. The router chooses questions from the profile's detected weakness. Do not infer a weakness from the game's theme alone.
3. **Enough questions across D1–D6:** Provide a reviewed bank for each supported grade and diagnostic subskill. Test coverage and repeat behavior before release. Expand the bank when real learner evidence shows gaps; do not claim a grade is covered just because the game has a grade selector.
4. **Wira gives two clues, never the answer:** At most two clue uses per question. Clue two gives a next step or strategy, with the final result hidden. Reset the two-clue allowance on the next question.
5. **Record evidence and show it to parents:** Save question-level attempts, correctness, first errors, clue use, and relevant skill/archetype metadata through the learner-review/backend path. Make that evidence available in the Ibu Bapa Ringkasan report; test the full path from game answer to report.
6. **Evidence-based focus and progress:** The router and report may identify a specific weakness (for example, bahagi nombor besar) and later say it is improving only when there is enough independent evidence across distinct questions. Never present stars, one session, or clue-assisted success as mastery or as proof that the mini-game caused improvement.

## DEV-only controls

Grade/mode selectors, router simulations, and question-bank controls are hidden from normal play. They may appear only when the owning Pahlawan Angka app's `isDevMode()` is true, or in the local app after its existing DEV unlock is set. Query-string flags alone must never expose them on the public game URL. Player launch goes through Kemahiran Fokus, which supplies the profile grade and selected skill tag.

## Release checks

- Verify each supported grade and skill tag routes to the intended bank and weak archetype.
- Verify the normal player route has no grade or mode selector.
- Verify no question can reveal its answer through either clue, and a third clue cannot be requested.
- Verify game evidence appears in learner review and the parent Ringkasan report.
- Verify report language reflects the evidence threshold and names the actual skill being practised.
