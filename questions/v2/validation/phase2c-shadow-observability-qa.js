#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {createBridge,_test}=require('../engine/legacy-adapter');
let checks=0; const ok=(v,m)=>{checks++;assert(v,m)}; const eq=(a,b,m)=>{checks++;assert.deepStrictEqual(a,b,m)};
function storage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
function runtime(){const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist','runtime.js'),'utf8'),c);return c.PAQuestionSystemV2}
const rt=runtime(); let clock=100; const events=[];
const root={document:{},localStorage:storage(),performance:{now:()=>{clock+=1.25;return clock}},PAQuestionSystemV2:rt,PA_QSV2_FLAGS:{},PATelemetry:{record:(type,payload)=>events.push({type,payload})}};
const bridge=createBridge(root);

eq(bridge.getMode(),'shadow','new install defaults to shadow');
let status=bridge.getStatus();
eq(status.defaultMode,'shadow','status exposes default shadow mode');
eq(status.enabledStandards.length,6,'six Topic 7 standards enabled');
eq(status.battleCompatibleTemplates,16,'sixteen battle-compatible MCQ templates');
eq(status.shadowMetrics.attempts,0,'shadow metrics start empty');

// Successful shadow: return null, generate privately, metadata-only telemetry.
const out=bridge.tryGenerate('D3.SHAPE',{mastery:50,evidence:4},{history:[],rng:_test.makeRng(202603)});
eq(out,null,'shadow never returns v2 item to visible dispatcher');
ok(bridge.lastShadow&&bridge.lastShadow.question&&bridge.lastShadow.question.source==='qsv2','shadow privately generates v2');
let m=bridge.getShadowMetrics();
eq(m.attempts,1,'attempt counter increments');eq(m.generated,1,'generated counter increments');eq(m.fallbacks,0,'no fallback on success');eq(m.errors,0,'no error on success');
ok(m.lastDurationMs>=0,'duration recorded');ok(!!m.lastTemplateId&&!!m.lastCompetencyId,'last template/competency recorded');
eq(events.length,1,'one telemetry event emitted');eq(events[0].type,'qsv2_shadow','event type');
const allowed=['mode','outcome','reason','generationMs','standardId','competencyId','templateId','fingerprint'].sort();
eq(Object.keys(events[0].payload).sort(),allowed,'telemetry payload exact metadata whitelist');
for(const forbidden of ['prompt','answer','wrong','childId','name','email','userId'])ok(!(forbidden in events[0].payload),`telemetry excludes ${forbidden}`);
eq(events[0].payload.outcome,'generated','success outcome');ok(events[0].payload.generationMs>=0,'generation duration emitted');

// Explicit OFF and kill switch are hard rollback paths.
bridge.setPilotMode('off',false);eq(bridge.getMode(),'off','explicit off overrides default shadow');
const attemptsBeforeOff=bridge.getShadowMetrics().attempts;eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(2)}),null,'off falls back');eq(bridge.getShadowMetrics().attempts,attemptsBeforeOff,'off does not create shadow telemetry');
bridge.setPilotMode('shadow',false);bridge.setKillSwitch(true);eq(bridge.getMode(),'off','kill switch forces off');eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(3)}),null,'kill switch falls back');bridge.setKillSwitch(false);

// Missing runtime is observable fallback, still invisible to learner.
const saved= root.PAQuestionSystemV2; delete root.PAQuestionSystemV2; const fb0=bridge.getShadowMetrics().fallbacks;
eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(4)}),null,'missing runtime fallback');eq(bridge.getShadowMetrics().fallbacks,fb0+1,'missing runtime increments fallback');eq(events.at(-1).payload.reason,'runtime_missing','missing runtime reason code');root.PAQuestionSystemV2=saved;

// Generator exception is reduced to technical reason code; raw error never enters telemetry.
const originals={...rt._generators};Object.keys(rt._generators).forEach(k=>rt._generators[k]=()=>{throw new Error('SECRET PROMPT DATA MUST NOT LEAK')});
const err0=bridge.getShadowMetrics().errors;eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(5)}),null,'generator exception falls back');eq(bridge.getShadowMetrics().errors,err0+1,'error counter increments');eq(events.at(-1).payload.outcome,'error','error outcome');eq(events.at(-1).payload.reason,'exception','error uses stable reason code');ok(!JSON.stringify(events.at(-1)).includes('SECRET PROMPT DATA'),'raw exception text not emitted');Object.assign(rt._generators,originals);

// Telemetry API missing must never make shadow fail.
const savedTelemetry=root.PATelemetry;delete root.PATelemetry;eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(6)}),null,'shadow remains safe with telemetry unavailable');root.PATelemetry=savedTelemetry;

// Exact visible-field parity through the production dispatcher fixture.
function visibleQuestion(mode){
  const ctx={console,Math};ctx.window=ctx;ctx.globalThis=ctx;ctx.sess={mode:'mission',questionFingerprints:[],questionHistory:[]};
  ctx.PAQuestionBanks={d3:id=>({prompt:'LEGACY:'+id,answer:'legacy',wrong:[{v:'a'},{v:'b'},{v:'c'}],archetypeId:'legacy'})};
  ctx.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>({prompt,answer,wrong,hint,kind,diagnostic,formatShift});ctx.N=(v,tag)=>({v,label:v,tag});
  const r={document:{},localStorage:storage(),performance:{now:()=>1},PAQuestionSystemV2:rt,PA_QSV2_FLAGS:{d3Topic7:mode}};ctx.PAQuestionSystemV2Bridge=createBridge(r);
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'fixtures','phase2b','questions-index.js'),'utf8'),ctx);
  const q=ctx.generate('D3.SHAPE',{mastery:50,evidence:1,confidence:50,correct:0,wrong:0});
  return {visible:{prompt:q.prompt,answer:q.answer,wrong:Array.from(q.wrong,x=>({v:x.v}))},source:q.source||'legacy',history:Array.from(ctx.sess.questionHistory)};
}
const off=visibleQuestion('off'),shadow=visibleQuestion('shadow');
eq(JSON.stringify(shadow.visible),JSON.stringify(off.visible),'shadow visible prompt/answer/options exactly equal OFF legacy output');eq(shadow.source,'legacy','shadow visible source remains legacy');ok(shadow.history.every(x=>x.source!=='qsv2'),'shadow does not write v2 item into visible question history');

bridge.resetShadowMetrics();m=bridge.getShadowMetrics();eq(m.attempts,0,'session metrics reset');eq(m.generated,0,'generated reset');eq(m.fallbacks,0,'fallback reset');eq(m.errors,0,'errors reset');

console.log(JSON.stringify({status:'pass',checks,defaultMode:'shadow',telemetry:'metadata-only-local',visibleParity:'off===shadow',rollback:['explicit-off','kill-switch','missing-runtime','bridge-error']},null,2));
