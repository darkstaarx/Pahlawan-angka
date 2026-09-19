/* Menu V2 — laman utama PRODUKSI. v1.0.0
 *
 * Keputusan pemilik (produksi): Menu V2 ialah menu tunggal untuk murid
 * biasa. Tiada lagi soalan "Menu V2 atau menu asal": renderHub() sentiasa
 * membuka Menu V2 untuk profil sebenar. Nilai lama `db.menuStyle` diabaikan
 * dengan sengaja supaya profil lama tidak tersangkut pada Hub lama.
 *
 * Hub lama, skrin Misi lama dan skrin battle lama TIDAK dibuang — ia kekal
 * dalam index.html sebagai laluan dev/sandaran (PAMenuV2.legacyHub(),
 * PAMenuV2.legacyMissions(), panel DEV). Ia tidak lagi boleh dicapai daripada
 * laluan produksi normal.
 *
 * Dua kad produksi:
 *   1. Selamatkan Pet   — Map V2 (pilih Darjah/Topik sendiri) -> Gembok V2
 *   2. Kembara Dimensi  — laluan Cikgu/adaptif (pemilih kemahiran sebenar)
 *                         -> Gembok V2
 *
 * ATURAN DATA: setiap nombor di skrin ini mesti datang daripada profil
 * sebenar. Satu sahaja yang belum wujud dalam `db` — ikatan pet — dan ia
 * dipaparkan sebagai 0% dengan nota jujur, bukan angka rekaan.
 *
 * HAD YANG DIKETAHUI (jangan dakwa lebih daripada ini):
 *   - Gembok V2 menjalankan soalan sebenar daripada bank, tetapi ia TIDAK
 *     menulis bukti pembelajaran (mastery/evidence/XP) kepada profil. Jadi
 *     kedua-dua kad membuka pengalaman sebenar tanpa integrasi pembelajaran
 *     penuh. Integrasi itu kerja berasingan yang masih belum siap.
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
  /* Pemilih "Menu V2 atau Menu Asal" telah DIBUANG untuk produksi. Kalau
     dialog lama masih ada dalam DOM daripada sesi terdahulu, tutup ia. */
  function killPicker(){
    const el=$('mv2Pick');
    if(el){ el.hidden=true; el.remove() }
  }

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
    /* `db.child` tidak pernah wujud: app.js startNew() menyimpan nama pada
       `db.name` (id input HTML sahaja yang bernama "child"). Jadi menu ini
       dahulunya sentiasa memaparkan nama lalai "Aiman" walaupun untuk profil
       lain — nombor/nama rekaan, bertentangan dengan ATURAN DATA di atas.
       Sekarang Menu V2 ialah menu produksi, jadi ini mesti nama sebenar. */
    const pname = $('mv2PlayerName');
    if (pname) pname.textContent = db.name || db.child || '';
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
  }

  /* ---------------- masuk / keluar ---------------- */
  function originalHub(){
    const orig=renderHub.__mv2original;
    if(orig)orig.call(window); else if(has('screen'))screen('hub');
  }
  function openMenuV2(){
    if(typeof db==='undefined'||!db)return has('goLogin')?goLogin():null;
    if(has('enforceRestuLock')&&enforceRestuLock())return;
    killPicker();
    preloadSprites();
    paint();
    startSpriteEngine();
    bindCards();
    if(has('screen'))screen('menuV2');
  }

  /* =========================================================
     MAP V2 — pilih topik sendiri (semantik misi manual)
     =========================================================
     Map V2 memakai semula skrin `#missions` yang sudah ada, termasuk kad
     `.missionCard` dan gaya visualnya, jadi tiada CSS baharu diperlukan dan
     bahasa visual pemilik terpelihara. Yang berubah hanya:
       - nod dibina daripada GRAPH/profil sebenar (topik Darjah murid, kunci
         mengikut db.coreFrontier) — bukan nod rekaan,
       - ketikan topik mengekalkan semantik misi manual sedia ada
         (db.activeMissionChapter = topik itu, sama seperti startMission)
         kemudian membuka Gembok V2 pada topik itu,
       - pintu masuk lama pada skrin itu (kad "Cikgu Pilihkan" dan pembayang
         "Atau pilih topik sendiri") disembunyikan daripada laluan normal.
         Ia tidak dibuang: renderMissions() lama masih memaparkannya untuk dev. */
  let legacyMissionChrome=null;
  function missionChrome(){
    const section=document.getElementById('missions');
    if(!section)return null;
    const coach=section.querySelector('.autoCoachCard');
    const hint=section.querySelector('.coachChoiceHint');
    const eyebrow=section.querySelector('.topNav .eyebrow');
    const title=eyebrow&&eyebrow.parentElement?eyebrow.parentElement.querySelector('b'):null;
    if(!legacyMissionChrome){
      legacyMissionChrome={
        eyebrow:eyebrow?eyebrow.textContent:'',
        title:title?title.textContent:''
      };
    }
    return {section,coach,hint,eyebrow,title};
  }
  function setMapChrome(on){
    const c=missionChrome();
    if(!c)return;
    if(c.coach)c.coach.hidden=!!on;
    if(c.hint)c.hint.hidden=!!on;
    if(on){
      if(c.eyebrow)c.eyebrow.textContent='PETA TOPIK';
      if(c.title)c.title.textContent=`Darjah ${db.schoolGrade} · Pilih Topik`;
    }else if(legacyMissionChrome){
      if(c.eyebrow)c.eyebrow.textContent=legacyMissionChrome.eyebrow;
      if(c.title)c.title.textContent=legacyMissionChrome.title;
    }
    if(c.section)c.section.dataset.mv2Map=on?'1':'';
  }

  /* Satu nod = satu topik KSSR yang benar-benar ada untuk Darjah murid.
     Semua nombor (peratus, bintang, kunci) dibaca daripada fungsi progression
     sedia ada. Tiada tag atau topik direka di sini. */
  function mapChapters(){
    try{
      return [...new Set(GRAPH.skills.filter(x=>x.grade===db.schoolGrade).map(x=>String(x.chapter)))]
        .sort((a,b)=>+a-+b);
    }catch(_){ return [] }
  }
  function openTopic(ch){
    if(typeof db==='undefined'||!db)return;
    if(has('enforceRestuLock')&&enforceRestuLock())return;
    if(has('ensureProgression'))ensureProgression();
    /* Semantik misi manual sedia ada: topik yang dipilih menjadi topik aktif
       profil, sama seperti startMission(ch) lakukan. */
    db.activeMissionChapter=String(ch);
    if(has('save'))save();
    if(has('playSfx'))try{playSfx('ui')}catch(_){}
    if(has('openGembok'))return openGembok({chapter:String(ch)});
  }
  function openMapV2(){
    if(typeof db==='undefined'||!db)return has('goLogin')?goLogin():null;
    if(has('enforceRestuLock')&&enforceRestuLock())return;
    if(has('ensureProgression'))ensureProgression();
    if(has('updateFrontier'))updateFrontier();
    const wrap=document.getElementById('missionGrid');
    if(!wrap)return;
    wrap.innerHTML='';
    setMapChrome(true);
    const dev=has('isDevMode')&&isDevMode();
    mapChapters().forEach(ch=>{
      const locked=!dev&&+ch>db.coreFrontier;
      let mastery=0,stars=0,title=`Topik ${ch}`,kicker=`Topik ${ch}`,icon='⭐';
      try{ mastery=chapterMasteryPct(ch) }catch(_){}
      try{ stars=db.chapterStars&&db.chapterStars[ch]||0 }catch(_){}
      try{ title=chapterTitle(ch) }catch(_){}
      try{ icon=chapterIcon(ch) }catch(_){}
      try{
        const ref=chapterSkills(ch)[0];
        kicker=ref&&ref.textbookUnit?`KSSR Unit ${ref.textbookUnit}`:`Topik ${ch}`;
      }catch(_){}
      const card=document.createElement('button');
      card.type='button';
      card.className='missionCard '+(locked?'locked':(+ch===db.coreFrontier?'current':''))+(dev?' devUnlocked':'');
      card.disabled=locked;
      card.dataset.mv2Topic=String(ch);
      const starsText=has('starString')?starString(stars):'';
      const lockedText=has('lockedMissionCopy')?lockedMissionCopy(ch):`Buka selepas Topik ${Math.max(1,+ch-1)}`;
      card.innerHTML=`<div class="missionIcon">${locked?'🔒':icon}</div><div class="missionBody"><div class="missionKicker">${kicker}</div><b>${title}</b><div class="missionStars">${starsText}</div><div class="missionMeter"><span style="width:${mastery}%"></span></div><small>${locked?lockedText:mastery+'% kemajuan'}</small></div><div class="missionArrow">›</div>`;
      if(!locked)card.onclick=()=>openTopic(ch);
      wrap.appendChild(card);
    });
    if(has('screen'))screen('missions');
  }

  /* =========================================================
     KEMBARA DIMENSI — laluan Cikgu/adaptif
     =========================================================
     Ini BUKAN pemilih topik manual. Ia meminta Gembok V2 memilih setiap
     kemahiran melalui pemilih adaptif produksi (chooseModeAndSkill ->
     chooseCoachFrontierSkill), yang membaca keadaan pembelajaran sebenar
     (db.skills melalui scoreState).

     HAD JUJUR: pemilihan adalah adaptif sebenar, tetapi Gembok V2 tidak
     memanggil recordFrontierResponse()/recordMissionAnswer(), jadi jawapan di
     sini tidak menambah bukti frontier. Jangan dakwa pariti adaptif penuh. */
  function openKembaraDimensi(){
    if(typeof db==='undefined'||!db)return has('goLogin')?goLogin():null;
    if(has('enforceRestuLock')&&enforceRestuLock())return;
    if(has('ensureProgression'))ensureProgression();
    if(has('updateFrontier'))updateFrontier();
    if(typeof chooseModeAndSkill!=='function'){
      // Tiada pemilih adaptif = jangan jatuh senyap kepada pilihan manual.
      if(has('showRewardToast'))showRewardToast('Laluan Cikgu belum tersedia.');
      return;
    }
    const confirmed=()=>{if(has('playSfx'))try{playSfx('ui')}catch(_){}if(has('openGembok'))openGembok({adaptive:true});};
    const accepted=window.confirm('Cikgu Dimensi akan pilih latihan yang sesuai untuk kamu. Mulakan sekarang?');
    if(accepted)confirmed();
  }

  /* Dua kad produksi. */
  function bindCards(){
    const quest=$('mv2QuestCard');
    if(quest&&!quest.dataset.boundV2){ quest.dataset.boundV2='1';
      quest.onclick=()=>openMapV2() }
    const learn=$('mv2LearnCard');
    if(learn&&!learn.dataset.boundV2){ learn.dataset.boundV2='1';
      learn.onclick=()=>openKembaraDimensi() }
  }

  /* ---------------- pemasangan ---------------- */
  function install(){
    if(!has('renderHub')||renderHub.__mv2original)return;
    const original=window.renderHub;
    const wrapped=function(){
      if(typeof db==='undefined'||!db)return original.apply(this,arguments);
      /* renderHub ialah satu-satunya pintu yang dilalui oleh semua laluan
         profil sebenar (profile-manager `selectProfile`, log masuk awan
         cloud.js, laluan peranan login). Jadi di sini Menu V2 menjadi menu
         produksi: tiada soalan, tiada Hub lama.

         `db.menuStyle` lama (termasuk 'asal') sengaja TIDAK dibaca lagi. */

      /* Gerbang yang renderHub() asal jalankan SEBELUM melukis hub mesti
         kekal berjalan, kalau tidak murid awan boleh melepasi onboarding
         penjaga. Syaratnya disalin daripada js/progression.js:57-59 dengan
         sengaja: memanggil renderHub asal di sini akan melukis Hub lama. */
      try{
        const cloudState=window.PACloud&&window.PACloud.state;
        const activeProfile=cloudState&&cloudState.profiles&&cloudState.profiles.find
          ? cloudState.profiles.find(p=>p.id===cloudState.childId) : null;
        if(cloudState&&cloudState.user&&!(db.onboarding&&db.onboarding.completed)
           &&activeProfile&&window.PAOnboarding&&window.PAOnboarding.beginExisting){
          return window.PAOnboarding.beginExisting(activeProfile);
        }
      }catch(_){}
      if(has('enforceRestuLock')&&enforceRestuLock())return;

      askedFor=profileKey();
      return openMenuV2();
    };
    wrapped.__mv2original=original;
    window.renderHub=wrapped;

    /* Skrin Misi lama masih wujud untuk dev. Laluan normal (nav bawah "Misi",
       navMission()) mesti mendarat pada Map V2, bukan pada skrin lama dengan
       kad "Cikgu Pilihkan" yang membuka battle lama. */
    const legacyMissions=window.navMission;
    if(typeof legacyMissions==='function'&&!legacyMissions.__mv2wrapped){
      const wrappedNav=function(){
        if(typeof db==='undefined'||!db)return legacyMissions.apply(this,arguments);
        return openMapV2();
      };
      wrappedNav.__mv2wrapped=true;
      wrappedNav.__mv2original=legacyMissions;
      window.navMission=wrappedNav;
    }
    /* renderMissions() lama (dev) mesti memulihkan chrome asalnya. */
    const legacyRender=window.renderMissions;
    if(typeof legacyRender==='function'&&!legacyRender.__mv2wrapped){
      const wrappedRender=function(){
        setMapChrome(false);
        return legacyRender.apply(this,arguments);
      };
      wrappedRender.__mv2wrapped=true;
      wrappedRender.__mv2original=legacyRender;
      window.renderMissions=wrappedRender;
    }

    window.openMenuV2=openMenuV2;
    window.openMapV2=openMapV2;
    window.PAMenuV2={
      version:'1.0.0',
      paint,
      open:openMenuV2,
      map:openMapV2,
      topic:openTopic,
      kembara:openKembaraDimensi,
      /* Laluan dev/sandaran sahaja — bukan untuk murid. */
      legacyHub:originalHub,
      legacyMissions:()=>{ const f=window.renderMissions&&window.renderMissions.__mv2original;
                           setMapChrome(false); return f?f.call(window):null },
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
