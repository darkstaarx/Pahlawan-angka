# Migration notes

1. Current single-file build was used as the source of truth.
2. Embedded character/final-blow images were extracted into physical asset files.
3. D2 question generation was split into Topic 1–8 modules.
4. D1 recovery and D3 stretch question banks are separate.
5. Adaptive engine and battle animation logic are separated.
6. KSSR knowledge graph exists both as JSON (data/QA/editing) and JS bootstrap (runtime).
7. No curriculum or mastery thresholds were intentionally changed during migration.

Next recommended task: fix Bunga final-blow composition within the modular battle/FX files.
