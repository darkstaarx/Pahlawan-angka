const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
/* Production graph source is JSON. Tests resolve from this file so cwd does not
   change what curriculum sizes the proportional rescue formula reads. */
global.GRAPH=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','kssr','knowledge-graph.json'),'utf8'));
const pets=require('./pet-collection-system.js');

function fresh(){return {schoolGrade:1,level:3,coins:7,xp:19,skills:{'D1.N20':{mastery:30}}};}
function assigned(data,id,skill='D1.N20'){const run={id,gembok:true,route:'manual'};assert.ok(pets.assignGembokRescue(data,run,skill));run.completed=true;return run;}

test('actual knowledge graph gives D1 fourteen unique skills and proportional Kura threshold ten',()=>{
 assert.equal(pets.graphSkillCount(1),14);
 assert.equal(pets.rescueThreshold('ketupatKura',1),10);
 assert.equal(pets.rescueThreshold('kumbangManggis',1),14);
 assert.equal(pets.rescueThreshold('harimauBunga',1),20);
});

test('all pet gates are exact and all pets remain visible previews',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(pets.catalog).map(([id,pet])=>[id,pet.levelGate])),{aurora:1,ketupatKura:3,kumbangManggis:7,harimauBunga:12,arnabKekLapis:18,durianKerbau:25});
 const data=fresh();data.level=1;const preview=pets.snapshot(data).pets;
 assert.equal(preview.length,6);assert.equal(preview.find(p=>p.id==='durianKerbau').eligible,false);
 assert.equal(preview.find(p=>p.id==='aurora').eligible,true);
 assert.equal(preview.find(p=>p.id==='aurora').name,'Aurora');
 assert.equal(preview.find(p=>p.id==='aurora').species,'Musang Ekor Angka');
 assert.equal(preview.find(p=>p.id==='aurora').assets.idleSprite,null);
 assert.equal(preview.find(p=>p.id==='ketupatKura').name,'Kukupat');
 assert.match(preview.find(p=>p.id==='ketupatKura').assets.sadSprite,/sad-v1\.png$/);
});

test('weighted per-grade rotation includes all eligible pets without RNG',()=>{
 const data=fresh(),seen=[];data.level=25;
 for(let i=0;i<120;i++)seen.push(pets.assignGembokRescue(data,{id:`a${i}`,gembok:true},'D1.N20').petId);
 assert.equal(new Set(seen).size,6);
 assert.equal(data.petRescueRotation[1],120);
 const frequency=id=>seen.filter(x=>x===id).length;
 assert(frequency('kumbangManggis')>frequency('ketupatKura'));
 assert(frequency('harimauBunga')>frequency('arnabKekLapis'));
 assert(frequency('arnabKekLapis')>frequency('durianKerbau'));
 const restored=JSON.parse(JSON.stringify(data));
 for(let i=0;i<30;i++)assert.equal(pets.assignGembokRescue(data,{id:`b${i}`,gembok:true},'D1.N20').petId,pets.assignGembokRescue(restored,{id:`b${i}`,gembok:true},'D1.N20').petId);
});

test('one completed run increments only its assigned pet and never tames Kura',()=>{
 const data=fresh(),run=assigned(data,'one');
 const id=run.rescuePetId,result=pets.awardGembokCompletion(data,run,{now:100});
 assert.equal(result.awarded,true);assert.equal(data.petCollection[id].rescues,1);
 assert.equal(data.petCollection[id].state,'encountered');
 assert.equal(Object.values(data.petCollection).filter(p=>p.rescues).length,1);
 assert.equal(data.coins,7);assert.equal(data.xp,19);assert.equal(data.skills['D1.N20'].mastery,30);
});

