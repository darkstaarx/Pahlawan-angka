/* Pahlawan Angka v3.19.0 — Sensory Learning Foundation
 * Sensory feedback reinforces learning state; it never changes scoring,
 * mastery math, adaptive routing, combat damage, or curriculum logic.
 */
(()=>{
  'use strict';
  const VERSION='3.19.0';
  const MASTER_THRESHOLD=85;
  const motionOK=()=>!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timers=new Set();
  const later=(fn,ms)=>{let t;t=setTimeout(()=>{timers.delete(t);fn()},ms);timers.add(t);return t};

  const INTENSITY={
    calm:{name:'calm',duration:900},
    low:{name:'low',duration:360},
    medium:{name:'medium',duration:900},
    high:{name:'high',duration:1900},
    peak:{name:'peak',duration:0}
  };

  function emit(type,detail={}){
    try{window.dispatchEvent(new CustomEvent('pa:sensory',{detail:{type,version:VERSION,...detail}}));}catch(_){/* old browser */}
  }
  function setIntensity(level='low',duration){
    const item=INTENSITY[level]||INTENSITY.low;
    document.body.dataset.sensoryIntensity=item.name;
    const hold=duration??item.duration;
    if(hold>0)later(()=>{if(document.body.dataset.sensoryIntensity===item.name)delete document.body.dataset.sensoryIntensity},hold);
    emit('intensity',{level:item.name});
  }
  function haptic(kind){
    if(!motionOK()||!navigator.vibrate)return;
    // Intentionally no wrong-answer haptic: mistakes should invite reflection, not feel punitive.
    if(kind==='correct')navigator.vibrate(18);
    else if(kind==='mastery')navigator.vibrate([28,36,52]);
  }
  function replayClass(el,cls,ms=720){
    if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);later(()=>el.classList.remove(cls),ms);
  }
  function qcard(){return document.querySelector('#game .qcard')||document.querySelector('.qcard')}
  function feedback(){return document.getElementById('feedback')}
  function safeMeta(id){try{return window.META&&META[id]||null}catch(_){return null}}
  function safeScore(id){try{return typeof scoreState==='function'?scoreState(id):null}catch(_){return null}}

  function competencyLabel(q){
    const c=String(q?.competencyId||q?.archetypeId||'').replace(/^integrity_/,'');
    const rules=[
      [/add_three/,'Tambah tiga nombor'],[/add_two/,'Tambah nombor'],[/sub_two/,'Tolak berurutan'],[/sub_one/,'Tolak nombor'],
      [/mul10/,'Darab ×10'],[/mul_groups/,'Kumpulan sama banyak'],[/mul_fact/,'Fakta darab'],[/div_remainder/,'Bahagi dengan baki'],[/div10/,'Bahagi ÷10'],[/div_exact/,'Bahagi tepat'],
      [/estimate/,'Menganggar kuantiti'],[/clock/,'Baca waktu'],[/elapsed/,'Tempoh masa'],[/hour_minute/,'Jam dan minit'],[/day_hour/,'Hari dan jam'],[/week_day/,'Minggu dan hari'],
      [/ruler/,'Baca pembaris'],[/scale/,'Baca skala'],[/cylinder/,'Baca isipadu'],[/tally/,'Tanda gundal'],[/bar_/,'Carta palang'],
      [/fraction_add/,'Tambah pecahan'],[/fraction_operation/,'Operasi pecahan'],[/equivalent/,'Pecahan setara'],[/mixed_to_improper|improper_to_mixed/,'Tukar bentuk pecahan'],
      [/decimal_fraction/,'Pecahan dan perpuluhan'],[/decimal_add/,'Tambah perpuluhan'],[/decimal_sub/,'Tolak perpuluhan'],
      [/discount/,'Diskaun wang'],[/budget/,'Bajet wang'],[/ratio_simplify/,'Ringkaskan nisbah'],[/ratio_/,'Nisbah setara'],
      [/large_round/,'Bundarkan nombor besar'],[/large_compare/,'Banding nombor besar'],[/large_sequence/,'Pola nombor besar'],
      [/volume/,'Isipadu kuboid'],[/area/,'Luas'],[/perimeter/,'Perimeter'],[/average/,'Purata'],[/coord/,'Koordinat'],[/prob/,'Kebolehjadian']
    ];
    for(const [rx,label] of rules)if(rx.test(c))return label;
    const m=safeMeta(q?.skill);return m?.title||m?.domain||'Cara fikir matematik';
  }
  function ensureSignal(){
    const host=feedback();if(!host)return null;
    let el=host.querySelector('.paLearningSignal');
    if(!el){el=document.createElement('div');el.className='paLearningSignal';host.appendChild(el)}
    return el;
  }
  function showSignal(text,tone='neutral',duration=1050){
    const el=ensureSignal();if(!el)return;
    el.className=`paLearningSignal tone-${tone}`;el.textContent=text;void el.offsetWidth;el.classList.add('show');
    later(()=>el.classList.remove('show'),duration);
  }
  function clearQuestionState(){
    const card=qcard();if(card)card.classList.remove('pa-sensory-question','pa-sensory-correct','pa-sensory-reflect','pa-sensory-hint');
  }
  function onQuestion(q){
    clearQuestionState();const card=qcard();replayClass(card,'pa-sensory-question',320);setIntensity('low',320);emit('question',{skill:q?.skill});
  }
  function onFirstWrong(q){
    const card=qcard();replayClass(card,'pa-sensory-reflect',900);setIntensity('calm',900);
    showSignal('Cikgu Dimensi: cari petunjuk, kemudian cuba semula','reflect',1200);emit('reflect',{skill:q?.skill});
  }
  function onHint(q){
    const card=qcard();replayClass(card,'pa-sensory-hint',1000);setIntensity('calm',1050);
    showSignal('Petunjuk dibuka · cuba bina jawapan sendiri','hint',1300);emit('hint',{skill:q?.skill});
  }

  function requirementState(id,score){
    try{
      const req=window.PAContentIntegrity?.requirements?.[id];
      if(!req)return {hasRequirement:false,ok:true};
      const result=PAContentIntegrity.requirementStatus(id,score?.competencies||{});
      return {hasRequirement:true,ok:!!result?.ok};
    }catch(_){return {hasRequirement:false,ok:true}}
  }
  function masterySnapshot(id){
    const s=safeScore(id)||{};const req=requirementState(id,s);
    return {mastery:Number(s.mastery||0),requirement:req};
  }
  function masteryBecameSecure(before,after){
    if(after.mastery<MASTER_THRESHOLD||!after.requirement.ok)return false;
    if(before.mastery<MASTER_THRESHOLD)return true;
    return !!(after.requirement.hasRequirement&&!before.requirement.ok&&after.requirement.ok);
  }
  function masteryAlreadyShown(id){
    try{return sessionStorage.getItem('pa_sensory_mastery_'+id)==='1'}catch(_){return false}
  }
  function markMasteryShown(id){try{sessionStorage.setItem('pa_sensory_mastery_'+id,'1')}catch(_){}}
  function ensureMasteryMoment(){
    const arena=document.getElementById('battleArena');if(!arena)return null;
    let layer=arena.querySelector('.paMasteryMoment');
    if(!layer){
      layer=document.createElement('div');layer.className='paMasteryMoment';layer.setAttribute('aria-live','polite');layer.innerHTML='<div class="paMasteryGlow"></div><div class="paMasteryPanel"><div class="paMasteryRune" aria-hidden="true">✦</div><small>KEMAHIRAN DIKUASAI</small><b class="paMasteryTitle">Matematik</b><span>Bukti cukup · teruskan pengembaraan</span></div>';
      arena.appendChild(layer);
    }
    return layer;
  }
  function showMastery(id){
    if(masteryAlreadyShown(id))return;markMasteryShown(id);
    const layer=ensureMasteryMoment();if(!layer)return;
    const m=safeMeta(id);const title=layer.querySelector('.paMasteryTitle');if(title)title.textContent=m?.title||m?.domain||'Kemahiran Matematik';
    setIntensity('high',1900);haptic('mastery');layer.classList.remove('show');void layer.offsetWidth;layer.classList.add('show');
    later(()=>layer.classList.remove('show'),1900);emit('mastery',{skill:id,title:title?.textContent||''});
  }
  function onResolved(q,ok,before){
    const card=qcard();const id=q?.skill;
    if(ok){
      replayClass(card,'pa-sensory-correct',920);setIntensity('medium',900);haptic('correct');
      const retried=typeof sess!=='undefined'&&!!sess?.retryState,usedHint=typeof sess!=='undefined'&&!!sess?.hint,assisted=retried||usedHint;
      showSignal(usedHint?'✓ Dibaiki dengan petunjuk · cuba satu lagi sendiri':(retried?'✓ Berjaya selepas cuba semula':`✓ ${competencyLabel(q)}`),usedHint?'hint':'correct',assisted?1350:1100);emit('correct',{skill:id,competency:q?.competencyId||null,assisted,usedHint});
      const after=masterySnapshot(id);
      if(masteryBecameSecure(before,after)){
        const boss=typeof sess!=='undefined'&&sess?.enemyTier==='boss';
        const enemyDefeated=typeof sess!=='undefined'&&Number(sess?.ehp||0)<=0;
        // Boss/final-blow is already the peak sensory moment. Non-boss finishers get their own appreciation window before mastery appears.
        if(!boss)later(()=>showMastery(id),enemyDefeated?3000:620);
      }
    }else{
      replayClass(card,'pa-sensory-reflect',1000);setIntensity('calm',1000);
      showSignal('Semak langkah Cikgu Dimensi · kita bina semula','reflect',1300);emit('incorrect-resolved',{skill:id});
    }
  }

  function install(){
    const versionButton=document.querySelector('.loginVersion');if(versionButton)versionButton.textContent=`Pahlawan Angka · v${VERSION}`;
    document.documentElement.dataset.paSensory=VERSION;

    if(typeof window.nextQ==='function'){
      const original=window.nextQ;window.nextQ=function(...args){const out=original.apply(this,args);later(()=>onQuestion(typeof sess!=='undefined'?sess?.q:null),0);return out};
    }
    if(typeof window.beginHintRetry==='function'){
      const original=window.beginHintRetry;window.beginHintRetry=function(...args){const out=original.apply(this,args);onFirstWrong(args[2]);return out};
    }
    if(typeof window.hint==='function'){
      const original=window.hint;window.hint=function(...args){const out=original.apply(this,args);onHint(typeof sess!=='undefined'?sess?.q:null);return out};
    }
    if(typeof window.resolveAnswer==='function'){
      const original=window.resolveAnswer;window.resolveAnswer=function(...args){const q=args[2],ok=!!args[3],before=masterySnapshot(q?.skill);const out=original.apply(this,args);onResolved(q,ok,before);return out};
    }
    emit('ready',{intensityMap:Object.keys(INTENSITY)});
  }

  window.PASensory={version:VERSION,intensityMap:INTENSITY,setIntensity,showSignal,showMastery,competencyLabel,masterySnapshot};
  install();
})();
