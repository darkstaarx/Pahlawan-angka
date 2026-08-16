// Pahlawan Angka v3.21.4 — DEV Boss Jump Lab.
(()=>{
  'use strict';
  const VERSION='3.21.4';

  const devActive=()=>{try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}};
  const bossChaptersForGrade=grade=>{
    if(typeof GRAPH==='undefined')return [];
    return [...new Set(GRAPH.skills.filter(x=>x.grade===+grade&&BOSS_BY_CHAPTER?.[String(x.chapter)]).map(x=>String(x.chapter)))]
      .sort((a,b)=>+a-+b);
  };
  const firstSkillFor=(grade,ch)=>GRAPH.skills.find(x=>x.grade===+grade&&String(x.chapter)===String(ch))?.id||null;

  function populateBossSelect(){
    const sel=document.getElementById('devBossChapter'); if(!sel||!db)return;
    const grade=+(document.getElementById('devGrade')?.value||db.schoolGrade||2);
    const chapters=bossChaptersForGrade(grade);
    sel.innerHTML=chapters.map(ch=>{
      const boss=BOSS_BY_CHAPTER[ch];
      return `<option value="${ch}">Topik ${ch} · ${boss?.name||'Boss'}</option>`;
    }).join('');
  }

  function ensureBossLab(){
    const panel=document.getElementById('devPanel');
    if(!panel||!devActive())return;
    let box=panel.querySelector(`[data-dev-boss-lab="${VERSION}"]`);
    if(!box){
      box=document.createElement('div');
      box.className='devScenario paDevBossLab';
      box.dataset.devBossLab=VERSION;
      box.innerHTML=`
        <b>Boss Fight Test</b>
        <p class="mut devMiniCopy">Lompat terus ke fasa boss untuk semak saiz, posisi, attack, hit, finisher dan defeat flow. DEV test tidak perlu habiskan 9 soalan minion.</p>
        <label class="paDevBossLabel"><span>Boss</span><select id="devBossChapter"></select></label>
        <div class="row paDevBossActions">
          <button class="btn devPrimary small" type="button" id="devJumpBossBtn">👑 Jump Terus Boss</button>
        </div>`;
      const terrain=[...panel.querySelectorAll('.devScenario')].find(x=>/Terrain Preview/.test(x.textContent||''));
      if(terrain)panel.insertBefore(box,terrain); else panel.appendChild(box);
      box.querySelector('#devJumpBossBtn').onclick=()=>devJumpBoss();
    }
    populateBossSelect();
  }

  function devJumpBoss(ch=null){
    if(!devActive()||!db)return;
    const grade=+(document.getElementById('devGrade')?.value||db.schoolGrade||2);
    ch=String(ch||document.getElementById('devBossChapter')?.value||'');
    const skill=firstSkillFor(grade,ch);
    if(!ch||!BOSS_BY_CHAPTER?.[ch]||!skill){
      if(typeof showRewardToast==='function')showRewardToast('DEV: boss/topik tidak tersedia untuk darjah ini');
      return;
    }

    db.schoolGrade=grade;
    db.activeMissionChapter=ch;
    if(typeof initAll==='function')initAll();
    if(typeof save==='function')save();

    const arena=document.getElementById('battleArena');
    arena?.classList.remove('boss-cleared');
    document.getElementById('bossCheckpoint')?.classList.remove('show');

    // Reuse DEV bank-test protection so normal XP/coin/skill progression is not awarded.
    sess={
      hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],
      mode:'dev-boss',recoveryFor:null,stretchFor:null,
      missionChapter:ch,
      missionAnswered:Number(PROGRESSION?.regularMissionQuestions||9),
      missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,
      devBankTest:true,devBossTest:true,devBossChapter:ch,devSkill:skill,
      coachAdaptive:false,coach:null,questionFingerprints:[],
      bossActive:true,bossDefeated:false,bossQuestionsAnswered:0,
      bossStretchAsked:false,bossStretchCurrent:false
    };

    if(typeof applyHeroToBattle==='function')applyHeroToBattle();
    if(typeof updateMissionHud==='function')updateMissionHud();
    if(typeof nextQ==='function')nextQ();
    if(typeof battle==='function')battle();
    if(typeof screen==='function')screen('game');
    if(typeof closeDevPanel==='function')closeDevPanel();
    if(typeof showRewardToast==='function')showRewardToast(`DEV · ${BOSS_BY_CHAPTER[ch].name}`);
  }

  // Force the chosen boss while DEV boss-test session is active.
  const originalEnemyStage=window.enemyStageForQuestion;
  if(typeof originalEnemyStage==='function'){
    window.enemyStageForQuestion=function(){
      if(sess?.devBossTest&&sess?.devBossChapter){
        return {tier:'boss',chapter:String(sess.devBossChapter)};
      }
      return originalEnemyStage.apply(this,arguments);
    };
  }

  const originalRenderDev=window.renderDevPanel;
  if(typeof originalRenderDev==='function'){
    window.renderDevPanel=function(){
      const out=originalRenderDev.apply(this,arguments);
      ensureBossLab();
      return out;
    };
  }

  const originalDevChangeGrade=window.devChangeGrade;
  if(typeof originalDevChangeGrade==='function'){
    window.devChangeGrade=function(){
      const out=originalDevChangeGrade.apply(this,arguments);
      setTimeout(populateBossSelect,0);
      return out;
    };
  }

  window.PADevBossLab={version:VERSION,ensure:ensureBossLab,jump:devJumpBoss,chapters:bossChaptersForGrade};
  window.devJumpBoss=devJumpBoss;
  document.documentElement.dataset.devBossLab=VERSION;
  const version=document.querySelector('.loginVersion');
  if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
