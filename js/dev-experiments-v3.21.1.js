// Pahlawan Angka v3.21.1 — Dev World Lab + Boss Typed Answer experiment
(()=>{
  'use strict';
  const VERSION='3.21.1';
  const WORLD_STAGE_LABEL=['Masih sunyi','Mula menyala','Sedang dipulihkan','Pulih sepenuhnya'];

  const devActive=()=>{try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}};
  const worldEnabled=()=>!!(devActive()&&db?.devWorldResponse);
  const safeText=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

  function cleanWorldUi(){
    document.documentElement.dataset.devWorldResponse='off';
    const profile=document.querySelector('.hubProfile');
    if(profile){
      profile.classList.remove('paWorldProfile');
      profile.style.removeProperty('--pa-world-bg');
      profile.removeAttribute('data-world-theme');
      profile.removeAttribute('data-world-stage');
    }
    document.querySelector('.paWorldLandmark')?.remove();
    document.querySelector('.paWorldStatus')?.remove();
    document.querySelector('.paWorldMap')?.remove();
    document.querySelectorAll('.paWorldMissionCard').forEach(card=>{
      card.classList.remove('paWorldMissionCard');
      card.removeAttribute('data-world-stage');
      card.querySelector('.paWorldMissionBadge')?.remove();
    });
    const event=document.getElementById('paWorldEvent');
    if(event){event.classList.remove('show');event.classList.add('hidden');}
  }

  function previewChapter(){
    const wanted=String(db?.devWorldPreviewChapter||db?.activeMissionChapter||db?.coreFrontier||'1');
    return wanted;
  }
  function previewStage(){
    const n=Number(db?.devWorldPreviewStage);
    return Number.isInteger(n)&&n>=0&&n<=3?n:null;
  }
  function applyWorldPreview(){
    if(!worldEnabled())return;
    document.documentElement.dataset.devWorldResponse='on';
    const stage=previewStage(); if(stage===null)return;
    const ch=previewChapter(),landmark=window.PAWorldResponse?.landmarks?.[ch];
    const state=window.PAWorldResponse?.chapterState?.(ch);
    const name=landmark?.name||state?.name||`Mercu Topik ${ch}`;
    const symbol=landmark?.symbol||state?.symbol||ch;

    const profile=document.querySelector('.hubProfile.paWorldProfile');
    if(profile)profile.dataset.worldStage=String(stage);
    const mark=document.querySelector('.paWorldLandmark');
    if(mark){
      mark.dataset.stage=String(stage);
      const sigil=mark.querySelector('.paWorldSigil');if(sigil)sigil.textContent=symbol;
    }
    const status=document.querySelector('.paWorldStatus');
    if(status){
      status.dataset.stage=String(stage);
      const body=status.querySelector('.paWorldStatusBody');
      if(body)body.innerHTML=`<small>DUNIA BERTINDAK BALAS · DEV PREVIEW</small><b>${name}</b><span>${WORLD_STAGE_LABEL[stage]} · simulasi visual sahaja</span>`;
      const dots=status.querySelector('.paWorldStageDots');
      if(dots)dots.innerHTML=Array.from({length:3},(_,i)=>`<i class="${i<stage?'on':''}"></i>`).join('');
    }
    document.querySelectorAll('.paWorldNode').forEach(node=>{
      if(node.dataset.worldChapter!==ch)return;
      node.classList.remove('stage-0','stage-1','stage-2','stage-3');
      node.classList.add(`stage-${stage}`);
      const label=node.querySelector('i');if(label)label.textContent=`DEV · ${WORLD_STAGE_LABEL[stage]}`;
    });
    const cards=[...document.querySelectorAll('#missionGrid .missionCard')];
    const chapters=[...new Set((typeof GRAPH!=='undefined'?GRAPH.skills:[]).filter(x=>x.grade===db.schoolGrade).map(x=>String(x.chapter)))].sort((a,b)=>+a-+b);
    const card=cards[chapters.indexOf(ch)];
    if(card){
      card.dataset.worldStage=String(stage);card.classList.add('paWorldMissionCard');
      let badge=card.querySelector('.paWorldMissionBadge');
      if(!badge){badge=document.createElement('span');badge.className='paWorldMissionBadge';card.querySelector('.missionBody')?.appendChild(badge);}
      if(badge)badge.textContent=`DEV · ${WORLD_STAGE_LABEL[stage]}`;
    }
  }
  function syncWorldExperiment(){
    if(!worldEnabled()){cleanWorldUi();return;}
    document.documentElement.dataset.devWorldResponse='on';
    if(document.body.dataset.screen==='hub')window.PAWorldResponse?.renderHub?.();
    if(document.body.dataset.screen==='missions')window.PAWorldResponse?.renderMap?.();
    applyWorldPreview();
  }

  function devToggleWorldResponse(){
    if(!devActive())return;
    db.devWorldResponse=!db.devWorldResponse;
    if(!db.devWorldResponse){delete db.devWorldPreviewStage;delete db.devWorldPreviewChapter;}
    save?.();renderDevExperimentControls();syncWorldExperiment();
    if(typeof showRewardToast==='function')showRewardToast(`DEV World Response ${db.devWorldResponse?'ON':'OFF'}`);
  }
  function devPreviewWorldStage(stage){
    if(!devActive())return;
    db.devWorldResponse=true;db.devWorldPreviewStage=Number(stage);
    db.devWorldPreviewChapter=String(db.activeMissionChapter||db.coreFrontier||1);
    save?.();renderDevExperimentControls();
    if(typeof closeDevPanel==='function')closeDevPanel();
    if(typeof renderHub==='function')renderHub();
    setTimeout(applyWorldPreview,30);
  }
  function devWorldActual(){
    if(!devActive())return;
    db.devWorldResponse=true;delete db.devWorldPreviewStage;delete db.devWorldPreviewChapter;save?.();
    renderDevExperimentControls();syncWorldExperiment();
    if(typeof showRewardToast==='function')showRewardToast('World Response · data sebenar');
  }

  function parseAnswerSpec(answer){
    if(typeof answer==='number'&&Number.isFinite(answer))return{kind:'number',value:Number(answer)};
    const raw=safeText(answer);
    const core=raw.replace(/\s+/g,'');
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
    const got=parseTypedValue(value,spec.kind);if(got===null)return false;
    return Math.abs(got-spec.value)<1e-9;
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
    if((sess.bossTypedUsed||0)===0)return true; // first safe item from boss Q2 onward
    return n>=4 && n-last>=2; // second must be separated; max two
  }
  function shouldTypedQuestion(question){
    if(!typedEligible(question))return false;
    if(devActive()&&db?.devForceTypedAnswer)return true;
    return normalBossTypedCandidate();
  }

  function renderTypedAnswer(question){
    const answers=document.getElementById('answers');if(!answers||!question)return;
    const spec=parseAnswerSpec(question.answer);if(!spec)return;
    sess.typedAnswerActive=true;
    question.responseMode='typed';
    if(sess.enemyTier==='boss'&&!(devActive()&&db?.devForceTypedAnswer)){
      const n=Number(sess.bossQuestionsAnswered||0)+1;
      sess.bossTypedUsed=Number(sess.bossTypedUsed||0)+1;
      sess.lastTypedBossQuestion=n;
    }
    answers.innerHTML='';
    const form=document.createElement('form');form.className='paTypedAnswer';form.autocomplete='off';
    const label=document.createElement('label');label.className='paTypedLabel';label.htmlFor='paTypedInput';
    label.innerHTML='<span>BOSS PROOF</span><b>Taip jawapan sendiri</b>';
    const row=document.createElement('div');row.className='paTypedRow';
    const input=document.createElement('input');input.id='paTypedInput';input.className='paTypedInput';
    input.type='text';input.inputMode='decimal';input.autocapitalize='off';input.autocomplete='off';
    input.placeholder=spec.kind==='money'?'Taip nilai (RM pilihan)':spec.kind==='percent'?'Taip nilai (% pilihan)':'Taip jawapan';
    input.setAttribute('aria-label','Taip jawapan sendiri');
    const button=document.createElement('button');button.type='submit';button.className='paTypedSubmit';button.textContent='Jawab';
    button.dataset.questionToken=String(question.token);
    const note=document.createElement('small');note.className='paTypedNote';note.textContent='Tiada pilihan jawapan · tunjuk apa yang kamu benar-benar tahu';
    row.append(input,button);form.append(label,row,note);answers.appendChild(form);
    form.onsubmit=e=>{
      e.preventDefault();
      if(button.disabled||input.disabled)return;
      const raw=input.value.trim();if(!raw){input.classList.add('needsValue');input.focus();return;}
      input.classList.remove('needsValue');input.disabled=true;button.disabled=true;
      const ok=typedMatch(question,raw);
      const option=ok?{v:question.answer,tag:'correct',label:question.answer}:{v:raw,tag:inferTypedWrongTag(question,raw),label:raw};
      if(typeof respond==='function')respond(option,button,question);
    };
    setTimeout(()=>input.focus({preventScroll:true}),40);
  }
  function clearTypedState(){if(sess)sess.typedAnswerActive=false;}
  function setupTypedForCurrentQuestion(){
    const q=sess?.q;if(!q){clearTypedState();return;}
    clearTypedState();
    if(shouldTypedQuestion(q))renderTypedAnswer(q);
  }

  function devToggleForceTyped(){
    if(!devActive())return;
    db.devForceTypedAnswer=!db.devForceTypedAnswer;save?.();renderDevExperimentControls();
    if(typeof showRewardToast==='function')showRewardToast(`DEV Force Typed ${db.devForceTypedAnswer?'ON':'OFF'}`);
  }

  function ensureDevExperimentControls(){
    const panel=document.getElementById('devPanel');if(!panel||panel.querySelector('[data-dev-experiments="3.21.1"]'))return;
    const box=document.createElement('div');box.className='devScenario paDevExperiment';box.dataset.devExperiments=VERSION;
    box.innerHTML=`
      <b>World Response Lab</b>
      <p class="mut devMiniCopy">Feature ini disorok daripada murid biasa sementara diuji. Preview tidak mengubah mastery sebenar.</p>
      <div class="row paDevRow">
        <button id="devWorldToggle" class="btn ghost small devToggle" type="button">🌍 World Response: OFF</button>
        <button id="devWorldActual" class="btn ghost small" type="button">Data Sebenar</button>
      </div>
      <div class="devLabGrid paWorldPreviewGrid">
        <button class="btn ghost small" type="button" data-world-stage-preview="0">Sunyi</button>
        <button class="btn ghost small" type="button" data-world-stage-preview="1">Menyala</button>
        <button class="btn ghost small" type="button" data-world-stage-preview="2">Sedang Pulih</button>
        <button class="btn ghost small" type="button" data-world-stage-preview="3">Pulih Penuh</button>
      </div>
      <div class="paDevDivider"></div>
      <b>Boss Typed Answer Lab</b>
      <p class="mut devMiniCopy">Normal gameplay: maksimum 2 soalan boss ditaip, hanya jika format jawapan selamat. Force ini untuk test mana-mana skill.</p>
      <button id="devForceTypedBtn" class="btn ghost small devToggle" type="button">⌨ Force Typed Preview: OFF</button>`;
    const terrain=[...panel.querySelectorAll('.devScenario')].find(x=>/Terrain Preview/.test(x.textContent||''));
    if(terrain)panel.insertBefore(box,terrain);else panel.appendChild(box);
    box.querySelector('#devWorldToggle').onclick=devToggleWorldResponse;
    box.querySelector('#devWorldActual').onclick=devWorldActual;
    box.querySelector('#devForceTypedBtn').onclick=devToggleForceTyped;
    box.querySelectorAll('[data-world-stage-preview]').forEach(b=>b.onclick=()=>devPreviewWorldStage(+b.dataset.worldStagePreview));
  }
  function renderDevExperimentControls(){
    ensureDevExperimentControls();
    const world=document.getElementById('devWorldToggle'),actual=document.getElementById('devWorldActual'),typed=document.getElementById('devForceTypedBtn');
    if(world){const on=worldEnabled();world.textContent=`🌍 World Response: ${on?'ON':'OFF'}`;world.classList.toggle('active',on);world.setAttribute('aria-pressed',on?'true':'false');}
    if(actual){const preview=previewStage();actual.textContent=preview===null?'Data Sebenar ✓':'Data Sebenar';actual.classList.toggle('active',preview===null&&worldEnabled());}
    if(typed){const on=!!db?.devForceTypedAnswer;typed.textContent=`⌨ Force Typed Preview: ${on?'ON':'OFF'}`;typed.classList.toggle('active',on);typed.setAttribute('aria-pressed',on?'true':'false');}
  }

  const previousRenderDev=window.renderDevPanel;
  if(typeof previousRenderDev==='function')window.renderDevPanel=function(){const out=previousRenderDev.apply(this,arguments);renderDevExperimentControls();return out;};

  const previousHub=window.renderHub;
  if(typeof previousHub==='function')window.renderHub=function(){const out=previousHub.apply(this,arguments);syncWorldExperiment();return out;};

  const previousMissions=window.renderMissions;
  if(typeof previousMissions==='function')window.renderMissions=function(){const out=previousMissions.apply(this,arguments);syncWorldExperiment();return out;};

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

  // Keep experimental world UI invisible unless explicitly enabled in DEV.
  cleanWorldUi();
  window.PADevExperiments={
    version:VERSION,
    worldEnabled,
    syncWorld:syncWorldExperiment,
    typedEligible,
    typedMatch,
    shouldTypedQuestion,
    previewStage:devPreviewWorldStage
  };
  window.devToggleWorldResponse=devToggleWorldResponse;
  window.devPreviewWorldStage=devPreviewWorldStage;
  window.devWorldActual=devWorldActual;
  window.devToggleForceTyped=devToggleForceTyped;
  document.documentElement.dataset.devExperiments=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
