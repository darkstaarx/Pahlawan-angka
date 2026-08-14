# Penjajaran Buku Teks/DSKP KSSR Matematik D1–D6 — v3.8.31

Tarikh semakan: 14 Ogos 2026  
Skop kod: 102 kemahiran produksi dalam `data/kssr/knowledge-graph.json` dan generator v3.8.31. Tiada production code diubah.

## Kaedah dan tahap keyakinan

Laporan ini membezakan bukti seperti berikut:

- **[V] Disahkan:** struktur/tuntutan terlihat dalam portal Buku Teks Digital KPM, DSKP yang dipautkan sekolah KPM, kandungan buku/modul KSSR Semakan yang menyatakan halaman/SP/TP, atau sampel halaman yang boleh dibaca.
- **[I] Inferens kukuh:** pola berulang yang dirumus daripada beberapa sampel buku/DSKP; bukan petikan arahan rasmi tunggal.
- **[U] Belum pasti:** pemetaan terperinci memerlukan semakan penuh naskhah buku teks/DSKP edisi tepat. Jangan jadikan keputusan release tanpa pengesahan guru KSSR.

Sumber utama/berautoriti yang dapat dicapai:

1. Portal Buku Teks Digital Asas, Bahagian Sumber dan Teknologi Pendidikan KPM, menyenaraikan Matematik SK Jilid 1/2 bagi Tahun 1 dan navigasi Tahun 1–6: https://sites.google.com/moe-dl.edu.my/bukuteksdigitalkpm/tahun-1
2. Laman Panitia Matematik sekolah domain `moe-dl.edu.my` yang memaut DSKP Tahun 1–6, buku teks, MOBIM dan PBD: https://sites.google.com/moe-dl.edu.my/panitia-matematik-skk/rujukan/buku-teks
3. MOBIM Matematik Tahun 2 (bahan bimbingan PdP berasaskan SP dan halaman buku teks), termasuk manipulatif/gambar Dienes, kad nombor, perbincangan dan latihan berperingkat: https://fliphtml5.com/bdmls/xyhc/MOBIM_MATEMATIK_TAHUN_2/

Sumber textbook-derived sokongan (bukan penerbitan rasmi KPM, maka digunakan hanya untuk struktur/sampel dan dilabel [V-secondary]):

- Tahun 2, kandungan dan aktiviti berasaskan buku teks: https://anyflip.com/xjenq/jipn/basic
- Tahun 3, kandungan, SP/TP dan sampel aktiviti: https://anyflip.com/nnszl/ulaa/basic/ dan https://anyflip.com/xjenq/wwgv/basic
- Tahun 4, kandungan/SP/TP: https://anyflip.com/xjenq/xqxs/basic
- Tahun 5, kandungan dan halaman rujukan buku teks: https://anyflip.com/xjenq/qrfx/basic dan https://anyflip.com/xjenq/hhhe/basic
- Tahun 6, naskhah buku teks digital: https://online.anyflip.com/fzatu/cwgr/mobile/index.html; senarai unit sokongan: https://cikgu.info/shop/latihan-buku-teks-matematik-tahun-6-kssr-semakan/

Had bukti: fail penuh Google Drive/iframe bagi semua enam DSKP tidak dapat diekstrak sebagai teks oleh alat semakan. Oleh itu urutan unit dapat disahkan dengan baik, tetapi setiap SP mikro perlu disahkan terhadap PDF DSKP edisi sekolah sebelum implementasi besar.

## Struktur unit mengikut darjah

### Darjah 1

**[V-secondary]** Struktur tema yang konsisten ialah Nombor hingga 100; Tambah dan Tolak; Pecahan; Wang; Masa dan Waktu; Panjang/Jisim/Isi Padu Cecair; Bentuk dan Ruang; Data. Portal KPM mengesahkan buku Matematik Tahun 1 terbahagi kepada Jilid 1 dan Jilid 2.

**Pemetaan produksi:** 14 skills meliputi lapan keluarga unit tersebut. Urutan chapter 1–8 di graph masuk akal sebagai pengelompokan aplikasi, walaupun buku Tahun 1 boleh memecahkan nombor/operasi mengikut julat 10, 20 dan 100 dengan lebih halus **[U]**.

**Jurang:** `D1.MEASURE` hanya unit pilihan untuk pensel, tidak meliputi tiga subdomain panjang, jisim dan isi padu; `D1.TIME` hanya jam tepat; `D1.MONEY` hanya tambah RM; bentuk/data hanya pengenalan sangat sempit. Graph ada coverage label tetapi bukan coverage buku teks sebenar.

### Darjah 2

