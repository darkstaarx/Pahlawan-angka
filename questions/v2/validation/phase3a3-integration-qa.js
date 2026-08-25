#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
const registry=require(path.join(repo,'questions/v2/engine/d3-rollout.js'));

function makeStorage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
function loadRuntime(){
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8'),ctx,{filename:'runtime.js'});
  return ctx.PAQuestionSystemV2;
}
const runtime=loadRuntime();

function makeRoot(extra){
  return Object.assign({
    document:{}, localStorage:makeStorage(), performance:{now:()=>1},
    PAQuestionSystemV2:runtime, PA_QSV2_FLAGS:{},
    PAD3RolloutRegistry:registry,
    PAD3Topic7LiveCutover:{authorizeLive:(skillId)=>({allowed:skillId==='D3.SHAPE'})}
  }, extra||{});
}

// ---------------------------------------------------------------------
// 1. Phase 3A-4: an unmapped/unlisted D3 non-T7 standard would default to
// SHADOW -- but every one of the 44 real mapped standards now has an
// explicit registry entry, so this is exercised via a rollout registry
// with the target entry temporarily removed, proving the SHADOW default
// still genuinely gates generation (not vacuously true because nothing
// ever hits this path).
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  const removedRegistry=Object.assign({},registry,{isLiveAuthorized:(sid)=>sid!=='1.1.1'&&registry.isLiveAuthorized(sid),getState:(sid)=>sid==='1.1.1'?'SHADOW':registry.getState(sid)});
  root.PAD3RolloutRegistry=removedRegistry;
  let sawShadowOnly=true;
  for(let seed=0;seed<40;seed++){
    const out=bridge.tryGenerate('D3.N10000',{mastery:50},{rng:_test.makeRng(4000000+seed)});
    if(out&&out.standardId==='1.1.1')sawShadowOnly=false;
  }
  ok(sawShadowOnly,'a standard explicitly reset to SHADOW never returns a real question, even though its topic has other LIVE standards');
}

// ---------------------------------------------------------------------
// 2. Phase 3A-4: every one of the 43 LIVE-registered standards is now
// genuinely reachable through the real production path -- no caller flag
// of any kind is supplied, matching exactly what questions/index.js
// passes in production ({history, recentFingerprints, stateRoot}, no
// `flags` field at all).
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  const liveStandards=new Set(registry.listEntries().filter(e=>e.state==='LIVE').map(e=>e.standardId));
  const seenLive=new Set();
  for(const skill of ['D3.N10000','D3.ADD10000','D3.SUB10000','D3.FRAC','D3.DEC','D3.PERCENT','D3.MONEY','D3.TIME','D3.MEASURE','D3.POSITION','D3.DATA']){
    for(let seed=0;seed<60;seed++){
      const out=bridge.tryGenerate(skill,{mastery:50},{history:[],recentFingerprints:[],stateRoot:{skills:{}}});
      if(out){
        ok(liveStandards.has(out.standardId),`${out.standardId}: a real production-path question is only ever a registry-LIVE standard`);
        seenLive.add(out.standardId);
      }
    }
  }
  ok(seenLive.size>=8,`multiple distinct LIVE standards were actually reached with zero caller flags (saw ${seenLive.size})`);
}

// ---------------------------------------------------------------------
// 3. A real production-path live question is battle-compatible,
// correctly tagged, and carries the full identity set the isolation
// module needs -- proving the plumbing works end to end without any
// test-only flag.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  let liveSeen=0,total=80;
  for(let seed=0;seed<total;seed++){
    const out=bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(6000000+seed)});
    if(out){
      liveSeen++;
      ok(['2.1.1','2.1.2'].includes(out.standardId),`live question standardId is a real D3.ADD10000-mapped LIVE standard (seed ${seed})`);
      eq(out.source,'qsv2',`live question source is qsv2 (seed ${seed})`);
      eq(out.qsv2Pilot,false,`non-T7 live question is NOT tagged qsv2Pilot (T7-only flag) (seed ${seed})`);
      eq(out.qsv2Live,true,`live question carries the topic-agnostic qsv2Live marker (seed ${seed})`);
      eq(out.legacySkillId,'D3.ADD10000',`live question carries its legacySkillId (seed ${seed})`);
      ok(typeof out.prompt==='string'&&out.prompt.length>0,`live question has a prompt (seed ${seed})`);
      ok(out.answer!==undefined&&Array.isArray(out.wrong)&&out.wrong.length===3,`live question is 4-choice battle shape (seed ${seed})`);
      const choices=[out.answer,...out.wrong.map(w=>w.v)].map(x=>String(x).trim().toLowerCase());
      eq(new Set(choices).size,4,`live question has 4 unique choices (seed ${seed})`);
    }
  }
  ok(liveSeen>0,'at least one real, unflagged attempt returned a live question across 80 seeds');
}

