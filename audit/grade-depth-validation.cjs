const fs=require('fs'),assert=require('assert'),vm=require('vm');
const {runtime}=require('./grade-depth-runtime.cjs');
const {ctx}=runtime();const results=[],strong={mastery:85,evidence:20,confidence:80,correct:18,wrong:2},beginner={mastery:20,evidence:1,confidence:25,correct:1,wrong:0};
let samples=0;
for(const meta of ctx.auditSkills){
 const demands={},modes=new Set(),nodes=new Set();
 for(const state of [beginner,strong]){
  ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];ctx.sess.mode='practice';
  for(let i=0;i<32;i++){
   const q=ctx.auditGenerate(meta.id,state);samples++;
   assert(q&&q.prompt&&q.answer!==undefined,meta.id+' missing question');
   assert(!/undefined|NaN|Infinity/.test(q.prompt),meta.id+' broken question');
   assert.equal(q.wrong.length,3,meta.id+' choice count');
   const explicitForm=/termudah|ringkas|nombor bercampur|pecahan tak wajar/i.test(q.prompt);
   const key=v=>explicitForm||q.source==='qsv2'?String(v).trim():ctx.semanticChoiceKey(v);
   const options=[q.answer,...q.wrong.map(x=>x.v)].map(key);
   assert.equal(new Set(options).size,4,meta.id+' equivalent options '+JSON.stringify({template:q.templateId,prompt:q.prompt.replace(/<[^>]*>/g,' '),answer:q.answer,wrong:q.wrong,options}));
   if(state===strong){demands[q.demand||'unknown']=(demands[q.demand||'unknown']||0)+1;modes.add(q.archetypeId);if(q.subcompetencyId)nodes.add(q.subcompetencyId);}
   if(meta.id==='D2.3.2'&&typeof q.answer==='number')assert(q.answer>=0&&q.answer<=1);
   if(meta.id==='D2.3.2'&&q.archetypeId==='progress_decimal_read')assert(!q.prompt.replace(/<[^>]*>/g,'').includes(q.answer));
   if(meta.id==='D3.DEC'&&/progress_decimal|depth_add/.test(q.archetypeId||''))assert(Number(q.answer)>0&&Number(q.answer)<=.99,'D3 decimal outside range');
  }
 }
 assert((demands.application||0)+(demands.reasoning||0)>0,meta.id+' still basic-only for a strong pupil');
 results.push({id:meta.id,grade:meta.grade,archetypes:modes.size,curriculumNodes:nodes.size,demands});
}
// Historic mistakes must not lock a now-secure D6 learner at foundation.
assert.equal(ctx.PAKSSRYear6.stage(strong),3);
assert.equal(ctx.PAKSSRYear6.stage({mastery:25,evidence:8,confidence:20,wrong:5}),1);
// Selection targets have a retrieval slot, and do not send a struggling pupil to reasoning.
ctx.sess.questionHistory=[];ctx.sess.mode='recover';assert.equal(ctx.questionDepthTarget('D2.3.2',strong),1);
ctx.sess.mode='practice';assert.equal(ctx.questionDepthTarget('D2.3.2',strong),4);
ctx.sess.questionHistory=Array.from({length:4},()=>({skillId:'D2.3.2'}));assert.equal(ctx.questionDepthTarget('D2.3.2',strong),2);
// The dispatcher records real node IDs so Y1/Y6 coverage can rotate across standards.
ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];
for(let i=0;i<24;i++)ctx.auditGenerate('D1.N100',strong);
assert(ctx.sess.questionHistory.every(x=>x.subcompetencyId),'Y1 node metadata lost');
assert(new Set(ctx.sess.questionHistory.map(x=>x.subcompetencyId)).size>2,'Y1 node rotation stuck');
const byGrade=Array.from({length:6},(_,i)=>{const xs=results.filter(x=>x.grade===i+1);return {grade:i+1,skills:xs.length,advanced:xs.reduce((z,x)=>z+(x.demands.application||0)+(x.demands.reasoning||0),0),strongSamples:xs.length*32,basicOnly:xs.filter(x=>!x.demands.application&&!x.demands.reasoning).length}});
fs.writeFileSync('audit/grade-depth-report.json',JSON.stringify({status:'pass',samples,byGrade,skills:results},null,2)+'\n');
console.log(JSON.stringify({status:'pass',samples,byGrade},null,2));
