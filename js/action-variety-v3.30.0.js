/* Controlled regular-attack presentations. Pet combo and finishers are excluded. */
(function(){
  const variants={
    wira:[
      {id:'original',label:'Tebasan Ais Asal',asset:'assets/heroes/wira/attack.webp',bodyScale:1.48,footShiftX:28},
      {id:'dash',label:'Tikaman Pantas',asset:'assets/heroes/wira/frames/attack-dash-v2.webp',bodyScale:1.48,footShiftX:38},
      {id:'arc',label:'Lengkung Nombor',asset:'assets/heroes/wira/frames/attack-arc-v2.webp',bodyScale:1.42,footShiftX:28},
      {id:'pulse',label:'Gelombang Operasi',asset:'assets/heroes/wira/frames/attack-pulse-v2.webp',bodyScale:1.72,footShiftX:40}
    ],
    bunga:[
      {id:'addition',label:'Cantuman Ros',asset:'assets/heroes/bunga/frames/attack-addition-v4.webp',bodyScale:1.55,footShiftX:0},
      {id:'subtraction',label:'Susutan Kelopak',asset:'assets/heroes/bunga/frames/attack-subtraction-v4.webp',bodyScale:1.55,footShiftX:0},
      {id:'division',label:'Belahan Orkid',asset:'assets/heroes/bunga/frames/attack-division-v4.webp',bodyScale:1.55,footShiftX:0}
    ]
  };
  /* Decode attack artwork before the first battle so stance never cuts to an
     empty contact frame on mobile browsers. Retain references for the session. */
  const preloadedFrames=Object.values(variants).flat().map(({asset})=>{
    const image=new Image();image.decoding='async';image.src=asset;return image;
  });
  let last={wira:-1,bunga:-1};
  function strikeFrame(){
    let frame=document.getElementById('heroStrike');
    if(frame)return frame;
    const movement=document.getElementById('heroAttack'),sprite=document.getElementById('heroVisual');
    if(!movement||!sprite)return null;
    frame=document.createElement('img');frame.id='heroStrike';frame.className='hero-frame hero-frame-strike';frame.alt='';
    movement.insertAdjacentElement('afterend',frame);return frame;
  }
  function pick(hero){
    const pool=variants[hero]||variants.wira;
    let next=(last[hero]+1+Math.floor(Math.random()*(pool.length-1)))%pool.length;
    if(next===last[hero])next=(next+1)%pool.length;
    last[hero]=next;return pool[next];
  }
  window.prepareHeroAttackVariant=function(el,finisher){
    window.clearHeroAttackVariant(el);if(finisher)return;
    const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira',chosen=pick(hero);
    el.classList.add('pa-attack-variant','pa-attack-'+chosen.id);el.dataset.attackVariant=chosen.id;
    const strike=strikeFrame();if(strike){strike.src=chosen.asset;strike.alt=chosen.label}
    el.style.setProperty('--pa-contact-scale',String(chosen.bodyScale));
    el.style.setProperty('--pa-contact-shift-x',chosen.footShiftX+'px');
    const arena=document.getElementById('battleArena');if(arena){arena.dataset.heroAttack=chosen.id;arena.dataset.heroKind=hero}
  };
  window.clearHeroAttackVariant=function(el){
    if(!el)return;
    [...el.classList].filter(x=>x==='pa-attack-variant'||x.startsWith('pa-attack-')).forEach(x=>el.classList.remove(x));
    delete el.dataset.attackVariant;
    el.style.removeProperty('--pa-contact-scale');el.style.removeProperty('--pa-contact-shift-x');
    const arena=document.getElementById('battleArena');if(arena){delete arena.dataset.heroAttack;delete arena.dataset.heroKind}
  };
  function ensureAttackLab(){
    const grid=document.querySelector('.devRewardGrid'),panel=document.getElementById('devPanel');if(!grid||!panel||document.getElementById('devAttackLabBtn'))return;
    const button=document.createElement('button');button.id='devAttackLabBtn';button.className='btn ghost small';button.textContent='🎞 Attack Lab';button.onclick=window.openAttackLab;grid.appendChild(button);
  }
  function labMarkup(){
    return '<div class="paAttackLabShade"></div><section class="paAttackLabPanel"><div class="paAttackLabHead"><div><small>DEV · FRAME INSPECTOR</small><h2>Attack Lab</h2></div><button type="button" onclick="closeAttackLab()" aria-label="Tutup">×</button></div><div class="paAttackLabControls"><button data-lab-hero="wira" onclick="attackLabHero(\'wira\')">Wira</button><button data-lab-hero="bunga" onclick="attackLabHero(\'bunga\')">Bunga</button><select id="paAttackLabVariant" onchange="attackLabVariant(this.value)"></select></div><div class="paAttackLabStage"><div class="paAttackLabGround"></div><img id="paAttackLabFrame" alt=""></div><div class="paAttackLabSteps"><button onclick="attackLabStep(\'stance\')"><b>1</b><span>Attack stance</span></button><button data-lab-step="movement" onclick="attackLabStep(\'movement\')"><b>2</b><span>Movement</span></button><button onclick="attackLabStep(\'strike\')"><b>3</b><span>Actual attack</span></button></div><button class="btn primary paAttackLabPlay" onclick="playAttackLab()">▶ Main sequence penuh</button><p id="paAttackLabStatus">Pilih frame untuk diperiksa.</p></section>';
  }
  const lab={hero:'wira',variant:'original',timer:[]};
  function labItem(){return (variants[lab.hero]||variants.wira).find(x=>x.id===lab.variant)||(variants[lab.hero]||variants.wira)[0]}
  function clearTimers(){lab.timer.forEach(clearTimeout);lab.timer=[]}
  function renderLabControls(){
    document.querySelectorAll('[data-lab-hero]').forEach(x=>x.classList.toggle('active',x.dataset.labHero===lab.hero));
    const select=document.getElementById('paAttackLabVariant');if(select){select.innerHTML=variants[lab.hero].map(x=>'<option value="'+x.id+'">'+x.label+'</option>').join('');select.value=lab.variant}
    document.getElementById('paAttackLab')?.classList.toggle('bunga-two-phase',lab.hero==='bunga');
  }
  window.openAttackLab=function(){
    if(typeof isDevMode==='function'&&!isDevMode())return;
    let overlay=document.getElementById('paAttackLab');if(!overlay){overlay=document.createElement('div');overlay.id='paAttackLab';overlay.className='paAttackLab';overlay.innerHTML=labMarkup();document.body.appendChild(overlay)}
    overlay.classList.add('show');renderLabControls();window.attackLabStep('stance');
  };
  window.closeAttackLab=function(){clearTimers();document.getElementById('paAttackLab')?.classList.remove('show')};
  window.attackLabHero=function(hero){lab.hero=hero;lab.variant=variants[hero][0].id;renderLabControls();window.attackLabStep('stance')};
  window.attackLabVariant=function(id){lab.variant=id;window.attackLabStep('strike')};
  window.attackLabStep=function(step){
    clearTimers();if(lab.hero==='bunga'&&step==='movement')step='strike';const h=typeof HEROES!=='undefined'?(HEROES[lab.hero]||HEROES.wira):null,item=labItem(),img=document.getElementById('paAttackLabFrame'),status=document.getElementById('paAttackLabStatus');if(!h||!img)return;
    const source=step==='stance'?h.anticipation:step==='movement'?h.followThrough:item.asset;
    img.src=source;img.dataset.step=step;img.dataset.hero=lab.hero;
    img.style.setProperty('--pa-lab-contact-scale',step==='strike'?String(item.bodyScale):'1');
    if(status)status.textContent=step==='stance'?'1 · Bersedia dan mengambil ancang-ancang':step==='movement'?'2 · Bergerak menuju sasaran':'3 · '+item.label+' mengenai sasaran';
  };
  window.playAttackLab=function(){
    clearTimers();window.attackLabStep('stance');
    if(lab.hero==='bunga'){
      lab.timer.push(setTimeout(()=>window.attackLabStep('strike'),650));
      lab.timer.push(setTimeout(()=>window.attackLabStep('stance'),1450));
      return;
    }
    lab.timer.push(setTimeout(()=>window.attackLabStep('movement'),650));
    lab.timer.push(setTimeout(()=>window.attackLabStep('strike'),1050));
    lab.timer.push(setTimeout(()=>window.attackLabStep('stance'),1850));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureAttackLab,{once:true});else ensureAttackLab();
  window.PAActionVariety={variants,strikeFrame,preloadedFrames};
})();
