#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(__dirname,'..');
const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
const source=fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8');
const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(source,c,{filename:'runtime.js'});
const runtime=c.PAQuestionSystemV2, original=runtime._generators['d3.fullKssr'],seen=[],allParams=[],allTemplates=runtime.templates;
for(const key of Object.keys(runtime._generators)){const fn=runtime._generators[key];runtime._generators[key]=function(params,rng){allParams.push(params||{});if(key==='d3.fullKssr')seen.push(params&&params.difficultyBand);return fn(params,rng);};}
function storage(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
const root={document:{},localStorage:storage(),performance:{now:()=>1},PAQuestionSystemV2:runtime,PA_QSV2_FLAGS:{}};
const bridge=createBridge(root);
for(const band of [1,2,3]){
  runtime.templates=allTemplates.filter(t=>t.topicId==='D3.T4'&&t.difficultyBand===band);
  const before=seen.length;
  for(let i=0;i<40;i++)bridge.tryGenerate('D3.MONEY',{mastery:50},{rng:_test.makeRng(710000+band*1000+i),history:[],recentFingerprints:[]});
  assert(seen.length>before,'production bridge dispatched D3 money band '+band);
  assert(seen.slice(before).every(b=>Number(b)===band),'template difficultyBand propagated for band '+band);
}
runtime.templates=allTemplates;
for(const skill of ['D3.N10000','D3.ADD10000','D3.SUB10000','D3.MONEY','D3.TIME','D3.MEASURE','D3.POSITION','D3.DATA']){
  for(let i=0;i<12;i++)bridge.tryGenerate(skill,{mastery:50},{rng:_test.makeRng(720000+i+skill.length),history:[],recentFingerprints:[]});
}
assert(allParams.length>0&&allParams.every(p=>[1,2,3].includes(Number(p.difficultyBand))),'all production generator categories receive difficultyBand');
console.log(JSON.stringify({status:'pass',dispatches:seen.length,allCategoryDispatches:allParams.length,bands:[...new Set(seen)].sort()}));
