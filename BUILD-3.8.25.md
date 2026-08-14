# Pahlawan Angka v3.8.25

## Battle-scene staging only

- Preserves the v3.8.24 adaptive Cikgu Wajar build and every gameplay system.
- Keeps the existing arena height, top HUD, quiz card and question area unchanged.
- Uses shared CSS variables for the ground plane, hero, minion, boss and pet geometry.
- Moves hero and enemy inward while retaining a clear central FX lane.
- Normalizes idle/attack baselines and transparent sprite canvases without editing assets.
- Keeps normal enemies subordinate to the hero while allowing bosses to remain larger.
- Adds restrained contact shadows, arena grading and explicit scene layering.
- Does not mirror any current enemy globally; minions are symmetrical and bosses already face left or near-front.

## Validation target

- JavaScript syntax and existing adaptive/question regressions.
- Wira, Bunga, four pets, minion and boss visual states.
- Idle, pet attack, hero attack, enemy attack, final blow, defeat and respawn.
- Portrait screenshots at 360×800, 390×844 and 412×915.
