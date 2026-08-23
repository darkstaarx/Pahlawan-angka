// Pahlawan Angka v3.42.0 — remotely gated D3 Topic 7 beta LIVE rollout.
(function(root,factory){
  'use strict';
  const exported=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=exported;
  if(root&&root.document){
    const api=exported.createBetaRollout(root);
    root.PAQSV2BetaRollout=api;
    if(typeof root.setInterval==='function')root.setInterval(()=>{try{api.refreshLast()}catch(_){}},exported.REFRESH_MS);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='3.42.0';
  const ROLLOUT_KEY='d3_topic7_beta_live';
  const AUDIENCE='consented_beta_guardians';
  const TOPIC_ID='D3.T7';
  const SKILL_ID='D3.SHAPE';
  const REFRESH_MS=5*60*1000;
  const MAX_AGE_MS=15*60*1000;

  function createBetaRollout(root){
    let generation=0,lastStateRoot=null;
    let internal=fresh('not_checked');
    function now(){try{return root.Date&&typeof root.Date.now==='function'?root.Date.now():Date.now()}catch(_){return Date.now()}}
    function fresh(reason){return {ready:false,enabled:false,consentCurrent:false,eligible:false,reason:reason||'not_checked',fetchedAt:0,expiresAt:0,configVersion:null,userId:null,childId:null}}
    function cloud(){return root.PACloud&&root.PACloud.state||null}
    function publicStatus(){return {version:VERSION,rolloutKey:ROLLOUT_KEY,ready:internal.ready,enabled:internal.enabled,consentCurrent:internal.consentCurrent,eligible:isEligible(lastStateRoot),reason:internal.reason,fetchedAt:internal.fetchedAt,expiresAt:internal.expiresAt,configVersion:internal.configVersion,audience:AUDIENCE,topicId:TOPIC_ID,skillId:SKILL_ID}}
    function deactivate(stateRoot,reason){
      try{root.PAD3Topic7LiveCutover&&typeof root.PAD3Topic7LiveCutover.deactivateBeta==='function'&&root.PAD3Topic7LiveCutover.deactivateBeta(stateRoot,{reason:reason||'beta_not_eligible'})}catch(_){}
    }
    function identityMatches(stateRoot){
      const c=cloud();
      return !!(c&&c.user&&c.childId&&internal.userId===c.user.id&&internal.childId===c.childId&&stateRoot&&stateRoot.cloudChildId===c.childId&&Number(stateRoot.schoolGrade)===3);
    }
    function isEligible(stateRoot){
      if(!internal.ready||!internal.enabled||!internal.consentCurrent||!internal.eligible)return false;
      if(now()>internal.expiresAt)return false;
      return identityMatches(stateRoot);
    }
    async function readOne(client,table,fields,key,value){
      return client.from(table).select(fields).eq(key,value).maybeSingle();
    }
    async function refresh(stateRoot){
      const token=++generation;lastStateRoot=stateRoot||lastStateRoot;
      const c=cloud(),trust=root.PABetaTrust&&root.PABetaTrust.versions;
      if(!c||!c.client||!c.user||!c.childId||!stateRoot){internal=fresh('identity_missing');deactivate(stateRoot,'identity_missing');return publicStatus()}
      if(Number(stateRoot.schoolGrade)!==3||stateRoot.cloudChildId!==c.childId){internal=fresh('grade_or_child_not_eligible');deactivate(stateRoot,'grade_or_child_not_eligible');return publicStatus()}
      if(!trust||!trust.privacy||!trust.terms){internal=fresh('trust_versions_missing');deactivate(stateRoot,'trust_versions_missing');return publicStatus()}
      try{
        const [cfgRes,consentRes]=await Promise.all([
          readOne(c.client,'qsv2_rollout_config','enabled,audience,topic_id,skill_id,config_version,updated_at','rollout_key',ROLLOUT_KEY),
          readOne(c.client,'guardian_consents','privacy_version,terms_version','user_id',c.user.id)
        ]);
        if(token!==generation)return publicStatus();
        if(cfgRes&&cfgRes.error)throw cfgRes.error;if(consentRes&&consentRes.error)throw consentRes.error;
        const cfg=cfgRes&&cfgRes.data,consent=consentRes&&consentRes.data;
        const cfgValid=!!(cfg&&cfg.enabled===true&&cfg.audience===AUDIENCE&&cfg.topic_id===TOPIC_ID&&cfg.skill_id===SKILL_ID);
        const consentCurrent=!!(consent&&consent.privacy_version===trust.privacy&&consent.terms_version===trust.terms);
        const t=now();
        internal={ready:true,enabled:cfgValid,consentCurrent,eligible:cfgValid&&consentCurrent,reason:cfgValid?(consentCurrent?'ok':'consent_not_current'):'rollout_disabled_or_invalid',fetchedAt:t,expiresAt:t+MAX_AGE_MS,configVersion:cfg&&Number(cfg.config_version)||null,userId:c.user.id,childId:c.childId};
        if(internal.eligible){
          const cut=root.PAD3Topic7LiveCutover;
          const r=cut&&typeof cut.activateBeta==='function'?cut.activateBeta(stateRoot):{ok:false,reason:'cutover_beta_api_missing'};
          if(!r||r.ok!==true){internal.eligible=false;internal.reason=r&&r.reason||'beta_activation_failed';deactivate(stateRoot,internal.reason)}
        }else deactivate(stateRoot,internal.reason);
      }catch(_){
        if(token!==generation)return publicStatus();
        internal=fresh('rollout_check_failed');deactivate(stateRoot,'rollout_check_failed');
      }
      return publicStatus();
    }
    function reset(stateRoot){generation++;lastStateRoot=stateRoot||lastStateRoot;deactivate(lastStateRoot,'session_reset');internal=fresh('session_reset');lastStateRoot=null;return publicStatus()}
    function refreshLast(){if(!lastStateRoot)return Promise.resolve(publicStatus());return refresh(lastStateRoot)}
    return {version:VERSION,rolloutKey:ROLLOUT_KEY,refresh,refreshLast,reset,isEligible,getStatus:publicStatus,_test:{readOne,identityMatches,REFRESH_MS,MAX_AGE_MS,AUDIENCE,TOPIC_ID,SKILL_ID}};
  }
  return {createBetaRollout,REFRESH_MS,MAX_AGE_MS,ROLLOUT_KEY,AUDIENCE,TOPIC_ID,SKILL_ID};
});
