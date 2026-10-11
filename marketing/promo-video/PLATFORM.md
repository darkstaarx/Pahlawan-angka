# Promo #3 — "Semua Skrin" (32.5 s, 9:16)

Timeline: `timeline_platform.py` · Enjin: `engine.py` (`FullClip`, `DeviceClip`, `Chip`) · Muzik: `music.py`.

**Audio:** semua audio sumber dibisukan. Klip TV ditukar dengan `-an`, dan video hanya mengandungi muzik asli serta kesan bunyi.

## Konsep

- **Hook:** pembalikan jangkaan yang dekat dengan ibu bapa Malaysia. *"Anak depan TV lagi?"* (rungutan biasa) → *"Tenang… dia tengah buat Matematik."*
- **Isi:** rakaman TV sebenar, kemudian app sebenar pada laptop, tablet dan telefon. Ini bukti app berjalan di browser tanpa perlu dimuat turun, dan progress kekal dalam satu akaun.

## Sumber

| Kod | Sumber | Nota |
| --- | --- | --- |
| TV1, TV2 | `20261011_171100_1/2.mp4` (4K HEVC) | Rakaman tangan TV sebenar dengan remote. **Audio dibuang.** |
| LAP | App sebenar `origin/main`, mod *Cuba Demo* | Dirakam dengan Chromium (Playwright) pada **1440 × 900**. Soalan sebenar dijawab betul secara automatik |
| TAB | Sama, pada **834 × 1194** | Termasuk "Kunci GANGSA pecah!" |
| C, F | Rakaman telefon HD | Jurus Penamat dan hub profil yang sama dengan TV (Lv. 21) |

Skrip rakaman app tidak disimpan dalam repo. Ia guna `PADemo.start()` dan `PASegelDemo.state().q.answer` untuk memilih jawapan betul.

## Storyboard

| Masa | Visual | Teks |
| --- | --- | --- |
| 0:00–0:02 | TV2 dikaburkan dan dimalapkan. "TV" besar warna emas, dipintal | **Anak depan TV lagi?** |
| 0:02–0:04 | Sama | Tenang… dia tengah buat **Matematik.** |
| 0:04–0:08 | Drop muzik. TV1 skrin penuh: hub → Peta Topik dengan kursor remote. Chip "TV" | PAHLAWAN ANGKA DI TV / **Skrin besar. Lagi seronok.** / Buka terus di browser TV pintar. |
| 0:08–0:16 | Laptop (LAP), tablet (TAB) dan telefon (C) masuk satu demi satu, dengan chip Laptop / Tablet / Telefon | SEMUA PLATFORM / **Satu game. Semua skrin.** / Telefon · Tablet · Laptop · TV |
| 0:16–0:22 | Tetingkap browser (tab dan bar alamat "Pahlawan Angka", **tiada URL**) memaparkan app | Tak perlu ~~download.~~ / **Buka browser. Terus main.** / Tak makan storan peranti. |
| 0:22–0:28 | TV1 hub (Lv. 21) dengan gelang emas + telefon pada hub yang sama (Lv. 21 disorot) | SATU AKAUN / **Main di TV, sambung di telefon.** / Progress disimpan dalam akaun. |
| 0:28–0:32.5 | Wira di tepi kotak | Jom, Wira **temankan!** / Di skrin mana pun. / Cuba Demo Sekarang |

## Dakwaan & bukti

| Dakwaan | Bukti |
| --- | --- |
| Main di TV melalui browser | Rakaman TV sebenar. Layout melintang sama dengan versi laptop |
| Laptop / tablet | App sebenar (`origin/main`) dijalankan dan dirakam pada saiz tersebut |
| Tak perlu download | App ialah aplikasi web (`index.html` + JS), dibuka terus dalam browser |
| Satu akaun, progress disimpan | `js/cloud.js`: login akaun penjaga (Supabase), `game_saves.upsert`, `child_profiles`. TV dan telefon menunjukkan profil yang sama (Lv. 21) |

Nota: skrin login dalam rakaman Chromium memaparkan ralat "Cloud login gagal dimuat" kerana tiada rangkaian dalam persekitaran rakaman. Bahagian itu **tidak digunakan**.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build   # src_TV1/2.mp4 (1080x1920, -an), src_LAP.mp4, src_TAB.mp4, src_C.mp4, src_F.mp4
python3 engine.py timeline_platform --out out/promo3-semua-skrin.mp4 --workers 4
```
