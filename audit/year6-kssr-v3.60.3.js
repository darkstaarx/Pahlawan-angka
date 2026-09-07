// Regression audit for KSSR Year 6 cognitive-depth hardening v3.60.3
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','questions','kssr-year6-curriculum-v3.60.3.js'),'utf8');
const ids=['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.RATIO','D6.MONEY','D6.TIME','D6.MEASURE','D6.COORD','D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PIE','D6.PROB','D6.DATA_PROBLEM'];
const META=Object.fromEntries(ids.map(id=>[id,{id,grade:6}]));
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)],N=(v,tag)=>({v,label:v,tag});
const tidyNumber=(v,d=2)=>Number(Number(v).toFixed(d)),moneyFmtUpper=v=>'RM'+(Number.isInteger(Number(v))?Number(v):Number(v).toFixed(2));
const sem=v=>String(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{
 const seen=new Set([sem(answer)]),out=[];for(const x of wrong||[]){if(!seen.has(sem(x.v))){seen.add(sem(x.v));out.push(x)}}
 let k=1;while(out.length<3&&k<100){const v=typeof answer==='number'?answer+997*k:'Pilihan '+k++;if(!seen.has(sem(v))){seen.add(sem(v));out.push(N(v,'generated'))}}
 return{prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};
const ctx={console,Math,R,pick,N,Q,tidyNumber,moneyFmtUpper,META,sess:{questionHistory:[]},document:{documentElement:{setAttribute(){}}},window:{
 PAQuestionBanks:{d6:(id)=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy')},
 PAKSSRDepth:{visualHelpers:{miniTable:(h,r)=>'<table>'+r.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>',coordinateMap:(p,s)=>'<div data-scale="'+s+'">'+p.map(x=>x.label+'('+x.x+','+x.y+')').join(' ')+'</div>'}},
 PAY6KSSRRepair:{helpers:{protractorSvg:d=>'<svg data-angle="'+d+'"></svg>',regularPolygonSvg:n=>'<svg data-sides="'+n+'"></svg>',circleSvg:(m,r)=>'<svg data-circle="'+m+'" data-r="'+(r||'')+'"></svg>',pieSvg:s=>'<div>'+s.map(x=>x.label+':'+x.angle).join('|')+'</div>',bagVisual:(r,b,g=0)=>'<div>R'+r+' B'+b+' G'+g+'</div>'}}
}};
vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'kssr-year6-curriculum-v3.60.3.js'});
const states={fresh:{mastery:0,evidence:0,confidence:0,wrong:0},low:{mastery:15,evidence:2,confidence:20,wrong:1},core:{mastery:55,evidence:4,confidence:55,wrong:0},high:{mastery:90,evidence:10,confidence:85,wrong:0}},stats={};
for(const id of ids){stats[id]={};for(const [level,state] of Object.entries(states)){const arch=new Set(),dem=new Set();let bad=0;
 for(let i=0;i<1000;i++){const q=ctx.window.PAQuestionBanks.d6(id,state,false);assert(q,id+'/'+level+' null');assert.equal(q.source,'kssr-year6-v3.60.3',id+'/'+level+' source');assert.equal(q.wrong.length,3,id+'/'+level+' distractors');const opts=[q.answer,...q.wrong.map(x=>x.v)].map(sem);if(new Set(opts).size!==4)bad++;arch.add(q.archetypeId||'prior');dem.add(q.demand||'prior');const t=sem(q.prompt);
  if(id==='D6.SPACE_PROBLEM'){assert(!/dibesarkan lagi|sudut baharu/.test(t),'legacy shallow space item leaked')}
  if(id==='D6.COORD')assert(/petak|skala/.test(t),'D6 coordinate item lacks scale');
  if(id==='D6.TIME')assert(/utc|zon|kuala lumpur|tokyo|bangkok|dubai|penerbangan/.test(t),'D6 time item lacks timezone concept');
  if(id==='D6.PERCENT'&&level==='high')assert(!/%\s*[+\-−]\s*\d+\s*%/.test(t),'bare percent arithmetic leaked into high stage');
 }
 assert.equal(bad,0,id+'/'+level+' duplicate semantic options');
 if(id==='D6.TIME'&&level==='fresh'){assert(!/beza zon masa\?/.test(t),'fresh D6 time fell back to foundation timezone subtraction');assert(/apakah waktu pada masa yang sama/.test(t),'fresh D6 time did not enter core timezone conversion');}
  if(id==='D6.MONEY'&&level==='low')assert(arch.size>=5,'D6.MONEY foundation variety below 5 archetypes');
  if(id==='D6.MONEY'&&(level==='fresh'||level==='core'))assert(arch.size>=8,'D6.MONEY core variety below 8 archetypes');
  if(id==='D6.MONEY'&&level==='high')assert(arch.size>=6,'D6.MONEY high variety below 6 archetypes');
  if(level==='high')assert(dem.has('reasoning'),id+' high stage lacks reasoning');
 stats[id][level]={archetypes:arch.size,demands:[...dem]};
}}
assert.strictEqual(ctx.window.PAKSSRYear6.stage(states.fresh),2,'fresh D6 must enter core stage 2');
assert.strictEqual(ctx.window.PAKSSRYear6.stage({mastery:8,evidence:1,confidence:6,wrong:0}),2,'one correct must remain core stage 2');
assert.strictEqual(ctx.window.PAKSSRYear6.stage({mastery:0,evidence:1,confidence:0,wrong:1}),1,'first-attempt wrong should unlock foundation stage 1');
assert.strictEqual(ctx.window.PAKSSRYear6.stage({mastery:90,evidence:10,confidence:85,wrong:0}),3,'strong evidence must reach reasoning stage 3');

// Money bank must rotate broad KSSR coverage instead of repeating one semantic form.
for(const [label,state,min] of [['low',states.low,5],['core',states.core,8],['high',states.high,6]]){
 ctx.sess.questionHistory=[];
 const seen=new Set();let last=null;
 for(let i=0;i<30;i++){
  const q=ctx.window.PAQuestionBanks.d6('D6.MONEY',state,false);
  assert.notStrictEqual(q.archetypeId,last,'D6.MONEY '+label+' repeated archetype immediately');
  last=q.archetypeId;seen.add(q.archetypeId);
  ctx.sess.questionHistory.push({skillId:'D6.MONEY',archetypeId:q.archetypeId});
 }
 assert(seen.size>=min,'D6.MONEY '+label+' rotation coverage below '+min);
}

assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.AREA',states.high),null,'retired D6.AREA leaked');
assert.strictEqual(ctx.window.PAQuestionBanks.d6('D6.DATA',states.high),null,'retired D6.DATA leaked');
for(const id of ids){assert(META[id].textbookUnit,'missing unit '+id);assert(META[id].kssrStandards?.length,'missing standards '+id)}
console.log(JSON.stringify({status:'PASS',samplesPerSkillPerStage:1000,totalSamples:ids.length*4*1000,stats},null,2));