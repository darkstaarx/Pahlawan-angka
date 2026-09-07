// Regression audit — Year 6 Money Real-KSSR Bank v3.60.5
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const roots=[
 'questions/kssr-assessment-depth-v3.22.0.js',
 'questions/kssr-year6-space-data-v3.23.0.js',
 'questions/kssr-year6-curriculum-v3.60.3.js',
 'questions/kssr-year6-experience-v3.60.4.js',
 'questions/kssr-year6-money-real-v3.60.5.js'
].map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)],N=(v,tag)=>({v,label:v,tag});
const tidyNumber=(v,d=2)=>Number(Number(v).toFixed(d)),moneyFmtUpper=v=>'RM'+(Number.isInteger(Number(v))?Number(v):Number(v).toFixed(2));
const sem=v=>String(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{
 const seen=new Set([sem(answer)]),out=[];
 for(const x of wrong||[]){const val=x?.v??x;if(!seen.has(sem(val))){seen.add(sem(val));out.push(typeof x==='object'?x:N(val,'generated'))}}
 let k=1;while(out.length<3&&k<100){const v=typeof answer==='number'?answer+997*k:'Pilihan '+k++;if(!seen.has(sem(v))){seen.add(sem(v));out.push(N(v,'generated'))}}
 return{prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};
const ids=['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.MONEY','D6.TIME','D6.MEASURE','D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.COORD','D6.RATIO','D6.PIE','D6.PROB','D6.DATA_PROBLEM'];
const META=Object.fromEntries(ids.map(id=>[id,{id,grade:6}])),sess={questionHistory:[],questionFingerprints:[]};
const ctx={console,Math,R,pick,N,Q,tidyNumber,moneyFmtUpper,META,sess,barChart:(l,v)=>'<div>'+l.map((x,i)=>x+':'+v[i]).join('|')+'</div>',document:{documentElement:{setAttribute(){}}},window:{PAQuestionBanks:{d6:(id)=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy')},sess}};
vm.createContext(ctx);roots.forEach((src,i)=>vm.runInContext(src,ctx,{filename:['depth','space','curriculum','experience','money-real'][i]+'.js'}));
assert.equal(ctx.window.PAY6MoneyReal?.version,'3.60.5','money real wrapper inactive');
const states={low:{mastery:15,evidence:2,confidence:20,wrong:1},core:{mastery:55,evidence:4,confidence:55,wrong:0},high:{mastery:90,evidence:10,confidence:85,wrong:0},fresh:{mastery:0,evidence:0,confidence:0,wrong:0}};
const expected={low:12,core:24,high:20,fresh:24},stats={};let total=0;
for(const [level,state] of Object.entries(states)){
 sess.questionHistory=[];const arch=new Set(),prompts=new Set(),reps=new Set();
 for(let i=0;i<4000;i++){
  const q=ctx.window.PAQuestionBanks.d6('D6.MONEY',state,false);assert(q,level+' null');
  assert.equal(q.source,'kssr-year6-money-real-v3.60.5',level+' source');
  assert.equal(q.wrong.length,3,level+' distractor count');
  assert(!String(q.prompt).includes('undefined')&&!String(q.prompt).includes('NaN'),level+' bad prompt');
  assert(!String(q.answer).includes('undefined')&&!String(q.answer).includes('NaN'),level+' bad answer');
  const opts=[q.answer,...q.wrong.map(x=>x.v)].map(sem);assert.equal(new Set(opts).size,4,level+' duplicate options '+q.archetypeId);
  if(level==='high')assert.equal(q.demand,'reasoning','high demand '+q.archetypeId);
  if(level==='core'||level==='fresh')assert.equal(q.demand,'application',level+' demand '+q.archetypeId);
  arch.add(q.archetypeId);prompts.add(sem(q.prompt));reps.add(q.representation);
  sess.questionHistory.push({skillId:'D6.MONEY',archetypeId:q.archetypeId});if(sess.questionHistory.length>60)sess.questionHistory.shift();total++;
 }
 assert.equal(arch.size,expected[level],level+' archetype breadth');
 stats[level]={archetypes:arch.size,uniquePrompts:prompts.size,representations:[...reps]};
}
for(const [level,state] of Object.entries(states)){
 sess.questionHistory=[];let last=null;
 for(let i=0;i<300;i++){
  const q=ctx.window.PAQuestionBanks.d6('D6.MONEY',state,false);
  assert.notEqual(q.archetypeId,last,level+' immediate repeat '+last);
  last=q.archetypeId;sess.questionHistory.push({skillId:'D6.MONEY',archetypeId:last});if(sess.questionHistory.length>60)sess.questionHistory.shift();
 }
}
const other=ctx.window.PAQuestionBanks.d6('D6.TIME',states.core,false);
assert.equal(other?.kssrExperienceVersion,'3.60.4','non-money D6 delegation changed');
console.log(JSON.stringify({status:'PASS',version:'3.60.5',samples:total,stats,immediateRepeat:'PASS',otherD6Delegation:'PASS'},null,2));