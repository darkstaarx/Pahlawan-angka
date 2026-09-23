/* Pahlawan Angka — Demo v2 entry cinematic v1.2.0
 *
 * v1.1.0 introduced the two-stage bridge:
 * video -> fade to dark -> short dark hold -> fade from dark into battle.
 * The live Demo still prepares underneath while the video plays.
 *
 * v1.2.0 adds a "Langkau" control for returning players. It deliberately does
 * NOT cut the cinematic dead. Tapping it seeks to the last SKIP_TAIL_S seconds
 * of the portal video, so the player still sees Wira dissolve into blue
 * particles and the handoff into the arena stays intact — they simply skip the
 * build-up they have already watched. Cutting straight to the arena would drop
 * the one beat the whole entrance is built around.
 */
(()=>{
  'use strict';

  const VERSION='1.2.0';
  const VIDEO_SRC='assets/cinematics/wira-demo-entry-v1.mp4';
  const FADE_IN_MS=280;
  const VIDEO_TO_DARK_MS=260;
  const DARK_HOLD_MS=150;
  const DARK_TO_BATTLE_MS=480;
  const VIDEO_READY_TIMEOUT_MS=3000;
  const BATTLE_READY_TIMEOUT_MS=3500;

  /* Ekor yang dikekalkan bila murid menekan Langkau: cukup untuk menangkap
     Wira larut menjadi zarah, tidak cukup untuk terasa menunggu. */
  const SKIP_TAIL_S=1;
  const SKIP_SHOW_MS=600;       // jeda sebelum butang muncul, elak tersentuh
  const SKIP_GIVE_UP_MS=3500;   // kalau pencarian gagal, tamatkan juga

  let installed=false;
  let playing=false;
  let activeGate=null;
  let cancelActiveGate=null;

  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function injectStyle(){
    if(document.getElementById('paSegelEntryCinematicStyleV120'))return;
    const style=document.createElement('style');
    style.id='paSegelEntryCinematicStyleV120';
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

      /* Butang navy sama seperti CTA skrin Berjaya dalam prototaip Unity:
         muka navy, bingkai emas, teks putih tebal. */
      .paSegelSkip{
        grid-area:1/1;justify-self:end;align-self:end;
        /* Butang dan video berkongsi sel grid yang sama. Tanpa konteks
           susunannya sendiri, video menutup butang daripada sentuhan. */
        position:relative;z-index:2;
        margin:0 16px calc(18px + env(safe-area-inset-bottom,0px)) 0;
        min-height:48px;padding:0 22px;
        border:2px solid #e0b64a;border-radius:12px;
        background:linear-gradient(#17325c,#0e2142);
        color:#fff6df;cursor:pointer;
        font-family:inherit;font-size:15px;font-weight:800;line-height:1;letter-spacing:.3px;
        box-shadow:0 6px 18px #0009;
        opacity:0;transform:translateY(6px);pointer-events:none;
        transition:opacity 220ms ease,transform 220ms ease;
      }
      .paSegelSkip.ready{opacity:1;transform:none;pointer-events:auto}
      .paSegelSkip:active{transform:translateY(1px)}
      .paSegelEntryCinematic.toDark .paSegelSkip{
        opacity:0;pointer-events:none;transition-duration:140ms
      }

      @media (min-aspect-ratio:9/16){
        .paSegelEntryCinematic video{object-fit:contain}
      }
      @media (prefers-reduced-motion:reduce){
        .paSegelEntryCinematic,
        .paSegelEntryCinematic video,
        .paSegelSkip{transition-duration:80ms!important}
      }
    `;
    document.head.appendChild(style);
  }

  function makeOverlay(){
    injectStyle();
    const overlay=document.createElement('div');
    overlay.className='paSegelEntryCinematic';

    const video=document.createElement('video');
    video.src=`${VIDEO_SRC}?v=${encodeURIComponent(globalThis.PA_APP_VERSION||VERSION)}`;
    video.preload='auto';
    video.playsInline=true;
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
    video.setAttribute('aria-hidden','true');
    video.controls=false;
    video.loop=false;
    try{video.muted=(typeof paMuted!=='undefined')?!!paMuted:false}catch(_){video.muted=false}

    const skip=document.createElement('button');
    skip.type='button';
    skip.className='paSegelSkip';
    skip.textContent='Langkau';
    skip.setAttribute('aria-label',`Langkau ke penghujung babak masuk`);

    overlay.appendChild(video);
    overlay.appendChild(skip);
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('show')));
    return {overlay,video,skip};
  }

  /* Langkau = cari ke ekor, bukan tamat serta-merta. Kalau video belum boleh
     dicari (metadata belum ada, tempoh tidak terhingga, pencarian ditolak),
     barulah kita tamatkan babak supaya murid tidak tersekat. */
  function bindSkip(video,skip,finish){
    let used=false;
    const seekable=()=>{
      const d=video.duration;
      return Number.isFinite(d)&&d>SKIP_TAIL_S+.35;
    };
    const reveal=()=>{ if(!used)skip.classList.add('ready') };
    if(video.readyState>=1)setTimeout(reveal,SKIP_SHOW_MS);
    else video.addEventListener('loadedmetadata',()=>setTimeout(reveal,SKIP_SHOW_MS),{once:true});

    skip.addEventListener('click',()=>{
      if(used)return;
      used=true;
      skip.classList.remove('ready');
      if(!seekable()){ finish('skip-unseekable'); return }
      try{
        video.currentTime=Math.max(0,video.duration-SKIP_TAIL_S);
        const resume=video.play();
        if(resume&&resume.catch)resume.catch(()=>{});
      }catch(_){ finish('skip-seek-failed'); return }
      // Kalau ekor itu pun tidak sampai ke 'ended', jangan biar murid menunggu.
      setTimeout(()=>finish('skip-timeout'),SKIP_GIVE_UP_MS);
    });
  }

  function waitForVideo(video,skip){
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

      if(skip)bindSkip(video,skip,finish);

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
    if(!overlay?.isConnected)return;
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
    const demoOpen=window.openSegelDemo;
    const productionOpen=window.openGembok;
    if(typeof demoOpen!=='function'||typeof productionOpen!=='function'){
      setTimeout(install,60);
      return;
    }
    installed=true;

    const gate=function(original,context,args){
      if(activeGate)return activeGate;
      playing=true;
      const {overlay,video,skip}=makeOverlay();
      let closed=false;
      let finishCancel;
      const cancelled=new Promise(resolve=>{finishCancel=resolve});
      cancelActiveGate=()=>{
        if(closed)return;
        closed=true;
        try{video.pause()}catch(_){}
        overlay.remove();
        finishCancel();
      };

      // Boot the chosen route underneath while the cinematic occupies the screen.
      const routeBoot=Promise.resolve()
        .then(()=>original.apply(context,args))
        .catch(err=>{console.error('[segel-entry-cinematic] Route open failed',err);throw err});

      activeGate=(async()=>{
        try{
          const settled=await Promise.race([Promise.all([waitForVideo(video,skip),routeBoot]),cancelled]);
          if(closed)return;
          await waitForBattlePaint();
          if(closed)return;
          await bridgeToBattle(overlay,video);
          return settled[1];
        }finally{
          cancelActiveGate?.();
          cancelActiveGate=null;
          activeGate=null;
          playing=false;
        }
      })();
      return activeGate;
    };

    window.openSegelDemo=function(...args){ return gate(demoOpen,this,args); };
    window.openGembok=function(...args){ return gate(productionOpen,this,args); };
    const closeDemo=window.closeSegelDemo;
    if(typeof closeDemo==='function'){
      window.closeSegelDemo=function(...args){
        cancelActiveGate?.();
        return closeDemo.apply(this,args);
      };
    }

    window.PASegelEntryCinematic={
      version:VERSION,
      video:VIDEO_SRC,
      skipTail:SKIP_TAIL_S,
      playing:()=>playing,
      close:()=>cancelActiveGate?.()
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
