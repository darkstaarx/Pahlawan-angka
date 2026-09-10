/* Cikgu Dimensi — teaching-session memory v0.2.0.
 * Additive tutor memory only. db.skills/adaptive mastery remain authoritative.
 */
(function(root){
  'use strict';
  const SCHEMA_VERSION=2;
  function getDb(){try{if(typeof db!=='undefined')return db}catch(_){ }return root.db||null}
  function now(){return Date.now()}
  function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return v}}
  function ensure(){
    const d=getDb();if(!d)return null;
    if(!d.dimensionalView||typeof d.dimensionalView!=='object')d.dimensionalView={};
    const m=d.dimensionalView;
    if(!m.skills||typeof m.skills!=='object')m.skills={};
    if(!m.misconceptions||typeof m.misconceptions!=='object')m.misconceptions={};
    if(!Array.isArray(m.revisits))m.revisits=[];
    m.schemaVersion=Math.max(Number(m.schemaVersion||0),SCHEMA_VERSION);
    return m;
  }
  function ensureSkillMemory(skillId){
    const m=ensure();if(!m||!skillId)return null;
    const existing=m.skills[skillId]||{};
    const node=m.skills[skillId]={
      supportLevel:existing.supportLevel||null,
      representationHistory:existing.representationHistory&&typeof existing.representationHistory==='object'?existing.representationHistory:{},
      transfer:existing.transfer&&typeof existing.transfer==='object'?existing.transfer:{assisted:null,near:null,crossRepresentation:null,context:null,kssrClean:null,delayed:null},
      lastInterventionAt:Number(existing.lastInterventionAt||0),lastCleanTransferAt:Number(existing.lastCleanTransferAt||0),
      interventionCount:Number(existing.interventionCount||0),failedInterventionCount:Number(existing.failedInterventionCount||0),
      strategyHistory:Array.isArray(existing.strategyHistory)?existing.strategyHistory:[],
      representationAttempts:Array.isArray(existing.representationAttempts)?existing.representationAttempts:[],
      failedStrategies:existing.failedStrategies&&typeof existing.failedStrategies==='object'?existing.failedStrategies:{},
      preferredEffectiveRepresentations:Array.isArray(existing.preferredEffectiveRepresentations)?existing.preferredEffectiveRepresentations:[],
      lastGuidedOutcome:existing.lastGuidedOutcome||null,lastUnderstandingCheckOutcome:existing.lastUnderstandingCheckOutcome||null,
      lastIndependentTransferOutcome:existing.lastIndependentTransferOutcome||null,
      delayedRevisitStatus:existing.delayedRevisitStatus||null,version:2
    };
    return node;
  }
  function ensureMisconceptionMemory(misconceptionId,conceptId=null){
    const m=ensure();if(!m||!misconceptionId)return null;
    const e=m.misconceptions[misconceptionId]||{};
    return m.misconceptions[misconceptionId]={conceptId:conceptId||e.conceptId||null,status:e.status||'UNCLASSIFIED',confidence:e.confidence||'INSUFFICIENT',independentEvidenceCount:Number(e.independentEvidenceCount||0),evidenceIds:Array.isArray(e.evidenceIds)?e.evidenceIds:[],evidence:Array.isArray(e.evidence)?e.evidence:[],lastEvidenceAt:Number(e.lastEvidenceAt||0),lastUpdatedAt:Number(e.lastUpdatedAt||0),version:2};
  }
  function confidenceFor(n){return n>=3?'HIGH':n>=2?'MEDIUM':n>=1?'LOW':'INSUFFICIENT'}
  function recordEvidence({conceptId,skillId,misconceptionId,itemId,tag,type='REGROUPING_PATTERN',distinctItem=true,context='natural-assessment'}={}){
    if(!misconceptionId||!itemId)return{added:false,reason:'MISSING_KEY'};
    const node=ensureMisconceptionMemory(misconceptionId,conceptId);if(!node)return{added:false,reason:'NO_DB'};
    const key=`${skillId||''}:${itemId}:${type}`;
    if(node.evidenceIds.includes(key))return{added:false,duplicate:true,independentEvidenceCount:node.independentEvidenceCount,confidence:node.confidence};
    node.evidenceIds.push(key);node.evidence.push({key,skillId:skillId||null,itemId:String(itemId),tag:tag||null,type,distinctItem:!!distinctItem,context,at:now()});
    if(context==='natural-assessment'&&distinctItem)node.independentEvidenceCount++;
    node.confidence=confidenceFor(node.independentEvidenceCount);node.status=node.independentEvidenceCount>=2?'SUPPORTED':node.independentEvidenceCount===1?'HYPOTHESIS':'UNCLASSIFIED';node.lastEvidenceAt=now();node.lastUpdatedAt=now();
    return{added:true,independentEvidenceCount:node.independentEvidenceCount,confidence:node.confidence,status:node.status};
  }
  function recordRepresentationUse(skillId,representationId,result='opened',context='guided'){
    const node=ensureSkillMemory(skillId);if(!node||!representationId)return null;
    const h=node.representationHistory[representationId]||{uses:0,assistedSuccess:0,independentSuccess:0,failures:0,lastUsedAt:0,lastResult:null};
    h.uses++;h.lastUsedAt=now();h.lastResult=result;
    if(result==='PASS'&&context==='independent-transfer')h.independentSuccess++;
    else if(result==='PASS')h.assistedSuccess++;
    else if(result==='FAIL')h.failures++;
    node.representationHistory[representationId]=h;
    node.representationAttempts.push({representationId,result,context,at:h.lastUsedAt});
    if(node.representationAttempts.length>40)node.representationAttempts.splice(0,node.representationAttempts.length-40);
    return h;
  }
  function recordStrategy(skillId,strategyId,{representationId=null,result='OPENED',context='guided',supportLevel=null}={}){
    const node=ensureSkillMemory(skillId);if(!node||!strategyId)return null;
    const entry={strategyId,representationId,result,context,supportLevel,at:now()};node.strategyHistory.push(entry);if(node.strategyHistory.length>40)node.strategyHistory.splice(0,node.strategyHistory.length-40);
    if(result==='FAIL')node.failedStrategies[strategyId]=Number(node.failedStrategies[strategyId]||0)+1;
    if(supportLevel)node.supportLevel=supportLevel;
    if(representationId)recordRepresentationUse(skillId,representationId,result,context);
    return entry;
  }
  function recordGuidedOutcome(skillId,outcome,supportLevel='FULL_SUPPORT'){const n=ensureSkillMemory(skillId);if(!n)return null;n.lastGuidedOutcome={outcome,supportLevel,at:now()};n.supportLevel=supportLevel;return n.lastGuidedOutcome}
  function recordUnderstandingCheck(skillId,outcome,{strategyId=null,representationId=null}={}){const n=ensureSkillMemory(skillId);if(!n)return null;n.lastUnderstandingCheckOutcome={outcome,strategyId,representationId,at:now()};return n.lastUnderstandingCheckOutcome}
  function recordIndependentTransfer(skillId,outcome,{strategyId=null,representationId=null}={}){
    const n=ensureSkillMemory(skillId);if(!n)return null;n.lastIndependentTransferOutcome={outcome,strategyId,representationId,at:now()};n.transfer.kssrClean={result:outcome,at:now()};
    if(outcome==='PASS'){n.lastCleanTransferAt=now();if(representationId&&!n.preferredEffectiveRepresentations.includes(representationId))n.preferredEffectiveRepresentations.unshift(representationId);n.preferredEffectiveRepresentations=n.preferredEffectiveRepresentations.slice(0,3);recordRepresentationUse(skillId,representationId,'PASS','independent-transfer')}
    return n.lastIndependentTransferOutcome;
  }
  function recordTransfer(skillId,stage,result,extra={}){const n=ensureSkillMemory(skillId);if(!n)return null;const key=String(stage||'').toLowerCase()==='kssr_clean'?'kssrClean':stage;n.transfer[key]={result,...clone(extra),at:now()};if(key==='kssrClean')recordIndependentTransfer(skillId,result,extra);return n.transfer[key]}
  function markInterventionStarted(skillId,misconceptionId){const n=ensureSkillMemory(skillId);if(!n)return null;n.interventionCount++;n.lastInterventionAt=now();if(misconceptionId){const m=ensureMisconceptionMemory(misconceptionId);if(m)m.lastUpdatedAt=now()}return n}
  function markInterventionCompleted(skillId,{success=false}={}){const n=ensureSkillMemory(skillId);if(!n)return null;if(!success)n.failedInterventionCount++;return n}
  function scheduleRevisit({skillId,dueAfter,reason,conceptId='subtraction_regrouping'}={}){const m=ensure(),n=ensureSkillMemory(skillId);if(!m||!n)return null;const entry={id:`dv-${now()}-${Math.random().toString(36).slice(2,8)}`,skillId,conceptId,dueAfter:Number(dueAfter||now()),reason:reason||'teaching_revisit',status:'PENDING',createdAt:now()};m.revisits.push(entry);n.delayedRevisitStatus='PENDING';return entry}
  function completeRevisit(id,result){const m=ensure();if(!m)return null;const r=m.revisits.find(x=>x.id===id);if(!r)return null;r.status='COMPLETE';r.result=result;r.completedAt=now();const n=ensureSkillMemory(r.skillId);if(n){n.delayedRevisitStatus='COMPLETE';n.transfer.delayed={result,at:r.completedAt}}return r}
  function snapshot(skillId){const n=ensureSkillMemory(skillId);return n?clone(n):null}
  root.PADimensionalMemory={version:'0.2.0',schemaVersion:SCHEMA_VERSION,ensure,ensureSkill:ensureSkillMemory,ensureMisconception:ensureMisconceptionMemory,recordEvidence,recordRepresentationUse,recordStrategy,recordGuidedOutcome,recordUnderstandingCheck,recordIndependentTransfer,recordTransfer,markInterventionStarted,markInterventionCompleted,scheduleRevisit,completeRevisit,snapshot};
})(typeof window!=='undefined'?window:globalThis);
