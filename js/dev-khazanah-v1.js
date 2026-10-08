/* Developer-only Khazanah preview. All unlocks live on a disposable clone. */
(() => {
 'use strict';
 let preview=null,owner=null,form='bara';
 const allowed=()=>typeof db!=='undefined'&&db&&typeof isDevMode==='function'&&isDevMode();
 const active=()=>!!preview&&db===owner&&allowed();
 function withPreview(action){
  if(db===preview)return action();
  if(!active())return;
  const previous=swapDemoState(preview,{...sess,demoMode:true,devKhazanah:true});
  try{return action()}finally{swapDemoState(previous.db,previous.sess)}
 }
 function applyForm(){
  for(const id of Object.keys(PetCollection.catalog))preview.petCollection[id]={...preview.petCollection[id],state:'tamed',bondXp:form==='bara'?400:0};
  PetCollection.ensure(preview);
 }
 function toolbar(){
  if(!active())return;
  let bar=document.getElementById('devKhazanahBar');
  if(!bar){
   bar=document.createElement('section');bar.id='devKhazanahBar';bar.className='devKhazanahBar';
   bar.innerHTML='<div><b>DEV · Khazanah penuh</b><small>Preview sahaja · tiada progress sebenar diubah</small></div><div class="devKhazanahActions"><button type="button" data-form="asas">Asas</button><button type="button" data-form="bara">Bara · Tahap 5</button><button type="button" data-exit>Tutup preview</button></div><div class="devEvolutionControls"><label for="devEvolutionPet">Pratonton Evolusi Bara</label><select id="devEvolutionPet" aria-label="Pilih Teman untuk animasi evolusi"></select><button type="button" data-evolution-play>Main Preview Evolusi</button></div>';
   document.getElementById('treasure')?.prepend(bar);
   document.getElementById('treasure')?.setAttribute('data-dev-khazanah','');
   bar.querySelectorAll('[data-form]').forEach(button=>button.onclick=()=>setForm(button.dataset.form));
   bar.querySelector('[data-exit]').onclick=()=>stop(true);
   const selector=bar.querySelector('#devEvolutionPet');
   for(const [id,pet] of Object.entries(PetCollection.catalog)){
    const opt=document.createElement('option');opt.value=id;opt.textContent=pet.name;
    selector.appendChild(opt);
   }
   selector.value=PetCollection.catalog.ketupatKura?'ketupatKura':Object.keys(PetCollection.catalog)[0];
   bar.querySelector('[data-evolution-play]').onclick=()=>previewEvolution(selector.value);
  }
  bar.querySelectorAll('[data-form]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.form===form)));
 }
 function tab(value){
  if(!active())return;
  for(const [id,key] of [['petCollection','pets'],['auraCollection','auras'],['badgeCollection','badges']])document.getElementById(id)?.classList.toggle('hidden',value!==key);
  for(const [id,key] of [['treasurePetTab','pets'],['treasureAuraTab','auras'],['treasureBadgeTab','badges']])document.getElementById(id)?.classList.toggle('active',value===key);
  withPreview(()=>{window.PAPetStage?.tab?.(value);window.PAKhazanah?.paint?.()});
 }
 function setForm(value){
  if(!active()||!['asas','bara'].includes(value))return;
  form=value;applyForm();withPreview(()=>renderTreasure());tab('pets');toolbar();
 }
 // Preview playback uses a second clone. Even when the toolbar is in Asas
 // mode, force Level 5 only in this disposable snapshot, never in the owner.
 function previewEvolution(id){
  if(!active()||!window.PATemanReveal?.showEvolution||!PetCollection.catalog[id])return false;
  const demo=JSON.parse(JSON.stringify(preview));
  demo.petCollection=demo.petCollection||{};
  demo.petCollection[id]={...demo.petCollection[id],state:'tamed',bondXp:400};
  PetCollection.ensure(demo);
  const pet=PetCollection.snapshot(demo).pets.find(p=>p.id===id&&p.evolutionStage>0);
  if(!pet)return false;
  return !!window.PATemanReveal.showEvolution({evolvedPetName:pet.name},{profile:demo,petId:id,preview:true});
 }
 function start(){
  if(!allowed()||!window.PetCollection||typeof swapDemoState!=='function')return false;
  stop(false);owner=db;preview=JSON.parse(JSON.stringify(db));form='bara';
  Object.assign(preview,{demoMode:true,devMode:true,level:60,petCollectionMigrationVersion:2,petProgressionVersion:4,shopWelcomeV1:true});
  preview.petCollection=preview.petCollection||{};preview.rewards=preview.rewards||{};
  const stamp={unlockedAt:Date.now(),devPreview:true};
  for(const [key,items] of [['auras',typeof REWARD_AURAS!=='undefined'?REWARD_AURAS:{}],['badges',typeof REWARD_BADGES!=='undefined'?REWARD_BADGES:{}]])preview.rewards[key]=Object.fromEntries(Object.keys(items).map(id=>[id,{...stamp}]));
  applyForm();installWrappers();closeDevPanel();withPreview(()=>openTreasure());tab('pets');toolbar();return true;
 }
 function stop(goBack=false){
  const wasActive=!!preview;preview=null;owner=null;document.getElementById('devKhazanahBar')?.remove();document.getElementById('treasure')?.removeAttribute('data-dev-khazanah');
  if(wasActive&&goBack&&typeof renderHub==='function')renderHub();
 }
 function installWrappers(){
  for(const name of ['renderTreasure','openTreasure','equipCollectionPet','equipPet','unequipPet','equipAura','unequipAura']){
   const original=window[name];if(typeof original!=='function'||original.__devKhazanah)continue;
   const wrapped=function(...args){return active()||db===preview?withPreview(()=>original.apply(this,args)):original.apply(this,args)};
   wrapped.__devKhazanah=true;window[name]=wrapped;
  }
  const originalTab=window.treasureTab;
  if(typeof originalTab==='function'&&!originalTab.__devKhazanah){const wrapped=function(value){return active()?tab(value):originalTab.apply(this,arguments)};wrapped.__devKhazanah=true;window.treasureTab=wrapped;}
  // The Khazanah cards normally read the real db. Route their replay button
  // to the disposable Dev preview instead while this toolbar is active.
  const replay=window.previewCollectionEvolution;
  if(typeof replay==='function'&&!replay.__devKhazanah){
   const wrapped=function(id){return active()?previewEvolution(id):replay.apply(this,arguments)};
   wrapped.__devKhazanah=true;window.previewCollectionEvolution=wrapped;
  }
  const rename=window.renameCollectionPet;
  if(typeof rename==='function'&&!rename.__devKhazanah){const wrapped=function(...args){if(active()){showRewardToast?.('Tukar nama dalam Khazanah biasa');return}return rename.apply(this,args)};wrapped.__devKhazanah=true;window.renameCollectionPet=wrapped;}
 }
 function mount(){
  const host=document.getElementById('devVisualTools');if(!host||document.getElementById('devKhazanahBtn'))return;
  const button=document.createElement('button');button.id='devKhazanahBtn';button.type='button';button.className='btn ghost small';button.textContent='Khazanah penuh · Asas / Bara';button.onclick=start;host.appendChild(button);
 }
 function install(){
  mount();installWrappers();
  const render=window.renderDevPanel;
  if(typeof render==='function'&&!render.__devKhazanah){const wrapped=function(...args){const value=render.apply(this,args);mount();return value};wrapped.__devKhazanah=true;window.renderDevPanel=wrapped;}
  new MutationObserver(()=>{if(preview&&(db!==owner||!allowed()||document.body.dataset.screen!=='treasure'))stop(false)}).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
 }
 window.PADevKhazanah={start,stop,setForm,previewEvolution,active,state:()=>({active:active(),form,petCount:preview?Object.keys(PetCollection.catalog).length:0})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
