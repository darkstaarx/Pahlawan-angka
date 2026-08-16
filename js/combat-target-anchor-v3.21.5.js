// Pahlawan Angka v3.21.5 — all enemy impact/finisher/defeat FX follow the actually rendered target.
(()=>{
  'use strict';
  const VERSION='3.21.5';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];

  function activeEnemyFrame(enemy){
    if(!enemy)return null;
    const frames=qa('.enemy-frame',enemy).filter(img=>{
      if(!img.currentSrc&&!img.getAttribute('src'))return false;
      const cs=getComputedStyle(img),rect=img.getBoundingClientRect();
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0.05&&rect.width>2&&rect.height>2;
    });
    if(frames.length){
      frames.sort((a,b)=>Number(getComputedStyle(b).opacity)-Number(getComputedStyle(a).opacity));
      return frames[0];
    }
    return q('#enemySprite',enemy);
  }

  function syncEnemyTargetAnchor(){
    const arena=q('#battleArena'),enemy=q('#enemy');
    const frame=activeEnemyFrame(enemy);
    if(!arena||!enemy||!frame)return null;

    const er=enemy.getBoundingClientRect(),fr=frame.getBoundingClientRect();
    if(fr.width<2||fr.height<2)return null;

    const left=fr.left-er.left, top=fr.top-er.top;
    const cx=left+fr.width*.5, cy=top+fr.height*.53;
    const ground=er.bottom-fr.bottom;

    // General contact FX.
    enemy.style.setProperty('--pa-target-left',`${left}px`);
    enemy.style.setProperty('--pa-target-top',`${top}px`);
    enemy.style.setProperty('--pa-target-w',`${fr.width}px`);
    enemy.style.setProperty('--pa-target-h',`${fr.height}px`);
    enemy.style.setProperty('--pa-target-cx',`${cx}px`);
    enemy.style.setProperty('--pa-target-cy',`${cy}px`);

    // Wira final-blow ice lands around the visible torso/body centre.
    enemy.style.setProperty('--pa-finisher-x',`${cx}px`);
    enemy.style.setProperty('--pa-finisher-y',`${top+fr.height*.44}px`);

    // Bunga's root/vine asset grows from its 18% / 88% transform origin.
    // Put that origin at the target's actual ground contact.
    const bloomW=Math.max(fr.width*2.25,260);
    const bloomLeft=cx-(bloomW*.18);
    enemy.style.setProperty('--pa-bloom-w',`${bloomW}px`);
    enemy.style.setProperty('--pa-bloom-left',`${bloomLeft}px`);
    enemy.style.setProperty('--pa-bloom-bottom',`${ground-8}px`);

    return {enemy,frame,er,fr,left,top,cx,cy,ground};
  }

  function cleanupAnchoredDefeat(){
    const arena=q('#battleArena'),enemy=q('#enemy');
    arena?.querySelectorAll('.paAnchoredDefeat').forEach(x=>x.remove());
    enemy?.classList.remove('paDefeatShatter');
    qa('.enemy-frame',enemy||document).forEach(x=>x.classList.remove('paDefeatSourceCrack'));
  }

  function createAnchoredDefeat(){
    const arena=q('#battleArena'),enemy=q('#enemy');
    if(!arena||!enemy||enemy.classList.contains('paDefeatShatter'))return;

    enemy.classList.remove('defeat-crack','defeat-shatter');
    enemy.querySelectorAll('.monster-defeat-layer').forEach(x=>x.remove());
    arena.querySelectorAll('.paAnchoredDefeat').forEach(x=>x.remove());

    const anchor=syncEnemyTargetAnchor();
    const frame=anchor?.frame;
    if(!frame)return;

    const arenaRect=arena.getBoundingClientRect(),frameRect=frame.getBoundingClientRect();
    const src=frame.currentSrc||frame.getAttribute('src');
    if(!src||frameRect.width<2||frameRect.height<2)return;

    const layer=document.createElement('div');
    layer.className='paAnchoredDefeat';
    layer.setAttribute('aria-hidden','true');
    layer.style.left=`${frameRect.left-arenaRect.left}px`;
    layer.style.top=`${frameRect.top-arenaRect.top}px`;
    layer.style.width=`${frameRect.width}px`;
    layer.style.height=`${frameRect.height}px`;

    const clips=[
      'polygon(0 0,42% 0,30% 36%,0 48%)',
      'polygon(42% 0,100% 0,100% 30%,68% 38%,30% 36%)',
      'polygon(0 48%,30% 36%,46% 61%,20% 100%,0 100%)',
      'polygon(30% 36%,68% 38%,63% 70%,46% 61%)',
      'polygon(68% 38%,100% 30%,100% 69%,75% 61%,63% 70%)',
      'polygon(20% 100%,46% 61%,63% 70%,55% 100%)',
      'polygon(63% 70%,75% 61%,100% 69%,100% 100%,55% 100%)'
    ];
    const motion=[[-30,-22,-22],[-2,-38,17],[-36,8,-31],[4,-14,20],[38,-7,32],[-13,17,-19],[31,19,27]];

    clips.forEach((clip,i)=>{
      const img=document.createElement('img'),[x,y,r]=motion[i];
      img.className='paAnchoredShard';img.src=src;img.alt='';
      img.style.clipPath=clip;
      img.style.setProperty('--sx',`${x}px`);img.style.setProperty('--sy',`${y}px`);
      img.style.setProperty('--sx-mid',`${x*.45}px`);img.style.setProperty('--sy-mid',`${y*.42}px`);
      img.style.setProperty('--rot',`${r}deg`);img.style.setProperty('--rot-mid',`${r*.4}deg`);
      img.style.setProperty('--delay',`${(i%3)*12}ms`);
      layer.appendChild(img);
    });
    const dust=document.createElement('div');dust.className='paAnchoredDefeatDust';layer.appendChild(dust);
    arena.appendChild(layer);

    frame.classList.add('paDefeatSourceCrack');
    setTimeout(()=>{
      frame.classList.remove('paDefeatSourceCrack');
      enemy.classList.add('paDefeatShatter');
      layer.classList.add('active');
    },175);
  }

  // Sync before every hero->enemy impact, including normal hit and final blow.
  const originalImpact=window.triggerImpact;
  if(typeof originalImpact==='function'){
    window.triggerImpact=function(attackerId,targetId,tint,finisher){
      if(attackerId==='hero'&&targetId==='enemy')syncEnemyTargetAnchor();
      return originalImpact.apply(this,arguments);
    };
  }

  // Replace old wrapper-relative defeat implementation.
  window.triggerMonsterDefeat=createAnchoredDefeat;

  const originalApply=window.applyEnemyVariant;
  if(typeof originalApply==='function'){
    window.applyEnemyVariant=function(){
      cleanupAnchoredDefeat();
      const out=originalApply.apply(this,arguments);
      requestAnimationFrame(syncEnemyTargetAnchor);
      return out;
    };
  }

  const originalScreen=window.screen;
  if(typeof originalScreen==='function'){
    window.screen=function(id){
      if(id!=='game')cleanupAnchoredDefeat();
      const out=originalScreen.apply(this,arguments);
      if(id==='game')requestAnimationFrame(syncEnemyTargetAnchor);
      return out;
    };
  }

  window.PACombatTargetAnchor={
    version:VERSION,
    activeEnemyFrame,
    sync:syncEnemyTargetAnchor,
    cleanup:cleanupAnchoredDefeat,
    defeat:createAnchoredDefeat
  };
  document.documentElement.dataset.combatTargetAnchor=VERSION;
  const version=q('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
