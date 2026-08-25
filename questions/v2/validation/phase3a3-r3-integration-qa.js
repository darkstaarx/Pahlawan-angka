#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.strictEqual(a,b,m)}

const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
const registry=require(path.join(repo,'questions/v2/engine/d3-rollout.js'));

function makeStorage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
function loadRuntime(){
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8'),ctx,{filename:'runtime.js'});
  return ctx.PAQuestionSystemV2;
}
function loadIsolationModule(){
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(repo,'data/kssr/d3-nonT7-live-isolation-v1.0.0.js'),'utf8'),ctx,{filename:'iso.js'});
  return ctx.PAD3NonT7LiveIsolation;
}
const runtime=loadRuntime();
const iso=loadIsolationModule();

function makeRoot(extra){
  return Object.assign({
    document:{}, localStorage:makeStorage(), performance:{now:()=>1},
    PAQuestionSystemV2:runtime, PA_QSV2_FLAGS:{},
    PAD3RolloutRegistry:registry,
    PAD3Topic7LiveCutover:{authorizeLive:(skillId)=>({allowed:skillId==='D3.SHAPE'})}
  }, extra||{});
}

// ---------------------------------------------------------------------
// 1. New question metadata: fixture-authorized non-T7 LIVE carries the
// full identity set required for isolation.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  let live=null;
  for(let seed=0;seed<80&&!live;seed++){
    live=bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(9000000+seed)});
  }
  ok(!!live,'a live question was generated via the real production authorization path (no test flag)');
  eq(live.qsv2Live,true,'qsv2Live is true for the live question');
  eq(live.qsv2Pilot,false,'qsv2Pilot remains false for a non-T7 live question (T7-only flag untouched)');
  eq(live.legacySkillId,'D3.ADD10000','legacySkillId is present and correct');
  eq(live.topicId,'D3.T2','topicId is present and correct');
  ok(['2.1.1','2.1.2'].includes(live.standardId),'standardId is a real D3.ADD10000-mapped LIVE standard');
  ok(typeof live.competencyId==='string'&&live.competencyId.length>0,'competencyId is present');
  ok(typeof live.templateId==='string'&&live.templateId.length>0,'templateId is present');
  ok(iso.isTargetQuestion(live),'the isolation module recognises this question as a target');
}

// ---------------------------------------------------------------------
// 2. Shadow (default, non-authorized) non-T7 questions carry qsv2Live:false
// even though the new fields are present -- additive, not a behavior
// change to what gets returned (still null to the dispatcher).
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// 2. SHADOW questions (Phase 3A-4: exercised via a registry override,
// since every real D3.MEASURE standard is now LIVE by default) still
// carry qsv2Live:false and never reach the dispatcher.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const shadowRegistry=Object.assign({},registry,{isLiveAuthorized:()=>false,getState:(sid)=>sid==='6.3.3'?'HOLD':'SHADOW'});
  root.PAD3RolloutRegistry=shadowRegistry;
  const bridge=createBridge(root);
  for(let seed=0;seed<20;seed++){
    const out=bridge.tryGenerate('D3.MEASURE',{mastery:50},{rng:_test.makeRng(9100000+seed)});
    eq(out,null,`D3.MEASURE seed ${seed}: forced-SHADOW registry never returns a real question`);
  }
  const shadow=bridge.lastShadow&&bridge.lastShadow.question;
  ok(shadow,'internal shadow question is still generated for telemetry');
  eq(shadow.qsv2Live,false,'internally-generated shadow question is tagged qsv2Live:false');
  ok(!iso.isTargetQuestion(shadow),'a shadow (non-live) question is never an isolation target');
}

// ---------------------------------------------------------------------
// 3. T7 LIVE also gets the new topic-agnostic qsv2Live marker, and remains
// mutually exclusive with the non-T7 isolation module.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  bridge.setPilotMode('live',false);
  let t7=null;
  for(let seed=0;seed<40&&!t7;seed++)t7=bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(9300000+seed)});
  ok(!!t7,'a T7 live question was generated');
  eq(t7.qsv2Live,true,'T7 live question also carries qsv2Live:true (topic-agnostic marker)');
  eq(t7.qsv2Pilot,true,'T7 live question still carries qsv2Pilot:true (unchanged)');
  eq(t7.legacySkillId,'D3.SHAPE','T7 live question carries legacySkillId (new, additive, harmless for T7)');
  ok(!iso.isTargetQuestion(t7),'the non-T7 isolation module never claims a T7 question');
}

