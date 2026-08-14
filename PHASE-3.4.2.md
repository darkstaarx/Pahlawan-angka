# Phase 3.4.2 — Responsive Viewport Pass

Base: Phase 3.4.1.

## Goal
Keep the existing phone-first UI while allowing the same app to scale cleanly on tablets and desktop browsers.

## Breakpoints
- <= 600px: existing phone layout preserved.
- 601–1024px: tablet sizing, wider game viewport, larger battle sprites/questions, two-column mission grid.
- >= 1025px: centered desktop game viewport with a controlled maximum width; UI does not stretch edge-to-edge.
- >= 1440px: hard cap on game width to maintain readable game proportions.

## Scope
CSS-only responsive pass. No adaptive, question-bank, battle progression, Learning Coach, Restu Parent, or persistence logic changed.
