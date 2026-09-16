/* Segel Tambah — demo pentas WebGL v1.0.0
 *
 * Kenapa demo ini wujud: ia menjalankan soalan SEBENAR dari bank (generate())
 * di atas pentas Three.js, supaya kita boleh nilai rasa pentas baharu tanpa
 * mengubah battle sedia ada. Tiada apa-apa di sini menulis ke progress murid.
 *
 * Tiga lapisan:
 *   1. pentas   — Three.js dalam satu <canvas>
 *   2. HUD      — DOM di atas canvas
 *   3. soalan   — DOM, guna .qcard/.question/.answers/.ans yang sama dengan battle
 */
(function(){
  'use strict';

  const PIPS = 3;          // berapa lapis segel
  const MAX_Q = 9;         // had soalan satu pusingan
  const FRAMES = {
    arena:'assets/battlefields/money-market/arena-v1.webp',
    heroIdle:[0,1,2,3].map(i=>`assets/heroes/wira-chibi/frames/idle-loop-${i}-v1.webp`),
    heroPrepare:'assets/heroes/wira-chibi/frames/rescue-prepare-v1.webp',
    heroSlash:'assets/heroes/wira-chibi/frames/rescue-slash-v1.webp',
    petSad:[0,1,2,3,4,5,6,7].map(i=>`assets/pets/aurora/frames/sad-${i}-v1.webp`),
    petJoy:[0,1].map(i=>`assets/pets/aurora/frames/joy-${i}-v1.webp`)
  };

  let THREE=null, stage=null, booting=null, run=null, reduceMotion=false;

  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const damp = (c,t,l,dt) => c + (t-c)*(1-Math.exp(-l*dt));
  const sfx = name => { try{ if(typeof playSfx==='function')playSfx(name) }catch(_){} };
  const mix = list => (typeof shuffle==='function') ? shuffle(list) : [...list].sort(()=>Math.random()-.5);

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

    const [arenaTex, heroIdle, heroPrepare, heroSlash, petSad, petJoy] = await Promise.all([
      load(FRAMES.arena),
      Promise.all(FRAMES.heroIdle.map(load)),
      load(FRAMES.heroPrepare),
      load(FRAMES.heroSlash),
      Promise.all(FRAMES.petSad.map(load)),
      Promise.all(FRAMES.petJoy.map(load))
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
       Pengukuran dibuat pada canvas 96x96: pecahan bingkai tidak berubah bila
       diturunkan resolusi, jadi ia tepat dan murah walaupun pada telefon lama. */
    const HERO_UPP=2.6/480, PET_UPP=1.25/400;
    const HERO_GROUND=-1.92;
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

    function shadow(x,y,w,z,opacity){
      const m=new THREE.Mesh(new THREE.CircleGeometry(.5,28),
        new THREE.MeshBasicMaterial({color:0,transparent:true,opacity,depthWrite:false}));
      m.position.set(x,y,z); m.scale.set(w,w*.2,1); scene.add(m); return m;
    }
    const heroShadow=shadow(-1.5,-1.92,1.5,-.01,.3);
    shadow(1.45,-1.72,1.15,-.32,.22);

    /* SEGEL: gelembung fresnel. Terang di tepi, lut sinar di tengah —
       ini yang tak boleh ditiru dengan border-radius dan gradient. */
    const uni={uTime:{value:0},uPower:{value:1},uTint:{value:new THREE.Color(0xffd98a)}};
    const bubble=new THREE.Mesh(new THREE.SphereGeometry(.95,48,32),
      new THREE.ShaderMaterial({
        uniforms:uni,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
        fragmentShader:'uniform float uTime;uniform float uPower;uniform vec3 uTint;varying vec3 vN;varying vec3 vP;void main(){vec3 V=normalize(-vP);float f=pow(1.0-max(dot(vN,V),0.0),2.3);float band=.5+.5*sin(vP.y*7.0+uTime*1.6);float pulse=.85+.15*sin(uTime*2.2);float a=f*pulse*uPower;gl_FragColor=vec4(uTint*(a*2.4+band*.09*uPower),a*.95);}'
      }));
    bubble.position.set(1.45,-.6,-.3); scene.add(bubble);

    /* cincin rune: tekstur dilukis sekali atas canvas 2D */
    function runeTex(glyphs){
      const c=document.createElement('canvas'); c.width=c.height=512;
      const g=c.getContext('2d'); g.translate(256,256);
      g.strokeStyle='#ffe9b0'; g.lineWidth=4;
      g.beginPath(); g.arc(0,0,228,0,Math.PI*2); g.stroke();
      g.lineWidth=2; g.setLineDash([9,14]);
      g.beginPath(); g.arc(0,0,196,0,Math.PI*2); g.stroke(); g.setLineDash([]);
      g.fillStyle='#ffe9b0'; g.font='bold 30px system-ui';
      g.textAlign='center'; g.textBaseline='middle';
      glyphs.forEach((ch,i)=>{ g.save(); g.rotate(i/glyphs.length*Math.PI*2); g.fillText(ch,0,-212); g.restore() });
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
    }
    function ring(size,glyphs,z){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),
        new THREE.MeshBasicMaterial({map:runeTex(glyphs),transparent:true,
          blending:THREE.AdditiveBlending,depthWrite:false}));
      m.position.set(1.45,-.6,z); scene.add(m); return m;
    }
    const ringA=ring(2.5,['+','+','+','+','+','+'],-.55);
    const ringB=ring(2.0,['1','2','5','10','20','50'],.05);
    ringB.rotation.x=.9;  // condong sedikit: ini yang bagi rasa satah 3D

    const waveMat=new THREE.MeshBasicMaterial({map:runeTex([]),transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false,opacity:0});
    const wave=new THREE.Mesh(new THREE.PlaneGeometry(1,1),waveMat);
    wave.position.set(1.45,-.6,.3); scene.add(wave);

    const PN=220;
    const pPos=new Float32Array(PN*3), pVel=new Float32Array(PN*3), pLife=new Float32Array(PN);
    const pGeo=new THREE.BufferGeometry();
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
    scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xffe4a8,size:.1,
      transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})));
    function burst(spread){
      for(let i=0;i<PN;i++){
        const a=Math.random()*Math.PI*2, s=1.2+Math.random()*spread;
        pPos[i*3]=1.45; pPos[i*3+1]=-.6; pPos[i*3+2]=0;
        pVel[i*3]=Math.cos(a)*s; pVel[i*3+1]=Math.sin(a)*s*.85+1.2; pVel[i*3+2]=(Math.random()-.5)*2;
        pLife[i]=.5+Math.random()*.4;
      }
    }

    const PET_FEET=-1.49;
    const S={heroX:-1.5,heroFeet:-1.5,petY:PET_FEET,petFeet:PET_FEET,camY:0,
             shake:0,waveT:-1,power:1,running:true,
             heroFrames:heroIdleE,heroFps:7,petFrames:petSadE,petFps:6,heroLock:null};
    let raf=0, last=performance.now(), tAcc=0;

    // Tukar bingkai: peta, skala dan ofset tambatan sekali gus.
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
      uni.uTime.value=tAcc;
      uni.uPower.value=damp(uni.uPower.value,S.power,5,dt);

      swap(hero, S.heroLock || S.heroFrames[Math.floor(tAcc*S.heroFps)%S.heroFrames.length]);
      swap(pet,  S.petFrames[Math.floor(tAcc*S.petFps)%S.petFrames.length]);

      // S.heroX dan S.petY ialah kedudukan KAKI, bukan pusat satah.
      S.heroFeet=damp(S.heroFeet,S.heroX,15,dt);
      S.petFeet=damp(S.petFeet,S.petY,9,dt);
      hero.position.x=S.heroFeet+hero.userData.e.offX;
      hero.position.y=HERO_GROUND+hero.userData.e.offY;
      heroShadow.position.x=S.heroFeet;
      pet.position.x=1.45+pet.userData.e.offX;
      pet.position.y=S.petFeet+pet.userData.e.offY;

      if(!reduceMotion){
        ringA.rotation.z+=dt*.35; ringB.rotation.z-=dt*.55; bubble.rotation.y+=dt*.25;
      }

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
    const WORLD_W=5.4, FLOOR_MARGIN=.30;
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
      async strike(){
        sfx('hit');
        if(reduceMotion){ burst(3); S.waveT=0; return }
        S.heroLock=heroPrepareE; S.heroX=-1.85; await wait(160);
        S.heroLock=heroSlashE;  S.heroX=-0.25; await wait(130);
        burst(5.5); S.waveT=0; S.shake=.32;
        await wait(210);
        S.heroLock=null; S.heroX=-1.5;
      },
      setPower(left){ S.power=Math.max(0,left)/PIPS },
      async rescue(){
        S.power=0; S.shake=.5; burst(7); S.waveT=0;
        ringA.visible=ringB.visible=false;
        S.petFrames=petJoyE; S.petFps=4; S.petY=PET_FEET+.5;
        await wait(520); S.petY=PET_FEET+.15;
      },
      wrong(){
        uni.uTint.value.setHex(0xff8a8a); S.shake=.15;
        setTimeout(()=>uni.uTint.value.setHex(0xffd98a),420);
      },
      reset(){
        S.power=1; S.heroX=-1.5; S.heroLock=null;
        S.petFrames=petSadE; S.petFps=6; S.petY=PET_FEET;
        ringA.visible=ringB.visible=true;
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
      $('segelFeedback').textContent='Betul! Segel retak satu lapis.';
      await stage.strike();
      run.broken=Math.min(PIPS,run.broken+1);
      const pip=document.querySelectorAll('#segelPips i')[run.broken-1];
      if(pip)pip.classList.add('gone');
      if(run.broken>=PIPS){
        toast('SEGEL PECAH!');
        $('segelTag').style.opacity='0';
        await stage.rescue();
        return finishRun(true);
      }
      stage.setPower(PIPS-run.broken);
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
    const done=$('segelDone');
    $('segelDoneTitle').textContent=won?'Aurora selamat!':'Segel masih kuat';
    $('segelDoneText').textContent=note || (won
      ? `Tiga lapis segel pecah dalam ${run.asked} soalan. Semua soalan tadi datang dari bank sebenar.`
      : `${run.broken} daripada ${PIPS} lapis pecah. Cuba lagi — soalan akan dijana semula.`);
    $('segelDoneArt').src=won?FRAMES.petJoy[0]:FRAMES.petSad[0];
    done.hidden=false;
  }

  /* =================================================================
     MASUK / KELUAR
     ================================================================= */
  function startRun(){
    run={pool:skillPool(),asked:0,broken:0,locked:false,q:null,
         sess:{mode:'practice',hint:false,hintLevel:0,recent:[],
               questionFingerprints:[],questionHistory:[],demoMode:true}};
    $('segelDone').hidden=true;
    $('segelTag').style.opacity='1';
    document.querySelectorAll('#segelPips i').forEach(p=>p.classList.remove('gone'));
    stage.reset();
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

  window.openSegelDemo=async function(){
    if(typeof db==='undefined'||!db)return;
    reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(typeof screen==='function')screen('segelDemo');
    try{ await boot() }
    catch(_){ $('segelFeedback').textContent='Pentas 3D tidak dapat dimuat pada peranti ini.'; return }
    bindSpeaker();
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
    state:()=>run
  };
})();
