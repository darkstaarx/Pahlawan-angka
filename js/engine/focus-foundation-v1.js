/* Pahlawan Angka — Focus foundation finder v1 (read-only).
   Looks for one foundation (e.g. decimal place value) that keeps failing across
   two or more topics while the same topics' other questions go well. Reads only
   authored focusDiagnosticV1 tags stored on learner-review encounters; untagged
   encounters are ignored. Never writes db, scores, rewards or routing. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusFoundationV1=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const VERSION='1.0.0';
 const LABELS={'number.place_value':'Nilai tempat nombor','number.decimal_place_value':'Nilai tempat perpuluhan','operation.choose':'Memilih operasi daripada cerita',
  'add.combine':'Makna menggabungkan kuantiti','add.facts':'Fakta tambah','add.place_value':'Tambah pelbagai nilai tempat','add.regroup':'Tambah dengan pengumpulan semula',
  'sub.take_away_compare':'Makna tolak dan beza','sub.facts':'Fakta tolak asas','sub.place_value':'Tolak pelbagai nilai tempat','sub.regroup':'Tolak dengan pengumpulan semula',
  'mul.equal_groups':'Kumpulan sama banyak','mul.facts':'Fakta sifir asas','mul.multidigit':'Darab lebih satu digit','div.equal_sharing':'Agih sama rata',
  'div.facts':'Fakta bahagi','div.two_digit_one_digit':'Bahagi dua digit dengan satu digit','div.regroup':'Bahagi dengan pengagihan nilai tempat','div.remainder':'Bahagi dengan baki',
  'div.multidigit':'Bahagi nombor besar','div.decimal':'Bahagi nombor perpuluhan','money.denominations':'Nilai duit','money.ringgit_sen':'Hubungan RM dan sen',
  'money.transaction':'Bayaran dan baki','money.equal_sharing_application':'Agihan wang sama rata','money.discount':'Konsep diskaun','money.profit_loss':'Konsep untung dan rugi',
  'percent.part_whole':'Peratus sebagai bahagian keseluruhan','fraction.equal_parts':'Konsep pecahan','time.units':'Hubungan unit masa','measurement.units':'Unit dan penukaran ukuran',
  'ratio.relationship':'Hubungan nisbah dan kadaran','data.reading':'Membaca carta dan data'};
 const OUTCOMES=new Set(['independent','corrected','assisted','unresolved']);
 const IGNORED=new Set(['demo','dev','dev-test']);
 // Thresholds: a foundation is only named when it fails in several distinct
 // questions, in two topics, and clearly more often than its neighbours.
 const RULES=Object.freeze({window:150,minFailed:3,minFamilies:2,minSkills:2,minFailRate:.5,minContrast:3,minGap:.3,maxCandidates:2});
 const safe=v=>String(v??'').trim();
 function taggedRows(profile,grade){
  const all=Array.isArray(profile?.learnerReviewV1?.encounters)?profile.learnerReviewV1.encounters:[];
  const rows=all.filter(e=>e&&OUTCOMES.has(e.outcome)&&!IGNORED.has(safe(e.mode))&&(!grade||Number(e.grade)===Number(grade))
   &&e.focusDiagnosticV1?.schema==='pa.focus.question-tag.v1'&&e.focusDiagnosticV1.tagOrigin==='authored'
   &&safe(e.focusDiagnosticV1.originSkillId)===safe(e.skillId)).slice(-RULES.window);
  // A retried or repeated item counts once: its latest outcome.
  const latest=new Map();
  for(const e of rows){const t=e.focusDiagnosticV1,key=safe(e.skillId)+'|'+safe(t.evidence?.variantFingerprint||e.questionKey);latest.delete(key);latest.set(key,e)}
  return [...latest.values()].map(e=>({skillId:safe(e.skillId),family:safe(e.focusDiagnosticV1.evidence?.questionFamilyKey||e.archetypeId),
   foundations:new Set((e.focusDiagnosticV1.probes?.foundationIds||[]).map(safe).filter(f=>LABELS[f])),failed:e.outcome!=='independent'}));
 }
 function evaluate(profile,options={}){
  const rows=taggedRows(profile,options.grade??profile?.schoolGrade);
  const ids=new Set();rows.forEach(r=>r.foundations.forEach(f=>ids.add(f)));
  const candidates=[];
  for(const id of ids){
   const withF=rows.filter(r=>r.foundations.has(id)),failedF=withF.filter(r=>r.failed);
   if(failedF.length<RULES.minFailed)continue;
   const failRate=failedF.length/withF.length;
   const skills=new Set(failedF.map(r=>r.skillId)),families=new Set(failedF.map(r=>r.family));
   if(failRate<RULES.minFailRate||skills.size<RULES.minSkills||families.size<RULES.minFamilies)continue;
   const topics=new Set(withF.map(r=>r.skillId)),contrast=rows.filter(r=>topics.has(r.skillId)&&!r.foundations.has(id));
   if(contrast.length<RULES.minContrast)continue;
   const contrastRate=contrast.filter(r=>r.failed).length/contrast.length;
   if(failRate-contrastRate<RULES.minGap)continue;
   candidates.push({foundationId:id,label:LABELS[id],failedQuestions:failedF.length,taggedQuestions:withF.length,
    failRate:Math.round(failRate*100),contrastFailRate:Math.round(contrastRate*100),contrastQuestions:contrast.length,
    skills:[...skills].sort(),families:families.size});
  }
  candidates.sort((a,b)=>(b.failRate-b.contrastFailRate)-(a.failRate-a.contrastFailRate)||b.failedQuestions-a.failedQuestions);
  return {version:VERSION,state:candidates.length?'candidate':'insufficient_evidence',taggedQuestions:rows.length,
   candidates:candidates.slice(0,RULES.maxCandidates),writes:0,
   note:'Hypothesis from tagged questions only. Mastery, rewards and routing are untouched.'};
 }
 return Object.freeze({version:VERSION,RULES,LABELS,evaluate});
});
