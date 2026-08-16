# Combat Target Anchor Lock — v3.21.5

Any FX that visually hits or destroys an enemy must use the enemy's actual rendered frame geometry, not the generic `.unit.enemy` centre.

Covered:
- impact flash
- impact slash
- impact burst
- Wira final blow
- Bunga final blow
- defeat/shatter

This keeps FX aligned if boss scale, transparent padding, pose compensation, or inward staging changes later.
