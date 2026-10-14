/* Kedai Kek Wira — router Kemahiran Fokus → mini-game Pecahan (D1–D6).
   Membaca encounter learnerReviewV1 seperti focusPracticeSummary() dan memetakan archetype
   bank soalan app kepada mod + tahap mula dalam game (hash #d<g>-<mod>@<tahap>).
   Tidak menulis mastery dan tidak mengubah db. */
(function(){
'use strict';
/* Senarai archetype setiap tahap — dijana daripada GEN dalam kedai-kek.html */
const ARCH={"1":{"potong":["shade_symbol","shade_words","equal_share_shade","shade_parts"],"nama":["model_symbol","model_name","unmarked_symbol","half_everyday_name"],"cerita":["half_remaining_story","take_one_action","two_people_eat","two_people_receive"]},"2":{"potong":["bar_model","verbal_part","verbal_part","missing_part"],"banding":["compare_model","compare_model","object_set","compare_model"],"persepuluh":["coloured_card","filled_bottle","decimal_to_fraction","remaining_part","mixed_compare"]},"3":{"setara":["equivalent_fraction_area","equivalent_fraction_area","equivalent_fraction_missing_number","equivalent_fraction_symbolic"],"permudah":["simplify_fraction_from_area","identify_common_factor_for_simplification","simplify_fraction_direct"],"bercampur":["identify_mixed_number_from_picture","convert_improper_to_mixed","convert_improper_to_mixed","convert_mixed_to_improper"],"tambah":["add_proper_fractions","add_proper_fractions","subtract_proper_fractions","fraction_operation_context"]},"4":{"bercampur":["improper_to_mixed","improper_to_mixed","mixed_to_improper"],"tambah":["fraction_subtract","fraction_add_three","fraction_add_three","fraction_combined"],"kuantiti":["fraction_quantity","fraction_quantity","fraction_quantity","fraction_quantity"]},"5":{"darab":["depth_visual_model","depth_proper_x_whole","depth_mixed_x_whole","depth_proper_x_whole"],"darabf":["depth_proper_x_proper","depth_proper_x_proper","depth_mixed_x_proper","depth_proper_x_proper"]},"6":{"bahagi":["y6v2_2_1_1_whole_div_fraction","y6v2_2_1_1_whole_div_fraction","y6v2_2_1_1_fraction_div_whole","y6v2_2_1_1_fraction_div_fraction","y6v2_2_1_1_mixed_div_fraction","y6v2_2_1_1_sharing_story"],"gabung":["y6v2_2_4_1_simple","y6v2_2_4_1_bracket","y6v2_2_4_1_fraction_decimal","y6v2_2_4_1_unknown"],"masalah":["y6v2_2_5_1_recipe","y6v2_2_5_1_mixed_context","y6v2_2_5_1_claim","y6v2_2_1_1_error"]}};
/* archetype bank app yang tiada salinan tepat dalam game → archetype game yang paling hampir */
const ALIAS={
 equal_share_symbol:'model_symbol',fold_half:'model_symbol',selected_fraction:'model_symbol',picture_used_name:'model_name',save_name:'model_name',
 picture_unused:'unmarked_symbol',quarter_synonyms:'half_everyday_name',half_synonyms:'half_everyday_name',
 give_remaining:'half_remaining_story',put_back:'take_one_action',eat_then_give:'two_people_eat',separate_saved_given:'two_people_eat',
 progress_decimal_fraction:'coloured_card',visual_match:'coloured_card',coloured_card:'coloured_card',matching_pair:'decimal_to_fraction',
 progress_decimal_compare:'mixed_compare',ribbon_compare:'mixed_compare',progress_decimal_read:'coloured_card',
 y6v2_2_5_1_sharing:'y6v2_2_1_1_sharing_story'};
const SKILL={'D1.FRAC':[1,null],
 'D2.3.1':[2,['potong','banding']],'D2.3.3':[2,['persepuluh']],'D2.3.4':[2,['persepuluh']],
 'D3.FRAC':[3,null],'D4.FRAC':[4,null],'D5.FRAC':[5,null],'D6.FRAC':[6,null]};
function locate(grade,a){a=String(a||'');const exact=ALIAS[a]||a,out=[];
 for(const[m,list] of Object.entries(ARCH[grade]||{})){const i=list.indexOf(exact);if(i>=0)out.push({mode:m,start:i})}
 if(out.length)return out;
 if(!/fraction|share|shade|half|quarter|numerator|denominator|mixed_number|improper/.test(a))return out;
 const mode=grade===1?(/story|daily|remaining|people|action/.test(a)?'cerita':/name|symbol|model/.test(a)?'nama':'potong')
  :grade===2?(/compare|ribbon/.test(a)?'persepuluh':'potong')
  :grade===3?(/add|subtract|operation/.test(a)?'tambah':/mixed|improper/.test(a)?'bercampur':/simplif/.test(a)?'permudah':'setara')
  :grade===4?(/quantity/.test(a)?'kuantiti':/add|subtract/.test(a)?'tambah':'bercampur')
  :grade===5?(/whole/.test(a)?'darab':'darabf'):(/divide|sharing/.test(a)?'bahagi':'masalah');
 return ARCH[grade]?.[mode]?.length?[{mode,start:0}]:out}
function planFor(profile,skillId){
 const sk=SKILL[skillId];if(!sk)return null; // cth D3.DEC / D5.PERCENT bukan topik pecahan
 const[grade,allowed]=sk,by={};
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 rows.forEach(e=>locate(grade,e.archetypeId).forEach(h=>{if(allowed&&!allowed.includes(h.mode))return;const b=by[h.mode]=by[h.mode]||{rows:[],start:99};if(!b.rows.includes(e))b.rows.push(e);
  if(e.outcome!=='independent')b.start=Math.min(b.start,h.start)}));
 const rate=l=>l.filter(e=>e.outcome==='independent').length/l.length;
 let modes=Object.entries(by).filter(([,v])=>v.rows.length>=2&&rate(v.rows)<.8).sort((a,b)=>rate(a[1].rows)-rate(b[1].rows)).map(([m,v])=>({mode:m,start:v.start===99?0:v.start})),reason='archetype';
 if(!modes.length){modes=(allowed||Object.keys(ARCH[grade])).map(m=>({mode:m,start:0}));reason=allowed?'skill-langsung':'lalai-darjah'}
 return{grade,modes:modes.map(m=>m.mode),start:modes,hash:'d'+grade+'-'+modes.map(m=>m.mode+(m.start?'@'+m.start:'')).join('-'),reason};
}
window.PAKedaiKek={planFor,url:(p,page='kedai-kek.html')=>page+'#'+p.hash,locate,ARCH};
})();
