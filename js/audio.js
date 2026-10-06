// All SFX are bundled local assets so playback does not depend on a device synthesizer or network service.
const PA_AUDIO={
  attack:'assets/audio/attack.wav',
  enemyAttack:'assets/audio/enemy-attack.wav',
  hit:'assets/audio/hit.wav',
  finisher:'assets/audio/finisher.wav',
  auraCharge:'assets/audio/aura-charge.wav',
  chargeup:'assets/audio/chargeup.mp3',
  wiraSword:'assets/audio/wira-heavy-metal-sword.wav',
  swordSlash:'assets/audio/sword-slash-v2.wav',
  finisherSwing:'assets/audio/sword-slash-v2.wav',
  coinPickup:'assets/audio/coin-pickup.wav',
  victoryStinger:'assets/audio/StingerPA.mp3',
  enemyDown:'assets/audio/enemy-down.wav',
  ui:'assets/audio/ui.wav',
  correct:'assets/audio/correct.wav',
  wrong:'assets/audio/wrong.wav'
};
const PA_AUDIO_CACHE={};
const PA_VOLUME_SCALE=.8;
const PA_BATTLE_MUSIC_VOLUME=.024; // 70% lower than prior mix
const PA_BATTLE_MUSIC_RATE=1; // PAMusic already authored at the intended slower tempo
const PA_VICTORY_STINGER_VOLUME=.82;
const PA_VICTORY_MUSIC_FADE_MS=1200;
const PA_VICTORY_STINGER_DELAY_MS=850;
let paMuted=localStorage.getItem('pa_muted')==='1';
let paAudioUnlocked=false;
const PA_BATTLE_AUDIO={ctx:null,master:null,bossGain:null,bossTimer:null,forest:null,forestFade:null,music:null,musicFade:null,musicIndex:-1,musicTracks:['assets/audio/PAMusic.mp3'],victoryStinger:null,victoryActive:false,mode:'off'};

function ensureBattleAudio(){
  if(PA_BATTLE_AUDIO.ctx)return PA_BATTLE_AUDIO.ctx;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return null;
  try{
    const ctx=new AudioCtx(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    const bossGain=ctx.createGain(),bossFilter=ctx.createBiquadFilter();bossGain.gain.value=0;bossFilter.type='lowpass';bossFilter.frequency.value=520;bossGain.connect(bossFilter).connect(master);
    /* Keep the boss chord above phone speakers' weak sub-bass range. */
    [[110,'triangle',.32],[164.81,'sine',.2],[220,'triangle',.11]].forEach(([frequency,type,level])=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.value=level;osc.connect(gain).connect(bossGain);osc.start()});
    const bossLfo=ctx.createOscillator(),bossDepth=ctx.createGain();bossLfo.frequency.value=.42;bossDepth.gain.value=.018;bossLfo.connect(bossDepth).connect(bossGain.gain);bossLfo.start();
    Object.assign(PA_BATTLE_AUDIO,{ctx,master,bossGain,forest:null});return ctx;
  }catch(e){return null}
}
function fadeForestAmbience(target){
  const forest=PA_BATTLE_AUDIO.forest;if(!forest)return;clearInterval(PA_BATTLE_AUDIO.forestFade);PA_BATTLE_AUDIO.forestFade=null;
  if(target>0){const p=forest.play();if(p&&p.catch)p.catch(()=>{})}
  const from=Number(forest.volume||0),steps=12;let step=0;PA_BATTLE_AUDIO.forestFade=setInterval(()=>{step++;forest.volume=Math.max(0,Math.min(1,from+(target-from)*(step/steps)));if(step>=steps){clearInterval(PA_BATTLE_AUDIO.forestFade);PA_BATTLE_AUDIO.forestFade=null;if(target===0){forest.pause();forest.currentTime=0}}},50);
}
function ensureBattleMusic(){
  if(PA_BATTLE_AUDIO.music)return PA_BATTLE_AUDIO.music;
  const music=new Audio();
  music.preload='auto';
  music.volume=PA_BATTLE_MUSIC_VOLUME*PA_VOLUME_SCALE;
  music.playbackRate=PA_BATTLE_MUSIC_RATE;
  if('preservesPitch' in music)music.preservesPitch=true;
  if('webkitPreservesPitch' in music)music.webkitPreservesPitch=true;
  music.addEventListener('ended',playNextBattleMusic);
  PA_BATTLE_AUDIO.music=music;return music;
}
function playNextBattleMusic(){
  const music=ensureBattleMusic();if(!music||paMuted||PA_BATTLE_AUDIO.mode==='off'||PA_BATTLE_AUDIO.victoryActive)return;
  if(music.src&&!music.paused&&!music.ended)return;
  const tracks=PA_BATTLE_AUDIO.musicTracks;PA_BATTLE_AUDIO.musicIndex=(PA_BATTLE_AUDIO.musicIndex+1)%tracks.length;
  music.src=tracks[PA_BATTLE_AUDIO.musicIndex];music.load();music.currentTime=0;
  music.volume=PA_BATTLE_MUSIC_VOLUME*PA_VOLUME_SCALE;
  music.playbackRate=PA_BATTLE_MUSIC_RATE;
  const p=music.play();if(p&&p.catch)p.catch(()=>{});
}
function stopBattleMusic(){
  const music=PA_BATTLE_AUDIO.music;if(!music)return;
  music.pause();music.currentTime=0;
}

