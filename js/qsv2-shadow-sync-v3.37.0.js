// Pahlawan Angka v3.37.0 — fail-open central uploader for QS v2 shadow metadata.
(function(root,factory){
  'use strict';
  var api=factory(root||{});
  if(typeof module!=='undefined'&&module.exports)module.exports={createShadowSync:factory};
  if(root&&root.document)root.PAQSV2ShadowSync=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  var TABLE='qsv2_shadow_events';
  var QUEUE_KEY='pa_qsv2_shadow_upload_v1';
  var MAX_QUEUE=300,BATCH=25;
  var OUTCOMES={generated:1,fallback:1,error:1};
  var REASONS={ok:1,runtime_missing:1,no_template:1,generator_missing:1,exception:1};
  var state={syncing:false,sent:0,lastOutcome:null,lastError:null,lastSyncedAt:null,timer:null};

  function storage(){try{return root.localStorage||null}catch(_){return null}}
  function readQueue(){try{var s=storage();var q=s?JSON.parse(s.getItem(QUEUE_KEY)||'[]'):[];return Array.isArray(q)?q:[]}catch(_){return[]}}
  function writeQueue(q){try{var s=storage();if(s)s.setItem(QUEUE_KEY,JSON.stringify((q||[]).slice(-MAX_QUEUE)))}catch(_){} }
  function uuid(){
    try{if(root.crypto&&typeof root.crypto.randomUUID==='function')return root.crypto.randomUUID()}catch(_){}
    var a='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';return a.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  }
  function trim(value,max){if(value==null)return null;var s=String(value);return s.length>max?s.slice(0,max):s}
  function telemetryAllowed(){try{return !!(root.PATelemetry&&typeof root.PATelemetry.enabled==='function'&&root.PATelemetry.enabled())}catch(_){return false}}
  function context(){
    try{
      var c=root.PACloud&&root.PACloud.state;
      if(!c||!c.client||!c.user||!c.childId)return null;
      return {client:c.client,childId:String(c.childId)};
    }catch(_){return null}
  }
  function sourceHash(){try{return root.PAQuestionSystemV2Bridge&&root.PAQuestionSystemV2Bridge.getStatus?root.PAQuestionSystemV2Bridge.getStatus().sourceHash:null}catch(_){return null}}
  function appVersion(){try{return trim(root.PA_APP_VERSION||'unknown',32)}catch(_){return'unknown'}}
  function sanitise(payload,ctx){
    payload=payload||{};
    var outcome=OUTCOMES[payload.outcome]?payload.outcome:'fallback';
    var reason=REASONS[payload.reason]?payload.reason:(outcome==='generated'?'ok':'exception');
    var ms=Math.max(0,Math.min(60000,Math.round(Number(payload.generationMs)||0)));
    return {
      client_event_id:uuid(),child_id:ctx.childId,event_schema:1,app_version:appVersion(),source_hash:trim(sourceHash(),128),
      mode:'shadow',outcome:outcome,reason:reason,generation_ms:ms,
      standard_id:trim(payload.standardId,64),competency_id:trim(payload.competencyId,128),template_id:trim(payload.templateId,160),fingerprint:trim(payload.fingerprint,160),
      occurred_at:new Date().toISOString()
    };
  }
  function schedule(delay){
    try{if(state.timer)root.clearTimeout?root.clearTimeout(state.timer):clearTimeout(state.timer)}catch(_){}
    var fn=function(){state.timer=null;flush()};
    try{state.timer=root.setTimeout?root.setTimeout(fn,delay):setTimeout(fn,delay)}catch(_){state.timer=null}
  }
  function enqueue(payload){
    if(!telemetryAllowed())return false;
    var ctx=context();if(!ctx)return false;
    var q=readQueue();q.push(sanitise(payload,ctx));writeQueue(q);schedule(100);return true;
  }
  async function flush(){
    if(state.syncing||!telemetryAllowed())return false;
    var ctx=context();if(!ctx)return false;
    var q=readQueue();if(!q.length){state.lastOutcome='idle';state.lastError=null;return true}
    if(root.navigator&&root.navigator.onLine===false){state.lastOutcome='offline';return false}
    state.syncing=true;var batch=q.slice(0,BATCH);
    try{
      var query=ctx.client.from(TABLE);
      var result=await query.upsert(batch,{onConflict:'client_event_id',ignoreDuplicates:true});
      if(result&&result.error)throw result.error;
      var ids=new Set(batch.map(function(x){return x.client_event_id}));
      writeQueue(q.filter(function(x){return !ids.has(x.client_event_id)}));
      state.sent+=batch.length;state.lastOutcome='synced';state.lastError=null;state.lastSyncedAt=Date.now();
      if(readQueue().length)schedule(0);
      return true;
    }catch(err){
      state.lastOutcome='error';state.lastError=trim(err&&err.message?err.message:String(err),160);schedule(15000);return false;
    }finally{state.syncing=false}
  }
  function getStatus(){return {queued:readQueue().length,syncing:state.syncing,sent:state.sent,lastOutcome:state.lastOutcome,lastError:state.lastError,lastSyncedAt:state.lastSyncedAt,optOut:!telemetryAllowed(),cloudReady:!!context()}}
  function clearQueue(){writeQueue([]);return 0}
  try{if(root.addEventListener)root.addEventListener('online',function(){schedule(0)})}catch(_){}
  schedule(2500);
  return {enqueue:enqueue,flush:flush,getStatus:getStatus,clearQueue:clearQueue,_test:{readQueue:readQueue,sanitise:sanitise,QUEUE_KEY:QUEUE_KEY,TABLE:TABLE}};
});
