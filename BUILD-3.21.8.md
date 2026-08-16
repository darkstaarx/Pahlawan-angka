# Pahlawan Angka v3.21.8 — Typed Answer Freeze Hotfix

Baseline: `b4bed5e1db9c26c8678476c29c753440a273b8e4`.

## Root cause
v3.21.7 observed all child-list DOM mutations and rewrote the typed label on every scan. That rewrite created another observed mutation, causing an unbounded observer → scan → rewrite loop when a typed-answer form appeared.

## Fix
- remove the observer-based presentation layer;
- polish once after the existing `nextQ()` chain renders the typed form;
- set an idempotent `data-pa-typed-polished` guard before any DOM rewrite;
- keep v3.21.7 visual design and keyboard compaction.

Typed-answer selection/matching, max-2 boss rule and all combat/learning logic are untouched.
