# Malaysia Pixel Lite V1 — Asset Pack

**Status:** Asset pack untuk prototype; **belum** aplikasi/watch face Wear OS yang boleh dipasang. Dibina semula secara pixel-art berlapis berdasarkan idea mockup No. 1 (Lite). Gambar render pertama dalam `reference_only` ialah **rujukan rupa**, bukan aset untuk terus dipakai sebagai background.

## Apa ada dalam ZIP

- `assets_png/` — **14 layer PNG 480 × 480**, kebanyakannya latar telus (alpha). Semua diletakkan pada canvas 480 × 480; tindih setiap layer pada `(x=0, y=0)` mengikut turutan nama fail.
- `preview_showcase.png` — pandangan hasil komposit, **angka hanya contoh**.
- `preview_face_only.png` — face sahaja, background luar bulatan telus.
- `layout_wireframe.png` — panduan ruang tarikh, masa, hearts & tiga komplikasi.
- `layout.json` — susunan layer, koordinat, bounding box elemen dinamik, kawasan selamat dan arahan AOD.
- `PROMPT_CODEX.md` — prompt siap untuk agent membina dan test watch face.
- `build_assets.py` — script regenerasi layer menggunakan Pillow, jika mahu tweak warna atau komposisi.
- `reference_only/` — mockup pertama daripada sesi design, **jangan** jadikannya production background.

## Apa **tidak** ada dalam PNG asset

Masa, tarikh, langkah, bateri, dan cuaca **tidak dicetak** ke dalam layer production. Nombor seperti `10:08`, `7842`, `86%` dan `28C` muncul pada preview **untuk demonstrasi sahaja**. Agent perlu mengikat komponen jam kepada data watch sebenar.

## Turutan proses

1. Extract ZIP dalam folder PC, contohnya `C:\\WatchFaces\\MalaysiaPixelLiteV1`.
2. Buka `preview_showcase.png` untuk review rupa V1. V1 sengaja jauh lebih ringkas daripada render asal supaya widget kekal jelas.
3. Beri Codex **seluruh folder** (bukan gambar saja) dan suruh baca `PROMPT_CODEX.md` + `layout.json`.
4. Codex bina Watch Face Format/Wear OS project berdasarkan dokumentasi Android/Samsung terkini, lalu build dan test pada emulator.
5. Semak **masa berubah**, tarikh betul, angka bateri sebenar, komplikasi steps/weather hanya jika disokong, dan paparan AOD.
6. Pasang di Galaxy Watch sebenar sebelum sebarang penerbitan.

## Petua realistik

- Jangan *flatten* `preview_face_only.png` menjadi keseluruhan watch face; itu hanya ilustrasi.
- Ikon steps/battery/weather ialah **hiasan**. Jika komponen komplikasi yang dipilih pengguna sudah mempunyai ikonnya sendiri, sembunyikan ikon PNG supaya tidak bertindan.
- `11_flag_arcs_optional.png`, `03_kl_silhouette.png` dan `02_star_speckles.png` boleh dibuang untuk paparan lebih minimal.
- Weather jangan dianggap universal; implement sebagai complication yang boleh dikonfigurasi atau guna nilai lain sebagai fallback. Jika tidak dapat dipastikan, sorok weather dahulu.
- Versi AOD guna `12_aod_bg.png` dan masa sebenar; motif `13_aod_moon_star_optional.png` hanya jika menepati garis panduan ambient/peranti.
- Semak readability pada resolusi 450–480 px dan jam fizikal — tiada keperluan memaksa tiga komplikasi jika terlalu kecil.

## Nama produk

Working title: **Malaysia Pixel · Lite**. Anggap nama sementara sampai semakan Google Play, hak cipta dan jenama selesai.
