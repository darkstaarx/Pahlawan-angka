/* Gembok Tambah — demo pentas WebGL v2.1.0 (fail: segel-demo-v2.1.0.js)
 *
 * NOTA ISTILAH: yang murid baca ialah "Gembok"; "segel" dalam nama fail,
 * pengecam, kelas CSS dan laluan aset sengaja DIKEKALKAN. Menamakan semula
 * semuanya ialah refactor besar tanpa sebarang faedah kepada murid. Kalau
 * anda menambah teks baharu yang dilihat murid, tulis "gembok".
 *
 * Kenapa demo ini wujud: ia menjalankan soalan SEBENAR dari bank (generate())
 * di atas pentas Three.js, supaya kita boleh nilai rasa pentas baharu tanpa
 * mengubah battle sedia ada. Tiada apa-apa di sini menulis ke progress murid.
 *
 * Tiga lapisan:
 *   1. pentas   — Three.js dalam satu <canvas>
 *   2. HUD      — DOM di atas canvas
 *   3. soalan   — DOM, guna .qcard/.question/.answers/.ans yang sama dengan battle
 *
 * Kanun segel (jangan ubah tanpa keputusan pemilik):
 *   Brain CURRENT_STATE.md:19 — "Gangsa 2 hits -> Perak 3 hits -> Emas 5 hits".
 *   Web docs/WORLD-BIBLE-NEW-ERA-v1.md:219-243 — tier, warna dan perwatakan.
 *   Unity RescueLightSeals.cs — susunan, warna cahaya dan kadar denyut.
 *   Makhluk bukan musuh: Wira menyerang SEGEL, tidak pernah menyerang Aurora
 *   (decisions/2026-09-11-rescue-not-enemy-combat.md).
 */
