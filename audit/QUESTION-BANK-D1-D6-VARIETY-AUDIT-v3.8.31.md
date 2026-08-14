# Audit Variasi Bank Soalan Darjah 1–6 — v3.8.31

Tarikh audit: 14 Ogos 2026  
Skop: semua 102 kemahiran produksi dalam `questions/d1/core.js`, lapan bank D2, dan `questions/d3/core.js` hingga `questions/d6/core.js`. `questions/d1/recovery.js` dan `questions/d3/stretch.js` diperiksa sebagai fail sokongan tetapi bukan bank yang dimuatkan oleh `index.html`. Tiada fail aplikasi diubah dalam audit ini.

## Keputusan eksekutif

Masalah yang dilaporkan memang meluas dan bukan terhad kepada Ukuran. Daripada 102 kemahiran produksi:

- 66 mempunyai hanya **satu archetype pemikiran**;
- 12 mempunyai dua archetype;
- 15 mempunyai tiga archetype;
- 9 mempunyai empat atau lebih archetype.

Maksudnya, kira-kira 65% bank hanya menukar nombor, nama objek atau ayat kecil tanpa mengubah tindakan matematik. Risiko paling tinggi ialah D3–D6: D3 mempunyai 11/13 kemahiran satu archetype, D4 13/13, D5 11/13, dan D6 11/12. Dalam misi manual 14 soalan atau Latihan Fokus 10–15 soalan, murid hampir pasti mengulang struktur sama berkali-kali.

Darjah 2 jauh lebih matang dari segi visual, konteks dan variasi. Namun beberapa kemahiran operasi dan wang masih mengulang bentuk simbolik yang sama. Darjah 1 pula terlalu bergantung pada satu prompt bagi hampir semua domain selain nilai tempat.

## Mengapa audit lama tidak mengesan masalah

`audit/full-d2-regression.js` dan `audit/full-d3-d6-audit.js` mengira keunikan berdasarkan `prompt + answer`. `questions/index.js` juga menghalang hanya fingerprint `prompt + answer`. Oleh itu `7 kg 700 g` dan `4 kg 250 g` dianggap dua soalan berbeza walaupun kedua-duanya archetype `mixed-unit → smaller-unit` dan memerlukan prosedur yang sama.

`formatShift` pula hanya Boolean. `coachFormatSignature()` melihat `kind|diagnostic|formatShift`, bukan jenis tugasan. Banyak generator menetapkan `formatShift:true` bagi semua keluarannya, menyebabkan sistem menganggap variasi format wujud walaupun tiada.

QA lama masih berguna untuk mengesan pilihan berulang, nombor tidak sah dan exact duplicate. Ia bukan audit kepelbagaian pedagogi.

## Skala penilaian

- **Kritikal (C):** 1 archetype; 14-soalan menjadi worksheet formula sama.
- **Tinggi (H):** 2 archetype atau satu konsep dengan perubahan kosmetik; pengulangan jelas dalam 10–15 soalan.
- **Sederhana (M):** 3 archetype; memadai untuk sesi pendek tetapi perlu rotation.
- **Rendah (L):** 4+ archetype yang benar-benar mengubah representasi/tindakan; masih perlu anti-repeat.

“Archetype” bermaksud murid perlu membaca representasi berbeza, memilih operasi berbeza, mencari unsur hilang, menerangkan kesalahan, atau mengaplikasi konsep dalam situasi berbeza. Pertukaran nombor, nama buah, bilangan operand tanpa strategi baharu, atau ayat sinonim tidak dikira archetype baharu.

## Audit setiap kemahiran

### Darjah 1 — 14 kemahiran

