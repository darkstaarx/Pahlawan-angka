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
// 1. Baseline: every non-fixture, non-HOLD D3 non-T7 standard behaves
// exactly as pre-3A-3 -- shadow-generated, always null to the dispatcher,
// regardless of what caller flags are supplied.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  for(const skill of ['D3.N10000','D3.MEASURE','D3.MONEY','D3.TIME','D3.DATA','D3.MUL','D3.DIV']){
    for(let seed=0;seed<20;seed++){
      const out=bridge.tryGenerate(skill,{mastery:50},{rng:_test.makeRng(4000000+seed),flags:{}});
      eq(out,null,`${skill} seed ${seed}: default rollout state never returns a real question`);
    }
  }
}

// ---------------------------------------------------------------------
// 2. The fixture standard (2.1.1, via D3.ADD10000/D3.SUB10000) WITHOUT the
// authorization flag still always returns null -- registry says LIVE, but
// the flag gate is the actual production safety boundary.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  let sawFixtureStandard=false;
  for(let seed=0;seed<200;seed++){
    const out=bridge.tryGenerate('D3.ADD10000',{mastery:50},{rng:_test.makeRng(5000000+seed),flags:{}});
    eq(out,null,`D3.ADD10000 seed ${seed}: fixture LIVE entry without auth flag still returns null`);
  }
  // Confirm the fixture standard is genuinely reachable in the candidate
  // pool (i.e. this isn't vacuously true because 2.1.1 never gets picked).
  const records=_test.mappedShadowRecords(runtime,'D3.ADD10000',registry);
  sawFixtureStandard=records.some(r=>r.standardId===registry.fixtureStandardId);
  ok(sawFixtureStandard,'2.1.1 is present in the D3.ADD10000 shadow candidate pool');
}

// ---------------------------------------------------------------------
// 3. The fixture standard WITH the authorization flag returns a real,
// battle-compatible, correctly-tagged question -- proving the plumbing
// works end to end. This path is exercised ONLY by this harness; no
// shipped app.js/battle.js code sets this flag.
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  let liveSeen=0,total=60;
  for(let seed=0;seed<total;seed++){
    const out=bridge.tryGenerate('D3.ADD10000',{mastery:50},{
      rng:_test.makeRng(6000000+seed),
      flags:{[registry.fixtureAuthFlag]:true}
    });
    if(out){
      liveSeen++;
      eq(out.standardId,'2.1.1',`fixture-authorized live question standardId is 2.1.1 (seed ${seed})`);
      eq(out.source,'qsv2',`live question source is qsv2 (seed ${seed})`);
      eq(out.qsv2Pilot,false,`non-T7 live question is NOT tagged qsv2Pilot (T7-only flag) (seed ${seed})`);
      eq(out.qsv2ShadowBatch,true,`qsv2ShadowBatch remains true for non-T7 topics regardless of live state (seed ${seed})`);
      ok(typeof out.prompt==='string'&&out.prompt.length>0,`live question has a prompt (seed ${seed})`);
      ok(out.answer!==undefined&&Array.isArray(out.wrong)&&out.wrong.length===3,`live question is 4-choice battle shape (seed ${seed})`);
      const choices=[out.answer,...out.wrong.map(w=>w.v)].map(x=>String(x).trim().toLowerCase());
      eq(new Set(choices).size,4,`live question has 4 unique choices (seed ${seed})`);
    }
  }
  ok(liveSeen>0,'at least one fixture-authorized attempt returned a real live question across 60 seeds');
}

// ---------------------------------------------------------------------
// 4. Defense in depth: even with the authorization flag set, a DIFFERENT
// D3 non-T7 skill/standard never goes live -- the flag only ever unlocks
// the hardcoded fixture standard, never "whatever the registry says".
// ---------------------------------------------------------------------
{
  const root=makeRoot();
  const bridge=createBridge(root);
  for(const skill of ['D3.MONEY','D3.TIME','D3.MEASURE','D3.DATA','D3.N10000']){
    for(let seed=0;seed<30;seed++){
      const out=bridge.tryGenerate(skill,{mastery:50},{
        rng:_test.makeRng(7000000+seed),
        flags:{[registry.fixtureAuthFlag]:true}
      });
      eq(out,null,`${skill} seed ${seed}: auth flag set, but not the fixture standard -- still null`);
    }
  }
}

// ---------------------------------------------------------------------
// 5. HOLD: the 6.3.3 standard (D3.MEASURE) is excluded from the shadow
// candidate pool entirely -- distinct from the default SHADOW state,
// which still participates in shadow generation for telemetry.
// ---------------------------------------------------------------------
{
  const measureRecords=_test.mappedShadowRecords(runtime,'D3.MEASURE',registry);
  ok(!measureRecords.some(r=>r.standardId==='6.3.3'),'6.3.3 (HOLD) is excluded from the D3.MEASURE shadow candidate pool');
  ok(measureRecords.some(r=>r.standardId==='6.1.1'),'6.1.1 (default SHADOW) remains in the D3.MEASURE shadow candidate pool');
  // Without a rollout registry supplied at all, behaviour is unchanged
  // from pre-3A-3 (backward compatible default -- no HOLD exclusion).
  const measureRecordsNoRegistry=_test.mappedShadowRecords(runtime,'D3.MEASURE');
  ok(measureRecordsNoRegistry.some(r=>r.standardId==='6.3.3'),'without a registry argument, 6.3.3 is NOT excluded (backward-compatible default)');
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

console.log(JSON.stringify({status:'pass',checks,fixtureStandardId:registry.fixtureStandardId,phase:'3A-3',revision:'R2',liveExpansion:false,defaultNonT7Mode:'shadow'},null,2));
