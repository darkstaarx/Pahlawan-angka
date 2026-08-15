const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),ctx={console,Math};ctx.window=ctx;ctx.sess={questionFingerprints:[],questionHistory:[],mode:'practice'};vm.createContext(ctx);
const files=['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/index.js'];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
vm.runInContext('globalThis.__skills=GRAPH.skills;globalThis.__generate=generate',ctx);
const failures=[],reports=[];
for(const m of ctx.__skills){
 ctx.sess.questionFingerprints=[];ctx.sess.questionHistory=[];const archetypes=new Set(),representations=new Set(),demands=new Set();let previous='';
 for(let i=0;i<15;i++){
  try{
   const q=ctx.__generate(m.id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1});
   assert(q&&q.prompt&&q.answer!==undefined,'missing question');assert.equal(q.wrong.length,3,'wrong option count');
   assert.equal(new Set([q.answer,...q.wrong.map(x=>x.v)].map(String)).size,4,'duplicate options');
   assert(q.archetypeId&&q.representation&&q.demand,'missing archetype metadata');
   if(previous===q.archetypeId)failures.push({id:m.id,type:'consecutive-archetype',archetype:q.archetypeId});previous=q.archetypeId;
   archetypes.add(q.archetypeId);representations.add(q.representation);demands.add(q.demand);
  }catch(e){failures.push({id:m.id,type:'exception',error:e.message});break;}
 }
 if(archetypes.size<3)failures.push({id:m.id,type:'low-variety',count:archetypes.size,values:[...archetypes]});
 if(!m.textbookUnit||!m.textbookUnitTitle)failures.push({id:m.id,type:'missing-kssr-mapping'});
 reports.push({id:m.id,archetypes:archetypes.size,representations:representations.size,demands:demands.size});
}
const required=['D3.PERCENT','D3.POSITION','D4.PERCENT','D4.COORD','D4.RATIO','D4.RATE','D5.ADD','D5.SUB','D5.OPS','D5.RATIO','D5.RATE','D6.PROB'];
for(const id of required)assert(ctx.__skills.some(x=>x.id===id),`missing verified coverage skill ${id}`);
const summary={status:failures.length?'fail':'pass',skills:ctx.__skills.length,samples:ctx.__skills.length*15,minimumArchetypes:Math.min(...reports.map(x=>x.archetypes)),coverageSkillsAdded:required.length,failures};
fs.writeFileSync(path.join(__dirname,'kssr-variety-v3.9.0-report.json'),JSON.stringify({summary,reports},null,2));console.log(JSON.stringify(summary,null,2));process.exitCode=failures.length?1:0;
