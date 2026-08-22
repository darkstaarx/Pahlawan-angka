/* Three controlled regular-attack presentations per hero. Pet combo and finishers are excluded. */
(function(){
  const variants={
    wira:[
      {id:'dash',label:'Tebasan Nilai',asset:'assets/heroes/wira/frames/attack-dash-v2.webp'},
      {id:'arc',label:'Lengkung Nombor',asset:'assets/heroes/wira/frames/attack-arc-v2.webp'},
      {id:'pulse',label:'Gelombang Operasi',asset:'assets/heroes/wira/frames/attack-pulse-v2.webp'}
    ],
    bunga:[
      {id:'sweep',label:'Sapuan Flora',asset:'assets/heroes/bunga/frames/attack-sweep-v2.webp'},
      {id:'spiral',label:'Pusaran Pecahan',asset:'assets/heroes/bunga/frames/attack-spiral-v2.webp'},
      {id:'thorn',label:'Tusukan Mekar',asset:'assets/heroes/bunga/frames/attack-thorn-v2.webp'}
    ]
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
    const attack=document.getElementById('heroAttack');if(attack)attack.src=chosen.asset;
    const arena=document.getElementById('battleArena');if(arena){arena.dataset.heroAttack=chosen.id;arena.dataset.heroKind=hero}
  };
  window.clearHeroAttackVariant=function(el){
    if(!el)return;
    [...el.classList].filter(x=>x==='pa-attack-variant'||x.startsWith('pa-attack-')).forEach(x=>el.classList.remove(x));
    delete el.dataset.attackVariant;
    const hero=(typeof db!=='undefined'&&db&&db.hero)||'wira',attack=document.getElementById('heroAttack');
    if(attack&&typeof HEROES!=='undefined')attack.src=(HEROES[hero]||HEROES.wira).attack;
    const arena=document.getElementById('battleArena');if(arena){delete arena.dataset.heroAttack;delete arena.dataset.heroKind}
  };
  window.PAActionVariety={variants};
})();
