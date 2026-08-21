/* Cikgu Dimensi — Dimensional View prototype Y3-PV-A2 v0.2.1.
 * Narrow adapter around the existing intervention/battle runtime.
 * Legacy adaptive, Learning Camp, mastery, rewards and question routing remain intact.
 */
(function(root){
  'use strict';

  const PROTOTYPE_ID='Y3-PV-A2';
  const SKILL_ID='D3.SUB10000';
  const MISCONCEPTION_ID='PV-005';
  const CURRICULUM_VERSION='SEMAKAN_2017_DPK_EDISI_3';
  const REPRESENTATION_ID='R2_PLACE_VALUE';

  const DEFAULT_CFG={
    enabled:true,
    evidenceThreshold:2,
    maxExchangeAttempts:2,
    delayedRevisitMs:24*60*60*1000,
    prototypes:{[PROTOTYPE_ID]:true}
  };
  root.DIMENSIONAL_VIEW_CFG=Object.assign({},DEFAULT_CFG,root.DIMENSIONAL_VIEW_CFG||{});
  root.DIMENSIONAL_VIEW_CFG.prototypes=Object.assign({},DEFAULT_CFG.prototypes,root.DIMENSIONAL_VIEW_CFG.prototypes||{});

  const TRANSITIONS={
    IDLE:['EVIDENCE_READY'],
    EVIDENCE_READY:['PREREQ_CHECK','ABORTED'],
    PREREQ_CHECK:['BATTLE_FREEZE','ABORTED'],
    BATTLE_FREEZE:['PLACE_VALUE_VIEW','ABORTED'],
    PLACE_VALUE_VIEW:['EXCHANGE_REQUIRED','ABORTED'],
    EXCHANGE_REQUIRED:['EXCHANGE_ACTIVE','GUIDED_RESOLUTION','ABORTED'],
    GUIDED_RESOLUTION:['EXCHANGE_ACTIVE','ABORTED'],
    EXCHANGE_ACTIVE:['ONES_STEP','ABORTED'],
    ONES_STEP:['TENS_STEP','ABORTED'],
    TENS_STEP:['REPRESENTATION_BRIDGE','ABORTED'],
    REPRESENTATION_BRIDGE:['WORKING_BRIDGE','ABORTED'],
    WORKING_BRIDGE:['NEAR_TRANSFER','ABORTED'],
    NEAR_TRANSFER:['KSSR_CLEAN_TRANSFER','ABORTED'],
    KSSR_CLEAN_TRANSFER:['COMPLETE','ABORTED'],
    COMPLETE:[],
    ABORTED:[]
  };

  function getDb(){try{if(typeof db!=='undefined')return db}catch(_){ }return root.db||null}
  function getSess(){try{if(typeof sess!=='undefined')return sess}catch(_){ }return root.sess||null}
  function saveDb(){try{if(typeof save==='function')save()}catch(_){ }}
  function motionOK(){return !(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)}
  function later(fn,ms){return setTimeout(fn,motionOK()?ms:0)}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function telemetry(type,payload={}){
    const s=getSess();
    if(!root.PATelemetry?.record)return;
    root.PATelemetry.record(type,{
      prototypeId:PROTOTYPE_ID,
      curriculumVersion:CURRICULUM_VERSION,
      grade:3,
      skillId:s?.dimension?.skillId||SKILL_ID,
      misconceptionId:MISCONCEPTION_ID,
      questionToken:String(s?.dimension?.originalQuestionToken||''),
      transferStage:s?.dimension?.transferStage||null,
      supportLevel:s?.dimension?.supportLevel||'FULL_SUPPORT',
      ...payload
    });
  }

  function freshDimension(){
    return{
      active:false,
      prototypeId:null,
      state:'IDLE',
      enteredAt:0,
      skillId:null,
      misconceptionId:null,
      diagnosticConfidence:'INSUFFICIENT',
      originalQuestionToken:null,
      originalBattleState:null,
      representation:null,
      supportLevel:null,
      exchange:null,
      transferStage:null,
      attemptCount:0,
      guidedResolutionUsed:false,
      exitReason:null,
      prerequisiteAttempts:0,
      prerequisitePassed:null,
      stepAttempts:{ones:0,tens:0},
      near:{stage:'ACTION',hadError:false},
      clean:{attempts:0,hadError:false}
    };
  }

  function ensureSession(){
    const s=getSess();if(!s)return null;
    if(!s.dimension||typeof s.dimension!=='object')s.dimension=freshDimension();
    return s.dimension;
  }

  function canTransition(from,to){return !!TRANSITIONS[from]?.includes(to)}
  function transition(to){
    const d=ensureSession();if(!d)return false;
    if(d.state===to)return true;
    if(!canTransition(d.state,to))return false;
    d.state=to;
    return true;
  }

  function prototypeEnabled(){
    return !!(root.DIMENSIONAL_VIEW_CFG.enabled&&root.DIMENSIONAL_VIEW_CFG.prototypes?.[PROTOTYPE_ID]);
  }

  function eligibleQuestion(skillId,q){
    if(!prototypeEnabled()||skillId!==SKILL_ID||!q?.dimensional)return false;
    const meta=q.dimensional;
    if(meta.prototypeId!==PROTOTYPE_ID||meta.curriculumVersion!==CURRICULUM_VERSION)return false;
    if(meta.transferStage!=='ENTRY')return false;
    const a=Number(meta.operands?.minuend),b=Number(meta.operands?.subtrahend);
    return !!(root.PAPlaceValueEngine?.onesRegroupRequired(a,b));
  }

  function captureResponseEvidence(skillId,ok,tag,sec,usedHint,q){
    if(ok||!eligibleQuestion(skillId,q))return null;
    if(!['units_only','place'].includes(tag))return null;
    const strength=tag==='units_only'?'STRONG':'COMPATIBLE';
    const result=root.PADimensionalMemory?.recordEvidence({
      prototypeId:PROTOTYPE_ID,
      conceptId:'subtraction_regrouping',
      skillId,
      misconceptionId:MISCONCEPTION_ID,
      itemId:String(q.token||q.dimensional?.itemId||''),
      tag,
      type:'REGROUPING_PATTERN',
      distinctItem:true
    });
    if(result?.added){
      telemetry('dv_evidence_added',{
        mathSignal:{type:'REGROUPING_PATTERN',strength,tag,distinctItem:true},
        behaviorSignal:{latencyBand:Number(sec)<1.15?'RAPID':Number(sec)>12?'EXTENDED':'NORMAL',rapidTap:Number(sec)>0&&Number(sec)<1.15},
        outcome:'WRONG',usedHint:!!usedHint,
        evidenceCount:result.independentEvidenceCount,
        diagnosticConfidence:result.confidence
      });
      telemetry('dv_hypothesis_updated',{diagnosticConfidence:result.confidence,evidenceCount:result.independentEvidenceCount});
      saveDb();
    }
    return result;
  }

  function evaluateEntry(skillId,q){
    if(!eligibleQuestion(skillId,q))return null;
    const node=root.PADimensionalMemory?.ensureMisconception(MISCONCEPTION_ID,'subtraction_regrouping');
    const count=Number(node?.independentEvidenceCount||0);
    const threshold=Math.max(2,Number(root.DIMENSIONAL_VIEW_CFG.evidenceThreshold||2));
    if(count<threshold)return null;
    return{
      prototypeId:PROTOTYPE_ID,
      skillId,
      misconceptionId:MISCONCEPTION_ID,
      diagnosticConfidence:count>=3?'HIGH':'MEDIUM',
      evidenceCount:count,
      question:q
    };
  }

  function ensureOverlay(){
    if(typeof document==='undefined')return null;
    let overlay=document.getElementById('dimensionalViewOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('div');
    overlay.id='dimensionalViewOverlay';
    overlay.className='dvOverlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','dvTitle');
    overlay.innerHTML='<div class="dvBackdrop"></div><section class="dvPanel"><header class="dvHead"><div class="dvTeacher is-active" aria-hidden="true"><span class="dvDimensionalCharacter is-active" data-dimensi-state="active"><span class="dvDimensionalPortrait"><img class="dvDimensionalBase" src="assets/coach/cikgu-wajar/welcome.webp" alt=""><img class="dvDimensionalAura" src="assets/coach/cikgu-dimensi/dimensional-aura.svg" alt=""><i class="dvEyeGlow dvEyeGlowL"></i><i class="dvEyeGlow dvEyeGlowR"></i></span></span></div><div><small>CIKGU DIMENSI</small><h2 id="dvTitle">Dimensi Nilai Tempat</h2></div><span class="dvStage" id="dvStage"></span></header><div id="dvBody" class="dvBody" aria-live="polite"></div><div class="dvParentGuide"><b>Untuk ibu bapa / penjaga</b><span>Jika anak masih keliru, baca arahan bersama-sama satu demi satu. Minta anak terangkan apa yang dia nampak. Elakkan beri jawapan terus.</span></div></section>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function setStageLabel(label){const el=document.getElementById('dvStage');if(el)el.textContent=label||''}
  function setBody(html){const el=document.getElementById('dvBody');if(el){el.innerHTML=html;const focus=el.querySelector('button,input');focus?.focus({preventScroll:true})}}
  function setTeacherActive(active){const t=document.querySelector('#dimensionalViewOverlay .dvTeacher');if(!t)return;t.classList.toggle('is-active',!!active);t.classList.toggle('is-normal',!active);const c=t.querySelector('.dvDimensionalCharacter');root.PADimensionalPortal?.setCharacterActive?.(c,!!active)}
  function showOverlay(){const o=ensureOverlay();if(o){o.classList.add('show');setTeacherActive(true);document.body.classList.add('dvTeaching')}}
  function hideOverlay(){const o=document.getElementById('dimensionalViewOverlay');if(o)o.classList.remove('show');setTeacherActive(false);document.body.classList.remove('dvTeaching')}

  function freezeBattle(){
    const s=getSess(),d=ensureSession();if(!s||!d)return;
    d.originalBattleState={hp:s.hp,ehp:s.ehp,start:s.start,retryState:s.retryState||null,frozenAt:Date.now()};
    d.active=true;
    document.querySelectorAll?.('#game .ans,#game .hintBtn').forEach(el=>{el.dataset.dvWasDisabled=el.disabled?'1':'0';el.disabled=true});
    document.getElementById('battleArena')?.classList.add('dvBattleFrozen');
    telemetry('dv_battle_frozen',{hp:s.hp,enemyHp:s.ehp});
  }

  function releaseBattleControls(){
    document.getElementById('battleArena')?.classList.remove('dvBattleFrozen');
    document.querySelectorAll?.('#game .ans,#game .hintBtn').forEach(el=>{el.disabled=el.dataset.dvWasDisabled==='1';delete el.dataset.dvWasDisabled});
  }

  function start(intervention){
    if(!intervention||intervention.prototypeId!==PROTOTYPE_ID)return false;
    const s=getSess();if(!s)return false;
    root.PADimensionalMemory?.ensure();
    if(s.dimension?.active)return false;
    s.dimension=freshDimension();
    const d=s.dimension;
    d.active=true;
    d.prototypeId=PROTOTYPE_ID;
    d.enteredAt=Date.now();
    d.skillId=intervention.skillId||SKILL_ID;
    d.misconceptionId=MISCONCEPTION_ID;
    d.diagnosticConfidence=intervention.diagnosticConfidence||'MEDIUM';
    d.originalQuestionToken=String(intervention.question?.token||s.q?.token||'');
    d.representation=REPRESENTATION_ID;
    d.supportLevel='FULL_SUPPORT';
    const scenario=root.PAPlaceValueEngine?.subtractionScenario(62,27);
    if(!scenario?.ok){d.exitReason='ENGINE_ERROR';d.active=false;return false}
    d.exchange={
      minuend:62,subtrahend:27,before:scenario.before,afterExchange:scenario.afterExchange,
      required:true,sourceColumn:'TENS',targetColumn:'ONES',attempts:0,completed:false,selfInitiated:false,
      current:{...scenario.before}
    };
    transition('EVIDENCE_READY');
    root.PADimensionalMemory?.markInterventionStarted(d.skillId,MISCONCEPTION_ID);
    root.PADimensionalMemory?.recordRepresentationUse(d.skillId,REPRESENTATION_ID,'opened');
    try{if(typeof setInterventionCooldown==='function')setInterventionCooldown(d.skillId)}catch(_){ }
    telemetry('dv_intervention_started',{diagnosticConfidence:d.diagnosticConfidence,evidenceCount:intervention.evidenceCount||0});
    freezeBattle();
    transition('PREREQ_CHECK');
    const openLesson=()=>{showOverlay();renderPrerequisite();};
    if(root.PADimensionalPortal?.open)root.PADimensionalPortal.open({onDone:openLesson,duration:Number(root.DIMENSIONAL_VIEW_CFG.portalDurationMs??850)});
    else openLesson();
    saveDb();
    return true;
  }

  function renderPrerequisite(){
    const d=ensureSession();if(!d)return;
    d.transferStage='PREREQUISITE';setStageLabel('Semak asas');
    telemetry('dv_prerequisite_started');
    setBody(`
      <div class="dvIntro"><b>Mari lihat nilai tempat dengan cara yang lebih jelas.</b><span>Kita semak maksud <b>puluh</b> dan <b>sa</b> dahulu.</span></div>
      <div class="dvMeaning" aria-label="Satu puluh dan sepuluh sa mempunyai nilai yang sama">
        <div class="dvMeaningRow">
          <div class="dvMeaningCard"><div class="dvTenRod"></div><strong>1 puluh</strong><small>nilainya 10</small></div>
          <span class="dvMeaningEquals">=</span>
          <div class="dvMeaningCard"><div class="dvTenOnes">${Array.from({length:10},()=>'<i></i>').join('')}</div><strong>10 sa</strong><small>nilainya 10</small></div>
        </div>
        <div class="dvTermNote"><b>Sa</b> ialah unit yang dikira satu demi satu. Jadi <b>1 puluh = 10</b> dan <b>10 sa = 10</b>.</div>
      </div>
      <p class="dvPrompt">Kalau 1 puluh ditukar kepada sa, kita dapat berapa sa?</p>
      <div class="dvChoices">
        <button onclick="PADimensionalView.answerPrerequisite(10)">10 sa</button>
        <button onclick="PADimensionalView.answerPrerequisite(1)">1 sa</button>
        <button onclick="PADimensionalView.answerPrerequisite(100)">100 sa</button>
      </div>
      <div class="dvFeedback" id="dvFeedback"></div>`);
  }

  function answerPrerequisite(value){
    const d=ensureSession();if(!d||d.state!=='PREREQ_CHECK')return;
    d.prerequisiteAttempts++;
    if(Number(value)===10){
      d.prerequisitePassed=true;
      telemetry('dv_prerequisite_result',{result:'PASS',attempts:d.prerequisiteAttempts});
      transition('BATTLE_FREEZE');
      transition('PLACE_VALUE_VIEW');
      renderPlaceValueView();
      return;
    }
    const f=document.getElementById('dvFeedback');
    if(d.prerequisiteAttempts<2){
      if(f)f.textContent='Lihat semula: 1 puluh bernilai 10, dan 10 sa juga bernilai 10.';
      return;
    }
    d.prerequisitePassed=false;
    telemetry('dv_prerequisite_result',{result:'FAIL',attempts:d.prerequisiteAttempts});
    d.exitReason='PLACE_VALUE_EXCHANGE_PREREQUISITE';
    transition('ABORTED');
    const revisit=root.PADimensionalMemory?.scheduleRevisit({skillId:d.skillId,dueAfter:Date.now()+root.DIMENSIONAL_VIEW_CFG.delayedRevisitMs,reason:'place_value_exchange_prerequisite'});
    if(revisit)telemetry('dv_revisit_scheduled',{reason:revisit.reason,dueAfter:revisit.dueAfter});
    telemetry('dv_intervention_aborted',{reason:d.exitReason});
    setStageLabel('Asas dahulu');
    setBody(`<div class="dvIntro"><b>Kita kukuhkan nilai tempat dahulu.</b><span><b>1 puluh = 10</b>. <b>10 sa = 10</b>. Jadi 1 puluh dan 10 sa mempunyai nilai yang sama.</span></div><div class="dvMeaning"><div class="dvMeaningRow"><div class="dvMeaningCard"><div class="dvTenRod"></div><strong>1 puluh</strong><small>10</small></div><span class="dvMeaningEquals">=</span><div class="dvMeaningCard"><div class="dvTenOnes">${Array.from({length:10},()=>'<i></i>').join('')}</div><strong>10 sa</strong><small>10</small></div></div></div><button class="dvPrimary" onclick="PADimensionalView.resumeAfterAbort()">Kembali ke pertarungan</button>`);
    saveDb();
  }

  function placeBlocks(state,{clickTens=false,highlightTen=false}={}){
    const tens=Array.from({length:state.TENS},(_,i)=>clickTens?`<button class="dvTenRod ${highlightTen&&i===0?'guide':''}" aria-label="Tukar 1 puluh kepada 10 sa" onclick="PADimensionalView.exchangeTen(false)"></button>`:'<span class="dvTenRod"></span>').join('');
    const ones=Array.from({length:state.ONES},()=>'<i class="dvOne"></i>').join('');
    return `<div class="dvColumns"><div class="dvColumn"><small>PULUH</small><em>1 puluh = 10</em><b>${state.TENS}</b><div class="dvTens">${tens}</div></div><div class="dvColumn"><small>SA</small><em>1 sa = 1</em><b>${state.ONES}</b><div class="dvOnes">${ones}</div></div></div>`;
  }

  function renderPlaceValueView(){
    const d=ensureSession();if(!d)return;
    d.transferStage=null;setStageLabel('Lihat nilai tempat');
    telemetry('dv_representation_opened',{representation:REPRESENTATION_ID});
    setBody(`<div class="dvProblem"><small>Soalan kita</small><strong>62 − 27</strong></div>${placeBlocks(d.exchange.before)}<p class="dvPrompt">Kita nak tolak <b>7 sa</b>. Sekarang ada <b>2 sa</b>.</p><button class="dvPrimary" onclick="PADimensionalView.showExchangeNeed()">Cuba tolak 7 sa</button>`);
  }

  function showExchangeNeed(){
    const d=ensureSession();if(!d||d.state!=='PLACE_VALUE_VIEW')return;
    transition('EXCHANGE_REQUIRED');
    renderExchangeRequired();
  }

  function renderExchangeRequired(){
    const d=ensureSession();if(!d)return;
    setStageLabel('Tukar 1 puluh');
    const attemptLimit=Math.max(2,Number(root.DIMENSIONAL_VIEW_CFG.maxExchangeAttempts||2));
    const highlight=d.exchange.attempts>=attemptLimit;
    setBody(`<div class="dvCallout"><b>2 sa belum cukup untuk tolak 7 sa.</b><span>Kita boleh tukar 1 puluh (10) menjadi 10 sa.</span></div>${placeBlocks(d.exchange.current,{clickTens:true,highlightTen:highlight})}<div class="dvActions"><button class="dvSecondary" onclick="PADimensionalView.invalidOnesAttempt()">Tolak 7 daripada 2 sa sekarang</button>${d.exchange.attempts>=attemptLimit?'<button class="dvPrimary" onclick="PADimensionalView.exchangeTen(true)">Bantu saya tukar 1 puluh</button>':''}</div><div class="dvFeedback" id="dvFeedback">${highlight?'Pilih satu puluh.':''}</div>`);
  }

  function invalidOnesAttempt(){
    const d=ensureSession();if(!d||d.state!=='EXCHANGE_REQUIRED')return;
    d.exchange.attempts++;d.attemptCount++;
    telemetry('dv_exchange_attempt',{result:'INSUFFICIENT_ONES',attempt:d.exchange.attempts,selfInitiated:false});
    renderExchangeRequired();
    const f=document.getElementById('dvFeedback');
    if(f)f.textContent=d.exchange.attempts===1?'2 sa belum cukup untuk tolak 7 sa.':'Cuba tukar 1 puluh (10) kepada 10 sa.';
  }

  function exchangeTen(guided=false){
    const d=ensureSession();if(!d||!['EXCHANGE_REQUIRED','GUIDED_RESOLUTION'].includes(d.state))return;
    if(guided&&d.state==='EXCHANGE_REQUIRED'){
      transition('GUIDED_RESOLUTION');d.guidedResolutionUsed=true;telemetry('dv_guided_resolution',{reason:'exchange_attempt_limit'});
    }
    const result=root.PAPlaceValueEngine?.exchangeBaseTen(d.exchange.current,'TENS','ONES',{expectedValue:d.exchange.minuend});
    d.exchange.attempts++;d.attemptCount++;
    telemetry('dv_exchange_attempt',{result:result?.ok?'VALID':'INVALID',attempt:d.exchange.attempts,selfInitiated:!guided});
    if(!result?.ok){renderExchangeRequired();return}
    d.exchange.current=result.state;d.exchange.completed=true;d.exchange.selfInitiated=!guided;
    if(d.state==='GUIDED_RESOLUTION')transition('EXCHANGE_ACTIVE');else transition('EXCHANGE_ACTIVE');
    telemetry('dv_exchange_success',{beforeValue:result.beforeValue,afterValue:result.afterValue,selfInitiated:!guided});
    setStageLabel('1 puluh = 10 sa');
    setBody(`<div class="dvCallout success"><b>1 puluh (10) ditukar menjadi 10 sa.</b><span>Jumlahnya tidak berubah. Kita cuma susun semula nilai tempat.</span></div>${placeBlocks(d.exchange.current)}<div class="dvEquation">6 puluh + 2 sa <span>=</span> 5 puluh + 12 sa <span>=</span> 62</div>`);
    later(()=>{if(ensureSession()?.state==='EXCHANGE_ACTIVE'){transition('ONES_STEP');renderOnesStep()}},650);
  }

  function renderOnesStep(){
    const d=ensureSession();if(!d)return;setStageLabel('Tolak sa');
    setBody(`${placeBlocks(d.exchange.current)}<div class="dvStep"><small>SA</small><strong>12 − 7 = ?</strong></div><div class="dvChoices"><button onclick="PADimensionalView.answerPlaceStep('ones',4)">4</button><button onclick="PADimensionalView.answerPlaceStep('ones',5)">5</button><button onclick="PADimensionalView.answerPlaceStep('ones',6)">6</button></div><div class="dvFeedback" id="dvFeedback"></div>`);
  }

  function renderTensStep(){
    const d=ensureSession();if(!d)return;setStageLabel('Tolak puluh');
    setBody(`<div class="dvStep"><small>PULUH</small><strong>5 − 2 = ?</strong></div><div class="dvChoices"><button onclick="PADimensionalView.answerPlaceStep('tens',2)">2</button><button onclick="PADimensionalView.answerPlaceStep('tens',3)">3</button><button onclick="PADimensionalView.answerPlaceStep('tens',4)">4</button></div><div class="dvFeedback" id="dvFeedback"></div>`);
  }

  function answerPlaceStep(kind,value){
    const d=ensureSession();if(!d)return;
    const expected=kind==='ones'?5:3;
    const state=kind==='ones'?'ONES_STEP':'TENS_STEP';
    if(d.state!==state)return;
    d.stepAttempts[kind]++;
    if(Number(value)!==expected){
      const f=document.getElementById('dvFeedback');
      if(d.stepAttempts[kind]>=2){
        d.guidedResolutionUsed=true;telemetry('dv_guided_resolution',{reason:kind+'_subtraction'});
        if(f)f.innerHTML=`Kita buat bersama: <b>${kind==='ones'?'12 − 7 = 5':'5 − 2 = 3'}</b>. <button class="dvInline" onclick="PADimensionalView.answerPlaceStep('${kind}',${expected})">Teruskan</button>`;
      }else if(f)f.textContent=kind==='ones'?'Ambil 7 daripada 12 sa.':'Tolak 2 puluh daripada 5 puluh.';
      return;
    }
    if(kind==='ones'){
      transition('TENS_STEP');renderTensStep();
    }else{
      transition('REPRESENTATION_BRIDGE');renderRepresentationBridge();
    }
  }

  function renderRepresentationBridge(){
    const d=ensureSession();if(!d)return;d.transferStage='ASSISTED';setStageLabel('Sambung makna');
    root.PADimensionalMemory?.recordTransfer(d.skillId,'ASSISTED','PASS',d.originalQuestionToken);
    root.PADimensionalMemory?.recordRepresentationUse(d.skillId,REPRESENTATION_ID,d.guidedResolutionUsed?'assisted_success':'independent_success');
    telemetry('dv_representation_bridge',{guidedResolutionUsed:!!d.guidedResolutionUsed});
    setBody(`<div class="dvResult"><small>62 − 27</small><strong>35</strong></div><div class="dvBridge"><div><b>6 puluh + 2 sa</b><span>62</span></div><i>=</i><div><b>5 puluh + 12 sa</b><span>62</span></div></div><div class="dvCallout success"><b>Nilai masih sama.</b><span>60 + 2 = 50 + 12 = 62. Kita cuma susun semula puluh dan sa.</span></div><button class="dvPrimary" onclick="PADimensionalView.openWorkingBridge()">Lihat bentuk lazim</button>`);
    saveDb();
  }

  function workingHtml(minuend=62,subtrahend=27,result=35){
    const a=String(minuend).padStart(2,'0'),b=String(subtrahend).padStart(2,'0'),r=String(result).padStart(2,'0');
    return `<div class="dvWorking" aria-label="Bentuk lazim ${minuend} tolak ${subtrahend} sama dengan ${result}"><div class="dvWorkingLabels"><span>PULUH</span><span>SA</span></div><div class="dvRegroup"><span>${Number(a[0])-1}</span><span>1${a[1]}</span></div><div class="dvWorkRow"><i></i><span>${a[0]}</span><span>${a[1]}</span></div><div class="dvWorkRow minus"><i>−</i><span>${b[0]}</span><span>${b[1]}</span></div><hr><div class="dvWorkRow answer"><i></i><span>${r[0]}</span><span>${r[1]}</span></div></div>`;
  }

  function openWorkingBridge(){
    const d=ensureSession();if(!d||d.state!=='REPRESENTATION_BRIDGE')return;
    transition('WORKING_BRIDGE');setStageLabel('Bentuk lazim');telemetry('dv_working_bridge');
    setBody(`<div class="dvCallout"><b>5 puluh dan 12 sa</b><span>sekarang masuk ke bentuk lazim yang sama.</span></div>${workingHtml(62,27,35)}<button class="dvPrimary" onclick="PADimensionalView.openNearTransfer()">Cuba nombor baharu</button>`);
  }

  function openNearTransfer(){
    const d=ensureSession();if(!d||d.state!=='WORKING_BRIDGE')return;
    transition('NEAR_TRANSFER');d.transferStage='NEAR_TRANSFER';d.near={stage:'ACTION',hadError:false};setStageLabel('Cuba sendiri');renderNearTransfer();
  }

  function renderNearTransfer(){
    const d=ensureSession();if(!d)return;
    if(d.near.stage==='ACTION'){
      setBody(`<div class="dvProblem"><small>Soalan baharu</small><strong>73 − 28</strong></div><div class="dvMiniColumns"><span><small>PULUH</small><b>7</b></span><span><small>SA</small><b>3</b></span></div><p class="dvPrompt">Sebelum tolak 8 sa, apa perlu dibuat?</p><div class="dvChoices vertical"><button onclick="PADimensionalView.answerNearAction('exchange')">Tukar 1 puluh → 10 sa</button><button onclick="PADimensionalView.answerNearAction('direct')">Terus tolak 8 daripada 3 sa</button></div><div class="dvFeedback" id="dvFeedback"></div>`);
    }else{
      setBody(`<div class="dvProblem"><small>Selepas kumpul semula</small><strong>73 − 28 = ?</strong></div><div class="dvChoices"><button onclick="PADimensionalView.answerNearResult(45)">45</button><button onclick="PADimensionalView.answerNearResult(55)">55</button><button onclick="PADimensionalView.answerNearResult(51)">51</button></div><div class="dvFeedback" id="dvFeedback"></div>`);
    }
  }

  function answerNearAction(action){
    const d=ensureSession();if(!d||d.state!=='NEAR_TRANSFER'||d.near.stage!=='ACTION')return;
    if(action!=='exchange'){
      d.near.hadError=true;const f=document.getElementById('dvFeedback');if(f)f.textContent='3 sa belum cukup untuk tolak 8 sa.';return;
    }
    d.near.stage='ANSWER';renderNearTransfer();
  }
  function answerNearResult(value){
    const d=ensureSession();if(!d||d.state!=='NEAR_TRANSFER'||d.near.stage!=='ANSWER')return;
    if(Number(value)!==45){d.near.hadError=true;const f=document.getElementById('dvFeedback');if(f)f.textContent='Semak 13 − 8 dan 6 − 2.';return}
    const status=d.near.hadError?'FAIL':'PASS';
    root.PADimensionalMemory?.recordTransfer(d.skillId,'NEAR_TRANSFER',status,'near-73-28');
    telemetry('dv_transfer_result',{stage:'NEAR_TRANSFER',result:status,itemId:'near-73-28'});
    transition('KSSR_CLEAN_TRANSFER');d.transferStage='KSSR_CLEAN';setStageLabel('Cuba gaya sekolah');renderKssrClean();saveDb();
  }

  function renderKssrClean(){
    const d=ensureSession();if(!d)return;
    setBody(`<div class="dvClean"><small>Gaya sekolah · tanpa gambar bantuan</small><h3>84 − 37 = ______</h3><label for="dvCleanAnswer">Jawapan</label><input id="dvCleanAnswer" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Jawapan bagi 84 tolak 37"><button class="dvPrimary" onclick="PADimensionalView.submitKssrClean()">Semak</button><div class="dvFeedback" id="dvFeedback"></div></div>`);
  }

  function submitKssrClean(){
    const d=ensureSession();if(!d||d.state!=='KSSR_CLEAN_TRANSFER')return;
    const input=document.getElementById('dvCleanAnswer'),value=Number(input?.value);
    d.clean.attempts++;
    if(value!==47){
      d.clean.hadError=true;
      const f=document.getElementById('dvFeedback');if(f)f.textContent=d.clean.attempts<2?'Semak semula bentuk lazim kamu.':'Jawapan ialah 47. Kita akan semak semula kemudian.';
      if(d.clean.attempts<2)return;
    }
    const status=value===47&&!d.clean.hadError?'PASS':'FAIL';
    root.PADimensionalMemory?.recordTransfer(d.skillId,'KSSR_CLEAN',status,'kssr-clean-84-37');
    telemetry('dv_transfer_result',{stage:'KSSR_CLEAN',result:status,itemId:'kssr-clean-84-37'});
    transition('COMPLETE');d.transferStage='DELAYED_REVISIT';d.exitReason='COMPLETE';
    const revisit=root.PADimensionalMemory?.scheduleRevisit({skillId:d.skillId,dueAfter:Date.now()+root.DIMENSIONAL_VIEW_CFG.delayedRevisitMs,reason:'regrouping_clean_transfer_'+status.toLowerCase()});
    if(revisit)telemetry('dv_revisit_scheduled',{reason:revisit.reason,dueAfter:revisit.dueAfter});
    root.PADimensionalMemory?.recordTransfer(d.skillId,'DELAYED_REVISIT','PENDING','');
    root.PADimensionalMemory?.markInterventionCompleted(d.skillId,{guided:d.guidedResolutionUsed,kssrClean:status});
    telemetry('dv_intervention_completed',{kssrClean:status,guidedResolutionUsed:!!d.guidedResolutionUsed,durationBand:durationBand(Date.now()-d.enteredAt)});
    setStageLabel('Kembali ke pertarungan');
    setTeacherActive(false);
    root.PADimensionalPortal?.deactivate?.();
    setBody(`<div class="dvComplete"><div class="dvCheck">✓</div><b>${status==='PASS'?'Kamu berjaya guna cara yang sama tanpa gambar bantuan.':'Kita sudah nampak cara kumpul semula. Cikgu Dimensi akan semak semula kemudian.'}</b><span>1 puluh = 10 dan 10 sa = 10. Jadi 1 puluh boleh ditukar kepada 10 sa tanpa mengubah jumlah.</span></div><button class="dvPrimary" onclick="PADimensionalView.resumeBattle()">Sambung pertarungan</button>`);
    saveDb();
  }

  function durationBand(ms){const s=ms/1000;return s<45?'SHORT':s<120?'MEDIUM':'LONG'}

  function recordRetentionResult(status,itemId=''){
    const normalized=String(status||'').toUpperCase()==='PASS'?'PASS':'FAIL';
    const rec=root.PADimensionalMemory?.completeRevisit({skillId:SKILL_ID,prototypeId:PROTOTYPE_ID,misconceptionId:MISCONCEPTION_ID,status:normalized,itemId});
    telemetry('dv_retention_result',{result:normalized,itemId:String(itemId||''),scheduled:!rec?.unplanned});
    saveDb();return rec;
  }

  function resumeAfterAbort(){
    const d=ensureSession();if(!d||d.state!=='ABORTED')return;finishResume();
  }
  function resumeBattle(){
    const d=ensureSession();if(!d||d.state!=='COMPLETE')return;finishResume();
  }
  function finishResume(){
    const s=getSess(),d=ensureSession();if(!s||!d)return;
    d.active=false;
    releaseBattleControls();hideOverlay();
    // The intercepted wrong attempt remains evidence but does not trigger battle damage.
    // Move to a fresh item so intervention time never contaminates the response timer.
    s.retryState=null;s.hint=false;s.hintLevel=0;
    saveDb();
    later(()=>{try{if(typeof nextQ==='function')nextQ();else root.nextQ?.()}catch(_){ }},120);
  }

  function installRuntimeAdapters(){
    // beginHintRetry already records legacy evidence on first wrong attempt. We add
    // a bounded, prototype-only evidence layer after that record and before any enemy attack.
    if(typeof root.beginHintRetry==='function'&&!root.beginHintRetry.__dvWrapped){
      const original=root.beginHintRetry;
      const wrapped=function(o,btn,q){
        if(ensureSession()?.active)return;
        const out=original.apply(this,arguments);
        const s=getSess(),sec=Number(s?.retryState?.firstSeconds||0);
        captureResponseEvidence(q?.skill,false,o?.tag,sec,false,q);
        const decision=evaluateEntry(q?.skill,q);
        if(decision)start(decision);
        return out;
      };
      wrapped.__dvWrapped=true;wrapped.__dvOriginal=original;root.beginHintRetry=wrapped;
    }
    if(typeof root.respond==='function'&&!root.respond.__dvWrapped){
      const original=root.respond;
      const wrapped=function(){if(ensureSession()?.active)return false;return original.apply(this,arguments)};
      wrapped.__dvWrapped=true;root.respond=wrapped;
    }
    if(typeof root.nextQ==='function'&&!root.nextQ.__dvWrapped){
      const original=root.nextQ;
      const wrapped=function(){if(ensureSession()?.active)return false;return original.apply(this,arguments)};
      wrapped.__dvWrapped=true;wrapped.__dvOriginal=original;root.nextQ=wrapped;
    }
    if(typeof root.triggerImpact==='function'&&!root.triggerImpact.__dvWrapped){
      const original=root.triggerImpact;
      const wrapped=function(){if(ensureSession()?.active)return{frozen:true,defeatDelay:0};return original.apply(this,arguments)};
      wrapped.__dvWrapped=true;root.triggerImpact=wrapped;
    }
  }

  root.evaluateDimensionalIntervention=evaluateEntry;
  root.PADimensionalView={
    VERSION:'0.2.1',PROTOTYPE_ID,TRANSITIONS,
    freshDimension,ensureSession,canTransition,transition,
    eligibleQuestion,captureResponseEvidence,evaluateEntry,start,
    answerPrerequisite,showExchangeNeed,invalidOnesAttempt,exchangeTen,answerPlaceStep,
    openWorkingBridge,openNearTransfer,answerNearAction,answerNearResult,
    submitKssrClean,recordRetentionResult,resumeBattle,resumeAfterAbort,
    installRuntimeAdapters,
    _render:{renderPrerequisite,renderPlaceValueView,renderExchangeRequired,renderOnesStep,renderTensStep,renderRepresentationBridge,renderKssrClean,workingHtml,placeBlocks}
  };

  root.PADimensionalMemory?.ensure();
  installRuntimeAdapters();
})(typeof window!=='undefined'?window:globalThis);
