#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

function loadModule(rel){
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(repo,rel),'utf8'),ctx,{filename:rel});
  return ctx;
}
const iso=loadModule('data/kssr/d3-nonT7-live-isolation-v1.0.0.js').PAD3NonT7LiveIsolation;
ok(iso&&typeof iso.isTargetQuestion==='function','module loads and exports isTargetQuestion');

function q(overrides){
  return Object.assign({source:'qsv2',qsv2Live:true,topicId:'D3.T2',legacySkillId:'D3.ADD10000',standardId:'2.1.1',competencyId:'add_3digit',curriculumVersion:'KSSR-E3-2024'},overrides||{});
}

// 1. isTargetQuestion: well-formed non-T7 live question is a target.
ok(iso.isTargetQuestion(q()),'well-formed non-T7 live question is a target');

// 2. isTargetQuestion: T7 topic is NEVER a target for this module, even if
// otherwise well-formed (mutual exclusivity with the T7 module).
ok(!iso.isTargetQuestion(q({topicId:'D3.T7'})),'D3.T7 is never a target for the non-T7 module');

// 3. isTargetQuestion: every required field is actually required.
for(const missing of ['source','qsv2Live','topicId','legacySkillId','standardId','competencyId']){
  const bad=q();delete bad[missing];
  ok(!iso.isTargetQuestion(bad),`missing ${missing} is not a target`);
}
ok(!iso.isTargetQuestion(q({source:'legacy'})),'non-qsv2 source is not a target');
ok(!iso.isTargetQuestion(q({qsv2Live:false})),'qsv2Live=false is not a target');
ok(!iso.isTargetQuestion(q({qsv2Live:'true'})),'qsv2Live must be strictly boolean true, not truthy string');
ok(!iso.isTargetQuestion(null),'null question is not a target');
ok(!iso.isTargetQuestion(undefined),'undefined question is not a target');

// 4. newAttemptId: null for non-target, well-formed string for target.
eq(iso.newAttemptId(q({qsv2Live:false}),1),null,'newAttemptId is null for a non-target question');
const attemptId=iso.newAttemptId(q(),1);
ok(typeof attemptId==='string'&&/^nont7-live:[a-z0-9]+:1:[a-z0-9]{6}$/.test(attemptId),'newAttemptId produces the expected format');

// 5. capture/restore: whole-object round trip, generic to any mutation.
{
  const skillState={mastery:40,confidence:50,evidence:3,correct:2,wrong:1,stability:60,mis:{concept:1}};
  const before=JSON.parse(JSON.stringify(skillState));
  const snapshot=iso.captureLegacyState(q(),skillState);
  ok(snapshot&&snapshot!==skillState,'capture returns a distinct clone, not the same reference');
  // Simulate arbitrary battle.js-style mutation.
  skillState.mastery=95;skillState.correct=3;skillState.evidence=4;skillState.newField='should not survive restore';delete skillState.stability;
  const restored=iso.restoreLegacyState(q(),skillState,snapshot);
  ok(restored===true,'restore reports success');
  ok(JSON.stringify(skillState)===JSON.stringify(before),'skill state is restored byte-identical to its pre-mutation snapshot');
}

// 6. capture/restore: no-ops for a non-target question (defense in depth --
// never touches state for anything this module does not recognise).
{
  const skillState={mastery:10};
  eq(iso.captureLegacyState(q({qsv2Live:false}),skillState),null,'capture is null for non-target question');
  ok(iso.restoreLegacyState(q({qsv2Live:false}),skillState,{mastery:99})===false,'restore refuses to act on non-target question');
  eq(skillState,{mastery:10},'skill state is untouched when restore refuses');
}

