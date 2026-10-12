#!/usr/bin/env node
'use strict';
// Scenario A: authored money-division evidence + plain-division contrast.
// Uses the actual D2 source generators and learner-review adapter on an
// ephemeral profile; no app save, rewards, routing or cloud access is invoked.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const engine=require(path.join(root,'js/engine/focus-diagnosis-v2.js'));
const collectorApi=require(path.join(root,'js/engine/focus-diagnosis-shadow-v1.js'));
const review=require(path.join(root,'js/engine/learner-review-v1.js'));
let seed=97131;const math=Object.create(Math);math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const ctx={Math:math,window:{PAQuestionBanks:{}}};vm.createContext(ctx);
for(const file of ['questions/helpers.js','questions/d2/topic-2.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const money=ctx.moneyQ('D2.4.5',false,{mastery:15,evidence:0});
function generatedPlainFact(exclude){for(let i=0;i<500;i++){const q=ctx.window.PAQuestionBanks.d2t2('D2.2.4',{mastery:15,evidence:0},false);if(q.focusDiagnosticV1?.evidence?.questionFamilyKey==='d2-divide-basic-fact'&&q.focusDiagnosticV1.evidence.variantFingerprint!==exclude)return q}throw new Error('Could not sample a distinct basic division fact')}
const plainA=generatedPlainFact(money.focusDiagnosticV1.evidence.variantFingerprint);
const plainB=generatedPlainFact(plainA.focusDiagnosticV1.evidence.variantFingerprint);
for(const [q,id] of [[money,'D2.4.5'],[plainA,'D2.2.4'],[plainB,'D2.2.4']]){
 assert(q&&q.focusDiagnosticV1,'actual generator must provide an authored diagnostic tag');
 assert.equal(q.focusDiagnosticV1.tagOrigin,'authored');assert.equal(q.focusDiagnosticV1.originSkillId,id);
 assert.deepEqual(Array.from(q.focusDiagnosticV1.arithmeticProfile.operationFamilies),['division']);
 q.skill=id;q.token=id+'-'+Math.random();
}
assert.equal(money.focusDiagnosticV1.contextDomain,'money');
assert(money.focusDiagnosticV1.probes.foundationIds.includes('div.facts'));
assert(money.focusDiagnosticV1.probes.conceptIds.includes('money.ringgit_sen'));
const profile={schoolGrade:2,skills:{'D2.2.4':{mastery:61},'D2.4.5':{mastery:43}},xp:100,coins:55};
const before=JSON.stringify(profile),collector=collectorApi.createSession({originSkillId:'D2.4.5'},engine);
const trace=[];
for(const [i,[q,outcome]] of [[money,'unresolved'],[plainA,'independent'],[plainB,'independent']].entries()){
 const begun=review.beginQuestion(q,{grade:2,mode:'practice',now:1000+i*1000});
 assert(begun?.questionKey,'learner review should issue a join key');assert(collector.capture(begun,q),'collector should accept authored tag and exact review key');
 if(outcome==='unresolved')review.firstWrong(q,{tag:'division',now:1100+i*1000});
 const saved=review.resolve(q,{correct:outcome==='independent',seconds:5,now:1500+i*1000},profile);
 assert.equal(saved.outcome,outcome);
 trace.push({skillId:q.skill,outcome:saved.outcome,contextDomain:q.focusDiagnosticV1.contextDomain,
  operationFamilies:q.focusDiagnosticV1.arithmeticProfile.operationFamilies,
  questionFamilyKey:q.focusDiagnosticV1.evidence.questionFamilyKey,
  variantFingerprint:q.focusDiagnosticV1.evidence.variantFingerprint});
}
const decision=collector.evaluate(profile);
assert.equal(decision.state,'needs_contrast');assert.equal(decision.rootCause,null);
assert.equal(decision.nextProbe,'money.ringgit_sen');
assert.equal(decision.evidence.byFamily.money.nonindependent,1);
assert.equal(decision.evidence.byFamily.division_fact.independent,2);
assert.equal(JSON.stringify(profile.skills),JSON.stringify({'D2.2.4':{mastery:61},'D2.4.5':{mastery:43}}));
assert.equal(profile.xp,100);assert.equal(profile.coins,55);
const weak=engine.evaluate(JSON.parse(fs.readFileSync(path.join(root,'data/focus-v2/diagnosis-fixtures-v1.json'),'utf8')).cases.find(x=>x.id==='weak-basic-division'));
assert.equal(weak.state,'candidate');assert.equal(weak.rootCause,'div.facts');
collector.close();assert.equal(collector.stats().capturedQuestionKeys,0);
assert.equal(JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins}),JSON.stringify({skills:{'D2.2.4':{mastery:61},'D2.4.5':{mastery:43}},xp:100,coins:55}));
const result={status:'focus_v2_scenario_a_pass',actualGeneratedQuestions:trace.length,trace,
 moneyFailPlusPlainDivisionPass:{state:decision.state,rootCause:decision.rootCause,nextProbe:decision.nextProbe,
  evidence:decision.evidence},divisionRootCauseFixture:{state:weak.state,rootCause:weak.rootCause},
 profileUnchanged:before===JSON.stringify(Object.fromEntries(Object.entries(profile).filter(([k])=>k!=='learnerReviewV1')))};
fs.writeFileSync(path.join(root,'audit/focus-v2-e2e/scenario-a-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
