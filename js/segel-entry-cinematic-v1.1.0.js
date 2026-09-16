/* Pahlawan Angka — Demo v2 entry cinematic v1.1.0
 *
 * The previous transition cross-dissolved the portal video's final frame
 * directly into the bright live arena. Because those are different spaces,
 * the cut felt abrupt even with opacity animation.
 *
 * v1.1.0 uses a proper cinematic bridge:
 * video -> fade to dark -> short dark hold -> fade from dark into battle.
 * The live Demo still prepares underneath while the video plays.
 */
(()=>{
  'use strict';

  const VERSION='1.1.0';
  const VIDEO_SRC='assets/cinematics/wira-demo-entry-v1.mp4';
  const FADE_IN_MS=280;
  const VIDEO_TO_DARK_MS=260;
  const DARK_HOLD_MS=150;
  const DARK_TO_BATTLE_MS=480;
  const VIDEO_READY_TIMEOUT_MS=3000;
  const BATTLE_READY_TIMEOUT_MS=3500;
  let installed=false;
  let playing=false;

  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function injectStyle(){
    if(document.getElementById('paSegelEntryCinematicStyleV110'))return;
    const style=document.createElement('style');
    style.id='paSegelEntryCinematicStyleV110';
    style.textContent=`
      .paSegelEntryCinematic{
        position:fixed;inset:0;z-index:2147483000;
        display:grid;place-items:center;overflow:hidden;
        background:#020711;opacity:0;pointer-events:auto;
        transition:opacity ${FADE_IN_MS}ms ease;
      }
      .paSegelEntryCinematic.show{opacity:1}
      .paSegelEntryCinematic video{
        grid-area:1/1;width:100%;height:100%;display:block;
        object-fit:cover;background:#020711;opacity:1;
        transition:opacity ${VIDEO_TO_DARK_MS}ms ease;
      }
      .paSegelEntryCinematic.toDark video{opacity:0}
      .paSegelEntryCinematic.revealBattle{
        opacity:0;transition-duration:${DARK_TO_BATTLE_MS}ms;
        transition-timing-function:ease-in-out;pointer-events:none
      }
      @media (min-aspect-ratio:9/16){
        .paSegelEntryCinematic video{object-fit:contain}
      }
      @media (prefers-reduced-motion:reduce){
        .paSegelEntryCinematic,
        .paSegelEntryCinematic video{transition-duration:80ms!important}
      }
    `;
    document.head.appendChild(style);
  }

  function makeOverlay(){
    injectStyle();
    const overlay=document.createElement('div');
    overlay.className='paSegelEntryCinematic';
    overlay.setAttribute('aria-hidden','true');

    const video=document.createElement('video');
    video.src=`${VIDEO_SRC}?v=${encodeURIComponent(globalThis.PA_APP_VERSION||VERSION)}`;
    video.preload='auto';
    video.playsInline=true;
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
    video.controls=false;
    video.loop=false;
    try{video.muted=(typeof paMuted!=='undefined')?!!paMuted:false}catch(_){video.muted=false}

    overlay.appendChild(video);
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('show')));
    return {overlay,video};
  }

  function waitForVideo(video){
    return new Promise(resolve=>{
      let done=false;
      const finish=reason=>{
        if(done)return;done=true;
        clearTimeout(watchdog);
        video.removeEventListener('ended',onEnded);
        video.removeEventListener('error',onError);
        resolve(reason);
      };
      const onEnded=()=>finish('ended');
      const onError=()=>finish('error');
      const watchdog=setTimeout(()=>finish('timeout'),12000);
      video.addEventListener('ended',onEnded,{once:true});
      video.addEventListener('error',onError,{once:true});

      const start=async()=>{
        try{
          video.currentTime=0;
          await video.play();
        }catch(_){
          try{video.muted=true;await video.play()}catch(__){finish('play-rejected')}
        }
      };

      if(video.readyState>=2)start();
      else{
        video.addEventListener('canplay',start,{once:true});
        setTimeout(()=>{if(video.paused)start()},VIDEO_READY_TIMEOUT_MS);
      }
    });
  }

  function waitForBattlePaint(){
    return new Promise(resolve=>{
      const started=performance.now();
      const check=()=>{
        const demo=document.getElementById('segelDemo');
        const canvas=demo?.querySelector('.segelStage canvas');
        const visible=!!demo?.classList.contains('on');
        const painted=!!(canvas&&canvas.getBoundingClientRect().width>0&&canvas.getBoundingClientRect().height>0);
        if(visible&&painted){
          requestAnimationFrame(()=>requestAnimationFrame(resolve));
          return;
        }
        if(performance.now()-started>=BATTLE_READY_TIMEOUT_MS){resolve();return}
        requestAnimationFrame(check);
      };
      check();
    });
  }

  async function bridgeToBattle(overlay,video){
    try{video.pause()}catch(_){}

    // First close the cinematic into darkness. The arena remains fully hidden.
    overlay.classList.add('toDark');
    await wait(VIDEO_TO_DARK_MS+20);

    // A tiny blackout beat separates the portal destination from the live arena.
    await wait(DARK_HOLD_MS);

    // Only now reveal the already-painted battle screen from darkness.
    // The Demo's particle entrance listens for this: Wira must come down as
    // blue particles exactly as the arena fades up, not behind the curtain.
    overlay.classList.add('revealBattle');
    try{ document.dispatchEvent(new CustomEvent('pa:battle-reveal')) }catch(_){}
    await wait(DARK_TO_BATTLE_MS+40);
    overlay.remove();
  }

  function install(){
    if(installed)return;
    const original=window.openSegelDemo;
    if(typeof original!=='function'){
      setTimeout(install,60);
      return;
    }
    installed=true;

    window.openSegelDemo=async function(...args){
      if(playing)return;
      playing=true;
      const {overlay,video}=makeOverlay();

      // Boot the live stage underneath while the cinematic occupies the screen.
      const demoBoot=Promise.resolve()
        .then(()=>original.apply(this,args))
        .catch(err=>{console.error('[segel-entry-cinematic] Demo open failed',err)});

      try{
        await Promise.all([waitForVideo(video),demoBoot]);
        await waitForBattlePaint();
      }finally{
        await bridgeToBattle(overlay,video);
        playing=false;
      }
    };

    window.PASegelEntryCinematic={
      version:VERSION,
      video:VIDEO_SRC,
      playing:()=>playing
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