(function(){
  'use strict';

  /* Tier segel. hits/warna/denyut diambil terus dari kanun di atas. */
  /* Satu segel kelihatan pada satu masa: Gangsa dahulu, kemudian Perak,
     kemudian Emas. Tiga kubah sepusat serentak mengelirukan — mata tidak dapat
     baca yang mana satu sedang diserang. Saiz menaik sedikit setiap tier
     supaya "lebih kuat" terbaca tanpa perlu satu baris teks pun. */
  const TIERS=[
    /* `visible` ialah tinggi kubah YANG KELIHATAN, bukan tinggi bingkai.
       Ketiga-tiga PNG 768x768, tetapi lukisannya mengisi bingkai dengan kadar
       berbeza: Gangsa 0.81, Perak 0.78, Emas 0.93. Menetapkan tinggi bingkai
       bermakna Emas terjadi 30% lebih besar daripada Gangsa walaupun
       nombornya hanya berbeza 12%.

       Menambat pada tinggi SAHAJA pun tidak memadai, kerana nisbah bentuk
       ketiga-tiga lukisan berbeza (Gangsa 1.100, Perak 1.137, Emas 1.049).
       Dengan tinggi 2.05/2.20/2.35 dahulu, lebarnya menjadi 2.25/2.50/2.47 —
       iaitu Emas lebih SEMPIT daripada Perak. Kubah bertukar bentuk, bukan
       sekadar membesar, dan itulah yang terbaca sebagai "lari".

       Jadi nombor di bawah diterbitkan daripada saiz TANGGAPAN, iaitu min
       geometri sqrt(lebar*tinggi), yang dinaikkan sama rata kira-kira 8%
       setiap tier: 2.150 -> 2.325 -> 2.509. Tinggi setiap tier kemudian
       dikira daripada nisbah bentuknya sendiri, jadi kedua-dua lebar dan
       tinggi kini menaik secara monotoni. */
    {key:'gangsa', name:'GANGSA', hits:2, color:0xff6e29, period:3.4, visible:2.05},
    {key:'perak',  name:'PERAK',  hits:3, color:0xbde0ff, period:3.0, visible:2.18},
    {key:'emas',   name:'EMAS',   hits:5, color:0xffb838, period:2.6, visible:2.45}
  ];
  const SEAL_HITS=TIERS.reduce((n,t)=>n+t.hits,0);  // 10 hentaman = 2+3+5
  /* Dua soalan lebih daripada jumlah hentaman. Tanpa ruang ini satu jawapan
     salah sahaja sudah bermakna Aurora tidak dapat diselamatkan, dan kanun
     2/3/5 itu jadi hukuman, bukan cabaran. */
  const MAX_Q=SEAL_HITS+2;

  const FRAMES={
    arena:'assets/battlefields/money-market/arena-v1.webp',
    heroIdle:[0,1,2,3].map(i=>`assets/heroes/wira-chibi/frames/idle-loop-${i}-v1.webp`),
    heroPrepare:'assets/heroes/wira-chibi/frames/rescue-prepare-v1.webp',
    heroSlash:'assets/heroes/wira-chibi/frames/rescue-slash-v1.webp',
    petSad:[0,1,2,3,4,5,6,7].map(i=>`assets/pets/aurora/frames/sad-${i}-v1.webp`),
    petJoy:[0,1].map(i=>`assets/pets/aurora/frames/joy-${i}-v1.webp`),
    petHappy:'assets/pets/aurora/frames/happy-v1.webp',
    // v2: 24-frame sorakan penuh (angkat, denyar, letusan ais, pulih, angkat
    // semula) menggantikan gelung 4-bingkai lama supaya gerakannya lebih
    // licin dan tidak lagi bergantung pada penormalan saiz per-bingkai.
    heroHappy:Array.from({length:24},(_,i)=>`assets/heroes/wira-chibi/frames/happy-${String(i).padStart(2,'0')}-v2.webp`),
    heroVictory:'assets/heroes/wira-chibi/frames/victory-v1.webp',
    seals:TIERS.map(t=>`assets/fx/segel/${t.key}-v1.webp`),
    iceBurst:'assets/fx/wira/final-v2/fx-ice-electric-burst-v1.webp',
    iceEnd:'assets/fx/wira/final-v2/fx-impact-end-v1.webp',
    coin:'assets/fx/reward/coin-v1.webp',
    trail:'assets/fx/reward/trail-v1.webp',
    flare:'assets/fx/reward/flare-v1.webp'
  };
  const COINS=6;   // sama dengan RescueRewardOrbs.cs

  /* Masa bingkai idle. Nafas Wira ialah 4 bingkai dengan bingkai ke-4 mata
     tertutup, jadi kelipan mesti pendek — kalau semua bingkai sama panjang,
     Wira nampak mengantuk dan gerakannya terlalu laju sekali gus. */
  const HERO_IDLE_HOLD=[0.40,0.40,0.40,0.11];    // satu kitaran 1.31s
  // Sorakan v2 ada 24 bingkai untuk satu jujukan penuh (bukan gelung idle
  // pendek), jadi ia main pada fps tetap dan bukan senarai heldFrame.
  const HERO_CHEER_FPS=12;                       // satu kitaran 2.0s
  /* Aurora sedang sedih dan terkurung, jadi dia hampir tidak bergerak: setiap
     pose bertahan ~2.6s. Bingkai 2 dan 7 ialah mata tertutup, jadi keduanya
     ditahan pendek sahaja — kalau tidak dia nampak tertidur, bukan sayu. */
  const PET_IDLE_HOLD=[2.6,2.6,0.16,2.6,2.6,2.6,2.6,0.16];
  // Empat petak sprite sheet untuk pet dev. Tempoh yang sama memastikan
  // setiap muka sedih dibaca satu demi satu, bukan berhenti lama di bingkai
  // terakhir (PET_IDLE_HOLD Aurora mempunyai lapan nilai).
  // Ikut rentak Aurora: satu pose sayu ditahan lama supaya murid sempat
  // membaca ekspresi pet, bukan melihat ia berkelip seperti GIF laju.
  const PET_SHEET_HOLD=[2.6,2.6,2.6,2.6];

  function devPetConfig(){
    return entryMode&&entryMode.devBattlefield&&entryMode.pet&&typeof entryMode.pet==='object'
      ? entryMode.pet : null;
  }
  function devPetName(){ return devPetConfig()?.name||'Aurora' }
  function devSubject(text){ return devPetConfig()?String(text).replace(/Aurora/g,devPetName()):text }

  let THREE=null, stage=null, booting=null, run=null, reduceMotion=false;

  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const damp = (c,t,l,dt) => c + (t-c)*(1-Math.exp(-l*dt));
  const sfx = name => { try{ if(typeof playSfx==='function')playSfx(name) }catch(_){} };
  const mix = list => (typeof shuffle==='function') ? shuffle(list) : [...list].sort(()=>Math.random()-.5);

  /* Letupan segel: tiada fail wav yang sesuai dalam bank bunyi, jadi ia
     disintesis — nada menjunam (gelembung pecah) + desis pendek (serpihan
     cahaya). Guna AudioContext yang sama dengan audio.js, bukan yang baharu. */
  /* Unity menaikkan pic setiap syiling supaya kutipan terasa mendaki.
     playSfx() tiada kawalan pic, jadi mainkan sendiri di sini. */
  function coinSfx(i){
    try{
      if(typeof paMuted!=='undefined'&&paMuted)return;
      const src=(typeof PA_AUDIO!=='undefined')?PA_AUDIO.coinPickup:null;
      if(!src)return;
      const base=(typeof PA_AUDIO_CACHE!=='undefined')?PA_AUDIO_CACHE.coinPickup:null;
      const a=base?base.cloneNode(true):new Audio(src);
      a.playbackRate=1+Math.min(i,5)*.035;
      a.volume=.55*((typeof PA_VOLUME_SCALE!=='undefined')?PA_VOLUME_SCALE:.8);
      const pr=a.play(); if(pr&&pr.catch)pr.catch(()=>{});
    }catch(_){}
  }

  function popSound(){
    try{
      if(typeof paMuted!=='undefined'&&paMuted)return;
      const ctx=(typeof ensureBattleAudio==='function')?ensureBattleAudio():null;
      if(!ctx)return;
      if(ctx.state==='suspended')ctx.resume().catch(()=>{});
      const now=ctx.currentTime, out=ctx.createGain();
      out.gain.value=.5*((typeof PA_VOLUME_SCALE!=='undefined')?PA_VOLUME_SCALE:.8);
      out.connect(ctx.destination);

      const osc=ctx.createOscillator(), tone=ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(900,now);
      osc.frequency.exponentialRampToValueAtTime(140,now+.14);
      tone.gain.setValueAtTime(.0001,now);
      tone.gain.exponentialRampToValueAtTime(.55,now+.008);
      tone.gain.exponentialRampToValueAtTime(.0001,now+.17);
      osc.connect(tone).connect(out); osc.start(now); osc.stop(now+.22);

      const len=Math.floor(ctx.sampleRate*.22), buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
      const noise=ctx.createBufferSource(), hp=ctx.createBiquadFilter(), hiss=ctx.createGain();
      noise.buffer=buf; hp.type='highpass'; hp.frequency.value=1800;
      hiss.gain.setValueAtTime(.34,now);
      hiss.gain.exponentialRampToValueAtTime(.0001,now+.22);
      noise.connect(hp).connect(hiss).connect(out); noise.start(now);

      setTimeout(()=>{try{out.disconnect()}catch(_){}},900);
    }catch(_){}
  }

  // Bingkai idle dengan tempoh berbeza setiap satu.
  function heldFrame(frames, holds, t){
    const cycle=holds.reduce((a,b)=>a+b,0);
    let x=t%cycle;
    for(let i=0;i<frames.length;i++){ if(x<holds[i])return frames[i]; x-=holds[i] }
    return frames[frames.length-1];
  }

  /* =================================================================
     PENTAS
     ================================================================= */
  async function buildStage(){
    const canvas=$('segelCanvas'), host=$('segelStage');
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); // had DPR: jaga bateri
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(36,1,.1,100);
    camera.position.z=10;

    const loader=new THREE.TextureLoader();
    const load = url => new Promise(res=>{
      loader.load(url, t=>{ t.colorSpace=THREE.SRGBColorSpace; res(t) }, undefined, ()=>res(null));
    });

    const [arenaTex, heroIdle, heroPrepare, heroSlash, petSad, petJoy, sealTex,
           coinTex, trailTex, flareTex, heroHappy, iceBurstTex, iceEndTex] = await Promise.all([
      load(FRAMES.arena),
      Promise.all(FRAMES.heroIdle.map(load)),
      load(FRAMES.heroPrepare),
      load(FRAMES.heroSlash),
      Promise.all(FRAMES.petSad.map(load)),
      Promise.all(FRAMES.petJoy.map(load)),
      Promise.all(FRAMES.seals.map(load)),
      load(FRAMES.coin), load(FRAMES.trail), load(FRAMES.flare),
      Promise.all(FRAMES.heroHappy.map(load)),
      load(FRAMES.iceBurst), load(FRAMES.iceEnd)
    ]);

    /* latar: dimuatkan "cover" supaya tiada jalur kosong pada apa-apa bentuk skrin */
    const bg=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
      new THREE.MeshBasicMaterial({map:arenaTex,depthWrite:false}));
    bg.position.z=-8; scene.add(bg);
    const worldH = z => 2*Math.tan(camera.fov*Math.PI/360)*(camera.position.z-z);
    function fitBg(){
      const img=arenaTex&&arenaTex.image; if(!img)return;
      const a=img.width/img.height, vh=worldH(-8), vw=vh*camera.aspect;
      const h=Math.max(vh, vw/a); bg.scale.set(h*a,h,1);
      bg.position.y=S.camY;
    }

    /* Bingkai dilukis pada saiz bingkai berbeza (idle 480px, tebasan 768px) dan
       watak menduduki pecahan berbeza dalam setiap bingkai. Kalau kita kunci
       tinggi satah, Wira mengecut masa menyerang. Jadi:
         - satu aktor = satu skala piksel-per-unit yang tetap
         - setiap bingkai diukur (kotak alfa) dan ditambat pada KAKI watak
       Kubah segel ditambat cara yang sama: tepi bawah alfa ialah garisan
       lantainya, jadi kubah duduk atas lantai yang sama dengan Aurora.
       Pengukuran dibuat pada canvas 96x96: pecahan bingkai tidak berubah bila
       diturunkan resolusi, jadi ia tepat dan murah walaupun pada telefon lama. */
    /* Satu garisan lantai untuk semua: Wira, Aurora dan tapak kubah segel.
       Sebelum ini Aurora terapung 0.43 unit di atas lantai Wira, jadi dia
       nampak berdiri di hadapan kubah, bukan terkurung di dalamnya. */
    const PET_UPP=1.22/400;
    const GROUND=-1.92, HERO_GROUND=GROUND, PET_FEET=GROUND;
    const SEAL_X=1.52, HERO_HOME=-1.62;
    const PET_FACE_Y=.74;          // paras muka Aurora di atas lantai
    const probe=document.createElement('canvas'); probe.width=probe.height=96;
    const probeCtx=probe.getContext('2d',{willReadFrequently:true});
    /* N=96 sudah cukup tepat untuk offX/offY (jangkar kaki/tengah) kerana
       kesilapan seposisi kecil di situ tidak kelihatan. Ia TIDAK cukup
       tepat untuk boxH bila dipakai untuk KIRA SAIZ (heroCalibratedUpp
       di bawah): hujung pedang tegak Wira ialah satu-dua piksel lebar
       pada kanvas sumbernya, dan bila disusutkan terus ke 96x96, hujung
       nipis itu kadangkala hilang terus selepas antialiasing — diukur
       terus di Python terhadap bingkai sebenar, happy-00 catat boxH 0.70
       pada N=96 tetapi 0.88 pada N=256+ (dan idle/prepare/petJoy stabil
       merentasi resolusi kerana siluet mereka lebih pejal di hujung).
       Itulah sebab sorakan sentiasa tersilap saiz walaupun jangkar kepala
       sudah betul — pengiraan SAIZ masih memanggil measure() yang sama.
       measureAt() bagi resolusi boleh dipilih: N=96 untuk kegunaan
       kerap/panas (jangkar setiap bingkai), N besar (measureHiRes)
       khusus untuk pengiraan saiz sekali sahaja di heroCalibratedUpp. */
    function measureAt(img,N,ctx){
      try{
        ctx.clearRect(0,0,N,N); ctx.drawImage(img,0,0,N,N);
        const d=ctx.getImageData(0,0,N,N).data;
        let x0=N,y0=N,x1=-1,y1=-1, maxSolid=0;
        const solidRow=new Array(N).fill(0);
        for(let y=0;y<N;y++){
          let solid=0;
          for(let x=0;x<N;x++){
            const a=d[(y*N+x)*4+3];
            if(a>18){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y }
            if(a>150)solid++;
          }
          solidRow[y]=solid; if(solid>maxSolid)maxSolid=solid;
        }
        if(x1<0)return {foot:0,cx:0,ring:1,boxH:1,boxW:1};
        /* Gelang tapak ialah jalur TERBAWAH yang masih pekat, bukan yang paling
           tebal. Emas mempunyai gelang dalam yang lebih tebal pada 0.73 dan
           gelang lantai sebenarnya pada 0.92 — memilih yang paling tebal
           menenggelamkan kubah emas sedalam 0.19 bingkai. */
        let ringRow=y1;
        for(let y=N-1;y>=0;y--){ if(solidRow[y]>maxSolid*.30){ ringRow=y; break } }
        return {foot:(N-1-y1)/N, cx:((x0+x1)/2)/N-.5, ring:ringRow/N,
                boxH:(y1-y0+1)/N, boxW:(x1-x0+1)/N};
      }catch(_){ return {foot:0,cx:0,ring:1,boxH:1,boxW:1} }
    }
    function measure(img){ return measureAt(img,96,probeCtx) }
    function measureHiRes(img){
      const N=512, c=document.createElement('canvas'); c.width=c.height=N;
      return measureAt(img,N,c.getContext('2d',{willReadFrequently:true}));
    }
    function entry(tex,upp){
      const img=tex&&tex.image;
      if(!img)return {tex,w:1,h:1,offX:0,offY:.5};
      const w=img.width*upp, h=img.height*upp, m=measure(img);
      return {tex, w, h, offX:-m.cx*w, offY:h*(.5-m.foot)};
    }
    /* Kubah TIDAK boleh ditambat pada hujung alfa: cahaya luarnya terbentang
       jauh di bawah gelang tapak (Emas: alfa 0.94 tetapi gelang 0.73), jadi
       tapaknya terapung sehingga 0.6 unit atas lantai dan kaki Aurora
       terkeluar di bawahnya. Tambat pada gelang tapak. */
    function sealEntry(tex,visibleH){
      const img=tex&&tex.image;
      if(!img)return {tex,w:1,h:1,offX:0,offY:.5,visW:1};
      const m=measure(img);
      // Skala satah supaya KOTAK ALFA sepadan dengan tinggi yang dikehendaki.
      const planeH=visibleH/Math.max(.2,m.boxH), upp=planeH/img.height;
      const w=img.width*upp, h=img.height*upp;
      return {tex, w, h, offX:-m.cx*w, offY:h*(m.ring-.5), visW:m.boxW*w};
    }
    /* entry() skalakan ikut piksel KANVAS MENTAH, jadi ia tepat asalkan
       semua bingkai satu jujukan berkongsi SATU saiz kanvas — kanvas
       happy-N v2 ialah 642x1024 untuk kesemua 24 bingkai, jadi satu upp
       tetap sudah konsisten (lebar kotak alfa kekal ~500px merentasi
       kesemua 24; tinggi berbeza sebab lutut bertekuk semasa berehat,
       bukan skala berlainan, jadi ia BUKAN dinormalkan ikut kotak alfa —
       itulah kesilapan cubaan sebelum ini pada set 4-bingkai lama).

       SAIZ Wira ditentukur terus berbanding Aurora (~1.5x tinggi dia,
       bingkai berdiri/rujukan setiap set) — bukan angka tetap warisan
       lama (2.6/480) yang menjadikan Wira jauh lebih besar daripada
       Aurora walaupun pada idle biasa (skrin permainan sebenar tunjuk
       ini: Wira hampir menutup seluruh gelanggang berbanding kubah
       segel/Aurora).

       idle (480px persegi), sorakan (642x1024) dan tebasan/hunus (768px
       persegi) tiga kanvas BERBEZA saiz DAN kotak alfa mengisi kanvas
       masing-masing pada nisbah yang jauh berbeza — tebasan/hunus (pose
       lunjur tangan lebar) hanya isi ~44-47% tinggi kanvasnya, idle isi
       ~85%. Percubaan pertama padankan TINGGI SATAH tebasan/hunus dengan
       idle (bukan padankan WATAK), jadi Wira nampak lebih kurang SEPARUH
       saiz sebenar semasa menyerang — bug keluarga yang sama seperti
       kesilapan pertama pada sorakan v2 di atas, kali ini pada
       tebasan/hunus. Setiap set kini ditentukur BERASINGAN terus
       berbanding Aurora (bukan berbanding satu sama lain), jadi ia kebal
       terhadap berapa banyak kanvas masing-masing diisi. */
    function heroCalibratedUpp(tex,targetCharH){
      const m=measureHiRes(tex.image);
      return targetCharH/(tex.image.height*m.boxH);
    }
    const petJoyRefM=measureHiRes(petJoy[0].image);
    const HERO_CHAR_H=1.5*PET_UPP*petJoy[0].image.height*petJoyRefM.boxH;
    /* Bingkai sorakan memasukkan pedang tegak dan kesan ais dalam kotak alfa.
       Jika ia dinormalkan kepada tinggi alfa idle yang sama, badan Wira jadi
       terlalu kecil pada skrin BERJAYA walaupun ketinggian keseluruhan sprite
       nampak betul. Besarkan jujukan kemenangan sahaja; idle dan serangan
       kekal pada skala asal, dan jangkar kaki di bawah masih digunakan. */
    const HERO_HAPPY_SCALE=2.15;
    const HERO_UPP=heroCalibratedUpp(heroIdle[0],HERO_CHAR_H);
    const HERO_HAPPY_UPP=heroCalibratedUpp(heroHappy[0],HERO_CHAR_H*HERO_HAPPY_SCALE);
    const HERO_STRIKE_UPP=heroCalibratedUpp(heroPrepare,HERO_CHAR_H);
    const heroHappyReference=entry(heroHappy[0],HERO_HAPPY_UPP);
    const heroHappyOffY=heroHappyReference.offY;
    /* Pusat muka diukur daripada komponen tona kulit terbesar setiap frame.
       Ini menambat BADAN Wira, bukan kotak alfa pedang/ais yang berubah-ubah. */
    const heroHappyFaceX=[330.7,330.4,330.4,330.8,330.8,317.2,317.2,315.7,315.7,344.4,344.4,340.3,340.3,341.5,341.5,341.9,341.9,340.1,340.1,338.1,338.1,330.6,330.6,330.6];
    const heroIdleE=heroIdle.map(t=>entry(t,HERO_UPP));
    const heroHappyE=heroHappy.map((t,i)=>{
      const e=entry(t,HERO_HAPPY_UPP);
      /* Efek pedang/ais mengubah kotak alfa setiap frame. Jangan biarkan
         pusat efek itu mengheret badan Wira ke kiri dan kanan. */
      e.offX=(.5-heroHappyFaceX[i]/t.image.width)*e.w;
      e.offY=heroHappyOffY;
      e.cleanMatte=true;
      return e;
    });
    const heroPrepareE=entry(heroPrepare,HERO_STRIKE_UPP);
    const heroSlashE=entry(heroSlash,HERO_STRIKE_UPP);
    const petSadE=petSad.map(t=>entry(t,PET_UPP));
    const petJoyE=petJoy.map(t=>entry(t,PET_UPP));
    const petRef=petSad[0]?.image;
    const petCharH=petRef?PET_UPP*petRef.height*measureHiRes(petRef).boxH:1;
    function petUpp(frames){
      const ref=frames.find(Boolean), img=ref&&ref.image;
      if(!img)return PET_UPP;
      const m=measureHiRes(img);
      return petCharH/(img.height*Math.max(.15,m.boxH));
    }
    // Satu skala dikunci bagi SEMUA frame pet yang sama. Sebelum ini setiap
    // frame dinormalisasi sendiri, lalu siluet nampak mengecut/membesar bila
    // ekspresi berubah. Saiz rujukan kekal tinggi visual Aurora.
    const petEntries=(frames,upp=petUpp(frames))=>frames.filter(Boolean).map(t=>entry(t,upp));
    async function sheetFrames(url){
      if(!url)return [];
      const sheet=await load(url), img=sheet&&sheet.image;
      if(!img||img.width<2||img.height<2)return [];
      const out=[];
      for(let y=0;y<2;y++)for(let x=0;x<2;x++){
        const c=document.createElement('canvas'); c.width=Math.floor(img.width/2); c.height=Math.floor(img.height/2);
        const ctx=c.getContext('2d');
        try{ctx.drawImage(img,x*c.width,y*c.height,c.width,c.height,0,0,c.width,c.height);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;out.push(tex)}catch(_){return []}
      }
      return out;
    }
    async function customPetFrames(config,phase,fallback){
      if(!config)return {frames:fallback,custom:false};
      const sheet=await sheetFrames(config[phase+'Sheet']);
      if(sheet.length===4)return {frames:sheet,custom:true};
      const loaded=(await Promise.all((config[phase]||[]).map(load))).filter(Boolean);
      return {frames:loaded.length?loaded:fallback,custom:false};
    }
    let activePetConfig=devPetConfig(), petVisualGeneration=0;

    function actor(first,z,cleanHeroMatte=false){
      const material=new THREE.MeshBasicMaterial({map:first.tex,transparent:true,depthWrite:false});
      if(cleanHeroMatte){
        /* Frame sorakan membawa matte hitam legap di luar badan (terutamanya
           belakang pedang dan cabang letusan ais). Bersihkan di GPU supaya
           24 tekstur asal tidak perlu digandakan ke canvas semasa runtime.
           Zon perlindungan mengekalkan rambut, jubah dan perisai yang
           memang gelap; hanya piksel gelap di luar siluet badan dipudarkan. */
        material.userData.cleanMatte={value:first.cleanMatte?1:0};
        material.onBeforeCompile=shader=>{
          shader.uniforms.paCleanMatte=material.userData.cleanMatte;
          shader.fragmentShader=shader.fragmentShader
            .replace('void main() {','uniform float paCleanMatte;\nvoid main() {')
            .replace('#include <map_fragment>',`#include <map_fragment>
#ifdef USE_MAP
  vec2 paHead=(vMapUv-vec2(0.52,0.51))/vec2(0.20,0.14);
  vec2 paTorso=(vMapUv-vec2(0.51,0.39))/vec2(0.18,0.17);
  vec2 paShield=(vMapUv-vec2(0.72,0.35))/vec2(0.14,0.21);
  bool paProtected=dot(paHead,paHead)<1.0||dot(paTorso,paTorso)<1.0||dot(paShield,paShield)<1.0;
  if(paCleanMatte>0.5&&!paProtected){
    float paLight=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
    diffuseColor.a*=smoothstep(0.08,0.45,paLight);
    if(diffuseColor.a<0.025)discard;
  }
#endif`);
        };
        material.customProgramCacheKey=()=> 'wira-clean-matte-v2';
      }
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);
      m.position.z=z; m.userData.e=first; scene.add(m); return m;
    }
    const hero=actor(heroIdleE[0],0,true);
    const pet =actor(petSadE[0],-.3);

    /* Bayang lembut. Bulatan hitam bertepi tajam nampak macam tampalan;
       kecerunan jejarian pada tekstur kecil sudah cukup dan murah. */
    const shadowTex=(function(){
      const c=document.createElement('canvas'); c.width=c.height=128;
      const g=c.getContext('2d');
      const grad=g.createRadialGradient(64,64,0,64,64,64);
      grad.addColorStop(0,'rgba(0,0,0,.62)');
      grad.addColorStop(.45,'rgba(0,0,0,.34)');
      grad.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=grad; g.fillRect(0,0,128,128);
      return new THREE.CanvasTexture(c);
    })();
    function shadow(w,z){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));
      m.scale.set(w,w*.34,1); m.position.z=z; scene.add(m); return m;
    }
    const heroShadow=shadow(2.0,-.01);
    heroShadow.position.set(HERO_HOME,GROUND+.04,-.01);
    const petShadow=shadow(1.12,-.33);
    petShadow.position.set(SEAL_X,GROUND+.03,-.33);
    const PET_SHADOW_W=1.12;

    /* Cahaya belakang di belakang Aurora — padanan "Seal back glow" Unity.
       Ia mengambil warna tier yang sedang aktif. */
    const glowTex=(function(){
      const c=document.createElement('canvas'); c.width=c.height=128;
      const g=c.getContext('2d');
      const grad=g.createRadialGradient(64,64,0,64,64,64);
      grad.addColorStop(0,'rgba(255,255,255,.85)');
      grad.addColorStop(.4,'rgba(255,255,255,.30)');
      grad.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=grad; g.fillRect(0,0,128,128);
      return new THREE.CanvasTexture(c);
    })();
    const backGlow=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),
      new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,
        blending:THREE.AdditiveBlending,opacity:.5}));
    backGlow.position.set(SEAL_X,GROUND+.78,-.35); scene.add(backGlow);

    /* Tiga kubah segel dari prototaip Unity: Gangsa di dalam, Emas di luar.
       Susunan lukisan Unity ialah pet < segel < Wira, jadi z mengikutnya. */
    /* Menggelapkan tekstur berwarna tidak menjadikannya kelabu, ia cuma
       menjadikannya malap. Untuk "tukar warna kelabu" yang sebenar, kita
       campurkan warna dengan luminannya sendiri di dalam shader. Ini antara
       perkara yang memang tidak boleh dibuat dengan CSS atau canvas 2D. */
    /* uClear ialah "tingkap" lembut dalam kubah: garisan rune dipudarkan di
       kawasan muka Aurora supaya ia tidak melintasi mukanya, tetapi tidak
       dibuang terus — kubah masih kelihatan nipis di situ, jadi dia kekal
       terbaca sebagai berada DI DALAM. z=0 bermakna tiada tingkap (serpihan). */
    function sealMaterial(map){
      return new THREE.ShaderMaterial({
        uniforms:{map:{value:map||null},uGrey:{value:0},uOpacity:{value:1},
                  uClear:{value:new THREE.Vector3(.5,.5,0)}},
        transparent:true, depthWrite:false,
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'uniform sampler2D map;uniform float uGrey;uniform float uOpacity;'+
          'uniform vec3 uClear;varying vec2 vUv;'+
          'void main(){vec4 c=texture2D(map,vUv);'+
          'float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(c.rgb,vec3(l),uGrey);'+
          'float a=c.a*uOpacity;'+
          'if(uClear.z>0.001){'+
          '  float d=distance(vUv,uClear.xy);'+
          '  a*=mix(0.20,1.0,smoothstep(uClear.z*0.5,uClear.z,d));'+
          '}'+
          'gl_FragColor=vec4(c.rgb,a);}'
      });
    }
    /* Kubah ialah PNG lut sinar, jadi ia dilukis DI HADAPAN Aurora: garisan
       rune melintasi badannya dan dia kelihatan menembusi kaca. renderOrder
       ditetapkan supaya susunan tidak bergantung pada pengisihan kedalaman
       bahan lutsinar. */
    const seals=TIERS.map((tier,i)=>{
      const e=sealEntry(sealTex[i], tier.visible);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1), sealMaterial(e.tex));
      m.scale.set(e.w,e.h,1);
      m.position.set(SEAL_X+e.offX, GROUND+e.offY, -.02);
      // Tingkap dipusatkan pada muka Aurora, dikira dalam UV kubah ini sendiri.
      const faceV=.5+((GROUND+PET_FACE_Y)-(GROUND+e.offY))/e.h;
      m.material.uniforms.uClear.value.set(.5, faceV, .19);
      m.renderOrder=3; m.visible=(i===0); scene.add(m);
      return {tier, front:m, base:{w:e.w,h:e.h}, visW:e.visW,
              damage:0, broken:false, breakT:-1};
    });
    pet.renderOrder=1;
    hero.renderOrder=4;

    /* SERPIHAN SEGEL
       Zarah titik terbaca sebagai debu, bukan kaca pecah. Setiap serpihan di
       sini ialah kepingan kubah yang sebenar: quad yang mengambil satu petak
       UV daripada tekstur kubah itu sendiri, jadi ia membawa garisan rune dan
       warna tier yang betul. Ia bermula tepat di tempat kepingan itu berada
       pada kubah, lalu terpelanting keluar, berpusing dan jatuh. */
    const SHARDS=10;
    const shards=[];
    for(let i=0;i<SHARDS;i++){
      const g=new THREE.PlaneGeometry(1,1);
      const m=new THREE.Mesh(g, sealMaterial(null));
      m.renderOrder=4; m.visible=false; scene.add(m);
      shards.push({mesh:m, vx:0, vy:0, spin:0, life:0});
    }
    function shatter(seal){
      const e=seal.front, tex=e.material.uniforms.map.value;
      const pw=e.scale.x, ph=e.scale.y;
      const cx=e.position.x, cy=e.position.y;
      shards.forEach((s,i)=>{
        // Petak UV dalam separuh atas kubah, di mana kubahnya paling pekat.
        const a=(i/SHARDS)*Math.PI*2+Math.random()*.4;
        const rad=.16+Math.random()*.20;
        const u=.5+Math.cos(a)*rad, v=.52+Math.sin(a)*rad*.9;
        const su=.16+Math.random()*.07, sv=su;
        const uv=s.mesh.geometry.attributes.uv;
        uv.setXY(0,u-su/2,v+sv/2); uv.setXY(1,u+su/2,v+sv/2);
        uv.setXY(2,u-su/2,v-sv/2); uv.setXY(3,u+su/2,v-sv/2);
        uv.needsUpdate=true;
        s.mesh.material.uniforms.map.value=tex;
        s.mesh.material.uniforms.uGrey.value=0;
        s.mesh.material.uniforms.uOpacity.value=1;
        s.mesh.material.needsUpdate=true;
        s.mesh.scale.set(pw*su, ph*sv, 1);
        // Mula pada kedudukan sebenar kepingan itu atas kubah.
        s.mesh.position.set(cx+(u-.5)*pw, cy+(v-.5)*ph, .05);
        s.mesh.rotation.z=0; s.mesh.visible=true;
        const out=Math.atan2(s.mesh.position.y-cy, s.mesh.position.x-cx);
        const sp=1.7+Math.random()*2.2;
        s.vx=Math.cos(out)*sp; s.vy=Math.sin(out)*sp+1.5;
        s.spin=(Math.random()-.5)*11;
        s.life=.85+Math.random()*.35;
      });
    }

    /* Cahaya segel yang jatuh atas lantai. Tanpa ia kubah bersinar tetapi
       batu di bawahnya langsung tidak terkesan, dan kubah nampak macam
       pelekat yang terapung. */
    const floorGlow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
      new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,
        blending:THREE.AdditiveBlending,opacity:.5}));
    floorGlow.renderOrder=0;
    floorGlow.position.set(SEAL_X,GROUND+.03,-.34); scene.add(floorGlow);

    /* Cengkerang sfera sebenar mengelilingi Aurora — inilah yang menjadikan
       "terkurung" terbaca: tepinya menyala mengikut sudut pandang (fresnel),
       sesuatu yang tidak mungkin dibuat dengan sprite rata. */
    const shellUni={uTime:{value:0},uPower:{value:1},uGrey:{value:0},
                    uTint:{value:new THREE.Color(TIERS[0].color)}};
    const shell=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),
      new THREE.ShaderMaterial({
        uniforms:shellUni, transparent:true, depthWrite:false,
        blending:THREE.AdditiveBlending, side:THREE.DoubleSide,
        vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
        fragmentShader:'uniform float uTime;uniform float uPower;uniform float uGrey;uniform vec3 uTint;varying vec3 vN;varying vec3 vP;'+
          'void main(){vec3 V=normalize(-vP);float f=pow(1.0-abs(dot(vN,V)),2.6);'+
          'float band=.5+.5*sin(vP.y*9.0-uTime*1.4);'+
          'vec3 col=mix(uTint,vec3(dot(uTint,vec3(.299,.587,.114))),uGrey);'+
          'float a=f*uPower*(.62+.38*band);'+
          'gl_FragColor=vec4(col*(a*1.9),a*.9);}'
      }));
    shell.renderOrder=2; scene.add(shell);
    function fitShell(){
      const i=Math.min(S.active,TIERS.length-1);
      const tier=TIERS[i], r=tier.visible*.40;
      shell.scale.set(r,r*1.02,r);
      shell.position.set(SEAL_X, GROUND+r*.96, -.30);
      shellUni.uTint.value.setHex(tier.color);
      const w=seals[i].visW||tier.visible;
      floorGlow.scale.set(w*.92, w*.30, 1);
      floorGlow.material.color.setHex(tier.color);
    }

    /* gelombang kejut bila segel retak */
    function ringTex(){
      const c=document.createElement('canvas'); c.width=c.height=256;
      const g=c.getContext('2d'); g.translate(128,128);
      g.strokeStyle='#fff'; g.lineWidth=7;
      g.beginPath(); g.arc(0,0,108,0,Math.PI*2); g.stroke();
      g.lineWidth=3; g.globalAlpha=.6;
      g.beginPath(); g.arc(0,0,92,0,Math.PI*2); g.stroke();
      return new THREE.CanvasTexture(c);
    }
    const waveMat=new THREE.MeshBasicMaterial({map:ringTex(),transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false,opacity:0});
    const wave=new THREE.Mesh(new THREE.PlaneGeometry(1,1),waveMat);
    wave.position.set(SEAL_X,GROUND+.8,.3); scene.add(wave);

    // Kilat putih pendek pada detik segel pecah — ini yang bagi rasa "pop".
    const flashMat=new THREE.MeshBasicMaterial({map:glowTex,transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false,opacity:0});
    const flash=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),flashMat);
    flash.position.set(SEAL_X,GROUND+.8,.28); scene.add(flash);

    /* Letusan ais elektrik pada detik pedang mengena — aset sebenar Wira
       daripada repo, bukan kesan generik. */
    function fxQuad(map,size,z){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),
        new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,
          blending:THREE.AdditiveBlending,opacity:0}));
      m.position.z=z; m.visible=false; m.renderOrder=6; scene.add(m); return m;
    }
    const iceBurst=fxQuad(iceBurstTex,1.7,.08);
    const iceEnd=fxQuad(iceEndTex,2.2,.07);
    function iceHit(x,y){
      iceBurst.position.set(x,y,.08); iceEnd.position.set(x,y,.07);
      iceBurst.rotation.z=Math.random()*Math.PI*2;
      iceEnd.rotation.z=Math.random()*Math.PI*2;
      S.iceT=0;
    }

    /* KEMASUKAN WIRA
       Video portal dalam app meleraikan Wira menjadi zarah biru. Supaya
       pertemuan itu sambung, dia TIDAK muncul begitu sahaja di sini: pada
       soalan pertama dia turun sebagai zarah biru yang berkumpul membentuk
       badannya. Titik sasaran disampel daripada saluran alfa sprite idle
       sendiri, jadi taburannya benar-benar berbentuk Wira, bukan awan rawak. */
    const EN=460;
    /* Bentuk masa perhimpunan ditetapkan oleh tirai sinematik yang pudar
       selama 480ms. Dua perkara mesti benar pada saat tirai habis: zarah sudah
       DI DALAM bingkai, dan zarah sudah BERGERAK.

       Serakan permulaan yang panjang melanggar kedua-duanya — dalam tempoh
       serakan itu, kebanyakan zarah masih diam di titik mulanya. Kalau titik
       mula pula tinggi di atas pentas, ia diam di luar skrin, dan murid nampak
       arena kosong. Jadi serakan dipendekkan dan ketinggian mula diturunkan
       supaya hampir semuanya sudah turun dalam bingkai sebelum tirai hilang. */
    const EN_TRAVEL=1.15;          // masa satu zarah dari atas ke sasarannya
    const EN_SPREAD=.30;           // serakan permulaan antara zarah
    const EN_SPAN=EN_TRAVEL+EN_SPREAD;
    /* Had atas pentas kira-kira 2.65 unit; sasaran zarah berada antara -1.92
       dan +0.68. Jatuh 1.1–2.1 unit memastikan titik mula kekal dalam bingkai. */
    const EN_DROP=1.1, EN_DROP_VAR=1.0;
    const enPos=new Float32Array(EN*3);
    const enTarget=new Float32Array(EN*2);   // offset dunia dari pusat satah
    const enStart=new Float32Array(EN*2);
    const enDelay=new Float32Array(EN);
    const enSwirl=new Float32Array(EN);
    const enGeo=new THREE.BufferGeometry();
    enGeo.setAttribute('position',new THREE.BufferAttribute(enPos,3));
    /* Zarah aditif tunggal terbakar menjadi putih di sini: tanah arena sudah
       terang, jadi setiap saluran menepu. Penyelesaiannya dua lapis berkongsi
       geometri yang sama — teras biru pekat dengan pengadunan biasa supaya
       warnanya benar-benar terbaca, dan sepuh aditif lebih besar di bawahnya
       untuk pendar. Digabung, ia bersinar tanpa hilang warna biru. */
    const sparkTex=(function(){
      const c=document.createElement('canvas'); c.width=c.height=64;
      const g=c.getContext('2d');
      const grad=g.createRadialGradient(32,32,0,32,32,32);
      grad.addColorStop(0,'rgba(255,255,255,1)');
      grad.addColorStop(.35,'rgba(255,255,255,.85)');
      grad.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=grad; g.fillRect(0,0,64,64);
      return new THREE.CanvasTexture(c);
    })();
    const enMat=new THREE.PointsMaterial({map:sparkTex,color:0x1160d6,size:.155,
      transparent:true,opacity:0,depthWrite:false});
    const enHaloMat=new THREE.PointsMaterial({map:sparkTex,color:0x2f9bff,size:.30,
      transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const enHalo=new THREE.Points(enGeo,enHaloMat);
    const enPoints=new THREE.Points(enGeo,enMat);
    enHalo.renderOrder=4; enHalo.frustumCulled=false; enHalo.visible=false;
    enPoints.renderOrder=5; enPoints.frustumCulled=false; enPoints.visible=false;
    scene.add(enHalo); scene.add(enPoints);

    const enGlow=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),
      new THREE.MeshBasicMaterial({map:glowTex,color:0x2f7fe0,transparent:true,
        depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
    enGlow.renderOrder=3; enGlow.visible=false; scene.add(enGlow);

    /* Sampel titik di dalam siluet sprite. Probe 96x96 sudah cukup: kita
       memerlukan taburan berbentuk Wira, bukan ketepatan piksel. */
    function sampleSilhouette(img,count){
      const N=96, pts=[];
      try{
        probeCtx.clearRect(0,0,N,N); probeCtx.drawImage(img,0,0,N,N);
        const d=probeCtx.getImageData(0,0,N,N).data;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          if(d[(y*N+x)*4+3]>90)pts.push([(x+.5)/N,(y+.5)/N]);
        }
      }catch(_){}
      if(!pts.length)return [];
      const out=[];
      for(let i=0;i<count;i++)out.push(pts[Math.floor(Math.random()*pts.length)]);
      return out;
    }

    function prepareEntrance(){
      const e=hero.userData.e;
      const pts=sampleSilhouette(e.tex.image,EN);
      if(!pts.length)return false;
      for(let i=0;i<EN;i++){
        const [u,v]=pts[i];
        enTarget[i*2]=(u-.5)*e.w;
        enTarget[i*2+1]=(.5-v)*e.h;
        // Turun dari atas dengan sedikit serakan sisi — seperti keluar portal.
        enStart[i*2]=enTarget[i*2]+(Math.random()-.5)*1.7;
        enStart[i*2+1]=enTarget[i*2+1]+EN_DROP+Math.random()*EN_DROP_VAR;
        enDelay[i]=Math.random()*EN_SPREAD;
        enSwirl[i]=(Math.random()-.5)*1.5;
      }
      return true;
    }

    const PN=220;
    const pPos=new Float32Array(PN*3), pVel=new Float32Array(PN*3), pLife=new Float32Array(PN);
    const pGeo=new THREE.BufferGeometry();
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
    const pMat=new THREE.PointsMaterial({color:0xffe4a8,size:.1,transparent:true,opacity:.72,
      blending:THREE.AdditiveBlending,depthWrite:false});
    scene.add(new THREE.Points(pGeo,pMat));
    function burst(spread,color){
      if(color!=null)pMat.color.setHex(color);
      for(let i=0;i<PN;i++){
        const a=Math.random()*Math.PI*2, s=1.2+Math.random()*spread;
        pPos[i*3]=SEAL_X; pPos[i*3+1]=GROUND+.8; pPos[i*3+2]=0;
        pVel[i*3]=Math.cos(a)*s; pVel[i*3+1]=Math.sin(a)*s*.85+1.2; pVel[i*3+2]=(Math.random()-.5)*2;
        pLife[i]=.5+Math.random()*.4;
      }
    }

    /* Syiling ganjaran — mengikut RescueRewardOrbs.cs: enam syiling terbit dari
       segel yang pecah, merebak membentuk kipas, kemudian melengkung masuk ke
       dada Wira satu demi satu. */
    function quad(map,w,h,z,additive){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),
        new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,opacity:0,
          blending:additive?THREE.AdditiveBlending:THREE.NormalBlending}));
      m.position.z=z; m.visible=false; scene.add(m); return m;
    }
    const coins=[];
    for(let i=0;i<COINS;i++)coins.push({
      coin:quad(coinTex,.42,.42,.36,false),
      trail:quad(trailTex,.52,.13,.35,true),
      picked:false
    });
    const absorbFlare=quad(flareTex,1.05,1.05,.37,true);

    const S={heroX:HERO_HOME,heroFeet:HERO_HOME,petY:GROUND,petFeet:GROUND,camY:0,rescued:false,lifecycle:0,
             shake:0,waveT:-1,waveScale:1.35,hitT:-1,flashT:-1,flareT:-1,iceT:-1,enterT:-1,heroFade:1,running:true,active:0,
             heroFrames:heroIdleE,heroHold:HERO_IDLE_HOLD,heroFps:4,heroFrameT0:0,
             petFrames:petSadE,petHold:PET_IDLE_HOLD,petFps:4,petFrameT0:0,
             heroLock:null,grey:0,coinT:-1};
    let raf=0, last=performance.now(), tAcc=0;

    function swap(mesh,e){
      if(!e||mesh.userData.e===e)return;
      mesh.userData.e=e;
      mesh.material.map=e.tex; mesh.material.needsUpdate=true;
      if(mesh.material.userData.cleanMatte)mesh.material.userData.cleanMatte.value=e.cleanMatte?1:0;
      mesh.scale.set(e.w,e.h,1);
    }
    async function setPetVisual(config){
      const generation=++petVisualGeneration;
      activePetConfig=config&&typeof config==='object'?config:null;
      const sad=await customPetFrames(activePetConfig,'sad',petSad);
      const joy=await customPetFrames(activePetConfig,'happy',petJoy);
      // Tekan Swap Pet beberapa kali semasa texture masih dimuat tidak boleh
      // menyebabkan permintaan lama menimpa pilihan yang paling baharu.
      if(generation!==petVisualGeneration)return;
      const customUpp=sad.custom?petUpp(sad.frames):PET_UPP;
      const sadE=sad.custom?petEntries(sad.frames,customUpp):sad.frames.map(t=>entry(t,PET_UPP));
      // Happy guna skala yang sama dengan sad; perubahan emosi tidak patut
      // mengubah besar badan pet ketika segel pecah.
      const joyE=joy.custom?petEntries(joy.frames,customUpp):joy.frames.map(t=>entry(t,PET_UPP));
      S.petFrames=S.rescued?joyE:sadE;
      S.petHold=S.rescued?null:(sad.custom?PET_SHEET_HOLD:PET_IDLE_HOLD);
      S.petFps=4; S.petFrameT0=tAcc;
      if(S.petFrames[0])swap(pet,S.petFrames[0]);
    }

    function frame(now){
      raf=requestAnimationFrame(frame);
      if(!S.running)return;
      const dt=Math.min((now-last)/1000,.05); last=now; tAcc+=dt;

      // Each pose sequence samples its own elapsed time (tAcc minus the moment
      // it was assigned), not the stage's raw clock — otherwise a switch like
      // rescue()'s idle->cheer swap lands mid-cycle at a random phase, so the
      // first pose shown gets whatever sliver of its hold time was left
      // instead of its full duration. That reads as a stray flash of the
      // wrong pose before the sequence "restarts" a moment later, which is
      // far more visible on Wira's 4 distinct cheer poses than on the pet's
      // two near-identical joy frames.
      swap(hero, S.heroLock || (S.heroHold ? heldFrame(S.heroFrames,S.heroHold,tAcc-S.heroFrameT0)
                           : S.heroFrames[Math.floor((tAcc-S.heroFrameT0)*S.heroFps)%S.heroFrames.length]));
      swap(pet,  S.petHold ? heldFrame(S.petFrames,S.petHold,tAcc-S.petFrameT0)
                           : S.petFrames[Math.floor((tAcc-S.petFrameT0)*S.petFps)%S.petFrames.length]);

      // S.heroX dan S.petY ialah kedudukan KAKI, bukan pusat satah.
      S.heroFeet=damp(S.heroFeet,S.heroX,15,dt);
      S.petFeet=damp(S.petFeet,S.petY,9,dt);
      hero.position.x=S.heroFeet+hero.userData.e.offX;
      hero.position.y=GROUND+hero.userData.e.offY;
      hero.material.opacity=S.heroFade;

      /* Zarah berkumpul dari atas ke titik masing-masing; Wira hanya pudar
         masuk selepas kebanyakan zarah sampai, jadi tiada detik dia dan
         zarahnya kelihatan bertindih dua kali. */
      if(S.enterT>=0){
        S.enterT+=dt;
        const cx=hero.position.x, cy=hero.position.y;
        let done=0;
        for(let i=0;i<EN;i++){
          const k=Math.min(1,Math.max(0,(S.enterT-enDelay[i])/EN_TRAVEL));
          const e=k*k*(3-2*k);
          if(k>=1)done++;
          const tx=cx+enTarget[i*2], ty=cy+enTarget[i*2+1];
          const sx=cx+enStart[i*2],  sy=cy+enStart[i*2+1];
          const swirl=(1-e)*enSwirl[i]*Math.sin(e*Math.PI*1.6);
          enPos[i*3]=sx+(tx-sx)*e+swirl;
          enPos[i*3+1]=sy+(ty-sy)*e;
          enPos[i*3+2]=.04;
        }
        enGeo.attributes.position.needsUpdate=true;
        const prog=done/EN;
        enMat.opacity=Math.min(1,S.enterT*4)*(1-Math.max(0,(prog-.45)/.55));
        enHaloMat.opacity=enMat.opacity*.28;
        S.heroFade=Math.max(0,(prog-.45)/.55);
        enGlow.visible=true;
        enGlow.position.set(cx,cy+.15,-.04);
        enGlow.material.opacity=Math.sin(Math.min(1,S.enterT/EN_SPAN)*Math.PI)*.55;
        enGlow.scale.setScalar(.8+Math.min(1,S.enterT/EN_SPAN)*.5);
        if(prog>=1){
          S.enterT=-1; S.heroFade=1;
          enPoints.visible=enHalo.visible=false; enGlow.visible=false;
          enMat.opacity=enHaloMat.opacity=0;
        }
      }
      heroShadow.position.x=S.heroFeet;
      pet.position.x=SEAL_X+pet.userData.e.offX;
      pet.position.y=S.petFeet+pet.userData.e.offY;

      // Bayang Aurora kekal di lantai dan mengecut bila dia naik.
      const rise=Math.max(0,(S.petFeet-GROUND))/.8;
      petShadow.scale.set(PET_SHADOW_W*(1-.3*rise), PET_SHADOW_W*.34*(1-.3*rise), 1);
      petShadow.material.opacity=1-.45*Math.min(1,rise);

      /* Lantunan hentaman. Nafas sahaja tidak cukup untuk membaca sebagai
         "kena pukul" kerana ia berterusan dan perlahan. Ini pula fana: satu
         ayunan terredam yang menekan kubah ke dalam, terlajak keluar sedikit,
         kemudian reda. Cahayanya yang paling kuat berdenyut; saiznya bergerak
         cukup untuk mata tahu ia melantun, bukan sekadar berkelip. */
      let recoil=0;
      if(S.hitT>=0){
        S.hitT+=dt;
        const k=S.hitT/HIT_REBOUND;
        if(k>=1)S.hitT=-1;
        else recoil=Math.sin(k*Math.PI*2.2)*Math.exp(-k*4.2);
      }
      // Segel: satu tier kelihatan, bernafas perlahan, kelabu bila terkena.
      const activeTier=TIERS[Math.min(S.active,TIERS.length-1)];
      backGlow.material.color.setHex(activeTier.color);
      backGlow.material.opacity=S.active>=TIERS.length?0:.42+(reduceMotion?0:.1*Math.sin(tAcc*2));
      S.grey=damp(S.grey,0,3.4,dt);
      shellUni.uTime.value=tAcc;
      seals.forEach((s,i)=>{
        const m=s.front, u=m.material.uniforms;
        if(s.breakT>=0){
          s.breakT+=dt;
          const k=Math.min(1,s.breakT/.42);
          // Kepit dulu (ketat), baru meletup keluar — itu yang buat mata baca
          // "pop" dan bukan "pudar".
          const grow=k<.22 ? 1-.10*(k/.22) : 1+.62*((k-.22)/.78);
          m.scale.set(s.base.w*grow, s.base.h*grow, 1);
          u.uOpacity.value=k<.22 ? 1 : 1-((k-.22)/.78);
          u.uGrey.value=1;
          if(k>=1){ s.breakT=-1; m.visible=false }
          return;
        }
        const on=(i===S.active);
        m.visible=on;
        if(!on)return;
        // Nafas: kubah mengembang dan mengecut perlahan, bukan sekadar pudar.
        /* Amplitud sengaja kecil. Pada +-3.4% jejari kubah berayun cukup luas
           sampai kelihatan mengepam, bukan bernafas. Kekalkan denyut itu pada
           cahaya, bukan pada saiz. */
        const breath=reduceMotion?0:Math.sin(tAcc*Math.PI*2/s.tier.period);
        const grow=1+breath*.011+recoil*.05;
        const flare=Math.abs(recoil);
        const grey=Math.min(1, Math.max(S.grey, s.damage*.55));
        m.scale.set(s.base.w*grow, s.base.h*grow, 1);
        u.uOpacity.value=Math.min(1,.93+(reduceMotion?.05:breath*.05)+flare*.07);
        u.uGrey.value=grey;
        shell.visible=true;
        shell.scale.setScalar(s.tier.visible*.40*grow);
        shellUni.uPower.value=(.88+breath*.08+flare*1.15);
        shellUni.uGrey.value=grey;
        floorGlow.visible=true;
        floorGlow.material.opacity=(.44+(reduceMotion?0:breath*.08))*(1-grey*.6);
      });
      if(S.active>=TIERS.length){ shell.visible=false; floorGlow.visible=false }

      S.shake=damp(S.shake,0,6,dt);
      camera.position.x=(Math.random()-.5)*S.shake;
      camera.position.y=S.camY+(Math.random()-.5)*S.shake;
      bg.position.x=-camera.position.x*.4;
      bg.position.y=S.camY;

      /* Penerbangan syiling. Lengkung bezier yang sama dengan Unity: terbit,
         merebak, kemudian melengkung ke dada Wira dengan jeda berperingkat. */
      if(S.coinT>=0){
        S.coinT+=dt;
        const t=S.coinT;
        const ox=SEAL_X, oy=GROUND+.82;
        const ax=S.heroFeet+.18, ay=GROUND+1.18;
        let live=0;
        coins.forEach((c,i)=>{
          if(c.picked)return;
          live++;
          const ang=(95+i*32)*Math.PI/180;
          const sx=ox+Math.cos(ang)*.66, sy=oy+Math.sin(ang)*.68;
          const release=Math.min(1,Math.max(0,(t-.10)/.32));
          const travel=Math.min(1,Math.max(0,(t-.52-i*.12)/.55));
          let x,y;
          if(travel<=0){
            const e=1-Math.pow(1-release,3);
            x=ox+(sx-ox)*e; y=oy+(sy-oy)*e;
          }else{
            const u=travel*travel*(3-2*travel);
            const cx=(sx+ax)/2, cy=(sy+ay)/2+.5+i*.07;
            x=(1-u)*(1-u)*sx+2*(1-u)*u*cx+u*u*ax;
            y=(1-u)*(1-u)*sy+2*(1-u)*u*cy+u*u*ay;
          }
          const px=c.coin.position.x, py=c.coin.position.y;
          c.coin.visible=true; c.coin.material.opacity=Math.min(1,release*2);
          c.coin.position.set(x,y,.36);
          const vx=x-px, vy=y-py, speed=Math.hypot(vx,vy);
          if(speed>.004&&travel>0){
            c.trail.visible=true;
            c.trail.material.opacity=Math.min(.75,speed*9);
            c.trail.position.set(x-vx*2.2,y-vy*2.2,.35);
            c.trail.rotation.z=Math.atan2(vy,vx);
          }else c.trail.visible=false;
          if(travel>=1){
            c.picked=true; c.coin.visible=false; c.trail.visible=false;
            coinSfx(i);
            absorbFlare.position.set(ax,ay,.37);
            S.flareT=0;
          }
        });
        if(live===0){ S.coinT=-1 }
      }
      if(S.flareT>=0){
        S.flareT+=dt; const k=S.flareT/.34;
        if(k>=1){ S.flareT=-1; absorbFlare.visible=false; absorbFlare.material.opacity=0 }
        else { absorbFlare.visible=true; absorbFlare.scale.setScalar(.6+k*.8);
               absorbFlare.material.opacity=(1-k)*.9 }
      }

      /* Letusan ais: hablur meletup dahulu, kemudian serpihan beku mereda. */
      // Serpihan kaca: terbang, berpusing, jatuh, kemudian lenyap.
      shards.forEach(s=>{
        if(s.life<=0){ if(s.mesh.visible)s.mesh.visible=false; return }
        s.life-=dt;
        s.vy-=7.5*dt;
        s.mesh.position.x+=s.vx*dt;
        s.mesh.position.y+=s.vy*dt;
        s.mesh.rotation.z+=s.spin*dt;
        s.mesh.material.uniforms.uOpacity.value=Math.max(0,Math.min(1,s.life*1.6));
        if(s.life<=0)s.mesh.visible=false;
      });

      if(S.iceT>=0){
        S.iceT+=dt;
        const k=S.iceT/.46;
        if(k>=1){ S.iceT=-1; iceBurst.visible=iceEnd.visible=false }
        else{
          const kb=Math.min(1,k/.45);
          iceBurst.visible=kb<1;
          iceBurst.scale.setScalar(.55+kb*.8);
          iceBurst.material.opacity=(1-kb)*.62;
          iceBurst.rotation.z+=dt*.6;
          const ke=Math.max(0,(k-.28)/.72);
          iceEnd.visible=ke>0;
          iceEnd.scale.setScalar(.7+ke*.9);
          iceEnd.material.opacity=Math.sin(Math.PI*ke)*.45;
          iceEnd.rotation.z-=dt*.4;
        }
      }

      if(S.flashT>=0){
        S.flashT+=dt; const k=S.flashT/.26;
        if(k>=1){ S.flashT=-1; flashMat.opacity=0 }
        else { flash.scale.setScalar(.7+k*.9); flashMat.opacity=(1-k)*.5 }
      }

      if(S.waveT>=0){
        S.waveT+=dt; const k=S.waveT/.55;
        if(k>=1){ S.waveT=-1; waveMat.opacity=0 }
        else { const s=1+k*S.waveScale; wave.scale.set(s,s,1); waveMat.opacity=(1-k)*.9 }
      }

      for(let i=0;i<PN;i++){
        if(pLife[i]<=0){ pPos[i*3+1]=999; continue }
        pLife[i]-=dt; pVel[i*3+1]-=9.5*dt;
        pPos[i*3]+=pVel[i*3]*dt; pPos[i*3+1]+=pVel[i*3+1]*dt; pPos[i*3+2]+=pVel[i*3+2]*dt;
      }
      pGeo.attributes.position.needsUpdate=true;

      renderer.render(scene,camera);
    }

    /* Panel soalan berubah tinggi ikut panjang soalan, jadi nisbah pentas tidak
       tetap. Dengan fov tetap, pentas yang tinggi bermakna lebar dunia yang
       kelihatan mengecil — watak nampak membesar dan terpotong di tepi.
       Jadi kita kunci LEBAR dunia dan kira fov menegak daripadanya, kemudian
       tambat kamera supaya lantai kekal pada kedudukan yang sama. */
    /* WORLD_W mengunci lebar; MIN_H menghalang pentas yang lebar (tablet,
       landskap) daripada memampatkan tinggi sehingga watak jadi kecil. Mana-mana
       yang lebih besar yang menang, jadi satu kod melayan telefon menegak,
       telefon melintang dan tablet. */
    const WORLD_W=6.0, MIN_H=5.2, FLOOR_MARGIN=.30;
    const HIT_REBOUND=.42;         // tempoh lantunan hentaman, saat
    function resize(){
      const w=host.clientWidth, h=host.clientHeight;
      if(!w||!h)return;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      const visH=Math.max(WORLD_W/camera.aspect, MIN_H);
      camera.fov=2*Math.atan(visH/2/camera.position.z)*180/Math.PI;
      camera.updateProjectionMatrix();
      S.camY=GROUND+FLOOR_MARGIN*visH;
      fitBg();
    }
    fitShell();
    const ro=new ResizeObserver(resize); ro.observe(host);
    resize(); raf=requestAnimationFrame(frame);

    canvas.addEventListener('webglcontextlost',ev=>{
      ev.preventDefault(); S.running=false;
      host.classList.add('loading');
    });

    if(activePetConfig)setPetVisual(activePetConfig);
    return {
      tiers:TIERS,
      /* Tempat bar kesihatan sepatutnya duduk, dalam peratus saiz pentas.
         Diunjur melalui kamera supaya ia kekal di atas kubah pada setiap
         nisbah skrin, bukan diteka dengan nilai CSS tetap. */
      sealAnchor(){
        const tier=TIERS[Math.min(S.active,TIERS.length-1)];
        // Dikira terus daripada fov dan jarak, bukan melalui matriks kamera:
        // Vector3.project() bergantung pada matrixWorldInverse yang hanya
        // disegarkan semasa render, jadi ia boleh memulangkan nilai liar bila
        // dipanggil antara bingkai.
        const z=-.26, dist=camera.position.z-z;
        const visH=2*Math.tan(camera.fov*Math.PI/360)*dist, visW=visH*camera.aspect;
        const wx=SEAL_X-camera.position.x;
        const wy=(GROUND+tier.visible*.98)-camera.position.y;
        return {x:(wx/visW+.5)*100, y:(.5-wy/visH)*100};
      },
      /* Wira menyerang SEGEL, bukan Aurora. Bunyi: pedang masa tebasan,
         hentaman masa sentuh — dua kesan berasingan, bukan satu. */
      async strike(){
        const lifecycle=S.lifecycle;
        const tier=TIERS[Math.min(S.active,TIERS.length-1)];
        if(reduceMotion){ sfx('hit'); iceHit(SEAL_X-.28,GROUND+.85); burst(3,0xbfe9ff); S.waveT=0; return }
        S.heroLock=heroPrepareE; S.heroX=HERO_HOME-.35; await wait(170);
        if(lifecycle!==S.lifecycle)return;
        sfx('swordSlash');
        S.heroLock=heroSlashE;  S.heroX=-0.30; await wait(140);
        if(lifecycle!==S.lifecycle)return;
        sfx('hit');
        iceHit(SEAL_X-.28, GROUND+.85);
        burst(5.5,0xbfe9ff);                    // serpihan ais, bukan warna tier
        S.waveT=0; S.shake=.32;
        await wait(210);
        if(lifecycle!==S.lifecycle)return;
        S.heroLock=null; S.heroX=HERO_HOME;
      },
      // Satu jawapan betul = satu hentaman pada segel aktif.
      hitSeal(){
        const s=seals[S.active]; if(!s)return {broken:false};
        s.damage=Math.min(1,s.damage+1/s.tier.hits);
        S.grey=1;                      // kilas kelabu pada detik hentaman
        if(!reduceMotion)S.hitT=0;     // kubah melantun
        if(s.damage>=.999){
          s.broken=true; s.breakT=0;
          if(!reduceMotion)shatter(s);
          popSound();
          burst(6.5,s.tier.color);
          waveMat.color.setHex(s.tier.color); S.waveScale=1.35; S.waveT=0;
          S.flashT=0; S.shake=.46; S.hitT=-1;
          S.active=Math.min(TIERS.length,S.active+1);
          fitShell();
          return {broken:true, tier:s.tier};
        }
        // Cincin kejutan kecil berwarna tier — inilah yang menjadikan hentaman
        // terbaca sebagai tenaga diserap perisai, bukan sekadar kelipan.
        if(!reduceMotion){ waveMat.color.setHex(s.tier.color); S.waveScale=.62; S.waveT=0 }
        return {broken:false, tier:s.tier};
      },
      remaining(){
        const s=seals[S.active];
        return s ? Math.max(0,Math.round((1-s.damage)*s.tier.hits)) : 0;
      },
      activeTier(){ return TIERS[Math.min(S.active,TIERS.length-1)] },
      allBroken(){ return S.active>=TIERS.length },
      /* Tiada pengembaraan yang gagal — Aurora sentiasa diselamatkan, cuma
         bintang yang berbeza. Kalau soalan habis sebelum semua segel pecah,
         Wira menghabiskan bakinya di sini. */
      async forceBreakRest(){
        const lifecycle=S.lifecycle;
        while(S.active<TIERS.length){
          if(lifecycle!==S.lifecycle)return false;
          const s=seals[S.active];
          s.damage=1; s.broken=true; s.breakT=0;
          if(!reduceMotion)shatter(s);
          popSound(); burst(6,s.tier.color); S.flashT=0; S.shake=.4;
          S.active++;
          fitShell();
          await wait(320);
          if(lifecycle!==S.lifecycle)return false;
        }
        return true;
      },
      async rescue(){
        const lifecycle=S.lifecycle;
        sfx('finisher');
        S.shake=.5; burst(7,0xffffff); S.waveT=0; S.flashT=0;
        // Aurora bebas dan Wira bersorak — kedua-duanya bertukar sprite gembira.
        S.rescued=true; S.petFrames=petJoyE; S.petHold=null; S.petFps=4; S.petY=GROUND+.7; S.petFrameT0=tAcc;
        if(activePetConfig){ await setPetVisual(activePetConfig); S.petY=GROUND+.7; }
        S.heroFrames=heroHappyE; S.heroHold=null; S.heroFps=HERO_CHEER_FPS; S.heroLock=null; S.heroFrameT0=tAcc;
        await wait(520); if(lifecycle!==S.lifecycle)return false; S.petY=GROUND;
        await wait(420); return lifecycle===S.lifecycle;
      },
      // Wira menyerap cahaya segel sebagai syiling sebelum skrin keputusan.
      async absorbCoins(){
        coins.forEach(c=>{ c.picked=false; c.coin.visible=false; c.trail.visible=false });
        S.coinT=0;
        await wait(520+COINS*120+560);
      },
      /* Kemasukan portal, dua langkah. `arm` menyembunyikan Wira serta-merta
         supaya dia tidak sempat kelihatan sekejap sebelum larut; `enter`
         barulah menjalankan perhimpunan zarah. Dipisahkan kerana sinematik
         portal membina pentas di belakang tirai gelap — kalau perhimpunan itu
         berjalan di situ, ia habis sebelum arena didedahkan. */
      armEntry(){ if(!reduceMotion)S.heroFade=0 },
      enter(){
        if(reduceMotion||!prepareEntrance()){ S.heroFade=1; return }
        S.enterT=0; S.heroFade=0;
        enPoints.visible=enHalo.visible=true;
        enMat.opacity=enHaloMat.opacity=0;
        sfx('auraCharge');
      },
      wrong(){ S.shake=.14 },
      reset(){
        ++S.lifecycle;S.active=0; S.heroX=HERO_HOME; S.heroLock=null; S.grey=0; S.coinT=-1; S.rescued=false;
        S.iceT=-1; iceBurst.visible=iceEnd.visible=false;
        S.enterT=-1; S.heroFade=1;
        enPoints.visible=enHalo.visible=false; enGlow.visible=false;
        enMat.opacity=enHaloMat.opacity=0;
        shards.forEach(s=>{ s.life=0; s.mesh.visible=false });
        coins.forEach(c=>{ c.picked=true; c.coin.visible=false; c.trail.visible=false });
        absorbFlare.visible=false;
        S.petFrames=petSadE; S.petHold=PET_IDLE_HOLD; S.petY=GROUND; S.petFrameT0=tAcc;
        if(activePetConfig)setPetVisual(activePetConfig);
        S.heroFrames=heroIdleE; S.heroHold=HERO_IDLE_HOLD; S.heroFrameT0=tAcc;
        seals.forEach((s,i)=>{ s.damage=0; s.broken=false; s.breakT=-1;
          s.front.visible=(i===0);
          s.front.material.uniforms.uOpacity.value=1;
          s.front.material.uniforms.uGrey.value=0;
          s.front.scale.set(s.base.w,s.base.h,1) });
        shell.visible=true; floorGlow.visible=true; fitShell();
      },
      pause(){ S.running=false },
      resume(){ S.running=true; last=performance.now(); resize() },
      cancel(){ ++S.lifecycle; },
      setPet(config){ return setPetVisual(config); },
      dispose(){ S.running=false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose() }
    };
  }

  function boot(){
    if(stage)return Promise.resolve(stage);
    if(booting)return booting;
    $('segelStage')?.classList.add('loading');
    // import() dalam skrip klasik diselesaikan relatif kepada URL SKRIP, bukan
    // dokumen. Kunci pada baseURI supaya ia betul dari mana-mana laluan skrip.
    const threeUrl=new URL('js/vendor/three.module.min.js',document.baseURI).href;
    booting=import(threeUrl)
      .then(mod=>{ THREE=mod; return buildStage() })
      .then(s=>{ stage=s; $('segelStage')?.classList.remove('loading'); return s })
      .catch(err=>{ console.error('[segel-demo] pentas gagal dimuat',err); booting=null; throw err });
    return booting;
  }

  /* =================================================================
     SOALAN — datang dari bank sebenar, bukan senarai tetap
     ================================================================= */
  /* ADAPTER PRODUKSI (Menu/Map V2)
     ------------------------------
     Gembok V2 asalnya hanya ada satu mod: kolam kemahiran teras Darjah murid
     dalam susunan rawak. Menu V2 produksi memerlukan DUA laluan, jadi
     openSegelDemo() kini menerima satu `mode`:

       {chapter:'3'}   Selamatkan Pet — TOPIK yang murid pilih sendiri dalam
                       Map V2. Kolam ditapis kepada kemahiran SEBENAR topik itu
                       daripada GRAPH (bukan tag rekaan). Kalau topik itu tiada
                       kemahiran, kita jatuh kembali kepada kolam Darjah dan
                       ini dicatat ke konsol.

       {adaptive:true} Kembara Dimensi — setiap soalan memilih kemahiran
                       melalui chooseModeAndSkill() PRODUKSI, yang untuk
                       sesi coachAdaptive menyerahkan kepada
                       chooseCoachFrontierSkill() (frontier.js) dan membaca
                       keadaan pembelajaran sebenar melalui scoreState(db.skills).

     HAD YANG DIKETAHUI (sengaja tidak ditampal di sini):
       - Gembok V2 tidak memanggil recordMissionAnswer() atau
         recordFrontierResponse(), jadi jawapan TIDAK menulis bukti/mastery/XP.
         Pemilihan adaptif membaca keadaan sebenar tetapi tidak menambahnya.
         Menutup jurang itu bermakna mengubah enjin pemarkahan/persistence,
         yang berada di luar tugasan ini.
       - Tiada logik pemilih atau pemarkahan disalin ke dalam fail ini; kita
         hanya MEMANGGIL fungsi produksi yang sudah ada.
  */
  let entryMode=null, demoOpenGeneration=0, runGeneration=0;
  // {chapter} | {adaptive:true} | {devBattlefield:true,pet} | null
  const currentRun=probe=>!!probe&&run===probe&&probe.generation===runGeneration;

  function chapterSkillPool(chapter){
    const grade=(typeof db!=='undefined'&&db&&db.schoolGrade)||1;
    let pool=[];
    try{
      pool=GRAPH.skills
        .filter(x=>x.grade===grade&&String(x.chapter)===String(chapter))
        .map(x=>x.id);
    }catch(_){}
    if(!pool.length)console.warn('[segel-demo] topik tiada kemahiran, guna kolam darjah:',chapter);
    return pool;
  }
  function skillPool(){
    const grade=(typeof db!=='undefined'&&db&&db.schoolGrade)||1;
    if(entryMode&&entryMode.chapter){
      const scoped=chapterSkillPool(entryMode.chapter);
      if(scoped.length)return mix(scoped);
    }
    let pool=[];
    try{ pool=GRAPH.skills.filter(x=>x.grade===grade&&x.role==='core').map(x=>x.id) }catch(_){}
    if(!pool.length)pool=['D1.MONEY'];
    return mix(pool);
  }

  /* Pemilih adaptif produksi. Dipanggil dalam `withDemoSess` supaya semua
     keadaan sesi yang ditulisnya (mode, recent, coach, recoveryFor) mendarat
     pada sesi Gembok dan bukan pada sesi battle murid.

     KENAPA chooseCoachFrontierSkill() DAN BUKAN chooseModeAndSkill():
     chooseModeAndSkill() bermula dengan `if(sess?.demoMode&&window.PADemo)
     return PADemo.chooseSkill()`. Sesi Gembok mesti kekal demoMode supaya
     save() tidak menulis progress, jadi memanggil chooseModeAndSkill() di sini
     akan dialihkan ke kolam demo tetamu, bukan kepada Cikgu. Jadi kita
     memanggil terus fungsi yang SAMA yang digunakan oleh laluan Cikgu
     produksi (startMission(null) -> sess.coachAdaptive -> chooseModeAndSkill
     -> chooseCoachFrontierSkill dalam js/engine/frontier.js). Tiada logik
     pemilih disalin ke sini.

     Beza yang diketahui berbanding laluan Cikgu penuh: gerbang
     confirmationSkill() (intervention.js) yang berjalan SEBELUM cabang
     coachAdaptive tidak dipanggil di sini, dan jawapan Gembok tidak
     dimasukkan semula melalui recordFrontierResponse(). Jadi ini pemilihan
     adaptif sebenar, bukan pariti adaptif penuh. */
  function adaptiveSkillId(){
    if(typeof chooseCoachFrontierSkill!=='function')return null;
    return withDemoSess(()=>{
      const id=chooseCoachFrontierSkill();
      return (id&&typeof META!=='undefined'&&META[id])?id:null;
    });
  }

  // generate() menulis ke `sess` (anti-ulang, sejarah soalan). Kita pinjamkan
  // sess demo sekejap dan pulangkan yang asal — progress murid tak tersentuh.
  function withDemoSess(fn){
    const original=(typeof sess!=='undefined')?sess:null;
    try{ sess=run.sess; return fn() }
    catch(err){ console.error('[segel-demo] generate gagal',err); return null }
    finally{ if(original)sess=original }
  }

  /* Konsep boss permainan asal: apabila murid sampai ke pertahanan terakhir,
     cara menjawab berubah — tiada lagi empat pilihan, dia menaip jawapannya
     sendiri. Gembok EMAS ialah pertahanan terakhir di sini, jadi ia memakai
     konsep yang sama.

     Kelayakan dan padanan SENGAJA dipinjam daripada PADevExperiments, modul
     yang sama dipakai boss sebenar. Menyalin logiknya ke sini bermakna dua
     salinan peraturan yang akan terpesong; di sini hanya susun aturnya milik
     demo. Jawapan yang tidak boleh ditaip dengan selamat — "puluh", "Januari",
     nama bentuk — gagal typedEligible() dan kekal empat pilihan, jadi tahap
     emas menjadi kebanyakannya taip, bukan semuanya. */
  function renderTypedAnswer(q,box){
    const api=window.PADevExperiments;
    if(!api||typeof api.typedEligible!=='function'||typeof api.typedMatch!=='function')return false;
    let tier=null;
    try{ tier=stage&&stage.activeTier() }catch(_){}
    if(!tier||tier.key!=='emas')return false;
    if(!api.typedEligible(q))return false;

    const form=document.createElement('form');
    form.className='paTypedAnswer'; form.autocomplete='off';
    const label=document.createElement('label');
    label.className='paTypedLabel';
    label.innerHTML='<span>KUNCI EMAS</span><b>Taip jawapan sendiri</b>';
    const row=document.createElement('div'); row.className='paTypedRow';
    const input=document.createElement('input');
    input.className='paTypedInput'; input.type='text'; input.inputMode='decimal';
    input.autocapitalize='off'; input.autocomplete='off'; input.spellcheck=false;
    input.placeholder='Taip jawapan';
    input.setAttribute('aria-label','Taip jawapan sendiri');
    const button=document.createElement('button');
    button.className='paTypedSubmit'; button.type='submit'; button.textContent='Jawab';
    const note=document.createElement('small');
    note.className='paTypedNote';
    note.textContent='Tiada pilihan jawapan · tunjuk apa yang kamu benar-benar tahu';
    row.append(input,button); form.append(label,row,note); box.appendChild(form);

    form.onsubmit=e=>{
      e.preventDefault();
      if(run.locked||input.disabled)return;
      const raw=input.value.trim();
      if(!raw){ input.classList.add('needsValue'); input.focus(); return }
      input.classList.remove('needsValue');
      input.disabled=true; button.disabled=true;
      const ok=api.typedMatch(q,raw);
      respond(ok?{v:q.answer,tag:'correct',label:q.answer}
                :{v:raw,tag:(q.wrong&&q.wrong[0]&&q.wrong[0].tag)||'generated',label:raw}, button);
    };
    return true;
  }

  function setTypedRetryEnabled(clearValue=false){
    const form=$('segelAnswers')?.querySelector('.paTypedAnswer');
    const input=form?.querySelector('.paTypedInput'),button=form?.querySelector('.paTypedSubmit');
    if(!input||!button)return;
    if(clearValue)input.value='';
    input.disabled=false;button.disabled=false;input.focus();
  }

  function productionCurrent(hostRun,q){
    return run&&run.production&&run.productionRun===hostRun&&run.q===q
      && window.PAProductionJourney?.isCurrent?.(hostRun)
      && hostRun.session.generation===run.productionGeneration;
  }

  /* Bar kesihatan, bukan ayat. Bilangan ketul = bilangan hentaman tier itu
     (Gangsa 2, Perak 3, Emas 5) dan warnanya sudah memberitahu tier mana. */
  function paintSeal(){
    const tag=$('segelTag'), bar=$('segelBar');
    if(!tag||!bar)return;
    if(stage.allBroken()){ tag.style.opacity='0'; return }
    const tier=stage.activeTier(), left=stage.remaining();
    tag.style.opacity='1';
    tag.dataset.tier=tier.key;
    if(bar.dataset.tier!==tier.key){
      bar.dataset.tier=tier.key;
      bar.innerHTML=Array.from({length:tier.hits},()=>'<i></i>').join('');
    }
    [...bar.children].forEach((seg,i)=>seg.classList.toggle('out',i>=left));
    placeSealBar();
  }

  // Bar mesti berada betul-betul di atas kubah pada setiap bentuk skrin.
  function placeSealBar(){
    const tag=$('segelTag');
    if(!tag||!stage||!stage.sealAnchor)return;
    const a=stage.sealAnchor();
    tag.style.left=a.x+'%';
    tag.style.top=a.y+'%';
  }

  function makeQuestion(id){
    return withDemoSess(()=>{
      const s=(typeof scoreState==='function')?scoreState(id):{mastery:40,confidence:40,evidence:0,correct:0,wrong:0};
      const out=generate(id,s,{battleTier:'minion',isBoss:false});
      if(out)out.skill=id;
      return out;
    });
  }

  /* Hanya 44% jawapan Tahun 1 boleh ditaip dengan selamat — pecahan, waktu dan
     nama bentuk tidak boleh. Kalau kemahiran dipilih sepenuhnya mengikut giliran,
     tahap emas hanya menjadi kira-kira dua taip daripada lima, bukan
     "kebanyakannya taip". Jadi semasa emas sahaja kita cuba beberapa kemahiran
     seterusnya dahulu dan ambil yang pertama menghasilkan jawapan boleh taip.
     Ini keutamaan, bukan jaminan: kalau tiada calon yang layak, soalan biasa
     tetap keluar dengan empat pilihan. Demo tidak merekod kemajuan, jadi
     kecenderungan ini tidak menjejaskan bukti pembelajaran murid. */
  const GOLD_TRIES=5;
  function drawQuestion(){
    if(run&&run.writtenArithmeticPreview){
      run.q=run.writtenArithmeticPreview;
      return paintQuestion(run.q,run.q.skill);
    }
    if(run&&run.production){
      const q=window.PAProductionJourney?.nextQuestion?.(run.productionRun);
      if(!q){finishRun(false,'Soalan Gembok tidak dapat dimuat.');return;}
      run.q=q;
      return paintQuestion(q,q.skill);
    }
    const adaptiveId=(entryMode&&entryMode.adaptive)?adaptiveSkillId():null;
    const base=run.asked%run.pool.length;
    let id=adaptiveId||run.pool[base], q=null;
    let goldTier=false;
    try{ goldTier=!!(stage&&stage.activeTier()&&stage.activeTier().key==='emas') }catch(_){}
    const api=window.PADevExperiments;
    if(goldTier&&!adaptiveId&&api&&typeof api.typedEligible==='function'){
      for(let t=0;t<GOLD_TRIES;t++){
        const candidateId=run.pool[(base+t)%run.pool.length];
        const candidate=makeQuestion(candidateId);
        if(!candidate)continue;
        if(!q){ q=candidate; id=candidateId }          // simpan yang pertama sebagai sandaran
        if(api.typedEligible(candidate)){ q=candidate; id=candidateId; break }
      }
    }
    if(!q)q=makeQuestion(id);
    if(!q){ finishRun(false,'Bank soalan tidak dapat dimuat.'); return }
    run.q=q;
    paintQuestion(q,id);
  }

  function paintQuestion(q,id){
    const meta=(typeof META!=='undefined'&&META[id])||{};
    const grade=(typeof db!=='undefined'&&db&&db.schoolGrade)||meta.grade||1;
    // helper yang sama dengan battle: buang awalan "Tahun N · " supaya tajuk
    // tidak mengulang baris kecil di bawahnya.
    $('segelTitle').textContent=(typeof questionLearningTitle==='function')
      ? questionLearningTitle(meta,q) : (meta.title||'Kemahiran');
    $('segelSub').textContent=`Tahun ${grade} · ${meta.domain||'Matematik'}`;
    /* MAX_Q ialah HAD, bukan sasaran: pusingan tamat sebaik semua segel pecah,
       iaitu 10 jawapan betul, jadi "10 / 12" di sini bercanggah dengan "10 / 10"
       pada skrin keputusan walaupun kedua-duanya betul. Yang ditunjuk sekarang
       ialah nombor soalan sahaja; bar segel di atas sudah menunjukkan matlamat
       sebenar. */
    $('segelCount').textContent=`Soalan ${run.asked+1}`;
    $('segelQLabel').textContent=`Soalan ${run.asked+1}`;
    /* .question ialah grid (game.css) supaya kandungannya terpusat menegak.
       Grid membloksifikasi SETIAP anak, jadi menyuap prompt terus ke situ
       memecahkan setiap <b> dan setiap serpihan teks di antaranya ke baris
       sendiri — itulah sebabnya "Ayat matematik <b>10 − 19</b>. Cerita..."
       terpapar sebagai tiga baris dengan noktah terpisah. Satu pembalut
       menjadikan grid itu berisi satu item, jadi teks mengalir seperti biasa. */
    $('segelQuestion').innerHTML='<div class="segelPrompt"></div>';
    $('segelQuestion').firstChild.innerHTML=window.PAWrittenArithmetic?.render?.(q,run)||q.prompt;
    $('segelFeedback').textContent='';
    run.usedHint=false;
    const hintBtn=$('segelHint');
    if(hintBtn){ hintBtn.disabled=false; hintBtn.classList.remove('used') }
    $('segelQuestion').scrollTop=0;
    paintSeal();

    const box=$('segelAnswers'); box.innerHTML='';
    if(!renderTypedAnswer(q,box)){
      mix([{v:q.answer,tag:'correct',label:q.answer},...(q.wrong||[])]).forEach(o=>{
        const b=document.createElement('button');
        b.className='ans'; b.type='button'; b.textContent=o.label??o.v;
        b.onclick=()=>respond(o,b);
        box.appendChild(b);
      });
    }
  }

  function toast(text){
    const el=$('segelToast'); if(!el)return;
    el.textContent=text; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1100);
  }

  async function respond(option,button){
    if(run&&run.production)return respondProduction(option,button);
    const activeRun=run;
    if(!activeRun||activeRun.locked)return;
    activeRun.locked=true;
    [...$('segelAnswers').children].forEach(b=>b.disabled=true);
    const correct=option.tag==='correct';
    button.classList.add(correct?'ok':'no');
    activeRun.asked++;
    if(correct){
      sfx('correct');activeRun.tally[activeRun.usedHint?'hint':'own']++;await stage.strike();
      if(!currentRun(activeRun))return;
      const outcome=stage.hitSeal();if(outcome.broken)toast('KUNCI '+outcome.tier.name+' PECAH!');
      $('segelFeedback').textContent=outcome.broken?`Kunci ${outcome.tier.name} pecah!`:'Betul! Kunci retak.';
      paintSeal();if(stage.allBroken())return celebrate(activeRun);
    }else{sfx('wrong');activeRun.tally.miss++;$('segelFeedback').textContent=q_hint(activeRun.q);stage.wrong();await wait(520);if(!currentRun(activeRun))return;}
    if(activeRun.asked>=MAX_Q)return celebrate(activeRun);
    await wait(420);if(!currentRun(activeRun))return;activeRun.locked=false;drawQuestion();
  }

  async function respondProduction(option,button){
    if(run.locked)return;
    const q=run.q,hostRun=run.productionRun;if(!q||!productionCurrent(hostRun,q))return;
    run.locked=true;
    const correct=option.tag==='correct'&&String(option.v)===String(q.answer);
    if(!correct&&!run.retryOpen){
      const result=window.PAProductionJourney?.firstWrong?.(q,option);
      if(!productionCurrent(hostRun,q))return;
      button.classList.add('no');button.disabled=true;run.retryOpen=true;
      $('segelFeedback').textContent=result?.hint?`Belum tepat. ${result.hint}`:'Belum tepat. Cuba sekali lagi.';
      $('segelHint')?.classList.add('needs-help');run.locked=false;setTypedRetryEnabled();return;
    }
    if(!correct&&String(option.v)===String(hostRun.session.retryState?.wrongValue)){
      $('segelFeedback').textContent='Jawapan itu sudah dicuba. Cuba nilai yang lain.';
      run.locked=false;setTypedRetryEnabled(true);return;
    }
    [...$('segelAnswers').children].forEach(b=>b.disabled=true);
    button.classList.add(correct?'ok':'no');
    const result=window.PAProductionJourney?.resolve?.(q,option,correct);
    if(!productionCurrent(hostRun,q))return;
    run.asked++;
    if(correct){
      run.tally[run.usedHint?'hint':'own']++;await stage.strike();
      if(!productionCurrent(hostRun,q))return;
      const outcome=stage.hitSeal();$('segelFeedback').textContent=outcome.broken?`Kunci ${outcome.tier.name} pecah!`:'Betul! Kunci retak.';paintSeal();
      if(stage.allBroken()){window.PAProductionJourney?.complete?.();if(!productionCurrent(hostRun,q))return;return celebrateProduction(hostRun,q);}
    }else{run.tally.miss++;stage.wrong();$('segelFeedback').textContent=`Belum tepat. ${q_hint(q)}`;}
    if(result?.intervention){window.PAProductionJourney?.pauseForLearning?.(result.intervention);return;}
    await wait(420);if(!productionCurrent(hostRun,q))return;run.retryOpen=false;run.locked=false;drawQuestion();
  }

  async function celebrateProduction(hostRun,q){
    if(!productionCurrent(hostRun,q))return;
    run.locked=true;$('segelTag').style.opacity='0';toast('AURORA BEBAS!');await stage.rescue();if(!productionCurrent(hostRun,q))return;finishRun(true);window.PATemanReveal?.show?.(hostRun.temanRevealAward);hostRun.temanRevealAward=null;
  }

  /* Satu penamat sahaja: Aurora diselamatkan. Kalau soalan habis sebelum
     segel terakhir pecah, Wira menghabiskan bakinya. Yang membezakan
     pencapaian ialah bintang pada skrin keputusan, bukan menang/kalah. */
  async function celebrate(activeRun=run){
    if(!currentRun(activeRun))return;
    activeRun.locked=true;
    $('segelTag').style.opacity='0';
    if(!stage.allBroken()){
      toast('SATU TEBASAN LAGI!');
      await stage.forceBreakRest();
      if(!currentRun(activeRun))return;
    }
    toast(`${devPetName().toUpperCase()} BEBAS!`);
    await stage.rescue();
    if(!currentRun(activeRun))return;
    await stage.absorbCoins();   // Wira serap cahaya segel dahulu
    if(!currentRun(activeRun))return;
    finishRun(true);
  }

  function q_hint(q){
    const hint=(q&&q.hint)?String(q.hint):'';
    return hint?`Belum tepat. ${hint}`:'Belum tepat. Cuba baca semula soalan.';
  }

  /* Mockup Berjaya menggugurkan jadual "Faham sendiri / Dengan petunjuk /
     Kurang pasti", dan BerjayaResultContract.cs memang melarangnya. Tetapi
     Demo ini benar-benar menjejaki angka itu, jadi ia tidak dibuang begitu
     sahaja — ia disebut sebagai ayat benar oleh Cikgu apabila memang ada
     petunjuk digunakan. Tiada statistik direka. */
  /* Bintang timbul satu demi satu supaya murid membacanya sebagai kiraan,
     bukan sekadar tiga imej yang muncul serentak. Hanya bintang yang DIPEROLEH
     beranimasi; yang kosong kekal statik supaya bezanya jelas.

     Kelas `pop` dibuang dahulu dan reflow dipaksa: tanpa itu, bintang yang
     sudah `on` daripada pusingan sebelumnya tidak akan memainkan semula
     animasinya apabila murid menekan Main Semula. */
  function popStars(stars){
    const box=$('segelResultStars');
    if(!box)return;
    const all=[...box.querySelectorAll('i')];
    all.forEach((el,i)=>{ el.classList.toggle('on',i<stars); el.classList.remove('pop') });
    void box.offsetWidth;
    if(reduceMotion)return;
    all.filter(el=>el.classList.contains('on')).forEach((el,i)=>{
      el.style.setProperty('--popDelay',(i*150)+'ms');
      el.classList.add('pop');
    });
  }

  function coachLine(t,acc,asked){
    if(acc===100)return `Hebat, Wira! Semua ${asked} soalan kamu jawab tepat. Teruskan usaha ini!`;
    const say=[acc>=80?'Syabas! Aurora sudah selamat.':'Aurora sudah selamat.'];
    if(t.hint>0)say.push(`${t.own} soalan kamu selesaikan sendiri, ${t.hint} dengan petunjuk.`);
    say.push(acc>=80?'Sikit lagi untuk tiga bintang.':'Ulang sekali lagi untuk kumpul lebih bintang.');
    return say.join(' ');
  }

  function finishRun(won,note){
    run.locked=true;
    const t=run.tally, correct=t.own+t.hint, asked=Math.max(1,run.asked);
    const acc=Math.round(correct/asked*100);

    // Kegagalan teknikal (contohnya generator/bank tidak tersedia) bukan
    // keputusan permainan. Jangan tunjuk BERJAYA, victory art atau bintang
    // kerana Aurora belum melalui rescue payoff sebenar.
    if(won===false){
      $('segelDoneTitle').textContent='DEMO TERGENDALA';
      $('segelDoneText').textContent=note||'Demo tidak dapat diteruskan.';
      // Kad keputusan tidak lagi membawa salinan watak — arena di belakangnya
      // yang menunjukkan Wira dan Aurora, jadi tiada <img> untuk dikemas kini.
      $('segelStatCorrect').textContent='—';
      $('segelStatAcc').textContent='—';
      popStars(0);   // tiada bintang, dan `pop` turut dibersihkan
      $('segelCoachSay').textContent='Cuba semula. Progress murid tidak terjejas.';
      $('segelDone').hidden=false;
      $('segelDone').scrollTop=0;
      return;
    }

    // Bintang ikut Unity RescuePayoff.cs: satu bintang asas, +1 pada 80%, +1 pada 100%.
    const stars=correct===0?0:1+(acc>=80?1:0)+(acc===100?1:0);

    $('segelDoneTitle').textContent='BERJAYA!';
    $('segelDoneText').textContent=devSubject(note||`${devPetName()} berjaya diselamatkan!`);
    $('segelStatCorrect').textContent=`${correct} / ${run.asked}`;
    $('segelStatAcc').textContent=acc+'%';
    popStars(stars);
    $('segelCoachSay').textContent=devSubject(coachLine(t,acc,run.asked));
    $('segelDone').hidden=false;
    $('segelDone').scrollTop=0;
  }

  /* =================================================================
     MASUK / KELUAR
     ================================================================= */
  function startRun(){
    run={generation:++runGeneration,pool:skillPool(),asked:0,locked:false,q:null,usedHint:false,
         writtenArithmeticPreview:entryMode?.writtenArithmeticPreview||null,
         tally:{own:0,hint:0,miss:0},
         /* `coachAdaptive` hanya untuk laluan Kembara: ia yang membenarkan
            ensureCoachSession()/chooseCoachFrontierSkill() berjalan. `demoMode`
            kekal supaya save() tidak sekali-kali menulis progress dari sini. */
         sess:{mode:'practice',hint:false,hintLevel:0,recent:[],
               questionFingerprints:[],questionHistory:[],demoMode:true,
               coachAdaptive:!!(entryMode&&entryMode.adaptive&&!entryMode.devBattlefield),
               missionChapter:(entryMode&&entryMode.chapter)?String(entryMode.chapter):null,
               missionAnswered:0,coach:null,recoveryFor:null,stretchFor:null}};
    $('segelDone').hidden=true;
    stage.reset();
    stage.armEntry();
    enterWhenRevealed();    // Wira turun sebagai zarah biru, sama seperti portal
    paintSeal();
    drawQuestion();
  }

  function startProductionRun(productionRun){
    if(!window.PAProductionJourney?.isCurrent?.(productionRun))return;
    run={production:true,productionRun,generation:++runGeneration,productionGeneration:productionRun.session.generation,asked:0,locked:false,retryOpen:false,q:null,usedHint:false,tally:{own:0,hint:0,miss:0}};
    $('segelDone').hidden=true;stage.reset();stage.armEntry();enterWhenRevealed();paintSeal();drawQuestion();
  }

  /* Sinematik portal (segel-entry-cinematic) memuatkan pentas di belakang
     tirai gelap, kemudian mendedahkan arena. Perhimpunan zarah mesti bermula
     pada detik pendedahan itu, bukan semasa tirai masih menutup.

     Jaring keselamatan mesti LEBIH PANJANG daripada kes terburuk sinematik,
     bukan sekadar "agak lama". Video portal 8s; tambah jam pengawas video 12s,
     tunggu lukisan arena 3.5s dan peralihan ~0.9s, kes terburuknya lebih
     kurang 16.5s. Jaring 7s dahulu tercetus SEBELUM video pun habis, jadi
     zarah berhimpun habis di belakang tirai dan Wira nampak macam muncul
     begitu sahaja. */
  const ENTRY_FALLBACK_MS=20000;
  let entrySeq=0;
  function enterWhenRevealed(){
    // Token per-larian: kalau murid memulakan pusingan baharu, jaring
    // keselamatan larian lama tidak boleh mencetuskan kemasukan pusingan ini.
    const seq=++entrySeq;
    let fired=false;
    let obs=null, timer=0;
    const fire=()=>{
      if(obs){ obs.disconnect(); obs=null }
      if(timer){ clearTimeout(timer); timer=0 }
      document.removeEventListener('pa:battle-reveal',fire);
      if(fired||seq!==entrySeq)return;
      fired=true;
      try{ stage.enter() }catch(_){}
    };
    const overlay=document.querySelector('.paSegelEntryCinematic');
    if(!overlay||overlay.classList.contains('revealBattle'))return fire();

    // Isyarat utama: sinematik memberitahu kita sendiri bila arena didedahkan.
    document.addEventListener('pa:battle-reveal',fire);
    // Sandaran untuk sinematik lama yang belum menghantar acara itu.
    obs=new MutationObserver(()=>{
      if(overlay.classList.contains('revealBattle')||!overlay.isConnected)fire();
    });
    obs.observe(overlay,{attributes:true,attributeFilter:['class']});
    // Jaring terakhir: jangan sekali-kali tinggalkan Wira tidak kelihatan.
    timer=setTimeout(fire,ENTRY_FALLBACK_MS);
  }

  // Butang speaker: ini sebabnya kad soalan mesti kekal DOM. Prompt ialah teks
  // sebenar, jadi peranti boleh membacanya untuk murid yang belum lancar membaca.
  function bindSpeaker(){
    const spk=$('segelSpk');
    if(!spk||spk.dataset.bound)return;
    spk.dataset.bound='1';
    spk.onclick=()=>{
      if(!('speechSynthesis' in window)||!run||!run.q)return;
      speechSynthesis.cancel();
      const holder=document.createElement('div');
      holder.innerHTML=run.q.prompt||'';
      const text=(holder.textContent||'').replace(/\s+/g,' ').trim();
      if(!text)return;
      const say=new SpeechSynthesisUtterance(text);
      say.lang='ms-MY'; say.rate=.9;
      spk.setAttribute('aria-pressed','true');
      say.onend=say.onerror=()=>spk.setAttribute('aria-pressed','false');
      speechSynthesis.speak(say);
    };
  }

  /* Petunjuk wujud supaya "Cara kamu menjawab" pada skrin keputusan jujur:
     tanpa butang ini, kiraan "Dengan petunjuk" akan sentiasa sifar. */
  function bindHint(){
    const btn=$('segelHint');
    if(!btn||btn.dataset.bound)return;
    btn.dataset.bound='1';
    btn.onclick=()=>{
      if(!run||!run.q||run.locked)return;
      if(run.production){
        run.usedHint=true;btn.disabled=true;btn.classList.add('used');
        $('segelFeedback').textContent=window.PAProductionJourney?.hint?.()||'Baca semula soalan perlahan-lahan.';
        [...$('segelAnswers').children].forEach(x=>{if(!x.classList.contains('no'))x.disabled=false});setTypedRetryEnabled();return;
      }
      run.usedHint=true;
      btn.disabled=true; btn.classList.add('used');
      $('segelFeedback').textContent=run.q.hint||'Baca semula soalan perlahan-lahan.';
      if(typeof playSfx==='function')try{playSfx('ui')}catch(_){}
    };
  }

  /* Header app disembunyikan pada skrin ini, jadi butang bunyi app tak dapat
     dicapai. Tanpa satu di sini, murid yang senyapkan bunyi tak boleh
     hidupkan semula tanpa keluar dari demo. */
  function bindSound(){
    const btn=$('segelSound');
    if(!btn)return;
    const paint=()=>{
      const muted=(typeof paMuted!=='undefined')?paMuted:false;
      btn.textContent=muted?'🔇':'🔊';
      btn.setAttribute('aria-pressed',muted?'true':'false');
      btn.setAttribute('aria-label',muted?'Hidupkan bunyi':'Senyapkan bunyi');
    };
    if(!btn.dataset.bound){
      btn.dataset.bound='1';
      btn.onclick=()=>{ if(typeof toggleSound==='function')toggleSound(); paint() };
    }
    paint();
  }

  /* `mode` ialah adapter produksi Menu V2:
       openSegelDemo()                   — kelakuan asal (kolam teras darjah)
       openSegelDemo({chapter:'3'})      — Selamatkan Pet: topik yang dipilih
       openSegelDemo({adaptive:true})    — Kembara Dimensi: laluan Cikgu
     Sinematik masuk (segel-entry-cinematic) menghantar semula argumen ini
     tanpa diubah, jadi tiada perubahan diperlukan di sana. */
  window.openSegelDemo=async function(mode){
    if(typeof db==='undefined'||!db)return;
    const opening=++demoOpenGeneration;
    entryMode=(mode&&typeof mode==='object')?mode:null;
    if(entryMode&&entryMode.adaptive&&typeof chooseCoachFrontierSkill!=='function'){
      console.warn('[segel-demo] laluan adaptif diminta tetapi chooseCoachFrontierSkill tiada');
      entryMode=null;
      return;
    }
    reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(typeof screen==='function')screen('segelDemo');
    try{ await boot() }
    catch(_){ $('segelFeedback').textContent='Pentas 3D tidak dapat dimuat pada peranti ini.'; return }
    if(opening!==demoOpenGeneration)return;
    // Satu stage WebGL dikongsi antara pembukaan. Tetapkan semula kepada
    // Aurora untuk demo biasa supaya pilihan pet Battlefield Dev tidak bocor
    // ke sesi murid yang seterusnya.
    await stage.setPet?.(devPetConfig());
    if(opening!==demoOpenGeneration)return;
    bindSpeaker(); bindSound(); bindHint();
    if(!window.__segelResizeBound){
      window.__segelResizeBound=true;
      window.addEventListener('resize',()=>{ try{ placeSealBar() }catch(_){} });
    }
    stage.resume();
    $('segelDevControls')?.classList.toggle('hidden',!entryMode?.devBattlefield);
    startRun();
  };

  window.openWrittenArithmeticPreview=function(operation){
    if(typeof db==='undefined'||!db||typeof isDevMode==='function'&&!isDevMode())return;
    const grade=Number(document.getElementById('devGrade')?.value||db.schoolGrade||1);
    const preview=window.PAWrittenArithmetic?.previewQuestion?.(grade,operation);
    if(!preview)return;
    closeDevPanel?.();
    window.openSegelDemo({writtenArithmeticPreview:preview});
  };

  window.PASegelHost={
    openProduction:async productionRun=>{
      const generation=productionRun?.session?.generation;
      ++demoOpenGeneration;entryMode=null;reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(typeof screen==='function')screen('segelDemo');
      try{await boot()}catch(_){$('segelFeedback').textContent='Pentas Gembok tidak dapat dimuat pada peranti ini.';return;}
      if(!window.PAProductionJourney?.isCurrent?.(productionRun)||productionRun.session.generation!==generation)return;
      await stage.setPet?.(null);
      if(!window.PAProductionJourney?.isCurrent?.(productionRun)||productionRun.session.generation!==generation)return;
      bindSpeaker();bindSound();bindHint();stage.resume();startProductionRun(productionRun);
    },
    resumeProduction:productionRun=>{if(!run||!run.production||run.productionRun!==productionRun||!window.PAProductionJourney?.isCurrent?.(productionRun))return;if(typeof screen==='function')screen('segelDemo');stage.resume();run.locked=false;run.retryOpen=false;drawQuestion();},
    pause:()=>stage&&stage.pause()
  };

  window.closeSegelDemo=function(){
    try{ window.speechSynthesis&&speechSynthesis.cancel() }catch(_){}
    stage&&stage.pause();
    if(entryMode?.devBattlefield){ window.PABattlefieldDev?.exit?.({fromSegel:true}); return; }
    if(window.PAProductionJourney?.isActive?.()){window.PAProductionJourney.close();return;}
    /* renderHub() kini membuka Menu V2 produksi (menu-v2-v1.0.0.js membalutnya),
       jadi murid tidak pernah mendarat pada Hub lama dari sini. */
    if(typeof renderHub==='function')renderHub();
    else if(typeof openMenuV2==='function')openMenuV2();
    else if(typeof screen==='function')screen('hub');
  };

  window.restartSegelDemo=function(){ if(run?.production)return window.PAProductionJourney?.restart?.(run.productionRun);if(stage)startRun() };

  // Dibaca oleh bukti/QA: laluan mana yang membuka pusingan ini.
  window.segelEntryMode=()=>entryMode;

  // Permukaan dev, sama corak dengan modul lain dalam repo ini.
  window.PASegelDemo={
    open:()=>window.openSegelDemo(),
    close:()=>window.closeSegelDemo(),
    restart:()=>window.restartSegelDemo(),
    mode:()=>entryMode,
    setPet:pet=>{ if(entryMode?.devBattlefield){entryMode.pet=pet;stage?.setPet?.(pet)} },
    pause:()=>stage?.pause?.(),
    clearMode:()=>{++demoOpenGeneration;++runGeneration;run=null;entryMode=null;stage?.cancel?.();return stage?.setPet?.(null)},
    tiers:TIERS,
    state:()=>run
  };
})();
