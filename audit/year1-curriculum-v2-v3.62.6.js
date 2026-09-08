const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;global.document={documentElement:{setAttribute(){}}};global.sess={questionHistory:[]};
global.R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;global.pick=a=>a[R(0,a.length-1)];
global.N=(v,tag)=>({v,tag,label:v});global.tidyNumber=(v,dp=2)=>Number(Number(v).toFixed(dp));
global.moneyFmtUpper=v=>`RM${Number(v).toFixed(2).replace(/\.00$/,'')}`;
global.moneyFmt=c=>c<100?`${c} sen`:`RM${Math.floor(c/100)}${c%100?'.'+String(c%100).padStart(2,'0'):''}`;
global.uniqueDigitNumber=len=>{let ds=[R(1,9)];while(ds.length<len){let d=R(0,9);if(!ds.includes(d))ds.push(d)}return Number(ds.join(''))};
global.cleanChoice=v=>String(v).replace(/\s+/g,' ').trim();
global.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{
 const seen=new Set([String(answer)]),out=[];for(const x of wrong||[]){if(x&&!seen.has(String(x.v))){seen.add(String(x.v));out.push(x)}}
 let k=1;while(out.length<3){const v=typeof answer==='number'?answer+1000+(k++):`fallback-${k++}`;if(!seen.has(String(v))){seen.add(String(v));out.push(N(v,'generated'))}}
 return{prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};
global.addQ=(a,b,ans,kind,shift)=>Q(`${a}+${b}`,ans,[N(ans+1,'operation'),N(ans-1,'operation'),N(ans+10,'operation')],'h',kind,true,shift);
global.subQ=(a,b,ans,kind,shift)=>Q(`${a}-${b}`,ans,[N(ans+1,'operation'),N(Math.max(0,ans-1),'operation'),N(a+b,'operation')],'h',kind,true,shift);
global.base10Visual=n=>`<base10>${n}</base10>`;global.clockSvg=(h,m)=>`<clock>${h}:${m}</clock>`;
global.shapeSvg=x=>`<shape>${x}</shape>`;global.barChart=(l,v)=>`<bar>${l.join(',')}:${v.join(',')}</bar>`;global.moneyVisual=c=>`<money>${c}</money>`;
global.PAQuestionBanks={d1:(id,s)=>Q('fallback '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'fallback','fallback',false,false)};
global.PAContentIntegrity={requirements:{}};
global.recordFrontierResponse=function(){};
global.scoreState=function(){return{competencies:{}}};

vm.runInThisContext(fs.readFileSync('questions/kssr-assessment-depth-v3.22.1.js','utf8'),{filename:'depth.js'});
vm.runInThisContext(fs.readFileSync('data/kssr/year1-competencies-v2.js','utf8'),{filename:'y1-map.js'});
vm.runInThisContext(fs.readFileSync('questions/kssr-year1-v2-runtime-v3.62.6.js','utf8'),{filename:'y1-runtime.js'});
for(const file of ['questions/kssr-year1-v2-unit1-v3.62.6.js','questions/kssr-year1-v2-unit2-v3.62.6.js','questions/kssr-year1-v2-unit34-v3.62.6.js','questions/kssr-year1-v2-unit56-v3.62.6.js','questions/kssr-year1-v2-unit78-v3.62.6.js'])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});
vm.runInThisContext(fs.readFileSync('questions/kssr-year1-curriculum-v2-v3.62.6.js','utf8'),{filename:'y1-final.js'});
vm.runInThisContext(fs.readFileSync('questions/kssr-year1-adaptive-v3.62.6.js','utf8'),{filename:'y1-adaptive.js'});
vm.runInThisContext(fs.readFileSync('js/game-question-interactions-v3.62.4.js','utf8'),{filename:'game-interactions.js'});

const C=PAY1CompetencyV2,RT=PAY1V2Runtime,expected=[
'1.1.1','1.2.1','1.2.2','1.3.1','1.4.1','1.5.1','1.5.2','1.6.1','1.7.1','1.8.1','1.9.1','1.9.2','1.10.1',
'2.1.1','2.1.2','2.1.3','2.2.1','2.2.2','2.3.1','2.3.2','2.4.1','2.4.2','2.5.1','2.6.2',
'3.1.1','3.2.1',
'4.1.1','4.1.2','4.1.3','4.2.1','4.2.2','4.3.1',
'5.1.1','5.1.2','5.1.3','5.1.4','5.2.1','5.2.2','5.2.3','5.3.1',
'6.1.1','6.1.2','6.1.3','6.2.1',
'7.1.1','7.1.2','7.1.3','7.1.4','7.2.1','7.2.2','7.2.3','7.2.4','7.3.1',
'8.1.1','8.2.1','8.3.1'];
assert.equal(C.uniqueStandardCount,56,'Year 1 must expose all 56 unique DSKP learning standards');
assert.deepEqual([...C.nodes.map(x=>x.id)].sort(),[...expected].sort(),'DSKP learning-standard list drift');
assert.equal(C.activeSkills.length,14,'existing 14 Year 1 skill IDs must remain backward-compatible');
assert.equal(Object.keys(RT.GEN).length,56,'every Year 1 learning standard needs a generator');
for(const id of C.activeSkills)assert.deepEqual(PAContentIntegrity.requirements[id],C.routes[id].map(node=>[node]),id+' integrity requirements not upgraded to SP level');

