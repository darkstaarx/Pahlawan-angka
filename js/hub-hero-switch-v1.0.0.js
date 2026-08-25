/* Main Hub hero-switch control — lets the player change db.hero directly
   from the hub without going through profile creation/edit. Uses the
   existing HEROES registry and db.hero/save() persistence model only;
   no new persistence or database layer. */
(function(){
  const ORDER=['wira','bunga','sidma'];

  function heroLabel(id){
    const h=(typeof HEROES!=='undefined'&&HEROES[id])||{};
    return h.name||id;
  }

  function closeSwitcher(){
    const overlay=document.getElementById('paHeroSwitchOverlay');
    if(overlay){overlay.classList.remove('show');setTimeout(()=>overlay.remove(),180)}
  }

  function pickHero(id){
    if(typeof db==='undefined'||!db)return;
    if(!(typeof HEROES!=='undefined'&&HEROES[id]))return;
    if(db.hero===id){closeSwitcher();return}
    db.hero=id;
    if(typeof save==='function')save();
    closeSwitcher();
    if(typeof renderHub==='function')renderHub();
    if(typeof playSfx==='function')playSfx('ui');
  }
  window.paSwitchHero=pickHero;
  window.paCloseHeroSwitch=closeSwitcher;

  function openSwitcher(){
    if(typeof db==='undefined'||!db||typeof HEROES==='undefined')return;
    let overlay=document.getElementById('paHeroSwitchOverlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='paHeroSwitchOverlay';
      overlay.className='paHeroSwitchOverlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-labelledby','paHeroSwitchTitle');
      document.body.appendChild(overlay);
    }
    const current=db.hero||'wira';
    const cards=ORDER.filter(id=>HEROES[id]).map(id=>{
      const h=HEROES[id],active=id===current;
      return `<button type="button" class="paHeroSwitchCard${active?' active':''}" onclick="paSwitchHero('${id}')" aria-pressed="${active?'true':'false'}">
        <span class="paHeroSwitchImg"><img src="${h.idle}" alt="${h.name}"></span>
        <span class="paHeroSwitchName">${h.name}</span>
        <span class="paHeroSwitchTag">${active?'✓ Sedang digunakan':'Pilih'}</span>
      </button>`;
    }).join('');
    overlay.innerHTML=`<div class="paHeroSwitchPanel">
      <button type="button" class="paHeroSwitchClose" onclick="paCloseHeroSwitch()" aria-label="Tutup">×</button>
      <small>TUKAR WIRA</small>
      <h2 id="paHeroSwitchTitle">Pilih pahlawan untuk battle seterusnya</h2>
      <div class="paHeroSwitchGrid">${cards}</div>
    </div>`;
    requestAnimationFrame(()=>overlay.classList.add('show'));
  }
  window.paOpenHeroSwitch=openSwitcher;

  function installHubHeroSwitchButton(){
    const info=document.querySelector('#hub .hubProfileInfo');
    if(!info||info.querySelector('.paHeroSwitchBtn'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='paHeroSwitchBtn';
    btn.textContent='⇄ Tukar Wira';
    btn.setAttribute('aria-label','Tukar pahlawan');
    btn.onclick=openSwitcher;
    info.appendChild(btn);
  }

  const originalRenderHub=window.renderHub;
  if(typeof originalRenderHub==='function'){
    window.renderHub=function(){
      const out=originalRenderHub.apply(this,arguments);
      installHubHeroSwitchButton();
      return out;
    };
  }
})();
