// Pahlawan Angka v3.42.0 — D3 Topic 7 controlled DEV + remotely gated beta LIVE cutover.
(function(root){
  'use strict';
  const VERSION='3.42.0';
  const SKILL_ID='D3.SHAPE';
  const TOPIC_ID='D3.T7';
  const LIVE_FLAG='pa.qsv2.d3Topic7.controlledLive.v1';
  const TARGET_TITLE='Prisma, Poligon Sekata & Paksi Simetri';

  function now(){return Date.now()}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function storage(){try{return root.localStorage||null}catch(_){return null}}
  function localHost(){try{return ['localhost','127.0.0.1','[::1]'].includes(root.location&&root.location.hostname)}catch(_){return false}}
  function devAuthorized(stateRoot){
    if(!stateRoot||stateRoot.devMode!==true)return false;
    try{if(storage()?.getItem('pa_dev_unlocked')!=='1')return false}catch(_){return false}
    if(localHost())return true;
    try{return !!(root.PACommercial&&typeof root.PACommercial.canUseDev==='function'&&root.PACommercial.canUseDev()===true)}catch(_){return false}
  }
  function betaAuthorized(stateRoot){
    try{return !!(root.PAQSV2BetaRollout&&typeof root.PAQSV2BetaRollout.isEligible==='function'&&root.PAQSV2BetaRollout.isEligible(stateRoot)===true)}catch(_){return false}
  }
  function liveFlag(){try{return storage()?.getItem(LIVE_FLAG)==='1'}catch(_){return false}}
  function persist(stateRoot){
    if(!stateRoot)return;
    stateRoot.lastSavedAt=now();
    try{storage()?.setItem('pa_coach_v6_full',JSON.stringify(stateRoot))}catch(_){}
    try{if(root.PACloud&&typeof root.PACloud.scheduleSave==='function')setTimeout(()=>{try{root.PACloud.scheduleSave()}catch(_){}},0)}catch(_){}
  }
  function ensurePrepared(stateRoot){
    const api=root.PAD3Topic7Evidence;
    if(!api||typeof api.ensure!=='function')return {ok:false,reason:'evidence_api_missing'};
    const ensured=api.ensure(stateRoot,{noPersist:true});
    if(!ensured||!ensured.ok)return {ok:false,reason:ensured&&ensured.reason||'evidence_not_prepared'};
    if(ensured.topic.compatibilitySkillId!==SKILL_ID||ensured.topic.topicId!==TOPIC_ID)return {ok:false,reason:'evidence_contract_mismatch'};
    if(!ensured.topic.legacy||ensured.topic.legacy.acceptedForTarget!==false)return {ok:false,reason:'legacy_evidence_gate_missing'};
    return {ok:true,topic:ensured.topic};
  }
  function killActive(){const bridge=root.PAQuestionSystemV2Bridge;const s=bridge&&typeof bridge.getStatus==='function'?bridge.getStatus():null;return !!(s&&s.killSwitch)}
  function getStatus(stateRoot){
    const prep=ensurePrepared(stateRoot),bridge=root.PAQuestionSystemV2Bridge;
    const b=bridge&&typeof bridge.getStatus==='function'?bridge.getStatus():null;
    const dev=devAuthorized(stateRoot),beta=betaAuthorized(stateRoot);
    const controlled=!!(prep.ok&&dev&&liveFlag()&&prep.topic.status==='controlled_live');
    const betaLive=!!(prep.ok&&beta&&prep.topic.status==='beta_live');
    return {
      version:VERSION,topicId:TOPIC_ID,compatibilitySkillId:SKILL_ID,targetTitle:TARGET_TITLE,
      prepared:!!prep.ok,reason:prep.ok?'ok':prep.reason,devAuthorized:dev,betaEligible:beta,
      localLiveFlag:liveFlag(),bridgeMode:b&&b.mode||'off',killSwitch:!!(b&&b.killSwitch),
      controlledLive:controlled,betaLive:betaLive,liveAudience:controlled?'admin_dev':betaLive?'beta_guardian':'shadow',
      liveActivatedAt:prep.ok?prep.topic.liveActivatedAt||null:null,
      betaLiveActivatedAt:prep.ok?prep.topic.betaLiveActivatedAt||null:null,
      evidence:root.PAD3Topic7Evidence&&typeof root.PAD3Topic7Evidence.summary==='function'?root.PAD3Topic7Evidence.summary(stateRoot):null
    };
  }
  function prepareLive(stateRoot){
    const prep=ensurePrepared(stateRoot);if(!prep.ok)return prep;
    const bridge=root.PAQuestionSystemV2Bridge;if(!bridge||typeof bridge.setPilotMode!=='function')return {ok:false,reason:'bridge_missing'};
    if(killActive())return {ok:false,reason:'kill_switch_active'};
    const skill=stateRoot.skills&&stateRoot.skills[SKILL_ID];if(!skill)return {ok:false,reason:'legacy_skill_missing'};
    if(!prep.topic.legacy.cutoverSnapshot)prep.topic.legacy.cutoverSnapshot={capturedAt:now(),skill:clone(skill)};
    return {ok:true,topic:prep.topic,bridge};
  }
  function activate(stateRoot){
    if(!devAuthorized(stateRoot))return {ok:false,reason:'admin_dev_required'};
    const prep=prepareLive(stateRoot);if(!prep.ok)return prep;
    prep.topic.status='controlled_live';
    if(!prep.topic.liveActivatedAt)prep.topic.liveActivatedAt=now();
    prep.topic.updatedAt=now();
    storage()?.setItem(LIVE_FLAG,'1');
    prep.bridge.setPilotMode('live',true);
    persist(stateRoot);
    return {ok:true,reason:'ok',mode:'live',audience:'admin_dev',topicId:TOPIC_ID};
  }
  function deactivate(stateRoot){
    try{storage()?.removeItem(LIVE_FLAG)}catch(_){}
    const bridge=root.PAQuestionSystemV2Bridge;
    if(bridge&&typeof bridge.setPilotMode==='function')bridge.setPilotMode('shadow',true);
    const prep=ensurePrepared(stateRoot);
    if(prep.ok){prep.topic.status='paused_shadow';prep.topic.lastDeactivatedAt=now();prep.topic.updatedAt=now();persist(stateRoot)}
    return {ok:true,reason:'ok',mode:'shadow'};
  }
  function activateBeta(stateRoot){
    if(!betaAuthorized(stateRoot))return {ok:false,reason:'beta_not_eligible'};
    const prep=prepareLive(stateRoot);if(!prep.ok)return prep;
    if(devAuthorized(stateRoot)&&liveFlag()&&prep.topic.status==='controlled_live'){
      prep.bridge.setPilotMode('live',false);return {ok:true,reason:'controlled_dev_preserved',mode:'live',audience:'admin_dev',topicId:TOPIC_ID};
    }
    prep.topic.status='beta_live';
    if(!prep.topic.betaLiveActivatedAt)prep.topic.betaLiveActivatedAt=now();
    prep.topic.updatedAt=now();
    prep.bridge.setPilotMode('live',false);
    persist(stateRoot);
    return {ok:true,reason:'ok',mode:'live',audience:'beta_guardian',topicId:TOPIC_ID};
  }
  function deactivateBeta(stateRoot,details){
    const prep=ensurePrepared(stateRoot),bridge=root.PAQuestionSystemV2Bridge;
    if(prep.ok&&devAuthorized(stateRoot)&&liveFlag()&&prep.topic.status==='controlled_live')return {ok:true,reason:'controlled_dev_preserved',mode:'live'};
    if(bridge&&typeof bridge.setPilotMode==='function')bridge.setPilotMode('shadow',false);
    if(prep.ok&&prep.topic.status==='beta_live'){
      prep.topic.status='beta_paused';prep.topic.lastBetaDeactivatedAt=now();prep.topic.lastBetaDeactivationReason=details&&details.reason||'beta_not_eligible';prep.topic.updatedAt=now();persist(stateRoot);
    }
    return {ok:true,reason:details&&details.reason||'ok',mode:'shadow'};
  }
  function authorizeLive(skillId,stateRoot){
    if(skillId!==SKILL_ID)return {allowed:false,reason:'skill_not_eligible'};
    if(killActive())return {allowed:false,reason:'kill_switch_active'};
    const prep=ensurePrepared(stateRoot);if(!prep.ok)return {allowed:false,reason:prep.reason};
    if(devAuthorized(stateRoot)&&liveFlag()&&prep.topic.status==='controlled_live')return {allowed:true,reason:'ok',audience:'admin_dev',topicId:TOPIC_ID};
    if(betaAuthorized(stateRoot)&&prep.topic.status==='beta_live')return {allowed:true,reason:'ok',audience:'beta_guardian',topicId:TOPIC_ID};
    return {allowed:false,reason:'live_not_authorized'};
  }
  function isTargetQuestion(question){
    return !!(question&&question.skill===SKILL_ID&&question.source==='qsv2'&&question.qsv2Pilot===true&&question.competencyId&&question.standardId);
  }
  function newAttemptId(question,token){
    if(!isTargetQuestion(question))return null;
    const rand=Math.random().toString(36).slice(2,8),stamp=now().toString(36);
    return `live:${stamp}:${Number(token)||0}:${rand}`;
  }
  function displayTitle(meta,question){return isTargetQuestion(question)?TARGET_TITLE:(meta&&meta.title)||'Kemahiran'}
  function captureLegacyState(question,skillState){return isTargetQuestion(question)&&skillState?clone(skillState):null}
  function restoreLegacyState(question,skillState,snapshot){
    if(!isTargetQuestion(question)||!skillState||!snapshot)return false;
    Object.keys(skillState).forEach(k=>delete skillState[k]);Object.assign(skillState,clone(snapshot));return true;
  }
  function recordBattleResult(stateRoot,question,session,finalCorrect){
    if(!isTargetQuestion(question))return {accepted:false,reason:'not_qsv2_topic7'};
    const auth=authorizeLive(SKILL_ID,stateRoot);if(!auth.allowed)return {accepted:false,reason:'live_not_authorized'};
    const api=root.PAD3Topic7Evidence;if(!api||typeof api.record!=='function')return {accepted:false,reason:'evidence_api_missing'};
    return api.record(stateRoot,question,{
      attemptId:question.qsv2AttemptId,
      finalCorrect:finalCorrect===true,
      firstAttemptCorrect:finalCorrect===true&&!session?.retryState,
      usedHint:session?.hint===true,
      responseType:'mcq'
    });
  }
  root.PAD3Topic7LiveCutover={version:VERSION,topicId:TOPIC_ID,compatibilitySkillId:SKILL_ID,targetTitle:TARGET_TITLE,activate,deactivate,activateBeta,deactivateBeta,authorizeLive,getStatus,isTargetQuestion,newAttemptId,displayTitle,captureLegacyState,restoreLegacyState,recordBattleResult,_test:{devAuthorized,betaAuthorized,liveFlag,ensurePrepared,LIVE_FLAG}};
})(typeof globalThis!=='undefined'?globalThis:this);
