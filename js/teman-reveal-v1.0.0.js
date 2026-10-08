/* Teman discovery reveal: presentation only. PetCollection remains the
   authority that decides whether a real Gembok completion tamed a Teman. */
(() => {
  'use strict';
  let timers=[];let queuedNewPet=null;
  const $=id=>document.getElementById(id);
  const later=(fn,ms)=>timers.push(window.setTimeout(fn,ms));
  const clearTimers=()=>{timers.forEach(window.clearTimeout);timers=[];};
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));

  // Consistent frame-independent particles for all six Teman, no bitmap FX.
  const flamePetals=n=>Array.from({length:n},(_,i)=>'<i style="--a:'+(i*360/n)+'deg;--d:'+((i*7%13)/20)+'s"></i>').join('');
  const fireEmbers=n=>Array.from({length:n},(_,i)=>'<i style="--x:'+(8+i*37%85)+'%;--y:'+(27+i*19%58)+'%;--drift:'+((i*11%71)-35)+'px;--d:'+((i*13%19)/12)+'s;--t:'+(1.1+(i%5)*.3)+'s"></i>').join('');
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
        <div class="temanEvoFx" aria-hidden="true">
          <i class="teAtmos"></i><i class="teSkyBeam"></i><i class="teRune"></i>
          <div class="teVortex teVortexBack">${flamePetals(18)}</div>
          <div class="teVortex teVortexFront">${flamePetals(22)}</div>
          <div class="teEmbers">${fireEmbers(24)}</div>
          <i class="teShock"></i><i class="teRays"></i><i class="teFlash"></i>
        </div>
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
    clearTimers();queuedNewPet=null;root.hidden=false;root.className='temanReveal';
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


  // Cosmetic playback only. Level 5 and ownership are verified by PetCollection.
  function showEvolution(award,{profile=null,followup=null,petId=null,preview=false}={}){
    if(typeof document==='undefined'||!award?.evolvedPetName||!profile)return false;
    const id=petId||profile.expedition?.activePetId;
    const item=window.PetCollection?.snapshot?.(profile)?.pets?.find(p=>p.id===id&&p.state==='tamed');
    const folder=window.PetCollection?.catalog?.[id]?.folder;
    if(!item||item.evolutionStage<1||!item.assets?.happy)return false;
    const base=folder?`assets/pets/collection/${folder}/happy.png`:'assets/pets/aurora/standby-v2.webp';
    const root=ensure(),name=String(item.name||award.evolvedPetName||'Teman');
    clearTimers();queuedNewPet=followup?.newlyTamed?followup:null;
    root.hidden=false;root.className='temanReveal isEvolution';
    root.dataset.petId=String(id);root.dataset.petName=name;
    root.querySelector('.temanRevealEyebrow').textContent=preview?'PRATONTON DEV · TAHAP 5':'PENCAPAIAN TAHAP 5';
    root.querySelector('#temanRevealTitle').textContent='Tenaga Bara Bangkit...';
    root.querySelector('.temanRevealFound').textContent='CAHAYA DIMENSI BERKUMPUL';
    root.querySelector('.temanRevealName').textContent=name;
    root.querySelector('.temanRevealRarity').textContent='Bentuk Asas → Evolusi Bara';
    const before=root.querySelector('.temanRevealSilhouette');
    before.src=base;before.alt=`Bentuk asas ${name}`;
    const after=root.querySelector('.temanRevealHappy');
    after.src=item.assets.happy;after.alt=`Evolusi Bara ${name}`;after.hidden=false;
    const sprite=root.querySelector('.temanRevealHappySprite');
    sprite.hidden=true;sprite.style.backgroundImage='';
    root.querySelector('.temanRevealCollection').hidden=true;
    root.querySelector('[data-teman-action="rename"]').hidden=true;
    root.querySelector('[data-teman-action="continue"]').textContent=preview?'Tutup Preview':'Teruskan Misi';
    const label=root.querySelector('.temanEvolutionStageLabel');
    label.hidden=false;label.textContent='BENTUK ASAS';
    void root.offsetWidth;root.classList.add('isOpen');
    const finalReveal=()=>{
      label.textContent='EVOLUSI BARA';
      root.querySelector('#temanRevealTitle').textContent='Evolusi Bara Terbuka!';
      root.querySelector('.temanRevealFound').textContent='KUASA BARA DIBANGKITKAN!';
    };
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){
      root.classList.add('isRevealed','isSettled','isReady');
      finalReveal();
      return true;
    }
    const phase=(time,name,fn)=>later(()=>{
      if(!root.classList.contains('isOpen')||!root.classList.contains('isEvolution'))return;
      root.classList.add(name);
      fn?.();
    },time);
    phase(430,'isCharging');
    phase(1020,'isBeamed');
    phase(1550,'isVortex');
    phase(2780,'isImpact');
    phase(3070,'isRevealed',finalReveal);
    phase(3560,'isSettled');
    phase(4140,'isReady');
    return true;
  }

  function close(){const root=$('temanReveal');if(!root)return;clearTimers();root.classList.remove('isOpen','isRevealed','isCollected','isReady','isCharging','isBeamed','isVortex','isImpact','isSettled');later(()=>{if(!root.classList.contains('isOpen'))root.hidden=true;},220);}
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
