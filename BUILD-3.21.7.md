# Pahlawan Angka v3.21.7 — Typed Answer UI Polish

Baseline: `801ffcd2c57fd0e5324ff0decbd65d3d687b83f4`.

## Pupil-facing change
Boss typed-answer gameplay logic is unchanged. This release only replaces the experiment-looking presentation:

Removed from the pupil UI:
- `BOSS PROOF`
- `Taip jawapan sendiri`
- `Tiada pilihan jawapan · tunjuk apa yang kamu benar-benar tahu`

New flow:
- question
- `Jawapan kamu`
- large centered numeric input
- compact `Jawab` button
- normal feedback

## Mobile keyboard
When the visual viewport is materially reduced by the soft keyboard, only whitespace in the question card is compacted. The battle scene and question remain visible.

## Preserved
- normal boss typed maximum: 2
- eligible-answer rules and typed matching
- hints/retry flow
- DEV Force Typed Preview
- v3.21.6 Wira/Bunga final-blow hotspot system
- all mastery/adaptive/question logic
