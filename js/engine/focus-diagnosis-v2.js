/* Pahlawan Angka — Focus Diagnosis v2, Phase C (pure shadow evaluator).
   Does NOT read/write db, score, unlock, save, navigate or select questions.
   Inputs are tagged observations / a learner-review snapshot + explicitly keyed
   authored question tags. An untagged encounter is not diagnosed by guessing. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusDiagnosisV2=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const VERSION='0.1.0-shadow';
 const VALID=new Set(['independent','corrected','assisted','unresolved']);
 const IGNORED=new Set(['demo','dev','dev-test']);
 const RECOGNIZED=new Set(['money','money_unit','division_fact','one_digit_div','two_digit_div','regroup_div',
  'grouping','remainder_div','operation_choice','percent_concept','money_discount','addition',
  'subtraction','multiplication','budget','mixed','transfer_verify','unknown']);
 const NONINDEPENDENT=new Set(['unresolved','corrected','assisted']);
 const safe=(x)=>String(x??'').trim();
 const count=(a,result)=>a.filter(x=>result?(result==='nonindependent'?NONINDEPENDENT.has(x.result):x.result===result):true).length;
 function baseProbe(origin){
  if(origin==='D2.4.5'||origin==='D2.2.4')return 'div.facts';
  if(origin==='D5.MONEY')return 'percent.part_whole';
  return 'operation.choose';
 }
 function familyFromTag(t){
  const explicit=safe(t?.diagnosticFamily);
  if(RECOGNIZED.has(explicit)&&explicit!=='unknown')return explicit;
  const family=safe(t?.evidence?.questionFamilyKey).toLowerCase();
  const foundations=t?.probes?.foundationIds||[];
  const concepts=t?.probes?.conceptIds||[];
  if(family==='d2-divide-basic-fact')return 'division_fact';
  if(family==='d2-divide-with-remainder'||family.includes('ten-remainder'))return 'remainder_div';
  if(family==='d2-divide-by-ten-exact')return 'division_fact';
  if(family==='d2-money-equal-share')return 'money';
  if(family.includes('operation-select'))return 'operation_choice';
  if(family.includes('regroup')&&foundations.includes('div.regroup'))return 'regroup_div';
  if(concepts.includes('money.ringgit_sen')&&t.contextDomain==='money')return 'money';
  if(concepts.includes('percent.part_whole')&&t.contextDomain==='percent')return 'percent_concept';
  // A generic "division" tag does not tell us *which* division difficulty.
  return 'unknown';
 }
 function fromReview(profile,questionTagsByKey={},options={}){
  const encounters=Array.isArray(profile)?profile:
   (Array.isArray(profile?.learnerReviewV1?.encounters)?profile.learnerReviewV1.encounters:[]);
  const origin=safe(options.originSkillId||'');
  // A diagnosis is scoped to deliberately selected question instances.
  // Do not mine an entire child's history and confuse unrelated episodes.
  const selected=new Set(Array.isArray(options.questionKeys)?options.questionKeys.map(safe).filter(Boolean):[]);
  const items=[],unmatched=[],excluded=[];
  for(const e of encounters){
   if(!e||!VALID.has(e.outcome))continue;
   if(IGNORED.has(safe(e.mode))){excluded.push(safe(e.questionKey));continue}
   const key=safe(e.questionKey);
   if(!selected.has(key))continue;
   const supplied=(key&&questionTagsByKey&&Object.hasOwn(questionTagsByKey,key))
    ? questionTagsByKey[key] : null;
   const t=e.focusDiagnosticV1||supplied?.focusDiagnosticV1||supplied;
   if(!t||t.schema!=='pa.focus.question-tag.v1'||t.tagOrigin!=='authored'){
    unmatched.push(key);continue;
   }
   const skill=safe(t.originSkillId||e.skillId);
   if(skill!==safe(e.skillId)){unmatched.push(key);continue}
   const fam=familyFromTag(t);
   if(fam==='unknown'){unmatched.push(key);continue}
   items.push({probe:safe(t.evidence?.variantFingerprint||key),questionKey:key,family:fam,result:e.outcome,
    originSkillId:skill,tagRevision:safe(t.evidence?.tagRevision||t.tagRevision),
    purpose:safe(t.probes?.diagnosticPurpose||'normal'),archetype:safe(t.evidence?.questionFamilyKey),
    contextDomain:safe(t.contextDomain),features:t.arithmeticProfile?.operandDimensions||null,
    mode:safe(e.mode)});
  }
  return {originSkillId:origin,observations:items,tagged:items.length,unmatched:unmatched.length,
   excluded:excluded.length,hasTags:items.length>0};
 }
 function normalize(raw){
  const result=safe(raw?.result||raw?.outcome);
  if(!VALID.has(result)||IGNORED.has(safe(raw?.mode)))return null;
  const family=safe(raw?.family||'unknown');
  const probe=safe(raw?.probe||raw?.questionKey||raw?.variantFingerprint);
  if(!probe||!RECOGNIZED.has(family))return null;
  return {probe,family,result,purpose:safe(raw?.purpose||'normal'),originSkillId:safe(raw?.originSkillId),
   contextDomain:safe(raw?.contextDomain),features:raw?.features&&typeof raw.features==='object'?raw.features:null};
 }
 function evaluate(input={}){
  const originSkillId=safe(input.originSkillId);
  let raw,untagged=0;
  if(Array.isArray(input.observations))raw=input.observations;
  else{
   const joined=fromReview(input.profile||input.encounters||[],input.questionTagsByKey||{},
    {originSkillId,questionKeys:input.questionKeys});
   raw=joined.observations;
   untagged=joined.unmatched;
  }
  const known=raw.map(normalize).filter(Boolean);
  // A single item cannot be counted repeatedly merely because a child retried it.
  const seen=new Set(),rows=[];
  for(let i=known.length-1;i>=0;i--){
   const x=known[i],key=x.family+'|'+x.probe;
   if(seen.has(key))continue;
   seen.add(key);rows.unshift(x);
  }
  const group=(f)=>rows.filter(x=>f.includes(x.family));
  const failed=(f)=>count(group(f),'nonindependent');
  const clean=(f)=>count(group(f),'independent');
  const numeric=(f,predicate,result)=>group([f]).filter(x=>(!x.contextDomain||x.contextDomain==='number')&&
   (!x.purpose||['normal','prerequisite_probe','contrast_plain','transfer_verify'].includes(x.purpose))&&predicate(x.features||{})&&
   (result==='failed'?NONINDEPENDENT.has(x.result):x.result==='independent')).length;
  const ambiguous=()=>({state:'insufficient_evidence',rootCause:null,nextProbe:baseProbe(originSkillId),
   confidence:'none',reasonCode:'NOT_ENOUGH_DIVERSE_EVIDENCE'});
  const answer=(state,rootCause,nextProbe,reasonCode,confidence='low')=>
   ({state,rootCause,nextProbe,confidence,reasonCode});
  // A one-digit operation exposes the exact fact involved. Report these only
  // as retest candidates; never infer an exact weak fact from a single miss.
  const factCandidates=(family)=>{
   const stats=new Map();
   for(const row of group([family])){
    if(row.contextDomain&&row.contextDomain!=='number')continue;
    if(row.purpose&&!['normal','prerequisite_probe','contrast_plain','transfer_verify'].includes(row.purpose))continue;
    const dims=row.features||{};
    if(dims.maxOperandDigits!==1||dims.usesRegrouping!==false)continue;
    for(const fact of Array.isArray(dims.factDependencies)?dims.factDependencies:[]){
     const key=safe(fact);if(!/^(add|sub):\d+[+-]\d+$/.test(key))continue;
     const item=stats.get(key)||{fact:key,failedQuestions:0,independentQuestions:0};
     if(NONINDEPENDENT.has(row.result))item.failedQuestions++;else if(row.result==='independent')item.independentQuestions++;
     stats.set(key,item);
    }
   }
   return [...stats.values()].filter(x=>x.failedQuestions>0).map(x=>({...x,status:'retest_candidate'}));
  };
  let decision=ambiguous();
  const grp={money:['money','money_unit','budget','money_discount'],plainDivision:['division_fact','one_digit_div','two_digit_div'],
   regroup:['regroup_div'],selection:['operation_choice'],percent:['percent_concept'],
   operations:['addition','subtraction','multiplication','division_fact','one_digit_div','two_digit_div']};
  if(rows.length>=2){
   const helpOnly=rows.length>=2&&rows.every(x=>x.result==='assisted'||x.result==='corrected');
   if(helpOnly){
    decision=answer('needs_contrast',null,clean(grp.plainDivision)+failed(grp.plainDivision)>0?'div.facts':baseProbe(originSkillId),'ASSISTED_NOT_INDEPENDENT');
   }else if(numeric('addition',f=>f.maxOperandDigits>=3&&f.usesRegrouping===false,'failed')>=2&&
      numeric('subtraction',f=>f.maxOperandDigits>=3&&f.usesRegrouping===false,'failed')>=2&&
      numeric('addition',f=>f.maxOperandDigits<=2&&f.usesRegrouping===false,'independent')>=2&&
      numeric('subtraction',f=>f.maxOperandDigits<=2&&f.usesRegrouping===false,'independent')>=2){
    decision=answer('candidate','number.place_value','number.place_value','LARGE_DIGIT_FAILURE_ACROSS_ADD_SUB_WITH_SMALLER_SUCCESS','medium');
   }else if(numeric('addition',f=>f.maxOperandDigits>=2&&f.usesRegrouping===true,'failed')>=2&&
      numeric('addition',f=>f.maxOperandDigits>=2&&f.usesRegrouping===false,'independent')>=2){
    decision=answer('candidate','add.regroup','add.regroup','ADDITION_REGROUP_FAILURE_WITH_NO_REGROUP_SUCCESS','medium');
   }else if(numeric('subtraction',f=>f.maxOperandDigits>=2&&f.usesRegrouping===true,'failed')>=2&&
      numeric('subtraction',f=>f.maxOperandDigits>=2&&f.usesRegrouping===false,'independent')>=2){
    decision=answer('candidate','sub.regroup','sub.regroup','SUBTRACTION_REGROUP_FAILURE_WITH_NO_REGROUP_SUCCESS','medium');
   }else if(numeric('addition',f=>f.maxOperandDigits>=3&&f.usesRegrouping===false,'failed')>=2&&
      numeric('addition',f=>f.maxOperandDigits<=2,'independent')>=2){
    decision=answer('candidate','add.place_value','number.place_value','ADDITION_LARGE_DIGIT_FAILURE_WITH_SMALLER_SUCCESS','medium');
   }else if(numeric('subtraction',f=>f.maxOperandDigits>=3&&f.usesRegrouping===false,'failed')>=2&&
      numeric('subtraction',f=>f.maxOperandDigits<=2,'independent')>=2){
    decision=answer('candidate','sub.place_value','number.place_value','SUBTRACTION_LARGE_DIGIT_FAILURE_WITH_SMALLER_SUCCESS','medium');
   }else if(numeric('addition',f=>f.maxOperandDigits===1,'failed')>=2){
    decision=answer('candidate','add.facts','add.facts','ADDITION_FACT_FAILURE_ACROSS_DISTINCT_FACTS','medium');
   }else if(numeric('subtraction',f=>f.maxOperandDigits===1,'failed')>=2){
    decision=answer('candidate','sub.facts','sub.facts','SUBTRACTION_FACT_FAILURE_ACROSS_DISTINCT_FACTS','medium');
   }else if(failed(grp.regroup)>=2&&clean(grp.plainDivision)>=1){
    const prereq=clean(['two_digit_div'])>=1?'number.place_value':'div.regroup';
    decision=answer('candidate','div.regroup',prereq,'REGROUP_FAILURE_WITH_BASIC_DIVISION_EVIDENCE','medium');
   }else if(failed(grp.regroup)>=1&&clean(grp.plainDivision)>=2){
    decision=answer('needs_contrast',null,'div.regroup','SINGLE_REGROUP_FAILURE_NEEDS_REPEAT');
   }else if(failed(['division_fact'])>=2&&clean(['grouping'])>=1){
    decision=answer('candidate','div.facts','mul.facts','DIVISION_FACT_FAILURE_WITH_GROUPING_SUCCESS','medium');
   }else if(failed(['remainder_div'])>=1&&clean(grp.plainDivision)>=2){
    decision=answer('needs_contrast',null,'div.remainder','REMAINDER_FAILURE_WITH_EXACT_DIVISION_SUCCESS');
   }else if(failed(grp.selection)>=2&&clean(grp.operations)>=2){
    decision=answer('candidate','operation.choose','operation.choose','SELECTION_FAILURE_WITH_CALCULATION_SUCCESS','medium');
   }else if(failed(grp.percent)>=2&&clean(['subtraction'])>=1&&clean(['multiplication'])>=1){
    decision=answer('candidate','percent.part_whole','fraction.equal_parts','PERCENT_CONCEPT_FAILURE_WITH_OPERATIONS_SUCCESS','medium');
   }else if(failed(grp.money)>=1&&clean(grp.plainDivision)>=2){
    decision=answer('needs_contrast',null,'money.ringgit_sen','MONEY_CONTEXT_VS_DIVISION_CONTRAST','low');
   }else if((failed(grp.plainDivision)+failed(grp.regroup)>=1)&&clean(grp.plainDivision)===0){
    decision=answer('needs_contrast',null,'div.facts','DIVISION_NEEDS_INDEPENDENT_PROBE');
   }else if(failed(grp.money)>=1){
    decision=answer('needs_contrast',null,originSkillId==='D5.MONEY'?'percent.part_whole':'div.facts',
      'CONTEXT_MAY_HAVE_MULTIPLE_CAUSES');
   }else if(rows.some(x=>NONINDEPENDENT.has(x.result))){
    decision=answer('needs_contrast',null,baseProbe(originSkillId),'AMBIGUOUS_UNASSISTED_SKILLS');
   }else if(clean(grp.operations)>=2){
    decision=answer('needs_contrast',null,baseProbe(originSkillId),'NO_FAILURE_EVIDENCE');
   }
  }
  // Verification is of independent *transfer success*, not certainty about
  // the psychological cause of previous errors; report separately.
  const transfers=group(['transfer_verify']);
  const verification=transfers.length>=2&&transfers.every(x=>x.result==='independent')
   ?'transfer_observed':'not_yet_verified';
  const byFamily={};
  for(const f of new Set(rows.map(x=>x.family)))byFamily[f]={
   uniqueQuestions:group([f]).length,independent:clean([f]),nonindependent:failed([f])};
  const factFamily=decision.rootCause==='add.facts'?'addition':decision.rootCause==='sub.facts'?'subtraction':null;
  return {
   version:VERSION,mode:'shadow_read_only',originSkillId,
   ...decision,verification,
   ...(factFamily?{factCandidates:factCandidates(factFamily)}:{}),
   evidence:{uniqueTaggedQuestions:rows.length,duplicatesDiscarded:known.length-rows.length,
    untaggedExcluded:untagged,byFamily},
   writes:0,
   note:'Hypothesis, not a learner diagnosis. No mastery, rewards or focus routing modified.'
  };
 }
 return Object.freeze({version:VERSION,fromReview,evaluate,familyFromTag});
});
