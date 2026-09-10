/* Cikgu Dimensi — concept/strategy catalog v0.3.0.
 * Pilot diagnosis is probabilistic and intentionally conservative: one wrong answer
 * is never promoted to a misconception without supporting history/evidence.
 */
(function(root){
  'use strict';

  const REGROUPING_PILOT={
    id:'Y3-PV-A2',
    conceptId:'subtraction_regrouping',
    skillId:'D3.SUB10000',
    misconceptionId:'PV-005',
    curriculumVersion:'SEMAKAN_2017_DPK_EDISI_3',
    prerequisiteId:'PV-EXCHANGE-10-1',
    stages:['FAHAM','BINA','SAMBUNG','CUBA','GUNA'],
    strategies:[
      {id:'BASE_TEN_EXCHANGE',representationId:'R2_PLACE_VALUE'},
      {id:'DECOMPOSITION',representationId:'R7_DECOMPOSITION'}
    ]
  };

  const lessons={
    'fraction-equivalence':{id:'Y3-FR-B',title:'Pecahan Setara',skillId:'D3.FRAC',misconceptionId:'FR-005',representation:'R4_FRACTION_AREA',secondary:'R3_NUMBER_LINE',kssr:'Year 3 DPK 3.1.1',cleanPrompt:'Pecahan setara bagi 3/4 ialah?',cleanAnswer:'6/8',revisitReason:'equivalent_fraction_revisit'},
    'division-meaning':{id:'Y3-DIV-C2',title:'Dua Cara Faham Bahagi',skillId:'D3.DIV',misconceptionId:'DIV-001',representation:'R1_GROUPING',kssr:'Year 3 multiplication/division problem structure',cleanPrompt:'15 gula-gula dibahagi sama rata kepada 3 orang. Setiap orang dapat berapa?',cleanAnswer:'5',revisitReason:'division_structure_revisit'},
    'word-problem-bar':{id:'Y3-WP-C4',title:'Cari Hubungan',skillId:'D3.SUB10000',misconceptionId:'MUL-003',representation:'R6_BAR_RELATIONAL',kssr:'Year 3 word-problem relationship → ayat matematik',cleanPrompt:'Badrul ada 47 guli. Dia ada 12 lebih daripada Amir. Berapa guli Amir?',cleanAnswer:'35',revisitReason:'relationship_model_revisit'},
    'multiply-decompose':{id:'Y3-MUL-D1',title:'Pecahkan Darab kepada Fakta Mudah',skillId:'D3.MUL',misconceptionId:'MUL-FACT-FLEX',representation:'R4_ARRAY',kssr:'Equal groups → array → multiplication expression',cleanPrompt:'6 × 8 = ?',cleanAnswer:'48',revisitReason:'multiplication_decomposition_revisit'},
    'make-ten':{id:'Y3-ADD-E1',title:'Cukupkan 10',skillId:'D3.ADD10000',misconceptionId:'ADD-BASE10',representation:'R5_NUMBER_BOND',kssr:'Number composition/decomposition → addition',cleanPrompt:'27 + 8 = ?',cleanAnswer:'35',revisitReason:'make_ten_revisit'},
    'compensation':{id:'Y3-ADD-E2',title:'Guna Nombor Hampir',skillId:'D3.ADD10000',misconceptionId:'ADD-COMPENSATION',representation:'R5_NUMBER_BOND',kssr:'Mental calculation flexibility after stable place value',cleanPrompt:'49 + 27 = ?',cleanAnswer:'76',revisitReason:'compensation_revisit'},
    'difference-count-up':{id:'Y3-SUB-E2',title:'Cari Beza',skillId:'D3.SUB10000',misconceptionId:'SUB-DIFFERENCE',representation:'R3_NUMBER_LINE',kssr:'Subtraction as difference / inverse addition',cleanPrompt:'503 − 498 = ?',cleanAnswer:'5',revisitReason:'difference_revisit'},
    'scale-ten':{id:'Y3-PV-E3',title:'Nilai ×10',skillId:'D3.PV10000',misconceptionId:'PV-SCALE10',representation:'R2_PLACE_VALUE',kssr:'Place-value scaling',cleanPrompt:'47 × 10 = ?',cleanAnswer:'470',revisitReason:'place_value_scaling_revisit'}
  };

  function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0))}
  function strongPrior(history={}){
    const independentCorrect=Number(history.independentCorrect||history.correct||0);
    const independentTotal=Number(history.independentTotal||history.evidence||0);
    const mastery=Number(history.mastery||0);
    const confidence=Number(history.confidence||0);
    return independentCorrect>=4 || (independentTotal>=5&&independentCorrect/Math.max(1,independentTotal)>=.8) || (mastery>=70&&confidence>=60);
  }

  function diagnoseRegrouping(input={}){
    const wrongEvidence=Math.max(0,Number(input.wrongEvidenceCount||0));
    const distinct=Math.max(0,Number(input.distinctWrongItems||wrongEvidence));
    const repeatedPattern=Math.max(0,Number(input.samePatternCount||wrongEvidence));
    const priorStrong=input.priorStrong===true||strongPrior(input.history||{});
    const prerequisite=input.prerequisitePassed;

    if(prerequisite===false){
      return{failureType:'PREREQUISITE_INSECURE',misconceptionId:'PV-EXCHANGE-10-1',confidence:clamp01(.64+.06*Math.min(3,wrongEvidence)),needsDiscriminator:false};
    }
    if(prerequisite===true&&wrongEvidence>=2&&distinct>=2&&repeatedPattern>=2){
      return{failureType:'REGROUPING_MISCONCEPTION',misconceptionId:REGROUPING_PILOT.misconceptionId,confidence:clamp01(.68+.06*Math.min(3,wrongEvidence-1)),needsDiscriminator:false};
    }
    if(wrongEvidence===1&&priorStrong){
      return{failureType:'CARELESS_RECHECK',misconceptionId:null,confidence:.62,needsDiscriminator:false};
    }
    if(wrongEvidence>=2&&distinct>=2&&repeatedPattern>=2){
      return{failureType:'UNKNOWN',misconceptionId:null,confidence:.55,needsDiscriminator:true};
    }
    return{failureType:'UNKNOWN',misconceptionId:null,confidence:wrongEvidence?0.32:0,needsDiscriminator:wrongEvidence>0};
  }

  function orderStrategies(memory={}){
    const base=REGROUPING_PILOT.strategies.map(x=>({...x}));
    const preferred=Array.isArray(memory.preferredEffectiveRepresentations)?memory.preferredEffectiveRepresentations:[];
    const failed=memory.failedStrategies&&typeof memory.failedStrategies==='object'?memory.failedStrategies:{};
    return base.sort((a,b)=>{
      const pa=preferred.includes(a.representationId)?1:0,pb=preferred.includes(b.representationId)?1:0;
      if(pa!==pb)return pb-pa;
      const fa=Number(failed[a.id]||0),fb=Number(failed[b.id]||0);
      if(fa!==fb)return fa-fb;
      return REGROUPING_PILOT.strategies.findIndex(x=>x.id===a.id)-REGROUPING_PILOT.strategies.findIndex(x=>x.id===b.id);
    });
  }

  root.PADimensionalCatalog={
    version:'0.3.0',experimental:true,lessons,pilot:REGROUPING_PILOT,
    get:id=>id===REGROUPING_PILOT.id?REGROUPING_PILOT:(lessons[id]||null),
    list:()=>Object.entries(lessons).map(([key,v])=>({key,...v})),
    diagnoseRegrouping,orderStrategies,strongPrior
  };
})(typeof window!=='undefined'?window:globalThis);
