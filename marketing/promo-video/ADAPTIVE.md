# Promo #7 — "Adaptive" (45 s, 9:16)

Video pendek untuk **ibu bapa**: Pahlawan Angka faham anak.

Gaya tenang dan sinematik, dengan ciri-ciri berikut:

- shot panjang dan gerakan kamera perlahan;
- latar arena yang kabur di belakang telefon;
- muzik ringan, dan drop hanya pada Jurus Penamat;
- teks yang sempat dibaca.

| Fail | Isi |
| --- | --- |
| `timeline_adaptive.py` | Timeline, termasuk dua grafik baharu: `Trail` (jejak cubaan ✗ ✗ ✓ ✓) dan `Steps` (kad penerangan) |
| `srt/promo-adaptive.srt` | Sari kata / panduan masa VO |

## Sumber

**AD** ialah `adaptive.mp4`, rakaman pemilik (620×1280, 32 s, bermula di Soalan 6). Ia dinaikkan ke 1080×2236 pada 30 fps.

| Masa sumber | Soalan | Kemahiran / cara | Jawapan anak |
| --- | --- | --- | --- |
| 8.4–14.8 | 9 | Pecahan Wajar, **model bar** | 3/6 ✗, 2/10 ✗ |
| 14.8–18.8 | 10 | Pecahan Set Objek, **set objek** | 1/2 ✗, 1/3 ✗ |
| 18.8–22.1 | 11 | Bina Pecahan, **ayat** | 1/2 ✓ → Betul! Kunci retak. |
| 22.2–32.4 | 12 | Pecahan, **lorek kertas** | ✓ → Kunci EMAS pecah → Jurus Penamat → AURORA DITEMUI |

Rakaman ini tiada e-mel, PIN atau notifikasi.

Selain AD, video ini guna klip JATUH (sinematik Wira) dan G4, iaitu mini game Kedai Kek (⅓ = 3/9 → HEBAT).

## Fakta daripada kod

- **Soalan 9, 10 dan 11 ialah kemahiran yang sama** (`D2.3.1`, Tahun 2 Pecahan Wajar). Penjana soalan memutar cara soalan, `rotate(id, ['bar_model','object_set','verbal_part', …])` (`questions/kssr-content-v3.11.js`). Itu sebab tajuk pada skrin bertukar (Pecahan Wajar → Pecahan Set Objek → Bina Pecahan) walaupun kemahirannya sama.
- **Maklum balas salah menerangkan konsep tanpa memberi jawapan.** Contohnya: "Pengangka ialah bahagian berlorek; penyebut ialah jumlah semua bahagian sama besar." dan "Kira objek hijau dan jumlah semua objek."
- **Soalan semakan** (`js/engine/intervention.js`):
  - jawapan yang tidak selesai dijadualkan 2 soalan semakan baharu bagi kemahiran yang sama;
  - jawapan yang betul selepas cuba lagi dijadualkan 1 soalan semakan.
- **Naik kemahiran** (`js/engine/frontier.js`): kemahiran hanya dikira kukuh selepas jawapan betul berturut-turut, tanpa petunjuk, dalam lebih daripada satu bentuk soalan. Barulah coach beralih ke kemahiran seterusnya.
- **Mini game** dibuka melalui Kemahiran Fokus, iaitu ciri akaun berbayar `focus`. Kemahiran Fokus menyenaraikan kemahiran yang belum mencapai 80% dalam 20 jawapan terkini.

## Storyboard

| Masa | Visual | Teks skrin |
| --- | --- | --- |
| 0:00–0:03 | Telefon masuk perlahan, Soalan 9 (model bar) | PAHLAWAN ANGKA · ADAPTIVE / **Apa jadi bila anak salah?** |
| 0:03–0:07.4 | Anak pilih 3/6 (salah). Penerangan app dinaikkan di atas arena. Pil jejak pertama jadi ✗ | PECAHAN · CUBAAN 1 / Anak tersilap. / App terangkan kenapa, tanpa beri jawapan. |
| 0:07.4–0:12.6 | Soalan 10 (set objek), anak salah lagi. Pil kedua ✗ | TOPIK SAMA · CARA LAIN / **App tak terus tukar topik.** |
| 0:12.6–0:17.6 | Soalan 11 (ayat), 1/2 betul → Wira serang → Betul! Kunci retak. Pil ketiga ✓ | Pecahan lagi… kali ni, betul! / Faham, bukan hafal. |
| 0:17.6–0:25.4 | Soalan 12 (lorek) betul. Pil keempat ✓. Zoom perlahan ke **Jurus Penamat** → AURORA DITEMUI | Betul lagi, sendiri. → KUNCI EMAS PECAH / **Faham dulu… baru menang besar!** |
| 0:25.4–0:31 | 3 kad penerangan: ✗ Salah? Topik sama datang balik, dengan soalan baharu · ↻ Cara soalan bertukar · ✓ Betul berturut-turut tanpa petunjuk? Baru naik kemahiran | CARA PAHLAWAN ANGKA FAHAM ANAK / Bukan sekadar betul atau salah. |
| 0:31–0:34 | **JATUH**: Wira jatuh ke pusaran Matematik → bola cahaya | MASIH BELUM KUKUH? / Kemahiran Fokus bawa anak… |
| 0:34–0:40 | Mini game **Kedai Kek**: ⅓ = 3/9 → HEBAT | MINI-GAME PECAHAN · KEDAI KEK / …ke dunia Pecahan sendiri. |
| 0:40–0:45 | Kad akhir: logo, Wira, butang | **Pahlawan Angka faham anak anda.** · Cuba Demo Sekarang |

## Semakan

- **Dakwaan:**
  - Tiada harga, "percuma" atau pengiktirafan KPM, dan perkataan "lemah" tidak digunakan.
  - Peraturan pada kad penerangan diringkaskan daripada kod di atas.
- **Hero:** Wira sahaja.
- **Nota Demo:** mini game perlukan akaun berbayar, sedangkan butang akhir ialah "Cuba Demo Sekarang". Semak keselarasannya dengan tawaran sebenar.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build
ffmpeg -i adaptive.mp4 -vf "fps=30,scale=1080:2236:flags=lanczos" -c:v libx264 -crf 14 -an $PROMO_BUILD/src_AD.mp4
ffmpeg -i adaptive.mp4 -vn -ac 2 -ar 48000 $PROMO_BUILD/aud_AD.wav
# src_JATUH.mp4 / aud_JATUH.wav: lihat GAMEPLAY.md; src_G4.mp4 / aud_G4.wav: lihat AZ.md
python3 engine.py timeline_adaptive --out out/promo7-adaptive.mp4 --workers 4
```