| Skill | Archetype sebenar | Risiko | Variasi/kualiti semasa | Keutamaan pembaikan |
|---|---:|:---:|---|---|
| D1.N20 | 1 | C | Pilih nombor lebih besar sahaja; tiada objek, garis nombor atau susunan | Tambah kuantiti visual, nombor hilang, susun nombor |
| D1.N100 | 1 | C | Sama seperti N20, hanya julat lebih besar | Banding berasaskan puluh/sa, garis nombor, urutan |
| D1.PV100 | 5 | L | Nilai digit, nama tempat, cerakin, bina nombor, bundar; distractor diagnostik baik | Pisahkan bundar kepada skill sesuai jika pemetaan KSSR memerlukannya; rotation eksplisit |
| D1.CMP100 | 1 | C | “lebih kecil” sahaja; bertindih dengan N100 | Simbol `< > =`, susun menaik/menurun, kuantiti/model |
| D1.ADD20 | 1 | C | Ayat simbolik sahaja; distractor `units_only/place` berguna | Gambar objek/ten-frame, number bond, nombor hilang, cerita join/result unknown |
| D1.SUB20 | 1 | C | Ayat simbolik sahaja | Gambar take-away, difference, nombor hilang, cerita change/compare |
| D1.ADD100 | 1 | C | Hanya nombor lebih besar; thinking tidak berubah | Nilai tempat/model, regroup/no-regroup, masalah cerita |
| D1.SUB100 | 1 | C | Hanya nombor lebih besar | Model nilai tempat, beza, unknown start/change/result |
| D1.FRAC | 1 | C | Kenal pecahan daripada bar berlorek; visual baik tetapi tunggal | Pilih gambar, lengkap keseluruhan, banding unit fraction, bahagian tidak sama sebagai non-example |
| D1.MONEY | 1 | C | Tambah RM simbolik; tiada wang visual | Kenal syiling/wang, bina nilai, pilih cukup/tidak cukup, baki mudah |
| D1.TIME | 1 | C | Baca jam tepat daripada jam analog | Padankan analog-digital, awal/lewat, aktiviti harian, satu jam selepas/sebelum |
| D1.MEASURE | 1 | C | Item pensel dan jawapan cm sentiasa sama; exact prompt boleh berulang | Pilih unit untuk pelbagai objek, banding panjang/jisim/isipadu, ukur visual |
| D1.SHAPE | 1 | C | Namakan 3 bentuk visual; konteks sederhana | Ciri, padan objek harian, kumpul/asing bentuk, bina pola bentuk |
| D1.DATA | 1 | C | Cari palang tertinggi; visual ada | Baca nilai, paling sedikit, jumlah dua kategori, jadual/gundalan/piktograf mudah |

Catatan: `questions/d1/recovery.js` mempunyai struktur hampir sama dan tidak dimuatkan dalam HTML produksi. Jika hendak digunakan untuk recovery, ia perlu dibaiki serentak supaya Cikgu Wajar tidak menurunkan murid kepada worksheet yang sama.

### Darjah 2 — 37 kemahiran

