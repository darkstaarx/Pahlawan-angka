/* Segel Tambah — demo pentas WebGL v1.5.0 (fail: segel-demo-v1.5.0.js)
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
    {key:'gangsa', name:'GANGSA', hits:2, color:0xff6e29, period:3.4, height:2.56},
    {key:'perak',  name:'PERAK',  hits:3, color:0xbde0ff, period:3.0, height:2.72},
    {key:'emas',   name:'EMAS',   hits:5, color:0xffb838, period:2.6, height:2.88}
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
    heroHappy:[0,1,2,3].map(i=>`assets/heroes/wira-chibi/frames/happy-${i}-v1.webp`),
    heroVictory:'assets/heroes/wira-chibi/frames/victory-v1.webp',
    seals:TIERS.map(t=>`assets/fx/segel/${t.key}-v1.webp`),
    coin:'assets/fx/reward/coin-v1.webp',
    trail:'assets/fx/reward/trail-v1.webp',
    flare:'assets/fx/reward/flare-v1.webp'
  };
  const COINS=6;   // sama dengan RescueRewardOrbs.cs

  /* Masa bingkai idle. Nafas Wira ialah 4 bingkai dengan bingkai ke-4 mata
     tertutup, jadi kelipan mesti pendek — kalau semua bingkai sama panjang,
     Wira nampak mengantuk dan gerakannya terlalu laju sekali gus. */
  const HERO_IDLE_HOLD=[0.40,0.40,0.40,0.11];    // satu kitaran 1.31s
  const HERO_CHEER_HOLD=[0.16,0.20,0.18,0.22];   // sorakan kemenangan, lebih pantas
  /* Aurora sedang sedih dan terkurung, jadi dia hampir tidak bergerak: setiap
     pose bertahan ~2.6s. Bingkai 2 dan 7 ialah mata tertutup, jadi keduanya
     ditahan pendek sahaja — kalau tidak dia nampak tertidur, bukan sayu. */
  const PET_IDLE_HOLD=[2.6,2.6,0.16,2.6,2.6,2.6,2.6,0.16];

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
           coinTex, trailTex, flareTex, heroHappy] = await Promise.all([
      load(FRAMES.arena),
      Promise.all(FRAMES.heroIdle.map(load)),
      load(FRAMES.heroPrepare),
      load(FRAMES.heroSlash),
      Promise.all(FRAMES.petSad.map(load)),
      Promise.all(FRAMES.petJoy.map(load)),
      Promise.all(FRAMES.seals.map(load)),
      load(FRAMES.coin), load(FRAMES.trail), load(FRAMES.flare),
      Promise.all(FRAMES.heroHappy.map(load))
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
    const HERO_UPP=2.6/480, PET_UPP=1.22/400;
    const GROUND=-1.92, HERO_GROUND=GROUND, PET_FEET=GROUND;
    const SEAL_X=1.52, HERO_HOME=-1.62;
    const probe=document.createElement('canvas'); probe.width=probe.height=96;
    const probeCtx=probe.getContext('2d',{willReadFrequently:true});
    function measure(img){
      const N=96;
      try{
        probeCtx.clearRect(0,0,N,N); probeCtx.drawImage(img,0,0,N,N);
        const d=probeCtx.getImageData(0,0,N,N).data;
        let x0=N,y0=N,x1=-1,y1=-1, ringRow=-1, ringCount=-1;
        for(let y=0;y<N;y++){
          let solid=0;
          for(let x=0;x<N;x++){
            const a=d[(y*N+x)*4+3];
            if(a>18){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y }
            if(a>150)solid++;
          }
          // Gelang tapak kubah ialah jalur paling tebal di bahagian bawah.
          if(y>N*.55 && solid>ringCount){ ringCount=solid; ringRow=y }
        }
        if(x1<0)return {foot:0,cx:0,ring:1};
        return {foot:(N-1-y1)/N, cx:((x0+x1)/2)/N-.5, ring:ringRow>=0?ringRow/N:1};
      }catch(_){ return {foot:0,cx:0,ring:1} }
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
    function sealEntry(tex,upp){
      const img=tex&&tex.image;
      if(!img)return {tex,w:1,h:1,offX:0,offY:.5};
      const w=img.width*upp, h=img.height*upp, m=measure(img);
      return {tex, w, h, offX:-m.cx*w, offY:h*(m.ring-.5)};
    }
    const heroIdleE=heroIdle.map(t=>entry(t,HERO_UPP));
    const heroHappyE=heroHappy.map(t=>entry(t,HERO_UPP));
    const heroPrepareE=entry(heroPrepare,HERO_UPP);
    const heroSlashE=entry(heroSlash,HERO_UPP);
    const petSadE=petSad.map(t=>entry(t,PET_UPP));
    const petJoyE=petJoy.map(t=>entry(t,PET_UPP));

    function actor(first,z){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial({map:first.tex,transparent:true,depthWrite:false}));
      m.position.z=z; m.userData.e=first; scene.add(m); return m;
    }
    const hero=actor(heroIdleE[0],0);
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
    function sealMaterial(map){
      return new THREE.ShaderMaterial({
        uniforms:{map:{value:map},uGrey:{value:0},uOpacity:{value:1}},
        transparent:true, depthWrite:false,
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'uniform sampler2D map;uniform float uGrey;uniform float uOpacity;varying vec2 vUv;'+
          'void main(){vec4 c=texture2D(map,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));'+
          'c.rgb=mix(c.rgb,vec3(l),uGrey);gl_FragColor=vec4(c.rgb,c.a*uOpacity);}'
      });
    }
    const seals=TIERS.map((tier,i)=>{
      const e=sealEntry(sealTex[i], sealTex[i]&&sealTex[i].image ? tier.height/sealTex[i].image.height : tier.height/768);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1), sealMaterial(e.tex));
      m.scale.set(e.w,e.h,1);
      m.position.set(SEAL_X+e.offX, GROUND+e.offY, -.26);
      m.visible=(i===0);
      scene.add(m);
      return {tier, mesh:m, base:{w:e.w,h:e.h}, damage:0, broken:false, breakT:-1};
    });

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
    const flash=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4),flashMat);
    flash.position.set(SEAL_X,GROUND+.8,.28); scene.add(flash);

    const PN=220;
    const pPos=new Float32Array(PN*3), pVel=new Float32Array(PN*3), pLife=new Float32Array(PN);
    const pGeo=new THREE.BufferGeometry();
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
    const pMat=new THREE.PointsMaterial({color:0xffe4a8,size:.1,transparent:true,opacity:.95,
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

    const S={heroX:HERO_HOME,heroFeet:HERO_HOME,petY:GROUND,petFeet:GROUND,camY:0,
             shake:0,waveT:-1,flashT:-1,flareT:-1,running:true,active:0,
             heroFrames:heroIdleE,heroHold:HERO_IDLE_HOLD,
             petFrames:petSadE,petHold:PET_IDLE_HOLD,petFps:4,
             heroLock:null,grey:0,coinT:-1};
    let raf=0, last=performance.now(), tAcc=0;

    function swap(mesh,e){
      if(!e||mesh.userData.e===e)return;
      mesh.userData.e=e;
      mesh.material.map=e.tex; mesh.material.needsUpdate=true;
      mesh.scale.set(e.w,e.h,1);
    }

    function frame(now){
      raf=requestAnimationFrame(frame);
      if(!S.running)return;
      const dt=Math.min((now-last)/1000,.05); last=now; tAcc+=dt;

      swap(hero, S.heroLock || heldFrame(S.heroFrames,S.heroHold,tAcc));
      swap(pet,  S.petHold ? heldFrame(S.petFrames,S.petHold,tAcc)
                           : S.petFrames[Math.floor(tAcc*S.petFps)%S.petFrames.length]);

      // S.heroX dan S.petY ialah kedudukan KAKI, bukan pusat satah.
      S.heroFeet=damp(S.heroFeet,S.heroX,15,dt);
      S.petFeet=damp(S.petFeet,S.petY,9,dt);
      hero.position.x=S.heroFeet+hero.userData.e.offX;
      hero.position.y=GROUND+hero.userData.e.offY;
      heroShadow.position.x=S.heroFeet;
      pet.position.x=SEAL_X+pet.userData.e.offX;
      pet.position.y=S.petFeet+pet.userData.e.offY;

      // Bayang Aurora kekal di lantai dan mengecut bila dia naik.
      const rise=Math.max(0,(S.petFeet-GROUND))/.8;
      petShadow.scale.set(PET_SHADOW_W*(1-.3*rise), PET_SHADOW_W*.34*(1-.3*rise), 1);
      petShadow.material.opacity=1-.45*Math.min(1,rise);

      // Segel: satu tier kelihatan, bernafas perlahan, kelabu bila terkena.
      const activeTier=TIERS[Math.min(S.active,TIERS.length-1)];
      backGlow.material.color.setHex(activeTier.color);
      backGlow.material.opacity=S.active>=TIERS.length?0:.42+(reduceMotion?0:.1*Math.sin(tAcc*2));
      S.grey=damp(S.grey,0,3.4,dt);
      seals.forEach((s,i)=>{
        const u=s.mesh.material.uniforms;
        if(s.breakT>=0){
          s.breakT+=dt;
          const k=Math.min(1,s.breakT/.42);
          // Kepit dulu (ketat), baru meletup keluar — itu yang buat mata baca
          // "pop" dan bukan "pudar".
          const grow=k<.22 ? 1-.10*(k/.22) : 1+.62*((k-.22)/.78);
          s.mesh.scale.set(s.base.w*grow, s.base.h*grow, 1);
          u.uOpacity.value=k<.22 ? 1 : 1-((k-.22)/.78);
          u.uGrey.value=1;
          if(k>=1){ s.breakT=-1; s.mesh.visible=false }
          return;
        }
        s.mesh.visible=(i===S.active);
        if(!s.mesh.visible)return;
        // Nafas: kubah mengembang dan mengecut perlahan, bukan sekadar pudar.
        const breath=reduceMotion?0:Math.sin(tAcc*Math.PI*2/s.tier.period);
        const grow=1+breath*.034;
        s.mesh.scale.set(s.base.w*grow, s.base.h*grow, 1);
        u.uOpacity.value=.92+(reduceMotion?.06:breath*.07);
        // Kelabu berkekalan mengikut kerosakan, ditambah kilas kelabu penuh
        // pada detik hentaman.
        u.uGrey.value=Math.min(1, Math.max(S.grey, s.damage*.55));
      });

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

      if(S.flashT>=0){
        S.flashT+=dt; const k=S.flashT/.26;
        if(k>=1){ S.flashT=-1; flashMat.opacity=0 }
        else { flash.scale.setScalar(.7+k*.9); flashMat.opacity=(1-k)*.85 }
      }

      if(S.waveT>=0){
        S.waveT+=dt; const k=S.waveT/.55;
        if(k>=1){ S.waveT=-1; waveMat.opacity=0 }
        else { const s=1+k*5.5; wave.scale.set(s,s,1); waveMat.opacity=(1-k)*.9 }
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
    const ro=new ResizeObserver(resize); ro.observe(host);
    resize(); raf=requestAnimationFrame(frame);

    canvas.addEventListener('webglcontextlost',ev=>{
      ev.preventDefault(); S.running=false;
      host.classList.add('loading');
    });

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
        const wy=(GROUND+tier.height*.92)-camera.position.y;
        return {x:(wx/visW+.5)*100, y:(.5-wy/visH)*100};
      },
      /* Wira menyerang SEGEL, bukan Aurora. Bunyi: pedang masa tebasan,
         hentaman masa sentuh — dua kesan berasingan, bukan satu. */
      async strike(){
        const tier=TIERS[Math.min(S.active,TIERS.length-1)];
        if(reduceMotion){ sfx('hit'); burst(3,tier.color); S.waveT=0; return }
        S.heroLock=heroPrepareE; S.heroX=HERO_HOME-.35; await wait(170);
        sfx('swordSlash');
        S.heroLock=heroSlashE;  S.heroX=-0.30; await wait(140);
        sfx('hit');
        burst(5.5,tier.color); S.waveT=0; S.shake=.32;
        await wait(210);
        S.heroLock=null; S.heroX=HERO_HOME;
      },
      // Satu jawapan betul = satu hentaman pada segel aktif.
      hitSeal(){
        const s=seals[S.active]; if(!s)return {broken:false};
        s.damage=Math.min(1,s.damage+1/s.tier.hits);
        S.grey=1;                      // kilas kelabu pada detik hentaman
        if(s.damage>=.999){
          s.broken=true; s.breakT=0;
          popSound();
          burst(6.5,0xffffff); S.waveT=0; S.flashT=0; S.shake=.46;
          S.active=Math.min(TIERS.length,S.active+1);
          return {broken:true, tier:s.tier};
        }
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
        while(S.active<TIERS.length){
          const s=seals[S.active];
          s.damage=1; s.broken=true; s.breakT=0;
          popSound(); burst(6,0xffffff); S.flashT=0; S.shake=.4;
          S.active++;
          await wait(320);
        }
      },
      async rescue(){
        sfx('finisher');
        S.shake=.5; burst(7,0xffffff); S.waveT=0; S.flashT=0;
        // Aurora bebas dan Wira bersorak — kedua-duanya bertukar sprite gembira.
        S.petFrames=petJoyE; S.petHold=null; S.petFps=4; S.petY=GROUND+.7;
        S.heroFrames=heroHappyE; S.heroHold=HERO_CHEER_HOLD; S.heroLock=null;
        await wait(520); S.petY=GROUND;
        await wait(420);
      },
      // Wira menyerap cahaya segel sebagai syiling sebelum skrin keputusan.
      async absorbCoins(){
        coins.forEach(c=>{ c.picked=false; c.coin.visible=false; c.trail.visible=false });
        S.coinT=0;
        await wait(520+COINS*120+560);
      },
      wrong(){ S.shake=.14 },
      reset(){
        S.active=0; S.heroX=HERO_HOME; S.heroLock=null; S.grey=0; S.coinT=-1;
        coins.forEach(c=>{ c.picked=true; c.coin.visible=false; c.trail.visible=false });
        absorbFlare.visible=false;
        S.petFrames=petSadE; S.petHold=PET_IDLE_HOLD; S.petY=GROUND;
        S.heroFrames=heroIdleE; S.heroHold=HERO_IDLE_HOLD;
        seals.forEach((s,i)=>{ s.damage=0; s.broken=false; s.breakT=-1;
          s.mesh.visible=(i===0);
          s.mesh.material.uniforms.uOpacity.value=1;
          s.mesh.material.uniforms.uGrey.value=0;
          s.mesh.scale.set(s.base.w,s.base.h,1) });
      },
      pause(){ S.running=false },
      resume(){ S.running=true; last=performance.now(); resize() },
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
  function skillPool(){
    const grade=(typeof db!=='undefined'&&db&&db.schoolGrade)||1;
    let pool=[];
    try{ pool=GRAPH.skills.filter(x=>x.grade===grade&&x.role==='core').map(x=>x.id) }catch(_){}
    if(!pool.length)pool=['D1.MONEY'];
    return mix(pool);
  }

  // generate() menulis ke `sess` (anti-ulang, sejarah soalan). Kita pinjamkan
  // sess demo sekejap dan pulangkan yang asal — progress murid tak tersentuh.
  function withDemoSess(fn){
    const original=(typeof sess!=='undefined')?sess:null;
    try{ sess=run.sess; return fn() }
    catch(err){ console.error('[segel-demo] generate gagal',err); return null }
    finally{ if(original)sess=original }
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

  function drawQuestion(){
    const id=run.pool[run.asked%run.pool.length];
    const q=withDemoSess(()=>{
      const s=(typeof scoreState==='function')?scoreState(id):{mastery:40,confidence:40,evidence:0,correct:0,wrong:0};
      const out=generate(id,s,{battleTier:'minion',isBoss:false});
      if(out)out.skill=id;
      return out;
    });
    if(!q){ finishRun(false,'Bank soalan tidak dapat dimuat.'); return }
    run.q=q;

    const meta=(typeof META!=='undefined'&&META[id])||{};
    const grade=(typeof db!=='undefined'&&db&&db.schoolGrade)||meta.grade||1;
    // helper yang sama dengan battle: buang awalan "Tahun N · " supaya tajuk
    // tidak mengulang baris kecil di bawahnya.
    $('segelTitle').textContent=(typeof questionLearningTitle==='function')
      ? questionLearningTitle(meta,q) : (meta.title||'Kemahiran');
    $('segelSub').textContent=`Tahun ${grade} · ${meta.domain||'Matematik'}`;
    $('segelCount').textContent=`${run.asked+1} / ${MAX_Q}`;
    $('segelQLabel').textContent=`Soalan ${run.asked+1}`;
    $('segelQuestion').innerHTML=q.prompt;
    $('segelFeedback').textContent='';
    run.usedHint=false;
    const hintBtn=$('segelHint');
    if(hintBtn){ hintBtn.disabled=false; hintBtn.classList.remove('used') }
    $('segelQuestion').scrollTop=0;
    paintSeal();

    const box=$('segelAnswers'); box.innerHTML='';
    mix([{v:q.answer,tag:'correct',label:q.answer},...(q.wrong||[])]).forEach(o=>{
      const b=document.createElement('button');
      b.className='ans'; b.type='button'; b.textContent=o.label??o.v;
      b.onclick=()=>respond(o,b);
      box.appendChild(b);
    });
  }

  function toast(text){
    const el=$('segelToast'); if(!el)return;
    el.textContent=text; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1100);
  }

  async function respond(option,button){
    if(run.locked)return;
    run.locked=true;
    [...$('segelAnswers').children].forEach(b=>b.disabled=true);
    const correct=option.tag==='correct';
    button.classList.add(correct?'ok':'no');
    run.asked++;

    if(correct){
      sfx('correct');
      run.tally[run.usedHint?'hint':'own']++;
      await stage.strike();
      const outcome=stage.hitSeal();
      if(outcome.broken)toast('SEGEL '+outcome.tier.name+' PECAH!');
      $('segelFeedback').textContent=outcome.broken
        ? `Segel ${outcome.tier.name} pecah!`
        : 'Betul! Segel retak.';
      paintSeal();
      if(stage.allBroken())return celebrate();
    }else{
      sfx('wrong');
      run.tally.miss++;
      $('segelFeedback').textContent=q_hint(run.q);
      stage.wrong();
      await wait(520);
    }

    if(run.asked>=MAX_Q)return celebrate();
    await wait(420);
    run.locked=false;
    drawQuestion();
  }

  /* Satu penamat sahaja: Aurora diselamatkan. Kalau soalan habis sebelum
     segel terakhir pecah, Wira menghabiskan bakinya. Yang membezakan
     pencapaian ialah bintang pada skrin keputusan, bukan menang/kalah. */
  async function celebrate(){
    run.locked=true;
    $('segelTag').style.opacity='0';
    if(!stage.allBroken()){
      toast('SATU TEBASAN LAGI!');
      await stage.forceBreakRest();
    }
    toast('AURORA BEBAS!');
    await stage.rescue();
    await stage.absorbCoins();   // Wira serap cahaya segel dahulu
    finishRun(true);
  }

  function q_hint(q){
    const hint=(q&&q.hint)?String(q.hint):'';
    return hint?`Belum tepat. ${hint}`:'Belum tepat. Cuba baca semula soalan.';
  }

  function finishRun(won,note){
    run.locked=true;
    const t=run.tally, correct=t.own+t.hint, asked=Math.max(1,run.asked);
    const acc=Math.round(correct/asked*100);
    // Bintang ikut Unity RescuePayoff.cs: satu bintang asas, +1 pada 80%, +1 pada 100%.
    const stars=correct===0?0:1+(acc>=80?1:0)+(acc===100?1:0);

    $('segelDoneTitle').textContent='BERJAYA!';
    $('segelDoneText').textContent=note||'Aurora berjaya diselamatkan!';
    $('segelStatCorrect').textContent=`${correct} / ${run.asked}`;
    $('segelStatAcc').textContent=acc+'%';
    $('segelHowOwn').textContent=t.own;
    $('segelHowHint').textContent=t.hint;
    $('segelHowMiss').textContent=t.miss;
    document.querySelectorAll('#segelResultStars i').forEach((el,i)=>el.classList.toggle('on',i<stars));
    $('segelCoachSay').textContent=acc===100
      ? 'Hebat, Wira! Kamu menyelesaikan semua soalan dengan tepat. Teruskan usaha ini!'
      : (acc>=80
          ? 'Syabas! Aurora sudah selamat. Sikit lagi untuk tiga bintang.'
          : 'Aurora sudah selamat. Ulang sekali lagi untuk kumpul lebih bintang.');
    $('segelDone').hidden=false;
    $('segelDone').scrollTop=0;
  }

  /* =================================================================
     MASUK / KELUAR
     ================================================================= */
  function startRun(){
    run={pool:skillPool(),asked:0,locked:false,q:null,usedHint:false,
         tally:{own:0,hint:0,miss:0},
         sess:{mode:'practice',hint:false,hintLevel:0,recent:[],
               questionFingerprints:[],questionHistory:[],demoMode:true}};
    $('segelDone').hidden=true;
    stage.reset();
    paintSeal();
    drawQuestion();
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

  window.openSegelDemo=async function(){
    if(typeof db==='undefined'||!db)return;
    reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(typeof screen==='function')screen('segelDemo');
    try{ await boot() }
    catch(_){ $('segelFeedback').textContent='Pentas 3D tidak dapat dimuat pada peranti ini.'; return }
    bindSpeaker(); bindSound(); bindHint();
    if(!window.__segelResizeBound){
      window.__segelResizeBound=true;
      window.addEventListener('resize',()=>{ try{ placeSealBar() }catch(_){} });
    }
    stage.resume();
    startRun();
  };

  window.closeSegelDemo=function(){
    try{ window.speechSynthesis&&speechSynthesis.cancel() }catch(_){}
    stage&&stage.pause();
    if(typeof renderHub==='function')renderHub();
    else if(typeof screen==='function')screen('hub');
  };

  window.restartSegelDemo=function(){ if(stage)startRun() };

  // Permukaan dev, sama corak dengan modul lain dalam repo ini.
  window.PASegelDemo={
    open:()=>window.openSegelDemo(),
    close:()=>window.closeSegelDemo(),
    restart:()=>window.restartSegelDemo(),
    tiers:TIERS,
    state:()=>run
  };
})();
