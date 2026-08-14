// All SFX are bundled local assets so playback does not depend on a device synthesizer or network service.
const PA_AUDIO={
  attack:'assets/audio/attack.wav',
  enemyAttack:'assets/audio/enemy-attack.wav',
  hit:'assets/audio/hit.wav',
  finisher:'assets/audio/finisher.wav',
  auraCharge:'assets/audio/aura-charge.wav',
  wiraSword:'assets/audio/wira-heavy-metal-sword.wav',
  enemyDown:'assets/audio/enemy-down.wav',
  ui:'assets/audio/ui.wav',
  correct:'assets/audio/correct.wav',
  wrong:'assets/audio/wrong.wav'
};
const PA_AUDIO_CACHE={};
let paMuted=localStorage.getItem('pa_muted')==='1';
let paAudioUnlocked=false;

function preloadSfx(){
  Object.entries(PA_AUDIO).forEach(([name,src])=>{
    try{
      const a=new Audio();
      a.preload='auto';
      a.src=src;
      a.volume=name==='finisher'?.8:(name==='auraCharge'?.72:(name==='wiraSword'?.82:.65));
      a.load();
      PA_AUDIO_CACHE[name]=a;
    }catch(e){}
  });
}
function unlockSfx(){
  if(paAudioUnlocked)return;
  paAudioUnlocked=true;
  // Mobile browsers require the first playback to follow a user gesture.
  const a=PA_AUDIO_CACHE.ui;
  if(a&&!paMuted){
    try{a.volume=0.001;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.volume=.65;}).catch(()=>{a.volume=.65;});}catch(e){}
  }
}
function playSfx(name){
  if(paMuted)return;
  const src=PA_AUDIO[name]; if(!src)return;
  try{
    const base=PA_AUDIO_CACHE[name];
    const a=base?base.cloneNode(true):new Audio(src);
    a.volume=name==='finisher'?.8:(name==='auraCharge'?.72:(name==='wiraSword'?.82:.65));
    a.preload='auto';
    const p=a.play(); if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
function toggleSound(){
  paMuted=!paMuted; localStorage.setItem('pa_muted',paMuted?'1':'0');
  updateSoundButtons(); if(!paMuted){unlockSfx();playSfx('ui');}
}
function updateSoundButtons(){
  document.querySelectorAll('[data-sound-toggle]').forEach(b=>b.textContent=paMuted?'🔇':'🔊');
}
document.addEventListener('DOMContentLoaded',()=>{preloadSfx();updateSoundButtons();});
document.addEventListener('pointerdown',unlockSfx,{once:true,passive:true});
document.addEventListener('keydown',unlockSfx,{once:true});
