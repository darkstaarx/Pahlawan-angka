/* Battlefield Dev: visual-only, session-scoped pet roster. */
(() => {
  'use strict';
  const PETS = [
    {id:'aurora', name:'Aurora Ekor Angka', sad:['assets/pets/aurora/frames/sad-0-v1.webp','assets/pets/aurora/frames/sad-1-v1.webp','assets/pets/aurora/frames/sad-2-v1.webp','assets/pets/aurora/frames/sad-3-v1.webp','assets/pets/aurora/frames/sad-4-v1.webp','assets/pets/aurora/frames/sad-5-v1.webp','assets/pets/aurora/frames/sad-6-v1.webp','assets/pets/aurora/frames/sad-7-v1.webp'], happy:['assets/pets/aurora/frames/joy-0-v1.webp','assets/pets/aurora/frames/joy-1-v1.webp'], idle:'assets/pets/aurora/standby-v2.webp'},
    {id:'ketupatKura', name:'Kura-Kura Ketupat', sadSheet:'assets/pets/collection/ketupat-kura/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/ketupat-kura/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/ketupat-kura/sad.png'], happy:['assets/pets/collection/ketupat-kura/happy.png'], idle:'assets/pets/collection/ketupat-kura/idle.png'},
    {id:'kumbangManggis', name:'Kumbang Manggis', sadSheet:'assets/pets/collection/kumbang-manggis/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/kumbang-manggis/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/kumbang-manggis/sad.png'], happy:['assets/pets/collection/kumbang-manggis/happy.png'], idle:'assets/pets/collection/kumbang-manggis/idle.png'},
    {id:'harimauBunga', name:'Harimau Bunga', sadSheet:'assets/pets/collection/harimau-bunga/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/harimau-bunga/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/harimau-bunga/sad.png'], happy:['assets/pets/collection/harimau-bunga/happy.png'], idle:'assets/pets/collection/harimau-bunga/idle.png'},
    {id:'arnabKekLapis', name:'Arnab Kek Lapis', sadSheet:'assets/pets/collection/arnab-kek-lapis/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/arnab-kek-lapis/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/arnab-kek-lapis/sad.png'], happy:['assets/pets/collection/arnab-kek-lapis/happy.png'], idle:'assets/pets/collection/arnab-kek-lapis/idle.png'},
    {id:'durianKerbau', name:'Kerbau Durian', sadSheet:'assets/pets/collection/durian-kerbau/sprite-sheets/sad-v1.png', happySheet:'assets/pets/collection/durian-kerbau/sprite-sheets/happy-v1.png', sad:['assets/pets/collection/durian-kerbau/sad.png'], happy:['assets/pets/collection/durian-kerbau/happy.png'], idle:'assets/pets/collection/durian-kerbau/idle.png'}
  ];
  let frameTimer = null;
  const active = () => !!(typeof sess !== 'undefined' && sess?.devBattlefield);
  const pet = () => PETS[Number(sess?.devBattlefieldPetIndex||0)%PETS.length];
  const controls = () => document.getElementById('devBattlefieldControls');
  function setFrame(phase='sad') {
    if (!active()) return;
    const item=pet(), frames=phase==='happy'?item.happy:item.sad, sheet=phase==='happy'?item.happySheet:item.sadSheet;
    const idle=document.getElementById('battlePetIdle');
    if (!idle) return;
    idle.alt=`${item.name} ${phase==='happy'?'gembira':'sedih'}`;
    idle.dataset.framePhase=phase;
    if (frameTimer) clearInterval(frameTimer);
    if (sheet) {
      idle.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      idle.style.backgroundImage=`url("${sheet}")`;
      idle.style.backgroundSize='200% 200%';
      idle.style.backgroundRepeat='no-repeat';
      idle.style.animation='paPetSheet2x2 1.1s steps(1,end) infinite';
      return;
    }
    idle.style.backgroundImage='';idle.style.backgroundSize='';idle.style.backgroundRepeat='';idle.style.animation='';
    idle.src=frames[0]||item.idle;
    if (frames.length>1) {
      let i=0;
      frameTimer=setInterval(()=>{ if(!active())return; i=(i+1)%frames.length; idle.src=frames[i]; },180);
    }
  }
  function render() {
    if (!active()) return;
    const item=pet(),wrap=document.getElementById('battlePet'),idle=document.getElementById('battlePetIdle'),a=document.getElementById('battlePetAnticipation'),b=document.getElementById('battlePetAttack'),f=document.getElementById('battlePetFollowThrough');
    if (!wrap||!idle) return;
    wrap.dataset.pet=item.id; wrap.style.setProperty('--pet-art-scale','1'); wrap.classList.remove('hidden');
    [a,b,f].forEach(x=>{if(x){x.src=item.sad[0]||item.idle;x.alt=item.name;}});
    setFrame(sess.devBattlefieldVictory?'happy':'sad');
    const button=controls()?.querySelector('button'); if(button)button.textContent=`↻ Swap Pet · ${item.name}`;
  }
  function swap() { if(!active())return; sess.devBattlefieldPetIndex=(Number(sess.devBattlefieldPetIndex||0)+1)%PETS.length; sess.devBattlefieldVictory=false; render(); }
  function start() {
    if(!db||typeof isDevMode!=='function'||!isDevMode())return;
    if(active())return;
    const profileSnapshot=JSON.stringify(db);
    sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:'calibrate',recoveryFor:null,stretchFor:null,missionChapter:null,missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:true,devBattlefield:true,devBattlefieldDbSnapshot:profileSnapshot,devBattlefieldPetIndex:0,devBattlefieldVictory:false,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false,coachAdaptive:true,learningActive:false};
    closeDevPanel?.();resetBattlePresentation?.();document.body.classList.add('dev-battlefield'); document.getElementById('devBattlefieldControls')?.classList.remove('hidden');
    applyHeroToBattle(); applyEnemyVariant(true); updateMissionHud(); nextQ(); battle(); screen('game'); render();
  }
  function victory() { if(active()){sess.devBattlefieldVictory=true; render();} }
  function exit() {
    if(!active())return;
    if(frameTimer)clearInterval(frameTimer);frameTimer=null;
    const snapshot=sess.devBattlefieldDbSnapshot,frames=document.querySelectorAll('.battle-pet-frame');
    resetBattlePresentation?.();
    frames.forEach(frame=>{frame.style.backgroundImage='';frame.style.backgroundSize='';frame.style.backgroundRepeat='';frame.style.animation='';delete frame.dataset.framePhase;});
    sess.devBattlefield=false;if(snapshot)db=JSON.parse(snapshot);
    document.body.classList.remove('dev-battlefield');controls()?.classList.add('hidden');renderHub();
  }
  window.startBattlefieldDev=start; window.swapBattlefieldPet=swap; window.exitBattlefieldDev=exit;
  window.PABattlefieldDev={active,pet,render,victory,setFrame,exit,items:PETS};
  window.setTimeout(()=>{const original=window.learningStart;if(typeof original==='function'&&!original.__battlefieldSafe){const guarded=function(...args){if(active())return;return original.apply(this,args);};guarded.__battlefieldSafe=true;window.learningStart=guarded;}},0);
})();
