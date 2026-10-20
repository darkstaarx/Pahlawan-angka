/* Pahlawan Angka — "Rehat sekejap dengan ibu bapa" (Phase 2, docs/PA-DIAGNOSTIC-BRAIN.md §5).
   Rule (agreed with owner, 21 Oct 2026):
   - Count FIRST attempts only. A wrong first attempt faster than the item's
     reading-load floor (1.8–3.2 s, same as PAEffortGuard.limit) is a rapid guess.
   - Correct answer, or a wrong answer given with real thinking time, resets to 0.
   - 2 rapid guesses in a row → gentle warning. 3 → lock until a parent enters
     the 4-digit guardian PIN (or sets one). The parent then sees the 3 items.
   - At most one lock per play session; never in guest demo / dev battlefield.
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
    let streak=[], seenWrong=new Set(), locked=false;
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
          if(locked)return 'warn';                         // one lock per session; afterwards warn only
          locked=true;this.lastItems=items;return 'lock';
        }
        return streak.length>=WARN_AT?'warn':null;
      },
      get streak(){return streak.length},
      get hasLocked(){return locked},
      lastItems:[]
    };
  }

  if(!root||typeof document==='undefined')return{createEngine,floor,WARN_AT,LOCK_AT};

  // ---------- browser UI ----------
  const engines=new WeakMap();
  const liveDb=()=>{try{return typeof db!=='undefined'?db:null}catch(_){return null}};
  const liveSess=()=>{try{return typeof sess!=='undefined'?sess:null}catch(_){return null}};
  const getPin=()=>{try{const p=String(typeof pageLockParentPin==='function'?pageLockParentPin()||'':'');return /^\d{4}$/.test(p)?p:null}catch(_){return null}};
  const setPin=pin=>{try{return typeof createPageLockParentPin==='function'&&createPageLockParentPin(pin)}catch(_){return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let el=null, warnEl=null, warnTimer=0, pending=null;

  function engineFor(session){
    const key=session&&typeof session==='object'?session:root;
    if(!engines.has(key))engines.set(key,createEngine());
    return engines.get(key);
  }

  // Same art kit as the BERJAYA result screen; PA_ASSETS can override (dev lab / offline).
  const ASSET={crest:'assets/ui/victory-result/crest-frame.webp',left:'assets/ui/victory-result/crest-side-left.webp',
    right:'assets/ui/victory-result/crest-side-right.webp',frame:'assets/ui/victory-result/summary-frame.webp',
    gold:'assets/ui/victory-result/button-gold-rest.webp',goldDown:'assets/ui/victory-result/button-gold-press.webp',
    cikgu:'assets/coach/cikgu-dimensi/hub-portrait-v1.webp',aurora:'assets/pets/aurora/frames/sad-0-v1.webp'};
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
    el.innerHTML=`<section class="paRapidStage">
      <div class="paRapidStep" data-step="child">
        <h2 id="paRapidTitle" class="paRapidSr">Rehat sekejap dengan ibu bapa</h2>
        ${crest('REHAT SEKEJAP')}
        <div class="paRapidPet"><img src="${art('aurora')}" alt=""></div>
        <p class="paRapidLead">Aurora tunggu kamu! Panggil ibu bapa dulu ya.</p>
        <div class="paRapidFrame">
          <div class="paRapidCoach"><img src="${art('cikgu')}" alt=""><div class="paRapidSay"><span class="paRapidChip">Cikgu Dimensi</span>
            <p>Cikgu nampak 3 jawapan dipilih terlalu cepat. Wira sebenar baca soalan dulu sebelum menyerang!</p></div></div>
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
        <button type="button" class="paRapidBtn" data-act="resume">Teruskan main</button>
      </div>
    </section>`;
    document.body.append(el);
    el.querySelector('[data-act="unlock"]').addEventListener('click',unlock);
    el.querySelector('[data-act="resume"]').addEventListener('click',resume);
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
    if(!el)build();
    pending={items:items||[],onDone};
    const create=setupMode();
    el.querySelector('[data-pin-label]').textContent=create?'Ibu bapa: PIN belum ada. Cipta PIN 4 digit':'Ibu bapa: masukkan PIN Penjaga';
    el.querySelector('[data-pin2-label]').hidden=!create;el.querySelector('[data-slots="b"]').hidden=!create;
    el.querySelector('[data-act="unlock"]').textContent=create?'Simpan PIN & buka':'Buka';
    el.querySelectorAll('.paRapidPin').forEach(i=>{i.value='';paintSlots(i)});
    el.querySelector('.paRapidError').textContent='';
    el.querySelector('[data-step="child"]').hidden=false;el.querySelector('[data-step="review"]').hidden=true;
    warnEl?.classList.remove('show');
    el.classList.remove('hidden');document.body.classList.add('pa-rapid-locked');
    setTimeout(()=>el.querySelector('#paRapidPin')?.focus(),150);
  }
  function unlock(){
    const a=el.querySelector('#paRapidPin').value.trim(),b=el.querySelector('#paRapidPin2').value.trim(),err=el.querySelector('.paRapidError');
    if(!/^\d{4}$/.test(a)){err.textContent='Masukkan PIN 4 digit.';return;}
    if(setupMode()){
      if(a!==b){err.textContent='PIN tidak sama. Cuba lagi.';return;}
      if(!setPin(a)){err.textContent='PIN tidak dapat disimpan. Cuba lagi.';return;}
    }else if(a!==getPin()){err.textContent='PIN tidak tepat. Minta ibu bapa cuba lagi.';const f=el.querySelector('#paRapidPin');f.value='';paintSlots(f);el.querySelector('[data-slots="a"]').classList.remove('shake');void f.offsetWidth;el.querySelector('[data-slots="a"]').classList.add('shake');f.focus();return;}
    const list=el.querySelector('.paRapidItems');
    list.innerHTML=(pending?.items||[]).map(x=>`<li><p>${esc(x.prompt||'Soalan')}</p><div><span class="no">Anak: <b>${esc(x.answer||'-')}</b></span>${x.correct?`<span class="ok">Betul: <b>${esc(x.correct)}</b></span>`:''}<span class="t">⚡ ${esc(x.sec)} s</span></div></li>`).join('');
    el.querySelector('[data-step="child"]').hidden=true;el.querySelector('[data-step="review"]').hidden=false;
    try{root.PAEffortGuard?.resetAfterParent?.()}catch(_){}
  }
  function resume(){
    el.classList.add('hidden');document.body.classList.remove('pa-rapid-locked');
    const done=pending?.onDone;pending=null;try{done?.()}catch(_){}
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
      if(!d||d.demoMode||s?.demoMode||s?.devBattlefield)return null;
      if(d.restuLock?.active)return null;               // the older Restu lock already owns the screen
      const out=engineFor(s).observe({q,ok,sec,firstAttempt:/first-attempt/.test(String(mode||'')),value});
      if(out==='warn')warn();
      if(out==='lock'){const items=engineFor(s).lastItems;logLock(items);lock(items);}
      return out;
    }catch(_){return null}
  }

  function state(){const e=engineFor(liveSess());return{streak:e.streak,hasLocked:e.hasLocked}}
  return{createEngine,floor,observe,lock,warn,state,WARN_AT,LOCK_AT,isLocked:()=>!!el&&!el.classList.contains('hidden')};
});
