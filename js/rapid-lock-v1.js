/* Pahlawan Angka — Portal Restu (Phase 2, docs/PA-DIAGNOSTIC-BRAIN.md §5).
   Rule (agreed with owner, 21 Oct 2026):
   - Count FIRST attempts only. A wrong first attempt faster than the item's
     reading-load floor (1.8–3.2 s, same as PAEffortGuard.limit) is a rapid guess.
   - Correct answer, or a wrong answer given with real thinking time, resets to 0.
   - 2 rapid guesses in a row → Cikgu warning. 3 → Wira falls into the Portal
     Restu (clip), locked until a parent enters the guardian PIN (or sets one).
   - The parent reviews the 3 items, then chooses:
       "Teruskan main"           → portal stays armed; it re-locks on the next 3 guesses
       "Biar anak teroka hari ini" (not recommended) → portal off until midnight MYT
     Guesses are still logged for the parent report either way.
   - Never in guest demo / dev battlefield.
   Engine (createEngine) is pure and exported for Node tests; UI is browser-only. */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PARapidLock=api;
})(typeof window!=='undefined'?window:undefined,function(root){
  'use strict';
  const WARN_AT=2, LOCK_AT=3;
  const strip=html=>String(html??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  // Mirrors js/effort-guard-v3.32.0.js limit(q).
  const floor=q=>Math.min(3.2,Math.max(1.8,1.35+strip(q?.prompt).length*.018));

  function createEngine(){
    let streak=[], seenWrong=new Set(), locks=0;
    return{
      /* Feed every answer event. Returns 'warn' | 'lock' | null. */
      observe({q,ok,sec,firstAttempt,value}){
        const token=q?.token?String(q.token):null;
        if(!firstAttempt){
          if(token&&seenWrong.has(token))return null;   // a retry of an item already counted
          streak=[];return null;                          // first-try correct resets
        }
        if(token)seenWrong.add(token);
        if(seenWrong.size>200)seenWrong=new Set([...seenWrong].slice(-100));
        const s=Number(sec)||0;
        if(ok||!(s>0&&s<floor(q))){streak=[];return null;}
        streak.push({prompt:strip(q?.prompt).slice(0,140),answer:value==null?'':String(value).slice(0,24),
          correct:q?.answer==null?'':strip(q.answer).slice(0,24),sec:Math.round(s*10)/10});
        if(streak.length>=LOCK_AT){
          const items=streak.slice(-LOCK_AT);streak=[];
          locks++;this.lastItems=items;return 'lock';
        }
        return streak.length>=WARN_AT?'warn':null;
      },
      get streak(){return streak.length},
      get hasLocked(){return locks>0},
      get locks(){return locks},
      lastItems:[]
    };
  }

  // "Off for today" ends at the next midnight in Malaysia (UTC+8, no DST).
  function endOfDayMYT(now){const MYT=8*3600e3,d=new Date((now||Date.now())+MYT);d.setUTCHours(24,0,0,0);return d.getTime()-MYT}
  const portalOff=(d,now)=>!!d&&Number(d.portalRestu?.offUntil||0)>(now||Date.now());

  if(!root||typeof document==='undefined')return{createEngine,floor,endOfDayMYT,portalOff,WARN_AT,LOCK_AT};

  // ---------- browser UI ----------
  const engines=new WeakMap();
  const liveDb=()=>{try{return typeof db!=='undefined'?db:null}catch(_){return null}};
  const liveSess=()=>{try{return typeof sess!=='undefined'?sess:null}catch(_){return null}};
  const getPin=()=>{try{const p=String(typeof pageLockParentPin==='function'?pageLockParentPin()||'':'');return /^\d{4}$/.test(p)?p:null}catch(_){return null}};
  const setPin=pin=>{try{return typeof createPageLockParentPin==='function'&&createPageLockParentPin(pin)}catch(_){return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let el=null, warnEl=null, warnTimer=0, pending=null;
  let flowId=0, phase='idle', stopPresentation=null, watchTimer=0, skipEntry=null;

  function sameProfile(p){
    return !!p&&p.profile===liveDb()&&p.session===liveSess()
      &&(!p.childId||p.childId===root.PACloud?.state?.childId)
      &&(!p.screen||p.screen===document.body.dataset?.screen);
  }
  function currentFlow(id){return id===flowId&&sameProfile(pending)}
  function cancel(){
    const previous=pending;
    ++flowId;phase='idle';pending=null;skipEntry=null;
    if(previous?.background)previous.background.inert=previous.wasInert;
    clearTimeout(watchTimer);watchTimer=0;
    const stop=stopPresentation;stopPresentation=null;stop?.();
    root.PASegelHost?.cancelRestuEntry?.();
    el?.classList.add('hidden');el?.classList.remove('pa-restu-entry');
    document.body.classList.remove('pa-rapid-locked','pa-restu-cinematic');
    // Muzik battle senyap sepanjang Restu; pulihkan bila aliran tamat/dibatalkan.
    if(previous)root.PASegelHost?.restoreRestuMusic?.();
  }
  function watchProfile(id){
    clearTimeout(watchTimer);
    watchTimer=setTimeout(()=>{if(id!==flowId)return;if(!sameProfile(pending)){cancel();return}watchProfile(id)},250);
  }

  function engineFor(session){
    const key=session&&typeof session==='object'?session:root;
    if(!engines.has(key))engines.set(key,createEngine());
    return engines.get(key);
  }

  // Same art kit as the BERJAYA result screen; PA_ASSETS can override (dev lab / offline).
  const ASSET={crest:'assets/ui/victory-result/crest-frame.webp',left:'assets/ui/victory-result/crest-side-left.webp',
    right:'assets/ui/victory-result/crest-side-right.webp',frame:'assets/ui/victory-result/summary-frame.webp',
    gold:'assets/ui/victory-result/button-gold-rest.webp',goldDown:'assets/ui/victory-result/button-gold-press.webp',
    cikgu:'assets/coach/cikgu-dimensi/hub-portrait-v1.webp',aurora:'assets/pets/aurora/frames/sad-0-v1.webp',
    navy:'assets/ui/victory-result/button-navy-rest.webp',navyDown:'assets/ui/victory-result/button-navy-press.webp',
    fall:'assets/cinematics/portal-restu-jatuh-v1.mp4'};
  const art=k=>(root.PA_ASSETS&&root.PA_ASSETS[k])||((root.PA_ASSET_BASE||'')+ASSET[k]);

  function warn(){
    if(!warnEl){
      warnEl=document.createElement('div');warnEl.className='paRapidWarn';warnEl.setAttribute('role','status');warnEl.setAttribute('aria-live','polite');
      warnEl.innerHTML=`<img src="${art('cikgu')}" alt=""><div class="paRapidSay"><span class="paRapidChip">Cikgu Dimensi</span><p>Perlahan sikit, wira! Baca soalan dulu, baru tekan jawapan.</p></div>`;
      document.body.append(warnEl);
    }
    warnEl.classList.remove('show');void warnEl.offsetWidth;warnEl.classList.add('show');
    clearTimeout(warnTimer);warnTimer=setTimeout(()=>warnEl?.classList.remove('show'),4200);
  }

  function crest(title){
    return `<div class="paRapidCrest"><img class="paRapidCrestSide l" src="${art('left')}" alt=""><img class="paRapidCrestSide r" src="${art('right')}" alt="">
      <img class="paRapidCrestFrame" src="${art('crest')}" alt=""><b>${title}</b></div>`;
  }
  function build(){
    el=document.createElement('div');el.className='paRapidLock hidden';
    el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','paRapidTitle');
    el.style.setProperty('--pr-frame',`url("${art('frame')}")`);
    el.style.setProperty('--pr-gold',`url("${art('gold')}")`);el.style.setProperty('--pr-gold-down',`url("${art('goldDown')}")`);
    el.style.setProperty('--pr-navy',`url("${art('navy')}")`);el.style.setProperty('--pr-navy-down',`url("${art('navyDown')}")`);
    el.innerHTML=`<button type="button" class="paRestuSkip" data-act="skip-entry">Langkau animasi</button>
      <div class="paRapidFall" data-step="fall" hidden><video class="paRapidVideo" playsinline preload="none" aria-hidden="true"></video></div>
      <section class="paRapidStage">
      <div class="paRapidStep" data-step="child">
        <h2 id="paRapidTitle" class="paRapidSr">Portal Restu: panggil ibu bapa</h2>
        ${crest('PORTAL RESTU')}
        <div class="paRapidPet"><img src="${art('aurora')}" alt=""></div>
        <p class="paRapidLead">Wira terjatuh ke dalam Portal Restu! Panggil ibu bapa untuk buka portal.</p>
        <div class="paRapidFrame">
          <div class="paRapidCoach"><img src="${art('cikgu')}" alt=""><div class="paRapidSay"><span class="paRapidChip">Cikgu Dimensi</span>
            <p>Cikgu nampak 3 jawapan dipilih terlalu cepat. Wira sebenar baca soalan dulu sebelum menjawab!</p></div></div>
          <div class="paRapidParent">
            <label for="paRapidPin" data-pin-label>Ibu bapa: masukkan PIN Penjaga</label>
            <div class="paRapidSlots" data-slots="a"><input id="paRapidPin" class="paRapidPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-describedby="paRapidErr"><i></i><i></i><i></i><i></i></div>
            <label for="paRapidPin2" data-pin2-label hidden>Ulang PIN</label>
            <div class="paRapidSlots" data-slots="b" hidden><input id="paRapidPin2" class="paRapidPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"><i></i><i></i><i></i><i></i></div>
            <p class="paRapidError" id="paRapidErr" role="alert"></p>
          </div>
        </div>
        <button type="button" class="paRapidBtn" data-act="unlock">Buka</button>
      </div>
      <div class="paRapidStep" data-step="review" hidden>
        ${crest('SEMAKAN')}
        <p class="paRapidLead">3 soalan yang dijawab terlalu cepat</p>
        <div class="paRapidFrame">
          <ol class="paRapidItems"></ol>
          <div class="paRapidCoach"><img src="${art('cikgu')}" alt=""><div class="paRapidSay"><span class="paRapidChip">Cikgu Dimensi</span>
            <p>Minta anak baca soalan dengan kuat dan sebut jawapan sebelum menekan. Salah tidak mengapa, yang penting dia mencuba.</p></div></div>
        </div>
        <div class="paRapidChoice">
          <button type="button" class="paRapidBtn" data-act="resume">Teruskan main</button>
          <p class="paRapidNote">Portal Restu kekal aktif dan akan buka semula jika anak meneka lagi.</p>
          <button type="button" class="paRapidBtn navy" data-act="explore">Biar teroka hari ini</button>
          <p class="paRapidNote warn">Tidak disyorkan. Portal Restu ditutup sehingga tengah malam. Tekaan tetap dicatat dalam laporan ibu bapa.</p>
        </div>
      </div>
    </section>`;
    document.body.append(el);
    el.querySelector('[data-act="unlock"]').addEventListener('click',unlock);
    el.querySelector('[data-act="resume"]').addEventListener('click',()=>resume('armed'));
    el.querySelector('[data-act="explore"]').addEventListener('click',()=>resume('explore'));
    el.querySelector('[data-act="skip-entry"]').addEventListener('click',()=>skipEntry?.());
    el.querySelectorAll('.paRapidPin').forEach(i=>{
      i.addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});
      i.addEventListener('input',()=>{i.value=i.value.replace(/\D/g,'').slice(0,4);paintSlots(i);
        if(i.id==='paRapidPin'&&i.value.length===4){const b=el.querySelector('#paRapidPin2');if(!b.closest('[hidden]'))b.focus();else unlock();}
        if(i.id==='paRapidPin2'&&i.value.length===4)unlock();});
    });
  }
  function paintSlots(input){[...input.parentElement.querySelectorAll('i')].forEach((d,k)=>d.classList.toggle('on',k<input.value.length))}

  function setupMode(){return !getPin()}
  function lock(items,onDone){
    if(pending)cancel();
    if(!el)build();
    const id=++flowId;
    pending={items:items||[],onDone,profile:liveDb(),session:liveSess(),childId:root.PACloud?.state?.childId||null,screen:document.body.dataset?.screen||null};
    pending.background=document.querySelector?.('.app')||document.getElementById?.(pending.screen);
    if(pending.background){pending.wasInert=!!pending.background.inert;pending.background.inert=true}
    phase='teacher';
    const create=setupMode();
    el.querySelector('[data-pin-label]').textContent=create?'Ibu bapa: PIN belum ada. Cipta PIN 4 digit':'Ibu bapa: masukkan PIN Penjaga';
    el.querySelector('[data-pin2-label]').hidden=!create;el.querySelector('[data-slots="b"]').hidden=!create;
    el.querySelector('[data-act="unlock"]').textContent=create?'Simpan PIN & buka':'Buka';
    el.querySelectorAll('.paRapidPin').forEach(i=>{i.value='';paintSlots(i)});
    el.querySelector('.paRapidError').textContent='';
    el.querySelector('[data-step="child"]').hidden=true;el.querySelector('[data-step="review"]').hidden=true;
    warnEl?.classList.remove('show');
    el.classList.remove('hidden');document.body.classList.add('pa-rapid-locked');
    el.tabIndex=-1;el.focus();
    el.querySelector('.paRapidStage').hidden=true;
    el.querySelector('[data-step="fall"]').hidden=true;
    watchProfile(id);
    playTeacher(id,()=>playFall(()=>{
      if(!currentFlow(id))return;
      phase='pin';el.querySelector('.paRapidStage').hidden=false;el.querySelector('[data-step="child"]').hidden=false;
      setTimeout(()=>{if(currentFlow(id)&&phase==='pin')el.querySelector('#paRapidPin')?.focus()},150);
    },id));
  }
  function playTeacher(id,next){
    let done=false,guard=0;
    const finish=()=>{
      if(done)return;done=true;clearTimeout(guard);skipEntry=null;stopPresentation=null;
      el.classList.remove('pa-restu-entry');document.body.classList.remove('pa-restu-cinematic');
      root.PASegelHost?.cancelRestuEntry?.();
      if(currentFlow(id)){root.PASegelHost?.pause?.();next()}
    };
    stopPresentation=()=>{done=true;clearTimeout(guard);skipEntry=null};
    const reduce=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduce||typeof root.PASegelHost?.playRestuEntry!=='function'){finish();return}
    el.classList.add('pa-restu-entry');document.body.classList.add('pa-restu-cinematic');
    skipEntry=finish;guard=setTimeout(finish,9000);
    try{Promise.resolve(root.PASegelHost.playRestuEntry()).then(finish,finish)}catch(_){finish()}
  }
  /* Wira falls into the portal (3 s clip, played at 1.5x ≈ 2 s). Loaded only now, so players who never
     trigger the portal never download it. Sound follows the game mute. */
  function playFall(next,id){
    if(!currentFlow(id))return;
    phase='video';
    const box=el.querySelector('[data-step="fall"]'),v=el.querySelector('.paRapidVideo');
    el.querySelector('.paRapidStage').hidden=true;
    let done=false,guard=0;
    const stop=()=>{done=true;clearTimeout(guard);v.onended=null;v.onerror=null;v.pause();box.hidden=true};
    const finish=()=>{if(done)return;stop();stopPresentation=null;if(currentFlow(id))next()};
    stopPresentation=stop;
    const reduce=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduce||!art('fall')){finish();return}
    box.hidden=false;
    let muted=false;try{muted=typeof paMuted!=='undefined'&&!!paMuted}catch(_){}
    v.muted=muted;v.onended=finish;v.onerror=finish;
    if(v.getAttribute('src')!==art('fall'))v.src=art('fall');
    try{v.currentTime=0}catch(_){}
    // Pemilik 2026-10-26: video jatuh dimainkan 1.5x (≈2s) selepas pudar gelap.
    try{v.defaultPlaybackRate=1.5;v.playbackRate=1.5}catch(_){}
    guard=setTimeout(finish,6000);
    try{const p=v.play();if(p&&p.catch)p.catch(()=>{
      if(done||!currentFlow(id))return;v.muted=true;
      try{const retry=v.play();if(retry?.catch)retry.catch(finish)}catch(_){finish()}
    })}catch(_){finish()}
  }
  function unlock(){
    if(phase!=='pin'||!pending)return;
    if(!sameProfile(pending)){cancel();return}
    const a=el.querySelector('#paRapidPin').value.trim(),b=el.querySelector('#paRapidPin2').value.trim(),err=el.querySelector('.paRapidError');
    if(!/^\d{4}$/.test(a)){err.textContent='Masukkan PIN 4 digit.';return;}
    if(setupMode()){
      if(a!==b){err.textContent='PIN tidak sama. Cuba lagi.';return;}
      if(!setPin(a)){err.textContent='PIN tidak dapat disimpan. Cuba lagi.';return;}
    }else if(a!==getPin()){err.textContent='PIN tidak tepat. Minta ibu bapa cuba lagi.';const f=el.querySelector('#paRapidPin');f.value='';paintSlots(f);el.querySelector('[data-slots="a"]').classList.remove('shake');void f.offsetWidth;el.querySelector('[data-slots="a"]').classList.add('shake');f.focus();return;}
    const list=el.querySelector('.paRapidItems');
    list.innerHTML=(pending?.items||[]).map(x=>`<li><p>${esc(x.prompt||'Soalan')}</p><div><span class="no">Anak: <b>${esc(x.answer||'-')}</b></span>${x.correct?`<span class="ok">Betul: <b>${esc(x.correct)}</b></span>`:''}<span class="t">⚡ ${esc(x.sec)} s</span></div></li>`).join('');
    el.querySelector('[data-step="child"]').hidden=true;el.querySelector('[data-step="review"]').hidden=false;
    phase='review';
    try{root.PAEffortGuard?.resetAfterParent?.()}catch(_){}
  }
  function resume(choice){
    if(phase!=='review'||!pending)return;
    if(!sameProfile(pending)){cancel();return}
    const d=liveDb();
    if(d&&!d.demoMode){
      if(choice==='explore')d.portalRestu={...(d.portalRestu||{}),offUntil:endOfDayMYT(Date.now()),offAt:Date.now()};
      const log=Array.isArray(d.rapidLockLog)?d.rapidLockLog:[];
      if(log.length)log[log.length-1].choice=choice;
      try{typeof save==='function'&&save()}catch(_){}
    }
    const done=pending.onDone;
    cancel();root.PASegelHost?.resumeAfterRestu?.();
    try{done?.(choice)}catch(_){}
  }

  function logLock(items){
    const d=liveDb();if(!d||d.demoMode)return;
    d.rapidLockLog=[...(Array.isArray(d.rapidLockLog)?d.rapidLockLog:[]),{at:Date.now(),items:items.length}].slice(-20);
    try{typeof save==='function'&&save()}catch(_){}
  }

  /* Called from PATelemetry.response for every answer event. */
  function observe(skillId,ok,tag,sec,usedHint,q,mode,value){
    try{
      const d=liveDb(),s=liveSess();
      if(!d||d.demoMode||s?.demoMode||s?.devBattlefield||pending)return null;
      if(d.restuLock?.active)return null;               // the older Restu lock already owns the screen
      let out=engineFor(s).observe({q,ok,sec,firstAttempt:/first-attempt/.test(String(mode||'')),value});
      if(out==='lock'&&portalOff(d))out='warn';          // parent allowed exploring today
      if(out==='warn')warn();
      if(out==='lock'){const items=engineFor(s).lastItems;logLock(items);lock(items);}
      return out;
    }catch(_){return null}
  }

  function state(){const e=engineFor(liveSess()),d=liveDb();return{streak:e.streak,hasLocked:e.hasLocked,locks:e.locks,portalOff:portalOff(d),offUntil:Number(d?.portalRestu?.offUntil||0)}}
  return{createEngine,floor,endOfDayMYT,portalOff,observe,lock,cancel,warn,state,WARN_AT,LOCK_AT,isLocked:()=>!!pending};
});
