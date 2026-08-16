// Pahlawan Angka v3.21.3 — combat polish without placeholder victory motion.
(()=>{
  'use strict';
  const VERSION='3.21.3';

  function ensureTerrainToneLayer(){
    const arena=document.getElementById('battleArena');if(!arena)return null;
    let layer=arena.querySelector(':scope > .paTerrainToneLayer');
    if(!layer){
      layer=document.createElement('div');layer.className='paTerrainToneLayer';layer.setAttribute('aria-hidden','true');
      arena.insertBefore(layer,arena.firstChild);
    }
    return layer;
  }

  // v3.21.2 briefly used CSS-only idle-art motion as a victory placeholder.
  // Product rule now requires real frame assets, so clear any stale classes/FX
  // without creating a replacement animation.
  function purgeLegacyVictoryState(){
    const arena=document.getElementById('battleArena'),hero=document.getElementById('hero'),pet=document.getElementById('battlePet');
    arena?.classList.remove('paVictoryActive');
    hero?.classList.remove('paVictory');
    pet?.classList.remove('paPetVictory');
    arena?.querySelector('.paVictoryFx')?.remove();
  }

  const oldTerrain=window.setBattleTerrain;
  if(typeof oldTerrain==='function')window.setBattleTerrain=function(){const out=oldTerrain.apply(this,arguments);ensureTerrainToneLayer();return out;};
  const oldApplyEnemy=window.applyEnemyVariant;
  if(typeof oldApplyEnemy==='function')window.applyEnemyVariant=function(){const out=oldApplyEnemy.apply(this,arguments);ensureTerrainToneLayer();return out;};

  // Defensive wrapper for tabs that hot-reload from v3.21.2: if the older
  // wrapper is still in memory, let normal boss-victory logic run, then strip
  // its placeholder CSS celebration immediately.
  const oldBossVictory=window.triggerBossVictory;
  if(typeof oldBossVictory==='function')window.triggerBossVictory=function(){const out=oldBossVictory.apply(this,arguments);purgeLegacyVictoryState();return out;};

  const oldScreen=window.screen;
  if(typeof oldScreen==='function')window.screen=function(id){const out=oldScreen.apply(this,arguments);purgeLegacyVictoryState();if(id==='game')ensureTerrainToneLayer();return out;};

  purgeLegacyVictoryState();
  ensureTerrainToneLayer();
  window.PACombatPolish={version:VERSION,ensureTerrainToneLayer,purgeLegacyVictoryState,victoryAssetStatus:'pending-real-frames'};
  document.documentElement.dataset.combatPolish=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
