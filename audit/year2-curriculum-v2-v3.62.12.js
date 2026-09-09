const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;global.document={readyState:'complete',documentElement:{setAttribute(){}},addEventListener(){}};global.sess={questionHistory:[],retryState:null};
global.PAQuestionBanks={};for(let i=1;i<=8;i++)PAQuestionBanks['d2t'+i]=(id,s)=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy',false,false);
global.PAContentIntegrity={requirements:{}};global.db={skills:{}};global.scoreState=id=>db.skills[id]||(db.skills[id]={mastery:50,evidence:0,correct:0,wrong:0,confidence:50,competencies:{}});global.recordFrontierResponse=function(){};
vm.runInThisContext(fs.readFileSync('questions/helpers.js','utf8'),{filename:'helpers.js'});
for(const file of [
 'data/kssr/year2-competencies-v2.js',
 'questions/kssr-year2-v2-runtime-v3.62.12.js',
 'questions/kssr-year2-v2-unit1-v3.62.12.js',
 'questions/kssr-year2-v2-unit2-v3.62.12.js',
 'questions/kssr-year2-v2-unit34-v3.62.12.js',
 'questions/kssr-year2-v2-unit56-v3.62.12.js',
 'questions/kssr-year2-v2-unit78-v3.62.12.js',
 'questions/kssr-year2-curriculum-v2-v3.62.12.js',
 'questions/kssr-year2-adaptive-v3.62.12.js',
 'js/game-question-interactions-v3.62.4.js'
])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});

const C=PAY2CompetencyV2,RT=PAY2V2Runtime;
const expected=[
'1.1.1','1.1.2','1.2.1','1.3.1','1.3.2','1.4.1','1.4.2','1.5.1','1.6.1','1.7.1','1.7.2','1.8.1',
'2.1.1','2.1.2','2.2.1','2.2.2','2.3.1','2.3.2','2.4.1','2.4.2','2.5.1','2.5.2',
'3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.2.1','3.2.2','3.2.3','3.2.4','3.2.5','3.2.6','3.3.1','3.4.1',
'4.1.1','4.1.2','4.2.1','4.2.2','4.3.1','4.3.2','4.4.1','4.5.1','4.6.1','4.7.1',
'5.1.1','5.1.2','5.1.3','5.1.4','5.2.1','5.3.1',
'6.1.1','6.1.2','6.1.3','6.2.1','6.2.2','6.2.3','6.3.1','6.3.2','6.3.3','6.4.1',
'7.1.1','7.1.2','7.1.3','7.2.1','7.2.2','7.3.1',
'8.1.1','8.2.1','8.3.1'];
assert.equal(C.version,'2.0.0','Year 2 competency map version drift');
assert.equal(C.uniqueStandardCount,70,'Year 2 must expose all 70 unique learning standards');
assert.deepEqual(C.nodes.map(x=>x.id).sort(),[...expected].sort(),'Year 2 DSKP SP list drift');
assert.equal(C.activeSkills.length,46,'existing 46 D2 skill IDs must remain backward-compatible');
assert.equal(Object.keys(RT.GEN).length,70,'every Year 2 SP needs a generator');
assert.equal(PAY2CurriculumV2.generatorCount,70,'finalized bank generator count drift');
for(const id of C.activeSkills)assert.deepEqual(PAContentIntegrity.requirements[id],C.routes[id].map(node=>[node]),id+' integrity route is not SP-level');

