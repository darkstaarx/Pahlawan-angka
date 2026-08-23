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
    "competencyId": "represent_numbers_to_10000",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.1",
    "standardId": "1.1.2",
    "competencyId": "compare_numbers_to_10000",
    "titleMs": "Banding nilai hingga tiga nombor",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.2",
    "standardId": "1.2.1",
    "competencyId": "estimate_quantities_using_reference",
    "titleMs": "Anggaran kuantiti munasabah berasaskan rujukan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.3",
    "standardId": "1.3.1",
    "competencyId": "round_numbers_to_nearest_thousand",
    "titleMs": "Bundar hingga ribu terdekat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.4",
    "standardId": "1.4.1",
    "competencyId": "recognize_number_patterns_by_place_value_steps",
    "titleMs": "Pola naik/turun 1, 10, 100, 1000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "contentStandard": "1.4",
    "standardId": "1.4.2",
    "competencyId": "complete_number_patterns",
    "titleMs": "Lengkap pelbagai pola nombor mudah",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Nombor Bulat hingga 10 000",
    "topicPriority": "P2",
    "legacySkills": [
      "D3.N10000"
    ],
    "sourceStandardPriority": "P2",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.1",
    "standardId": "2.1.1",
    "competencyId": "solve_addition_subtraction_word_problems",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.1",
    "standardId": "2.1.2",
    "competencyId": "solve_mixed_addition_subtraction_problems",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "contentStandard": "2.2",
    "standardId": "2.2.1",
    "competencyId": "multiply_divide_numbers_by_1digit_powers10",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.1",
    "competencyId": "identify_equivalent_fractions",
    "titleMs": "Pecahan setara; penyebut <=10",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.2",
    "competencyId": "simplify_proper_fractions",
    "titleMs": "Pecahan wajar kepada bentuk termudah",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.3",
    "competencyId": "add_subtract_proper_fractions",
    "titleMs": "Tambah dan tolak dua pecahan wajar",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.4",
    "competencyId": "identify_improper_fractions_and_mixed_numbers",
    "titleMs": "Kenal pecahan tak wajar dan nombor bercampur",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.FRAC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.1",
    "standardId": "3.1.5",
    "competencyId": "convert_hundredths_fractions_to_decimals",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.2",
    "standardId": "3.2.1",
    "competencyId": "compare_decimals_to_hundredths",
    "titleMs": "Banding dua perpuluhan hingga dua tempat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DEC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.2",
    "standardId": "3.2.2",
    "competencyId": "add_subtract_decimals_to_hundredths",
    "titleMs": "Tambah/tolak dua perpuluhan hingga dua tempat; hasil tambah <=0.99",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DEC"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.3",
    "standardId": "3.3.1",
    "competencyId": "represent_percent_on_hundred_grid",
    "titleMs": "Peratus dalam petak seratus dan sebaliknya",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.PERCENT"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.3",
    "standardId": "3.3.2",
    "competencyId": "read_write_percent_1_to_100",
    "titleMs": "Sebut/tulis 1% hingga 100%",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pecahan, Perpuluhan dan Peratus",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.PERCENT"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "contentStandard": "3.4",
    "standardId": "3.4.1",
    "competencyId": "relate_fractions_decimals_percent",
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
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.1",
    "standardId": "4.1.1",
    "competencyId": "add_subtract_money_values",
    "titleMs": "Tambah/tolak hingga tiga nilai wang <=RM10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.1",
    "standardId": "4.1.2",
    "competencyId": "solve_mixed_addition_subtraction_money",
    "titleMs": "Operasi bergabung tambah-tolak wang <=RM10000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.2",
    "standardId": "4.2.1",
    "competencyId": "multiply_divide_money",
    "titleMs": "Darab/bahagi wang dengan 1 digit, 10, 100, 1000",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.3",
    "standardId": "4.3.1",
    "competencyId": "identify_asean_currencies",
    "titleMs": "Kenal mata wang negara ASEAN",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "contentStandard": "4.4",
    "standardId": "4.4.1",
    "competencyId": "distinguish_needs_and_wants_for_money_choices",
    "titleMs": "Keperluan dan kehendak sebagai asas simpanan/perbelanjaan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Wang",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.MONEY"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.1",
    "standardId": "5.1.1",
    "competencyId": "read_record_time_of_activities",
    "titleMs": "Baca dan rekod waktu aktiviti",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.1",
    "standardId": "5.1.2",
    "competencyId": "convert_hours_minutes_seconds",
    "titleMs": "Tukar jam-minit dan minit-saat",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.2",
    "standardId": "5.2.1",
    "competencyId": "add_subtract_time_values",
    "titleMs": "Tambah/tolak hingga tiga nilai masa",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.2",
    "standardId": "5.2.2",
    "competencyId": "solve_mixed_addition_subtraction_time",
    "titleMs": "Operasi bergabung tambah-tolak masa",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "contentStandard": "5.3",
    "standardId": "5.3.1",
    "competencyId": "multiply_divide_time",
    "titleMs": "Darab/bahagi masa dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Masa dan Waktu",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.TIME"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.1",
    "competencyId": "convert_metres_centimetres",
    "titleMs": "Tukar meter-sentimeter",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.2",
    "competencyId": "add_subtract_lengths",
    "titleMs": "Tambah/tolak hingga tiga ukuran panjang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.1",
    "standardId": "6.1.3",
    "competencyId": "multiply_divide_lengths",
    "titleMs": "Darab/bahagi panjang dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.1",
    "competencyId": "convert_kilograms_grams",
    "titleMs": "Tukar kilogram-gram",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.2",
    "competencyId": "add_subtract_masses",
    "titleMs": "Tambah/tolak hingga tiga ukuran jisim",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.2",
    "standardId": "6.2.3",
    "competencyId": "multiply_divide_masses",
    "titleMs": "Darab/bahagi jisim dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.1",
    "competencyId": "convert_litres_millilitres",
    "titleMs": "Tukar liter-mililiter",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.2",
    "competencyId": "add_subtract_liquid_volumes",
    "titleMs": "Tambah/tolak hingga tiga isi padu cecair",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "contentStandard": "6.3",
    "standardId": "6.3.3",
    "competencyId": "multiply_divide_liquid_volumes",
    "titleMs": "Darab/bahagi isi padu cecair dengan satu digit",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Ukuran dan Sukatan",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.MEASURE"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
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
    "competencyId": "describe_relative_position_from_reference",
    "titleMs": "Kedudukan objek relatif kepada titik rujukan",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "contentStandard": "8.1",
    "standardId": "8.1.2",
    "competencyId": "identify_object_using_horizontal_vertical_axes",
    "titleMs": "Kenal objek melalui paksi mengufuk/mencancang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "contentStandard": "8.1",
    "standardId": "8.1.3",
    "competencyId": "locate_position_on_horizontal_vertical_axes",
    "titleMs": "Tentukan kedudukan pada paksi mengufuk/mencancang",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Koordinat",
    "topicPriority": "P1",
    "legacySkills": [
      "D3.POSITION"
    ],
    "sourceStandardPriority": "P1",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.1",
    "standardId": "9.1.1",
    "competencyId": "collect_classify_organize_data",
    "titleMs": "Kumpul, kelas dan susun data situasi harian",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.2",
    "standardId": "9.2.1",
    "competencyId": "read_interpret_pie_chart",
    "titleMs": "Baca dan dapatkan maklumat carta pai",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  },
  {
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "contentStandard": "9.2",
    "standardId": "9.2.2",
    "competencyId": "relate_pictograph_bar_chart_pie_chart",
    "titleMs": "Hubung piktograf, carta palang dan carta pai",
    "prerequisites": [],
    "status": "mapped",
    "topicTitleMs": "Pengurusan Data",
    "topicPriority": "P0",
    "legacySkills": [
      "D3.DATA"
    ],
    "sourceStandardPriority": "P0",
    "competencyIdStatus": "canonical",
    "competencyIdReviewNote": "Human-reviewed and locked in Phase 3A-0 Darjah 3 full-year curriculum canonicalization. Change only with curriculum re-review and evidence migration review.",
    "competencyIdReviewVersion": "D3-FULL-YEAR-CANONICAL-v1"
  }
];
  var TEMPLATES = [
  {
    "templateId": "D3-1-111-number_to_expanded_form-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.1",
    "competencyId": "represent_numbers_to_10000",
    "archetypeId": "number_to_expanded_form",
    "familyKey": "d3.d3_t1.represent_numbers_to_10000",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "number_to_expanded"
    }
  },
  {
    "templateId": "D3-1-111-number_words_to_numeral-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.1",
    "competencyId": "represent_numbers_to_10000",
    "archetypeId": "number_words_to_numeral",
    "familyKey": "d3.d3_t1.represent_numbers_to_10000",
    "representation": "textual",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "represent_words"
    }
  },
  {
    "templateId": "D3-1-111-place_value_model_to_number-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.1",
    "competencyId": "represent_numbers_to_10000",
    "archetypeId": "place_value_model_to_number",
    "familyKey": "d3.d3_t1.represent_numbers_to_10000",
    "representation": "place_value_model",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "place_value_model"
    }
  },
  {
    "templateId": "D3-1-112-compare_number_statements-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.2",
    "competencyId": "compare_numbers_to_10000",
    "archetypeId": "compare_number_statements",
    "familyKey": "d3.d3_t1.compare_numbers_to_10000",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "compare_pair"
    }
  },
  {
    "templateId": "D3-1-112-explain_comparison_by_place_value-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.2",
    "competencyId": "compare_numbers_to_10000",
    "archetypeId": "explain_comparison_by_place_value",
    "familyKey": "d3.d3_t1.compare_numbers_to_10000",
    "representation": "place_value_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "compare_reason"
    }
  },
  {
    "templateId": "D3-1-112-order_three_numbers-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.1.2",
    "competencyId": "compare_numbers_to_10000",
    "archetypeId": "order_three_numbers",
    "familyKey": "d3.d3_t1.compare_numbers_to_10000",
    "representation": "symbolic",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "order_three"
    }
  },
  {
    "templateId": "D3-1-121-choose_reasonable_context_estimate-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.2.1",
    "competencyId": "estimate_quantities_using_reference",
    "archetypeId": "choose_reasonable_context_estimate",
    "familyKey": "d3.d3_t1.estimate_quantities_using_reference",
    "representation": "contextual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "estimate_context"
    }
  },
  {
    "templateId": "D3-1-121-estimate_repeated_reference_groups-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.2.1",
    "competencyId": "estimate_quantities_using_reference",
    "archetypeId": "estimate_repeated_reference_groups",
    "familyKey": "d3.d3_t1.estimate_quantities_using_reference",
    "representation": "visual_reference",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "estimate_groups"
    }
  },
  {
    "templateId": "D3-1-121-scale_reference_quantity-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.2.1",
    "competencyId": "estimate_quantities_using_reference",
    "archetypeId": "scale_reference_quantity",
    "familyKey": "d3.d3_t1.estimate_quantities_using_reference",
    "representation": "visual_reference",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "estimate_reference_scale"
    }
  },
  {
    "templateId": "D3-1-131-explain_nearest_thousand-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.3.1",
    "competencyId": "round_numbers_to_nearest_thousand",
    "archetypeId": "explain_nearest_thousand",
    "familyKey": "d3.d3_t1.round_numbers_to_nearest_thousand",
    "representation": "number_line",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "round_reason"
    }
  },
  {
    "templateId": "D3-1-131-round_number_symbolically-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.3.1",
    "competencyId": "round_numbers_to_nearest_thousand",
    "archetypeId": "round_number_symbolically",
    "familyKey": "d3.d3_t1.round_numbers_to_nearest_thousand",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "round_symbolic"
    }
  },
  {
    "templateId": "D3-1-131-round_on_number_line-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.3.1",
    "competencyId": "round_numbers_to_nearest_thousand",
    "archetypeId": "round_on_number_line",
    "familyKey": "d3.d3_t1.round_numbers_to_nearest_thousand",
    "representation": "number_line",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "round_number_line"
    }
  },
  {
    "templateId": "D3-1-141-identify_pattern_step-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.1",
    "competencyId": "recognize_number_patterns_by_place_value_steps",
    "archetypeId": "identify_pattern_step",
    "familyKey": "d3.d3_t1.recognize_number_patterns_by_place_value_steps",
    "representation": "sequence_step",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_step"
    }
  },
  {
    "templateId": "D3-1-141-predict_next_place_value_step-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.1",
    "competencyId": "recognize_number_patterns_by_place_value_steps",
    "archetypeId": "predict_next_place_value_step",
    "familyKey": "d3.d3_t1.recognize_number_patterns_by_place_value_steps",
    "representation": "sequence_prediction",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_next"
    }
  },
  {
    "templateId": "D3-1-141-recognize_descending_place_value_pattern-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.1",
    "competencyId": "recognize_number_patterns_by_place_value_steps",
    "archetypeId": "recognize_descending_place_value_pattern",
    "familyKey": "d3.d3_t1.recognize_number_patterns_by_place_value_steps",
    "representation": "descending_sequence",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_reverse"
    }
  },
  {
    "templateId": "D3-1-142-choose_pattern_rule-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.2",
    "competencyId": "complete_number_patterns",
    "archetypeId": "choose_pattern_rule",
    "familyKey": "d3.d3_t1.complete_number_patterns",
    "representation": "textual",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_rule"
    }
  },
  {
    "templateId": "D3-1-142-complete_missing_pattern_term-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.2",
    "competencyId": "complete_number_patterns",
    "archetypeId": "complete_missing_pattern_term",
    "familyKey": "d3.d3_t1.complete_number_patterns",
    "representation": "sequence",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_missing"
    }
  },
  {
    "templateId": "D3-1-142-find_incorrect_pattern_term-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T1",
    "standardId": "1.4.2",
    "competencyId": "complete_number_patterns",
    "archetypeId": "find_incorrect_pattern_term",
    "familyKey": "d3.d3_t1.complete_number_patterns",
    "representation": "sequence",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "place_value_confusion",
      "estimation_vs_exact",
      "rounding_midpoint",
      "pattern_step_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_error"
    }
  },
  {
    "templateId": "D3-4-411-add_multiple_money_values-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.1",
    "competencyId": "add_subtract_money_values",
    "archetypeId": "add_multiple_money_values",
    "familyKey": "d3.d3_t4.add_subtract_money_values",
    "representation": "money_items",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_add"
    }
  },
  {
    "templateId": "D3-4-411-compare_two_money_totals-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.1",
    "competencyId": "add_subtract_money_values",
    "archetypeId": "compare_two_money_totals",
    "familyKey": "d3.d3_t4.add_subtract_money_values",
    "representation": "money_receipt",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_compare"
    }
  },
  {
    "templateId": "D3-4-411-subtract_money_from_budget-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.1",
    "competencyId": "add_subtract_money_values",
    "archetypeId": "subtract_money_from_budget",
    "familyKey": "d3.d3_t4.add_subtract_money_values",
    "representation": "money_budget",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_subtract"
    }
  },
  {
    "templateId": "D3-4-412-identify_correct_mixed_money_result-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.2",
    "competencyId": "solve_mixed_addition_subtraction_money",
    "archetypeId": "identify_correct_mixed_money_result",
    "familyKey": "d3.d3_t4.solve_mixed_addition_subtraction_money",
    "representation": "textual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_mixed_error"
    }
  },
  {
    "templateId": "D3-4-412-purchase_then_find_change-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.2",
    "competencyId": "solve_mixed_addition_subtraction_money",
    "archetypeId": "purchase_then_find_change",
    "familyKey": "d3.d3_t4.solve_mixed_addition_subtraction_money",
    "representation": "money_items",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_mixed_change"
    }
  },
  {
    "templateId": "D3-4-412-track_budget_with_mixed_changes-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.1.2",
    "competencyId": "solve_mixed_addition_subtraction_money",
    "archetypeId": "track_budget_with_mixed_changes",
    "familyKey": "d3.d3_t4.solve_mixed_addition_subtraction_money",
    "representation": "money_budget",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_mixed_budget"
    }
  },
  {
    "templateId": "D3-4-421-divide_money_equally-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.2.1",
    "competencyId": "multiply_divide_money",
    "archetypeId": "divide_money_equally",
    "familyKey": "d3.d3_t4.multiply_divide_money",
    "representation": "money_share",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_divide"
    }
  },
  {
    "templateId": "D3-4-421-find_unit_price_from_total-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.2.1",
    "competencyId": "multiply_divide_money",
    "archetypeId": "find_unit_price_from_total",
    "familyKey": "d3.d3_t4.multiply_divide_money",
    "representation": "money_items",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_unit_price"
    }
  },
  {
    "templateId": "D3-4-421-multiply_equal_item_prices-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.2.1",
    "competencyId": "multiply_divide_money",
    "archetypeId": "multiply_equal_item_prices",
    "familyKey": "d3.d3_t4.multiply_divide_money",
    "representation": "money_items",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "money_multiply"
    }
  },
  {
    "templateId": "D3-4-431-country_to_currency-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.3.1",
    "competencyId": "identify_asean_currencies",
    "archetypeId": "country_to_currency",
    "familyKey": "d3.d3_t4.identify_asean_currencies",
    "representation": "currency_country_card",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "currency_country_to_name"
    }
  },
  {
    "templateId": "D3-4-431-currency_to_country-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.3.1",
    "competencyId": "identify_asean_currencies",
    "archetypeId": "currency_to_country",
    "familyKey": "d3.d3_t4.identify_asean_currencies",
    "representation": "currency_name_card",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "currency_name_to_country"
    }
  },
  {
    "templateId": "D3-4-431-match_currency_code_to_name-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.3.1",
    "competencyId": "identify_asean_currencies",
    "archetypeId": "match_currency_code_to_name",
    "familyKey": "d3.d3_t4.identify_asean_currencies",
    "representation": "currency_code_card",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "currency_code_match"
    }
  },
  {
    "templateId": "D3-4-441-choose_sensible_saving_decision-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.4.1",
    "competencyId": "distinguish_needs_and_wants_for_money_choices",
    "archetypeId": "choose_sensible_saving_decision",
    "familyKey": "d3.d3_t4.distinguish_needs_and_wants_for_money_choices",
    "representation": "money_budget",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "needs_saving_choice"
    }
  },
  {
    "templateId": "D3-4-441-explain_need_before_want-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.4.1",
    "competencyId": "distinguish_needs_and_wants_for_money_choices",
    "archetypeId": "explain_need_before_want",
    "familyKey": "d3.d3_t4.distinguish_needs_and_wants_for_money_choices",
    "representation": "contextual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "needs_priority_reason"
    }
  },
  {
    "templateId": "D3-4-441-identify_need_among_choices-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T4",
    "standardId": "4.4.1",
    "competencyId": "distinguish_needs_and_wants_for_money_choices",
    "archetypeId": "identify_need_among_choices",
    "familyKey": "d3.d3_t4.distinguish_needs_and_wants_for_money_choices",
    "representation": "needs_wants",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "money_operation_confusion",
      "money_unit_confusion",
      "currency_country_confusion",
      "need_want_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "needs_identify"
    }
  },
  {
    "templateId": "D3-8-811-compare_two_object_positions-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.1",
    "competencyId": "describe_relative_position_from_reference",
    "archetypeId": "compare_two_object_positions",
    "familyKey": "d3.d3_t8.describe_relative_position_from_reference",
    "representation": "reference_grid",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_relative_compare"
    }
  },
  {
    "templateId": "D3-8-811-describe_cardinal_relative_position-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.1",
    "competencyId": "describe_relative_position_from_reference",
    "archetypeId": "describe_cardinal_relative_position",
    "familyKey": "d3.d3_t8.describe_relative_position_from_reference",
    "representation": "relative_grid",
    "demand": "concept",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_relative_direction"
    }
  },
  {
    "templateId": "D3-8-811-describe_relative_distance-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.1",
    "competencyId": "describe_relative_position_from_reference",
    "archetypeId": "describe_relative_distance",
    "familyKey": "d3.d3_t8.describe_relative_position_from_reference",
    "representation": "distance_grid",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_relative_distance"
    }
  },
  {
    "templateId": "D3-8-812-identify_object_at_axis_intersection-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.2",
    "competencyId": "identify_object_using_horizontal_vertical_axes",
    "archetypeId": "identify_object_at_axis_intersection",
    "familyKey": "d3.d3_t8.identify_object_using_horizontal_vertical_axes",
    "representation": "axis_intersection_grid",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_identify_axes"
    }
  },
  {
    "templateId": "D3-8-812-identify_object_from_axis_clue-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.2",
    "competencyId": "identify_object_using_horizontal_vertical_axes",
    "archetypeId": "identify_object_from_axis_clue",
    "familyKey": "d3.d3_t8.identify_object_using_horizontal_vertical_axes",
    "representation": "axis_clue_grid",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_identify_clue"
    }
  },
  {
    "templateId": "D3-8-812-match_object_to_position_description-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.2",
    "competencyId": "identify_object_using_horizontal_vertical_axes",
    "archetypeId": "match_object_to_position_description",
    "familyKey": "d3.d3_t8.identify_object_using_horizontal_vertical_axes",
    "representation": "position_match_grid",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_match_description"
    }
  },
  {
    "templateId": "D3-8-813-choose_moves_to_target-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.3",
    "competencyId": "locate_position_on_horizontal_vertical_axes",
    "archetypeId": "choose_moves_to_target",
    "familyKey": "d3.d3_t8.locate_position_on_horizontal_vertical_axes",
    "representation": "movement_grid",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_moves_to_target"
    }
  },
  {
    "templateId": "D3-8-813-locate_after_movement_instruction-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.3",
    "competencyId": "locate_position_on_horizontal_vertical_axes",
    "archetypeId": "locate_after_movement_instruction",
    "familyKey": "d3.d3_t8.locate_position_on_horizontal_vertical_axes",
    "representation": "movement_trace_grid",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_follow_moves"
    }
  },
  {
    "templateId": "D3-8-813-read_horizontal_vertical_position-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T8",
    "standardId": "8.1.3",
    "competencyId": "locate_position_on_horizontal_vertical_axes",
    "archetypeId": "read_horizontal_vertical_position",
    "familyKey": "d3.d3_t8.locate_position_on_horizontal_vertical_axes",
    "representation": "coordinate_read_grid",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "horizontal_vertical_confusion",
      "reference_point_confusion",
      "direction_distance_confusion"
    ],
    "generator": "d3.fullKssr",
    "renderer": "d3full",
    "responseType": "mcq",
    "params": {
      "mode": "coord_read_position"
    }
  },
  {
    "templateId": "D3-T2-211-choose_operation-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.1",
    "competencyId": "solve_addition_subtraction_word_problems",
    "archetypeId": "choose_operation_from_context",
    "familyKey": "D3.T2:solve_addition_subtraction_word_problems:choose_operation_from_context",
    "representation": "contextual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "operation_selection"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_addition_subtraction_word_problems",
      "mode": "choose_operation"
    }
  },
  {
    "templateId": "D3-T2-211-context_result-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.1",
    "competencyId": "solve_addition_subtraction_word_problems",
    "archetypeId": "word_problem_result",
    "familyKey": "D3.T2:solve_addition_subtraction_word_problems:word_problem_result",
    "representation": "contextual",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "operation_selection"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_addition_subtraction_word_problems",
      "mode": "context_result"
    }
  },
  {
    "templateId": "D3-T2-211-missing_part_bar-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.1",
    "competencyId": "solve_addition_subtraction_word_problems",
    "archetypeId": "word_problem_missing_part",
    "familyKey": "D3.T2:solve_addition_subtraction_word_problems:word_problem_missing_part",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "part_whole_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_addition_subtraction_word_problems",
      "mode": "missing_part_bar"
    }
  },
  {
    "templateId": "D3-T2-212-add_then_subtract-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.2",
    "competencyId": "solve_mixed_addition_subtraction_problems",
    "archetypeId": "mixed_add_then_subtract",
    "familyKey": "D3.T2:solve_mixed_addition_subtraction_problems:mixed_add_then_subtract",
    "representation": "contextual",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_problems",
      "mode": "add_then_subtract"
    }
  },
  {
    "templateId": "D3-T2-212-choose_expression-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.2",
    "competencyId": "solve_mixed_addition_subtraction_problems",
    "archetypeId": "choose_expression_for_two_step",
    "familyKey": "D3.T2:solve_mixed_addition_subtraction_problems:choose_expression_for_two_step",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_problems",
      "mode": "choose_expression"
    }
  },
  {
    "templateId": "D3-T2-212-subtract_then_add-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.1.2",
    "competencyId": "solve_mixed_addition_subtraction_problems",
    "archetypeId": "mixed_subtract_then_add",
    "familyKey": "D3.T2:solve_mixed_addition_subtraction_problems:mixed_subtract_then_add",
    "representation": "contextual",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_problems",
      "mode": "subtract_then_add"
    }
  },
  {
    "templateId": "D3-T2-221-missing_factor-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.2.1",
    "competencyId": "multiply_divide_numbers_by_1digit_powers10",
    "archetypeId": "inverse_missing_factor",
    "familyKey": "D3.T2:multiply_divide_numbers_by_1digit_powers10:inverse_missing_factor",
    "representation": "grouping_array",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_numbers_by_1digit_powers10",
      "mode": "missing_factor"
    }
  },
  {
    "templateId": "D3-T2-221-one_digit-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.2.1",
    "competencyId": "multiply_divide_numbers_by_1digit_powers10",
    "archetypeId": "multiply_divide_one_digit",
    "familyKey": "D3.T2:multiply_divide_numbers_by_1digit_powers10:multiply_divide_one_digit",
    "representation": "grouping_array",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_numbers_by_1digit_powers10",
      "mode": "one_digit"
    }
  },
  {
    "templateId": "D3-T2-221-powers10-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T2",
    "standardId": "2.2.1",
    "competencyId": "multiply_divide_numbers_by_1digit_powers10",
    "archetypeId": "multiply_divide_powers10",
    "familyKey": "D3.T2:multiply_divide_numbers_by_1digit_powers10:multiply_divide_powers10",
    "representation": "place_value",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "zero_place_value"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_numbers_by_1digit_powers10",
      "mode": "powers10"
    }
  },
  {
    "templateId": "D3-T3-311-area_match-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.1",
    "competencyId": "identify_equivalent_fractions",
    "archetypeId": "equivalent_fraction_area",
    "familyKey": "D3.T3:identify_equivalent_fractions:equivalent_fraction_area",
    "representation": "fraction_area",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "visual_fraction_equivalence"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_equivalent_fractions",
      "mode": "area_match"
    }
  },
  {
    "templateId": "D3-T3-311-missing_number-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.1",
    "competencyId": "identify_equivalent_fractions",
    "archetypeId": "equivalent_fraction_missing_number",
    "familyKey": "D3.T3:identify_equivalent_fractions:equivalent_fraction_missing_number",
    "representation": "symbolic",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "scale_one_part_only"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_equivalent_fractions",
      "mode": "missing_number"
    }
  },
  {
    "templateId": "D3-T3-311-symbolic_match-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.1",
    "competencyId": "identify_equivalent_fractions",
    "archetypeId": "equivalent_fraction_symbolic",
    "familyKey": "D3.T3:identify_equivalent_fractions:equivalent_fraction_symbolic",
    "representation": "symbolic",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "scale_one_part_only"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_equivalent_fractions",
      "mode": "symbolic_match"
    }
  },
  {
    "templateId": "D3-T3-312-area_simplify-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.2",
    "competencyId": "simplify_proper_fractions",
    "archetypeId": "simplify_fraction_from_area",
    "familyKey": "D3.T3:simplify_proper_fractions:simplify_fraction_from_area",
    "representation": "fraction_area",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "visual_fraction_equivalence"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "simplify_proper_fractions",
      "mode": "area_simplify"
    }
  },
  {
    "templateId": "D3-T3-312-common_factor-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.2",
    "competencyId": "simplify_proper_fractions",
    "archetypeId": "identify_common_factor_for_simplification",
    "familyKey": "D3.T3:simplify_proper_fractions:identify_common_factor_for_simplification",
    "representation": "symbolic",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "wrong_common_factor"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "simplify_proper_fractions",
      "mode": "common_factor"
    }
  },
  {
    "templateId": "D3-T3-312-simplest_form-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.2",
    "competencyId": "simplify_proper_fractions",
    "archetypeId": "simplify_fraction_direct",
    "familyKey": "D3.T3:simplify_proper_fractions:simplify_fraction_direct",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "not_fully_simplified"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "simplify_proper_fractions",
      "mode": "simplest_form"
    }
  },
  {
    "templateId": "D3-T3-313-add_same_denominator-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.3",
    "competencyId": "add_subtract_proper_fractions",
    "archetypeId": "add_proper_fractions",
    "familyKey": "D3.T3:add_subtract_proper_fractions:add_proper_fractions",
    "representation": "fraction_area",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "add_denominators"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_proper_fractions",
      "mode": "add_same_denominator"
    }
  },
  {
    "templateId": "D3-T3-313-context_fraction-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.3",
    "competencyId": "add_subtract_proper_fractions",
    "archetypeId": "fraction_operation_context",
    "familyKey": "D3.T3:add_subtract_proper_fractions:fraction_operation_context",
    "representation": "fraction_area",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_selection",
      "add_denominators"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_proper_fractions",
      "mode": "context_fraction"
    }
  },
  {
    "templateId": "D3-T3-313-subtract_same_denominator-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.3",
    "competencyId": "add_subtract_proper_fractions",
    "archetypeId": "subtract_proper_fractions",
    "familyKey": "D3.T3:add_subtract_proper_fractions:subtract_proper_fractions",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "subtract_denominators"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_proper_fractions",
      "mode": "subtract_same_denominator"
    }
  },
  {
    "templateId": "D3-T3-314-improper_to_mixed-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.4",
    "competencyId": "identify_improper_fractions_and_mixed_numbers",
    "archetypeId": "convert_improper_to_mixed",
    "familyKey": "D3.T3:identify_improper_fractions_and_mixed_numbers:convert_improper_to_mixed",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "whole_remainder_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_improper_fractions_and_mixed_numbers",
      "mode": "improper_to_mixed"
    }
  },
  {
    "templateId": "D3-T3-314-mixed_to_improper-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.4",
    "competencyId": "identify_improper_fractions_and_mixed_numbers",
    "archetypeId": "convert_mixed_to_improper",
    "familyKey": "D3.T3:identify_improper_fractions_and_mixed_numbers:convert_mixed_to_improper",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "whole_remainder_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_improper_fractions_and_mixed_numbers",
      "mode": "mixed_to_improper"
    }
  },
  {
    "templateId": "D3-T3-314-picture_identify-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.4",
    "competencyId": "identify_improper_fractions_and_mixed_numbers",
    "archetypeId": "identify_mixed_number_from_picture",
    "familyKey": "D3.T3:identify_improper_fractions_and_mixed_numbers:identify_mixed_number_from_picture",
    "representation": "fraction_area",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "whole_remainder_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "identify_improper_fractions_and_mixed_numbers",
      "mode": "picture_identify"
    }
  },
  {
    "templateId": "D3-T3-315-hundred_grid-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.5",
    "competencyId": "convert_hundredths_fractions_to_decimals",
    "archetypeId": "hundred_grid_to_decimal",
    "familyKey": "D3.T3:convert_hundredths_fractions_to_decimals:hundred_grid_to_decimal",
    "representation": "hundred_grid",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "decimal_place_value"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hundredths_fractions_to_decimals",
      "mode": "hundred_grid"
    }
  },
  {
    "templateId": "D3-T3-315-hundredths_symbolic-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.5",
    "competencyId": "convert_hundredths_fractions_to_decimals",
    "archetypeId": "hundredths_to_decimal",
    "familyKey": "D3.T3:convert_hundredths_fractions_to_decimals:hundredths_to_decimal",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "decimal_place_value"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hundredths_fractions_to_decimals",
      "mode": "hundredths_symbolic"
    }
  },
  {
    "templateId": "D3-T3-315-place_value-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.1.5",
    "competencyId": "convert_hundredths_fractions_to_decimals",
    "archetypeId": "decimal_place_value_from_hundredths",
    "familyKey": "D3.T3:convert_hundredths_fractions_to_decimals:decimal_place_value_from_hundredths",
    "representation": "place_value",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "decimal_place_value"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hundredths_fractions_to_decimals",
      "mode": "place_value"
    }
  },
  {
    "templateId": "D3-T3-321-compare_pair-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.1",
    "competencyId": "compare_decimals_to_hundredths",
    "archetypeId": "compare_decimal_pair",
    "familyKey": "D3.T3:compare_decimals_to_hundredths:compare_decimal_pair",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "compare_decimal_digits"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "compare_decimals_to_hundredths",
      "mode": "compare_pair"
    }
  },
  {
    "templateId": "D3-T3-321-largest-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.1",
    "competencyId": "compare_decimals_to_hundredths",
    "archetypeId": "select_largest_decimal",
    "familyKey": "D3.T3:compare_decimals_to_hundredths:select_largest_decimal",
    "representation": "contextual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "compare_decimal_digits"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "compare_decimals_to_hundredths",
      "mode": "largest"
    }
  },
  {
    "templateId": "D3-T3-321-number_line-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.1",
    "competencyId": "compare_decimals_to_hundredths",
    "archetypeId": "compare_decimals_number_line",
    "familyKey": "D3.T3:compare_decimals_to_hundredths:compare_decimals_number_line",
    "representation": "number_line",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "compare_decimal_digits"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "compare_decimals_to_hundredths",
      "mode": "number_line"
    }
  },
  {
    "templateId": "D3-T3-322-add_decimals-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.2",
    "competencyId": "add_subtract_decimals_to_hundredths",
    "archetypeId": "add_decimals_hundredths",
    "familyKey": "D3.T3:add_subtract_decimals_to_hundredths:add_decimals_hundredths",
    "representation": "place_value",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "decimal_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_decimals_to_hundredths",
      "mode": "add_decimals"
    }
  },
  {
    "templateId": "D3-T3-322-missing_decimal-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.2",
    "competencyId": "add_subtract_decimals_to_hundredths",
    "archetypeId": "missing_addend_decimal",
    "familyKey": "D3.T3:add_subtract_decimals_to_hundredths:missing_addend_decimal",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "decimal_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_decimals_to_hundredths",
      "mode": "missing_decimal"
    }
  },
  {
    "templateId": "D3-T3-322-subtract_decimals-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.2.2",
    "competencyId": "add_subtract_decimals_to_hundredths",
    "archetypeId": "subtract_decimals_hundredths",
    "familyKey": "D3.T3:add_subtract_decimals_to_hundredths:subtract_decimals_hundredths",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "decimal_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_decimals_to_hundredths",
      "mode": "subtract_decimals"
    }
  },
  {
    "templateId": "D3-T3-331-grid_to_percent-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.1",
    "competencyId": "represent_percent_on_hundred_grid",
    "archetypeId": "hundred_grid_to_percent",
    "familyKey": "D3.T3:represent_percent_on_hundred_grid:hundred_grid_to_percent",
    "representation": "hundred_grid_read",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "percent_out_of_100"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "represent_percent_on_hundred_grid",
      "mode": "grid_to_percent"
    }
  },
  {
    "templateId": "D3-T3-331-percent_to_shaded-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.1",
    "competencyId": "represent_percent_on_hundred_grid",
    "archetypeId": "percent_to_shaded_count",
    "familyKey": "D3.T3:represent_percent_on_hundred_grid:percent_to_shaded_count",
    "representation": "hundred_grid_construct",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "percent_out_of_100"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "represent_percent_on_hundred_grid",
      "mode": "percent_to_shaded"
    }
  },
  {
    "templateId": "D3-T3-331-unshaded_percent-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.1",
    "competencyId": "represent_percent_on_hundred_grid",
    "archetypeId": "infer_unshaded_percent",
    "familyKey": "D3.T3:represent_percent_on_hundred_grid:infer_unshaded_percent",
    "representation": "hundred_grid_complement",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "complement_to_100"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "represent_percent_on_hundred_grid",
      "mode": "unshaded_percent"
    }
  },
  {
    "templateId": "D3-T3-332-number_to_percent-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.2",
    "competencyId": "read_write_percent_1_to_100",
    "archetypeId": "number_out_of_100_to_percent",
    "familyKey": "D3.T3:read_write_percent_1_to_100:number_out_of_100_to_percent",
    "representation": "hundred_grid",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "percent_out_of_100"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_write_percent_1_to_100",
      "mode": "number_to_percent"
    }
  },
  {
    "templateId": "D3-T3-332-symbol_to_words-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.2",
    "competencyId": "read_write_percent_1_to_100",
    "archetypeId": "percent_symbol_to_words",
    "familyKey": "D3.T3:read_write_percent_1_to_100:percent_symbol_to_words",
    "representation": "symbolic",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "percent_notation"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_write_percent_1_to_100",
      "mode": "symbol_to_words"
    }
  },
  {
    "templateId": "D3-T3-332-words_to_symbol-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.3.2",
    "competencyId": "read_write_percent_1_to_100",
    "archetypeId": "percent_words_to_symbol",
    "familyKey": "D3.T3:read_write_percent_1_to_100:percent_words_to_symbol",
    "representation": "textual",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "percent_notation"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_write_percent_1_to_100",
      "mode": "words_to_symbol"
    }
  },
  {
    "templateId": "D3-T3-341-find_mismatch-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.4.1",
    "competencyId": "relate_fractions_decimals_percent",
    "archetypeId": "find_non_equivalent_representation",
    "familyKey": "D3.T3:relate_fractions_decimals_percent:find_non_equivalent_representation",
    "representation": "cross_representation",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "cross_representation"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_fractions_decimals_percent",
      "mode": "find_mismatch"
    }
  },
  {
    "templateId": "D3-T3-341-grid_bridge-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.4.1",
    "competencyId": "relate_fractions_decimals_percent",
    "archetypeId": "hundred_grid_fraction_decimal_percent",
    "familyKey": "D3.T3:relate_fractions_decimals_percent:hundred_grid_fraction_decimal_percent",
    "representation": "hundred_grid",
    "demand": "transfer",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "cross_representation"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_fractions_decimals_percent",
      "mode": "grid_bridge"
    }
  },
  {
    "templateId": "D3-T3-341-match_triple-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T3",
    "standardId": "3.4.1",
    "competencyId": "relate_fractions_decimals_percent",
    "archetypeId": "match_fraction_decimal_percent",
    "familyKey": "D3.T3:relate_fractions_decimals_percent:match_fraction_decimal_percent",
    "representation": "cross_representation",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "cross_representation"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_fractions_decimals_percent",
      "mode": "match_triple"
    }
  },
  {
    "templateId": "D3-T5-511-analog_read-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.1",
    "competencyId": "read_record_time_of_activities",
    "archetypeId": "read_analogue_clock",
    "familyKey": "D3.T5:read_record_time_of_activities:read_analogue_clock",
    "representation": "clock",
    "demand": "foundation",
    "difficultyBand": 1,
    "misconceptionTargets": [
      "hour_minute_hand"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_record_time_of_activities",
      "mode": "analog_read"
    }
  },
  {
    "templateId": "D3-T5-511-digital_words-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.1",
    "competencyId": "read_record_time_of_activities",
    "archetypeId": "digital_time_to_words",
    "familyKey": "D3.T5:read_record_time_of_activities:digital_time_to_words",
    "representation": "textual",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "hour_minute_hand"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_record_time_of_activities",
      "mode": "digital_words"
    }
  },
  {
    "templateId": "D3-T5-511-schedule_activity-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.1",
    "competencyId": "read_record_time_of_activities",
    "archetypeId": "read_activity_schedule",
    "familyKey": "D3.T5:read_record_time_of_activities:read_activity_schedule",
    "representation": "timetable",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "schedule_lookup"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_record_time_of_activities",
      "mode": "schedule_activity"
    }
  },
  {
    "templateId": "D3-T5-512-hours_minutes-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.2",
    "competencyId": "convert_hours_minutes_seconds",
    "archetypeId": "convert_hours_to_minutes",
    "familyKey": "D3.T5:convert_hours_minutes_seconds:convert_hours_to_minutes",
    "representation": "unit_relation",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hours_minutes_seconds",
      "mode": "hours_minutes"
    }
  },
  {
    "templateId": "D3-T5-512-minutes_seconds-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.2",
    "competencyId": "convert_hours_minutes_seconds",
    "archetypeId": "convert_minutes_to_seconds",
    "familyKey": "D3.T5:convert_hours_minutes_seconds:convert_minutes_to_seconds",
    "representation": "unit_relation",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hours_minutes_seconds",
      "mode": "minutes_seconds"
    }
  },
  {
    "templateId": "D3-T5-512-mixed_time-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.1.2",
    "competencyId": "convert_hours_minutes_seconds",
    "archetypeId": "convert_minutes_to_hours_minutes",
    "familyKey": "D3.T5:convert_hours_minutes_seconds:convert_minutes_to_hours_minutes",
    "representation": "timeline",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "time_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_hours_minutes_seconds",
      "mode": "mixed_time"
    }
  },
  {
    "templateId": "D3-T5-521-add_durations-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.1",
    "competencyId": "add_subtract_time_values",
    "archetypeId": "add_time_values",
    "familyKey": "D3.T5:add_subtract_time_values:add_time_values",
    "representation": "timeline",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_regrouping"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_time_values",
      "mode": "add_durations"
    }
  },
  {
    "templateId": "D3-T5-521-difference_timeline-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.1",
    "competencyId": "add_subtract_time_values",
    "archetypeId": "find_time_difference",
    "familyKey": "D3.T5:add_subtract_time_values:find_time_difference",
    "representation": "timeline",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "elapsed_time"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_time_values",
      "mode": "difference_timeline"
    }
  },
  {
    "templateId": "D3-T5-521-subtract_durations-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.1",
    "competencyId": "add_subtract_time_values",
    "archetypeId": "subtract_time_values",
    "familyKey": "D3.T5:add_subtract_time_values:subtract_time_values",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_regrouping"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_time_values",
      "mode": "subtract_durations"
    }
  },
  {
    "templateId": "D3-T5-522-choose_time_expression-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.2",
    "competencyId": "solve_mixed_addition_subtraction_time",
    "archetypeId": "choose_expression_for_time_problem",
    "familyKey": "D3.T5:solve_mixed_addition_subtraction_time:choose_expression_for_time_problem",
    "representation": "timeline",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_time",
      "mode": "choose_time_expression"
    }
  },
  {
    "templateId": "D3-T5-522-duration_adjustment-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.2",
    "competencyId": "solve_mixed_addition_subtraction_time",
    "archetypeId": "mixed_time_adjustment",
    "familyKey": "D3.T5:solve_mixed_addition_subtraction_time:mixed_time_adjustment",
    "representation": "timeline",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_time",
      "mode": "duration_adjustment"
    }
  },
  {
    "templateId": "D3-T5-522-schedule_two_step-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.2.2",
    "competencyId": "solve_mixed_addition_subtraction_time",
    "archetypeId": "two_step_time_schedule",
    "familyKey": "D3.T5:solve_mixed_addition_subtraction_time:two_step_time_schedule",
    "representation": "timetable",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "operation_order"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "solve_mixed_addition_subtraction_time",
      "mode": "schedule_two_step"
    }
  },
  {
    "templateId": "D3-T5-531-missing_groups-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.3.1",
    "competencyId": "multiply_divide_time",
    "archetypeId": "inverse_time_groups",
    "familyKey": "D3.T5:multiply_divide_time:inverse_time_groups",
    "representation": "grouping_array",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_time",
      "mode": "missing_groups"
    }
  },
  {
    "templateId": "D3-T5-531-repeat_duration-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.3.1",
    "competencyId": "multiply_divide_time",
    "archetypeId": "multiply_time_duration",
    "familyKey": "D3.T5:multiply_divide_time:multiply_time_duration",
    "representation": "timeline",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_multiplication"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_time",
      "mode": "repeat_duration"
    }
  },
  {
    "templateId": "D3-T5-531-share_duration-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T5",
    "standardId": "5.3.1",
    "competencyId": "multiply_divide_time",
    "archetypeId": "divide_time_duration",
    "familyKey": "D3.T5:multiply_divide_time:divide_time_duration",
    "representation": "grouping_array",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "time_division"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_time",
      "mode": "share_duration"
    }
  },
  {
    "templateId": "D3-T6-611-cm_to_m_cm-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.1",
    "competencyId": "convert_metres_centimetres",
    "archetypeId": "centimetres_to_mixed_metres",
    "familyKey": "D3.T6:convert_metres_centimetres:centimetres_to_mixed_metres",
    "representation": "mixed_unit_length",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "length_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_metres_centimetres",
      "mode": "cm_to_m_cm"
    }
  },
  {
    "templateId": "D3-T6-611-equivalent_length-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.1",
    "competencyId": "convert_metres_centimetres",
    "archetypeId": "choose_equivalent_length",
    "familyKey": "D3.T6:convert_metres_centimetres:choose_equivalent_length",
    "representation": "length_equivalence",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "length_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_metres_centimetres",
      "mode": "equivalent_length"
    }
  },
  {
    "templateId": "D3-T6-611-m_to_cm-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.1",
    "competencyId": "convert_metres_centimetres",
    "archetypeId": "metres_to_centimetres",
    "familyKey": "D3.T6:convert_metres_centimetres:metres_to_centimetres",
    "representation": "unit_conversion_symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "length_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_metres_centimetres",
      "mode": "m_to_cm"
    }
  },
  {
    "templateId": "D3-T6-612-add_lengths-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.2",
    "competencyId": "add_subtract_lengths",
    "archetypeId": "add_length_values",
    "familyKey": "D3.T6:add_subtract_lengths:add_length_values",
    "representation": "ruler",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_lengths",
      "mode": "add_lengths"
    }
  },
  {
    "templateId": "D3-T6-612-missing_length-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.2",
    "competencyId": "add_subtract_lengths",
    "archetypeId": "find_missing_length",
    "familyKey": "D3.T6:add_subtract_lengths:find_missing_length",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "part_whole_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_lengths",
      "mode": "missing_length"
    }
  },
  {
    "templateId": "D3-T6-612-subtract_lengths-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.2",
    "competencyId": "add_subtract_lengths",
    "archetypeId": "subtract_length_values",
    "familyKey": "D3.T6:add_subtract_lengths:subtract_length_values",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_lengths",
      "mode": "subtract_lengths"
    }
  },
  {
    "templateId": "D3-T6-613-inverse_length-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.3",
    "competencyId": "multiply_divide_lengths",
    "archetypeId": "inverse_length_factor",
    "familyKey": "D3.T6:multiply_divide_lengths:inverse_length_factor",
    "representation": "ruler",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_lengths",
      "mode": "inverse_length"
    }
  },
  {
    "templateId": "D3-T6-613-repeat_length-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.3",
    "competencyId": "multiply_divide_lengths",
    "archetypeId": "multiply_length",
    "familyKey": "D3.T6:multiply_divide_lengths:multiply_length",
    "representation": "bar_model",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_lengths",
      "mode": "repeat_length"
    }
  },
  {
    "templateId": "D3-T6-613-share_length-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.1.3",
    "competencyId": "multiply_divide_lengths",
    "archetypeId": "divide_length",
    "familyKey": "D3.T6:multiply_divide_lengths:divide_length",
    "representation": "bar_model",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_lengths",
      "mode": "share_length"
    }
  },
  {
    "templateId": "D3-T6-621-equivalent_mass-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.1",
    "competencyId": "convert_kilograms_grams",
    "archetypeId": "choose_equivalent_mass",
    "familyKey": "D3.T6:convert_kilograms_grams:choose_equivalent_mass",
    "representation": "mass_equivalence",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "mass_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_kilograms_grams",
      "mode": "equivalent_mass"
    }
  },
  {
    "templateId": "D3-T6-621-g_to_kg_g-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.1",
    "competencyId": "convert_kilograms_grams",
    "archetypeId": "grams_to_mixed_kilograms",
    "familyKey": "D3.T6:convert_kilograms_grams:grams_to_mixed_kilograms",
    "representation": "mixed_unit_mass",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "mass_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_kilograms_grams",
      "mode": "g_to_kg_g"
    }
  },
  {
    "templateId": "D3-T6-621-kg_to_g-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.1",
    "competencyId": "convert_kilograms_grams",
    "archetypeId": "kilograms_to_grams",
    "familyKey": "D3.T6:convert_kilograms_grams:kilograms_to_grams",
    "representation": "unit_conversion_symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "mass_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_kilograms_grams",
      "mode": "kg_to_g"
    }
  },
  {
    "templateId": "D3-T6-622-add_masses-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.2",
    "competencyId": "add_subtract_masses",
    "archetypeId": "add_mass_values",
    "familyKey": "D3.T6:add_subtract_masses:add_mass_values",
    "representation": "scale",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_masses",
      "mode": "add_masses"
    }
  },
  {
    "templateId": "D3-T6-622-missing_mass-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.2",
    "competencyId": "add_subtract_masses",
    "archetypeId": "find_missing_mass",
    "familyKey": "D3.T6:add_subtract_masses:find_missing_mass",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "part_whole_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_masses",
      "mode": "missing_mass"
    }
  },
  {
    "templateId": "D3-T6-622-subtract_masses-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.2",
    "competencyId": "add_subtract_masses",
    "archetypeId": "subtract_mass_values",
    "familyKey": "D3.T6:add_subtract_masses:subtract_mass_values",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_masses",
      "mode": "subtract_masses"
    }
  },
  {
    "templateId": "D3-T6-623-inverse_mass-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.3",
    "competencyId": "multiply_divide_masses",
    "archetypeId": "inverse_mass_factor",
    "familyKey": "D3.T6:multiply_divide_masses:inverse_mass_factor",
    "representation": "scale",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_masses",
      "mode": "inverse_mass"
    }
  },
  {
    "templateId": "D3-T6-623-repeat_mass-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.3",
    "competencyId": "multiply_divide_masses",
    "archetypeId": "multiply_mass",
    "familyKey": "D3.T6:multiply_divide_masses:multiply_mass",
    "representation": "grouping_array",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_masses",
      "mode": "repeat_mass"
    }
  },
  {
    "templateId": "D3-T6-623-share_mass-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.2.3",
    "competencyId": "multiply_divide_masses",
    "archetypeId": "divide_mass",
    "familyKey": "D3.T6:multiply_divide_masses:divide_mass",
    "representation": "grouping_array",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_masses",
      "mode": "share_mass"
    }
  },
  {
    "templateId": "D3-T6-631-equivalent_volume-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.1",
    "competencyId": "convert_litres_millilitres",
    "archetypeId": "choose_equivalent_volume",
    "familyKey": "D3.T6:convert_litres_millilitres:choose_equivalent_volume",
    "representation": "volume_equivalence",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "volume_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_litres_millilitres",
      "mode": "equivalent_volume"
    }
  },
  {
    "templateId": "D3-T6-631-l_to_ml-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.1",
    "competencyId": "convert_litres_millilitres",
    "archetypeId": "litres_to_millilitres",
    "familyKey": "D3.T6:convert_litres_millilitres:litres_to_millilitres",
    "representation": "unit_conversion_symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "volume_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_litres_millilitres",
      "mode": "l_to_ml"
    }
  },
  {
    "templateId": "D3-T6-631-ml_to_l_ml-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.1",
    "competencyId": "convert_litres_millilitres",
    "archetypeId": "millilitres_to_mixed_litres",
    "familyKey": "D3.T6:convert_litres_millilitres:millilitres_to_mixed_litres",
    "representation": "mixed_unit_volume",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "volume_unit_conversion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "convert_litres_millilitres",
      "mode": "ml_to_l_ml"
    }
  },
  {
    "templateId": "D3-T6-632-add_volumes-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.2",
    "competencyId": "add_subtract_liquid_volumes",
    "archetypeId": "add_liquid_volumes",
    "familyKey": "D3.T6:add_subtract_liquid_volumes:add_liquid_volumes",
    "representation": "container",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_liquid_volumes",
      "mode": "add_volumes"
    }
  },
  {
    "templateId": "D3-T6-632-missing_volume-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.2",
    "competencyId": "add_subtract_liquid_volumes",
    "archetypeId": "find_missing_liquid_volume",
    "familyKey": "D3.T6:add_subtract_liquid_volumes:find_missing_liquid_volume",
    "representation": "bar_model",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "part_whole_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_liquid_volumes",
      "mode": "missing_volume"
    }
  },
  {
    "templateId": "D3-T6-632-subtract_volumes-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.2",
    "competencyId": "add_subtract_liquid_volumes",
    "archetypeId": "subtract_liquid_volumes",
    "familyKey": "D3.T6:add_subtract_liquid_volumes:subtract_liquid_volumes",
    "representation": "symbolic",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "unit_alignment"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "add_subtract_liquid_volumes",
      "mode": "subtract_volumes"
    }
  },
  {
    "templateId": "D3-T6-633-inverse_volume-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.3",
    "competencyId": "multiply_divide_liquid_volumes",
    "archetypeId": "inverse_liquid_volume_factor",
    "familyKey": "D3.T6:multiply_divide_liquid_volumes:inverse_liquid_volume_factor",
    "representation": "grouping_array",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_liquid_volumes",
      "mode": "inverse_volume"
    }
  },
  {
    "templateId": "D3-T6-633-repeat_volume-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.3",
    "competencyId": "multiply_divide_liquid_volumes",
    "archetypeId": "multiply_liquid_volume",
    "familyKey": "D3.T6:multiply_divide_liquid_volumes:multiply_liquid_volume",
    "representation": "container",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_liquid_volumes",
      "mode": "repeat_volume"
    }
  },
  {
    "templateId": "D3-T6-633-share_volume-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T6",
    "standardId": "6.3.3",
    "competencyId": "multiply_divide_liquid_volumes",
    "archetypeId": "divide_liquid_volume",
    "familyKey": "D3.T6:multiply_divide_liquid_volumes:divide_liquid_volume",
    "representation": "container",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "multiply_divide_inverse"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "multiply_divide_liquid_volumes",
      "mode": "share_volume"
    }
  },
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
    "templateId": "D3-T7-712-prism-feature-statement-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.2",
    "competencyId": "describe_prism_features",
    "archetypeId": "prism_feature_statement",
    "familyKey": "D3.T7.7.1.2.describe_prism_features.feature_statement",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "base_count_confusion",
      "base_shape_confusion",
      "prism_vs_non_prism"
    ],
    "generator": "geometry.prismKssrDiversity",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "feature_statement"
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
    "templateId": "D3-T7-713-prism-why-not-prism-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "archetypeId": "explain_why_not_prism",
    "familyKey": "D3.T7.7.1.3.classify_prism_vs_non_prism.why_not_prism",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "prism_vs_non_prism",
      "base_shape_confusion"
    ],
    "generator": "geometry.prismKssrDiversity",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "why_not_prism"
    }
  },
  {
    "templateId": "D3-T7-713-prism-why-prism-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.1.3",
    "competencyId": "classify_prism_vs_non_prism",
    "archetypeId": "explain_why_prism",
    "familyKey": "D3.T7.7.1.3.classify_prism_vs_non_prism.why_prism",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "prism_vs_non_prism"
    ],
    "generator": "geometry.prismKssrDiversity",
    "renderer": "geometry",
    "responseType": "mcq",
    "params": {
      "mode": "why_prism"
    }
  },
  {
    "templateId": "D3-T7-721-polygon-relative-clue-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "archetypeId": "infer_polygon_from_relative_clue",
    "familyKey": "D3.T7.7.2.1.identify_regular_polygon.relative_clue",
    "representation": "text",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "polygon_name_side_count_confusion"
    ],
    "generator": "geometry.polygonKssrDiversity",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "relative_clue"
    }
  },
  {
    "templateId": "D3-T7-721-polygon-why-regular-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.1",
    "competencyId": "identify_regular_polygon",
    "archetypeId": "explain_regular_polygon",
    "familyKey": "D3.T7.7.2.1.identify_regular_polygon.why_regular",
    "representation": "visual",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "regularity_rule_confusion",
      "polygon_name_side_count_confusion"
    ],
    "generator": "geometry.polygonKssrDiversity",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "why_regular"
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
    "templateId": "D3-T7-722-pattern-position-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.2.2",
    "competencyId": "create_regular_polygon_pattern",
    "archetypeId": "find_polygon_at_pattern_position",
    "familyKey": "D3.T7.7.2.2.create_regular_polygon_pattern.position",
    "representation": "visual",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "pattern_position_confusion",
      "pattern_unit_confusion"
    ],
    "generator": "geometry.polygonKssrDiversity",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "pattern_position"
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
    "templateId": "D3-T7-731-symmetry-fold-card-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "archetypeId": "choose_fold_line_for_symmetry",
    "familyKey": "D3.T7.7.3.1.identify_and_draw_symmetry_axis.fold_card",
    "representation": "visual",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "symmetry_axis_orientation_confusion"
    ],
    "generator": "geometry.symmetryKssrDiversity",
    "renderer": "geometry2d",
    "responseType": "mcq",
    "params": {
      "mode": "fold_card"
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
  },
  {
    "templateId": "D3-T7-731-symmetry-shape-from-count-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T7",
    "standardId": "7.3.1",
    "competencyId": "identify_and_draw_symmetry_axis",
    "archetypeId": "choose_shape_from_axis_count",
    "familyKey": "D3.T7.7.3.1.identify_and_draw_symmetry_axis.shape_from_count",
    "representation": "text",
    "demand": "reasoning",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "symmetry_axis_count_confusion"
    ],
    "generator": "geometry.symmetryKssrDiversity",
    "renderer": null,
    "responseType": "mcq",
    "params": {
      "mode": "shape_from_axis_count"
    }
  },
  {
    "templateId": "D3-T9-911-classify_list-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.1.1",
    "competencyId": "collect_classify_organize_data",
    "archetypeId": "classify_and_count_items",
    "familyKey": "D3.T9:collect_classify_organize_data:classify_and_count_items",
    "representation": "classification",
    "demand": "application",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "classification_rule"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "collect_classify_organize_data",
      "mode": "classify_list"
    }
  },
  {
    "templateId": "D3-T9-911-table_statement-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.1.1",
    "competencyId": "collect_classify_organize_data",
    "archetypeId": "interpret_organized_table",
    "familyKey": "D3.T9:collect_classify_organize_data:interpret_organized_table",
    "representation": "table",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "table_comparison"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "collect_classify_organize_data",
      "mode": "table_statement"
    }
  },
  {
    "templateId": "D3-T9-911-tally_count-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.1.1",
    "competencyId": "collect_classify_organize_data",
    "archetypeId": "count_from_tally",
    "familyKey": "D3.T9:collect_classify_organize_data:count_from_tally",
    "representation": "table",
    "demand": "procedure",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "tally_misread"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "collect_classify_organize_data",
      "mode": "tally_count"
    }
  },
  {
    "templateId": "D3-T9-921-category_count-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.1",
    "competencyId": "read_interpret_pie_chart",
    "archetypeId": "derive_count_from_pie",
    "familyKey": "D3.T9:read_interpret_pie_chart:derive_count_from_pie",
    "representation": "pie_chart_fraction_count",
    "demand": "application",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "part_whole_confusion"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_interpret_pie_chart",
      "mode": "category_count"
    }
  },
  {
    "templateId": "D3-T9-921-difference_categories-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.1",
    "competencyId": "read_interpret_pie_chart",
    "archetypeId": "compare_pie_categories",
    "familyKey": "D3.T9:read_interpret_pie_chart:compare_pie_categories",
    "representation": "pie_chart_difference",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "pie_sector_size"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_interpret_pie_chart",
      "mode": "difference_categories"
    }
  },
  {
    "templateId": "D3-T9-921-largest_sector-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.1",
    "competencyId": "read_interpret_pie_chart",
    "archetypeId": "identify_largest_pie_category",
    "familyKey": "D3.T9:read_interpret_pie_chart:identify_largest_pie_category",
    "representation": "pie_chart_category_compare",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "pie_sector_size"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "read_interpret_pie_chart",
      "mode": "largest_sector"
    }
  },
  {
    "templateId": "D3-T9-922-bar_to_pie-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.2",
    "competencyId": "relate_pictograph_bar_chart_pie_chart",
    "archetypeId": "relate_bar_to_pie",
    "familyKey": "D3.T9:relate_pictograph_bar_chart_pie_chart:relate_bar_to_pie",
    "representation": "bar_chart",
    "demand": "reasoning",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "representation_mapping"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_pictograph_bar_chart_pie_chart",
      "mode": "bar_to_pie"
    }
  },
  {
    "templateId": "D3-T9-922-pictograph_to_bar-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.2",
    "competencyId": "relate_pictograph_bar_chart_pie_chart",
    "archetypeId": "relate_pictograph_to_bar",
    "familyKey": "D3.T9:relate_pictograph_bar_chart_pie_chart:relate_pictograph_to_bar",
    "representation": "pictograph",
    "demand": "concept",
    "difficultyBand": 2,
    "misconceptionTargets": [
      "representation_mapping"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_pictograph_bar_chart_pie_chart",
      "mode": "pictograph_to_bar"
    }
  },
  {
    "templateId": "D3-T9-922-same_data_statement-v1",
    "curriculumVersion": "KSSR-E3-2024",
    "grade": 3,
    "topicId": "D3.T9",
    "standardId": "9.2.2",
    "competencyId": "relate_pictograph_bar_chart_pie_chart",
    "archetypeId": "compare_chart_representations",
    "familyKey": "D3.T9:relate_pictograph_bar_chart_pie_chart:compare_chart_representations",
    "representation": "multi_chart",
    "demand": "transfer",
    "difficultyBand": 3,
    "misconceptionTargets": [
      "representation_mapping"
    ],
    "generator": "d3.p0Kssr",
    "renderer": "d3p0",
    "responseType": "mcq",
    "params": {
      "competencyId": "relate_pictograph_bar_chart_pie_chart",
      "mode": "same_data_statement"
    }
  }
];
  var BUILD_MANIFEST = {
  "curriculumCount": 50,
  "templateCount": 158,
  "generatorFiles": [
    "generators/d3/full-kssr.js",
    "generators/d3/p0-kssr.js",
    "generators/geometry/kssr-diversity.js",
    "generators/geometry/polygon-symmetry.js",
    "generators/geometry/prism.js"
  ],
  "rendererFiles": [
    "renderers/d3/full-kssr.js",
    "renderers/d3/p0-kssr.js",
    "renderers/geometry/polygon-symmetry.js",
    "renderers/geometry/prism.js"
  ]
};
  var SOURCE_HASH = "7eba20657bd4f76b70b72615cf9749704d80f320228fcfeb49af50e2f0c2a490";

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

  // ---- generators/d3/full-kssr.js ----
  (function (registerGenerator) {
// questions/v2/generators/d3/full-kssr.js
// Phase 3A-1 FULL: Darjah 3 remaining T1/T4/T8 authored content.
// Pure authored source. No Node/browser globals.
(function(){
'use strict';

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}
function shuffle(rng,a){var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=o[i];o[i]=o[j];o[j]=t;}return o;}
function choice(id,label,tag){return{id:String(id),labelMs:String(label),misconceptionTag:tag||null};}
function fp(mode,answer,parts){return mode+'::'+String(answer)+'::'+(parts||[]).join('|');}
function uniqNums(base,cands,min,max){
  var seen=Object.create(null),out=[];
  function add(n){n=Math.round(n);if(n<min||n>max||n===base||seen[n])return;seen[n]=1;out.push(n);}
  for(var i=0;i<cands.length;i++)add(cands[i]);
  for(var d=1;out.length<3&&d<5000;d++){add(base+d);add(base-d);}
  return out.slice(0,3);
}
function numChoices(base,cands,tag,fmt){
  var wrong=uniqNums(base,cands,-999999,999999);
  return wrong.map(function(n){return choice(n,fmt?fmt(n):String(n),tag);});
}
function money(cents){return 'RM'+(cents/100).toFixed(2);}
function moneyWrong(base,cands,tag){return numChoices(base,cands,tag,money);}
function malayUnder100(n){
  var one=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
  if(n<10)return one[n];
  if(n===10)return 'sepuluh';
  if(n===11)return 'sebelas';
  if(n<20)return one[n-10]+' belas';
  var t=Math.floor(n/10),r=n%10;return one[t]+' puluh'+(r?' '+one[r]:'');
}
function numberToMalay(n){
  n=Math.floor(n);
  if(n<100)return malayUnder100(n);
  if(n<1000){var h=Math.floor(n/100),r=n%100;return (h===1?'seratus':['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'][h]+' ratus')+(r?' '+malayUnder100(r):'');}
  var th=Math.floor(n/1000),rem=n%1000,head=th===1?'seribu':numberToMalay(th)+' ribu';
  return head+(rem?' '+numberToMalay(rem):'');
}
function expanded(n){
  var s=String(n).padStart(4,'0'),p=[1000,100,10,1],a=[];
  for(var i=0;i<4;i++){var d=Number(s[i]);if(d)a.push(String(d*p[i]));}
  return a.join(' + ');
}
function pvVisual(n){
  var s=String(n).padStart(4,'0');
  return {kind:'place_value_table',digits:[Number(s[0]),Number(s[1]),Number(s[2]),Number(s[3])]};
}
function seqVisual(seq,missing){return{kind:'number_sequence',sequence:seq,missingIndex:missing==null?-1:missing};}
function nearest1000(n){return Math.round(n/1000)*1000;}
function ensureRoundN(rng){
  var n=ri(rng,1000,9999);
  if(n%1000===500)n+=17;
  if(n>9999)n-=37;
  return n;
}
function objs(){return ['Buku','Bola','Pokok','Rumah'];}
function gridObjects(rng){
  var names=shuffle(rng,objs()),used=Object.create(null),out=[];
  for(var i=0;i<4;i++){
    var x,y,key;
    do{x=ri(rng,1,5);y=ri(rng,1,5);key=x+','+y;}while(used[key]);
    used[key]=1;out.push({name:names[i],x:x,y:y});
  }
  return out;
}
function coordLabel(x,y){return 'Mengufuk '+x+', mencancang '+y;}
function dirText(dx,dy){
  if(dx>0&&dy===0)return Math.abs(dx)+' petak ke kanan';
  if(dx<0&&dy===0)return Math.abs(dx)+' petak ke kiri';
  if(dy>0&&dx===0)return Math.abs(dy)+' petak ke atas';
  if(dy<0&&dx===0)return Math.abs(dy)+' petak ke bawah';
  return '';
}
var ASEAN=[
 {country:'Malaysia',currency:'Ringgit',code:'MYR'},
 {country:'Singapura',currency:'Dolar Singapura',code:'SGD'},
 {country:'Brunei',currency:'Dolar Brunei',code:'BND'},
 {country:'Indonesia',currency:'Rupiah',code:'IDR'},
 {country:'Thailand',currency:'Baht',code:'THB'},
 {country:'Filipina',currency:'Peso Filipina',code:'PHP'},
 {country:'Vietnam',currency:'Dong',code:'VND'},
 {country:'Laos',currency:'Kip',code:'LAK'},
 {country:'Kemboja',currency:'Riel',code:'KHR'},
 {country:'Myanmar',currency:'Kyat',code:'MMK'}
];

registerGenerator('d3.fullKssr',function(params,rng){
  var m=params&&params.mode||'';

  // T1 — Nombor
  if(m==='represent_words'){
    var n=ri(rng,100,9999),ans=choice(n,String(n));
    var dis=numChoices(n,[n+10,n-10,n+100,n-100,Number(String(n).split('').reverse().join(''))],'place_value_confusion');
    return{value:{promptMs:'Nombor "'+numberToMalay(n)+'" ditulis dalam angka sebagai?',answer:ans,visual:null},distractors:shuffle(rng,dis),meta:{archetype:'number_words_to_numeral',hintMs:'Baca nilai ribu, ratus, puluh dan sa satu demi satu.',fingerprint:fp(m,n,[numberToMalay(n)])}};
  }
  if(m==='place_value_model'){
    var n2=ri(rng,1000,9999),ans2=choice(n2,String(n2));
    var s=String(n2),alt=Number(s[0]+s[2]+s[1]+s[3]);
    var dis2=numChoices(n2,[alt,n2+100,n2-100,n2+10],'place_value_confusion');
    return{value:{promptMs:'Nombor manakah diwakili oleh jadual nilai tempat ini?',answer:ans2,visual:pvVisual(n2)},distractors:shuffle(rng,dis2),meta:{archetype:'place_value_model_to_number',hintMs:'Gabungkan digit mengikut tempat ribu, ratus, puluh dan sa.',fingerprint:fp(m,n2,[s])}};
  }
  if(m==='number_to_expanded'){
    var n3=ri(rng,1000,9999),e=expanded(n3),ans3=choice(e,e);
    var wrong=[expanded(Math.min(9999,n3+100)),expanded(Math.max(1000,n3-100)),expanded(Math.min(9999,n3+10))];
    var seen=Object.create(null),ds=[];
    for(var wi=0;wi<wrong.length;wi++){if(wrong[wi]!==e&&!seen[wrong[wi]]){seen[wrong[wi]]=1;ds.push(choice('w'+wi,wrong[wi],'place_value_confusion'));}}
    while(ds.length<3){var q=n3+(ds.length+1);var qe=expanded(q);if(qe!==e&&!seen[qe]){seen[qe]=1;ds.push(choice('x'+ds.length,qe,'place_value_confusion'));}}
    return{value:{promptMs:'Bentuk cerakin yang betul bagi '+n3+' ialah?',answer:ans3,visual:null},distractors:shuffle(rng,ds),meta:{archetype:'number_to_expanded_form',hintMs:'Cerakinkan nombor mengikut nilai setiap digit.',fingerprint:fp(m,e,[n3])}};
  }
  if(m==='compare_pair'){
    var a=ri(rng,1000,9999),b=ri(rng,1000,9999);if(a===b)b+=1;
    var big=Math.max(a,b),small=Math.min(a,b);
    var ans4=choice('correct',big+' lebih besar daripada '+small+'.');
    var ds4=[
      choice('reverse',small+' lebih besar daripada '+big+'.','place_value_confusion'),
      choice('equal',a+' sama dengan '+b+'.','place_value_confusion'),
      choice('digits','Nombor yang mempunyai digit sa lebih besar sentiasa lebih besar.','place_value_confusion')
    ];
    return{value:{promptMs:'Pernyataan manakah yang betul?',answer:ans4,visual:{kind:'compare_numbers',numbers:[a,b]}},distractors:shuffle(rng,ds4),meta:{archetype:'compare_number_statements',hintMs:'Bandingkan digit dari nilai tempat terbesar dahulu.',fingerprint:fp(m,big,[small])}};
  }
  if(m==='order_three'){
    var ar=[ri(rng,1000,9999),ri(rng,1000,9999),ri(rng,1000,9999)];
    while(new Set(ar).size<3)ar=[ri(rng,1000,9999),ri(rng,1000,9999),ri(rng,1000,9999)];
    var asc=ar.slice().sort(function(x,y){return x-y;}),ans5=choice('asc',asc.join(', '));
    var perms=[
      asc.slice().reverse(),
      [asc[0],asc[2],asc[1]],
      [asc[1],asc[0],asc[2]]
    ];
    var ds5=perms.map(function(p,i){return choice('p'+i,p.join(', '),'place_value_confusion');});
    return{value:{promptMs:'Susunan manakah daripada yang paling kecil kepada paling besar?',answer:ans5,visual:{kind:'compare_numbers',numbers:ar}},distractors:shuffle(rng,ds5),meta:{archetype:'order_three_numbers',hintMs:'Bandingkan ribu dahulu, kemudian ratus, puluh dan sa.',fingerprint:fp(m,asc.join('-'),ar)}};
  }
  if(m==='compare_reason'){
    var x=ri(rng,2000,8999),y=x;
    var xs=String(x).padStart(4,'0').split('');
    var pos=pick(rng,[0,1,2]),delta=ri(rng,1,Math.min(3,9-Number(xs[pos])));
    var ys=xs.slice();ys[pos]=String(Number(ys[pos])+delta);y=Number(ys.join(''));
    var big2=Math.max(x,y),small2=Math.min(x,y),place=['ribu','ratus','puluh','sa'][pos];
    var ans6=choice('reason',big2+' lebih besar kerana digit pada tempat '+place+' ialah lebih besar apabila tempat di sebelah kirinya sama.');
    var ds6=[
      choice('ones','Bandingkan digit sa sahaja untuk menentukan nombor lebih besar.','place_value_confusion'),
      choice('digitsum','Nombor dengan jumlah digit lebih besar mesti lebih besar.','place_value_confusion'),
      choice('length','Kedua-duanya empat digit, jadi nilainya sama.','place_value_confusion')
    ];
    return{value:{promptMs:'Mengapakah '+big2+' lebih besar daripada '+small2+'?',answer:ans6,visual:{kind:'compare_numbers',numbers:[big2,small2]}},distractors:shuffle(rng,ds6),meta:{archetype:'explain_comparison_by_place_value',hintMs:'Cari nilai tempat pertama yang berbeza dari kiri.',fingerprint:fp(m,big2,[small2,place])}};
  }
  if(m==='estimate_groups'||m==='estimate_reference_scale'){
    var ref=pick(rng,[10,20,25,50]),mult=ri(rng,2,5),est=ref*mult;
    var ans7=choice(est,String(est));
    var ds7=numChoices(est,[ref*(mult-1),ref*(mult+1),ref+mult,ref*mult+10],'estimation_vs_exact');
    return{value:{promptMs:m==='estimate_groups'?'Satu kumpulan rujukan mewakili kira-kira '+ref+' objek. Anggarkan jumlah bagi '+mult+' kumpulan yang sama.':'Jika 1 kumpulan rujukan dianggarkan '+ref+' objek, anggaran bagi '+mult+' kumpulan ialah?',answer:ans7,visual:{kind:'estimate_groups',reference:ref,groups:mult}},distractors:shuffle(rng,ds7),meta:{archetype:m==='estimate_groups'?'estimate_repeated_reference_groups':'scale_reference_quantity',hintMs:'Gunakan kuantiti rujukan dan gandakan mengikut bilangan kumpulan.',fingerprint:fp(m,est,[ref,mult])}};
  }
  if(m==='estimate_context'){
    var per=pick(rng,[20,25,50,100]),count=ri(rng,2,5),est2=per*count;
    var ans8=choice(est2,'Kira-kira '+est2);
    var ds8=numChoices(est2,[est2-per,est2+per,per+count],'estimation_vs_exact',function(n){return 'Kira-kira '+n;});
    return{value:{promptMs:'Satu bekas memuatkan kira-kira '+per+' guli. Ada '+count+' bekas yang hampir sama penuh. Anggaran jumlah guli ialah?',answer:ans8,visual:null},distractors:shuffle(rng,ds8),meta:{archetype:'choose_reasonable_context_estimate',hintMs:'Anggaran tidak perlu kira satu demi satu; gunakan nilai rujukan setiap bekas.',fingerprint:fp(m,est2,[per,count])}};
  }
  if(m==='round_symbolic'||m==='round_number_line'||m==='round_reason'){
    var rn=ensureRoundN(rng),rto=nearest1000(rn),lo=Math.floor(rn/1000)*1000,hi=lo+1000;
    if(hi>10000){hi=10000;}
    var ans9=m==='round_reason'?choice('reason',rn+' lebih hampir kepada '+rto+' berbanding ribu yang satu lagi.'):choice(rto,String(rto));
    var ds9;
    if(m==='round_reason'){
      var other=rto===lo?hi:lo;
      ds9=[
        choice('other',rn+' lebih hampir kepada '+other+'.','rounding_midpoint'),
        choice('hundred','Lihat digit sa sahaja untuk membundar kepada ribu terdekat.','rounding_midpoint'),
        choice('alwaysup','Semua nombor empat digit mesti dibundar naik.','rounding_midpoint')
      ];
    }else{
      ds9=numChoices(rto,[lo,hi,rto+1000,rto-1000],'rounding_midpoint');
    }
    return{value:{promptMs:m==='round_reason'?'Mengapakah '+rn+' dibundarkan kepada '+rto+'?':'Bundarkan '+rn+' kepada ribu terdekat.',answer:ans9,visual:m==='round_symbolic'?null:{kind:'number_line',min:lo,max:hi,value:rn}},distractors:shuffle(rng,ds9),meta:{archetype:m==='round_symbolic'?'round_number_symbolically':m==='round_number_line'?'round_on_number_line':'explain_nearest_thousand',hintMs:'Bandingkan jarak nombor kepada dua ribu yang berjiran.',fingerprint:fp(m,rto,[rn,lo,hi])}};
  }
  if(m==='pattern_step'||m==='pattern_next'||m==='pattern_reverse'){
    var step=pick(rng,[1,10,100,1000]),dir=m==='pattern_reverse'?-1:1,start=dir>0?ri(rng,1000,Math.max(1000,9999-step*4)):ri(rng,1000+step*4,9999);
    var seq=[];for(var pi=0;pi<4;pi++)seq.push(start+dir*step*pi);
    if(m==='pattern_step'){
      var label=(dir>0?'Tambah ':'Tolak ')+step,ans10=choice(label,label);
      var opts=[1,10,100,1000].filter(function(z){return z!==step;}).slice(0,3).map(function(z){return choice(z,(dir>0?'Tambah ':'Tolak ')+z,'pattern_step_confusion');});
      return{value:{promptMs:'Apakah pola nombor bagi urutan ini?',answer:ans10,visual:seqVisual(seq)},distractors:shuffle(rng,opts),meta:{archetype:'identify_pattern_step',hintMs:'Cari beza antara dua nombor yang bersebelahan.',fingerprint:fp(m,label,seq)}};
    }
    var nxt=start+dir*step*4,ans11=choice(nxt,String(nxt)),ds11=numChoices(nxt,[nxt+step,nxt-step,nxt+dir*10,nxt-dir*10],'pattern_step_confusion');
    return{value:{promptMs:m==='pattern_reverse'?'Corak nombor ini menurun. Apakah nombor seterusnya?':'Apakah nombor seterusnya dalam pola ini?',answer:ans11,visual:seqVisual(seq)},distractors:shuffle(rng,ds11),meta:{archetype:m==='pattern_reverse'?'recognize_descending_place_value_pattern':'predict_next_place_value_step',hintMs:'Gunakan beza yang sama pada setiap langkah.',fingerprint:fp(m,nxt,seq)}};
  }
  if(m==='pattern_missing'||m==='pattern_error'||m==='pattern_rule'){
    var st=pick(rng,[1,10,100,1000]),base=ri(rng,1000,Math.max(1000,9999-st*5)),seq2=[];for(var qi=0;qi<5;qi++)seq2.push(base+st*qi);
    if(m==='pattern_missing'){
      var mi=ri(rng,1,3),target=seq2[mi],shown=seq2.slice();shown[mi]=null;
      var ans12=choice(target,String(target)),ds12=numChoices(target,[target-st,target+st,target+10],'pattern_step_confusion');
      return{value:{promptMs:'Lengkapkan nombor yang hilang dalam pola ini.',answer:ans12,visual:seqVisual(shown,mi)},distractors:shuffle(rng,ds12),meta:{archetype:'complete_missing_pattern_term',hintMs:'Cari beza tetap antara nombor yang diketahui.',fingerprint:fp(m,target,seq2)}};
    }
    if(m==='pattern_error'){
      var ei=ri(rng,1,3),errOffset=st===1?10:Math.max(1,Math.floor(st/10)),wrongv=seq2[ei]+errOffset,shown2=seq2.slice();shown2[ei]=wrongv;
      var ans13=choice(wrongv,String(wrongv));
      var others=shown2.filter(function(v,ix){return ix!==ei;}).slice(0,3).map(function(v){return choice(v,String(v),'pattern_step_confusion');});
      return{value:{promptMs:'Satu nombor tidak mengikut pola. Nombor manakah yang salah?',answer:ans13,visual:seqVisual(shown2)},distractors:shuffle(rng,others),meta:{archetype:'find_incorrect_pattern_term',hintMs:'Semak beza setiap pasangan nombor bersebelahan.',fingerprint:fp(m,wrongv,shown2)}};
    }
    var rule='Tambah '+st,ans14=choice(rule,rule),alts=shuffle(rng,[1,10,100,1000].filter(function(v){return v!==st;})).slice(0,3).map(function(v){return choice(v,'Tambah '+v,'pattern_step_confusion');});
    return{value:{promptMs:'Peraturan manakah membina pola '+seq2.join(', ')+'?',answer:ans14,visual:null},distractors:alts,meta:{archetype:'choose_pattern_rule',hintMs:'Tolak dua nombor bersebelahan untuk mencari langkah pola.',fingerprint:fp(m,rule,seq2)}};
  }

  // T4 — Wang
  if(m==='money_add'){
    var prices=[ri(rng,250,2500),ri(rng,300,3000),ri(rng,150,1800)],total=prices[0]+prices[1]+prices[2];
    return{value:{promptMs:'Berapakah jumlah harga ketiga-tiga barang?',answer:choice(total,money(total)),visual:{kind:'money_items',amounts:prices.map(money)}},distractors:shuffle(rng,moneyWrong(total,[total-prices[2],total+500,total-500],'money_operation_confusion')),meta:{archetype:'add_multiple_money_values',hintMs:'Tambah semua nilai wang dengan titik perpuluhan selari.',fingerprint:fp(m,total,prices)}};
  }
  if(m==='money_subtract'){
    var spend=ri(rng,1000,6000),budget=Math.ceil((spend+ri(rng,500,3000))/500)*500,left=budget-spend;
    return{value:{promptMs:'Aina mempunyai '+money(budget)+' dan membelanjakan '+money(spend)+'. Berapakah baki wangnya?',answer:choice(left,money(left)),visual:{kind:'money_budget',start:money(budget),changes:[{label:'Belanja',amount:'− '+money(spend)}]}},distractors:shuffle(rng,moneyWrong(left,[budget+spend,spend,left+500],'money_operation_confusion')),meta:{archetype:'subtract_money_from_budget',hintMs:'Baki = wang asal − jumlah dibelanjakan.',fingerprint:fp(m,left,[budget,spend])}};
  }
  if(m==='money_compare'){
    var a1=ri(rng,500,2500),a2=ri(rng,500,2500),b1=ri(rng,500,2500),b2=ri(rng,500,2500),ta=a1+a2,tb=b1+b2;if(ta===tb)b2+=100,tb+=100;
    var winner=ta>tb?'Resit A':'Resit B',ans15=choice(winner,winner+' mempunyai jumlah lebih besar.');
    var ds15=[
      choice('other',(winner==='Resit A'?'Resit B':'Resit A')+' mempunyai jumlah lebih besar.','money_operation_confusion'),
      choice('equal','Kedua-dua jumlah adalah sama.','money_operation_confusion'),
      choice('first','Cukup bandingkan harga barang pertama sahaja.','money_operation_confusion')
    ];
    return{value:{promptMs:'Resit manakah mempunyai jumlah perbelanjaan lebih besar?',answer:ans15,visual:{kind:'money_receipts',a:[money(a1),money(a2)],b:[money(b1),money(b2)]}},distractors:shuffle(rng,ds15),meta:{archetype:'compare_two_money_totals',hintMs:'Jumlahkan setiap resit dahulu, kemudian bandingkan.',fingerprint:fp(m,winner,[ta,tb])}};
  }
  if(m==='money_mixed_change'){
    var p1=ri(rng,300,2000),p2=ri(rng,300,2000),cost=p1+p2,pay=Math.ceil((cost+500)/1000)*1000,chg=pay-cost;
    return{value:{promptMs:'Mira membeli dua barang ini dan membayar '+money(pay)+'. Berapakah baki?',answer:choice(chg,money(chg)),visual:{kind:'money_items',amounts:[money(p1),money(p2)],payment:money(pay)}},distractors:shuffle(rng,moneyWrong(chg,[pay-p1,pay-p2,cost],'money_operation_confusion')),meta:{archetype:'purchase_then_find_change',hintMs:'Tambah harga kedua-dua barang, kemudian tolak daripada bayaran.',fingerprint:fp(m,chg,[p1,p2,pay])}};
  }
  if(m==='money_mixed_budget'){
    var start=ri(rng,3000,8000),spent1=ri(rng,500,1500),receive=ri(rng,300,1200),spent2=ri(rng,300,1200),final=start-spent1+receive-spent2;
    return{value:{promptMs:'Ikut perubahan wang pada kad. Berapakah wang akhir?',answer:choice(final,money(final)),visual:{kind:'money_budget',start:money(start),changes:[{label:'Belanja',amount:'− '+money(spent1)},{label:'Terima',amount:'+ '+money(receive)},{label:'Belanja',amount:'− '+money(spent2)}]}},distractors:shuffle(rng,moneyWrong(final,[start-spent1-receive-spent2,start+spent1+receive-spent2,start-spent1+receive+spent2],'money_operation_confusion')),meta:{archetype:'track_budget_with_mixed_changes',hintMs:'Tanda + untuk wang diterima dan − untuk wang dibelanjakan.',fingerprint:fp(m,final,[start,spent1,receive,spent2])}};
  }
  if(m==='money_mixed_error'){
    var base=ri(rng,4000,9000),sp=ri(rng,500,1800),inc=ri(rng,300,1200),correct=base-sp+inc;
    var ans16=choice(correct,money(correct)),ds16=moneyWrong(correct,[base+sp+inc,base-sp-inc,base+sp-inc],'money_operation_confusion');
    return{value:{promptMs:'Hakim ada '+money(base)+', berbelanja '+money(sp)+' dan kemudian menerima '+money(inc)+'. Apakah jumlah wang yang betul sekarang?',answer:ans16,visual:null},distractors:shuffle(rng,ds16),meta:{archetype:'identify_correct_mixed_money_result',hintMs:'Perbelanjaan ditolak; wang diterima ditambah.',fingerprint:fp(m,correct,[base,sp,inc])}};
  }
  if(m==='money_multiply'){
    var price=ri(rng,150,1500),qty=ri(rng,2,6),tot=price*qty;
    return{value:{promptMs:'Setiap barang berharga '+money(price)+'. Berapakah harga '+qty+' barang yang sama?',answer:choice(tot,money(tot)),visual:{kind:'money_items',amounts:Array(qty).fill(money(price))}},distractors:shuffle(rng,moneyWrong(tot,[price+qty,price*(qty-1),price*(qty+1)],'money_operation_confusion')),meta:{archetype:'multiply_equal_item_prices',hintMs:'Harga sama berulang boleh dikira dengan darab.',fingerprint:fp(m,tot,[price,qty])}};
  }
  if(m==='money_divide'){
    var people=ri(rng,2,6),share=ri(rng,200,1500),tot2=people*share;
    return{value:{promptMs:money(tot2)+' dibahagi sama rata kepada '+people+' orang. Setiap orang mendapat berapa?',answer:choice(share,money(share)),visual:{kind:'money_share',total:money(tot2),groups:people}},distractors:shuffle(rng,moneyWrong(share,[tot2-people,share+100,share-100],'money_operation_confusion')),meta:{archetype:'divide_money_equally',hintMs:'Bahagi jumlah wang dengan bilangan orang.',fingerprint:fp(m,share,[tot2,people])}};
  }
  if(m==='money_unit_price'){
    var qn=ri(rng,2,6),unit=ri(rng,200,1200),all=qn*unit;
    return{value:{promptMs:qn+' barang yang sama berharga '+money(all)+' semuanya. Harga satu barang ialah?',answer:choice(unit,money(unit)),visual:{kind:'money_items',amounts:[money(all)],quantity:qn}},distractors:shuffle(rng,moneyWrong(unit,[all-qn,unit+100,unit*2],'money_operation_confusion')),meta:{archetype:'find_unit_price_from_total',hintMs:'Harga satu = jumlah harga ÷ bilangan barang.',fingerprint:fp(m,unit,[all,qn])}};
  }
  if(m==='currency_country_to_name'||m==='currency_name_to_country'||m==='currency_code_match'){
    var c=pick(rng,ASEAN),pool=shuffle(rng,ASEAN.filter(function(z){return z.country!==c.country;})).slice(0,3);
    var prompt,answer,ds;
    if(m==='currency_country_to_name'){prompt='Apakah mata wang negara '+c.country+'?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});}
    else if(m==='currency_name_to_country'){prompt='Mata wang '+c.currency+' digunakan oleh negara mana?';answer=choice(c.country,c.country);ds=pool.map(function(z){return choice(z.country,z.country,'currency_country_confusion');});}
    else{prompt='Kod '+c.code+' merujuk kepada mata wang yang mana?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});}
    return{value:{promptMs:prompt,answer:answer,visual:{kind:'currency_card',country:c.country,currency:c.currency,code:c.code}},distractors:shuffle(rng,ds),meta:{archetype:m==='currency_country_to_name'?'country_to_currency':m==='currency_name_to_country'?'currency_to_country':'match_currency_code_to_name',hintMs:'Padankan negara, nama mata wang dan kodnya.',fingerprint:fp(m,answer.id,[c.country,c.currency,c.code])}};
  }
  if(m==='needs_identify'){
    var need=pick(rng,['Beras','Ubat ketika sakit','Buku sekolah','Air minuman']),wants=shuffle(rng,['Mainan baharu','Permainan video','Aksesori hiasan','Gula-gula','Patung koleksi']).slice(0,3);
    var opts=shuffle(rng,[need].concat(wants)),ans17=choice(need,need),ds17=opts.filter(function(z){return z!==need;}).map(function(z){return choice(z,z,'need_want_confusion');});
    return{value:{promptMs:'Yang manakah paling jelas merupakan KEPERLUAN?',answer:ans17,visual:{kind:'needs_wants',items:opts}},distractors:ds17,meta:{archetype:'identify_need_among_choices',hintMs:'Keperluan penting untuk hidup, kesihatan atau belajar; kehendak boleh ditangguhkan.',fingerprint:fp(m,need,opts)}};
  }
  if(m==='needs_saving_choice'){
    var ans18=choice('save','Beli barang keperluan dahulu dan simpan baki untuk matlamat yang lebih penting.');
    var ds18=[
      choice('want','Habiskan semua wang pada barang kehendak hari ini.','need_want_confusion'),
      choice('borrow','Pinjam wang supaya boleh membeli semua kehendak.','need_want_confusion'),
      choice('ignore','Abaikan barang keperluan supaya baki boleh digunakan untuk permainan.','need_want_confusion')
    ];
    return{value:{promptMs:'Sara mempunyai wang terhad. Dia perlu membeli buku latihan tetapi juga mahu mainan baharu. Pilihan manakah paling bijak?',answer:ans18,visual:{kind:'money_budget',start:'Wang terhad',changes:[{label:'Keperluan',amount:'Buku latihan'},{label:'Kehendak',amount:'Mainan'}]}},distractors:shuffle(rng,ds18),meta:{archetype:'choose_sensible_saving_decision',hintMs:'Utamakan keperluan dan fikirkan simpanan sebelum kehendak.',fingerprint:fp(m,'save',[])}};
  }
  if(m==='needs_priority_reason'){
    var ans19=choice('reason','Keperluan membantu aktiviti penting dan patut didahulukan sebelum kehendak.');
    var ds19=[
      choice('expensive','Barang yang lebih mahal sentiasa perlu dibeli dahulu.','need_want_confusion'),
      choice('fun','Barang yang paling menyeronokkan mesti didahulukan.','need_want_confusion'),
      choice('spend','Wang simpanan sepatutnya dihabiskan secepat mungkin.','need_want_confusion')
    ];
    return{value:{promptMs:'Mengapakah kasut sekolah yang rosak patut diganti sebelum membeli permainan baharu?',answer:ans19,visual:null},distractors:shuffle(rng,ds19),meta:{archetype:'explain_need_before_want',hintMs:'Bezakan perkara yang diperlukan untuk aktiviti penting dengan perkara yang hanya diingini.',fingerprint:fp(m,'reason',[])}};
  }

  // T8 — Koordinat / kedudukan
  if(m.indexOf('coord_')===0){
    var objects=gridObjects(rng),ref=objects[0],target=objects[1],dx,dy;
    if(m==='coord_relative_direction'||m==='coord_relative_distance'){
      var dirs=[[1,0],[-1,0],[0,1],[0,-1]],d=pick(rng,dirs),dist=m==='coord_relative_distance'?ri(rng,1,2):1;
      target={name:target.name,x:Math.max(1,Math.min(5,ref.x+d[0]*dist)),y:Math.max(1,Math.min(5,ref.y+d[1]*dist))};
      // If clamping collapses, reset around safe center.
      if(target.x===ref.x&&target.y===ref.y){ref={name:ref.name,x:3,y:3};target={name:target.name,x:3+d[0]*dist,y:3+d[1]*dist};}
      objects[0]=ref;objects[1]=target;dx=target.x-ref.x;dy=target.y-ref.y;
      var correctDir=dirText(dx,dy),ans20=choice(correctDir,correctDir);
      var candidates=[dirText(-dx,-dy),dx!==0?Math.abs(dx)+' petak ke atas':Math.abs(dy)+' petak ke kanan',dx!==0?Math.abs(dx)+' petak ke bawah':Math.abs(dy)+' petak ke kiri'];
      var ds20=candidates.map(function(z,i){return choice('d'+i,z,'direction_distance_confusion');});
      return{value:{promptMs:'Kedudukan '+target.name+' berbanding '+ref.name+' ialah?',answer:ans20,visual:{kind:'coordinate_grid',objects:objects,highlight:[ref.name,target.name]}},distractors:shuffle(rng,ds20),meta:{archetype:m==='coord_relative_direction'?'describe_cardinal_relative_position':'describe_relative_distance',hintMs:'Gunakan objek rujukan dahulu, kemudian kira petak mengufuk atau mencancang.',fingerprint:fp(m,correctDir,[ref.x,ref.y,target.x,target.y])}};
    }
    if(m==='coord_relative_compare'){
      dx=target.x-ref.x;dy=target.y-ref.y;
      // force same row/column for clear Year 3 relation
      if(rng()<0.5){target.y=ref.y;if(target.x===ref.x)target.x=ref.x===5?4:ref.x+1;}else{target.x=ref.x;if(target.y===ref.y)target.y=ref.y===5?4:ref.y+1;}
      dx=target.x-ref.x;dy=target.y-ref.y;objects[1]=target;
      var txt=dirText(dx,dy),ans21=choice(txt,txt);
      var ds21=[choice('op',dirText(-dx,-dy),'reference_point_confusion'),choice('swap',dx!==0?Math.abs(dx)+' petak ke atas':Math.abs(dy)+' petak ke kanan','horizontal_vertical_confusion'),choice('zero','Kedua-dua objek berada di tempat yang sama.','reference_point_confusion')];
      return{value:{promptMs:'Lihat dua objek yang ditanda. Bagaimanakah kedudukan '+target.name+' daripada '+ref.name+'?',answer:ans21,visual:{kind:'coordinate_grid',objects:objects,highlight:[ref.name,target.name]}},distractors:shuffle(rng,ds21),meta:{archetype:'compare_two_object_positions',hintMs:'Pastikan arah dibaca dari objek rujukan yang disebut dalam soalan.',fingerprint:fp(m,txt,[ref.x,ref.y,target.x,target.y])}};
    }
    if(m==='coord_identify_axes'||m==='coord_identify_clue'){
      var t=pick(rng,objects),ans22=choice(t.name,t.name),others=objects.filter(function(o){return o.name!==t.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');});
      var pr=m==='coord_identify_axes'?'Objek manakah berada pada mengufuk '+t.x+' dan mencancang '+t.y+'?':'Cari objek pada persilangan lajur mengufuk '+t.x+' dengan baris mencancang '+t.y+'.';
      return{value:{promptMs:pr,answer:ans22,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,others),meta:{archetype:m==='coord_identify_axes'?'identify_object_at_axis_intersection':'identify_object_from_axis_clue',hintMs:'Cari nilai mengufuk dahulu, kemudian nilai mencancang.',fingerprint:fp(m,t.name,[t.x,t.y])}};
    }
    if(m==='coord_match_description'){
      var t2=pick(rng,objects),ans23=choice(t2.name,t2.name),ds23=objects.filter(function(o){return o.name!==t2.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');});
      return{value:{promptMs:'Objek manakah sepadan dengan kedudukan "'+coordLabel(t2.x,t2.y)+'"?',answer:ans23,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,ds23),meta:{archetype:'match_object_to_position_description',hintMs:'Padankan nilai mengufuk dan mencancang dengan petak objek.',fingerprint:fp(m,t2.name,[t2.x,t2.y])}};
    }
    if(m==='coord_read_position'){
      var t3=pick(rng,objects),ans24=choice(coordLabel(t3.x,t3.y),coordLabel(t3.x,t3.y));
      var opts2=shuffle(rng,objects.filter(function(o){return o.name!==t3.name;})).slice(0,2).map(function(o){return choice(o.name,coordLabel(o.x,o.y),'horizontal_vertical_confusion');});
      opts2.push(choice('swap',coordLabel(t3.y,t3.x),'horizontal_vertical_confusion'));
      // de-dup swap if x==y
      var seen2=Object.create(null),ds24=[];for(var z=0;z<opts2.length;z++){var lab=opts2[z].labelMs;if(lab!==ans24.labelMs&&!seen2[lab]){seen2[lab]=1;ds24.push(opts2[z]);}}
      for(var xx=1;ds24.length<3&&xx<=5;xx++){var lab2=coordLabel(xx,t3.y);if(lab2!==ans24.labelMs&&!seen2[lab2]){seen2[lab2]=1;ds24.push(choice('f'+xx,lab2,'horizontal_vertical_confusion'));}}
      return{value:{promptMs:'Apakah kedudukan '+t3.name+'?',answer:ans24,visual:{kind:'coordinate_grid',objects:objects,highlight:[t3.name]}},distractors:shuffle(rng,ds24.slice(0,3)),meta:{archetype:'read_horizontal_vertical_position',hintMs:'Baca mengufuk dahulu, kemudian mencancang.',fingerprint:fp(m,ans24.labelMs,[t3.x,t3.y])}};
    }
    if(m==='coord_moves_to_target'){
      var r={name:'Mula',x:ri(rng,2,4),y:ri(rng,2,4)},tdir=pick(rng,[[1,0],[-1,0],[0,1],[0,-1]]),dist2=ri(rng,1,Math.min(2,tdir[0]!==0?(tdir[0]>0?5-r.x:r.x-1):(tdir[1]>0?5-r.y:r.y-1)));if(dist2<1)dist2=1;
      var tt={name:'Sasaran',x:r.x+tdir[0]*dist2,y:r.y+tdir[1]*dist2},move=dirText(tt.x-r.x,tt.y-r.y),ans25=choice(move,move);
      var ds25=[choice('rev',dirText(r.x-tt.x,r.y-tt.y),'direction_distance_confusion'),choice('swap',tdir[0]!==0?dist2+' petak ke atas':dist2+' petak ke kanan','horizontal_vertical_confusion'),choice('extra',(dist2+1)+' petak '+(tdir[0]>0?'ke kanan':tdir[0]<0?'ke kiri':tdir[1]>0?'ke atas':'ke bawah'),'direction_distance_confusion')];
      return{value:{promptMs:'Gerakan manakah membawa Mula ke Sasaran?',answer:ans25,visual:{kind:'coordinate_grid',objects:[r,tt],highlight:['Mula','Sasaran']}},distractors:shuffle(rng,ds25),meta:{archetype:'choose_moves_to_target',hintMs:'Kira bilangan petak dan semak arah gerakan.',fingerprint:fp(m,move,[r.x,r.y,tt.x,tt.y])}};
    }
    if(m==='coord_follow_moves'){
      var sx=ri(rng,2,4),sy=ri(rng,2,4),dx2=pick(rng,[-1,1])*1,dy2=pick(rng,[-1,1])*1,tx=sx+dx2,ty=sy+dy2;
      var answerPos=coordLabel(tx,ty),ans26=choice(answerPos,answerPos);
      var candPos=[[ty,tx],[tx,sy],[sx,ty],[sx,sy],[Math.max(1,Math.min(5,tx+1)),ty],[tx,Math.max(1,Math.min(5,ty+1))]];
      var seenPos=Object.create(null),ds26=[];
      for(var cp=0;cp<candPos.length&&ds26.length<3;cp++){
        var labp=coordLabel(candPos[cp][0],candPos[cp][1]);
        if(labp!==answerPos&&!seenPos[labp]){seenPos[labp]=1;ds26.push(choice('p'+cp,labp,cp===0?'horizontal_vertical_confusion':'direction_distance_confusion'));}
      }
      for(var fx=1;ds26.length<3&&fx<=5;fx++){for(var fy=1;ds26.length<3&&fy<=5;fy++){var fill=coordLabel(fx,fy);if(fill!==answerPos&&!seenPos[fill]){seenPos[fill]=1;ds26.push(choice('f'+fx+'_'+fy,fill,'direction_distance_confusion'));}}}
      return{value:{promptMs:'Bermula pada '+coordLabel(sx,sy)+', bergerak 1 petak '+(dx2>0?'ke kanan':'ke kiri')+' dan 1 petak '+(dy2>0?'ke atas':'ke bawah')+'. Di manakah kedudukan akhir?',answer:ans26,visual:{kind:'coordinate_grid',objects:[{name:'Mula',x:sx,y:sy}],highlight:['Mula']}},distractors:shuffle(rng,ds26),meta:{archetype:'locate_after_movement_instruction',hintMs:'Ubah nilai mengufuk mengikut kiri/kanan dan nilai mencancang mengikut atas/bawah.',fingerprint:fp(m,answerPos,[sx,sy,dx2,dy2])}};
    }
  }

  throw new Error('d3.fullKssr: unknown mode "'+m+'"');
});
})();
  })(registerGenerator);

  // ---- generators/d3/p0-kssr.js ----
  (function (registerGenerator) {
// questions/v2/generators/d3/p0-kssr.js
// Phase 3A-1: authored SHADOW bank for Darjah 3 P0 topics.
// Pure authored source: no Node/browser globals.
(function(){
'use strict';
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}
function shuffle(rng,a){var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=o[i];o[i]=o[j];o[j]=t;}return o;}
function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return Math.abs(a);}
function ch(id,label,tag){return{id:String(id),labelMs:String(label),misconceptionTag:tag||null};}
function fp(arch,parts){return arch+'::'+parts.map(String).join('::');}
function uniqLabels(answer,wrong){
  var vals=[answer.labelMs].concat(wrong.map(function(x){return x.labelMs;})).map(function(x){return String(x).trim().toLowerCase();});
  return new Set(vals).size===4;
}
function pack(prompt,answer,wrong,visual,arch,hint,mis,semantic){
  if(!uniqLabels(answer,wrong))throw new Error('d3.p0Kssr duplicate choices '+arch);
  return {value:{promptMs:prompt,answer:answer,visual:visual||null},distractors:wrong,
    meta:{archetype:arch,hintMs:hint||'Baca maklumat satu demi satu.',misconceptionTargets:mis||[],semanticProperties:semantic||{},fingerprint:fp(arch,[answer.id].concat(Object.keys(semantic||{}).sort().map(function(k){return semantic[k];})))}
  };
}
function numPack(prompt,ans,wrongs,visual,arch,hint,mis,fmt,semantic){
  fmt=fmt||function(x){return String(x);};
  var seen={};seen[fmt(ans)]=1;var ws=[];
  for(var i=0;i<wrongs.length&&ws.length<3;i++){var s=fmt(wrongs[i]);if(!seen[s]){seen[s]=1;ws.push(ch('w'+ws.length,s,mis&&mis[0]));}}
  var delta=1;while(ws.length<3){var s2=fmt(ans+delta);delta++;if(!seen[s2]){seen[s2]=1;ws.push(ch('w'+ws.length,s2,mis&&mis[0]));}}
  return pack(prompt,ch('a',fmt(ans)),shuffle(function(){return 0.5;},ws),visual,arch,hint,mis,semantic||{answer:ans});
}
function pctWords(n){
  var small=['sifar','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan','sepuluh','sebelas'];
  function w(x){if(x<12)return small[x];if(x<20)return small[x-10]+' belas';if(x<100){var t=Math.floor(x/10),r=x%10;return small[t]+' puluh'+(r?' '+small[r]:'');}return 'seratus';}
  return w(n)+' peratus';
}
function frac(n,d){return n+'/'+d;}
function decimal2(n){return (Math.round(n*100)/100).toFixed(2);}
function timeLabel(mins){var h=Math.floor(mins/60),m=mins%60;return h+' jam'+(m?' '+m+' minit':'');}
function clockLabel(h,m){return h+':'+String(m).padStart(2,'0');}
function unitVisual(kind,value,max,label){return {kind:kind,value:value,max:max||value,label:label||''};}
function barVisual(parts,labels){return {kind:'bar_model',parts:parts,labels:labels||[]};}
function groupingVisual(groups,each){return {kind:'grouping',groups:groups,each:each};}
function fractionVisual(n,d,count){return {kind:'fraction_area',numerator:n,denominator:d,count:count||1};}
function gridVisual(shaded){return {kind:'hundred_grid',shaded:shaded};}
function lineVisual(values,marks){return {kind:'number_line',values:values,marks:marks||[]};}
function clockVisual(h,m){return {kind:'clock',hour:h,minute:m};}
function timelineVisual(start,end,markers){return {kind:'timeline',start:start,end:end,markers:markers||[]};}
function tableVisual(headers,rows){return {kind:'table',headers:headers,rows:rows};}
function pieVisual(labels,values){return {kind:'pie_chart',labels:labels,values:values};}
function barChartVisual(labels,values){return {kind:'bar_chart',labels:labels,values:values};}
function pictographVisual(labels,values,key){return {kind:'pictograph',labels:labels,values:values,key:key||1};}

registerGenerator('d3.p0Kssr',function(params,rng){
  var c=params&&params.competencyId,m=params&&params.mode;
  if(!c||!m)throw new Error('d3.p0Kssr missing competencyId/mode');

  // D3.T2 — Operasi Asas
  if(c==='solve_addition_subtraction_word_problems'){
    if(m==='context_result'){
      var add=rng()<0.5,a=ri(rng,1200,5200),b=ri(rng,300,1800),ans=add?a+b:a-b;if(!add&&b>a){var z=a;a=b;b=z;ans=a-b;}
      var p=add?'Perpustakaan mempunyai '+a+' buku. Sebanyak '+b+' buku baharu diterima. Berapakah jumlah buku sekarang?':'Sebuah stor mempunyai '+a+' kotak. '+b+' kotak dihantar keluar. Berapakah kotak yang tinggal?';
      return numPack(p,ans,[add?a-b:a+b,Math.abs(ans-100),ans+100],barVisual([a,b],[add?'asal':'jumlah',add?'tambah':'keluar']),'word_problem_result','Tentukan sama ada kuantiti bertambah atau berkurang.',['operation_selection'],null,{a:a,b:b,op:add?'add':'sub'});
    }
    if(m==='missing_part_bar'){
      var whole=ri(rng,3500,9000),part=ri(rng,800,whole-800),ans2=whole-part;
      return numPack('Jumlah dua kumpulan ialah '+whole+'. Satu kumpulan mempunyai '+part+'. Berapakah kumpulan yang satu lagi?',ans2,[whole+part,part,whole-part+100],barVisual([part,ans2],['diketahui','?']),'word_problem_missing_part','Jumlah = bahagian diketahui + bahagian yang dicari.',['part_whole_confusion'],null,{whole:whole,part:part});
    }
    if(m==='choose_operation'){
      var x=ri(rng,1200,6000),y=ri(rng,300,1200);
      var ans3=ch('subtract','Tolak');
      return pack('Ali mempunyai '+x+' keping kad. Dia memberikan '+y+' keping kepada kawannya. Operasi manakah patut digunakan untuk mencari baki?',ans3,[ch('add','Tambah','operation_selection'),ch('multiply','Darab','operation_selection'),ch('divide','Bahagi','operation_selection')],null,'choose_operation_from_context','Perkataan “memberikan” menunjukkan kuantiti berkurang.',['operation_selection'],{x:x,y:y});
    }
  }

  if(c==='solve_mixed_addition_subtraction_problems'){
    if(m==='add_then_subtract'){
      var a1=ri(rng,1500,4000),b1=ri(rng,500,1800),c1=ri(rng,300,1200),ans4=a1+b1-c1;
      return numPack('Sebuah pusat mengumpul '+a1+' botol pada Isnin dan '+b1+' pada Selasa. Kemudian '+c1+' botol dihantar untuk kitar semula. Berapakah yang masih ada?',ans4,[a1+b1+c1,a1-b1+c1,a1+b1],barVisual([a1,b1,-c1],['Isnin','Selasa','keluar']),'mixed_add_then_subtract','Buat operasi mengikut urutan cerita: tambah dahulu, kemudian tolak.',['operation_order'],null,{a:a1,b:b1,c:c1});
    }
    if(m==='subtract_then_add'){
      var a2=ri(rng,4500,8500),b2=ri(rng,600,1800),c2=ri(rng,400,1500),ans5=a2-b2+c2;
      return numPack('Stok awal ialah '+a2+'. Sebanyak '+b2+' digunakan, kemudian '+c2+' stok baharu diterima. Berapakah stok akhir?',ans5,[a2-b2-c2,a2+b2+c2,a2+c2],barVisual([a2,-b2,c2],['awal','guna','terima']),'mixed_subtract_then_add','Ikut perubahan stok satu demi satu.',['operation_order'],null,{a:a2,b:b2,c:c2});
    }
    if(m==='choose_expression'){
      var aa=ri(rng,3000,6000),bb=ri(rng,400,1200),cc=ri(rng,200,900),lab=aa+' − '+bb+' + '+cc;
      return pack('Mula dengan '+aa+' unit. '+bb+' unit digunakan dan kemudian '+cc+' unit ditambah. Ungkapan manakah mewakili situasi itu?',ch('correct',lab),[
        ch('w1',aa+' + '+bb+' + '+cc,'operation_order'),ch('w2',aa+' − ('+bb+' + '+cc+')','operation_order'),ch('w3',aa+' + '+bb+' − '+cc,'operation_order')
      ],barVisual([aa,-bb,cc],['mula','guna','tambah']),'choose_expression_for_two_step','Padankan setiap perubahan cerita dengan tanda operasi.',['operation_order'],{a:aa,b:bb,c:cc});
    }
  }

  if(c==='multiply_divide_numbers_by_1digit_powers10'){
    if(m==='one_digit'){
      var mult=rng()<0.5,f=ri(rng,2,8),n=ri(rng,120,1100),prod=f*n;
      if(mult)return numPack(n+' × '+f+' = ?',prod,[n+f,n*(f-1),prod+f],groupingVisual(f,n),'multiply_divide_one_digit','Darab ialah penambahan kumpulan yang sama banyak.',['multiply_divide_inverse'],null,{n:n,f:f,op:'mul'});
      var q=ri(rng,120,1100),div=ri(rng,2,8),total=q*div;
      return numPack(total+' ÷ '+div+' = ?',q,[div,q+1,Math.max(1,q-1)],groupingVisual(div,q),'multiply_divide_one_digit','Gunakan hubungan darab dan bahagi.',['multiply_divide_inverse'],null,{total:total,div:div,op:'div'});
    }
    if(m==='powers10'){
      var base=ri(rng,2,90),pow=pick(rng,[10,100,1000]),mul=rng()<0.5,an=mul?base*pow:base;
      var prompt=mul?base+' × '+pow+' = ?':(base*pow)+' ÷ '+pow+' = ?';
      return numPack(prompt,an,[base*(pow/10),base+pow,base*10],{kind:'place_value_shift',base:base,factor:pow,operation:mul?'mul':'div'},'multiply_divide_powers10','Perhatikan perubahan nilai tempat apabila darab atau bahagi 10, 100 atau 1000.',['zero_place_value'],null,{base:base,pow:pow,op:mul?'mul':'div'});
    }
    if(m==='missing_factor'){
      var g=ri(rng,2,9),each=ri(rng,20,300),tot=g*each;
      return numPack('□ × '+g+' = '+tot+'. Apakah nombor dalam kotak?',each,[g,tot,each+g],groupingVisual(g,each),'inverse_missing_factor','Gunakan bahagi untuk mencari faktor yang hilang.',['multiply_divide_inverse'],null,{g:g,each:each,total:tot});
    }
  }

  // D3.T3 — Pecahan, Perpuluhan dan Peratus
  if(c==='identify_equivalent_fractions'){
    var d=pick(rng,[2,3,4,5]),n1=ri(rng,1,d-1),k=pick(rng,[2,3]),en=n1*k,ed=d*k;
    if(m==='symbolic_match')return pack('Pecahan manakah setara dengan '+frac(n1,d)+'?',ch('a',frac(en,ed)),[
      ch('w1',frac(n1,ed),'scale_one_part_only'),ch('w2',frac(en,d),'scale_one_part_only'),ch('w3',frac(n1+k,d+k),'scale_one_part_only')
    ],null,'equivalent_fraction_symbolic','Darab pengangka dan penyebut dengan nombor yang sama.',['scale_one_part_only'],{n:n1,d:d,k:k});
    if(m==='area_match')return pack('Rajah menunjukkan '+frac(n1,d)+'. Pecahan manakah mempunyai nilai yang sama?',ch('a',frac(en,ed)),[
      ch('w1',frac(n1,ed),'visual_fraction_equivalence'),ch('w2',frac(en,ed+1),'visual_fraction_equivalence'),ch('w3',frac(Math.min(ed-1,en+1),ed),'visual_fraction_equivalence')
    ],fractionVisual(n1,d),'equivalent_fraction_area','Banding bahagian berlorek, bukan hanya nombor penyebut.',['visual_fraction_equivalence'],{n:n1,d:d,k:k});
    if(m==='missing_number')return numPack(frac(n1,d)+' = □/'+ed+'. Apakah nombor dalam kotak?',en,[n1,k,en+1],null,'equivalent_fraction_missing_number','Cari faktor yang digunakan pada penyebut, kemudian guna faktor sama pada pengangka.',['scale_one_part_only'],null,{n:n1,d:d,k:k});
  }

  if(c==='simplify_proper_fractions'){
    var baseD=pick(rng,[3,4,5]),baseN=ri(rng,1,baseD-1);while(gcd(baseN,baseD)!==1){baseN=ri(rng,1,baseD-1);}
    var factor=pick(rng,[2,3]),sn=baseN*factor,sd=baseD*factor;
    if(m==='simplest_form')return pack('Permudahkan '+frac(sn,sd)+'.',ch('a',frac(baseN,baseD)),[
      ch('w1',frac(sn/factor,sd),'not_fully_simplified'),ch('w2',frac(sn,sd/factor),'not_fully_simplified'),ch('w3',frac(baseN+1,baseD+1),'not_fully_simplified')
    ],null,'simplify_fraction_direct','Bahagi pengangka dan penyebut dengan faktor sepunya yang sama.',['not_fully_simplified'],{n:sn,d:sd,f:factor});
    if(m==='common_factor')return pack('Untuk memudahkan '+frac(sn,sd)+' terus kepada bentuk termudah, nombor manakah sesuai digunakan untuk membahagi kedua-duanya?',ch('a',String(factor)),[
      ch('w1','1','wrong_common_factor'),ch('w2',String(factor+1),'wrong_common_factor'),ch('w3',String(factor*2+1),'wrong_common_factor')
    ],null,'identify_common_factor_for_simplification','Cari faktor yang boleh membahagi pengangka dan penyebut.',['wrong_common_factor'],{n:sn,d:sd,f:factor});
    if(m==='area_simplify')return pack('Bahagian berlorek mewakili '+frac(sn,sd)+'. Bentuk termudahnya ialah?',ch('a',frac(baseN,baseD)),[
      ch('w1',frac(sn,sd),'not_fully_simplified'),ch('w2',frac(baseN,sd),'visual_fraction_equivalence'),ch('w3',frac(sn,baseD),'visual_fraction_equivalence')
    ],fractionVisual(sn,sd),'simplify_fraction_from_area','Gabungkan bahagian yang sama untuk melihat pecahan lebih ringkas.',['visual_fraction_equivalence'],{n:sn,d:sd});
  }

  if(c==='add_subtract_proper_fractions'){
    var den=pick(rng,[4,5,6,8,10]),x1=ri(rng,1,Math.max(1,den-3)),x2=ri(rng,1,Math.max(1,den-x1-1));
    if(m==='add_same_denominator'){
      var suma=x1+x2;return pack(frac(x1,den)+' + '+frac(x2,den)+' = ?',ch('a',frac(suma,den)),[
        ch('w1',frac(suma,den*2),'add_denominators'),ch('w2',frac(x1+x2+1,den),'add_denominators'),ch('w3',frac(Math.max(1,x1-x2),den),'add_denominators')
      ],fractionVisual(suma,den),'add_proper_fractions','Penyebut sama: tambah pengangka sahaja.',['add_denominators'],{a:x1,b:x2,d:den});
    }
    if(m==='subtract_same_denominator'){
      var hi=Math.max(x1,x2)+1;if(hi>=den)hi=den-1;var lo=Math.min(x1,x2),dif=hi-lo;
      return pack(frac(hi,den)+' − '+frac(lo,den)+' = ?',ch('a',frac(dif,den)),[
        ch('w1',frac(dif,Math.max(1,den-lo)),'subtract_denominators'),ch('w2',frac(hi+lo,den),'operation_selection'),ch('w3',frac(dif+1,den),'subtract_denominators')
      ],null,'subtract_proper_fractions','Penyebut sama: tolak pengangka sahaja.',['subtract_denominators'],{a:hi,b:lo,d:den});
    }
    if(m==='context_fraction'){
      var sumc=x1+x2;
      return pack('Aina mewarnakan '+frac(x1,den)+' bahagian pada pagi dan '+frac(x2,den)+' bahagian lagi pada petang. Berapakah bahagian yang telah diwarnakan?',ch('a',frac(sumc,den)),[
        ch('w1',frac(sumc,den*2),'add_denominators'),ch('w2',frac(Math.abs(x1-x2),den),'operation_selection'),ch('w3',frac(sumc+1,den),'add_denominators')
      ],fractionVisual(sumc,den),'fraction_operation_context','Kedua-dua bahagian ditambah kerana kawasan berlorek bertambah.',['operation_selection','add_denominators'],{a:x1,b:x2,d:den});
    }
  }

  if(c==='identify_improper_fractions_and_mixed_numbers'){
    var den2=pick(rng,[2,3,4,5]),whole=ri(rng,1,3),rem=ri(rng,1,den2-1),imp=whole*den2+rem;
    if(m==='improper_to_mixed')return pack('Tukarkan '+frac(imp,den2)+' kepada nombor bercampur.',ch('a',whole+' '+frac(rem,den2)),[
      ch('w1',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion'),ch('w2',whole+' '+frac(rem,den2+1),'whole_remainder_confusion'),ch('w3',Math.max(0,whole-1)+' '+frac(rem,den2),'whole_remainder_confusion')
    ],null,'convert_improper_to_mixed','Bahagi pengangka dengan penyebut: hasil bahagi ialah nombor bulat, baki ialah pengangka pecahan.',['whole_remainder_confusion'],{imp:imp,d:den2});
    if(m==='mixed_to_improper')return pack('Tukarkan '+whole+' '+frac(rem,den2)+' kepada pecahan tak wajar.',ch('a',frac(imp,den2)),[
      ch('w1',frac(whole+rem,den2),'whole_remainder_confusion'),ch('w2',frac(imp+den2,den2),'whole_remainder_confusion'),ch('w3',frac(imp,den2+1),'whole_remainder_confusion')
    ],null,'convert_mixed_to_improper','Darab nombor bulat dengan penyebut, kemudian tambah pengangka.',['whole_remainder_confusion'],{whole:whole,rem:rem,d:den2});
    if(m==='picture_identify')return pack('Rajah menunjukkan '+whole+' bentuk penuh dan '+rem+' daripada '+den2+' bahagian bentuk seterusnya. Apakah nombor bercampur itu?',ch('a',whole+' '+frac(rem,den2)),[
      ch('w1',frac(imp,den2),'whole_remainder_confusion'),ch('w2',whole+' '+frac(rem,den2+1),'whole_remainder_confusion'),ch('w3',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion')
    ],fractionVisual(rem,den2,whole+1),'identify_mixed_number_from_picture','Kira bentuk penuh dahulu, kemudian bahagian bentuk yang belum penuh.',['whole_remainder_confusion'],{whole:whole,rem:rem,d:den2});
  }

  if(c==='convert_hundredths_fractions_to_decimals'){
    var hn=pick(rng,[5,10,15,20,25,30,35,40,45,50,60,70,75,80,90,95]);
    var dec=decimal2(hn/100);
    if(m==='hundredths_symbolic')return pack(frac(hn,100)+' dalam bentuk perpuluhan ialah?',ch('a',dec),[
      ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2((hn+1)/100),'decimal_place_value')
    ],null,'hundredths_to_decimal','Perseratus berada pada dua tempat di belakang titik perpuluhan.',['decimal_place_value'],{n:hn});
    if(m==='hundred_grid')return pack('Petak seratus ini mempunyai '+hn+' petak berlorek. Apakah nombor perpuluhannya?',ch('a',dec),[
      ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2(Math.min(99,hn+10)/100),'decimal_place_value')
    ],gridVisual(hn),'hundred_grid_to_decimal','Setiap petak ialah satu perseratus.',['decimal_place_value'],{n:hn});
    if(m==='place_value')return pack('Dalam '+dec+', digit '+String(hn).padStart(2,'0').slice(-1)+' berada pada tempat apa?',ch('a','perseratus'),[
      ch('w1','persepuluh','decimal_place_value'),ch('w2','sa','decimal_place_value'),ch('w3','ratus','decimal_place_value')
    ],{kind:'place_value_decimal',value:dec},'decimal_place_value_from_hundredths','Digit kedua selepas titik perpuluhan ialah perseratus.',['decimal_place_value'],{value:dec});
  }

  if(c==='compare_decimals_to_hundredths'){
    var da=ri(rng,10,89)/100,db=ri(rng,10,89)/100;while(Math.abs(da-db)<0.02)db=ri(rng,10,89)/100;
    var sa=da.toFixed(2),sb=db.toFixed(2),sign=da>db?'>':'<';
    if(m==='compare_pair')return pack(sa+' □ '+sb+'. Simbol manakah betul?',ch('a',sign),[
      ch('w1',sign==='>'?'<':'>','compare_decimal_digits'),ch('w2','=','compare_decimal_digits'),ch('w3','≈','compare_decimal_digits')
    ],null,'compare_decimal_pair','Banding nilai persepuluh dahulu, kemudian perseratus.',['compare_decimal_digits'],{a:sa,b:sb});
    if(m==='number_line')return pack('Pada garis nombor, nilai manakah lebih besar?',ch('a',da>db?sa:sb),[
      ch('w1',da>db?sb:sa,'compare_decimal_digits'),ch('w2','Kedua-duanya sama','compare_decimal_digits'),ch('w3','Tidak boleh ditentukan','compare_decimal_digits')
    ],lineVisual([Math.min(da,db),Math.max(da,db)],[sa,sb]),'compare_decimals_number_line','Nombor yang lebih ke kanan pada garis nombor adalah lebih besar.',['compare_decimal_digits'],{a:sa,b:sb});
    if(m==='largest'){
      // Generate four UNIQUE integer hundredths first. Do not de-duplicate after
      // converting to floating point: binary float adjustment can still format
      // two different raw values to the same 2-decimal label.
      var cents=[];
      while(cents.length<4){var cv=ri(rng,10,90);if(cents.indexOf(cv)<0)cents.push(cv);}
      var vals=cents.map(function(x){return x/100;});
      var maxCents=Math.max.apply(null,cents),max=(maxCents/100).toFixed(2);
      var ws=cents.filter(function(v){return v!==maxCents;}).map(function(v){return (v/100).toFixed(2);});
      return pack('Empat botol berisi '+vals.map(function(v){return v.toFixed(2)+' L';}).join(', ')+'. Isipadu manakah paling besar?',ch('a',max+' L'),ws.map(function(v,i){return ch('w'+i,v+' L','compare_decimal_digits');}),null,'select_largest_decimal','Banding semua nilai hingga perseratus.',['compare_decimal_digits'],{values:cents.join(',')});
    }
  }

  if(c==='add_subtract_decimals_to_hundredths'){
    var ia=ri(rng,5,55),ib=ri(rng,5,35),aD=ia/100,bD=ib/100;
    if(m==='add_decimals'){
      var sm=(aD+bD).toFixed(2);return pack(aD.toFixed(2)+' + '+bD.toFixed(2)+' = ?',ch('a',sm),[
        ch('w1',(aD+bD+0.1).toFixed(2),'decimal_alignment'),ch('w2',String(ia+ib),'decimal_alignment'),ch('w3',(Math.abs(aD-bD)).toFixed(2),'decimal_alignment')
      ],{kind:'place_value_decimal_pair',a:aD.toFixed(2),b:bD.toFixed(2),op:'+'},'add_decimals_hundredths','Selarikan titik perpuluhan dan nilai tempat.',['decimal_alignment'],{a:ia,b:ib});
    }
    if(m==='subtract_decimals'){
      var hiD=Math.max(aD,bD)+0.2,loD=Math.min(aD,bD),df=(hiD-loD).toFixed(2);
      return pack(hiD.toFixed(2)+' − '+loD.toFixed(2)+' = ?',ch('a',df),[
        ch('w1',(hiD-loD+0.10).toFixed(2),'decimal_alignment'),ch('w2',(hiD-loD+0.20).toFixed(2),'decimal_alignment'),ch('w3',Math.max(0,hiD-loD-0.10).toFixed(2),'decimal_alignment')
      ],null,'subtract_decimals_hundredths','Selarikan titik perpuluhan sebelum menolak.',['decimal_alignment'],{a:hiD,b:loD});
    }
    if(m==='missing_decimal'){
      var totalD=aD+bD;
      return pack(aD.toFixed(2)+' + □ = '+totalD.toFixed(2)+'. Apakah nombor dalam kotak?',ch('a',bD.toFixed(2)),[
        ch('w1',(bD+0.01).toFixed(2),'decimal_alignment'),ch('w2',(bD+0.02).toFixed(2),'part_whole_confusion'),ch('w3',(bD+0.03).toFixed(2),'decimal_alignment')
      ],barVisual([aD,bD],[aD.toFixed(2),'?']),'missing_addend_decimal','Tolak bahagian diketahui daripada jumlah.',['decimal_alignment'],{a:aD,b:bD,total:totalD});
    }
  }

  if(c==='represent_percent_on_hundred_grid'){
    var pc=pick(rng,[10,20,25,30,40,50,60,70,75,80,90]);
    if(m==='grid_to_percent')return pack('Berapakah peratus petak yang berlorek?',ch('a',pc+'%'),[
      ch('w1',(pc/10)+'%','percent_out_of_100'),ch('w2',Math.min(99,pc+5)+'%','percent_out_of_100'),ch('w3',Math.max(1,pc-5)+'%','percent_out_of_100')
    ],gridVisual(pc),'hundred_grid_to_percent','Daripada 100 petak, bilangan berlorek sama dengan nilai peratus.',['percent_out_of_100'],{shaded:pc});
    if(m==='percent_to_shaded')return pack(pc+'% daripada petak seratus perlu dilorek. Berapa petak perlu dilorek?',ch('a',String(pc)),[
      ch('w1',String(pc/10),'percent_out_of_100'),ch('w2',String(Math.min(99,pc+5)),'percent_out_of_100'),ch('w3',String(Math.max(1,pc-5)),'percent_out_of_100')
    ],gridVisual(0),'percent_to_shaded_count','Peratus bermaksud “daripada seratus”.',['percent_out_of_100'],{percent:pc});
    if(m==='unshaded_percent')return pack(pc+' petak daripada 100 petak telah berlorek. Berapakah peratus yang BELUM berlorek?',ch('a',(100-pc)+'%'),[
      ch('w1',((100-pc)/10)+'%','percent_out_of_100'),ch('w2',Math.min(99,105-pc)+'%','complement_to_100'),ch('w3',Math.max(1,95-pc)+'%','complement_to_100')
    ],gridVisual(pc),'infer_unshaded_percent','Jumlah keseluruhan ialah 100%. Tolak bahagian berlorek.',['complement_to_100'],{shaded:pc});
  }

  if(c==='read_write_percent_1_to_100'){
    var pn=ri(rng,1,100),pw=pctWords(pn);
    if(m==='symbol_to_words')return pack('Bagaimanakah '+pn+'% dibaca?',ch('a',pw),[
      ch('w1',pn+' perpuluhan','percent_notation'),ch('w2',pn+' perseratusan','percent_notation'),ch('w3','seratus '+pn,'percent_notation')
    ],null,'percent_symbol_to_words','Simbol % dibaca “peratus”.',['percent_notation'],{percent:pn});
    if(m==='words_to_symbol')return pack('Tulis “‘'+pw+'” dalam simbol.',ch('a',pn+'%'),[
      ch('w1','0.'+pn,'percent_notation'),ch('w2',pn+'/10','percent_notation'),ch('w3',pn+'‰','percent_notation')
    ],null,'percent_words_to_symbol','Gunakan simbol % selepas nombor.',['percent_notation'],{percent:pn});
    if(m==='number_to_percent'){
      // Keep notation-confusion distractors semantically plausible but display-unique.
      // In particular, 50 out of 100 must not use its complement (also 50%)
      // as a distractor because that collapses the four-choice MCQ.
      var altPercent=pn<=90?pn+10:pn-10;
      return pack(pn+' daripada 100 petak berlorek. Tulis sebagai peratus.',ch('a',pn+'%'),[
        ch('w1',(pn/100).toFixed(2),'percent_notation'),ch('w2',pn+'/100','percent_notation'),ch('w3',altPercent+'%','percent_out_of_100')
      ],gridVisual(pn),'number_out_of_100_to_percent','Bilangan daripada 100 terus menjadi nilai peratus.',['percent_out_of_100'],{percent:pn});
    }
  }

  if(c==='relate_fractions_decimals_percent'){
    var triples=[['1/2','0.50','50%'],['1/4','0.25','25%'],['3/4','0.75','75%'],['1/5','0.20','20%'],['2/5','0.40','40%'],['3/5','0.60','60%'],['4/5','0.80','80%']];
    var tr=pick(rng,triples);
    if(m==='match_triple')return pack('Set manakah menunjukkan nilai yang sama?',ch('a',tr.join(' = ')),[
      ch('w1',tr[0]+' = '+tr[1]+' = '+(parseInt(tr[2])<=80?parseInt(tr[2])+10:parseInt(tr[2])-10)+'%','cross_representation'),ch('w2',tr[0]+' = 0.10 = '+tr[2],'cross_representation'),ch('w3','1/10 = '+tr[1]+' = '+tr[2],'cross_representation')
    ],null,'match_fraction_decimal_percent','Tukar semua kepada satu bentuk yang sama untuk dibandingkan.',['cross_representation'],{triple:tr.join('|')});
    if(m==='find_mismatch')return pack('Yang manakah TIDAK setara dengan '+tr[2]+'?',ch('a',pick(rng,['0.10','1/10','90%'])),[
      ch('w1',tr[0],'cross_representation'),ch('w2',tr[1],'cross_representation'),ch('w3',tr[2],'cross_representation')
    ],null,'find_non_equivalent_representation','Semak pecahan, perpuluhan dan peratus mewakili bahagian yang sama.',['cross_representation'],{target:tr[2]});
    if(m==='grid_bridge'){
      var sh=parseInt(tr[2]);return pack('Petak seratus menunjukkan '+sh+' petak berlorek. Pilih hubungan yang betul.',ch('a',tr.join(' = ')),[
        ch('w1','1/10 = '+tr[1]+' = '+tr[2],'cross_representation'),ch('w2',tr[0]+' = 0.10 = '+tr[2],'cross_representation'),ch('w3',tr[0]+' = '+tr[1]+' = '+(sh<=80?sh+10:sh-10)+'%','cross_representation')
      ],gridVisual(sh),'hundred_grid_fraction_decimal_percent','Gunakan petak seratus sebagai jambatan antara perpuluhan dan peratus.',['cross_representation'],{shaded:sh});
    }
  }

  // D3.T5 — Masa dan Waktu
  if(c==='read_record_time_of_activities'){
    var hh=ri(rng,1,11),mm=pick(rng,[0,15,30,45]);
    if(m==='analog_read')return pack('Apakah waktu yang ditunjukkan oleh jam?',ch('a',clockLabel(hh,mm)),[
      ch('w1',clockLabel(hh,mm===0?30:0),'hour_minute_hand'),ch('w2',clockLabel((hh%12)+1,mm),'hour_minute_hand'),ch('w3',clockLabel(((hh+1)%12)+1,mm),'hour_minute_hand')
    ],clockVisual(hh,mm),'read_analogue_clock','Jarum pendek menunjukkan jam dan jarum panjang menunjukkan minit.',['hour_minute_hand'],{h:hh,m:mm});
    if(m==='digital_words'){
      var words=mm===0?hh+' tepat':mm===30?hh+' setengah':clockLabel(hh,mm);
      return pack('Waktu digital '+clockLabel(hh,mm)+' sepadan dengan yang mana?',ch('a',words),[
        ch('w1',clockLabel((hh%12)+1,mm),'hour_minute_hand'),ch('w2',clockLabel(hh,(mm+15)%60),'hour_minute_hand'),ch('w3',clockLabel(((hh+1)%12)+1,mm),'hour_minute_hand')
      ],null,'digital_time_to_words','Baca jam dahulu, kemudian minit.',['hour_minute_hand'],{h:hh,m:mm});
    }
    if(m==='schedule_activity'){
      var rows=[['Sarapan','7:30'],['Mula kelas','8:00'],['Rehat','10:00'],['Balik','1:00']];
      var target=pick(rng,rows);
      return pack('Berdasarkan jadual, pukul berapakah aktiviti “'+target[0]+'”?',ch('a',target[1]),rows.filter(function(r){return r!==target;}).map(function(r,i){return ch('w'+i,r[1],'schedule_lookup');}),tableVisual(['Aktiviti','Waktu'],rows),'read_activity_schedule','Cari baris aktiviti yang ditanya dan baca waktunya.',['schedule_lookup'],{activity:target[0]});
    }
  }

  if(c==='convert_hours_minutes_seconds'){
    if(m==='hours_minutes'){
      var h2=ri(rng,2,8),am=h2*60;return numPack(h2+' jam = berapa minit?',am,[h2*10,h2*100,am+60],unitVisual('time_units',h2,8,'jam'),'convert_hours_to_minutes','1 jam = 60 minit.',['time_unit_conversion'],null,{h:h2});
    }
    if(m==='minutes_seconds'){
      var min2=ri(rng,2,9),sec=min2*60;return numPack(min2+' minit = berapa saat?',sec,[min2*10,min2*100,sec+60],unitVisual('time_units',min2,9,'minit'),'convert_minutes_to_seconds','1 minit = 60 saat.',['time_unit_conversion'],null,{m:min2});
    }
    if(m==='mixed_time'){
      var mins=ri(rng,2,5)*60+pick(rng,[10,20,30,40,50]),hh2=Math.floor(mins/60),rm=mins%60;
      return pack(mins+' minit bersamaan?',ch('a',hh2+' jam '+rm+' minit'),[
        ch('w1',hh2+' jam '+(rm+10)+' minit','time_unit_conversion'),ch('w2',(hh2+1)+' jam '+rm+' minit','time_unit_conversion'),ch('w3',mins+' jam','time_unit_conversion')
      ],timelineVisual(0,mins,[60,120,180,240]),'convert_minutes_to_hours_minutes','Kumpulkan setiap 60 minit menjadi 1 jam.',['time_unit_conversion'],{mins:mins});
    }
  }

  if(c==='add_subtract_time_values'){
    if(m==='add_durations'){
      var m1=pick(rng,[20,30,40,50,60,70]),m2=pick(rng,[15,25,35,45]),totm=m1+m2;
      return pack(timeLabel(m1)+' + '+timeLabel(m2)+' = ?',ch('a',timeLabel(totm)),[
        ch('w1',timeLabel(Math.max(5,totm-10)),'time_regrouping'),ch('w2',timeLabel(totm+30),'time_regrouping'),ch('w3',String(totm)+' jam','time_regrouping')
      ],timelineVisual(0,totm,[m1]),'add_time_values','Tambah minit; tukar setiap 60 minit kepada 1 jam.',['time_regrouping'],{a:m1,b:m2});
    }
    if(m==='subtract_durations'){
      var t1=pick(rng,[90,120,150,180]),t2=pick(rng,[20,30,45,60]),td=t1-t2;
      return pack(timeLabel(t1)+' − '+timeLabel(t2)+' = ?',ch('a',timeLabel(td)),[
        ch('w1',timeLabel(t1+t2),'operation_selection'),ch('w2',timeLabel(Math.max(5,td-15)),'time_regrouping'),ch('w3',timeLabel(td+30),'time_regrouping')
      ],null,'subtract_time_values','Samakan unit masa sebelum menolak.',['time_regrouping'],{a:t1,b:t2});
    }
    if(m==='difference_timeline'){
      var st=8*60+pick(rng,[0,15,30]),en=st+pick(rng,[45,60,75,90]),dur=en-st;
      return pack('Aktiviti bermula '+clockLabel(Math.floor(st/60),st%60)+' dan tamat '+clockLabel(Math.floor(en/60),en%60)+'. Berapa lama aktiviti itu?',ch('a',timeLabel(dur)),[
        ch('w1',timeLabel(dur+30),'elapsed_time'),ch('w2',timeLabel(Math.max(15,dur-15)),'elapsed_time'),ch('w3',clockLabel(Math.floor(en/60),en%60),'elapsed_time')
      ],timelineVisual(st,en,[st,en]),'find_time_difference','Cari jarak masa dari waktu mula ke waktu tamat.',['elapsed_time'],{start:st,end:en});
    }
  }

  if(c==='solve_mixed_addition_subtraction_time'){
    if(m==='schedule_two_step'){
      var start=9*60,act=pick(rng,[45,60,75]),br=pick(rng,[15,30]),end=start+act+br;
      return pack('Program bermula 9:00. Aktiviti pertama mengambil '+act+' minit, diikuti rehat '+br+' minit. Pukul berapakah selepas kedua-duanya?',ch('a',clockLabel(Math.floor(end/60),end%60)),[
        ch('w1',clockLabel(Math.floor((start+act)/60),(start+act)%60),'operation_order'),ch('w2',clockLabel(Math.floor((end+30)/60),(end+30)%60),'operation_order'),ch('w3','9:00','operation_order')
      ],timelineVisual(start,end,[start+act]),'two_step_time_schedule','Tambah kedua-dua tempoh kepada waktu mula mengikut urutan.',['operation_order'],{act:act,break:br});
    }
    if(m==='duration_adjustment'){
      var planned=pick(rng,[90,120,150]),used=pick(rng,[30,45,60]),extra=pick(rng,[15,30]),remain=planned-used+extra;
      return pack('Masa yang diperuntukkan ialah '+timeLabel(planned)+'. '+timeLabel(used)+' telah digunakan, kemudian masa ditambah '+timeLabel(extra)+'. Berapa masa yang tinggal?',ch('a',timeLabel(remain)),[
        ch('w1',timeLabel(planned-used-extra),'operation_order'),ch('w2',timeLabel(planned+used+extra),'operation_order'),ch('w3',timeLabel(planned-used),'operation_order')
      ],timelineVisual(0,planned+extra,[used,planned]),'mixed_time_adjustment','Tolak masa digunakan, kemudian tambah masa tambahan.',['operation_order'],{planned:planned,used:used,extra:extra});
    }
    if(m==='choose_time_expression'){
      return pack('Sebuah latihan diberi 120 minit. 35 minit digunakan, kemudian guru menambah 20 minit. Ungkapan manakah mencari masa yang tinggal?',ch('a','120 − 35 + 20'),[
        ch('w1','120 + 35 + 20','operation_order'),ch('w2','120 − 35 − 20','operation_order'),ch('w3','120 + 35 − 20','operation_order')
      ],timelineVisual(0,140,[35,120]),'choose_expression_for_time_problem','Padankan “digunakan” dengan tolak dan “ditambah” dengan tambah.',['operation_order'],{base:120,used:35,extra:20});
    }
  }

  if(c==='multiply_divide_time'){
    if(m==='repeat_duration'){
      var rep=ri(rng,2,5),dm=pick(rng,[10,15,20,30]),totalT=rep*dm;
      return pack(rep+' sesi mengambil '+dm+' minit setiap satu. Jumlah masa?',ch('a',timeLabel(totalT)),[
        ch('w1',timeLabel(dm+rep),'time_multiplication'),ch('w2',timeLabel(totalT+dm),'time_multiplication'),ch('w3',timeLabel(Math.max(5,totalT-dm)),'time_multiplication')
      ],groupingVisual(rep,dm),'multiply_time_duration','Darab bilangan sesi dengan masa setiap sesi.',['time_multiplication'],{groups:rep,each:dm});
    }
    if(m==='share_duration'){
      var gr=ri(rng,2,6),ea=pick(rng,[10,15,20]),tt=gr*ea;
      return pack(timeLabel(tt)+' dibahagi sama rata kepada '+gr+' aktiviti. Setiap aktiviti berapa lama?',ch('a',timeLabel(ea)),[
        ch('w1',timeLabel(gr),'time_division'),ch('w2',timeLabel(ea+5),'time_division'),ch('w3',timeLabel(tt),'time_division')
      ],groupingVisual(gr,ea),'divide_time_duration','Bahagi jumlah masa dengan bilangan aktiviti.',['time_division'],{groups:gr,each:ea});
    }
    if(m==='missing_groups'){
      var eachT=pick(rng,[10,15,20]),groupsT=ri(rng,3,6),totT=eachT*groupsT;
      return numPack('Jumlah masa '+totT+' minit. Setiap sesi '+eachT+' minit. Ada berapa sesi?',groupsT,[eachT,totT,groupsT+1],groupingVisual(groupsT,eachT),'inverse_time_groups','Bahagi jumlah masa dengan masa setiap sesi.',['multiply_divide_inverse'],null,{total:totT,each:eachT});
    }
  }

  // D3.T6 — generic measurement builders
  function measurementConvert(kind,big,small,bigName,smallName,mode){
    var whole=ri(rng,1,6),remU=pick(rng,[100,200,300,400,500,600,700,800,900]),smallTotal=whole*big+remU;
    if(mode===kind+'_to_small')return pack(whole+' '+bigName+' = ?',ch('a',(whole*big)+' '+smallName),[
      ch('w1',(whole*10)+' '+smallName,'unit_conversion'),ch('w2',whole+' '+smallName,'unit_conversion'),ch('w3',(whole*big+100)+' '+smallName,'unit_conversion')
    ],unitVisual(kind,whole,6,bigName),'convert_'+kind+'_small','Gunakan hubungan '+big+' '+smallName+' = 1 '+bigName+'.',['unit_conversion'],{whole:whole});
    return null;
  }

  if(c==='convert_metres_centimetres'){
    var wm=ri(rng,1,8),rc=pick(rng,[10,20,30,40,50,60,70,80,90]),cm=wm*100+rc;
    if(m==='m_to_cm')return numPack(wm+' m = berapa cm?',wm*100,[wm*10,wm,wm*100+100],unitVisual('ruler',wm,8,'m'),'metres_to_centimetres','1 m = 100 cm.',['length_unit_conversion'],function(x){return x+' cm';},{m:wm});
    if(m==='cm_to_m_cm')return pack(cm+' cm bersamaan?',ch('a',wm+' m '+rc+' cm'),[
      ch('w1',(wm+1)+' m '+rc+' cm','length_unit_conversion'),ch('w2',wm+' m '+(rc+10)+' cm','length_unit_conversion'),ch('w3',cm+' m','length_unit_conversion')
    ],unitVisual('ruler',cm,900,'cm'),'centimetres_to_mixed_metres','Kumpulkan setiap 100 cm menjadi 1 m.',['length_unit_conversion'],{cm:cm});
    if(m==='equivalent_length')return pack('Yang manakah sama dengan '+wm+' m '+rc+' cm?',ch('a',cm+' cm'),[
      ch('w1',(wm*10+rc)+' cm','length_unit_conversion'),ch('w2',(cm+100)+' cm','length_unit_conversion'),ch('w3',(cm-10)+' cm','length_unit_conversion')
    ],unitVisual('ruler',cm,900,'cm'),'choose_equivalent_length','Tukar meter kepada sentimeter dahulu.',['length_unit_conversion'],{m:wm,cm:rc});
  }

  if(c==='add_subtract_lengths'){
    var la=ri(rng,120,450),lb=ri(rng,40,180);
    if(m==='add_lengths')return numPack(la+' cm + '+lb+' cm = ?',la+lb,[la-lb,la+lb+100,la+lb-10],unitVisual('ruler',la+lb,700,'cm'),'add_length_values','Unit sama, jadi tambah nilai ukuran.',['unit_alignment'],function(x){return x+' cm';},{a:la,b:lb});
    if(m==='subtract_lengths')return numPack(la+' cm − '+lb+' cm = ?',la-lb,[la+lb,la-lb+10,Math.max(1,la-lb-10)],null,'subtract_length_values','Unit sama, jadi tolak nilai ukuran.',['unit_alignment'],function(x){return x+' cm';},{a:la,b:lb});
    if(m==='missing_length')return numPack('Jumlah panjang '+(la+lb)+' cm. Satu bahagian '+la+' cm. Panjang bahagian satu lagi?',lb,[la,la+lb,Math.abs(la-lb)],barVisual([la,lb],[la+' cm','?']),'find_missing_length','Tolak bahagian diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' cm';},{whole:la+lb,part:la});
  }

  if(c==='multiply_divide_lengths'){
    var lg=ri(rng,2,6),le=pick(rng,[20,25,30,40,50]),lt=lg*le;
    if(m==='repeat_length')return numPack(lg+' tali, setiap satu '+le+' cm. Jumlah panjang?',lt,[le+lg,lt+le,Math.max(1,lt-le)],barVisual(new Array(lg).fill(le),[]),'multiply_length','Darab bilangan tali dengan panjang setiap tali.',['multiply_divide_inverse'],function(x){return x+' cm';},{g:lg,e:le});
    if(m==='share_length')return numPack(lt+' cm dipotong sama rata kepada '+lg+' bahagian. Setiap bahagian?',le,[lg,le+10,lt],barVisual(new Array(lg).fill(le),[]),'divide_length','Bahagi jumlah panjang dengan bilangan bahagian.',['multiply_divide_inverse'],function(x){return x+' cm';},{g:lg,e:le});
    if(m==='inverse_length')return numPack('□ × '+le+' cm = '+lt+' cm. Berapakah □?',lg,[le,lt,lg+1],unitVisual('ruler',lt,300,'cm'),'inverse_length_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:lg,e:le});
  }

  if(c==='convert_kilograms_grams'){
    var kg=ri(rng,1,6),rg=pick(rng,[100,200,300,400,500,600,700,800,900]),grams=kg*1000+rg;
    if(m==='kg_to_g')return numPack(kg+' kg = berapa g?',kg*1000,[kg*100,kg*10,kg*1000+1000],unitVisual('scale',kg,6,'kg'),'kilograms_to_grams','1 kg = 1000 g.',['mass_unit_conversion'],function(x){return x+' g';},{kg:kg});
    if(m==='g_to_kg_g')return pack(grams+' g bersamaan?',ch('a',kg+' kg '+rg+' g'),[
      ch('w1',(kg+1)+' kg '+rg+' g','mass_unit_conversion'),ch('w2',kg+' kg '+(rg+100)+' g','mass_unit_conversion'),ch('w3',grams+' kg','mass_unit_conversion')
    ],unitVisual('scale',grams,7000,'g'),'grams_to_mixed_kilograms','Kumpulkan setiap 1000 g menjadi 1 kg.',['mass_unit_conversion'],{g:grams});
    if(m==='equivalent_mass')return pack('Yang manakah sama dengan '+kg+' kg '+rg+' g?',ch('a',grams+' g'),[
      ch('w1',(kg*100+rg)+' g','mass_unit_conversion'),ch('w2',(grams+1000)+' g','mass_unit_conversion'),ch('w3',(grams-100)+' g','mass_unit_conversion')
    ],unitVisual('scale',grams,7000,'g'),'choose_equivalent_mass','Tukar kilogram kepada gram dahulu.',['mass_unit_conversion'],{kg:kg,g:rg});
  }

  if(c==='add_subtract_masses'){
    var ma=ri(rng,1200,4500),mb=ri(rng,300,1100);
    if(m==='add_masses')return numPack(ma+' g + '+mb+' g = ?',ma+mb,[ma-mb,ma+mb+1000,ma+mb-100],unitVisual('scale',ma+mb,6000,'g'),'add_mass_values','Unit sama, jadi tambah nilai jisim.',['unit_alignment'],function(x){return x+' g';},{a:ma,b:mb});
    if(m==='subtract_masses')return numPack(ma+' g − '+mb+' g = ?',ma-mb,[ma+mb,ma-mb+100,Math.max(1,ma-mb-100)],null,'subtract_mass_values','Unit sama, jadi tolak nilai jisim.',['unit_alignment'],function(x){return x+' g';},{a:ma,b:mb});
    if(m==='missing_mass')return numPack('Jumlah jisim '+(ma+mb)+' g. Satu objek '+ma+' g. Jisim objek satu lagi?',mb,[ma,ma+mb,Math.abs(ma-mb)],barVisual([ma,mb],[ma+' g','?']),'find_missing_mass','Tolak jisim diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' g';},{whole:ma+mb,part:ma});
  }

  if(c==='multiply_divide_masses'){
    var mg=ri(rng,2,6),me=pick(rng,[100,150,200,250,300]),mt=mg*me;
    if(m==='repeat_mass')return numPack(mg+' pek, setiap satu '+me+' g. Jumlah jisim?',mt,[me+mg,mt+me,Math.max(1,mt-me)],groupingVisual(mg,me),'multiply_mass','Darab bilangan pek dengan jisim setiap pek.',['multiply_divide_inverse'],function(x){return x+' g';},{g:mg,e:me});
    if(m==='share_mass')return numPack(mt+' g dibahagi sama rata kepada '+mg+' bekas. Setiap bekas?',me,[mg,me+50,mt],groupingVisual(mg,me),'divide_mass','Bahagi jumlah jisim dengan bilangan bekas.',['multiply_divide_inverse'],function(x){return x+' g';},{g:mg,e:me});
    if(m==='inverse_mass')return numPack('□ × '+me+' g = '+mt+' g. Berapakah □?',mg,[me,mt,mg+1],unitVisual('scale',mt,2000,'g'),'inverse_mass_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:mg,e:me});
  }

  if(c==='convert_litres_millilitres'){
    var li=ri(rng,1,6),rml=pick(rng,[100,200,300,400,500,600,700,800,900]),ml=li*1000+rml;
    if(m==='l_to_ml')return numPack(li+' L = berapa mL?',li*1000,[li*100,li*10,li*1000+1000],unitVisual('container',li,6,'L'),'litres_to_millilitres','1 L = 1000 mL.',['volume_unit_conversion'],function(x){return x+' mL';},{l:li});
    if(m==='ml_to_l_ml')return pack(ml+' mL bersamaan?',ch('a',li+' L '+rml+' mL'),[
      ch('w1',(li+1)+' L '+rml+' mL','volume_unit_conversion'),ch('w2',li+' L '+(rml+100)+' mL','volume_unit_conversion'),ch('w3',ml+' L','volume_unit_conversion')
    ],unitVisual('container',ml,7000,'mL'),'millilitres_to_mixed_litres','Kumpulkan setiap 1000 mL menjadi 1 L.',['volume_unit_conversion'],{ml:ml});
    if(m==='equivalent_volume')return pack('Yang manakah sama dengan '+li+' L '+rml+' mL?',ch('a',ml+' mL'),[
      ch('w1',(li*100+rml)+' mL','volume_unit_conversion'),ch('w2',(ml+1000)+' mL','volume_unit_conversion'),ch('w3',(ml-100)+' mL','volume_unit_conversion')
    ],unitVisual('container',ml,7000,'mL'),'choose_equivalent_volume','Tukar liter kepada mililiter dahulu.',['volume_unit_conversion'],{l:li,ml:rml});
  }

  if(c==='add_subtract_liquid_volumes'){
    var va=ri(rng,1200,4500),vb=ri(rng,300,1100);
    if(m==='add_volumes')return numPack(va+' mL + '+vb+' mL = ?',va+vb,[va-vb,va+vb+1000,va+vb-100],unitVisual('container',va+vb,6000,'mL'),'add_liquid_volumes','Unit sama, jadi tambah nilai isipadu.',['unit_alignment'],function(x){return x+' mL';},{a:va,b:vb});
    if(m==='subtract_volumes')return numPack(va+' mL − '+vb+' mL = ?',va-vb,[va+vb,va-vb+100,Math.max(1,va-vb-100)],null,'subtract_liquid_volumes','Unit sama, jadi tolak nilai isipadu.',['unit_alignment'],function(x){return x+' mL';},{a:va,b:vb});
    if(m==='missing_volume')return numPack('Jumlah air '+(va+vb)+' mL. Satu bekas mempunyai '+va+' mL. Berapa mL dalam bekas satu lagi?',vb,[va,va+vb,Math.abs(va-vb)],barVisual([va,vb],[va+' mL','?']),'find_missing_liquid_volume','Tolak isipadu diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' mL';},{whole:va+vb,part:va});
  }

  if(c==='multiply_divide_liquid_volumes'){
    var vg=ri(rng,2,6),ve=pick(rng,[100,150,200,250,300]),vt=vg*ve;
    if(m==='repeat_volume')return numPack(vg+' botol, setiap satu '+ve+' mL. Jumlah isipadu?',vt,[ve+vg,vt+ve,Math.max(1,vt-ve)],unitVisual('container',ve,400,'mL'),'multiply_liquid_volume','Darab bilangan botol dengan isipadu setiap botol.',['multiply_divide_inverse'],function(x){return x+' mL';},{g:vg,e:ve});
    if(m==='share_volume')return numPack(vt+' mL dibahagi sama rata kepada '+vg+' cawan. Setiap cawan?',ve,[vg,ve+50,vt],groupingVisual(vg,ve),'divide_liquid_volume','Bahagi jumlah isipadu dengan bilangan cawan.',['multiply_divide_inverse'],function(x){return x+' mL';},{g:vg,e:ve});
    if(m==='inverse_volume')return numPack('□ × '+ve+' mL = '+vt+' mL. Berapakah □?',vg,[ve,vt,vg+1],groupingVisual(vg,ve),'inverse_liquid_volume_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:vg,e:ve});
  }

  // D3.T9 — Pengurusan Data
  if(c==='collect_classify_organize_data'){
    if(m==='tally_count'){
      var counts=[ri(rng,3,9),ri(rng,3,9),ri(rng,3,9)],idx=ri(rng,0,2),labs=['Merah','Biru','Hijau'];
      return numPack('Berapakah bilangan item bagi kategori '+labs[idx]+'?',counts[idx],[counts[(idx+1)%3],counts[(idx+2)%3],counts[idx]+1],tableVisual(['Kategori','Gundal'],labs.map(function(l,i){return[l,'|||||'.slice(0,counts[i]%5)+(counts[i]>=5?' + '+(counts[i]-5):'')];})),'count_from_tally','Kira tanda gundal untuk kategori yang ditanya sahaja.',['tally_misread'],null,{category:labs[idx],count:counts[idx]});
    }
    if(m==='classify_list'){
      var items=['epal','pisang','epal','oren','pisang','epal','oren','epal'],target='epal',ct=items.filter(function(x){return x===target;}).length;
      return numPack('Data: '+items.join(', ')+'. Berapa item dalam kategori “'+target+'”?',ct,[2,3,5],{kind:'classification',items:items},'classify_and_count_items','Kumpulkan item yang sama sebelum mengira.',['classification_rule'],null,{target:target});
    }
    if(m==='table_statement'){
      var rws=[['A',8],['B',5],['C',11]];
      return pack('Pernyataan manakah betul berdasarkan jadual?',ch('a','Kategori C paling banyak.'),[
        ch('w1','Kategori B paling banyak.','table_comparison'),ch('w2','Kategori A paling sedikit.','table_comparison'),ch('w3','A dan C mempunyai bilangan yang sama.','table_comparison')
      ],tableVisual(['Kategori','Bilangan'],rws),'interpret_organized_table','Banding nilai setiap baris, bukan nama kategori.',['table_comparison'],{A:8,B:5,C:11});
    }
  }

  if(c==='read_interpret_pie_chart'){
    var labels=['A','B','C','D'],vals=[50,25,15,10];
    if(m==='largest_sector')return pack('Kategori manakah mempunyai bahagian paling besar?',ch('a','A'),[
      ch('w1','B','pie_sector_size'),ch('w2','C','pie_sector_size'),ch('w3','D','pie_sector_size')
    ],pieVisual(labels,vals),'identify_largest_pie_category','Sektor yang paling besar mewakili nilai paling besar.',['pie_sector_size'],{values:vals.join(',')});
    if(m==='category_count'){
      var total=40,cat='B',ansC=total*25/100;
      return numPack('Carta pai menunjukkan 25% daripada '+total+' murid memilih kategori B. Berapa orang murid itu?',ansC,[25,total-ansC,ansC+5],pieVisual(labels,vals),'derive_count_from_pie','Cari 25% daripada jumlah keseluruhan.',['part_whole_confusion'],null,{total:total,percent:25});
    }
    if(m==='difference_categories'){
      return pack('Apakah beza peratus antara kategori A dan B?',ch('a','25%'),[
        ch('w1','75%','pie_sector_size'),ch('w2','50%','pie_sector_size'),ch('w3','15%','pie_sector_size')
      ],pieVisual(labels,vals),'compare_pie_categories','Tolak peratus kategori yang lebih kecil daripada yang lebih besar.',['pie_sector_size'],{A:50,B:25});
    }
  }

  if(c==='relate_pictograph_bar_chart_pie_chart'){
    var labs2=['A','B','C'],v2=[4,2,2];
    if(m==='pictograph_to_bar')return pack('Piktograf menunjukkan A=4, B=2, C=2. Bar manakah sepatutnya paling tinggi?',ch('a','A'),[
      ch('w1','B','representation_mapping'),ch('w2','C','representation_mapping'),ch('w3','Semua sama','representation_mapping')
    ],pictographVisual(labs2,v2,1),'relate_pictograph_to_bar','Ketinggian bar perlu mengikut bilangan simbol dalam piktograf.',['representation_mapping'],{values:v2.join(',')});
    if(m==='bar_to_pie')return pack('Carta palang menunjukkan A=4, B=2, C=2. Apakah bahagian carta pai untuk A?',ch('a','1/2'),[
      ch('w1','1/4','representation_mapping'),ch('w2','1/3','representation_mapping'),ch('w3','3/4','representation_mapping')
    ],barChartVisual(labs2,v2),'relate_bar_to_pie','Jumlah data ialah 8; A mempunyai 4 daripada 8.',['representation_mapping'],{values:v2.join(',')});
    if(m==='same_data_statement')return pack('Piktograf dan carta palang mewakili data yang sama. Pernyataan manakah mesti kekal benar?',ch('a','Kategori dengan bilangan terbesar tetap kategori yang sama.'),[
      ch('w1','Semua bar mesti sama tinggi.','representation_mapping'),ch('w2','Bilangan kategori mesti berubah.','representation_mapping'),ch('w3','Jumlah data mesti menjadi dua kali ganda.','representation_mapping')
    ],{kind:'multi_chart',pictograph:pictographVisual(labs2,v2,1),bar:barChartVisual(labs2,v2)},'compare_chart_representations','Bentuk carta boleh berubah, tetapi data asal tidak berubah.',['representation_mapping'],{values:v2.join(',')});
  }

  throw new Error('d3.p0Kssr unsupported '+c+' / '+m);
});
})();
  })(registerGenerator);

  // ---- generators/geometry/kssr-diversity.js ----
  (function (registerGenerator) {
// questions/v2/generators/geometry/kssr-diversity.js
// Phase 2D-3: KSSR-style task variety for D3 Topic 7.
// Pure authored source: no Node/browser globals. Uses structured ids for truth;
// Bahasa Melayu labels are display-only.
(function () {
  'use strict';

  var PRISMS = {
    square_prism: { labelMs:'Prisma Segi Empat Sama', baseShapeId:'square', baseLabelMs:'segi empat sama' },
    rectangular_prism: { labelMs:'Prisma Segi Empat Tepat', baseShapeId:'rectangle', baseLabelMs:'segi empat tepat' },
    triangular_prism: { labelMs:'Prisma Segi Tiga', baseShapeId:'triangle', baseLabelMs:'segi tiga' }
  };
  var PRISM_IDS = Object.keys(PRISMS);

  var NON_PRISMS = {
    cone: { labelMs:'Kon', reasonMs:'Mempunyai permukaan melengkung, satu tapak bulat dan meruncing ke satu titik.' },
    sphere: { labelMs:'Sfera', reasonMs:'Permukaannya melengkung sepenuhnya dan tidak mempunyai dua tapak rata yang sama.' },
    cylinder: { labelMs:'Silinder', reasonMs:'Mempunyai permukaan melengkung walaupun dua tapaknya sama bentuk.' },
    square_pyramid: { labelMs:'Piramid Tapak Segi Empat Sama', reasonMs:'Mempunyai satu tapak dan permukaan sisinya bertemu pada satu puncak.' },
    triangular_pyramid: { labelMs:'Piramid Tapak Segi Tiga', reasonMs:'Mempunyai satu tapak dan permukaan sisinya bertemu pada satu puncak.' }
  };
  var NON_PRISM_IDS = Object.keys(NON_PRISMS);

  var POLYGONS = {
    pentagon: { sides:5, labelMs:'Pentagon Sekata' },
    hexagon: { sides:6, labelMs:'Heksagon Sekata' },
    heptagon: { sides:7, labelMs:'Heptagon Sekata' },
    octagon: { sides:8, labelMs:'Oktagon Sekata' }
  };
  var POLYGON_IDS = Object.keys(POLYGONS);

  // Angles match the canonical geometry2d renderer orientation.
  var SYMMETRY = {
    isosceles_triangle: { labelMs:'segi tiga sama kaki', shapeType:'isosceles_triangle', sides:null, axisAngles:[90], distractorAngles:[0,30,60,120,150] },
    rectangle: { labelMs:'segi empat tepat', shapeType:'rectangle', sides:null, axisAngles:[0,90], distractorAngles:[30,45,60,120,135,150] },
    equilateral_triangle: { labelMs:'segi tiga sama sisi', shapeType:'regular_polygon', sides:3, axisAngles:[30,90,150], distractorAngles:[0,60,120] },
    square: { labelMs:'segi empat sama', shapeType:'regular_polygon', sides:4, axisAngles:[0,45,90,135], distractorAngles:[22.5,67.5,112.5,157.5] },
    regular_pentagon: { labelMs:'pentagon sekata', shapeType:'regular_polygon', sides:5, axisAngles:[18,54,90,126,162], distractorAngles:[0,36,72,108,144] },
    regular_hexagon: { labelMs:'heksagon sekata', shapeType:'regular_polygon', sides:6, axisAngles:[0,30,60,90,120,150], distractorAngles:[15,45,75,105,135,165] }
  };
  var SYMMETRY_IDS = Object.keys(SYMMETRY);

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var out=arr.slice();
    for(var i=out.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=out[i];out[i]=out[j];out[j]=t;}
    return out;
  }
  function sampleUnique(rng, arr, n) { return shuffle(rng, arr).slice(0,n); }
  function choice(id,labelMs,tag){return {id:String(id),labelMs:String(labelMs),misconceptionTag:tag||null};}
  function fp(archetype,answerId,details){return archetype+'::'+String(answerId)+'::'+(details||[]).join(',');}
  function polygonLabel(id){return POLYGONS[id].labelMs;}
  function repeatUnit(unit,length){var out=[];for(var i=0;i<length;i++)out.push(unit[i%unit.length]);return out;}

  // -------------------------------------------------------------------------
  // Prisma: richer property/reasoning evidence using the existing geometry SVG.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.prismKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'feature_statement';

    if(mode==='feature_statement'){
      var id=pick(rng,PRISM_IDS),p=PRISMS[id];
      var otherBase=pick(rng,PRISM_IDS.filter(function(x){return PRISMS[x].baseShapeId!==p.baseShapeId;}));
      var ans=choice('correct','Mempunyai 2 tapak berbentuk '+p.baseLabelMs+' yang sama saiz dan selari.');
      var dis=[
        choice('one_base','Mempunyai 1 tapak berbentuk '+p.baseLabelMs+' dan satu puncak.','base_count_confusion'),
        choice('curved','Mempunyai satu permukaan melengkung.','prism_vs_non_prism'),
        choice('wrong_base','Mempunyai 2 tapak berbentuk '+PRISMS[otherBase].baseLabelMs+' yang sama saiz dan selari.','base_shape_confusion')
      ];
      return {
        value:{promptMs:'Pernyataan manakah yang betul tentang prisma ini?',answer:ans,visual:{layout:'single',figures:[{id:'main',solidId:id}]}},
        distractors:shuffle(rng,dis),
        meta:{archetype:'prism_feature_statement',misconceptionTargets:['base_count_confusion','base_shape_confusion','prism_vs_non_prism'],semanticProperties:{solidId:id,baseShapeId:p.baseShapeId,baseCount:2},fingerprint:fp('prism_feature_statement',id,[p.baseShapeId])}
      };
    }

    if(mode==='why_prism'){
      var id2=pick(rng,PRISM_IDS);
      var ans2=choice('two_equal_parallel_bases','Mempunyai 2 tapak yang sama bentuk, sama saiz dan selari serta tiada permukaan melengkung.');
      var dis2=[
        choice('one_base_apex','Mempunyai 1 tapak dan semua permukaan sisi bertemu pada satu puncak.','prism_vs_non_prism'),
        choice('two_round_curved','Mempunyai 2 tapak bulat dan satu permukaan melengkung.','prism_vs_non_prism'),
        choice('fully_curved','Semua permukaannya melengkung.','prism_vs_non_prism')
      ];
      return {
        value:{promptMs:'Mengapakah pepejal di bawah ialah prisma?',answer:ans2,visual:{layout:'single',figures:[{id:'main',solidId:id2}]}},
        distractors:shuffle(rng,dis2),
        meta:{archetype:'explain_why_prism',misconceptionTargets:['prism_vs_non_prism'],semanticProperties:{solidId:id2,criterion:'two_equal_parallel_bases_no_curved_surface'},fingerprint:fp('why_prism',id2,[])}
      };
    }

    if(mode==='why_not_prism'){
      var nId=pick(rng,NON_PRISM_IDS),n=NON_PRISMS[nId];
      var ans3=choice('reason:'+nId,n.reasonMs);
      var dis3=[
        choice('prism_rule','Mempunyai 2 tapak yang sama bentuk, sama saiz dan selari serta tiada permukaan melengkung.','prism_vs_non_prism'),
        choice('flat_no_apex','Semua permukaannya rata dan tidak mempunyai puncak.','prism_vs_non_prism'),
        choice('rectangle_bases','Mempunyai 2 tapak segi empat tepat yang sama saiz.','base_shape_confusion')
      ];
      return {
        value:{promptMs:'Ciri manakah menunjukkan pepejal ini BUKAN prisma?',answer:ans3,visual:{layout:'single',figures:[{id:'main',solidId:nId}]}},
        distractors:shuffle(rng,dis3),
        meta:{archetype:'explain_why_not_prism',misconceptionTargets:['prism_vs_non_prism','base_shape_confusion'],semanticProperties:{solidId:nId,nonPrismReason:n.reasonMs},fingerprint:fp('why_not_prism',nId,[])}
      };
    }

    throw new Error('geometry.prismKssrDiversity: unknown mode "'+mode+'"');
  });

  // -------------------------------------------------------------------------
  // Poligon: textbook-style clue/reasoning + less abstract pattern position.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.polygonKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'relative_clue';

    if(mode==='relative_clue'){
      var scenarios=[
        {target:'pentagon',prompt:'Satu poligon sekata mempunyai 1 bucu kurang daripada heksagon. Apakah nama bentuk itu?'},
        {target:'hexagon',prompt:'Satu poligon sekata mempunyai 1 bucu lebih daripada pentagon. Apakah nama bentuk itu?'},
        {target:'heptagon',prompt:'Wong menggunting poligon sekata yang mempunyai 2 bucu lebih daripada pentagon. Apakah nama bentuk itu?'},
        {target:'octagon',prompt:'Satu poligon sekata mempunyai 2 bucu lebih daripada heksagon. Apakah nama bentuk itu?'}
      ];
      var sc=pick(rng,scenarios),ans=choice(sc.target,polygonLabel(sc.target));
      var dis=POLYGON_IDS.filter(function(id){return id!==sc.target;}).map(function(id){return choice(id,polygonLabel(id),'polygon_name_side_count_confusion');});
      return {
        value:{promptMs:sc.prompt,answer:ans,visual:null},distractors:shuffle(rng,dis),
        meta:{archetype:'infer_polygon_from_relative_clue',misconceptionTargets:['polygon_name_side_count_confusion'],semanticProperties:{polygonId:sc.target,sideCount:POLYGONS[sc.target].sides},fingerprint:fp('polygon_relative',sc.target,[sc.prompt])}
      };
    }

    if(mode==='why_regular'){
      var pId=pick(rng,POLYGON_IDS),p=POLYGONS[pId];
      var ans2=choice('regular_rule','Semua sisi lurus sama panjang, semua sudut sama besar dan bentuknya tertutup.');
      var dis2=[
        choice('side_count_only','Mempunyai '+p.sides+' sisi, jadi semua bentuk '+p.sides+' sisi ialah poligon sekata.','regularity_rule_confusion'),
        choice('curved','Mempunyai sekurang-kurangnya satu sisi melengkung.','regularity_rule_confusion'),
        choice('unequal','Panjang sisi-sisinya boleh berbeza asalkan bentuknya tertutup.','regularity_rule_confusion')
      ];
      return {
        value:{promptMs:'Mengapakah bentuk di bawah ialah poligon sekata?',answer:ans2,visual:{kind:'polygon_single',figures:[{id:'main',polygonId:pId,sides:p.sides,regular:true}]}},distractors:shuffle(rng,dis2),
        meta:{archetype:'explain_regular_polygon',misconceptionTargets:['regularity_rule_confusion','polygon_name_side_count_confusion'],semanticProperties:{polygonId:pId,sideCount:p.sides,regular:true},fingerprint:fp('why_regular_polygon',pId,[])}
      };
    }

    if(mode==='pattern_position'){
      var unitLength=rng()<0.55?2:3;
      var unit=sampleUnique(rng,POLYGON_IDS,unitLength);
      var shown=repeatUnit(unit,unit.length*2);
      var targetPos=7+Math.floor(rng()*4); // 7th..10th, one-based
      var expected=unit[(targetPos-1)%unit.length];
      var ans3=choice(expected,polygonLabel(expected));
      var dis3=POLYGON_IDS.filter(function(id){return id!==expected;}).map(function(id){return choice(id,polygonLabel(id),'pattern_position_confusion');});
      return {
        value:{promptMs:'Alya menghias bingkai dengan corak ini. Jika corak diteruskan, bentuk pada tempat ke-'+targetPos+' ialah apa?',answer:ans3,visual:{kind:'polygon_pattern',sequence:shown,showQuestionMark:false}},distractors:shuffle(rng,dis3),
        meta:{archetype:'find_polygon_at_pattern_position',misconceptionTargets:['pattern_position_confusion','pattern_unit_confusion'],semanticProperties:{unit:unit.slice(),shownSequence:shown.slice(),targetPosition:targetPos,expectedNextId:expected},fingerprint:fp('pattern_position',expected,unit.concat([String(targetPos)]))}
      };
    }

    throw new Error('geometry.polygonKssrDiversity: unknown mode "'+mode+'"');
  });

  // -------------------------------------------------------------------------
  // Simetri: folding context + cross-shape axis-count choice.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.symmetryKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'fold_card';

    if(mode==='fold_card'){
      var shapeId=pick(rng,SYMMETRY_IDS),shape=SYMMETRY[shapeId];
      var answerAngle=pick(rng,shape.axisAngles);
      var wrongAngles=sampleUnique(rng,shape.distractorAngles,3);
      var mixed=shuffle(rng,[answerAngle].concat(wrongAngles)),letters=['A','B','C','D'];
      var candidates=mixed.map(function(angle,i){return{id:'axis_'+letters[i],labelMs:'Garis '+letters[i],angle:angle};});
      var correct=candidates.filter(function(c){return c.angle===answerAngle;})[0];
      var ans=choice(correct.id,correct.labelMs);
      var dis=candidates.filter(function(c){return c.id!==correct.id;}).map(function(c){return choice(c.id,c.labelMs,'symmetry_axis_orientation_confusion');});
      return {
        value:{promptMs:'Nadia mahu melipat kad ini supaya kedua-dua bahagiannya bertindih tepat. Garis manakah sesuai sebagai garis lipatan?',answer:ans,visual:{kind:'symmetry_candidates',shape:{id:'main',shapeId:shapeId,shapeType:shape.shapeType,sides:shape.sides},candidates:candidates}},distractors:dis,
        meta:{archetype:'choose_fold_line_for_symmetry',misconceptionTargets:['symmetry_axis_orientation_confusion'],semanticProperties:{shapeId:shapeId,axisAngles:shape.axisAngles.slice(),answerAngle:answerAngle,candidateAngles:candidates.map(function(c){return c.angle;})},fingerprint:fp('symmetry_fold',answerAngle,[shapeId].concat(candidates.map(function(c){return String(c.angle);}))) }
      };
    }

    if(mode==='shape_from_axis_count'){
      var targetId=pick(rng,SYMMETRY_IDS),target=SYMMETRY[targetId],targetCount=target.axisAngles.length;
      var uniqueOthers=SYMMETRY_IDS.filter(function(id){return SYMMETRY[id].axisAngles.length!==targetCount;});
      var distractorIds=sampleUnique(rng,uniqueOthers,3);
      var ans2=choice(targetId,target.labelMs);
      var dis2=distractorIds.map(function(id){return choice(id,SYMMETRY[id].labelMs,'symmetry_axis_count_confusion');});
      return {
        value:{promptMs:'Cikgu mahu kad bentuk yang mempunyai tepat '+targetCount+' paksi simetri. Kad bentuk manakah sesuai?',answer:ans2,visual:null},distractors:shuffle(rng,dis2),
        meta:{archetype:'choose_shape_from_axis_count',misconceptionTargets:['symmetry_axis_count_confusion'],semanticProperties:{shapeId:targetId,axisCount:targetCount},fingerprint:fp('symmetry_shape_from_count',targetId,[String(targetCount)].concat(distractorIds))}
      };
    }

    throw new Error('geometry.symmetryKssrDiversity: unknown mode "'+mode+'"');
  });
})();

  })(registerGenerator);

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
        value: { promptMs: 'Bahagian manakah yang diulang untuk membina corak ini?', answer: ans2,
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
          promptMs: 'Prisma dinamakan mengikut bentuk dua tapaknya yang sama. Apakah bentuk tapak prisma ini?',
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
  // ---- renderers/d3/full-kssr.js ----
  (function (registerRenderer) {
// questions/v2/renderers/d3/full-kssr.js
// Phase 3A-1 FULL visual renderer for D3 T1/T4/T8.
// Pure static renderer; no DOM/Node globals.
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function box(content){return '<div class="qsv2-d3full" style="max-width:300px;margin:4px auto 10px;font-family:system-ui,sans-serif">'+content+'</div>';}
function pv(v){
 var h=['Ribu','Ratus','Puluh','Sa'],d=v.digits||[];
 return box('<table style="width:100%;border-collapse:collapse;text-align:center"><tr>'+h.map(function(x){return '<th style="border:1px solid currentColor;padding:4px;font-size:12px">'+x+'</th>';}).join('')+'</tr><tr>'+d.map(function(x){return '<td style="border:1px solid currentColor;padding:8px;font-weight:800">'+esc(x)+'</td>';}).join('')+'</tr></table>');
}
function compare(v){return box('<div style="display:flex;gap:10px;justify-content:center">'+(v.numbers||[]).map(function(n){return '<span style="border:1px solid currentColor;border-radius:8px;padding:8px 12px;font-weight:800">'+esc(n)+'</span>';}).join('')+'</div>');}
function groups(v){
 var body='<div style="font-size:12px;margin-bottom:6px">1 kumpulan rujukan ≈ <b>'+esc(v.reference)+'</b> objek</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
 for(var i=0;i<Number(v.groups||0);i++)body+='<span style="display:inline-grid;grid-template-columns:repeat(5,5px);gap:2px;border:1px solid currentColor;border-radius:6px;padding:5px">'+Array(10).fill('<i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i>').join('')+'</span>';
 return box(body+'</div>');
}
function numberLine(v){
 var min=Number(v.min),max=Number(v.max),value=Number(v.value),span=max-min||1,x=20+(value-min)/span*240;
 return box('<svg viewBox="0 0 280 70" width="280" height="70" role="img" aria-hidden="true"><line x1="20" y1="32" x2="260" y2="32" stroke="currentColor" stroke-width="2"/><line x1="20" y1="25" x2="20" y2="39" stroke="currentColor"/><line x1="260" y1="25" x2="260" y2="39" stroke="currentColor"/><circle cx="'+x.toFixed(1)+'" cy="32" r="5" fill="currentColor"/><text x="20" y="57" text-anchor="middle" font-size="11" fill="currentColor">'+esc(min)+'</text><text x="260" y="57" text-anchor="middle" font-size="11" fill="currentColor">'+esc(max)+'</text><text x="'+x.toFixed(1)+'" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">'+esc(value)+'</text></svg>');
}
function seq(v){
 var a=v.sequence||[],html='<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">';
 for(var i=0;i<a.length;i++)html+='<span style="min-width:42px;text-align:center;border:1px solid currentColor;border-radius:7px;padding:6px;font-weight:800">'+(a[i]==null?'?':esc(a[i]))+'</span>';
 return box(html+'</div>');
}
function moneyItems(v){
 var a=v.amounts||[],html='<div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap">';
 for(var i=0;i<a.length;i++)html+='<span style="border:1px solid currentColor;border-radius:8px;padding:7px 9px;font-weight:800">'+esc(a[i])+'</span>';
 html+='</div>';
 if(v.quantity)html+='<div style="text-align:center;font-size:12px;margin-top:5px">Bilangan barang: <b>'+esc(v.quantity)+'</b></div>';
 if(v.payment)html+='<div style="text-align:center;font-size:12px;margin-top:5px">Bayaran: <b>'+esc(v.payment)+'</b></div>';
 return box(html);
}
function budget(v){
 var html='<div style="border:1px solid currentColor;border-radius:8px;padding:8px"><div>Wang mula: <b>'+esc(v.start)+'</b></div>';
 (v.changes||[]).forEach(function(c){html+='<div style="margin-top:4px">'+esc(c.label)+': <b>'+esc(c.amount)+'</b></div>';});
 return box(html+'</div>');
}
function receipts(v){return box('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="border:1px solid currentColor;border-radius:8px;padding:7px"><b>Resit A</b><br>'+ (v.a||[]).map(esc).join('<br>')+'</div><div style="border:1px solid currentColor;border-radius:8px;padding:7px"><b>Resit B</b><br>'+ (v.b||[]).map(esc).join('<br>')+'</div></div>');}
function share(v){return box('<div style="text-align:center;border:1px solid currentColor;border-radius:8px;padding:8px"><b>'+esc(v.total)+'</b><div style="margin-top:6px">dibahagi kepada '+esc(v.groups)+' kumpulan sama rata</div></div>');}
function currency(v){return box('<div style="border:1px solid currentColor;border-radius:10px;padding:10px;text-align:center"><div style="font-weight:900">'+esc(v.country)+'</div><div>'+esc(v.currency)+'</div><div style="font-size:12px;opacity:.8">'+esc(v.code)+'</div></div>');}
function nw(v){return box('<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">'+(v.items||[]).map(function(x){return '<div style="border:1px solid currentColor;border-radius:8px;padding:7px;text-align:center">'+esc(x)+'</div>';}).join('')+'</div>');}
function grid(v){
 var objs=v.objects||[],hi=v.highlight||[],W=300,H=285,left=42,top=18,cell=45,body='';
 body+='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-hidden="true">';
 for(var i=0;i<=5;i++){var xx=left+i*cell,yy=top+i*cell;body+='<line x1="'+xx+'" y1="'+top+'" x2="'+xx+'" y2="'+(top+5*cell)+'" stroke="currentColor" stroke-opacity=".35"/>';body+='<line x1="'+left+'" y1="'+yy+'" x2="'+(left+5*cell)+'" y2="'+yy+'" stroke="currentColor" stroke-opacity=".35"/>';}
 for(var x=1;x<=5;x++)body+='<text x="'+(left+(x-.5)*cell)+'" y="'+(top+5*cell+18)+'" text-anchor="middle" font-size="11" fill="currentColor">'+x+'</text>';
 for(var y=1;y<=5;y++)body+='<text x="'+(left-12)+'" y="'+(top+(5-y+.5)*cell+4)+'" text-anchor="middle" font-size="11" fill="currentColor">'+y+'</text>';
 body+='<text x="'+(left+2.5*cell)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="currentColor">Mengufuk</text>';
 body+='<text x="10" y="'+(top+2.5*cell)+'" transform="rotate(-90 10 '+(top+2.5*cell)+')" text-anchor="middle" font-size="11" fill="currentColor">Mencancang</text>';
 objs.forEach(function(o){
   var cx=left+(Number(o.x)-.5)*cell,cy=top+(5-Number(o.y)+.5)*cell,hot=hi.indexOf(o.name)!==-1;
   body+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(hot?16:14)+'" fill="none" stroke="currentColor" stroke-width="'+(hot?3:1.5)+'"/>';
   body+='<text x="'+cx+'" y="'+(cy+3)+'" text-anchor="middle" font-size="8.5" font-weight="700" fill="currentColor">'+esc(o.name)+'</text>';
 });
 return box(body+'</svg>');
}
registerRenderer('d3full',function(question){
 var v=question&&question.visual;if(!v)return '';
 if(v.kind==='place_value_table')return pv(v);
 if(v.kind==='compare_numbers')return compare(v);
 if(v.kind==='estimate_groups')return groups(v);
 if(v.kind==='number_line')return numberLine(v);
 if(v.kind==='number_sequence')return seq(v);
 if(v.kind==='money_items')return moneyItems(v);
 if(v.kind==='money_budget')return budget(v);
 if(v.kind==='money_receipts')return receipts(v);
 if(v.kind==='money_share')return share(v);
 if(v.kind==='currency_card')return currency(v);
 if(v.kind==='needs_wants')return nw(v);
 if(v.kind==='coordinate_grid')return grid(v);
 throw new Error('d3full renderer: unknown visual kind "'+v.kind+'"');
});
})();
  })(registerRenderer);

  // ---- renderers/d3/p0-kssr.js ----
  (function (registerRenderer) {
// questions/v2/renderers/d3/p0-kssr.js
// Phase 3A-1 clean-room static renderer for Darjah 3 P0 shadow bank.
// Pure function: no DOM/Node globals.
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function svg(w,h,b){return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" style="max-width:'+w+'px;height:auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+b+'</svg>';}
var stroke='#2b2540',fill='#f4f0fa',accent='#7254a8',light='#ffffff';
function bar(v){
  var p=v.parts||[], total=p.reduce(function(a,x){return a+Math.abs(Number(x)||0);},0)||1,x=8,b='';
  for(var i=0;i<p.length;i++){var w=Math.max(28,220*Math.abs(Number(p[i])||0)/total);b+='<rect x="'+x+'" y="28" width="'+w+'" height="42" rx="5" fill="'+(p[i]<0?'#f8e9e9':fill)+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+w/2)+'" y="54" text-anchor="middle" font-size="12" font-family="sans-serif">'+esc((v.labels||[])[i]||String(p[i]))+'</text>';x+=w;}
  return svg(Math.max(250,x+8),92,b);
}
function grouping(v){
  var g=Math.max(1,Math.min(8,Number(v.groups)||1)),each=v.each,b='';
  for(var i=0;i<g;i++){var x=12+(i%4)*64,y=12+Math.floor(i/4)*54;b+='<rect x="'+x+'" y="'+y+'" width="52" height="40" rx="7" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+26)+'" y="'+(y+25)+'" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc(each)+'</text>';}
  return svg(276, g>4?120:66,b);
}
function fractionArea(v){
  var d=Math.max(1,Number(v.denominator)||1),n=Math.max(0,Number(v.numerator)||0),count=Math.max(1,Math.min(4,Number(v.count)||1)),b='',W=86,H=52;
  for(var c=0;c<count;c++){var x0=8+c*(W+8);for(var i=0;i<d;i++){var w=W/d;b+='<rect x="'+(x0+i*w)+'" y="12" width="'+w+'" height="'+H+'" fill="'+(i<n?accent:light)+'" stroke="'+stroke+'" stroke-width="1.2"/>';}}
  return svg(16+count*(W+8),78,b);
}
function hundred(v){
  var shaded=Math.max(0,Math.min(100,Number(v.shaded)||0)),b='',s=11;
  for(var i=0;i<100;i++){var x=8+(i%10)*s,y=8+Math.floor(i/10)*s;b+='<rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" fill="'+(i<shaded?accent:light)+'" stroke="'+stroke+'" stroke-width=".55"/>';}
  return svg(126,126,b);
}
function numberLine(v){
  var vals=(v.values||[]).map(Number),min=Math.min.apply(null,vals),max=Math.max.apply(null,vals);if(!isFinite(min)||min===max){min=0;max=1;}var b='<line x1="18" y1="45" x2="242" y2="45" stroke="'+stroke+'" stroke-width="2"/>';
  for(var i=0;i<vals.length;i++){var x=18+(vals[i]-min)/(max-min)*224;b+='<line x1="'+x+'" y1="36" x2="'+x+'" y2="54" stroke="'+accent+'" stroke-width="2"/><text x="'+x+'" y="70" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc((v.marks||[])[i]||vals[i])+'</text>';}
  return svg(260,82,b);
}
function clock(v){
  var h=Number(v.hour)||0,m=Number(v.minute)||0,cx=70,cy=70,r=52,ma=(m*6-90)*Math.PI/180,ha=((h%12)*30+m*.5-90)*Math.PI/180,b='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+light+'" stroke="'+stroke+'" stroke-width="3"/>';
  for(var i=1;i<=12;i++){var a=(i*30-90)*Math.PI/180;b+='<text x="'+(cx+Math.cos(a)*42)+'" y="'+(cy+Math.sin(a)*42+4)+'" text-anchor="middle" font-size="9" font-family="sans-serif">'+i+'</text>';}
  b+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.cos(ha)*28)+'" y2="'+(cy+Math.sin(ha)*28)+'" stroke="'+stroke+'" stroke-width="4" stroke-linecap="round"/><line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.cos(ma)*40)+'" y2="'+(cy+Math.sin(ma)*40)+'" stroke="'+accent+'" stroke-width="3" stroke-linecap="round"/>';
  return svg(140,140,b);
}
function timeline(v){
  var start=Number(v.start)||0,end=Number(v.end)||1,marks=[start].concat(v.markers||[]).concat([end]),b='<line x1="18" y1="40" x2="252" y2="40" stroke="'+stroke+'" stroke-width="3"/>';
  marks.forEach(function(q){var x=18+(Number(q)-start)/Math.max(1,end-start)*234;b+='<circle cx="'+x+'" cy="40" r="4" fill="'+accent+'"/>';});
  return svg(270,66,b);
}
function table(v){
  var hs=v.headers||[],rows=v.rows||[],html='<table class="qsv2-d3p0-table" style="border-collapse:collapse;margin:4px auto 10px;font:600 12px/1.3 sans-serif">';
  html+='<tr>'+hs.map(function(h){return'<th style="border:1px solid #888;padding:5px 8px">'+esc(h)+'</th>';}).join('')+'</tr>';
  rows.forEach(function(r){html+='<tr>'+r.map(function(x){return'<td style="border:1px solid #aaa;padding:5px 8px;text-align:center">'+esc(x)+'</td>';}).join('')+'</tr>';});return html+'</table>';
}
function unitGauge(v){
  var val=Number(v.value)||0,max=Math.max(1,Number(v.max)||val||1),pct=Math.max(0,Math.min(1,val/max)),label=esc(v.label||''),b='<rect x="18" y="28" width="220" height="28" rx="8" fill="'+light+'" stroke="'+stroke+'" stroke-width="2"/><rect x="18" y="28" width="'+(220*pct)+'" height="28" rx="8" fill="'+fill+'"/><text x="128" y="47" text-anchor="middle" font-size="12" font-family="sans-serif">'+esc(val)+' '+label+'</text>';
  return svg(256,78,b);
}
function placeValue(v){
  var text=v.value||((v.base||'')+' × '+(v.factor||'')),b='<rect x="18" y="18" width="224" height="54" rx="8" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="130" y="50" text-anchor="middle" font-size="18" font-family="monospace">'+esc(text)+'</text>';return svg(260,90,b);
}
function classification(v){return '<div style="max-width:300px;margin:4px auto 10px;padding:8px;border:1px solid #aaa;border-radius:8px;font:600 12px/1.5 sans-serif;text-align:center">'+(v.items||[]).map(esc).join(' · ')+'</div>';}
function barChart(v){
  var vals=v.values||[],labs=v.labels||[],mx=Math.max.apply(null,vals.concat([1])),b='';
  for(var i=0;i<vals.length;i++){var h=80*vals[i]/mx,x=26+i*58;b+='<rect x="'+x+'" y="'+(102-h)+'" width="34" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+17)+'" y="118" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc(labs[i])+'</text>';}
  return svg(220,130,b);
}
function pictograph(v){
  var labs=v.labels||[],vals=v.values||[],html='<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 8px;max-width:280px;margin:4px auto 10px;font:600 12px sans-serif">';
  for(var i=0;i<labs.length;i++){html+='<span>'+esc(labs[i])+'</span><span>'+new Array((Number(vals[i])||0)+1).join('● ')+'</span>';}return html+'</div>';
}
function pie(v){
  var vals=v.values||[],labs=v.labels||[],sum=vals.reduce(function(a,b){return a+Number(b||0);},0)||1,ang=-Math.PI/2,b='',cx=70,cy=70,r=52;
  for(var i=0;i<vals.length;i++){var next=ang+2*Math.PI*Number(vals[i]||0)/sum,x1=cx+r*Math.cos(ang),y1=cy+r*Math.sin(ang),x2=cx+r*Math.cos(next),y2=cy+r*Math.sin(next),large=(next-ang)>Math.PI?1:0;b+='<path d="M '+cx+' '+cy+' L '+x1+' '+y1+' A '+r+' '+r+' 0 '+large+' 1 '+x2+' '+y2+' Z" fill="'+(i%2?fill:light)+'" stroke="'+stroke+'" stroke-width="1.5"/>';var mid=(ang+next)/2;b+='<text x="'+(cx+Math.cos(mid)*33)+'" y="'+(cy+Math.sin(mid)*33+4)+'" text-anchor="middle" font-size="10" font-family="sans-serif">'+esc(labs[i])+'</text>';ang=next;}
  return svg(140,140,b);
}
function renderOne(v){
  if(!v)return '';
  if(v.kind==='bar_model')return bar(v);
  if(v.kind==='grouping')return grouping(v);
  if(v.kind==='fraction_area')return fractionArea(v);
  if(v.kind==='hundred_grid')return hundred(v);
  if(v.kind==='number_line')return numberLine(v);
  if(v.kind==='clock')return clock(v);
  if(v.kind==='timeline')return timeline(v);
  if(v.kind==='table')return table(v);
  if(v.kind==='classification')return classification(v);
  if(v.kind==='pie_chart')return pie(v);
  if(v.kind==='bar_chart')return barChart(v);
  if(v.kind==='pictograph')return pictograph(v);
  if(v.kind==='multi_chart')return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+renderOne(v.pictograph)+renderOne(v.bar)+'</div>';
  if(v.kind==='place_value_shift'||v.kind==='place_value_decimal'||v.kind==='place_value_decimal_pair')return placeValue(v);
  if(v.kind==='ruler'||v.kind==='scale'||v.kind==='container'||v.kind==='time_units')return unitGauge(v);
  return '<div class="qsv2-d3p0-visual" data-kind="'+esc(v.kind)+'"></div>';
}
registerRenderer('d3p0',function(question){return renderOne(question&&question.visual);});
})();
  })(registerRenderer);

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
