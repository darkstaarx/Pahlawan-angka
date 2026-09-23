/* Teman discovery reveal: presentation only. PetCollection remains the
   authority that decides whether a real Gembok completion tamed a Teman. */
(() => {
  'use strict';
  let timers=[];
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
        <span class="temanRevealBurst" aria-hidden="true"></span>
      </div>
      <div class="temanRevealCopy"><p class="temanRevealFound">TEMAN BAHARU DITEMUI!</p><h3 class="temanRevealName"></h3><p class="temanRevealRarity"></p></div>
      <div class="temanRevealCollection" aria-label="Kad masuk ke Khazanah">
        <span class="temanRevealTrail">Khazanah</span><div class="temanRevealGrid"><i></i><i></i><i class="temanRevealNewSlot"><img alt=""></i><i></i><i></i><i></i></div>
      </div>
      <div class="temanRevealActions"><button class="btn ghost small" type="button" data-teman-action="continue">Teruskan Misi</button><button class="btn primary small" type="button" data-teman-action="treasure">Lihat Khazanah</button></div>
    </div>`;
    document.body.appendChild(root);
    root.querySelector('[data-teman-action="continue"]').onclick=close;
    root.querySelector('[data-teman-action="treasure"]').onclick=()=>{
      close();window.openTreasure?.();window.treasureTab?.('pets');
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
    clearTimers();root.hidden=false;root.className='temanReveal';
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

  function close(){const root=$('temanReveal');if(!root)return;clearTimers();root.classList.remove('isOpen','isRevealed','isCollected','isReady');later(()=>{if(!root.classList.contains('isOpen'))root.hidden=true;},220);}
  function preview(id){
    if(typeof window.isDevMode==='function'&&!window.isDevMode())return false;
    const data=typeof db==='undefined'?null:db;
    const all=window.PetCollection?.snapshot?.(data)?.pets||[];
    const choice=all.find(item=>item.id===id&&item.id!=='aurora')||all.find(item=>item.id!=='aurora');
    return choice?show({petId:choice.id,newlyTamed:true},{preview:true}):false;
  }

  window.PATemanReveal={show,preview,close};
  window.previewTemanBaharu=()=>preview();
})();
