# v3.86.48 — Every Kemahiran Fokus skill opens a mini game

## Why skills fell back to the ordinary battle
1. **Normal student login treated as demo.** The Tapak Bina and other Focus mini-game bridges refused when `isDemoStudent()` was true. That is true for every child who enters with the "Sambung <nama>" button (`uiSession.role==='student'`), so Ruang (Bentuk asas), Operasi, Pecahan, Ukuran, Data, Perpuluhan and Nisbah all went to battle. Gerai Wirayung and Tren Jam never had that check, which is why only Wang/Masa opened a game. The real guest demo is still excluded through `db.demoMode`. The dev-mode exclusion was removed too.
2. **Lombong Permata, Dapur Ramuan and Pos Peninjau could never start from Focus.** Their launch check read `window.parent.db`, but the app's `db` is a top-level `let`, so it was always undefined and the game showed "Buka latihan ini melalui Kemahiran Fokus". They now ask the bridge (`PAFocusMiniGamesLive.isActiveFrame(window, nonce, skill, gameId)`) and check the skill's grade.
3. **10 skills had no mini-game mapping:** D2.3.2, D3.PERCENT, D4.PERCENT, D4.RATIO, D4.RATE, D5.RATIO, D5.RATE, D6.PROB, D6.PIE, D6.DATA_PROBLEM.

## Mapping added
- Lombong Permata: D2.3.2 (new D2 bank), D3.PERCENT, D4.PERCENT (existing D3/D4 peratus banks).
- Dapur Ramuan: D4.RATIO/D5.RATIO → nisbah, D4.RATE/D5.RATE → kadaran (existing D4/D5 banks). Bridge accepts domain Kadaran.
- Pos Peninjau: D6.PIE → pai, D6.PROB → peluang, D6.DATA_PROBLEM → masalah + peluang. Bridge accepts domain Kebolehjadian.

## New Lombong Permata D2 bank (Perpuluhan persepuluh, relaxed)
- Read shaded rows as tenths, 7/10 → 0.7, place 0.k on a 0–1 line, shade 0.k by rows, pick the heavier/lighter of two tenths.

## Verification
- In the app as a normal "Sambung" student: all 117 skills (D1–D6) open a mini game, 0 fall back to battle.
- The new routes plus D6.DEC, D1.DATA and D6.RATIO open a real first question; D2 tenths screenshot checked (4 rows → 0.4).