// ---------------------------------------------------------------------
// 4. HOLD capability itself still works end to end through the real
// selector, proven via a registry override (the real corpus has zero
// HOLD entries now that 6.3.3 has been cleared -- this proves the
// mechanism, not a currently-active restriction).
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const heldRegistry=Object.assign({},registry,{isLiveAuthorized:(sid)=>sid!=='6.3.3'&&registry.isLiveAuthorized(sid),getState:(sid)=>sid==='6.3.3'?'HOLD':registry.getState(sid)});
  root.PAD3RolloutRegistry=heldRegistry;
  const bridge=createBridge(root);
  let sawHeld=false;
  for(let seed=0;seed<200;seed++){
    const out=bridge.tryGenerate('D3.MEASURE',{mastery:50},{rng:_test.makeRng(7000000+seed)});
    if(out&&out.standardId==='6.3.3')sawHeld=true;
  }
  ok(!sawHeld,'a standard forced to HOLD via the registry never appears as a live question across 200 attempts, even though sibling D3.MEASURE standards are LIVE');
  const heldCandidatePool=_test.mappedShadowRecords(runtime,'D3.MEASURE',heldRegistry).some(r=>r.standardId==='6.3.3');
  ok(!heldCandidatePool,'a standard forced to HOLD is excluded from the shadow candidate pool entirely, not just from going live');
}

// ---------------------------------------------------------------------
// 4b. In the real (unmodified) registry, 6.3.3 is confirmed LIVE -- it
// has been explicitly cleared and is no longer held.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  eq(registry.getState('6.3.3'),'LIVE','the real registry now reports 6.3.3 as LIVE');
  let sawLive=false;
  for(let seed=0;seed<300&&!sawLive;seed++){
    const out=bridge.tryGenerate('D3.MEASURE',{mastery:50},{rng:_test.makeRng(7100000+seed)});
    if(out&&out.standardId==='6.3.3')sawLive=true;
  }
  ok(sawLive,'6.3.3 is genuinely reachable as a live question in the real, unmodified registry');
}

// ---------------------------------------------------------------------
// 5. HOLD candidate-pool exclusion mechanism still works (proven via a
// registry override, since the real corpus has zero HOLD entries now);
// the real registry confirms 6.3.3 is present in the candidate pool like
// every other mapped standard.
// ---------------------------------------------------------------------
{
  const heldRegistry=Object.assign({},registry,{getState:(sid)=>sid==='6.3.3'?'HOLD':registry.getState(sid)});
  const measureRecordsHeld=_test.mappedShadowRecords(runtime,'D3.MEASURE',heldRegistry);
  ok(!measureRecordsHeld.some(r=>r.standardId==='6.3.3'),'a standard forced to HOLD via the registry is excluded from the D3.MEASURE candidate pool');
  ok(measureRecordsHeld.some(r=>r.standardId==='6.1.1'),'6.1.1 remains in the D3.MEASURE candidate pool while 6.3.3 alone is held');

  const measureRecords=_test.mappedShadowRecords(runtime,'D3.MEASURE',registry);
  ok(measureRecords.some(r=>r.standardId==='6.3.3'),'in the real, unmodified registry, 6.3.3 is present in the D3.MEASURE candidate pool (no longer held)');

  // Without a rollout registry supplied at all, behaviour is unchanged
  // from pre-3A-3 (backward compatible default -- no HOLD exclusion).
  const measureRecordsNoRegistry=_test.mappedShadowRecords(runtime,'D3.MEASURE');
  ok(measureRecordsNoRegistry.some(r=>r.standardId==='6.3.3'),'without a registry argument, 6.3.3 is present (backward-compatible default)');
}