**[V-secondary, keyakinan tinggi]** Urutan 8 unit:

1. Nombor hingga 1 000
2. Tambah, Tolak, Darab dan Bahagi
3. Pecahan dan Perpuluhan
4. Wang
5. Masa dan Waktu
6. Panjang, Jisim dan Isi Padu Cecair
7. Bentuk
8. Data

**Pemetaan produksi:** chapter D2.1–D2.8 tepat mengikut urutan dan mempunyai 37 skills granular. Ini darjah paling sejajar: nilai nombor/angka-perkataan/model, operasi, wang, jam, ukuran visual, bentuk/net, gundalan dan carta semuanya wujud.

**Jurang:** beberapa skill buku teks masih disatukan secara kasar atau hilang depth: D2 nombor belum memastikan susun tertib sebagai archetype khusus; operasi belum mempunyai unknown-position/semakan kewajaran; wang/masa tertentu terlalu prosedural. Namun coverage struktur adalah baik.

### Darjah 3

**[V-secondary, keyakinan tinggi]** Urutan 9 unit:

1. Nombor hingga 10 000
2. Tambah, Tolak, Darab dan Bahagi
3. Pecahan, Perpuluhan dan Peratus
4. Wang
5. Masa dan Waktu
6. Panjang, Jisim dan Isi Padu Cecair
7. Bentuk
8. Kedudukan
9. Data

**Pemetaan produksi:** graph hanya menggunakan chapter 1–8 dan tiada skill Kedudukan. `D3.DATA` ditempatkan chapter 8 walhal data ialah Unit 9. `D3.FRAC` dan `D3.DEC` ada, tetapi tiada D3.PERCENT walaupun sumber kandungan menyenaraikan peratus dalam Unit 3.

**Jurang kritikal:** Unit 8 Kedudukan hilang sepenuhnya; peratus hilang; nombor hingga 10 000 hanya compare dan nilai digit walaupun sampel buku menunjukkan angka/perkataan, tertib, rangkaian, anggaran, pembundaran dan penyelesaian masalah. `D3.SHAPE` hanya perimeter rectangle; `D3.DATA` hanya jumlah bar dan tidak meliputi piktograf/carta pai/perkaitan representasi yang terlihat pada sampel SP/TP.

### Darjah 4

**[V-secondary, keyakinan tinggi]** Urutan 8 unit:

1. Nombor dan Operasi
2. Pecahan, Perpuluhan dan Peratus
3. Wang
4. Masa dan Waktu
5. Panjang, Jisim dan Isi Padu Cecair / Ukuran dan Sukatan
6. Ruang
7. Koordinat, Nisbah dan Kadaran
8. Pengurusan Data

**Pemetaan produksi:** graph memisahkan nombor sebagai chapter 1 dan operasi sebagai chapter 2, lalu menggeser semua unit berikutnya: pecahan/perpuluhan diberi chapter 3, wang 4, masa 5, ukuran 6, ruang 7 dan data 8. Secara UI ini mungkin pilihan progression dalaman, tetapi ia tidak sepadan dengan nombor unit buku teks.

**Jurang kritikal:** tiada D4.PERCENT; tiada koordinat, nisbah atau kadaran; Unit Ruang direduksi kepada perimeter rectangle; data hanya “palang paling tinggi”. Unit 1 buku merangkumi lebih daripada compare/value/add/sub/mul/div—sampel SP menunjukkan membaca/menulis nombor, susun, bundar, operasi hingga beberapa nombor dan penyelesaian masalah.

### Darjah 5

**[V-secondary, keyakinan tinggi]** Urutan 8 unit:

1. Nombor Bulat dan Operasi
2. Pecahan, Perpuluhan dan Peratus
3. Wang
4. Masa dan Waktu
5. Panjang, Jisim dan Isi Padu Cecair
6. Ruang
7. Koordinat, Nisbah dan Kadaran
8. Pengurusan Data

**Pemetaan produksi:** kandungan wujud untuk nombor, operasi, pecahan/perpuluhan/peratus, wang, masa, ukuran, luas, koordinat dan data. Tetapi chapter graph sekali lagi mengikuti pecahan dalaman 1=Nombor, 2=Operasi, 3=Pecahan, 4=Wang dan seterusnya; label chapter tidak sama dengan unit buku.

**Jurang kritikal:** Unit 1 buku merangkumi tambah/tolak serta operasi bergabung dan masalah, tetapi produksi hanya D5.MUL/DIV; tiada D5.ADD/SUB/combined operations, angka-perkataan, susun, bundar, nombor perdana atau problem-solving breadth. Unit 7 hanya coordinate; nisbah/kadaran tiada. Ruang hanya area rectangle, tanpa sifat/volume yang mungkin dituntut **[U: SP mikro perlu disahkan]**. Data hanya purata.

