# Promo #5 — "Pahlawan Angka A–Z" (66 s, 9:16)

Promo penuh aplikasi yang mengikut perjalanan skrip VO pemilik:

1. hook masalah;
2. permainan teras;
3. **9 mini game**;
4. bukan hentam soalan (adaptive);
5. Kemahiran Fokus;
6. petunjuk;
7. mak ayah;
8. "Nak main game? Mainlah.";
9. penutup.

Hero: **Wira sahaja**. Tiada pilihan hero lain ditunjukkan.

| Fail | Isi |
| --- | --- |
| `timeline_az.py` | Timeline enjin sinematik (`engine.py`) |
| `srt/promo-az.srt` | Sari kata / panduan masa VO (18 kiu) |
| `engine.py` → `VideoGrid` | Grid 3×3 klip hidup (9 mini game, label topik) |
| `engine.py` → `FullClip(center=…)` | Pilih titik fokus rakaman untuk latar penuh, contohnya arena |

Tawaran berbayar (contoh RM7 seminggu) **belum wujud** dalam app. Video ini tiada harga, dan butang akhir kekal "Cuba Demo Sekarang".

## Sumber baharu: 9 mini game (G1–G9)

Rakaman `Screen_Recording_20261016_1533xx` ditukar ke 30 fps dan 1080×2236. Jalur 14 px teratas dibuang (sisa label "DEV"). Atas dan bawah dipad dengan warna tepi (`fillborders=smear`), jadi UI game tidak dipotong.

| Kod | Game | Topik | Detik digunakan |
| --- | --- | --- | --- |
| G1 | Gerai Wirayung | Wang | ambil karipap, susun duit RM2.60 → HEBAT |
| G2 | Tren Jam | Masa | putar jarum 8:45 + 25 min → 9:10, BAGUS |
| G3 | Arkitek Dimensi | Ruang | pilih prisma segi tiga → BAGUS |
| G4 | Kedai Kek | Pecahan | ⅓ = 3/9 → HEBAT |
| G5 | Bengkel Besi | Ukuran | potong rantai 1 m 80 cm → HEBAT |
| G6 | Gudang Harta | Nombor & operasi | bina 2 248 ikut nilai tempat → HEBAT |
| G7 | Dapur Ramuan | Nisbah | 5:2 → 10:4, BAGUS |
| G8 | Pos Peninjau | Data | gundalan guli → HEBAT |
| G9 | Lombong Permata | Perpuluhan & peratus | 0.37 → SIAP |

Dari kod (`js/dev-minigame-launcher-v1.js`, `js/focus-mini-games-live-bridge.js` dan router setiap game):

- ada 9 game, satu bagi setiap bidang;
- dalam Kemahiran Fokus, game dipilih ikut kemahiran dan Darjah anak;
- jawapan dalam game menjadi bukti untuk latihan seterusnya ("Setiap jawapan membantu Cikgu Dimensi memilih latihan seterusnya").

## Storyboard

