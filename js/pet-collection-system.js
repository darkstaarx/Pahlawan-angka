/* Cosmetic companions only. No mastery, answer, combat, timer or Gembok reward modifiers. */
(function(root){
 'use strict';
 const catalog={
  aurora:{name:'Aurora',species:'Musang Ekor Angka',rarity:'Starter',folder:null,levelGate:1,evolutionRarity:'Common'},
  ketupatKura:{name:'Kukupat',species:'Kura-Kura Ketupat',rarity:'Common',folder:'ketupat-kura',levelGate:3},
  kumbangManggis:{name:'Kumbis',species:'Kumbang Manggis',rarity:'Uncommon',folder:'kumbang-manggis',levelGate:7},
  harimauBunga:{name:'Riya',species:'Harimau Bunga',rarity:'Rare',folder:'harimau-bunga',levelGate:12},
  arnabKekLapis:{name:'Bunnis',species:'Arnab Kek Lapis',rarity:'Epic',folder:'arnab-kek-lapis',levelGate:18},
  durianKerbau:{name:'Keryan',species:'Kerbau Durian',rarity:'Legendary',folder:'durian-kerbau',levelGate:25}
 };
 /* Legacy cycle retained for saved clients; new missions use weighted rotation. */
 const rescueCycle=['ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau','ketupatKura','ketupatKura','ketupatKura','ketupatKura','kumbangManggis','kumbangManggis','harimauBunga'];
 const rescueMultipliers={Common:.70,Uncommon:1, Rare:1.4,Epic:1.8,Legendary:2.4};
  const MIGRATION_VERSION=2,PROGRESSION_VERSION=4,MAX_COUNT=Number.MAX_SAFE_INTEGER;
 const evolutionMilestones={Common:[5,25,45],Uncommon:[5,30,50],Rare:[5,35,55],Epic:[5,40,60],Legendary:[5,45,60]};
 const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(MAX_COUNT,Math.floor(Number(x)))):0;
 const addCount=(a,b)=>Math.min(MAX_COUNT,count(a)+count(b));
 const level=x=>Math.min(60,1+Math.floor(count(x)/100));
 const playerLevel=data=>Math.max(1,count(data?.level)||1);
 const rescueOrder=Object.keys(catalog),rescueWeights=[2,8,5,3,2,1];
 function rescueAccess(data,grade){
  const normalTier=rescueOrder.reduce((tier,id,i)=>playerLevel(data)>=catalog[id].levelGate||data.petCollection?.[id]?.state==='tamed'?Math.max(tier,i):tier,0);
  const completions=Object.values(object(data.gembok?.completions));
  const history=completions.filter(x=>Number.isFinite(x?.firstAttemptQuestions)&&Number.isFinite(x?.independentCorrect))
    .sort((a,b)=>count(b.at)-count(a.at)).slice(0,8);
  const questions=history.reduce((sum,x)=>sum+count(x.firstAttemptQuestions),0);
  const correct=history.reduce((sum,x)=>sum+Math.min(count(x.independentCorrect),count(x.firstAttemptQuestions)),0);
  const accuracy=questions?correct/questions:0;
  const tasks=completions.length+Object.values(object(data.completedMissions)).reduce((sum,x)=>sum+count(x),0);
  const boost=(questions>=20&&accuracy>=.95)||tasks>=20?2:(questions>=10&&accuracy>=.85)||tasks>=8?1:0;
  const tier=Math.min(rescueOrder.length-1,Math.max(normalTier+boost,count(data.petRescueAccess?.[grade])));
  return {normalTier,tier,boost,questions,accuracy,tasks};
 }
 const milestonesFor=id=>evolutionMilestones[catalog[id]?.evolutionRarity||catalog[id]?.rarity]||evolutionMilestones.Common;
 const stage=(id,petLevel)=>milestonesFor(id).filter(milestone=>petLevel>=milestone).length;
 const evolutionName=stage=>stage?`Bara · Evolusi ${stage}`:'Bentuk Asas';
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const gradeFromSkill=id=>{const match=String(id||'').match(/^D(\d+)\./);return match?Number(match[1]):null;};
 function graphSkillCount(grade){
  /* knowledge-graph.js declares GRAPH as a classic-script lexical global,
     not as window.GRAPH. Support both shapes so rescue thresholds work live. */
  const skills=(typeof GRAPH!=='undefined'?GRAPH:null)?.skills||root.GRAPH?.skills;
  if(!Array.isArray(skills)||!Number.isFinite(grade))return 0;
  return new Set(skills.filter(skill=>Number(skill.grade)===grade||gradeFromSkill(skill.id)===grade).map(skill=>skill.id)).size;
 }
 /* Rescue requirement is ceil(unique grade skills × rarity multiplier):
    Common 70%, Uncommon 100%, Rare 140%, Epic 180%, Legendary 240%. */
 function rescueThreshold(id,grade){
  const total=graphSkillCount(grade),multiplier=rescueMultipliers[catalog[id]?.evolutionRarity||catalog[id]?.rarity];
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
   Object.keys(catalog).filter(id=>id!=='aurora').forEach(id=>{
    const pet=object(data.petCollection?.[id]);
    if(pet.state==='encountered'&&count(pet.rescues)===0){pet.state='unseen';delete pet.rescueGrade;data.petCollection[id]=pet;}
   });
   data.petProgressionVersion=PROGRESSION_VERSION;
 }
 function ensure(data,now=Date.now()){
  if(!data)return null;
  data.rewards=object(data.rewards);migrateIncorrectAwards(data);migrateProgressionFields(data);data.rewards.pets=object(data.rewards.pets);data.petCollection=object(data.petCollection);
  Object.entries(catalog).forEach(([id,meta])=>{
   const old=object(data.petCollection[id]),owned=id==='aurora'||old.state==='tamed';
   const xp=count(old.bondXp),lv=level(xp);
   const evolutionStage=stage(id,lv),milestones=milestonesFor(id),nextEvolution=milestones.find(milestone=>milestone>lv)||null;
   data.petCollection[id]={...old,state:owned?'tamed':old.state==='encountered'?'encountered':'unseen',rarity:meta.rarity,species:meta.species||old.species||'',levelGate:meta.levelGate,encounters:count(old.encounters),tameProgress:count(old.tameProgress),petTrace:count(old.petTrace),rescues:count(old.rescues),bondXp:xp,level:lv,evolutionStage,evolutionTheme:owned&&evolutionStage>0?'fire':null,evolutionState:evolutionName(evolutionStage),nextEvolution,unlockedAt:owned?(count(old.unlockedAt)||now):null};
   if(owned&&!data.rewards.pets[id])data.rewards.pets[id]={unlockedAt:data.petCollection[id].unlockedAt,collection:true};
  });
  const e=object(data.expedition),requested=e.activePetId||data.rewards.equippedPet;
  data.expedition={...e,version:2,xp:count(e.xp),rank:1+Math.floor(count(e.xp)/100),activePetId:data.petCollection[requested]?.state==='tamed'?requested:'aurora'};
  data.rewards.equippedPet=data.expedition.activePetId;
  data.petRescueRotation=object(data.petRescueRotation);
  data.petRescueAccess=object(data.petRescueAccess);
  data.petRescueSchedule=object(data.petRescueSchedule);
  return data;
 }
 function snapshot(data){
  ensure(data);if(!data)return {pets:[],expedition:null};
  const access=rescueAccess(data,Number(data.schoolGrade)||1);
  return {pets:Object.entries(catalog).map(([id,meta])=>{
   const item=typeof REWARD_PETS!=='undefined'?REWARD_PETS[id]:{id,name:meta.name};
   const baseAssets=meta.folder?{happy:`assets/pets/collection/${meta.folder}/happy.png`,idle:`assets/pets/collection/${meta.folder}/idle.png`,idleSprite:`assets/pets/collection/${meta.folder}/companion-idle-v1.png`,sad:`assets/pets/collection/${meta.folder}/sad.png`,sadSprite:`assets/pets/collection/${meta.folder}/sprite-sheets/sad-v1.png`,happySprite:`assets/pets/collection/${meta.folder}/sprite-sheets/happy-v1.png`}:{happy:'assets/pets/aurora/standby-v2.webp',idle:'assets/pets/aurora/standby-v2.webp',idleSprite:null,sad:'assets/pets/aurora/frames/sad-0-v1.webp',sadFrames:Array.from({length:8},(_,i)=>`assets/pets/aurora/frames/sad-${i}-v1.webp`),sadSprite:null,happySprite:null};
   const evolutionUnlocked=data.petCollection[id].state==='tamed'&&data.petCollection[id].level>=5;
   const evolved=evolutionUnlocked&&data.petCollection[id].appearance!=='base';
   const fireRoot=`assets/pets/evolution/fire/${id}`,fireVersion=['ketupatKura','arnabKekLapis'].includes(id)?2:1;
   const evolutionAssets={...baseAssets,happy:`${fireRoot}/happy-v${fireVersion}.webp`,idle:`${fireRoot}/happy-v${fireVersion}.webp`,idleSprite:`${fireRoot}/companion-idle-v${fireVersion}.webp`,happySprite:`${fireRoot}/companion-idle-v${fireVersion}.webp`};
   const assets=evolved?evolutionAssets:baseAssets;
   const grade=Number(data.petCollection[id].rescueGrade)||null;
   const eligible=data.petCollection[id].state==='tamed'||rescueOrder.indexOf(id)<=access.tier;
    const customName=String(data.petCollection[id].customName||'').trim();
    return {...item,...data.petCollection[id],id,name:customName||meta.name,defaultName:meta.name,species:meta.species||'',assets,evolutionAssets,evolutionUnlocked,appearance:evolved?'bara':'base',evolutionTheme:evolved?'fire':null,companionScale:evolved?1:.58,active:data.expedition.activePetId===id,eligible,rescueGrade:grade,rescueThreshold:eligible&&grade?rescueThreshold(id,grade):null};
  }),expedition:{...data.expedition}};
 }
 /* All battle renderers must read this helper instead of keeping their own
    equipped-pet value. `expedition.activePetId` is what Khazanah writes. */
 function active(data){
  const state=snapshot(data);
  return state.pets.find(pet=>pet.id===state.expedition?.activePetId&&pet.state==='tamed')||null;
 }
 function persist(data){if(typeof db!=='undefined'&&data===db&&typeof save==='function')save();}
  function equip(data,id){ensure(data);if(!catalog[id]||data.petCollection[id]?.state!=='tamed')return false;data.expedition.activePetId=id;data.rewards.equippedPet=id;persist(data);return true;}
  function setAppearance(data,id,appearance){
   ensure(data);const pet=data?.petCollection?.[id];
   if(!catalog[id]||pet?.state!=='tamed'||!['base','bara'].includes(appearance)||appearance==='bara'&&pet.level<5)return false;
   pet.appearance=appearance;persist(data);return true;
  }
  function rename(data,id,name){
   ensure(data);if(!catalog[id]||data.petCollection[id]?.state!=='tamed')return false;
   const next=String(name||'').trim().replace(/\s+/g,' ').slice(0,24);
   if(!next||next.length<2)return false;
   data.petCollection[id].customName=next;persist(data);return true;
  }
 function assignGembokRescue(data,run,skillId){
  if(!data||!run||!run.gembok||run.demoMode||run.cancelled||!skillId)return null;
  ensure(data);if(run.rescuePetId)return {petId:run.rescuePetId,grade:run.rescueGrade,threshold:run.rescueThreshold};
  const grade=gradeFromSkill(skillId);if(!grade)return null;
  const access=rescueAccess(data,grade);
  // Earned early access persists, so a pet's rescue progress cannot become locked.
  data.petRescueAccess[grade]=access.tier;
  const previous=object(data.petRescueSchedule[grade]);
  const scores=previous.version===1?object(previous.scores):{};
  let petId=null,best=-Infinity,total=0;
  rescueOrder.forEach((id,i)=>{
   if(i>access.tier){scores[id]=0;return;}
   let weight=rescueWeights[i];
   if(access.normalTier>=2&&i<2)weight*=.28;
   if(i>access.normalTier)weight*=i-access.normalTier===1 ? .5 : .25;
   total+=weight;
   scores[id]=Math.max(-100,Math.min(100,Number(scores[id])||0))+weight;
   if(scores[id]>best){best=scores[id];petId=id;}
  });
  scores[petId]-=total;
  data.petRescueSchedule[grade]={version:1,scores};
  data.petRescueRotation[grade]=addCount(data.petRescueRotation[grade],1);
  const threshold=rescueThreshold(petId,grade);if(!threshold)return null;
  run.rescuePetId=petId;run.rescueGrade=grade;run.rescueSkillId=skillId;run.rescueThreshold=threshold;
  run.rescueEligibility={...access};
   /* Reserve the pet for this run only. It becomes encountered after the
      Gembok is actually completed, so abandoned runs never create 0/x cards. */
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
  let rescueAwarded=false,newlyTamed=false,rescues=null,alreadyTamed=false;
  const petTier=rescueOrder.indexOf(petId),assignedAccess=run.rescueEligibility;
  const eligible=catalog[petId]&&(assignedAccess
    ? petTier<=count(assignedAccess.tier)&&petTier<=count(data.petRescueAccess[grade])
    : playerLevel(data)>=catalog[petId].levelGate||data.petCollection[petId]?.state==='tamed');
  if(eligible&&threshold){
   const pet=data.petCollection[petId];
   alreadyTamed=pet.state==='tamed';
   pet.state=pet.state==='tamed'?'tamed':'encountered';pet.rescueGrade=grade;pet.rescues=addCount(pet.rescues,1);rescues=pet.rescues;rescueAwarded=true;
   newlyTamed=pet.state!=='tamed'&&pet.rescues>=threshold;
   if(newlyTamed){pet.state='tamed';pet.unlockedAt=now;data.rewards.pets[petId]={unlockedAt:now,collection:true};}
  }
  const activePet=data.petCollection[data.expedition.activePetId];let bondXpAwarded=false,evolvedPetName=null;const previousPetLevel=activePet?level(activePet.bondXp):0;
  if(activePet?.state==='tamed'){activePet.bondXp=addCount(activePet.bondXp,20);activePet.level=level(activePet.bondXp);activePet.evolutionStage=stage(data.expedition.activePetId,activePet.level);activePet.evolutionTheme=activePet.evolutionStage>0?'fire':null;activePet.evolutionState=evolutionName(activePet.evolutionStage);activePet.nextEvolution=milestonesFor(data.expedition.activePetId).find(milestone=>milestone>activePet.level)||null;bondXpAwarded=true;if(previousPetLevel<5&&activePet.level>=5)evolvedPetName=String(activePet.customName||catalog[data.expedition.activePetId].name);}
  data.gembokPetAwards[run.id]={at:now,route:run.route,petId,grade,skillId:run.rescueSkillId,rescues,threshold,rescueAwarded,bondXpAwarded,equippedPetId:bondXpAwarded?data.expedition.activePetId:null};
  persist(data);return {awarded:rescueAwarded||bondXpAwarded,petId,grade,rescues,threshold,newlyTamed,alreadyTamed,rescueAwarded,bondXpAwarded,evolvedPetName};
 }
  const api={ensure,snapshot,active,equip,rename,setAppearance,assignGembokRescue,awardGembokCompletion,catalog,rescueCycle,rescueAccess,rescueThreshold,graphSkillCount,gradeFromSkill,levelForXp:level,evolutionForLevel:(id,petLevel)=>stage(id,petLevel),evolutionMilestones,milestonesFor,playerLevel};
 root.PetCollection=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);


