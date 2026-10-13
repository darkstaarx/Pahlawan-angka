#!/usr/bin/env node
'use strict';
// Reproducible, disposable two-session pilot using current question generators,
// learner-review outcomes, authored tags, and the read-only diagnosis engine.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const engine=require(path.join(root,'js/engine/focus-diagnosis-v2.js'));
const moneyDiag=require(path.join(root,'js/engine/focus-money-diagnostic-v1.js'));
const collectorApi=require(path.join(root,'js/engine/focus-diagnosis-shadow-v1.js'));
const review=require(path.join(root,'js/engine/learner-review-v1.js'));
let seed=912177;const math=Object.create(Math);math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const ctx={Math:math,window:{PAQuestionBanks:{}}};vm.createContext(ctx);
for(const file of ['questions/helpers.js','questions/d1/core.js','questions/d2/topic-2.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const profile={name:'Profil ujian sementara',schoolGrade:2,skills:{'D2.4.2':{mastery:52},'D2.4.1':{mastery:52},'D1.ADD100':{mastery:48},'D2.2.1':{mastery:48}},xp:100,coins:55};
const protectedBefore=JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins});
const collector=collectorApi.createSession({originSkillId:'D2.4.2'},engine),tags=Object.create(null),trace=[];
let clock=1000;
function save(q,outcome,session){
 q.skill=q.focusDiagnosticV1.originSkillId;q.token=`${session}-${clock}`;q.questionId=`pilot:${session}:${clock}`;
 const begin=review.beginQuestion(q,{grade:2,mode:session==='kembara'?'kembara':'practice',selectionReason:session,now:clock++});
 assert(begin?.questionKey,'learner-review question key is present');
 assert(collector.capture(begin,q),'collector accepts generated authored tag');
 tags[begin.questionKey]=q.focusDiagnosticV1;
 if(outcome==='unresolved'||outcome==='corrected')review.firstWrong(q,{tag:'pilot_response',seconds:5,now:clock++});
 const encounter=review.resolve(q,{correct:outcome!=='unresolved',seconds:7,now:clock++},profile);
 assert.equal(encounter?.outcome,outcome);
 trace.push({session,skillId:q.skill,questionKey:begin.questionKey,outcome,family:q.focusDiagnosticV1.diagnosticFamily,
   contextDomain:q.focusDiagnosticV1.contextDomain,features:q.focusDiagnosticV1.arithmeticProfile?.operandDimensions||null,
   variantFingerprint:q.focusDiagnosticV1.evidence.variantFingerprint});
 return begin.questionKey;
}
function uniqueSample(make,predicate,seen){
 for(let i=0;i<5000;i++){const q=make(),tag=q?.focusDiagnosticV1,fp=tag?.evidence?.variantFingerprint;
  if(tag?.tagOrigin==='authored'&&predicate(tag)&&fp&&!seen.has(fp)){seen.add(fp);return q}}
 throw Error('could not sample a distinct authored item');
}
// Session one: the real D2.4.2 generator supplies the original broad weakness.
const kembaraSeen=new Set();
for(let i=0;i<5;i++){
 const q=uniqueSample(()=>ctx.moneyQ('D2.4.2',false,{mastery:20,evidence:i}),t=>t.originSkillId==='D2.4.2'&&t.diagnosticFamily==='addition',kembaraSeen);
 save(q,'unresolved','kembara');
}
const initialFocus=profile.learnerReviewV1.encounters.filter(e=>e.skillId==='D2.4.2').length;
assert.equal(initialFocus,5);

