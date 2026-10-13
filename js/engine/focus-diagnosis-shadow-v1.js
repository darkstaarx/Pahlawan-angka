/* Pahlawan Angka — Focus v2 in-memory shadow session collector.
   Requires explicit opt-in call from a future vetted runtime; NOT loaded in
   production. No DOM, fetch, Supabase, localStorage, db writes or navigation.
   Only authored, sanitized question tags and opaque question keys are kept. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusShadowCollectorV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const VERSION='0.1.0-shadow';
 const safe=x=>String(x??'').trim();
 function sanitize(q){
  const tag=q?.focusDiagnosticV1;
  if(!tag||tag.schema!=='pa.focus.question-tag.v1'||tag.tagOrigin!=='authored')return null;
  const family=safe(tag.evidence?.questionFamilyKey);
  const skill=safe(tag.originSkillId);
  if(!family||!skill||skill!==safe(q.skill))return null;
  const concepts=Array.isArray(tag.probes?.conceptIds)?tag.probes.conceptIds.filter(x=>typeof x==='string').slice(0,12):[];
  const foundations=Array.isArray(tag.probes?.foundationIds)?tag.probes.foundationIds.filter(x=>typeof x==='string').slice(0,12):[];
  return {
   schema:tag.schema,tagOrigin:'authored',originSkillId:skill,
   contextDomain:safe(tag.contextDomain),
   diagnosticFamily:safe(tag.diagnosticFamily),
   arithmeticProfile:{operationFamilies:Array.isArray(tag.arithmeticProfile?.operationFamilies)?tag.arithmeticProfile.operationFamilies.filter(x=>typeof x==='string').slice(0,4):[],
    operandDimensions:tag.arithmeticProfile?.operandDimensions?{
     maxOperandDigits:Number.isFinite(tag.arithmeticProfile.operandDimensions.maxOperandDigits)?tag.arithmeticProfile.operandDimensions.maxOperandDigits:null,
     usesRegrouping:typeof tag.arithmeticProfile.operandDimensions.usesRegrouping==='boolean'?tag.arithmeticProfile.operandDimensions.usesRegrouping:null,
     regroupingColumns:Array.isArray(tag.arithmeticProfile.operandDimensions.regroupingColumns)?tag.arithmeticProfile.operandDimensions.regroupingColumns.filter(x=>typeof x==='string').slice(0,6):[],
     zeroCrossingBorrow:typeof tag.arithmeticProfile.operandDimensions.zeroCrossingBorrow==='boolean'?tag.arithmeticProfile.operandDimensions.zeroCrossingBorrow:null,
     stepCount:Number.isFinite(tag.arithmeticProfile.operandDimensions.stepCount)?tag.arithmeticProfile.operandDimensions.stepCount:null,
     factDependencies:Array.isArray(tag.arithmeticProfile.operandDimensions.factDependencies)?tag.arithmeticProfile.operandDimensions.factDependencies.filter(x=>typeof x==='string').slice(0,12):[]
    }:null},
   probes:{foundationIds:foundations,conceptIds:concepts,diagnosticPurpose:safe(tag.probes?.diagnosticPurpose)},
   evidence:{questionFamilyKey:family,variantFingerprint:safe(tag.evidence?.variantFingerprint),
    tagRevision:safe(tag.evidence?.tagRevision||tag.tagRevision),
    representation:safe(tag.evidence?.representation),difficultyBand:tag.evidence?.difficultyBand??null}
  };
 }
 function createSession({originSkillId}={},engine){
  if(!engine||typeof engine.evaluate!=='function')throw new TypeError('Pure FocusDiagnosisV2 evaluator required');
  const origin=safe(originSkillId);if(!origin)throw new TypeError('originSkillId required');
  const keyed=Object.create(null),ordered=[],rejected=[];
  let stopped=false;
  const capture=(beginRecord,question)=>{
   if(stopped)return false;
   const key=safe(beginRecord?.questionKey);
   const tag=sanitize(question);
   if(!key||!tag){rejected.push(key?'untagged':'missing-question-key');return false}
   if(safe(beginRecord.skillId)!==tag.originSkillId){rejected.push('review-skill-mismatch');return false}
   if(Object.prototype.hasOwnProperty.call(keyed,key))return false; // One encounter only.
   keyed[key]=tag;ordered.push(key);
   return true;
  };
  const evaluate=profile=>{
   if(stopped)throw new Error('Shadow collector already closed');
   return engine.evaluate({originSkillId:origin,profile,questionTagsByKey:keyed,questionKeys:ordered});
  };
  const stats=()=>({version:VERSION,mode:'in_memory_only',originSkillId:origin,
   capturedQuestionKeys:ordered.length,rejected:rejected.length,closed:stopped});
  const close=()=>{ordered.length=0;for(const k of Object.keys(keyed))delete keyed[k];rejected.length=0;stopped=true};
  return Object.freeze({capture,evaluate,stats,close});
 }
 return Object.freeze({version:VERSION,createSession});
});
