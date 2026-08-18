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

  // v3.24.3 enemy roster: approved production names/assets.
  // Pigiramid replaces the third generic minion slot.
  if(typeof MINION_ENEMIES!=='undefined'&&Array.isArray(MINION_ENEMIES)){
    MINION_ENEMIES[2]={name:'Pigiramid',image:'assets/enemies/minions/pigiramid.webp',tone:'minion-c'};
  }
  // Bahbahgi replaces the Chapter 3 fraction boss. Intentionally no frame directory:
  // keep one consistent approved static battle asset instead of falling back to old Raja Bahagian Sama frames.
  if(typeof BOSS_BY_CHAPTER!=='undefined'){
    BOSS_BY_CHAPTER['3']={name:'Bahbahgi',image:'assets/enemies/fractions/bahbahgi.webp',tone:'fraction'};
  }

  updateDevQuickButton();
})();
