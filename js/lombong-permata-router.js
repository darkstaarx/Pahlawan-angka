/* Lombong Permata Wira — router Kemahiran Fokus → mini-game Perpuluhan & Peratus (D2–D6).
   Membaca encounter learnerReviewV1 seperti focusPracticeSummary() dan memetakan archetype
   bank soalan app kepada mod + tahap mula dalam game (hash #d<g>-<mod>@<tahap>). Tidak menulis mastery. */
(function(){
'use strict';
const ARCH={"2":{"perpuluhan":["d2_tenths_grid","d2_tenths_fraction","d2_tenths_line","d2_tenths_shade","d2_tenths_compare"]},"3":{"perpuluhan":["hundred_grid_to_decimal","hundred_grid_to_decimal","hundredths_to_decimal","decimal_place_value_from_hundredths","compare_decimals_number_line","compare_decimal_pair","select_largest_decimal","add_decimals_hundredths","subtract_decimals_hundredths","missing_addend_decimal"],"peratus":["hundred_grid_to_percent","percent_to_shaded_count","number_out_of_100_to_percent","percent_words_to_symbol","infer_unshaded_percent","match_fraction_decimal_percent","find_non_equivalent_representation"]},"4":{"perpuluhan":["decimal_add_three","decimal_add_three","decimal_subtract_two","decimal_subtract_two","decimal_multiply","decimal_divide","decimal_subtract_two"],"peratus":["hundred_grid_percent","fraction_to_percent","percent_to_fraction","percent_of_quantity","percent_of_quantity","percent_story"]},"5":{"perpuluhan":["depth_place","depth_round3","depth_combined","depth_multiply","depth_divide","depth_multiply"],"peratus":["depth_visual","depth_mixed_to_percent","depth_over100_quantity","depth_inverse","depth_over100_quantity"]},"6":{"perpuluhan":["y6v2_2_2_1_multiply","y6v2_2_2_2_divide","y6v2_2_2_1_missing_factor","y6v2_2_2_1_estimate","y6v2_2_2_1_error","y6v2_2_2_1_rate"],"peratus":["y6v2_2_3_1_percent_to_decimal","y6v2_2_3_1_decimal_to_percent","y6v2_2_3_1_order","y6v2_2_3_2_add","y6v2_2_3_2_points","y6v2_2_3_3_of_quantity","y6v2_2_3_3_quantity_as_percent","y6v2_2_3_3_compare","y6v2_2_3_3_reverse","y6v2_2_3_3_multi","y6v2_2_3_1_claim"],"masalah":["y6v2_2_4_1_simple","y6v2_2_4_1_bracket","y6v2_2_4_1_unknown","y6v2_2_4_1_fraction_decimal","y6v2_2_4_1_method","y6v2_2_4_1_error","y6v2_2_5_1_recipe","y6v2_2_5_1_sharing","y6v2_2_5_1_mixed_context","y6v2_2_5_1_percent_context","y6v2_2_5_1_reverse","y6v2_2_5_1_claim"]}};
// Mixed-operation word problems do not diagnose decimal/percent skill by
// themselves; keep that bank DEV-only until the app has a matching tag.
const SKILL={'D2.3.2':[2,['perpuluhan']],'D3.DEC':[3,['perpuluhan']],'D3.PERCENT':[3,['peratus']],'D4.PERCENT':[4,['peratus']],'D4.DEC':[4,['perpuluhan']],'D5.DEC':[5,['perpuluhan']],'D5.PERCENT':[5,['peratus']],'D6.DEC':[6,['perpuluhan']],'D6.PERCENT':[6,['peratus']]};
const ALIAS={hundred_grid_fraction_decimal_percent:'match_fraction_decimal_percent',percent_symbol_to_words:'percent_words_to_symbol',y6v2_2_2_2_missing_divisor:'y6v2_2_2_1_missing_factor',y6v2_2_2_2_error:'y6v2_2_2_1_error',y6v2_2_2_2_packing:'y6v2_2_2_1_rate',y6v2_2_2_2_unit_rate:'y6v2_2_2_1_rate',y6v2_2_3_2_subtract:'y6v2_2_3_2_add',y6v2_2_3_2_missing:'y6v2_2_3_2_add',y6v2_2_3_2_error:'y6v2_2_3_1_claim',y6v2_2_3_3_claim:'y6v2_2_3_1_claim',y6v2_2_3_1_compare:'y6v2_2_3_1_order'};
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
window.PALombongPermata={planFor,url:(p,page='lombong-permata.html')=>page+'#'+p.hash,locate,ARCH,SKILL};
})();
