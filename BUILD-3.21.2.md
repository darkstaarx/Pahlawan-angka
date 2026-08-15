# Pahlawan Angka v3.21.2

## Combat Polish Cleanup

Baseline: `f6e882b605c7e63ebc3be8615ca76188fda3c885` (v3.21.1).

### Product changes
- World Response is retired completely from the active product/runtime. Its loader, service-worker entries, DEV lab and stored child-profile experiment state are removed.
- Boss attack frames now share one fixed box and one bottom foot anchor; attack travel has no scale transform.
- Boss contact shadow follows horizontal attack travel without changing boss size.
- Boss victory now triggers a short happy hero celebration plus the currently equipped pet.
- Victory motion animates artwork inside fixed unit/pet wrappers so battle baselines and sizing stay stable.
- Every topic terrain is deliberately calmer: reduced saturation and brightness plus a restrained dark grade on a dedicated background layer. Combatants are not dimmed.
- Boss typed answers from v3.21.1 remain: maximum two per normal boss, possibly one or zero when formats are unsuitable.

### Untouched learning systems
Question generation, mastery formula, competency integrity, adaptive routing, Cikgu Wajar teaching, Daily Quest selection, damage/reward logic and parent time controls are unchanged.
