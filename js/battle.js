// Every delayed battle callback belongs to the journey that created it.
// Starting (or explicitly ending) a journey invalidates and clears the old set,
// preventing presentation callbacks from crossing a session boundary.
let battleJourneyGeneration=0;
let battleDisplayedHp=null;
const battlePresentationTimers=new Set();
function battleLater(fn,delay){
 const generation=battleJourneyGeneration;
 let timer=setTimeout(()=>{battlePresentationTimers.delete(timer);if(generation===battleJourneyGeneration)fn()},delay);
 battlePresentationTimers.add(timer);return timer;
}
function cancelBattlePresentationTimers(){
 battleJourneyGeneration++;
 battleDisplayedHp=null;window.PACombatMotion?.reset?.();
 battlePresentationTimers.forEach(clearTimeout);battlePresentationTimers.clear();
}
function resetBattlePresentation(){
 cancelBattlePresentationTimers();
 const streak=document.getElementById('streak');
 if(streak){streak.textContent=`${Number(sess?.streak)||0} rentak`;streak.removeAttribute('title');streak.classList.remove('frozen','active','pulse')}
 const feedback=document.getElementById('feedback');if(feedback)feedback.textContent='';
 document.querySelectorAll('#answers .ans').forEach(answer=>{answer.disabled=false;answer.classList.remove('ok','no','correct','wrong','selected','disabled')});
 const hint=document.querySelector('.hintBtn');if(hint){hint.disabled=false;hint.classList.remove('needs-help','used')}
 const hero=document.getElementById('hero'),enemy=document.getElementById('enemy'),pet=document.getElementById('battlePet'),arena=document.getElementById('battleArena'),flash=document.getElementById('arenaFlash');
 hero?.classList.remove('attacking','charging-finisher','hit','tint-red','tint-ice','tint-bloom','finisher','phase-anticipation','phase-movement','phase-contact','phase-follow-through','phase-recover');
 if(hero){[...hero.classList].filter(name=>name==='pa-attack-variant'||name.startsWith('pa-attack-')).forEach(name=>hero.classList.remove(name));delete hero.dataset.attackVariant;hero.style.removeProperty('--pa-contact-scale');hero.style.removeProperty('--pa-contact-shift-x')}
 enemy?.classList.remove('attacking','charging-finisher','hit','pet-hit','tint-red','tint-ice','tint-bloom','finisher','phase-anticipation','phase-movement','phase-contact','phase-follow-through','phase-recover','defeat-crack','defeat-shatter','boss-drop');
 enemy?.querySelector('.monster-defeat-layer')?.remove();
 pet?.classList.remove('pet-attacking','pet-phase-anticipation','pet-phase-contact','pet-phase-follow-through','pet-phase-recover');
 arena?.classList.remove('attack-from-hero','attack-from-enemy','shake','finisher-shake','boss-entering','boss-landed','boss-cleared');
 if(arena){delete arena.dataset.heroAttack;delete arena.dataset.heroKind}
 flash?.classList.remove('pulse-red','pulse-ice','pulse-bloom');
 document.getElementById('finisherCinematic')?.classList.remove('active','release');
 document.getElementById('petImpactFx')?.classList.remove('active');
 document.getElementById('bossCheckpoint')?.classList.remove('show');
 arena?.querySelector('.bossVictory')?.classList.remove('show');
 arena?.querySelector('.bossEntrance')?.classList.remove('show');
 document.getElementById('paHintOverlay')?.remove();
 window.PASidmaBattle?.resetSidmaVisuals?.();window.PASidmaBattle?.resetSidmaFinisher?.();
 window.PABungaBattle?.resetNormal?.();window.PABungaBattle?.resetFinisher?.();window.PAWiraFinisher?.reset?.();
}
if(typeof window!=='undefined')window.PABattlePresentation={begin:resetBattlePresentation,cancel:cancelBattlePresentationTimers,later:battleLater,generation:()=>battleJourneyGeneration,pending:()=>battlePresentationTimers.size};
if(typeof window!=='undefined'){
 ['startMission','startDevSkill'].forEach(name=>{
  const original=window[name];if(typeof original!=='function'||original.__paJourneyBoundary)return;
  const wrapped=function(){const result=original.apply(this,arguments);resetBattlePresentation();return result};
  wrapped.__paJourneyBoundary=true;window[name]=wrapped;
 });
}

