const HEROES={
 wira:{name:'Wira',theme:'ice',idle:'assets/heroes/wira/idle.webp',hub:'assets/heroes/wira/hub/adventure-v1.webp',hubFx:'assets/fx/hub/wira-math-runes-v1.webp',anticipation:'assets/heroes/wira/frames/anticipation-v1.webp',auraFraming:'assets/heroes/wira/frames/aura-framing-v1.webp',attack:'assets/heroes/wira/attack.webp',followThrough:'assets/heroes/wira/frames/follow-through-v1.webp',finisher:'assets/fx/wira/finisher.webp'},
 wirachibi:{name:'Wira Chibi',theme:'ice',idle:'assets/heroes/wira-chibi/idle.webp',hub:'assets/heroes/wira-chibi/idle.webp',hubFx:'assets/fx/hub/wira-math-runes-v1.webp',profile:'assets/heroes/wira-chibi/idle.webp',anticipation:'assets/heroes/wira-chibi/frames/anticipation-v1.webp',auraFraming:'assets/heroes/wira-chibi/frames/aura-framing-v1.webp',attack:'assets/heroes/wira-chibi/attack.webp',followThrough:'assets/heroes/wira-chibi/frames/follow-through-v1.webp',finisher:'assets/fx/wira/finisher.webp'},
 bunga:{name:'Bunga',theme:'bloom',idle:'assets/heroes/bunga/redesign-v1/runtime/idle-master-v1.webp',hub:'assets/heroes/bunga/redesign-v1/runtime/idle-master-v1.webp',hubFx:'assets/fx/hub/bunga-fraction-bloom-v1.webp',profile:'assets/heroes/bunga/redesign-v1/runtime/profile-happy-v1.webp',anticipation:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/quick-ready-v1.webp',auraFraming:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/focus-eyes-closed-v1.webp',finisherFocus:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/focus-eyes-closed-v1.webp',attack:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/release-v1.webp',followThrough:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/recovery-v1.webp',finisher:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-enemy-bloom-v1.webp',
  frames:{idleBreathe:'assets/heroes/bunga/redesign-v1/runtime/idle-breathe-v1.webp',skill1Ready:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/quick-ready-v1.webp',skill1Aim:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/staff-aim-v1.webp',skill1Release:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/release-v1.webp',skill2Cast:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/cast-start-v1.webp',skill2Charge:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/levitate-charge-v1.webp',skill2Release:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/remote-release-v1.webp',recovery:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/recovery-v1.webp',hurt:'assets/heroes/bunga/redesign-v1/runtime/states/hurt-v1.webp',defeat:'assets/heroes/bunga/redesign-v1/runtime/states/defeat-v1.webp'},
  fx:{skill1Projectile:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/fx-projectile-v1.webp',skill1Impact:'assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/fx-impact-v1.webp',skill2Arc:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/fx-charge-arc-v1.webp',skill2Impact:'assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/fx-enemy-impact-v1.webp',finalAura:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-charge-aura-v1.webp',finalBloom:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-enemy-bloom-v1.webp',finalImpact:'assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-impact-end-v1.webp'}},
 sidma:{name:'Sidma',theme:'sigma',idle:'assets/heroes/sidma/idle.webp',hub:'assets/heroes/sidma/hub/adventure-v1.webp',hubFx:'assets/fx/hub/sidma-math-sigma-v1.webp',profile:'assets/heroes/sidma/profile-happy-v1.webp',anticipation:'assets/heroes/sidma/frames/attack-stance-v1.webp',auraFraming:'assets/heroes/sidma/frames/cast-start-v1.webp',finisherFocus:'assets/heroes/sidma/frames/finisher-focus-eyes-closed-v1.webp',attack:'assets/heroes/sidma/frames/release-v1.webp',followThrough:'assets/heroes/sidma/frames/recovery-v1.webp',finisher:'assets/fx/sidma/rumus-sigma/fx_sigma_impact.webp',
  frames:{attackStance:'assets/heroes/sidma/frames/attack-stance-v1.webp',castStart:'assets/heroes/sidma/frames/cast-start-v1.webp',release:'assets/heroes/sidma/frames/release-v1.webp',recovery:'assets/heroes/sidma/frames/recovery-v1.webp',skill2Dash:'assets/heroes/sidma/frames/skill2-dash-v1.webp',skill2Impact:'assets/heroes/sidma/frames/skill2-impact-v1.webp'},
  fx:{charge:'assets/fx/sidma/rumus-sigma/fx_sidma_charge.webp',projectile:'assets/fx/sidma/rumus-sigma/fx_sigma_projectile.webp',impact:'assets/fx/sidma/rumus-sigma/fx_sigma_impact.webp',impactEnd:'assets/fx/sidma/rumus-sigma/fx_sigma_impact_end.webp'}}
};

/* Wira Chibi is an art variant of Wira: same battle timing, CSS motion,
   ice theme and finisher. Only the mapped pose assets differ. */
(function installWiraChibi(){
  const ID='wirachibi';
  const install=()=>{
    if(window.PAActionVariety?.variants){
      window.PAActionVariety.variants[ID]=[
        {id:'original',label:'Tebasan Ais Chibi',asset:'assets/heroes/wira-chibi/attack.webp',bodyScale:1.48,footShiftX:28},
        {id:'dash',label:'Tikaman Pantas',asset:'assets/heroes/wira-chibi/frames/attack-dash-v2.webp',bodyScale:1.48,footShiftX:38},
        {id:'arc',label:'Lengkung Nombor',asset:'assets/heroes/wira-chibi/frames/attack-arc-v2.webp',bodyScale:1.42,footShiftX:28},
        {id:'pulse',label:'Gelombang Operasi',asset:'assets/heroes/wira-chibi/frames/attack-pulse-v2.webp',bodyScale:1.72,footShiftX:40}
      ];
      window.PAActionVariety.variants[ID].forEach(({asset})=>{const img=new Image();img.decoding='async';img.src=asset});
    }

    const grid=document.querySelector('#setup .heroGrid');
    if(grid&&!document.getElementById('pick-wirachibi')){
      const wira=document.getElementById('pick-wira');
      const button=document.createElement('button');
      button.className='heroPick';button.id='pick-wirachibi';button.type='button';button.setAttribute('aria-pressed','false');
      button.onclick=()=>window.chooseHero?.(ID);
      button.innerHTML=`<img id="pickImgWiraChibi" src="${HEROES[ID].idle}" alt="Wira Chibi"><div class="heroMeta"><b>Wira Chibi</b><span>Kuasa Ais</span><em class="heroSelected"><span aria-hidden="true">✓</span> Dipilih</em></div>`;
      if(wira?.nextSibling)grid.insertBefore(button,wira.nextSibling);else grid.appendChild(button);
      if(typeof db!=='undefined'&&db?.hero===ID&&typeof chooseHero==='function')chooseHero(ID);
    }

    const openSwitcher=()=>{
      if(typeof db==='undefined'||!db)return;
      let overlay=document.getElementById('paHeroSwitchOverlay');
      if(!overlay){overlay=document.createElement('div');overlay.id='paHeroSwitchOverlay';overlay.className='paHeroSwitchOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','paHeroSwitchTitle');document.body.appendChild(overlay)}
      const current=db.hero||'wira';
      const art={wira:'assets/heroes/switch-cards/wira-v1.webp',wirachibi:HEROES.wirachibi.idle,bunga:'assets/heroes/switch-cards/bunga-v1.webp',sidma:'assets/heroes/switch-cards/sidma-v1.webp'};
      const cards=['wira','wirachibi','bunga','sidma'].filter(id=>HEROES[id]).map(id=>{const h=HEROES[id],active=id===current;return `<button type="button" class="paHeroSwitchCard${active?' active':''}" onclick="paSwitchHero('${id}')" aria-pressed="${active?'true':'false'}"><span class="paHeroSwitchImg"><img src="${art[id]||h.idle}" alt="${h.name}"></span><span class="paHeroSwitchName">${h.name}</span><span class="paHeroSwitchTag">${active?'✓ Sedang digunakan':'Pilih'}</span></button>`}).join('');
      overlay.innerHTML=`<div class="paHeroSwitchPanel"><button type="button" class="paHeroSwitchClose" onclick="paCloseHeroSwitch()" aria-label="Tutup">×</button><small>TUKAR PAHLAWAN</small><h2 id="paHeroSwitchTitle">Pilih pahlawan untuk battle seterusnya</h2><div class="paHeroSwitchGrid">${cards}</div></div>`;
      requestAnimationFrame(()=>overlay.classList.add('show'));
    };
    window.paOpenHeroSwitch=openSwitcher;
    const patchHubButton=()=>{const btn=document.querySelector('.paHeroSwitchBtn');if(btn)btn.onclick=openSwitcher};
    patchHubButton();
    const currentRenderHub=window.renderHub;
    if(typeof currentRenderHub==='function'&&!currentRenderHub.__wiraChibiWrapped){
      const wrapped=function(){const out=currentRenderHub.apply(this,arguments);patchHubButton();return out};
      wrapped.__wiraChibiWrapped=true;window.renderHub=wrapped;
    }
  };
  if(typeof document==='undefined')return;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
