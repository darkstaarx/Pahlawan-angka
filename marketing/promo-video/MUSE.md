# Pahlawan Angka — Promo 4 "Gaya Muse" (v2, 56 s)

Video promo keempat. Transisinya diadaptasi daripada video pelancaran Meta "Introducing Muse":

- kanvas bersih tanpa mockup telefon;
- UI terapung sebagai objek sendiri;
- kamera **zoom-tembus** ke dalam elemen sehingga elemen itu menjadi babak seterusnya;
- tipografi berpusat dengan objek sebaris;
- templat slot "atas / [ikon] tengah bertukar / bawah";
- jubin meletup, tanda ✓ dilukis, confetti, dan panel yang membesar menjadi skrin penuh.

**v2: gameplay sebagai teras.** Versi pertama terlalu banyak guna imej statik. Dalam v2, hampir setiap babak ialah **kad video rakaman sebenar** yang hidup:

- jubin pembuka dan penutup ialah klip gameplay;
- "ikon" dalam ayat ialah klip mini yang bermain;
- UI battle dipecahkan kepada dua kad hidup yang segerak, iaitu arena dan soalan;
- montaj topik, kunci, Khazanah, evolusi, ibu bapa dan multi-skrin semuanya rakaman.

Imej statik hanya untuk ikon app, ikon misi atau kubah dalam teks, dan logo kad akhir.

| Fail | Isi |
| --- | --- |
| `muse.py` | Enjin gaya Muse. Elemen: `Vid` (kad video), `Tiles` (jubin video meletup / tersedut), `Line` (perkataan + ikon + **klip video sebaris**), `Img`, `Bubble` (taip), `Check`, `Tap`, `Confetti`, `Panel`. Kamera 2D per babak, `FADES` antara babak, `SHAKES` (gegaran) |
| `timeline_muse.py` | Babak, kamera, muzik dan SFX versi 56 s |

Audio menggunakan `build_audio` daripada `engine.py`, iaitu muzik asli `music.py` (120 BPM) ditambah SFX dan bunyi asal permainan pada dua detik penting. Audio dinormalkan ke −14 LUFS.

## Rakaman yang digunakan

Semua rakaman berada di `$PROMO_BUILD/src_*.mp4`: 30 fps, tanpa status bar, 1080×2236.

| Kod | Julat (s) | Isi |
| --- | --- | --- |
| C | 7.3–8.8, 7.55–10.3, 10.4–18.1 | Kunci Perak pecah; arena (klip sebaris); soalan "Matahari baru terbit…" → tekan **pagi** → Jurus Penamat → KUKUPAT DITEMUI |
| O (590p dinaikkan) | 61.9–63.7, 68.9–70.45, 81.6, 90.9–92.5, 111.6–114.3, 119.2–120.8 | Soalan Nombor, Ruang (Kunci Gangsa), Wang, Masa, **Kunci Emas, taip "40"**, Data |
| B | 5.7–7.9, 17.6–19.0 | Wira berjalan ke menara; soalan wang dijawab betul |
| K | 1.6–4.25, 12.0–17.6 | Khazanah (Aurora → Kurapat → Kumbis); Aurora → emblem api → **EVOLUSI BARA** |
| R | 4.3–6.8 | Laporan kemahiran (skrol) |
| F | 0.2–1.4, 12.1–12.5 | Halaman Kemahiran Fokus; dialog "Kunci battle aktif" (medan PIN kosong) |
| A, T | 0.5–1.5, 1.7–3.6 | Hub; Peta Topik |
| LAP, TAB, TV1 | 12.0–14.25, 24.0–26.0, 0.5–2.25 | Laptop, tablet, TV. **Audio dibisukan** |

Julat yang **dielakkan**:

- B 1.5–3.5 dan F 1.6–3.05 (e-mel);
- F ≥ 12.6 (PIN sedang ditaip);
- O sekitar 0:42–0:50 dan 2:37–2:42 (dialog PIN, pop-up kata laluan) serta ≥ 3:06 (notifikasi muat turun);
- O soalan yang dijawab salah dahulu (wang RM12, pecahan).

## Storyboard (1 bar = 2 s)

