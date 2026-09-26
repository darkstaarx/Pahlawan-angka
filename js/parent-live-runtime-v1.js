// Parent dashboard compatibility bridge. The legacy shell can retain an older
// parent.js in browser cache, so keep the live HTML usable while the source
// bundle rolls forward. Fresh builds still use the full parent.js renderer.
(function(){
  'use strict';
  const parentTabs=['summary','core','levels','engine','restu','settings'];

  function renderFallbackRestu(){
    const restu=document.getElementById('restuTab');
    if(!restu||restu.innerHTML.trim())return;
    const name=String(window.db?.name||'anak').replace(/[&<>"']/g,'');
    restu.innerHTML=`<section class="card restuParentHero"><div class="restuParentIcon" aria-hidden="true">🤝</div><div><div class="eyebrow">RESTU IBU BAPA</div><h2>Sokongan kecil, bukan tugasan tambahan</h2><p>Luangkan kira-kira dua minit untuk dengar cara ${name} berfikir. Tak perlu semak setiap sesi.</p></div></section><section class="card restuCheckinCard"><div class="eyebrow">CHECK-IN 2 MINIT</div><h3>Satu soalan untuk dibualkan</h3><p class="restuPrompt">“Apa yang paling mudah atau menarik dalam misi hari ini?”</p><p class="restuPromptHint">Dengar cara anak menerangkan. Tak perlu beri jawapan terus — cukup tunjukkan bahawa usaha mereka diperhatikan.</p></section><section class="card restuFocusCard"><div><div class="eyebrow">FOKUS ANAK SEKARANG</div><h3>Latihan ikut bukti</h3><p>Cikgu Dimensi akan teruskan latihan pendek dan beri ruang untuk anak mencuba sendiri.</p></div></section>`;
  }

  function patchParentSurface(){
    const hero=document.querySelector('#summaryTab .parentJourney');
    if(hero){
      const eyebrow=hero.querySelector('.eyebrow');
      if(eyebrow)eyebrow.textContent=eyebrow.textContent.replace(/^RINGKASAN[^·]*·/,'DEK IBU BAPA ·');
      const copy=hero.querySelector('.parentJourneyCopy');
      if(copy&&!copy.querySelector('.parentJourneySignal'))copy.insertAdjacentHTML('beforeend','<div class="parentJourneySignal"><span>✦</span><small>Cikgu Dimensi membaca corak jawapan, bukan sekadar markah.</small></div>');
    }
    const heroImage=document.querySelector('#summaryTab .parentJourney > img');
    if(heroImage){heroImage.src='assets/coach/cikgu-dimensi/parent-adviser-v2.png';heroImage.alt='Cikgu Dimensi menerangkan kemajuan anak'}
    const coach=document.querySelector('#summaryTab .coachAction img');
    if(coach){coach.src='assets/coach/cikgu-dimensi/hub-portrait-v1.webp';coach.alt='Cikgu Dimensi'}
    renderFallbackRestu();
  }

  function installTabBridge(){
    window.tab=function(name){
      parentTabs.forEach(id=>document.getElementById(id+'Tab')?.classList.toggle('hidden',id!==name));
      document.querySelectorAll('#parent .tabs button[data-parent-tab]').forEach(button=>button.classList.toggle('active',button.dataset.parentTab===name));
      patchParentSurface();
    };
  }

  function boot(){
    installTabBridge();
    patchParentSurface();
    if(new URLSearchParams(location.search).has('restu-preview')){
      window.screen?.('parent');
      window.tab?.('restu');
      setTimeout(()=>{patchParentSurface();window.tab?.('restu')},180);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,40),{once:true});
  else setTimeout(boot,40);
})();