// 7. record(): basic accept/reject contract.
{
  const stateRoot={skills:{'D3.ADD10000':{mastery:50,correct:1,wrong:0}}};
  const r1=iso.recordBattleResult(stateRoot,{...q(),qsv2AttemptId:'nont7-live:abc:1:xxxxxx'},{retryState:null,hint:false},true);
  ok(r1.accepted===true,'first attempt is accepted');
  const r2=iso.recordBattleResult(stateRoot,{...q(),qsv2AttemptId:'nont7-live:abc:1:xxxxxx'},{retryState:null,hint:false},true);
  ok(r2.accepted===false&&r2.reason==='duplicate_attempt','duplicate attemptId is rejected');
  const r3=iso.recordBattleResult(stateRoot,{...q(),qsv2AttemptId:''},{retryState:null,hint:false},true);
  ok(r3.accepted===false,'empty attemptId is rejected');
  const r4=iso.recordBattleResult(stateRoot,q({qsv2Live:false}),{retryState:null,hint:false},true);
  ok(r4.accepted===false&&r4.reason==='not_qsv2_nonT7_live','non-target question is rejected by recordBattleResult');

  const topic=stateRoot.qsv2Evidence.topics['D3.T2'];
  ok(!!topic,'evidence topic D3.T2 was created');
  eq(topic.competencies['2.1.1'].attempts,1,'exactly one accepted attempt recorded (duplicate did not double-count)');
  eq(topic.competencies['2.1.1'].finalCorrect,1,'finalCorrect recorded');
  ok(topic.legacy.baselineSkills['D3.ADD10000'].mastery===50,'legacy baseline snapshot captured the pre-existing skill mastery at topic creation');
}

// 8. The 3.4.1 multi-legacy-skill edge case: the same standardId, reached
// via two different legacySkillIds, must aggregate into ONE competency
// entry under the shared topic, while tracking which skills contributed.
{
  const stateRoot={skills:{'D3.FRAC':{mastery:10},'D3.DEC':{mastery:20}}};
  const qFrac={source:'qsv2',qsv2Live:true,topicId:'D3.T3',legacySkillId:'D3.FRAC',standardId:'3.4.1',competencyId:'hundredths_bridge',curriculumVersion:'KSSR-E3-2024',qsv2AttemptId:'nont7-live:a:1:aaaaaa'};
  const qDec={source:'qsv2',qsv2Live:true,topicId:'D3.T3',legacySkillId:'D3.DEC',standardId:'3.4.1',competencyId:'hundredths_bridge',curriculumVersion:'KSSR-E3-2024',qsv2AttemptId:'nont7-live:b:1:bbbbbb'};
  iso.recordBattleResult(stateRoot,qFrac,{retryState:null,hint:false},true);
  iso.recordBattleResult(stateRoot,qDec,{retryState:null,hint:false},false);
  const c=stateRoot.qsv2Evidence.topics['D3.T3'].competencies['3.4.1'];
  ok(!!c,'3.4.1 competency entry exists under the shared D3.T3 topic');
  eq(c.attempts,2,'both attempts, from two different legacySkillIds, aggregate into the SAME competency');
  eq(c.finalCorrect,1,'one correct counted');
  eq(c.incorrect,1,'one incorrect counted');
  ok(JSON.stringify(c.legacySkillIds)===JSON.stringify({'D3.FRAC':1,'D3.DEC':1}),'both contributing legacySkillIds are individually tracked');
}

// 9. summary() reflects what was recorded.
{
  const stateRoot={skills:{'D3.ADD10000':{mastery:50}}};
  iso.recordBattleResult(stateRoot,{...q(),qsv2AttemptId:'nont7-live:s:1:ssssss'},{retryState:null,hint:false},true);
  const s=iso.summary(stateRoot,'D3.T2');
  ok(s.ok===true&&s.totalAttempts===1,'summary reports the recorded attempt');
  ok(JSON.stringify(iso.summary(stateRoot,'D3.NOPE'))===JSON.stringify({ok:false,reason:'not_prepared'}),'summary for an unprepared topic reports not_prepared');
  ok(JSON.stringify(iso.summary(null,'D3.T2'))===JSON.stringify({ok:false,reason:'state_missing'}),'summary with no stateRoot reports state_missing');
}

console.log(JSON.stringify({status:'pass',checks},null,2));