| Masa | Babak | Teks | Muzik |
| --- | --- | --- | --- |
| 0:00–0:02.4 | Ikon app; 14 **jubin gameplay hidup** meletup ke grid (serangan, Jurus Penamat, emblem api, Khazanah, menara, hub, Peta Topik…), kemudian tersedut semula ke ikon | — | Intro |
| 0:02.4–0:04.2 | Tipografi | Memperkenalkan / [ikon] Pahlawan **Angka** | Intro |
| 0:04.2–0:08 | Ayat dengan **klip sebaris** (Wira berjalan ke menara; arena battle dengan kunci pecah), kemudian zoom-tembus ke klip battle | Pengembaraan [klip] / matematik [klip] **KSSR** / Darjah 1 hingga 6. | Ringan |
| 0:08–0:10 | Klip itu menjadi **kad arena hidup**; kad soalan hidup naik di bawahnya (UI dipecahkan). Zoom ke teks soalan | — | Groove |
| 0:10–0:12 | Teks soalan gergasi, kamera menyorot | **Matahari baru terbit** dan murid bersiap ke sekolah. Waktu yang paling sesuai? | Groove |
| 0:12–0:16 | Zoom keluar, jari tekan **pagi**, ✓ "Betul!", arena masuk Jurus Penamat, kad soalan jatuh, arena membesar ke tengah | — | Groove → build |
| 0:16–0:19.6 | (Gelap) **DROP**: arena besar, serangan kilat, KUKUPAT DITEMUI, gegaran kamera | Setiap jawapan betul / **jadi serangan!** · "Teman baharu ditemui!" | **Drop 0:16** |
| 0:19.6–0:27.6 | Templat slot. Kad gameplay hidup bertukar (whip) setiap 1.3 s: Nombor, Wang, Masa, Ruang, Data, Peta Topik | Setiap topik / [ikon misi] **Nombor · Wang · Masa · Ruang · Data · & banyak lagi** / jadi pengembaraan. | Groove |
| 0:27.6–0:33.2 | (Gelap) Kad hidup morph: Kunci Gangsa pecah → Kunci Perak pecah → Kunci Emas (taip "40", Jawab) | Tiga tahap kunci · [kubah] Kunci **Gangsa / Perak / Emas** · "taip jawapan sendiri" | Groove |
| 0:33.2–0:36 | Kad Khazanah hidup (teman bertukar), zoom-tembus | Selamatkan & / **kumpul teman.** | Ringan |
| 0:36–0:42 | (Gelap) Rakaman evolusi: Aurora → emblem api → **EVOLUSI BARA** + confetti + gegaran | Teman pun membesar… · "Evolusi Bara!" | Break → **drop 0:40** |
| 0:42–0:46.4 | Tiga kad hidup: laporan kemahiran (skrol), Kemahiran Fokus, dialog kunci battle | Mak ayah pun nampak / **kemajuan anak.** | Ringan |
| 0:46.4–0:49 | Kad laptop, tablet dan TV (rakaman sebenar, bisu) | Telefon, laptop, tablet, **TV.** | Ringan |
| 0:49–0:52 | Medan jubin gameplay hidup mengelilingi slogan, tersedut ke tengah, panel navy membesar | Belajar. / Bertarung. / Jadi **Pahlawan.** | Groove |
| 0:52–0:56 | Kad akhir gelap: logo penuh | Pengembaraan matematik / ikut kemampuan anak. · [Cuba Demo Sekarang] | Outro (hentakan) |

Bunyi asal permainan hanya dimainkan pada dua detik:

- C 10.5–18.1 (tekan jawapan → Jurus Penamat → teman ditemui);
- K 12.0–17.6 (evolusi).

Muzik direndahkan sedikit (ducking) ketika bunyi itu dimainkan. Audio TV, laptop dan tablet dibisukan.

## Voice-over (pilihan)

TTS disekat dalam persekitaran render. Jika VO mahu ditambah, gunakan skrip ini, kemudian campurkan pada −14 LUFS dengan muzik direndahkan ~8 dB.

| Masa | VO |
| --- | --- |
| 0:02.5 | Memperkenalkan… Pahlawan Angka. |
| 0:04.4 | Pengembaraan matematik KSSR, Darjah 1 hingga 6. |
| 0:12.6 | Jawab betul… |
| 0:16.1 | …setiap jawapan betul jadi serangan! |
| 0:19.8 | Nombor, wang, masa, ruang, data — setiap topik jadi pengembaraan. |
| 0:27.8 | Gangsa, Perak, Emas. Di tahap Emas, anak taip jawapan sendiri. |
| 0:33.4 | Selamatkan dan kumpul teman… |
| 0:36.2 | …dan lihat mereka membesar. Evolusi Bara! |
| 0:42.2 | Mak ayah pun nampak kemajuan anak. |
| 0:46.5 | Di telefon, laptop, tablet atau TV. |
| 0:49.2 | Belajar. Bertarung. Jadi Pahlawan. |
| 0:52.5 | Pahlawan Angka. Cuba demo sekarang! |

## Semakan

- **Maklumat peribadi:**
  - Tiada e-mel; julat pop-up e-mel dan kata laluan dielakkan.
  - Dialog "Kunci battle aktif" diambil sebelum PIN ditaip, jadi medan PIN kosong atau bertitik dan tiada digit kelihatan.
  - Tiada notifikasi muat turun.
  - Nama profil demo (Cica) dan nama teman "Kurapat" (ditukar pengguna) kelihatan dalam rakaman.
- **Dakwaan:** tiada harga, tiada "percuma", tiada pengiktirafan KPM, tiada janji markah naik dan tiada perkataan "lemah".
  - Label "Fokus pilihan app" selari dengan `focusPracticeSummary`, yang memilih 3 teratas berdasarkan 20 cubaan terkini.
  - "Kunci battle (PIN)" ialah kawalan ibu bapa.
- **Pautan:** tiada pautan dalam video. Butang hanya berbunyi "Cuba Demo Sekarang". Letakkan [PAUTAN DEMO] dalam kapsyen semasa memuat naik.

## Render semula

```bash
export PROMO_BUILD=/laluan/ke/build      # src_*.mp4, aud_C.wav, aud_K.wav
python3 muse.py timeline_muse --frames 1.2,9.2,17,23.5,40.6 --out semak     # bingkai semakan
python3 muse.py timeline_muse --out out/promo4-muse-v2.mp4 --workers 4
```
