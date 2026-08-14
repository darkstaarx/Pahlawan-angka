# Audit Cikgu Wajar — Darjah 3 hingga 6

## Skop

- 51 kemahiran dalam bank Darjah 3–6.
- 500 sampel bagi setiap kemahiran (25,500 soalan keseluruhan).
- Semakan jawapan/pilihan berulang, pilihan bertindih, nombor tidak sah dan perpuluhan melampau.

## Punca yang ditemui

1. Beberapa generator mempunyai ruang kombinasi terlalu kecil, khususnya ukuran, masa, peratus dan koordinat.
2. Pengiraan wang/peratus menggunakan nombor titik-apung mentah dan boleh memaparkan ekor seperti `67.19999999999999`.
3. Distractor perpuluhan D4/D6 mencampurkan nombor dan string lalu boleh menghasilkan pilihan rosak.
4. Fail probe D3 berisiko menimpa bank produksi kerana menggunakan nama pendaftaran yang sama.

## Pembaikan v3.8.0

- Normalisasi pusat: nombor jawapan dan pilihan maksimum dua tempat perpuluhan.
- Format wang stabil dan konsisten.
- D5 perpuluhan dipelbagaikan kepada pecahan-perpuluhan, operasi tambah/tolak dan nilai tempat.
- Ruang kombinasi ukuran, masa, peratus dan koordinat diperbesar melepasi tetingkap anti-repeat 18 soalan.
- D3 darab/bahagi mempunyai variasi ayat konteks.
- Bank probe D3 dipisahkan daripada bank produksi.
- Pilihan fallback kini mengikut jenis jawapan (wang, peratus, pecahan, masa dan koordinat), bukan menambah digit pada teks.

## Keputusan QA

- 25,500 / 25,500 sampel lulus.
- 0 jawapan atau pilihan melebihi dua tempat perpuluhan.
- 0 pilihan jawapan bertindih.
- 0 `NaN`, `Infinity` atau nilai tidak sah.
- Semua fail JavaScript D3–D6 lulus syntax check.

Rujukan tahap kandungan: DSKP KSSR (Semakan 2017) Matematik Tahun 3–6, Bahagian Pembangunan Kurikulum, KPM.
