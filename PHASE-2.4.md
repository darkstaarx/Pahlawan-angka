# Phase 2.4 — Darjah 2 Learning Camp Content

This full build extends Phase 2.3 Learning Engine with concept-specific Darjah 2 lessons.

## Scope
- 37/37 Darjah 2 skills have a dedicated Learning Camp specification.
- Keeps the five-stage flow: Faham → Bina → Sambung → Cuba → Guna.
- Uses concept-specific concrete/virtual or pictorial representations instead of one generic lesson.
- Keeps final checkpoints generated from the live question bank so the student must apply the concept rather than repeat a memorised worked example.
- Keeps prerequisite fallback as `Misi Asas`.
- Keeps Dev Mode, hero assets, adaptive engine, parent dashboard, question banks and reward logic from Phase 2.3.
- Does NOT add Shop/Inventory/reward-art assets.

## New file
- `lessons/d2/index.js`

## Modified files
- `index.html` — loads the D2 lesson bank before the Learning Engine.
- `js/learning.js` — resolves skill-specific lesson specifications and renders concept-specific stages.
- `css/game.css` — adds lightweight mobile-first learning manipulatives/diagrams.
- `validation-report.json`

## Validation
- JavaScript syntax: PASS
- D2 skills in knowledge graph: 37
- D2 lesson specifications: 37
- Missing D2 lesson specifications: 0
- Missing local references from index.html: 0
