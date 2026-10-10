# Pahlawan Angka — Video Promosi “Premium Phone Showcase”

Pakej produksi untuk video promosi 9:16 (TikTok / Reels / Shorts).

| Fail | Isi |
| --- | --- |
| `PAKEJ-PRODUKSI.md` | Konsep, hook, skrip VO, storyboard, footage tambahan, semakan (dokumen ini) |
| `srt/promo-90s.srt`, `srt/promo-30s.srt` | Sari kata yang sepadan dengan timing video yang dieksport |
| `timeline_90.py`, `timeline_30.py` | “Fail projek” boleh edit: setiap shot, segmen sumber, keyframe kamera, highlight, teks, VO dan audio |
| `render_promo.py` | Enjin render (mockup telefon, motion lock, zoom, teks, sari kata, audio) |
| `make_srt.py` | Jana semula SRT selepas timing VO diubah |

**Status jujur draf ini**

- Video akhir **telah dihasilkan**: `promo-90s.mp4` (93 s) dan `promo-30s.mp4` (30 s), 1080 × 1920, 30 fps, H.264 + AAC. Fail video tidak dimasukkan ke git kerana saiznya; ia dihantar terus.
- **Voice-over belum dirakam.** Enjin TTS tidak dapat dicapai daripada persekitaran ini. Video menggunakan muzik + bunyi gameplay terpilih, dan sari kata VO dibakar ke dalam video. Timing VO dianggar pada ~2.6–3 patah perkataan/saat (nada mesra dan bertenaga).
- **Fail projek bukan Premiere/CapCut.** Ia ialah timeline Python yang boleh diedit dan dirender semula (lihat “Render semula” di bawah).
- Footage sumber hanya **392 × 850 px**. Close-up UI jadi agak lembut. Lihat [PERLU RAKAMAN] #1.

---

## 1. Konsep kreatif

**Cerita utama:** *Pengembaraan matematik ikut kemampuan anak, dengan kawalan di tangan ibu bapa.*

Perjalanan video: **anak tertarik** (Jurus Penamat, wira beraksi) → **menjawab & belajar** (soalan sebenar, jawapan → aksi) → **latihan ikut penguasaan** (Kembara Dimensi, Cikgu Dimensi, fokus kemahiran) → **usaha membawa kemajuan** (Gangsa → Perak → Emas, teman, Evolusi Bara) → **ibu bapa melihat perkembangan** (Ringkasan Anak, Laporan Kemahiran) → **kawalan masa** (had sesi/harian, rehat, kunci) → **sambung tanpa skrin** (worksheet) → logo + CTA.

**Bahasa visual**

- Satu telefon moden (bezel nipis, punch-hole kecil, butang sisi), bayang lembut berlapis, latar navy gelap dengan cahaya emas di belakang telefon. Warna diambil daripada identiti Pahlawan Angka: navy `#0E1A3A`, emas `#F5B83D`, aksen teal.
- Typography: Inter Display ExtraBold untuk tajuk, Inter untuk kicker/sari kata. Satu keluarga font sahaja.
- Satu fokus pada satu masa: kicker emas kecil → tajuk 3–7 perkataan → sari kata VO di bawahnya. Telefon menjadi fokus visual di bahagian bawah.
- Gerakan: telefon masuk dengan sedikit condong 3D hanya pada hook. Selepas itu telefon menghadap depan. Semua zoom menggunakan easing *smootherstep* dan berhenti penuh semasa teks/UI perlu dibaca.
- Highlight emas berbucu dilukis **di atas footage** (bukan di atas video akhir), jadi ia bergerak bersama UI.

**Rujukan gaya (video sample 10 s):** ia ialah animasi watak + pendedahan logo (wira & teman di padang, perisai Gangsa/Perak/Emas jatuh, kubah emas, logo dengan zarah emas). Daripadanya diambil *tahap kemasan* (cahaya emas, zarah halus, latar gelap, pendedahan logo yang tenang), bukan watak atau dakwaan. Video sample bukan footage aplikasi dan **tidak digunakan** dalam suntingan.

### Tiga pilihan hook