// ---------------------------------------------------------------------
// 4. Full capture -> mutate -> restore -> record cycle via the real
// production authorization path (no flags), both correct and incorrect
// outcomes, proving the legacy skill bucket is byte-identical before and
// after in both cases.
// ---------------------------------------------------------------------
for(const outcome of [true,false]){
  const root=makeRoot();
  const bridge=createBridge(root);
  let live=null;
  for(let seed=0;seed<80&&!live;seed++)live=bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(9400000+seed+(outcome?0:500))});
  ok(!!live,`live question generated for outcome=${outcome} via real production path`);
  const stateRoot={skills:{'D3.ADD10000':{mastery:50,confidence:60,evidence:5,correct:3,wrong:2,stability:70,mis:{}}}};
  const s=stateRoot.skills['D3.ADD10000'];
  const before=JSON.stringify(s);
  const snapshot=iso.captureLegacyState(live,s);
  ok(!!snapshot,'legacy state captured before mutation');
  // Simulate the exact kind of unconditional mutation resolveAnswer performs.
  if(outcome){s.correct++;s.evidence++;s.mastery=Math.min(100,s.mastery+8);}
  else{s.wrong++;s.evidence++;s.mastery=Math.max(0,s.mastery-4.5);s.mis.shape=(s.mis.shape||0)+1;}
  ok(JSON.stringify(s)!==before,'the simulated mutation actually changed the skill state (sanity check)');
  const restored=iso.restoreLegacyState(live,s,snapshot);
  ok(restored===true,'restore succeeded');
  eq(JSON.stringify(s),before,`legacy skill bucket is byte-identical after restore (outcome=${outcome})`);
  live.qsv2AttemptId=iso.newAttemptId(live,1);
  const rec=iso.recordBattleResult(stateRoot,live,{retryState:null,hint:false},outcome);
  ok(rec.accepted===true,'separate evidence was recorded for this attempt');
  const topic=stateRoot.qsv2Evidence.topics['D3.T2'];
  eq(topic.competencies[live.standardId].attempts,1,'exactly one evidence attempt recorded');
  eq(topic.competencies[live.standardId].finalCorrect,outcome?1:0,'correctness recorded accurately in evidence');
}

// ---------------------------------------------------------------------
// 5. Multiple non-T7 legacy skills, each isolated independently. Uses
// synthetic questions (the rollout registry only authorizes one real
// fixture in R2/R3 by design) to prove the isolation module's own logic
// is genuinely generic across skills, not hardcoded to the one fixture.
// ---------------------------------------------------------------------
{
  const stateRoot={skills:{
    'D3.MONEY':{mastery:30,correct:1,wrong:0},
    'D3.TIME':{mastery:70,correct:5,wrong:1},
    'D3.MEASURE':{mastery:55,correct:2,wrong:2}
  }};
  const cases=[
    {legacySkillId:'D3.MONEY',topicId:'D3.T4',standardId:'4.1.1',competencyId:'money_add'},
    {legacySkillId:'D3.TIME',topicId:'D3.T5',standardId:'5.1.1',competencyId:'time_read'},
    {legacySkillId:'D3.MEASURE',topicId:'D3.T6',standardId:'6.1.1',competencyId:'measure_length'}
  ];
  for(const c of cases){
    const s=stateRoot.skills[c.legacySkillId];
    const before=JSON.stringify(s);
    const question={source:'qsv2',qsv2Live:true,curriculumVersion:'KSSR-E3-2024',...c};
    const snap=iso.captureLegacyState(question,s);
    s.mastery=999;s.correct+=100;// arbitrary mutation
    iso.restoreLegacyState(question,s,snap);
    eq(JSON.stringify(s),before,`${c.legacySkillId} legacy bucket restored independently of the others`);
    question.qsv2AttemptId=iso.newAttemptId(question,1);
    const rec=iso.recordBattleResult(stateRoot,question,{retryState:null,hint:false},true);
    ok(rec.accepted===true,`${c.legacySkillId} evidence recorded`);
  }
  // Confirm each skill's mutation-then-restore did not bleed into the others.
  eq(stateRoot.skills['D3.MONEY'].mastery,30,'D3.MONEY final mastery unaffected by TIME/MEASURE isolation cycles');
  eq(stateRoot.skills['D3.TIME'].mastery,70,'D3.TIME final mastery unaffected by MONEY/MEASURE isolation cycles');
  eq(stateRoot.skills['D3.MEASURE'].mastery,55,'D3.MEASURE final mastery unaffected by MONEY/TIME isolation cycles');
}

