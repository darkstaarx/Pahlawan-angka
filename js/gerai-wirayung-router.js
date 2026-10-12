/* Gerai Wirayung — router Kemahiran Fokus → mini-game wang.
   Membaca encounter learnerReviewV1 yang SAMA digunakan oleh focusPracticeSummary()
   dan memutuskan sama ada skill wang yang lemah sesuai dilatih di gerai.
   Fail ini tidak menulis mastery dan tidak mengubah db. */
(function(){
'use strict';
/* Keluarga archetype (D5/D6) → mod gerai. Archetype yang tiada di sini
   (insurans, dividen, aset/liabiliti, istilah) kekal dalam battle biasa. */
const FAMILIES=[
 {mode:'diskaun',re:/discount|rebate|compare_deal/},
 {mode:'untung', re:/profit|loss|cost_from_selling|selling_price|all_stock/},
 {mode:'baki',   re:/cash_balance|balance|change|budget|multi_step/}
];
/* Skill wang D1–D4 dipetakan ke mod yang sepadan. D2.4.6 masih guna battle. */
const DIRECT={
 'D1.MONEY':['bayar'],'D2.4.1':['bayar'],'D2.4.2':['bayar'],'D2.4.3':['baki'],'D2.4.4':['bayar'],
 'D2.4.5':['bahagi'],'D2.4.7':['bayar','baki'],'D3.MONEY':['bayar','baki'],'D4.MONEY':['bayar','baki']
};
const DEFAULT={5:['diskaun','baki'],6:['diskaun','untung']};
const gradeOf=id=>Number((/^D(\d)/.exec(String(id))||[])[1])||0;
const isMoney=id=>/^D[1-6]\.(MONEY|4\.\d)$/.test(String(id))&&!(gradeOf(id)===2&&!/^D2\.4\./.test(id));

function weakFamilies(rows){
 const by={};
 rows.forEach(e=>{const f=FAMILIES.find(f=>f.re.test(String(e.archetypeId||'')));if(!f)return;(by[f.mode]=by[f.mode]||[]).push(e)});
 return Object.entries(by).filter(([,list])=>{
  const ind=list.filter(e=>e.outcome==='independent').length;
  return list.length>=2&&ind/list.length<.8;
 }).sort((a,b)=>a[1].filter(e=>e.outcome==='independent').length/a[1].length-b[1].filter(e=>e.outcome==='independent').length/b[1].length).map(([k])=>k);
}

/* plan = {grade, modes, hash, reason} atau null (guna battle biasa). */
function planFor(profile,skillId){
 if(!isMoney(skillId))return null;
 const grade=gradeOf(skillId);
 if(grade<=4){const modes=DIRECT[skillId];return modes?{grade,modes,hash:'d'+grade+'-'+modes.join('-'),reason:'skill-langsung'}:null}
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 const known=rows.filter(e=>e.archetypeId&&e.archetypeId!=='legacy');
 let modes=weakFamilies(rows);
 if(!modes.length){
  // Ada bukti archetype tetapi kelemahan bukan dalam keluarga yang sesuai dengan gerai.
  if(known.length>=5&&known.some(e=>!FAMILIES.some(f=>f.re.test(e.archetypeId))))return null;
  modes=DEFAULT[grade];
 }
 if(grade===5)modes=modes.filter(x=>x!=='untung');
 return modes.length?{grade,modes,hash:'d'+grade+'-'+modes.join('-'),reason:known.length?'archetype':'lalai-darjah'}:null;
}
function url(plan,page='gerai-wirayung.html'){return page+'#'+plan.hash}

/* Cadangan sambungan (belum dipasang dalam app):
   dalam startFocusChoice(id), sebelum openGembok:
     const plan=window.PAGeraiWirayung?.planFor(db,id);
     if(plan){ closeFocusPicker(); bukaGerai(window.PAGeraiWirayung.url(plan)); return }
   Keputusan gerai TIDAK direkod sebagai encounter. Bukti mastery kekal
   datang daripada battle/Cabaran Penjaga selepas latihan.            */
window.PAGeraiWirayung={planFor,url,weakFamilies,FAMILIES};
})();
