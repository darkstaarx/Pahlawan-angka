// Regression audit — Year 6 Question Experience Hardening v3.60.4
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const roots=[
  'questions/kssr-assessment-depth-v3.22.0.js',
  'questions/kssr-year6-space-data-v3.23.0.js',
  'questions/kssr-year6-curriculum-v3.60.3.js',
  'questions/kssr-year6-experience-v3.60.4.js'
].map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const ids=['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.MONEY','D6.TIME','D6.MEASURE','D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.COORD','D6.RATIO','D6.PIE','D6.PROB','D6.DATA_PROBLEM'];
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)],N=(v,tag)=>({v,label:v,tag});
const tidyNumber=(v,d=2)=>Number(Number(v).toFixed(d)),moneyFmtUpper=v=>'RM'+(Number.isInteger(Number(v))?Number(v):Number(v).toFixed(2));
const sem=v=>String(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{
  const seen=new Set([sem(answer)]),out=[];
  for(const x of wrong||[]){const val=x?.v??x;if(!seen.has(sem(val))){seen.add(sem(val));out.push(typeof x==='object'?x:N(val,'generated'))}}
  let k=1;while(out.length<3&&k<100){const v=typeof answer==='number'?answer+997*k:'Pilihan '+k++;if(!seen.has(sem(v))){seen.add(sem(v));out.push(N(v,'generated'))}}
  return{prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};
const META=Object.fromEntries(ids.map(id=>[id,{id,grade:6}]));
const sess={questionHistory:[],questionFingerprints:[]};
const ctx={console,Math,R,pick,N,Q,tidyNumber,moneyFmtUpper,META,sess,barChart:(l,v)=>'<div>'+l.map((x,i)=>x+':'+v[i]).join('|')+'</div>',document:{documentElement:{setAttribute(){}}},window:{PAQuestionBanks:{d6:(id)=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy')},sess}};
vm.createContext(ctx);roots.forEach((src,i)=>vm.runInContext(src,ctx,{filename:['depth','space','curriculum','experience'][i]+'.js'}));
assert.equal(ctx.window.PAY6QuestionExperience?.version,'3.60.4','experience wrapper inactive');
const states={fresh:{mastery:0,evidence:0,confidence:0,wrong:0},low:{mastery:15,evidence:2,confidence:20,wrong:1},core:{mastery:55,evidence:4,confidence:55,wrong:0},high:{mastery:90,evidence:10,confidence:85,wrong:0}};
const stats={};let total=0;
for(const id of ids){
  stats[id]={};
  for(const [level,state] of Object.entries(states)){
    sess.questionHistory=[];const arch=new Set();
    for(let i=0;i<1000;i++){
      const q=ctx.window.PAQuestionBanks.d6(id,state,false);assert(q,id+'/'+level+' null');
      assert.equal(q.wrong.length,3,id+'/'+level+' distractors');
      const opts=[q.answer,...q.wrong.map(x=>x.v)].map(sem);assert.equal(new Set(opts).size,4,id+'/'+level+' duplicate options '+q.archetypeId);
      const t=sem(q.prompt);
      if(level==='high')assert.equal(q.demand,'reasoning',id+' high demand');
      if(id==='D6.TIME'&&level==='fresh')assert(!/beza zon masa\?$/.test(t),'fresh time fell to subtraction-only template');
      if(id==='D6.SPACE_PROBLEM')assert(!/dibesarkan lagi|sudut baharu/.test(t),'legacy shallow space leaked');
      if(id==='D6.PERCENT'&&level==='high')assert(!/%\s*[+\-−]\s*\d+\s*%/.test(t),'bare percent arithmetic leaked high');
      arch.add(q.archetypeId||'legacy');sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId||'legacy'});if(sess.questionHistory.length>60)sess.questionHistory.shift();total++;
    }
    stats[id][level]=arch.size;
  }
  assert(stats[id].fresh>=5,id+' fresh breadth '+stats[id].fresh);
  assert(stats[id].low>=3,id+' recovery breadth '+stats[id].low);
  assert(stats[id].core>=5,id+' core breadth '+stats[id].core);
  assert(stats[id].high>=5,id+' high breadth '+stats[id].high);
}
for(const id of ids)for(const level of ['fresh','low','core','high']){
  const state=states[level];sess.questionHistory=[];let last=null;
  for(let n=0;n<60;n++){
    let q=null;for(let a=0;a<16;a++){q=ctx.window.PAQuestionBanks.d6(id,state,false);if(!last||q.archetypeId!==last)break}
    assert(!last||q.archetypeId!==last,id+'/'+level+' repeat lock');last=q.archetypeId;sess.questionHistory.push({skillId:id,archetypeId:last});if(sess.questionHistory.length>60)sess.questionHistory.shift();
  }
}
assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.AREA',states.high),null,'retired D6.AREA leaked');
assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.DATA',states.high),null,'retired D6.DATA leaked');
console.log(JSON.stringify({status:'PASS',version:'3.60.4',samples:total,breadth:stats,immediateRepeatEscape:'PASS'},null,2));
