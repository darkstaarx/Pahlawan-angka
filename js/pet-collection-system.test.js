const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
/* Production graph source is JSON. Tests resolve from this file so cwd does not
   change what curriculum sizes the proportional rescue formula reads. */
global.GRAPH=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','kssr','knowledge-graph.json'),'utf8'));
const pets=require('./pet-collection-system.js');

function fresh(){return {schoolGrade:1,coins:7,xp:19,skills:{'D1.N20':{mastery:30}}};}
function assigned(data,id,skill='D1.N20'){const run={id,gembok:true,route:'manual'};assert.ok(pets.assignGembokRescue(data,run,skill));run.completed=true;return run;}

test('actual knowledge graph gives D1 fourteen unique skills and proportional Kura threshold ten',()=>{
 assert.equal(pets.graphSkillCount(1),14);
 assert.equal(pets.rescueThreshold('ketupatKura',1),10);
 assert.equal(pets.rescueThreshold('kumbangManggis',1),14);
 assert.equal(pets.rescueThreshold('harimauBunga',1),20);
});

test('skill based per-grade rotation previews multiple pets without RNG',()=>{
 const data=fresh(),seen=[];
 for(let i=0;i<5;i++)seen.push(pets.assignGembokRescue(data,{id:`a${i}`,gembok:true},'D1.N20').petId);
 assert.equal(new Set(seen).size,5);
 assert.equal(data.petRescueRotation[1],5);
});

test('one completed run increments only its assigned pet and never tames Kura',()=>{
 const data=fresh(),run=assigned(data,'one');
 const id=run.rescuePetId,result=pets.awardGembokCompletion(data,run,{now:100});
 assert.equal(result.awarded,true);assert.equal(data.petCollection[id].rescues,1);
 assert.equal(data.petCollection[id].state,'encountered');
 assert.equal(Object.values(data.petCollection).filter(p=>p.rescues).length,1);
 assert.equal(data.coins,7);assert.equal(data.xp,19);assert.equal(data.skills['D1.N20'].mastery,30);
});

test('threshold tames exactly once and completion replay is idempotent',()=>{
 const data=fresh();pets.ensure(data);data.petRescueRotation[1]=0;
 const first=assigned(data,'r0');assert.equal(first.rescuePetId,'ketupatKura');
 for(let i=0;i<10;i++){
  const run=i?{...first,id:`r${i}`,completed:true}:first;
  const result=pets.awardGembokCompletion(data,run,{now:100+i});
  assert.equal(result.newlyTamed,i===9);
 }
 assert.equal(data.petCollection.ketupatKura.state,'tamed');
 assert.equal(data.petCollection.ketupatKura.rescues,10);
 assert.equal(pets.awardGembokCompletion(data,first).reason,'already-awarded');
 assert.equal(data.petCollection.ketupatKura.rescues,10);
});

test('demo, legacy-shaped input, cancellation, Learning Camp and incomplete runs cannot award',()=>{
 const data=fresh();
 for(const run of [{id:'demo',gembok:true,completed:true,demoMode:true},{id:'legacy',missionFinished:true,bossDefeated:true},{id:'cancelled',gembok:true,completed:true,cancelled:true},{id:'learning',gembok:true,completed:false,learningActive:true}])assert.equal(pets.awardGembokCompletion(data,run).awarded,false);
 assert.equal(data.coins,7);assert.equal(data.petCollection,undefined);
});

test('v2 migration removes only erroneous pre-v2 non-Aurora awards and never repeats',()=>{
 const data={coins:91,skills:{x:{mastery:71}},rewards:{pets:{aurora:{unlockedAt:1},harimauBunga:{unlockedAt:123}},equippedPet:'harimauBunga'},petCollection:{harimauBunga:{state:'tamed',rescues:9}},expedition:{xp:50}};
 pets.ensure(data,999);
 assert.equal(data.petCollectionMigrationVersion,2);assert.equal(data.petCollection.harimauBunga.state,'unseen');
 assert.equal(data.rewards.pets.harimauBunga,undefined);assert.equal(data.rewards.equippedPet,'aurora');
 data.petCollection.harimauBunga.state='tamed';data.rewards.pets.harimauBunga={unlockedAt:1000};pets.ensure(data,1001);
 assert.equal(data.petCollection.harimauBunga.state,'tamed');assert.equal(data.rewards.pets.harimauBunga.unlockedAt,1000);
 assert.equal(data.coins,91);assert.equal(data.skills.x.mastery,71);
});

function journeyHarness(){
 const db={schoolGrade:1,coins:7,xp:19,skills:{'D1.N20':{mastery:30,confidence:10,evidence:0,correct:0,wrong:0,hints:0,mis:{},stability:0,probePass:0,probeFail:0}}};let saves=0,award=null;
 const context={db,sess:{},performance:{now:()=>0},Date,Math,console,GRAPH:{skills:[{id:'D1.N20',grade:1,chapter:'1'},{id:'D1.N100',grade:1,chapter:'1'},{id:'D1.PV100',grade:1,chapter:'1'},{id:'D1.CMP100',grade:1,chapter:'1'},{id:'D1.ADD20',grade:1,chapter:'2'},{id:'D1.ADD100',grade:1,chapter:'2'},{id:'D1.SUB20',grade:1,chapter:'2'},{id:'D1.SUB100',grade:1,chapter:'2'},{id:'D1.FRAC',grade:1,chapter:'3'},{id:'D1.MONEY',grade:1,chapter:'4'},{id:'D1.TIME',grade:1,chapter:'5'},{id:'D1.MEASURE',grade:1,chapter:'6'},{id:'D1.SHAPE',grade:1,chapter:'7'},{id:'D1.DATA',grade:1,chapter:'8'}]},META:{'D1.N20':{grade:1}},swapDemoState:()=>({db,sess:context.sess}),save:()=>{saves++;},scoreState:id=>context.db.skills[id],PASegelHost:{openProduction:()=>{},pause:()=>{}},window:{},generate:id=>({skill:id,answer:'4',wrong:[],hint:'Cuba lagi.'}),chooseModeAndSkill:()=> 'D1.N20',recordCoachResponse:()=>{},recordFrontierResponse:()=>{},updateConfirmationAfterEncounter:()=>{},updateFrontier:()=>{},evaluateIntervention:()=>null,coreGrade:()=>1,evidenceQuality:()=>1};
 context.window=context;context.PetCollection={...pets,awardGembokCompletion:(data,run)=>{award={data,result:pets.awardGembokCompletion(data,run)};return award.result;}};vm.createContext(context);vm.runInContext(fs.readFileSync('js/engine/production-journey.js','utf8'),context);return {context,db,saves:()=>saves,award:()=>award};
}
test('real manual and adaptive production routes assign from their selected skill',()=>{
 for(const adaptive of [false,true]){
  const h=journeyHarness();h.context.openGembok(adaptive?{adaptive:true}:{chapter:'1'});
  const run=h.context.PAProductionJourney.state(),question=h.context.PAProductionJourney.nextQuestion(run);
  assert.equal(question.skill,'D1.N20');assert.ok(run.rescuePetId);assert.equal(run.rescueGrade,1);
  assert.equal(run.rescueSkillId,question.skill);assert.equal(run.rescueThreshold,pets.rescueThreshold(run.rescuePetId,1));
 }
});
