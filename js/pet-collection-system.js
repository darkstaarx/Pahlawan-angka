/* Cosmetic companions only. No mastery, answer, combat, timer or Gembok reward modifiers. */
(function(root){
 'use strict';
 const catalog={aurora:{rarity:'Starter',folder:null},ketupatKura:{rarity:'Common',folder:'ketupat-kura'},kumbangManggis:{rarity:'Uncommon',folder:'kumbang-manggis'},harimauBunga:{rarity:'Rare',folder:'harimau-bunga'},arnabKekLapis:{rarity:'Epic',folder:'arnab-kek-lapis'},durianKerbau:{rarity:'Legendary',folder:'durian-kerbau'}};
 /* The early five entries preview every rescue pet. The following entries apply
    the configured Common:Uncommon:Rare:Epic:Legendary 5:3:2:1:1 ratio. */
 const rescueCycle=['ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau','ketupatKura','ketupatKura','ketupatKura','ketupatKura','kumbangManggis','kumbangManggis','harimauBunga'];
 const rescueMultipliers={Common:.70,Uncommon:1, Rare:1.4,Epic:1.8,Legendary:2.4};
 const MIGRATION_VERSION=2,MAX_COUNT=Number.MAX_SAFE_INTEGER;
 const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(MAX_COUNT,Math.floor(Number(x)))):0;
 const addCount=(a,b)=>Math.min(MAX_COUNT,count(a)+count(b));
 const level=x=>Math.min(60,1+Math.floor(count(x)/100));
 const stage=x=>x>=45?3:x>=25?2:x>=10?1:0;
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const gradeFromSkill=id=>{const match=String(id||'').match(/^D(\d+)\./);return match?Number(match[1]):null;};
 function graphSkillCount(grade){
  const skills=root.GRAPH?.skills;
  if(!Array.isArray(skills)||!Number.isFinite(grade))return 0;
  return new Set(skills.filter(skill=>Number(skill.grade)===grade||gradeFromSkill(skill.id)===grade).map(skill=>skill.id)).size;
 }
 /* Rescue requirement is ceil(unique grade skills × rarity multiplier):
    Common 70%, Uncommon 100%, Rare 140%, Epic 180%, Legendary 240%. */
 function rescueThreshold(id,grade){
  const total=graphSkillCount(grade),multiplier=rescueMultipliers[catalog[id]?.rarity];
  return total&&multiplier?Math.ceil(total*multiplier):null;
 }
 function migrateIncorrectAwards(data){
  if(count(data.petCollectionMigrationVersion)>=MIGRATION_VERSION)return;
  data.rewards.pets=object(data.rewards.pets);
  Object.keys(catalog).filter(id=>id!=='aurora').forEach(id=>delete data.rewards.pets[id]);
  data.petCollection=object(data.petCollection);
  Object.keys(catalog).filter(id=>id!=='aurora').forEach(id=>delete data.petCollection[id]);
  data.expedition={};
  data.rewards.equippedPet='aurora';
  data.petCollectionMigrationVersion=MIGRATION_VERSION;
 }
 function ensure(data,now=Date.now()){
  if(!data)return null;
  data.rewards=object(data.rewards);migrateIncorrectAwards(data);data.rewards.pets=object(data.rewards.pets);data.petCollection=object(data.petCollection);
  Object.entries(catalog).forEach(([id,meta])=>{
   const old=object(data.petCollection[id]),owned=id==='aurora'||old.state==='tamed';
   const xp=count(old.bondXp),lv=level(xp);
   data.petCollection[id]={...old,state:owned?'tamed':old.state==='encountered'?'encountered':'unseen',rarity:meta.rarity,encounters:count(old.encounters),tameProgress:count(old.tameProgress),petTrace:count(old.petTrace),rescues:count(old.rescues),bondXp:xp,level:lv,evolutionStage:stage(lv),unlockedAt:owned?(count(old.unlockedAt)||now):null};
   if(owned&&!data.rewards.pets[id])data.rewards.pets[id]={unlockedAt:data.petCollection[id].unlockedAt,collection:true};
  });
  const e=object(data.expedition),requested=e.activePetId||data.rewards.equippedPet;
  data.expedition={...e,version:2,xp:count(e.xp),rank:1+Math.floor(count(e.xp)/100),activePetId:data.petCollection[requested]?.state==='tamed'?requested:'aurora'};
  data.rewards.equippedPet=data.expedition.activePetId;
  data.petRescueRotation=object(data.petRescueRotation);
  return data;
 }
 function snapshot(data){
  ensure(data);if(!data)return {pets:[],expedition:null};
  return {pets:Object.entries(catalog).map(([id,meta])=>{
   const item=typeof REWARD_PETS!=='undefined'?REWARD_PETS[id]:{id,name:id};
   const assets=meta.folder?{happy:`assets/pets/collection/${meta.folder}/happy.png`,sad:`assets/pets/collection/${meta.folder}/sad.png`}:{happy:'assets/pets/aurora/standby-v2.webp',sad:'assets/pets/aurora/standby-v2.webp'};
   const grade=Number(data.petCollection[id].rescueGrade)||null;
   return {...item,...data.petCollection[id],id,assets,active:data.expedition.activePetId===id,rescueGrade:grade,rescueThreshold:grade?rescueThreshold(id,grade):null};
  }),expedition:{...data.expedition}};
 }
 function persist(data){if(typeof db!=='undefined'&&data===db&&typeof save==='function')save();}
 function equip(data,id){ensure(data);if(!catalog[id]||data.petCollection[id]?.state!=='tamed')return false;data.expedition.activePetId=id;data.rewards.equippedPet=id;persist(data);return true;}
 function assignGembokRescue(data,run,skillId){
  if(!data||!run||!run.gembok||run.demoMode||run.cancelled||!skillId)return null;
  ensure(data);if(run.rescuePetId)return {petId:run.rescuePetId,grade:run.rescueGrade,threshold:run.rescueThreshold};
  const grade=gradeFromSkill(skillId);if(!grade)return null;
  const rotation=count(data.petRescueRotation[grade]);
  /* The selected skill establishes the grade; its id is recorded on the run.
     Rotation then gives the learner a stable, non-random rescue sequence. */
  const petId=rescueCycle[rotation%rescueCycle.length],threshold=rescueThreshold(petId,grade);
  if(!threshold)return null;
  data.petRescueRotation[grade]=addCount(rotation,1);
  run.rescuePetId=petId;run.rescueGrade=grade;run.rescueSkillId=skillId;run.rescueThreshold=threshold;
  const pet=data.petCollection[petId];pet.rescueGrade=grade;pet.state=pet.state==='tamed'?'tamed':'encountered';
  persist(data);return {petId,grade,threshold};
 }
 /* Called only after a real completed 2 -> 3 -> 5 Gembok route. This changes
    only the pre-assigned pet's rescue counter; no encounter RNG is involved. */
 function awardGembokCompletion(data,run,options={}){
  const deny=reason=>({awarded:false,reason});
  if(!data||!run||!run.gembok||run.demoMode||run.cancelled||!run.completed)return deny('not-completed-gembok');
  ensure(data);data.gembokPetAwards=object(data.gembokPetAwards);
  if(data.gembokPetAwards[run.id])return deny('already-awarded');
  const petId=run.rescuePetId,grade=Number(run.rescueGrade),threshold=rescueThreshold(petId,grade);
  if(!catalog[petId]||petId==='aurora'||!threshold)return deny('no-assigned-rescue');
  const pet=data.petCollection[petId],now=options.now??Date.now();
  pet.state=pet.state==='tamed'?'tamed':'encountered';pet.rescueGrade=grade;pet.rescues=addCount(pet.rescues,1);
  const newlyTamed=pet.state!=='tamed'&&pet.rescues>=threshold;
  if(newlyTamed){pet.state='tamed';pet.unlockedAt=now;data.rewards.pets[petId]={unlockedAt:now,collection:true};}
  data.gembokPetAwards[run.id]={at:now,route:run.route,petId,grade,skillId:run.rescueSkillId,rescues:pet.rescues,threshold};
  persist(data);return {awarded:true,petId,grade,rescues:pet.rescues,threshold,newlyTamed};
 }
 const api={ensure,snapshot,equip,assignGembokRescue,awardGembokCompletion,catalog,rescueCycle,rescueThreshold,graphSkillCount,gradeFromSkill,levelForXp:level,evolutionForLevel:stage};
 root.PetCollection=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);