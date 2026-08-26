/* Sidma (Rumus Sigma) battle animation — isolated hero-specific module.
   Wraps the existing prepareHeroAttackVariant/clearHeroAttackVariant hook
   (defined in action-variety-v3.30.0.js) so Wira/Bunga keep their exact
   existing behavior unchanged, and Sidma gets its own body-frame + FX
   sequence entirely separate from the wira/bunga strike-variant system. */
(function(){
  const TIMING={attackStance:215,castStart:300,charge:375,release:130,projectile:285,impact:190,impactEnd:200,recovery:250};
  const T_CAST_START=TIMING.attackStance;
  const T_RELEASE=T_CAST_START+TIMING.castStart+TIMING.charge;
  const T_PROJECTILE_LAUNCH=T_RELEASE+TIMING.release;
  const T_IMPACT=T_PROJECTILE_LAUNCH+TIMING.projectile;
  const T_IMPACT_END=T_IMPACT+TIMING.impact;
  const T_IDLE_RETURN=T_PROJECTILE_LAUNCH+TIMING.recovery;
  window.PA_SIDMA_TIMING={T_CAST_START,T_RELEASE,T_PROJECTILE_LAUNCH,T_IMPACT,T_IMPACT_END,T_IDLE_RETURN};

  let timers=[],finisherTimers=[];
  function clearTimers(){timers.forEach(clearTimeout);timers=[]}
  function clearFinisherTimers(){finisherTimers.forEach(clearTimeout);finisherTimers=[]}
  function after(ms,fn){timers.push(setTimeout(fn,ms))}
  function afterFinisher(ms,fn){finisherTimers.push(setTimeout(fn,ms))}

  function ensureBodyFrames(sprite){
    if(!sprite)return null;
    let group=document.getElementById('sidmaFrames');
    if(group)return group;
    const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
    group=document.createElement('div');group.id='sidmaFrames';group.className='sidma-frames';group.setAttribute('aria-hidden','true');
    const make=(id,cls,src)=>{const img=document.createElement('img');img.id=id;img.className='sidma-frame '+cls;img.alt='';img.src=src||'';group.appendChild(img);return img};
    make('sidmaAttackStance','sidma-frame-attack-stance',h.frames&&h.frames.attackStance);
    make('sidmaCastStart','sidma-frame-cast-start',h.frames&&h.frames.castStart);
    make('sidmaRelease','sidma-frame-release',h.frames&&h.frames.release);
    make('sidmaRecovery','sidma-frame-recovery',h.frames&&h.frames.recovery);
    sprite.appendChild(group);
    return group;
  }

  function ensureChargeFx(sprite){
    if(!sprite)return null;
    let fx=document.getElementById('sidmaChargeFx');
    if(fx)return fx;
    const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
    fx=document.createElement('img');fx.id='sidmaChargeFx';fx.className='sidma-charge-fx';fx.alt='';fx.setAttribute('aria-hidden','true');
    fx.src=(h.fx&&h.fx.charge)||'';
    sprite.appendChild(fx);
    return fx;
  }

  function ensureProjectileFx(arena){
    if(!arena)return null;
    let fx=document.getElementById('sidmaProjectileFx');
    if(fx)return fx;
    const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
    fx=document.createElement('img');fx.id='sidmaProjectileFx';fx.className='sidma-projectile-fx';fx.alt='';fx.setAttribute('aria-hidden','true');
    fx.src=(h.fx&&h.fx.projectile)||'';
    arena.appendChild(fx);
    return fx;
  }

  function ensureEnemyImpactFx(arena){
    if(!arena)return null;
    let fx=document.getElementById('sidmaEnemyImpactFx');
    if(fx)return fx;
    fx=document.createElement('img');fx.id='sidmaEnemyImpactFx';fx.className='sidma-enemy-impact-fx';fx.alt='';fx.setAttribute('aria-hidden','true');
    arena.appendChild(fx);
    return fx;
  }

  function ensureFinisherFx(layer){
    if(!layer)return null;
    let fx=document.getElementById('sidmaFinisherFx');
    if(fx)return fx;
    fx=document.createElement('img');fx.id='sidmaFinisherFx';fx.className='sidma-finisher-fx';fx.alt='';fx.setAttribute('aria-hidden','true');
    layer.appendChild(fx);
    return fx;
  }

  function showFrame(el){document.querySelectorAll('#sidmaFrames .sidma-frame').forEach(x=>x.classList.remove('sidma-visible'));if(el)el.classList.add('sidma-visible')}
  function hideAllFrames(){document.querySelectorAll('#sidmaFrames .sidma-frame').forEach(x=>x.classList.remove('sidma-visible'))}

  function runSidmaAttack(attacker){
    clearTimers();
    const sprite=document.getElementById('heroVisual'),arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy');
    if(!sprite||!arena||!enemy)return;
    const legacyFrames=['heroIdle','heroAnticipation','heroAttack','heroFollowThrough'].map(id=>document.getElementById(id)).filter(Boolean);
    const frames=ensureBodyFrames(sprite),chargeFx=ensureChargeFx(sprite),projectileFx=ensureProjectileFx(arena),impactFx=ensureEnemyImpactFx(arena);
    if(!frames)return;
    const stance=document.getElementById('sidmaAttackStance'),cast=document.getElementById('sidmaCastStart'),release=document.getElementById('sidmaRelease'),recovery=document.getElementById('sidmaRecovery');

    // Body: idle -> attack-stance -> cast-start (charge FX rides on top) -> release -> recovery -> idle
    legacyFrames.forEach(img=>img.classList.add('sidma-legacy-suppressed'));
    showFrame(stance);
    after(T_CAST_START,()=>{
      showFrame(cast);
      if(typeof playSidmaSfx==='function')playSidmaSfx('charge');
      if(chargeFx){chargeFx.classList.remove('sidma-charge-active');void chargeFx.offsetWidth;chargeFx.classList.add('sidma-charge-active')}
    });
    after(T_RELEASE,()=>{
      showFrame(release);
      if(typeof playSidmaSfx==='function')playSidmaSfx('release');
      if(chargeFx)chargeFx.classList.remove('sidma-charge-active');
      // Launch projectile from Sidma's position toward the enemy.
      const arenaBox=arena.getBoundingClientRect(),heroBox=sprite.getBoundingClientRect(),enemyBox=enemy.getBoundingClientRect();
      const startX=heroBox.left-arenaBox.left+heroBox.width*0.62,startY=heroBox.top-arenaBox.top+heroBox.height*0.32;
      const endX=enemyBox.left-arenaBox.left+enemyBox.width*0.42,endY=enemyBox.top-arenaBox.top+enemyBox.height*0.42;
      if(projectileFx){
        projectileFx.classList.remove('sidma-projectile-active');
        projectileFx.style.setProperty('--sidma-start-x',startX+'px');projectileFx.style.setProperty('--sidma-start-y',startY+'px');
        projectileFx.style.setProperty('--sidma-end-x',endX+'px');projectileFx.style.setProperty('--sidma-end-y',endY+'px');
        projectileFx.style.setProperty('--sidma-projectile-ms',TIMING.projectile+'ms');
        void projectileFx.offsetWidth;projectileFx.classList.add('sidma-projectile-active');
      }
    });
    after(T_PROJECTILE_LAUNCH,()=>{
      showFrame(recovery);
    });
    after(T_IMPACT,()=>{
      if(typeof playSidmaSfx==='function')playSidmaSfx('impact');
      if(projectileFx)projectileFx.classList.remove('sidma-projectile-active');
      if(impactFx){
        const arenaBox=arena.getBoundingClientRect(),enemyBox=enemy.getBoundingClientRect();
        const cx=enemyBox.left-arenaBox.left+enemyBox.width/2,cy=enemyBox.top-arenaBox.top+enemyBox.height/2;
        const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
        impactFx.src=(h.fx&&h.fx.impact)||'';impactFx.style.left=cx+'px';impactFx.style.top=cy+'px';
        impactFx.classList.remove('sidma-impact-active','sidma-impact-end-active');void impactFx.offsetWidth;impactFx.classList.add('sidma-impact-active');
      }
    });
    after(T_IMPACT_END,()=>{
      if(impactFx){
        const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
        impactFx.src=(h.fx&&h.fx.impactEnd)||'';
        impactFx.classList.remove('sidma-impact-active');impactFx.classList.add('sidma-impact-end-active');
      }
    });
    after(T_IMPACT_END+TIMING.impactEnd,()=>{
      if(impactFx)impactFx.classList.remove('sidma-impact-end-active');
    });
    after(T_IDLE_RETURN,()=>{
      hideAllFrames();
      legacyFrames.forEach(img=>img.classList.remove('sidma-legacy-suppressed'));
    });
  }

  function resetSidmaVisuals(){
    clearTimers();
    hideAllFrames();
    ['heroIdle','heroAnticipation','heroAttack','heroFollowThrough'].forEach(id=>{const img=document.getElementById(id);if(img)img.classList.remove('sidma-legacy-suppressed')});
    const chargeFx=document.getElementById('sidmaChargeFx');if(chargeFx)chargeFx.classList.remove('sidma-charge-active');
    const projectileFx=document.getElementById('sidmaProjectileFx');if(projectileFx)projectileFx.classList.remove('sidma-projectile-active');
    const impactFx=document.getElementById('sidmaEnemyImpactFx');if(impactFx)impactFx.classList.remove('sidma-impact-active','sidma-impact-end-active');
  }

  function resetSidmaFinisher(){
    clearFinisherTimers();
    const fx=document.getElementById('sidmaFinisherFx');
    if(fx){fx.classList.remove('sidma-finisher-sigma-active','sidma-finisher-impact-end');fx.removeAttribute('src')}
  }

  function runSidmaFinisher(){
    resetSidmaVisuals();resetSidmaFinisher();
    const arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy'),fx=ensureFinisherFx(arena);
    if(!arena||!enemy||!fx)return;
    const arenaBox=arena.getBoundingClientRect(),enemyBox=enemy.getBoundingClientRect();
    const h=(typeof HEROES!=='undefined'&&HEROES.sidma)||{};
    fx.style.left=(enemyBox.left-arenaBox.left+enemyBox.width/2)+'px';
    fx.style.top=(enemyBox.top-arenaBox.top+enemyBox.height*.46)+'px';
    fx.src=(h.fx&&h.fx.impact)||'';
    if(typeof playSidmaSfx==='function')playSidmaSfx('finisher-charge');
    // Blackout/focus/release completes first. The Sigma then becomes visible
    // over the real enemy in the arena and bursts at the 1500ms contact beat.
    afterFinisher(900,()=>{if(typeof playSidmaSfx==='function')playSidmaSfx('sigma-form');void fx.offsetWidth;fx.classList.add('sidma-finisher-sigma-active')});
    afterFinisher(1325,()=>{if(typeof playSidmaSfx==='function')playSidmaSfx('compress')});
    afterFinisher(1510,()=>{
      if(typeof playSidmaSfx==='function')playSidmaSfx('explode');
      fx.src=(h.fx&&h.fx.impactEnd)||'';
      fx.classList.remove('sidma-finisher-sigma-active');void fx.offsetWidth;fx.classList.add('sidma-finisher-impact-end');
    });
    afterFinisher(1760,()=>{fx.classList.remove('sidma-finisher-impact-end');fx.removeAttribute('src')});
  }

  const originalPrepare=window.prepareHeroAttackVariant;
  const originalClear=window.clearHeroAttackVariant;

  window.prepareHeroAttackVariant=function(el,finisher){
    const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira';
    if(hero==='sidma'){
      resetSidmaVisuals();
      if(finisher){runSidmaFinisher();return}
      runSidmaAttack(el);
      return;
    }
    resetSidmaVisuals();
    if(typeof originalPrepare==='function')originalPrepare(el,finisher);
  };

  window.clearHeroAttackVariant=function(el){
    const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira';
    if(hero==='sidma'){resetSidmaVisuals();resetSidmaFinisher();return}
    if(typeof originalClear==='function')originalClear(el);
  };

  window.PASidmaBattle={runSidmaAttack,runSidmaFinisher,resetSidmaVisuals,resetSidmaFinisher,TIMING};
})();
