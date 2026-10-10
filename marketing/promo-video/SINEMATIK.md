# Pahlawan Angka — Promo Sinematik (v2)

Versi kedua video promo yang menggantikan draf "phone showcase" pertama. Gayanya diambil daripada video rujukan pelancaran aplikasi (Medilo):

- babak berwarna jenama;
- teks kinetik;
- rakaman skrin sebenar dalam telefon 3D;
- bahagian UI yang "terangkat" keluar sebagai kad terapung.

| Fail | Isi |
| --- | --- |
| `engine.py` | Enjin render: telefon 3D (ketebalan, kilauan kaca, bayang, motion blur), callout UI, teks kinetik, wipe jubin `+ − × ÷`, kad 3D, halaman PDF 3D, kad logo |
| `music.py` | Muzik latar asli disintesis dalam kod (120 BPM, D major). Tiada sampel luar, jadi tiada isu hak cipta |
| `timeline_main.py` | Versi utama 64 s |
| `timeline_cut30.py` | Versi ringkas 30 s |

Video akhir dihantar terus kepada pemilik projek dan tidak disimpan dalam git.

## Bahan sumber

| Kod | Rakaman | Isi yang digunakan |
| --- | --- | --- |
| A | `Screen_Recording_20261010_234227` | Hub Cica, kad Kembara Dimensi, Kemahiran Fokus, Teman Aktif |
| T | `…_234245` | Peta Topik Darjah 1, penguasaan keseluruhan, 8 topik |
| K | `…_234314` | Khazanah (3/6 diselamatkan), Evolusi Bara |
| B | `…_234634` | Tekan Mula Kembara, sinematik menara. **Tidak guna 1.5–3.5 s (e-mel)** |
| C | `…_234759` | Kunci Perak pecah, soalan → pagi → Jurus Penamat → KUKUPAT DITEMUI, BERJAYA + Cikgu Dimensi |
| P | `…_234931` | Ringkasan Anak, Laporan Kemahiran, Had Masa Bermain, Latihan + skema. **Tidak guna 0–1.5 s (PIN) dan > 22.1 s (notifikasi muat turun)** |
| O | `video_2026-10-10_23-20-39` (590p, dinaikkan) | Hanya Kunci Gangsa dan menaip jawapan Kunci Emas, kerana dua detik ini tiada dalam rakaman HD |
| PDF | `latihan-…-cica.pdf`, `…-dengan-skema.pdf` | Halaman 1 latihan, halaman 5 skema |
| Aset repo | `assets/pets/…`, `assets/ui/trophies-v1/…`, logo | Kad enam teman, kad trofi, logo |

## Storyboard — versi utama 64 s (1 bar = 2 s)

| Masa | Babak / latar | Telefon & kamera | Callout / grafik | Teks | Muzik |
| --- | --- | --- | --- | --- | --- |
| 0:00–0:03.6 | Krim | — | Jubin `+ − × ÷` terapung | **Bila matematik / jadi / pengembaraan…** (taip + garis luar kabur→tajam) | Intro |
| 0:03.6–0:06 | Navy, wipe jubin × | — | Logo muncul | MATEMATIK KSSR · DARJAH 1–6 / Dalam Bahasa Melayu | Riser |
| 0:06–0:12 | Gelap | Masuk dari sudut −38° → hampir depan; push-in 1.7× ke Jurus Penamat | Kad soalan "Matahari baru terbit…" terangkat (0:06.4–0:07.5) | JAWAB SOALAN / Jawapan betul, wira beraksi! | **Drop** + kilat 0:07.8 |
| 0:12–0:16 | Krim, wipe ÷ | Condong 14°, ke kanan | Kad Kembara Dimensi, Kemahiran Fokus, Teman Aktif terangkat | KEMBARA DIMENSI / Latihan ikut kemampuan anak | Groove |
| 0:16–0:19 | Krim | Condong −10° | Kad Laluan Topik "Penguasaan keseluruhan 86%" | PETA TOPIK / Penguasaan setiap topik dipantau | Groove |
| 0:19–0:22 | Krim | Highlight Mula Kembara → push-in menara → BERJAYA | Gelembung Cikgu Dimensi "Syabas, Cica!…" | CIKGU DIMENSI / Pilih misi & beri semangat | Groove |
| 0:22–0:32 | Navy, wipe − | Zoom 1.6–1.8× ke segel → maklum balas → ruang taip | Pil Gangsa (0:23.6) → Perak (0:25.3) → Emas (0:25.8) | TIGA TAHAP KUNCI · Kunci Emas: taip jawapan sendiri | **Drop** |
| 0:32–0:36 | Navy | Khazanah 3/6 → telefon undur | 6 kad teman 3D (aset sebenar) | KHAZANAH / Enam teman untuk dikumpul | Groove |
| 0:36–0:41.6 | Gelap, wipe + | Masuk dari kanan, push-in perlahan 1.32× | — | EVOLUSI TEMAN / Teman berkembang bersamamu | Break → **drop tepat pada rupa Bara (0:40)** |
| 0:41.6–0:44.6 | Emas, wipe × | — | 6 kad trofi 3D (aset sebenar) | KHAZANAH · TROFI / Trofi untuk setiap pencapaian | Drop |
| 0:44.6–0:47.6 | Krim, wipe ÷ | Masuk dari bawah | Kad "Yang semakin kuat / Fokus seterusnya" | UNTUK IBU BAPA / Lihat perkembangan anak | Ringan |
| 0:47.6–0:50.2 | Krim | Condong 8° | Kad Pratonton kemahiran utama | LAPORAN KEMAHIRAN / Kekuatan & fokus seterusnya | Ringan |
| 0:50.2–0:54.4 | Krim | Condong −8° | Kad Had Masa Bermain (30/30/15 minit, kunci) | **CONTOH TETAPAN IBU BAPA** / Ibu bapa tentukan masa bermain | Ringan |
| 0:54.4–0:56 | Krim | Depan | Highlight Latihan + skema | WORKSHEET / Muat turun latihan bercetak | Ringan |
| 0:56–1:00 | Navy, wipe + | Telefon jatuh ke bawah | 2 halaman PDF sebenar terbang keluar | WORKSHEET PDF / Sambung latihan atas kertas | Groove → riser |
| 1:00–1:04 | Emas, wipe × | — | Logo + tagline + butang | Pengembaraan matematik ikut kemampuan anak. / **Cuba demo Pahlawan Angka** | Hentakan akhir |

