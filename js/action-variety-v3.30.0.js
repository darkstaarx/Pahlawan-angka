/* Three controlled regular-attack presentations per hero. Pet combo and finishers are excluded. */
(function(){
  const variants={
    wira:[{id:'dash',label:'Tebasan Nilai'},{id:'arc',label:'Lengkung Nombor'},{id:'pulse',label:'Gelombang Operasi'}],
    bunga:[{id:'sweep',label:'Sapuan Flora'},{id:'spiral',label:'Pusaran Pecahan'},{id:'thorn',label:'Tusukan Mekar'}]
  };
  let last={wira:-1,bunga:-1};
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
    const fx=document.createElement('span');fx.className='paAttackFx';fx.setAttribute('aria-hidden','true');el.appendChild(fx);
    const arena=document.getElementById('battleArena');if(arena){arena.dataset.heroAttack=chosen.id;arena.dataset.heroKind=hero}
  };
  window.clearHeroAttackVariant=function(el){
    if(!el)return;
    [...el.classList].filter(x=>x==='pa-attack-variant'||x.startsWith('pa-attack-')).forEach(x=>el.classList.remove(x));
    el.querySelectorAll('.paAttackFx').forEach(x=>x.remove());
    delete el.dataset.attackVariant;
    const arena=document.getElementById('battleArena');if(arena){delete arena.dataset.heroAttack;delete arena.dataset.heroKind}
  };
  window.PAActionVariety={variants};
})();
