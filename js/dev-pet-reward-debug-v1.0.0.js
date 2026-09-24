/* Developer-only pet reward inspector. It always simulates on a deep clone. */
(function(root){
 'use strict';
 const copy=value=>JSON.parse(JSON.stringify(value||{}));
 const integer=(value,fallback,min,max)=>{
  const number=Number(value);
  if(!Number.isFinite(number))return fallback;
  return Math.max(min,Math.min(max,Math.floor(number)));
 };
 const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const multiplierByRarity={Common:70,Uncommon:100,Rare:140,Epic:180,Legendary:240};
 const skillForGrade=grade=>{
  const skills=root.GRAPH?.skills;
  if(!Array.isArray(skills))return null;
  return skills.find(skill=>Number(skill.grade)===grade||root.PetCollection?.gradeFromSkill(skill.id)===grade)?.id||null;
 };
 function inspect(data,options={}){
  const pets=root.PetCollection;
  if(!pets||!data)return {available:false,reason:'PetCollection atau profil belum tersedia.'};
  const grade=integer(options.grade,integer(data.schoolGrade,1,1,6),1,6);
  const level=integer(options.level,pets.playerLevel(data),1,60);
  const rotation=integer(options.rotation,0,0,999999);
  const skillId=skillForGrade(grade);
  if(!skillId)return {available:false,reason:'Knowledge graph untuk Darjah '+grade+' belum tersedia.'};

  /* The production helpers deliberately mutate their input. Never pass db here. */
  const before=copy(data);
  before.level=level;
  pets.ensure(before);
  before.petRescueRotation[grade]=rotation;
  const run={id:'dev-pet-reward-preview',gembok:true,route:'debug',completed:true};
  const assignment=pets.assignGembokRescue(before,run,skillId);
  if(!assignment)return {available:false,reason:'Gembok ini belum boleh dipetakan kepada pet.'};

  const petId=assignment.petId,meta=pets.catalog[petId],pet=before.petCollection[petId],stateBefore=pet.state;
  const startingRescues=Number(pet.rescues||0);
  const nearUnlock=Boolean(options.nearUnlock)&&pet.state!=='tamed'&&level>=meta.levelGate;
  if(nearUnlock)pet.rescues=Math.max(startingRescues,Math.max(0,assignment.threshold-1));
  const rescueBefore=Number(pet.rescues||0);
  const activeId=before.expedition.activePetId,activeBefore=Number(before.petCollection[activeId]?.bondXp||0);
  const awarded=pets.awardGembokCompletion(before,run,{now:0});
  const after=before.petCollection[petId],activeAfter=Number(before.petCollection[activeId]?.bondXp||0);
  const cycle=pets.rescueCycle;
  return {
   available:true,grade,level,rotation,cyclePosition:(rotation%cycle.length)+1,cycleLength:cycle.length,
   skillId,petId,petName:meta.name,rarity:meta.rarity,gate:meta.levelGate,eligible:level>=meta.levelGate,
   graphSkills:pets.graphSkillCount(grade),threshold:assignment.threshold,
   multiplier:multiplierByRarity[meta.rarity]||100,
   currentRescues:startingRescues,rescueBefore,rescueAfter:Number(after.rescues||0),
   stateBefore:nearUnlock?'simulasi-hampir-jinak':stateBefore,stateAfter:after.state,
   nearUnlock,newlyTamed:Boolean(awarded.newlyTamed),rescueAwarded:Boolean(awarded.rescueAwarded),
   remaining:Math.max(0,assignment.threshold-Number(after.rescues||0)),
   activePetId:activeId,activePetName:pets.catalog[activeId]?.name||activeId,
   bondXpBefore:activeBefore,bondXpAfter:activeAfter,bondXpAwarded:Boolean(awarded.bondXpAwarded)
  };
 }

 const state={grade:null,level:null,rotation:0,nearUnlock:false};
 function readState(){
  const data=root.db;
  if(state.grade===null)state.grade=integer(data?.schoolGrade,1,1,6);
  if(state.level===null)state.level=integer(root.PetCollection?.playerLevel(data),1,1,60);
  return inspect(data,{...state});
 }
 function markup(report){
  if(!report.available)return '<section class="devScenario petRewardDebug"><b>Pet Reward Debug</b><p class="mut devMiniCopy">'+esc(report.reason)+'</p></section>';
  const formula=report.graphSkills+' kemahiran unik × '+report.multiplier+'% = '+report.threshold+' Gembok';
  const gate=report.eligible?'Layak menerima rescue':'Terkunci — perlu tahap pemain '+report.gate;
  const forecast=report.newlyTamed?'✓ Akan dijinakkan selepas Gembok ini':report.eligible?'Selepas Gembok: '+report.rescueAfter+'/'+report.threshold+' rescue':'Tiada rescue sehingga tahap '+report.gate;
  const bond=report.bondXpAwarded?'+20 Bond XP untuk '+report.activePetName:'Tiada Bond XP (tiada Teman aktif)';
  const progress=Math.min(100,Math.round(report.rescueAfter/Math.max(1,report.threshold)*100));
  return [
   '<section class="devScenario petRewardDebug">',
    '<div class="petRewardDebugHead"><div><span class="petRewardKicker">SIMULASI SAHAJA · DATA TIDAK DISIMPAN</span><b>Pet Reward Debug</b></div><span class="petRewardBadge">'+esc(report.rarity)+'</span></div>',
    '<p class="mut devMiniCopy">Ikut logik Gembok sebenar: satu pet dipilih daripada kitaran tetap, kemudian rescue hanya dikreditkan jika gate tahap dipenuhi.</p>',
    '<div class="petRewardControls">',
      '<label>Darjah<select data-pet-debug="grade">'+[1,2,3,4,5,6].map(grade=>'<option value="'+grade+'"'+(grade===report.grade?' selected':'')+'>Darjah '+grade+'</option>').join('')+'</select></label>',
      '<label>Tahap pemain<input data-pet-debug="level" type="number" min="1" max="60" value="'+report.level+'"></label>',
    '</div>',
    '<div class="petRewardPet"><div><small>Gembok seterusnya · Kitaran '+report.cyclePosition+'/'+report.cycleLength+'</small><strong>'+esc(report.petName)+'</strong><span>'+esc(gate)+'</span></div><div class="petRewardStep"><button type="button" data-pet-debug-action="previous" aria-label="Gembok sebelumnya">←</button><button type="button" data-pet-debug-action="next" aria-label="Gembok seterusnya">→</button></div></div>',
    '<div class="petRewardProgress"><div><span>Rescue '+report.rescueAfter+' / '+report.threshold+'</span><b>'+report.remaining+' lagi</b></div><i><em style="width:'+progress+'%"></em></i></div>',
    '<div class="petRewardFacts"><span><b>Formula</b>'+esc(formula)+'</span><span><b>Selepas satu Gembok</b>'+esc(forecast)+'</span><span><b>Teman aktif</b>'+esc(bond)+'</span></div>',
    '<div class="petRewardActions"><button type="button" class="btn '+(report.nearUnlock?'devPrimary':'ghost')+' small" data-pet-debug-action="near">'+(report.nearUnlock?'✓ Simulasi hampir jinak':'Simulasi hampir jinak')+'</button><button type="button" class="btn ghost small" data-pet-debug-action="reset">Reset paparan</button></div>',
   '</section>'
  ].join('');
 }
 function mount(){
  const host=root.document?.getElementById('devPetRewardDebug');
  if(!host)return;
  const report=readState();
  host.innerHTML=markup(report);
  host.querySelectorAll('[data-pet-debug]').forEach(control=>control.addEventListener('change',event=>{
   const key=event.currentTarget.dataset.petDebug;
   state[key]=integer(event.currentTarget.value,state[key]||1,key==='grade'?1:1,key==='grade'?6:60);
   mount();
  }));
  host.querySelectorAll('[data-pet-debug-action]').forEach(button=>button.addEventListener('click',event=>{
   const action=event.currentTarget.dataset.petDebugAction;
   if(action==='previous')state.rotation=Math.max(0,state.rotation-1);
   if(action==='next')state.rotation+=1;
   if(action==='near')state.nearUnlock=!state.nearUnlock;
   if(action==='reset'){state.grade=integer(root.db?.schoolGrade,1,1,6);state.level=integer(root.PetCollection?.playerLevel(root.db),1,1,60);state.rotation=0;state.nearUnlock=false;}
   mount();
  }));
 }
 function install(){
  if(!root.document)return;
  const previous=root.renderDevPanel;
  if(typeof previous==='function'&&!previous.__petRewardDebug){
   const wrapped=function(){const value=previous.apply(this,arguments);mount();return value;};
   wrapped.__petRewardDebug=true;root.renderDevPanel=wrapped;
  }
  mount();
 }
 const api={inspect,mount,install};
 root.PADevPetRewardDebug=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 install();
})(typeof window!=='undefined'?window:globalThis);
