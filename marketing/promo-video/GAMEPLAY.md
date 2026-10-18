# Promo #6 — "Gameplay" (60 s, 9:16)

Video satu minit yang lebih banyak menunjukkan gameplay dan menyusun semua ciri utama ikut susunan pemilik:

1. **JURUS PENAMAT** terus pada saat 0;
2. game ni bijak: tahu apa anak perlu improve;
3. battle asas: jawab betul = serang, Kunci **Gangsa → Perak → Emas**;
4. 9 mini game;
5. progress: selamatkan teman, kumpul teman, **evolusi teman**, trofi;
6. mak ayah (ringkas);
7. penutup.

Hero: **Wira sahaja**.

| Fail | Isi |
| --- | --- |
| `timeline_gameplay.py` | Timeline enjin sinematik (`engine.py`) |
| `srt/promo-gameplay.srt` | Sari kata / panduan masa VO |

## Dua sinematik baharu

| Kod | Fail | Isi | Kedudukan dalam video |
| --- | --- | --- | --- |
| ENTER | `enter.mp4` (4.3 s) | Wira keluar dari portal, berpaling, masuk semula dan larut menjadi zarah biru | **0:12–0:16**, sebelum battle. Dalam app, sinematik portal (`assets/cinematics/wira-demo-entry-v1.mp4`) memang dimainkan sebelum battle, dan Wira muncul di arena sebagai zarah biru (`js/segel-demo-v2.1.0.js`, "KEMASUKAN WIRA"). Jadi susunan ini ikut aliran sebenar |
| JATUH | `jatuh.mp4` (3.1 s) | Wira jatuh ke pusaran simbol Matematik dan ditelan bola cahaya | **0:26.6–0:29.7**, jambatan dari battle ke mini game. Kilat bola cahaya terus menjadi teks "Terjun ke **9** MINI-GAME!" |

Kedua-duanya 1080×1920, ditukar ke 30 fps, dan dimainkan skrin penuh (`FullClip`) dengan bunyi asal.

## Fakta daripada kod

- **Tiga tahap kunci**: Gangsa perlu 2 hit, Perak 3 hit dan Emas 5 hit (`TIERS` dalam `js/segel-demo-v2.1.0.js`).
- Kunci Emas kebanyakannya **taip jawapan sendiri**.
- **Hit terakhir pada Kunci Emas** memainkan sinematik finisher, iaitu Jurus Penamat (`isFinalHit()` → `playFinisherVideo()`). Sebab itu teks "Pecah Emas = JURUS PENAMAT!" disertai imbas semula tajuk Jurus Penamat.
- **Evolusi teman**: setiap misi yang tamat memberi teman aktif +20 XP ikatan. Teman berevolusi apabila mencapai tahap 5 (`js/pet-collection-system.js`). Teks: "Setiap misi, teman aktif makin kuat."

## Storyboard