| | Hook | Visual | Kenapa |
| --- | --- | --- | --- |
| **A (dipakai)** | “Macam mana kalau latihan matematik jadi satu pengembaraan?” | Telefon masuk, Jurus Penamat → serangan → “RIYA DITEMUI!” (src 2:04.9–2:10.9) | Aksi paling kuat dalam footage + soalan yang ibu bapa terus faham |
| B | “Jawab betul… dan wira terus menyerang!” | Close-up soalan “Arun berkata 83 = 8 + 3” → tekan 80 + 3 → serangan (src 0:59–1:05) | Terus tunjuk *belajar = aksi* dalam 3 saat pertama |
| C | “Ibu bapa, ini latihan matematik yang anda boleh pantau.” | Ringkasan Anak: “Yang semakin kuat / Fokus seterusnya” → potong ke battle | Untuk iklan yang menyasarkan ibu bapa secara langsung |

---

## 2. Skrip voice-over — versi utama (93 s)

Masa = kedudukan dalam video akhir. Nada: mesra, yakin, bertenaga; jangan tergesa-gesa pada nama ciri.

| # | Masa | Durasi | Voice-over |
| --- | --- | --- | --- |
| 1 | 0:00.5–0:03.7 | 3.2 s | Macam mana kalau latihan matematik jadi satu pengembaraan? |
| 2 | 0:06.2–0:11.8 | 5.6 s | Inilah Pahlawan Angka — latihan Matematik KSSR Darjah 1 hingga 6, dalam Bahasa Melayu yang mudah difahami. |
| 3 | 0:12.3–0:15.2 | 2.9 s | Jawab dengan betul, dan wira terus beraksi! |
| 4 | 0:16.3–0:20.7 | 4.4 s | Dalam Kembara Dimensi, Cikgu Dimensi membantu memilih latihan mengikut kemampuan anak. |
| 5 | 0:21.2–0:24.8 | 3.6 s | Penguasaan setiap topik dipantau — bukan sekadar ikut darjah sekolah. |
| 6 | 0:25.3–0:28.9 | 3.6 s | Fokus Baba ialah Kebolehjadian, jadi misinya pun tentang Kebolehjadian. |
| 7 | 0:29.3–0:32.1 | 2.8 s | Misi berkembang bersama kemajuan mereka. |
| 8 | 0:32.6–0:35.8 | 3.2 s | Setiap usaha disambut kata semangat daripada Cikgu Dimensi. |
| 9 | 0:37.3–0:40.3 | 3.0 s | Harungi cabaran Gangsa, Perak dan Emas. |
| — | 0:40.3–0:44.3 | — | *(tiada VO — bunyi “Kunci Perak pecah” dan segel Emas muncul)* |
| 10 | 0:44.3–0:47.6 | 3.3 s | Pada tahap Emas, ada jawapan yang perlu ditaip sendiri! |
| 11 | 0:49.2–0:52.4 | 3.2 s | Teruskan pengembaraan dan temui enam teman untuk dikumpul. |
| 12 | 0:52.8–0:56.0 | 3.2 s | Ada teman yang sedang menunggu untuk diselamatkan dalam kembara. |
| 13 | 0:57.4–1:01.4 | 4.0 s | Lihat teman berkembang bersama pengembaraanmu — Evolusi Bara! *(sebut “Evolusi Bara” tepat ketika rupa baharu muncul, ~1:00.6)* |
| 14 | 1:02.8–1:07.8 | 5.0 s | Untuk ibu bapa, Ringkasan Anak menunjukkan kemahiran yang semakin kuat dan fokus latihan seterusnya. |
| 15 | 1:08.3–1:12.0 | 3.7 s | Lihat perkembangan anak dan kemahiran yang perlukan latihan lagi. |
| 16 | 1:12.7–1:17.2 | 4.5 s | Ibu bapa tentukan masa bermain — had satu sesi, had harian dan peringatan rehat. |
| 17 | 1:17.9–1:20.5 | 2.6 s | Aktifkan kunci apabila had dicapai. |
| 18 | 1:21.3–1:26.4 | 5.1 s | Dah cukup masa skrin? Muat turun worksheet dan sambung latihan atas kertas. |
| 19 | 1:27.5–1:30.7 | 3.2 s | Pahlawan Angka. Pengembaraan matematik ikut kemampuan anak. |
| 20 | 1:31.0–1:32.6 | 1.6 s | Cuba demo Pahlawan Angka! |

Jumlah ≈ 245 patah perkataan, ~73 s bercakap dalam 93 s.

**Nota untuk pengisi suara**

- Sebut “Kebolehjadian” dengan jelas (6 suku kata).
- Pada #16, berhenti sekejap selepas “masa bermain”.
- Jika rakaman sebenar lebih panjang/pendek, laraskan masa dalam `VO` di `timeline_90.py`, kemudian jalankan `make_srt.py` dan render semula.

---

