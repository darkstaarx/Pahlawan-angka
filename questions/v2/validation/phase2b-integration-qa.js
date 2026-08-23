#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {createBridge,_test}=require('../engine/legacy-adapter');

let checks=0; function ok(cond,msg){checks++;assert(cond,msg)}
function eq(a,b,msg){checks++;assert.deepStrictEqual(a,b,msg)}
function makeStorage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
function loadRuntime(){
  const ctx={console};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist','runtime.js'),'utf8'),ctx,{filename:'runtime.js'});
  return ctx.PAQuestionSystemV2;
}
const runtime=loadRuntime();
const root={document:{},localStorage:makeStorage(),performance:{now:()=>123.456},PAQuestionSystemV2:runtime,PA_QSV2_FLAGS:{}};
const bridge=createBridge(root);

// Feature flag / readiness surface.
eq(bridge.getMode(),'off','pilot defaults OFF');
let st=bridge.getStatus();
ok(st.runtimeReady,'runtime ready');
ok(JSON.stringify(Array.from(st.enabledStandards))===JSON.stringify(['7.1.1','7.1.2','7.1.3','7.2.1','7.2.2','7.3.1']),'exactly six Topic 7 SPs enabled');
eq(st.battleCompatibleTemplates,16,'18 authored templates minus 2 interactive = 16 battle-compatible MCQs');
eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(1)}),null,'OFF returns null');

bridge.setPilotMode('live',false);
eq(bridge.getMode(),'live','live mode set');
eq(bridge.tryGenerate('D3.MONEY',{mastery:50},{rng:_test.makeRng(2)}),null,'non-pilot skill always falls back');

// Live generation: coverage, battle contract, no interactive leakage.
const history=[]; const seenComp=new Set(),seenTpl=new Set(); let gallerySeen=0;
const rng=_test.makeRng(20260823);
for(let i=0;i<1800;i++){
  const mastery=[20,50,85][i%3];
  const q=bridge.tryGenerate('D3.SHAPE',{mastery,evidence:6,confidence:70},{history,rng});
  ok(!!q,`live item ${i} generated`);
  ok(q.source==='qsv2'&&q.qsv2Pilot===true,`live item ${i} tagged qsv2`);
  ok(q.standardId&&q.competencyId&&q.templateId,`live item ${i} has curriculum metadata`);
  ok(typeof q.prompt==='string'&&q.prompt.length>0,`live item ${i} prompt`);
  ok(q.answer!==undefined&&Array.isArray(q.wrong)&&q.wrong.length===3,`live item ${i} battle MCQ shape`);
  const vals=[q.answer,...q.wrong.map(x=>x.v)].map(x=>String(x).trim().toLowerCase());
  eq(new Set(vals).size,4,`live item ${i} four unique choices`);
  ok(!q.interaction,`live item ${i} never exposes interactive response type`);
  seenComp.add(q.competencyId); seenTpl.add(q.templateId);
  if(['D3-T7-711-identify-prism-discriminate-v1','D3-T7-713-classify-prism-select-v1','D3-T7-721-regular-polygon-gallery-v1'].includes(q.templateId)){
    gallerySeen++;
    ok(/^[A-D]$/.test(String(q.answer)),`gallery ${q.templateId} answer adapted to marker`);
    ok(q.wrong.every(x=>/^[A-D]$/.test(String(x.v))),`gallery ${q.templateId} distractors adapted to markers`);
    ok(/qsv2-choice-marker/.test(q.prompt),`gallery ${q.templateId} renders visible markers`);
  }
  history.push({skillId:'D3.SHAPE',competencyId:q.competencyId,templateId:q.templateId,source:q.source,archetypeId:q.archetypeId,representation:q.representation});
  if(history.length>60)history.shift();
}
eq(seenComp.size,6,'all six competencies surfaced in live routing');
eq(seenTpl.size,16,'all sixteen battle-compatible templates surfaced');
ok(gallerySeen>0,'gallery templates exercised');

// Shadow and kill-switch rollback behavior.
bridge.setPilotMode('shadow',false);
eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{history:[],rng:_test.makeRng(4)}),null,'shadow returns null to legacy dispatcher');
ok(bridge.lastShadow&&bridge.lastShadow.question&&bridge.lastShadow.question.source==='qsv2','shadow still generates inspectable v2 item');
root.PA_QSV2_FLAGS.killSwitch=true;
eq(bridge.getMode(),'off','kill switch overrides shadow/live');
eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(5)}),null,'kill switch returns null');
root.PA_QSV2_FLAGS.killSwitch=false;

// Runtime missing -> safe fallback.
const savedRuntime=root.PAQuestionSystemV2; delete root.PAQuestionSystemV2; bridge.setPilotMode('live',false);
eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{rng:_test.makeRng(6)}),null,'missing runtime safely falls back'); root.PAQuestionSystemV2=savedRuntime;

// Exact intended production dispatcher fixture: OFF/live/throw fallback.
const prodCtx={console,Math};prodCtx.window=prodCtx;prodCtx.globalThis=prodCtx;prodCtx.sess={mode:'mission',questionFingerprints:[],questionHistory:[]};
prodCtx.PAQuestionBanks={d3:(id)=>({prompt:'LEGACY:'+id,answer:'legacy',wrong:[{v:'a'},{v:'b'},{v:'c'}],archetypeId:'legacy'})};
prodCtx.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>({prompt,answer,wrong,hint,kind,diagnostic,formatShift});
prodCtx.N=(v,tag)=>({v,label:v,tag});
prodCtx.PAQuestionSystemV2Bridge=createBridge({document:{},localStorage:makeStorage(),performance:{now:()=>1},PAQuestionSystemV2:runtime,PA_QSV2_FLAGS:{d3Topic7:'off'}});
vm.createContext(prodCtx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'fixtures','phase2b','questions-index.js'),'utf8'),prodCtx,{filename:'questions/index.js'});
let q=prodCtx.generate('D3.SHAPE',{mastery:50,evidence:1,confidence:50,correct:0,wrong:0});
ok(q.prompt==='LEGACY:D3.SHAPE','dispatcher OFF preserves exact legacy path');
prodCtx.PAQuestionSystemV2Bridge.setPilotMode('live',false);
q=prodCtx.generate('D3.SHAPE',{mastery:50,evidence:1,confidence:50,correct:0,wrong:0});
ok(q.source==='qsv2','dispatcher live routes D3.SHAPE to v2');
ok(prodCtx.sess.questionHistory.at(-1).source==='qsv2'&&prodCtx.sess.questionHistory.at(-1).competencyId,'dispatcher history stores additive v2 metadata');
q=prodCtx.generate('D3.MONEY',{mastery:50,evidence:1,confidence:50,correct:0,wrong:0});
ok(q.prompt==='LEGACY:D3.MONEY','dispatcher live does not affect other skills');
prodCtx.PAQuestionSystemV2Bridge.tryGenerate=()=>{throw new Error('forced bridge fault')};
q=prodCtx.generate('D3.SHAPE',{mastery:50,evidence:1,confidence:50,correct:0,wrong:0});
ok(q.prompt==='LEGACY:D3.SHAPE','dispatcher catches bridge fault and falls back to legacy');

console.log(JSON.stringify({status:'pass',checks,liveSamples:1800,competencies:[...seenComp].sort(),battleCompatibleTemplates:seenTpl.size,gallerySamples:gallerySeen,defaultMode:'off',rollback:['flag-off','kill-switch','missing-runtime','bridge-error']},null,2));
