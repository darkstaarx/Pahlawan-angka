const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),sess={questionHistory:[],recent:[]};
const ctx={window:{PAQuestionBanks:{}},console,Math,sess};ctx.window.window=ctx.window;ctx.window.sess=sess;ctx.global=ctx;vm.createContext(ctx);
for(const f of ['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js','questions/d2/topic-1.js','questions/d2/topic-2.js','questions/d2/topic-3.js','questions/d2/topic-4.js','questions/d2/topic-5.js','questions/d2/topic-6.js','questions/d2/topic-7.js','questions/d2/topic-8.js','questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const ids=vm.runInContext('GRAPH.skills.filter(x=>x.grade>=3&&x.grade<=6).map(x=>x.id)',ctx),problems=[],summary=[],longDecimal=/-?\d+\.\d{3,}/;
for(const id of ids){
 const bank=ctx.window.PAQuestionBanks['d'+id[1]],seen=new Set(),archetypes=new Set();let repeats=0;sess.questionHistory=[];
 for(let i=0;i<500;i++){
  const q=bank(id,{evidence:5,confidence:60,mastery:60,correct:2,wrong:1},false);
  if(!q){problems.push({id,type:'null-question'});continue}
  sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId});if(sess.questionHistory.length>60)sess.questionHistory.shift();archetypes.add(q.archetypeId);
  const fp=(q.prompt+'|'+q.answer).replace(/\s+/g,' ');if(seen.has(fp))repeats++;seen.add(fp);
  const wrong=Array.isArray(q.wrong)?q.wrong:[],vals=[q.answer,...wrong.map(x=>x.v)],strings=vals.map(String);
  if(new Set(vals.map(String)).size!==4)problems.push({id,type:'duplicate-choice',sample:vals});
  if(strings.some(x=>/NaN|Infinity|undefined/.test(x)))problems.push({id,type:'invalid-number',sample:strings});
  if(strings.some(x=>longDecimal.test(x)))problems.push({id,type:'excess-decimal',sample:strings.filter(x=>longDecimal.test(x))});
  if(!q.archetypeId||!q.representation||!q.demand)problems.push({id,type:'missing-kssr-metadata'});
 }
 if(archetypes.size<3)problems.push({id,type:'insufficient-archetypes',count:archetypes.size});
 summary.push({id,samples:500,unique:seen.size,archetypes:[...archetypes],repeatRate:Number((repeats/500*100).toFixed(1))});
}
const dedupProblems=[...new Map(problems.map(x=>[JSON.stringify(x),x])).values()],report={generatedAt:new Date().toISOString(),scope:'Darjah 3-6, KSSR rotation v3.9.0',totalSamples:ids.length*500,skills:ids.length,problems:dedupProblems,summary};
fs.writeFileSync(path.join(__dirname,'full-d3-d6-audit-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({totalSamples:report.totalSamples,skills:report.skills,problems:dedupProblems.length,minArchetypes:Math.min(...summary.map(x=>x.archetypes.length)),worstRepeat:summary.slice().sort((a,b)=>b.repeatRate-a.repeatRate).slice(0,12)},null,2));
process.exitCode=dedupProblems.length?1:0;
