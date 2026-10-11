# Promo #2 — "Kemahiran Fokus" (30 s, 9:16)

Timeline: `timeline_fokus.py` · Enjin: `engine.py` · Muzik: `music.py` (asli, tiada hak cipta pihak ketiga).

**Sasaran:** ibu bapa. **Mesej:** latihan yang tepat sasaran, bukan sekadar banyak latihan. Perkataan "lemah" tidak digunakan.

## Sumber

`Screen_Recording_20261011_160959_Chrome` (F), 1080 × 2340.

| Bahagian | Status |
| --- | --- |
| F 0.8–1.4 s | Panel Kemahiran Fokus. Digunakan |
| F 1.6–3.05 s | Pop-up Chrome "Save password?" yang memaparkan e-mel akaun. **Tidak digunakan** |
| Hub profil (F 0–0.6) | Dilangkau |
| PIN | Hanya kelihatan sebagai titik |

## Copy & storyboard

| Masa | Visual | Teks skrin |
| --- | --- | --- |
| 0:00–0:02 | Tipografi kinetik; "bertimbun" terhempas sebagai timbunan 4 lapis | **Worksheet dah bertimbun** |
| 0:02–0:04 | "sama?" bergoyang (bunyi *boing*) | **result tetap sama?** |
| 0:04–0:06 | "sasaran." dipintal, kemudian semua disedut hilang | Mungkin bukan kurang latihan. **Tapi salah sasaran.** |
| 0:06–0:11.6 | Panel Kemahiran Fokus; ketepatan 20% → 28% → 31% disorot; kad "Fokus utama · Masalah ukuran" diangkat | KEMAHIRAN FOKUS / **Detect topik yang anak perlukan perhatian lebih** / Ikut ketepatan jawapan anak sendiri. |
| 0:11.6–0:14 | Menara Kembara Dimensi | MISI IKUT FOKUS / **Terus latih topik tu. Bukan tembak rambang.** |
| 0:14–0:20 | Soalan "RM41.25 dibahagi 5 orang" → jawapan salah → petunjuk diangkat → "Betul! Kunci retak." | BIMBINGAN / **Salah? Ada petunjuk. Cuba lagi sampai faham.** |
| 0:20–0:24.5 | Anak tekan butang keluar → kotak **Kunci battle aktif** diangkat dan bergoyang (bunyi *buzz*) | KUNCI BATTLE · KAWALAN IBU BAPA / **Nak keluar? Kena PIN mak ayah dulu.** / Mak ayah boleh kunci battle dengan PIN sendiri. |
| 0:24.5–0:26 | Kembali ke battle | **Fokus sampai topik tu kukuh.** |
| 0:26–0:30 | Penutup: Wira di tepi kotak | **Shhh…** (bunyi bisikan) / Anak rasa main, kita tahu dia belajar. / **Cuba Demo Sekarang** |

## Dakwaan

| Dakwaan | Bukti dalam rakaman |
| --- | --- |
| "Detect" | Senarai topik disusun ikut ketepatan, dan topik pertama berlabel "Fokus utama" |
| Misi ikut fokus | Misi "Bahagi wang" ialah topik ke-2 dalam senarai Fokus |
| Petunjuk | "Belum tepat. Bahagi jumlah wang kepada kumpulan yang sama banyak." |
| Kunci battle | "Kunci battle aktif — Masukkan PIN ibu bapa untuk buka kunci battle" dan "Keluar dari battle? Masukkan PIN ibu bapa untuk teruskan keluar" |

Video ini tiada janji markah naik.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build      # src_F.mp4 + aud_F.wav (crop=1080:2236:0:104, 30 fps)
python3 engine.py timeline_fokus --out out/promo2-fokus-30s.mp4 --workers 4
```
