# Phase 3.8.7 — Boss scale and readable Khazanah aura

- Boss idle and all three attack frames now render about 1.25–1.35× the hero's visual height.
- Boss stage containers allow overflow so weapons and helmets are not clipped.
- Equipped Khazanah aura now charges visibly for about 0.55 seconds before contact.
- Aura no longer uses screen blending, has a stronger floor halo, and collapses into the hero at contact.
- Fixed an inherited `visibility:hidden` rule that kept the actual sigil image invisible even when its animation rig was active.
- Ordinary attacks and finishers without an equipped aura remain unchanged.
