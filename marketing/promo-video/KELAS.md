# Promo #8b — "Cuba Dulu · Kelas Wira" (54 s, 9:16)

Video ini sambungan Promo #8. Hook dan penutupnya sama, tetapi bahagian tengah mengikut cerita pemilik:

> Tunjuk gameplay. Oh, salah? Tak apa, ada petunjuk dalam battle. Oh, tak boleh juga? Tak apa, masuk mini-game, cuba lagi. 3 kali salah, Wira terus tunjuk cara buat. Macam kelas tambahan dengan Wira, tanpa kos tambahan.

| Fail | Isi |
| --- | --- |
| `timeline_kelas.py` | Timeline |
| `capture/capture_salah.js` | Battle Demo: soalan ke-2 cerita tolak, salah dua kali |
| `capture/capture_gudang.js` | Gudang Harta: 3 kali salah → "Jom tengok cara" → langkah Wira → SIAP |
| `srt/promo-kelas.srt` | Sari kata / panduan VO |

## Rakaman (app sebenar, main 3.87.8, 1080×2236, jam maya, benih rawak tetap)

| Kod | Isi |
| --- | --- |
| DM | Demo Darjah 2 penuh (`capture.js`, benih 7): kad Pilih Darjah, Jurus Penamat, AURORA BEBAS!, BERJAYA! 14/14 |
| SL | Demo Darjah 2 (`capture_salah.js`, benih 11). S1 betul → serangan. S2 "Cerita Berkurang" (*Sebuah kedai mempunyai 257 pensel. Sebanyak 230 telah dijual. Berapakah yang tinggal?*): anak pilih **487** (tambah, bukan tolak) → petunjuk app *"Belum tepat. Tolak bilangan yang telah dijual daripada jumlah asal."* → pilih **37** → petunjuk lagi, soalan beralih |
| GH | Gudang Harta `#d2-tolak` (benih 5), cerita *Gudang ada 117 syiling. Arnab Kek Lapis ambil 48…*: taip 79 / 89 / 99 → Wira: "Belum tepat. Semak semula langkah kamu." → butang **Jom tengok cara** → 6 langkah: pilih ayat matematik → pinjam 1 dari tempat puluh → 17 − 8 = 9 → pinjam 1 dari tempat ratus → 10 − 4 = 6 → "0 di depan tidak ditulis" → **SIAP! Cara Wira · 69** |
| ENTER, JATUH | Dua sinematik Wira (portal, jatuh ke pusaran Matematik) |

Topik battle dan mini-game sama: **Tolak, Darjah 2**.

`jom-tengok-cara-cerita-v3.mp4` (rakaman telefon pemilik, Gudang Harta Tahun 4: 51 877 − 18 587) dijadikan rujukan aliran. Video ini menggunakan rakaman HD yang dibuat semula dengan aliran yang sama, supaya topiknya sepadan dengan soalan battle.

## Fakta daripada kod

- **Petunjuk dalam battle (Demo).**
  - Jawapan salah kali pertama memaparkan petunjuk soalan itu dan membuka cubaan semula.
  - Jawapan salah kedua yang berbeza memaparkan petunjuk sekali lagi, kemudian soalan beralih (`segel-demo-v2.1.0.js`, `respond`).
- **"Jom tengok cara"** (`js/minigame-worked-v1.js`, 3.87.8):
  - ditawarkan selepas **3 cubaan salah**;
  - membina langkah kaedah bertulis daripada nombor soalan itu sendiri (tambah, tolak dengan pinjam, darab, bahagi);
  - soalan cerita bermula dengan memilih ayat matematik;
  - selepas SIAP, butang "Cuba soalan serupa →" memberi soalan baharu jenis yang sama.
- **Liputan semasa:** "Jom tengok cara" kini ada dalam **Gudang Harta** (Nombor & Operasi). Mini-game lain belum.
- **Akses:** mini-game Kemahiran Fokus termasuk dalam pakej **Family Plus** (`demo-wrapup-v1.js`), dan tiada bayaran berasingan untuk bimbingan Wira. Atas sebab itu teks "tanpa kos tambahan" disertai nota kecil *"Mini-game Kemahiran Fokus dalam pakej Family Plus."* Tiada harga dalam video.

## Storyboard

| Masa | Visual | Teks |
| --- | --- | --- |
| 0:00–0:03.4 | Muka emas senyum → masam | **Ajak buat matematik,** … **terus muka berubah?** |
| 0:03.4–0:06 | Kad Pilih Darjah → Darjah 2 → Masuk | Cuba tunjuk **Pahlawan Angka.** |
| 0:06–0:08.6 | Portal | Anak main **satu cabaran.** |
| 0:08.6–0:10.6 | S1 betul → Wira serang | Jawab betul, **Wira serang!** |
| 0:10.6–0:15.2 | Cerita pensel: pilih 487 ✗ → petunjuk dinaikkan | Kalau **salah?** → Tak apa. **Ada petunjuk.** |
| 0:15.2–0:18.6 | Pilih 37 ✗ → petunjuk lagi | Masih tak boleh? **Tak apa.** |
| 0:18.6–0:21.7 | JATUH (Wira jatuh ke pusaran Matematik) | Masuk **mini-game,** cuba lagi. |
| 0:21.7–0:29.4 | Gudang Harta: taip 79, 89, 99 → Semak. Pil jejak **Cuba 1 ✗ Cuba 2 ✗ Cuba 3 ✗** | Topik sama, **dunia lain.** → Cuba, cuba lagi… **3 kali salah?** |
| 0:29.4–0:31.7 | Butang **Jom tengok cara** diketuk | Wira terus **tunjuk cara.** |
| 0:31.7–0:38.6 | 6 langkah Wira; arahan "Pinjam 1 dari tempat puluh" → "7 jadi 17." dinaikkan | Langkah demi **langkah.** |
| 0:38.6–0:41.1 | **SIAP! Cara Wira · 69** | Macam kelas tambahan dengan **Wira, tanpa kos tambahan.\*** · *\*Mini-game Kemahiran Fokus dalam pakej Family Plus.* |
| 0:41.1–0:44.6 | Kembali ke battle: **Jurus Penamat** → AURORA BEBAS! | Dah faham? **Terus menang!** |
| 0:44.6–0:47.3 | BERJAYA! 14/14 | Terus nampak **hasilnya.** |
| 0:47.3–0:49.9 | Muka kembali besar, senyum lebar | Tengok gameplay dulu… **baru decide.** |
| 0:49.9–0:54 | Kad akhir | Satu cabaran. **Tiada akaun diperlukan.** · Cuba Demo |

Ikon muka bertindak balas sepanjang video: ragu-ragu → berminat → risau bila salah → lega bila Wira tunjuk cara → gembira.

## Render

```bash
# pelayan app (worktree main) di 127.0.0.1:8765
cd capture && export NODE_PATH=$(npm root -g)
node capture.js        /rakaman/full_hd 99 3 7                # DM
node capture_salah.js  /rakaman/salah_hd 11                   # SL
node capture_gudang.js /rakaman/gudang_tolak_hd d2-tolak separate 5   # GH
# setiap folder: ffmpeg -framerate 30 -i f_%05d.jpg -c:v libx264 -crf 13 → $PROMO_BUILD/src_DM|SL|GH.mp4
python3 engine.py timeline_kelas --out out/promo8b-kelas-wira.mp4 --workers 4
```
