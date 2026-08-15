// Pahlawan Angka v3.21.2 — Boss Typed Answer experiment only.
(()=>{
  'use strict';
  const VERSION='3.21.2';
  const devActive=()=>{try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}};
  const safeText=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

  // v3.21.0 World Response was cancelled. Remove any stale profile/UI state left by older builds.
  function purgeRetiredWorldState(){
    let changed=false;
    if(db){
      for(const key of ['worldResponse','devWorldResponse','devWorldPreviewStage','devWorldPreviewChapter']){
        if(Object.prototype.hasOwnProperty.call(db,key)){delete db[key];changed=true;}
      }
    }
    document.documentElement?.removeAttribute('data-world-response');
    document.documentElement?.removeAttribute('data-dev-world-response');
    document.querySelector('.paWorldStatus')?.remove();
    document.querySelector('.paWorldMap')?.remove();
    document.querySelector('.paWorldLandmark')?.remove();
    document.getElementById('paWorldEvent')?.remove();
    document.querySelectorAll('.paWorldMissionCard').forEach(card=>{
      card.classList.remove('paWorldMissionCard');card.removeAttribute('data-world-stage');card.querySelector('.paWorldMissionBadge')?.remove();
    });
    const profile=document.querySelector('.hubProfile');
    if(profile){profile.classList.remove('paWorldProfile');profile.style.removeProperty('--pa-world-bg');profile.removeAttribute('data-world-theme');profile.removeAttribute('data-world-stage');}
    if(changed&&typeof save==='function')save();
  }

  function parseAnswerSpec(answer){
    if(typeof answer==='number'&&Number.isFinite(answer))return{kind:'number',value:Number(answer)};
    const raw=safeText(answer),core=raw.replace(/\s+/g,'');
    if(/^-?\d+(?:,\d{3})*(?:\.\d+)?$/.test(core))return{kind:'number',value:Number(core.replace(/,/g,''))};
    if(/^RM-?\d+(?:,\d{3})*(?:\.\d{1,2})?$/i.test(core))return{kind:'money',value:Number(core.replace(/^RM/i,'').replace(/,/g,''))};
    if(/^-?\d+(?:,\d{3})*(?:\.\d+)?%$/.test(core))return{kind:'percent',value:Number(core.replace(/[% ,]/g,''))};
    return null;
  }
  function parseTypedValue(value,kind){
    let raw=safeText(value).replace(/\s+/g,'');
    if(kind==='money')raw=raw.replace(/^RM/i,'');
    if(kind==='percent')raw=raw.replace(/%$/,'');
    raw=raw.replace(/,/g,'');
    if(!/^-?\d+(?:\.\d+)?$/.test(raw))return null;
    const n=Number(raw);return Number.isFinite(n)?n:null;
  }
  function typedEligible(question){return !!parseAnswerSpec(question?.answer)}
  function typedMatch(question,value){
    const spec=parseAnswerSpec(question?.answer);if(!spec)return false;
    const got=parseTypedValue(value,spec.kind);return got!==null&&Math.abs(got-spec.value)<1e-9;
  }
  function inferTypedWrongTag(question,value){
    const spec=parseAnswerSpec(question?.answer),got=spec?parseTypedValue(value,spec.kind):null;
    if(got!==null){
      const ranked=(question?.wrong||[]).map(w=>({w,s:parseAnswerSpec(w?.v??w?.label)})).filter(x=>x.s)
        .map(x=>({tag:x.w.tag||'generated',d:Math.abs(got-x.s.value)})).sort((a,b)=>a.d-b.d);
      if(ranked[0])return ranked[0].tag;
    }
    return question?.wrong?.[0]?.tag||'generated';
  }

  function normalBossTypedCandidate(){
    if(!sess||sess.enemyTier!=='boss')return false;
    if(sess.coachAdaptive||sess.devBankTest||sess.guardianFocus||sess.bossStretchCurrent)return false;
    if((sess.bossTypedUsed||0)>=2)return false;
    const n=Number(sess.bossQuestionsAnswered||0)+1;
    if(n<2||n>5)return false;
    const last=Number(sess.lastTypedBossQuestion||0);
    if((sess.bossTypedUsed||0)===0)return true;
    return n>=4&&n-last>=2;
  }
  function shouldTypedQuestion(question){
    if(!typedEligible(question))return false;
    if(devActive()&&db?.devForceTypedAnswer)return true;
    return normalBossTypedCandidate();
  }

  function renderTypedAnswer(question){
    const answers=document.getElementById('answers');if(!answers||!question)return;
    const spec=parseAnswerSpec(question.answer);if(!spec)return;
    sess.typedAnswerActive=true;question.responseMode='typed';
    if(sess.enemyTier==='boss'&&!(devActive()&&db?.devForceTypedAnswer)){
      const n=Number(sess.bossQuestionsAnswered||0)+1;
      sess.bossTypedUsed=Number(sess.bossTypedUsed||0)+1;sess.lastTypedBossQuestion=n;
    }
    answers.innerHTML='';
    const form=document.createElement('form');form.className='paTypedAnswer';form.autocomplete='off';
    const label=document.createElement('label');label.className='paTypedLabel';label.htmlFor='paTypedInput';
    label.innerHTML='<span>BOSS PROOF</span><b>Taip jawapan sendiri</b>';
    const row=document.createElement('div');row.className='paTypedRow';
    const input=document.createElement('input');input.id='paTypedInput';input.className='paTypedInput';input.type='text';input.inputMode='decimal';input.autocapitalize='off';input.autocomplete='off';
    input.placeholder=spec.kind==='money'?'Taip nilai (RM pilihan)':spec.kind==='percent'?'Taip nilai (% pilihan)':'Taip jawapan';input.setAttribute('aria-label','Taip jawapan sendiri');
    const button=document.createElement('button');button.type='submit';button.className='paTypedSubmit';button.textContent='Jawab';button.dataset.questionToken=String(question.token);
    const note=document.createElement('small');note.className='paTypedNote';note.textContent='Tiada pilihan jawapan · tunjuk apa yang kamu benar-benar tahu';
    row.append(input,button);form.append(label,row,note);answers.appendChild(form);
    form.onsubmit=e=>{
      e.preventDefault();if(button.disabled||input.disabled)return;
      const raw=input.value.trim();if(!raw){input.classList.add('needsValue');input.focus();return;}
      input.classList.remove('needsValue');input.disabled=true;button.disabled=true;
      const ok=typedMatch(question,raw),option=ok?{v:question.answer,tag:'correct',label:question.answer}:{v:raw,tag:inferTypedWrongTag(question,raw),label:raw};
      if(typeof respond==='function')respond(option,button,question);
    };
    setTimeout(()=>input.focus({preventScroll:true}),40);
  }
  function clearTypedState(){if(sess)sess.typedAnswerActive=false;}
  function setupTypedForCurrentQuestion(){const q=sess?.q;if(!q){clearTypedState();return;}clearTypedState();if(shouldTypedQuestion(q))renderTypedAnswer(q);}

  function devToggleForceTyped(){
    if(!devActive())return;db.devForceTypedAnswer=!db.devForceTypedAnswer;save?.();renderDevExperimentControls();
    if(typeof showRewardToast==='function')showRewardToast(`DEV Force Typed ${db.devForceTypedAnswer?'ON':'OFF'}`);
  }
  function ensureDevExperimentControls(){
    const panel=document.getElementById('devPanel');if(!panel||panel.querySelector(`[data-dev-experiments="${VERSION}"]`))return;
    // Remove stale v3.21.1 experiment box if a hot-reload kept it in the DOM.
    panel.querySelectorAll('.paDevExperiment').forEach(x=>x.remove());
    const box=document.createElement('div');box.className='devScenario paDevExperiment';box.dataset.devExperiments=VERSION;
    box.innerHTML=`<b>Boss Typed Answer Lab</b><p class="mut devMiniCopy">Normal gameplay: maksimum 2 soalan boss ditaip, hanya jika format jawapan selamat. Force ini untuk test mana-mana skill.</p><button id="devForceTypedBtn" class="btn ghost small devToggle" type="button">⌨ Force Typed Preview: OFF</button>`;
    const terrain=[...panel.querySelectorAll('.devScenario')].find(x=>/Terrain Preview/.test(x.textContent||''));if(terrain)panel.insertBefore(box,terrain);else panel.appendChild(box);
    box.querySelector('#devForceTypedBtn').onclick=devToggleForceTyped;
  }
  function renderDevExperimentControls(){
    ensureDevExperimentControls();const typed=document.getElementById('devForceTypedBtn');if(!typed)return;
    const on=!!db?.devForceTypedAnswer;typed.textContent=`⌨ Force Typed Preview: ${on?'ON':'OFF'}`;typed.classList.toggle('active',on);typed.setAttribute('aria-pressed',on?'true':'false');
  }

  const previousRenderDev=window.renderDevPanel;
  if(typeof previousRenderDev==='function')window.renderDevPanel=function(){const out=previousRenderDev.apply(this,arguments);renderDevExperimentControls();return out;};
  const previousHub=window.renderHub;
  if(typeof previousHub==='function')window.renderHub=function(){purgeRetiredWorldState();return previousHub.apply(this,arguments);};
  const previousMissions=window.renderMissions;
  if(typeof previousMissions==='function')window.renderMissions=function(){purgeRetiredWorldState();return previousMissions.apply(this,arguments);};
  const previousNextQ=window.nextQ;
  if(typeof previousNextQ==='function')window.nextQ=function(){const out=previousNextQ.apply(this,arguments);setupTypedForCurrentQuestion();return out;};
  const previousHint=window.hint;
  if(typeof previousHint==='function')window.hint=function(){
    const out=previousHint.apply(this,arguments);
    if(sess?.typedAnswerActive&&sess?.retryState){
      const input=document.querySelector('.paTypedInput'),button=document.querySelector('.paTypedSubmit');
      if(input){input.disabled=false;input.value='';input.classList.remove('needsValue');}
      if(button){button.disabled=false;button.classList.remove('no');}
      setTimeout(()=>input?.focus({preventScroll:true}),30);
      const retry=document.querySelector('.retryPrompt');if(retry)retry.textContent='Sekarang taip jawapan sekali lagi.';
    }
    return out;
  };

  purgeRetiredWorldState();
  window.PADevExperiments={version:VERSION,typedEligible,typedMatch,shouldTypedQuestion,purgeRetiredWorldState};
  window.devToggleForceTyped=devToggleForceTyped;
  document.documentElement.dataset.devExperiments=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