## 3. Storyboard bertimestamp — versi utama

Kod sumber = timestamp dalam rakaman gameplay asal (`gameplay.mp4`, 3:27.8, 392 × 850). “Freeze” = bingkai ditahan kerana skrin itu statik.

**Bahasa gerakan telefon (sama sepanjang video):**

- **Rehat** = telefon penuh, menghadap depan, skala 1.05, pusat (540, 1110), terapung ±5 px.
- **Device push-in** = kamera mendekati seluruh telefon (skala 1.15–1.28).
- **UI zoom** = skala 1.75–2.4. Sasaran UI diletak pada y ≈ 1150 supaya ia berada di bawah zon teks. Jalur atas digelapkan supaya tajuk/sari kata kekal mudah dibaca.

Semua peralihan antara shot ialah **crossfade dalam skrin 0.28 s**. Telefon tidak dipotong, jadi footage bertukar di dalam skrin yang sama. Zoom sentiasa bermula selepas skrin baharu stabil.

| # | Masa | Footage (sumber) | VO | Teks skrin (kicker / tajuk) | Telefon & gerakan | Zoom → sasaran | Close-up | Transition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0:00–0:06 | Battle Pecahan: Jurus Penamat → serangan → “RIYA DITEMUI!” (2:04.9–2:10.9) | #1 | PAHLAWAN ANGKA / Matematik jadi pengembaraan | Masuk dari bawah (alpha 0→1, condong Y −16°→−7°, Z −5°→−2°) dalam 0.9 s, kemudian kembali hampir menghadap depan | Device push-in 1.02 → 1.15 (0:00.9–0:05.6) | — | Crossfade dalam skrin; telefon kembali ke Rehat |
| 2 | 0:06–0:09 | Sinematik masuk pengembaraan: wira berlari ke pintu gerbang (0:28.4–0:31.4) | #2 | DALAM BAHASA MELAYU / Matematik KSSR Darjah 1–6 | Rehat | — | — | Crossfade |
| 3 | 0:09–0:16 | Semak Nilai Tempat, Soalan 1 “Arun berkata 83 = 8 + 3. Pembetulan?” → tekan **80 + 3** → serangan wira (0:58.9–1:05.9) | #2 (sambung), #3 | SOALAN · JAWAPAN · AKSI / Jawab betul, wira beraksi | Rehat → UI zoom → Rehat | UI zoom 1.95 → kad soalan (0:09.5–0:10.3); kembali Rehat 0:12.3–0:13.0 supaya tekan jawapan + serangan nampak penuh. Highlight “80 + 3” 0:12.95–0:13.9 | 2.0 s | Crossfade |
| 4 | 0:16–0:21 | Hub Cica: kad **Kembara Dimensi** “Cikgu Dimensi pilih latihan ikut tahap kamu.” → tekan **Mula Kembara** (0:51.5–0:55.2, 0.74×) | #4 | KEMBARA DIMENSI / Latihan ikut kemampuan anak | Rehat → UI zoom → Rehat | UI zoom 2.0 → kad Kembara Dimensi (0:16.3–0:17.1), highlight kad | 3.1 s | Crossfade |
| 5 | 0:21–0:25 | Peta Topik Darjah 1: “Penguasaan keseluruhan 82%”, Kemajuan setiap topik (freeze 0:15.0) | #5 | PETA TOPIK / Penguasaan setiap topik dipantau | Rehat → UI zoom → Rehat | UI zoom 2.0 → kad Laluan Topik + bar penguasaan (0:21.1–0:21.8) | 2.5 s | Crossfade |
| 6 | 0:25–0:29 | Hub Baba (Darjah 6): **Kemahiran Fokus “Kebolehjadian 86%”, “Ketepatan 78% · teruskan untuk kukuhkan kuasa”** (0:26.3–0:27.45, 0.29×) | #6 | CONTOH: BABA · DARJAH 6 / Misi ikut fokus kemahiran | Rehat → UI zoom → Rehat | UI zoom 2.2 → kad Kemahiran Fokus (0:25.3–0:26.0) | 2.2 s | Crossfade (kamera sudah Rehat sebelum potongan) |
| 7 | 0:29–0:32.4 | Misi **Data dan Kebolehjadian · Tahun 6**, Soalan 1 (warna berkemungkinan) (0:37.6–0:41.0) | #7 | (sambung) | Rehat → zoom tajuk → pan ke soalan | UI zoom 2.3 → tajuk misi (0:29.15–0:29.8, tahan 0.8 s); pan ke soalan 1.8 (0:30.6–0:31.3) | 0.8 + 0.8 s | Crossfade |
| 8 | 0:32.4–0:36 | Skrin BERJAYA: “10/11 · 91%”, gelembung **Cikgu Dimensi: “Syabas, Cica! Riya sudah selamat. Sikit lagi untuk tiga bintang.”** (2:12.4–2:16.0) | #8 | CIKGU DIMENSI / Setiap usaha disambut semangat | Rehat → UI zoom → Rehat | UI zoom 2.1 → gelembung Cikgu Dimensi | 2.0 s | Crossfade |
| 9 | 0:36–0:39.6 | Pola Tiga Bentuk, Soalan 2: segel 2 pip **Gangsa** → jawab “silinder” → **“Kunci GANGSA pecah!”** (1:07.4–1:10.9) | #9 | TIGA TAHAP KUNCI / [Gangsa] [Perak] [Emas] (Gangsa menyala 0:38.9) | Rehat → zoom pip → pan ke jawapan | UI zoom 2.4 → pip segel (0:36.1–0:36.7); pan ke jawapan/maklum balas 1.9 (0:37.6–0:38.3) | 0.9 + 0.9 s | Crossfade |
| 10 | 0:39.6–0:44 | Ukur dengan Unit Bukan Piawai: jawab **8** → **“Kunci PERAK pecah!”** → segel **5 pip Emas** muncul (1:26.8–1:31.2) | (tiada) | Perak menyala 0:42.0, Emas 0:42.6 | Rehat → zoom jawapan → pan ke pip | UI zoom 1.9 → jawapan + teks “Kunci PERAK pecah!” (0:40.1–0:40.7); pan ke 5 pip Emas 2.3 (0:42.4–0:42.95) | 1.7 + 0.55 s | Crossfade |
| 11 | 0:44–0:49 | Soalan 9 (Kunci Emas): “Ada 60 objek…” → papan kekunci → **taip “40”** → Jawab → serangan → **“Betul! Kunci retak.”** (1:49.7–1:54.2 + freeze 0.5 s) | #10 | KUNCI EMAS / Taip jawapan sendiri | Rehat → UI zoom → Rehat → zoom kecil | UI zoom 1.95 → label KUNCI EMAS + ruang taip (0:44.4–0:45.1, tahan hingga 0:47.25); kembali Rehat ketika papan kekunci ditutup; zoom 1.8 → “Betul! Kunci retak.” (0:48.2–0:48.7) | 2.15 + 0.3 s | Telefon diketepikan (fade + turun) |
| 12 | 0:49–0:52 | **Grafik: 6 kad teman** daripada aset sebenar (`assets/pets/...`): Aurora, Kukupat, Kumbis, Riya, Bunnis, Keryan (bukan rakaman gameplay) | #11 | KHAZANAH / Enam teman untuk dikumpul | Telefon tersembunyi | — (kad muncul berperingkat 0.12 s) | — | Kad pudar, telefon masuk semula |
| 13 | 0:52–0:56.6 | Khazanah “3/6 diselamatkan”: Kumbis → leret ke **Riya** “Belum Dijinakkan · Misi Gembok 2/20 · Lagi 18 misi untuk dijinakkan” (freeze 2:21.0, 2:21.0–2:22.7, 2:22.7–2:23.1 perlahan) | #12 | TEMAN KEMBARA / Selamatkan teman dalam kembara | Rehat → push-in → UI zoom → Rehat | Device push-in 1.2 (0:52.1–0:53.4); UI zoom 1.85 → status Riya (0:53.4–0:54.25) | 1.8 s | Crossfade |
| 14 | 0:56.6–1:02.6 | **Evolusi**: “Kuasa baharu terjaga” (Aurora bentuk asal) → lambang Bara → **“TAHAP 5 · EVOLUSI BARA” · Aurora · Temanmu mencapai Tahap 5!** (2:28.3–2:34.3) | #13 | EVOLUSI TEMAN / Evolusi Bara | Rehat → device push-in perlahan → tahan | Device push-in 1.26 (0:56.8–1:00.2), tahan pada rupa baharu hingga 1:02.2 | 2.0 s (selepas) | Crossfade |
| 15 | 1:02.6–1:08 | Ibu Bapa › **Ringkasan Anak**: “Kuasa Cica semakin stabil”, 600 soalan · 84% betul sendiri · 6 kemahiran mantap; **Yang semakin kuat: Nombor hingga 20 · Fokus seterusnya: Banding ukuran** (2:41.2–2:44.2 + freeze 2.4 s) | #14 | UNTUK IBU BAPA / Ringkasan Anak | Rehat → UI zoom → pan → Rehat | UI zoom 1.9 → kad ringkasan + statistik (1:02.9–1:03.6); pan ke “Yang semakin kuat / Fokus seterusnya” 2.0 (1:05.0–1:05.7) | 1.4 + 1.7 s | Crossfade |
| 16 | 1:08–1:12.4 | Tab Kemahiran: **Laporan Kemahiran Matematik Darjah 1** · Pratonton kemahiran utama (Banding ukuran 100%, Bentuk asas 100%, Nombor hingga 20 86%, …) (freeze 2:49.5) | #15 | LAPORAN KEMAHIRAN / Kekuatan & latihan seterusnya | Rehat → UI zoom → Rehat | UI zoom 2.1 → bar pratonton kemahiran | 2.9 s | Crossfade |
| 17 | 1:12.4–1:21 | Tetapan › **Had Masa Bermain**: Had sehari 30 min · Had satu sesi 30 min · Peringatan rehat 15 min · ☑ Kunci apabila had dicapai · ☑ Paparkan timer kepada anak (2:55.6–2:57.6, kemudian freeze 2:57.6) | #16, #17 | KAWALAN IBU BAPA / Ibu bapa tentukan masa bermain → **CONTOH TETAPAN IBU BAPA** / Had sesi, had harian & kunci | Rehat → UI zoom → pan → Rehat | UI zoom 2.0 → tiga medan minit (1:13.9–1:14.6); pan ke “Kunci apabila had dicapai” 2.2 (1:17.1–1:17.8) | 2.5 + 2.6 s | Crossfade |
| 18 | 1:21–1:24.4 | Latihan › **Latihan untuk dicetak · Sediakan latihan anak**: Disyorkan (ikut bukti anak), Fokus Nombor hingga 20, 20 soalan, Cadangan Cikgu Dimensi → tekan **Latihan + skema** → “20 soalan berjaya disediakan.” (3:03.0–3:06.4) | #18 | WORKSHEET / Sambung latihan atas kertas | Rehat → UI zoom → Rehat | UI zoom 1.7 → pilihan + butang (1:21.2–1:21.9); highlight “Disyorkan” kemudian “Latihan + skema” | 2.0 s | Crossfade |
| 19 | 1:24.4–1:27 | PDF dibuka: **“Latihan Disyorkan Cikgu Dimensi” · Cica · Darjah 1 · 20 soalan** (3:13.8–3:16.4) | #18 (sambung) | (sambung) | Rehat → device push-in | Device push-in 1.25 ke halaman PDF | 1.3 s | Telefon pudar ke bawah |
| 20 | 1:27–1:33 | **Kad penutup**: logo rasmi (`assets/branding/pahlawan-angka-full-logo-v1.png`), cahaya emas, tagline, butang CTA (muncul 1:30.9) | #19, #20 | Pengembaraan matematik ikut kemampuan anak. / [Cuba demo Pahlawan Angka] | — | Logo skala 0.9 → 1.0 | — | Tamat |