| Skill | Archetype sebenar | Risiko | Variasi/kualiti semasa | Keutamaan pembaikan |
|---|---:|:---:|---|---|
| D2.1.1 | 3 | M | Banding nilai, simbol, blok asas 10; visual/kognitif baik | Tambah susun tiga nombor; rotation |
| D2.1.2 | 2 | H | Perkataan→angka dan angka→perkataan | Tambah bina daripada nilai tempat / pembetulan ejaan nombor |
| D2.1.3 | 1 | C | Lengkap satu nombor hilang dalam pola; step/direction hanya angka | Cari aturan, lebih satu blank, titik mula/akhir hilang |
| D2.1.4 | 5 | L | Nilai digit, tempat, cerakin, missing part, bina model | Kekalkan; tambah ID archetype sahaja |
| D2.1.5 | 1 | C | Anggar titik kepada puluh; visual baik | Banding dua anggaran, pilih julat, tentukan anggaran munasabah/tidak |
| D2.1.6 | 2 | H | Bundar puluh/ratus pada garis nombor | Missing midpoint, pilih sebab, analisis bundaran salah |
| D2.1.7 | 2 | H | Cari aturan / sambung pola | Missing internal term, backward reasoning, pilih pola yang ikut aturan |
| D2.1.8 | 3 | M | Cerita tambah/tolak/beza; konteks berubah mengikut operasi | Tambah unknown position dan distractor berasaskan model situasi |
| D2.2.1 | 1 | C | Tambah 2 atau 3 nombor tetapi prosedur sama | Missing addend, estimate/check, cerita, model nilai tempat |
| D2.2.2 | 1 | C | Tolak satu/dua nilai berturutan; prosedur sama | Missing subtrahend, difference, cerita, inverse check |
| D2.2.3 | 3 | M | Fakta simbolik, equal groups, ×10 | Array/skip count, missing factor, pilih equation daripada model |
| D2.2.4 | 3 | M | Exact, remainder, bahagi 10; pilihan diagnostik sesuai | Sharing vs grouping, missing divisor/dividend |
| D2.2.5 | 4 | L | Cerita tambah/tolak/darab/bahagi | Tambah unknown position; elak kata kunci terlalu terus |
| D2.3.1 | 3 | M | Visual/name/compare penyebut sama | Non-example bahagian tak sama, order pecahan |
| D2.3.2 | 4 | L | Bar, fraction→decimal, garis nombor, compare | Kekalkan dan rotation |
| D2.3.3 | 2 | H | Kesetaraan fraction-decimal, perbandingan silang representasi | Matching multiple reps, missing representation, error analysis |
| D2.3.4 | 3 | M | Kad, botol, reben tetapi setiap konteks juga menukar tugas | Tambah masalah inverse/missing amount |
| D2.4.1 | 3 | M | Kenal nilai, jumlah visual, compare visual; konteks bagus | Bina jumlah dengan kombinasi berbeza, “cara lain sama nilai” |
| D2.4.2 | 1 | C | Tambah 2/3 nilai wang secara simbolik | Visual receipt, missing price, total/budget comparison, cerita |
| D2.4.3 | 1 | C | Tolak 1/2 nilai secara simbolik | Baki visual, missing spend, compare change, story |
| D2.4.4 | 2 | H | Darab simbolik / harga barang; thinking sama tetapi konteks membantu | Table/unit price, missing quantity, pilih pembelian setara |
| D2.4.5 | 2 | H | Bahagi simbolik / kongsi wang; thinking sama | Grouping vs sharing, missing people/total, visual notes/coins |
| D2.4.6 | 2 | H | Dua ayat simpanan yang sama struktur | Tentukan belanja atau simpanan hilang, compare plans, error analysis |
| D2.4.7 | 5 | L | Baki, jumlah barang, cukup/tidak, jumlah cerita, simpanan | Rotation dan tambah `archetypeId`; sudah bank terbaik topik ini |
| D2.5.1 | 1 | C | Baca jam analog sahaja | Digital→analog choice, before/after, ayat waktu, AM/PM jika KSSR sesuai |
| D2.5.2 | 3 | M | jam-minit, hari-jam, minggu-hari; masing-masing direct conversion | Reverse conversion, missing unit/value, situasi kalendar |
| D2.5.3 | 2 | H | Cari masa tamat / tempoh pada timeline | Cari masa mula, compare duration, multi-event |
| D2.6.1 | 3 | M | Baca pembaris, pilih unit, compare panjang | Non-zero ruler start, missing length, add/sub context |
| D2.6.2 | 3 | M | Baca penimbang, unit, compare jisim | Difference/total dan balancing scale |
| D2.6.3 | 3 | M | Baca silinder, unit, compare isipadu | Pour/add/remove, difference, capacity estimate |
| D2.6.4 | 6 | L | 3 domain × tambah/tolak; konteks aplikasi baik | Pastikan rotation domain+operation, tambah unknown position |
| D2.7.1 | 4 | L | Visual, clue, net (mastery>50), objek harian | Kekalkan; pastikan net tidak terkunci terlalu lama |
| D2.7.2 | 3 | M | Visual/property/compare dengan variasi stem | Tambah classify/non-example/compose shape |
| D2.7.3 | 4 | L | 10 konteks tetapi kira-kira 4 tindakan kategori/ciri | Tambah reasoning “mengapa”, elak prefix kosmetik dikira archetype |
| D2.8.1 | 2 | H | Baca gundalan / bina gundalan daripada raw list | Lengkap jadual, semak gundalan salah, compare kategori |
| D2.8.2 | 3 | M | Read/most/least carta | Missing bar, true/false statement, compare difference |
| D2.8.3 | 3 | M | Difference/sum/two-step max-min | Soalan keputusan/interpretation, missing value |

