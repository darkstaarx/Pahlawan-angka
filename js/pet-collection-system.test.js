const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const pets=require('./pet-collection-system.js');
function mission(data){const s={missionChapter:'1',missionAnswered:14,bossDefeated:true,missionFinished:false};pets.begin(data,s);for(let i=0;i<14;i++)pets.recordAnswer(data,s);s.missionFinished=true;return s;}
function stream(...values){return ()=>values.length?values.shift():.999999;}
test('additive idempotent legacy migration retains owned pets and unrelated save fields',()=>{
 const d={coins:91,skills:{x:{mastery:71}},rewards:{pets:{harimauBunga:{unlockedAt:123},legacy:{x:1}},equippedPet:'harimauBunga',auras:{a:1}}};
 pets.ensure(d,999);assert.equal(d.petCollection.aurora.state,'tamed');assert.equal(d.petCollection.harimauBunga.unlockedAt,123);assert.equal(d.expedition.activePetId,'harimauBunga');assert.equal(d.petCollection.durianKerbau.state,'unseen');
 const before=JSON.stringify(d);pets.ensure(d,1000);assert.equal(JSON.stringify(d),before);assert.equal(d.coins,91);assert.equal(d.skills.x.mastery,71);assert.deepEqual(d.rewards.pets.legacy,{x:1});
});
test('invalid fields normalize and locked companions cannot equip',()=>{
 const d={petCollection:{aurora:{bondXp:NaN,encounters:-1},harimauBunga:{state:'unknown'}},expedition:{xp:Infinity,activePetId:'missing'}};pets.ensure(d);assert.equal(d.expedition.rank,1);assert.equal(d.petCollection.aurora.level,1);assert.equal(pets.equip(d,'harimauBunga'),false);assert.equal(d.expedition.activePetId,'aurora');
});
test('complete practice gives cosmetic XP once across session copy and reload',()=>{
 const d={coins:37,xp:48,skills:{}};const s=mission(d);const result=pets.complete(d,s,{rng:()=>0,now:200});assert.equal(result.awarded,true);assert.equal(result.encounter.outcome,'tamed');assert.equal(d.expedition.xp,25);assert.equal(d.petCollection.aurora.bondXp,20);assert.equal(d.coins,37);assert.equal(d.xp,48);assert.deepEqual(d.skills,{});
 const reloaded=JSON.parse(JSON.stringify(d));assert.equal(pets.complete(reloaded,JSON.parse(JSON.stringify(s))).reason,'already-claimed');assert.equal(reloaded.expedition.xp,25);
});
test('guided, coach, demos, dev, guardian, incomplete and unregistered sessions issue nothing',()=>{
 for(const flag of ['learningActive','guided','coachAdaptive','demoMode','devBankTest','devMode','fromDev','guardianFocus']){const d={};const s=mission(d);s[flag]=true;const before=JSON.stringify(d);assert.equal(pets.complete(d,s).awarded,false,flag);assert.equal(JSON.stringify(d),before,flag);}
 for(const flag of ['demoMode','devMode']){const d={};const s=mission(d);d[flag]=true;const before=JSON.stringify(d);assert.equal(pets.complete(d,s).awarded,false);assert.equal(JSON.stringify(d),before);}
 for(const change of [{missionAnswered:13},{bossDefeated:false},{missionFinished:false},{petExpedition:null}]){const d={},s=mission(d);Object.assign(s,change);assert.equal(pets.complete(d,s).awarded,false);assert.equal(d.expedition.xp,0);}
 const d={},s=mission(d);s.petExpedition.independentAnswers=13;assert.equal(pets.complete(d,s).awarded,false);
});
test('guided answer cannot increase independent count',()=>{const d={},s={missionChapter:'1'};pets.begin(d,s);s.learningActive=true;pets.recordAnswer(d,s);assert.equal(s.petExpedition.independentAnswers,0);});
test('configured completion target is captured for each fresh practice',()=>{
 const context={module:{exports:{}},globalThis:{},PROGRESSION:{missionQuestions:3}};context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('./pet-collection-system.js'),'utf8'),context);const api=context.module.exports,d={},s={missionChapter:'1',missionAnswered:3,bossDefeated:true,missionFinished:false};api.begin(d,s);assert.equal(s.petExpedition.requiredAnswers,3);for(let i=0;i<3;i++)api.recordAnswer(d,s);s.missionFinished=true;assert.equal(api.complete(d,s,{rng:()=>0}).awarded,true);
});
test('expedition and Bond XP additions stay within safe integer bounds',()=>{
 const d={expedition:{xp:Number.MAX_SAFE_INTEGER},petCollection:{aurora:{bondXp:Number.MAX_SAFE_INTEGER}}},s=mission(d);const result=pets.complete(d,s,{rng:()=>1});assert.equal(result.awarded,true);assert.equal(d.expedition.xp,Number.MAX_SAFE_INTEGER);assert.equal(d.petCollection.aurora.bondXp,Number.MAX_SAFE_INTEGER);
});
test('zones unlock independently and full table is 50/28/14/6/2',()=>{
 assert.deepEqual(Object.values(pets.rarities).map(r=>r.weight),[50,28,14,6,2]);assert.equal(pets.zoneFor(1).rarities.includes('Epic'),false);assert.equal(pets.zoneFor(3).rarities.includes('Epic'),true);assert.equal(pets.zoneFor(5).rarities.includes('Legendary'),true);
 for(const [r,id] of [[0,'ketupatKura'],[.5,'kumbangManggis'],[.78,'harimauBunga'],[.92,'arnabKekLapis'],[.98,'durianKerbau']]){const d={expedition:{xp:400}};const result=pets.complete(d,mission(d),{rng:stream(0,r,0)});assert.equal(result.encounter.petId,id);}
});
test('RNG bounds include 0, 1, negatives, infinity and NaN without undefined encounters',()=>{
 for(const value of [0,1,-1,Infinity,NaN]){const d={expedition:{xp:400,encounterPity:3}};const result=pets.complete(d,mission(d),{rng:()=>value});assert.ok(pets.catalog[result.encounter.petId]);assert.ok(result.encounter.chance>=0&&result.encounter.chance<=1);}
});
test('three missed encounters guarantee the fourth; legendary tames by eighth sighting',()=>{
 const d={};for(let n=0;n<3;n++){assert.equal(pets.complete(d,mission(d),{rng:()=>1}).encounter,null);}assert.ok(pets.complete(d,mission(d),{rng:()=>1}).encounter);
 const rare={expedition:{xp:400}};let lastChance=0;for(let n=1;n<=8;n++){const out=pets.complete(rare,mission(rare),{rng:stream(0,.999999,.999999)}).encounter;assert.equal(out.petId,'durianKerbau');assert.ok(out.chance>=lastChance);lastChance=out.chance;assert.equal(out.outcome,n===8?'tamed':'fled');}assert.equal(rare.petCollection.durianKerbau.state,'tamed');
});
test('duplicates convert into cosmetic trace, Bond belongs only to departure pet, stage thresholds exact',()=>{
 const d={};pets.complete(d,mission(d),{rng:()=>0});pets.equip(d,'ketupatKura');const s=mission(d);pets.equip(d,'aurora');const r=pets.complete(d,s,{rng:()=>0});assert.equal(r.encounter.outcome,'duplicate');assert.equal(d.petCollection.ketupatKura.petTrace,1);assert.equal(d.petCollection.ketupatKura.bondXp,20);assert.equal(d.petCollection.aurora.bondXp,20);
 for(const [xp,lv,stage] of [[899,9,0],[900,10,1],[2399,24,1],[2400,25,2],[4399,44,2],[4400,45,3]]){assert.equal(pets.levelForXp(xp),lv);assert.equal(pets.evolutionForLevel(lv),stage);}
});
test('reward purchase entry point rejects collection pets without spending coins',()=>{
 const context={db:{coins:500},window:{},document:{},showRewardToast:()=>{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('./rewards-v2.js'),'utf8'),context);context.buyReward('pet','durianKerbau');assert.equal(context.db.coins,500);assert.equal(context.db.rewards,undefined);
});
test('progression hook refuses to finish while guided teaching is active',()=>{
 const context={sess:{learningActive:true},window:{},location:{hostname:'localhost'},learningState:null};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('./progression.js'),'utf8'),context);context.finishMission();assert.equal(context.sess.missionFinished,undefined);
 context.sess.learningActive=false;context.learningState={stage:1};context.finishMission();assert.equal(context.sess.missionFinished,undefined);
});
