/* Cosmetic companions only. No mastery, answer, combat or timer modifiers. */
(function(root){
 'use strict';
 const rarities={Common:{weight:50,tame:.85,pity:3},Uncommon:{weight:28,tame:.65,pity:4},Rare:{weight:14,tame:.45,pity:5},Epic:{weight:6,tame:.28,pity:6},Legendary:{weight:2,tame:.12,pity:8}};
 const catalog={aurora:{rarity:'Starter',folder:null},ketupatKura:{rarity:'Common',folder:'ketupat-kura'},kumbangManggis:{rarity:'Uncommon',folder:'kumbang-manggis'},harimauBunga:{rarity:'Rare',folder:'harimau-bunga'},arnabKekLapis:{rarity:'Epic',folder:'arnab-kek-lapis'},durianKerbau:{rarity:'Legendary',folder:'durian-kerbau'}};
 const zones=[{id:'rimba',name:'Rimba Permulaan',rank:1,rarities:['Common','Uncommon','Rare']},{id:'mekar',name:'Lembah Mekar',rank:3,rarities:['Common','Uncommon','Rare','Epic']},{id:'bintang',name:'Puncak Bintang',rank:5,rarities:Object.keys(rarities)}];
 const MAX_COUNT=Number.MAX_SAFE_INTEGER;
 const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.min(MAX_COUNT,Math.floor(Number(x)))):0;
 const addCount=(a,b)=>Math.min(MAX_COUNT,count(a)+count(b));
 const level=x=>Math.min(60,1+Math.floor(count(x)/100));
 const stage=x=>x>=45?3:x>=25?2:x>=10?1:0;
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 function ensure(data,now=Date.now()){
  if(!data)return null;
  data.rewards=object(data.rewards);data.rewards.pets=object(data.rewards.pets);data.petCollection=object(data.petCollection);
  Object.entries(catalog).forEach(([id,meta])=>{
   const old=object(data.petCollection[id]),legacy=data.rewards.pets[id];
   const owned=id==='aurora'||old.state==='tamed'||!!legacy;
   const xp=count(old.bondXp),lv=level(xp);
   data.petCollection[id]={...old,state:owned?'tamed':old.state==='encountered'?'encountered':'unseen',rarity:meta.rarity,encounters:count(old.encounters),tameProgress:count(old.tameProgress),petTrace:count(old.petTrace),bondXp:xp,level:lv,evolutionStage:stage(lv),unlockedAt:owned?(count(old.unlockedAt)||count(legacy?.unlockedAt)||now):null};
   if(owned&&!legacy)data.rewards.pets[id]={unlockedAt:data.petCollection[id].unlockedAt,collection:true};
  });
  const e=object(data.expedition),xp=count(e.xp),requested=e.activePetId||data.rewards.equippedPet;
  data.expedition={...e,version:1,xp,rank:1+Math.floor(xp/100),activePetId:data.petCollection[requested]?.state==='tamed'?requested:'aurora',encounterPity:Math.min(3,count(e.encounterPity)),nextSession:count(e.nextSession),claimedThrough:count(e.claimedThrough)};
  data.rewards.equippedPet=data.expedition.activePetId;
  return data;
 }
 function zoneFor(rank){return zones.filter(z=>rank>=z.rank).slice(-1)[0]||zones[0];}
 function snapshot(data){
  ensure(data);if(!data)return {pets:[],expedition:null,zone:zones[0]};
  return {pets:Object.entries(catalog).map(([id,meta])=>{
   const item=typeof REWARD_PETS!=='undefined'?REWARD_PETS[id]:{id,name:id};
   const assets=meta.folder?{happy:`assets/pets/collection/${meta.folder}/happy.png`,sad:`assets/pets/collection/${meta.folder}/sad.png`}:{happy:'assets/pets/aurora/standby-v2.webp',sad:'assets/pets/aurora/standby-v2.webp'};
   return {...item,...data.petCollection[id],id,assets,active:data.expedition.activePetId===id};
  }),expedition:{...data.expedition},zone:zoneFor(data.expedition.rank)};
 }
 function persist(data){if(typeof db!=='undefined'&&data===db&&typeof save==='function')save();}
 function equip(data,id){ensure(data);if(!catalog[id]||data.petCollection[id]?.state!=='tamed')return false;data.expedition.activePetId=id;data.rewards.equippedPet=id;persist(data);return true;}
 function random(rng){const n=Number(rng());return Number.isFinite(n)?Math.max(0,Math.min(1-Number.EPSILON,n)):1-Number.EPSILON;}
 function rollPet(rank,rng){const zone=zoneFor(rank),entries=Object.entries(catalog).filter(([,p])=>zone.rarities.includes(p.rarity)),total=entries.reduce((n,[,p])=>n+rarities[p.rarity].weight,0);let r=random(rng)*total;for(const [id,p] of entries){r-=rarities[p.rarity].weight;if(r<0)return id;}return entries[entries.length-1][0];}
 /* This is the only award entry point. PAProductionJourney.complete() calls it
    only after the real 2 -> 3 -> 5 Gembok sequence is complete. */
 function awardGembokCompletion(data,run,options={}){
  const deny=reason=>({awarded:false,reason});
  if(!data||!run||!run.gembok||run.demoMode||run.cancelled||!run.completed)return deny('not-completed-gembok');
  ensure(data);data.gembokPetAwards=object(data.gembokPetAwards);
  if(data.gembokPetAwards[run.id])return deny('already-awarded');
  const rng=options.rng||Math.random,now=options.now??Date.now(),e=data.expedition,petId=e.activePetId;
  if(data.petCollection[petId]?.state!=='tamed')return deny('invalid-companion');
  data.gembokPetAwards[run.id]={at:now,route:run.route};
  e.xp=addCount(e.xp,25);e.rank=1+Math.floor(e.xp/100);
  const active=data.petCollection[petId];active.bondXp=addCount(active.bondXp,20);active.level=level(active.bondXp);active.evolutionStage=stage(active.level);
  const result={awarded:true,rankXp:25,bondXp:20,petId,encounter:null};
  if(e.encounterPity<3&&random(rng)>=.65+.1*e.encounterPity){e.encounterPity=addCount(e.encounterPity,1);persist(data);return result;}
  e.encounterPity=0;
  const id=rollPet(e.rank,rng),pet=data.petCollection[id],rule=rarities[pet.rarity];pet.encounters=addCount(pet.encounters,1);
  if(pet.state==='tamed'){pet.petTrace=addCount(pet.petTrace,1);result.encounter={petId:id,outcome:'duplicate',trace:1};}
  else{
   pet.state='encountered';const chance=pet.encounters>=rule.pity?1:Math.min(.95,rule.tame+.1*pet.tameProgress);
   if(random(rng)<chance){pet.state='tamed';pet.unlockedAt=now;data.rewards.pets[id]={unlockedAt:now,collection:true};result.encounter={petId:id,outcome:'tamed',chance};}
   else{pet.tameProgress=addCount(pet.tameProgress,1);pet.petTrace=addCount(pet.petTrace,1);result.encounter={petId:id,outcome:'fled',chance,trace:1};}
  }
  persist(data);return result;
 }
 const api={ensure,snapshot,equip,awardGembokCompletion,catalog,rarities,zones,zoneFor,levelForXp:level,evolutionForLevel:stage};
 root.PetCollection=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
