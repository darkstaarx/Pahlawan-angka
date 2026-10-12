# Audit Masa, Ukuran, Ruang, Kedudukan dan Data

Tarikh: 12 Oktober 2026  
Skop: 40 kemahiran aktif D1–D6 dalam domain Masa, Ukuran, Ruang, Kedudukan/Koordinat dan Data. Audit ini menyemak laluan production, julat/nilai, pilihan jawapan, format masa, variasi aras dan liputan kandungan generator. Ia bukan pengesahan keseluruhan aplikasi.

## Ringkasan ujian

- 30,000 soalan production dijana pada keadaan pemula, sederhana dan kukuh.
- Tiada pilihan jawapan berulang, `NaN`, nilai tidak terhingga, fallback `2 + 2`, atau waktu tidak sah seperti `2:75`.
- D1–D2 secara umum mempunyai julat kecil dan representasi yang sesuai dengan tahap.
- D6 menunjukkan perkembangan terbaik: pemula menerima bacaan langsung; murid kukuh menerima soalan songsang, hujah, kekangan dan pelbagai langkah.
- Isu terbesar terdapat pada liputan D4–D5 dan pemilihan aras D3. Membesarkan nombor bukan punca utama.

## Penemuan mengikut keutamaan

| Keutamaan | Topik | Apa yang berlaku sekarang | Kenapa ia penting |
|---|---|---|---|
| P0 | D5 Data | Bank aktif hanya mempunyai min/purata, nilai hilang daripada min dan tafsiran carta palang ringkas. Tiada carta pai, mod, median atau julat. | DSKP Tahun 5 secara jelas meliputi carta pai serta mod, median, min dan julat. Sebahagian besar topik tidak diuji. |
| P0 | D5 Ruang | `D5.AREA` hanya menguji luas segi empat tepat, sisi hilang, potongan segi empat dan perbandingan luas. | Kandungan Tahun 5 turut memerlukan ciri poligon sekata, ukuran sudut, perimeter dan luas bentuk gabungan serta isi padu gabungan kubus/kuboid. Nama kemahiran dan liputan semasa terlalu sempit. |
| P1 | D5 Masa | Lima keluarga semasa: hari-jam, bulan-hari, tahun lompat, satu penukaran pecahan jam dan satu tempoh panjang. | Liputan belum mewakili penukaran pecahan/perpuluhan untuk hari, tahun, dekad dan abad serta operasi tambah/tolak masa yang ditetapkan. |
| P1 | D5 Ukuran/Jisim/Isi padu | Penukaran perpuluhan meliputi panjang, jisim dan cecair, tetapi pecahan hanya panjang; tambah hanya panjang; darab/bahagi hanya isi padu cecair. | Jisim dan setiap jenis ukuran sepatutnya mempunyai penukaran serta operasi pecahan/perpuluhan sendiri. Variasi kini bergantung pada jenis unit, bukan perkembangan kefahaman yang lengkap. |
| P1 | D4 Ukuran/Jisim/Isi padu | Jisim dan isi padu cecair hanya muncul sebagai penukaran unit. Panjang mendapat satu tambah tiga nilai; darab/bahagi dan operasi bergabung yang luas tidak diwakili. | Tahun 4 memerlukan operasi tambah/tolak/darab/bahagi dan operasi bergabung bagi panjang, jisim serta isi padu cecair. |
| P1 | D4 Data | Semua empat keluarga menggunakan carta palang atau arahan membina palang. | DSKP 8.1.1–8.1.2 juga memerlukan membina dan mentafsir piktograf. Piktograf langsung tidak muncul. |
| P1 | D3 pemilihan aras | Pemula masih boleh menerima semua 15 keluarga Masa, semua 27 keluarga Ukuran, kes darab/bahagi/songsang, serta kes multi-langkah. D3 Data dan Kedudukan juga hampir sama bagi semua aras. | Pemilihan rekod mengutamakan putaran standard sebelum tahap kesukaran; setiap rekod lazimnya hanya ada satu template. Akibatnya skor `difficultyBand` tidak cukup untuk melindungi pemula. |
| P1 | D3 Ruang untuk pengguna biasa | Laluan umum masih menghasilkan tiga keluarga lama berasaskan perimeter/ciri bentuk. Kandungan QSv2 Prisma, Poligon Sekata dan Paksi Simetri masih melalui akses terkawal/beta. | Pengguna biasa tidak semestinya menerima liputan D3 Ruang yang telah dibina mengikut Edisi 3. Ini perlu diputuskan sebelum mendakwa kandungan D3 lengkap. |
| P2 | D4 Ruang | Satu ID bernama `D4.PERIM` menggabungkan sudut, garis, perimeter, luas segi tiga, isi padu kuboid dan masalah perimeter. | Soalan boleh betul secara individu, tetapi bukti penguasaan bercampur. Murid boleh kelihatan “mahir perimeter” selepas menjawab sudut atau isi padu. |
| P2 | D4 Koordinat | Tiga keluarga yang sama muncul pada pemula dan kukuh: baca, songsang paksi dan gerak titik. | Tiada perkembangan kepada laluan, jarak, skala atau sebab/penjelasan; perbezaan aras sangat kecil. |

