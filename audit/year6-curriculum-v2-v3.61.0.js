// Regression audit — Year 6 KSSR Curriculum Bank v2 v3.61.0
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const load=[
 'questions/kssr-assessment-depth-v3.22.0.js',
 'questions/kssr-year6-space-data-v3.23.0.js',
 'questions/kssr-year6-curriculum-v3.60.3.js',
 'questions/kssr-year6-experience-v3.60.4.js',
 'questions/kssr-year6-money-real-v3.60.5.js',
 'data/kssr/year6-competencies-v2.js',
 'questions/kssr-year6-v2-runtime-v3.61.0.js',
 'questions/kssr-year6-v2-unit1-v3.61.0.js',
 'questions/kssr-year6-v2-unit2-v3.61.0.js',
 'questions/kssr-year6-v2-unit45-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-angle-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-circle-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-space-v3.61.0.js',
 'questions/kssr-year6-v2-unit7-v3.61.0.js',
 'questions/kssr-year6-v2-unit8-v3.61.0.js',
 'questions/kssr-year6-curriculum-v2-v3.61.0.js',
 'questions/kssr-year6-adaptive-v3.61.1.js'
];
const sources=load.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
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
const META=Object.fromEntries(ids.map(id=>[id,{id,grade:6}]));
const sess={questionHistory:[],questionFingerprints:[]};
const requirements={
 'D6.NUMBERS':[['large_sequence']], 'D6.OPS':[['combined_missing']],
 'D6.FRAC':[['fraction_operation']], 'D6.RATIO':[['ratio_simplify']],
 'D6.MONEY':[['budget_multistep']], 'D6.TIME':[['speed_time']]
};
const requirementStatus=(id,bucket)=>{const groups=requirements[id]||[],missing=groups.filter(group=>!group.some(mode=>Number(bucket?.[mode]?.clean||0)>0));return{ok:missing.length===0,missing}};
const ctx={console,Math,R,pick,N,Q,tidyNumber,moneyFmtUpper,META,sess,barChart:(l,v)=>'<div>'+l.map((x,i)=>x+':'+v[i]).join('|')+'</div>',document:{documentElement:{setAttribute(){}}},window:{PAQuestionBanks:{d6:(id)=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy')},PAContentIntegrity:{requirements,requirementStatus},sess}};
ctx.PAContentIntegrity=ctx.window.PAContentIntegrity;
vm.createContext(ctx);sources.forEach((src,i)=>vm.runInContext(src,ctx,{filename:load[i]}));

assert.equal(ctx.window.PAY6CompetencyV2?.uniqueStandardCount,38,'Year 6 competency map must have exactly 38 unique SP');
assert.equal(ctx.window.PAY6CompetencyV2?.nodes?.length,38,'Year 6 node list must contain 38 SP');
assert.equal(ctx.window.PAY6CompetencyV2?.activeSkills?.length,16,'outward D6 skill count changed');
assert.equal(ctx.window.PAY6CurriculumV2?.generatorCount,33,'non-Money generator count must be 33');
assert.equal(ctx.window.PAY6CurriculumV2?.version,'3.61.0','v2 finalizer inactive');
assert.equal(ctx.window.PAY6Adaptive?.version,'3.61.1','competency-level adaptive patch inactive');
for(const id of ids)assert.deepEqual(ctx.window.PAContentIntegrity.requirements[id],ctx.window.PAY6CompetencyV2.routes[id].map(node=>[node]),id+' integrity requirements do not match curriculum route');

const states={fresh:{mastery:0,evidence:0,confidence:0,wrong:0},low:{mastery:15,evidence:2,confidence:20,wrong:1},core:{mastery:55,evidence:4,confidence:55,wrong:0},high:{mastery:90,evidence:10,confidence:85,wrong:0}};
const allNodes=new Set(),stats={};let total=0;
for(const id of ids){
 stats[id]={};
 for(const [level,state] of Object.entries(states)){
  sess.questionHistory=[];const nodes=new Set(),arch=new Set(),prompts=new Set();
  for(let i=0;i<1500;i++){
   const q=ctx.window.PAQuestionBanks.d6(id,state,false);
   assert(q,id+'/'+level+' null');
   assert(!String(q.prompt).includes('undefined')&&!String(q.prompt).includes('NaN'),id+'/'+level+' invalid prompt '+q.archetypeId);
   assert(!String(q.answer).includes('undefined')&&!String(q.answer).includes('NaN'),id+'/'+level+' invalid answer '+q.archetypeId);
   assert.equal(q.wrong.length,3,id+'/'+level+' distractor count '+q.archetypeId);
   assert.equal(new Set([q.answer,...q.wrong.map(x=>x.v)].map(sem)).size,4,id+'/'+level+' semantic duplicate '+q.archetypeId);
   assert(q.subcompetencyId&&ctx.window.PAY6CompetencyV2.byId[q.subcompetencyId],id+'/'+level+' invalid curriculum node '+q.subcompetencyId);
   const node=ctx.window.PAY6CompetencyV2.byId[q.subcompetencyId];
   assert.equal(q.curriculumUnit,node.unit,id+'/'+level+' incorrect curriculum unit '+q.archetypeId);
   if(level==='high'&&id!=='D6.MONEY')assert.equal(q.demand,'reasoning',id+' high item not reasoning '+q.archetypeId);
   if(id==='D6.MONEY')assert.equal(q.kssrMoneyRealVersion,'3.60.5','Money v3.60.5 delegation changed');
   nodes.add(q.subcompetencyId);allNodes.add(q.subcompetencyId);arch.add(q.archetypeId);prompts.add(sem(q.prompt));total++;
   sess.questionHistory.push({skillId:id,competencyId:q.competencyId,archetypeId:q.archetypeId,source:q.source,representation:q.representation,demand:q.demand,difficultyBand:q.difficultyBand});
   if(sess.questionHistory.length>60)sess.questionHistory.shift();
  }
  stats[id][level]={nodes:nodes.size,archetypes:arch.size,uniquePrompts:prompts.size};
 }
}
const missing=ctx.window.PAY6CompetencyV2.nodes.map(n=>n.id).filter(n=>!allNodes.has(n));
assert.deepEqual(missing,[],'unreachable Year 6 standards: '+missing.join(', '));
assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.AREA',states.high),null,'retired D6.AREA leaked');
assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.DATA',states.high),null,'retired D6.DATA leaked');

// Structural guards against the exact shallow patterns found during research.
assert(stats['D6.NUMBERS'].core.archetypes>=20,'D6.NUMBERS core breadth regressed');
assert(stats['D6.PERCENT'].core.archetypes>=18,'D6.PERCENT core breadth regressed');
assert(stats['D6.TIME'].core.archetypes>=14,'D6.TIME core breadth regressed');
assert(stats['D6.RATIO'].core.archetypes>=17,'D6.RATIO core breadth regressed');
assert(stats['D6.PROB'].core.archetypes>=10,'D6.PROB core breadth regressed');
assert(stats['D6.MONEY'].core.archetypes>=24,'D6.MONEY benchmark breadth regressed');

// Persistent evidence, not just current-session history, must choose the one
// curriculum node that still lacks clean proof. This is the core v3.61.1 fix.
for(const id of ids){
 const route=ctx.window.PAY6CompetencyV2.routes[id],target=route.at(-1);
 const competencies=Object.fromEntries(route.slice(0,-1).map(node=>[node,{attempts:2,correct:2,clean:1}]));
 const state={...states.core,competencies};sess.questionHistory=[];
 const q=ctx.window.PAQuestionBanks.d6(id,state,false);
 assert.equal(q.adaptiveTargetNode,target,id+' did not target the unproven curriculum node');
 assert.equal(q.subcompetencyId,target,id+' generated the wrong targeted curriculum node');
 assert.equal(q.adaptiveTargetMatched,true,id+' failed to match its persistent target');
}
for(const target of ctx.window.PAY6CompetencyV2.routes['D6.MONEY']){
 const route=ctx.window.PAY6CompetencyV2.routes['D6.MONEY'];
 const competencies=Object.fromEntries(route.filter(node=>node!==target).map(node=>[node,{attempts:2,correct:2,clean:1}]));
 sess.questionHistory=[];const q=ctx.window.PAQuestionBanks.d6('D6.MONEY',{...states.low,competencies},false);
 assert.equal(q.subcompetencyId,target,'low-stage Money could not calibrate missing '+target);
}

// Every skill must escape an immediate archetype repeat under dispatcher-like retries.
for(const id of ids)for(const level of ['fresh','low','core','high']){
 const state=states[level];sess.questionHistory=[];let last=null;
 for(let n=0;n<80;n++){
  let q=null;for(let a=0;a<16;a++){q=ctx.window.PAQuestionBanks.d6(id,state,false);if(!last||q.archetypeId!==last)break}
  assert(!last||q.archetypeId!==last,id+'/'+level+' immediate-repeat lock '+last);
  last=q.archetypeId;sess.questionHistory.push({skillId:id,competencyId:q.competencyId,archetypeId:last});if(sess.questionHistory.length>60)sess.questionHistory.shift();
 }
}

// Unit 8 visual/data guards.
sess.questionHistory=[];
let sawValuePie=false,sawFractionalRatio=false;
for(let i=0;i<5000;i++){
 const q=ctx.window.PAQuestionBanks.d6('D6.PIE',states.core,false);
 if(q.archetypeId.endsWith('_read_quantity')){
   sawValuePie=true;
   assert(/>24<|>18<|>12<|>40<|>20<|>30</.test(String(q.prompt)),'quantity-reading pie does not visibly show values');
 }
 if(q.archetypeId.endsWith('_compare')&&Number(q.answer)%1!==0){
   sawFractionalRatio=true;assert.equal(Number(q.answer),2.5,'fractional pie ratio rounded incorrectly');
 }
 sess.questionHistory.push({skillId:'D6.PIE',competencyId:q.competencyId,archetypeId:q.archetypeId});if(sess.questionHistory.length>60)sess.questionHistory.shift();
}
assert(sawValuePie,'did not exercise value-display pie item');
assert(sawFractionalRatio,'did not exercise fractional pie ratio item');

// Unit 4 must retain authentic half-hour zones and school-style duration wording.
const timeSrc=fs.readFileSync(path.join(__dirname,'..','questions/kssr-year6-v2-runtime-v3.61.0.js'),'utf8')+fs.readFileSync(path.join(__dirname,'..','questions/kssr-year6-v2-unit45-v3.61.0.js'),'utf8');
assert(/New Delhi/.test(timeSrc)&&/Darwin/.test(timeSrc),'half-hour timezone cities missing');
assert(/jam.*minit/.test(timeSrc),'school-style hour/minute duration formatter missing');
assert(!/Math\.abs\(c\.offset\/60\)\+'\s*jam'/.test(timeSrc),'decimal-hour UTC wording regressed');

console.log(JSON.stringify({status:'PASS',version:'3.61.0',samples:total,uniqueStandards:allNodes.size,missing,stats,immediateRepeatEscape:'PASS',unit8VisualGuard:'PASS',halfHourTimeGuard:'PASS'},null,2));