| Masa | Visual | Teks skrin | Muzik |
| --- | --- | --- | --- |
| 0:00–0:04 | **Jurus Penamat** dari bingkai pertama: tajuk → serangan kilat → KUKUPAT DITEMUI, dengan bunyi asal | PAHLAWAN ANGKA / Setiap jawapan betul jadi serangan! | **Drop** |
| 0:04–0:06 | Logo | MATEMATIK KSSR · DARJAH 1–6 / Dalam Bahasa Melayu | Groove |
| 0:06–0:08.6 | Hub, kad Kembara Dimensi diangkat | GAME NI BIJAK / Dia tahu anak perlu improve kat mana. | Ringan |
| 0:08.6–0:12 | Kemahiran Fokus: 20 / 28 / 31% disorot, kad "Fokus utama" | KEMAHIRAN FOKUS / Selalu tersangkut? Dia kesan sendiri. | Ringan |
| 0:12–0:16.2 | **ENTER**: Wira masuk portal (skrin penuh) | KEMBARA DIMENSI / Masuk portal… | Build |
| 0:16.2–0:18.8 | Soalan wang → tekan RM1.50 → Wira serang → "Betul! Kunci retak." | BATTLE / Jawab betul, Wira serang! | **Drop** |
| 0:18.8–0:21 | Zoom ke segel (2 pip) → **Kunci GANGSA pecah!** | Pil Gangsa menyala | Drop |
| 0:21–0:23 | Serangan → **Kunci PERAK pecah!** → lencana KUNCI EMAS | Pil Perak, kemudian Emas | Drop |
| 0:23–0:26 | Kunci Emas: taip "40" → serangan → "Betul! Kunci retak." | Kunci Emas: taip jawapan sendiri | Drop |
| 0:26–0:26.6 | Imbas semula tajuk Jurus Penamat | Pecah Emas = JURUS PENAMAT! | Drop |
| 0:26.6–0:29.7 | **JATUH**: Wira jatuh ke pusaran Matematik, ditelan bola cahaya | NAK LEBIH FUN? / Jatuh ke dunia baharu… | Break → build |
| 0:29.6–0:32 | Teks kinetik | Terjun ke **9** MINI-GAME! | **Drop** pada "9" |
| 0:32–0:40.2 | Montaj mini game: cashier, bina bentuk, masa, harta, kemudian 5 lagi pantas | MINI-GAME KEMAHIRAN FOKUS / Setiap topik, dunia sendiri. | Drop |
| 0:40.2–0:43 | Grid 3×3: 9 game bermain serentak | 9 MINI-GAME · 9 TOPIK / Takdelah rasa setiap topik sama je! | Drop |
| 0:43–0:44.6 | BERJAYA! Kukupat berjaya diselamatkan | PROGRESS / Selamatkan teman… | Groove |
| 0:44.6–0:46 | Khazanah: kad teman, 3/6 diselamatkan | KHAZANAH / …kumpul enam teman… | Groove |
| 0:46–0:50 | **Evolusi Bara**: bola api → TAHAP 5 EVOLUSI BARA | EVOLUSI TEMAN / …dan teman berevolusi! | **Drop** pada 0:48 |
| 0:50–0:52.4 | 6 kad trofi (aset sebenar) | KHAZANAH · TROFI / Trofi untuk setiap pencapaian. | Drop |
| 0:52.4–0:56 | Laporan Kemahiran (pratonton diangkat) → 2 halaman PDF sebenar | UNTUK MAK AYAH / Laporan kemahiran + worksheet PDF. | Ringan |
| 0:56–1:00 | Kad akhir: logo, Wira, butang | Jom selamatkan semua teman sambil belajar! · Cuba Demo Sekarang | Outro |

## Voice-over (pilihan)

TTS disekat dalam persekitaran render, jadi video bergantung pada teks skrin dan muzik. Skrip VO dengan masa yang sudah selari ada dalam `srt/promo-gameplay.srt`.

## Semakan

- **Maklumat peribadi:**
  - Tiada e-mel, digit PIN atau notifikasi.
  - Julat yang dielak: B 1.5–3.5, F 1.55–3.1 dan ≥ 12.55, P 0–1.5 dan > 22.1.
  - Sisa label "DEV" pada G5, G6, G7 dan G9 dibuang.
- **Dakwaan:**
  - Tiada harga, "percuma" atau pengiktirafan KPM, dan perkataan "lemah" tidak digunakan.
  - Gangsa / Perak / Emas, taip jawapan, Jurus Penamat dan evolusi semuanya mengikut kod.
- **Nota:** mini game dibuka melalui Kemahiran Fokus, iaitu ciri akaun berbayar `focus`. Mod Demo tidak membukanya. Semak keselarasan butang "Cuba Demo Sekarang" dengan tawaran sebenar sebelum iklan berbayar.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build      # src_* (A B C F K O P G1–G9), aud_B/C/F/K/O.wav, pdf_ws-1.png, pdf_sk-5.png
# dua sinematik baharu: 30 fps, 1080×1920
ffmpeg -i enter.mp4 -vf "fps=30,scale=1080:1920" -c:v libx264 -crf 13 -an $PROMO_BUILD/src_ENTER.mp4
ffmpeg -i enter.mp4 -vn -ac 2 -ar 48000 $PROMO_BUILD/aud_ENTER.wav
ffmpeg -i jatuh.mp4 -vf "fps=30,scale=1080:1920" -c:v libx264 -crf 13 -an $PROMO_BUILD/src_JATUH.mp4
ffmpeg -i jatuh.mp4 -vn -ac 2 -ar 48000 $PROMO_BUILD/aud_JATUH.wav

python3 engine.py timeline_gameplay --out out/promo6-gameplay.mp4 --workers 4
PROMO_FORMAT=ads916 python3 engine.py timeline_gameplay --out out/ads-9x16_promo6-gameplay.mp4 --workers 4
PROMO_FORMAT=feed45 python3 engine.py timeline_gameplay --out out/feed-4x5_promo6-gameplay.mp4 --workers 4
```