// Session two is the contrast mini-game prototype: money-unit basics, small
// plain addition, then large plain addition, all with distinct generated items.
const moneySeen=new Set();
for(let i=0;i<2;i++){
 const q=uniqueSample(()=>ctx.moneyQ('D2.4.1',false,{mastery:20,evidence:i}),t=>t.originSkillId==='D2.4.1'&&t.diagnosticFamily==='money_unit'&&t.evidence.questionFamilyKey==='d2-money-basic-recognise',moneySeen);
 save(q,'independent','mini_game_money_basics');
}
const easySeen=new Set();
for(let i=0;i<2;i++){
 const q=uniqueSample(()=>ctx.window.PAQuestionBanks.d1('D1.ADD100',{mastery:20,evidence:i},false),
  t=>t.originSkillId==='D1.ADD100'&&t.contextDomain==='number'&&t.arithmeticProfile.operandDimensions.maxOperandDigits<=2&&!t.arithmeticProfile.operandDimensions.usesRegrouping,easySeen);
 save(q,'independent','mini_game_addition_control');
}
const largeSeen=new Set();
for(let i=0;i<2;i++){
 const q=uniqueSample(()=>ctx.window.PAQuestionBanks.d2t2('D2.2.1',{mastery:20,evidence:i},false),
  t=>t.originSkillId==='D2.2.1'&&t.contextDomain==='number'&&t.arithmeticProfile.operandDimensions.maxOperandDigits>=3&&!t.arithmeticProfile.operandDimensions.usesRegrouping,largeSeen);
 save(q,'unresolved','mini_game_large_addition');
}
const questionKeys=profile.learnerReviewV1.encounters.map(e=>e.questionKey);
const joined=engine.fromReview(profile,tags,{originSkillId:'D2.4.2',questionKeys});
assert.equal(joined.tagged,11,'all explicitly selected encounters should join authored tags');
const operation=engine.evaluate({originSkillId:'D2.4.2',observations:joined.observations});
const diagnosis=moneyDiag.evaluate({originSkillId:'D2.4.2',observations:joined.observations,initialMoneyWeak:true,engine});
assert.equal(operation.rootCause,'add.place_value','small-add success plus distinct large-add failures points to place value');
assert.equal(diagnosis.state,'candidate');
assert.equal(diagnosis.rootCause,'add.place_value');
assert.equal(diagnosis.nextSkillId,'D2.2.1');
assert.match(diagnosis.parentText,/asas Wang boleh dibuat sendiri/);
assert.match(diagnosis.parentText,/tambah nombor besar masih mengelirukan/);

// Guardrails: incomplete money basics or only one large-number failure abstain.
const filtered=joined.observations.filter(x=>x.family!=='money_unit');
const noBasics=moneyDiag.evaluate({originSkillId:'D2.4.2',observations:filtered,initialMoneyWeak:true,engine});
assert.equal(noBasics.rootCause,null,'do not shift topic without two independent money-basic items');
const oneLargeFail=joined.observations.filter(x=>!(x.family==='addition'&&x.contextDomain==='number'&&x.features?.maxOperandDigits>=3&&x.result==='unresolved'&&x.probe!==undefined)).slice();
const largeFailures=oneLargeFail.filter(x=>x.family==='addition'&&x.contextDomain==='number'&&x.features?.maxOperandDigits>=3);
if(largeFailures.length>1)oneLargeFail.splice(oneLargeFail.indexOf(largeFailures[1]),1);
const singleFail=moneyDiag.evaluate({originSkillId:'D2.4.2',observations:oneLargeFail,initialMoneyWeak:true,engine});
assert.equal(singleFail.rootCause,null,'one large-number miss cannot assign an operation cause');
const basicFailureEvidence=joined.observations.map(x=>{
 if(x.family==='money_unit')return {...x,result:'unresolved'};
 if(x.family==='addition'&&x.contextDomain==='number'&&x.features?.maxOperandDigits>=3)return {...x,result:'independent'};
 return x;
});
const basicFailure=moneyDiag.evaluate({originSkillId:'D2.4.2',observations:basicFailureEvidence,initialMoneyWeak:true,engine});
assert.equal(basicFailure.rootCause,'money.ringgit_sen','repeated money-unit failures with clean operation evidence stay in money basics');
assert.equal(JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins}),protectedBefore,'diagnosis must not change mastery or rewards');
collector.close();

const result={status:'focus_v2_money_two_session_pilot_pass',sessions:{
 session1:{name:'Kembara Wang · D2.4.2',unresolved:5,focusSignal:'Tambah Wang lemah'},
 session2:{name:'Mini-game diagnostik Wang',moneyBasics:diagnosis.moneyBasics,smallAdditionIndependent:2,largeAdditionUnresolved:2}},
 diagnosis:{state:diagnosis.state,rootCause:diagnosis.rootCause,nextSkillId:diagnosis.nextSkillId,confidence:diagnosis.confidence,reasonCode:diagnosis.reasonCode,
  parentText:diagnosis.parentText,uniqueTaggedQuestions:diagnosis.operation.evidence.uniqueTaggedQuestions,writes:diagnosis.writes},
 guardrails:{noMoneyBasics:noBasics.state,oneLargeFailure:singleFail.state,moneyBasicsFailure:basicFailure.rootCause,
  masteryXpCoinsUnchanged:true,usesRealQuestionGenerators:true,productionRouting:'not connected'},trace};
fs.writeFileSync(path.join(root,'audit/focus-v2-e2e/two-session-money-pilot.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
