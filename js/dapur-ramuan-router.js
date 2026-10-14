/* Dapur Ramuan Wira — router Kemahiran Fokus → mini-game Nisbah & Kadaran (D4–D6).
   Membaca encounter learnerReviewV1 seperti focusPracticeSummary() dan memetakan archetype
   bank soalan app kepada mod + tahap mula dalam game (hash #d<g>-<mod>@<tahap>). Tidak menulis mastery. */
(function(){
'use strict';
const ARCH={"4":{"nisbah":["integrity_ratio_equivalent","integrity_ratio_missing","integrity_ratio_missing","integrity_ratio_equivalent","integrity_ratio_simplify","integrity_ratio_simplify"],"kadaran":["integrity_rate_unit","integrity_rate_scale","integrity_rate_missing","integrity_rate_scale","integrity_rate_missing"]},"5":{"nisbah":["integrity_ratio_missing","integrity_ratio_missing","integrity_ratio_equivalent","integrity_ratio_simplify","integrity_ratio_simplify"],"kadaran":["integrity_rate_unit","integrity_rate_scale","integrity_rate_missing","integrity_rate_scale","integrity_rate_missing"]},"6":{"nisbah":["y6v2_7_2_1_simplify","y6v2_7_2_1_equivalent","y6v2_7_2_1_same_unit","y6v2_7_2_1_ratio_from_total","y6v2_7_2_1_ratio_compare","y6v2_7_2_1_ratio_error"],"kadaran":["y6v2_7_3_1_direct","y6v2_7_3_1_unit_rate","y6v2_7_3_1_recipe","y6v2_7_3_1_table","y6v2_7_3_1_missing","y6v2_7_3_1_reverse","y6v2_7_3_1_compare_rates","y6v2_7_3_1_proportion_error"],"masalah":["y6v2_7_4_1_ratio_problem","y6v2_7_4_1_proportion_problem","y6v2_7_4_1_recipe_route","y6v2_7_4_1_map_budget","y6v2_7_4_1_route_problem","y6v2_7_4_1_compare_plans","y6v2_7_4_1_reverse_problem","y6v2_7_4_1_claim","y6v2_7_4_1_multi_constraint"]}};
// The app's KSSR graph has a live Nisbah skill only at D6. D4/D5 banks stay
// available for DEV review, but must not be presented as diagnosed curriculum.
const SKILL={'D6.RATIO':[6,['nisbah','kadaran','masalah']]};
const ALIAS={y6v2_7_2_1_length_units:'y6v2_7_2_1_same_unit',y6v2_7_2_1_liquid_units:'y6v2_7_2_1_same_unit',y6v2_7_2_1_mass_units:'y6v2_7_2_1_same_unit',y6v2_7_2_1_money_ratio:'y6v2_7_2_1_same_unit'};
function locate(grade,a,modes){a=String(a||'');const cands=[a,...[].concat(ALIAS[a]||[])],out=[];
 for(const m of modes){const list=(ARCH[grade]||{})[m]||[];const i=cands.map(c=>list.indexOf(c)).find(x=>x>=0);if(i!=null)out.push({mode:m,start:i})}return out}
function planFor(profile,skillId){
 const sk=SKILL[skillId];if(!sk)return null;const[grade,allowed]=sk,by={};
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 rows.forEach(e=>locate(grade,e.archetypeId,allowed).forEach(h=>{const b=by[h.mode]=by[h.mode]||{rows:[],start:99};b.rows.push(e);if(e.outcome!=='independent')b.start=Math.min(b.start,h.start)}));
 const rate=l=>l.filter(e=>e.outcome==='independent').length/l.length;
 let modes=Object.entries(by).filter(([,v])=>v.rows.length>=2&&rate(v.rows)<.8).sort((a,b)=>rate(a[1].rows)-rate(b[1].rows)).map(([m,v])=>({mode:m,start:v.start===99?0:v.start})),reason='archetype';
 if(!modes.length){modes=allowed.map(m=>({mode:m,start:0}));reason='skill-langsung'}
 return{grade,modes:modes.map(m=>m.mode),start:modes,hash:'d'+grade+'-'+modes.map(m=>m.mode+(m.start?'@'+m.start:'')).join('-'),reason};
}
window.PADapurRamuan={planFor,url:(p,page='dapur-ramuan.html')=>page+'#'+p.hash,locate,ARCH,SKILL};
})();