test('threshold plus gate tames exactly once and completion replay is idempotent',()=>{
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

test('assignment skips locked pet gates instead of promising an impossible rescue',()=>{
 const tooLow=fresh();tooLow.level=1;tooLow.petRescueRotation={1:0};
 assert.equal(pets.assignGembokRescue(tooLow,{id:'locked',gembok:true},'D1.N20').petId,'aurora');

 const data=fresh();data.level=3;data.petRescueRotation={1:1};
 const run={id:'skip-gates',gembok:true,route:'manual'};
 const assignment=pets.assignGembokRescue(data,run,'D1.N20');
 assert.equal(assignment.petId,'ketupatKura');
 assert.equal(data.petRescueRotation[1],2);
 run.completed=true;
 const result=pets.awardGembokCompletion(data,run,{now:100});
 assert.equal(result.rescueAwarded,true);
 assert.equal(data.petCollection.ketupatKura.rescues,1);
 assert.equal(data.petCollection.kumbangManggis.rescues,0);
});

test('owned Aurora and Kura remain repeat rescues with one award per run',()=>{
 const data=fresh();pets.ensure(data);data.petCollection.ketupatKura.state='tamed';
 const seen=[];
 for(let i=0;i<20;i++){
  const run=assigned(data,`repeat-${i}`);seen.push(run.rescuePetId);
  const result=pets.awardGembokCompletion(data,run);
  assert.equal(result.alreadyTamed,true);assert.equal(result.newlyTamed,false);
  assert.equal(pets.awardGembokCompletion(data,run).reason,'already-awarded');
 }
 assert(seen.includes('aurora'));assert(seen.includes('ketupatKura'));
 assert.equal(data.petCollection.aurora.bondXp,400);
});

test('strong independent answers unlock at most two tiers early and keep access',()=>{
 const data=fresh();pets.ensure(data);
 data.gembok={completions:{one:{at:1,firstAttemptQuestions:10,independentCorrect:9}}};
 assert.equal(pets.rescueAccess(data,1).tier,2);
 data.gembok.completions.two={at:2,firstAttemptQuestions:10,independentCorrect:10};
 assert.equal(pets.rescueAccess(data,1).tier,3);
 let run;
 for(let i=0;i<40;i++){const candidate=assigned(data,`early-${i}`);if(candidate.rescuePetId==='harimauBunga'){run=candidate;break;}}
 assert(run);assert.equal(run.rescueEligibility.boost,2);
 data.gembok.completions={};
 assert.equal(pets.awardGembokCompletion(data,run).rescueAwarded,true);
 assert.equal(pets.snapshot(data).pets.find(p=>p.id==='harimauBunga').eligible,true);
 assert.equal(pets.rescueAccess(data,1).tier,3);
 assert.equal(data.petCollection.harimauBunga.state,'encountered');
});

test('effort unlock uses completed tasks, never abandoned runs or historical accuracy guesses',()=>{
 const data=fresh();data.completedMissions={1:7};pets.ensure(data);
 for(let i=0;i<50;i++)pets.assignGembokRescue(data,{id:`abandon-${i}`,gembok:true},'D1.N20');
 assert.equal(pets.rescueAccess(data,1).boost,0);
 data.completedMissions[1]=8;assert.equal(pets.rescueAccess(data,1).boost,1);
 data.completedMissions[1]=20;assert.equal(pets.rescueAccess(data,1).boost,2);
 assert.equal(pets.rescueAccess(data,1).tier,3);
 const legacy=fresh();legacy.gembok={completions:{old:{correct:10,at:1},small:{firstAttemptQuestions:1,independentCorrect:1,at:2}}};
 assert.equal(pets.rescueAccess(legacy,1).boost,0);
});

test('real manual and adaptive completions award exactly 20 Bond XP once to the equipped tamed pet',()=>{
 for(const route of ['manual','adaptive']){
  const data=fresh();pets.ensure(data);const run={id:`bond-${route}`,gembok:true,route,completed:true};
  const result=pets.awardGembokCompletion(data,run,{now:100});
  assert.equal(result.bondXpAwarded,true);assert.equal(data.petCollection.aurora.bondXp,20);
  assert.equal(pets.awardGembokCompletion(data,run).reason,'already-awarded');assert.equal(data.petCollection.aurora.bondXp,20);
 }
});

test('an unequipped tamed pet gets no Bond XP',()=>{
 const data=fresh();pets.ensure(data);data.petCollection.ketupatKura.state='tamed';data.expedition.activePetId='aurora';
 pets.awardGembokCompletion(data,{id:'unequipped',gembok:true,route:'manual',completed:true});
 assert.equal(data.petCollection.ketupatKura.bondXp,0);assert.equal(data.petCollection.aurora.bondXp,20);
});

test('rarity-specific evolution milestones and Aurora Common milestones are exact',()=>{
 assert.deepEqual(pets.evolutionMilestones,{Common:[10,25,45],Uncommon:[12,30,50],Rare:[15,35,55],Epic:[18,40,60],Legendary:[20,45,60]});
 for(const [id,expected] of Object.entries({aurora:[10,25,45],ketupatKura:[10,25,45],kumbangManggis:[12,30,50],harimauBunga:[15,35,55],arnabKekLapis:[18,40,60],durianKerbau:[20,45,60]})){
  assert.deepEqual(pets.milestonesFor(id),expected);assert.equal(pets.evolutionForLevel(id,expected[0]-1),0);assert.equal(pets.evolutionForLevel(id,expected[0]),1);assert.equal(pets.evolutionForLevel(id,expected[2]),3);
 }
 const data=fresh();pets.ensure(data);const aurora=data.petCollection.aurora;
 assert.equal(aurora.level,1);assert.equal(aurora.evolutionState,'Bentuk Asas');assert.equal(aurora.nextEvolution,10);
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

test('v3 progression migration preserves legitimate post-ratio pets, Bond XP and Gembok history',()=>{
 const data={level:25,coins:91,skills:{x:{mastery:71}},rewards:{pets:{aurora:{unlockedAt:1},harimauBunga:{unlockedAt:123}},equippedPet:'harimauBunga'},petCollectionMigrationVersion:2,petCollection:{aurora:{state:'tamed',bondXp:2400},harimauBunga:{state:'tamed',rescues:20,bondXp:1100,unlockedAt:123}},gembok:{completions:{real:{at:9}}}};
 pets.ensure(data,999);
  assert.equal(data.petProgressionVersion,4);assert.equal(data.petCollection.harimauBunga.state,'tamed');assert.equal(data.petCollection.harimauBunga.rescues,20);assert.equal(data.petCollection.harimauBunga.bondXp,1100);assert.equal(data.petCollection.harimauBunga.level,12);assert.equal(data.gembok.completions.real.at,9);assert.equal(data.coins,91);assert.equal(data.skills.x.mastery,71);
});

function journeyHarness(){
 const db={schoolGrade:1,level:3,coins:7,xp:19,skills:{'D1.N20':{mastery:30,confidence:10,evidence:0,correct:0,wrong:0,hints:0,mis:{},stability:0,probePass:0,probeFail:0}}};let saves=0,award=null;
 const context={db,sess:{},performance:{now:()=>0},Date,Math,console,GRAPH:{skills:[{id:'D1.N20',grade:1,chapter:'1'},{id:'D1.N100',grade:1,chapter:'1'},{id:'D1.PV100',grade:1,chapter:'1'},{id:'D1.CMP100',grade:1,chapter:'1'},{id:'D1.ADD20',grade:1,chapter:'2'},{id:'D1.ADD100',grade:1,chapter:'2'},{id:'D1.SUB20',grade:1,chapter:'2'},{id:'D1.SUB100',grade:1,chapter:'2'},{id:'D1.FRAC',grade:1,chapter:'3'},{id:'D1.MONEY',grade:1,chapter:'4'},{id:'D1.TIME',grade:1,chapter:'5'},{id:'D1.MEASURE',grade:1,chapter:'6'},{id:'D1.SHAPE',grade:1,chapter:'7'},{id:'D1.DATA',grade:1,chapter:'8'}]},META:{'D1.N20':{grade:1}},swapDemoState:(nextDb,nextSess)=>{const previous={db:context.db,sess:context.sess};context.db=nextDb;context.sess=nextSess;return previous},save:()=>{saves++;},scoreState:id=>context.db.skills[id],PASegelHost:{openProduction:()=>{},pause:()=>{}},window:{},generate:id=>({skill:id,answer:'4',wrong:[],hint:'Cuba lagi.'}),chooseModeAndSkill:()=> 'D1.N20',recordCoachResponse:()=>{},recordFrontierResponse:()=>{},updateConfirmationAfterEncounter:()=>{},updateFrontier:()=>{},evaluateIntervention:()=>null,coreGrade:()=>1,evidenceQuality:()=>1};
 context.window=context;context.PetCollection={...pets,awardGembokCompletion:(data,run)=>{award={data,result:pets.awardGembokCompletion(data,run)};return award.result;}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'engine','production-journey.js'),'utf8'),context);return {context,db,saves:()=>saves,award:()=>award};
}
test('real manual and adaptive production routes assign from their selected skill',()=>{
 for(const adaptive of [false,true]){
  const h=journeyHarness();h.context.openGembok(adaptive?{adaptive:true}:{chapter:'1'});
  const run=h.context.PAProductionJourney.state(),question=h.context.PAProductionJourney.nextQuestion(run);
  assert.equal(question.skill,'D1.N20');assert.ok(run.rescuePetId);assert.equal(run.rescueGrade,1);
  assert.equal(run.rescueSkillId,question.skill);assert.equal(run.rescueThreshold,pets.rescueThreshold(run.rescuePetId,1));
  assert.equal(run.rescuePetConfig.id,run.rescuePetId);assert.ok(run.rescuePetConfig.sadSheet);
 }
});

test('focus production route uses the live Segel host and stays on one skill',()=>{
 const h=journeyHarness();h.context.openGembok({focusSkill:'D1.N20',focusTarget:10});
 const run=h.context.PAProductionJourney.state(),question=h.context.PAProductionJourney.nextQuestion(run);
 assert.equal(run.route,'focus');assert.equal(run.focusSkill,'D1.N20');assert.equal(question.skill,'D1.N20');
});

test('production boundary awards Bond XP only after ten correct seals',()=>{
 const h=journeyHarness();h.context.openGembok({chapter:'1'});const run=h.context.PAProductionJourney.state();
 h.context.PAProductionJourney.nextQuestion(run);h.db.petCollection[run.rescuePetId].rescues=run.rescueThreshold-1;
 h.context.PAProductionJourney.complete();assert.equal(h.award(),null);
 run.correct=10;h.context.PAProductionJourney.complete();assert.equal(h.award().result.bondXpAwarded,true);assert.equal(h.db.petCollection.aurora.bondXp,20);assert.equal(run.temanRevealAward.newlyTamed,true);
 assert.equal(h.db.petCollection.ketupatKura.state,'tamed');
 h.context.PAProductionJourney.complete();assert.equal(h.db.petCollection.aurora.bondXp,20);assert.equal(run.temanRevealAward.newlyTamed,true);
});

test('production strength counts each first question once, with hints and retries excluded from clean correct',()=>{
 const h=journeyHarness();h.context.openGembok({focusSkill:'D1.N20'});const api=h.context.PAProductionJourney,run=api.state();
 let q=api.nextQuestion(run);api.hint();api.resolve(q,{tag:'correct',v:q.answer},true);
 assert.equal(run.firstAttemptQuestions,1);assert.equal(run.independentCorrect||0,0);
 q=api.nextQuestion(run);api.firstWrong(q,{tag:'wrong',v:'5'});api.resolve(q,{tag:'correct',v:q.answer},true);
 assert.equal(run.firstAttemptQuestions,2);assert.equal(run.independentCorrect||0,0);
 q=api.nextQuestion(run);api.resolve(q,{tag:'correct',v:q.answer},true);
 assert.equal(run.firstAttemptQuestions,3);assert.equal(run.independentCorrect,1);
 run.correct=10;api.complete();
 assert.equal(h.db.gembok.completions[run.id].firstAttemptQuestions,3);
 assert.equal(h.db.gembok.completions[run.id].independentCorrect,1);
});

test('later global access cannot turn a different locked pet into an old run award',()=>{
 const data=fresh(),run=assigned(data,'reserved');data.petRescueAccess[1]=5;
 run.rescuePetId='durianKerbau';
 assert.equal(pets.awardGembokCompletion(data,run).rescueAwarded,false);
 assert.equal(data.petCollection.durianKerbau.rescues,0);
});


 test('default companion names keep species separate and preserve player nicknames',()=>{
 const expected={aurora:['Aurora','Musang Ekor Angka'],ketupatKura:['Kukupat','Kura-Kura Ketupat'],kumbangManggis:['Kumbis','Kumbang Manggis'],harimauBunga:['Riya','Harimau Bunga'],arnabKekLapis:['Bunnis','Arnab Kek Lapis'],durianKerbau:['Keryan','Kerbau Durian']};
 const data=fresh();pets.ensure(data);data.petCollection.ketupatKura.state='tamed';data.petCollection.ketupatKura.customName='Si Comel';
 for(const pet of pets.snapshot(data).pets){assert.equal(pet.defaultName,expected[pet.id][0]);assert.equal(pet.species,expected[pet.id][1]);assert.equal(pet.name,pet.id==='ketupatKura'?'Si Comel':expected[pet.id][0]);}
 assert.equal(pets.rename(data,'ketupatKura',''),false);
 assert.equal(data.petCollection.ketupatKura.customName,'Si Comel');
 });
