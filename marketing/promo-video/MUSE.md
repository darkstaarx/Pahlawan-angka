# Pahlawan Angka — Promo 4 "Gaya Muse" (54 s)

Video promo keempat. Gayanya diadaptasi daripada video pelancaran Meta "Introducing Muse":

- kanvas putih bersih tanpa mockup telefon;
- UI sebenar terapung sebagai objek sendiri;
- kamera **zoom-tembus** ke dalam elemen sehingga elemen itu menjadi babak seterusnya;
- tipografi berpusat dengan **ikon sebaris** yang muncul perkataan demi perkataan;
- templat berulang "baris atas / [ikon] baris tengah bertukar / baris bawah";
- letupan objek, tanda ✓ dilukis, confetti, dan butang yang membesar menjadi skrin penuh.

Semua grafik diambil daripada aset repo atau potongan rakaman skrin sebenar. Tiada aset luar atau aset jana AI baharu.

| Fail | Isi |
| --- | --- |
| `muse.py` | Enjin gaya Muse. Elemen: `Img`, `Vid`, `Line` (ikon sebaris), `Bubble` (taip), `Check`, `Tap`, `Burst`, `Confetti`, `Panel`. Kamera 2D per babak, `FADES` antara babak |
| `timeline_muse.py` | Babak, kamera, muzik dan SFX versi 54 s |

Audio menggunakan `build_audio` daripada `engine.py`, iaitu muzik asli `music.py` (120 BPM) ditambah SFX, dinormalkan ke −14 LUFS.

## Bahan

| Sumber | Digunakan untuk |
| --- | --- |
| `assets/icons/pa-master-1024.png` | Ikon app (pembuka, ikon sebaris) |
| `assets/questions/money/*`, `assets/questions/counting/*`, `assets/missions/v2/*`, `assets/enemies/minions/*`, trofi, bintang, syiling | Letupan objek pembuka dan medan ikon penutup |
| `assets/heroes/wira-chibi/frames/happy-05-v2.webp`, `victory-v1.webp` | Wira (ikon sebaris, maskot soalan) |
| `assets/coach/cikgu-dimensi/hub-portrait-v1.webp`, `assets/pets/aurora/front.webp` | Ikon templat "Matematik yang …" |
| `assets/fx/segel/{gangsa,perak,emas}-v2.png` | Tiga tahap kunci |
| `assets/ui/evolution/emblem-bara-v1.png`, `assets/pets/evolution/fire/aurora/happy-v1.webp` | Evolusi Bara |
| `assets/pets/collection/*/idle.png` | Enam teman |
| `assets/branding/pahlawan-angka-full-logo-v1.png` | Kad akhir |
| `$PROMO_BUILD/muse/q_neutral.png`, `q_correct.png` | Kad soalan RM41.25 (rakaman F 7.4 s, 9.4 s) |
| `$PROMO_BUILD/muse/focus1-3.png` | Tiga kad Kemahiran Fokus (F 1.4 s) |
| `$PROMO_BUILD/muse/report.png`, `fokus_seterusnya.png` | Laporan kemahiran (R 3.4 s, 0.3 s) |
| `$PROMO_BUILD/muse/lock.png` | Kunci battle aktif. PIN bertitik sahaja (F 12.6 s) |
| `$PROMO_BUILD/src_C.mp4` 12.35–16.3 s | Jurus Penamat → KUKUPAT DITEMUI (kawasan arena sahaja, `rect 0–0.372`) |
| `$PROMO_BUILD/pdf_ws-1.png` | Halaman worksheet PDF |

## Storyboard (1 bar = 2 s)