**Audio:** muzik `assets/audio/PAMusic.mp3` (gain 0.55, fade masuk 0.6 s, fade keluar 1:26.4–1:28.2). Stinger `StingerPA.mp3` mula 1:27.0. Bunyi gameplay asal hanya pada: Jurus Penamat (0:00–0:06), jawapan betul + serangan (0:12.8), Kunci Gangsa pecah (0:38.6), Kunci Perak pecah (0:41.0), jawapan Emas + serangan (0:47.4), evolusi (0:56.6–1:02.6). Campuran dinormalkan ke −14 LUFS. **Selepas VO dirakam:** rendahkan muzik ~8–10 dB di bawah VO (ducking) dan kekalkan bunyi gameplay pada jawapan, ganjaran dan evolusi.

**Kawasan selamat:** teks penting berada antara y = 150 dan y = 560 (di bawah UI atas platform). Sari kata tidak pernah diletak di bawah y ≈ 600. Bahagian bawah (y > 1600, kawasan kapsyen/butang platform) hanya mengandungi badan telefon dan bar navigasi aplikasi, bukan teks atau UI penting. CTA penutup berada pada y ≈ 1290–1390.

---

## 4. Versi ringkas 30 saat

| # | Masa | Footage (sumber) | VO | Teks skrin | Gerakan / zoom |
| --- | --- | --- | --- | --- | --- |
| 1 | 0:00–0:03 | Jurus Penamat → serangan (2:05.2–2:08.2) | Bila latihan matematik jadi pengembaraan… | PAHLAWAN ANGKA / Matematik jadi pengembaraan | Telefon masuk condong → push-in 1.12 |
| 2 | 0:03–0:07 | Soalan “Arun berkata…” → 80 + 3 → serangan (1:00.0–1:04.0) | Matematik KSSR Darjah 1 hingga 6 — jawab betul, wira beraksi! | DALAM BAHASA MELAYU / Matematik KSSR Darjah 1–6 | UI zoom 1.95 soalan (1.5 s) → Rehat untuk tekan + serangan; highlight 80 + 3 |
| 3 | 0:07–0:11 | Hub: kad Kembara Dimensi → tekan Mula Kembara (0:51.4–0:55.2) | Cikgu Dimensi membantu memilih latihan mengikut kemampuan anak. | KEMBARA DIMENSI / Latihan ikut kemampuan anak | UI zoom 2.0 kad (2.6 s) |
| 4 | 0:11–0:15 | Kunci Emas: taip “40” → serangan → Betul! Kunci retak. (1:50.8–1:54.2 + freeze) | Gangsa, Perak, Emas — ada jawapan yang ditaip sendiri! | TIGA TAHAP KUNCI / [Gangsa][Perak][Emas] | UI zoom 1.95 ruang taip (1.5 s) → Rehat → zoom “Betul! Kunci retak.” |
| 5 | 0:15–0:18.4 | Lambang Bara → EVOLUSI BARA (2:30.6–2:34.0) | Kumpul enam teman dan lihat Evolusi Bara! | KHAZANAH / Enam teman · Evolusi Bara | Device push-in 1.24, tahan |
| 6 | 0:18.4–0:21.8 | Ringkasan Anak: Yang semakin kuat / Fokus seterusnya (2:41.2–2:43.0 + freeze) | Lihat kekuatan anak dan fokus latihan seterusnya. | UNTUK IBU BAPA / Lihat perkembangan anak | UI zoom 2.0 (2.1 s) |
| 7 | 0:21.8–0:24.6 | Had Masa Bermain (freeze 2:57.6) | Tetapkan had masa dan kunci. | CONTOH TETAPAN IBU BAPA / Had masa & kunci | UI zoom 1.85 medan + kunci (1.7 s) |
| 8 | 0:24.6–0:26.8 | Latihan untuk dicetak → Latihan + skema (3:04.2–3:06.4) | Sambung latihan atas kertas dengan worksheet. | WORKSHEET / Sambung atas kertas | UI zoom 1.7 (1.3 s) |
| 9 | 0:26.8–0:30 | Kad penutup + CTA | Pahlawan Angka. Cuba demo sekarang! | logo / tagline / [Cuba demo Pahlawan Angka] | Telefon pudar; logo skala masuk |