### Darjah 3 — 13 kemahiran

| Skill | Archetype sebenar | Risiko | Kelemahan utama / pembaikan |
|---|---:|:---:|---|
| D3.N10000 | 1 | C | Compare dua nombor sahaja; tambah model, order, number line, rounding/sequence mengikut standard |
| D3.PV10000 | 1 | C | Nilai digit sahaja; tambah place name, expand, compose, missing part |
| D3.ADD10000 | 1 | C | Simbolik direct; tambah story, missing addend, estimate/check, regroup models |
| D3.SUB10000 | 1 | C | Simbolik direct; tambah difference/story/inverse/missing value |
| D3.MUL | 2 | H | Symbol/equal groups; tambah array, scaling, missing factor, multi-step |
| D3.DIV | 2 | H | Symbol/sharing context; tambah grouping, remainder (jika standard), missing component, inverse |
| D3.FRAC | 1 | C | Equivalent fraction dengan bar yang sebenarnya memaparkan pecahan asal sahaja; tambah pilih visual setara, missing factor, compare, number line |
| D3.DEC | 1 | C | Tambah perpuluhan satu tempat sahaja; tambah model, place value, subtract/compare/money context |
| D3.MONEY | 1 | C | Baki daripada RM bulat sahaja; tambah sen, total, enough, missing price, receipts |
| D3.TIME | 1 | C | Cari masa tamat sahaja; tambah start/duration, timeline/clock, calendar |
| D3.MEASURE | 1 | C | `cm → m` sahaja; tambah reverse, mixed units, compare, missing value, story operations |
| D3.SHAPE | 1 | C | Perimeter segi empat tepat sahaja; tambah unknown side, composite/simple visual, distinguish area/perimeter, shape properties |
| D3.DATA | 1 | C | Jumlah tiga palang sahaja; tambah read/compare/difference/most/least/missing bar/interpretation |

`questions/d3/stretch.js` juga hampir semuanya satu archetype dan hanya menambah label “D3 Probe”; jangan gunakan fail itu sebagai jalan keluar variasi tanpa pembaikan.

### Darjah 4 — 13 kemahiran

Semua kemahiran D4 hanya mempunyai satu archetype.

| Skill | Archetype | Risiko | Pembaikan minimum |
|---|---:|:---:|---|
| D4.N100000 | 1 | C | Compare, order, number line, round, pattern/compose |
| D4.PV100000 | 1 | C | Place name, digit value, expand/compose, missing part |
| D4.ADD | 1 | C | Direct, story, missing value, estimate/check, multi-addend |
| D4.SUB | 1 | C | Direct, difference, story, inverse, missing value |
| D4.MUL | 1 | C | Direct, area/array, scaling/story, missing factor, estimation |
| D4.DIV | 1 | C | Direct exact division sahaja; sharing/grouping, missing component, word problem, remainder jika KSSR sesuai |
| D4.FRAC | 1 | C | Same-denominator addition sahaja; visual model, missing numerator, compare, story, error analysis |
| D4.DEC | 1 | C | Decimal addition sahaja; place/compare/subtract/money/model |
| D4.MONEY | 1 | C | Unit price × quantity sahaja; total/change/budget/missing price/multi-buy |
| D4.TIME | 1 | C | Arrival time sahaja; start/duration/timetable/compare elapsed |
| D4.MEASURE | 1 | C | `m cm → cm` sahaja; reverse, missing unit, compare, operations, contexts |
| D4.PERIM | 1 | C | Rectangle perimeter sahaja; missing side, irregular/composite, error analysis, area contrast |
| D4.DATA | 1 | C | Highest bar sahaja; read/difference/total/interpret/missing value |

### Darjah 5 — 13 kemahiran