| Masa | Babak | Teks | Muzik |
| --- | --- | --- | --- |
| 0:00–0:02.6 | Ikon app muncul, kemudian 40+ objek matematik meletup ke grid | — | Intro |
| 0:02.6–0:05.2 | Tipografi | Memperkenalkan / Pahlawan **Angka** | Intro |
| 0:05.2–0:09.6 | Ayat dengan ikon sebaris (ikon PA, abakus, bintang, Wira), kemudian zoom-tembus ke Wira | Pahlawan Angka [ikon] ialah / pengembaraan [abakus] / matematik [bintang] KSSR / untuk anak [Wira] anda. | Ringan |
| 0:09.6–0:11.2 | Kad soalan sebenar terapung, Wira dengan "Jom jawab!", kemudian zoom ke teks soalan | — | Groove |
| 0:11.2–0:13.6 | Teks soalan gergasi, kamera menyorot | Wang sebanyak **RM41.25** dibahagi sama rata kepada **5 orang**… | Groove |
| 0:13.6–0:17.6 | Zoom keluar, tekan RM8.25, jawapan betul, Wira menang, ✓ dilukis | Betul! Kunci retak. | Groove |
| 0:17.6–0:25.6 | Templat bertukar setiap 1.2 s | Matematik yang / [Cikgu Dimensi] ikut kemampuan · [tambah-tolak] jadi pengembaraan · [minion] ada cabaran · [bintang] beri ganjaran · [Aurora] ada teman · [PDF] boleh dicetak / untuk anak anda. | Groove |
| 0:25.6–0:29.3 | 3 kad fokus sebenar terapung, tekan "Latih", butang membesar jadi panel navy | Fokus latihan dipilih / **ikut jawapan anak.** | Build |
| 0:29.3–0:34 | (Gelap) kad video arena sebenar: Jurus Penamat → KUKUPAT DITEMUI | Setiap jawapan betul / **jadi serangan!** · "Teman baharu ditemui!" | **Drop 0:30** |
| 0:34–0:38 | (Gelap) Kubah Gangsa, Perak dan Emas; Emas membesar ke tengah | Tiga tahap kunci → Kunci **Emas** / taip jawapan sendiri | Groove |
| 0:38–0:44 | Aurora → emblem api → **Evolusi Bara** + confetti; Bara bergerak ke cincin 6 teman | Teman pun membesar → Kumpul semua **6 teman** | Break → **drop 0:40** |
| 0:44–0:47.6 | Kad laporan, fokus seterusnya, kunci battle dan worksheet terapung | Mak ayah pun nampak / **kemajuan anak.** | Ringan |
| 0:47.6–0:50 | Medan ikon dengan slogan logo, objek tersedut ke tengah, panel navy | Belajar. / Bertarung. / Jadi **Pahlawan.** | Groove |
| 0:50–0:54 | Kad akhir gelap: logo penuh | Pengembaraan matematik / ikut kemampuan anak. · [Cuba Demo Sekarang] | Outro (hentakan) |

Satu-satunya bunyi permainan asal ialah serangan Jurus Penamat (0:30–0:34). Muzik direndahkan sedikit (ducking) ketika bunyi itu dimainkan.

## Voice-over (pilihan)

TTS disekat dalam persekitaran render. Jika VO mahu ditambah, gunakan skrip ini, kemudian campurkan pada −14 LUFS dengan muzik direndahkan ~8 dB.

| Masa | VO |
| --- | --- |
| 0:02.7 | Memperkenalkan… Pahlawan Angka. |
| 0:05.3 | Pengembaraan matematik KSSR untuk anak anda. |
| 0:09.8 | Soalan wang, masa, pecahan dan banyak lagi. |
| 0:14.3 | Jawab betul? Kunci retak! |
| 0:17.8 | Matematik yang ikut kemampuan, ada cabaran, ganjaran dan teman. |
| 0:25.8 | Fokus latihan dipilih sendiri oleh app, ikut jawapan anak. |
| 0:29.5 | Setiap jawapan betul jadi serangan! |
| 0:34.2 | Gangsa, Perak, Emas. Di tahap Emas, anak taip jawapan sendiri. |
| 0:38.2 | Teman pun membesar… Evolusi Bara! |
| 0:44.2 | Mak ayah pun nampak kemajuan anak. |
| 0:47.8 | Belajar. Bertarung. Jadi Pahlawan. |
| 0:50.5 | Pahlawan Angka. Cuba demo sekarang! |

## Semakan

- **Maklumat peribadi:**
  - E-mel akaun tidak muncul, kerana semua potongan diambil di luar julat pop-up e-mel.
  - Kad "Kunci battle aktif" hanya menunjukkan titik PIN, tanpa digit.
  - Tiada notifikasi muat turun.
- **Dakwaan:** tiada harga, tiada "percuma", tiada pengiktirafan KPM, tiada janji markah naik dan tiada perkataan "lemah".
  - "Fokus latihan dipilih ikut jawapan anak" selari dengan `focusPracticeSummary`: 20 cubaan terkini setiap kemahiran, 3 teratas.
  - "Boleh dicetak" merujuk kepada Latihan PDF (ciri berbayar), tanpa menyebut harga.
- **Pautan:** tiada pautan dalam video. Butang hanya berbunyi "Cuba Demo Sekarang". Letakkan [PAUTAN DEMO] dalam kapsyen semasa memuat naik.

## Render semula

```bash
export PROMO_BUILD=/laluan/ke/build      # src_C.mp4, aud_C.wav, pdf_ws-1.png, muse/*.png
python3 muse.py timeline_muse --frames 12.2,31.5,41 --out semak        # bingkai semakan
python3 muse.py timeline_muse --out out/promo4-muse.mp4 --workers 4
```

Potongan `muse/*.png` dibuat daripada bingkai rakaman (30 fps, tanpa status bar). Kawasan kad dipotong dan bucunya dibulatkan dengan alfa.
