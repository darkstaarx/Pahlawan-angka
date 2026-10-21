# Promo #8 — "Cuba Dulu" (36 s, 9:16)

Hook: **"Ajak buat matematik, terus muka berubah?"**

Mesej: tunjuk Pahlawan Angka kepada anak. Anak main satu cabaran, jawab soalan Matematik, dan lihat apa yang berlaku selepas itu. Tengok gameplay dulu, baru decide sama ada sesuai untuk anak.

| Fail | Isi |
| --- | --- |
| `timeline_cuba.py` | Timeline |
| `motion_fx.py` | Elemen motion baharu: `Face` (ikon muka emas dengan ekspresi), `RiseText` (teks naik bertopeng), `TapRings` (riak ketukan pada lokasi sebenar) |
| `capture/capture.js` + `capture/vtime-shim.js` | Perakam Demo bingkai demi bingkai (1080×2236, jam maya) |
| `srt/promo-cuba.srt` | Sari kata / panduan VO |

## Gaya

Gaya ini ialah iklan app ala Duolingo (UI sebenar, teks kinetik besar, maskot yang bertindak balas), dengan tatabahasa daripada [claude-motion-design](https://github.com/howseen-ai/claude-motion-design):

- **Satu bentuk dari awal ke akhir.** Ikon muka emas muncul di hook dan berubah masam pada "terus muka berubah?". Ia kemudian mengecil menjadi "penonton" di sudut skrin dan bertindak balas: ragu-ragu → berminat bila Wira menyerang → risau bila salah → gembira bila betul. Akhirnya ia kembali besar dengan senyuman lebar di penutup. Muka itu sendiri ialah jawapan kepada hook.
- **Teks naik bertopeng** perkataan demi perkataan (sela 55 ms, spring redaman 0.72), satu warna aksen (emas), dan dua baris pendek pada satu masa.
- **Satu benda bergerak pada satu masa.** Tiada teks semasa Jurus Penamat, supaya detik itu bernafas.
- **UI sebenar.** Riak ketukan diletak pada lokasi ketukan sebenar dan bergerak bersama pose telefon. Bunyi game asal (betul, salah, tebasan, guruh, Jurus Penamat, syiling, stinger) diletak pada masa sebenar yang dilog semasa rakaman.

## Rakaman Demo (sumber DM)

Demo sebenar (`main` terkini, Darjah 2) dirakam dengan Playwright dan jam maya. Kaedahnya:

- `performance.now`, `Date`, timer, `requestAnimationFrame` dan animasi CSS hanya bergerak bila `__advance(1/30 s)` dipanggil;
- setiap bingkai ditangkap pada 1080×2236 penuh, walaupun render perisian perlahan;
- semua sambungan luar (analitik Supabase) disekat semasa rakaman, jadi data funnel sebenar tidak terjejas.

| Masa rakaman | Detik |
| --- | --- |
| 0–2.4 | Kad **DEMO BATTLEFIELD · Pilih Darjah** ("Demo ringkas untuk rasa tahap soalan — bukan ujian penuh. Tiada akaun atau progres diperlukan."), ketuk Darjah 2, kemudian Masuk ke Battlefield |
| 2.5–5.3 | Soalan 1, Isi Padu Cecair: betul → serangan |
| 8.0–13.5 | Soalan 3, Baca Jam: 3:45 salah → "Belum tepat. Jarum pendek menunjukkan jam; jarum panjang menunjukkan minit." → 3:35 betul → KUNCI GANGSA PECAH |
| 50.5–54 | Soalan 10, Kunci Emas: taip 600 → Jawab |
| 66.5–76.8 | Soalan 14: taip RM2.60 → **Jurus Penamat** → **AURORA BEBAS!** → syiling |
| 76.9– | **BERJAYA!** 3 bintang · 14/14 · 100% · "Demo Darjah 2 · 14/14 soalan · 9 topik diteroka. Keputusan ini tidak disimpan." · Cikgu Dimensi |

- Sinematik portal ialah `enter.mp4`, iaitu video yang sama dimainkan app semasa masuk battlefield (`js/segel-entry-cinematic-v1.2.0.js`). Chromium tanpa H.264 melangkaunya semasa rakaman, jadi ia disisipkan semula dalam suntingan.
- Skrin rating dan pakej harga selepas demo (`demo-wrapup-v1.js`) **tidak dirakam**.
- Landing page (butang "Cuba Demo Percuma" dan harga) juga tidak ditunjuk.

## Storyboard

| Masa | Visual | Teks |
| --- | --- | --- |
| 0:00–0:03.4 | Muka emas senyum → berubah masam / malas | **Ajak buat matematik,** … **terus muka berubah?** |
| 0:03.4–0:06.2 | Muka mengecil ke sudut. Telefon naik dengan kad Pilih Darjah, ketuk Darjah 2 → Masuk ke Battlefield | Cuba tunjuk **Pahlawan Angka.** |
| 0:06.2–0:09.6 | Portal (skrin penuh) | Anak main **satu cabaran.** |
| 0:09.6–0:12 | Soalan 1 → ketuk → Wira serang | Jawab soalan **matematik…** |
| 0:12–0:16.4 | Soalan Jam: salah → petunjuk dinaikkan → betul → Kunci Gangsa pecah | Salah? **Ada petunjuk.** → Cuba lagi… **betul!** |
| 0:16.4–0:19.6 | Kunci Emas: taip 600 → Jawab → serang | Kunci Emas? **Taip sendiri.** |
| 0:19.6–0:26.4 | Taip RM2.60 → zoom perlahan ke arena: **Jurus Penamat** → AURORA BEBAS! → syiling | Dan tengok apa **jadi lepas tu…** |
| 0:26.4–0:30.2 | **BERJAYA!** Statistik dan ringkasan demo dinaikkan, kemudian pesanan Cikgu Dimensi | Terus nampak **hasilnya.** |
| 0:30.2–0:32.6 | Muka kembali besar, senyum lebar | Tengok gameplay dulu… **baru decide.** Sesuai ke tak untuk anak. |
| 0:32.6–0:36 | Kad akhir: logo, Wira, butang | Satu cabaran. **Tiada akaun diperlukan.** · Cuba Demo · Pilih darjah, terus ke battlefield. |

## Semakan

- **Teks app sebenar:** "Tiada akaun" dan "Pilih darjah, terus ke battlefield" diambil daripada teks app sebenar (`demo-mode-v3.56.0.js`). "Satu cabaran" datang daripada skrip pemilik, dan memang tepat untuk satu pusingan demo.
- **Tiada harga dalam video.** App kini memaparkan "Cuba Demo Percuma", tetapi video ini tidak menyebut "percuma". Tambah hanya jika pemilik setuju.
- **Hero:** Wira sahaja.
- **Maklumat peribadi:** tiada e-mel, PIN atau nama murid sebenar. Nama pemain ialah "Demo".

## Render

```bash
# 1. pelayan app (worktree main) di 127.0.0.1:8765, kemudian:
NODE_PATH=$(npm root -g) node capture/capture.js /laluan/rakaman 99 3     # 99 = semua soalan, 3 = soalan dijawab salah dahulu
ffmpeg -framerate 30 -i /laluan/rakaman/f_%05d.jpg -vf "scale=1080:2236,format=yuv420p" -c:v libx264 -crf 13 $PROMO_BUILD/src_DM.mp4
# bunyi game: assets/audio/*.wav|mp3 → $PROMO_BUILD/aud_GS_<nama>.wav (48 kHz stereo)
python3 engine.py timeline_cuba --out out/promo8-cuba-dulu.mp4 --workers 4
```
