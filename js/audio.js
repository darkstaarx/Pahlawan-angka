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
const PA_BATTLE_AUDIO={ctx:null,master:null,windGain:null,bossGain:null,bossTimer:null,mode:'off'};

function ensureBattleAudio(){
  if(PA_BATTLE_AUDIO.ctx)return PA_BATTLE_AUDIO.ctx;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return null;
  try{
    const ctx=new AudioCtx(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    const seconds=4,buffer=ctx.createBuffer(1,ctx.sampleRate*seconds,ctx.sampleRate),data=buffer.getChannelData(0);let smooth=0;
    for(let i=0;i<data.length;i++){smooth=smooth*.985+(Math.random()*2-1)*.015;data[i]=smooth*.9+(Math.random()*2-1)*.1}
    const wind=ctx.createBufferSource(),windFilter=ctx.createBiquadFilter(),windGain=ctx.createGain();wind.buffer=buffer;wind.loop=true;windFilter.type='lowpass';windFilter.frequency.value=720;windFilter.Q.value=.45;windGain.gain.value=0;wind.connect(windFilter).connect(windGain).connect(master);wind.start();
    const windLfo=ctx.createOscillator(),windDepth=ctx.createGain();windLfo.frequency.value=.08;windDepth.gain.value=.008;windLfo.connect(windDepth).connect(windGain.gain);windLfo.start();
    const bossGain=ctx.createGain(),bossFilter=ctx.createBiquadFilter();bossGain.gain.value=0;bossFilter.type='lowpass';bossFilter.frequency.value=520;bossGain.connect(bossFilter).connect(master);
    /* Keep the boss chord above phone speakers' weak sub-bass range. */
    [[110,'triangle',.32],[164.81,'sine',.2],[220,'triangle',.11]].forEach(([frequency,type,level])=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.value=level;osc.connect(gain).connect(bossGain);osc.start()});
    const bossLfo=ctx.createOscillator(),bossDepth=ctx.createGain();bossLfo.frequency.value=.42;bossDepth.gain.value=.018;bossLfo.connect(bossDepth).connect(bossGain.gain);bossLfo.start();
    Object.assign(PA_BATTLE_AUDIO,{ctx,master,windGain,bossGain});return ctx;
  }catch(e){return null}
}
function bossDrum(){
  const {ctx,bossGain}=PA_BATTLE_AUDIO;if(!ctx||!bossGain||PA_BATTLE_AUDIO.mode!=='boss'||paMuted||ctx.state!=='running')return;
  [0,.42].forEach((offset,index)=>{const at=ctx.currentTime+offset,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(index?96:124,at);osc.frequency.exponentialRampToValueAtTime(58,at+.18);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(index?.13:.18,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.24);osc.connect(gain).connect(bossGain);osc.start(at);osc.stop(at+.26)});
}
function setBattleAudioMode(mode='off'){
  PA_BATTLE_AUDIO.mode=mode;
  clearInterval(PA_BATTLE_AUDIO.bossTimer);PA_BATTLE_AUDIO.bossTimer=null;
  if(!paAudioUnlocked)return;
  const ctx=ensureBattleAudio();if(!ctx)return;if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const activeMode=paMuted?'off':mode,now=ctx.currentTime,fade=.75,target=activeMode==='off'?0:.42;PA_BATTLE_AUDIO.master.gain.cancelScheduledValues(now);PA_BATTLE_AUDIO.master.gain.setTargetAtTime(target,now,fade/3);
  PA_BATTLE_AUDIO.windGain.gain.cancelScheduledValues(now);PA_BATTLE_AUDIO.windGain.gain.setTargetAtTime(activeMode==='ambient'?.16:activeMode==='boss'?.06:0,now,fade/3);
  PA_BATTLE_AUDIO.bossGain.gain.cancelScheduledValues(now);PA_BATTLE_AUDIO.bossGain.gain.setTargetAtTime(activeMode==='boss'?.075:0,now,fade/3);
  if(activeMode==='boss'){bossDrum();PA_BATTLE_AUDIO.bossTimer=setInterval(bossDrum,1600)}
}
function syncBattleAudio(screenId=document.body?.dataset?.screen){
  if(screenId!=='game')return setBattleAudioMode('off');
  setBattleAudioMode(sess?.enemyTier==='boss'&&!sess?.bossDefeated?'boss':'ambient');
}

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
  ensureBattleAudio();syncBattleAudio();
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
  updateSoundButtons();if(paMuted)setBattleAudioMode('off');else{unlockSfx();syncBattleAudio();playSfx('ui');}
}
function updateSoundButtons(){
  document.querySelectorAll('[data-sound-toggle]').forEach(b=>b.textContent=paMuted?'🔇':'🔊');
}
document.addEventListener('DOMContentLoaded',()=>{preloadSfx();updateSoundButtons();});
document.addEventListener('pointerdown',unlockSfx,{once:true,passive:true});
document.addEventListener('keydown',unlockSfx,{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setBattleAudioMode('off');else syncBattleAudio()});