Versi 30 s tidak mempunyai kad enam teman atau Khazanah kerana masa tidak cukup. Ia menyebut “enam teman” di atas footage evolusi. Jika mahu, tukar shot 5 kepada grafik kad teman (lihat `SPECIALS` dalam `timeline_90.py`).

---

## 5. Senarai footage tambahan — [PERLU RAKAMAN]

| # | Keperluan | Kenapa | Shot yang diperlukan |
| --- | --- | --- | --- |
| 1 | **Rakaman semula resolusi tinggi** (≥ 1080 × 2340, 60 fps, mod Jangan Ganggu, tiada notifikasi/rakaman-skrin di status bar) | Sumber sekarang 392 × 850. Close-up 2× masih boleh dibaca tetapi lembut | Semua skrin dalam storyboard. Gantikan `src30.mp4` dan render semula; tiada timing yang perlu diubah jika urutan rakaman sama |
| 2 | **Pemilihan hero** | Brief meminta pemilihan hero; footage hanya ada pemilihan *profil* (yang memaparkan e-mel, jadi tidak digunakan) | Skrin pilih hero (Wira / Bunga / Sidma), ketik satu hero, masuk pengembaraan |
| 3 | **Petunjuk / bimbingan Cikgu Dimensi dalam battle** | Butang “Petunjuk” nampak tetapi tidak ditekan; bimbingan sebenar belum dirakam | Tekan Petunjuk pada satu soalan → paparan petunjuk → jawab betul |
| 4 | **Skrin selepas “Mula Kembara”** (jika ada cadangan misi / fokus latihan sebelum battle) | Untuk menunjukkan cadangan misi Cikgu Dimensi dengan lebih jelas | Hub → Mula Kembara → skrin cadangan/fokus → battle |
| 5 | **Gangsa → Perak → Emas dalam satu sesi tanpa salah jawab** | Footage sekarang ada beberapa jawapan salah antara segel | Satu battle dari Soalan 1 hingga segel Emas pecah |
| 6 | **Khazanah leret penuh 6 kad** dan saat teman ditemui | Footage hanya leret 01–05; kad 02 dalam profil demo telah dinamakan semula “Kurapat” (nama asal Kukupat), jadi ia dielak | Leret perlahan 01 → 06, tahan 1 s setiap kad; satu “… DITEMUI!” |
| 7 | **Build produksi tanpa lencana “DEV”** (dan butang “Coach RPG” jika ia alat dalaman) | Lencana kelihatan di skrin Khazanah, Ibu Bapa, Peta Topik | Rakam semula skrin tersebut |
| 8 | **Anak menjawab worksheet atas kertas** (tangan sahaja, dengan kebenaran ibu bapa) | Brief meminta peralihan telefon → kertas | Cetakan “Latihan Disyorkan Cikgu Dimensi”, tangan menulis jawapan, 3–4 s |
| 9 | **PDF dibuka tanpa pop-up** | Rakaman sekarang memaparkan pemilih “Open with” dan pop-up Copilot (dielak) | Buka PDF terus, skrol perlahan ke “Skema dan Cara Menjawab” |
| 10 | **Soalan Darjah 2–5** | Menyokong mesej Darjah 1–6 secara visual (sekarang hanya Tahun 1 dan Tahun 6) | 2–3 s setiap darjah, satu soalan sahaja |
| 11 | **Voice-over** | Belum dirakam | Rakam ikut Bahagian 2 (48 kHz, kering, tanpa muzik) |
| 12 | (Pilihan) Logo animasi rasmi | Kad penutup sekarang menggunakan logo PNG dengan gerakan ringkas | Logo reveal 2–3 s dengan latar lutsinar |

