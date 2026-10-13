#!/usr/bin/env node
'use strict';
// Addition/subtraction feature diagnosis. Actual D1-D4 source generators feed
// authored dimensional tags through learner-review and the in-memory collector.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const engine=require(path.join(root,'js/engine/focus-diagnosis-v2.js'));
const collectorApi=require(path.join(root,'js/engine/focus-diagnosis-shadow-v1.js'));
const review=require(path.join(root,'js/engine/learner-review-v1.js'));
let seed=74031;const math=Object.create(Math);math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const ctx={Math:math,window:{PAQuestionBanks:{}}};vm.createContext(ctx);
ctx.sess={questionHistory:[],mode:'practice'};
for(const file of ['questions/helpers.js','questions/d1/core.js','questions/d2/topic-2.js','questions/d3/core.js','questions/d4/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js']){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
}
function sample(skillId,generate,predicate){
 for(let i=0;i<5000;i++){
  const q=generate();const tag=q?.focusDiagnosticV1;
  if(tag?.tagOrigin==='authored'&&tag.originSkillId===skillId&&tag.contextDomain==='number'&&tag.probes.diagnosticPurpose==='normal'&&predicate(tag.arithmeticProfile.operandDimensions,tag))return q;
 }
 throw new Error('Could not sample authored dimensional item for '+skillId);
}
const gen=(grade,id)=>()=>ctx.window.PAQuestionBanks[grade](id,{mastery:20},false);
const zeroCrossing=ctx.subQ(502,287,215,'test',true,{skillId:'D2.2.2'}).focusDiagnosticV1.arithmeticProfile.operandDimensions;
assert.equal(zeroCrossing.usesRegrouping,true);
assert.deepEqual(Array.from(zeroCrossing.regroupingColumns),['ones','tens']);
assert.equal(zeroCrossing.zeroCrossingBorrow,true);
assert.deepEqual(Array.from(zeroCrossing.factDependencies),['sub:12-7','sub:9-8','sub:4-2']);
const factAdd=sample('D1.ADD20',gen('d1','D1.ADD20'),f=>f.maxOperandDigits===1);
const factSub=sample('D1.SUB20',gen('d1','D1.SUB20'),f=>f.maxOperandDigits===1);
const lowAddA=sample('D1.ADD100',gen('d1','D1.ADD100'),f=>f.maxOperandDigits===2&&!f.usesRegrouping);
const lowAddB=sample('D1.ADD100',gen('d1','D1.ADD100'),(f,t)=>f.maxOperandDigits===2&&!f.usesRegrouping&&t.evidence.variantFingerprint!==lowAddA.focusDiagnosticV1.evidence.variantFingerprint);
const lowSubA=sample('D1.SUB100',gen('d1','D1.SUB100'),f=>f.maxOperandDigits===2&&!f.usesRegrouping);
const lowSubB=sample('D1.SUB100',gen('d1','D1.SUB100'),(f,t)=>f.maxOperandDigits===2&&!f.usesRegrouping&&t.evidence.variantFingerprint!==lowSubA.focusDiagnosticV1.evidence.variantFingerprint);
const bigAdd=(exclude=[])=>sample('D2.2.1',gen('d2t2','D2.2.1'),(f,t)=>f.maxOperandDigits>=3&&!f.usesRegrouping&&!exclude.includes(t.evidence.variantFingerprint));
const bigSub=(exclude=[])=>sample('D2.2.2',gen('d2t2','D2.2.2'),(f,t)=>f.maxOperandDigits>=3&&!f.usesRegrouping&&!exclude.includes(t.evidence.variantFingerprint));
const carryAdd=(exclude=[])=>sample('D2.2.1',gen('d2t2','D2.2.1'),(f,t)=>f.maxOperandDigits>=2&&f.usesRegrouping&&exclude.every(x=>x!==t.evidence.variantFingerprint));
const borrowSub=(exclude=[])=>sample('D2.2.2',gen('d2t2','D2.2.2'),(f,t)=>f.maxOperandDigits>=2&&f.usesRegrouping&&exclude.every(x=>x!==t.evidence.variantFingerprint));
function run(items){
 const profile={schoolGrade:2,skills:{'D2.2.1':{mastery:62},'D2.2.2':{mastery:47}},xp:100,coins:55};
 const before=JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins});
 const collector=collectorApi.createSession({originSkillId:'D2.2.1'},engine);
 items.forEach(([q,outcome],i)=>{
  q.skill=q.focusDiagnosticV1.originSkillId;q.token='addsub-'+i;
  const begun=review.beginQuestion(q,{grade:2,mode:'practice',now:1000+i*1000});
  assert(begun?.questionKey,'learner review should issue a join key');
  assert(collector.capture(begun,q),'collector should accept authored tag with matching skill');
  if(outcome==='unresolved')review.firstWrong(q,{tag:'place',now:1200+i*1000});
  const saved=review.resolve(q,{correct:outcome==='independent',seconds:5,now:1500+i*1000},profile);
  assert.equal(saved.outcome,outcome);
 });
 const report=collector.evaluate(profile);
 assert.equal(before,JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins}),'shadow slice must not change mastery/rewards');
 collector.close();return report;
}
const bigAddA=bigAdd(),bigAddB=bigAdd([bigAddA.focusDiagnosticV1.evidence.variantFingerprint]);
const bigSubA=bigSub(),bigSubB=bigSub([bigSubA.focusDiagnosticV1.evidence.variantFingerprint]);
const digits=run([[lowAddA,'independent'],[lowAddB,'independent'],[lowSubA,'independent'],[lowSubB,'independent'],[bigAddA,'unresolved'],[bigAddB,'unresolved'],[bigSubA,'unresolved'],[bigSubB,'unresolved']]);
assert.equal(digits.rootCause,'number.place_value');
const addNoCarryA=sample('D2.2.1',gen('d2t2','D2.2.1'),f=>f.maxOperandDigits>=2&&!f.usesRegrouping);
const addNoCarryB=sample('D2.2.1',gen('d2t2','D2.2.1'),(f,t)=>f.maxOperandDigits>=2&&!f.usesRegrouping&&t.evidence.variantFingerprint!==addNoCarryA.focusDiagnosticV1.evidence.variantFingerprint);
const addRegroupA=carryAdd(),addRegroupB=carryAdd([addRegroupA.focusDiagnosticV1.evidence.variantFingerprint]);
const addRegroup=run([[addNoCarryA,'independent'],[addNoCarryB,'independent'],[addRegroupA,'unresolved'],[addRegroupB,'unresolved']]);
assert.equal(addRegroup.rootCause,'add.regroup');
const subNoBorrowA=sample('D2.2.2',gen('d2t2','D2.2.2'),f=>f.maxOperandDigits>=2&&!f.usesRegrouping);
const subNoBorrowB=sample('D2.2.2',gen('d2t2','D2.2.2'),(f,t)=>f.maxOperandDigits>=2&&!f.usesRegrouping&&t.evidence.variantFingerprint!==subNoBorrowA.focusDiagnosticV1.evidence.variantFingerprint);
const subBorrowA=borrowSub(),subBorrowB=borrowSub([subBorrowA.focusDiagnosticV1.evidence.variantFingerprint]);
const subRegroup=run([[subNoBorrowA,'independent'],[subNoBorrowB,'independent'],[subBorrowA,'unresolved'],[subBorrowB,'unresolved']]);
assert.equal(subRegroup.rootCause,'sub.regroup');
const addFact=run([[factAdd,'unresolved'],[sample('D1.ADD20',gen('d1','D1.ADD20'),(f,t)=>f.maxOperandDigits===1&&t.evidence.variantFingerprint!==factAdd.focusDiagnosticV1.evidence.variantFingerprint),'unresolved']]);
assert.equal(addFact.rootCause,'add.facts');
assert(addFact.factCandidates.length>=1,'addition fact failures should identify exact facts to retest');
assert(addFact.factCandidates.every(x=>x.fact.startsWith('add:')&&x.status==='retest_candidate'));
const subFact=run([[factSub,'unresolved'],[sample('D1.SUB20',gen('d1','D1.SUB20'),(f,t)=>f.maxOperandDigits===1&&t.evidence.variantFingerprint!==factSub.focusDiagnosticV1.evidence.variantFingerprint),'unresolved']]);
assert.equal(subFact.rootCause,'sub.facts');
assert(subFact.factCandidates.length>=1,'subtraction fact failures should identify exact facts to retest');
assert(subFact.factCandidates.every(x=>x.fact.startsWith('sub:')&&x.status==='retest_candidate'));
const notEnough=run([[bigAdd(),'unresolved']]);assert.equal(notEnough.rootCause,null);
function verifyPracticePlan(report){
 const plan=engine.buildPracticePlan(report),usedBySkill=new Map();assert.equal(plan.mode,'shadow_only');
 for(const spec of plan.items){
  const generated=sample(spec.skillId,gen(spec.skillId.startsWith('D1.')?'d1':'d2t2',spec.skillId), (f,t)=>{
   if(spec.filter.maxOperandDigitsAtLeast&&f.maxOperandDigits<spec.filter.maxOperandDigitsAtLeast)return false;
   if(typeof spec.filter.usesRegrouping==='boolean'&&f.usesRegrouping!==spec.filter.usesRegrouping)return false;
   if(typeof spec.filter.regroupingColumnCount==='number'&&f.regroupingColumns.length!==spec.filter.regroupingColumnCount)return false;
   if(typeof spec.filter.regroupingColumnCountAtLeast==='number'&&f.regroupingColumns.length<spec.filter.regroupingColumnCountAtLeast)return false;
   if(typeof spec.filter.regroupingColumnCount==='number'&&f.regroupingColumns.length!==spec.filter.regroupingColumnCount)return false;
   if(typeof spec.filter.regroupingColumnCountAtLeast==='number'&&f.regroupingColumns.length<spec.filter.regroupingColumnCountAtLeast)return false;
   if(typeof spec.filter.zeroCrossingBorrow==='boolean'&&f.zeroCrossingBorrow!==spec.filter.zeroCrossingBorrow)return false;
   if(spec.filter.exactFact&&!f.factDependencies.includes(spec.filter.exactFact))return false;
   return true;
  },usedBySkill.get(spec.skillId)||[]);assert(generated?.focusDiagnosticV1,'target plan should resolve to an authored generated question');
  const used=usedBySkill.get(spec.skillId)||[];used.push(generated.focusDiagnosticV1.evidence.variantFingerprint);usedBySkill.set(spec.skillId,used);
 }
 return plan;
}
const digitPlan=verifyPracticePlan(digits),addCarryPlan=verifyPracticePlan(addRegroup),subBorrowPlan=verifyPracticePlan(subRegroup),addFactPlan=verifyPracticePlan(addFact),subFactPlan=verifyPracticePlan(subFact);
assert.deepEqual(digitPlan.items.map(x=>x.skillId),['D2.2.1','D2.2.2']);
assert.equal(addCarryPlan.items.length,2);
assert.equal(subBorrowPlan.items[1].filter.zeroCrossingBorrow,true);
assert(addFactPlan.items.every(x=>x.filter.exactFact.startsWith('add:')));
assert(subFactPlan.items.every(x=>x.filter.exactFact.startsWith('sub:')));
assert.equal(engine.buildPracticePlan(notEnough).items.length,0);
const result={status:'focus_v2_add_sub_shadow_pass',actualGeneratorSources:['D1','D2','D3','D4','kssr-content final wrapper'],
 scenarios:{largeDigitsAcrossBothOperations:digits.rootCause,additionRegroup:addRegroup.rootCause,
  subtractionBorrow:subRegroup.rootCause,additionFacts:addFact.rootCause,subtractionFacts:subFact.rootCause,
  singleFailureAbstains:notEnough.state},
 exactFactsToRetest:{addition:addFact.factCandidates.map(x=>x.fact),subtraction:subFact.factCandidates.map(x=>x.fact)},
 practiceTargets:{largeDigitsAcrossBothOperations:digitPlan.items.map(x=>x.skillId),additionRegroup:addCarryPlan.items.length,
  subtractionBorrow:subBorrowPlan.items.map(x=>x.filter.zeroCrossingBorrow),additionFacts:addFactPlan.items.map(x=>x.filter.exactFact),
  subtractionFacts:subFactPlan.items.map(x=>x.filter.exactFact),singleFailure:engine.buildPracticePlan(notEnough).items.length},
 profileRewardsOrMasteryChanged:false};
fs.writeFileSync(path.join(root,'audit/focus-v2-e2e/add-sub-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
