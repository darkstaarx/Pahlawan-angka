# Pahlawan Angka — Sensory Learning Lock v3.19

Status: **LOCKED FOUNDATION**  
Baseline: v3.18.1 content-integrity build.

## Product rule
Sensory feedback exists to make mathematical thinking feel responsive. It must not become random stimulation layered on top of worksheets.

## Intensity ladder
1. **Calm — reflection / Cikgu Wajar**: gentle visual focus. No punitive shake and no haptic for mistakes.
2. **Low — question arrival / navigation**: short settle-in motion only.
3. **Medium — correct answer**: brief competency-labelled confirmation plus the existing battle response.
4. **High — genuine skill mastery**: one short mastery moment, only when mastery threshold and required competency evidence are both satisfied.
5. **Peak — boss / final blow / major unlock**: existing cinematics own this level. Do not stack mastery cinematics over boss defeat.

## Locked implementation principles
- Math drives the RPG response; RPG effects must never fabricate mastery.
- A wrong answer invites reflection. Never use harsh vibration, repeated red flashing, ridicule, loss of earned mastery, or anxiety loops as sensory reward design.
- Mastery celebration requires `mastery >= 85` and `PAContentIntegrity.requirementStatus(...).ok` when the skill has an integrity contract.
- Correct-answer feedback may name the competency being demonstrated; do not expose internal competency IDs to pupils.
- Respect `prefers-reduced-motion`.
- Haptic is optional enhancement only: tiny pulse for correct, short sequence for mastery, none for wrong.
- Existing boss/final-blow FX remain peak intensity. Do not make every answer look like a boss win.
- v3.19.0 does not change scoring, damage, adaptive routing, question generation, mastery formula, parent rules, or Cikgu Wajar pedagogy.

## Execution sequence after v3.19.0
### v3.19.1 — Cikgu Wajar manipulatives
Strengthen visual explanations: place-value blocks, grouping/division, fractions, ruler/scale, time, money, data. Calm teaching intensity.

### v3.20 — Daily Quest + spaced review
Build a short daily loop using existing evidence/mastery data. Review queue should prioritize fragile skills, recent misconceptions, and spaced retrieval—not random questions.

### v3.21 — World response to learning
Mastery changes the RPG world visually: repaired bridge, active market, moving Time Tower, restored data observatory, etc. World change must map to real skill progress.

### Later — social / PvP
Do not build until learning loop, D7 retention, parent action loop, and child-safety constraints are validated.
