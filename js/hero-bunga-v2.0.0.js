/* Bunga redesign v2 — isolated stationary-caster battle choreography. */
(function(){
  const TIMING={
    skill1:{aim:130,release:250,impact:500,recover:650,end:880},
    skill2:{charge:210,release:650,impact:1050,recover:1160,end:1420},
    finisher:{form:1080,compress:1390,impact:1550,end:1810}
  };
  let timers=[],finisherTimers=[],normalAttackCount=0;
  const after=(ms,fn)=>timers.push(setTimeout(fn,ms));
  const afterFinisher=(ms,fn)=>finisherTimers.push(setTimeout(fn,ms));
  function clearTimers(){timers.forEach(clearTimeout);timers=[]}
  function clearFinisherTimers(){finisherTimers.forEach(clearTimeout);finisherTimers=[]}
  function heroData(){return (typeof HEROES!=='undefined'&&HEROES.bunga)||{}}
  function legacyFrames(){return ['heroIdle','heroAnticipation','heroAttack','heroFollowThrough','heroStrike'].map(id=>document.getElementById(id)).filter(Boolean)}
  function suppressLegacy(on){legacyFrames().forEach(img=>img.classList.toggle('bunga-v2-legacy-suppressed',on))}

  function ensureFrames(sprite){
    if(!sprite)return null;
    let group=document.getElementById('bungaV2Frames');if(group)return group;
    const h=heroData(),f=h.frames||{};group=document.createElement('div');group.id='bungaV2Frames';group.className='bunga-v2-frames';group.setAttribute('aria-hidden','true');
    const add=(id,cls,src)=>{const img=document.createElement('img');img.id=id;img.className='bunga-v2-frame '+cls;img.src=src||'';img.alt='';group.appendChild(img)};
    add('bungaSkill1Ready','bunga-v2-skill1-ready',f.skill1Ready);add('bungaSkill1Aim','bunga-v2-skill1-aim',f.skill1Aim);add('bungaSkill1Release','bunga-v2-skill1-release',f.skill1Release);
    add('bungaSkill2Cast','bunga-v2-skill2-cast',f.skill2Cast);add('bungaSkill2Charge','bunga-v2-skill2-charge',f.skill2Charge);add('bungaSkill2Release','bunga-v2-skill2-release',f.skill2Release);add('bungaRecovery','bunga-v2-recovery',f.recovery);add('bungaHurt','bunga-v2-hurt',f.hurt);add('bungaDefeat','bunga-v2-defeat',f.defeat);
    sprite.appendChild(group);return group;
  }
  function show(id){document.querySelectorAll('#bungaV2Frames .bunga-v2-frame').forEach(x=>x.classList.remove('bunga-v2-visible'));document.getElementById(id)?.classList.add('bunga-v2-visible')}
  function hideFrames(){document.querySelectorAll('#bungaV2Frames .bunga-v2-frame').forEach(x=>x.classList.remove('bunga-v2-visible'))}

  function makeFx(id,cls,parent,src){let fx=document.getElementById(id);if(fx)return fx;fx=document.createElement('img');fx.id=id;fx.className=cls;fx.alt='';fx.setAttribute('aria-hidden','true');fx.src=src||'';parent.appendChild(fx);return fx}
  function ensureNormalFx(arena){
    const f=heroData().fx||{};return{
      projectile:makeFx('bungaSkill1Projectile','bunga-v2-projectile',arena,f.skill1Projectile),
      impact:makeFx('bungaNormalImpact','bunga-v2-normal-impact',arena,f.skill1Impact),
      arc:makeFx('bungaSkill2Arc','bunga-v2-charge-arc',arena,f.skill2Arc)
    };
  }
  function enemyCentre(arena,enemy){const a=arena.getBoundingClientRect(),e=(enemy.querySelector('.enemySpriteWrap')||enemy).getBoundingClientRect();return{x:e.left-a.left+e.width/2,y:e.top-a.top+e.height*.5,size:Math.min(a.width*.32,e.height*1.18)}}
  function heroCastPoint(arena,sprite){const a=arena.getBoundingClientRect(),h=sprite.getBoundingClientRect();return{x:h.left-a.left+h.width*.7,y:h.top-a.top+h.height*.31}}
  function positionAt(fx,p){fx.style.left=p.x+'px';fx.style.top=p.y+'px'}

  function playBungaSfx(cue){
    if(typeof paMuted!=='undefined'&&paMuted)return;
    const ctx=typeof ensureBattleAudio==='function'&&ensureBattleAudio();if(!ctx)return;if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const now=ctx.currentTime,out=ctx.createGain();out.gain.value=.34*(typeof PA_VOLUME_SCALE==='number'?PA_VOLUME_SCALE:1);out.connect(ctx.destination);
    const tone=(type,a,b,start,duration,level)=>{const o=ctx.createOscillator(),g=ctx.createGain(),at=now+start;o.type=type;o.frequency.setValueAtTime(a,at);o.frequency.exponentialRampToValueAtTime(Math.max(30,b),at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(level,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(out);o.start(at);o.stop(at+duration+.03)};
    if(cue==='petal'){tone('sine',520,880,0,.18,.17);tone('triangle',740,1120,.04,.17,.09)}
    else if(cue==='impact'){tone('triangle',760,430,0,.22,.18);tone('sine',1040,690,.02,.28,.1)}
    else if(cue==='float'){tone('sine',210,370,0,.5,.15);tone('triangle',420,620,.08,.42,.08)}
    else if(cue==='circle'){tone('sine',392,400,0,.42,.16);tone('sine',588,600,.06,.4,.1)}
    else if(cue==='compress'){tone('triangle',520,105,0,.23,.16);tone('sine',260,70,.02,.25,.13)}
    else if(cue==='final'){tone('sine',128,46,0,.45,.27);tone('triangle',920,460,.03,.58,.16)}
    setTimeout(()=>{try{out.disconnect()}catch(_){}},1100);
  }

  function runSkill1(){
    clearTimers();const sprite=document.getElementById('heroVisual'),arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy');if(!sprite||!arena||!enemy)return;
    ensureFrames(sprite);const fx=ensureNormalFx(arena),pet=document.getElementById('battlePet'),speed=(pet&&!pet.classList.contains('hidden')&&db?.rewards?.equippedPet)?.78:1,at=ms=>Math.round(ms*speed);
    suppressLegacy(true);show('bungaSkill1Ready');
    after(at(TIMING.skill1.aim),()=>show('bungaSkill1Aim'));
    after(at(TIMING.skill1.release),()=>{show('bungaSkill1Release');playBungaSfx('petal');const start=heroCastPoint(arena,sprite),end=enemyCentre(arena,enemy);fx.projectile.style.setProperty('--bunga-start-x',start.x+'px');fx.projectile.style.setProperty('--bunga-start-y',start.y+'px');fx.projectile.style.setProperty('--bunga-end-x',end.x+'px');fx.projectile.style.setProperty('--bunga-end-y',end.y+'px');fx.projectile.style.setProperty('--bunga-flight-ms',at(TIMING.skill1.impact-TIMING.skill1.release)+'ms');fx.projectile.classList.remove('active');void fx.projectile.offsetWidth;fx.projectile.classList.add('active')});
    after(at(TIMING.skill1.impact),()=>{fx.projectile.classList.remove('active');const p=enemyCentre(arena,enemy);positionAt(fx.impact,p);fx.impact.src=heroData().fx?.skill1Impact||'';fx.impact.classList.remove('skill1','skill2');void fx.impact.offsetWidth;fx.impact.classList.add('skill1');playBungaSfx('impact')});
    after(at(TIMING.skill1.recover),()=>{show('bungaRecovery');fx.impact.classList.remove('skill1')});
    after(at(TIMING.skill1.end),resetNormal);
  }

  function runSkill2(){
    clearTimers();const sprite=document.getElementById('heroVisual'),arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy');if(!sprite||!arena||!enemy)return;
    ensureFrames(sprite);const fx=ensureNormalFx(arena);suppressLegacy(true);show('bungaSkill2Cast');
    after(TIMING.skill2.charge,()=>{show('bungaSkill2Charge');const h=sprite.getBoundingClientRect(),a=arena.getBoundingClientRect();positionAt(fx.arc,{x:h.left-a.left+h.width/2,y:h.top-a.top+h.height*.5});fx.arc.classList.remove('active');void fx.arc.offsetWidth;fx.arc.classList.add('active');playBungaSfx('float')});
    after(TIMING.skill2.release,()=>{show('bungaSkill2Release');fx.arc.classList.add('release');playBungaSfx('circle')});
    after(TIMING.skill2.impact,()=>{fx.arc.classList.remove('active','release');const p=enemyCentre(arena,enemy);positionAt(fx.impact,p);fx.impact.src=heroData().fx?.skill2Impact||'';fx.impact.classList.remove('skill1','skill2');void fx.impact.offsetWidth;fx.impact.classList.add('skill2');playBungaSfx('impact')});
    after(TIMING.skill2.recover,()=>{show('bungaRecovery');fx.impact.classList.remove('skill2')});
    after(TIMING.skill2.end,resetNormal);
  }

  function ensureFinisherFx(){
    const arena=document.getElementById('battleArena'),layer=document.getElementById('finisherCinematic');if(!arena||!layer)return null;const f=heroData().fx||{};
    return{aura:makeFx('bungaFinalChargeAura','bunga-final-charge-aura',layer,f.finalAura),bloom:makeFx('bungaFinalBloom','bunga-final-bloom',arena,f.finalBloom),ring:makeFx('bungaFinalRing','bunga-final-ring',arena,f.finalBloom)};
  }
  function runFinisher(){
    resetNormal();resetFinisher();const arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy'),parts=ensureFinisherFx();if(!arena||!enemy||!parts)return;
    parts.aura.classList.add('active');playBungaSfx('float');
    afterFinisher(TIMING.finisher.form,()=>{const p=enemyCentre(arena,enemy),size=Math.min(arena.getBoundingClientRect().width*.4,p.size*1.22);[parts.bloom,parts.ring].forEach(x=>{positionAt(x,p);x.style.setProperty('--bunga-final-size',size+'px')});parts.bloom.src=heroData().fx?.finalBloom||'';parts.ring.src=heroData().fx?.finalBloom||'';parts.bloom.classList.remove('form','impact');parts.ring.classList.remove('form','compress');void parts.bloom.offsetWidth;parts.bloom.classList.add('form');parts.ring.classList.add('form');playBungaSfx('circle')});
    afterFinisher(TIMING.finisher.compress,()=>{parts.bloom.classList.add('compress');parts.ring.classList.add('compress');playBungaSfx('compress')});
    afterFinisher(TIMING.finisher.impact,()=>{parts.ring.classList.remove('form','compress');parts.bloom.src=heroData().fx?.finalImpact||'';parts.bloom.classList.remove('form','compress');void parts.bloom.offsetWidth;parts.bloom.classList.add('impact');playBungaSfx('final')});
    afterFinisher(TIMING.finisher.end,resetFinisher);
  }
  function showHurt(){if((db?.hero||'')!=='bunga')return;const sprite=document.getElementById('heroVisual');ensureFrames(sprite);suppressLegacy(true);show('bungaHurt');after(430,resetNormal)}
  function showDefeat(){if((db?.hero||'')!=='bunga')return;const sprite=document.getElementById('heroVisual');ensureFrames(sprite);suppressLegacy(true);show('bungaDefeat')}
  function resetNormal(){clearTimers();hideFrames();suppressLegacy(false);document.getElementById('bungaSkill1Projectile')?.classList.remove('active');document.getElementById('bungaNormalImpact')?.classList.remove('skill1','skill2');document.getElementById('bungaSkill2Arc')?.classList.remove('active','release')}
  function resetFinisher(){clearFinisherTimers();document.getElementById('bungaFinalChargeAura')?.classList.remove('active');['bungaFinalBloom','bungaFinalRing'].forEach(id=>{const b=document.getElementById(id);if(b){b.classList.remove('form','compress','impact');b.removeAttribute('src')}})}

  const originalPrepare=window.prepareHeroAttackVariant,originalClear=window.clearHeroAttackVariant;
  window.prepareHeroAttackVariant=function(el,finisher){const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira';if(hero==='bunga'){resetNormal();if(finisher)runFinisher();else if(normalAttackCount++%2===0)runSkill1();else runSkill2();return}resetNormal();resetFinisher();if(typeof originalPrepare==='function')originalPrepare(el,finisher)};
  window.clearHeroAttackVariant=function(el){const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira';if(hero==='bunga'){resetNormal();resetFinisher();return}if(typeof originalClear==='function')originalClear(el)};
  window.PABungaBattle={TIMING,runSkill1,runSkill2,runFinisher,resetNormal,resetFinisher,showHurt,showDefeat,getNextNormalSkill:()=>normalAttackCount%2===0?1:2};
})();
