/* Teman discovery reveal: presentation only. PetCollection remains the
   authority that decides whether a real Gembok completion tamed a Teman. */
(() => {
  'use strict';
  let timers=[];let queuedNewPet=null;let evolutionAudio=null;
  const stopMusic=()=>{if(evolutionAudio){evolutionAudio.pause();evolutionAudio.currentTime=0;}};
  const $=id=>document.getElementById(id);
  const later=(fn,ms)=>timers.push(window.setTimeout(fn,ms));
  const clearTimers=()=>{timers.forEach(window.clearTimeout);timers=[];};
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));

  function ensure(){
    let root=$('temanReveal');
    if(root)return root;
    root=document.createElement('section');
    root.id='temanReveal';root.className='temanReveal';root.hidden=true;
    root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','temanRevealTitle');
    root.innerHTML=`<div class="temanRevealBackdrop"></div><div class="temanRevealCard">
      <p class="temanRevealEyebrow">KHAZANAH PAHLAWAN ANGKA</p>
      <h2 id="temanRevealTitle">Siapakah Teman Ini?</h2>
      <div class="temanRevealStage" aria-live="polite">
        <div class="temanRevealSeal" aria-hidden="true"><i>+</i><i>−</i><i>×</i><i>÷</i><b>?</b></div>
        <img class="temanRevealArt temanRevealSilhouette" alt="Siluet Teman baharu">
        <div class="temanRevealStars" aria-hidden="true"><img src="assets/ui/victory-result/star-earned.png" alt=""><img src="assets/ui/victory-result/star-earned.png" alt=""><img src="assets/ui/victory-result/star-earned.png" alt=""><img src="assets/ui/victory-result/star-earned.png" alt=""><img src="assets/ui/victory-result/star-earned.png" alt=""></div>
        <div class="temanRevealHappySprite" role="img" hidden></div><img class="temanRevealArt temanRevealHappy" alt="">
        <span class="temanRevealBurst" aria-hidden="true"></span><span class="temanEvolutionStageLabel" hidden>BENTUK ASAS</span>
      </div>
      <div class="temanRevealCopy"><p class="temanRevealFound">TEMAN BAHARU DITEMUI!</p><h3 class="temanRevealName"></h3><p class="temanRevealRarity"></p></div>
      <div class="temanRevealCollection" aria-label="Kad masuk ke Khazanah">
        <span class="temanRevealTrail">Khazanah</span><div class="temanRevealGrid"><i></i><i></i><i class="temanRevealNewSlot"><img alt=""></i><i></i><i></i><i></i></div>
      </div>
      <div class="temanRevealActions"><button class="btn ghost small" type="button" data-teman-action="rename">Namakan Teman</button><button class="btn ghost small" type="button" data-teman-action="continue">Teruskan Misi</button><button class="btn primary small" type="button" data-teman-action="treasure">Lihat Khazanah</button></div>
    </div>`;
    document.body.appendChild(root);
    root.querySelector('[data-teman-action="continue"]').onclick=()=>{
      const next=queuedNewPet;queuedNewPet=null;close();
      if(next)later(()=>show(next),300);
    };
    root.querySelector('[data-teman-action="rename"]').onclick=()=>{
      const current=root.dataset.petName||'';
      const next=window.prompt('Nama untuk teman baharu:',current);
      if(next===null||!window.PetCollection?.rename?.(db,root.dataset.petId,next))return;
      const item=itemFor({petId:root.dataset.petId});
      root.dataset.petName=item?.name||next.trim();
      root.querySelector('.temanRevealName').textContent=root.dataset.petName;
    };
    root.querySelector('[data-teman-action="treasure"]').onclick=()=>{
      queuedNewPet=null;close();window.openTreasure?.();window.treasureTab?.('pets');
    };
    return root;
  }

  function itemFor(award){
    const data=typeof db==='undefined'?null:db;
    const all=window.PetCollection?.snapshot?.(data)?.pets||[];
    return all.find(item=>item.id===award?.petId)||null;
  }

  function show(award,{preview=false}={}){
    if(typeof document==='undefined')return false;
    const item=itemFor(award);if(!item?.assets?.happy)return false;
    const root=ensure(),art=item.assets.happy,name=esc(item.name||'Teman Baharu'),rarity=esc(item.rarity||'Istimewa');
    root.dataset.petId=String(item.id);root.dataset.petName=String(item.name||'Teman Baharu');
    clearTimers();stopMusic();queuedNewPet=null;root.setAttribute('aria-labelledby','temanRevealTitle');root.hidden=false;root.className='temanReveal';
    root.querySelector('#temanRevealTitle').textContent='Siapakah Teman Ini?';
    root.querySelector('.temanRevealFound').textContent='TEMAN BAHARU DITEMUI!';
    root.querySelector('.temanRevealCollection').hidden=false;
    root.querySelector('.temanEvolutionStageLabel').hidden=true;
    root.querySelector('[data-teman-action="rename"]').hidden=false;
    root.querySelector('[data-teman-action="continue"]').textContent='Teruskan Misi';
    root.querySelector('.temanRevealEyebrow').textContent=preview?'PRATONTON DEV · KHAZANAH':'KHAZANAH PAHLAWAN ANGKA';
    root.querySelector('.temanRevealName').innerHTML=name;
    root.querySelector('.temanRevealRarity').textContent=`Kejarangan · ${rarity}`;
    root.querySelector('.temanRevealSilhouette').src=art;
    const happy=root.querySelector('.temanRevealHappy'),sprite=root.querySelector('.temanRevealHappySprite'),label=item.name||'Teman baharu';
    if(item.assets.happySprite){sprite.style.backgroundImage=`url("${item.assets.happySprite}")`;sprite.setAttribute('aria-label',label);sprite.hidden=false;happy.hidden=true;}
    else{happy.src=art;happy.alt=label;happy.hidden=false;sprite.hidden=true;sprite.style.backgroundImage='';}
    const gridArt=root.querySelector('.temanRevealNewSlot img');gridArt.src=art;gridArt.alt=item.name||'Kad Teman baharu';
    void root.offsetWidth;root.classList.add('isOpen');
    later(()=>root.classList.add('isRevealed'),680);
    later(()=>root.classList.add('isCollected'),1550);
    later(()=>root.classList.add('isReady'),2100);
    return true;
  }


  // Cosmetic playback only; progression and ownership remain in PetCollection.
  function showEvolution(award,{profile=null,followup=null,petId=null,preview=false}={}){
    if(!award?.evolvedPetName||!profile)return false;
    const id=petId||profile.expedition?.activePetId;
    const item=window.PetCollection?.snapshot?.(profile)?.pets?.find(p=>p.id===id&&p.state==='tamed');
    if(!item||item.evolutionStage<1||!item.assets?.happy)return false;
    const root=ensure();clearTimers();stopMusic();queuedNewPet=followup?.newlyTamed?followup:null;
    root.hidden=false;root.className='temanReveal isEvolution';root.setAttribute('aria-labelledby','baraRevealTitle');
    root.dataset.petId=id;root.dataset.petName=item.name;
    let scene=root.querySelector('.baraScene');
    if(!scene){scene=document.createElement('div');scene.className='baraScene';scene.innerHTML=`<header class="cinema-title"><span class="level-tag">TAHAP <b>5</b></span><h2 id="baraRevealTitle">EVOLUSI <em>BARA</em></h2><span class="title-rule"></span></header><p class="intro-copy">Kuasa baharu terjaga</p><div class="stage" aria-label="Aurora dilindungi emblem api yang retak dan pecah untuk menampakkan Evolusi Bara"><div class="halo"></div><img class="pet old" src="" alt="Aurora bentuk asal"><div class="pet new happy-sprite" role="img" aria-label="Aurora Bara tersenyum dan berkelip"></div><div class="emblem" aria-hidden="true"><svg viewBox="0 0 300 330"><defs><linearGradient id="fire" x2="0" y2="1"><stop stop-color="#fff2a0"/><stop offset=".45" stop-color="#ff9d22"/><stop offset="1" stop-color="#b52e09"/></linearGradient><path id="shape" d="M150 12 C182 60 166 83 195 110 L218 65 C270 130 281 168 265 222 C247 277 205 311 150 319 C83 312 36 272 29 216 C20 166 49 126 78 90 C73 139 103 150 113 116 C129 78 123 45 150 12Z"/><clipPath id="a"><path d="M0 0H151L144 86 165 128 141 170 158 200 0 250Z"/></clipPath><clipPath id="b"><path d="M151 0H300V250L158 200 141 170 165 128 144 86Z"/></clipPath><clipPath id="c"><path d="M0 250L158 200 300 250V330H0Z"/></clipPath></defs><g class="left" clip-path="url(#a)"><image href="assets/ui/evolution/emblem-bara-v1.png" x="0" y="0" width="300" height="330" preserveAspectRatio="none"/></g><g class="right" clip-path="url(#b)"><image href="assets/ui/evolution/emblem-bara-v1.png" x="0" y="0" width="300" height="330" preserveAspectRatio="none"/></g><g class="bottom" clip-path="url(#c)"><image href="assets/ui/evolution/emblem-bara-v1.png" x="0" y="0" width="300" height="330" preserveAspectRatio="none"/></g><g class="cracks" stroke="#fff7ce" stroke-width="4" fill="none"><path d="M151 35L144 86 165 128 141 170 158 200 52 235M158 200L252 235M165 128L192 115M141 170L115 151"/></g></svg></div><div class="flash"></div></div><div class="result" aria-live="polite"><strong>Aurora</strong><p>Temanmu mencapai Tahap 5!</p></div>`;root.querySelector('.temanRevealCard').prepend(scene);}
    const folder=window.PetCollection.catalog[id]?.folder;
    const before=scene.querySelector('.old');before.src=folder?`assets/pets/collection/${folder}/happy.png`:'assets/pets/aurora/standby-v2.webp';before.alt=`Bentuk asas ${item.name}`;
    const revealAssets=item.evolutionAssets||item.assets;
    const pet=scene.querySelector('.new');pet.style.setProperty('--bara-sprite',`url("${new URL(revealAssets.happySprite||revealAssets.happy,document.baseURI).href}")`);pet.setAttribute('aria-label',`${item.name} Evolusi Bara tersenyum`);
    scene.querySelector('.result strong').textContent=item.name;
    scene.querySelector('.baraMusic')?.setAttribute('hidden','');scene.classList.remove('play');void scene.offsetWidth;scene.classList.add('play');
    root.querySelector('[data-teman-action="rename"]').hidden=true;
    root.querySelector('[data-teman-action="continue"]').textContent=preview?'Tutup Preview':'Teruskan Misi';
    root.classList.add('isOpen');
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    later(()=>root.classList.add('isReady'),reduced?0:5850);
    evolutionAudio=new Audio('assets/audio/evolution.mp3');evolutionAudio.volume=.75;evolutionAudio.muted=typeof paMuted!=='undefined'&&paMuted;
    evolutionAudio.play().catch(()=>{
      if(root.hidden||!root.classList.contains('isOpen'))return;
      let button=scene.querySelector('.baraMusic');
      if(!button){button=document.createElement('button');button.className='baraMusic';button.type='button';button.textContent='▶ Mainkan muzik';scene.appendChild(button);}
      button.hidden=false;button.onclick=()=>{evolutionAudio?.play().then(()=>button.hidden=true).catch(()=>{});};
    });
    return true;
  }
  function close(){stopMusic();const root=$('temanReveal');if(!root)return;clearTimers();root.classList.remove('isOpen','isRevealed','isCollected','isReady','isCharging','isBeamed','isVortex','isImpact','isSettled');later(()=>{if(!root.classList.contains('isOpen'))root.hidden=true;},220);}
  function preview(id){
    if(typeof window.isDevMode==='function'&&!window.isDevMode())return false;
    const data=typeof db==='undefined'?null:db;
    const all=window.PetCollection?.snapshot?.(data)?.pets||[];
    const choice=all.find(item=>item.id===id&&item.id!=='aurora')||all.find(item=>item.id!=='aurora');
    return choice?show({petId:choice.id,newlyTamed:true},{preview:true}):false;
  }

  window.PATemanReveal={show,showEvolution,preview,close};
  window.previewTemanBaharu=()=>preview();
})();