---

## 6. Semakan sebelum siap

| Semakan | Keputusan |
| --- | --- |
| Gameplay melekat tepat dalam skrin sepanjang gerakan | ✅ Skrin dan bezel dipetakan oleh **homografi yang sama** setiap frame (`pose_matrix`). Highlight dilukis pada footage, jadi turut terkunci. Disemak pada bingkai hook (condong 3D), push-in dan zoom 2.4× |
| Tiada UI terpotong / berubah nisbah | ✅ Skrin mockup dibina ikut nisbah sumber 392 : 812 (status bar dipotong). Tiada regangan. Bucu skrin dibundarkan oleh bezel, jadi tiada kawalan penting di bucu yang terlindung. Punch-hole 13 px diletak di atas baris tajuk UI |
| Zoom berlaku pada masa ciri disebut | ✅ Setiap UI zoom bermula 0–0.4 s sebelum frasa VO berkaitan. Zoom tidak bermula ketika skrin bertukar |
| Soalan dan jawapan boleh dibaca pada telefon | ✅ dengan nota: soalan dipaparkan pada zoom ≈ 2× dan ditahan 2 s atau lebih. Ketajaman terhad oleh sumber 392 px ([PERLU RAKAMAN] #1) |
| Caption tidak menutup elemen penting | ✅ Teks hanya di jalur atas (y 150–560). Ketika zoom, jalur itu digelapkan dan sasaran UI diletak pada y ≈ 1150 |
| Semua ciri berdasarkan bukti bahan sebenar | ✅ Lihat jadual bukti di bawah |
| Tiada maklumat peribadi terdedah | ✅ Dielak: pemilihan profil yang memaparkan e-mel akaun (src 0:16.5–0:20, 0:48–0:51 “Save password”), skrin PIN ibu bapa yang memaparkan nombor PIN (2:39.5–2:41), pemilih aplikasi & pop-up Copilot. ⚠️ Nama profil **Cica** dan **Baba** kelihatan. Sahkan ia profil demo, bukan nama sebenar anak |
| VO, sari kata dan visual selari | ✅ Sari kata = teks VO, timing sama dengan SRT. Selepas VO sebenar dirakam, laraskan `VO` dan jana semula |

**Jadual bukti dakwaan**

| Dakwaan dalam video | Bukti |
| --- | --- |
| Matematik KSSR Darjah 1–6 | Peta Topik “Darjah 1 · Pilih Topik” dan “Darjah 6 · Pilih Topik”; profil Darjah 1, 2, 6; soalan “Tahun 1” dan “Tahun 6”. **Tiada** dakwaan pengiktirafan KPM |
| Cikgu Dimensi pilih latihan ikut tahap/kemampuan | Teks kad hub: “Cikgu Dimensi pilih latihan ikut tahap kamu.” Fokus Baba “Kebolehjadian” → misi “Data dan Kebolehjadian”. Tiada dakwaan AI/chatbot |
| Penguasaan setiap topik dipantau | “Penguasaan keseluruhan 82%”, “Kemajuan 98% / 100% / 47%” setiap topik |
| Gangsa → Perak → Emas; ada jawapan ditaip | “Kunci GANGSA pecah!”, “Kunci PERAK pecah!”, “Kunci EMAS pecah!”, label “KUNCI EMAS · Taip jawapan sendiri”. Soalan Emas pilihan jawapan juga wujud (Soalan 6, 10, 11), jadi skrip berkata “**ada** jawapan yang perlu ditaip” |
| Enam teman | Khazanah “3/6 diselamatkan”, 6 titik karusel, kad “05/06 · 06/06”; aset & nama dalam `js/khazanah-v2-v1.0.0.js` |
| Teman diselamatkan dalam kembara | “Terima kasih selamatkan Riya! · Rescue 2/20”, “Satu teman sedang menunggu dalam kembara kamu” |
| Evolusi Bara | Skrin “TAHAP 5 · EVOLUSI BARA · Temanmu mencapai Tahap 5!” |
| Laporan perkembangan | Ringkasan Anak (“Yang semakin kuat”, “Fokus seterusnya”), Laporan Kemahiran. ⚠️ Ada lencana **PLUS** pada analisis laporan, jadi video tidak menyebut harga atau “percuma” |
| Had masa & kunci | Had sehari, had satu sesi, peringatan rehat, “Kunci apabila had dicapai”. Nilai 30/30/15 dilabel **“Contoh tetapan ibu bapa”** |
| Worksheet | “Latihan untuk dicetak”, “Latihan + skema”, PDF “Latihan Disyorkan Cikgu Dimensi”. ⚠️ Lencana **PRO**, jadi tiada dakwaan percuma / semua pelan |
| CTA “Cuba demo” | Skrin log masuk: “Cuba Demo · Pilih darjah · terus ke battlefield”. Pautan: **[PAUTAN DEMO]**. Tidak dipaparkan dalam video; letak dalam kapsyen/bio |

**Perlu disahkan oleh pemilik produk sebelum diterbitkan**

1. Hak penggunaan `PAMusic.mp3` dan `StingerPA.mp3` untuk iklan media sosial (diandaikan milik projek kerana berada dalam repo permainan).
2. Profil Cica / Baba ialah profil demo.
3. Kesesuaian menunjukkan ciri yang berlabel PLUS/PRO tanpa menyebut pelan.
4. [PAUTAN DEMO] untuk kapsyen.

---

## Render semula

```bash
# 1) footage perantaraan: 30 fps tetap, status bar dipotong, 2x lanczos
ffmpeg -i gameplay.mp4 -vf "fps=30,crop=392:812:0:38,scale=784:1624:flags=lanczos,unsharp=5:5:0.6" \
       -c:v libx264 -crf 12 -an build/src30.mp4
ffmpeg -i gameplay.mp4 -vn -ac 2 -ar 48000 build/src_audio.wav

# 2) bingkai semakan (PNG) atau video penuh
python3 render_promo.py --timeline timeline_90 --src build/src30.mp4 --frames 10.8,46.2 --out build/semak
python3 render_promo.py --timeline timeline_90 --src build/src30.mp4 --src-audio build/src_audio.wav --out out/promo-90s.mp4
python3 render_promo.py --timeline timeline_30 --src build/src30.mp4 --src-audio build/src_audio.wav --out out/promo-30s.mp4
#    --no-subs  : tanpa sari kata terbakar (untuk editor yang akan menambah sari kata sendiri)

# 3) SRT
python3 make_srt.py timeline_90 srt/promo-90s.srt
```

Keperluan: Python 3, `opencv-python-headless`, `numpy`, `Pillow`, ffmpeg, fon Inter.

Jika rakaman resolusi tinggi baharu digunakan, ubah `crop`/`scale` supaya hasilnya kekal **784 × 1624** (atau ubah `SRC_W/SRC_H` dalam `render_promo.py`), kemudian semak semula masa sumber dalam `SHOTS`.
