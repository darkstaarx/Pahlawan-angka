/* Pahlawan Angka — authored money contrast evaluator v2.
   Pure and read-only.  It only evaluates explicitly tagged, distinct
   contextual-money / plain-operation pairs.  It never infers coverage from
   a skill id, changes learner state, or chooses a question by itself. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusMoneyDiagnosticV2=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const VERSION='2.0.0-shadow';
 const VALID=new Set(['independent','corrected','assisted','unresolved']);
 const NON_INDEPENDENT=new Set(['corrected','assisted','unresolved']);
 const text=x=>String(x??'').trim();
 const gradeOf=id=>Number((/^D([1-6])\./.exec(text(id))||[])[1]||0);

 // This is a capability allow-list, not a promise that every skill has a
 // usable production route.  A question tag must still name the exact family
 // and operation below before it is accepted as evidence.
 const PROBE_FAMILIES=Object.freeze({
  money_add:{domain:'money',plainDomain:'number',operation:'addition',skills:['D1.MONEY','D2.4.2']},
  money_subtract:{domain:'money',plainDomain:'number',operation:'subtraction',skills:['D2.4.3','D2.4.6','D3.MONEY','D4.MONEY']},
  money_multiply:{domain:'money',plainDomain:'number',operation:'multiplication',skills:['D2.4.4','D3.MONEY','D4.MONEY']},
  money_divide:{domain:'money',plainDomain:'number',operation:'division',skills:['D2.4.5']},
  money_total:{domain:'money',plainDomain:'number',operation:'addition',skills:['D3.MONEY','D4.MONEY']},
  money_change:{domain:'money',plainDomain:'number',operation:'subtraction',skills:['D3.MONEY','D4.MONEY','D5.MONEY','D6.MONEY']},
  money_unit_price:{domain:'money',plainDomain:'number',operation:'multiplication',skills:['D3.MONEY','D4.MONEY']},
  money_budget:{domain:'money',plainDomain:'number',operation:'subtraction',skills:['D3.MONEY','D4.MONEY','D5.MONEY','D6.MONEY']},
  money_discount:{domain:'money',plainDomain:'number',operation:'discount',skills:['D5.MONEY','D6.MONEY']},
  money_profit:{domain:'money',plainDomain:'number',operation:'subtraction',skills:['D6.MONEY']}
 });
 const SKILL_FAMILIES=Object.freeze({
  'D1.MONEY':['money_add'],'D2.4.2':['money_add'],'D2.4.6':['money_subtract'],
  'D2.4.3':['money_subtract'],'D2.4.4':['money_multiply'],'D2.4.5':['money_divide'],
  'D3.MONEY':['money_total','money_change','money_unit_price','money_budget'],
  'D4.MONEY':['money_total','money_change','money_unit_price','money_budget'],
  'D5.MONEY':['money_discount','money_change','money_budget'],
  'D6.MONEY':['money_discount','money_profit','money_change','money_budget'],

 });
 const UNSUPPORTED=new Set(['D2.4.1','D2.4.7']);
 function registry(){return {version:VERSION,skills:SKILL_FAMILIES,families:PROBE_FAMILIES,unsupported:[...UNSUPPORTED]}}
 function normalize(raw){
  if(!raw||raw.schema!=='pa.money.contrast.v2')return null;
  const family=text(raw.family||raw.diagnosticFamily),spec=PROBE_FAMILIES[family];
  const result=text(raw.result||raw.outcome),probe=text(raw.probe||raw.variantFingerprint),pair=text(raw.pairId),matchKey=text(raw.matchKey);
  const domain=text(raw.contextDomain||raw.domain),operation=text(raw.operation);
  if(!spec||!VALID.has(result)||!probe||!pair||!matchKey||!domain||!operation)return null;
  const side=domain===spec.domain?'money':domain===spec.plainDomain?'plain':null;
  if(!side||operation!==spec.operation)return null;
  if(side==='money'&&raw.tagOrigin!=='authored')return null;
  if(side==='plain'&&!['authored','derived_exact'].includes(raw.tagOrigin))return null;
  return {family,side,probe,pair,matchKey,result,skillId:text(raw.skillId||raw.originSkillId),operation,domain};
 }
 function distinct(rows,side,result){return new Set(rows.filter(x=>x.side===side&&(result==='nonIndependent'?NON_INDEPENDENT.has(x.result):x.result===result)).map(x=>x.probe)).size}
 function evaluate(input={}){
  const origin=text(input.originSkillId),allowed=SKILL_FAMILIES[origin]||[];
  const available=new Set(Array.isArray(input.questionBankSkills)?input.questionBankSkills.map(text):[]);
  const suppliedNext=text(input.nextSkillId),sameGrade=suppliedNext&&gradeOf(suppliedNext)===gradeOf(origin);
  const base={version:VERSION,mode:'shadow_read_only',originSkillId:origin,writes:0,nextSkillId:null};
  if(!origin||UNSUPPORTED.has(origin)||!allowed.length)return Object.freeze({...base,state:'abstain',rootCause:null,confidence:'none',reasonCode:'UNSUPPORTED_MONEY_SKILL',evidence:{}});
  const raw=Array.isArray(input.observations)?input.observations:[];
  const rows=[],seen=new Set(),rejected=[];
  for(const value of raw){
   const x=normalize(value);
   if(!x||x.skillId&&x.skillId!==origin||!allowed.includes(x.family)){rejected.push(value);continue}
   const key=x.family+'|'+x.side+'|'+x.probe;
   if(seen.has(key))continue;
   seen.add(key);rows.push(x);
  }
  const byFamily={};
  for(const family of allowed){
   const spec=PROBE_FAMILIES[family], group=rows.filter(x=>x.family===family);
   const pairs=new Set(group.map(x=>x.pair));
   const matched=[...pairs].map(pair=>group.filter(x=>x.pair===pair)).filter(g=>{
    const money=g.filter(x=>x.side==='money'),plain=g.filter(x=>x.side==='plain');
    return money.length===1&&plain.length===1&&money[0].matchKey===plain[0].matchKey;
   });
   const matchedRows=matched.flat();
   byFamily[family]={uniquePairs:matched.length,
    contextual:{independent:distinct(matchedRows,'money','independent'),nonIndependent:distinct(matchedRows,'money','nonIndependent')},
    plain:{independent:distinct(matchedRows,'plain','independent'),nonIndependent:distinct(matchedRows,'plain','nonIndependent')}};
  }
  const candidates=[];
  for(const family of allowed){
   const s=byFamily[family];if(!s||s.uniquePairs<2)continue;
   if(s.contextual.nonIndependent>=2&&s.plain.independent>=2)candidates.push({family,rootCause:'money.'+family.replace(/^money_/,'') ,reasonCode:'MONEY_FAILURE_WITH_PLAIN_OPERATION_SUCCESS'});
   else if(s.contextual.independent>=2&&s.plain.nonIndependent>=2)candidates.push({family,rootCause:'operation.'+PROBE_FAMILIES[family].operation,reasonCode:'PLAIN_OPERATION_FAILURE_WITH_MONEY_SUCCESS'});
  }
  let state='needs_contrast',rootCause=null,confidence='none',reasonCode='NOT_ENOUGH_MATCHED_DISTINCT_EVIDENCE';
  if(candidates.length===1){state='candidate';({rootCause,reasonCode}=candidates[0]);confidence='medium';}
  else if(candidates.length>1){state='abstain';reasonCode='MULTIPLE_COMPETING_CONTRAST_SIGNALS';}
  else if(rows.length&&Object.values(byFamily).some(x=>x.uniquePairs>=2))reasonCode='NO_CONTRAST_SIGNAL';
  const next=state==='candidate'&&sameGrade&&available.has(suppliedNext)?suppliedNext:null;
  const familyLabel={money_add:'tambah wang',money_subtract:'tolak wang',money_multiply:'darab wang',money_divide:'bahagi wang',money_total:'jumlah wang',money_change:'baki wang',money_unit_price:'harga seunit',money_budget:'bajet',money_discount:'diskaun',money_profit:'untung'};
  const activeFamily=candidates[0]?.family;
  const parentText=state==='candidate'&&String(rootCause||'').startsWith('money.')
   ?'Soalan '+(familyLabel[activeFamily]||'wang')+' masih mencabar walaupun pengiraan nombor yang sepadan boleh dibuat sendiri. Kekalkan latihan pada kemahiran wang ini.'
   :state==='candidate'&&String(rootCause||'').startsWith('operation.')
    ?'Soalan wang yang sepadan boleh dibuat sendiri, tetapi pengiraan nombor tanpa konteks wang masih mengelirukan. Fokus seterusnya ialah mengukuhkan operasi asas.'
    :'Bukti perbandingan belum cukup untuk membezakan kesukaran wang daripada kesukaran operasi. Teruskan beberapa soalan berbeza sebelum menetapkan fokus.';
  return Object.freeze({...base,state,rootCause,confidence,reasonCode,nextSkillId:next,
   parentText,evidence:{accepted:rows.length,rejected:rejected.length,byFamily},
   note:'Hypothesis only. Both sides require two distinct matched authored questions; unsupported finance concepts abstain.'});
 }
 return Object.freeze({VERSION,registry,normalize,evaluate,probeFamilies:PROBE_FAMILIES,skillFamilies:SKILL_FAMILIES});
});