## Topik yang kelihatan sihat

| Topik | Pemerhatian |
|---|---|
| D1–D2 | Julat kecil, unit kekal jelas dan bentuk soalan bergerak daripada kenal/banding kepada masalah mudah. |
| D3 Masa/Ukuran/Data/Kedudukan | Kandungan authored luas dan pengiraan asas lulus; masalahnya ialah pemilihan aras, bukan kekurangan jumlah template. |
| D4 Masa | Format 12/24 jam, tempoh, anggaran dan hubungan masa sah. Masih boleh diperkaya kemudian, tetapi bukan jurang paling besar. |
| D5 Koordinat | Baca, gerak, jarak dan titik hilang wujud; tahap kukuh menambah penaakulan titik hilang. Terdapat kod mati lama untuk mod Tahun 6 di dalam blok ini, tetapi ia tidak sampai kepada pengguna. |
| D6 Masa | Zon masa, perubahan hari, jadual, perjalanan berperingkat dan soalan songsang menunjukkan perkembangan aras yang nyata. |
| D6 Ukuran | Menguji perkaitan silang panjang-jisim-isi padu, kadar unit, had sumber, jadual dan dakwaan. |
| D6 Ruang/Kedudukan/Data | Sudut, bulatan, masalah ruang, koordinat berskala, carta pai dan masalah data mempunyai keluarga konsep, aplikasi dan penaakulan yang berbeza. |

## Urutan pembaikan yang disyorkan

1. Lengkapkan D5 Data dan D5 Ruang kerana jurangnya paling besar dan mudah dilihat oleh pembeli.
2. Lengkapkan matriks D4–D5 Ukuran: panjang × jisim × isi padu cecair, kemudian penukaran × tambah/tolak × darab/bahagi × masalah.
3. Lengkapkan D5 Masa berdasarkan unit dan operasi dalam DSKP.
4. Tambah piktograf D4 dan asingkan bukti D4 Ruang mengikut konstruk sebenar.
5. Baiki pemilih D3 supaya aras template ditapis sebelum putaran standard; kemudian buka D3 Ruang QSv2 kepada laluan production yang sesuai.
6. Selepas kandungan ditambah, jalankan audit visual telefon/tablet bagi carta, grid, jam, bekas cecair dan bentuk gabungan.

## Rujukan kurikulum yang digunakan

- [DSKP Matematik Tahun 4](https://asiemodel.net/wp-content/uploads/2022/08/DSKP-KSSR-SEMAKAN-2017-MATEMATIK-TAHUN-4.pdf): Ukuran dan Sukatan 5.0 serta Pengurusan Data 8.0.
- [DSKP Matematik Tahun 5](https://asiemodel.net/wp-content/uploads/2022/08/009_DSKP_KSSR_Semakan_2017_Matematik_Thn5-print.pdf): Masa 4.0, Ukuran 5.0, Ruang 6.0 dan Data 8.0.
- [KPM SPOT Tahun 4](https://sites.google.com/moe-dl.edu.my/spot-kpm/sekolah-rendah/tahun-4/matematik): susunan topik operasi ukuran, ruang, koordinat dan data.

## Bukti teknikal

- `node audit/non-money-domain-audit.cjs` — 30,000 sampel, 40 kemahiran.
- `audit/non-money-domain-audit-report.json` — senarai archetype, representasi dan julat prompt mengikut pemula/sederhana/kukuh.
- `node audit/grade-depth-validation.cjs` — semakan umum semua darjah.