| Masa | Visual | Teks skrin | VO (skrip pemilik) | Muzik |
| --- | --- | --- | --- | --- |
| 0:00–0:02.9 | Teks kinetik atas arena kabur | Anak boleh ulang **game** / banyak kali… (bergema) | Anak boleh ulang game banyak kali… | Intro |
| 0:02.9–0:06 | Teks kelabu dan lentur, halaman worksheet pudar | tapi bila buka buku Matematik, terus **hilang semangat?** | tapi bila buka buku Matematik, terus hilang semangat? | Intro |
| 0:06–0:08 | Teks | **Haa,** cuba tengok ni! | Haa, cuba tengok ni! | Build |
| 0:08–0:10 | Logo, jubin | MATEMATIK KSSR · DARJAH 1–6 / Dalam Bahasa Melayu | Dalam Pahlawan Angka, | **Drop** |
| 0:10–0:11 | Sinematik Wira berjalan ke menara | Anak jadi hero… | anak jadi hero, | Drop |
| 0:11–0:17 | Soalan "Matahari baru terbit…" → tekan pagi → **Jurus Penamat** → KUKUPAT DITEMUI | Jawab cabaran Matematik… / …guna kuasa! / Selamatkan pet! | jawab cabaran Matematik, guna kuasa dan selamatkan pet! | Groove |
| 0:17–0:18.4 | Teks | Bukan tu je. **9** MINI-GAME! | Bukan tu je. Ada 9 mini-game! | Build |
| 0:18.4–0:27.4 | Montaj dalam telefon. Label: Jadi cashier, Bina bentuk, Main dengan masa, Cari harta, kemudian 5 lagi pantas | BUKAN TU JE / Ada 9 mini-game! | Jadi cashier, bina bentuk, main dengan masa, cari harta… | **Drop** |
| 0:27.4–0:30 | **Grid 3×3**: 9 game bermain serentak dengan label topik | 9 MINI-GAME · 9 TOPIK / Macam-macam! | macam-macam! | Groove |
| 0:30–0:33 | Kad Kembara Dimensi diangkat | YANG BEST / Bukan main hentam soalan. | Yang best, game ni bukan main hentam soalan. | Ringan |
| 0:33–0:40 | Kemahiran Fokus (20% / 28% / 31%, kad "Fokus utama") → mini game Bengkel Besi | KEMAHIRAN FOKUS / Selalu tersangkut? | Bila anak selalu tersangkut, Kemahiran Fokus bantu dia berlatih dekat bahagian yang belum betul-betul faham. | Ringan |
| 0:40–0:45 | Jawapan salah → petunjuk diangkat → "Betul! Kunci retak." | TANYA WIRA / Ada petunjuk… …tapi bukan terus bagi jawapan. | Ada petunjuk, tapi bukan terus bagi jawapan. | Ringan |
| 0:45–0:50 | Ringkasan Anak, Laporan Kemahiran | UNTUK MAK AYAH / Tengok perkembangan anak. | Mak ayah pun boleh tengok perkembangan anak… | Groove |
| 0:50–0:54 | Latihan + skema → 2 halaman PDF sebenar | LATIHAN TAMBAHAN / Sediakan latihan bercetak. | …dan sediakan latihan tambahan. | Groove |
| 0:54–0:56 | Teks atas arena kabur | Nak main game? **Mainlah.** | Nak main game? Mainlah. | Build |
| 0:56–1:00 | Montaj kejayaan: serangan, HEBAT, **Evolusi Bara**, BAGUS, BERJAYA | Kali ni, biar Matematik pun ikut sekali! | Kali ni, biar Matematik pun ikut sekali! | **Drop** |
| 1:00–1:06 | Kad akhir: logo, Wira, butang | Jom selamatkan semua teman sambil belajar! · Cuba Demo Sekarang | Pahlawan Angka. Jom selamatkan semua teman sambil belajar! | Outro |

## Voice-over

TTS disekat dalam persekitaran render, jadi video bergantung pada teks skrin dan muzik. Untuk menambah VO:

1. Rakam ikut `srt/promo-az.srt`. Masa setiap baris sudah selari dengan babak.
2. Hantar fail audio. VO akan dicampur pada −14 LUFS dengan muzik direndahkan ~8 dB.

Cadangan kecil pada skrip: tukar **"anak pilih hero"** kepada **"anak jadi hero"**, kerana app hanya ada Wira.

## Semakan

- **Maklumat peribadi:**
  - Tiada e-mel, digit PIN atau notifikasi.
  - Julat yang dielak: B 1.5–3.5, F 1.6–3.05 dan ≥ 12.6, P 0–1.5 dan > 22.1.
  - Sisa label "DEV" pada G5, G6, G7 dan G9 dibuang.
- **Dakwaan:**
  - Tiada harga, "percuma" atau pengiktirafan KPM, dan perkataan "lemah" tidak digunakan.
  - "9 mini-game" tepat mengikut kod.
  - "Petunjuk, bukan terus bagi jawapan": rakaman F menunjukkan petunjuk yang membimbing, dan jawapan tidak didedahkan.
- **Nota:** mini game dibuka melalui Kemahiran Fokus, iaitu ciri akaun berbayar `focus`. Mod Demo tidak membukanya. Semak keselarasan butang "Cuba Demo Sekarang" dengan tawaran sebenar sebelum iklan berbayar.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build      # src_*.mp4 termasuk src_G1–G9, aud_B/C/F/K.wav, pdf_ws-1.png, pdf_sk-5.png
python3 engine.py timeline_az --out out/promo5-az.mp4 --workers 4
PROMO_FORMAT=ads916 python3 engine.py timeline_az --out out/ads-9x16_promo5-az.mp4 --workers 4
PROMO_FORMAT=feed45 python3 engine.py timeline_az --out out/feed-4x5_promo5-az.mp4 --workers 4
```
