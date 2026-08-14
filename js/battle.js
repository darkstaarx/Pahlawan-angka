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
  layer.style.setProperty('--hero-center-x',(heroRect.left-arenaRect.left+(heroRect.width/2))+'px');
  const auraWidth=heroRect.width*2.08;
  layer.style.setProperty('--aura-bottom',(arenaRect.bottom-heroRect.bottom-(auraWidth*.055))+'px');
  layer.style.setProperty('--aura-w',auraWidth+'px');
  layer.style.setProperty('--power-y',(heroRect.top-arenaRect.top+(heroRect.height*.2))+'px');
  layer.style.setProperty('--power-w',(heroRect.width*.78)+'px');
  layer.style.setProperty('--power-h',(heroRect.height*.82)+'px');
 }
 hero.src=h.auraFraming||h.anticipation||h.idle;hero.alt=h.name+' mengumpul kuasa';
 document.getElementById('cinematicHeroName').textContent=h.name.toUpperCase();
 if(item&&db.hero!=='bunga'){aura.src=item.image;aura.dataset.aura=type;aura.classList.remove('hidden')}else{aura.removeAttribute('src');aura.classList.add('hidden')}
 layer.dataset.hero=db.hero||'wira';layer.dataset.aura=type||'none';
 layer.classList.remove('active','release');void layer.offsetWidth;layer.classList.add('active');
 if(typeof playSfx==='function')playSfx('auraCharge');
 setTimeout(()=>{layer.classList.add('release');if(typeof playSfx==='function'&&db.hero!=='wira')playSfx('attack')},760);
 setTimeout(()=>layer.classList.remove('active','release'),1080);
}
function triggerImpact(attackerId,targetId,tint,finisher){
 let attacker=document.getElementById(attackerId),target=document.getElementById(targetId),arena=document.getElementById("battleArena"),flash=document.getElementById("arenaFlash");
 if(!attacker||!target||!arena||!flash)return;
 const pet=attackerId==="hero"?document.getElementById("battlePet"):null,hasPet=!!(pet&&!pet.classList.contains("hidden")&&db?.rewards?.equippedPet);
 const heroLead=hasPet?420:0,finisherContact=820;
 let attackDuration=(finisher?1450:620)+heroLead,contactDelay=(finisher?finisherContact:245)+heroLead,hitDuration=finisher?(tint==="bloom"?1080:900):520,shakeClass=finisher?"finisher-shake":"shake",tintClass=tint==="red"?"tint-red":(tint==="bloom"?"tint-bloom":"tint-ice"),pulse=tint==="red"?"pulse-red":(tint==="bloom"?"pulse-bloom":"pulse-ice");
 if(attackerId==="hero"){
   if(pet&&!pet.classList.contains("hidden")){
     const petRect=pet.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
     const petCenter=petRect.left+(petRect.width/2),targetFront=targetRect.left+Math.min(24,targetRect.width*.18);
     pet.style.setProperty("--pet-dash-x",Math.min(48,Math.max(0,targetFront-petCenter))+"px");
   }
 }
 const clearHeroPhases=()=>attacker.classList.remove("phase-anticipation","phase-contact","phase-follow-through","phase-recover");
 const startAttacker=()=>{attacker.classList.remove("attacking","charging-finisher");void attacker.offsetWidth;attacker.classList.add("attacking");if(finisher){if(attackerId==="hero")triggerFinisherCinematic();attacker.classList.add("charging-finisher");}};
 if(heroLead)setTimeout(startAttacker,heroLead);else startAttacker();
 if(hasPet)triggerPetFollowUp(target,0);
 if(attackerId==="hero"){
   clearHeroPhases();setTimeout(()=>attacker.classList.add("phase-anticipation"),heroLead);
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},heroLead+(finisher?finisherContact:150));
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-follow-through")},heroLead+(finisher?1010:340));
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},heroLead+(finisher?1200:500));
 }else if(attacker.dataset.enemyTier==="boss"){
   clearHeroPhases();attacker.classList.add("phase-anticipation");
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-contact")},145);
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-follow-through")},335);
   setTimeout(()=>{clearHeroPhases();attacker.classList.add("phase-recover")},500);
 }
 arena.classList.remove("attack-from-hero","attack-from-enemy");arena.classList.add(attackerId==="hero"?"attack-from-hero":"attack-from-enemy");
 setTimeout(()=>{attacker.classList.remove("attacking","charging-finisher");clearHeroPhases();arena.classList.remove("attack-from-hero","attack-from-enemy")},attackDuration);
 setTimeout(()=>{
   target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher");void target.offsetWidth;target.classList.add("hit",tintClass);if(finisher)target.classList.add("finisher");setTimeout(()=>target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher"),hitDuration);
   arena.classList.remove("shake","finisher-shake");void arena.offsetWidth;arena.classList.add(shakeClass);setTimeout(()=>arena.classList.remove(shakeClass),hitDuration);
   flash.classList.remove("pulse-red","pulse-ice","pulse-bloom");void flash.offsetWidth;flash.classList.add(pulse);setTimeout(()=>flash.classList.remove(pulse),finisher?620:360);
   if(typeof playSfx==='function')playSfx(attackerId==='hero'&&db?.hero==='wira'?'wiraSword':'hit');
 },contactDelay)
 return {defeatDelay:finisher?contactDelay+850:(hasPet?1120:340)};
}
function triggerPetFollowUp(target,delay){
 const pet=document.getElementById('battlePet');if(!pet||pet.classList.contains('hidden'))return;
 setTimeout(()=>{pet.classList.remove('pet-attacking','pet-phase-anticipation','pet-phase-contact','pet-phase-follow-through','pet-phase-recover');void pet.offsetWidth;pet.classList.add('pet-attacking','pet-phase-anticipation');
  setTimeout(()=>pet.classList.replace('pet-phase-anticipation','pet-phase-contact'),180);
  setTimeout(()=>{pet.classList.replace('pet-phase-contact','pet-phase-follow-through');triggerPetImpactFx(target);target.classList.remove('pet-hit');void target.offsetWidth;target.classList.add('pet-hit');setTimeout(()=>target.classList.remove('pet-hit'),330);if(typeof playSfx==='function')playSfx('hit')},360);
  setTimeout(()=>pet.classList.replace('pet-phase-follow-through','pet-phase-recover'),570);
  setTimeout(()=>pet.classList.remove('pet-attacking','pet-phase-recover'),760);
 },delay);
}
function triggerPetImpactFx(target){
 const id=db?.rewards?.equippedPet,item=typeof REWARD_PETS!=='undefined'&&REWARD_PETS[id];if(!item?.fx||!target)return;
 const arena=document.getElementById('battleArena');if(!arena)return;let fx=document.getElementById('petImpactFx');if(!fx){fx=document.createElement('img');fx.id='petImpactFx';fx.className='petImpactFx';fx.alt='';fx.setAttribute('aria-hidden','true');arena.appendChild(fx);}
 const arenaBox=arena.getBoundingClientRect(),box=target.getBoundingClientRect();fx.src=item.fx;fx.style.left=(box.left-arenaBox.left+box.width/2)+'px';fx.style.top=(box.top-arenaBox.top+box.height/2)+'px';fx.dataset.pet=id;fx.classList.remove('active');void fx.offsetWidth;fx.classList.add('active');setTimeout(()=>fx.classList.remove('active'),720);
}
function triggerBossEntrance(){
 const arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy');if(!arena||!enemy)return;
 let layer=arena.querySelector('.bossEntrance');
 if(!layer){layer=document.createElement('div');layer.className='bossEntrance';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="bossEntranceShade"></div><div class="bossEntranceFlash"></div><div class="bossEntranceBanner"><small>AMARAN</small><b>BOSS MUNCUL!</b></div>';arena.appendChild(layer);}
 arena.classList.remove('boss-entering');layer.classList.remove('show');enemy.classList.remove('boss-drop');void arena.offsetWidth;
 arena.classList.add('boss-entering');layer.classList.add('show');enemy.classList.add('boss-drop');
 setTimeout(()=>{if(typeof playSfx==='function')playSfx('hit');arena.classList.add('boss-landed')},920);
 setTimeout(()=>{arena.classList.remove('boss-entering','boss-landed');layer.classList.remove('show');enemy.classList.remove('boss-drop')},2350);
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
 setTimeout(()=>{enemy.classList.remove('defeat-crack');enemy.classList.add('defeat-shatter')},175);
}
function triggerBossVictory(){
 const arena=document.getElementById('battleArena');if(!arena)return;
 let layer=arena.querySelector('.bossVictory');
 if(!layer){layer=document.createElement('div');layer.className='bossVictory';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="bossVictoryBanner">BOSS DITEWASKAN!</div>';arena.appendChild(layer);}
 layer.classList.remove('show');void layer.offsetWidth;layer.classList.add('show');
 setTimeout(()=>layer.classList.remove('show'),1500);
}
function showBossCheckpoint(){
 const overlay=document.getElementById('bossCheckpoint'),arena=document.getElementById('battleArena');if(!overlay||!arena)return;
 const entries=Object.entries(sess.missionSkills||{}).sort((a,b)=>b[1]-a[1]);
 const best=entries.length&&META[entries[0][0]]?META[entries[0][0]]:META[sess.q.skill];
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
 if(sess.retryState&&!sess.hint)return;
 resolveAnswer(o,btn,question,ok);
}
function beginHintRetry(o,btn,question){
 const id=question.skill,s=scoreState(id),sec=(performance.now()-sess.start)/1000,layerDelta=META[id].grade-coreGrade();
 sess.retryState={wrongTag:o.tag,wrongValue:o.v,firstSeconds:sec,streakBefore:sess.streak};
 btn.classList.add('no');document.querySelectorAll('.ans').forEach(x=>x.disabled=true);
 s.wrong++;s.evidence++;s.mis[o.tag]=(s.mis[o.tag]||0)+1;
 s.mastery=Math.max(0,s.mastery-(layerDelta>0?1.2:2.2));s.confidence=Math.max(0,s.confidence-(layerDelta>0?2:4));s.stability=Math.max(0,s.stability-3);if(layerDelta>0)s.probeFail++;
 recordCoachResponse(id,false,o.tag,sec,false);recordFrontierResponse(id,false,sec,false,question);
 const hintButton=document.querySelector('.hintBtn');if(hintButton){hintButton.classList.add('needs-help');hintButton.setAttribute('aria-label','Petunjuk tersedia. Tekan untuk bantuan Cikgu Wajar');}
 document.getElementById('feedback').innerHTML='<b>Belum tepat—jangan risau.</b> Rentak dibekukan. Tekan <b>Petunjuk</b> yang menyala, kemudian cuba sekali lagi.';
 document.getElementById('streak').textContent=sess.streak+' rentak · dibekukan';if(typeof playSfx==='function')playSfx('wrong');battle();save();
}
function resolveAnswer(o,btn,question,ok){
 let id=question.skill,s=scoreState(id),beforeMastery=s.mastery,devSnapshot=sess.devBankTest?JSON.parse(JSON.stringify(s)):null,sec=(performance.now()-sess.start)/1000,layerDelta=META[id].grade-coreGrade(),bossStretch=!!(sess.enemyTier==='boss'&&sess.bossStretchCurrent&&layerDelta>0),usedFinisher=false;
 document.querySelectorAll(".ans").forEach(x=>x.disabled=true);
 if(ok){
  btn.classList.add("ok");s.correct++;s.evidence++;if(!sess.retryState)sess.streak++;
  if(typeof playSfx==='function')playSfx('correct');
  let ql=evidenceQuality(sec,question,sess.hint),baseGain=layerDelta>0?6:(layerDelta<0?9:8),gain=baseGain*ql*(1-s.mastery/135);
  s.mastery=Math.min(100,s.mastery+gain);s.confidence=Math.min(100,s.confidence+(layerDelta>0?4.5:5.5)*ql);s.stability=Math.min(100,s.stability+4*ql);
  if(layerDelta>0)s.probePass++;
  document.getElementById("feedback").innerHTML=(typeof guardianCorrectFeedback==='function')?guardianCorrectFeedback(question,!!sess.retryState):(sess.retryState?'Bagus! Kamu gunakan Petunjuk dan berjaya membetulkan jawapan.':(sec<1.15?'Betul. Cikgu Wajar akan semak dengan bentuk lain untuk pastikan kamu benar-benar faham.':'Betul. Teruskan cara fikir itu.'));
  const devOneHit=!!(db&&isDevMode()&&db.devOneHit);let willFinish=devOneHit||sess.ehp<=4;usedFinisher=willFinish;let heroTheme=(db&&db.hero&&HEROES[db.hero]?HEROES[db.hero].theme:"ice");if(!willFinish&&typeof playSfx==='function'&&db&&db.hero!=='wira')playSfx('attack');sess.lastHeroImpact=triggerImpact("hero","enemy",heroTheme,willFinish);sess.ehp-=devOneHit?Math.max(4,sess.ehp):4
 }else{
  btn.classList.add("no");s.wrong++;s.evidence++;sess.streak=0;
  if(typeof playSfx==='function'){playSfx('wrong');setTimeout(()=>playSfx('enemyAttack'),80);}s.mastery=Math.max(0,s.mastery-(layerDelta>0?2.2:4.5));s.confidence=Math.max(0,s.confidence-(layerDelta>0?4:7.5));s.stability=Math.max(0,s.stability-5);
  s.mis[o.tag]=(s.mis[o.tag]||0)+1;if(layerDelta>0)s.probeFail++;
  let right=[...document.querySelectorAll(".ans")].find(x=>x.dataset.v===String(question.answer));if(right)right.classList.add("ok");
  document.getElementById("feedback").innerHTML=`<b>Jawapan: ${question.answer}</b><br>${explain(o.tag)}`;
  if(!sess.coachAdaptive){triggerImpact("enemy","hero","red",false);sess.hp-=3}
 }


 if(bossStretch){
   if(ok&&db){ if(typeof ensureRewards==='function')ensureRewards(); db.rewards.bossStretchWin=true; save(); }
   document.getElementById('feedback').textContent=ok?'Cabaran Boss berjaya! Ini bukti kamu boleh cuba tahap Darjah '+META[id].grade+'.':'Tak mengapa. Ini soalan tahap Darjah '+META[id].grade+' untuk menguji had kamu — ia tidak bermaksud topik Darjah '+coreGrade()+' gagal.';
 }
 recordCoachResponse(id,ok,o.tag,sec,sess.hint);
 recordFrontierResponse(id,ok,sec,sess.hint,question);
 if(!bossStretch){if(ok)consumeConfirmation(id);else scheduleConfirmation(id);}
 const intervention=bossStretch?null:evaluateIntervention(id);
 if(sess.enemyTier==='boss'&&!sess.coachAdaptive&&!sess.devBankTest)sess.bossQuestionsAnswered=(sess.bossQuestionsAnswered||0)+1;
 recordMissionAnswer(ok,id,sess.hint);
 if(sess.guardianFocus&&typeof guardianRecordAnswer==='function')guardianRecordAnswer(ok,id,sess.hint);

 if(sess.devBankTest){db.skills[id]=devSnapshot;s=db.skills[id]}
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
  setTimeout(triggerMonsterDefeat,defeatStartDelay);
  if(typeof playSfx==='function')setTimeout(()=>playSfx('enemyDown'),defeatStartDelay);
	  if(boss){
   sess.bossDefeated=true;
   if(sess.coachAdaptive){sess.bossActive=false;sess.coachBossChapter=null;}
	   const victoryDelay=enemyTransitionDelay;
	   setTimeout(triggerBossVictory,victoryDelay);
	   setTimeout(showBossCheckpoint,victoryDelay+1750);
  }
  if(!sess.devBankTest){addCoins(boss?8:3);setTimeout(()=>showRewardToast(boss?"Boss ditewaskan! +8 🪙":"Raksasa ditewaskan! +3 🪙"),boss?enemyTransitionDelay:enemyTransitionDelay-220)}
  if(!boss){
   setTimeout(nextEnemy,enemyTransitionDelay);
   setTimeout(nextQ,enemyTransitionDelay+120);
  }
 }

 if(intervention&&!enemyDefeated&&!(sess.guardianFocus&&sess.missionAnswered>=sess.focusTarget)){
   sess.confirmSkill=null;sess.confirmRemaining=0;
   log(`Learning Camp dicetuskan untuk ${id}: ${intervention.type} / ${intervention.tag}.`);
   setTimeout(()=>learningStart(id,intervention),850);
   return;
 }
	 if(sess.guardianFocus&&sess.missionAnswered>=sess.focusTarget){setTimeout(finishGuardianFocus,1150);return;}
	 if(enemyDefeated)return;
	 const bossClearDelay=(enemyDefeated&&db&&db.hero==="bunga")?1500:1100;
 if(sess.coachAdaptive && shouldFinishAdaptiveCoach()){setTimeout(finishCoachSession,bossClearDelay)}
 else if(!sess.devBankTest && !sess.coachAdaptive && sess.missionAnswered>=PROGRESSION.missionQuestions && sess.bossDefeated){setTimeout(finishMission,bossClearDelay)}
 else{setTimeout(nextQ,enemyDefeated?1250:1050)}
}
function hint(){
 if(!sess.q)return;
 sess.hintLevel=(sess.hintLevel||0)+1;
 if(!sess.hint){sess.hint=true;scoreState(sess.q.skill).hints++;}
 const button=document.querySelector('.hintBtn');if(button){button.classList.remove('needs-help');button.classList.add('used');button.setAttribute('aria-label','Petunjuk telah dibuka');}
 const help=typeof guardianHint==='function'?guardianHint(sess.q,sess.hintLevel):sess.q.hint;
 document.getElementById('feedback').innerHTML=`<b>Cikgu Wajar bantu:</b> ${help}<br><span class="retryPrompt">Sekarang pilih jawapan sekali lagi.</span>`;
 if(sess.retryState)document.querySelectorAll('.ans').forEach(x=>{if(!x.classList.contains('no'))x.disabled=false});
 save();
}
function battle(){document.getElementById("heroHp").style.width=Math.max(0,sess.hp)/20*100+"%";let max=sess.enemyMaxHp||12;document.getElementById("enemyHp").style.width=Math.max(0,sess.ehp)/max*100+"%"}