function clearBattleMusicFade(){
  if(PA_BATTLE_AUDIO.musicFade){clearInterval(PA_BATTLE_AUDIO.musicFade);PA_BATTLE_AUDIO.musicFade=null}
}
function fadeBattleMusicVolume(target=0,duration=PA_VICTORY_MUSIC_FADE_MS){
  const music=ensureBattleMusic();if(!music)return Promise.resolve(false);
  clearBattleMusicFade();
  const from=Number(music.volume||0),to=Math.max(0,Math.min(1,Number(target)||0)),ms=Math.max(0,Number(duration)||0);
  if(ms===0){music.volume=to;return Promise.resolve(true)}
  return new Promise(resolve=>{
    const started=performance.now();
    PA_BATTLE_AUDIO.musicFade=setInterval(()=>{
      const k=Math.min(1,(performance.now()-started)/ms);
      music.volume=from+(to-from)*k;
      if(k>=1){clearBattleMusicFade();resolve(true)}
    },40);
  });
}
function stopBattleVictoryStinger(){
  const a=PA_BATTLE_AUDIO.victoryStinger;if(!a)return;
  try{a.pause();a.currentTime=0}catch(_){}
  PA_BATTLE_AUDIO.victoryStinger=null;
}
async function playBattleVictoryStinger(){
  if(paMuted)return false;
  PA_BATTLE_AUDIO.victoryActive=true;
  const fade=fadeBattleMusicVolume(0,PA_VICTORY_MUSIC_FADE_MS);
  await new Promise(resolve=>setTimeout(resolve,PA_VICTORY_STINGER_DELAY_MS));
  if(paMuted||!PA_BATTLE_AUDIO.victoryActive)return false;
  try{
    stopBattleVictoryStinger();
    const base=PA_AUDIO_CACHE.victoryStinger;
    const stinger=base?base.cloneNode(true):new Audio(PA_AUDIO.victoryStinger);
    PA_BATTLE_AUDIO.victoryStinger=stinger;
    stinger.preload='auto';stinger.currentTime=0;stinger.volume=PA_VICTORY_STINGER_VOLUME*PA_VOLUME_SCALE;
    stinger.addEventListener('ended',()=>{if(PA_BATTLE_AUDIO.victoryStinger===stinger)PA_BATTLE_AUDIO.victoryStinger=null},{once:true});
    const p=stinger.play();if(p&&typeof p.catch==='function')p.catch(()=>{});
    fade.catch(()=>{});
    return true;
  }catch(_){return false}
}
function resetBattleVictoryAudio(){
  PA_BATTLE_AUDIO.victoryActive=false;
  clearBattleMusicFade();stopBattleVictoryStinger();
  const music=PA_BATTLE_AUDIO.music;
  if(music)music.volume=PA_BATTLE_MUSIC_VOLUME*PA_VOLUME_SCALE;
  if(!paMuted&&PA_BATTLE_AUDIO.mode!=='off'&&(!music||music.paused||music.ended))playNextBattleMusic();
}
function bossDrum(){
  const {ctx,bossGain}=PA_BATTLE_AUDIO;if(!ctx||!bossGain||PA_BATTLE_AUDIO.mode!=='boss'||paMuted||ctx.state!=='running')return;
  [0,.42].forEach((offset,index)=>{const at=ctx.currentTime+offset,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(index?96:124,at);osc.frequency.exponentialRampToValueAtTime(58,at+.18);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(index?.13:.18,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.24);osc.connect(gain).connect(bossGain);osc.start(at);osc.stop(at+.26)});
}
function setBattleAudioMode(mode='off'){
  const previous=PA_BATTLE_AUDIO.mode;
  PA_BATTLE_AUDIO.mode=mode;
  clearInterval(PA_BATTLE_AUDIO.bossTimer);PA_BATTLE_AUDIO.bossTimer=null;
  if(!paAudioUnlocked)return;
  const ctx=ensureBattleAudio();if(!ctx)return;if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  /* Battle biasa ialah ambience sahaja: daun, angin dan hidupan hutan jauh.
     Muzik/synth hanya masuk secara terkawal semasa boss. */
  const activeMode=paMuted?'off':mode,now=ctx.currentTime,fade=1.2,target=(activeMode==='off'?0:.32)*PA_VOLUME_SCALE;PA_BATTLE_AUDIO.master.gain.cancelScheduledValues(now);PA_BATTLE_AUDIO.master.gain.setTargetAtTime(target,now,fade/3);
  if(activeMode==='off'){clearBattleMusicFade();stopBattleVictoryStinger();stopBattleMusic()}else if(!PA_BATTLE_AUDIO.victoryActive&&(previous==='off'||!PA_BATTLE_AUDIO.music?.src||PA_BATTLE_AUDIO.music?.paused)){playNextBattleMusic()}
  fadeForestAmbience(0);
  PA_BATTLE_AUDIO.bossGain.gain.cancelScheduledValues(now);PA_BATTLE_AUDIO.bossGain.gain.setTargetAtTime((activeMode==='boss'?.09:0)*PA_VOLUME_SCALE,now,fade/3);
  if(activeMode==='boss'){bossDrum();PA_BATTLE_AUDIO.bossTimer=setInterval(bossDrum,1600)}
}
function syncBattleAudio(screenId=document.body?.dataset?.screen){
  // Battlefield rescue (Segel/Gembok) ialah battle sebenar juga. Sebelum ini
  // hanya skrin legacy "game" dibenarkan memainkan BGM, jadi screen('segelDemo')
  // terus memanggil setBattleAudioMode('off') dan muzik senyap.
  if(screenId==='segelDemo')return setBattleAudioMode('ambient');
  if(screenId!=='game')return setBattleAudioMode('off');
  setBattleAudioMode(sess?.enemyTier==='boss'&&!sess?.bossDefeated?'boss':'ambient');
}

