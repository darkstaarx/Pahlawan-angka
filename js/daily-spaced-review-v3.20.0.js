// Pahlawan Angka v3.20.0 — Daily Quest + Spaced Review
(()=>{
  'use strict';
  const VERSION='3.20.0';
  const TARGET=8;
  const COMPLETION_COINS=15;
  const DAY_MS=86400000;
  const MAX_PER_SKILL=2;
  const MAX_FOCUS_PER_SKILL=3;

  const localDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const safeNum=(v,f=0)=>Number.isFinite(+v)?+v:f;
  const skillState=id=>{try{return typeof scoreState==='function'?scoreState(id):db?.skills?.[id]}catch(_){return db?.skills?.[id]}};
  const metaFor=id=>typeof META!=='undefined'?META[id]:null;

  function ensureReviewStore(){
    if(!db)return null;
    db.spacedReview=db.spacedReview||{version:1,skills:{}};
    db.spacedReview.version=1;db.spacedReview.skills=db.spacedReview.skills||{};
    const day=localDay();
    if(!db.dailyQuestV2||db.dailyQuestV2.date!==day){
      db.dailyQuestV2={date:day,status:'ready',attempts:[],rewardClaimed:!!db.daily?.claimed,startedAt:0,completedAt:0,lastPlan:[]};
    }
    db.dailyQuestV2.attempts=Array.isArray(db.dailyQuestV2.attempts)?db.dailyQuestV2.attempts:[];
    db.dailyQuestV2.lastPlan=Array.isArray(db.dailyQuestV2.lastPlan)?db.dailyQuestV2.lastPlan:[];
    return db.dailyQuestV2;
  }
  function reviewMemory(id){
    ensureReviewStore();
    const all=db.spacedReview.skills;
    return all[id]||(all[id]={lastPractice:0,lastClean:0,lastWrong:0,lastHint:0,practiceCount:0,cleanCount:0,wrongCount:0,hintCount:0,wrongTags:{}});
  }
  function requiredEvidenceGap(id){
    try{
      if(!window.PAContentIntegrity?.requirements?.[id])return false;
      return !window.PAContentIntegrity.requirementStatus(id,skillState(id)?.competencies).ok;
    }catch(_){return false}
  }
  function reviewIntervalDays(s){
    const mastery=safeNum(s?.mastery),stability=safeNum(s?.stability);
    let days=mastery<45?1:mastery<65?2:mastery<80?4:mastery<90?6:9;
    if(stability<35)days=Math.max(1,days-2);else if(stability<55)days=Math.max(1,days-1);else if(stability>80)days+=2;
    return days;
  }
  function cumulativeMisconceptions(s){return Object.values(s?.mis||{}).reduce((n,v)=>n+safeNum(v),0)}
  function candidateSkills(){
    if(!db||typeof GRAPH==='undefined')return[];
    const grade=typeof coreGrade==='function'?coreGrade():db.schoolGrade;
    return GRAPH.skills.filter(m=>m.grade===grade && (+m.chapter<=safeNum(db.coreFrontier,1)||m.id===db.focus));
  }
  function skillPriority(id,now=Date.now()){
    const s=skillState(id)||{},mem=reviewMemory(id),m=metaFor(id)||{};
    const evidence=safeNum(s.evidence),mastery=safeNum(s.mastery),confidence=safeNum(s.confidence),stability=safeNum(s.stability),mis=cumulativeMisconceptions(s);
    const last=safeNum(mem.lastPractice)||safeNum(s.lastSeen);
    const ageDays=last?Math.max(0,(now-last)/DAY_MS):(evidence?6:0);
    const interval=reviewIntervalDays(s),overdue=evidence?ageDays/Math.max(1,interval):0;
    let score=.5,reasons=[];

    if(id===db.focus){score+=7;reasons.push(['focus',8,'Fokus Ibu Bapa']);}
    if(mem.lastWrong&&now-mem.lastWrong<=7*DAY_MS){score+=4.3;reasons.push(['mis',7,'Betulkan kesilapan terkini']);}
    else if(mis>=2){score+=Math.min(3.2,1.5+mis*.18);reasons.push(['mis',6,'Semak kesilapan yang pernah berlaku']);}
    if(requiredEvidenceGap(id)&&evidence>0){score+=2.8;reasons.push(['evidence',5,'Bukti kemahiran belum lengkap']);}
    if(overdue>=1){score+=Math.min(4.2,1.7+overdue);reasons.push(['due',4,'Masa untuk ulang semula']);}
    if(evidence===0){score+=.75;reasons.push(['new',1,'Kenal kemahiran']);}
    else{
      if(mastery<45)score+=4.2;else if(mastery<65)score+=3.1;else if(mastery<80)score+=2.0;else if(mastery<88)score+=1.05;else score+=.25;
      if(confidence<45)score+=1.8;else if(confidence<65)score+=1.0;
      if(stability<40)score+=1.2;else if(stability<60)score+=.55;
      if(mastery<80||confidence<65||stability<55)reasons.push(['fragile',3,'Kukuhkan kemahiran']);
    }
    const chapterBoost=String(m.chapter)===String(db.coreFrontier)?1.12:1;
    score*=chapterBoost;
    reasons.sort((a,b)=>b[1]-a[1]);
    return {id,score,reason:reasons[0]?.[2]||'Ulang kaji',evidence,mastery,confidence,stability,ageDays,interval};
  }
  function countBySkill(attempts){return (attempts||[]).reduce((out,a)=>{out[a.skill]=(out[a.skill]||0)+1;return out},{})}
  function buildDailyPlan(count=TARGET,existingAttempts=[]){
    const candidates=candidateSkills().map(m=>skillPriority(m.id)).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    if(!candidates.length)return[];
    const counts=countBySkill(existingAttempts),plan=[],recent=[];
    for(let step=0;step<count;step++){
      let best=null,bestValue=-Infinity;
      for(const c of candidates){
        const cap=c.id===db.focus?MAX_FOCUS_PER_SKILL:MAX_PER_SKILL,used=safeNum(counts[c.id]);
        if(used>=cap)continue;
        let value=c.score/(1+used*.78);
        if(recent.at(-1)===c.id)value*=.08;
        if(recent.slice(-2).includes(c.id))value*=.42;
        if(value>bestValue){bestValue=value;best=c;}
      }
      if(!best){
        // If every skill hit its cap (e.g. a brand-new profile with one skill),
        // relax the cap but still avoid an immediate repeat where possible.
        const relaxed=candidates.map(c=>({c,value:c.score/(1+safeNum(counts[c.id]))*(recent.at(-1)===c.id?.18:1)})).sort((a,b)=>b.value-a.value);
        best=(relaxed.find(x=>x.c.id!==recent.at(-1))||relaxed[0])?.c;
      }
      if(!best)break;
      plan.push({skill:best.id,reason:best.reason});counts[best.id]=safeNum(counts[best.id])+1;recent.push(best.id);
    }
    return plan;
  }
  function dueSummary(){
    const ranked=candidateSkills().map(m=>skillPriority(m.id));
    return ranked.filter(x=>x.score>=4||x.reason!=='Kenal kemahiran').sort((a,b)=>b.score-a.score);
  }

  function recordReviewEvidence(skillId,ok,tag,usedHint){
    if(!db||!skillId)return;
    const now=Date.now(),mem=reviewMemory(skillId),s=skillState(skillId);
    mem.lastPractice=now;mem.practiceCount=safeNum(mem.practiceCount)+1;
    if(s)s.lastSeen=now;
    if(ok&&!usedHint){mem.lastClean=now;mem.cleanCount=safeNum(mem.cleanCount)+1;}
    if(!ok){mem.lastWrong=now;mem.wrongCount=safeNum(mem.wrongCount)+1;if(tag){mem.wrongTags[tag]=safeNum(mem.wrongTags[tag])+1;}}
    if(usedHint){mem.lastHint=now;mem.hintCount=safeNum(mem.hintCount)+1;}
  }

  function renderDailyCard(){
    if(!db)return;const state=ensureReviewStore(),card=document.querySelector('.hubDailyCompact');if(!card)return;
    const attempts=state.attempts.slice(0,TARGET),done=Math.min(TARGET,attempts.length),due=dueSummary();
    card.classList.add('paDailyQuestCard');card.classList.toggle('complete',state.status==='complete');card.classList.toggle('inProgress',state.status==='in_progress');
    card.setAttribute('aria-label',state.status==='complete'?'Ulang kaji harian selesai':`Mulakan ulang kaji harian, ${done} daripada ${TARGET} soalan selesai`);
    card.tabIndex=state.status==='complete'?-1:0;card.setAttribute('role',state.status==='complete'?'status':'button');
    card.onclick=state.status==='complete'?null:startDailyQuest;
    card.onkeydown=state.status==='complete'?null:(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();startDailyQuest()}});
    const text=document.getElementById('dailyText'),fill=document.getElementById('dailyFill'),reward=document.getElementById('dailyReward');
    if(text)text.textContent=`${done}/${TARGET}`;if(fill)fill.style.width=Math.round(done/TARGET*100)+'%';
    if(reward){
      if(state.status==='complete')reward.textContent='Selesai ✓';
      else if(done)reward.textContent=`Sambung · ${TARGET-done} lagi`;
      else reward.textContent=`${Math.min(4,due.length)||1} kemahiran · +${COMPLETION_COINS} 🪙`;
    }
    let meta=card.querySelector('.paDailyMeta');if(!meta){meta=document.createElement('small');meta.className='paDailyMeta';const grow=card.querySelector('.grow');grow?.appendChild(meta);}
    if(meta){
      if(state.status==='complete')meta.textContent='Cukup untuk hari ini · sambung esok';
      else if(db.focus&&metaFor(db.focus))meta.textContent=`Termasuk Fokus Ibu Bapa: ${metaFor(db.focus).title}`;
      else meta.textContent=due[0]?.reason||'Ulang kaji ringkas berdasarkan bukti semasa';
    }
  }

  function applyDailyHud(){
    if(!sess?.dailyQuest)return;const state=ensureReviewStore(),answered=Math.min(TARGET,state.attempts.length);
    const title=document.getElementById('missionTitle'),count=document.getElementById('missionCount'),fill=document.getElementById('missionProgressFill'),coach=document.getElementById('coachMode'),evidence=document.getElementById('evidence'),mastery=document.getElementById('mastery');
    if(title)title.textContent='Ulang Kaji Harian';if(count)count.textContent=`${answered}/${TARGET}`;if(fill)fill.style.width=Math.round(answered/TARGET*100)+'%';
    if(coach)coach.textContent='Ulang Pintar';
    if(mastery)mastery.style.width=Math.round(answered/TARGET*100)+'%';
    const nextN=Math.min(TARGET,answered+1);if(evidence)evidence.textContent=`Soalan ${nextN}/${TARGET}${sess.dailyReason?' · '+sess.dailyReason:''}`;
  }

  function startDailyQuest(){
    if(!db)return;if(typeof enforceRestuLock==='function'&&enforceRestuLock())return;
    if(typeof ensureProgression==='function')ensureProgression();
    const state=ensureReviewStore();if(state.status==='complete'||state.attempts.length>=TARGET){state.status='complete';renderDailyCard();if(typeof showRewardToast==='function')showRewardToast('Ulang kaji hari ini sudah selesai ✓');return;}
    const remaining=Math.max(0,TARGET-state.attempts.length),plan=buildDailyPlan(remaining,state.attempts);
    if(!plan.length){if(typeof showRewardToast==='function')showRewardToast('Belum ada kemahiran untuk ulang kaji. Cuba Auto Coach dahulu.');return;}
    state.status='in_progress';state.startedAt=state.startedAt||Date.now();state.lastPlan=plan;save?.();
    const oldAttempts=state.attempts.length,oldCorrect=state.attempts.filter(a=>a.ok).length,oldHints=state.attempts.filter(a=>a.hint).length;
    sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,hintLevel:0,enemy:1,recent:[],mode:'review',recoveryFor:null,stretchFor:null,missionChapter:null,missionAnswered:oldAttempts,missionCorrect:oldCorrect,missionHints:oldHints,missionSkills:{},missionFinished:false,devBankTest:false,devSkill:null,coachAdaptive:false,guardianFocus:false,dailyQuest:true,dailyTarget:TARGET,dailyPlan:plan,dailyStartAnswered:oldAttempts,dailyQuestCompletePending:false,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false};
    if(typeof applyHeroToBattle==='function')applyHeroToBattle();if(typeof updateMissionHud==='function')updateMissionHud();nextQ();if(typeof battle==='function')battle();screen('game');
  }

  function finishDailyQuest(){
    if(!sess?.dailyQuest||sess.missionFinished)return;sess.missionFinished=true;
    const state=ensureReviewStore();state.status='complete';state.completedAt=Date.now();
    const attempts=state.attempts.slice(0,TARGET),correct=attempts.filter(a=>a.ok).length,clean=attempts.filter(a=>a.clean).length,hints=attempts.filter(a=>a.hint).length;
    if(!state.rewardClaimed){state.rewardClaimed=true;if(typeof addCoins==='function')addCoins(COMPLETION_COINS);}
    const needs=attempts.filter(a=>!a.clean).map(a=>a.skill),nextSkill=needs[0]||dueSummary()[0]?.id;
    const nextLabel=nextSkill&&metaFor(nextSkill)?metaFor(nextSkill).title:'';
    const resultTitle=document.getElementById('resultTitle'),stars=document.getElementById('resultStars'),score=document.getElementById('resultScore'),rewards=document.getElementById('resultRewards'),coach=document.getElementById('resultCoach');
    if(resultTitle)resultTitle.textContent='Ulang Kaji Hari Ini Selesai';if(stars)stars.textContent='✓';
    if(score)score.textContent=`${clean}/${TARGET} sendiri · ${hints} dengan petunjuk`;
    if(rewards)rewards.innerHTML=`<span>+${COMPLETION_COINS} 🪙</span><span>${correct}/${TARGET} jawapan betul</span>`;
    if(coach)coach.textContent=nextLabel?`Esok Cikgu Wajar akan semak semula ${nextLabel} jika bukti masih belum stabil.`:'Cukup untuk hari ini. Esok Cikgu Wajar akan pilih semakan seterusnya berdasarkan bukti terbaru.';
    save?.();screen('result');
  }

  const originalRecordCoach=window.recordCoachResponse;
  if(typeof originalRecordCoach==='function')window.recordCoachResponse=function(skillId,ok,tag,sec,usedHint,itemId){
    const out=originalRecordCoach.apply(this,arguments);recordReviewEvidence(skillId,!!ok,tag,!!usedHint);return out;
  };

  const originalChoose=window.chooseModeAndSkill;
  if(typeof originalChoose==='function')window.chooseModeAndSkill=function(){
    if(sess?.dailyQuest){
      const confirm=typeof confirmationSkill==='function'?confirmationSkill():null;
      if(confirm){sess.mode='confirm';sess.dailyReason='Cuba sendiri selepas bantuan';return confirm;}
      const state=ensureReviewStore(),offset=Math.max(0,state.attempts.length-safeNum(sess.dailyStartAnswered));
      let item=sess.dailyPlan?.[offset];
      if(!item){item=buildDailyPlan(1,state.attempts)[0];if(item)sess.dailyPlan=[...(sess.dailyPlan||[]),item];}
      if(item){sess.mode='review';sess.dailyReason=item.reason;return item.skill;}
    }
    return originalChoose.apply(this,arguments);
  };

  const originalRecordMission=window.recordMissionAnswer;
  if(typeof originalRecordMission==='function')window.recordMissionAnswer=function(ok,skillId,usedHint){
    const oldTarget=PROGRESSION.dailyTarget,oldCoin=PROGRESSION.coinPerCorrect,oldEvery=PROGRESSION.streakEvery;
    PROGRESSION.dailyTarget=999999;
    if(sess?.dailyQuest){PROGRESSION.coinPerCorrect=0;PROGRESSION.streakEvery=999999;}
    let out;try{out=originalRecordMission.apply(this,arguments)}finally{PROGRESSION.dailyTarget=oldTarget;PROGRESSION.coinPerCorrect=oldCoin;PROGRESSION.streakEvery=oldEvery;}
    if(sess?.dailyQuest){
      const state=ensureReviewStore();
      if(state.attempts.length<TARGET){state.attempts.push({skill:skillId,ok:!!ok,clean:!!ok&&!usedHint,hint:!!usedHint,at:Date.now(),reason:sess.dailyReason||'Ulang kaji'});}
      if(state.attempts.length>=TARGET){state.status='complete_pending';sess.dailyQuestCompletePending=true;}
      save?.();applyDailyHud();
    }
    return out;
  };

  const originalNextQ=window.nextQ;
  if(typeof originalNextQ==='function')window.nextQ=function(){
    if(sess?.dailyQuest&&sess.dailyQuestCompletePending){finishDailyQuest();return;}
    const out=originalNextQ.apply(this,arguments);if(sess?.dailyQuest)applyDailyHud();return out;
  };

  const originalMissionHud=window.updateMissionHud;
  if(typeof originalMissionHud==='function')window.updateMissionHud=function(){const out=originalMissionHud.apply(this,arguments);if(sess?.dailyQuest)applyDailyHud();return out;};

  const originalRenderHub=window.renderHub;
  if(typeof originalRenderHub==='function')window.renderHub=function(){const out=originalRenderHub.apply(this,arguments);renderDailyCard();return out;};

  const originalScreen=window.screen;
  if(typeof originalScreen==='function')window.screen=function(id){
    const out=originalScreen.apply(this,arguments);
    const result=document.getElementById('result');const buttons=result?.querySelectorAll('button');
    if(buttons?.[1])buttons[1].classList.toggle('hidden',!!sess?.dailyQuest&&id==='result');
    if(id==='hub')renderDailyCard();return out;
  };

  const originalResultPrimary=window.resultPrimary;
  window.resultPrimary=function(){if(sess?.dailyQuest){renderHub();return;}return typeof originalResultPrimary==='function'?originalResultPrimary.apply(this,arguments):renderHub();};
  const originalResultReplay=window.resultReplay;
  window.resultReplay=function(){if(sess?.dailyQuest){renderHub();return;}return typeof originalResultReplay==='function'?originalResultReplay.apply(this,arguments):undefined;};

  window.PADailyQuest={version:VERSION,target:TARGET,completionCoins:COMPLETION_COINS,ensure:ensureReviewStore,priority:skillPriority,buildPlan:buildDailyPlan,start:startDailyQuest,finish:finishDailyQuest,render:renderDailyCard};
  window.startDailyQuest=startDailyQuest;
  document.documentElement.dataset.dailyReview=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
