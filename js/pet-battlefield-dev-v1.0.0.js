/* Battlefield Dev: visual-only, session-scoped pet roster. */
(() => {
  'use strict';
  const PETS = [
    {id:'aurora', name:'Aurora', sad:['assets/pets/aurora/frames/sad-0-v1.webp','assets/pets/aurora/frames/sad-1-v1.webp','assets/pets/aurora/frames/sad-2-v1.webp','assets/pets/aurora/frames/sad-3-v1.webp','assets/pets/aurora/frames/sad-4-v1.webp','assets/pets/aurora/frames/sad-5-v1.webp','assets/pets/aurora/frames/sad-6-v1.webp','assets/pets/aurora/frames/sad-7-v1.webp'], happy:['assets/pets/aurora/frames/joy-0-v1.webp','assets/pets/aurora/frames/joy-1-v1.webp'], idle:'assets/pets/aurora/standby-v2.webp', idleSheet:'assets/pets/aurora/frames/companion-idle-v1.png'},
    {id:'ketupatKura', name:'Kura-Kura Ketupat', sadSheet:'assets/pets/collection/ketupat-kura/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/ketupat-kura/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/ketupat-kura/sad.png'], happy:['assets/pets/collection/ketupat-kura/happy.png'], idle:'assets/pets/collection/ketupat-kura/idle.png', idleSheet:'assets/pets/collection/ketupat-kura/companion-idle-v1.png'},
    {id:'kumbangManggis', name:'Kumbang Manggis', sadSheet:'assets/pets/collection/kumbang-manggis/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/kumbang-manggis/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/kumbang-manggis/sad.png'], happy:['assets/pets/collection/kumbang-manggis/happy.png'], idle:'assets/pets/collection/kumbang-manggis/idle.png', idleSheet:'assets/pets/collection/kumbang-manggis/companion-idle-v1.png'},
    {id:'harimauBunga', name:'Harimau Bunga', sadSheet:'assets/pets/collection/harimau-bunga/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/harimau-bunga/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/harimau-bunga/sad.png'], happy:['assets/pets/collection/harimau-bunga/happy.png'], idle:'assets/pets/collection/harimau-bunga/idle.png', idleSheet:'assets/pets/collection/harimau-bunga/companion-idle-v1.png'},
    {id:'arnabKekLapis', name:'Arnab Kek Lapis', sadSheet:'assets/pets/collection/arnab-kek-lapis/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/arnab-kek-lapis/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/arnab-kek-lapis/sad.png'], happy:['assets/pets/collection/arnab-kek-lapis/happy.png'], idle:'assets/pets/collection/arnab-kek-lapis/idle.png', idleSheet:'assets/pets/collection/arnab-kek-lapis/companion-idle-v1.png'},
    {id:'durianKerbau', name:'Kerbau Durian', sadSheet:'assets/pets/collection/durian-kerbau/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/durian-kerbau/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/durian-kerbau/sad.png'], happy:['assets/pets/collection/durian-kerbau/happy.png'], idle:'assets/pets/collection/durian-kerbau/idle.png', idleSheet:'assets/pets/collection/durian-kerbau/companion-idle-v1.png'}
  ];
  const active = () => !!(typeof sess !== 'undefined' && sess?.devBattlefield);
  const pet = () => PETS[Number(sess?.devBattlefieldPetIndex||0)%PETS.length];
  /* DEV Battlefield is still allowed to cycle pets deliberately, but it must
     open with the same companion shown as “Sedang ikut kamu” in Khazanah.
     Previously it always started from a separate visual index, so the stage
     could show Keurapat while the profile correctly had Aurora equipped. */
  function activePetIndex(){
    const activeId=window.PetCollection?.snapshot?.(db)?.pets?.find(item=>item.active&&item.state==='tamed')?.id
      || db?.expedition?.activePetId
      || db?.rewards?.equippedPet
      || 'aurora';
    const index=PETS.findIndex(item=>item.id===activeId);
    return index>=0?index:0;
  }
  function paintControls(){
    const button=document.querySelector('#segelDevControls button');
    if(button)button.textContent=`↻ Tukar Teman · ${pet().name}`;
  }
  function swap() { if(!active())return; sess.devBattlefieldPetIndex=(Number(sess.devBattlefieldPetIndex||0)+1)%PETS.length; const item=pet(); window.PASegelDemo?.setPet?.(item); paintControls(); }
  async function previewVictory() {
    if(!active())return;
    await window.PASegelDemo?.previewRescueHappy?.();
  }
  async function previewFinalBlow() {
    if(!active())return;
    await window.PASegelDemo?.previewFinalBlow?.();
  }
  function start() {
    if(!db||typeof isDevMode!=='function'||!isDevMode())return;
    if(active())return;
    const profileSnapshot=JSON.stringify(db);
    sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:'calibrate',recoveryFor:null,stretchFor:null,missionChapter:null,missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:true,devBattlefield:true,devBattlefieldDbSnapshot:profileSnapshot,devBattlefieldPetIndex:activePetIndex(),devBattlefieldVictory:false,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false,coachAdaptive:false,learningActive:false};
    closeDevPanel?.();resetBattlePresentation?.();document.body.classList.add('dev-battlefield');paintControls();
    if(typeof window.openSegelDemo==='function')window.openSegelDemo({devBattlefield:true,pet:pet()});
    else exit({fromSegel:true});
  }
  function exit(options={}) {
    if(!active())return;
    window.PASegelDemo?.pause?.();
    const snapshot=sess.devBattlefieldDbSnapshot;
    resetBattlePresentation?.();
    window.PASegelDemo?.clearMode?.();
    document.getElementById('segelDevControls')?.classList.add('hidden');
    document.getElementById('segelDone')?.setAttribute('hidden','');
    sess.devBattlefield=false;if(snapshot)db=JSON.parse(snapshot);
    document.body.classList.remove('dev-battlefield');renderHub();
  }
  window.startBattlefieldDev=start; window.swapBattlefieldPet=swap; window.previewBattlefieldVictory=previewVictory; window.previewBattlefieldFinalBlow=previewFinalBlow; window.exitBattlefieldDev=exit;
  window.PABattlefieldDev={active,pet,exit,items:PETS,
    setPet:item=>window.PASegelDemo?.setPet?.(item)};
  window.setTimeout(()=>{const original=window.learningStart;if(typeof original==='function'&&!original.__battlefieldSafe){const guarded=function(...args){if(active())return;return original.apply(this,args);};guarded.__battlefieldSafe=true;window.learningStart=guarded;}},0);
})();
