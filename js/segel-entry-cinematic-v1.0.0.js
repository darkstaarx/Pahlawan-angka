/* Pahlawan Angka — Demo v2 entry cinematic v1.0.0
 *
 * Flow:
 * tap Demo v2 -> portrait cinematic fades in -> Demo stage prepares behind it
 * -> video ends -> wait until Demo is ready -> fade out to the live battle.
 *
 * Visual rule: this overlay contains only the supplied video. No loading copy,
 * labels, buttons or other UI are added on top of the cinematic.
 */
(()=>{
  'use strict';

  const VERSION='1.0.0';
  const VIDEO_SRC='assets/cinematics/wira-demo-entry-v1.mp4';
  const FADE_IN_MS=280;
  const FADE_OUT_MS=360;
  const READY_TIMEOUT_MS=3000;
  let installed=false;
  let playing=false;

  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function injectStyle(){
    if(document.getElementById('paSegelEntryCinematicStyle'))return;
    const style=document.createElement('style');
    style.id='paSegelEntryCinematicStyle';
    style.textContent=`
      .paSegelEntryCinematic{
        position:fixed;inset:0;z-index:2147483000;
        display:grid;place-items:center;overflow:hidden;
        background:#02050a;opacity:0;pointer-events:auto;
        transition:opacity ${FADE_IN_MS}ms ease;
      }
      .paSegelEntryCinematic.show{opacity:1}
      .paSegelEntryCinematic.leave{
        opacity:0;transition-duration:${FADE_OUT_MS}ms;pointer-events:none
      }
      .paSegelEntryCinematic video{
        width:100%;height:100%;display:block;object-fit:cover;
        background:#02050a
      }
      @media (min-aspect-ratio: 9/16){
        .paSegelEntryCinematic video{object-fit:contain}
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
          // Some mobile browsers reject audible playback despite a direct tap.
          // Retry muted rather than blocking entry into Demo v2.
          try{video.muted=true;await video.play()}catch(__){finish('play-rejected')}
        }
      };

      if(video.readyState>=2)start();
      else{
        const ready=()=>start();
        video.addEventListener('canplay',ready,{once:true});
        setTimeout(()=>{if(video.paused)start()},READY_TIMEOUT_MS);
      }
    });
  }

  async function removeOverlay(overlay,video){
    try{video.pause()}catch(_){}
    overlay.classList.add('leave');
    await wait(FADE_OUT_MS+40);
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

      // Start the real Demo immediately under the opaque cinematic so Three.js,
      // question generation and assets can prepare while Wira is travelling.
      const demoReady=Promise.resolve()
        .then(()=>original.apply(this,args))
        .catch(err=>{console.error('[segel-entry-cinematic] Demo open failed',err)});

      try{
        await Promise.all([waitForVideo(video),demoReady]);
      }finally{
        await removeOverlay(overlay,video);
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