| Skill | Archetype sebenar | Risiko | Kelemahan utama / pembaikan |
|---|---:|:---:|---|
| D5.N1000000 | 1 | C | Compare sahaja; order, round, number line, compose/pattern |
| D5.PV1000000 | 1 | C | Digit value sahaja; place/expand/compose/missing/error |
| D5.MUL | 1 | C | Direct 2-digit × 2-digit; context, estimate, missing factor, area model |
| D5.DIV | 1 | C | Exact division sahaja; sharing/grouping, remainder interpretation, missing component, story |
| D5.FRAC | 1 | C | Same-denominator add+reduce sahaja; unlike denominator if mapped, model, compare, missing/error |
| D5.DEC | 4 | L | fraction→decimal, place value, add, subtract; variasi sebenar baik | Tambah model/context dan rotation |
| D5.PERCENT | 3 | M | Visual/fraction/decimal→percent | Tambah percent of quantity, missing whole, real context |
| D5.MONEY | 1 | C | Discount sahaja | Multi-item, budget/change, compare deal, missing original price, profit/loss only if KSSR |
| D5.TIME | 1 | C | End time sahaja | Start/duration, timetable, multi-day/calendar, compare journeys |
| D5.MEASURE | 1 | C | `L mL → mL` sahaja | Reverse, missing, compare, add/sub/pour contexts |
| D5.AREA | 1 | C | Rectangle area sahaja | Missing dimension, composite, perimeter contrast, real floor/field |
| D5.COORD | 1 | C | Read marked coordinate sahaja; label rawak tidak muncul pada grid | Plot/move/reflect/relative position/distance per KSSR scope; render actual label |
| D5.DATA | 1 | C | “purata terdekat” bagi 3 bars; `Math.round` may hide exact-mean concept | Exact mean with divisible totals, missing value, compare/interpret, table/graph variety |

### Darjah 6 — 12 kemahiran

| Skill | Archetype sebenar | Risiko | Kelemahan utama / pembaikan |
|---|---:|:---:|---|
| D6.NUMBERS | 1 | C | Sambung arithmetic sequence sahaja; tambah missing internal term, rule, reverse, large-number reasoning |
| D6.OPS | 1 | C | `a + b × c` sahaja; order varied, brackets, missing operator/value, context/multi-step |
| D6.FRAC | 1 | C | Mixed→improper sahaja; tambah reverse, operations, compare, model, application |
| D6.DEC | 2 | H | Add/subtract direct sahaja | Multiply/divide if mapped, missing value, estimate, context/error |
| D6.PERCENT | 1 | C | Percent of quantity sahaja | Find percent, find whole, increase/decrease, discount/data context |
| D6.RATIO | 1 | C | Generate equivalent ratio sahaja | Simplify, missing term, sharing, compare rates, real mixture/context |
| D6.MONEY | 1 | C | Budget−spend−locked saving sahaja; wording now clearer but tetap formula tunggal | Budget planning, compare plans, missing component, multi-item, justify decision |
| D6.TIME | 1 | C | Find time from distance/speed sahaja | Find speed/distance, timetable, unit conversion, multi-leg journeys |
| D6.MEASURE | 1 | C | `kg g → g` sahaja | Reverse, missing value, compare, add/sub, recipe/parcel, error analysis |
| D6.AREA | 1 | C | Sebenarnya volume cuboid sahaja walaupun ID `AREA`; tambah missing dimension, composite volume, capacity/context; semak taxonomy |
| D6.COORD | 1 | C | Grid diberi koordinat lalu tanya `x+y`; ini menguji tambah lebih daripada koordinat | Read/plot/move/transform/relative position; jangan beritahu coordinate dalam stem |
| D6.DATA | 1 | C | Estimate percentage of fixed Blue bar; `Math.round` makes options potentially weak | Exact ratios, compare, missing category, conclusions, misleading claims/data interpretation |

## Isu merentas bank selain kebosanan

### 1. Distractor diagnostik tidak konsisten

D2 lazimnya menggunakan tag seperti `place`, `division`, `operation`, `unit`, `fraction` yang berguna kepada misconception engine. Banyak D3–D6 hanya menggunakan `ans±constant`, nilai operand, atau pilihan jauh. Ini mudah disingkirkan dan tidak selalu membezakan salah konsep daripada salah kira.

Setiap archetype perlu menentukan tiga misconception sasaran, contohnya untuk `mixed kg/g → g`: `ignore_major_unit`, `wrong_factor_100`, `add_digits`. Tag sedia ada jangan dibuang; tambah tag lebih khusus dengan pemetaan kepada kategori lama.

### 2. Perubahan konteks kadang-kadang kosmetik

