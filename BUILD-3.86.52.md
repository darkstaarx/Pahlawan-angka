# v3.86.52 — Darjah 3 checked against myUASA and KSSR Tahap 1 (Edisi 3)

myUASA Darjah 3 has 9 units (Nombor hingga 10 000, Operasi asas, Pecahan/Perpuluhan/Peratus, Wang, Masa, Ukuran, Ruang, Lokasi, Data). 15 D3 skills × 3 ability levels × 25 questions (1,125) were generated through the live chain and scanned. Every unit is covered. The fixes:

## Bentuk (D3.SHAPE) — wrong syllabus for ordinary learners
- KSSR Tahun 3 and myUASA: prisma, poligon sekata (pentagon–oktagon), paksi simetri; **no perimeter or area**.
- The correct Topic 7 bank (24 question types) was built in QSv2, but only shown to dev/beta accounts. Everyone else got the legacy bank: "Perimeter?", missing side from perimeter, and a polygon question.
- `questions/v2/engine/legacy-adapter.js`: the default (shadow) mode now serves the Topic 7 question to every learner as a normal D3.SHAPE question (not marked pilot/live, so the beta-only Topic 7 evidence path is unchanged). 'off' still serves legacy; 'live' behaves as before.
- Title "Bentuk & perimeter asas" → "Prisma, poligon sekata & simetri" (knowledge graph).
- Four QSv2 validation tests that asserted "shadow returns null" now assert the new contract.

## Darab / Bahagi
- KSSR 2.2.1 covers both, and both skills drew from one pool: Darab showed "6218 ÷ 2" and Bahagi showed "395 × 9".
- Darab now shows × only and Bahagi ÷ only. The missing-factor sentence "□ × 6 = 882" may appear in either.

## Small content fixes (QSv2 source + rebuilt dist/runtime.js)
- Peratus: removed the "17‰" option (per-mille is not taught); replaced with the reversed-symbol mistake "%17".
- Masa two-step schedule: last step is 5/10/15 minit (was 30 s–2 min, giving times like 10:46).

## Mini games (D3)
- Tapak Bina: removed the perimeter family from Darjah 3. Position questions use a reference point and direction ("4 petak ke kanan dan 1 petak ke atas") instead of ordered pairs (2, 1), which are Tahun 4.
- Gudang Harta: two-step sums keep the in-between total within 10 000 (was 8221 + 1781 = 10 002 …). × 1000 and missing-factor products are capped at 10 000.
- Kedai Kek: equivalent-fraction wrong options keep denominators ≤ 10 (no 2/11).
- Lombong, Pos, Bengkel, Tren Jam, Gerai D3: in level, no change.

## Verification
- 1,125 D3 bank samples:
  - 0 perimeter/area
  - 0 numbers or money above 10 000
  - 0 denominators above 10, 0 thousandths, 0 ‰
  - 0 duplicate or missing options
  - Darab 0 ÷, Bahagi 0 plain ×
  - D3.SHAPE: 24 Topic 7 question types
- D3 mini games (3,225 items): 0 above 10 000, 0 denominators above 10, 0 perimeter; no page errors.
- Live repetition: no D3 skill above 20 % for one answer.
- All 117 Focus skills still open a mini game.
- Audit suite and QSv2 validation: same failures as the baseline. `tapak-bina-focus-router-qa` probe updated (D3 no perimeter).
