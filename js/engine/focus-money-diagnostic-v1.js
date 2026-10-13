/* Wang-to-operation contrast pilot. Pure, read-only, and deliberately abstains
   unless the money basics and the matched number-operation contrast both have
   distinct independent evidence. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusMoneyDiagnosticV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const text=x=>String(x??'').trim();
 function evaluate({originSkillId='D2.4.2',observations=[],initialMoneyWeak=true,engine}={}){
  if(!engine||typeof engine.evaluate!=='function')throw new TypeError('Pure FocusDiagnosisV2 evaluator required');
  const rows=Array.isArray(observations)?observations:[];
  const distinct=(family,result)=>new Set(rows.filter(x=>x.family===family&&x.result===result).map(x=>text(x.probe))).size;
  const moneyBasics={independent:distinct('money_unit','independent'),nonindependent:
    new Set(rows.filter(x=>x.family==='money_unit'&&x.result!=='independent').map(x=>text(x.probe))).size};
  const operation=engine.evaluate({originSkillId,observations:rows});
  let state='needs_contrast',rootCause=null,nextSkillId='D2.4.2',confidence='low',reasonCode='MONEY_BASICS_NOT_ESTABLISHED';
  if(!initialMoneyWeak){state='insufficient_evidence';reasonCode='NO_INITIAL_MONEY_FOCUS_SIGNAL'}
  else if(moneyBasics.independent>=2&&operation.rootCause==='add.place_value'){
   state='candidate';rootCause='add.place_value';nextSkillId='D2.2.1';confidence='medium';reasonCode='MONEY_BASICS_OK_LARGE_ADDITION_WEAK';
  }else if(moneyBasics.nonindependent>=2&&operation.rootCause===null){
   state='candidate';rootCause='money.ringgit_sen';nextSkillId='D2.4.1';confidence='low';reasonCode='MONEY_BASICS_NEED_FOUNDATION';
  }else if(operation.rootCause&&moneyBasics.independent<2){
   reasonCode='OPERATION_SIGNAL_WITHOUT_MONEY_BASICS_CONFIRMATION';
  }else if(operation.rootCause==='add.place_value'&&moneyBasics.independent>=2){
   state='candidate';rootCause='add.place_value';nextSkillId='D2.2.1';confidence='medium';reasonCode='MONEY_BASICS_OK_LARGE_ADDITION_WEAK';
  }else if(operation.state==='insufficient_evidence')reasonCode='NOT_ENOUGH_DISTINCT_CONTRAST_EVIDENCE';
  const parentText=rootCause==='add.place_value'
   ?'Pada awalnya, latihan menunjukkan Wang mencabar. Ujian susulan mendapati asas Wang boleh dibuat sendiri, tetapi tambah nombor besar masih mengelirukan. Fokus seterusnya ialah nilai tempat dan tambah nombor besar.'
   :rootCause==='money.ringgit_sen'
    ?'Latihan awal menunjukkan Wang mencabar. Ujian susulan mendapati nilai asas wang masih perlukan latihan. Fokus seterusnya ialah mengenal nilai ringgit dan sen.'
    :'Latihan awal menunjukkan Wang mencabar. Ujian susulan belum cukup untuk membezakan sama ada puncanya asas wang atau operasi tambah. Cikgu Dimensi akan menguji beberapa soalan berbeza sebelum menetapkan fokus.';
  return Object.freeze({version:'1.0.0-shadow',mode:'shadow_read_only',state,rootCause,nextSkillId,confidence,reasonCode,
   originSkillId,moneyBasics,operation:{state:operation.state,rootCause:operation.rootCause,nextProbe:operation.nextProbe,
    evidence:operation.evidence},parentText,writes:0,
   note:'Calon punca sahaja; tidak mengubah penguasaan, ganjaran, routing atau laporan produksi.'});
 }
 return Object.freeze({evaluate});
});