Menukar “Aina” kepada “Hakim”, buah kepada buku, atau prefix “Cabaran bentuk” tidak mengubah kognitif. Audit automatik baharu mesti menilai `archetypeId`, bukan teks.

### 3. Cognitive demand D4–D6 terlalu rata

Hampir semua soalan D4–D6 ialah satu langkah dan jawapan tunggal. `s.mastery`, `shift`, evidence dan confidence dihantar kepada bank tetapi kebanyakan generator tidak menggunakannya. Jadi adaptive engine memilih kemahiran dengan bijak tetapi tidak boleh memilih tahap pemikiran dalam kemahiran itu.

### 4. Visual tidak meningkat bersama tahap

D2 mempunyai pembaris, penimbang, silinder, garis nombor, jam, wang, bentuk/net dan carta. D3–D6 kembali kepada teks/formula walaupun domain seperti ukuran, pecahan, data dan koordinat memerlukan representasi. Ini melemahkan diagnosis: murid mungkin boleh buat algoritma tetapi tidak memahami model.

### 5. Beberapa isu kandungan khusus

- D5.COORD menanyakan label P/Q/R/S tetapi grid hanya menunjukkan `●`, bukan label tersebut.
- D6.COORD menyatakan coordinate dalam soalan, lalu visual grid hampir tidak diperlukan.
- D6.AREA sebenarnya menilai isipadu kuboid; ID/tajuk dan standard perlu disemak.
- D5.DATA membundarkan purata tanpa menyatakan jelas mengapa “terdekat” diperlukan; lebih baik jana jumlah yang boleh dibahagi tepat dahulu.
- D3.FRAC memaparkan model pecahan asal, tetapi tugas equivalent fraction masih diselesaikan secara prosedur; model belum menunjukkan kesetaraan.
- Soalan D1.MEASURE sentiasa sama tepat, menjadikannya paling mudah berulang secara literal.

## Reka bentuk metadata dan rotation yang dicadangkan

### Metadata tambahan pada objek `Q`

Kekalkan semua field semasa supaya adaptive/mastery/misconception logic tidak rosak. Tambah field optional:

```js
{
  skillId: "D6.MEASURE",
  archetypeId: "mixed_to_minor",
  representation: "symbolic", // visual, symbolic, story, table, error-analysis
  demand: "procedure",        // recall, concept, procedure, application, reasoning
  contextId: "parcel",
  difficultyBand: 2,           // 1 foundation, 2 core, 3 application, 4 reasoning
  misconceptionTargets: ["unit_factor_100", "ignore_major_unit", "add_components"],
  familyKey: "mass_conversion"
}
```

`diagnostic`, `formatShift`, `kind`, `wrong[].tag` dan semua scoring sedia ada dikekalkan. Untuk migrasi, `formatShift` boleh terus diset daripada perbezaan `representation`/`archetypeId`; jangan jadikannya sumber kebenaran utama.

### Pemilih archetype

1. Bank mendaftarkan katalog archetype bagi setiap skill dengan `minBand`, `maxBand`, representation dan weight.
2. Engine menentukan `difficultyBand` daripada mastery + confidence + evidence, tetapi:
   - murid baru bermula pada concept/foundation;
   - mastery tinggi membuka application/reasoning;
   - selepas salah berulang, Cikgu Wajar boleh turun band atau bertukar representation tanpa meninggalkan skill;
   - recovery prerequisite kekal mengikut engine sekarang.
3. Tolak keras archetype yang sama dalam 3 soalan terakhir bagi skill tersebut jika sekurang-kurangnya 3 archetype eligible.
4. Tolak `representation` sama lebih daripada dua kali berturut-turut.
5. Jangan ulang `contextId` dalam 4 soalan terakhir kecuali pool kecil.
6. Dalam sesi fokus 5 soalan, sasaran urutan: concept/model → procedure → application → contrast/error → transfer. Untuk 10/15, ulang cycle dengan nombor/context berbeza dan naik/turun band berdasarkan respons.
7. Jika hanya satu archetype tersedia (semasa migrasi), fallback generator masih berfungsi; sistem log `varietyDebt` tetapi tidak crash.

