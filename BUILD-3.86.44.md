# v3.86.44 — Mini games: child-facing text only, Kembali locked until a set is done

## Kembali needs one finished set or the parent PIN
- New `js/minigame-exit-guard-v1.js`, used by every mini-game overlay (Gerai Wirayung, Tren Jam, Gudang Harta, Kedai Kek, Bengkel Ajaib, Dapur Ramuan, Pos Peninjau, Lombong Permata, Tapak Bina).
- Before the first set ends the button reads "🔒 Kembali". Tapping it asks for the parent PIN ("Keluar sebelum habis?"); "Sambung main" returns to the game.
- Each game posts `PA_MINIGAME_SET_DONE` when its set summary appears; the button then becomes "✕ Kembali" and closes freely.
- Uses the existing parent PIN and dialog from `PAPageLock` (new `confirmExit`). Entering the PIN here does not switch off the battle lock. With no parent PIN set, the button closes as before.

## Parent/system wording removed from what the child sees
- All set summaries: removed "Markah latihan sahaja, bukan rekod mastery." (and Tapak Bina's "Bukti jawapan dihantar kepada Kemahiran Fokus…").
- Gerai Wirayung set summary: removed "Kemajuan latihan direkod untuk laporan ibu bapa."
- Tren Jam (Masa Focus check): no more "Semakan Fokus Selesai", "probe terakhir" or "Bukti… dihantar kepada penjaga". The 6th train is "Satu lagi tren!" and play continues afterwards instead of closing.
- Overlay bars: "Ujian diagnosis · laporan disimpan" / "Semakan perbandingan masa · laporan disimpan" → "Latihan Wang/Masa"; the parent summary strip under the game is no longer shown to the child; the status line under other games reads "Habiskan satu sesi, Wira!".
- Reports to the parent are unchanged.

## Verification
- Playwright in the app: 🔒 label before the set; wrong PIN keeps the game; "Sambung main" keeps the game; correct PIN closes; after a set-done message the button is "✕ Kembali" and closes without PIN; no-PIN profile closes freely; no page errors.
- Gerai full set replayed; all nine mini games load without errors.
