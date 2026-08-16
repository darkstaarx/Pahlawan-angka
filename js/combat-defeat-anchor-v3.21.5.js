// Pahlawan Angka v3.21.5 — defeat shatter anchored to the actually rendered enemy frame.
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

  function cleanupAnchoredDefeat(){
    const arena=q('#battleArena'),enemy=q('#enemy');
    arena?.querySelectorAll('.paAnchoredDefeat').forEach(x=>x.remove());
    enemy?.classList.remove('paDefeatShatter');
    qa('.enemy-frame',enemy||document).forEach(x=>x.classList.remove('paDefeatSourceCrack'));
  }

  function createAnchoredDefeat(){
    const arena=q('#battleArena'),enemy=q('#enemy');
    if(!arena||!enemy||enemy.classList.contains('paDefeatShatter'))return;

    // Remove any older wrapper-relative implementation before taking the snapshot.
    enemy.classList.remove('defeat-crack','defeat-shatter');
    enemy.querySelectorAll('.monster-defeat-layer').forEach(x=>x.remove());
    arena.querySelectorAll('.paAnchoredDefeat').forEach(x=>x.remove());

    const frame=activeEnemyFrame(enemy);
    if(!frame)return;

    const arenaRect=arena.getBoundingClientRect();
    const frameRect=frame.getBoundingClientRect();
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
      const img=document.createElement('img');
      const [x,y,r]=motion[i];
      img.className='paAnchoredShard';
      img.src=src; img.alt='';
      img.style.clipPath=clip;
      img.style.setProperty('--sx',`${x}px`);
      img.style.setProperty('--sy',`${y}px`);
      img.style.setProperty('--sx-mid',`${x*.45}px`);
      img.style.setProperty('--sy-mid',`${y*.42}px`);
      img.style.setProperty('--rot',`${r}deg`);
      img.style.setProperty('--rot-mid',`${r*.4}deg`);
      img.style.setProperty('--delay',`${(i%3)*12}ms`);
      layer.appendChild(img);
    });

    const dust=document.createElement('div');
    dust.className='paAnchoredDefeatDust';
    layer.appendChild(dust);
    arena.appendChild(layer);

    // Flash the exact frame in place; do not animate transform/position.
    frame.classList.add('paDefeatSourceCrack');

    setTimeout(()=>{
      frame.classList.remove('paDefeatSourceCrack');
      enemy.classList.add('paDefeatShatter');
      layer.classList.add('active');
    },175);
  }

  // Replace the old wrapper-relative shatter implementation globally.
  window.triggerMonsterDefeat=createAnchoredDefeat;

  // New enemy/boss must always start clean.
  const originalApply=window.applyEnemyVariant;
  if(typeof originalApply==='function'){
    window.applyEnemyVariant=function(){
      cleanupAnchoredDefeat();
      return originalApply.apply(this,arguments);
    };
  }

  const originalScreen=window.screen;
  if(typeof originalScreen==='function'){
    window.screen=function(id){
      if(id!=='game')cleanupAnchoredDefeat();
      return originalScreen.apply(this,arguments);
    };
  }

  window.PADefeatAnchor={
    version:VERSION,
    activeEnemyFrame,
    cleanup:cleanupAnchoredDefeat,
    trigger:createAnchoredDefeat
  };
  document.documentElement.dataset.defeatAnchor=VERSION;
  const version=q('.loginVersion');
  if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