let samples=0,reasoningByUnit={},local=0,stickers=0,measureStandardUnitPrompt=0,timeBad=0;
for(const node of C.nodes){
 const fn=RT.GEN[node.id];assert.equal(typeof fn,'function',node.id+' generator missing');
 let nodeArchetypes=new Set(),nodeReason=0;
 for(let i=0;i<45;i++){
  global.sess={questionHistory:[]};
  const q=fn(node.owner,{mastery:82,evidence:8,confidence:75,wrong:0},false);
  assert(q,node.id+' null question');assert.equal(q.standardRef,node.id,node.id+' wrong standardRef');assert.equal(q.competencyId,node.id,node.id+' wrong competencyId');
  assert(Array.isArray(q.wrong)&&q.wrong.length===3,node.id+' wrong choice count');
  const keys=[String(q.answer),...q.wrong.map(x=>String(x.v))];assert.equal(new Set(keys).size,4,node.id+' duplicate answer/choices: '+keys.join(' | '));
  nodeArchetypes.add(q.archetypeId);if(q.demand==='reasoning'){nodeReason++;reasoningByUnit[node.unit]=(reasoningByUnit[node.unit]||0)+1}
  const t=String(q.prompt||'');if(/kantin|pasar pagi|kedai runcit|bas sekolah|rambutan|karipap|pau|roti canai|kuih|Ringgit Malaysia|Malaysia/i.test(t))local++;
  if(/pelekat/i.test(t))stickers++;
  if(node.unit===6&&/\bcm\b|\bkg\b|\bmL\b|\bliter\b/i.test(t))measureStandardUnitPrompt++;
  if(node.id==='5.2.3'&&!/:(00|15|30)$/.test(String(q.answer)))timeBad++;
  samples++;
 }
 assert(nodeArchetypes.size>=2,node.id+' needs at least 2 effective archetypes at high mastery');
}
for(let unit=1;unit<=8;unit++)assert((reasoningByUnit[unit]||0)>0,'unit '+unit+' has no reasoning ceiling');
assert(local>=150,'Malaysian daily-life contexts are too rare');
assert.equal(stickers,0,'Year 1 v2 reintroduced sticker stories');
assert.equal(measureStandardUnitPrompt,0,'Year 1 measurement prompt drifted into standard units instead of non-standard units');
assert.equal(timeBad,0,'5.2.3 generated time outside hour/half/quarter-hour scope');

for(const node of C.nodes){
 for(let i=0;i<12;i++){
  global.sess={questionHistory:[]};
  const q=RT.GEN[node.id](node.owner,{mastery:10,evidence:0,confidence:10,wrong:0},false);
  assert(q.demand!=='reasoning',node.id+' foundation learner received reasoning too early');
 }
}

for(const skill of C.activeSkills){
 const route=C.routes[skill],missing=route[Math.floor(route.length/2)],state={competencies:{}};
 for(const n of route)state.competencies[n]={attempts:2,correct:2,clean:n===missing?0:1};
 assert.equal(PAY1Adaptive.choosePersistentNode(skill,state),missing,skill+' adaptive router did not target least-proven SP');
}

const numeric=RT.GEN['2.2.2']('D1.ADD100',{mastery:80,evidence:8,confidence:70},false);
PAGameQuestionInteractions.prepare(numeric,{skillId:'D1.ADD100',meta:{grade:1},battleTier:'minion',isBoss:false});
assert.equal(numeric.interaction.type,'sigil_select','normal D1 numeric battle must stay quick-choice');
const boss=RT.GEN['2.2.2']('D1.ADD100',{mastery:80,evidence:8,confidence:70},false);
PAGameQuestionInteractions.prepare(boss,{skillId:'D1.ADD100',meta:{grade:1},battleTier:'boss',isBoss:true});
assert.equal(boss.interaction.type,'rune_entry','boss D1 numeric battle must use constructed response');

console.log(`PASS Year1 curriculum v2 standards=${C.uniqueStandardCount}, generators=${Object.keys(RT.GEN).length}, samples=${samples}, localContexts=${local}`);
console.log('PASS routes='+C.activeSkills.length+', reasoningUnits='+Object.keys(reasoningByUnit).length+', stickers='+stickers);
console.log('PASS mob numeric=quick-choice; boss numeric=constructed response');
