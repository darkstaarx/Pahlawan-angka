/* Tren Jam — router Kemahiran Fokus → mini-game masa.
   Membaca encounter learnerReviewV1 (sama seperti focusPracticeSummary) dan
   memilih mod menara yang sepadan dengan archetype masa yang lemah.
   Tidak menulis mastery dan tidak mengubah db. */
(function(){
'use strict';
/* Urutan penting: corak pertama yang padan menang. */
const FAMILIES=[
 {mode:'zon',   re:/zone/},
 {mode:'24jam', re:/clock24|(^|_)convert$/},
 {mode:'operasi',re:/time_operations|time_operation/},
 {mode:'anggaran',re:/time_estimation|time_estimate/},
 {mode:'kalendar',re:/calendar|month_day/},
 {mode:'unit',  re:/convert_forward|convert_reverse|compare_units|day_hour|fraction_convert/},
 {mode:'mula',  re:/find_start/},
 {mode:'tamat', re:/end_time|add_time|later_time|find_end/},
 {mode:'tempoh',re:/time_duration_days_hours|timetable_read|elapsed|duration|find_duration|timeline/},
 {mode:'baca',  re:/read_clock|match_words|half_hour|(^|_)hour$/}
];
/* Mod yang wujud bagi setiap darjah dalam menara-jam.html */
const AVAIL={1:['baca','kalendar'],2:['baca','tamat','tempoh','unit'],3:['tamat','tempoh','mula','unit','operasi','kalendar'],4:['24jam','tamat','tempoh','unit','operasi','anggaran'],5:['unit','tempoh','operasi','kalendar'],6:['zon']};
const DEFAULT={1:['baca','kalendar'],2:['baca','tamat','tempoh','unit'],3:['tamat','tempoh','mula','unit','operasi','kalendar'],4:['24jam','tamat','tempoh','unit','operasi','anggaran'],5:['unit','tempoh','operasi','kalendar'],6:['zon']};
const DIRECT={'D1.TIME':1,'D2.5.1':2,'D2.5.2':2,'D2.5.3':2,'D3.TIME':3,'D4.TIME':4,'D5.TIME':5,'D6.TIME':6};
const DIRECT_MODES={'D2.5.1':['baca'],'D2.5.2':['unit'],'D2.5.3':['tamat','tempoh']};

function familyOf(a){a=String(a||'');const f=FAMILIES.find(f=>f.re.test(a));return f?f.mode:null}
function weakModes(rows,grade){
 const by={};
 rows.forEach(e=>{const k=familyOf(e.archetypeId);if(k&&AVAIL[grade].includes(k))(by[k]=by[k]||[]).push(e)});
 const rate=l=>l.filter(e=>e.outcome==='independent').length/l.length;
 return Object.entries(by).filter(([,l])=>l.length>=2&&rate(l)<.8).sort((a,b)=>rate(a[1])-rate(b[1])).map(([k])=>k);
}
/* plan = {grade, modes, hash, reason} atau null (kekal battle biasa) */
function planFor(profile,skillId){
 const grade=DIRECT[skillId];if(!grade)return null;
 if(DIRECT_MODES[skillId])return{grade,modes:DIRECT_MODES[skillId],hash:'d'+grade+'-'+DIRECT_MODES[skillId].join('-'),reason:'skill-langsung'};
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 const known=rows.filter(e=>e.archetypeId&&e.archetypeId!=='legacy');
 let modes=weakModes(rows,grade),reason='archetype';
 if(!modes.length){
  // Kelemahan ada tetapi dalam archetype yang menara tidak latih (cth tahun lompat).
  const weakOther=known.filter(e=>!familyOf(e.archetypeId)&&e.outcome!=='independent').length;
  if(known.length>=5&&weakOther>=2)return null;
  modes=DEFAULT[grade];reason=known.length?'archetype-lalai':'lalai-darjah';
 }
 return{grade,modes,hash:'d'+grade+'-'+modes.join('-'),reason};
}
function url(plan,page='menara-jam.html'){return page+'#'+plan.hash}
/* Sambungan cadangan: dalam startFocusChoice(id), sebelum openGembok:
     const plan=window.PAMenaraJam?.planFor(db,id)||window.PAGeraiWirayung?.planFor(db,id);
   Keputusan menara TIDAK direkod sebagai encounter. */
window.PAMenaraJam={planFor,url,familyOf,weakModes,FAMILIES,AVAIL};
})();
