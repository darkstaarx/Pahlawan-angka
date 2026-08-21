/* Cikgu Dimensi — concept catalog v0.2.1.
 * These lessons are implemented for local/DEV validation. Automatic diagnostic
 * routing remains disabled except the validated Y3-PV-A2 pilot.
 */
(function(root){
  'use strict';
  const lessons={
    'fraction-equivalence':{
      id:'Y3-FR-B',title:'Pecahan Setara',skillId:'D3.FRAC',misconceptionId:'FR-005',representation:'R4_FRACTION_AREA',secondary:'R3_NUMBER_LINE',
      kssr:'Year 3 DPK 3.1.1',cleanPrompt:'Pecahan setara bagi 3/4 ialah?',cleanAnswer:'6/8',revisitReason:'equivalent_fraction_revisit'
    },
    'division-meaning':{
      id:'Y3-DIV-C2',title:'Dua Cara Faham Bahagi',skillId:'D3.DIV',misconceptionId:'DIV-001',representation:'R1_GROUPING',
      kssr:'Year 3 multiplication/division problem structure',cleanPrompt:'15 gula-gula dibahagi sama rata kepada 3 orang. Setiap orang dapat berapa?',cleanAnswer:'5',revisitReason:'division_structure_revisit'
    },
    'word-problem-bar':{
      id:'Y3-WP-C4',title:'Cari Hubungan',skillId:'D3.SUB10000',misconceptionId:'MUL-003',representation:'R6_BAR_RELATIONAL',
      kssr:'Year 3 word-problem relationship → ayat matematik',cleanPrompt:'Badrul ada 47 guli. Dia ada 12 lebih daripada Amir. Berapa guli Amir?',cleanAnswer:'35',revisitReason:'relationship_model_revisit'
    },
    'multiply-decompose':{
      id:'Y3-MUL-D1',title:'Pecahkan Darab kepada Fakta Mudah',skillId:'D3.MUL',misconceptionId:'MUL-FACT-FLEX',representation:'R4_ARRAY',
      kssr:'Equal groups → array → multiplication expression',cleanPrompt:'6 × 8 = ?',cleanAnswer:'48',revisitReason:'multiplication_decomposition_revisit'
    },
    'make-ten':{
      id:'Y3-ADD-E1',title:'Cukupkan 10',skillId:'D3.ADD10000',misconceptionId:'ADD-BASE10',representation:'R5_NUMBER_BOND',
      kssr:'Number composition/decomposition → addition',cleanPrompt:'27 + 8 = ?',cleanAnswer:'35',revisitReason:'make_ten_revisit'
    },
    'compensation':{
      id:'Y3-ADD-E2',title:'Guna Nombor Hampir',skillId:'D3.ADD10000',misconceptionId:'ADD-COMPENSATION',representation:'R5_NUMBER_BOND',
      kssr:'Mental calculation flexibility after stable place value',cleanPrompt:'49 + 27 = ?',cleanAnswer:'76',revisitReason:'compensation_revisit'
    },
    'difference-count-up':{
      id:'Y3-SUB-E2',title:'Cari Beza',skillId:'D3.SUB10000',misconceptionId:'SUB-DIFFERENCE',representation:'R3_NUMBER_LINE',
      kssr:'Subtraction as difference / inverse addition',cleanPrompt:'503 − 498 = ?',cleanAnswer:'5',revisitReason:'difference_revisit'
    },
    'scale-ten':{
      id:'Y3-PV-E3',title:'Nilai ×10',skillId:'D3.PV10000',misconceptionId:'PV-SCALE10',representation:'R2_PLACE_VALUE',
      kssr:'Place-value scaling',cleanPrompt:'47 × 10 = ?',cleanAnswer:'470',revisitReason:'place_value_scaling_revisit'
    }
  };
  root.PADimensionalCatalog={version:'0.2.1',experimental:true,lessons,get:id=>lessons[id]||null,list:()=>Object.entries(lessons).map(([key,v])=>({key,...v}))};
})(typeof window!=='undefined'?window:globalThis);
