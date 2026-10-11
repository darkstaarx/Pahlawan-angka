# Promo #2 — "Kemahiran Fokus" (46 s, 9:16)

Timeline: `timeline_fokus.py` · Enjin: `engine.py` · Muzik: `music.py` (asli, tiada hak cipta pihak ketiga).

**Sasaran:** ibu bapa.

**Mesej:** Kemahiran Fokus ialah *adaptive learning*. App memerhati setiap jawapan, menganalisis coraknya, kemudian sendiri mencadangkan 3 topik untuk dilatih. Topik tidak dipilih secara manual. Perkataan "lemah" tidak digunakan.

## Cara Kemahiran Fokus berfungsi (dari kod, `js/guardian-focus.js` di `main`)

- Setiap jawapan direkod dengan salah satu hasil: *betul sendiri*, *betul selepas cuba lagi*, *perlukan bantuan* atau *belum selesai*. Mod demo dan dev tidak dikira.
- App menilai **20 jawapan terkini** bagi setiap kemahiran. Kemahiran dinilai selepas sekurang-kurangnya 5 jawapan daripada 2 soalan berbeza.
- Ketepatan = peratus *betul sendiri*. Kemahiran yang mencapai **80% ke atas** keluar dari senarai.
- Kemahiran yang tinggal disusun mengikut keperluan. 3 teratas dipaparkan, dan yang pertama dilabel "Fokus utama".
- Ciri ini dikawal oleh `requireFeature('focus')` (ciri berbayar), jadi video tidak menyebut "percuma".

## Sumber

| Kod | Rakaman | Nota |
| --- | --- | --- |
| F | `Screen_Recording_20261011_160959` | Kemahiran Fokus, misi Bahagi wang, Kunci battle. **F 1.6–3.05 s tidak digunakan** (pop-up "Save password" memaparkan e-mel). |
| R | `Screen_Recording_20261011_170834` | Ibu Bapa: Ringkasan & Laporan Kemahiran untuk profil yang sama. Rakaman bermula selepas PIN dimasukkan. |

Data kedua-dua rakaman konsisten. Ringkasan menunjukkan "Fokus seterusnya: Bahagi wang · 26% betul sendiri", dan Bahagi wang ialah Fokus #2 (28%). Laporan pula menyenaraikan Bahagi wang, Masalah wang dan Masalah ukuran sebagai kemahiran yang perlu perhatian. Peratus laporan (ketepatan sepanjang masa) berbeza daripada peratus Fokus (20 jawapan terkini), jadi video menonjolkan **nama topik**, bukan perbandingan peratus.

## Storyboard

| Masa | Babak | Visual | Teks skrin |
| --- | --- | --- | --- |
| 0:00–0:06 | Hook | Tipografi kinetik: timbunan "bertimbun", "sama?" bergoyang, "sasaran." dipintal | Worksheet dah **bertimbun** · result tetap **sama?** · Mungkin bukan kurang latihan. Tapi salah **sasaran.** |
| 0:06–0:13 | App memerhati | Senarai kemahiran sebenar. Dua bukti diangkat keluar: "Rangkaian nombor · 14/17 betul sendiri · 1 selepas bantuan/cuba semula", "Menganggar · 9/18 betul sendiri · 3 selepas bantuan/cuba semula" | LAPORAN KEMAHIRAN / **Setiap jawapan anak direkod.** / Betul sendiri? Selepas bantuan? Semua dikira. |
| 0:13–0:20 | App menganalisis | "Pratonton kemahiran utama" (Bahagi wang, Masalah wang, Tambah hingga 1000, Masalah ukuran), kemudian Ringkasan: "Cikgu Dimensi membaca corak jawapan, bukan sekadar markah." dan "Fokus seterusnya: Bahagi wang" | CIKGU DIMENSI / **Corak jawapan anak dianalisis.** / Bukan sekadar markah, tapi cara anak menjawab. |
| 0:20–0:25.5 | App mencadangkan | Drop muzik. Panel Kemahiran Fokus muncul; 20% → 28% → 31% disorot; kad "Fokus utama" diangkat | KEMAHIRAN FOKUS / **Lalu app cadangkan 3 topik untuk dilatih.** / Ikut 20 jawapan terkini. Bukan teka, bukan pilih manual. |
| 0:25.5–0:31.5 | Latih | Bahagi wang: jawapan salah → petunjuk diangkat → "Betul! Kunci retak." | BIMBINGAN / **Latihan terus ke topik tu. Salah? Ada petunjuk.** |
| 0:31.5–0:36 | Kunci | Butang keluar → "Kunci battle aktif" bergoyang (bunyi *buzz*) | **Nak keluar? Kena PIN mak ayah dulu.** / Mak ayah boleh kunci battle dengan PIN sendiri. |
| 0:36–0:42 | Adaptive | **Ilustrasi** (berlabel): 3 kad Fokus sebenar → kad 1 dicop "✓ Dah kukuh" dan keluar → kad lain naik → slot "Topik seterusnya" | ADAPTIVE / **Dah kukuh? Topik tu keluar sendiri.** / Fokus beralih ke topik seterusnya. |
| 0:42–0:46 | Penutup | Wira di tepi kotak, bunyi bisikan | **Shhh…** Anak rasa main, kita tahu dia belajar. / Cuba Demo Sekarang |

## Render

```bash
export PROMO_BUILD=/laluan/ke/build      # src_F.mp4, src_R.mp4 (crop=1080:2236:0:104, 30 fps) + aud_F.wav
python3 engine.py timeline_fokus --out out/promo2-fokus.mp4 --workers 4
```
