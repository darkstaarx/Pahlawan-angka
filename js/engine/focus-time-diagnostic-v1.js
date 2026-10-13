/* Time topic contrast pilot. Read-only candidate routing with distinct probes. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusTimeDiagnosticV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const text=x=>String(x??'').trim();
 function evaluate({observations=[],initialTimeWeak=true}={}){
  // Only contrast probes can identify the subskill. Initial Kembara results
  // establish that Masa needs attention, but must never become extra votes
  // for the specific root cause.
  const rows=(Array.isArray(observations)?observations:[]).filter(x=>x?.purpose==='contrast');
  const outcomes=new Map();
  for(const row of rows){const family=text(row.family),probe=text(row.probe);if(!probe)continue;
   const key=family+'|'+probe,seen=outcomes.get(key)||new Set();seen.add(text(row.result));outcomes.set(key,seen)}
  const unique=[];for(const [key,seen] of outcomes){
   // If the same probe appears more than once with conflicting results, it is
   // ambiguous and contributes no evidence. Retries cannot manufacture votes.
   if(seen.size!==1)continue;const [family,probe]=key.split('|');unique.push({family,probe,result:[...seen][0]});
  }
  const count=(family,result)=>unique.filter(x=>x.family===family&&
   (result==='nonindependent'?['unresolved','corrected','assisted','nonindependent'].includes(x.result):x.result===result)).length;
  const clock={independent:count('time_clock','independent'),nonindependent:count('time_clock','nonindependent')};
  const units={independent:count('time_units','independent'),nonindependent:count('time_units','nonindependent')};
  const elapsed={independent:count('time_elapsed','independent'),nonindependent:count('time_elapsed','nonindependent')};
  let rootCause=null,nextSkillId='D2.5.3',reasonCode='NOT_ENOUGH_DISTINCT_CONTRAST_EVIDENCE',state='needs_contrast',confidence='low';
  if(!initialTimeWeak){state='insufficient_evidence';reasonCode='NO_INITIAL_TIME_FOCUS_SIGNAL'}
  else if(clock.nonindependent>=2&&units.independent>=2&&units.nonindependent===0){
   rootCause='time.read_clock';nextSkillId='D2.5.1';reasonCode='CLOCK_READING_WEAK_WITH_UNIT_SUCCESS';state='candidate';confidence='medium';
  }else if(units.nonindependent>=2&&clock.independent>=2&&clock.nonindependent===0){
   rootCause='time.unit_relationship';nextSkillId='D2.5.2';reasonCode='TIME_UNIT_RELATIONSHIP_WEAK_WITH_CLOCK_SUCCESS';state='candidate';confidence='medium';
  }else if(clock.independent>=2&&clock.nonindependent===0&&units.independent>=2&&units.nonindependent===0&&elapsed.nonindependent>=2){
   rootCause='time.timeline_operation';nextSkillId='D2.5.3';reasonCode='ELAPSED_TIME_WEAK_WITH_CLOCK_AND_UNIT_SUCCESS';state='candidate';confidence='medium';
  }
  const parentText=rootCause==='time.read_clock'
   ?'Latihan awal menunjukkan topik Masa mencabar. Ujian susulan mendapati hubungan unit masa boleh dibuat, tetapi membaca jam masih mengelirukan. Calon fokus seterusnya ialah membaca jam dan memadankan frasa masa.'
   :rootCause==='time.unit_relationship'
    ?'Latihan awal menunjukkan topik Masa mencabar. Ujian susulan mendapati jam boleh dibaca, tetapi hubungan jam, minit dan unit masa masih mengelirukan. Calon fokus seterusnya ialah memahami dan menukar unit masa.'
    :rootCause==='time.timeline_operation'
     ?'Latihan awal menunjukkan topik Masa mencabar. Ujian susulan mendapati bacaan jam dan hubungan unit masa boleh dibuat sendiri, tetapi mencari waktu tamat atau tempoh masih mengelirukan. Calon fokus seterusnya ialah operasi garis masa.'
     :'Latihan awal menunjukkan topik Masa mencabar. Ujian susulan belum cukup untuk membezakan bacaan jam, hubungan unit masa atau operasi garis masa. Cikgu Dimensi perlu mengumpul bukti berbeza sebelum memilih fokus.';
  return Object.freeze({version:'1.0.0-shadow',mode:'shadow_read_only',state,rootCause,nextSkillId,confidence,reasonCode,
   initialTimeWeak,clock,units,elapsed,parentText,writes:0,
   evidence:{uniqueTaggedQuestions:unique.length,contrastQuestions:rows.length},
   note:'Calon punca sahaja; tiada penguasaan, ganjaran, simpanan atau routing produksi diubah.'});
 }
 return Object.freeze({evaluate});
});
