# v3.86.35 — Darjah 6 mini-game level alignment

## Bengkel Besi (ukuran)
- D6 had one item per mode while its router already expected relation tiers. Added three SP 5.1.1 relation items per mode (length–mass, length–volume, volume–mass), using the existing scale gameplay and friendly numbers; router tiers synced.

## Tapak Bina (ruang)
- D6 `luas` (L-shape area) and `isipadu` (cube volume) are Year 5 content; replaced by a `poligon` family: polygon names, regular-polygon perimeter (pagar) and side from perimeter.
- `polygon_angle` no longer uses triangle/quadrilateral angle sums (Form 1); it now covers regular-polygon interior angles (108°, 120°, 135°) with hints that never state the answer.
- Router maps the new main-bank polygon archetypes; router QA probes updated.

## Lighter items (mini games stay relaxed)
- Gudang Harta: order-of-operations uses round numbers (3 400 000 + 150 000 × 4); decimal-million items use tenths/quarters. Fixed the worked answer for the multiply case, which showed b instead of b × k.
- Lombong Permata: decimal multiplication's second factor is friendly (0.3, 0.5, 1.5, 2.5).
- Kedai Kek: fraction ÷ fraction and mixed ÷ fraction give whole-number answers.

## Main bank
- Option-integrity key no longer treats "1 1/4" and "11/4" as the same option; only digit-group separators are ignored. Fixes an intermittent `grade-depth-validation` failure (D3.FRAC choice count).

## Other
- Added `<meta charset="utf-8">` to five mini-game pages that relied on the server header.

## Verification
- Chromium run of each changed mini-game at D6: no page errors; 720 Bengkel samples all within scale limits and step sizes; Tapak, Gudang, Lombong and Kedai samples checked.
- 2,850 main-bank D6 samples clean; Segel typed matching unchanged.
- Audit suite matches baseline apart from known intermittent audits.
