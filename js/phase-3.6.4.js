// Phase 3.6.3/3.6.4 compatibility overrides for the Phase 3.6.2 base.
(function(){
  const baseScreen=window.screen;
  window.isDemoStudent=function(){return !!(uiSession&&uiSession.role==='student')};
  window.updateDevQuickButton=function(){const b=document.getElementById('devQuickBtn');if(!b)return;b.classList.toggle('hidden',!(db&&isDevMode()));};
  window.updateBottomNav=function(id){
    const nav=document.getElementById('appBottomNav'); if(!nav)return;
    nav.classList.toggle('show',['hub','missions','treasure','parent'].includes(id));
    nav.querySelectorAll('.navItem').forEach(b=>b.classList.remove('active'));
    const key=id==='treasure'?'treasure':id==='parent'?'parent':id==='missions'?'mission':id==='hub'?'hub':'';
    const active=key&&nav.querySelector(`[data-nav="${key}"]`); if(active)active.classList.add('active');
  };
  window.screen=function(id){baseScreen(id);updateBottomNav(id);updateDevQuickButton();};
  window.openDevPanel=function(){if(!(db&&isDevMode()))return;renderDevPanel();document.getElementById('devOverlay')?.classList.remove('hidden');document.body.classList.add('dev-open');};
  window.closeDevPanel=function(){document.getElementById('devOverlay')?.classList.add('hidden');document.body.classList.remove('dev-open');};
  window.renderMissions=function(){
    if(!db)return; if(typeof enforceRestuLock==='function'&&enforceRestuLock())return;
    ensureProgression();updateFrontier();
    const wrap=document.getElementById('missionGrid');if(!wrap)return;wrap.innerHTML='';
    const chapters=[...new Set(GRAPH.skills.filter(x=>x.grade===db.schoolGrade).map(x=>String(x.chapter)))].sort((a,b)=>+a-+b);
    chapters.forEach(ch=>{
      const locked=!isDevMode()&&+ch>db.coreFrontier, mastery=chapterMasteryPct(ch), stars=db.chapterStars[ch]||0;
      const card=document.createElement('button');
      card.className='missionCard '+(locked?'locked':(+ch===db.coreFrontier?'current':''))+(isDevMode()?' devUnlocked':'');card.disabled=locked;
      card.innerHTML=`<div class="missionIcon">${locked?'🔒':chapterIcon(ch)}</div><div class="missionBody"><div class="missionKicker">Topik ${ch}</div><b>${chapterTitle(ch)}</b><div class="missionStars">${starString(stars)}</div><div class="missionMeter"><span style="width:${mastery}%"></span></div><small>${locked?lockedMissionCopy(ch):mastery+'% kemajuan'}</small></div><div class="missionArrow">›</div>`;
      if(!locked)card.onclick=()=>startMission(ch);wrap.appendChild(card);
    });
    screen('missions');save();
  };
  window.navMission=function(){if(!db)return goLogin();renderMissions();};

  // v3.24.3 — approved generic minion roster only. No placeholder rotation.
  if(typeof MINION_ENEMIES!=='undefined'&&Array.isArray(MINION_ENEMIES)){
    MINION_ENEMIES.splice(0,MINION_ENEMIES.length,
      {name:'Askabus',image:'assets/enemies/minions/askabus.webp',tone:'minion-a'},
      {name:'Syilinggit',image:'assets/enemies/minions/syilinggit.webp',tone:'minion-b'},
      {name:'Pigiramid',image:'assets/enemies/minions/pigiramid.webp',tone:'minion-c'}
    );
  }

  // Bahbahgi replaces the Chapter 3 fraction boss. Intentionally no frame directory:
  // keep one consistent approved static battle asset instead of falling back to old Raja Bahagian Sama frames.
  if(typeof BOSS_BY_CHAPTER!=='undefined'){
    BOSS_BY_CHAPTER['3']={name:'Bahbahgi',image:'assets/enemies/fractions/bahbahgi.webp',tone:'fraction'};
  }

  // Load the authoritative character grounding/staging layer after legacy battle CSS.
  (function ensureUnitGroundingCss(){
    if(document.querySelector('link[data-pa-unit-grounding="3.24.5"]'))return;
    document.querySelector('link[data-pa-enemy-grounding]')?.remove();
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='css/unit-grounding-v3.24.5.css?v=3.24.5';
    link.dataset.paUnitGrounding='3.24.5';
    document.head.appendChild(link);
  })();

  // Product rule: typed/free-response is boss-only.
  // The old DEV Force Typed switch may remain useful, but it must never leak typed UI into minion rounds.
  function installBossOnlyTypedGuard(){
    const previousNextQ=window.nextQ;
    if(typeof previousNextQ!=='function'||previousNextQ.__paBossOnlyTypedGuard)return;

    function restoreChoiceAnswersForMinion(){
      if(!sess||sess.enemyTier==='boss')return;
      const q=sess.q,answers=document.getElementById('answers');
      if(!q||!answers)return;
      const typedForm=answers.querySelector('.paTypedAnswer');
      if(!typedForm&&!sess.typedAnswerActive)return;

      sess.typedAnswerActive=false;
      q.responseMode='choice';
      document.body?.classList.remove('paTypedInputFocused','paTypedKeyboardOpen');
      answers.classList.remove('paTypedAnswers');
      document.querySelector('.qcard')?.classList.remove('paTypedQCard');
      answers.innerHTML='';

      const options=[{v:q.answer,tag:'correct',label:q.answer},...(q.wrong||[])];
      shuffle(options).forEach(o=>{
        const b=document.createElement('button');
        b.className='ans';
        b.textContent=o.label??o.v;
        b.dataset.v=String(o.v);
        b.dataset.questionToken=String(q.token);
        b.onclick=()=>respond(o,b,q);
        answers.appendChild(b);
      });
    }

    const guardedNextQ=function(){
      const out=previousNextQ.apply(this,arguments);
      restoreChoiceAnswersForMinion();
      return out;
    };
    guardedNextQ.__paBossOnlyTypedGuard=true;
    window.nextQ=guardedNextQ;
    restoreChoiceAnswersForMinion();
  }

  if(document.readyState==='complete')installBossOnlyTypedGuard();
  else window.addEventListener('load',installBossOnlyTypedGuard,{once:true});

  // Cikgu Dimensi v0.2.1 loader. Additive only: legacy adaptive/intervention,
  // telemetry and spaced-review systems remain authoritative.
  (function loadDimensionalView(){
    if(document.querySelector('script[data-pa-dimensional-view="0.2.4"]'))return;
    const styles=[
      ['css/cikgu-dimensi-place-value-v0.1.css?v=0.2.1','place-value'],
      ['css/cikgu-dimensi-core-v0.2.css?v=0.2.3','core']
    ];
    styles.forEach(([href,key])=>{
      if(document.querySelector(`link[data-pa-dimensional-style="${key}"]`))return;
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.paDimensionalStyle=key;document.head.appendChild(link);
    });
    const queue=[
      'js/engine/dimensional-memory.js?v=0.2.1',
      'js/engine/dimensional-portal.js?v=0.2.4',
      'js/engine/representations/place-value.js?v=0.2.1',
      'js/engine/representations/fraction-area.js?v=0.2.1',
      'js/engine/representations/number-line.js?v=0.2.1',
      'js/engine/representations/grouping-array.js?v=0.2.1',
      'js/engine/representations/number-bond.js?v=0.2.1',
      'js/engine/representations/bar-relational.js?v=0.2.1',
      'js/engine/dimensional-catalog.js?v=0.2.1',
      'js/engine/dimensional-view.js?v=0.2.1',
      'js/engine/dimensional-lab.js?v=0.2.1'
    ];
    const loadAt=index=>{
      if(index>=queue.length)return;
      const script=document.createElement('script');script.src=queue[index];script.async=false;
      if(index===queue.length-1)script.dataset.paDimensionalView='0.2.4';
      script.onload=()=>loadAt(index+1);script.onerror=()=>console.warn('Cikgu Dimensi gagal dimuat:',queue[index]);
      document.head.appendChild(script);
    };
    loadAt(0);
  })();

  window.PAEnemyRosterPatch={version:'3.24.3',minions:['Askabus','Syilinggit','Pigiramid'],bossOnlyTyped:true};
  updateDevQuickButton();
})();