let samples=0,local=0,stickers=0,weekDrift=0,reasoningUnits=new Set(),repEvidence=0,drawEvidence=0,estimateEvidence=0;
const nodeModes={};
for(const node of C.nodes){
 const fn=RT.GEN[node.id];assert.equal(typeof fn,'function',node.id+' generator missing');
 const modes=new Set();
 for(let i=0;i<45;i++){
   global.sess={questionHistory:[],retryState:null};
   const out=fn(node.owner,{mastery:82,evidence:8,confidence:75,wrong:0},false);
   assert(out,node.id+' null question');assert.equal(out.standardRef,node.id,node.id+' standardRef mismatch');assert.equal(out.competencyId,node.id,node.id+' competencyId mismatch');assert.equal(out.subcompetencyId,node.id,node.id+' subcompetencyId mismatch');
   assert(Array.isArray(out.wrong)&&out.wrong.length===3,node.id+' must have exactly three distractors');
   const keys=[semanticChoiceKey(out.answer),...out.wrong.map(x=>semanticChoiceKey(x.label??x.v))];assert.equal(new Set(keys).size,4,node.id+' duplicate/semantically equivalent choices');
   modes.add(out.archetypeId);if(out.demand==='reasoning')reasoningUnits.add(node.unit);
   const t=String(out.prompt||'');if(/kantin|pasar pagi|kedai runcit|koperasi|bas|rambutan|karipap|pau|roti canai|kuih|nasi lemak|Ringgit Malaysia|Malaysia/i.test(t))local++;
   if(/pelekat/i.test(t))stickers++;if(node.id==='5.2.1'&&/minggu|week/i.test(t+' '+out.answer))weekDrift++;
   if(['3.1.3','3.2.3','3.2.4'].includes(node.id)&&/representation|rajah|lorek|kedudukan/i.test((out.misconceptionTargets||[]).join(' ')+' '+t))repEvidence++;
   if(node.id==='7.2.2'&&(out.misconceptionTargets||[]).includes('shape_draw'))drawEvidence++;
   if(['1.5.1','6.1.3','6.2.3','6.3.3'].includes(node.id)&&(out.misconceptionTargets||[]).includes('estimate'))estimateEvidence++;
   samples++;
 }
 nodeModes[node.id]=modes.size;assert(modes.size>=1,node.id+' has no effective archetype');
 for(let i=0;i<12;i++){
   global.sess={questionHistory:[],retryState:null};const out=fn(node.owner,{mastery:10,evidence:0,confidence:10,wrong:0},false);
   assert(out.demand!=='reasoning',node.id+' foundation learner received reasoning too early');
 }
}
for(let unit=1;unit<=8;unit++)assert(reasoningUnits.has(unit),'Unit '+unit+' has no reasoning ceiling');
assert(local>=120,'Malaysian child-life contexts are too rare');assert.equal(stickers,0,'Year 2 v2 reintroduced repetitive sticker stories');assert.equal(weekDrift,0,'5.2.1 drifted into week-to-day conversion outside verified Year 2 scope');
assert(repEvidence>0,'fraction/decimal representation SPs do not expose representation evidence');assert(drawEvidence>0,'7.2.2 drawing SP has no drawing-construction evidence');assert(estimateEvidence>0,'Year 2 estimation SP evidence missing');

for(const skill of C.activeSkills){
 const route=C.routes[skill],target=route[Math.floor(route.length/2)],state={competencies:{}};
 for(const n of route)state.competencies[n]={attempts:2,correct:2,clean:n===target?0:1};
 assert.equal(PAY2Adaptive.choosePersistentNode(skill,state),target,skill+' adaptive router did not prioritise least-proven SP');
}
const evidenceSkill='D2.1.1',evidenceNode='1.1.1',evidenceQ=RT.GEN[evidenceNode](evidenceSkill,{mastery:50,evidence:2,confidence:50},false);db.skills[evidenceSkill]={competencies:{}};global.sess={questionHistory:[],retryState:null};window.recordFrontierResponse(evidenceSkill,true,4,false,evidenceQ);assert.equal(db.skills[evidenceSkill].competencies[evidenceNode].clean,1,'clean independent SP evidence not recorded');global.sess.retryState={};window.recordFrontierResponse(evidenceSkill,true,4,false,evidenceQ);assert.equal(db.skills[evidenceSkill].competencies[evidenceNode].clean,1,'retry incorrectly counted as independent clean SP evidence');

let numeric=RT.GEN['2.1.1']('D2.2.1',{mastery:80,evidence:8,confidence:75},false);PAGameQuestionInteractions.prepare(numeric,{skillId:'D2.2.1',meta:{grade:2},battleTier:'minion',isBoss:false});assert.equal(numeric.interaction.type,'sigil_select','normal D2 numeric answer must stay fast 4-choice');numeric=RT.GEN['2.1.1']('D2.2.1',{mastery:80,evidence:8,confidence:75},false);PAGameQuestionInteractions.prepare(numeric,{skillId:'D2.2.1',meta:{grade:2},battleTier:'boss',isBoss:true});assert.equal(numeric.interaction.type,'rune_entry','boss D2 numeric answer must be constructed');

console.log(`PASS Year2 curriculum v2 standards=${C.uniqueStandardCount}, generators=${Object.keys(RT.GEN).length}, skills=${C.activeSkills.length}, samples=${samples}`);
console.log(`PASS reasoningUnits=${[...reasoningUnits].sort().join(',')}, localContexts=${local}, stickers=${stickers}, weekDrift=${weekDrift}`);
console.log('PASS SP adaptive evidence + mob/boss response rule');