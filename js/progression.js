// Student-facing progression layer. Does not replace the adaptive coach.
const DEV_BUILD=true;
const PROGRESSION={missionQuestions:14,regularMissionQuestions:9,bossHits:5,coachMinQuestions:8,coachMaxQuestions:15,missionBoost:3.2,xpPerCorrect:12,xpPerWrong:0,dailyTarget:15,coinPerCorrect:1,streakEvery:5,streakCoinBonus:5,masteryCoinBonus:50,learningCoinBonus:10};
function isDevMode(){
 const host=location.hostname;
 const local=host==='localhost'||host==='127.0.0.1'||host==='[::1]';
 const authorised=local||window.PACommercial?.canUseDev?.()===true;
 return DEV_BUILD&&authorised&&!!(db&&db.devMode)
}

function ensureProgression(){
  if(!db)return;
  if(typeof ensureRewards==='function')ensureRewards();
  db.xp=Number.isFinite(db.xp)?db.xp:0;
  db.coins=Number.isFinite(db.coins)?db.coins:0;
  db.level=Number.isFinite(db.level)?db.level:1;
  db.completedMissions=db.completedMissions||{};
  db.chapterStars=db.chapterStars||{};
  db.activeMissionChapter=db.activeMissionChapter||null;
  db.totalCorrect=db.totalCorrect||0;
  db.totalQuestions=db.totalQuestions||0;
  if(localStorage.getItem('pa_dev_unlocked')==='1'&&(location.hostname==='localhost'||location.hostname==='127.0.0.1'||window.PACommercial?.canUseDev?.()===true))db.devMode=true;
  const today=new Date().toISOString().slice(0,10);
  if(!db.daily || db.daily.date!==today)db.daily={date:today,correct:0,claimed:false};
  recalcLevel();
}
function xpForLevel(level){return 120+(level-1)*45}
function recalcLevel(){
  if(!db)return;
  let lvl=1,remaining=db.xp||0;
  while(remaining>=xpForLevel(lvl)){remaining-=xpForLevel(lvl);lvl++}
  db.level=lvl;db.levelXp=remaining;
}
function addXp(amount){db.xp=(db.xp||0)+amount;recalcLevel()}
function addCoins(amount){db.coins=(db.coins||0)+amount}
function chapterSkills(ch){return GRAPH.skills.filter(x=>x.grade===db.schoolGrade&&String(x.chapter)===String(ch))}
function chapterMasteryPct(ch){
  const arr=chapterSkills(ch); if(!arr.length)return 0;
  const seen=arr.filter(x=>scoreState(x.id).evidence>0); if(!seen.length)return 0;
  return Math.round(arr.reduce((z,x)=>z+(scoreState(x.id).evidence?scoreState(x.id).mastery:0),0)/arr.length);
}
function chapterTitle(ch){
  const arr=chapterSkills(ch); if(!arr.length)return `Topik ${ch}`;
  const domains=[...new Set(arr.map(x=>x.domain))]; return domains.join(' & ');
}
function kssrMissionLabel(ch){
 const arr=chapterSkills(ch),units=[...new Set(arr.map(x=>x.textbookUnit).filter(Boolean))];
 if(units.length===1){const m=arr.find(x=>x.textbookUnit===units[0]);return `Unit ${units[0]} · ${m?.textbookUnitTitle||chapterTitle(ch)}`;}
 return `Misi ${chapterTitle(ch)}`;
}
function chapterIcon(ch){return ['','🔢','➕','🍕','💰','⏰','📏','🔷','📊'][+ch]||'⭐'}
function starString(n){return '★'.repeat(n)+'☆'.repeat(Math.max(0,3-n))}
function lockedMissionCopy(ch){const previous=Math.max(1,+ch-1);return `Buka selepas Topik ${previous}: lengkapkan misi dan buktikan penguasaan`}