function preloadSfx(){
  Object.entries(PA_AUDIO).forEach(([name,src])=>{
    try{
      const a=new Audio();
      a.preload='auto';
      a.src=src;
      a.volume=(name==='victoryStinger'?PA_VICTORY_STINGER_VOLUME:(name==='finisher'?.8:(name==='auraCharge'?.72:(name==='wiraSword'?.82:.65))))*PA_VOLUME_SCALE;
      a.load();
      PA_AUDIO_CACHE[name]=a;
    }catch(e){}
  });
}
function unlockSfx(){
  if(paAudioUnlocked)return;
  paAudioUnlocked=true;
  ensureBattleAudio();
  syncBattleAudio();
  // Mobile browsers require the first playback to follow a user gesture.
  const a=PA_AUDIO_CACHE.ui;
  if(a&&!paMuted){
    try{a.volume=0.001;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.volume=.65*PA_VOLUME_SCALE;}).catch(()=>{a.volume=.65*PA_VOLUME_SCALE;});}catch(e){}
  }
  /* Prime the delayed finisher cue inside the first user gesture. Some mobile
     browsers reject a later play() after the eye cut-in's await sequence. */
  const charge=PA_AUDIO_CACHE.chargeup;
  if(charge&&!paMuted){
    try{charge.volume=0.001;const p=charge.play();if(p&&p.then)p.then(()=>{charge.pause();charge.currentTime=0;charge.volume=.72*PA_VOLUME_SCALE;}).catch(()=>{charge.volume=.72*PA_VOLUME_SCALE;});}catch(e){}
  }
}
function playSfx(name){
  if(paMuted)return;
  const src=PA_AUDIO[name]; if(!src)return;
  try{
    const base=PA_AUDIO_CACHE[name];
    const a=base?base.cloneNode(true):new Audio(src);
    a.volume=(name==='victoryStinger'?PA_VICTORY_STINGER_VOLUME:(name==='finisher'?.8:(name==='auraCharge'?.72:(name==='wiraSword'?.82:.65))))*PA_VOLUME_SCALE;
    a.preload='auto';
    if(name==='finisherSwing')a.playbackRate=.6;
    const p=a.play(); if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
function startChargeup(){
  if(paMuted)return;
  const a=PA_AUDIO_CACHE.chargeup;if(!a)return;
  try{a.currentTime=0;a.volume=.72*PA_VOLUME_SCALE;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){ }
}
function stopChargeup(){
  const a=PA_AUDIO_CACHE.chargeup;if(!a)return;
  try{a.pause();a.currentTime=0}catch(_){ }
}
function playSidmaSfx(cue){
  if(paMuted)return;
  const ctx=ensureBattleAudio();if(!ctx)return;
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const now=ctx.currentTime,out=ctx.createGain();out.gain.value=.42*PA_VOLUME_SCALE;out.connect(ctx.destination);
  const tone=(type,from,to,start,duration,level)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),at=now+start;osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain).connect(out);osc.start(at);osc.stop(at+duration+.03)};
  if(cue==='charge'){tone('sine',190,330,0,.42,.18);tone('triangle',285,520,.05,.34,.08)}
  else if(cue==='release'){tone('triangle',420,980,0,.18,.22);tone('sine',260,150,.04,.24,.12)}
  else if(cue==='impact'){tone('sine',740,510,0,.25,.18);tone('triangle',185,92,0,.2,.2)}
  else if(cue==='finisher-charge'){tone('sine',110,245,0,.78,.2);tone('triangle',220,440,.12,.68,.09)}
  else if(cue==='sigma-form'){tone('sine',392,398,0,.48,.2);tone('sine',588,596,.06,.52,.14);tone('triangle',784,790,.12,.54,.08)}
  else if(cue==='compress'){tone('sawtooth',460,115,0,.2,.13);tone('sine',220,72,.02,.24,.17)}
  else if(cue==='explode'){
    tone('sine',125,42,0,.46,.3);tone('triangle',784,392,.04,.58,.16);
    const length=Math.floor(ctx.sampleRate*.28),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2);const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=720;gain.gain.setValueAtTime(.18,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.28);noise.connect(filter).connect(gain).connect(out);noise.start(now)
  }
  setTimeout(()=>{try{out.disconnect()}catch(_){}},1200);
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