Bunyi permainan asal hanya digunakan pada detik penting, iaitu Jurus Penamat, segel pecah, menaip + serangan, dan evolusi. Muzik direndahkan sedikit (ducking) ketika bunyi itu dimainkan. Audio dinormalkan ke −14 LUFS.

## Voice-over

Persekitaran render tidak dapat mencapai sebarang perkhidmatan atau model suara (TTS) kerana disekat oleh rangkaian. Seperti video rujukan, versi ini bergantung pada muzik dan teks kinetik, tanpa VO.

Jika VO mahu ditambah, rakam atau jana menggunakan skrip di bawah, kemudian campurkan pada −14 LUFS dengan muzik direndahkan ~8 dB. Timing sudah selari dengan babak.

| Masa | VO |
| --- | --- |
| 0:00 | Bila matematik jadi pengembaraan… |
| 0:04 | Pahlawan Angka — Matematik KSSR Darjah 1 hingga 6. |
| 0:06.5 | Jawab betul, wira terus beraksi! |
| 0:12.3 | Dalam Kembara Dimensi, Cikgu Dimensi pilih latihan ikut kemampuan anak. |
| 0:16.3 | Penguasaan setiap topik dipantau. |
| 0:19.3 | Misi berkembang bersama kemajuan mereka. |
| 0:22.3 | Harungi Gangsa, Perak dan Emas — ada jawapan yang perlu ditaip sendiri! |
| 0:32.3 | Kumpul enam teman… |
| 0:36.5 | …dan lihat mereka berkembang. Evolusi Bara! |
| 0:41.8 | Kumpul trofi untuk setiap pencapaian. |
| 0:44.8 | Ibu bapa boleh lihat kekuatan anak dan fokus latihan seterusnya. |
| 0:50.4 | Tentukan masa bermain, dan aktifkan kunci apabila had dicapai. |
| 0:54.6 | Dah cukup masa skrin? Muat turun worksheet dan sambung atas kertas. |
| 1:00.2 | Pahlawan Angka. Pengembaraan matematik ikut kemampuan anak. Cuba demo sekarang! |

## Semakan

- **Motion lock:** skrin, bezel, sisi telefon, highlight dan titik mula callout diunjur oleh `Pose` yang sama setiap bingkai.
- **Tiada regangan:** skrin mockup mengikut nisbah rakaman 1080 : 2236.
- **Maklumat peribadi:** e-mel akaun, PIN ibu bapa dan notifikasi muat turun (yang memaparkan domain) tidak digunakan. Nama profil Cica dan Baba masih kelihatan, jadi sahkan ia profil demo.
- **Dakwaan:**
  - Had masa dilabel "Contoh tetapan ibu bapa".
  - Tiada harga atau dakwaan "percuma", walaupun Laporan berlabel PLUS dan Latihan berlabel PRO.
  - Tiada dakwaan pengiktirafan KPM.
  - Teman tidak menjawab untuk pemain.
- **Kad trofi:** skrin tab Trofi tidak dirakam, jadi kad trofi menggunakan aset trofi sebenar daripada repo, bukan rakaman skrin.
- **Kad teman:** nama "Kurapat" pada kad Khazanah ialah nama yang ditukar oleh pengguna melalui butang "Tukar nama". Kad 3D menggunakan nama asal, Kukupat.

## Render semula

```bash
export PROMO_BUILD=/laluan/ke/build          # tempat src_*.mp4, aud_*.wav, pdf_*.png
# footage HD: 30 fps tetap, buang status bar (104 px)
ffmpeg -i Screen_Recording_…mp4 -vf "fps=30,crop=1080:2236:0:104" -c:v libx264 -crf 13 -an $PROMO_BUILD/src_X.mp4
ffmpeg -i Screen_Recording_…mp4 -vn -ac 2 -ar 48000 $PROMO_BUILD/aud_X.wav
# footage 590p lama (O): crop=590:1223:0:57, scale=1080:2236:flags=lanczos
pdftoppm -r 120 -png -f 1 -l 1 latihan-…-cica.pdf $PROMO_BUILD/pdf_ws
pdftoppm -r 120 -png -f 5 -l 5 latihan-…-dengan-skema.pdf $PROMO_BUILD/pdf_sk

python3 engine.py timeline_main --frames 7.0,40.0 --out semak     # bingkai semakan
python3 engine.py timeline_main --out out/promo-main.mp4 --workers 4
python3 engine.py timeline_cut30 --out out/promo-30s.mp4 --workers 4
```

Keperluan: Python 3, `numpy`, `opencv-python-headless`, `Pillow`, `scipy`, ffmpeg, fon Inter.
