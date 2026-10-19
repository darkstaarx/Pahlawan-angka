// Pahlawan Angka — Year 6 Curriculum Bank v2 runtime v3.61.0
(function(){
'use strict';
const VERSION='3.61.0',C=window.PAY6CompetencyV2;
if(!C)return;
const H=window.PAY6KSSRRepair?.helpers||{},VH=window.PAKSSRDepth?.visualHelpers||{};
const stage=window.PAKSSRYear6?.stage||function(s){
 const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);
 if(e===0)return 2;if(w>=1&&e<=3)return 1;if(w>=2)return 1;if(e>=4&&(m<35||c<35))return 1;if(e<4||m<70||c<60)return 2;return 3;
};
const Nq=(v,t)=>N(v,t),choose=a=>pick(a),rand=(a,b)=>R(a,b);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):'<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const coord=(pts,scale)=>VH.coordinateMap?VH.coordinateMap(pts,scale):table(['Titik','x','y'],pts.map(p=>[p.label,p.x,p.y]));
const protractor=d=>H.protractorSvg?H.protractorSvg(d):'<div class="kssrDiagram">Sudut '+d+'°</div>';
const polygon=n=>H.regularPolygonSvg?H.regularPolygonSvg(n):'<div class="kssrDiagram">Poligon '+n+' sisi</div>';
const circle=(m,r)=>H.circleSvg?H.circleSvg(m,r):'<div class="kssrDiagram">Bulatan</div>';
const pie=(s,o={})=>H.pieSvg?H.pieSvg(s,o):table(['Kategori','Sudut'],s.map(x=>[x.label,x.angle+'°']));
const bag=(r,b,g=0)=>H.bagVisual?H.bagVisual(r,b,g):table(['Warna','Bilangan'],[['Merah',r],['Biru',b],['Hijau',g]]);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const frac=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;if(d===1)return String(n);if(n>d){const w=Math.floor(n/d),r=n%d;return r?w+' '+r+'/'+d:String(w)}return n+'/'+d};
const fmtTime=mins=>{mins=((mins%1440)+1440)%1440;return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')};
const cities=[
 {name:'Kuala Lumpur',offset:480},{name:'Tokyo',offset:540},{name:'Bangkok',offset:420},{name:'Dubai',offset:240},
 {name:'New Delhi',offset:330},{name:'Darwin',offset:570},{name:'London',offset:0},{name:'Paris',offset:60}
];
function q(prompt,answer,wrong,hint,kind){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-24)}
function chooseNode(id){
 const route=C.routes[id]||[];if(!route.length)return null;
 const seen=recentFor(id).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
 const last=seen.at(-1),counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));
 const pool=route.filter(n=>n!==last);
 return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function chooseMode(id,node,modes){
 const prefix='y6v2_'+node.replaceAll('.','_')+'_',full=modes.map(m=>prefix+m);
 const recent=recentFor(id).map(x=>String(x.archetypeId||'')),last=recent.at(-1);
 const counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length]));
 const pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
 return chosen.slice(prefix.length);
}
function bandModes(s,low,core,high){return stage(s)===1?low:stage(s)===3?high:core}
function mark(out,id,node,mode,rep,demand,s,targets=[]){
 if(!out)return out;const meta=C.byId[node];
 out.source='kssr-year6-curriculum-v2-v3.61.0';out.standardRef=node;out.competencyId=node;out.subcompetencyId=node;out.curriculumNode=node;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.archetypeId='y6v2_'+node.replaceAll('.','_')+'_'+mode;out.representation=rep;out.demand=demand;
 out.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;out.misconceptionTargets=targets;out.kssrYear6V2Version=VERSION;
 return out;
}
// Randomising helpers so each archetype draws fresh names, contexts and values.
const NAMES=['Aiman','Mei','Ravi','Hana','Lina','Hafiz','Siti','Kumar','Aina','Daniel','Nurul','Farid','Priya','Wei Ling','Iskandar','Zara'];
const who=(n=1)=>{const a=[...NAMES].sort(()=>Math.random()-.5);return n===1?a[0]:a.slice(0,n)};
const pickN=(arr,n)=>[...arr].sort(()=>Math.random()-.5).slice(0,n);
const fmtN=n=>Number(n).toLocaleString('en-US');
const words=n=>typeof numWords==='function'?numWords(n).replace(/^sejuta/,'satu juta'):fmtN(n);
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
// Distinct wrong options: drop anything equal to the answer or to an earlier option, keep order.
// Distinct wrong options: drop anything equal to the answer or to an earlier option, keep order,
// then top up with nearby values of the same shape (12 km -> 13 km, 11 km) so there are always three.
const distinct=(answer,list,tag)=>{
 const seen=new Set([String(answer)]),out=[];
 const add=v=>{const k=String(v);if(v==null||Number.isNaN(v)||seen.has(k)||out.length>=3)return;seen.add(k);out.push(Nq(v,tag))};
 list.forEach(add);
 const m=String(answer).match(/^(RM)?(-?\d+(?:\.\d+)?)(\D.*)?$/);
 if(out.length<3&&m){const num=Number(m[2]),dp=(m[2].split('.')[1]||'').length,step=dp?Math.pow(10,-dp):1;
  for(const d of [1,-1,2,-2,5,-5,10,-10]){const v=Number((num+d*step).toFixed(dp));if(v<0)continue;add(typeof answer==='number'?v:(m[1]||'')+v.toFixed(dp)+(m[3]||''))}}
 return out;
};
// Focus Diagnosis v2 tags for D6, authored per archetype (never inferred from answers).
// Unit 6 (angle, circle, space), coordinates directions and probability have no
// foundation in data/focus-v2/foundation-map-v1.json, so they stay untagged (abstain).
// Entry: [contextDomain, operation steps, foundationIds, conceptIds, diagnosticFamily?]
const TAG_REVISION='d6-authored-v1';
const NUM_PV=['number','',['number.place_value'],['number.place_value']];
const FOCUS_NODE={
 '1_1_1':NUM_PV,'1_1_2':NUM_PV,
 '1_1_3':['number','',['number.place_value','fraction.equal_parts'],['fraction.equal_parts']],
 '1_1_4':['number','',['number.place_value','number.decimal_place_value'],['number.decimal_place_value']],
 '1_1_5':['number','',['number.place_value'],['number.place_value']],
 '1_2_1':['number','addition,multiplication',['operation.choose','mul.facts','add.place_value'],[]],
 '1_3_1':['number','',['mul.facts','div.facts'],[]],
 '1_4_1':['number','addition',['number.place_value','add.place_value'],['number.place_value']],
 '2_1_1':['fraction','division',['fraction.equal_parts','div.facts'],['fraction.equal_parts']],
 '2_2_1':['number','multiplication',['number.decimal_place_value','mul.facts','mul.multidigit'],['number.decimal_place_value']],
 '2_2_2':['number','division',['number.decimal_place_value','div.decimal'],['number.decimal_place_value']],
 '2_3_1':['percent','',['percent.part_whole','number.decimal_place_value'],['percent.part_whole']],
 '2_3_2':['percent','addition',['percent.part_whole','add.facts'],['percent.part_whole']],
 '2_3_3':['percent','multiplication',['percent.part_whole','mul.facts'],['percent.part_whole'],'percent_concept'],
 '2_4_1':['number','multiplication,addition',['operation.choose','fraction.equal_parts','number.decimal_place_value'],[]],
 '4_1_1':['time','subtraction',['time.units'],['time.units']],
 '4_1_2':['time','subtraction,addition',['time.units'],['time.units']],
 '4_2_1':['time','addition,subtraction',['time.units'],['time.units']],
 '5_1_1':['measurement','division,multiplication',['measurement.units','ratio.relationship'],['measurement.units']],
 '7_2_1':['ratio','division',['ratio.relationship','div.facts'],['ratio.relationship']],
 '7_3_1':['ratio','division,multiplication',['ratio.relationship','mul.facts','div.facts'],['ratio.relationship']],
 '7_4_1':['ratio','division,multiplication',['ratio.relationship','operation.choose'],['ratio.relationship']],
 '8_1_1':['data','',['data.reading'],['data.reading']],
 '8_3_1':['data','',['data.reading'],['data.reading']]
};
const FOCUS_MODE={
 '1_1_3_sum':['number','addition',['fraction.equal_parts','add.place_value'],['fraction.equal_parts']],
 '1_1_4_operation':['number','subtraction',['number.decimal_place_value','sub.place_value'],['number.decimal_place_value']],
 '1_1_5_next':['number','addition',['number.place_value','add.place_value'],[]],
 '1_1_5_missing':['number','addition',['number.decimal_place_value','add.place_value'],[]],
 '1_1_5_reverse':['number','addition',['number.place_value','add.place_value'],[]],
 '1_1_5_rule':['number','subtraction',['number.decimal_place_value','sub.place_value'],[]],
 '1_1_5_error':['number','subtraction',['number.decimal_place_value','sub.place_value'],[]],
 '1_2_1_unknown':['number','subtraction,division',['operation.choose','div.facts','sub.place_value'],[]],
 '1_2_1_story':['number','multiplication,subtraction',['operation.choose','mul.multidigit','sub.regroup'],[]],
 '1_2_1_estimate':['number','multiplication',['number.place_value','mul.multidigit'],[]],
 '1_4_1_difference':['number','subtraction',['number.place_value','sub.place_value'],['number.place_value']],
 '1_4_1_reverse':['number','subtraction',['number.decimal_place_value','sub.place_value'],['number.decimal_place_value']],
 '1_4_1_million_mix':['number','subtraction,addition',['number.decimal_place_value','operation.choose'],['number.decimal_place_value']],
 '1_4_1_decision':['number','addition',['number.decimal_place_value','add.place_value'],['number.decimal_place_value']],
 '1_4_1_claim':['number','addition',['fraction.equal_parts','number.decimal_place_value'],['number.decimal_place_value']],
 '2_1_1_sharing_story':['fraction','division',['fraction.equal_parts','div.equal_sharing','operation.choose'],['fraction.equal_parts']],
 '2_2_1_estimate':['number','multiplication',['number.decimal_place_value','mul.facts'],['number.decimal_place_value']],
 '2_2_1_missing_factor':['number','division',['number.decimal_place_value','div.decimal'],['number.decimal_place_value']],
 '2_2_1_rate':['measurement','multiplication',['number.decimal_place_value','mul.multidigit','measurement.units'],['measurement.units']],
 '2_2_2_packing':['measurement','division',['div.decimal','div.remainder'],['measurement.units']],
 '2_2_2_unit_rate':['measurement','division',['div.decimal','div.equal_sharing'],['measurement.units']],
 '2_2_2_missing_divisor':['number','division',['div.decimal','mul.facts'],['number.decimal_place_value']],
 '2_3_1_compare':['percent','',['percent.part_whole','number.decimal_place_value'],['percent.part_whole'],'percent_concept'],
 '2_3_1_order':['percent','',['percent.part_whole','number.decimal_place_value'],['percent.part_whole'],'percent_concept'],
 '2_3_2_subtract':['percent','subtraction',['percent.part_whole','sub.facts'],['percent.part_whole']],
 '2_3_2_missing':['percent','subtraction',['percent.part_whole','sub.facts'],['percent.part_whole']],
 '2_3_2_points':['percent','subtraction',['percent.part_whole','sub.facts','data.reading'],['percent.part_whole']],
 '2_3_2_error':['percent','subtraction',['percent.part_whole'],['percent.part_whole']],
 '2_3_3_reverse':['percent','division',['percent.part_whole','div.facts'],['percent.part_whole'],'percent_concept'],
 '2_3_3_quantity_as_percent':['percent','division',['percent.part_whole','div.facts'],['percent.part_whole'],'percent_concept'],
 '2_3_3_multi':['percent','subtraction,multiplication',['percent.part_whole','mul.facts'],['percent.part_whole'],'percent_concept'],
 '2_4_1_bracket':['number','addition,multiplication',['number.decimal_place_value','mul.facts'],[]],
 '2_4_1_unknown':['number','multiplication,subtraction',['fraction.equal_parts','operation.choose'],[]],
 '2_4_1_fraction_decimal':['number','multiplication,subtraction,addition',['operation.choose','fraction.equal_parts','number.decimal_place_value'],[]],
 '2_5_1_claim':['measurement','multiplication,subtraction',['fraction.equal_parts','measurement.units'],['fraction.equal_parts']],
 '2_5_1_mixed_context':['measurement','multiplication,subtraction,addition',['fraction.equal_parts','number.decimal_place_value','operation.choose'],['fraction.equal_parts']],
 '2_5_1_percent_context':['percent','multiplication',['percent.part_whole','mul.facts'],['percent.part_whole'],'percent_concept'],
 '2_5_1_recipe':['measurement','multiplication',['fraction.equal_parts','mul.facts'],['fraction.equal_parts']],
 '2_5_1_reverse':['percent','subtraction,division',['percent.part_whole','div.facts'],['percent.part_whole'],'percent_concept'],
 '2_5_1_sharing':['measurement','division',['div.decimal','div.equal_sharing'],['measurement.units']],
 '4_1_1_identify_ahead':['time','',['time.units'],['time.units']],
 '4_1_1_read_offset':['time','',['time.units'],['time.units']],
 '4_1_1_same_zone':['time','',['time.units'],['time.units']],
 '5_1_1_resource_limit':['measurement','division',['measurement.units','div.remainder'],['measurement.units']],
 '5_1_1_table_compare':['measurement','division',['measurement.units','div.decimal'],['measurement.units']],
 '5_1_1_unit_rate':['measurement','division',['measurement.units','div.decimal'],['measurement.units']],
 '7_1_1_cm_scale':['ratio','multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_1_1_petak_scale':['ratio','multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_1_1_representative_scale':['ratio','multiplication',['ratio.relationship','measurement.units'],['ratio.relationship']],
 '7_1_1_route':['ratio','addition,multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_1_1_route_compare':['ratio','subtraction,multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_1_1_scale_reverse':['ratio','division',['ratio.relationship','div.facts'],['ratio.relationship']],
 '7_2_1_equivalent':['ratio','multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_2_1_length_units':['ratio','division',['ratio.relationship','measurement.units'],['ratio.relationship','measurement.units']],
 '7_2_1_liquid_units':['ratio','division',['ratio.relationship','measurement.units'],['ratio.relationship','measurement.units']],
 '7_2_1_mass_units':['ratio','division',['ratio.relationship','measurement.units'],['ratio.relationship','measurement.units']],
 '7_2_1_same_unit':['ratio','division',['ratio.relationship','measurement.units'],['ratio.relationship','measurement.units']],
 '7_2_1_money_ratio':['ratio','division',['ratio.relationship','div.facts'],['ratio.relationship']],
 '7_2_1_ratio_from_total':['ratio','division,multiplication',['ratio.relationship','div.equal_sharing'],['ratio.relationship']],
 '7_2_1_ratio_compare':['ratio','',['ratio.relationship','fraction.equal_parts'],['ratio.relationship']],
 '7_2_1_ratio_error':['ratio','',['ratio.relationship'],['ratio.relationship']],
 '7_3_1_compare_rates':['money','division',['ratio.relationship','div.facts'],['ratio.relationship']],
 '7_3_1_proportion_error':['money','multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_4_1_compare_plans':['money','multiplication',['mul.multidigit','money.ringgit_sen','operation.choose'],['money.ringgit_sen']],
 '7_4_1_map_budget':['money','multiplication',['ratio.relationship','mul.facts','money.transaction'],['ratio.relationship']],
 '7_4_1_proportion_problem':['money','division,multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_4_1_route_problem':['ratio','addition,multiplication',['ratio.relationship','mul.facts'],['ratio.relationship']],
 '7_4_1_reverse_problem':['ratio','division',['ratio.relationship','div.facts'],['ratio.relationship']],
 '7_4_1_claim':['ratio','',['ratio.relationship','measurement.units'],['ratio.relationship']],
 '8_1_1_combine':['data','addition',['data.reading','add.facts'],['data.reading']],
 '8_1_1_missing_angle':['data','addition,subtraction',['data.reading','sub.place_value'],['data.reading']],
 '8_1_1_validate_chart':['data','addition',['data.reading','add.place_value'],['data.reading']],
 '8_1_1_compare':['data','division',['data.reading','div.facts'],['data.reading']],
 '8_1_1_read_quantity':['data','division,multiplication',['data.reading','ratio.relationship'],['data.reading']],
 '8_1_1_infer_total':['data','division,multiplication',['data.reading','ratio.relationship'],['data.reading']],
 '8_1_1_reverse_sector':['data','division,multiplication',['data.reading','ratio.relationship'],['data.reading']],
 '8_1_1_complete_label':['data','division',['data.reading','ratio.relationship'],['data.reading']],
 '8_3_1_combine_data':['data','addition,division,multiplication',['data.reading','ratio.relationship'],['data.reading']],
 '8_3_1_infer_total':['data','division,multiplication',['data.reading','ratio.relationship'],['data.reading']],
 '8_3_1_claim':['data','addition',['data.reading','add.facts'],['data.reading']],
 '8_3_1_compare':['data','division',['data.reading','div.facts'],['data.reading']],
 '8_3_1_threshold':['data','',['data.reading'],['data.reading']],
 '8_3_1_multi_step':['data','subtraction,addition',['data.reading'],['data.reading']]
};
// Money (Unit 3) bank, keyed by y6moneyreal_<mode>. Pure-vocabulary items (insurance,
// takaful, documents, asset/liability terms) carry no arithmetic foundation: abstain.
const MD='money.discount',PC='percent.part_whole',PL='money.profit_loss',TX='money.transaction',RS='money.ringgit_sen';
const FOCUS_MONEY={
 term_profit:['',[PL],[PL]],term_loss:['',[PL],[PL]],
 profit_value:['subtraction',[PL,'sub.place_value'],[PL]],loss_value:['subtraction',[PL,'sub.place_value'],[PL]],
 selling_from_cost_profit:['addition',[PL,'add.place_value'],[PL]],selling_from_cost_loss:['subtraction',[PL,'sub.place_value'],[PL]],
 cost_from_selling_profit:['subtraction',[PL,'operation.choose'],[PL]],cost_from_selling_loss:['addition',[PL,'operation.choose'],[PL]],
 profit_percent:['multiplication,addition',[PL,PC],[PL,PC]],profit_error_analysis:['subtraction',[PL,'operation.choose'],[PL]],
 all_stock_profit:['subtraction,multiplication',[PL,'mul.facts'],[PL]],business_target_profit:['multiplication,addition,division',[PL,'div.decimal'],[PL]],
 discount_amount:['multiplication',[MD,PC],[MD,PC],'money_discount'],discount_final:['multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],
 discount_error_analysis:['multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],multi_item_discount:['addition,multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],
 cash_balance_after_discount:['multiplication,subtraction',[MD,PC,TX],[MD,PC],'money_discount'],compare_two_discount_offers:['multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],
 compare_discount_rebate:['multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],money_sufficient:['multiplication,subtraction,addition',[MD,PC,TX],[MD,PC],'money_discount'],
 discount_then_profit:['multiplication,subtraction',[MD,PL],[MD,PL]],reverse_cost_from_discounted_sale:['multiplication,subtraction',[MD,PL],[MD,PL]],
 invoice_trade_discount:['multiplication,subtraction',[MD,PC,'mul.multidigit'],[MD,PC],'money_discount'],
 rebate_final:['subtraction',[TX,'sub.place_value'],[TX]],voucher_balance:['subtraction',[TX,'sub.place_value'],[TX]],
 service_tax_value:['multiplication',[PC,TX],[PC]],bill_after_tax:['multiplication,addition',[PC,TX],[PC]],receipt_service_tax_total:['multiplication,addition',[PC,TX],[PC]],
 tax_error_analysis:['multiplication,addition',[PC,TX],[PC]],receipt_multiitem_tax:['multiplication,addition',[PC,TX,'mul.facts'],[PC]],
 invoice_tax_voucher:['multiplication,addition,subtraction',[PC,TX,'operation.choose'],[PC]],
 interest_savings:['multiplication',[PC,'mul.multidigit'],[PC]],interest_loan_years:['multiplication',[PC,'mul.multidigit'],[PC]],
 loan_total_payment:['multiplication,addition',[PC,'mul.multidigit'],[PC]],savings_interest_growth:['multiplication,addition',[PC,'mul.multidigit'],[PC]],
 dividend_value:['multiplication',[PC,'mul.multidigit'],[PC]],dividend_compare:['multiplication',[PC,'mul.multidigit'],[PC]],
 dividend_rate:['division',[PC,'div.multidigit'],[PC]],dividend_rate_reverse:['division',[PC,'div.multidigit'],[PC]],
 net_asset:['subtraction',[RS,'sub.place_value'],[]],asset_liability_change:['subtraction',[RS,'sub.place_value'],[]]
};
function focusTag(q,skillId){
 if(!q||q.focusDiagnosticV1||!/^D6\./.test(String(skillId||'')))return q;
 const arch=String(q.archetypeId||'');let spec=null;
 if(arch.startsWith('y6moneyreal_')){const m=FOCUS_MONEY[arch.slice(12)];if(m)spec=['money',m[0],m[1],m[2],m[3]];}
 else if(arch.startsWith('y6v2_')){const key=arch.slice(5);spec=FOCUS_MODE[key]||FOCUS_NODE[key.split('_').slice(0,3).join('_')]||null;}
 return spec&&typeof attachSpecFocusTag==='function'?attachSpecFocusTag(q,skillId,spec,TAG_REVISION):q;
}
window.PAY6V2Runtime={version:VERSION,C,GEN:{},stage,Nq,choose,rand,tidy,table,coord,protractor,polygon,circle,pie,bag,gcd,frac,fmtTime,cities,q,recentFor,chooseNode,chooseMode,bandModes,mark,who,pickN,fmtN,words,isPrime,distinct,focusTag,FOCUS_NODE,FOCUS_MODE,FOCUS_MONEY};
document.documentElement?.setAttribute('data-y6-v2-runtime',VERSION);
})();