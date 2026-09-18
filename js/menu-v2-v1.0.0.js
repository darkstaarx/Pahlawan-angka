/* Menu V2 — laman utama alternatif. v1.0.0
 *
 * Setiap kali murid memilih profil, dia ditanya: Menu V2 atau menu asal.
 * Pilihan disimpan pada profil (`db.menuStyle`) supaya butang Utama di dalam
 * permainan kembali ke menu yang sama sepanjang sesi itu.
 *
 * ATURAN DATA: setiap nombor di skrin ini mesti datang daripada profil
 * sebenar. Satu sahaja yang belum wujud dalam `db` — ikatan pet — dan ia
 * dipaparkan sebagai 0% dengan nota jujur, bukan angka rekaan.
 */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const has = fn => typeof window[fn]==='function';

  /* =========================================================
     ENJIN ANIMASI SPRITE SEBENAR (FRAME-BY-FRAME SEQUENCING)
     Untuk Wira Chibi & Pet Aurora di Pentas Menu V2
     ========================================================= */
  const HERO_FRAMES = [
    'assets/heroes/wira-chibi/frames/idle-loop-0-v1.webp',
    'assets/heroes/wira-chibi/frames/idle-loop-1-v1.webp',
    'assets/heroes/wira-chibi/frames/idle-loop-2-v1.webp',
    'assets/heroes/wira-chibi/frames/idle-loop-3-v1.webp'
  ];
  const HERO_FPS = 4.5; // ~220ms satu bingkai
  const HERO_QUOTES = [
    '⚔️ Kuasa Ais Sedia!',
    '❄️ Mari pertahankan nombor!',
    '🛡️ Perisai matematik teguh!',
    '💪 Bersedia untuk mengembara!'
  ];

  const PET_FRAMES = [
    'assets/pets/aurora/frames/joy-0-v1.webp',
    'assets/pets/aurora/frames/joy-1-v1.webp'
  ];
  const PET_FPS = 2.8; // ~350ms satu bingkai
  const PET_QUOTES = [
    '🐾 Pui-pui! Ekor goyang!',
    '❄️ Dingin dan ceria!',
    '✨ Teman setia Wira!',
    '💖 Pui-pui sayang Wira!'
  ];

  const spriteCache = {};
  function preloadSprites() {
    [...HERO_FRAMES, ...PET_FRAMES].forEach(u => {
      if (!spriteCache[u]) {
        const img = new Image();
        img.src = u;
        spriteCache[u] = img;
      }
    });
  }

  let heroFrameIdx = 0;
  let petFrameIdx = 0;
  let heroTimer = null;
  let petTimer = null;

  function renderHeroFrame() {
    if (!HERO_FRAMES.length) return;
    heroFrameIdx = (heroFrameIdx + 1) % HERO_FRAMES.length;
    const hero = $('mv2Hero');
    if (hero) hero.src = HERO_FRAMES[heroFrameIdx];
  }

  function renderPetFrame() {
    if (!PET_FRAMES.length) return;
    petFrameIdx = (petFrameIdx + 1) % PET_FRAMES.length;
    const pet = $('mv2Pet');
    if (pet) {
      pet.src = PET_FRAMES[petFrameIdx];
      pet.classList.remove('hidden');
    }
  }

  function startSpriteEngine() {
    if (heroTimer) clearInterval(heroTimer);
    if (petTimer) clearInterval(petTimer);

    heroTimer = setInterval(renderHeroFrame, 1000 / HERO_FPS);
    petTimer = setInterval(renderPetFrame, 1000 / PET_FPS);

    renderHeroFrame();
    renderPetFrame();
  }

  function stopSpriteEngine() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
    if (petTimer) { clearInterval(petTimer); petTimer = null; }
  }

  let speechTimeouts = {};
  function triggerSpeech(bubbleId, text) {
    const el = $(bubbleId);
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    if (speechTimeouts[bubbleId]) clearTimeout(speechTimeouts[bubbleId]);
    speechTimeouts[bubbleId] = setTimeout(() => {
      el.classList.remove('show');
    }, 2400);
  }

  function interactActor(actorType) {
    if (actorType === 'wira') {
      const q = HERO_QUOTES[Math.floor(Math.random() * HERO_QUOTES.length)];
      triggerSpeech('wiraBubble', q);
      const wiraSlot = $('wiraSlot');
      if (wiraSlot) {
        wiraSlot.classList.remove('actorHop');
        void wiraSlot.offsetWidth;
        wiraSlot.classList.add('actorHop');
      }
    } else if (actorType === 'pet') {
      const q = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
      triggerSpeech('petBubble', q);
      const petSlot = $('petSlot');
      if (petSlot) {
        petSlot.classList.remove('actorHop');
        void petSlot.offsetWidth;
        petSlot.classList.add('actorHop');
      }
    }
    if (has('playSfx')) try { playSfx('ui'); } catch(_) {}
  }

  let askedFor=null;
  function profileKey(){
    try{ return [db.cloudChildId||'',db.name||'',db.created||0].join('|') }catch(_){ return '' }
  }

  /* ---------------- pemilih menu ---------------- */
  function pickerEl(){
    let el=$('mv2Pick');
    if(el)return el;
    el=document.createElement('div');
    el.id='mv2Pick'; el.className='mv2Pick'; el.hidden=true;
    el.innerHTML=`
      <div class="mv2PickCard" role="dialog" aria-modal="true" aria-labelledby="mv2PickTitle">
        <b id="mv2PickTitle">Pilih paparan menu</b>
        <p>Kedua-duanya membawa kamu ke pengembaraan yang sama.</p>
        <div class="mv2PickBtns">
          <button type="button" class="v2">Menu V2</button>
          <button type="button" class="asal">Menu Asal</button>
        </div>
      </div>`;
    el.querySelector('.v2').onclick=()=>choose('v2');
    el.querySelector('.asal').onclick=()=>choose('asal');
    document.body.appendChild(el);
    return el;
  }
  function choose(style){
    pickerEl().hidden=true;
    if(typeof db!=='undefined'&&db){ db.menuStyle=style; if(has('save'))save() }
    if(has('playSfx'))try{playSfx('ui')}catch(_){}
    style==='v2' ? openMenuV2() : originalHub();
  }
  function askMenuStyle(){ pickerEl().hidden=false }

  /* ---------------- pembacaan data sebenar ---------------- */

  /* Seni pet mesti sepadan dengan Demo v2, yang memakai bingkai dalam
     `frames/` dan bukan seni `hub/adventure`. Laluan diterbitkan daripada
     aset `front` pet itu sendiri kerana folder tidak semestinya sama dengan
     idnya (`pembaris` tinggal dalam `kucing-pembaris/`). Setakat ini hanya
     Aurora mempunyai bingkai gembira itu, jadi pet lain jatuh kembali kepada
     seni `front` mereka melalui onerror — bukan kepada seni Aurora. */
  function happyFrame(pet){
    const src=pet&&pet.front;
    if(!src)return '';
    const i=src.lastIndexOf('/');
    return i<0?'':src.slice(0,i)+'/frames/happy-v1.webp';
  }
  function setPetArt(img,pet){
    if(!img)return;
    img.classList.toggle('hidden',!pet);
    if(!pet){ img.removeAttribute('src'); img.alt=''; return }
    img.alt=pet.name||'';
    const fallback=pet.front||pet.hub||'';
    const wanted=happyFrame(pet)||fallback;
    img.onerror=()=>{ img.onerror=null; if(fallback&&img.src!==fallback)img.src=fallback };
    if(img.getAttribute('src')!==wanted)img.src=wanted;
  }

  /* Kemahiran fokus: pilihan ibu bapa kalau ada, jika tidak kemahiran teras
     pertama bab semasa. Kedua-duanya wujud dalam profil — tiada tekaan. */
  function focusSkillId(){
    try{
      if(db.focus&&META[db.focus])return db.focus;
      const ch=String(db.activeMissionChapter||db.coreFrontier||1);
      const first=GRAPH.skills.find(x=>x.grade===db.schoolGrade&&String(x.chapter)===ch);
      return first?first.id:null;
    }catch(_){ return null }
  }

  /* Nota bukti mengikut gerbang sebenar powerLevel() dalam parent.js:
     perlu 2 bukti dan 2 percubaan sebelum kuasa boleh dibaca langsung. */
  function focusNote(id){
    const s=(has('scoreState')&&scoreState(id))||null;
    if(!s)return 'Sedia untuk diteroka dalam misi.';
    const attempts=Number(s.correct||0)+Number(s.wrong||0);
    const need=Math.max(2-Number(s.evidence||0), 2-attempts, 0);
    if(need>0)return `${need} lagi cabaran untuk buka tahap kuasa.`;
    const lvl=has('powerLevel')?powerLevel(s):0;
    if(lvl>=3)return 'Kuasa sudah kukuh.';
    const acc=attempts?Math.round(Number(s.correct||0)/attempts*100):0;
    return `Ketepatan ${acc}% · teruskan untuk kukuhkan kuasa!`;
  }

  function paint(){
    if(typeof db==='undefined'||!db)return;
    if(has('ensureProgression'))ensureProgression();
    if(has('updateFrontier'))updateFrontier();
    if(has('ensureRewards'))ensureRewards();

    // profil murid / avatar HUD
    const pname = $('mv2PlayerName');
    if (pname) pname.textContent = db.child || 'Aiman';
    const pbadge = $('mv2AvatarBadge');
    if (pbadge) pbadge.textContent = `Lv. ${db.level || 1}`;
    const pimg = $('mv2AvatarImg');
    if (pimg) pimg.src = 'assets/ui/menu-v2/stage-wira-v1.webp';

    // syiling: permainan ini tiada mata wang permata, jadi kita papar syiling
    // sebenar dengan ikonnya sendiri dan bukan nombor hiasan.
    const coins=$('mv2Coins');
    if(coins)coins.innerHTML=`<img src="assets/ui/coin-gold.svg" alt="syiling">${Number(db.coins||0)}`;

    // pengalaman
    const need=has('xpForLevel')?xpForLevel(db.level||1):120;
    const cur=Number(db.levelXp||0);
    const pct=Math.max(0,Math.min(100,Math.round(cur/Math.max(1,need)*100)));
    if($('mv2Level'))$('mv2Level').textContent=`Lv. ${db.level||1}`;
    if($('mv2XpText'))$('mv2XpText').textContent=`${cur} / ${need} XP`;
    if($('mv2XpFill'))$('mv2XpFill').style.width=pct+'%';

    /* Pentas Hero & Pet digerakkan oleh Enjin Animasi Sprite frame-by-frame.
       Kad "Pet Aktif" di bawah masih membaca pet sebenar yang dilengkapi. */
    startSpriteEngine();

    let pet=null;
    try{ pet=REWARD_PETS[db.rewards&&db.rewards.equippedPet]||null }catch(_){}

    /* Kad ini membuka Demo v2, dan Demo v2 SENGAJA tidak menulis apa-apa
       kepada kemajuan murid — tiada db.daily, db.xp, db.coins mahupun db.logs.
       Jadi kiraan harian tidak boleh dipapar di sini: murid akan bermain habis
       satu pusingan dan melihat nombor itu langsung tidak bergerak. Ayat ini
       menerangkan apa yang benar-benar berlaku. */

    // Kemahiran Fokus
    const fid=focusSkillId();
    const fname=$('mv2FocusName'), fpct=$('mv2FocusPct'), ffill=$('mv2FocusFill'), fnote=$('mv2FocusNote');
    if(fid){
      let title=fid, m=0;
      try{ title=(META[fid]&&META[fid].title)||fid }catch(_){}
      try{ m=Math.round(Number((scoreState(fid)||{}).mastery||0)) }catch(_){}
      if(fname)fname.textContent=title;
      if(fpct)fpct.textContent=m+'%';
      if(ffill)ffill.style.width=Math.max(0,Math.min(100,m))+'%';
      if(fnote)fnote.textContent=focusNote(fid);
    }else{
      if(fname)fname.textContent='Belum ditetapkan';
      if(fpct)fpct.textContent='—';
      if(ffill)ffill.style.width='0%';
      if(fnote)fnote.textContent='Mula satu misi untuk menguji kuasa kamu.';
    }

    // Pet Aktif. Tahap dan ikatan belum dijejaki dalam `db`, jadi ia 0% dan
    // notanya berkata begitu. Jangan gantikan dengan nombor yang comel.
    if($('mv2PetName'))$('mv2PetName').textContent=pet?pet.name:'Belum ada teman';
    const face=$('mv2PetFace');
    if(face)setPetArt(face,pet);
    if($('mv2PetFill'))$('mv2PetFill').style.width='0%';
    if($('mv2PetLv'))$('mv2PetLv').textContent='Lv. 1';
    if($('mv2PetBondLabel'))$('mv2PetBondLabel').textContent=pet?'Sahabat':'—';
    if($('mv2PetNote'))$('mv2PetNote').textContent=pet
      ? 'Ikatan pet belum dijejaki lagi.'
      : 'Pilih teman dalam Koleksi Pet.';

    if(has('save'))save();
  }

  /* ---------------- masuk / keluar ---------------- */
  function originalHub(){
    const orig=renderHub.__mv2original;
    if(orig)orig.call(window); else if(has('screen'))screen('hub');
  }
  function openMenuV2(){
    if(typeof db==='undefined'||!db)return has('goLogin')?goLogin():null;
    if(has('enforceRestuLock')&&enforceRestuLock())return;
    preloadSprites();
    paint();
    startSpriteEngine();
    bindCards();
    if(has('screen'))screen('menuV2');
  }
  /* Dua kad utama. `Jejak Pet` meneruskan misi bab semasa, sama seperti
     butang teruskan pada menu asal. `Pilih Topik` membuka senarai topik
     (skrin Misi) — di situlah Cikgu Dimensi mengajar murid melalui bab yang
     dipilih. Tiada pemilih topik khusus untuk mod belajar lagi. */
  function bindCards(){
    const quest=$('mv2QuestCard');
    if(quest&&!quest.dataset.bound){ quest.dataset.bound='1';
      quest.onclick=()=>{ if(has('openSegelDemo'))openSegelDemo();
                          else if(has('continueHubMission'))continueHubMission() } }
    const learn=$('mv2LearnCard');
    if(learn&&!learn.dataset.bound){ learn.dataset.bound='1';
      learn.onclick=()=>{ if(has('navMission'))navMission() } }
  }

  /* ---------------- pemasangan ---------------- */
  function install(){
    if(!has('renderHub')||renderHub.__mv2original)return;
    const original=window.renderHub;
    const wrapped=function(){
      if(typeof db==='undefined'||!db)return original.apply(this,arguments);
      /* Soalan mesti berada DI SINI, bukan pada startNew/resumeGame. Profil
         sebenar dipilih melalui profile-manager (`selectProfile`), log masuk
         awan (cloud.js) dan laluan peranan login — ketiga-tiganya memanggil
         renderHub() terus dan tidak pernah menyentuh startNew. renderHub
         ialah satu-satunya pintu yang semuanya lalui.

         Kunci profil memastikan ia ditanya sekali bagi setiap profil: menukar
         anak bertanya semula, tetapi kembali ke Utama dari dalam permainan
         tidak. */
      const key=profileKey();
      if(askedFor!==key){ askedFor=key; askMenuStyle(); return }
      if(db.menuStyle==='v2')return openMenuV2();
      return original.apply(this,arguments);
    };
    wrapped.__mv2original=original;
    window.renderHub=wrapped;

    window.openMenuV2=openMenuV2;
    window.askMenuStyle=askMenuStyle;
    window.PAMenuV2={
      version:'1.0.0',
      paint,
      ask:askMenuStyle,
      open:openMenuV2,
      interact:interactActor,
      startEngine:startSpriteEngine,
      stopEngine:stopSpriteEngine
    };
  }

  (function boot(){
    if(!has('renderHub'))return setTimeout(boot,60);
    install();
  })();
})();
