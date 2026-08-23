// Pahlawan Angka v3.39.0 — D3 Topic 7 evidence epoch / mastery compatibility layer.
// Phase 2D-1 prepares a separate QS v2 evidence store while the learner path remains SHADOW.
(function(root){
  'use strict';

  const VERSION='3.39.0';
  const SCHEMA_VERSION=1;
  const STORE_KEY='qsv2Evidence';
  const TOPIC_ID='D3.T7';
  const SKILL_ID='D3.SHAPE';
  const EPOCH_ID='D3.T7:qsv2:v1';
  const LEGACY_SEMANTIC='rectangle_perimeter_and_sides';
  const TARGET_SEMANTIC='prism_polygon_symmetry';
  const MAX_RECENT_ATTEMPTS=120;
  const MIN_CLEAN=3;
  const MIN_FAMILIES=2;

  const COMPETENCY_SPECS={
    identify_prism:{standardId:'7.1.1',performanceInteraction:null},
    describe_prism_features:{standardId:'7.1.2',performanceInteraction:null},
    classify_prism_vs_non_prism:{standardId:'7.1.3',performanceInteraction:null},
    identify_regular_polygon:{standardId:'7.2.1',performanceInteraction:null},
    create_regular_polygon_pattern:{standardId:'7.2.2',performanceInteraction:'sequence_build'},
    identify_and_draw_symmetry_axis:{standardId:'7.3.1',performanceInteraction:'draw_axis'}
  };
  const COMPETENCIES=Object.keys(COMPETENCY_SPECS);

  function now(){return Date.now()}
  function num(v){v=Number(v);return Number.isFinite(v)?v:0}
  function text(v,max){return String(v==null?'':v).slice(0,max||160)}
  function own(obj,key){return !!obj&&Object.prototype.hasOwnProperty.call(obj,key)}
  function cloneJson(value){return JSON.parse(JSON.stringify(value))}
  function countKeys(obj){return obj&&typeof obj==='object'?Object.keys(obj).length:0}

  function legacySnapshot(skill){
    return {
      mastery:num(skill&&skill.mastery),
      confidence:num(skill&&skill.confidence),
      evidence:num(skill&&skill.evidence),
      correct:num(skill&&skill.correct),
      wrong:num(skill&&skill.wrong),
      hints:num(skill&&skill.hints),
      stability:num(skill&&skill.stability),
      probePass:num(skill&&skill.probePass),
      probeFail:num(skill&&skill.probeFail),
      lastSeen:num(skill&&skill.lastSeen)
    };
  }

  function freshCompetency(id){
    const spec=COMPETENCY_SPECS[id];
    return {
      competencyId:id,
      standardId:spec.standardId,
      attempts:0,
      finalCorrect:0,
      firstAttemptWrong:0,
      cleanCorrect:0,
      assistedCorrect:0,
      incorrect:0,
      hintsUsed:0,
      reasoningOrApplicationClean:0,
      interactiveClean:0,
      requiredPerformanceInteraction:spec.performanceInteraction,
      requiredPerformanceSatisfied:spec.performanceInteraction?false:true,
      families:{},
      cleanFamilies:{},
      representations:{},
      cleanRepresentations:{},
      demands:{},
      cleanDemands:{},
      responseTypes:{},
      interactions:{},
      cleanInteractions:{},
      templates:{},
      lastSeen:0,
      lastTemplateId:null
    };
  }

  function freshTopic(skill){
    const competencies={};
    COMPETENCIES.forEach(id=>competencies[id]=freshCompetency(id));
    return {
      schemaVersion:SCHEMA_VERSION,
      topicId:TOPIC_ID,
      compatibilitySkillId:SKILL_ID,
      epochId:EPOCH_ID,
      status:'prepared_shadow',
      createdAt:now(),
      liveActivatedAt:null,
      legacy:{
        semantic:LEGACY_SEMANTIC,
        acceptedForTarget:false,
        aggregateContinuesOutsideTargetEpoch:true,
        baselineCapturedAt:now(),
        baseline:legacySnapshot(skill),
        cutoverSnapshot:null
      },
      target:{
        semantic:TARGET_SEMANTIC,
        sourceSystem:'qsv2',
        evidenceRuleVersion:'d3-topic7-v1-provisional',
        minCleanCorrect:MIN_CLEAN,
        minDistinctFamilies:MIN_FAMILIES,
        requireReasoningOrApplication:true,
        requiresPerformanceFor:['create_regular_polygon_pattern','identify_and_draw_symmetry_axis']
      },
      competencies,
      recentAttemptIds:[],
      updatedAt:0
    };
  }

  function persist(stateRoot){
    if(!stateRoot)return;
    stateRoot.lastSavedAt=now();
    try{
      if(root.localStorage&&typeof root.localStorage.setItem==='function')root.localStorage.setItem('pa_coach_v6_full',JSON.stringify(stateRoot));
    }catch(_){}
    try{
      if(root.PACloud&&typeof root.PACloud.scheduleSave==='function')setTimeout(function(){try{root.PACloud.scheduleSave()}catch(_){}},0);
    }catch(_){}
  }

  function shouldPrepare(stateRoot,legacySkill){
    if(!stateRoot||!legacySkill)return false;
    if(Number(stateRoot.schoolGrade)===3)return true;
    return num(legacySkill.evidence)>0||num(legacySkill.correct)>0||num(legacySkill.wrong)>0;
  }

  function repairTopic(topic){
    let changed=false;
    if(!topic.competencies||typeof topic.competencies!=='object'){topic.competencies={};changed=true}
    COMPETENCIES.forEach(function(id){
      if(!topic.competencies[id]){topic.competencies[id]=freshCompetency(id);changed=true;return}
      const c=topic.competencies[id],spec=COMPETENCY_SPECS[id];
      if(c.competencyId!==id){c.competencyId=id;changed=true}
      if(c.standardId!==spec.standardId){c.standardId=spec.standardId;changed=true}
      ['families','cleanFamilies','representations','cleanRepresentations','demands','cleanDemands','responseTypes','interactions','cleanInteractions','templates'].forEach(function(key){
        if(!c[key]||typeof c[key]!=='object'||Array.isArray(c[key])){c[key]={};changed=true}
      });
      ['attempts','finalCorrect','firstAttemptWrong','cleanCorrect','assistedCorrect','incorrect','hintsUsed','reasoningOrApplicationClean','interactiveClean','lastSeen'].forEach(function(key){
        if(!Number.isFinite(Number(c[key]))){c[key]=0;changed=true}
      });
      if(c.requiredPerformanceInteraction!==spec.performanceInteraction){c.requiredPerformanceInteraction=spec.performanceInteraction;changed=true}
      const satisfied=!spec.performanceInteraction||num(c.cleanInteractions&&c.cleanInteractions[spec.performanceInteraction])>0;
      if(c.requiredPerformanceSatisfied!==satisfied){c.requiredPerformanceSatisfied=satisfied;changed=true}
    });
    if(!Array.isArray(topic.recentAttemptIds)){topic.recentAttemptIds=[];changed=true}
    if(topic.recentAttemptIds.length>MAX_RECENT_ATTEMPTS){topic.recentAttemptIds=topic.recentAttemptIds.slice(-MAX_RECENT_ATTEMPTS);changed=true}
    return changed;
  }

  function ensure(stateRoot,options){
    options=options||{};
    const out={ok:false,changed:false,reason:null,topic:null};
    if(!stateRoot||!stateRoot.skills||!stateRoot.skills[SKILL_ID]){out.reason='state_missing';return out}
    const legacySkill=stateRoot.skills[SKILL_ID];
    if(!shouldPrepare(stateRoot,legacySkill)&&!stateRoot[STORE_KEY]){out.reason='not_applicable';return out}

    let store=stateRoot[STORE_KEY];
    if(store&&Number(store.schemaVersion)!==SCHEMA_VERSION){out.reason='unsupported_store_schema';return out}
    if(!store){store=stateRoot[STORE_KEY]={schemaVersion:SCHEMA_VERSION,topics:{}};out.changed=true}
    if(!store.topics||typeof store.topics!=='object'||Array.isArray(store.topics)){store.topics={};out.changed=true}

    let topic=store.topics[TOPIC_ID];
    if(topic&&Number(topic.schemaVersion)!==SCHEMA_VERSION){out.reason='unsupported_topic_schema';return out}
    if(!topic){topic=store.topics[TOPIC_ID]=freshTopic(legacySkill);out.changed=true}
    if(repairTopic(topic))out.changed=true;

    // Preserve the legacy aggregate exactly. It remains available for historical UI/
    // compatibility, but it is never read as D3 Topic 7 target evidence.
    if(!topic.legacy||typeof topic.legacy!=='object'){
      topic.legacy={semantic:LEGACY_SEMANTIC,acceptedForTarget:false,aggregateContinuesOutsideTargetEpoch:true,baselineCapturedAt:now(),baseline:legacySnapshot(legacySkill),cutoverSnapshot:null};
      out.changed=true;
    }
    if(topic.legacy.acceptedForTarget!==false){topic.legacy.acceptedForTarget=false;out.changed=true}
    if(topic.status!=='prepared_shadow'&&topic.liveActivatedAt==null){topic.status='prepared_shadow';out.changed=true}

    if(out.changed&&!options.noPersist)persist(stateRoot);
    out.ok=true;out.reason='ok';out.topic=topic;
    return out;
  }

  function incrementMap(map,key){
    key=text(key||'unknown',160)||'unknown';
    map[key]=num(map[key])+1;
  }

  function enumValue(value,allowed,fallback){
    value=text(value,64).toLowerCase();
    return allowed.indexOf(value)!==-1?value:(fallback||'unknown');
  }
  function familyValue(value){
    value=text(value,160);
    return /^D3\.T7\.[A-Za-z0-9._-]+$/.test(value)?value:'unknown';
  }
  function templateValue(value){
    value=text(value,160);
    return /^D3-T7-[A-Za-z0-9-]+-v[0-9]+$/.test(value)?value:'unknown';
  }

  function validateQuestion(question){
    if(!question||question.source!=='qsv2'||question.qsv2Pilot!==true)return {ok:false,reason:'not_qsv2_topic7'};
    const competencyId=text(question.competencyId,128),spec=COMPETENCY_SPECS[competencyId];
    if(!spec)return {ok:false,reason:'unknown_competency'};
    if(text(question.standardId,64)!==spec.standardId)return {ok:false,reason:'standard_competency_mismatch'};
    if(question.curriculumVersion&&text(question.curriculumVersion,64)!=='KSSR-E3-2024')return {ok:false,reason:'curriculum_version_mismatch'};
    return {ok:true,competencyId,spec};
  }

  function record(stateRoot,question,result){
    result=result||{};
    const checked=validateQuestion(question);
    if(!checked.ok)return {accepted:false,reason:checked.reason};
    const attemptId=text(result.attemptId,128);
    if(!attemptId)return {accepted:false,reason:'attempt_id_required'};
    if(!/^[A-Za-z0-9:._-]{1,128}$/.test(attemptId))return {accepted:false,reason:'invalid_attempt_id'};

    const ensured=ensure(stateRoot,{noPersist:true});
    if(!ensured.ok)return {accepted:false,reason:ensured.reason};
    const topic=ensured.topic;
    if(topic.recentAttemptIds.indexOf(attemptId)!==-1)return {accepted:false,reason:'duplicate_attempt'};

    const c=topic.competencies[checked.competencyId];
    const finalCorrect=result.finalCorrect===true;
    const firstAttemptCorrect=result.firstAttemptCorrect===true;
    const usedHint=result.usedHint===true;
    const clean=finalCorrect&&firstAttemptCorrect&&!usedHint;
    const responseType=enumValue(result.responseType||question.responseType||(question.interaction?'interactive':'mcq'),['mcq','interactive'],'unknown');
    const interactionType=enumValue(result.interactionType||(question.interaction&&question.interaction.type)||'',['sequence_build','draw_axis'],'');
    const family=familyValue(question.familyKey);
    const representation=enumValue(question.representation,['visual','text','symbolic','concrete','mixed'],'unknown');
    const demand=enumValue(question.demand,['concept','procedure','reasoning','application','transfer'],'unknown');
    const templateId=templateValue(question.templateId);

    c.attempts++;
    if(finalCorrect)c.finalCorrect++;else c.incorrect++;
    if(!firstAttemptCorrect)c.firstAttemptWrong++;
    if(usedHint)c.hintsUsed++;
    if(clean)c.cleanCorrect++;else if(finalCorrect)c.assistedCorrect++;
    if(clean&&(demand==='reasoning'||demand==='application'||demand==='transfer'))c.reasoningOrApplicationClean++;
    if(clean&&responseType==='interactive')c.interactiveClean++;
    incrementMap(c.families,family);
    incrementMap(c.representations,representation);
    incrementMap(c.demands,demand);
    incrementMap(c.responseTypes,responseType);
    if(interactionType)incrementMap(c.interactions,interactionType);
    incrementMap(c.templates,templateId);
    if(clean){
      incrementMap(c.cleanFamilies,family);
      incrementMap(c.cleanRepresentations,representation);
      incrementMap(c.cleanDemands,demand);
      if(interactionType)incrementMap(c.cleanInteractions,interactionType);
    }
    c.requiredPerformanceSatisfied=!c.requiredPerformanceInteraction||num(c.cleanInteractions[c.requiredPerformanceInteraction])>0;
    c.lastSeen=now();
    c.lastTemplateId=templateId;

    topic.recentAttemptIds.push(attemptId);
    if(topic.recentAttemptIds.length>MAX_RECENT_ATTEMPTS)topic.recentAttemptIds=topic.recentAttemptIds.slice(-MAX_RECENT_ATTEMPTS);
    topic.updatedAt=now();
    persist(stateRoot);
    return {accepted:true,reason:'ok',competencyId:checked.competencyId,status:competencyStatus(c)};
  }

  function competencyStatus(c){
    if(!c||num(c.attempts)===0)return 'unproven';
    const enoughClean=num(c.cleanCorrect)>=MIN_CLEAN;
    const enoughFamilies=countKeys(c.cleanFamilies)>=MIN_FAMILIES;
    const higherDemand=num(c.reasoningOrApplicationClean)>=1;
    const performance=c.requiredPerformanceSatisfied===true;
    return enoughClean&&enoughFamilies&&higherDemand&&performance?'secure':'developing';
  }

  function summary(stateRoot){
    const ensured=ensure(stateRoot,{noPersist:true});
    if(!ensured.ok)return {ok:false,reason:ensured.reason};
    const topic=ensured.topic,competencies={};
    let secure=0,totalAttempts=0,totalClean=0;
    COMPETENCIES.forEach(function(id){
      const c=topic.competencies[id],status=competencyStatus(c);
      if(status==='secure')secure++;
      totalAttempts+=num(c.attempts);totalClean+=num(c.cleanCorrect);
      competencies[id]={
        standardId:c.standardId,
        status,
        attempts:num(c.attempts),
        cleanCorrect:num(c.cleanCorrect),
        distinctFamilies:countKeys(c.cleanFamilies),
        reasoningOrApplicationClean:num(c.reasoningOrApplicationClean),
        requiredPerformanceInteraction:c.requiredPerformanceInteraction||null,
        requiredPerformanceSatisfied:c.requiredPerformanceSatisfied===true
      };
    });
    return {
      ok:true,
      schemaVersion:SCHEMA_VERSION,
      topicId:TOPIC_ID,
      epochId:EPOCH_ID,
      compatibilitySkillId:SKILL_ID,
      legacyEvidenceAcceptedForTarget:false,
      status:topic.status,
      totalAttempts,
      totalClean,
      secureCompetencies:secure,
      curriculumSecure:secure===COMPETENCIES.length,
      liveActivated:topic.liveActivatedAt!=null,
      competencies
    };
  }

  function canActivateLive(stateRoot){
    const s=summary(stateRoot);
    if(!s.ok)return {allowed:false,reason:s.reason};
    // Phase 2D-1 intentionally cannot authorize LIVE. Phase 2D-2 must perform an
    // explicit cutover/seal and remove the Phase 2D-0 pre-LIVE gate.
    return {allowed:false,reason:'phase2d2_cutover_required',prepared:true,legacyEvidenceAcceptedForTarget:false};
  }

  const api={
    version:VERSION,
    schemaVersion:SCHEMA_VERSION,
    topicId:TOPIC_ID,
    compatibilitySkillId:SKILL_ID,
    epochId:EPOCH_ID,
    competencySpecs:cloneJson(COMPETENCY_SPECS),
    ensure,
    record,
    summary,
    canActivateLive,
    competencyStatus,
    validateQuestion
  };
  root.PAD3Topic7Evidence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
