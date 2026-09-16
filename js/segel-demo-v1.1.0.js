/* Segel Tambah — demo pentas WebGL v1.1.0 (fail: segel-demo-v1.1.0.js)
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
  const TIERS=[
    {key:'gangsa', name:'GANGSA', hits:2, color:0xff6e29, period:2.1, height:1.98},
    {key:'perak',  name:'PERAK',  hits:3, color:0xbde0ff, period:2.4, height:2.34},
    {key:'emas',   name:'EMAS',   hits:5, color:0xffb838, period:2.7, height:2.70}
  ];
  const MAX_Q=TIERS.reduce((n,t)=>n+t.hits,0);   // 10 soalan = 2+3+5

  const FRAMES={
    arena:'assets/battlefields/money-market/arena-v1.webp',
    heroIdle:[0,1,2,3].map(i=>`assets/heroes/wira-chibi/frames/idle-loop-${i}-v1.webp`),
    heroPrepare:'assets/heroes/wira-chibi/frames/rescue-prepare-v1.webp',
    heroSlash:'assets/heroes/wira-chibi/frames/rescue-slash-v1.webp',
    petSad:[0,1,2,3,4,5,6,7].map(i=>`assets/pets/aurora/frames/sad-${i}-v1.webp`),
    petJoy:[0,1].map(i=>`assets/pets/aurora/frames/joy-${i}-v1.webp`),
    seals:TIERS.map(t=>`assets/fx/segel/${t.key}-v1.webp`)
  };

  /* Masa bingkai idle. Nafas Wira ialah 4 bingkai dengan bingkai ke-4 mata
     tertutup, jadi kelipan mesti pendek — kalau semua bingkai sama panjang,
     Wira nampak mengantuk dan gerakannya terlalu laju sekali gus. */
  const HERO_IDLE_HOLD=[0.40,0.40,0.40,0.11];    // satu kitaran 1.31s
  const PET_IDLE_FPS=3.2;                         // 8 bingkai = 2.5s sekitaran

  let THREE=null, stage=null, booting=null, run=null, reduceMotion=false;

  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const damp = (c,t,l,dt) => c + (t-c)*(1-Math.exp(-l*dt));
  const sfx = name => { try{ if(typeof playSfx==='function')playSfx(name) }catch(_){} };
  const mix = list => (typeof shuffle==='function') ? shuffle(list) : [...list].sort(()=>Math.random()-.5);

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

    const [arenaTex, heroIdle, heroPrepare, heroSlash, petSad, petJoy, sealTex] = await Promise.all([
      load(FRAMES.arena),
      Promise.all(FRAMES.heroIdle.map(load)),
      load(FRAMES.heroPrepare),
      load(FRAMES.heroSlash),
      Promise.all(FRAMES.petSad.map(load)),
      Promise.all(FRAMES.petJoy.map(load)),
      Promise.all(FRAMES.seals.map(load))
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
    const HERO_UPP=2.6/480, PET_UPP=1.25/400;
    const HERO_GROUND=-1.92, PET_FEET=-1.49, SEAL_X=1.45, HERO_HOME=-1.65;
    const probe=document.createElement('canvas'); probe.width=probe.height=96;
    const probeCtx=probe.getContext('2d',{willReadFrequently:true});
    function measure(img){
      const N=96;
      try{
        probeCtx.clearRect(0,0,N,N); probeCtx.drawImage(img,0,0,N,N);
        const d=probeCtx.getImageData(0,0,N,N).data;
        let x0=N,y0=N,x1=-1,y1=-1;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          if(d[(y*N+x)*4+3]>18){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y }
        }
        if(x1<0)return {foot:0,cx:0};
        return {foot:(N-1-y1)/N, cx:((x0+x1)/2)/N-.5};
      }catch(_){ return {foot:0,cx:0} }
    }
    function entry(tex,upp){
      const img=tex&&tex.image;
      if(!img)return {tex,w:1,h:1,offX:0,offY:.5};
      const w=img.width*upp, h=img.height*upp, m=measure(img);
      return {tex, w, h, offX:-m.cx*w, offY:h*(.5-m.foot)};
    }
    const heroIdleE=heroIdle.map(t=>entry(t,HERO_UPP));
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
    heroShadow.position.set(HERO_HOME,HERO_GROUND+.04,-.01);
    const petShadow=shadow(1.35,-.33);
    petShadow.position.set(SEAL_X,PET_FEET+.03,-.33);
    const PET_SHADOW_W=1.35;

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
    backGlow.position.set(SEAL_X,PET_FEET+.75,-.35); scene.add(backGlow);

    /* Tiga kubah segel dari prototaip Unity: Gangsa di dalam, Emas di luar.
       Susunan lukisan Unity ialah pet < segel < Wira, jadi z mengikutnya. */
    const seals=TIERS.map((tier,i)=>{
      const e=entry(sealTex[i], sealTex[i]&&sealTex[i].image ? tier.height/sealTex[i].image.height : tier.height/768);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial({map:e.tex,transparent:true,depthWrite:false,opacity:1}));
      m.scale.set(e.w,e.h,1);
      m.position.set(SEAL_X+e.offX, PET_FEET+e.offY, -.26+i*.03);
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
    wave.position.set(SEAL_X,PET_FEET+.7,.3); scene.add(wave);

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
        pPos[i*3]=SEAL_X; pPos[i*3+1]=PET_FEET+.7; pPos[i*3+2]=0;
        pVel[i*3]=Math.cos(a)*s; pVel[i*3+1]=Math.sin(a)*s*.85+1.2; pVel[i*3+2]=(Math.random()-.5)*2;
        pLife[i]=.5+Math.random()*.4;
      }
    }

    const S={heroX:HERO_HOME,heroFeet:HERO_HOME,petY:PET_FEET,petFeet:PET_FEET,camY:0,
             shake:0,waveT:-1,running:true,active:0,
             heroFrames:heroIdleE,petFrames:petSadE,petFps:PET_IDLE_FPS,heroLock:null};
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

      swap(hero, S.heroLock || heldFrame(S.heroFrames,HERO_IDLE_HOLD,tAcc));
      swap(pet,  S.petFrames[Math.floor(tAcc*S.petFps)%S.petFrames.length]);

      // S.heroX dan S.petY ialah kedudukan KAKI, bukan pusat satah.
      S.heroFeet=damp(S.heroFeet,S.heroX,15,dt);
      S.petFeet=damp(S.petFeet,S.petY,9,dt);
      hero.position.x=S.heroFeet+hero.userData.e.offX;
      hero.position.y=HERO_GROUND+hero.userData.e.offY;
      heroShadow.position.x=S.heroFeet;
      pet.position.x=SEAL_X+pet.userData.e.offX;
      pet.position.y=S.petFeet+pet.userData.e.offY;

      // Bayang Aurora kekal di lantai dan mengecut bila dia melompat.
      const rise=Math.max(0,(S.petFeet-PET_FEET))/.5;
      petShadow.scale.set(PET_SHADOW_W*(1-.3*rise), PET_SHADOW_W*.34*(1-.3*rise), 1);
      petShadow.material.opacity=1-.45*Math.min(1,rise);

      // Segel: denyut hanya pada tier aktif, warna gelap mengikut kerosakan.
      const activeTier=TIERS[Math.min(S.active,TIERS.length-1)];
      backGlow.material.color.setHex(activeTier.color);
      backGlow.material.opacity=S.active>=TIERS.length?0:.42+(reduceMotion?0:.1*Math.sin(tAcc*2));
      seals.forEach((s,i)=>{
        if(s.breakT>=0){
          s.breakT+=dt;
          const k=Math.min(1,s.breakT/.45);
          s.mesh.scale.set(s.base.w*(1+k*.35), s.base.h*(1+k*.35), 1);
          s.mesh.material.opacity=1-k;
          if(k>=1){ s.breakT=-1; s.mesh.visible=false }
          return;
        }
        if(s.broken){ s.mesh.visible=false; return }
        const isActive=i===S.active;
        const pulse=reduceMotion?0:.12*Math.sin(tAcc*Math.PI*2/s.tier.period);
        s.mesh.material.opacity=(isActive?.95:.55)+(isActive?pulse:0);
        // Unity BarrierDamageTint: putih -> kelabu .60 mengikut kerosakan.
        const d=1-.40*s.damage;
        s.mesh.material.color.setRGB(d,d,d);
      });

      S.shake=damp(S.shake,0,6,dt);
      camera.position.x=(Math.random()-.5)*S.shake;
      camera.position.y=S.camY+(Math.random()-.5)*S.shake;
      bg.position.x=-camera.position.x*.4;
      bg.position.y=S.camY;

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
    const WORLD_W=6.0, FLOOR_MARGIN=.30;
    function resize(){
      const w=host.clientWidth, h=host.clientHeight;
      if(!w||!h)return;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      const visH=WORLD_W/camera.aspect;
      camera.fov=2*Math.atan(visH/2/camera.position.z)*180/Math.PI;
      camera.updateProjectionMatrix();
      S.camY=HERO_GROUND+FLOOR_MARGIN*visH;
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
      /* Wira menyerang SEGEL, bukan Aurora. Bunyi: pedang masa tebasan,
         hentaman masa sentuh — dua kesan berasingan, bukan satu. */
      async strike(){
        const tier=TIERS[Math.min(S.active,TIERS.length-1)];
        if(reduceMotion){ sfx('hit'); burst(3,tier.color); S.waveT=0; return }
        S.heroLock=heroPrepareE; S.heroX=HERO_HOME-.35; await wait(170);
        sfx('wiraSword');
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
        if(s.damage>=.999){
          s.broken=true; s.breakT=0;
          sfx('enemyDown');
          burst(6.5,s.tier.color); S.waveT=0; S.shake=.42;
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
      async rescue(){
        sfx('finisher');
        S.shake=.5; burst(7,0xffffff); S.waveT=0;
        S.petFrames=petJoyE; S.petFps=4; S.petY=PET_FEET+.5;
        await wait(520); S.petY=PET_FEET+.15;
      },
      wrong(){ S.shake=.14 },
      reset(){
        S.active=0; S.heroX=HERO_HOME; S.heroLock=null;
        S.petFrames=petSadE; S.petFps=PET_IDLE_FPS; S.petY=PET_FEET;
        seals.forEach(s=>{ s.damage=0; s.broken=false; s.breakT=-1;
          s.mesh.visible=true; s.mesh.material.opacity=1;
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

  function paintSeal(){
    const tier=stage.activeTier(), left=stage.remaining();
    const tag=$('segelTag');
    if(stage.allBroken()){ tag.style.opacity='0'; return }
    tag.style.opacity='1';
    tag.dataset.tier=tier.key;
    $('segelTagName').textContent='Segel '+tier.name.charAt(0)+tier.name.slice(1).toLowerCase();
    $('segelTagLeft').textContent=left+' hentaman lagi';
    document.querySelectorAll('#segelPips i').forEach((pip,i)=>{
      pip.dataset.tier=TIERS[i].key;
      pip.classList.toggle('gone',i<TIERS.indexOf(tier)||stage.allBroken());
      pip.classList.toggle('active',TIERS[i]===tier);
    });
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
      await stage.strike();
      const outcome=stage.hitSeal();
      if(outcome.broken)toast('SEGEL '+outcome.tier.name+' PECAH!');
      $('segelFeedback').textContent=outcome.broken
        ? `Segel ${outcome.tier.name} pecah!`
        : 'Betul! Segel retak.';
      paintSeal();
      if(stage.allBroken()){
        toast('AURORA BEBAS!');
        await stage.rescue();
        return finishRun(true);
      }
    }else{
      sfx('wrong');
      $('segelFeedback').textContent=q_hint(run.q);
      stage.wrong();
      await wait(520);
    }

    if(run.asked>=MAX_Q)return finishRun(false);
    await wait(420);
    run.locked=false;
    drawQuestion();
  }

  function q_hint(q){
    const hint=(q&&q.hint)?String(q.hint):'';
    return hint?`Belum tepat. ${hint}`:'Belum tepat. Cuba baca semula soalan.';
  }

  function finishRun(won,note){
    run.locked=true;
    $('segelDoneTitle').textContent=won?'Aurora selamat!':'Segel masih kuat';
    $('segelDoneText').textContent=note || (won
      ? `Ketiga-tiga segel pecah dalam ${run.asked} soalan. Semua soalan tadi datang dari bank sebenar.`
      : `Segel ${stage.activeTier().name} masih bertahan. Cuba lagi — soalan akan dijana semula.`);
    $('segelDoneArt').src=won?FRAMES.petJoy[0]:FRAMES.petSad[0];
    $('segelDone').hidden=false;
  }

  /* =================================================================
     MASUK / KELUAR
     ================================================================= */
  function startRun(){
    run={pool:skillPool(),asked:0,locked:false,q:null,
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
    bindSpeaker(); bindSound();
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
