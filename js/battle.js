// Battle state, answer handling and animation triggers.
function triggerImpact(attackerId,targetId,tint,finisher){
 let attacker=document.getElementById(attackerId),target=document.getElementById(targetId),arena=document.getElementById("battleArena"),flash=document.getElementById("arenaFlash");
 let hitDuration=finisher?(tint==="bloom"?1080:900):460,shakeClass=finisher?"finisher-shake":"shake",tintClass=tint==="red"?"tint-red":(tint==="bloom"?"tint-bloom":"tint-ice"),pulse=tint==="red"?"pulse-red":(tint==="bloom"?"pulse-bloom":"pulse-ice");
 attacker.classList.remove("attacking");void attacker.offsetWidth;attacker.classList.add("attacking");setTimeout(()=>attacker.classList.remove("attacking"),460);
 setTimeout(()=>{
   target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher");void target.offsetWidth;target.classList.add("hit",tintClass);if(finisher)target.classList.add("finisher");setTimeout(()=>target.classList.remove("hit","tint-red","tint-ice","tint-bloom","finisher"),hitDuration);
   arena.classList.remove("shake","finisher-shake");void arena.offsetWidth;arena.classList.add(shakeClass);setTimeout(()=>arena.classList.remove(shakeClass),hitDuration);
   flash.classList.remove("pulse-red","pulse-ice","pulse-bloom");void flash.offsetWidth;flash.classList.add(pulse);setTimeout(()=>flash.classList.remove(pulse),finisher?620:360);
 },180)
}

function respond(o,btn){
 let id=sess.q.skill,s=scoreState(id),sec=(performance.now()-sess.start)/1000,ok=String(o.v)===String(sess.q.answer);
 document.querySelectorAll(".ans").forEach(x=>x.disabled=true);
 if(ok){
  btn.classList.add("ok");s.correct++;s.evidence++;sess.streak++;
  let ql=evidenceQuality(sec,sess.q,sess.hint),gain=(META[id].grade===3?7:8)*ql*(1-s.mastery/135);
  s.mastery=Math.min(100,s.mastery+gain);s.confidence=Math.min(100,s.confidence+5.5*ql);s.stability=Math.min(100,s.stability+4*ql);
  if(META[id].grade===3)s.probePass++;
  document.getElementById("feedback").textContent=sec<1.15?"Betul dan sangat cepat. Coach belum terus percaya 100%; format lain akan digunakan untuk sahkan pemahaman.":"Betul. Coach menaikkan evidence untuk skill ini.";
  let willFinish=sess.ehp<=4;let heroTheme=(db&&db.hero&&HEROES[db.hero]?HEROES[db.hero].theme:"ice");triggerImpact("hero","enemy",heroTheme,willFinish);sess.ehp-=4
 }else{
  btn.classList.add("no");s.wrong++;s.evidence++;sess.streak=0;s.mastery=Math.max(0,s.mastery-(META[id].grade===3?2.2:4.5));s.confidence=Math.max(0,s.confidence-(META[id].grade===3?4:7.5));s.stability=Math.max(0,s.stability-5);
  s.mis[o.tag]=(s.mis[o.tag]||0)+1;if(META[id].grade===3)s.probeFail++;
  let right=[...document.querySelectorAll(".ans")].find(x=>x.dataset.v===String(sess.q.answer));if(right)right.classList.add("ok");
  document.getElementById("feedback").textContent=explain(o.tag);triggerImpact("enemy","hero","red",false);sess.hp-=3
 }
 s.lastSeen=Date.now();updateFrontier();save();document.getElementById("streak").textContent=sess.streak+" streak";
 let enemyDefeated=sess.ehp<=0;
 if(sess.hp<=0){sess.hp=12;log("HP habis: tiada progress dipadam. Coach kekalkan recovery/teaching mode.");}
 battle();
 if(enemyDefeated){
   setTimeout(()=>{
     sess.ehp=12;sess.enemy++;
     document.getElementById("enemyName").textContent=sess.enemy%5===0?"Boss Coach":"Rakasa "+sess.enemy;
     battle();
   },900);
 }
 setTimeout(nextQ,(enemyDefeated && db && db.hero==="bunga")?1500:1300)
}

function hint(){sess.hint=true;scoreState(sess.q.skill).hints++;document.getElementById("feedback").textContent=sess.q.hint;save()}

function battle(){document.getElementById("heroHp").style.width=Math.max(0,sess.hp)/20*100+"%";document.getElementById("enemyHp").style.width=Math.max(0,sess.ehp)/12*100+"%"}
