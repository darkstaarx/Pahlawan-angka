# v3.86.41 — Darjah 2 choices, money and wording

Checked against the KSSR Matematik Tahap 1 alignment document (Edisi 3) and myUASA Darjah 2:
- Year 2 multiplication/division covers all single-digit basic facts (SP 2.3.1), so 6 × 9 and 72 ÷ 9 stay.
- Year 2 time relations are day–hour and hour–minute (SP 5.2.1); "1 minggu = 7 hari" is Year 3. Left in the main bank as a Segel Emas stretch item; not used by mini games.

Fixed in the main bank:
- `moneyWrongSet()` (D2 money and every caller): no "0 sen", and only amounts payable with Malaysian coins (multiples of 5 sen) — removes RM59.98, RM7.96, RM7.53.
- D2.4.1 coin/note recognition: choices are neighbouring real denominations plus the sen/ringgit mix-up (no RM49/RM51).
- `refineYoung` now covers D2: fillers and choices above 1 000 are replaced with in-range choices (hundreds for rounding to hundreds, tens for tens), number words via `numWords`, same-denominator fractions (never equivalent), and times ±5/15 minutes.
- Wording for 8-year-olds: "paling munasabah" → "paling dekat"; "Pilih penilaian yang betul" → "Betulkah?".

Mini games at D2 (Gudang, Kedai Kek, Pos Peninjau, Bengkel, Tapak, Tren Jam, Gerai; ~2,600 items in Chromium): at Year 2 level, no numbers above 1 000, Tren Jam relations are hour–minute and day–hour only. No changes needed.

Verification: 2,220 D2 main-bank samples — 0 duplicates, 0 non-5-sen money choices, 0 equivalent-fraction distractors, 0 choices above 1 000. D1 rechecked: unchanged and clean.
