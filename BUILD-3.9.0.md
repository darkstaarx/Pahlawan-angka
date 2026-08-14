# Pahlawan Angka v3.9.0 — KSSR Question System

## Scope

This release changes question-bank breadth, KSSR unit mapping, question rotation and learning feedback only. Battle staging, assets, animation timing, rewards, shop, Parent Mode, Restu Penjaga and hidden Dev Mode remain intact.

## Implemented

- Expanded the knowledge graph from 102 to 114 skills after a Darjah 1–6 textbook/DSKP gap audit.
- Added Peratus/Kedudukan for D3; Peratus/Koordinat/Nisbah/Kadaran for D4; Tambah/Tolak/Operasi Bergabung/Nisbah/Kadaran for D5; and Kebolehjadian for D6.
- Separated legacy gameplay chapters from textbook unit metadata, preserving unlock/save compatibility.
- Added structured question metadata: archetype, representation, cognitive demand, context, difficulty band and misconception targets.
- Added history-aware rotation with at least three forms per skill: solve, choose a method and analyse an error.
- Rebuilt D3–D6 measurement rotation with six forms: mixed-to-minor conversion, reverse conversion, missing component, comparison, contextual operation and conversion-error analysis.
- Added KSSR-oriented task presentation without changing the question card's allocated height.
- Extended Cikgu Wajar/Guardian Focus feedback for strategy and error-analysis questions.

## Verification

- 114 skills × 15 generated questions: 1,710 samples, zero failures, minimum three archetypes per skill.
- D3–D6 stress test: 63 skills × 500 generated questions, 31,500 samples, zero invalid/duplicate-option/metadata failures.
- Original D2 bank regression: 37 skills × 1,000 samples, zero failures.
- PWA shell and icon checks passed; cache and visible version are v3.9.0.
- Existing battle grounding, perspective and hero-pose regression checks passed.

## Coverage note

`coverage: partial` is intentional. The new metadata and missing strands close verified structural gaps, but it does not claim that every textbook learning standard is already represented at full workbook depth.
