/* Arkitek Dimensi — router Kemahiran Fokus → mini-game Ruang.
   Membaca encounter learnerReviewV1 (sama seperti focusPracticeSummary) dan
   memetakan archetype bank soalan app kepada topik + tahap mula dalam game.
   Tidak menulis mastery dan tidak mengubah db. */
(function(){
'use strict';
/* Senarai tahap setiap topik mesti sama dengan GRADES dalam tapak-bina.html */
const GRADES={
 1:{bentuk2d:['identify2d','property2d'],bentuk3d:['identify3d']},
 2:{bentuk3d:['identify3d','faces3d'],bentuk2d:['identify2d','property2d'],corak:['pattern2d']},
 3:{prisma:['identify_prism','prism_vs_non','identify_base','count_faces','reason_vertices_edges'],poligon:['identify_polygon','polygon_from_sides'],corak:['continue_pattern','smallest_unit'],simetri:['select_axis','axis_count'],koordinat:['read_position','locate_after_move']},
 4:{perimeter:['perimeter_rect','build_perimeter','missing_side','composite_perimeter'],koordinat:['read_grid','reverse_axes','move_point']},
 5:{luas:['area_rect','build_area','missing_side_area','compare_area','composite_area'],koordinat:['read_point','translate','distance','missing_corner']},
 6:{poligon:['polygon_name6','polygon_perimeter6','polygon_side6'],sudut:['angle_measure','angle_construct','polygon_angle'],bulatan:['circle_part','radius_diameter','circle_draw'],koordinat:['scaled_distance','direction','missing_point']}
};
/* archetype app (regex) → archetype game. Urutan penting: padanan pertama menang. */
const MAP=[
 [/identify2d|identify_2d/,'identify2d'],[/property2d/,'property2d'],[/identify3d|identify_3d/,'identify3d'],[/flat|curved|faces3d/,'faces3d'],
 [/symmetry_axis_count|choose_shape_from_axis_count|axis_count/,'axis_count'],[/symmetry|fold_line|select_axis/,'select_axis'],
 [/repeating_unit|smallest_unit/,'smallest_unit'],[/pattern/,'continue_pattern'],
 [/polygon_from_sides|infer_polygon|explain_regular_polygon/,'polygon_from_sides'],[/identify_polygon|regular_polygon|polygon_from_picture|named_regular/,'identify_polygon'],
 [/identify_base/,'identify_base'],[/count_faces/,'count_faces'],[/vertices|edges/,'reason_vertices_edges'],[/non_prism|why_not_prism|discriminate|compare_prism/,'prism_vs_non'],[/prism|classify_by_properties|from_picture|from_properties/,'identify_prism'],
 [/polygon_name/,'polygon_name6',['D6.ANGLE','D6.SPACE_PROBLEM','D6.AREA']],[/polygon_perimeter|polygon_fence|fence_compare/,'polygon_perimeter6',['D6.ANGLE','D6.SPACE_PROBLEM','D6.AREA']],[/perimeter_side/,'polygon_side6',['D6.ANGLE','D6.SPACE_PROBLEM','D6.AREA']],
 [/polygon_angle|polygon_sum|polygon_compare|polygon_interior|straight|missing$/,'polygon_angle',['D6.ANGLE','D6.SPACE_PROBLEM']],
 [/angle_construct|construct|target|combine|turn|tool/,'angle_construct',['D6.ANGLE','D6.SPACE_PROBLEM']],[/angle|read|classify/,'angle_measure',['D6.ANGLE']],
 [/circle_draw|draw_radius|setting|steps|compass/,'circle_draw'],[/circle_part|label|parts/,'circle_part'],[/radius|diameter|two_circle/,'radius_diameter'],
 [/volume/,'volume'],[/composite_area/,'composite_area6'],[/missing_dimension/,'missing_dimension'],[/perimeter_reason/,'perimeter_reason'],
 [/area_rect/,'area_rect',['D5.AREA']],[/build_area/,'build_area',['D5.AREA']],
 [/composite/,'composite_perimeter',['D4.PERIM']],[/composite/,'composite_area',['D5.AREA']],[/composite/,'perimeter_rect',['D3.SHAPE']],
 [/missing_side/,'missing_side',['D3.SHAPE','D4.PERIM']],[/missing_side/,'missing_side_area',['D5.AREA']],
 [/rectangle/,'build_perimeter',['D4.PERIM']],[/rectangle/,'build_area',['D5.AREA']],[/compare/,'compare_area',['D5.AREA']],[/perimeter/,'perimeter_rect'],
 [/scaled_distance|scale/,'scaled_distance'],[/direction|cardinal/,'direction'],[/missing_point|route/,'missing_point'],
 [/reverse_axes/,'reverse_axes'],[/move_point/,'move_point'],[/translate/,'translate'],[/distance/,'distance',['D5.COORD']],[/missing/,'missing_corner',['D5.COORD']],
 [/read_grid/,'read_grid'],[/read/,'read_point',['D5.COORD']],
 [/movement|moves|locate_after/,'locate_after_move'],[/position|object|intersection|relative/,'read_position']
];
const SKILL_GRADE=s=>{const m=/^D(\d)/.exec(s);return m?+m[1]:0};
const SKILL_FAMS={'D1.SHAPE':['bentuk2d','bentuk3d'],'D2.7.1':['bentuk3d'],'D2.7.2':['bentuk2d'],'D2.7.3':['bentuk2d','bentuk3d','corak'],
 'D3.SHAPE':['prisma','poligon','corak','simetri'],'D3.POSITION':['koordinat'],
 'D4.PERIM':['perimeter'],'D4.COORD':['koordinat'],'D5.AREA':['luas'],'D5.COORD':['koordinat'],'D6.AREA':['poligon'],'D6.ANGLE':['sudut','poligon'],'D6.CIRCLE':['bulatan'],'D6.SPACE_PROBLEM':['sudut','bulatan','poligon'],'D6.COORD':['koordinat'],
 'D3.T7.7.1.1':['prisma'],'D3.T7.7.1.2':['prisma'],'D3.T7.7.1.3':['prisma'],'D3.T7.7.2.1':['poligon'],'D3.T7.7.2.2':['corak'],'D3.T7.7.3.1':['simetri']};
function locate(grade,arch){for(const[f,list] of Object.entries(GRADES[grade]||{})){const i=list.indexOf(arch);if(i>=0)return{fam:f,start:i}}return null}
function mapArch(grade,skill,a){a=String(a||'');
 /* D2 has a single starter pattern challenge; D3 continues the repeated-unit bank. */
 if(grade===2&&/pattern/i.test(a)){const hit=locate(grade,'pattern2d');if(hit)return hit}
 for(const[re,arch,only] of MAP){if(only&&!only.includes(skill))continue;if(re.test(a)){const hit=locate(grade,arch);if(hit)return hit}}return null}

/* plan = {grade, fams:[{fam,start}], hash, reason} atau null */
function planFor(profile,skillId){
 if(!(skillId in SKILL_FAMS))return null;
 const grade=SKILL_GRADE(skillId),allowed=SKILL_FAMS[skillId];
 const rows=(profile?.learnerReviewV1?.encounters||[]).filter(e=>e.skillId===skillId&&!['demo','dev','dev-test'].includes(e.mode)).slice(-20);
 const by={};
 rows.forEach(e=>{const hit=mapArch(grade,skillId,e.archetypeId);if(!hit||(allowed&&!allowed.includes(hit.fam)))return;(by[hit.fam]=by[hit.fam]||{rows:[],start:9}).rows.push(e);
  if(e.outcome!=='independent')by[hit.fam].start=Math.min(by[hit.fam].start,hit.start)});
 const rate=l=>l.filter(e=>e.outcome==='independent').length/l.length;
 let fams=Object.entries(by).filter(([,v])=>v.rows.length>=2&&rate(v.rows)<.8).sort((a,b)=>rate(a[1].rows)-rate(b[1].rows)).map(([f,v])=>({fam:f,start:v.start===9?0:v.start})),reason='archetype';
 if(!fams.length){const pool=allowed||Object.keys(GRADES[grade]||{});if(!pool.length)return null;fams=pool.map(f=>({fam:f,start:0}));reason='lalai'}
 return{grade,fams,hash:'d'+grade+'-'+fams.map(f=>f.fam+(f.start?'@'+f.start:'')).join('-'),reason};
}
window.PATapakBina={planFor,url:(p,page='tapak-bina.html')=>page+'#'+p.hash,mapArch,GRADES,SKILL_FAMS};
})();
