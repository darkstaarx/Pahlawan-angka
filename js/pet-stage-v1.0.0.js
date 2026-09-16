/* Pentas Teman — panggung WebGL untuk teman yang sedang dilengkapi. v1.0.0
 *
 * Skrin Khazanah sebelum ini menunjukkan teman sebagai gambar pegun dalam
 * grid. Teman ialah ganjaran menyelamat, jadi ia patut terasa HIDUP: di sini
 * teman yang dilengkapi berdiri atas pentas sihir, bernafas, dan boleh
 * disentuh — ketuk dia melompat, seret dia mengikut jari.
 *
 * Grid, harga, dan butang Lengkapi/Tanggalkan semuanya kekal milik
 * rewards-v2.js. Fail ini hanya menambah pentas di atasnya dan tidak pernah
 * menulis ke `db`.
 */
(function(){
  'use strict';

  let THREE=null, stage=null, booting=null, shownPet=null;

  const $ = id => document.getElementById(id);
  const damp = (c,t,l,dt) => c + (t-c)*(1-Math.exp(-l*dt));
  const sfx = n => { try{ if(typeof playSfx==='function')playSfx(n) }catch(_){} };

  function equippedPet(){
    try{
      if(typeof db==='undefined'||!db||!db.rewards)return null;
      const id=db.rewards.equippedPet;
      if(!id||typeof REWARD_PETS==='undefined')return null;
      return REWARD_PETS[id]||null;
    }catch(_){ return null }
  }

  /* =================================================================
     PENTAS
     ================================================================= */
  async function buildStage(){
    const host=$('petStage'), canvas=$('petStageCanvas');
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,100);
    camera.position.z=10;

    const loader=new THREE.TextureLoader();
    const load = url => new Promise(res=>{
      loader.load(url, t=>{ t.colorSpace=THREE.SRGBColorSpace; res(t) }, undefined, ()=>res(null));
    });

    /* Tekstur dilukis sendiri: pentas ini tidak patut menambah satu pun
       muat turun aset baharu pada skrin yang murid buka berulang kali. */
    function radialTex(stops){
      const c=document.createElement('canvas'); c.width=c.height=128;
      const g=c.getContext('2d'), grad=g.createRadialGradient(64,64,0,64,64,64);
      stops.forEach(([o,col])=>grad.addColorStop(o,col));
      g.fillStyle=grad; g.fillRect(0,0,128,128);
      return new THREE.CanvasTexture(c);
    }
    function runeTex(){
      const c=document.createElement('canvas'); c.width=c.height=512;
      const g=c.getContext('2d'); g.translate(256,256);
      g.strokeStyle='#bfe9ff'; g.lineWidth=5;
      g.beginPath(); g.arc(0,0,226,0,Math.PI*2); g.stroke();
      g.lineWidth=2.5; g.setLineDash([10,16]);
      g.beginPath(); g.arc(0,0,196,0,Math.PI*2); g.stroke(); g.setLineDash([]);
      g.fillStyle='#e6f6ff'; g.font='bold 34px system-ui';
      g.textAlign='center'; g.textBaseline='middle';
      '+-x=◆✦'.split('').forEach((ch,i,a)=>{
        g.save(); g.rotate(i/a.length*Math.PI*2); g.fillText(ch,0,-212); g.restore();
      });
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
    }

    const GROUND=-1.05;
    /* Teman berdiri di kanan tengah supaya lajur kiri kekal lapang untuk nama
       dan penerangannya — susunan yang sama dengan mockup. Pentas sihir tidak
       bergerak; hanya teman yang boleh diseret keluar daripadanya. */
    const PET_HOME=.86;

    const glow=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2),
      new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(120,205,255,.55)'],[.45,'rgba(80,150,255,.18)'],[1,'rgba(0,0,0,0)']]),
        transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    glow.position.set(PET_HOME,GROUND+1.0,-2); scene.add(glow);

    const disc=new THREE.Mesh(new THREE.PlaneGeometry(2.9,2.9),
      new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(190,235,255,.85)'],[.55,'rgba(90,180,255,.30)'],[1,'rgba(0,0,0,0)']]),
        transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    disc.position.set(PET_HOME,GROUND+.05,-.6); disc.scale.set(1,.34,1); scene.add(disc);

    const ring=new THREE.Mesh(new THREE.PlaneGeometry(3.0,3.0),
      new THREE.MeshBasicMaterial({map:runeTex(),transparent:true,depthWrite:false,
        blending:THREE.AdditiveBlending,opacity:.75}));
    ring.position.set(PET_HOME,GROUND+.06,-.5);
    ring.rotation.x=1.16;                 // rebah hampir rata: gelang lantai
    scene.add(ring);

    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
      new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(0,0,0,.5)'],[.5,'rgba(0,0,0,.24)'],[1,'rgba(0,0,0,0)']]),
        transparent:true,depthWrite:false}));
    shadow.scale.set(1.7,.5,1); shadow.position.set(PET_HOME,GROUND+.04,-.4); scene.add(shadow);

    // teman: satah bertekstur, ditambat pada kakinya
    const pet=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
      new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:0}));
    pet.position.z=0; scene.add(pet);

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
        if(x1<0)return {foot:0,cx:0,boxH:1};
        return {foot:(N-1-y1)/N, cx:((x0+x1)/2)/N-.5, boxH:(y1-y0+1)/N};
      }catch(_){ return {foot:0,cx:0,boxH:1} }
    }

    /* Teman dilukis pada bingkai dengan kadar berbeza, jadi sauhnya ialah
       KAKI dan saiznya ialah tinggi watak yang kelihatan — bukan tinggi
       bingkai. Kalau tidak, satu teman keluar gergasi dan satu lagi kerdil. */
    const PET_VISIBLE=1.95;
    async function setPet(url){
      const tex=await load(url);
      if(!tex||!tex.image){ pet.material.opacity=0; return }
      const img=tex.image, m=measure(img);
      const planeH=PET_VISIBLE/Math.max(.2,m.boxH), upp=planeH/img.height;
      const w=img.width*upp, h=img.height*upp;
      pet.material.map=tex; pet.material.needsUpdate=true;
      pet.scale.set(w,h,1);
      S.baseScale=[w,h];
      S.offX=-m.cx*w; S.offY=h*(.5-m.foot);
      pet.material.opacity=0; S.fadeIn=0;
    }

    const PN=90;
    const sPos=new Float32Array(PN*3), sPhase=new Float32Array(PN),
          sRad=new Float32Array(PN), sSpeed=new Float32Array(PN), sLife=new Float32Array(PN);
    for(let i=0;i<PN;i++){
      sPhase[i]=Math.random()*Math.PI*2;
      sRad[i]=.75+Math.random()*1.25;
      sSpeed[i]=.25+Math.random()*.5;
      sLife[i]=-1;                       // <0 = kilauan ambien, >0 = letupan
    }
    const sGeo=new THREE.BufferGeometry();
    sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));
    const sMat=new THREE.PointsMaterial({color:0xbfe9ff,size:.085,transparent:true,
      opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
    scene.add(new THREE.Points(sGeo,sMat));
    const sVel=new Float32Array(PN*3);
    function sparkBurst(){
      for(let i=0;i<PN;i++){
        if(Math.random()>.65)continue;
        const a=Math.random()*Math.PI*2, sp=.9+Math.random()*2.1;
        sPos[i*3]=S.petX; sPos[i*3+1]=GROUND+.85; sPos[i*3+2]=.2;
        sVel[i*3]=Math.cos(a)*sp; sVel[i*3+1]=Math.sin(a)*sp*.8+1.3; sVel[i*3+2]=0;
        sLife[i]=.45+Math.random()*.35;
      }
    }

    const S={petX:PET_HOME, dragX:PET_HOME, hop:0, hopV:0, squash:0, lean:0, leanT:0,
             baseScale:[1,1], offX:0, offY:.5, fadeIn:0, running:true, t:0};

    let raf=0, last=performance.now();
    function frame(now){
      raf=requestAnimationFrame(frame);
      if(!S.running)return;
      const dt=Math.min((now-last)/1000,.05); last=now; S.t+=dt;
      const t=S.t;

      S.fadeIn=damp(S.fadeIn,1,6,dt);
      pet.material.opacity=S.fadeIn;

      // lompat: spring mudah, jadi ia mendarat dengan berat
      S.hopV-=14*dt;
      S.hop=Math.max(0,S.hop+S.hopV*dt);
      if(S.hop<=0)S.hopV=Math.max(0,S.hopV);

      const breathe=Math.sin(t*1.6)*.03;                 // nafas
      const bob=Math.sin(t*1.35)*.045;                   // ayunan halus
      const land=S.hop<=0 && S.hopV<=0 ? 0 : 0;
      S.squash=damp(S.squash,0,9,dt);
      S.petX=damp(S.petX,S.dragX,10,dt);
      S.lean=damp(S.lean,S.leanT,9,dt);

      const [bw,bh]=S.baseScale;
      const sx=bw*(1+S.squash*.28-breathe*.5);
      const sy=bh*(1-S.squash*.30+breathe);
      pet.scale.set(sx,sy,1);
      pet.position.x=S.petX+S.offX;
      pet.position.y=GROUND+S.offY*(sy/bh)+S.hop+bob+land;
      pet.rotation.z=S.lean;

      shadow.position.x=S.petX;
      const lift=Math.min(1,S.hop/.9);
      shadow.scale.set(1.7*(1-.30*lift), .5*(1-.30*lift), 1);
      shadow.material.opacity=1-.45*lift;

      ring.rotation.z+=dt*.22;
      ring.material.opacity=.62+.14*Math.sin(t*1.1);
      disc.material.opacity=.8+.16*Math.sin(t*1.5);

      for(let i=0;i<PN;i++){
        if(sLife[i]>0){                                  // serpihan letupan
          sLife[i]-=dt; sVel[i*3+1]-=6.5*dt;
          sPos[i*3]+=sVel[i*3]*dt; sPos[i*3+1]+=sVel[i*3+1]*dt;
          if(sLife[i]<=0)sLife[i]=-1;
        }else{                                           // kilauan mengorbit
          const a=sPhase[i]+t*sSpeed[i];
          sPos[i*3]=S.petX+Math.cos(a)*sRad[i];
          sPos[i*3+1]=GROUND+.35+Math.abs(Math.sin(a*.7))*1.5+Math.sin(t*1.7+i)*.06;
          sPos[i*3+2]=Math.sin(a)*.5-.2;
        }
      }
      sGeo.attributes.position.needsUpdate=true;

      renderer.render(scene,camera);
    }

    /* Lebar dunia dikunci, jadi teman kekal saiz sama pada telefon sempit
       mahupun tablet lebar. */
    const WORLD_W=5.0, MIN_H=3.1;
    function resize(){
      const w=host.clientWidth, h=host.clientHeight;
      if(!w||!h)return;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      const visH=Math.max(WORLD_W/camera.aspect, MIN_H);
      camera.fov=2*Math.atan(visH/2/camera.position.z)*180/Math.PI;
      camera.updateProjectionMatrix();
      camera.position.y=GROUND+visH*.42;
    }
    const ro=new ResizeObserver(resize); ro.observe(host);
    resize(); raf=requestAnimationFrame(frame);

    /* ---- sentuhan: inilah sebab pentas ini wujud ---- */
    let dragging=false, startX=0, startPet=0, moved=0;
    const toWorld=px=>{
      const r=host.getBoundingClientRect();
      const visH=Math.max(WORLD_W/camera.aspect, MIN_H);
      return ((px-r.left)/r.width-.5)*visH*camera.aspect;
    };
    function down(ev){
      const x=ev.touches?ev.touches[0].clientX:ev.clientX;
      dragging=true; moved=0; startX=toWorld(x); startPet=S.dragX;
      host.classList.add('grabbing');
    }
    function move(ev){
      if(!dragging)return;
      const x=ev.touches?ev.touches[0].clientX:ev.clientX;
      const dx=toWorld(x)-startX;
      moved=Math.max(moved,Math.abs(dx));
      S.dragX=Math.max(PET_HOME-1.35,Math.min(PET_HOME+.95,startPet+dx));
      S.leanT=-(S.dragX-PET_HOME)*.14;                  // condong ke arah seretan
      if(ev.cancelable)ev.preventDefault();
    }
    function up(){
      if(!dragging)return;
      dragging=false; host.classList.remove('grabbing');
      S.leanT=0;
      if(moved<.18){                          // ketukan, bukan seretan
        S.hop=Math.max(S.hop,.02); S.hopV=4.4; S.squash=1;
        sparkBurst(); sfx('ui');
        const hint=$('petStageHint');
        if(hint)hint.textContent=HAPPY[Math.floor(Math.random()*HAPPY.length)];
      }
    }
    const HAPPY=['Dia suka!','Comelnya!','Teman anda gembira.','Ketuk lagi!'];

    host.addEventListener('pointerdown',down);
    window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',up);
    window.addEventListener('pointercancel',up);

    canvas.addEventListener('webglcontextlost',ev=>{ ev.preventDefault(); S.running=false });

    return {
      setPet,
      recentre(){ S.dragX=PET_HOME; S.leanT=0 },
      pause(){ S.running=false },
      resume(){ S.running=true; last=performance.now(); resize() }
    };
  }

  function boot(){
    if(stage)return Promise.resolve(stage);
    if(booting)return booting;
    // import() dalam skrip klasik ikut URL SKRIP, jadi kunci pada baseURI.
    const url=new URL('js/vendor/three.module.min.js',document.baseURI).href;
    booting=import(url)
      .then(mod=>{ THREE=mod; return buildStage() })
      .then(s=>{ stage=s; return s })
      .catch(err=>{ console.error('[pet-stage] pentas gagal dimuat',err); booting=null; throw err });
    return booting;
  }

  /* =================================================================
     PENYELARASAN DENGAN SKRIN KHAZANAH
     ================================================================= */
  async function refresh(){
    const host=$('petStage'); if(!host)return;
    const item=equippedPet();

    host.classList.toggle('empty',!item);
    const name=$('petStageName'), desc=$('petStageDesc'), hint=$('petStageHint');
    if(item){
      if(name)name.textContent=item.name;
      // penerangan dan permata milik khazanah-v2; ia melukisnya selepas ini
      if(hint)hint.textContent='Ketuk atau seret untuk bermain';
    }else{
      if(name)name.textContent='Belum ada teman';
      if(desc)desc.textContent='Lengkapi satu teman di bawah untuk membawanya ke sini.';
      if(hint)hint.textContent='';
      if(stage)stage.pause();
      return;
    }

    let s;
    try{ s=await boot() }catch(_){ host.classList.add('noGl'); return }
    s.resume();
    if(shownPet!==item.id){
      shownPet=item.id;
      s.recentre();
      // `hub` ialah pose pengembaraan penuh badan; `front` sandaran.
      await s.setPet(item.hub||item.front);
    }
  }

  function onTab(tab){
    const host=$('petStage'); if(!host)return;
    const on=(tab==='pets');
    host.classList.toggle('hidden',!on);
    const prog=$('petProgress'); if(prog)prog.classList.toggle('hidden',!on);
    if(on)refresh(); else if(stage)stage.pause();
  }

  /* Balut fungsi sedia ada dan bukan menggantikannya: rewards-v2.js kekal
     pemilik grid, harga dan butang Lengkapi/Tanggalkan. */
  function wrap(){
    ['renderTreasure','treasureTab','openTreasure'].forEach(fnName=>{
      const original=window[fnName];
      if(typeof original!=='function'||original.__paPetStage)return;
      const wrapped=function(){
        const out=original.apply(this,arguments);
        try{
          if(fnName==='treasureTab')onTab(arguments[0]);
          else refresh();
        }catch(e){ console.error('[pet-stage]',e) }
        return out;
      };
      wrapped.__paPetStage=true;
      window[fnName]=wrapped;
    });
    /* Keluar dari skrin: hentikan gelung supaya ia tidak makan bateri.
       Diperhatikan melalui data-screen pada <body> dan bukan dengan membalut
       screen() — nama itu juga milik window.screen penyemak imbas, dan
       menggantikannya hanya untuk kutipan bateri bukan pertukaran yang baik. */
    if(!document.body.dataset.paPetStageWatch){
      document.body.dataset.paPetStageWatch='1';
      new MutationObserver(()=>{
        const onTreasure=document.body.dataset.screen==='treasure';
        if(!onTreasure&&stage)stage.pause();
        else if(onTreasure&&stage&&!$('petStage')?.classList.contains('hidden'))stage.resume();
      }).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrap,{once:true});
  else wrap();

  window.PAPetStage={refresh, tab:onTab, state:()=>({shownPet, ready:!!stage})};
})();
