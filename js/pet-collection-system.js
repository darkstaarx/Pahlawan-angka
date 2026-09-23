/* Cosmetic companions only. No mastery, answer, combat, timer or Gembok reward modifiers. */
(function(root){
 'use strict';
 const catalog={
  aurora:{name:'Aurora Ekor Angka',rarity:'Starter',folder:null,levelGate:1,evolutionRarity:'Common'},
  ketupatKura:{name:'Kura-Kura Ketupat',rarity:'Common',folder:'ketupat-kura',levelGate:3},
  kumbangManggis:{name:'Kumbang Manggis',rarity:'Uncommon',folder:'kumbang-manggis',levelGate:7},
  harimauBunga:{name:'Harimau Bunga',rarity:'Rare',folder:'harimau-bunga',levelGate:12},
  arnabKekLapis:{name:'Arnab Kek Lapis',rarity:'Epic',folder:'arnab-kek-lapis',levelGate:18},
  durianKerbau:{name:'Kerbau Durian',rarity:'Legendary',folder:'durian-kerbau',levelGate:25}
 };
 /* The early five entries preview every rescue pet. The following entries apply
    the configured Common:Uncommon:Rare:Epic:Legendary 5:3:2:1:1 ratio. */
 const rescueCycle=['ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau','ketupatKura','ketupatKura','ketupatKura','ketupatKura','kumbangManggis','kumbangManggis','harimauBunga'];
 const rescueMultipliers={Common:.70,Uncommon:1, Rare:1.4,Epic:1.8,Legendary:2.4};
 const MIGRATION_VERSION=2,PROGRESSION_VERSION=3,MAX_COUNT=Number.MAX_SAFE_INTEGER;
 const evolutionMilestones={Common:[10,25,45],Uncommon:[12,30,50],Rare:[15,35,55],Epic:[18,40,60],Legendary:[20,45,60]};
 const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(MAX_COUNT,Math.floor(Number(x)))):0;
 const addCount=(a,b)=>Math.min(MAX_COUNT,count(a)+count(b));
 const level=x=>Math.min(60,1+Math.floor(count(x)/100));
 const playerLevel=data=>Math.max(1,count(data?.level)||1);
 const milestonesFor=id=>evolutionMilestones[catalog[id]?.evolutionRarity||catalog[id]?.rarity]||evolutionMilestones.Common;
 const stage=(id,petLevel)=>milestonesFor(id).filter(milestone=>petLevel>=milestone).length;
 const evolutionName=stage=>stage?`Evolusi ${stage}`:'Bentuk Asas';
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
 function migrateProgressionFields(data){
  if(count(data.petProgressionVersion)>=PROGRESSION_VERSION)return;
  /* This migration is deliberately additive. The v2 rescue-ratio correction
     remains the only migration allowed to remove historical bad awards. */
  data.petProgressionVersion=PROGRESSION_VERSION;
 }
 function ensure(data,now=Date.now()){
  if(!data)return null;
  data.rewards=object(data.rewards);migrateIncorrectAwards(data);migrateProgressionFields(data);data.rewards.pets=object(data.rewards.pets);data.petCollection=object(data.petCollection);
  Object.entries(catalog).forEach(([id,meta])=>{
   const old=object(data.petCollection[id]),owned=id==='aurora'||old.state==='tamed';
   const xp=count(old.bondXp),lv=level(xp);
   const evolutionStage=stage(id,lv),milestones=milestonesFor(id),nextEvolution=milestones.find(milestone=>milestone>lv)||null;
   data.petCollection[id]={...old,state:owned?'tamed':old.state==='encountered'?'encountered':'unseen',rarity:meta.rarity,levelGate:meta.levelGate,encounters:count(old.encounters),tameProgress:count(old.tameProgress),petTrace:count(old.petTrace),rescues:count(old.rescues),bondXp:xp,level:lv,evolutionStage,evolutionState:evolutionName(evolutionStage),nextEvolution,unlockedAt:owned?(count(old.unlockedAt)||now):null};
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
   const item=typeof REWARD_PETS!=='undefined'?REWARD_PETS[id]:{id,name:meta.name};
   const assets=meta.folder?{happy:`assets/pets/collection/${meta.folder}/happy.png`,sad:`assets/pets/collection/${meta.folder}/sad.png`,happySprite:`assets/pets/collection/${meta.folder}/sprite-sheets/happy-v1.png`}:{happy:'assets/pets/aurora/standby-v2.webp',sad:'assets/pets/aurora/standby-v2.webp',happySprite:null};
   const grade=Number(data.petCollection[id].rescueGrade)||null;
   const eligible=playerLevel(data)>=meta.levelGate;
   return {...item,...data.petCollection[id],id,name:item?.name||meta.name,assets,active:data.expedition.activePetId===id,eligible,rescueGrade:grade,rescueThreshold:eligible&&grade?rescueThreshold(id,grade):null};
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
  const pet=data.petCollection[petId];
  if(playerLevel(data)>=catalog[petId].levelGate){pet.rescueGrade=grade;pet.state=pet.state==='tamed'?'tamed':'encountered';}
  persist(data);return {petId,grade,threshold};
 }
 /* Called only after a real completed 2 -> 3 -> 5 Gembok route. Rescue credit
    remains curriculum-ratio based; an equipped tamed pet receives 20 Bond XP. */
 function awardGembokCompletion(data,run,options={}){
  const deny=reason=>({awarded:false,reason});
  if(!data||!run||!run.gembok||run.demoMode||run.cancelled||!run.completed)return deny('not-completed-gembok');
  ensure(data);data.gembokPetAwards=object(data.gembokPetAwards);
  if(data.gembokPetAwards[run.id])return deny('already-awarded');
  const now=options.now??Date.now(),petId=run.rescuePetId,grade=Number(run.rescueGrade),threshold=rescueThreshold(petId,grade);
  let rescueAwarded=false,newlyTamed=false,rescues=null;
  if(catalog[petId]&&petId!=='aurora'&&threshold&&playerLevel(data)>=catalog[petId].levelGate){
   const pet=data.petCollection[petId];
   pet.state=pet.state==='tamed'?'tamed':'encountered';pet.rescueGrade=grade;pet.rescues=addCount(pet.rescues,1);rescues=pet.rescues;rescueAwarded=true;
   newlyTamed=pet.state!=='tamed'&&pet.rescues>=threshold;
   if(newlyTamed){pet.state='tamed';pet.unlockedAt=now;data.rewards.pets[petId]={unlockedAt:now,collection:true};}
  }
  const activePet=data.petCollection[data.expedition.activePetId];let bondXpAwarded=false;
  if(activePet?.state==='tamed'){activePet.bondXp=addCount(activePet.bondXp,20);activePet.level=level(activePet.bondXp);activePet.evolutionStage=stage(data.expedition.activePetId,activePet.level);activePet.evolutionState=evolutionName(activePet.evolutionStage);activePet.nextEvolution=milestonesFor(data.expedition.activePetId).find(milestone=>milestone>activePet.level)||null;bondXpAwarded=true;}
  data.gembokPetAwards[run.id]={at:now,route:run.route,petId,grade,skillId:run.rescueSkillId,rescues,threshold,rescueAwarded,bondXpAwarded,equippedPetId:bondXpAwarded?data.expedition.activePetId:null};
  persist(data);return {awarded:rescueAwarded||bondXpAwarded,petId,grade,rescues,threshold,newlyTamed,rescueAwarded,bondXpAwarded};
 }
 const api={ensure,snapshot,equip,assignGembokRescue,awardGembokCompletion,catalog,rescueCycle,rescueThreshold,graphSkillCount,gradeFromSkill,levelForXp:level,evolutionForLevel:(id,petLevel)=>stage(id,petLevel),evolutionMilestones,milestonesFor,playerLevel};
 root.PetCollection=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
