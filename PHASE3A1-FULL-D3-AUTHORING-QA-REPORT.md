# Phase 3A-1 FULL — Darjah 3 Complete Authored Question Bank QA

## R2 corrective validation

- Restores the exact `default SHADOW` service-worker invariant required by historical Phase 2D regressions.
- Reworks `select_largest_decimal` to choose four unique integer hundredths before float formatting, preventing duplicate 2-decimal MCQ labels.
- Adds a 10,000-seed targeted regression for `select_largest_decimal` in `phase3a1-p0-content-qa.js`.
- Additional R2 stress testing exposed and fixed the `50 daripada 100 = 50%` complement collision in `number_out_of_100_to_percent`; it now has its own 10,000-seed uniqueness regression.
- Independent package stress sweep: 132 non-T7 templates × 1,000 deterministic seeds = 132,000 generated MCQs with zero duplicate-choice failures.
- No curriculum status, LIVE rollout, evidence, Supabase, battle, or unrelated application behavior is changed.


**Base:** `64dfb25997b332a1f07304d61268649e4e7b7dda`  
**Target release:** `3.44.0`  
**Supersedes:** the earlier, not-yet-deployed Phase 3A-1 P0-only package.

## Scope

This package completes authored QS v2 coverage for all nine Darjah 3 topics while preserving the existing rollout boundary.

- Existing Topic 7: 26 templates (24 battle MCQ + 2 interactive), beta LIVE unchanged.
- Previous P0 batch: 90 MCQ templates across T2/T3/T5/T6/T9.
- Newly completed topics:
  - T1 Nombor Bulat hingga 10 000: 18 MCQ templates / 6 SP.
  - T4 Wang: 15 MCQ templates / 5 SP.
  - T8 Koordinat: 9 MCQ templates / 3 SP.
- Non-T7 total: 132 authored MCQ templates across 44 mapped SP.
- Full D3 total: **158 templates across 50 SP / 9 topics**.

Every non-T7 SP has exactly three distinct authored archetypes, at least two representation labels, and at least two cognitive-demand categories.

## Production safety

This is **content-bank completion, not rollout expansion**.

- Only D3.T7 remains `enabled`.
- All 44 non-T7 curriculum records remain `mapped`.
- Every non-T7 legacy skill routes QS v2 in SHADOW only.
- Topic 7 admin/closed-beta LIVE remains independent.
- `DEFAULT_MODE='shadow'` remains unchanged.
- No evidence epoch is added for T1/T2/T3/T4/T5/T6/T8/T9.
- No Supabase migration.
- No changes to battle, hero, reward, Cikgu Dimensi, parent controls, legacy D3 bank, or dispatcher source.

## New T1 authoring

Covers number representation, comparison, estimation, rounding, and number patterns. Representations include textual number words, place-value table, visual reference groups, number line, and sequences.

## New T4 authoring

Covers add/subtract money, mixed money operations, multiply/divide money, ASEAN currency recognition, and needs-vs-wants financial reasoning. Currency questions use the established ASEAN-member set already relevant to the KSSR-era curriculum and do not introduce exchange-rate assessment.

## New T8 authoring

All nine coordinate/position templates are grid-based. They assess relative position from a reference, identification through horizontal/vertical axes, and locating positions or movement on the grid. This removes the content-bank gap identified in Phase 3A-0, while remaining SHADOW until a later rollout phase.

## Local static QA

A standalone isolated authored-source harness loaded:

- `d3.p0Kssr`
- `d3.fullKssr`
- `d3p0`
- `d3full`

It tested all **132 non-T7 templates** over **10,560 generated samples**.

Result:

- 44/44 non-T7 SP represented.
- 3 templates per SP.
- 3 distinct archetypes per SP.
- representation diversity gate PASS.
- cognitive-demand diversity gate PASS.
- generator contract PASS.
- 4 unique MCQ choices PASS.
- renderer smoke PASS.
- no duplicate answer/distractor labels found.

Standalone QA summary: **53,242 checks PASS**.

## Expected repository validation after apply

After deterministic runtime build:

- D3 curriculum: 50.
- canonical competency IDs: 50.
- mapped: 44.
- enabled: 6, all D3.T7.
- D3.T1: 18 templates.
- D3.T2: 9.
- D3.T3: 30.
- D3.T4: 15.
- D3.T5: 15.
- D3.T6: 27.
- D3.T7: 26.
- D3.T8: 9.
- D3.T9: 9.
- total: **158**.

The mandatory repository regression suite must still be run by the deployment agent. Any failure means STOP; do not bypass.