function renderHub(){
  if(!db)return;
  const cloudState=window.PACloud?.state,activeProfile=cloudState?.profiles?.find?.(p=>p.id===cloudState.childId);
  if(cloudState?.user&&!db.onboarding?.completed&&activeProfile&&window.PAOnboarding?.beginExisting){window.PAOnboarding.beginExisting(activeProfile);return;}
  if(typeof enforceRestuLock==='function' && enforceRestuLock())return;
  ensureProgression(); updateFrontier();
  const h=HEROES[db.hero||'wira'];
  const levelNeed=xpForLevel(db.level),xpPct=Math.min(100,Math.round((db.levelXp||0)/levelNeed*100));
  document.body.classList.toggle('hero-bunga',(db.hero||'wira')==='bunga');
  document.body.classList.toggle('hero-sidma',(db.hero||'wira')==='sidma');
  const heroId=db.hero||'wira',hubHero=document.getElementById('hubHeroImg'),hubFx=document.getElementById('hubMathFx');
  hubHero.src=h.hub||h.idle; hubHero.alt=h.name;
  if(hubFx){hubFx.src=h.hubFx||'';hubFx.classList.toggle('hidden',!h.hubFx);hubFx.dataset.hero=heroId}
  document.getElementById('hubName').textContent=db.name;
  document.getElementById('hubGrade').textContent=`Darjah ${db.schoolGrade}`;
  document.getElementById('hubLevel').textContent=`Lv. ${db.level}`;
  document.getElementById('hubCoins').innerHTML=`<img class="paCoinIcon" src="assets/ui/coin-gold.svg" alt=""> ${db.coins}`;
  document.getElementById('hubXpText').textContent=`${db.levelXp||0} / ${levelNeed} XP`;
  document.getElementById('hubXpFill').style.width=xpPct+'%';
  if(typeof ensureRewards==='function')ensureRewards();
  const pet=typeof REWARD_PETS!=='undefined'?REWARD_PETS[db.rewards?.equippedPet]:null,aura=typeof REWARD_AURAS!=='undefined'?REWARD_AURAS[db.rewards?.equippedAura]:null;
  const petImg=document.getElementById('hubEquippedPetImg'),auraImg=document.getElementById('hubEquippedAuraImg');
  document.getElementById('hubEquippedPetName').textContent=pet?.name||'Tiada';document.getElementById('hubEquippedAuraName').textContent=aura?.name||'Tiada';
  if(petImg){petImg.src=pet?.front||'';petImg.classList.toggle('hidden',!pet);petImg.alt=pet?.name||'';petImg.closest('.loadoutThumb')?.classList.toggle('equipped',!!pet)}if(auraImg){auraImg.src=aura?.image||'';auraImg.classList.toggle('hidden',!aura);auraImg.alt=aura?.name||'';auraImg.closest('.loadoutThumb')?.classList.toggle('equipped',!!aura)}
  const scenePet=document.getElementById('hubScenePet');if(scenePet){scenePet.src=pet?.hub||pet?.front||'';scenePet.alt=pet?.name||'';scenePet.classList.toggle('hidden',!pet);scenePet.dataset.pet=db.rewards?.equippedPet||''}
  const currentChapter=String(db.activeMissionChapter||db.coreFrontier||1),currentPct=chapterMasteryPct(currentChapter);document.getElementById('hubContinueTitle').textContent=kssrMissionLabel(currentChapter);document.getElementById('hubContinueFill').style.width=currentPct+'%';document.getElementById('hubContinueText').textContent=`Kemajuan ${currentPct}%`;
  const loadoutHint=document.getElementById('hubLoadoutHint');if(loadoutHint)loadoutHint.textContent=pet||aura?'Digunakan dalam battle seterusnya':'Belum dilengkapi · Lihat Khazanah';
  const daily=Math.min(PROGRESSION.dailyTarget,db.daily.correct||0);
  document.getElementById('dailyText').textContent=`${daily}/${PROGRESSION.dailyTarget} jawapan betul`;
  document.getElementById('dailyFill').style.width=Math.round(daily/PROGRESSION.dailyTarget*100)+'%';
  document.getElementById('dailyReward').innerHTML=db.daily.claimed?'Selesai ✓':'Ganjaran: 25 <img class="paCoinIcon" src="assets/ui/coin-gold.svg" alt="syiling emas">';
  // Mission cards live on the dedicated Misi screen.
  screen('hub'); save();
}
function continueHubMission(){if(!db)return;startMission(String(db.activeMissionChapter||db.coreFrontier||1))}
function renderMissions(){
  if(!db)return;
  if(typeof enforceRestuLock==='function' && enforceRestuLock())return;
  ensureProgression(); updateFrontier();
  const wrap=document.getElementById('missionGrid'); if(!wrap)return; wrap.innerHTML='';
  const chapters=[...new Set(GRAPH.skills.filter(x=>x.grade===db.schoolGrade).map(x=>String(x.chapter)))].sort((a,b)=>+a-+b);
  chapters.forEach(ch=>{
    const locked=!isDevMode() && +ch>db.coreFrontier;
    const mastery=chapterMasteryPct(ch),stars=db.chapterStars[ch]||0;
    const card=document.createElement('button');
    card.className='missionCard '+(locked?'locked':(+ch===db.coreFrontier?'current':''))+(isDevMode()?' devUnlocked':'');
    card.disabled=locked;
    const ref=chapterSkills(ch)[0];
    card.innerHTML=`<div class="missionIcon">${locked?'🔒':chapterIcon(ch)}</div><div class="missionBody"><div class="missionKicker">${ref?.textbookUnit?`KSSR Unit ${ref.textbookUnit}`:`Misi ${ch}`}</div><b>${chapterTitle(ch)}</b><div class="missionStars">${starString(stars)}</div><div class="missionMeter"><span style="width:${mastery}%"></span></div><small>${locked?lockedMissionCopy(ch):mastery+'% kemajuan'}</small></div><div class="missionArrow">›</div>`;
    if(!locked)card.onclick=()=>startMission(ch);
    wrap.appendChild(card);
  });
  screen('missions'); save();
}
function startMission(ch=null){
  if(typeof enforceRestuLock==='function' && enforceRestuLock())return;
  ensureProgression(); db.activeMissionChapter=ch?String(ch):null; save();
  const arena=document.getElementById('battleArena');if(arena)arena.classList.remove('boss-cleared');
  document.getElementById('bossCheckpoint')?.classList.remove('show');
  const coachAdaptive=!ch;
  sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:'calibrate',recoveryFor:null,stretchFor:null,missionChapter:db.activeMissionChapter,missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:false,devSkill:null,coachAdaptive,introMission:!!db.onboarding?.introActive,coach:null,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false};
  applyHeroToBattle();updateMissionHud();nextQ();battle();screen('game');
}
function startSession(){startMission(db.activeMissionChapter||null)}
function updateMissionHud(){
  if(!sess)return;
  const n=sess.missionAnswered||0;
  const isCoach=!!sess.coachAdaptive;
  const bossPhase=!isCoach&&!sess.devBankTest&&n>=PROGRESSION.regularMissionQuestions;
  const bossN=Math.min(PROGRESSION.bossHits,Number(sess.bossQuestionsAnswered||0));
  document.getElementById('missionCount').textContent=sess.guardianFocus?`${n}/${sess.focusTarget}`:(sess.devBankTest?`#${n+1}`:(isCoach?(n<4?'Mencari asas':n<8?'Menguji kuasa':'Hampir ditemui'):(bossPhase?`BOSS ${bossN}/${PROGRESSION.bossHits}`:`${Math.min(PROGRESSION.regularMissionQuestions,n)}/${PROGRESSION.regularMissionQuestions}`)));
  document.getElementById('missionProgressFill').style.width=sess.guardianFocus?Math.min(100,Math.round(n/sess.focusTarget*100))+'%':(sess.devBankTest?'100%':(isCoach?Math.min(100,Math.round(n/PROGRESSION.coachMinQuestions*100))+'%':Math.round(Math.min(PROGRESSION.missionQuestions,n)/PROGRESSION.missionQuestions*100)+'%'));
  const title=sess.guardianFocus?`Latihan Fokus · ${META[sess.focusSkill]?.title||''}`:(sess.devBankTest?`DEV · ${sess.devSkill}`:(sess.introMission?'Misi Pengenalan':(sess.missionChapter?kssrMissionLabel(sess.missionChapter):'Cikgu Dimensi · Cari Kuasa Terbaik')));
  document.getElementById('missionTitle').textContent=title;
}
function recordMissionAnswer(ok,skillId,usedHint){
  ensureProgression();
  sess.missionAnswered=(sess.missionAnswered||0)+1;
  if(sess.devBankTest){
    if(ok)sess.missionCorrect=(sess.missionCorrect||0)+1;
    if(usedHint)sess.missionHints=(sess.missionHints||0)+1;
    sess.missionSkills[skillId]=(sess.missionSkills[skillId]||0)+(ok?1:-1);
    updateMissionHud();
    return;
  }
  if(ok){
    sess.missionCorrect=(sess.missionCorrect||0)+1;db.totalCorrect++;db.daily.correct=(db.daily.correct||0)+1;addXp(PROGRESSION.xpPerCorrect);addCoins(PROGRESSION.coinPerCorrect);
    db.bestStreak=Math.max(db.bestStreak||0,sess.streak||0);
    if(sess.streak>0&&sess.streak%PROGRESSION.streakEvery===0){addCoins(PROGRESSION.streakCoinBonus);showRewardToast(`${sess.streak} rentak! +${PROGRESSION.streakCoinBonus} 🪙`)}
  } else addXp(PROGRESSION.xpPerWrong);
  if(usedHint)sess.missionHints=(sess.missionHints||0)+1;
  db.totalQuestions=(db.totalQuestions||0)+1;
  if(typeof evaluateMilestoneBadges==='function')evaluateMilestoneBadges();
  sess.missionSkills[skillId]=(sess.missionSkills[skillId]||0)+(ok?1:-1);
  if(db.daily.correct>=PROGRESSION.dailyTarget&&!db.daily.claimed){db.daily.claimed=true;addCoins(25);showRewardToast('Daily Quest selesai! +25 🪙')}
  updateMissionHud();save();
}
function showRewardToast(text){
  const t=document.getElementById('rewardToast');t.textContent=text;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)
}
function finishMission(){
  if(sess.missionFinished)return;sess.missionFinished=true;
  const accuracy=Math.round((sess.missionCorrect||0)/Math.max(1,sess.missionAnswered||1)*100);
  let stars=accuracy>=80?3:accuracy>=60?2:1;if((sess.missionHints||0)>=4&&stars===3)stars=2;
  const coins=stars===3?35:stars===2?22:12;const bonusXp=stars*15;addCoins(coins);addXp(bonusXp);
  if(sess.missionChapter){
    const ch=String(sess.missionChapter);db.chapterStars[ch]=Math.max(db.chapterStars[ch]||0,stars);db.completedMissions[ch]=(db.completedMissions[ch]||0)+1;
  }
  const entries=Object.entries(sess.missionSkills||{}).sort((a,b)=>a[1]-b[1]);
  let next='Teruskan latihan untuk kukuhkan kemahiran.';
  if(entries.length){const meta=META[entries[0][0]];if(meta)next=`Misi seterusnya akan beri lebih latihan pada ${meta.domain}.`}
  document.getElementById('resultStars').textContent=starString(stars);
  document.getElementById('resultScore').textContent=`${sess.missionCorrect}/${sess.missionAnswered} betul · ${accuracy}%`;
  document.getElementById('resultRewards').innerHTML=`<span>+${coins} <img class="paCoinIcon" src="assets/ui/coin-gold.svg" alt="syiling emas"></span><span>+${bonusXp} XP</span>`;
  document.getElementById('resultCoach').textContent=next;
  document.getElementById('resultTitle').textContent=stars===3?'Misi Hebat!':stars===2?'Misi Selesai!':'Misi Selesai';
  if(typeof processMissionRewards==='function')processMissionRewards();
  if(typeof evaluateMilestoneBadges==='function')evaluateMilestoneBadges();
  save();screen('result');
}
function finishCoachSession(){
  if(sess.missionFinished)return;sess.missionFinished=true;
  const accuracy=Math.round((sess.missionCorrect||0)/Math.max(1,sess.missionAnswered||1)*100),summary=coachFrontierSummary();
  const bonusCoins=20,bonusXp=30;addCoins(bonusCoins);addXp(bonusXp);
  const top=summary.slice(0,3).map(x=>`${x.domain}: ${gradeLabel(x.grade)}${x.grade>db.schoolGrade?'+':''}`).join(' · ');
  const challenge=summary.filter(x=>x.status==='challenge').slice(0,2).map(x=>x.domain).join(' & ');
  document.getElementById('resultStars').textContent='🧭';
  document.getElementById('resultScore').textContent=`${sess.missionAnswered} soalan · ${accuracy}% betul · ${coachCoveredDomains()} domain dipetakan`;
  document.getElementById('resultRewards').innerHTML=`<span>+${bonusCoins} <img class="paCoinIcon" src="assets/ui/coin-gold.svg" alt="syiling emas"></span><span>+${bonusXp} XP</span>`;
  document.getElementById('resultCoach').textContent=challenge?`Frontier semasa — ${top}. Coach jumpa cabaran sebenar pada ${challenge}; sesi seterusnya akan sambung dari situ.`:`Frontier semasa — ${top||'profil masih sedang dibina'}. Coach akan sambung dari tahap tertinggi yang telah dibuktikan.`;
  document.getElementById('resultTitle').textContent='Profil Coach Dikemas Kini';
  if(sess.introMission&&db.onboarding){db.onboarding.introActive=false;db.onboarding.introCompletedAt=Date.now()}
  db.lastCoachProfile={at:Date.now(),questions:sess.missionAnswered,accuracy,summary};save();screen('result');
}

