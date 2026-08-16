# Pahlawan Angka v3.21.5

## Boss Defeat Anchor Fix

Baseline: `693560cd9d5756fe60502ad500a1e12aa0a65e60`.

### Fix
The legacy defeat system cloned `#enemySprite` inside `enemySpriteWrap`. That assumption became invalid after boss scale/inward staging and pose normalisation. A defeated boss could therefore appear to jump toward the middle of the arena before shattering.

v3.21.5:
- detects the enemy frame that is actually visible at defeat time;
- snapshots its rendered rectangle with `getBoundingClientRect()`;
- places the shatter layer directly on the battle arena at that exact rectangle;
- uses that same visible frame image for the shards;
- does not animate/overwrite the source frame transform during the crack flash;
- cleans the anchored layer before the next enemy/screen.

### Preserved
Boss scale + inward staging v3.21.4, DEV direct boss jump, typed boss answers, terrain grade, victory asset lock, learning systems.
