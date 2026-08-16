# Pahlawan Angka v3.21.3

## Victory Asset Lock

Baseline: `a0844708d7f30330cdefabc86246417e25fc13c6`.

### Product correction
- Removes the v3.21.2 CSS-only hero victory hop/rotation placeholder.
- Removes the v3.21.2 CSS-only pet victory hop/rotation placeholder.
- Removes decorative victory spark generation from the active combat layer.
- Boss victory continues through the existing normal boss-victory/checkpoint flow with no fake hero/pet animation.
- Dedicated hero/pet victory animation is now explicitly **pending real multi-frame assets**.

### Preserved
- v3.21.2 boss pose-size normalisation and common foot anchor.
- Boss attack horizontal travel and contact-shadow grounding.
- Calmer/darker terrain layer without dimming combatants.
- v3.21.2 Boss Typed Answer experiment (max 2 safe typed items; 1 or 0 valid).
- World Response remains retired.
- Learning/mastery/adaptive/reward/parent-time systems unchanged.
