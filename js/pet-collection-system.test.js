const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const pets=require('./pet-collection-system.js');

function journeyHarness(){
 const db={schoolGrade:2,coins:7,xp:19,skills:{'D2.TEST':{mastery:30,confidence:10,evidence:0,correct:0,wrong:0,hints:0,mis:{},stability:0,probePass:0,probeFail:0}}};
 let saves=0;
 const context={db,sess:{},performance:{now:()=>0},Date,Math,console,
  GRAPH:{skills:[{id:'D2.TEST',grade:2,chapter:'1'}]},META:{'D2.TEST':{grade:2}},
  swapDemoState:(nextDb,nextSess)=>{const previous={db:context.db,sess:context.sess};context.db=nextDb;context.sess=nextSess;return previous;},
  save:()=>{saves++;},scoreState:id=>context.db.skills[id],
  PASegelHost:{openProduction:()=>{},pause:()=>{}},window:{},
  generate:id=>({skill:id,answer:'4',wrong:[],hint:'Cuba lagi.'}),chooseModeAndSkill:()=> 'D2.TEST',recordCoachResponse:()=>{},recordFrontierResponse:()=>{},updateConfirmationAfterEncounter:()=>{},updateFrontier:()=>{},evaluateIntervention:()=>null,
  coreGrade:()=>2,evidenceQuality:()=>1,
  META:{'D2.TEST':{grade:2}}
 };
 context.window=context;
 context.PetCollection={awardGembokCompletion:(data,run)=>pets.awardGembokCompletion(data,run,{rng:()=>0,now:100})};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('js/engine/production-journey.js','utf8'),context);
 return {context,db,saves:()=>saves};
}

function completeRoute(adaptive){
 const h=journeyHarness();
 h.context.openGembok(adaptive?{adaptive:true}:{chapter:'1'});
 const run=h.context.PAProductionJourney.state();
 for(let hit=0;hit<10;hit++){
  const question=h.context.PAProductionJourney.nextQuestion(run);
  h.context.PAProductionJourney.resolve(question,{tag:'correct',v:'4'},true);
 }
 const learningState=JSON.stringify(h.db.skills);
 h.context.PAProductionJourney.complete();
 return {h,run,learningState};
}

test('a real manual Gembok completion awards cosmetic progression exactly once',()=>{
 const {h,run,learningState}=completeRoute(false);
 assert.equal(run.gembok,true);
 assert.equal(h.db.gembok.completions[run.id].route,'manual');
 assert.equal(h.db.gembokPetAwards[run.id].route,'manual');
 assert.equal(h.db.expedition.xp,25);
 assert.equal(h.db.petCollection.aurora.bondXp,20);
 assert.equal(h.db.coins,22);
 assert.equal(h.db.xp,19);
 assert.equal(JSON.stringify(h.db.skills),learningState);
 h.context.PAProductionJourney.complete();
 assert.equal(Object.keys(h.db.gembokPetAwards).length,1);
 assert.equal(h.db.expedition.xp,25);
 assert.equal(h.db.coins,22);
});

test('a real adaptive Gembok completion awards cosmetic progression',()=>{
 const {h,run}=completeRoute(true);
 assert.equal(run.route,'adaptive');
 assert.equal(h.db.gembokPetAwards[run.id].route,'adaptive');
 assert.equal(h.db.expedition.xp,25);
 assert.equal(h.db.coins,17);
});

test('demo, legacy-shaped input, cancelled Gembok and Learning Camp cannot award',()=>{
 const data={coins:8,xp:3,skills:{x:{mastery:9}}};
 assert.equal(pets.awardGembokCompletion(data,{id:'demo',gembok:true,completed:true,demoMode:true}).awarded,false);
 assert.equal(pets.awardGembokCompletion(data,{id:'legacy',missionFinished:true,bossDefeated:true}).awarded,false);
 assert.equal(pets.awardGembokCompletion(data,{id:'cancelled',gembok:true,completed:true,cancelled:true}).awarded,false);
 assert.equal(pets.awardGembokCompletion(data,{id:'learning',gembok:true,completed:false,learningActive:true}).awarded,false);
 assert.equal(data.coins,8);
 assert.equal(data.xp,3);
 assert.deepEqual(data.skills,{x:{mastery:9}});
});

test('closing a real Gembok before completion cannot award',()=>{
 const h=journeyHarness();
 h.context.openGembok({chapter:'1'});
 h.context.PAProductionJourney.close(false);
 h.context.PAProductionJourney.complete();
 assert.equal(h.db.gembokPetAwards,undefined);
 assert.equal(h.db.expedition,undefined);
});

test('calling complete before the 2 -> 3 -> 5 seal route cannot award',()=>{
 const h=journeyHarness();
 h.context.openGembok({chapter:'1'});
 h.context.PAProductionJourney.complete();
 assert.equal(h.context.PAProductionJourney.state().completed,false);
 assert.equal(h.db.gembokPetAwards,undefined);
});

test('migration is additive and equip never affects learning state',()=>{
 const data={coins:91,skills:{x:{mastery:71}},rewards:{pets:{harimauBunga:{unlockedAt:123}},equippedPet:'harimauBunga'}};
 pets.ensure(data,999);
 assert.equal(data.petCollection.harimauBunga.unlockedAt,123);
 assert.equal(data.expedition.activePetId,'harimauBunga');
 assert.equal(pets.equip(data,'aurora'),true);
 assert.equal(data.coins,91);
 assert.equal(data.skills.x.mastery,71);
});
