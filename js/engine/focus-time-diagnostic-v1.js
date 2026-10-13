/* Pahlawan Angka — focused Time contrast evaluator.
   Pure, read-only candidate routing. It never reads/writes a learner profile. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusTimeDiagnosticV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const VALID=new Set(['independent','corrected','assisted','unresolved']);
 const FAMILIES=['time_clock','time_units','time_elapsed'];
 const NEXT={time_clock:'D2.5.1',time_units:'D2.5.2',time_elapsed:'D2.5.3'};
 const clean=x=>String(x??'').trim();
 function evaluate({observations=[],initialTimeWeak=true,originSkillId='D2.5.3'}={}){
  const origin=clean(originSkillId),eligible=/^D2\.5\.[123]$/.test(origin);
  const seen=new Map();
  for(const x of Array.isArray(observations)?observations:[]){
   if(x?.purpose!=='contrast'||!FAMILIES.includes(clean(x.family))||!VALID.has(clean(x.result)))continue;
   const probe=clean(x.probe);if(!probe)continue;
   const key=clean(x.family)+'|'+probe,results=seen.get(key)||new Set();results.add(clean(x.result));seen.set(key,results);
  }
  const rows=[];
  for(const [key,results] of seen){if(results.size!==1)continue;const [family,probe]=key.split('|');rows.push({family,probe,result:[...results][0]})}
  const counts={};for(const family of FAMILIES){const a=rows.filter(x=>x.family===family);counts[family]={independent:a.filter(x=>x.result==='independent').length,nonindependent:a.filter(x=>x.result!=='independent').length,total:a.length}}
  let state='needs_contrast',rootCause=null,nextSkillId=null,confidence='low',reasonCode='NOT_ENOUGH_DISTINCT_CONTRAST_EVIDENCE';
  const parentText=()=>{
   if(!initialTimeWeak)return 'Belum ada isyarat awal yang mencukupi untuk menetapkan fokus Masa. Teruskan latihan biasa dan kumpulkan bukti berbeza.';
   if(!eligible)return 'Ujian ini hanya disahkan untuk Kemahiran Fokus Masa Darjah 2. Bukti diterima, tetapi tiada fokus khusus ditetapkan.';
   if(rootCause==='time.read_clock')return 'Latihan awal menunjukkan topik Masa mencabar. Dalam ujian susulan, fakta unit masa dan operasi garis masa boleh dibuat sendiri, tetapi membaca jam masih mengelirukan. Calon fokus seterusnya ialah membaca jam dan memadankan frasa masa.';
   if(rootCause==='time.unit_relationship')return 'Latihan awal menunjukkan topik Masa mencabar. Dalam ujian susulan, jam dan operasi garis masa boleh dibuat sendiri, tetapi hubungan asas jam, minit dan hari masih mengelirukan. Calon fokus seterusnya ialah memahami unit masa.';
   if(rootCause==='time.timeline_operation')return 'Latihan awal menunjukkan topik Masa mencabar. Dalam ujian susulan, bacaan jam dan fakta unit masa boleh dibuat sendiri, tetapi mencari waktu tamat atau tempoh masih mengelirukan. Calon fokus seterusnya ialah operasi garis masa.';
   if(state==='mixed_evidence')return 'Latihan awal menunjukkan topik Masa mencabar, tetapi ujian susulan menunjukkan lebih daripada satu bahagian yang masih sukar. Cikgu Dimensi belum memilih satu fokus; latihan seterusnya perlu mengumpul bukti yang lebih khusus.';
   return 'Latihan awal menunjukkan topik Masa mencabar. Ujian susulan belum cukup untuk membezakan bacaan jam, fakta unit masa atau operasi garis masa. Cikgu Dimensi perlu mengumpul bukti berbeza sebelum memilih fokus.';
  };
  if(!initialTimeWeak){state='insufficient_evidence';reasonCode='NO_INITIAL_TIME_FOCUS_SIGNAL'}
  else if(!eligible){state='insufficient_evidence';reasonCode='UNSUPPORTED_GRADE_ORIGIN'}
  else {
   const weak=FAMILIES.filter(f=>counts[f].nonindependent>=2&&counts[f].independent===0&&counts[f].total>=2);
   const strong=FAMILIES.filter(f=>counts[f].independent>=2&&counts[f].nonindependent===0&&counts[f].total>=2);
   if(weak.length===1&&strong.length===2){rootCause=weak[0]==='time_units'?'time.unit_relationship':weak[0]==='time_elapsed'?'time.timeline_operation':'time.read_clock';nextSkillId=NEXT[weak[0]];state='candidate';confidence='medium';reasonCode=weak[0].toUpperCase()+'_WEAK_WITH_TWO_CONTRAST_FAMILIES_SUCCESS'}
   else if(weak.length>1){state='mixed_evidence';reasonCode='MULTIPLE_TIME_FAMILIES_NEED_SUPPORT'}
  }
  return Object.freeze({version:'1.0.0',mode:'contrast',state,rootCause,nextSkillId,originSkillId:origin,confidence,reasonCode,initialTimeWeak,clock:counts.time_clock,units:counts.time_units,elapsed:counts.time_elapsed,parentText:parentText(),writes:0,evidence:{uniqueTaggedQuestions:rows.length,contrastQuestions:(Array.isArray(observations)?observations:[]).filter(x=>x?.purpose==='contrast').length}});
 }
 return Object.freeze({evaluate});
});
