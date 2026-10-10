/* Khazanah — interactive companion card deck.
 * PetCollection owns rescue progress, appearances and equipment.
 * This module renders the collection without changing its reward rules. */
(function(){
  'use strict';
  if(window.PAKhazanah?.cardDeckVersion===2)return;

  const $ = id => document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));

  /* Tiada data kelangkaan dalam repo, jadi ia diterbitkan daripada harga —
     satu-satunya isyarat nilai yang memang sudah wujud. Tiada statistik
     direka: apa yang dipaparkan mesti ada sumbernya. */
  const RARITY=[
    {max:120, key:'biasa',   label:'Biasa',   gem:'#4ad991', pips:1},
    {max:160, key:'jarang',  label:'Jarang',  gem:'#5cc3ff', pips:2},
    {max:180, key:'epik',    label:'Epik',    gem:'#b98cff', pips:3},
    {max:1e9, key:'legenda', label:'Legenda', gem:'#ffc94d', pips:4}
  ];
  const rarityOf = item => RARITY.find(r=>(item.price||0)<=r.max)||RARITY[0];

  const ICONS={
    pets:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M7 16c0-3 2.3-5 5-5s5 2 5 5c0 2-1.6 3-3.2 2.1A3.6 3.6 0 0 0 12 17.5a3.6 3.6 0 0 0-1.8.6C8.6 19 7 18 7 16z"/></svg>',
    auras:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>',
    badges:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M9 20h6M12 14v6"/></svg>',
    lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };
  const PET_NAMES={aurora:'Aurora',ketupatKura:'Kukupat',kumbangManggis:'Kumbis',harimauBunga:'Riya',arnabKekLapis:'Bunnis',durianKerbau:'Keryan'};

  /* ---------------- rangka skrin ---------------- */
  function buildShell(){
    const sec=$('treasure');
    if(!sec||sec.dataset.kz)return;
    sec.dataset.kz='1';
    sec.classList.add('kzScreen');
    sec.innerHTML=`
<header class="kzHead">
  <button class="kzBack" type="button" onclick="goHub()" aria-label="Kembali">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
  </button>
  <div class="kzTitle"><h1>Khazanah</h1></div>
</header>

<div class="kzTabs" aria-label="Koleksi Khazanah">
  <button class="kzTab active" id="treasurePetTab" type="button" onclick="treasureTab('pets')">
    Teman</button>
  <button class="kzTab" id="treasureBadgeTab" type="button" onclick="treasureTab('badges')">
    Trofi</button>
</div>

<section class="kzPanel">
  <div class="kzCollectionHead"><h2 id="kzPanelTitle">Teman kamu</h2><span id="kzCollectionCount"></span></div>
  <div id="kzPetGallery"><div id="petCollection" class="kzDeck" tabindex="0" aria-label="Kad koleksi teman"></div><div class="kzDeckNav"><button id="kzDeckPrev" type="button" aria-label="Kad sebelumnya">‹</button><div id="kzDeckDots" class="kzDeckDots" aria-label="Pilih kad teman"></div><button id="kzDeckNext" type="button" aria-label="Kad seterusnya">›</button></div><p class="kzDeckHint">Leret untuk kad seterusnya · Tekan untuk buka</p></div>
  <div id="auraCollection" class="kzGrid hidden"></div>
  <div id="badgeCollection" class="kzGrid hidden"></div>
</section>`;
  }

  /* ---------------- kad koleksi ---------------- */
  function card(type,item){
    const store=type==='pet'?db.rewards.pets:db.rewards.auras;
    const owned=!!store[item.id];
    const eq=type==='pet'?db.rewards.equippedPet===item.id:db.rewards.equippedAura===item.id;
    const img=type==='pet'?item.front:item.image;
    const r=rarityOf(item);
    const short=Math.max(0,(item.price||0)-(db.coins||0));
    const equipCall=type==='pet'?`equipPet('${item.id}')`:`equipAura('${item.id}')`;
    const removeCall=type==='pet'?'unequipPet()':'unequipAura()';

    const foot = owned
      ? `<button class="kzBtn ${eq?'off':''}" type="button" onclick="${eq?removeCall:equipCall}">${eq?'Tanggalkan':'Lengkapi'}</button>`
      : `<button class="kzBtn buy" type="button" onclick="buyReward('${type}','${item.id}')">🪙 ${item.price}</button>
         <small class="kzShort">${short?`Lagi ${short}`:'Boleh dibuka'}</small>`;

    return `<article class="kzCard ${owned?'owned':'locked'} ${eq?'equipped':''}" style="--gem:${r.gem}"
              title="${r.label}">
      <i class="kzGem"></i>
      <div class="kzArt">
        <img src="${img}" alt="${owned?item.name:'Belum ditemui'}">
        ${owned?'':`<div class="kzLock"><span>?</span>${ICONS.lock}</div>`}
      </div>
      <div class="kzName">${owned?item.name:'Belum ditemui'}</div>
      <div class="kzFoot">${foot}</div>
    </article>`;
  }

  const deckState={id:null,index:0,signature:'',moving:false,gesture:null,suppressClickUntil:0};
  const reducedMotion=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function petPresentation(pet){
    const tamed=pet.state==='tamed';
    // A known companion remains known while its rescue requirement is incomplete.
    const known=tamed||pet.state==='encountered'||Number(pet.rescues)>0||Number(pet.encounters)>0;
    const threshold=Number(pet.rescueThreshold)>0?Number(pet.rescueThreshold):null;
    const rescues=Math.max(0,Number(pet.rescues)||0);
    const remaining=threshold?Math.max(0,threshold-rescues):null;
    return {tamed,known,name:known?(pet.name||PET_NAMES[pet.id]||pet.id):'Belum ditemui',status:tamed?(pet.active?'Ikut kamu':'Dijinakkan'):known?'Belum Dijinakkan':'Belum ditemui',rescues,threshold,remaining,percent:threshold?Math.min(100,Math.round(rescues/threshold*100)):0};
  }
  function cardFace(pet,index,total){
    const p=petPresentation(pet);
    const rarity={Starter:'Permulaan',Common:'Biasa',Uncommon:'Unik',Rare:'Jarang',Epic:'Epik',Legendary:'Legenda'}[pet.rarity]||'Teman';
    const progress=!p.tamed&&p.known?`<div class="kzRescue"><div><span>Misi Gembok</span><b>${p.rescues}${p.threshold?` / ${p.threshold}`:''}</b></div>${p.threshold?`<div class="kzRescueBar" role="progressbar" aria-label="Kemajuan menjinakkan teman" aria-valuemin="0" aria-valuemax="${p.threshold}" aria-valuenow="${Math.min(p.rescues,p.threshold)}"><i style="width:${p.percent}%"></i></div><small>${p.remaining?`Lagi ${p.remaining} misi untuk dijinakkan`:'Jumlah misi mencukupi'}</small>`:'<small>Teruskan misi Gembok untuk menjinakkan teman ini.</small>'}</div>`:'';
    return `<div class="kzCardTop"><span>${esc(rarity)}</span><small>${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</small></div>
      <div class="kzCardHeading"><h2>${esc(p.name)}</h2>${p.tamed?`<span>Tahap <b>${pet.level}</b></span>`:''}</div>
      <div class="kzCardScene ${p.known?'':'unseen'}"><img src="${esc(pet.assets.happy)}" alt="" loading="lazy">${p.tamed&&pet.appearance==='bara'?'<span class="kzCardForm">Bara</span>':''}</div>
      <div class="kzCardInfo"><span class="kzCardStatus ${p.tamed?'tamed':''}">${esc(p.status)}</span><p>${p.known?esc(pet.species||'Teman Dimensi'):'Satu teman sedang menunggu dalam kembara kamu.'}</p>${progress}${p.tamed?`<div class="kzBond"><span>Ikatan</span><b>${Number(pet.bondXp)||0} XP</b></div>`:!p.known?`<small class="kzDiscovery">${pet.eligible?'Temui dalam misi Gembok':`Teruskan kembara · Tahap ${Math.max(1,Number(pet.levelGate)||1)}`}</small>`:''}</div>`;
  }
  function companionCard(pet,index,total){
    const p=petPresentation(pet);
    return `<article class="kzTradingCard ${p.tamed?'owned':p.known?'encountered':'locked'} ${pet.active?'equipped':''}" data-pet-id="${esc(pet.id)}">
      <button class="kzCardOpen" type="button" onclick="openCollectionPet('${pet.id}')" aria-label="Lihat ${esc(p.name)} · ${esc(p.status)}">${cardFace(pet,index,total)}</button>
    </article>`;
  }
  function deckCards(){return [...($('petCollection')?.querySelectorAll('[data-pet-id]')||[])]}
  function updateDeck(){
    const cards=deckCards();if(!cards.length)return;
    deckState.index=((deckState.index%cards.length)+cards.length)%cards.length;
    deckState.id=cards[deckState.index].dataset.petId;
    cards.forEach((card,index)=>{
      const depth=(index-deckState.index+cards.length)%cards.length;
      card.dataset.depth=String(depth);card.style.setProperty('--depth',String(depth));card.style.zIndex=String(cards.length-depth);
      card.classList.toggle('is-focus',depth===0);card.setAttribute('aria-hidden',String(depth!==0));
      const button=card.querySelector('button');if(button){button.disabled=depth!==0;button.tabIndex=depth===0?0:-1}
    });
    $('kzDeckDots')?.querySelectorAll('button').forEach((dot,index)=>{dot.classList.toggle('active',index===deckState.index);dot.setAttribute('aria-current',index===deckState.index?'true':'false')});
    const host=$('petCollection');if(host)host.setAttribute('aria-busy',String(deckState.moving));
    const prev=$('kzDeckPrev'),next=$('kzDeckNext');if(prev)prev.disabled=cards.length<2;if(next)next.disabled=cards.length<2;
  }
  function selectDeck(index,animate=true,fromTransform=null){
    const cards=deckCards();if(!cards.length||deckState.moving)return;
    const target=((index%cards.length)+cards.length)%cards.length;
    if(target===deckState.index){updateDeck();return}
    const outgoing=cards[deckState.index],direction=index<deckState.index?-1:1;
    const frontButton=outgoing.querySelector('button'),restoreFocus=frontButton===document.activeElement;
    deckState.index=target;deckState.id=cards[target].dataset.petId;
    const motion=animate&&!reducedMotion()&&typeof outgoing.animate==='function';
    deckState.moving=motion;updateDeck();
    if(restoreFocus)cards[target].querySelector('button')?.focus({preventScroll:true});
    if(!motion)return;
    outgoing.style.zIndex=String(cards.length+1);
    outgoing.classList.add('is-rolling');
    const roll=outgoing.animate([
      {transform:fromTransform||'translateX(-50%) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1)',opacity:1},
      {transform:`translateX(calc(-50% - ${direction*70}px)) translateY(-18px) rotateZ(${-direction*8}deg) rotateY(${-direction*20}deg) scale(1.02)`,opacity:1,offset:.4},
      {transform:`translateX(calc(-50% - ${direction*240}px)) translateY(32px) rotateZ(${-direction*18}deg) rotateY(${-direction*48}deg) scale(.83)`,opacity:0}
    ],{duration:520,easing:'cubic-bezier(.22,.7,.2,1)',fill:'none'});
    Promise.resolve(roll.finished).catch(()=>{}).then(()=>{outgoing.classList.remove('is-rolling');deckState.moving=false;updateDeck()});
  }
  function resetGesture(){
    $('petCollection')?.classList.remove('is-dragging');
    deckCards().forEach(card=>{card.style.setProperty('--drag-x','0px');card.style.setProperty('--drag-angle','0deg')});deckState.gesture=null;
  }
  function setupDeck(pets){
    const host=$('petCollection');if(!host)return;
    const selected=pets.findIndex(p=>p.id===deckState.id);deckState.index=selected<0?Math.max(0,pets.findIndex(p=>p.active)):selected;updateDeck();
    const dots=$('kzDeckDots');if(dots){dots.innerHTML=pets.map((pet,index)=>`<button type="button" aria-label="Kad ${index+1}: ${esc(petPresentation(pet).name)}" data-index="${index}"></button>`).join('');dots.querySelectorAll('button').forEach((dot,index)=>dot.onclick=()=>selectDeck(index))}
    const prev=$('kzDeckPrev'),next=$('kzDeckNext');if(prev)prev.onclick=()=>selectDeck(deckState.index-1);if(next)next.onclick=()=>selectDeck(deckState.index+1);
    if(!host.dataset.deckBound){
      host.dataset.deckBound='1';
      host.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectDeck(deckState.index+(event.key==='ArrowRight'?1:-1))}});
      host.addEventListener('pointerdown',event=>{if(deckState.moving||event.isPrimary===false||event.button>0)return;deckState.gesture={id:event.pointerId,x:event.clientX,y:event.clientY,start:Date.now(),dragging:false}});
      host.addEventListener('pointermove',event=>{
        const g=deckState.gesture;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x,dy=event.clientY-g.y;
        if(!g.dragging&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){resetGesture();return}
        if(!g.dragging&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){g.dragging=true;host.classList.add('is-dragging');host.setPointerCapture?.(event.pointerId)}
        if(!g.dragging)return;if(event.cancelable)event.preventDefault();
        const front=deckCards()[deckState.index];front?.style.setProperty('--drag-x',`${Math.max(-100,Math.min(100,dx))}px`);front?.style.setProperty('--drag-angle',`${Math.max(-8,Math.min(8,dx/14))}deg`);
      });
      host.addEventListener('pointerup',event=>{
        const g=deckState.gesture;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x,elapsed=Math.max(1,Date.now()-g.start);
        const swipe=g.dragging&&(Math.abs(dx)>42||(Math.abs(dx)>18&&Math.abs(dx)/elapsed>.5));
        const fromTransform=swipe?window.getComputedStyle?.(deckCards()[deckState.index]).transform:null;
        if(g.dragging)deckState.suppressClickUntil=Date.now()+350;
        if(host.hasPointerCapture?.(event.pointerId))host.releasePointerCapture(event.pointerId);
        resetGesture();if(swipe)selectDeck(deckState.index+(dx<0?1:-1),true,fromTransform);
      });
      host.addEventListener('pointercancel',resetGesture);
      host.addEventListener('click',event=>{if(deckState.moving||Date.now()<deckState.suppressClickUntil){event.preventDefault();event.stopPropagation()}},true);
    }
    updateDeck();
  }

  window.openCollectionPet=function(id){
    const pets=window.PetCollection?.snapshot?.(db)?.pets||[],pet=pets.find(p=>p.id===id);if(!pet)return;
    const p=petPresentation(pet);
    let dialog=$('petDetailSheet');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='petDetailSheet';dialog.className='kzDetailSheet';document.body.appendChild(dialog);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})}
    dialog.innerHTML=`<button class="kzSheetClose" type="button" aria-label="Tutup kad teman">×</button><article class="kzTradingCard kzFullCard ${p.tamed?'owned':p.known?'encountered':'locked'}"><div class="kzFullFace">${cardFace(pet,pets.indexOf(pet),pets.length)}</div></article>
      <div class="kzDetailActions">${p.tamed?'<button class="kzRename kzBtn off" type="button">Tukar nama</button>':''}
      ${p.tamed&&pet.evolutionUnlocked?`<div class="kzFormLabel">Bentuk teman</div><div class="kzAppearance"><button class="kzBtn off" type="button" data-form="base" aria-pressed="${pet.appearance==='base'}">Asas</button><button class="kzBtn off" type="button" data-form="bara" aria-pressed="${pet.appearance==='bara'}">Bara</button></div>`:''}
      ${p.tamed&&pet.evolutionStage>0?'<button class="kzEvolution" type="button">Lihat evolusi <span>›</span></button>':''}
      ${p.tamed?`<button class="kzCta kzEquip" type="button" ${pet.active?'disabled':''}>${pet.active?'Sedang ikut kamu':'Jadikan teman'}</button>`:''}</div>`;
    dialog.querySelector('.kzSheetClose').onclick=()=>dialog.close();
    const rename=dialog.querySelector('.kzRename');if(rename)rename.onclick=()=>{dialog.close();renameCollectionPet(id)};
    dialog.querySelectorAll('[data-form]').forEach(button=>button.onclick=()=>{setCollectionAppearance(id,button.dataset.form);openCollectionPet(id)});
    const replay=dialog.querySelector('.kzEvolution');if(replay)replay.onclick=()=>{dialog.close();previewCollectionEvolution(id)};
    const equip=dialog.querySelector('.kzEquip');if(equip)equip.onclick=()=>{equipCollectionPet(id);dialog.close()};
    dialog.setAttribute('aria-label',`Kad ${p.name} · ${p.status}`);
    if(!dialog.open)dialog.showModal();
  };

  window.equipCollectionPet=function(id){
    if(!window.PetCollection?.equip?.(db,id))return;
    if(typeof renderTreasure==='function')renderTreasure();
    if(typeof renderBattlePet==='function')renderBattlePet();
  };
  window.setCollectionAppearance=function(id,appearance){
    if(!window.PetCollection?.setAppearance?.(db,id,appearance))return;
    if(typeof renderTreasure==='function')renderTreasure();
    if(typeof renderBattlePet==='function')renderBattlePet();
  };
  window.previewCollectionEvolution=function(id){
    const pet=window.PetCollection?.snapshot?.(db)?.pets?.find(item=>item.id===id&&item.state==='tamed'&&item.evolutionStage>0);
    if(!pet)return false;
    return window.PATemanReveal?.showEvolution?.({evolvedPetName:pet.name},{profile:db,petId:id})||false;
  };
  window.renameCollectionPet=function(id){
    const pet=window.PetCollection?.snapshot?.(db)?.pets?.find(item=>item.id===id);
    if(!pet)return;
    let overlay=$('petRenameOverlay');
    if(!overlay){
      overlay=document.createElement('div');overlay.id='petRenameOverlay';overlay.className='purchaseOverlay';
      overlay.innerHTML='<div class="purchaseCard petRenameCard"><div class="eyebrow">NAMA TEMAN</div><h2 id="petRenameTitle">Namakan teman</h2><p class="mut">Nama ini akan digunakan dalam Khazanah dan battle.</p><input id="petRenameInput" class="textInput" maxlength="24" autocomplete="off"><div class="purchaseActions"><button type="button" class="btn ghost" data-rename-cancel>Batal</button><button type="button" class="btn primary" data-rename-save>Simpan nama</button></div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('[data-rename-cancel]').onclick=()=>{overlay.classList.add('hidden');overlay.hidden=true};
    }
    const input=overlay.querySelector('#petRenameInput');
    overlay.querySelector('#petRenameTitle').textContent=`Namakan ${pet.defaultName||pet.name}`;
    input.value=pet.name;overlay.hidden=false;overlay.classList.remove('hidden');input.focus();input.select();
    overlay.querySelector('[data-rename-save]').onclick=()=>{
      const name=input.value.trim();
      if(!window.PetCollection.rename(db,id,name)){input.focus();return}
      overlay.classList.add('hidden');overlay.hidden=true;renderTreasure();if(typeof renderBattlePet==='function')renderBattlePet();if(typeof showRewardToast==='function')showRewardToast(`${name} sudah dinamakan`);
    };
  };
  function paintCompanions(){
    if(typeof db==='undefined'||!db||!window.PetCollection)return;
    const host=$('petCollection'),pets=window.PetCollection.snapshot(db).pets;if(!host)return;
    const signature=JSON.stringify(pets);if(signature===deckState.signature&&host.querySelector('[data-pet-id]'))return;
    deckState.signature=signature;host.innerHTML=pets.map((pet,index)=>companionCard(pet,index,pets.length)).join('');setupDeck(pets);
  }

  /* ---------------- kemas kini kepala, tab dan kemajuan ---------------- */
  function counts(){
    const collection=window.PetCollection?.snapshot?.(db);
    const petTotal=collection?.pets.length||Object.keys(REWARD_PETS).length;
    const petOwn=collection?.pets.filter(p=>p.state==='tamed').length||Object.keys(db?.rewards?.pets||{}).filter(id=>REWARD_PETS[id]).length;
    const auraTotal=Object.keys(REWARD_AURAS).length;
    const auraOwn=Object.keys(db?.rewards?.auras||{}).filter(id=>REWARD_AURAS[id]).length;
    const badgeTotal=Object.keys(REWARD_BADGES).length;
    const badgeOwn=Object.keys(db?.rewards?.badges||{}).filter(id=>REWARD_BADGES[id]).length;
    return {petTotal,petOwn,auraTotal,auraOwn,badgeTotal,badgeOwn};
  }

  function activeTab(){
    if($('treasureAuraTab')?.classList.contains('active'))return 'auras';
    if($('treasureBadgeTab')?.classList.contains('active'))return 'badges';
    return 'pets';
  }

  function paintChrome(){
    if(typeof db==='undefined'||!db)return;
    const c=counts();
    const set=(id,v)=>{ const el=$(id); if(el)el.textContent=v };
    set('kzCountPets',`${c.petOwn}/${c.petTotal}`);
    set('kzCountAuras',`${c.auraOwn}/${c.auraTotal}`);
    set('kzCountBadges',`${c.badgeOwn}/${c.badgeTotal}`);

    // Wajah hero murid pada lencana bulat, sama seperti rujukan.
    const crest=$('kzCrestImg');
    if(crest){
      try{
        const h=(typeof HEROES!=='undefined')&&HEROES[db.hero||'wira'];
        const src=h&&(h.profile||h.idle);
        if(src&&crest.getAttribute('src')!==src)crest.src=src;
      }catch(_){}
    }

    const tab=activeTab();

    // Only the Teman tab owns the interactive pet stage. Keeping the stage
    // mounted above Trofi/Aura wastes vertical space and can interfere with
    // touch scrolling on mobile.
    const petOnly=tab==='pets';
    const stage=$('petStage');
    const tracker=$('petHuntTracker');
    if(stage)stage.classList.toggle('hidden',!petOnly);
    $('kzPetGallery')?.classList.toggle('hidden',!petOnly);
    if(petOnly)requestAnimationFrame(updateDeck);
    if(tracker)tracker.classList.toggle('hidden',!petOnly);

    set('kzPanelTitle',tab==='pets'?'Teman kamu':tab==='auras'?'Aura kamu':'Trofi kamu');
    set('kzCollectionCount',tab==='pets'?`${c.petOwn}/${c.petTotal} diselamatkan`:tab==='auras'?`${c.auraOwn}/${c.auraTotal} dibuka`:`${c.badgeOwn}/${c.badgeTotal} diperoleh`);
    ['treasurePetTab','treasureBadgeTab'].forEach(id=>{const button=$(id);if(button)button.setAttribute('aria-pressed',String(button.classList.contains('active')))});
    const filter=$('kzFilter');
    if(filter)filter.textContent = tab==='badges' ? `${c.badgeOwn} diperoleh` : 'Semua';

    const prog=$('petProgress');
    if(prog){
      const own = tab==='pets'?c.petOwn:tab==='auras'?c.auraOwn:c.badgeOwn;
      const total = tab==='pets'?c.petTotal:tab==='auras'?c.auraTotal:c.badgeTotal;
      const noun = tab==='pets'?'teman dijinakkan':tab==='auras'?'aura dibuka':'trofi diperoleh';
      prog.querySelector('b').textContent=`${own} daripada ${total} ${noun}`;
      prog.querySelector('span span').style.width=Math.round(own/Math.max(1,total)*100)+'%';
    }
  }

  /* Kad panggung: nama, gelaran kelangkaan, permata dan butang tindakan. */
  function paintShowcase(){
    const name=$('petStageName'), desc=$('petStageDesc');
    if(!name||!desc)return;
    let item=null;
    try{ item=window.PetCollection?.snapshot?.(db).pets.find(p=>p.active)||REWARD_PETS[db?.rewards?.equippedPet]||null }catch(_){}

    if(!item){
      name.textContent='Belum ada teman';
      desc.textContent='';
      return;
    }
    name.textContent=item.name;
    desc.textContent=`Tahap ${item.level||1}${item.appearance==='bara'?' · Bara':''}`;
  }

  function paintTracker(){
    const root=$('petHuntTracker');
    if(!root||typeof db==='undefined'||!db||!window.PetCollection)return;
    const collection=window.PetCollection.snapshot(db),pets=collection.pets||[];
    const owned=pets.filter(p=>p.state==='tamed').length;
    const total=pets.length;
    const next=pets.find(p=>p.id!=='aurora'&&p.state!=='tamed');
    const playerLevel=Math.max(1,Number(db.level)||1);
    const rank=Number(collection.expedition?.rank)||1;
    const levelGate=next?Math.max(1,Number(next.levelGate)||1):null;
    const eligible=next?.eligible===true;
    const rescues=next?Math.max(0,Number(next.rescues)||0):0;
    const threshold=next?.rescueThreshold==null?null:Math.max(1,Number(next.rescueThreshold));
    const rescuePercent=threshold?Math.max(0,Math.min(100,Math.round(rescues/threshold*100))):0;
    let detail='Semua teman telah ditemui.';
    let progress='100%';
    if(next){
      if(next.state==='encountered'&&threshold){
        detail=`Jejak ${next.name} · ${rescues}/${threshold} rescue Gembok`;
        progress=`${rescuePercent}%`;
      }else if(!eligible){
        detail=`Buka pada Tahap ${levelGate} · Tahap kamu ${playerLevel}`;
        progress=`${Math.max(0,Math.min(100,Math.round(playerLevel/Math.max(1,levelGate)*100)))}%`;
      }else{
        detail=`Lengkapkan misi Gembok untuk jejak ${next.name}`;
        progress='0%';
      }
    }
    root.innerHTML=`<div class="kzTrackerHead"><div><span class="kzTrackerEyebrow">JEJAK TEMAN</span><b>${next?`Seterusnya: ${next.name}`:'Koleksi lengkap'}</b></div><strong>${owned}/${total}</strong></div><div class="kzTrackerBar" role="progressbar" aria-label="Kemajuan mencari teman seterusnya" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.replace('%','')}"><i style="width:${progress}"></i></div><div class="kzTrackerMeta"><span>${detail}</span><span>Rank ${rank}</span></div>`;
  }

  /* ---------------- pemasangan ---------------- */
  function install(){
    if(!$('petRenameStyle')){const style=document.createElement('style');style.id='petRenameStyle';style.textContent='.kzFoot{display:grid;gap:6px}.petRenameCard .textInput{position:relative;width:100%;box-sizing:border-box;margin:8px 0 14px;padding:11px 13px;border:1px solid #7ca5d6;border-radius:12px;background:#07172d;color:#fff;font:inherit;text-align:center}.petRenameCard .purchaseActions{position:relative;display:grid;gap:8px}';document.head.appendChild(style)}
    buildShell();

    // Kad premium menggantikan shopCard; renderTreasure memanggilnya melalui
    // pengikatan global, jadi ia mengambil versi ini secara automatik.
    if(typeof window.shopCard==='function'&&!window.shopCard.__kz){
      const replacement=function(type,item){ return card(type,item) };
      replacement.__kz=true;
      window.shopCard=replacement;
    }

    ['renderTreasure','treasureTab','openTreasure'].forEach(name=>{
      const original=window[name];
      if(typeof original!=='function'||original.__kz)return;
      const wrapped=function(){
        const out=original.apply(this,arguments);
        try{ paintCompanions(); paintChrome(); paintShowcase(); paintTracker() }catch(e){ console.error('[khazanah-v2]',e) }
        return out;
      };
      wrapped.__kz=true;
      window[name]=wrapped;
    });
  }

  // Dipasang selepas rewards-v2.js mengisytiharkan fungsinya.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.PAKhazanah={cardDeckVersion:2,rarityOf,petPresentation,selectDeck,updateDeck, paint:()=>{paintChrome();paintShowcase();paintTracker()}};
})();