function triggerFinisherCinematic(){
 const layer=document.getElementById('finisherCinematic'),hero=document.getElementById('cinematicHero'),aura=document.getElementById('cinematicAura');
 if(!layer||!hero||!aura||!db)return;
 if(typeof ensureRewards==='function')ensureRewards();
 const type=db.rewards&&db.rewards.equippedAura;
 const owned=type&&db.rewards.auras&&db.rewards.auras[type];
 const item=owned&&typeof REWARD_AURAS!=='undefined'&&REWARD_AURAS[type];
 const h=HEROES[db.hero]||HEROES.wira;
 const arena=document.getElementById('battleArena'),heroVisual=document.getElementById('heroVisual');
 if(arena&&heroVisual){
  const arenaRect=arena.getBoundingClientRect(),heroRect=heroVisual.getBoundingClientRect();
  layer.style.setProperty('--hero-x',(heroRect.left-arenaRect.left)+'px');
  layer.style.setProperty('--hero-y',(heroRect.top-arenaRect.top)+'px');
  layer.style.setProperty('--hero-w',heroRect.width+'px');
  layer.style.setProperty('--hero-h',heroRect.height+'px');
  layer.style.setProperty('--hero-bottom',(arenaRect.bottom-heroRect.bottom)+'px');
  const heroKey=db.hero||'wira',focusScale=heroKey==='wira'?1.18:(heroKey==='sidma'?1:1.12);
  layer.style.setProperty('--cinematic-hero-h',(heroRect.height*focusScale)+'px');
  layer.style.setProperty('--hero-center-x',(heroRect.left-arenaRect.left+(heroRect.width/2))+'px');
  const auraWidth=heroRect.width*2.08;
  layer.style.setProperty('--aura-bottom',(arenaRect.bottom-heroRect.bottom-(auraWidth*.055))+'px');
  layer.style.setProperty('--aura-w',auraWidth+'px');
  layer.style.setProperty('--power-y',(heroRect.top-arenaRect.top+(heroRect.height*.2))+'px');
  layer.style.setProperty('--power-w',(heroRect.width*.78)+'px');
  layer.style.setProperty('--power-h',(heroRect.height*.82)+'px');
 }
 // Wira, Bunga and Sidma each use a dedicated eyes-closed focus pose.
 const sidmaFocus=(db.hero==='sidma'&&h.finisherFocus);
 hero.src=sidmaFocus||h.auraFraming||h.anticipation||h.idle;hero.alt=h.name+' mengumpul kuasa';
 document.getElementById('cinematicHeroName').textContent=db.hero==='sidma'?'RUMUS PENAMAT':(db.hero==='bunga'?'TEOREM MEKAR':h.name.toUpperCase());
 if(item&&db.hero!=='bunga'&&db.hero!=='sidma'){aura.src=item.image;aura.dataset.aura=type;aura.classList.remove('hidden')}else{aura.removeAttribute('src');aura.classList.add('hidden')}
 layer.dataset.hero=db.hero||'wira';layer.dataset.aura=type||'none';
 let sigmaChain=layer.querySelector('.sidmaSigmaChain');
 if(!sigmaChain){sigmaChain=document.createElement('div');sigmaChain.className='sidmaSigmaChain';sigmaChain.setAttribute('aria-hidden','true');sigmaChain.innerHTML=Array.from({length:8},(_,i)=>`<span style="--sigma-angle:${i*45}deg;--sigma-counter:${i*-45}deg">Σ</span>`).join('');layer.appendChild(sigmaChain)}
 layer.dataset.focusAsset='approved';
 layer.setAttribute('aria-label',db.hero==='sidma'?'Rumus Penamat':'Serangan terakhir '+h.name);
 layer.classList.remove('active','release');void layer.offsetWidth;layer.classList.add('active');
 if(!['wira','sidma','bunga'].includes(db.hero)&&typeof playSfx==='function')playSfx('auraCharge');
 const sidmaFinisher=db.hero==='sidma';
 battleLater(()=>{
  layer.classList.add('release');
  if(sidmaFinisher&&h.frames?.release)hero.src=h.frames.release;
  if(typeof playSfx==='function'&&db.hero!=='wira'&&db.hero!=='bunga'&&!sidmaFinisher)playSfx('attack');
 },sidmaFinisher?650:760);
 battleLater(()=>layer.classList.remove('active','release'),sidmaFinisher?930:1080);
}
function triggerImpact(attackerId,targetId,tint,finisher){
 const motion=window.PACombatMotion?.begin?.(attackerId,targetId,finisher);
 if(motion){
  battleDisplayedHp={hp:sess.hp,ehp:sess.ehp};
  battleLater(()=>{battleDisplayedHp=null;battle()},motion.contactDelay);
  return motion;
 }
 window.PACombatMotion?.reset?.();
 let attacker=document.getElementById(attackerId),target=document.getElementById(targetId),arena=document.getElementById("battleArena"),flash=document.getElementById("arenaFlash");
 if(!attacker||!target||!arena||!flash)return;
 const pet=attackerId==="hero"?document.getElementById("battlePet"):null;
 const wiraFinishing=attackerId==="hero"&&db?.hero==="wira"&&finisher;
 const sidmaFinishing=attackerId==="hero"&&db?.hero==="sidma"&&finisher;
 const bungaFinishing=attackerId==="hero"&&db?.hero==="bunga"&&finisher;
 // Final blows are the hero's solo climax. Pets still assist every regular
 // attack, but never add a separate hit or delay to any hero finisher.
 const hasPet=!!(!finisher&&pet&&!pet.classList.contains("hidden")&&db?.rewards?.equippedPet);
 const heroLead=hasPet?420:0,finisherContact=wiraFinishing?1420:(sidmaFinishing?1430:(bungaFinishing?1550:820));
 const sidmaAttacking=attackerId==="hero"&&db?.hero==="sidma"&&!finisher;
 const sidmaSkill=sidmaAttacking&&window.PASidmaBattle?.getNextNormalSkill?.(),sidmaSkill2=sidmaSkill===2;
 const sidmaContact=sidmaSkill2?650:(hasPet?890:1305),sidmaDuration=sidmaSkill2?1350:(hasPet?1250:1750);
 const bungaAttacking=attackerId==="hero"&&db?.hero==="bunga"&&!finisher;
 const bungaSkill=bungaAttacking&&window.PABungaBattle?.getNextNormalSkill?.(),bungaSkill2=bungaSkill===2;
 const bungaContact=bungaSkill2?1050:(hasPet?390:500),bungaDuration=bungaSkill2?1420:(hasPet?690:880);
 let attackDuration=(finisher?(wiraFinishing?1780:(sidmaFinishing?1780:(bungaFinishing?1900:1450))):(sidmaAttacking?sidmaDuration:(bungaAttacking?bungaDuration:720)))+heroLead,contactDelay=(finisher?(sidmaFinishing?1430:finisherContact):(sidmaAttacking?sidmaContact:(bungaAttacking?bungaContact:390)))+heroLead,hitDuration=finisher?(wiraFinishing?340:(bungaFinishing?390:(tint==="bloom"?1080:(sidmaFinishing?360:900)))):520,shakeClass=(wiraFinishing||sidmaFinishing||bungaFinishing)?null:(finisher?"finisher-shake":"shake"),tintClass=(wiraFinishing||sidmaFinishing||bungaFinishing)?null:(tint==="red"?"tint-red":(tint==="bloom"?"tint-bloom":"tint-ice")),pulse=(wiraFinishing||sidmaFinishing||bungaFinishing)?null:(tint==="red"?"pulse-red":(tint==="bloom"?"pulse-bloom":"pulse-ice"));
 if(attackerId==="hero"){
   if(pet&&!pet.classList.contains("hidden")){
     const petRect=pet.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
     const petCenter=petRect.left+(petRect.width/2),targetFront=targetRect.left+Math.min(24,targetRect.width*.18);
     pet.style.setProperty("--pet-dash-x",Math.min(48,Math.max(0,targetFront-petCenter))+"px");
   }
 }
 const clearHeroPhases=()=>attacker.classList.remove("phase-anticipation","phase-movement","phase-contact","phase-follow-through","phase-recover");
 const startAttacker=()=>{attacker.classList.remove("attacking","charging-finisher");if(attackerId==="hero"&&typeof prepareHeroAttackVariant==="function")prepareHeroAttackVariant(attacker,finisher);void attacker.offsetWidth;attacker.classList.add("attacking");if(finisher){if(attackerId==="hero")triggerFinisherCinematic();attacker.classList.add("charging-finisher");}};
 if(heroLead)battleLater(startAttacker,heroLead);else startAttacker();
 if(hasPet)triggerPetFollowUp(target,0);
 if(attackerId==="hero"){
   clearHeroPhases();battleLater(()=>attacker.classList.add("phase-anticipation"),heroLead);
   if(finisher){
    if(sidmaFinishing){
     // Sidma's release-hand pose lives inside the blackout. Keep the arena
     // body anchored afterwards so no shared follow-through frame leaks out.
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},heroLead+1580);
    }else{
     const phaseContact=finisherContact,phaseFollow=finisherContact+190,phaseRecover=finisherContact+380;
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},heroLead+phaseContact);
     if(db?.hero!=="bunga")battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-follow-through")},heroLead+phaseFollow);
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},heroLead+phaseRecover);
    }
   }else{
    if(db?.hero==="bunga"){
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},heroLead+260);
    }else{
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-movement")},heroLead+140);
     battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},heroLead+320);
    }
    battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},heroLead+620);
   }
 }else if(attacker.dataset.enemyTier==="boss"){
   clearHeroPhases();attacker.classList.add("phase-anticipation");
   battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},145);
   battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-follow-through")},335);
   battleLater(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},500);
 }
 arena.classList.remove("attack-from-hero","attack-from-enemy");arena.classList.add(attackerId==="hero"?"attack-from-hero":"attack-from-enemy");
 battleLater(()=>{attacker.classList.remove("attacking","charging-finisher");clearHeroPhases();if(attackerId==="hero"&&typeof clearHeroAttackVariant==="function")clearHeroAttackVariant(attacker);arena.classList.remove("attack-from-hero","attack-from-enemy")},attackDuration);
 battleLater(()=>{
   target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher");void target.offsetWidth;target.classList.add("hit");if(tintClass)target.classList.add(tintClass);if(finisher)target.classList.add("finisher");battleLater(()=>target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher"),hitDuration);
   arena.classList.remove("shake","finisher-shake");if(shakeClass){void arena.offsetWidth;arena.classList.add(shakeClass);battleLater(()=>arena.classList.remove(shakeClass),hitDuration)}
   flash.classList.remove("pulse-red","pulse-ice","pulse-bloom");if(pulse){void flash.offsetWidth;flash.classList.add(pulse);battleLater(()=>flash.classList.remove(pulse),finisher?620:360)}
   if(targetId==='hero'&&db?.hero==='bunga')window.PABungaBattle?.showHurt?.();
   if(typeof playSfx==='function'&&!(attackerId==='hero'&&(db?.hero==='sidma'||db?.hero==='bunga'||wiraFinishing)))playSfx(attackerId==='hero'&&db?.hero==='wira'?'wiraSword':'hit');
 },contactDelay)
 return {defeatDelay:finisher?(wiraFinishing?contactDelay+300:(sidmaFinishing?contactDelay+260:(bungaFinishing?contactDelay+330:contactDelay+850))):(hasPet?1120:340),completionDelay:attackDuration+80};
}
function triggerPetFollowUp(target,delay){
 const pet=document.getElementById('battlePet');if(!pet||pet.classList.contains('hidden'))return;
 battleLater(()=>{pet.classList.remove('pet-attacking','pet-phase-anticipation','pet-phase-contact','pet-phase-follow-through','pet-phase-recover');void pet.offsetWidth;pet.classList.add('pet-attacking','pet-phase-anticipation');
  battleLater(()=>pet.classList.replace('pet-phase-anticipation','pet-phase-contact'),180);
  battleLater(()=>{pet.classList.replace('pet-phase-contact','pet-phase-follow-through');triggerPetImpactFx(target);target.classList.remove('pet-hit');void target.offsetWidth;target.classList.add('pet-hit');battleLater(()=>target.classList.remove('pet-hit'),330);if(typeof playSfx==='function')playSfx('hit')},360);
  battleLater(()=>pet.classList.replace('pet-phase-follow-through','pet-phase-recover'),570);
  battleLater(()=>pet.classList.remove('pet-attacking','pet-phase-recover'),760);
 },delay);
}
function triggerPetImpactFx(target){
 const id=db?.rewards?.equippedPet,item=typeof REWARD_PETS!=='undefined'&&REWARD_PETS[id];if(!item?.fx||!target)return;
 const arena=document.getElementById('battleArena');if(!arena)return;let fx=document.getElementById('petImpactFx');if(!fx){fx=document.createElement('img');fx.id='petImpactFx';fx.className='petImpactFx';fx.alt='';fx.setAttribute('aria-hidden','true');arena.appendChild(fx);}
 const arenaBox=arena.getBoundingClientRect(),box=target.getBoundingClientRect();fx.src=item.fx;fx.style.left=(box.left-arenaBox.left+box.width/2)+'px';fx.style.top=(box.top-arenaBox.top+box.height/2)+'px';fx.dataset.pet=id;fx.classList.remove('active');void fx.offsetWidth;fx.classList.add('active');battleLater(()=>fx.classList.remove('active'),720);
}
function triggerBossEntrance(){
 const arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy');if(!arena||!enemy)return;
 let layer=arena.querySelector('.bossEntrance');
 if(!layer){layer=document.createElement('div');layer.className='bossEntrance';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="bossEntranceShade"></div><div class="bossEntranceFlash"></div><div class="bossEntranceBanner"><small>AMARAN</small><b>BOSS MUNCUL!</b></div>';arena.appendChild(layer);}
 arena.classList.remove('boss-entering');layer.classList.remove('show');enemy.classList.remove('boss-drop');void arena.offsetWidth;
 arena.classList.add('boss-entering');layer.classList.add('show');enemy.classList.add('boss-drop');
 battleLater(()=>{if(typeof playSfx==='function')playSfx('hit');arena.classList.add('boss-landed')},920);
 battleLater(()=>{arena.classList.remove('boss-entering','boss-landed');layer.classList.remove('show');enemy.classList.remove('boss-drop')},2350);
}
function triggerMonsterDefeat(){
 const enemy=document.getElementById('enemy'),sprite=document.getElementById('enemySprite'),wrap=sprite?.parentElement;
 if(!enemy||!sprite||!wrap||enemy.classList.contains('defeat-crack'))return;
 enemy.classList.add('defeat-crack');
 const old=wrap.querySelector('.monster-defeat-layer');if(old)old.remove();
 const layer=document.createElement('div');layer.className='monster-defeat-layer';layer.setAttribute('aria-hidden','true');
 const clips=[
  'polygon(0 0,42% 0,30% 36%,0 48%)','polygon(42% 0,100% 0,100% 30%,68% 38%,30% 36%)',
  'polygon(0 48%,30% 36%,46% 61%,20% 100%,0 100%)','polygon(30% 36%,68% 38%,63% 70%,46% 61%)',
  'polygon(68% 38%,100% 30%,100% 69%,75% 61%,63% 70%)','polygon(20% 100%,46% 61%,63% 70%,55% 100%)',
  'polygon(63% 70%,75% 61%,100% 69%,100% 100%,55% 100%)'
 ];
 const motion=[[-32,-22,-24],[-2,-38,18],[-38,8,-34],[5,-14,22],[40,-7,35],[-14,17,-20],[34,19,29]];
 clips.forEach((clip,i)=>{
  const shard=sprite.cloneNode(false),[x,y,r]=motion[i];
  shard.removeAttribute('id');shard.className='monster-shard';shard.style.clipPath=clip;
  shard.style.setProperty('--sx',x+'px');shard.style.setProperty('--sy',y+'px');shard.style.setProperty('--sx-mid',(x*.45)+'px');shard.style.setProperty('--sy-mid',(y*.42)+'px');shard.style.setProperty('--rot',r+'deg');shard.style.setProperty('--rot-mid',(r*.4)+'deg');shard.style.setProperty('--delay',(i%3)*12+'ms');
  layer.appendChild(shard);
 });
 const dust=document.createElement('div');dust.className='monster-defeat-dust';layer.appendChild(dust);wrap.appendChild(layer);
 battleLater(()=>{enemy.classList.remove('defeat-crack');enemy.classList.add('defeat-shatter')},175);
}
function triggerBossVictory(){
 const arena=document.getElementById('battleArena');if(!arena)return;
 let layer=arena.querySelector('.bossVictory');
 if(!layer){layer=document.createElement('div');layer.className='bossVictory';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="bossVictoryBanner">BOSS DITEWASKAN!</div>';arena.appendChild(layer);}
 layer.classList.remove('show');void layer.offsetWidth;layer.classList.add('show');
 battleLater(()=>layer.classList.remove('show'),1500);
}
function scheduleBossPresentation(victoryDelay){
 battleLater(triggerBossVictory,victoryDelay);
 if(!sess?.demoMode)battleLater(showBossCheckpoint,victoryDelay+1750);
}
function showBossCheckpoint(){
 const overlay=document.getElementById('bossCheckpoint'),arena=document.getElementById('battleArena');if(!overlay||!arena)return;
 const entries=Object.entries(sess?.missionSkills||{}).sort((a,b)=>b[1]-a[1]);
 const currentSkill=sess?.q?.skill;
 const best=entries.length&&META[entries[0][0]]?META[entries[0][0]]:(currentSkill&&META[currentSkill]);
 if(!best)return;
 const accuracy=Math.round((sess.missionCorrect||0)/Math.max(1,sess.missionAnswered||1)*100);
 document.getElementById('bossCheckpointSkill').textContent=`Kamu berjaya menamatkan cabaran ${best?.domain||'matematik'}.`;
 document.getElementById('bossCheckpointProof').innerHTML=`<b>${sess.missionCorrect||0}/${sess.missionAnswered||0}</b><span>jawapan betul</span><b>${accuracy}%</b><span>ketepatan</span>`;
 document.getElementById('bossCheckpointEncourage').textContent=accuracy>=80?'Cara fikir kamu semakin kuat. Kawasan ini kini selamat!':accuracy>=60?'Kamu tidak mengalah walaupun dicabar. Itu sikap seorang pahlawan.':'Boss sudah kalah. Kita akan kukuhkan semula bahagian yang sukar dalam misi seterusnya.';
 arena.classList.add('boss-cleared');overlay.classList.add('show');
 sess.awaitingBossContinue=true;
 sess.bossContinueAction=(sess.coachAdaptive&&shouldFinishAdaptiveCoach())?'finishCoach':(!sess.devBankTest&&!sess.coachAdaptive&&sess.missionAnswered>=PROGRESSION.missionQuestions?'finishMission':'next');
 const button=document.getElementById('bossCheckpointButton');if(button)button.textContent=sess.bossContinueAction==='next'?'Teruskan Pengembaraan':'Lihat Keputusan Misi';
}
function continueAfterBoss(){
 if(!sess||!sess.awaitingBossContinue)return;
 const overlay=document.getElementById('bossCheckpoint');if(overlay)overlay.classList.remove('show');
 const action=sess.bossContinueAction;sess.awaitingBossContinue=false;sess.bossContinueAction=null;
 if(action==='finishCoach')finishCoachSession();else if(action==='finishMission')finishMission();else nextQ();
}
function respond(o,btn,question){
 const active=sess.q;
 if(!active||!question||question.token!==active.token||btn.dataset.questionToken!==String(active.token))return;
 const ok=o.tag==='correct'&&String(o.v)===String(question.answer);
 if(!ok&&!sess.retryState){beginHintRetry(o,btn,question);return;}
 resolveAnswer(o,btn,question,ok);
}
function beginHintRetry(o,btn,question){
 const id=question.skill,s=scoreState(id),sec=(performance.now()-sess.start)/1000,layerDelta=META[id].grade-coreGrade(),qsv2Target=window.PAD3Topic7LiveCutover?.isTargetQuestion?.(question)===true,qsv2NonT7Target=!qsv2Target&&window.PAD3NonT7LiveIsolation?.isTargetQuestion?.(question)===true,qsv2Isolated=qsv2Target||qsv2NonT7Target;
 const effortLock=!sess.demoMode&&window.PAEffortGuard?.firstWrong?.(question,sec)===true;
 sess.retryState={wrongTag:o.tag,wrongValue:o.v,firstSeconds:sec,streakBefore:sess.streak};
 window.PALearnerReview?.firstWrong?.(question,{tag:o.tag,value:o.v,seconds:sec});
 btn.classList.add('no');btn.disabled=true;
 if(!qsv2Isolated){
  s.wrong++;s.evidence++;s.mis[o.tag]=(s.mis[o.tag]||0)+1;
  s.mastery=Math.max(0,s.mastery-(layerDelta>0?1.2:2.2));s.confidence=Math.max(0,s.confidence-(layerDelta>0?2:4));s.stability=Math.max(0,s.stability-3);if(layerDelta>0)s.probeFail++;
  recordCoachResponse(id,false,o.tag,sec,false,question.token);recordFrontierResponse(id,false,sec,false,question);
 }
 if(window.PATelemetry)PATelemetry.response(id,false,o.tag,sec,false,question,sess.mode+'-first-attempt');
 const hintButton=document.querySelector('.hintBtn');if(hintButton){hintButton.classList.add('needs-help');hintButton.setAttribute('aria-label','Petunjuk tersedia. Tekan untuk bantuan Cikgu Dimensi');}
 document.getElementById('feedback').innerHTML='<b>Belum tepat.</b> Cuba sekali lagi. Petunjuk tersedia jika perlu.';
 if(question.hintSteps?.length){const note=document.createElement('div');note.textContent=question.hintSteps[0];document.getElementById('feedback').appendChild(note);}
 document.getElementById('streak').textContent=sess.streak+' rentak · dibekukan';document.getElementById('streak').title='Rentak ialah jawapan betul berturut-turut. Kesilapan pertama membekukannya sementara kamu mencuba semula.';if(typeof playSfx==='function')playSfx('wrong');battle();save();
 if(effortLock){battleLater(()=>activateEffortRestuLock(id),500);return;}
}
function resolveAnswer(o,btn,question,ok){
 let responseMotion=null;
 let id=question.skill,s=scoreState(id),beforeMastery=s.mastery,devSnapshot=sess.devBankTest?JSON.parse(JSON.stringify(s)):null,sec=(performance.now()-sess.start)/1000,layerDelta=META[id].grade-coreGrade(),bossStretch=!!(sess.enemyTier==='boss'&&sess.bossStretchCurrent&&layerDelta>0),usedFinisher=false,qsv2Target=window.PAD3Topic7LiveCutover?.isTargetQuestion?.(question)===true,qsv2NonT7Target=!qsv2Target&&window.PAD3NonT7LiveIsolation?.isTargetQuestion?.(question)===true,qsv2Isolated=qsv2Target||qsv2NonT7Target,qsv2LegacySnapshot=qsv2Target?window.PAD3Topic7LiveCutover?.captureLegacyState?.(question,s):(qsv2NonT7Target?window.PAD3NonT7LiveIsolation?.captureLegacyState?.(question,s):null);
 window.PAEffortGuard?.retryResolved?.(question,ok);
 document.querySelectorAll(".ans").forEach(x=>x.disabled=true);
 if(ok){
  btn.classList.add("ok");s.correct++;if(!sess.retryState)s.evidence++;if(!sess.retryState)sess.streak++;
  if(typeof playSfx==='function')playSfx('correct');
  let ql=evidenceQuality(sec,question,sess.hint),baseGain=layerDelta>0?6:(layerDelta<0?9:8),gain=baseGain*ql*(1-s.mastery/135);
  s.mastery=Math.min(100,s.mastery+gain);s.confidence=Math.min(100,s.confidence+(layerDelta>0?4.5:5.5)*ql);s.stability=Math.min(100,s.stability+4*ql);
  if(layerDelta>0&&!sess.retryState&&!sess.hint)s.probePass++;
  document.getElementById("feedback").innerHTML=(sess.guardianFocus&&typeof guardianCorrectFeedback==='function')?guardianCorrectFeedback(question,!!sess.retryState):(sess.retryState?(sess.hint?'Bagus! Petunjuk membantu kamu menemui jawapan.':'Bagus! Kamu cuba semula dan menemui jawapan.'):(sec<1.15?'Betul. Cikgu Dimensi akan semak dengan bentuk lain untuk pastikan kamu benar-benar faham.':'Betul. Teruskan cara fikir itu.'));
  const devOneHit=!!(db&&isDevMode()&&db.devOneHit);let willFinish=devOneHit||sess.ehp<=4;usedFinisher=willFinish;let heroTheme=(db&&db.hero&&HEROES[db.hero]?HEROES[db.hero].theme:"ice");if(!willFinish&&typeof playSfx==='function'&&db&&!['wira','sidma','bunga'].includes(db.hero))playSfx('attack');sess.lastHeroImpact=triggerImpact("hero","enemy",heroTheme,willFinish);responseMotion=sess.lastHeroImpact;sess.ehp-=devOneHit?Math.max(4,sess.ehp):4
 }else{
  btn.classList.add("no");sess.streak=0;
  if(!sess.retryState){s.wrong++;s.evidence++;s.mastery=Math.max(0,s.mastery-(layerDelta>0?2.2:4.5));s.confidence=Math.max(0,s.confidence-(layerDelta>0?4:7.5));s.stability=Math.max(0,s.stability-5);s.mis[o.tag]=(s.mis[o.tag]||0)+1;if(layerDelta>0)s.probeFail++}
  if(typeof playSfx==='function'){playSfx('wrong');battleLater(()=>playSfx('enemyAttack'),80);}
  let right=[...document.querySelectorAll(".ans")].find(x=>x.dataset.v===String(question.answer));if(right)right.classList.add("ok");
  document.getElementById("feedback").innerHTML=`<b>Jawapan: ${question.answer}</b><br>${explain(o.tag)}`;
  if(!sess.coachAdaptive){responseMotion=triggerImpact("enemy","hero","red",false);sess.hp-=3}
 }

 if(question.solution){const step=document.createElement('div');step.textContent=question.solution;document.getElementById('feedback').appendChild(step);}
 if(qsv2Target){
   window.PAD3Topic7LiveCutover?.restoreLegacyState?.(question,s,qsv2LegacySnapshot);
   window.PAD3Topic7LiveCutover?.recordBattleResult?.(db,question,sess,ok);
 }else if(qsv2NonT7Target){
   window.PAD3NonT7LiveIsolation?.restoreLegacyState?.(question,s,qsv2LegacySnapshot);
   window.PAD3NonT7LiveIsolation?.recordBattleResult?.(db,question,sess,ok);
 }

 if(bossStretch){
   if(ok&&db){ if(typeof ensureRewards==='function')ensureRewards(); db.rewards.bossStretchWin=true; save(); }
   document.getElementById('feedback').textContent=ok?'Cabaran Boss berjaya! Ini bukti kamu boleh cuba tahap Darjah '+META[id].grade+'.':'Cubaan yang berani! Jawapan ini membantu Cikgu memilih cabaran yang paling sesuai untuk kamu.';
 }
 if(!qsv2Isolated){
  recordCoachResponse(id,ok,o.tag,sec,sess.hint,question.token);
  recordFrontierResponse(id,ok,sec,sess.hint,question);
  if(!bossStretch)updateConfirmationAfterEncounter(id,{correct:ok,hadRetry:!!sess.retryState,usedHint:!!sess.hint});
 }
 if(window.PATelemetry)PATelemetry.response(id,ok,o.tag,sec,sess.hint,question,sess.retryState?sess.mode+'-retry':sess.mode);
 window.PALearnerReview?.resolve?.(question,{correct:ok,tag:o.tag,seconds:sec,usedHint:!!sess.hint,hintLevel:sess.hintLevel||0},db);
 const intervention=(bossStretch||qsv2Isolated)?null:evaluateIntervention(id);
 if(sess.enemyTier==='boss'&&!sess.coachAdaptive&&!sess.devBankTest)sess.bossQuestionsAnswered=(sess.bossQuestionsAnswered||0)+1;
 recordMissionAnswer(ok,id,sess.hint);
 if(sess.guardianFocus&&typeof guardianRecordAnswer==='function')guardianRecordAnswer(ok,id,sess.hint);

 if(sess.devBankTest){db.skills[id]=devSnapshot;s=db.skills[id]}
 else if(sess.demoMode){}
 else{
   ensureCoachMemory();
   if(beforeMastery<85&&s.mastery>=85&&!db.masteryRewards[id]){db.masteryRewards[id]=true;addCoins(PROGRESSION.masteryCoinBonus);showRewardToast(`Kemahiran dikuasai! +${PROGRESSION.masteryCoinBonus} 🪙`)}
   updateFrontier();save();
 }
 document.getElementById("streak").textContent=sess.streak+" rentak";
 let enemyDefeated=sess.ehp<=0;
 if(sess.hp<=0){sess.hp=12;log("HP habis: tiada progress dipadam. Coach kekalkan mode pembelajaran.");}
 battle();
 if(enemyDefeated){
  // Let the finisher reach contact before the defeated sprite cracks. The old
  // 260ms timer shattered the enemy underneath the 1.58s cinematic and then
  // replaced it before the player could appreciate the defeat animation.
  const defeatStartDelay=Math.max(usedFinisher?1480:340,Number(sess.lastHeroImpact?.defeatDelay||0));
  const boss=sess.enemyTier==='boss';
  const shatterDuration=boss?935:795;
  const appreciationHold=boss?620:520;
  const enemyTransitionDelay=defeatStartDelay+shatterDuration+appreciationHold;
  battleLater(triggerMonsterDefeat,defeatStartDelay);
  if(typeof playSfx==='function')battleLater(()=>playSfx('enemyDown'),defeatStartDelay);
	  if(boss){
   sess.bossDefeated=true;
   if(typeof setBattleAudioMode==='function')setBattleAudioMode('off');
   if(sess.coachAdaptive){sess.bossActive=false;sess.coachBossChapter=null;}
	   const victoryDelay=enemyTransitionDelay;
	   scheduleBossPresentation(victoryDelay);
  }
  if(!sess.devBankTest&&!sess.demoMode){addCoins(boss?8:3);battleLater(()=>showRewardToast(boss?"Boss ditewaskan! +8 🪙":"Raksasa ditewaskan! +3 🪙"),boss?enemyTransitionDelay:enemyTransitionDelay-220)}
  if(!boss){
   battleLater(nextEnemy,enemyTransitionDelay);
   battleLater(nextQ,enemyTransitionDelay+120);
  }
 }

 if(intervention&&!sess.demoMode&&!enemyDefeated&&!(sess.guardianFocus&&sess.missionAnswered>=sess.focusTarget)){
   sess.confirmSkill=null;sess.confirmRemaining=0;
   log(`Learning Camp dicetuskan untuk ${id}: ${intervention.type} / ${intervention.tag}.`);
   battleLater(()=>learningStart(id,intervention),Math.max(850,responseMotion?.completionDelay||0));
   return;
 }
	 if(sess.demoMode&&sess.missionAnswered>=10){battleLater(()=>window.PADemo?.finish?.(),enemyDefeated?3200:Math.max(1150,responseMotion?.completionDelay||0));return;}
	 if(sess.guardianFocus&&sess.missionAnswered>=sess.focusTarget){battleLater(finishGuardianFocus,Math.max(1150,responseMotion?.completionDelay||0));return;}
	 if(enemyDefeated)return;
	 const bossClearDelay=(enemyDefeated&&db&&db.hero==="bunga")?1500:Math.max(1100,responseMotion?.completionDelay||0);
 if(sess.coachAdaptive && shouldFinishAdaptiveCoach()){battleLater(finishCoachSession,bossClearDelay)}
 else if(!sess.devBankTest && !sess.coachAdaptive && sess.missionAnswered>=PROGRESSION.missionQuestions && sess.bossDefeated){battleLater(finishMission,bossClearDelay)}
 else{battleLater(nextQ,enemyDefeated?1250:Math.max(1050,Number(responseMotion?.completionDelay||0)))}
}
function closeHintOverlay(){const overlay=document.getElementById('paHintOverlay');if(overlay){overlay.classList.remove('show');battleLater(()=>overlay.remove(),180)}}
function showHintOverlay(help){
 let overlay=document.getElementById('paHintOverlay');if(!overlay){overlay=document.createElement('div');overlay.id='paHintOverlay';overlay.className='paHintOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','paHintTitle');document.body.appendChild(overlay)}
 overlay.innerHTML='<section class="paHintPanel"><div class="paHintMark" aria-hidden="true">✦</div><small>PETUNJUK CIKGU DIMENSI</small><h2 id="paHintTitle"></h2><p>Sekarang cuba pilih jawapan sekali lagi.</p><button type="button" onclick="closeHintOverlay()">Faham, saya cuba</button></section>';
 overlay.querySelector('h2').textContent=String(help||'Lihat semula maklumat penting dalam soalan.');requestAnimationFrame(()=>{overlay.classList.add('show');overlay.querySelector('button')?.focus()});
}
function hint(){
 if(!sess.q)return;
 window.PAEffortGuard?.hintOpened?.(sess.q);
 sess.hintLevel=(sess.hintLevel||0)+1;
 window.PALearnerReview?.hintUsed?.(sess.q,sess.hintLevel);
 if(!sess.hint){sess.hint=true;scoreState(sess.q.skill).hints++;}
 const button=document.querySelector('.hintBtn');if(button){button.classList.remove('needs-help');button.classList.add('used');button.setAttribute('aria-label','Petunjuk telah dibuka');}
 const help=(sess.guardianFocus&&typeof guardianHint==='function')?guardianHint(sess.q,sess.hintLevel):(sess.q.hintSteps?.[Math.min(sess.hintLevel-1,sess.q.hintSteps.length-1)]||sess.q.hint);
 document.getElementById('feedback').innerHTML=`<b>Cikgu Dimensi bantu:</b> ${help}<br><span class="retryPrompt">Sekarang pilih jawapan sekali lagi.</span>`;
 showHintOverlay(help);
 if(sess.retryState)document.querySelectorAll('.ans').forEach(x=>{if(!x.classList.contains('no'))x.disabled=false});
 save();
}
function battle(){const shown=battleDisplayedHp||sess;document.getElementById("heroHp").style.width=Math.max(0,shown.hp)/20*100+"%";let max=sess.enemyMaxHp||12;document.getElementById("enemyHp").style.width=Math.max(0,shown.ehp)/max*100+"%";window.PACombatMotion?.sync?.()}
