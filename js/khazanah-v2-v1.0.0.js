/* Khazanah v2 — susun atur penuh skrin Koleksi. v1.0.0
 *
 * Skrin lama membaca sebagai senarai kedai: kad rata dua lajur, harga paling
 * menonjol, dan teman yang sudah diselamatkan kelihatan sama berat dengan
 * yang belum dibeli. Versi ini memberi skrin hierarki: kepala, tab besar
 * berkiraan, panggung untuk teman aktif, kemudian panel berbingkai emas.
 *
 * Yang TIDAK berubah: harga, `equipPet`, `unequipPet`, `equipAura`,
 * `unequipAura`, `buyReward` dan seluruh ekonomi kekal milik rewards-v2.js.
 * Fail ini hanya menggantikan cara ia dipaparkan.
 */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);

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
  const PET_NAMES={aurora:'Aurora Ekor Angka',ketupatKura:'Kura-Kura Ketupat',kumbangManggis:'Kumbang Manggis',harimauBunga:'Harimau Bunga',arnabKekLapis:'Arnab Kek Lapis',durianKerbau:'Kerbau Durian'};

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
  <div class="kzTitle"><h1>Teman</h1></div>
</header>

<div class="kzTabs">
  <button class="kzTab active" id="treasurePetTab" type="button" onclick="treasureTab('pets')">
    Teman</button>
  <button class="kzTab" id="treasureBadgeTab" type="button" onclick="treasureTab('badges')">
    Trofi</button>
</div>

<section class="kzShow" id="petStage">
  <canvas id="petStageCanvas"></canvas>
  <div class="kzShowCard">
    <b id="petStageName">Belum ada teman</b>
    <small id="petStageDesc"></small>
  </div>
</section>

<section class="kzPanel">
  <div id="petCollection" class="kzGrid"></div>
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

  function companionCard(pet){
    const tamed=pet.state==='tamed', encountered=pet.state==='encountered';
    const name=PET_NAMES[pet.id]||pet.name||pet.id;
    const status=tamed?(pet.active?'Sedang ikut kamu':'Lengkapi'):'Belum ditemui';
    const rarity=`<span>${pet.rarity}</span>`;
    const rescue=encountered&&pet.rescueThreshold?`<small>Diselamatkan ${pet.rescues||0}/${pet.rescueThreshold} kali</small>`:'';
    const progression=tamed?`<small>Tahap ${pet.level}</small><small>${pet.evolutionState}</small>`:'';
    const action=tamed&&!pet.active?`<button class="kzBtn" type="button" onclick="equipCollectionPet('${pet.id}')">Lengkapi</button>`:'';
    return `<article class="kzCard companionCard ${tamed?'owned':encountered?'encountered':'locked'} ${pet.active?'equipped':''}" style="--gem:#5cc3ff">
      <i class="kzGem"></i><div class="kzArt"><img src="${pet.assets.happy}" alt="${tamed||encountered?name:'Belum ditemui'}"></div>
      ${tamed?`<div class="kzName">${name}</div>`:''}
      <div class="kzPetMeta">${encountered?rescue:`<b>${status}</b>${tamed?progression:rarity}`}</div>${action?`<div class="kzFoot">${action}</div>`:''}
    </article>`;
  }

  window.equipCollectionPet=function(id){
    if(!window.PetCollection?.equip?.(db,id))return;
    if(typeof renderTreasure==='function')renderTreasure();
    if(typeof renderBattlePet==='function')renderBattlePet();
  };
  function paintCompanions(){
    if(typeof db==='undefined'||!db||!window.PetCollection)return;
    const pets=$('petCollection');if(pets)pets.innerHTML=window.PetCollection.snapshot(db).pets.map(companionCard).join('');
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
    set('kzPanelTitle', tab==='pets'?'Teman Dimensi':tab==='auras'?'Aura Kuasa':'Trofi Pengembaraan');
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
    desc.textContent=`Tahap ${item.level||1} · Ikatan ${item.bondXp||0} XP`;
  }

  /* ---------------- pemasangan ---------------- */
  function install(){
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
        try{ paintCompanions(); paintChrome(); paintShowcase() }catch(e){ console.error('[khazanah-v2]',e) }
        return out;
      };
      wrapped.__kz=true;
      window[name]=wrapped;
    });
  }

  // Dipasang selepas rewards-v2.js mengisytiharkan fungsinya.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.PAKhazanah={rarityOf, paint:()=>{paintChrome();paintShowcase()}};
})();
