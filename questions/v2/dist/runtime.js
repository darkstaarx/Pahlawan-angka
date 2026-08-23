// questions/v2/dist/runtime.js
// GENERATED FILE — do not hand-edit.
// Regenerate with: node questions/v2/build/build.js
//
// Question System v2 browser runtime (Phase 1.1). Dormant: nothing in
// index.html references this file yet. It exposes a single stable
// namespace, window.PAQuestionSystemV2, with read-only curriculum/template
// data and the (currently empty) generator/renderer registries.
//
// Deterministic build: this file's content is a pure function of
// questions/v2/curriculum/**, questions/v2/banks/**, questions/v2/generators/**,
// and questions/v2/renderers/** at build time. sourceHash below is a
// sha256 over exactly those inputs — re-running the build against an
// unchanged source tree reproduces this file byte-for-byte.

(function (global) {
  'use strict';

  var CURRICULUM = [
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.1",
    "standardId": "1.1.1",
    "competencyId": "nama_nombor_angka_perkataan_nilai_tempat_digit",
    "titleMs": "Nama nombor; angka/perkataan; nilai tempat/digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000",
      "D3.PV10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.1",
    "standardId": "1.1.2",
    "competencyId": "banding_nilai_hingga_tiga_nombor",
    "titleMs": "Banding nilai hingga tiga nombor",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.2",
    "standardId": "1.2.1",
    "competencyId": "anggaran_kuantiti_munasabah_berasaskan_rujukan",
    "titleMs": "Anggaran kuantiti munasabah berasaskan rujukan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.3",
    "standardId": "1.3.1",
    "competencyId": "bundar_hingga_ribu_terdekat",
    "titleMs": "Bundar hingga ribu terdekat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.4",
    "standardId": "1.4.1",
    "competencyId": "pola_naik_turun_1_10_100_1000",
    "titleMs": "Pola naik/turun 1, 10, 100, 1000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.4",
    "standardId": "1.4.2",
    "competencyId": "lengkap_pelbagai_pola_nombor_mudah",
    "titleMs": "Lengkap pelbagai pola nombor mudah",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.1",
    "standardId": "2.1.1",
    "competencyId": "masalah_tambah_tolak_hingga_tiga_nombor_jumlah_1",
    "titleMs": "Masalah tambah/tolak hingga tiga nombor; jumlah <=10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Operasi Asas",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.ADD10000",
      "D3.SUB10000"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.1",
    "standardId": "2.1.2",
    "competencyId": "masalah_operasi_bergabung_tambah_tolak_10000",
    "titleMs": "Masalah operasi bergabung tambah-tolak <=10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Operasi Asas",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.ADD10000",
      "D3.SUB10000"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.2",
    "standardId": "2.2.1",
    "competencyId": "darab_bahagi_hingga_4_digit_dengan_1_digit_10_10",
    "titleMs": "Darab/bahagi hingga 4 digit dengan 1 digit, 10, 100, 1000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Operasi Asas",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MUL",
      "D3.DIV"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.1",
    "competencyId": "pecahan_setara_penyebut_10",
    "titleMs": "Pecahan setara; penyebut <=10",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.2",
    "competencyId": "pecahan_wajar_kepada_bentuk_termudah",
    "titleMs": "Pecahan wajar kepada bentuk termudah",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.3",
    "competencyId": "tambah_dan_tolak_dua_pecahan_wajar",
    "titleMs": "Tambah dan tolak dua pecahan wajar",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.4",
    "competencyId": "kenal_pecahan_tak_wajar_dan_nombor_bercampur",
    "titleMs": "Kenal pecahan tak wajar dan nombor bercampur",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.5",
    "competencyId": "pecahan_perseratus_kepada_perpuluhan",
    "titleMs": "Pecahan perseratus kepada perpuluhan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC",
      "D3.DEC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.2",
    "standardId": "3.2.1",
    "competencyId": "banding_dua_perpuluhan_hingga_dua_tempat",
    "titleMs": "Banding dua perpuluhan hingga dua tempat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DEC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.2",
    "standardId": "3.2.2",
    "competencyId": "tambah_tolak_dua_perpuluhan_hingga_dua_tempat_ha",
    "titleMs": "Tambah/tolak dua perpuluhan hingga dua tempat; hasil tambah <=0.99",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DEC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.3",
    "standardId": "3.3.1",
    "competencyId": "peratus_dalam_petak_seratus_dan_sebaliknya",
    "titleMs": "Peratus dalam petak seratus dan sebaliknya",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.PERCENT"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.3",
    "standardId": "3.3.2",
    "competencyId": "sebut_tulis_1_hingga_100",
    "titleMs": "Sebut/tulis 1% hingga 100%",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.PERCENT"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.4",
    "standardId": "3.4.1",
    "competencyId": "hubung_pecahan_perpuluhan_dan_peratus",
    "titleMs": "Hubung pecahan, perpuluhan dan peratus",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC",
      "D3.DEC",
      "D3.PERCENT"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.1",
    "standardId": "4.1.1",
    "competencyId": "tambah_tolak_hingga_tiga_nilai_wang_rm10000",
    "titleMs": "Tambah/tolak hingga tiga nilai wang <=RM10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.1",
    "standardId": "4.1.2",
    "competencyId": "operasi_bergabung_tambah_tolak_wang_rm10000",
    "titleMs": "Operasi bergabung tambah-tolak wang <=RM10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.2",
    "standardId": "4.2.1",
    "competencyId": "darab_bahagi_wang_dengan_1_digit_10_100_1000",
    "titleMs": "Darab/bahagi wang dengan 1 digit, 10, 100, 1000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.3",
    "standardId": "4.3.1",
    "competencyId": "kenal_mata_wang_negara_asean",
    "titleMs": "Kenal mata wang negara ASEAN",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.4",
    "standardId": "4.4.1",
    "competencyId": "keperluan_dan_kehendak_sebagai_asas_simpanan_per",
    "titleMs": "Keperluan dan kehendak sebagai asas simpanan/perbelanjaan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.1",
    "standardId": "5.1.1",
    "competencyId": "baca_dan_rekod_waktu_aktiviti",
    "titleMs": "Baca dan rekod waktu aktiviti",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.1",
    "standardId": "5.1.2",
    "competencyId": "tukar_jam_minit_dan_minit_saat",
    "titleMs": "Tukar jam-minit dan minit-saat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.2",
    "standardId": "5.2.1",
    "competencyId": "tambah_tolak_hingga_tiga_nilai_masa",
    "titleMs": "Tambah/tolak hingga tiga nilai masa",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.2",
    "standardId": "5.2.2",
    "competencyId": "operasi_bergabung_tambah_tolak_masa",
    "titleMs": "Operasi bergabung tambah-tolak masa",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.3",
    "standardId": "5.3.1",
    "competencyId": "darab_bahagi_masa_dengan_satu_digit",
    "titleMs": "Darab/bahagi masa dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.1",
    "competencyId": "tukar_meter_sentimeter",
    "titleMs": "Tukar meter-sentimeter",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.2",
    "competencyId": "tambah_tolak_hingga_tiga_ukuran_panjang",
    "titleMs": "Tambah/tolak hingga tiga ukuran panjang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.3",
    "competencyId": "darab_bahagi_panjang_dengan_satu_digit",
    "titleMs": "Darab/bahagi panjang dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.1",
    "competencyId": "tukar_kilogram_gram",
    "titleMs": "Tukar kilogram-gram",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.2",
    "competencyId": "tambah_tolak_hingga_tiga_ukuran_jisim",
    "titleMs": "Tambah/tolak hingga tiga ukuran jisim",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.3",
    "competencyId": "darab_bahagi_jisim_dengan_satu_digit",
    "titleMs": "Darab/bahagi jisim dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.1",
    "competencyId": "tukar_liter_mililiter",
    "titleMs": "Tukar liter-mililiter",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.2",
    "competencyId": "tambah_tolak_hingga_tiga_isi_padu_cecair",
    "titleMs": "Tambah/tolak hingga tiga isi padu cecair",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.3",
    "competencyId": "darab_bahagi_isi_padu_cecair_dengan_satu_digit",
    "titleMs": "Darab/bahagi isi padu cecair dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.1",
    "standardId": "7.1.1",
    "competencyId": "identify_prism",
    "titleMs": "Kenal prisma segi empat sama, segi empat tepat, segi tiga",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.1",
    "standardId": "7.1.2",
    "competencyId": "describe_prism_features",
    "titleMs": "Ciri prisma: permukaan, tapak, bucu, tepi",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.1",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "titleMs": "Banding prisma dan bukan prisma",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.2",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "titleMs": "Kenal pentagon, heksagon, heptagon, oktagon sekata",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.2",
    "standardId": "7.2.2",
    "competencyId": "create_regular_polygon_pattern",
    "titleMs": "Hasilkan corak berasaskan poligon sekata",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "contentStandard": "7.3",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "titleMs": "Kenal dan lukis paksi simetri",
    "prerequisites": [],
    "status": "enabled",
    "topicTitleMs": "Ruang",
    "topicPriority": "P0-CRITICAL",
    "legacySkills": [
      "D3.SHAPE"
    ],
    "sourceStandardPriority": "P0-CRITICAL",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Reviewed and locked for the Phase 2 D3 Topic 7 pilot. Do not change without re-review."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "contentStandard": "8.1",
    "standardId": "8.1.1",
    "competencyId": "kedudukan_objek_relatif_kepada_titik_rujukan",
    "titleMs": "Kedudukan objek relatif kepada titik rujukan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "contentStandard": "8.1",
    "standardId": "8.1.2",
    "competencyId": "kenal_objek_melalui_paksi_mengufuk_mencancang",
    "titleMs": "Kenal objek melalui paksi mengufuk/mencancang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "contentStandard": "8.1",
    "standardId": "8.1.3",
    "competencyId": "tentukan_kedudukan_pada_paksi_mengufuk_mencancan",
    "titleMs": "Tentukan kedudukan pada paksi mengufuk/mencancang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.1",
    "standardId": "9.1.1",
    "competencyId": "kumpul_kelas_dan_susun_data_situasi_harian",
    "titleMs": "Kumpul, kelas dan susun data situasi harian",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.2",
    "standardId": "9.2.1",
    "competencyId": "baca_dan_dapatkan_maklumat_carta_pai",
    "titleMs": "Baca dan dapatkan maklumat carta pai",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.2",
    "standardId": "9.2.2",
    "competencyId": "hubung_piktograf_carta_palang_dan_carta_pai",
    "titleMs": "Hubung piktograf, carta palang dan carta pai",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "provisional",
    "competencyIdReviewNote": "Auto-generated from titleMs by slugification. Not yet human-reviewed. Must not be treated as canonical."
  }
];
  var TEMPLATES = [
  {
    "templateId": "D3-T7-711-identify-prism-discriminate-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.1",
    "competencyId": "identify_prism",
    "archetypeId": "discriminate_solids",
    "familyKey": "D3.T7.7.1.1.identify_prism.discriminate",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "prism_type_confusion",
      "prism_vs_non_prism"
    ],
    "generator": "geometry.identifyPrism",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "discriminate"
    }
  },
  {
    "templateId": "D3-T7-711-identify-prism-picture-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.1",
    "competencyId": "identify_prism",
    "archetypeId": "identify_from_picture",
    "familyKey": "D3.T7.7.1.1.identify_prism.picture",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "prism_type_confusion",
      "prism_vs_non_prism"
    ],
    "generator": "geometry.identifyPrism",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "identify_picture"
    }
  },
  {
    "templateId": "D3-T7-711-identify-prism-properties-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.1",
    "competencyId": "identify_prism",
    "archetypeId": "identify_from_properties",
    "familyKey": "D3.T7.7.1.1.identify_prism.properties",
    "representation": "text",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "prism_type_confusion",
      "prism_vs_non_prism"
    ],
    "generator": "geometry.identifyPrism",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "identify_properties"
    }
  },
  {
    "templateId": "D3-T7-712-prism-features-count-faces-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.2",
    "competencyId": "describe_prism_features",
    "archetypeId": "count_faces",
    "familyKey": "D3.T7.7.1.2.describe_prism_features.count_faces",
    "representation": "visual",
    "demand": "procedure",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "face_count_confusion"
    ],
    "generator": "geometry.prismFeatures",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "count_faces"
    }
  },
  {
    "templateId": "D3-T7-712-prism-features-identify-base-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.2",
    "competencyId": "describe_prism_features",
    "archetypeId": "identify_base",
    "familyKey": "D3.T7.7.1.2.describe_prism_features.identify_base",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "base_shape_confusion",
      "not_a_prism_base"
    ],
    "generator": "geometry.prismFeatures",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "identify_base"
    }
  },
  {
    "templateId": "D3-T7-712-prism-features-reason-edges-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.2",
    "competencyId": "describe_prism_features",
    "archetypeId": "reason_vertices_edges",
    "familyKey": "D3.T7.7.1.2.describe_prism_features.reason_edges",
    "representation": "text",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "vertex_edge_confusion"
    ],
    "generator": "geometry.prismFeatures",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "reason_features"
    }
  },
  {
    "templateId": "D3-T7-713-classify-prism-compare-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "archetypeId": "compare_prism_non_prism",
    "familyKey": "D3.T7.7.1.3.classify_prism_vs_non_prism.compare",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "prism_vs_non_prism"
    ],
    "generator": "geometry.classifyPrism",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "compare"
    }
  },
  {
    "templateId": "D3-T7-713-classify-prism-properties-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "archetypeId": "classify_by_properties",
    "familyKey": "D3.T7.7.1.3.classify_prism_vs_non_prism.properties",
    "representation": "text",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "prism_vs_non_prism"
    ],
    "generator": "geometry.classifyPrism",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "classify_properties"
    }
  },
  {
    "templateId": "D3-T7-713-classify-prism-select-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "archetypeId": "select_prism_from_set",
    "familyKey": "D3.T7.7.1.3.classify_prism_vs_non_prism.select",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "prism_vs_non_prism"
    ],
    "generator": "geometry.classifyPrism",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "select_prism"
    }
  },
  {
    "templateId": "D3-T7-721-regular-polygon-gallery-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "archetypeId": "select_named_regular_polygon",
    "familyKey": "D3.T7.7.2.1.identify_regular_polygon.gallery",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "polygon_name_side_count_confusion"
    ],
    "generator": "geometry.identifyRegularPolygon",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "select_named"
    }
  },
  {
    "templateId": "D3-T7-721-regular-polygon-picture-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "archetypeId": "identify_polygon_from_picture",
    "familyKey": "D3.T7.7.2.1.identify_regular_polygon.picture",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "polygon_name_side_count_confusion"
    ],
    "generator": "geometry.identifyRegularPolygon",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "identify_picture"
    }
  },
  {
    "templateId": "D3-T7-721-regular-polygon-sides-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "archetypeId": "identify_polygon_from_sides",
    "familyKey": "D3.T7.7.2.1.identify_regular_polygon.sides",
    "representation": "text",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "polygon_name_side_count_confusion"
    ],
    "generator": "geometry.identifyRegularPolygon",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "identify_sides"
    }
  },
  {
    "templateId": "D3-T7-722-polygon-pattern-construct-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.2",
    "competencyId": "create_regular_polygon_pattern",
    "archetypeId": "construct_regular_polygon_pattern",
    "familyKey": "D3.T7.7.2.2.create_regular_polygon_pattern.construct",
    "representation": "visual",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "pattern_unit_confusion",
      "pattern_position_confusion"
    ],
    "generator": "geometry.regularPolygonPattern",
    "renderer": "geometry2d",
    "responseType": "interactive",
    "params": {
      "mode": "construct_pattern"
    }
  },
  {
    "templateId": "D3-T7-722-polygon-pattern-continue-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.2",
    "competencyId": "create_regular_polygon_pattern",
    "archetypeId": "continue_regular_polygon_pattern",
    "familyKey": "D3.T7.7.2.2.create_regular_polygon_pattern.continue",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "pattern_unit_confusion",
      "pattern_position_confusion"
    ],
    "generator": "geometry.regularPolygonPattern",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "continue_pattern"
    }
  },
  {
    "templateId": "D3-T7-722-polygon-pattern-unit-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.2",
    "competencyId": "create_regular_polygon_pattern",
    "archetypeId": "identify_smallest_repeating_unit",
    "familyKey": "D3.T7.7.2.2.create_regular_polygon_pattern.unit",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "pattern_unit_confusion"
    ],
    "generator": "geometry.regularPolygonPattern",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "identify_unit"
    }
  },
  {
    "templateId": "D3-T7-731-symmetry-count-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "archetypeId": "identify_symmetry_axis_count",
    "familyKey": "D3.T7.7.3.1.identify_and_draw_symmetry_axis.count",
    "representation": "visual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "symmetry_axis_count_confusion"
    ],
    "generator": "geometry.symmetryAxis",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "count_axes"
    }
  },
  {
    "templateId": "D3-T7-731-symmetry-draw-axis-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "archetypeId": "draw_valid_symmetry_axis",
    "familyKey": "D3.T7.7.3.1.identify_and_draw_symmetry_axis.draw",
    "representation": "visual",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "symmetry_axis_orientation_confusion"
    ],
    "generator": "geometry.symmetryAxis",
    "renderer": "geometry2d",
    "responseType": "interactive",
    "params": {
      "mode": "draw_axis"
    }
  },
  {
    "templateId": "D3-T7-731-symmetry-select-axis-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "archetypeId": "select_valid_symmetry_axis",
    "familyKey": "D3.T7.7.3.1.identify_and_draw_symmetry_axis.select",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "symmetry_axis_orientation_confusion"
    ],
    "generator": "geometry.symmetryAxis",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "select_axis"
    }
  }
];
  var BUILD_MANIFEST = {
  "curriculumCount": 50,
  "templateCount": 18,
  "generatorFiles": [
    "generators/geometry/polygon-symmetry.js",
    "generators/geometry/prism.js"
  ],
  "rendererFiles": [
    "renderers/geometry/polygon-symmetry.js",
    "renderers/geometry/prism.js"
  ]
};
  var SOURCE_HASH = "cbba75c4222d9a89590afee06105510476399278d230a2bf7669ed1f3b25537a";

  var generators = Object.create(null);
  var renderers = Object.create(null);

  function registerGenerator(key, fn) {
    if (typeof key !== 'string' || !key) throw new Error('registerGenerator: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error('registerGenerator: "' + key + '" must be a function');
    if (generators[key]) throw new Error('registerGenerator: "' + key + '" is already registered');
    generators[key] = fn;
  }

  function registerRenderer(key, fn) {
    if (typeof key !== 'string' || !key) throw new Error('registerRenderer: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error('registerRenderer: "' + key + '" must be a function');
    if (renderers[key]) throw new Error('registerRenderer: "' + key + '" is already registered');
    renderers[key] = fn;
  }

  // ---- generators/geometry/polygon-symmetry.js ----
  (function (registerGenerator) {
// questions/v2/generators/geometry/polygon-symmetry.js
// Phase 2A-2: D3 Topic 7.2 regular polygons + 7.3 symmetry-axis evidence.
// Pure authored source: no Node/browser globals. Correctness uses structured ids,
// side counts, pattern units and angle sets; Bahasa Melayu labels are display-only.
(function () {
  'use strict';

  var POLYGONS = {
    pentagon: { sides: 5, labelMs: 'Pentagon Sekata' },
    hexagon: { sides: 6, labelMs: 'Heksagon Sekata' },
    heptagon: { sides: 7, labelMs: 'Heptagon Sekata' },
    octagon: { sides: 8, labelMs: 'Oktagon Sekata' },
  };
  var POLYGON_IDS = ['pentagon', 'hexagon', 'heptagon', 'octagon'];

  // Angles are undirected line orientations in degrees modulo 180 and are tied
  // to the canonical renderer orientation for each shape.
  var SYMMETRY_SHAPES = {
    square: { labelMs: 'segi empat sama', shapeType: 'regular_polygon', sides: 4, axisAngles: [0, 45, 90, 135], distractorAngles: [22.5, 67.5, 112.5, 157.5] },
    rectangle: { labelMs: 'segi empat tepat', shapeType: 'rectangle', axisAngles: [0, 90], distractorAngles: [30, 45, 60, 120, 135, 150] },
    equilateral_triangle: { labelMs: 'segi tiga sama sisi', shapeType: 'regular_polygon', sides: 3, axisAngles: [30, 90, 150], distractorAngles: [0, 60, 120] },
    isosceles_triangle: { labelMs: 'segi tiga sama kaki', shapeType: 'isosceles_triangle', axisAngles: [90], distractorAngles: [0, 30, 60, 120, 150] },
    regular_pentagon: { labelMs: 'pentagon sekata', shapeType: 'regular_polygon', sides: 5, axisAngles: [18, 54, 90, 126, 162], distractorAngles: [0, 36, 72, 108, 144] },
    regular_hexagon: { labelMs: 'heksagon sekata', shapeType: 'regular_polygon', sides: 6, axisAngles: [0, 30, 60, 90, 120, 150], distractorAngles: [15, 45, 75, 105, 135, 165] },
  };
  var SYMMETRY_IDS = Object.keys(SYMMETRY_SHAPES);

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }
  function sampleUnique(rng, arr, n) { return shuffle(rng, arr).slice(0, n); }
  function makeChoice(id, labelMs, misconceptionTag) {
    return { id: String(id), labelMs: String(labelMs), misconceptionTag: misconceptionTag || null };
  }
  function fingerprint(archetype, answerId, details) {
    return archetype + '::' + String(answerId) + '::' + (details || []).join(',');
  }
  function polygonLabel(id) { return POLYGONS[id].labelMs; }
  function sequenceLabel(unit) { return unit.map(polygonLabel).join(' → '); }
  function repeatUnit(unit, length) {
    var out = [];
    for (var i = 0; i < length; i++) out.push(unit[i % unit.length]);
    return out;
  }
  function uniqueSequenceDistractors(correct, candidates, n) {
    var seen = Object.create(null); seen[correct.join('|')] = true;
    var out = [];
    for (var i = 0; i < candidates.length && out.length < n; i++) {
      var c = candidates[i], key = c.join('|');
      if (!seen[key]) { seen[key] = true; out.push(c); }
    }
    return out;
  }

  registerGenerator('geometry.identifyRegularPolygon', function (params, rng) {
    var mode = (params && params.mode) || 'identify_picture';
    var targetId = pick(rng, POLYGON_IDS);
    var target = POLYGONS[targetId];
    var otherIds = POLYGON_IDS.filter(function (id) { return id !== targetId; });

    if (mode === 'identify_picture') {
      var ans = makeChoice(targetId, target.labelMs);
      var dis = otherIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'polygon_name_side_count_confusion'); });
      return {
        value: {
          promptMs: 'Apakah nama poligon sekata di bawah?', answer: ans,
          visual: { kind: 'polygon_single', figures: [{ id: 'main', polygonId: targetId, sides: target.sides, regular: true }] },
        },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'identify_polygon_from_picture', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_picture', targetId, otherIds) }
      };
    }

    if (mode === 'identify_sides') {
      var ans2 = makeChoice(targetId, target.labelMs);
      var dis2 = otherIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'polygon_name_side_count_confusion'); });
      return {
        value: { promptMs: 'Sebuah poligon sekata mempunyai ' + target.sides + ' sisi yang sama panjang dan ' + target.sides + ' bucu. Apakah nama poligon itu?', answer: ans2, visual: null },
        distractors: shuffle(rng, dis2),
        meta: { archetype: 'identify_polygon_from_sides', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_sides', targetId, [String(target.sides)]) }
      };
    }

    if (mode === 'select_named') {
      var figures = shuffle(rng, POLYGON_IDS).map(function (id, i) {
        return { id: 'fig_' + i + '_' + id, polygonId: id, sides: POLYGONS[id].sides, regular: true };
      });
      var correct = figures.filter(function (f) { return f.polygonId === targetId; })[0];
      var wrong = figures.filter(function (f) { return f.polygonId !== targetId; });
      var ans3 = makeChoice(correct.id, target.labelMs);
      var dis3 = wrong.map(function (f) { return makeChoice(f.id, polygonLabel(f.polygonId), 'polygon_name_side_count_confusion'); });
      return {
        value: { promptMs: 'Yang manakah ' + target.labelMs + '?', answer: ans3, visual: { kind: 'polygon_gallery', figures: figures } },
        distractors: dis3,
        meta: { archetype: 'select_named_regular_polygon', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_gallery', targetId, figures.map(function (f) { return f.polygonId; })) }
      };
    }
    throw new Error('geometry.identifyRegularPolygon: unknown mode "' + mode + '"');
  });

  registerGenerator('geometry.regularPolygonPattern', function (params, rng) {
    var mode = (params && params.mode) || 'continue_pattern';
    var unitLength = rng() < 0.55 ? 2 : 3;
    var unit = sampleUnique(rng, POLYGON_IDS, unitLength);
    // Occasionally create AAB / ABB units to broaden structure while preserving
    // a unique smallest repeating unit of length 3.
    if (unitLength === 3 && rng() < 0.45) {
      var a = unit[0], b = unit[1];
      unit = rng() < 0.5 ? [a, a, b] : [a, b, b];
    }

    if (mode === 'continue_pattern') {
      var shownLength = unit.length * 2 + (unit.length === 2 ? 1 : 2);
      var full = repeatUnit(unit, shownLength + 1);
      var shown = full.slice(0, shownLength);
      var expected = full[shownLength];
      var wrongIds = POLYGON_IDS.filter(function (id) { return id !== expected; });
      var ans = makeChoice(expected, polygonLabel(expected));
      var dis = wrongIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'pattern_position_confusion'); });
      return {
        value: { promptMs: 'Teruskan corak poligon sekata ini. Bentuk apakah seterusnya?', answer: ans,
          visual: { kind: 'polygon_pattern', sequence: shown, showQuestionMark: true } },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'continue_regular_polygon_pattern', misconceptionTargets: ['pattern_unit_confusion', 'pattern_position_confusion'],
          semanticProperties: { unit: unit.slice(), shownSequence: shown.slice(), expectedNextId: expected },
          fingerprint: fingerprint('pattern_continue', expected, unit.concat(shown)) }
      };
    }

    if (mode === 'identify_unit') {
      var sequence = repeatUnit(unit, unit.length * 3);
      var candidates;
      if (unit.length === 2) {
        candidates = [unit.slice().reverse(), [unit[0], unit[0]], [unit[1], unit[1]], [unit[0], unit[1], unit[0]]];
      } else {
        candidates = [unit.slice().reverse(), [unit[1], unit[0], unit[2]], [unit[0], unit[2], unit[1]], [unit[0], unit[1]]];
      }
      var wrongUnits = uniqueSequenceDistractors(unit, candidates, 3);
      // Defensive fill in the unlikely event a constructed distractor equals the unit.
      var allPairs = [[POLYGON_IDS[0], POLYGON_IDS[1]], [POLYGON_IDS[1], POLYGON_IDS[2]], [POLYGON_IDS[2], POLYGON_IDS[3]], [POLYGON_IDS[3], POLYGON_IDS[0]]];
      wrongUnits = wrongUnits.concat(uniqueSequenceDistractors(unit, allPairs, 3)).slice(0, 3);
      var ans2 = makeChoice('unit:' + unit.join('-'), sequenceLabel(unit));
      var dis2 = wrongUnits.map(function (u, i) { return makeChoice('wrongunit:' + i + ':' + u.join('-'), sequenceLabel(u), 'pattern_unit_confusion'); });
      return {
        value: { promptMs: 'Apakah unit ulangan TERKECIL bagi corak ini?', answer: ans2,
          visual: { kind: 'polygon_pattern', sequence: sequence, showQuestionMark: false } },
        distractors: shuffle(rng, dis2),
        meta: { archetype: 'identify_smallest_repeating_unit', misconceptionTargets: ['pattern_unit_confusion'],
          semanticProperties: { unit: unit.slice(), shownSequence: sequence.slice() },
          fingerprint: fingerprint('pattern_unit', ans2.id, sequence) }
      };
    }

    if (mode === 'construct_pattern') {
      var slots = unit.length * 3;
      var expectedSequence = repeatUnit(unit, slots);
      var palette = shuffle(rng, POLYGON_IDS.slice());
      return {
        value: {
          promptMs: 'Bina corak dengan mengulang unit ini: ' + sequenceLabel(unit) + '. Lengkapkan semua petak.',
          answer: { id: 'sequence:' + expectedSequence.join('-'), labelMs: 'Corak lengkap' },
          visual: { kind: 'polygon_pattern_builder', unit: unit.slice(), slots: slots, palette: palette },
          interaction: { type: 'sequence_build', slots: slots, paletteIds: palette.slice(), expectedSequence: expectedSequence.slice() },
        },
        distractors: [],
        meta: { archetype: 'construct_regular_polygon_pattern', misconceptionTargets: ['pattern_unit_confusion', 'pattern_position_confusion'],
          semanticProperties: { unit: unit.slice(), expectedSequence: expectedSequence.slice(), constrainedConstruction: true },
          fingerprint: fingerprint('pattern_construct', expectedSequence.join('-'), unit) }
      };
    }
    throw new Error('geometry.regularPolygonPattern: unknown mode "' + mode + '"');
  });

  registerGenerator('geometry.symmetryAxis', function (params, rng) {
    var mode = (params && params.mode) || 'count_axes';
    var shapeId = pick(rng, SYMMETRY_IDS);
    var shape = SYMMETRY_SHAPES[shapeId];
    var trueAxes = shape.axisAngles.slice();

    if (mode === 'count_axes') {
      var count = trueAxes.length;
      var wrongPool = [count - 1, count + 1, count + 2, count + 3, 0].filter(function (n) { return n >= 0 && n !== count; });
      var wrongCounts = sampleUnique(rng, Array.from(new Set(wrongPool)), 3);
      var fill = 1;
      while (wrongCounts.length < 3) { if (fill !== count && wrongCounts.indexOf(fill) < 0) wrongCounts.push(fill); fill++; }
      var ans = makeChoice(String(count), String(count) + ' paksi');
      var dis = wrongCounts.map(function (n) { return makeChoice(String(n), String(n) + ' paksi', 'symmetry_axis_count_confusion'); });
      return {
        value: { promptMs: 'Berapakah bilangan paksi simetri bagi bentuk ini?', answer: ans,
          visual: { kind: 'symmetry_shape', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null } } },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'identify_symmetry_axis_count', misconceptionTargets: ['symmetry_axis_count_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), axisCount: count },
          fingerprint: fingerprint('symmetry_count', count, [shapeId]) }
      };
    }

    if (mode === 'select_axis') {
      var answerAngle = pick(rng, trueAxes);
      var wrongAngles = sampleUnique(rng, shape.distractorAngles, 3);
      var mixedAngles = shuffle(rng, [answerAngle].concat(wrongAngles));
      var letters = ['A', 'B', 'C', 'D'];
      var candidates = mixedAngles.map(function (angle, i) { return { id: 'axis_' + letters[i], labelMs: 'Garis ' + letters[i], angle: angle }; });
      var correctCandidate = candidates.filter(function (c) { return c.angle === answerAngle; })[0];
      var wrongCandidates = candidates.filter(function (c) { return c.id !== correctCandidate.id; });
      var ans2 = makeChoice(correctCandidate.id, correctCandidate.labelMs);
      var dis2 = wrongCandidates.map(function (c) { return makeChoice(c.id, c.labelMs, 'symmetry_axis_orientation_confusion'); });
      return {
        value: { promptMs: 'Garis manakah merupakan paksi simetri bagi bentuk ini?', answer: ans2,
          visual: { kind: 'symmetry_candidates', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null }, candidates: candidates } },
        distractors: dis2,
        meta: { archetype: 'select_valid_symmetry_axis', misconceptionTargets: ['symmetry_axis_orientation_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), answerAngle: answerAngle, candidateAngles: candidates.map(function (c) { return c.angle; }) },
          fingerprint: fingerprint('symmetry_select', answerAngle, [shapeId].concat(candidates.map(function (c) { return String(c.angle); }))) }
      };
    }

    if (mode === 'draw_axis') {
      return {
        value: {
          promptMs: 'Lukis SATU paksi simetri pada bentuk ini.',
          answer: { id: 'valid_axis', labelMs: 'Satu paksi simetri yang betul' },
          visual: { kind: 'symmetry_draw', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null } },
          interaction: { type: 'draw_axis', acceptedAxisAngles: trueAxes.slice(), angleToleranceDeg: 4, mustPassThroughCenter: true, centerToleranceRatio: 0.08, requirement: 'one_valid_axis' },
        },
        distractors: [],
        meta: { archetype: 'draw_valid_symmetry_axis', misconceptionTargets: ['symmetry_axis_orientation_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), requirement: 'one_valid_axis' },
          fingerprint: fingerprint('symmetry_draw', shapeId, trueAxes.map(String)) }
      };
    }
    throw new Error('geometry.symmetryAxis: unknown mode "' + mode + '"');
  });
})();

  })(registerGenerator);

  // ---- generators/geometry/prism.js ----
  (function (registerGenerator) {
// questions/v2/generators/geometry/prism.js
//
// Reusable geometry generator family for D3 Topic 7.1 ("Ruang" — Prisma),
// Phase 2A-1 pilot. Registers three keys:
//
//   geometry.identifyPrism  -> SP 7.1.1 (identify_prism)
//   geometry.prismFeatures  -> SP 7.1.2 (describe_prism_features)
//   geometry.classifyPrism  -> SP 7.1.3 (classify_prism_vs_non_prism)
//
// Each key supports several `params.mode` values (the evidence-family
// variants declared by the bank JSON, see
// questions/v2/banks/kssr-e3-2024/d3/space-prism.json). This file owns NO
// curriculum routing: it never reads/writes a competencyId, standardId,
// or topicId. It only knows abstract geometry facts about a small set of
// solid IDs and produces MCQ-shaped question data from them, parameterised
// entirely by `params` and randomised entirely by the injected `rng`.
//
// Known-bug guard (Phase 2A-1): Bahasa Melayu labels for "segi empat sama"
// (square) and "segi empat tepat" (rectangle) must NEVER be compared by
// substring — "segi empat tepat".includes("segi empat") is true for both,
// which previously caused a false-match QA bug. This file compares only
// structured internal IDs (e.g. "square_prism" !== "rectangular_prism")
// and maps an ID to its Bahasa Melayu label solely for display, at the
// last possible step, never the reverse.
//
// Fix (Phase 2A-1F1): geometry.classifyPrism's classify_properties mode
// (D3-T7-713-classify-prism-properties-v1, archetype classify_by_properties)
// previously described every prism with one shared generic sentence, and
// both pyramid types with one shared generic sentence, so a distractor of
// the same family (e.g. triangular_prism as a distractor when the answer
// is square_prism) also satisfied the description as literally written.
// The description is now built from SOLID_SEMANTIC_PROPERTIES
// (solidKind + baseShapeId), which is unique per solid id, and that same
// structured descriptor is exposed on meta.semanticProperties for
// independent QA. See questions/v2/validation/d3-topic7-1-prism-qa.js.
//
// Authoring contract (see questions/v2/build/README.md): no require, no
// module.exports, no Node/browser globals — a pure function of (params, rng).

(function () {
  'use strict';

  // ---- Structured solid data (canonical IDs only; labels are display-only) ----

  var PRISM_TYPES = {
    square_prism: {
      kind: 'prism',
      baseShapeId: 'square',
      baseCount: 2,
      faces: 6,
      vertices: 8,
      edges: 12,
      labelMs: 'Prisma Segi Empat Sama',
      baseShapeLabelMs: 'segi empat sama',
    },
    rectangular_prism: {
      kind: 'prism',
      baseShapeId: 'rectangle',
      baseCount: 2,
      faces: 6,
      vertices: 8,
      edges: 12,
      labelMs: 'Prisma Segi Empat Tepat',
      baseShapeLabelMs: 'segi empat tepat',
    },
    triangular_prism: {
      kind: 'prism',
      baseShapeId: 'triangle',
      baseCount: 2,
      faces: 5,
      vertices: 6,
      edges: 9,
      labelMs: 'Prisma Segi Tiga',
      baseShapeLabelMs: 'segi tiga',
    },
  };

  var NON_PRISM_TYPES = {
    cone: {
      kind: 'non_prism',
      labelMs: 'Kon',
      propertyMs: 'mempunyai satu tapak bulat dan permukaannya meruncing ke satu titik',
    },
    sphere: {
      kind: 'non_prism',
      labelMs: 'Sfera',
      propertyMs: 'permukaannya melengkung sepenuhnya dan tiada tapak rata',
    },
    cylinder: {
      kind: 'non_prism',
      labelMs: 'Silinder',
      propertyMs: 'mempunyai dua tapak bulat yang selari, disambungkan oleh satu permukaan melengkung',
    },
    square_pyramid: {
      kind: 'non_prism',
      labelMs: 'Piramid Tapak Segi Empat Sama',
      propertyMs: 'mempunyai satu tapak sahaja dan semua permukaan sisinya bertemu di satu puncak',
    },
    triangular_pyramid: {
      kind: 'non_prism',
      labelMs: 'Piramid Tapak Segi Tiga',
      propertyMs: 'mempunyai satu tapak sahaja dan semua permukaan sisinya bertemu di satu puncak',
    },
  };

  var PRISM_BASE_SHAPE_LABELS = { square: 'segi empat sama', rectangle: 'segi empat tepat', triangle: 'segi tiga' };
  var NON_PRISM_BASE_SHAPE_LABELS = { pentagon: 'pentagon' };

  var PRISM_IDS = ['square_prism', 'rectangular_prism', 'triangular_prism'];
  var NON_PRISM_IDS = ['cone', 'sphere', 'cylinder', 'square_pyramid', 'triangular_pyramid'];

  // Phase 2A-1F1 fix: structured semantic descriptor per solid id, used by
  // geometry.classifyPrism's classify_properties mode (SP 7.1.3) to build
  // a property description that is unique to exactly one solid, and
  // exposed on meta.semanticProperties so independent QA can verify that
  // uniqueness without parsing Bahasa Melayu text or trusting the
  // generator's own "correctness". (solidKind, baseShapeId) is a unique
  // pair across all 8 known solids: three prism types differ by
  // baseShapeId, the two pyramid types differ by baseShapeId, and cone /
  // sphere / cylinder each have a distinct solidKind. Adding a new solid
  // later must preserve that uniqueness or this invariant breaks loudly
  // (see the defensive distractor filter below).
  var SOLID_SEMANTIC_PROPERTIES = {
    square_prism: { solidKind: 'prism', baseShapeId: 'square' },
    rectangular_prism: { solidKind: 'prism', baseShapeId: 'rectangle' },
    triangular_prism: { solidKind: 'prism', baseShapeId: 'triangle' },
    square_pyramid: { solidKind: 'pyramid', baseShapeId: 'square' },
    triangular_pyramid: { solidKind: 'pyramid', baseShapeId: 'triangle' },
    cone: { solidKind: 'cone', baseShapeId: 'circle' },
    sphere: { solidKind: 'sphere', baseShapeId: null },
    cylinder: { solidKind: 'cylinder', baseShapeId: 'circle' },
  };

  function sameDescriptor(a, b) {
    return a.solidKind === b.solidKind && a.baseShapeId === b.baseShapeId;
  }

  function solidLabelMs(id) {
    if (PRISM_TYPES[id]) return PRISM_TYPES[id].labelMs;
    if (NON_PRISM_TYPES[id]) return NON_PRISM_TYPES[id].labelMs;
    throw new Error('geometry/prism: unknown solid id "' + id + '"');
  }

  // ---- rng-driven helpers (pure; take rng as an explicit argument) ----

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /** Sample `n` distinct items from `arr` without replacement. */
  function sampleUnique(rng, arr, n) {
    return shuffle(rng, arr).slice(0, n);
  }

  function makeChoice(id, labelMs, misconceptionTag) {
    return { id: id, labelMs: labelMs, misconceptionTag: misconceptionTag || null };
  }

  function fingerprint(archetype, answerId, distractorIds) {
    return archetype + '::' + answerId + '::' + distractorIds.slice().sort().join(',');
  }

  // =========================================================================
  // geometry.identifyPrism  (SP 7.1.1)
  // =========================================================================

  registerGenerator('geometry.identifyPrism', function (params, rng) {
    var mode = (params && params.mode) || 'identify_picture';

    if (mode === 'identify_picture') {
      var targetId = pick(rng, PRISM_IDS);
      var otherPrisms = PRISM_IDS.filter(function (id) { return id !== targetId; });
      var nonPrismDistractor = pick(rng, NON_PRISM_IDS);

      var answer = makeChoice(targetId, solidLabelMs(targetId));
      var distractors = otherPrisms
        .map(function (id) { return makeChoice(id, solidLabelMs(id), 'prism_type_confusion'); })
        .concat([makeChoice(nonPrismDistractor, solidLabelMs(nonPrismDistractor), 'prism_vs_non_prism')]);

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Apakah nama pepejal ini?',
          answer: answer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: targetId }] },
        },
        distractors: shuffle(rng, distractors),
        meta: {
          archetype: 'identify_from_picture',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('identify_picture', answer.id, distractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'identify_properties') {
      var tId = pick(rng, PRISM_IDS);
      var t = PRISM_TYPES[tId];
      var otherIds = PRISM_IDS.filter(function (id) { return id !== tId; });
      var nonPrismId = pick(rng, NON_PRISM_IDS);

      var promptMs =
        'Sebuah pepejal mempunyai ' + t.faces + ' permukaan rata dan ' + t.baseCount +
        ' tapak berbentuk ' + t.baseShapeLabelMs + ' yang selari serta sama saiz. Apakah nama pepejal ini?';

      var ans2 = makeChoice(tId, t.labelMs);
      var dis2 = otherIds
        .map(function (id) { return makeChoice(id, solidLabelMs(id), 'prism_type_confusion'); })
        .concat([makeChoice(nonPrismId, solidLabelMs(nonPrismId), 'prism_vs_non_prism')]);

      return {
        value: {
          promptMs: promptMs,
          answer: ans2,
          visual: null,
        },
        distractors: shuffle(rng, dis2),
        meta: {
          archetype: 'identify_from_properties',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('identify_properties', ans2.id, dis2.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'discriminate') {
      var dTargetId = pick(rng, PRISM_IDS);
      var trapPrismId = pick(rng, PRISM_IDS.filter(function (id) { return id !== dTargetId; }));
      var nonPrismPair = sampleUnique(rng, NON_PRISM_IDS, 2);

      var figureIds = [dTargetId, trapPrismId].concat(nonPrismPair);
      var figures = shuffle(rng, figureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var correctFigure = figures.filter(function (f) { return f.solidId === dTargetId; })[0];
      var wrongFigures = figures.filter(function (f) { return f.solidId !== dTargetId; });

      var dAnswer = makeChoice(correctFigure.id, solidLabelMs(dTargetId));
      var dDistractors = wrongFigures.map(function (f) {
        var tag = PRISM_TYPES[f.solidId] ? 'prism_type_confusion' : 'prism_vs_non_prism';
        return makeChoice(f.id, solidLabelMs(f.solidId), tag);
      });

      return {
        value: {
          promptMs: 'Yang manakah ' + PRISM_TYPES[dTargetId].labelMs + '?',
          answer: dAnswer,
          visual: { layout: 'gallery', figures: figures },
        },
        distractors: dDistractors,
        meta: {
          archetype: 'discriminate_solids',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('discriminate', dTargetId, wrongFigures.map(function (f) { return f.solidId; })),
        },
      };
    }

    throw new Error('geometry.identifyPrism: unknown mode "' + mode + '"');
  });

  // =========================================================================
  // geometry.prismFeatures  (SP 7.1.2)
  // =========================================================================

  registerGenerator('geometry.prismFeatures', function (params, rng) {
    var mode = (params && params.mode) || 'count_faces';

    if (mode === 'count_faces') {
      var fId = pick(rng, PRISM_IDS);
      var f = PRISM_TYPES[fId];
      var otherFaceCounts = PRISM_IDS
        .filter(function (id) { return id !== fId; })
        .map(function (id) { return PRISM_TYPES[id].faces; })
        .filter(function (n) { return n !== f.faces; });

      var wrongCountsPool = [f.faces - 1, f.faces + 1].concat(otherFaceCounts).filter(function (n) {
        return n > 0 && n !== f.faces;
      });
      var uniqueWrong = Array.from(new Set(wrongCountsPool));
      var chosenWrong = sampleUnique(rng, uniqueWrong, Math.min(3, uniqueWrong.length));
      // Guarantee exactly 3 distractors even in a degenerate small pool.
      var fillIdx = f.faces + 2;
      while (chosenWrong.length < 3) {
        if (chosenWrong.indexOf(fillIdx) === -1 && fillIdx !== f.faces) chosenWrong.push(fillIdx);
        fillIdx++;
      }

      var fAnswer = makeChoice(String(f.faces), String(f.faces) + ' permukaan');
      var fDistractors = chosenWrong.map(function (n) {
        return makeChoice(String(n), String(n) + ' permukaan', 'face_count_confusion');
      });

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Berapakah bilangan permukaan (muka) bagi pepejal ini?',
          answer: fAnswer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: fId }] },
        },
        distractors: shuffle(rng, fDistractors),
        meta: {
          archetype: 'count_faces',
          misconceptionTargets: ['face_count_confusion'],
          fingerprint: fingerprint('count_faces', fAnswer.id, fDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'identify_base') {
      var bId = pick(rng, PRISM_IDS);
      var b = PRISM_TYPES[bId];
      var otherBaseIds = Object.keys(PRISM_BASE_SHAPE_LABELS).filter(function (id) { return id !== b.baseShapeId; });
      var extraShapeId = 'pentagon';

      var bAnswer = makeChoice(b.baseShapeId, PRISM_BASE_SHAPE_LABELS[b.baseShapeId]);
      var bDistractors = otherBaseIds
        .map(function (id) { return makeChoice(id, PRISM_BASE_SHAPE_LABELS[id], 'base_shape_confusion'); })
        .concat([makeChoice(extraShapeId, NON_PRISM_BASE_SHAPE_LABELS[extraShapeId], 'not_a_prism_base')]);

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Apakah bentuk tapak pepejal ini?',
          answer: bAnswer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: bId }] },
        },
        distractors: shuffle(rng, bDistractors),
        meta: {
          archetype: 'identify_base',
          misconceptionTargets: ['base_shape_confusion', 'not_a_prism_base'],
          fingerprint: fingerprint('identify_base', bAnswer.id, bDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'reason_features') {
      var rId = pick(rng, PRISM_IDS);
      var r = PRISM_TYPES[rId];
      var askEdges = rng() < 0.5;
      var targetValue = askEdges ? r.edges : r.vertices;
      var targetLabelMs = askEdges ? 'tepi' : 'bucu';

      var otherValues = PRISM_IDS
        .filter(function (id) { return id !== rId; })
        .map(function (id) { return askEdges ? PRISM_TYPES[id].edges : PRISM_TYPES[id].vertices; })
        .filter(function (n) { return n !== targetValue; });

      var rWrongPool = [targetValue - 1, targetValue + 1].concat(otherValues).filter(function (n) {
        return n > 0 && n !== targetValue;
      });
      var rUniqueWrong = Array.from(new Set(rWrongPool));
      var rChosenWrong = sampleUnique(rng, rUniqueWrong, Math.min(3, rUniqueWrong.length));
      var rFill = targetValue + 3;
      while (rChosenWrong.length < 3) {
        if (rChosenWrong.indexOf(rFill) === -1 && rFill !== targetValue) rChosenWrong.push(rFill);
        rFill++;
      }

      var promptMs =
        'Sebuah prisma mempunyai ' + r.baseCount + ' tapak berbentuk ' + r.baseShapeLabelMs +
        ' dan ' + r.faces + ' permukaan rata semuanya. Berapakah bilangan ' + targetLabelMs + ' pepejal ini?';

      var rAnswer = makeChoice(String(targetValue), String(targetValue) + ' ' + targetLabelMs);
      var rDistractors = rChosenWrong.map(function (n) {
        return makeChoice(String(n), String(n) + ' ' + targetLabelMs, 'vertex_edge_confusion');
      });

      return {
        value: { promptMs: promptMs, answer: rAnswer, visual: null },
        distractors: shuffle(rng, rDistractors),
        meta: {
          archetype: 'reason_vertices_edges',
          misconceptionTargets: ['vertex_edge_confusion'],
          fingerprint: fingerprint('reason_features:' + targetLabelMs, rAnswer.id, rDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    throw new Error('geometry.prismFeatures: unknown mode "' + mode + '"');
  });

  // =========================================================================
  // geometry.classifyPrism  (SP 7.1.3)
  // =========================================================================

  registerGenerator('geometry.classifyPrism', function (params, rng) {
    var mode = (params && params.mode) || 'select_prism';

    if (mode === 'select_prism') {
      var sPrismId = pick(rng, PRISM_IDS);
      var sNonPrismIds = sampleUnique(rng, NON_PRISM_IDS, 3);
      var sFigureIds = [sPrismId].concat(sNonPrismIds);
      var sFigures = shuffle(rng, sFigureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var sCorrectFig = sFigures.filter(function (f) { return f.solidId === sPrismId; })[0];
      var sWrongFigs = sFigures.filter(function (f) { return f.solidId !== sPrismId; });

      var sAnswer = makeChoice(sCorrectFig.id, solidLabelMs(sPrismId));
      var sDistractors = sWrongFigs.map(function (f) {
        return makeChoice(f.id, solidLabelMs(f.solidId), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Yang manakah PRISMA?',
          answer: sAnswer,
          visual: { layout: 'gallery', figures: sFigures },
        },
        distractors: sDistractors,
        meta: {
          archetype: 'select_prism_from_set',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('select_prism', sPrismId, sNonPrismIds),
        },
      };
    }

    if (mode === 'classify_properties') {
      var allIds = PRISM_IDS.concat(NON_PRISM_IDS);
      var cTargetId = pick(rng, allIds);
      var cDescriptor = SOLID_SEMANTIC_PROPERTIES[cTargetId];

      // Build a property description from the structured descriptor, not
      // from a single shared "isPrism" bucket. Prisms and pyramids each
      // name their specific base shape, so the three prism types and the
      // two pyramid types no longer collapse onto one shared sentence.
      var cPropertyMs;
      if (cDescriptor.solidKind === 'prism') {
        cPropertyMs =
          'mempunyai dua tapak berbentuk ' + PRISM_BASE_SHAPE_LABELS[cDescriptor.baseShapeId] +
          ' yang sama bentuk, sama saiz dan selari, disambungkan oleh permukaan sisi berbentuk segi empat';
      } else if (cDescriptor.solidKind === 'pyramid') {
        cPropertyMs =
          'mempunyai satu tapak sahaja berbentuk ' + PRISM_BASE_SHAPE_LABELS[cDescriptor.baseShapeId] +
          ' dan semua permukaan sisinya bertemu di satu puncak';
      } else {
        cPropertyMs = NON_PRISM_TYPES[cTargetId].propertyMs;
      }

      // Defensive distractor filter: exclude any id whose structured
      // descriptor equals the target's. With the fixed 8-solid set this
      // never removes anything (every descriptor is already unique), but
      // it keeps "no distractor can satisfy the described property" true
      // by construction rather than by coincidence if the solid set grows.
      var cOtherIds = allIds.filter(function (id) {
        return id !== cTargetId && !sameDescriptor(SOLID_SEMANTIC_PROPERTIES[id], cDescriptor);
      });
      var cDistractorIds = sampleUnique(rng, cOtherIds, 3);

      var cAnswer = makeChoice(cTargetId, solidLabelMs(cTargetId));
      var cDistractors = cDistractorIds.map(function (id) {
        return makeChoice(id, solidLabelMs(id), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Satu pepejal ' + cPropertyMs + '. Pepejal manakah yang sepadan dengan penerangan ini?',
          answer: cAnswer,
          visual: null,
        },
        distractors: shuffle(rng, cDistractors),
        meta: {
          archetype: 'classify_by_properties',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('classify_properties', cAnswer.id, cDistractorIds),
          semanticProperties: {
            targetId: cTargetId,
            solidKind: cDescriptor.solidKind,
            baseShapeId: cDescriptor.baseShapeId,
            distractorIds: cDistractorIds.slice(),
          },
        },
      };
    }

    if (mode === 'compare') {
      var comparePrismIds = shuffle(rng, PRISM_IDS.slice());
      var compareNonPrismId = pick(rng, NON_PRISM_IDS);
      var compareFigureIds = comparePrismIds.concat([compareNonPrismId]);
      var compareFigures = shuffle(rng, compareFigureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var compareCorrectFig = compareFigures.filter(function (f) { return f.solidId === compareNonPrismId; })[0];
      var compareWrongFigs = compareFigures.filter(function (f) { return f.solidId !== compareNonPrismId; });

      var compareAnswer = makeChoice(compareCorrectFig.id, solidLabelMs(compareNonPrismId));
      var compareDistractors = compareWrongFigs.map(function (f) {
        return makeChoice(f.id, solidLabelMs(f.solidId), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Yang manakah BUKAN prisma?',
          answer: compareAnswer,
          visual: { layout: 'gallery', figures: compareFigures },
        },
        distractors: compareDistractors,
        meta: {
          archetype: 'compare_prism_non_prism',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('compare', compareNonPrismId, comparePrismIds),
        },
      };
    }

    throw new Error('geometry.classifyPrism: unknown mode "' + mode + '"');
  });
})();

  })(registerGenerator);
  // ---- renderers/geometry/polygon-symmetry.js ----
  (function (registerRenderer) {
// questions/v2/renderers/geometry/polygon-symmetry.js
// Clean-room static SVG renderer for Phase 2A-2 regular polygons, patterns,
// and symmetry-axis tasks. Pure function; no DOM or Node globals.
(function () {
  'use strict';
  var STROKE = '#2b2540', FILL = '#f2ecfb', ACCENT = '#6a52a3';
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function rad(d) { return d * Math.PI / 180; }
  function regularPoints(sides, cx, cy, r, rotation) {
    var pts=[]; rotation = rotation == null ? -90 : rotation;
    for (var i=0;i<sides;i++) { var a=rad(rotation + i*360/sides); pts.push([cx+r*Math.cos(a), cy+r*Math.sin(a)]); }
    return pts;
  }
  function pointsAttr(pts) { return pts.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' '); }
  function shapeMarkup(shape, cx, cy, r) {
    if (shape.shapeType === 'rectangle') return '<rect x="'+(cx-r)+'" y="'+(cy-r*0.62)+'" width="'+(2*r)+'" height="'+(1.24*r)+'" rx="2" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.5"/>';
    if (shape.shapeType === 'isosceles_triangle') return '<polygon points="'+pointsAttr([[cx,cy-r],[cx-r*0.9,cy+r*0.72],[cx+r*0.9,cy+r*0.72]])+'" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.5"/>';
    var sides = Number(shape.sides || 5);
    return '<polygon points="'+pointsAttr(regularPoints(sides,cx,cy,r,-90))+'" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  function polygonMarkup(id, cx, cy, r) {
    var sides = {pentagon:5,hexagon:6,heptagon:7,octagon:8}[id];
    if (!sides) throw new Error('geometry2d renderer: unknown polygon id "'+id+'"');
    return '<polygon data-polygon-id="'+esc(id)+'" points="'+pointsAttr(regularPoints(sides,cx,cy,r,-90))+'" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  function svgOpen(w,h) { return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'; }
  function lineForAngle(angle,cx,cy,len) {
    var a=rad(angle), dx=Math.cos(a)*len/2, dy=Math.sin(a)*len/2;
    return [cx-dx,cy-dy,cx+dx,cy+dy];
  }
  function renderPolygonSingle(v) {
    var f=v.figures[0]; return '<div class="qsv2-geom2d-single" data-figure-id="'+esc(f.id)+'">'+svgOpen(140,130)+polygonMarkup(f.polygonId,70,65,43)+'</svg></div>';
  }
  function renderPolygonGallery(v) {
    return '<div class="qsv2-geom2d-gallery" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:250px;margin:4px auto 10px">'+v.figures.map(function(f,index){return '<div class="qsv2-geom2d-figure" style="position:relative;min-width:0;text-align:center" data-figure-id="'+esc(f.id)+'"><span class="qsv2-choice-marker" aria-hidden="true" style="position:absolute;top:4px;left:6px;z-index:2;font:900 13px/1 sans-serif;background:#fff;border:2px solid '+STROKE+';border-radius:999px;padding:3px 6px;color:'+STROKE+'">'+String.fromCharCode(65+index)+'</span>'+svgOpen(110,105)+polygonMarkup(f.polygonId,55,52,34)+'</svg></div>';}).join('')+'</div>';
  }
  function renderPattern(v) {
    var seq=v.sequence||[], n=seq.length+(v.showQuestionMark?1:0), cell=62, w=Math.max(130,n*cell+12), h=86;
    var body='';
    for(var i=0;i<seq.length;i++) body += '<g data-pattern-index="'+i+'">'+polygonMarkup(seq[i], 38+i*cell, 43, 23)+'</g>';
    if(v.showQuestionMark) body += '<text x="'+(38+seq.length*cell)+'" y="51" text-anchor="middle" font-size="28" font-family="sans-serif" fill="'+STROKE+'">?</text>';
    return '<div class="qsv2-geom2d-pattern">'+svgOpen(w,h)+body+'</svg></div>';
  }
  function renderPatternBuilder(v) {
    var slots=v.slots||6, cell=56, w=slots*cell+12, body='';
    for(var i=0;i<slots;i++) body += '<rect data-builder-slot="'+i+'" x="'+(8+i*cell)+'" y="10" width="46" height="46" rx="5" fill="none" stroke="'+STROKE+'" stroke-width="1.8" stroke-dasharray="4 3"/>';
    var unit=(v.unit||[]); for(var j=0;j<unit.length;j++) body += '<g data-unit-index="'+j+'">'+polygonMarkup(unit[j], 30+j*52, 88, 19)+'</g>';
    return '<div class="qsv2-geom2d-builder" data-slots="'+slots+'">'+svgOpen(Math.max(w,unit.length*52+20),116)+body+'</svg></div>';
  }
  function renderSymmetry(v, candidates) {
    var s=v.shape, cx=70,cy=65,r=40,body=shapeMarkup(s,cx,cy,r);
    if(candidates){
      for(var i=0;i<candidates.length;i++){
        var c=candidates[i], L=lineForAngle(c.angle,cx,cy,108);
        body += '<line data-axis-id="'+esc(c.id)+'" data-axis-angle="'+esc(c.angle)+'" x1="'+L[0].toFixed(2)+'" y1="'+L[1].toFixed(2)+'" x2="'+L[2].toFixed(2)+'" y2="'+L[3].toFixed(2)+'" stroke="'+ACCENT+'" stroke-width="1.5" stroke-dasharray="5 3"/>';
        var lx=cx+Math.cos(rad(c.angle))*52, ly=cy+Math.sin(rad(c.angle))*52;
        body += '<text x="'+lx.toFixed(2)+'" y="'+ly.toFixed(2)+'" font-size="11" font-family="sans-serif" fill="'+STROKE+'">'+esc(c.labelMs.replace('Garis ',''))+'</text>';
      }
    }
    return '<div class="qsv2-geom2d-symmetry" data-shape-id="'+esc(s.shapeId)+'">'+svgOpen(140,130)+body+'</svg></div>';
  }
  registerRenderer('geometry2d', function(question, params){
    var v=question&&question.visual; if(!v)return '<div class="qsv2-geom2d-empty"></div>';
    if(v.kind==='polygon_single')return renderPolygonSingle(v);
    if(v.kind==='polygon_gallery')return renderPolygonGallery(v);
    if(v.kind==='polygon_pattern')return renderPattern(v);
    if(v.kind==='polygon_pattern_builder')return renderPatternBuilder(v);
    if(v.kind==='symmetry_shape'||v.kind==='symmetry_draw')return renderSymmetry(v,null);
    if(v.kind==='symmetry_candidates')return renderSymmetry(v,v.candidates||[]);
    throw new Error('geometry2d renderer: unknown visual kind "'+v.kind+'"');
  });
})();

  })(registerRenderer);

  // ---- renderers/geometry/prism.js ----
  (function (registerRenderer) {
// questions/v2/renderers/geometry/prism.js
//
// Reusable "geometry" renderer for D3 Topic 7.1 (Prisma), Phase 2A-1 pilot.
// Registers a single key, "geometry", matching the `renderer` field used by
// the visual-representation templates in
// questions/v2/banks/kssr-e3-2024/d3/space-prism.json.
//
// Draws simple, clean pseudo-3D (isometric-style) SVG line-art for the
// solid IDs referenced by questions/v2/generators/geometry/prism.js:
// square_prism, rectangular_prism, triangular_prism (the three prisms) and
// cone, sphere, cylinder, square_pyramid, triangular_pyramid (non-prism
// comparison solids). This is a clean-room QS v2 renderer, not a reuse of
// any existing legacy production drawing code, to avoid coupling QS v2 to
// the legacy runtime.
//
// Input contract: `question` is the assembled question object produced by
// merging a geometry.* generator's `value`/`distractors` (see
// questions/v2/engine/generator.js's future contract) — in particular
// `question.visual = { layout: 'single'|'gallery', figures: [{id, solidId}] }`.
// A template with `representation !== 'visual'` (renderer: null) never
// calls this file at all.
//
// Output contract: returns one HTML string containing a <svg> per figure,
// each tagged `data-figure-id="..."` so the caller can associate a figure
// with its MCQ choice id. Pure function of (question, params) — no DOM,
// no globals, deterministic for a given input (no randomness is used here;
// all variation already happened in the generator).
//
// Authoring contract (see questions/v2/build/README.md): no require, no
// module.exports, no Node/browser globals — call registerRenderer directly.

(function () {
  'use strict';

  var STROKE = '#2b2540';
  var FILL_MAIN = '#e8def8';
  var FILL_SHADE = '#c9b8ef';
  var FILL_TOP = '#f4eefc';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function svgOpen(vb) {
    return '<svg viewBox="' + vb + '" width="120" height="120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">';
  }

  // ---- individual solid drawings (each returns inner SVG markup, no wrapper) ----

  function drawRectangularPrism(w, d) {
    // Isometric cuboid: front face, top face (parallelogram), side face.
    var ox = 30, oy = 85, sk = 18, h = 46, fw = w;
    var frontW = fw;
    var topBack = [[ox + sk, oy - h - sk], [ox + sk + frontW, oy - h - sk], [ox + frontW, oy - h], [ox, oy - h]];
    var front = [[ox, oy - h], [ox + frontW, oy - h], [ox + frontW, oy], [ox, oy]];
    var side = [[ox + frontW, oy - h], [ox + frontW + sk, oy - h - sk], [ox + frontW + sk, oy - sk], [ox + frontW, oy]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    return poly(side, FILL_SHADE) + poly(topBack, FILL_TOP) + poly(front, FILL_MAIN);
  }

  function drawTriangularPrism() {
    var ox = 25, oy = 90, sk = 22, h = 55, bw = 60;
    var frontTri = [[ox, oy], [ox + bw, oy], [ox + bw / 2, oy - h]];
    var backTri = [[ox + sk, oy - sk], [ox + bw + sk, oy - sk], [ox + bw / 2 + sk, oy - h - sk]];
    var topQuad = [frontTri[2], backTri[2], backTri[1], frontTri[1]];
    var sideQuad = [frontTri[0], frontTri[1], backTri[1], backTri[0]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    return poly(sideQuad, FILL_SHADE) + poly(topQuad, FILL_TOP) + poly(frontTri, FILL_MAIN);
  }

  function drawCone() {
    return (
      '<ellipse cx="60" cy="88" rx="34" ry="12" fill="' + FILL_SHADE + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<path d="M 60 20 L 26 88 A 34 12 0 0 0 94 88 Z" fill="' + FILL_MAIN + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>'
    );
  }

  function drawSphere() {
    return (
      '<circle cx="60" cy="60" r="38" fill="' + FILL_MAIN + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<ellipse cx="60" cy="60" rx="38" ry="13" fill="none" stroke="' + STROKE + '" stroke-width="1.5" opacity="0.6"/>'
    );
  }

  function drawCylinder() {
    return (
      '<path d="M 26 34 L 26 86" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<path d="M 94 34 L 94 86" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<rect x="26" y="34" width="68" height="52" fill="' + FILL_MAIN + '" stroke="none"/>' +
      '<ellipse cx="60" cy="86" rx="34" ry="12" fill="' + FILL_SHADE + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<ellipse cx="60" cy="34" rx="34" ry="12" fill="' + FILL_TOP + '" stroke="' + STROKE + '" stroke-width="2.5"/>'
    );
  }

  function drawSquarePyramid() {
    var ox = 25, oy = 88, sk = 22, bw = 60, apex = [60, 18];
    var base = [[ox, oy], [ox + bw, oy], [ox + bw + sk, oy - sk], [ox + sk, oy - sk]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    var leftFace = [[ox, oy], apex, [ox + sk, oy - sk]];
    var frontFace = [[ox, oy], [ox + bw, oy], apex];
    var rightFace = [[ox + bw, oy], [ox + bw + sk, oy - sk], apex];
    return poly(base, FILL_SHADE) + poly(leftFace, FILL_TOP) + poly(rightFace, FILL_TOP) + poly(frontFace, FILL_MAIN);
  }

  function drawTriangularPyramid() {
    var left = [22, 90], right = [98, 90], back = [60, 55], apex = [58, 15];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    var faceLeft = [left, apex, back];
    var faceRight = [right, apex, back];
    var faceFront = [left, right, apex];
    return poly(faceLeft, FILL_SHADE) + poly(faceRight, FILL_TOP) + poly(faceFront, FILL_MAIN);
  }

  var DRAWERS = {
    square_prism: function () { return drawRectangularPrism(50, 50); },
    rectangular_prism: function () { return drawRectangularPrism(64, 34); },
    triangular_prism: drawTriangularPrism,
    cone: drawCone,
    sphere: drawSphere,
    cylinder: drawCylinder,
    square_pyramid: drawSquarePyramid,
    triangular_pyramid: drawTriangularPyramid,
  };

  function drawSolid(solidId) {
    var drawer = DRAWERS[solidId];
    if (!drawer) throw new Error('geometry renderer: unknown solid id "' + solidId + '"');
    return svgOpen('0 0 120 120') + drawer() + '</svg>';
  }

  function renderFigure(fig, index, showMarker) {
    var marker = showMarker ? '<span class="qsv2-choice-marker" aria-hidden="true" style="position:absolute;top:4px;left:6px;z-index:2;font:900 13px/1 sans-serif;background:#fff;border:2px solid #2b2540;border-radius:999px;padding:3px 6px;color:#2b2540">' + String.fromCharCode(65 + index) + '</span>' : '';
    return (
      '<div class="qsv2-geom-figure" style="position:relative;min-width:0;text-align:center" data-figure-id="' + esc(fig.id) + '" data-solid-id="' + esc(fig.solidId) + '">' +
      marker + drawSolid(fig.solidId) +
      '</div>'
    );
  }

  registerRenderer('geometry', function (question, params) {
    var visual = question && question.visual;
    if (!visual || !Array.isArray(visual.figures) || visual.figures.length === 0) {
      return '<div class="qsv2-geom-empty"></div>';
    }
    var layoutClass = visual.layout === 'gallery' ? 'qsv2-geom-gallery' : 'qsv2-geom-single';
    var showMarker = visual.layout === 'gallery';
    var body = visual.figures.map(function (fig, index) { return renderFigure(fig, index, showMarker); }).join('');
    var layoutStyle = visual.layout === 'gallery' ? 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:260px;margin:4px auto 10px' : 'display:flex;justify-content:center;margin:4px auto 10px';
    return '<div class="' + layoutClass + '" style="' + layoutStyle + '">' + body + '</div>';
  });
})();

  })(registerRenderer);

  function getCurriculumRecord(curriculumVersion, grade, standardId) {
    for (var i = 0; i < CURRICULUM.length; i++) {
      var r = CURRICULUM[i];
      if (r.curriculumVersion === curriculumVersion && r.grade === grade && r.standardId === standardId) return r;
    }
    return null;
  }

  function listCurriculumByStatus(curriculumVersion, grade, status) {
    return CURRICULUM.filter(function (r) {
      return r.curriculumVersion === curriculumVersion && r.grade === grade && r.status === status;
    });
  }

  function getTemplate(templateId) {
    for (var i = 0; i < TEMPLATES.length; i++) {
      if (TEMPLATES[i].templateId === templateId) return TEMPLATES[i];
    }
    return null;
  }

  function listGenerators() {
    return Object.keys(generators).sort();
  }

  function listRenderers() {
    return Object.keys(renderers).sort();
  }

  global.PAQuestionSystemV2 = {
    sourceHash: SOURCE_HASH,
    buildManifest: BUILD_MANIFEST,
    curriculum: CURRICULUM,
    templates: TEMPLATES,
    getCurriculumRecord: getCurriculumRecord,
    listCurriculumByStatus: listCurriculumByStatus,
    getTemplate: getTemplate,
    listGenerators: listGenerators,
    listRenderers: listRenderers,
    _generators: generators,
    _renderers: renderers
  };
})(typeof window !== 'undefined' ? window : this);