function replayMission(){startMission(sess.missionChapter||null)}
function goHub(){renderHub()}


function renderDevPanel(){
  const panel=document.getElementById('devPanel'); if(!panel||!db)return;
  panel.classList.toggle('hidden',!isDevMode());
  const g=document.getElementById('devGrade'); if(g)g.value=String(db.schoolGrade||2);
  populateDevSkills();
  renderDevOneHit();
}
function renderDevOneHit(){
  const b=document.getElementById('devOneHitBtn');if(!b||!db)return;
  const active=!!db.devOneHit;b.textContent=`⚔ 1-Hit Kill: ${active?'ON':'OFF'}`;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');
}
function devToggleOneHit(){if(!db||!isDevMode())return;db.devOneHit=!db.devOneHit;save();renderDevOneHit();showRewardToast(`DEV 1-Hit Kill ${db.devOneHit?'ON':'OFF'}`)}
function populateDevSkills(){
  const sel=document.getElementById('devSkill'); if(!sel||!db)return;
  const items=GRAPH.skills.filter(x=>x.grade===+(document.getElementById('devGrade')?.value||db.schoolGrade)).sort((a,b)=>String(a.chapter).localeCompare(String(b.chapter),undefined,{numeric:true})||a.id.localeCompare(b.id));
  sel.innerHTML=items.map(x=>`<option value="${x.id}">${x.id} · ${x.title}</option>`).join('');
}
function devChangeGrade(v){
  if(!db)return; db.schoolGrade=+v; db.coreFrontier=1; initAll(); save(); populateDevSkills(); renderHub();
}
function startDevSkill(id=null){
  ensureProgression(); const sel=document.getElementById('devSkill'); id=id||sel?.value; if(!id||!META[id])return;
  db.schoolGrade=META[id].grade; initAll(); save();
  sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:'dev',recoveryFor:null,stretchFor:null,missionChapter:String(META[id].chapter||''),missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:true,devSkill:id,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false};
  applyHeroToBattle(); updateMissionHud(); nextQ(); battle(); screen('game');
}
function devRandomSkill(){
  if(!db)return; const grade=+(document.getElementById('devGrade')?.value||db.schoolGrade),arr=GRAPH.skills.filter(x=>x.grade===grade); if(!arr.length)return; startDevSkill(arr[Math.floor(Math.random()*arr.length)].id);
}
