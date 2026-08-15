// Pahlawan Angka v3.21.2 — combat presentation polish.
(()=>{
  'use strict';
  const VERSION='3.21.2';
  let victoryTimer=null;

  function ensureTerrainToneLayer(){
    const arena=document.getElementById('battleArena');if(!arena)return null;
    let layer=arena.querySelector(':scope > .paTerrainToneLayer');
    if(!layer){
      layer=document.createElement('div');layer.className='paTerrainToneLayer';layer.setAttribute('aria-hidden','true');
      arena.insertBefore(layer,arena.firstChild);
    }
    return layer;
  }

  function clearVictoryCelebration(){
    clearTimeout(victoryTimer);victoryTimer=null;
    const arena=document.getElementById('battleArena'),hero=document.getElementById('hero'),pet=document.getElementById('battlePet');
    arena?.classList.remove('paVictoryActive');hero?.classList.remove('paVictory');pet?.classList.remove('paPetVictory');arena?.querySelector('.paVictoryFx')?.remove();
  }
  function ensureVictoryFx(){
    const arena=document.getElementById('battleArena');if(!arena)return null;
    arena.querySelector('.paVictoryFx')?.remove();
    const fx=document.createElement('div');fx.className='paVictoryFx';fx.setAttribute('aria-hidden','true');
    fx.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';
    arena.appendChild(fx);return fx;
  }
  function startVictoryCelebration(){
    const arena=document.getElementById('battleArena'),hero=document.getElementById('hero'),pet=document.getElementById('battlePet');if(!arena||!hero)return;
    clearVictoryCelebration();ensureTerrainToneLayer();ensureVictoryFx();
    arena.classList.add('paVictoryActive');hero.classList.add('paVictory');
    if(pet&&!pet.classList.contains('hidden')&&db?.rewards?.equippedPet)pet.classList.add('paPetVictory');
    victoryTimer=setTimeout(clearVictoryCelebration,1580);
  }

  const oldTerrain=window.setBattleTerrain;
  if(typeof oldTerrain==='function')window.setBattleTerrain=function(){const out=oldTerrain.apply(this,arguments);ensureTerrainToneLayer();return out;};
  const oldApplyEnemy=window.applyEnemyVariant;
  if(typeof oldApplyEnemy==='function')window.applyEnemyVariant=function(){const out=oldApplyEnemy.apply(this,arguments);ensureTerrainToneLayer();return out;};
  const oldVictory=window.triggerBossVictory;
  if(typeof oldVictory==='function')window.triggerBossVictory=function(){const out=oldVictory.apply(this,arguments);startVictoryCelebration();return out;};
  const oldScreen=window.screen;
  if(typeof oldScreen==='function')window.screen=function(id){if(id!=='game')clearVictoryCelebration();const out=oldScreen.apply(this,arguments);if(id==='game')ensureTerrainToneLayer();return out;};

  ensureTerrainToneLayer();
  window.PACombatPolish={version:VERSION,ensureTerrainToneLayer,startVictoryCelebration,clearVictoryCelebration};
  document.documentElement.dataset.combatPolish=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
