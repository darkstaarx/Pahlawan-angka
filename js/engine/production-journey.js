/* Pure Gembok production journey. This module owns production session state and
 * learner persistence; the Segel host owns only its presentation. */
(function(){
  'use strict';

  let active=null;
  const now=()=>performance.now();
  const realSave=()=>{ if(typeof save==='function')save(); };
  const realScore=id=>typeof scoreState==='function'?scoreState(id):db?.skills?.[id];
  const realSession=()=>active&&active.session;
  function withSession(session,fn){
    const previous=swapDemoState(db,session);
    try{return fn();}finally{swapDemoState(previous.db,previous.sess);}
  }
  function activateSession(session){swapDemoState(db,session);}
  const skillPool=chapter=>GRAPH.skills
    .filter(x=>x.grade===db.schoolGrade&&(!chapter||String(x.chapter)===String(chapter)))
    .map(x=>x.id);

  function makeSession(options){
    const session={
      gembok:true, demoMode:false, mode:'gembok', q:null, start:0, hint:false,
      hintLevel:0, retryState:null, recent:[], responseHistory:[],
      interventionCooldown:{}, confirmSkill:null, confirmRemaining:0,
      coachAdaptive:!!options.adaptive, missionChapter:options.chapter||null,
      questionToken:0, generation:0, learningActive:false, coach:null
    };
    return session;
  }

  function open(options={}){
    if(!db||!window.PASegelHost)return;
    const chapter=options.chapter?String(options.chapter):null;
    const pool=skillPool(chapter);
    if(!pool.length){
      console.error('[gembok] no real skill pool for production route',options);
      return;
    }
    if(active)close(false);
    const id=`gembok-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    active={id,gembok:true,route:options.adaptive?'adaptive':'manual',chapter,pool,previousSession:sess,session:makeSession(options),
      questionNumber:0,correct:0,completed:false,paused:false,startedAt:Date.now()};
    activateSession(active.session);
    window.PASegelHost.openProduction(active);
  }

  function selectSkill(run){
    const s=run.session;
    return withSession(s,()=>{
      if(run.route==='adaptive')return chooseModeAndSkill();
      const unseen=run.pool.filter(id=>!s.recent.slice(-Math.min(3,run.pool.length)).includes(id));
      return (unseen.length?unseen:run.pool)[run.questionNumber%(unseen.length||run.pool.length)];
    });
  }

  function nextQuestion(run){
    if(!active||active!==run||run.completed||run.paused)return null;
    const s=run.session,id=selectSkill(run),state=realScore(id);
    if(!id||!state)return null;
    return withSession(s,()=>{
      const q=generate(id,state,{battleTier:'gembok',isBoss:false});
      if(!q)return null;
      q.skill=id;q.token=++s.questionToken;
      s.q=q;s.start=now();s.hint=false;s.hintLevel=0;s.retryState=null;
      s.recent.push(id);if(s.recent.length>10)s.recent.shift();
      run.questionNumber++;
      window.PALearnerReview?.beginQuestion?.(q,{grade:db.schoolGrade,mode:'gembok',selectionReason:run.route, demoMode:false});
      return q;
    });
  }

  function mutateFirstWrong(q,option,seconds){
    const s=realScore(q.skill),delta=META[q.skill].grade-coreGrade();
    s.wrong++;s.evidence++;s.mis[option.tag]=(s.mis[option.tag]||0)+1;
    s.mastery=Math.max(0,s.mastery-(delta>0?1.2:2.2));
    s.confidence=Math.max(0,s.confidence-(delta>0?2:4));
    s.stability=Math.max(0,s.stability-3);if(delta>0)s.probeFail++;
    recordCoachResponse(q.skill,false,option.tag,seconds,false,q.token);
    recordFrontierResponse(q.skill,false,seconds,false,q);
    window.PATelemetry?.response?.(q.skill,false,option.tag,seconds,false,q,'gembok-first-attempt');
    window.PALearnerReview?.firstWrong?.(q,{tag:option.tag,value:option.v,seconds});
  }

  function recordResolved(q,option,ok,seconds){
    const run=active,s=realScore(q.skill),g=run.session,delta=META[q.skill].grade-coreGrade();
    if(ok){
      s.correct++;
      if(!g.retryState)s.evidence++;
      const quality=evidenceQuality(seconds,q,g.hint),base=delta>0?6:(delta<0?9:8);
      s.mastery=Math.min(100,s.mastery+base*quality*(1-s.mastery/135));
      s.confidence=Math.min(100,s.confidence+(delta>0?4.5:5.5)*quality);
      s.stability=Math.min(100,s.stability+4*quality);
      if(delta>0&&!g.retryState&&!g.hint)s.probePass++;
      run.correct++;
    }
    /* A retry wrong answer is intentionally not a second evidence event. */
    recordCoachResponse(q.skill,ok,option.tag,seconds,g.hint,q.token);
    recordFrontierResponse(q.skill,ok,seconds,g.hint,q);
    updateConfirmationAfterEncounter(q.skill,{correct:ok,hadRetry:!!g.retryState,usedHint:!!g.hint});
    window.PATelemetry?.response?.(q.skill,ok,option.tag,seconds,g.hint,q,g.retryState?'gembok-retry':'gembok');
    window.PALearnerReview?.resolve?.(q,{correct:ok,tag:option.tag,seconds,usedHint:!!g.hint,hintLevel:g.hintLevel||0},db);
    updateFrontier();realSave();
    return evaluateIntervention(q.skill);
  }

  function firstWrong(q,option){
    const run=active;if(!run||run.session.q!==q)return null;
    const seconds=(now()-run.session.start)/1000;
    run.session.retryState={wrongTag:option.tag,wrongValue:option.v,firstSeconds:seconds};
    mutateFirstWrong(q,option,seconds);realSave();
    return {hint:q.hint||'Baca semula maklumat penting dalam soalan.'};
  }

  function resolve(q,option,ok){
    const run=active;if(!run||run.session.q!==q)return null;
    const seconds=(now()-run.session.start)/1000;
    const intervention=recordResolved(q,option,ok,seconds);
    return {intervention,correct:ok};
  }

  function hint(){
    const run=active,q=run?.session.q;if(!q)return null;
    const s=run.session;
    s.hintLevel++;window.PALearnerReview?.hintUsed?.(q,s.hintLevel);
    if(!s.hint){s.hint=true;realScore(q.skill).hints++;realSave();}
    return q.hint||'Baca semula soalan perlahan-lahan.';
  }

  function complete(){
    const run=active;if(!run||run.completed||run.paused)return;
    /* The Segel host reaches this only after Gangsa 2 -> Perak 3 -> Emas 5.
       Retain that production boundary even if a caller invokes complete(). */
    if(run.correct<10)return;
    run.completed=true;
    db.gembok=db.gembok||{completions:{}};db.gembok.completions=db.gembok.completions||{};
    if(!db.gembok.completions[run.id]){
      const coins=run.route==='adaptive'?10:15;
      db.gembok.completions[run.id]={route:run.route,coins,at:Date.now(),correct:run.correct};
      db.coins=(db.coins||0)+coins;
      realSave();
    }
    /* Cosmetic only; PetCollection owns its own per-run idempotency record. */
    window.PetCollection?.awardGembokCompletion?.(db,run);
  }

  function pauseForLearning(intervention){
    const run=active;if(!run||run.paused)return false;
    run.paused=true;run.session.learningActive=true;
    activateSession(run.session);
    learningStart(run.session.q.skill,intervention,{gembok:true});
    return true;
  }
  function resumeFromLearning(){
    const run=active;if(!run||run.completed)return;
    run.paused=false;run.session.learningActive=false;
    window.PASegelHost?.resumeProduction?.(run);
  }
  function restart(run){
    if(!active||active!==run)return;
    open({chapter:run.chapter,adaptive:run.route==='adaptive'});
  }
  function close(renderMenu=true){
    if(!active)return;
    const run=active;run.session.generation++;active=null;
    swapDemoState(db,run.previousSession);
    window.PASegelHost?.pause?.();
    if(renderMenu&&typeof renderHub==='function')renderHub();
  }

  window.PAProductionRuntime={score:realScore,save:realSave,session:realSession};
  window.PAProductionJourney={open,nextQuestion,firstWrong,resolve,hint,complete,pauseForLearning,resumeFromLearning,restart,close,isActive:()=>!!active,state:()=>active,isCurrent:run=>active===run&&!run.paused};
  window.openGembok=open;
})();
