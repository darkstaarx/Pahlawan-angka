# Boss Stage + DEV Jump Lock — v3.21.4

## Boss visual staging
- Boss must read larger than the hero.
- Increase the common boss stage box; do not create pose-specific arbitrary size jumps.
- Keep all boss frames bottom-anchored.
- Keep boss away from the right arena edge so wide weapons/capes are not clipped.
- Existing per-pose scale compensation remains for transparent-padding differences only.

## DEV Boss Fight Test
- Available only when Developer Mode is unlocked.
- Choose a boss by chapter and jump directly to boss phase.
- Skip the normal nine-question minion lead-in.
- Use DEV bank-test semantics to avoid normal mission progression rewards.
- This feature is for visual/combat QA, not pupil progression.

## Preserved product locks
- World Response remains retired.
- Boss typed answer maximum remains two in normal gameplay.
- Victory animation remains disabled until real multi-frame hero/pet assets exist.