Cadangan state sesi:

```js
sess.questionHistory = [{
  skillId, archetypeId, representation, contextId, difficultyBand, fingerprint
}];
```

Kekalkan `sess.questionFingerprints` untuk exact duplicate. Tambah history berstruktur; jangan gantikannya sehingga regression lengkap.

### Audit automatik baharu

Audit wajib gagal jika:

- skill produksi mempunyai kurang daripada 3 `archetypeId` (warning semasa migrasi, error selepas pembaikan);
- mana-mana archetype mengambil >50% daripada 1,000 sampel apabila 3+ eligible;
- misi simulasi 14 soalan mengulang archetype berturut-turut;
- sesi 10 soalan tidak meliputi sekurang-kurangnya 3 representation atau 3 demand levels apabila katalog membenarkan;
- `wrong[].tag` semuanya generic/generated;
- archetype application/reasoning tiada misconception targets;
- visual-required domain tiada visual sample;
- prompt memberitahu jawapan yang visual sepatutnya diuji (seperti coordinate);
- pilihan jawapan tidak unik atau nombor invalid (regression lama dikekalkan).

## Pelan pembaikan berkeutamaan

### P0 — hentikan kebosanan paling jelas

1. Tambah metadata + rotation engine dahulu; tanpa ini archetype baharu masih boleh dipilih rawak berturut-turut.
2. Bina semula semua ukuran D3–D6 kepada sekurang-kurangnya 6 archetype: direct, reverse, missing value, compare, operation/story, error analysis/model.
3. Baiki D1.MEASURE exact repetition.
4. Baiki D5.COORD, D6.COORD, D6.AREA taxonomy, D5.DATA exact mean.

### P1 — bank satu-archetype frekuensi tinggi

Operasi D3–D6, masa D3–D5, wang D3–D6, pecahan D3–D6, area/perimeter/volume D3–D6, dan data D3–D6. Sasaran minimum setiap skill: 5 archetype, termasuk sekurang-kurangnya satu visual/model, satu application dan satu reasoning/error-analysis bagi D4–D6.

### P2 — asas D1 dan hutang variasi D2

Naikkan D1 kepada 3–5 archetype mesra umur dengan visual konkrit. Baiki D2 skills C/H (`D2.1.3`, `1.5`, `2.1`, `2.2`, wang 4.2–4.6, masa) sambil mengekalkan bank D2 yang sudah baik.

### P3 — kalibrasi dan QA pedagogi

Simulasikan misi 5/10/14/15 soalan bagi setiap skill dan setiap mastery band. Ukur distribution archetype, representation, demand dan misconception targets. Kemudian guru KSSR menyemak wording, standard mapping dan kesesuaian cognitive load; regression teknikal sahaja tidak cukup.

## Acceptance criteria pembaikan penuh

- Tiada skill dengan hanya satu archetype.
- D1 minimum 3; D2 minimum 3; D3–D4 minimum 4; D5–D6 minimum 5 archetype, kecuali justifikasi kurikulum bertulis.
- Tiada archetype sama berturut-turut apabila alternatif layak tersedia.
- Dalam 14 soalan, sekurang-kurangnya 4 archetype bagi D3–D6 dan tiada satu archetype melebihi 40%.
- Soalan berubah dari concept → procedure → application/reasoning berdasarkan bukti murid, bukan sekadar nombor makin besar.
- Distractor memetakan kesilapan lazim dan terus serasi dengan misconception counters.
- Exact fingerprint anti-repeat, mastery, confidence, evidence, Cikgu Wajar, recovery/stretch dan Guardian Focus kekal berfungsi.

## Kesimpulan

Engine adaptive sedia ada mempunyai asas pemilihan skill dan bukti yang baik, tetapi sebahagian besar bank D3–D6 tidak memberi engine pilihan pedagogi yang mencukupi. “Super moat” bukan lebih banyak nombor rawak; ia ialah katalog cara fikir, representasi dan misconception yang boleh dipilih mengikut bukti murid. Pembaikan perlu dilakukan sebagai sistem metadata + rotation, kemudian kandungan diperkaya mengikut prioriti—bukan menambah ayat rawak satu demi satu.
