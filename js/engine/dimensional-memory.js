/* Cikgu Dimensi — persistent dimensional learning memory v0.1.
 * Additive only: existing db.skills / coachMemory / spacedReview remain authoritative.
 */
(function(root){
  'use strict';

  const SCHEMA_VERSION=1;
  const CURRICULUM_VERSION='SEMAKAN_2017_DPK_EDISI_3';
  const CURRICULUM_SYSTEM='KSSR';

  function currentDb(){
    try{if(typeof db!=='undefined')return db}catch(_){/* global lexical may not exist in tests */}
    return root.db||null;
  }

  function ensureDimensionalMemory(){
    const db=currentDb();
    if(!db)return null;
    db.dimensionalView=db.dimensionalView||{};
    const mem=db.dimensionalView;
    mem.schemaVersion=SCHEMA_VERSION;
    mem.curriculum=mem.curriculum||{};
    mem.curriculum.system=mem.curriculum.system||CURRICULUM_SYSTEM;
    mem.curriculum.version=mem.curriculum.version||CURRICULUM_VERSION;
    mem.curriculum.year=Number(db.schoolGrade||mem.curriculum.year||0);
    mem.skills=mem.skills||{};
    mem.misconceptions=mem.misconceptions||{};
    mem.revisits=Array.isArray(mem.revisits)?mem.revisits:[];
    return mem;
  }

  function ensureSkillMemory(skillId){
    const mem=ensureDimensionalMemory();
    if(!mem||!skillId)return null;
    const existing=mem.skills[skillId]||{};
    existing.supportLevel=existing.supportLevel||'SYMBOL_ONLY';
    existing.representationHistory=existing.representationHistory||{};
    existing.transfer=existing.transfer||{};
    for(const key of ['assisted','near','crossRepresentation','context','kssrClean','delayed']){
      if(existing.transfer[key]===undefined)existing.transfer[key]=null;
    }
    existing.lastInterventionAt=Number(existing.lastInterventionAt||0);
    existing.lastCleanTransferAt=Number(existing.lastCleanTransferAt||0);
    existing.interventionCount=Number(existing.interventionCount||0);
    existing.failedInterventionCount=Number(existing.failedInterventionCount||0);
    existing.version=1;
    mem.skills[skillId]=existing;
    return existing;
  }

  function confidenceForCount(count){
    if(count>=3)return'HIGH';
    if(count>=2)return'MEDIUM';
    if(count>=1)return'LOW';
    return'INSUFFICIENT';
  }

  function ensureMisconceptionMemory(misconceptionId,conceptId='subtraction_regrouping'){
    const mem=ensureDimensionalMemory();
    if(!mem||!misconceptionId)return null;
    const existing=mem.misconceptions[misconceptionId]||{};
    existing.conceptId=existing.conceptId||conceptId;
    existing.status=existing.status||'UNCLASSIFIED';
    existing.confidence=existing.confidence||'INSUFFICIENT';
    existing.independentEvidenceCount=Number(existing.independentEvidenceCount||0);
    existing.evidenceIds=Array.isArray(existing.evidenceIds)?existing.evidenceIds:[];
    existing.lastEvidenceAt=Number(existing.lastEvidenceAt||0);
    existing.lastInterventionAt=Number(existing.lastInterventionAt||0);
    existing.lastTransferResult=existing.lastTransferResult??null;
    existing.curriculumVersion=existing.curriculumVersion||CURRICULUM_VERSION;
    mem.misconceptions[misconceptionId]=existing;
    return existing;
  }

  function evidenceIdFor({prototypeId='Y3-PV-A2',misconceptionId='PV-005',skillId='',itemId='',tag='',type='REGROUPING_PATTERN'}){
    return [prototypeId,misconceptionId,skillId,String(itemId),type,tag||''].join('|');
  }

  function recordEvidence(input){
    const misconceptionId=input?.misconceptionId||'PV-005';
    const skillId=input?.skillId||'';
    if(!skillId)return{added:false,reason:'missing_skill'};
    const node=ensureMisconceptionMemory(misconceptionId,input?.conceptId||'subtraction_regrouping');
    ensureSkillMemory(skillId);
    if(!node)return{added:false,reason:'no_db'};

    const id=evidenceIdFor(input||{});
    const existed=node.evidenceIds.includes(id);
    if(!existed){
      node.evidenceIds.push(id);
      // A mathematical signal from a different item is independent evidence.
      if(input?.distinctItem!==false)node.independentEvidenceCount++;
      node.lastEvidenceAt=Date.now();
    }
    const count=node.independentEvidenceCount;
    node.confidence=confidenceForCount(count);
    node.status=count>=2?'SUPPORTED':count>=1?'HYPOTHESIS':'UNCLASSIFIED';
    return{added:!existed,evidenceId:id,independentEvidenceCount:count,confidence:node.confidence,status:node.status};
  }

  function markInterventionStarted(skillId,misconceptionId='PV-005'){
    const skill=ensureSkillMemory(skillId),node=ensureMisconceptionMemory(misconceptionId);
    if(skill){skill.lastInterventionAt=Date.now();skill.interventionCount++;}
    if(node){node.status='ACTIVE';node.lastInterventionAt=Date.now();}
  }

  function recordRepresentationUse(skillId,representationId,result){
    const skill=ensureSkillMemory(skillId);if(!skill)return null;
    const history=skill.representationHistory;
    const rec=history[representationId]||(history[representationId]={uses:0,assistedSuccess:0,independentSuccess:0,lastUsedAt:0,lastResult:null});
    rec.uses++;rec.lastUsedAt=Date.now();rec.lastResult=result||null;
    if(result==='assisted_success')rec.assistedSuccess++;
    if(result==='independent_success'||result==='near_transfer_success'||result==='kssr_clean_success')rec.independentSuccess++;
    return rec;
  }

  function recordTransfer(skillId,stage,status,itemId='',misconceptionId='PV-005'){
    const skill=ensureSkillMemory(skillId);if(!skill)return null;
    const map={
      ASSISTED:'assisted',
      NEAR_TRANSFER:'near',
      CROSS_REPRESENTATION:'crossRepresentation',
      CONTEXT_TRANSFER:'context',
      KSSR_CLEAN:'kssrClean',
      DELAYED_REVISIT:'delayed'
    };
    const key=map[stage]||stage;
    if(!Object.prototype.hasOwnProperty.call(skill.transfer,key))return null;
    skill.transfer[key]={status,at:Date.now(),itemId:String(itemId||'')};
    if(key==='kssrClean'&&status==='PASS')skill.lastCleanTransferAt=Date.now();
    const node=ensureMisconceptionMemory(misconceptionId);
    if(node){
      node.lastTransferResult={stage,status,at:Date.now()};
      if(key==='kssrClean'&&status==='PASS')node.status='RESOLVED_PROVISIONAL';
      else if(status==='FAIL')node.status='RECOVERING';
    }
    return skill.transfer[key];
  }

  function scheduleRevisit({skillId,misconceptionId='PV-005',prototypeId='Y3-PV-A2',dueAfter,reason='regrouping_revisit'}){
    const mem=ensureDimensionalMemory();if(!mem||!skillId)return null;
    const due=Number(dueAfter||Date.now()+86400000);
    let rec=mem.revisits.find(x=>x&&x.status==='PENDING'&&x.skillId===skillId&&x.prototypeId===prototypeId&&x.misconceptionId===misconceptionId);
    if(!rec){
      rec={skillId,misconceptionId,prototypeId,dueAfter:due,stage:'DELAYED_REVISIT',status:'PENDING',reason,createdAt:Date.now()};
      mem.revisits.push(rec);
    }else{
      rec.dueAfter=Math.min(Number(rec.dueAfter||due),due);rec.reason=reason;
    }
    return rec;
  }

  function completeRevisit({skillId,prototypeId='Y3-PV-A2',misconceptionId='PV-005',status,itemId=''}){
    const mem=ensureDimensionalMemory();if(!mem||!skillId)return null;
    const normalized=String(status||'').toUpperCase()==='PASS'?'PASS':'FAIL';
    const rec=mem.revisits.find(x=>x&&x.status==='PENDING'&&x.skillId===skillId&&x.prototypeId===prototypeId&&x.misconceptionId===misconceptionId);
    if(rec){rec.status=normalized;rec.completedAt=Date.now();rec.itemId=String(itemId||'');}
    recordTransfer(skillId,'DELAYED_REVISIT',normalized,itemId,misconceptionId);
    return rec||{skillId,prototypeId,misconceptionId,status:normalized,itemId:String(itemId||''),completedAt:Date.now(),unplanned:true};
  }

  function markInterventionCompleted(skillId,{guided=false,kssrClean=null,misconceptionId='PV-005'}={}){
    const skill=ensureSkillMemory(skillId),node=ensureMisconceptionMemory(misconceptionId);
    if(skill&&guided)skill.failedInterventionCount=Number(skill.failedInterventionCount||0)+1;
    if(node){
      if(kssrClean==='PASS')node.status='RESOLVED_PROVISIONAL';
      else if(guided||kssrClean==='FAIL')node.status='RECOVERING';
      else node.status='SUPPORTED';
    }
  }

  root.PADimensionalMemory={
    SCHEMA_VERSION,
    CURRICULUM_VERSION,
    ensure:ensureDimensionalMemory,
    ensureSkill:ensureSkillMemory,
    ensureMisconception:ensureMisconceptionMemory,
    recordEvidence,
    recordRepresentationUse,
    recordTransfer,
    scheduleRevisit,
    completeRevisit,
    markInterventionStarted,
    markInterventionCompleted,
    confidenceForCount
  };
})(typeof window!=='undefined'?window:globalThis);
