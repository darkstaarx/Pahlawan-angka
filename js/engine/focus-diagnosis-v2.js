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
  return {probe,family,result,purpose:safe(raw?.purpose||'normal'),originSkillId:safe(raw?.originSkillId)};
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
  const ambiguous=()=>({state:'insufficient_evidence',rootCause:null,nextProbe:baseProbe(originSkillId),
   confidence:'none',reasonCode:'NOT_ENOUGH_DIVERSE_EVIDENCE'});
  const answer=(state,rootCause,nextProbe,reasonCode,confidence='low')=>
   ({state,rootCause,nextProbe,confidence,reasonCode});
  let decision=ambiguous();
  const grp={money:['money','money_unit','budget','money_discount'],plainDivision:['division_fact','one_digit_div','two_digit_div'],
   regroup:['regroup_div'],selection:['operation_choice'],percent:['percent_concept'],
   operations:['addition','subtraction','multiplication','division_fact','one_digit_div','two_digit_div']};
  if(rows.length>=2){
   const helpOnly=rows.length>=2&&rows.every(x=>x.result==='assisted'||x.result==='corrected');
   if(helpOnly){
    decision=answer('needs_contrast',null,clean(grp.plainDivision)+failed(grp.plainDivision)>0?'div.facts':baseProbe(originSkillId),'ASSISTED_NOT_INDEPENDENT');
   }else if(failed(grp.regroup)>=2&&clean(grp.plainDivision)>=1){
    const prereq=clean(['two_digit_div'])>=1?'number.place_value':'div.regroup';
    decision=answer('candidate','div.regroup',prereq,'REGROUP_FAILURE_WITH_BASIC_DIVISION_EVIDENCE','medium');
   }else if(failed(grp.regroup)>=1&&clean(grp.plainDivision)>=2){
    decision=answer('needs_contrast',null,'div.regroup','SINGLE_REGROUP_FAILURE_NEEDS_REPEAT');
   }else if(failed(['division_fact'])>=2&&clean(['grouping'])>=1){
    decision=answer('candidate','div.facts','mul.facts','DIVISION_FACT_FAILURE_WITH_GROUPING_SUCCESS','medium');
   }else if(failed(grp.selection)>=2&&clean(grp.operations)>=2){
    decision=answer('candidate','operation.choose','operation.choose','SELECTION_FAILURE_WITH_CALCULATION_SUCCESS','medium');
   }else if(failed(grp.percent)>=2&&clean(['subtraction'])>=1&&clean(['multiplication'])>=1){
    decision=answer('candidate','percent.part_whole','fraction.equal_parts','PERCENT_CONCEPT_FAILURE_WITH_OPERATIONS_SUCCESS','medium');
   }else if(failed(grp.money)>=2&&clean(grp.plainDivision)>=2){
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
  return {
   version:VERSION,mode:'shadow_read_only',originSkillId,
   ...decision,verification,
   evidence:{uniqueTaggedQuestions:rows.length,duplicatesDiscarded:known.length-rows.length,
    untaggedExcluded:untagged,byFamily},
   writes:0,
   note:'Hypothesis, not a learner diagnosis. No mastery, rewards or focus routing modified.'
  };
 }
 return Object.freeze({version:VERSION,fromReview,evaluate,familyFromTag});
});
