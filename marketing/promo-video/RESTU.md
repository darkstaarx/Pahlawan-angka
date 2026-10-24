# Promo #9 — "Bukan Teka" (66.6 s, 9:16)

Mesej: **animasi cantik, ciri power.** Penutup: **"App yang betul-betul mengajar. Bukan main semata."**

**Versi 2 (maklum balas pemilik):** bahagian "tunjuk cara" terlalu laju, sedangkan inilah kelebihan utama app.

- Kini ia menggunakan soalan paling mudah, cerita tolak Tahun 1 *"Kumbis ada 40 anak panah. 3 patah semasa latihan. Berapa yang tinggal?"* (40 − 3 = 37).
- Soalan itu dirakam dengan rentak 3.6 s setiap langkah dan dimainkan pada **kelajuan sebenar (1×)**, kira-kira 25 s.
- Setiap langkah diberi label **LANGKAH 1/4 … 4/4**, dan arahan Wira diangkat besar terus dari skrin app.
- "0 jadi 10" diperlahankan 0.5×.
- Selepas SIAP, "Cuba soalan serupa →" menunjukkan anak cuba sendiri.

- Pahlawan Angka perasan bila anak teka-teka. Wira jatuh ke **Portal Restu**, dan mak ayah nampak setiap tekaan.
- Ia bukan sekadar menghalang teka. **9 mini-game** dan **"Jom tengok cara"** bantu anak faham cara selesaikan soalan dengan betul.

| Fail | Isi |
| --- | --- |
| `timeline_restu.py` | Timeline |
| `capture/capture_restu.js` | Perakam battle Demo: tekaan laju, amaran Cikgu, Portal Restu, PIN, SEMAKAN, Teruskan main → BERJAYA |
| `srt/promo-restu.srt` | Sari kata / panduan VO |

## Ciri baharu dalam app (main 5c579d5) yang ditonjolkan

