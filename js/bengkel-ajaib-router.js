/* Bengkel Besi — router Kemahiran Fokus → mini-game ukuran (panjang, jisim, isi padu).
   Membaca encounter learnerReviewV1 seperti focusPracticeSummary() dan memetakan archetype
   bank soalan app kepada alat + tahap mula dalam game (hash #d<g>-<mod>@<tahap>).
   Tidak menulis mastery dan tidak mengubah db. */
(function(){
'use strict';
/* Senarai archetype setiap tahap — mesti sama dengan GEN dalam bengkel-ajaib.html */
const ARCH={"1":{"panjang":["length_ns","length_ns","length_compare"],"jisim":["mass_ns","mass_ns","mass_compare"],"isipadu":["capacity_ns","capacity_ns","capacity_compare"]},"2":{"panjang":["length_measure","length_read","length_measure","length_estimate","measure_problem"],"jisim":["mass_measure","mass_read","mass_measure","mass_estimate","measure_problem"],"isipadu":["liquid_measure","liquid_read","liquid_measure","liquid_estimate","measure_problem"]},"3":{"panjang":["length_convert","length_convert","length_read","length_convert","measure_problem"],"jisim":["mass_convert","mass_convert","mass_read","mass_convert","measure_problem"],"isipadu":["liquid_convert","liquid_convert","liquid_read","liquid_convert","measure_problem"]},"4":{"panjang":["length","length","length","length","compare"],"jisim":["mass","mass","mass","compare"],"isipadu":["liquid","liquid","liquid","compare"]},"5":{"panjang":["fraction_convert","fraction_convert","decimal_convert","add_three","multiply","divide"],"jisim":["fraction_convert","fraction_convert","decimal_convert","add_three","multiply","divide"],"isipadu":["fraction_convert","fraction_convert","decimal_convert","add_three","multiply","divide"]},"6":{"panjang":["length_relation","length_relation","length_relation","multi_step"],"jisim":["mass_relation","mass_relation","mass_relation","multi_step"],"isipadu":["liquid_relation","liquid_relation","liquid_relation","multi_step"]}};
const UNIT=[[/length/,'panjang'],[/mass/,'jisim'],[/liquid|capacity/,'isipadu']];
const SKILL={'D1.MEASURE':[1,null],'D2.6.1':[2,['panjang']],'D2.6.2':[2,['jisim']],'D2.6.3':[2,['isipadu']],'D2.6.4':[2,null],
 'D3.MEASURE':[3,null],'D4.MEASURE':[4,null],'D5.MEASURE':[5,null],'D6.MEASURE':[6,null]};
/* archetype app → [{mode,start}] : padanan tepat dahulu, kemudian ikut unit (length/mass/liquid) */
function locate(grade,a){a=String(a||'');const G=ARCH[grade]||{},out=[];
 for(const[m,list] of Object.entries(G)){const i=list.indexOf(a);if(i>=0)out.push({mode:m,start:i})}
 if(out.length)return out;
 if(a==='legacy'||a==='native_direct'||/^native_/.test(a)||/^y[3-6]/.test(a))return [];
 const u=UNIT.find(([re])=>re.test(a));if(u&&G[u[1]]){const i=G[u[1]].findIndex(x=>a.includes(x));return[{mode:u[1],start:Math.max(0,i)}]}
 return out}
function planFor(profile,skillId){
 const sk=SKILL[skillId];if(!sk)return null; // cth D6.AREA (luas/perimeter) kekal battle biasa
 const[grade,allowed]=sk,by={};
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 rows.forEach(e=>locate(grade,e.archetypeId).forEach(h=>{if(allowed&&!allowed.includes(h.mode))return;const b=by[h.mode]=by[h.mode]||{rows:[],start:99};b.rows.push(e);
  if(e.outcome!=='independent')b.start=Math.min(b.start,h.start)}));
 const rate=l=>l.filter(e=>e.outcome==='independent').length/l.length;
 let modes=Object.entries(by).filter(([,v])=>v.rows.length>=2&&rate(v.rows)<.8).sort((a,b)=>rate(a[1].rows)-rate(b[1].rows)).map(([m,v])=>({mode:m,start:v.start===99?0:v.start})),reason='archetype';
 if(!modes.length){modes=(allowed||Object.keys(ARCH[grade])).map(m=>({mode:m,start:0}));reason=allowed?'skill-langsung':'lalai-darjah'}
 return{grade,modes:modes.map(m=>m.mode),start:modes,hash:'d'+grade+'-'+modes.map(m=>m.mode+(m.start?'@'+m.start:'')).join('-'),reason};
}
window.PABengkelAjaib={planFor,url:(p,page='bengkel-ajaib.html')=>page+'#'+p.hash,locate,ARCH};
})();
