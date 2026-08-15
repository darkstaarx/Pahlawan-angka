// Pahlawan Angka v3.21.0 — World Response to Learning
(()=>{
  'use strict';
  const VERSION='3.21.0';
  const SECURE_MASTERY=85;
  const SECURE_CONFIDENCE=70;
  const SECURE_EVIDENCE=4;
  const SECURE_STABILITY=55;
  const STORE_VERSION=1;

  const LANDMARKS={
    '1':{name:'Gerbang Bilangan',symbol:'123',theme:'number',bg:'assets/battlefields/forest-temple/arena-v1.webp'},
    '2':{name:'Relau Operasi',symbol:'＋−',theme:'operation',bg:'assets/battlefields/operations-forge/arena-v1.webp'},
    '3':{name:'Jambatan Pecahan',symbol:'½',theme:'fraction',bg:'assets/battlefields/cave-temple/arena-depth-v2.webp'},
    '4':{name:'Pasar Nilai',symbol:'RM',theme:'money',bg:'assets/battlefields/money-market/arena-v1.webp'},
    '5':{name:'Menara Masa',symbol:'◷',theme:'time',bg:'assets/battlefields/time-tower/arena-v1.webp'},
    '6':{name:'Balai Ukuran',symbol:'cm',theme:'measure',bg:'assets/battlefields/measurement-court/arena-v1.webp'},
    '7':{name:'Kuil Ruang',symbol:'◇',theme:'shape',bg:'assets/battlefields/nusantara-temple/arena-v1.webp'},
    '8':{name:'Balai Data',symbol:'▥',theme:'data',bg:'assets/battlefields/data-observatory/arena-v1.webp'}
  };
  const STAGE_LABEL=['Masih sunyi','Mula menyala','Sedang dipulihkan','Pulih sepenuhnya'];
  const EVENT_COPY=[
    '',
    'Bukti baharu membuat mercu ini mula bertindak balas.',
    'Lebih banyak kemahiran terbukti. Kawasan ini semakin hidup.',
    'Semua kemahiran utama di kawasan ini telah dibuktikan.'
  ];

  const safeNum=(v,f=0)=>Number.isFinite(+v)?+v:f;
  const currentGrade=()=>safeNum(db?.schoolGrade,2);
  const currentFrontier=()=>Math.max(1,safeNum(db?.coreFrontier,1));
  const landmarkFor=ch=>LANDMARKS[String(ch)]||{name:`Mercu Topik ${ch}`,symbol:String(ch),theme:'number',bg:'assets/battlefields/forest-temple/arena-v1.webp'};
  const gradeChapters=()=>{
    if(typeof GRAPH==='undefined'||!db)return[];
    return [...new Set(GRAPH.skills.filter(m=>m.grade===currentGrade()).map(m=>String(m.chapter)))].sort((a,b)=>+a-+b);
  };
  const skillsForChapter=ch=>typeof GRAPH==='undefined'?[]:GRAPH.skills.filter(m=>m.grade===currentGrade()&&String(m.chapter)===String(ch));
  const skillState=id=>{try{return typeof scoreState==='function'?scoreState(id):db?.skills?.[id]}catch(_){return db?.skills?.[id]}};
  const integrityReady=id=>{try{return window.PAContentIntegrity?.skillIntegrityReady?window.PAContentIntegrity.skillIntegrityReady(id):true}catch(_){return true}};

  function skillSecure(id){
    const s=skillState(id);if(!s)return false;
    return safeNum(s.mastery)>=SECURE_MASTERY && safeNum(s.confidence)>=SECURE_CONFIDENCE && safeNum(s.evidence)>=SECURE_EVIDENCE && safeNum(s.stability)>=SECURE_STABILITY && integrityReady(id);
  }
  function measuredChapterState(ch){
    const skills=skillsForChapter(ch),total=skills.length,secure=skills.filter(m=>skillSecure(m.id)).length;
    const ratio=total?secure/total:0;
    let stage=0;
    if(total&&secure===total)stage=3;
    else if(ratio>=.5)stage=2;
    else if(secure>0)stage=1;
    const unlocked=+ch<=currentFrontier();
    return{chapter:String(ch),stage:unlocked?stage:0,measuredStage:stage,secure,total,ratio,unlocked,...landmarkFor(ch)};
  }
  function ensureWorldStore(){
    if(!db)return null;
    if(!db.worldResponse||db.worldResponse.version!==STORE_VERSION){
      const landmarks={};
      gradeChapters().forEach(ch=>{const s=measuredChapterState(ch);landmarks[ch]={bestStage:s.unlocked?s.stage:0,firstSeenAt:Date.now(),updatedAt:Date.now()};});
      db.worldResponse={version:STORE_VERSION,initializedAt:Date.now(),landmarks,events:[]};
    }
    db.worldResponse.landmarks=db.worldResponse.landmarks||{};
    db.worldResponse.events=Array.isArray(db.worldResponse.events)?db.worldResponse.events:[];
    return db.worldResponse;
  }
  function chapterState(ch){
    const measured=measuredChapterState(ch),store=ensureWorldStore();
    let entry=store?.landmarks?.[String(ch)];
    if(!entry&&store){entry=store.landmarks[String(ch)]={bestStage:0,firstSeenAt:Date.now(),updatedAt:Date.now()};}
    const best=measured.unlocked?Math.max(safeNum(entry?.bestStage),measured.stage):0;
    return{...measured,stage:best,label:STAGE_LABEL[best]||STAGE_LABEL[0]};
  }
  function queueWorldEvent(state){
    const store=ensureWorldStore();if(!store||state.stage<=0)return;
    store.events.push({chapter:state.chapter,stage:state.stage,name:state.name,symbol:state.symbol,at:Date.now(),copy:EVENT_COPY[state.stage]});
    store.events=store.events.slice(-8);
  }
  function evaluateWorldChanges(){
    const store=ensureWorldStore();if(!store)return[];
    const changed=[];
    gradeChapters().forEach(ch=>{
      const measured=measuredChapterState(ch);if(!measured.unlocked)return;
      const entry=store.landmarks[ch]||(store.landmarks[ch]={bestStage:0,firstSeenAt:Date.now(),updatedAt:Date.now()});
      const previous=safeNum(entry.bestStage),next=Math.max(previous,measured.stage);
      if(next>previous){entry.bestStage=next;entry.updatedAt=Date.now();const state={...measured,stage:next,label:STAGE_LABEL[next]};changed.push(state);queueWorldEvent(state);}
    });
    if(changed.length&&typeof save==='function')save();
    return changed;
  }
  function activeWorldChapter(){
    const wanted=String(db?.activeMissionChapter||db?.coreFrontier||gradeChapters()[0]||'1');
    return gradeChapters().includes(wanted)?wanted:(gradeChapters()[0]||'1');
  }
  function stageDots(stage){return Array.from({length:3},(_,i)=>`<i class="${i<stage?'on':''}"></i>`).join('')}

  function renderHubWorld(){
    if(!db)return;evaluateWorldChanges();
    const ch=activeWorldChapter(),state=chapterState(ch),profile=document.querySelector('.hubProfile'),scene=document.querySelector('.hubScene');
    if(profile){
      profile.classList.add('paWorldProfile');profile.dataset.worldTheme=state.theme;profile.dataset.worldStage=String(state.stage);
      profile.style.setProperty('--pa-world-bg',`url("${state.bg}")`);
    }
    if(scene){
      let landmark=scene.querySelector('.paWorldLandmark');
      if(!landmark){landmark=document.createElement('div');landmark.className='paWorldLandmark';landmark.setAttribute('aria-hidden','true');scene.insertBefore(landmark,scene.firstChild);}
      landmark.dataset.stage=String(state.stage);landmark.innerHTML=`<span class="paWorldSigil">${state.symbol}</span><span class="paWorldPulse"></span>`;
    }
    let card=document.querySelector('.paWorldStatus');
    if(!card){
      card=document.createElement('section');card.className='paWorldStatus card';
      const anchor=document.querySelector('.hubContinue');anchor?.insertAdjacentElement('afterend',card);
    }
    if(card){
      const restored=state.secure, total=state.total;
      card.dataset.stage=String(state.stage);
      card.innerHTML=`<div class="paWorldStatusIcon">${state.symbol}</div><div class="paWorldStatusBody"><small>DUNIA BERTINDAK BALAS</small><b>${state.name}</b><span>${state.label} · ${restored}/${total} kemahiran terbukti</span></div><div class="paWorldStageDots" aria-label="Tahap dunia ${state.stage} daripada 3">${stageDots(state.stage)}</div>`;
    }
    setTimeout(showPendingWorldEvent,140);
  }
  function renderWorldMap(){
    if(!db)return;evaluateWorldChanges();
    const missions=document.getElementById('missions');if(!missions)return;
    let map=missions.querySelector('.paWorldMap');
    if(!map){
      map=document.createElement('section');map.className='paWorldMap card';
      const hint=missions.querySelector('.coachChoiceHint'),auto=missions.querySelector('.autoCoachCard');
      if(hint)missions.insertBefore(map,hint);else auto?.insertAdjacentElement('afterend',map);
    }
    const chapters=gradeChapters();
    map.innerHTML=`<div class="paWorldMapHead"><span><small>PETA DUNIA</small><b>Matematik menghidupkan setiap mercu</b></span><em>${chapters.filter(ch=>chapterState(ch).stage===3).length}/${chapters.length} pulih</em></div><div class="paWorldPath">${chapters.map(ch=>{
      const s=chapterState(ch),locked=!s.unlocked;
      return `<button class="paWorldNode stage-${s.stage} ${locked?'locked':''}" data-world-chapter="${ch}" ${locked?'disabled':''} aria-label="${s.name}: ${locked?'belum dibuka':s.label}"><span>${locked?'·':s.symbol}</span><small>${s.name.replace(/^(Gerbang|Relau|Jambatan|Pasar|Menara|Balai|Kuil)\s+/,'')}</small><i>${locked?'Belum diteroka':s.label}</i></button>`;
    }).join('')}</div>`;
    map.querySelectorAll('.paWorldNode:not(.locked)').forEach(btn=>btn.onclick=()=>typeof startMission==='function'&&startMission(btn.dataset.worldChapter));
    decorateMissionCards(chapters);
    setTimeout(showPendingWorldEvent,140);
  }
  function decorateMissionCards(chapters=gradeChapters()){
    const cards=[...document.querySelectorAll('#missionGrid .missionCard')];
    cards.forEach((card,index)=>{
      const ch=chapters[index];if(!ch)return;const s=chapterState(ch),body=card.querySelector('.missionBody');
      card.dataset.worldStage=String(s.stage);card.classList.add('paWorldMissionCard');
      let badge=body?.querySelector('.paWorldMissionBadge');if(!badge&&body){badge=document.createElement('span');badge.className='paWorldMissionBadge';body.appendChild(badge);}
      if(badge)badge.textContent=s.unlocked?`${s.symbol} ${s.label}`:'· Belum diteroka';
    });
  }
  function ensureWorldEventLayer(){
    let layer=document.getElementById('paWorldEvent');if(layer)return layer;
    layer=document.createElement('div');layer.id='paWorldEvent';layer.className='paWorldEvent hidden';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
    layer.innerHTML='<div class="paWorldEventCard"><div class="paWorldEventRune"></div><small>DUNIA BERUBAH</small><b></b><p></p></div>';
    document.body.appendChild(layer);return layer;
  }
  function showPendingWorldEvent(){
    if(!db||!['hub','missions'].includes(document.body?.dataset?.screen||''))return;
    const store=ensureWorldStore(),event=store?.events?.[0];if(!event)return;
    const layer=ensureWorldEventLayer();if(!layer||!layer.classList.contains('hidden'))return;
    store.events.shift();if(typeof save==='function')save();
    layer.dataset.stage=String(event.stage);layer.querySelector('.paWorldEventRune').textContent=event.symbol;layer.querySelector('b').textContent=event.name;layer.querySelector('p').textContent=event.copy;
    layer.classList.remove('hidden','show');void layer.offsetWidth;layer.classList.add('show');
    setTimeout(()=>{layer.classList.remove('show');setTimeout(()=>layer.classList.add('hidden'),220)},event.stage===3?2700:2100);
  }

  const originalRenderHub=window.renderHub;
  if(typeof originalRenderHub==='function')window.renderHub=function(){const out=originalRenderHub.apply(this,arguments);renderHubWorld();return out};
  const originalRenderMissions=window.renderMissions;
  if(typeof originalRenderMissions==='function')window.renderMissions=function(){const out=originalRenderMissions.apply(this,arguments);renderWorldMap();return out};
  const originalRecordMission=window.recordMissionAnswer;
  if(typeof originalRecordMission==='function')window.recordMissionAnswer=function(){const out=originalRecordMission.apply(this,arguments);if(!sess?.devBankTest)evaluateWorldChanges();return out};

  window.PAWorldResponse={version:VERSION,landmarks:LANDMARKS,ensure:ensureWorldStore,skillSecure,measuredChapterState,chapterState,evaluate:evaluateWorldChanges,renderHub:renderHubWorld,renderMap:renderWorldMap};
  document.documentElement.dataset.worldResponse=VERSION;
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