| Ciri | Kod | Dalam video |
| --- | --- | --- |
| Banner baharu bila segel pecah, contohnya "GANGSA / PECAH!" | `segel-demo-v2.1.0.js` (#115, #117) | 0:06 "Jawab betul, kunci pecah!" |
| Amaran Cikgu Dimensi selepas **2 tekaan laju** berturut-turut: "Perlahan sikit, wira! Baca soalan dulu, baru tekan jawapan." | `js/rapid-lock-v1.js` (`WARN_AT=2`) | 0:12.7 "Cikgu Dimensi terus perasan." |
| **Portal Restu** selepas **3 tekaan laju**: Wira jatuh ke portal (sinematik), terkunci sehingga ibu bapa masukkan PIN Penjaga | `LOCK_AT=3`, `portal-restu-jatuh-v1.mp4` | 0:15.2–0:22.8 |
| **SEMAKAN** untuk ibu bapa: 3 soalan yang dijawab terlalu cepat, dengan jawapan anak, jawapan betul dan masa (⚡ 0.5 s), serta nasihat Cikgu | `rapid-lock-v1.js` | 0:22.8–0:28.5 |
| Teruskan main (portal kekal aktif) atau "Biar teroka hari ini" (tidak disyorkan) | `rapid-lock-v1.js` | 0:25.5 "Lepas tu, teruskan main." |
| 9 mini-game Kemahiran Fokus | `dev-minigame-launcher-v1.js` | 0:30 grid hidup |
| **Jom tengok cara**: selepas 3 cubaan salah, Wira tunjuk kaedah bertulis langkah demi langkah | `js/minigame-worked-v1.js` (Gudang Harta) | 0:33–0:58.2 (1×) |

**Definisi tekaan laju (dari kod):**

- Hanya **cubaan pertama** yang dikira.
- Jawapan salah lebih cepat daripada had bacaan soalan itu (1.8–3.2 s, ikut panjang soalan) dikira sebagai tekaan.
- Jawapan betul, atau salah tetapi dengan masa berfikir yang cukup, menetapkan semula kiraan kepada 0.

## Rakaman

Semua rakaman ialah app sebenar, dirakam bingkai demi bingkai pada 1080×2236 dengan jam maya. Benih rawak tetap (21), jadi rakaman boleh diulang.

| Masa rakaman | Detik |
| --- | --- |
| 2.2–8.4 | S1 Sambung Rangkaian ✓, S2 Kumpulan Darab ✓ → serangan |
| 8.4–8.9 | S3 Pecahan Set Objek: tekan **3/8** dalam 0.5 s (betul 2/8). Cubaan semula betul → **GANGSA PECAH!** |
| 13.2–13.8 | S4 0.9 \_ 0.5: tekan **"Tidak dapat ditentukan"** dalam 0.5 s (betul >) → **amaran Cikgu Dimensi** |
| 19.0–19.6 | S5 Kenal Bentuk: tekan **bulatan** dalam 0.5 s (betul segi empat tepat) → **Portal Restu** |
| 19.6–24.8 | Portal Restu → PIN Penjaga (titik sahaja) |
| 24.8–30.3 | **SEMAKAN**: 3 soalan, kemudian Teruskan main |
| 30.3–75.8 | S6–S14 → Jurus Penamat → AURORA BEBAS! → **BERJAYA!** |

**Nota jujur:**

- Portal Restu **tidak aktif dalam Demo tetamu** (`"Never in guest demo"`), hanya dalam akaun keluarga.
- Untuk rakaman, perakam memanggil UI sebenar modul itu (`PARapidLock.warn()` / `PARapidLock.lock()`) pada saat yang sama enjinnya memanggil dalam akaun sebenar. Ia menggunakan 3 soalan yang baru dijawab laju dalam rakaman itu.
- Video memaparkan nota *"Portal Restu aktif dalam akaun keluarga, bukan Demo."*
- PIN ialah PIN ujian rakaman. Digit tidak pernah dipaparkan.
- Sinematik jatuh menggunakan `jatuh.mp4` HD, iaitu klip yang sama dengan `assets/cinematics/portal-restu-jatuh-v1.mp4`. Pelayar rakaman tidak memainkan H.264, jadi klip itu disisipkan semasa suntingan.
- Mini-game: Gudang Harta `#d1-tolak` (`capture_gudang.js … d1-tolak y1v2_2_4_2_sub_story 5 3.6`), iaitu Family Plus. Nota *"Mini-game Kemahiran Fokus dalam pakej Family Plus."* dipaparkan.

## Storyboard

| Masa | Visual | Teks |
| --- | --- | --- |
| 0:00–0:04 | Teks kinetik atas arena kabur | Anak main app **Matematik…** tekan je, **teka** je? |
| 0:04–0:08.2 | **Arena skrin penuh**: serangan Wira, kemudian banner **GANGSA PECAH!** | Animasi **cantik.** → Jawab betul, **kunci pecah!** |
| 0:08.2–0:10.4 | Arena kabur | Tapi kalau anak **teka-teka?** |
| 0:10.4–0:16 | 3 tekaan laju, dengan pil **Teka 1 · 0.5 s ✗ / Teka 2 / Teka 3**. Belon amaran Cikgu dinaikkan | **Teka laju?** → Cikgu Dimensi **terus perasan.** → Kali **ke-3…** |
| 0:16–0:19.1 | **Wira jatuh ke Portal Restu** (skrin penuh, drop) | Wira jatuh ke **Portal Restu!** |
| 0:19.1–0:22.8 | Skrin Portal Restu: Cikgu "3 jawapan dipilih terlalu cepat", kemudian PIN ●●●● | Panggil **mak ayah.** · *Portal Restu aktif dalam akaun keluarga, bukan Demo.* |
| 0:22.8–0:28.5 | **SEMAKAN**: 3 soalan dinaikkan (Anak: 3/8 · Betul: 2/8 · ⚡0.5 s…), kemudian nasihat Cikgu → Teruskan main | Mak ayah nampak **setiap tekaan.** → Lepas tu, **teruskan main.** |
| 0:28.5–0:33 | Grid 9 mini-game hidup | Bukan sekadar halang **teka…** → …Wira ajar **sampai faham.** · 9 MINI-GAME KEMAHIRAN FOKUS\* |
| 0:33–0:37.6 | Gudang Harta: taip 47, 57, 67 → Semak (pil Cuba 1 ✗ 2 ✗ 3 ✗) | Salah **3** kali? **Tak apa.** |
| 0:37.6–0:39 | Butang **Jom tengok cara** diketuk | Wira terus **tunjuk cara.** |
| 0:39–0:43.2 | Cerita diangkat besar; pilih **40 − 3** daripada 40 + 3 / 40 − 3 / 3 − 40 | LANGKAH 1/4 · Baca cerita, pilih **ayat.** |
| 0:43.2–0:47.5 | "Tempat sa: 0 kurang daripada 3. Pinjam 1 dari tempat puluh." → Pinjam 1 → **"0 jadi 10."** (0.5×) | LANGKAH 2/4 · Tak cukup? **Pinjam 1.** |
| 0:47.5–0:51.2 | "Tempat sa: 10 − 3 = ?" → 7 → "Tulis 7." | LANGKAH 3/4 · Tempat sa: **10 − 3 = 7** |
| 0:51.2–0:54.7 | "Tempat puluh: tiada nombor untuk ditolak. 3 turun." → Teruskan → "Tulis 3." | LANGKAH 4/4 · Tempat puluh: **3 turun.** |
| 0:54.7–0:57 | **SIAP! Cara Wira · 37** | 40 − 3 = **37.** · Faham cara, bukan **hafal jawapan.** |
| 0:57–0:58.2 | Cuba soalan serupa → soalan baharu | Lepas faham, **anak cuba sendiri.** |
| 0:58.2–0:62.7 | **JURUS PENAMAT!** (skrin penuh) → AURORA BEBAS! → BERJAYA! | Faham dulu… **baru menang!** |
| 0:62.7–1:06.6 | Kad akhir | App yang **betul-betul mengajar.** · Bukan main semata. Cuba demo, tengok sendiri. |

## Render

```bash
# pelayan app (worktree main) di 127.0.0.1:8765
cd capture && NODE_PATH=$(npm root -g) node capture_restu.js /rakaman/restu 21 2
ffmpeg -framerate 30 -i /rakaman/restu/f_%05d.jpg -vf format=yuv420p -c:v libx264 -crf 13 $PROMO_BUILD/src_RS.mp4
# src_GH.mp4 (Gudang Harta) dan src_G1–G9: lihat KELAS.md / AZ.md
python3 engine.py timeline_restu --out out/promo9-bukan-teka.mp4 --workers 4
```
