# Audit Wang D1–D6 — v3.85.95

Tarikh: 12 Oktober 2026. Skop: semua 12 kemahiran Wang yang aktif, generator sebenar, pilihan jawapan, visual D3, pemilihan aras dan kes tepi. Ini bukan audit semua topik Matematik atau pengesahan keseluruhan produk.

## Keputusan dan perkembangan aras

| Darjah | Fokus yang patut membezakan aras | Hasil audit/pembetulan |
|---|---|---|
| D1 | Kenal duit, nilai setara, gabungan syiling/nota, tambah/tolak kecil dan situasi harian | Laluan aktif dan pilihan setara RM/sen diperiksa; tiada pembetulan baharu diperlukan dalam release ini. |
| D2 | Operasi wang hingga RM100, bilangan barang/penerima, simpanan, masalah dan operasi songsang | Semua tujuh kemahiran diuji; sen masih muncul pada soalan lanjutan. |
| D3 | Operasi hingga RM10,000, operasi bergabung tambah/tolak, darab/bahagi, mata wang ASEAN serta keputusan keperluan/simpanan | RM8,630.89 sah dalam lingkungan darjah ini. Bezakan aras rendah/sederhana/tinggi dalam keluarga soalan berkaitan; baiki penghantaran difficultyBand production. Buang jumlah jawapan daripada kad harga/resit, label belanja tanpa simbol operasi yang membocorkan kaedah, baiki julat rawak dan elakkan fallback beza satu sen. |
| D4 | Operasi hingga RM100,000; operasi bergabung tambah/tolak dan darab/bahagi; bajet, rekod, keputusan kewangan, mata wang | Tambah darab/bahagi bergabung sebenar, rekod bajet, keputusan keperluan/kehendak dan pengenalan mata wang negara. Kod standard baharu diselaraskan. Kadar pertukaran latihan ialah andaian, bukan kadar semasa. |
| D5 | Operasi hingga RM1 juta dengan/tanpa kurungan; simpanan/pelaburan, faedah, dividen/bonus, kredit/hutang | Sebelum ini empat keluarga soalan tertumpu diskaun/bajet. Kini sembilan termasuk operasi berkurung, simpanan, perbandingan faedah mudah/kompaun, dividen dan kredit. Betulkan operand RM, distractor NaN, Bahasa Melayu dan perpuluhan faedah. |
| D6 | Kos/jualan/untung/rugi, diskaun/rebat/faedah/dividen/cukai, dokumen kewangan, aset/liabiliti dan perlindungan risiko | 56 keluarga bank Wang diperiksa secara langsung. Kes pulang modal kini hanya mempunyai satu jawapan sah; soalan pinjaman menyatakan faedah mudah atas pinjaman asal. |

## Bukti pengujian

- `node audit/money-integrity.cjs`: 9,000 soalan menggunakan susunan script dan dispatcher production; kesetaraan RM/sen, bajet, pilihan, wang negatif, input jawapan dan pengiraan bebas.
- `node audit/money-d3-release.cjs`: 2,700 sampel, pemeriksaan kebocoran jawapan dalam visual serta RNG pada hujung julat.
- `node audit/money-d3-production-dispatch.cjs`: 156 dispatch Wang dan 216 dispatch merentas kategori D3; aras 1/2/3 sampai kepada generator tanpa mutasi template.
- `node audit/money-d45-release.cjs`: 3,600 sampel dan 1,091 semakan bebas. Tambahan 500 dispatch beginner mengesahkan pengenalan mata wang boleh dipilih (120 kemunculan).
- `node audit/money-d6-release.cjs`: 7,500 sampel bank D6, 2,424 pengiraan bebas, semua 56 keluarga dicapai dan enam kes pulang modal. Bank terakhir dimuat semula untuk meliputi setiap cabang authored; ujian 9,000 di atas menguji pemilihan akhir production secara berasingan.
- `node audit/grade-depth-validation.cjs`: 7,488 sampel umum D1–D6 lulus.
- `node questions/v2/validation/phase3a2-semantic-hardening-qa.js`: 187,000 sampel lulus.
- Runtime D3 dibina semula; `node questions/v2/build/build.js --check` lulus. Astra menyemak semula pembetulan dan tidak menemui blocker release yang masih terbuka.

## Batas penting

Lulus ujian generator tidak bermaksud semua standard KSSR telah diliputi sepenuhnya. D1–D3 mempunyai beza dokumen DSKP asal dengan Penjajaran Edisi 3; jangan menukar kod kurikulum secara menyeluruh hanya berdasarkan jadual ringkas ini. Soalan D5 faedah membandingkan nilai yang diberi, bukan membuktikan kefahaman pengumpulan faedah. Instrumen pembayaran, penerangan rekod, keluasan situasi simpanan/pelaburan dan liputan setiap standard masih memerlukan audit liputan kandungan tersendiri sebelum mendakwa “KSSR lengkap”. Tiada pengesahan manual visual telefon/tablet dibuat dalam audit ini.

## Rujukan kurikulum

- [KPM: pelaksanaan Penjajaran Edisi 3 Tahap I](https://www.moe.gov.my/storage/files/shares/surat-siaran/bahagian-pembangunan-kurikulum/Surat%20Siaran%20KPM%20Bil.%206%202024%20Pelaksanaan%20Dokumen%20Penjajaran%20Kurikulum%20Standard%20Sekolah%20Rendah%20%28Semakan%202017%29%20Edisi%203%20Sains%20Dan%20Math%20Tahap%20I.pdf).
- [Dokumen Penjajaran Matematik Tahap I Edisi 3](https://ecentral.my/wp-content/uploads/2024/09/DOKUMEN-PENJAJARAN_KSSR-MATEMATIK-TAHAP-1-EDISI-3-compressed.pdf): rujukan perbezaan D1–D3.
- [DSKP Tahun 1](https://fliphtml5.com/wgvyt/lhsv/DSKP_Mathematics_Tahun_1_%28DLP%29/), [Tahun 2](https://c.zoom-a.com/cache/dbp/refpub/1668665030212/DSKP-Th2-MM.pdf), [Tahun 3](https://fliphtml5.com/wgvyt/xffu/DSKP_Mathematics_Tahun_3_%28DLP%29/).
- [DSKP Tahun 4](https://fliphtml5.com/wdzjo/ontb/DSKP_MATEMATIK_TAHUN_4/), [Tahun 5](https://fliphtml5.com/bjmui/mpbq/DSKP_KSSR_%28Semakan_2017%29_Matematik_Tahun_5_SK/), [Tahun 6](https://asiemodel.net/wp-content/uploads/2022/08/3.-DSKP-MATEMATIK-TAHUN-6_isbn.pdf).