### Darjah 6

**[V-secondary, keyakinan tinggi]** Urutan 8 unit:

1. Nombor Bulat dan Operasi Asas / Kenali Nombor Juta
2. Pecahan, Perpuluhan dan Peratus
3. Wang
4. Masa dan Waktu
5. Ukuran dan Sukatan
6. Ruang
7. Koordinat, Nisbah dan Kadaran
8. Pengurusan Data dan Kebolehjadian

**Pemetaan produksi:** 12 skills menyentuh semua keluarga besar tetapi tersusun semula: `D6.RATIO` diletakkan chapter 3 bersama pecahan, bukan Unit 7; `D6.COORD` dan `D6.AREA` chapter 7; data chapter 8. `D6.DATA` title menyebut kebarangkalian mudah tetapi generator hanya anggaran peratus carta—tiada kebolehjadian.

**Jurang kritikal:** nombor/operasi hanya sequence dan satu bentuk order-of-operations; pecahan hanya mixed→improper; ratio hanya equivalent ratio; masa hanya speed-distance-time; ukuran hanya kg/g; ruang hanya volume cuboid walaupun ID `AREA`; coordinate stem sudah memberitahu koordinat; kebolehjadian tiada. Coverage label jauh melebih coverage item.

## Pedagogi berulang dalam buku/DSKP

### Urutan pembelajaran

**[V/I]** Sampel MOBIM, buku aktiviti dan modul SP/TP menunjukkan urutan berulang:

1. Aktifkan pengalaman/konteks atau objek konkrit.
2. Teroka dengan manipulatif/gambar/model (Dienes, kad nombor, garis nombor, jam, wang, bekas, rajah).
3. Namakan konsep dan sambungkan representation kepada simbol/ayat matematik.
4. Contoh berpandu atau strategi/cara penyelesaian.
5. Latihan terus dan variasi representasi.
6. Aplikasi situasi harian.
7. Semak kewajaran, pelbagai strategi, masalah rutin dan bukan rutin mengikut TP lebih tinggi.

Pahlawan Angka sekarang sering melompat terus ke langkah 5 (MCQ simbolik), terutama D3–D6. Cikgu Wajar membaiki sebahagian langkah 3–4 selepas kegagalan, tetapi model/variasi perlu muncul dalam bank biasa juga, bukan hanya intervention.

### Bentuk paparan/soalan yang terlihat

**[V]** Contoh yang dapat dibaca merangkumi:

- padan angka dengan perkataan;
- isi jadual nilai tempat/nilai digit;
- cerakin dan gabung semula;
- susun menaik/menurun dan lengkapi rangkaian/garis nombor;
- tandakan pernyataan betul/salah;
- gambar Dienes/manipulatif dan kumpulan objek;
- bundar/anggar dengan rajah;
- operasi standard, tempat kosong, operasi bergabung dan tanda kurung;
- penyelesaian masalah situasi harian, termasuk lebih daripada satu cara;
- piktograf, carta palang dan carta pai serta perkaitan antara representation;
- TP4 masalah rutin, TP5 pelbagai strategi, TP6 bukan rutin/kreatif.

Produksi v3.8.31 hampir sepenuhnya pilihan empat jawapan. MCQ boleh dikekalkan untuk mobile battle, tetapi stem mesti mensimulasikan bentuk textbook: pilih padanan, pilih model, lengkapkan elemen hilang, pilih pernyataan/strategi, cari kesalahan, dan tafsir rajah—bukan semua direct calculation.

### Representasi visual

**[V/I]** Representasi bukan hiasan; ia membawa konsep. Model yang berulang termasuk objek konkrit/gambar, blok asas 10/Dienes, jadual nilai tempat, garis nombor, pecahan berlorek, jam/timeline, wang/harga, pembaris/skala/bekas, bentuk/net, grid kedudukan/koordinat, jadual/gundalan/piktograf/carta.

D2 produksi mengandungi banyak model tersebut. D1 kurang, dan D3–D6 merosot mendadak kepada teks. Ini tidak selari dengan cara buku menghubungkan konsep→model→simbol→aplikasi.

## Gap matrix terhadap 102 skills