// ---------------------------------------------------------------------
// 6. The 3.4.1 multi-legacy-skill edge case, exercised end to end
// (isolation per actual legacySkillId bucket, evidence aggregated per
// shared standardId).
// ---------------------------------------------------------------------
{
  const stateRoot={skills:{'D3.FRAC':{mastery:40,correct:2,wrong:1},'D3.DEC':{mastery:60,correct:4,wrong:0},'D3.PERCENT':{mastery:20,correct:0,wrong:3}}};
  const skills=['D3.FRAC','D3.DEC','D3.PERCENT'];
  const befores={};
  for(const sk of skills)befores[sk]=JSON.stringify(stateRoot.skills[sk]);
  for(const sk of skills){
    const s=stateRoot.skills[sk];
    const question={source:'qsv2',qsv2Live:true,curriculumVersion:'KSSR-E3-2024',topicId:'D3.T3',legacySkillId:sk,standardId:'3.4.1',competencyId:'hundredths_bridge'};
    const snap=iso.captureLegacyState(question,s);
    s.mastery=Math.random()*100;s.correct+=7;// arbitrary distinct mutation per skill
    iso.restoreLegacyState(question,s,snap);
    question.qsv2AttemptId=iso.newAttemptId(question,1);
    iso.recordBattleResult(stateRoot,question,{retryState:null,hint:false},true);
  }
  for(const sk of skills)eq(JSON.stringify(stateRoot.skills[sk]),befores[sk],`3.4.1 via ${sk}: legacy bucket restored independently`);
  const c=stateRoot.qsv2Evidence.topics['D3.T3'].competencies['3.4.1'];
  eq(c.attempts,3,'all three legacySkillId entry points aggregate into the same 3.4.1 competency');
  ok(c.legacySkillIds['D3.FRAC']===1&&c.legacySkillIds['D3.DEC']===1&&c.legacySkillIds['D3.PERCENT']===1,'all three legacySkillIds individually tracked in the shared competency');
}

// ---------------------------------------------------------------------
// 7. Kill switch still blocks the fixture (unchanged from R2, re-verified
// after the R3 changes).
// ---------------------------------------------------------------------
{
  const root=makeRoot({PA_QSV2_FLAGS:{killSwitch:true}});
  const bridge=createBridge(root);
  eq(bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(1)}),null,'kill switch still blocks live-authorized standards');
  eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(1)}),null,'kill switch still blocks T7 pilot');
}

// ---------------------------------------------------------------------
// 8. Source-level wiring checks on js/battle.js and js/app.js -- proves
// the new module is actually referenced at the correct dispatch points,
// and that the T7 module's own dispatch line is untouched verbatim.
// ---------------------------------------------------------------------
{
  const battleSrc=fs.readFileSync(path.join(repo,'js/battle.js'),'utf8');
  const appSrc=fs.readFileSync(path.join(repo,'js/app.js'),'utf8');
  ok(battleSrc.includes('window.PAD3NonT7LiveIsolation?.isTargetQuestion?.(question)===true'),'battle.js checks the non-T7 isolation module for target questions');
  ok(battleSrc.includes('window.PAD3NonT7LiveIsolation?.captureLegacyState?.(question,s)'),'battle.js captures via the non-T7 isolation module');
  ok(battleSrc.includes('window.PAD3NonT7LiveIsolation?.restoreLegacyState?.(question,s,qsv2LegacySnapshot)'),'battle.js restores via the non-T7 isolation module');
  ok(battleSrc.includes('window.PAD3NonT7LiveIsolation?.recordBattleResult?.(db,question,sess,ok)'),'battle.js records via the non-T7 isolation module');
  ok(battleSrc.includes("window.PAD3Topic7LiveCutover?.restoreLegacyState?.(question,s,qsv2LegacySnapshot);"),"T7's own restore dispatch line is unchanged verbatim");
  ok(battleSrc.includes("window.PAD3Topic7LiveCutover?.recordBattleResult?.(db,question,sess,ok);"),"T7's own record dispatch line is unchanged verbatim");
  ok(battleSrc.includes('qsv2Isolated'),'battle.js uses a combined isolation flag for coach/frontier/intervention suppression');
  ok(appSrc.includes('q.qsv2Live'),'app.js references the new topic-agnostic live marker');
  ok(appSrc.includes('window.PAD3Topic7LiveCutover?.newAttemptId?.(q,q.token)||null'),"T7's own attempt-id line is unchanged verbatim");
}

console.log(JSON.stringify({status:'pass',checks,phase:'3A-4',revision:'production-activation',masteryIsolation:'generic, additive companion module'},null,2));
