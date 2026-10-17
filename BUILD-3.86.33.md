# v3.86.33 — Darjah 6 insurance/takaful variety and Space polygons

## Wang (Unit 3)
- SP 3.2.1 and 3.2.2 had one fixed question each, so the adaptive router showed the same insurance item repeatedly.
- Added five scenario-pool archetypes in the low band:
  - 3.2.1 `insurance_term` (premium, polisi, tuntutan, sumbangan) and `takaful_concept` (saling membantu, syariah, non-examples).
  - 3.2.2 `protection_match`, `protection_benefit` (kenderaan, kebakaran rumah, perubatan, perjalanan) and `protection_claim` (error analysis).
- Mode rotation now picks at random among the least-used modes (+1 slack) instead of the single least-used one, so the router's resampling reliably reaches its target SP.
- Router simulation (40 draws per SP, other SPs already secure): on-target 3.1.1 36→39, 3.1.2 32→40, 3.2.1 4→12, 3.2.2 4→16, 3.3.1 12→24; unique prompts for 3.2.1 1→7, 3.2.2 1→10.
- `audit/year6-money-real-v3.60.5.js` low-band breadth updated 12→17.

## Ruang (Unit 6)
- 6.1.1 new: `polygon_name` (pentagon–oktagon), `polygon_interior` (108°, 120°, 135°), `polygon_perimeter`, `perimeter_side`.
- 6.1.1 `straight`, `missing` and `polygon_compare` were fixed single items; now randomised.
- 6.3.1 new: `polygon_fence` and `fence_compare` (regular-polygon perimeter in context).

## Verification
- 2,850 D6 samples: 0 duplicate options, every question has 3 wrong options.
- Audit suite unchanged except the money audit: it passes, but still fails intermittently because its sandbox lacks `formatClockTime` for the D6.TIME delegation check (pre-existing).