// ---------------------------------------------------------------------
// 6. Topic 7 (the pilot skill) is completely unaffected: identical
// behaviour to the pre-3A-3 contract, with and without the rollout
// registry present on root.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  eq(bridge.getMode(),'shadow','Topic 7 default mode remains SHADOW');
  eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(1)}),null,'Topic 7 default SHADOW still returns null to legacy dispatcher');
  bridge.setPilotMode('live',false);
  eq(bridge.getMode(),'live','Topic 7 live mode still settable exactly as before');
  let t7Live=0;
  for(let seed=0;seed<40;seed++){
    const out=bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(2000000+seed)});
    if(out){t7Live++;eq(out.qsv2Pilot,true,'Topic 7 live question is still tagged qsv2Pilot=true');}
  }
  ok(t7Live>0,'Topic 7 live path still produces real questions exactly as before');
  const st=bridge.getStatus();
  eq(st.battleCompatibleTemplates,24,'Topic 7 battle-compatible template count unchanged (26 total - 2 interactive)');
}

// ---------------------------------------------------------------------
// 7. D1/D2/D4/D5/D6 are completely unaffected -- unreachable by any D3
// rollout logic, unchanged code path, still return null immediately.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  for(const skillId of ['D1.ADD10','D2.3.1','D4.SOMETHING','D5.SOMETHING','D6.SOMETHING']){
    eq(bridge.tryGenerate(skillId,{mastery:50},{rng:_test.makeRng(3)}),null,`${skillId}: non-D3 skill always falls back to legacy bank, unaffected by rollout registry`);
  }
}

// ---------------------------------------------------------------------
// 8. Kill switch still forces every D3 skill off, fixture included,
// regardless of rollout/auth flags.
// ---------------------------------------------------------------------
{
  const root=makeRoot({PA_QSV2_FLAGS:{killSwitch:true}});
  const bridge=createBridge(root);
  eq(bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(1),flags:{[registry.fixtureAuthFlag]:true}}),null,'kill switch blocks the fixture even with auth flag set');
  eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(1)}),null,'kill switch blocks Topic 7 pilot as before');
}

// ---------------------------------------------------------------------
// 9. Source-scope guard: legacy-adapter.js's D3_SHADOW_SKILLS map (the
// frozen Phase 3A-1 historical anchor) is untouched by this phase.
// ---------------------------------------------------------------------
{
  const adapterSrc=fs.readFileSync(path.join(repo,'questions/v2/engine/legacy-adapter.js'),'utf8');
  for(const skill of ['D3.N10000','D3.PV10000','D3.ADD10000','D3.SUB10000','D3.MUL','D3.DIV','D3.FRAC','D3.DEC','D3.PERCENT','D3.MONEY','D3.TIME','D3.MEASURE','D3.POSITION','D3.DATA']){
    ok(adapterSrc.includes("'"+skill+"':true"),`shadow skill map still contains ${skill} (Phase 3A-1 historical anchor preserved)`);
  }
  ok(!/PAD3Topic7Evidence/.test(adapterSrc)||adapterSrc.match(/PAD3Topic7Evidence/g).length===0,'legacy-adapter.js does not newly reference the T7-only evidence module (mastery isolation deferred to R3)');
}

// ---------------------------------------------------------------------
// 10. Confirm Phase 3A-2's own integration test was made forward-compatible
// (same convention every prior phase applied to its predecessor).
// ---------------------------------------------------------------------
{
  const p3a2Src=fs.readFileSync(path.join(repo,'questions/v2/validation/phase3a2-integration-qa.js'),'utf8');
  ok(p3a2Src.includes("versionAtLeast(release,'3.45.0')"),'Phase 3A-2 integration test made forward-compatible');
  ok(p3a2Src.includes('full Darjah 3 authored SHADOW bank'),'Phase 3A-2 sw.js substring check preserved');
  ok(p3a2Src.includes('default SHADOW'),'Phase 2D-era sw.js substring check preserved');
  ok(p3a2Src.includes('semantic hardening'),'Phase 3A-2 semantic hardening sw.js substring check preserved');
}

console.log(JSON.stringify({status:'pass',checks,phase:'3A-4',revision:'production-activation',liveExpansion:true,liveStandardCount:registry.listEntries().filter(e=>e.state==='LIVE').length,holdStandardCount:registry.listEntries().filter(e=>e.state==='HOLD').length,defaultUnlistedState:registry.defaultState},null,2));
