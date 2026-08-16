# Pahlawan Angka v3.21.6 — Alpha-Aware Final Blow Hotspots

Baseline: `3670076a324e20addc14f814b00ffca5673ef2a7`.

This release supersedes the earlier unpushed Wira-only v3.21.6 draft.

## Problem
Target geometry alone is not enough. A transparent FX asset can have its visible artwork away from the centre of its canvas. Aligning `left: boss centre` and then translating by a fixed percentage can still make the visible attack miss the boss.

## Fix
The browser analyses the actual same-origin FX alpha channel once and caches a normalized visual hotspot.

- Wira: alpha-weighted centre of the lower visible strike mass is aligned to ~53% x / 58% y of the currently rendered enemy frame.
- Bunga: centroid of the lower 30% of visible alpha, at the bottom opaque edge, is pinned to the actual enemy foot/ground position.
- Wira fall has no horizontal canvas-centre translation.
- Bunga scales around its measured root hotspot with no horizontal sweep.
- v3.21.5 still supplies live rendered enemy geometry and defeat anchoring.

No asset files are modified.