| Darjah | Penjajaran urutan unit | Coverage produksi | Gap unit/strand | Gap depth textbook |
|---|---|---|---|---|
| D1 | Sederhana/baik **[U pada pecahan unit kecil]** | Semua 8 keluarga | Tiada keluarga besar hilang | Ukuran, masa, wang, data, bentuk terlalu nipis; visual/konkrit kurang |
| D2 | Sangat baik | 37 skills granular | Tiada unit besar hilang | Masih kurang unknown, kewajaran, multiple strategy pada beberapa skills |
| D3 | Lemah | 13 skills | Kedudukan dan Peratus hilang; Data salah nombor chapter | Kebanyakan subskill nombor/operasi/ukuran/ruang/data hilang |
| D4 | Lemah sebagai nombor unit; sederhana sebagai keluarga | 13 skills | Peratus; koordinat; nisbah; kadaran hilang | Semua skill hanya satu archetype; problem-solving/representations sangat kurang |
| D5 | Lemah sebagai nombor unit; sederhana sebagai keluarga | 13 skills | Tambah/tolak/combined ops; nisbah/kadaran hilang | Nombor, ruang dan data terlalu sempit |
| D6 | Lemah sebagai nombor unit; keluarga disentuh | 12 skills | Kebolehjadian hilang; strand Ratio salah lokasi | Hampir setiap unit diwakili satu prosedur sahaja |

## Pemetaan gap berkeutamaan

### P0 — pembetulan taxonomy/coverage claim

1. Jangan memaparkan chapter dalaman D3–D6 sebagai nombor unit buku teks tanpa mapping layer.
2. Tambah `textbookUnit`, `strand`, `standardRef` dan `mappingConfidence` berasingan daripada `chapter` gameplay.
3. Tandakan coverage sebagai `sample`, `partial` atau `covered`; jangan anggap satu skill bermakna satu unit lengkap.
4. Betulkan D3 Unit 8 Kedudukan/Unit 9 Data; D6 Ratio→Unit 7; D6 kebolehjadian; D6.AREA taxonomy.

### P1 — unit yang hilang

- D3: Kedudukan dan Peratus.
- D4: Peratus; Koordinat, Nisbah dan Kadaran.
- D5: tambah/tolak/operasi bergabung Unit 1; Nisbah dan Kadaran Unit 7.
- D6: Kebolehjadian serta breadth Unit 1/7.

### P2 — tiru urutan pedagogi, bukan rupa halaman

Untuk setiap skill, bina archetype cycle:

`CONCRETE/CONTEXT → VISUAL MODEL → SYMBOL → APPLICATION → REASONING/ERROR`

Adaptive engine memilih entry point mengikut evidence. Murid lemah mendapat nombor mudah dan visual; murid stabil tidak diulang formula sama tetapi bergerak ke application/reasoning. Ini sepadan dengan cadangan metadata dalam `QUESTION-BANK-D1-D6-VARIETY-AUDIT-v3.8.31.md`.

### P3 — problem solving

Gunakan struktur tetap yang boleh difahami murid:

1. Apakah yang diketahui?
2. Apakah yang dicari?
3. Pilih model/operasi/strategi.
4. Selesaikan.
5. Semak unit dan kewajaran.

Dalam battle MCQ, lima langkah boleh dibahagi ke archetype berbeza atau checkpoint Cikgu Wajar; tidak perlu memaparkan esei panjang pada satu kad.

## Cadangan metadata penjajaran

```js
{
  id: "D3.POSITION",
  grade: 3,
  gameplayChapter: "8",
  textbookUnit: 8,
  textbookUnitTitle: "Kedudukan",
  strand: "Perkaitan dan Algebra",
  standardRef: ["VERIFY_FROM_DSKP"],
  mappingConfidence: "pending",
  coverage: "missing"
}
```

Untuk skill sedia ada, `coverage` ditentukan pada aras standard/archetype, bukan ID semata-mata. Contoh `D6.DATA` ialah `partial`, kerana carta/peratus ada tetapi kebolehjadian tiada.

## Kesimpulan

Struktur D2 paling hampir dengan buku teks dan patut menjadi template seni bina kandungan. D1 memerlukan concrete breadth. D3–D6 bukan sekadar kurang variasi; beberapa unit/strand hilang, chapter gameplay tidak lagi sama dengan unit textbook, dan satu skill terlalu luas digunakan untuk mewakili satu unit penuh. Penambahbaikan paling selamat ialah menambah mapping layer yang jelas, menutup unit hilang, kemudian membina archetype mengikut sequence textbook concept/model/symbol/application/reasoning sambil mengekalkan adaptive/mastery/misconception engine.

Semua pemetaan SP mikro yang ditanda **[U]** atau `VERIFY_FROM_DSKP` mesti disahkan terhadap PDF DSKP rasmi edisi tepat sebelum code production diubah.
