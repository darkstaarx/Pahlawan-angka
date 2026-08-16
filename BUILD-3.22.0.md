# Pahlawan Angka v3.22.0 — KSSR Assessment Depth & Variety

Expected baseline:
`70a152d8fdeffa19d96765a9cdab215adb2a2d7e`

## Why this release exists

The old bank still had a serious grade-progression smell in several nodes: higher grades often received the same one-step structure with bigger numbers. Examples in the old bank included:
- D5.FRAC: same-denominator addition.
- D6.FRAC: mixed number → improper fraction.
- D6.DEC: only decimal add/subtract.
- D6.TIME: speed-distance-time.
- D6.RATIO: only equivalent ratio.
- many data/measure/space nodes: one repeated template.

That weakens both engagement and diagnostic validity.

## Architecture

v3.22.0 is additive and loads **after v3.18.1 curriculum integrity**.

Order:
1. existing bank
2. v3.18.1 skill integrity guard
3. v3.22.0 assessment-depth contract
4. sensory / coach / daily / combat layers

This is deliberate. v3.22.0 captures the already-repaired banks as fallback and overrides only explicit current skill IDs.

There is no generic "same domain" generator.

## Coverage

- 65 explicit enhanced skill nodes across D1, D3, D4, D5 and D6.
- 37 D2 nodes explicitly marked `preserve-integrity-v3.18.1`; D2 was already the strongest contract-specific bank and is not regressed.
- Total current skill-contract status entries: 102.

## Runtime sample QA

Local generator harness:
- 7,800 generated samples.
- 65 enhanced skills × 120 samples.
- 2,223 visual/diagram samples observed.
- 1,078 reasoning-demand samples.
- 2,014 application-demand samples.
- no runtime generation failure.
- every sample had an answer and 3 unique distractors in the harness.

## New diagram primitives

Inline HTML/SVG only; no external AI art:
- number line
- fraction strip
- fraction set
- hundred grid
- pictograph
- table
- ruler
- rectangle/composite figure
- scaled coordinate map
- probability spinner
- time bar/timeline

## High-impact competency fixes

### Fractions
D1 concrete equal parts → D3 equivalence/related denominators → D4 mixed/improper and add/sub → **D5 multiplication → D6 division**.

### Upper-primary assessment demand
Adds missing-value, multi-step story, reasonableness, inverse percentage, ratio table/proportion, time-zone reasoning, scaled-coordinate route and probability comparisons.

### Response modality
No change to the global answer system. Normal battle can still show choices. Existing Boss Typed Answer can use compatible numeric/money/percent questions without a separate bank.

## Deliberately untouched

- mastery formulas
- evidence thresholds
- adaptive routing
- Cikgu Wajar
- Daily Quest
- parent mode
- battle/FX
- Supabase schema
- World Response (remains retired)
- hero/pet asset work

## Known graph gap

Current D5/D6 Space modelling is narrower than the full KSSR Space curriculum. This release will not contaminate AREA mastery by silently treating unrelated polygon/angle/circle skills as AREA evidence. That requires a future knowledge-graph migration, not a question-bank shortcut.
