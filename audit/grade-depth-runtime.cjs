const fs=require('fs'),vm=require('vm');
function runtime(){
 const ctx={console:{log(){},info(){},warn(){},error:console.error},Math,Date,setTimeout(){},clearTimeout(){},localStorage:{getItem(){return null},setItem(){}}};ctx.window=ctx;ctx.globalThis=ctx;
 ctx.document={documentElement:{setAttribute(){},dataset:{}},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},readyState:'loading'};
 let seed=20261009;ctx.Math=Object.create(Math);ctx.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 ctx.sess={questionHistory:[],questionFingerprints:[],mode:'practice',recent:[]};vm.createContext(ctx);
 const load=f=>vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 for(const f of ['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js'])load(f);
 const pwa=fs.readFileSync('js/pwa.js','utf8'),constants=Object.fromEntries([...pwa.matchAll(/const (\w+)='([^']*)';/g)].map(m=>[m[1],m[2]]));constants.APP_VERSION='audit';
 const paths=[...pwa.matchAll(/const \w+=`((?:questions|data\/kssr)\/[^`]+\.js)(?:\?[^`]*)?`;/g)].map(m=>m[1].replace(/\$\{(\w+)\}/g,(_,k)=>constants[k]));
 for(const f of paths.filter(x=>x!=='questions/grade-depth-v1.js'))load(f);
 load('questions/grade-depth-v1.js');
 load('questions/v2/dist/runtime.js');
 load('questions/v2/engine/d3-rollout.js');
 load('questions/v2/engine/legacy-adapter.js');
 ctx.db={skills:{},schoolGrade:2};
 load('questions/index.js');
 vm.runInContext('globalThis.auditSkills=GRAPH.skills;globalThis.auditMeta=META;globalThis.auditGenerate=generate',ctx);
 return {ctx,load,paths};
}
if(require.main===module){const {ctx}=runtime(),out=[];
 for(const m of ctx.auditSkills){
  ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];const counts={},modes=new Set();
  for(let i=0;i<24;i++) {const q=ctx.auditGenerate(m.id,{mastery:85,evidence:12,confidence:80,correct:10,wrong:0});counts[q.demand||'unknown']=(counts[q.demand||'unknown']||0)+1;modes.add(q.archetypeId);}
  out.push({id:m.id,modes:modes.size,...counts});
 }
 console.log(JSON.stringify(out,null,2));
}
module.exports={runtime};
