#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const rootDir=path.resolve(__dirname,'../../..');
const {createBetaRollout,REFRESH_MS,MAX_AGE_MS}=require(path.join(rootDir,'js/qsv2-beta-rollout-v3.42.0.js'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}
class LS{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}
function fakeClient(opts={}){
  return {
    from(table){
      let key=null,value=null;
      return {
        select(){return this},
        eq(k,v){key=k;value=v;return this},
        async maybeSingle(){
          if(opts.errorTable===table)return {data:null,error:{message:'forced'}};
          if(table==='qsv2_rollout_config')return {data:opts.config===null?null:{enabled:opts.enabled!==false,audience:'consented_beta_guardians',topic_id:'D3.T7',skill_id:'D3.SHAPE',config_version:1,updated_at:'2026-08-23T00:00:00Z'},error:null};
          if(table==='guardian_consents')return {data:opts.consent===null?null:{privacy_version:opts.oldConsent?'old':'2026-08-22',terms_version:opts.oldConsent?'old':'2026-08-22'},error:null};
          return {data:null,error:{message:'unexpected '+table+' '+key+' '+value}};
        }
      };
    }
  };
}
function makeEnv(opts={}){
  const ls=new LS(),topic={schemaVersion:1,topicId:'D3.T7',compatibilitySkillId:'D3.SHAPE',status:'prepared_shadow',liveActivatedAt:null,legacy:{acceptedForTarget:false,cutoverSnapshot:null},competencies:{},recentAttemptIds:[]};
  let bridgeMode='shadow',kill=false,saves=0;
  const ctx={console,Math,Date,setTimeout:(fn)=>{fn();return 1},clearTimeout:()=>{},localStorage:ls,location:{hostname:'example.com'},PACommercial:{canUseDev:()=>!!opts.admin},PAQuestionSystemV2Bridge:{setPilotMode:(m)=>{bridgeMode=m;return m},getStatus:()=>({mode:bridgeMode,killSwitch:kill,battleCompatibleTemplates:24})},PAD3Topic7Evidence:{ensure:(state)=>state&&state.skills&&state.skills['D3.SHAPE']?{ok:true,topic}:{ok:false,reason:'state_missing'},summary:()=>({ok:true,totalAttempts:0,secureCompetencies:0}),record:()=>({accepted:true,reason:'ok'})},PABetaTrust:{versions:{privacy:'2026-08-22',terms:'2026-08-22'}}};
  ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(rootDir,'data/kssr/d3-topic7-live-cutover-v3.40.0.js'),'utf8'),ctx);
  const state={cloudChildId:'c1',schoolGrade:opts.grade||3,devMode:!!opts.devMode,skills:{'D3.SHAPE':{mastery:70,confidence:60,evidence:8,correct:6,wrong:2}},qsv2Evidence:{schemaVersion:1,topics:{'D3.T7':topic}}};
  ctx.PACloud={state:{client:fakeClient(opts),user:{id:'u1'},childId:'c1'},scheduleSave:()=>{saves++}};
  const rollout=createBetaRollout(ctx);ctx.PAQSV2BetaRollout=rollout;
  return {ctx,state,topic,rollout,ls,getMode:()=>bridgeMode,setKill:v=>{kill=!!v},getSaves:()=>saves};
}
(async()=>{
  let e=makeEnv();
  ok(e.ctx.PAD3Topic7LiveCutover.version==='3.42.0','cutover version 3.42');
  let s=await e.rollout.refresh(e.state);
  ok(s.ready&&s.enabled&&s.consentCurrent&&s.eligible,'eligible beta guardian passes remote gate');
  eq(e.getMode(),'live','eligible beta switches bridge live in-memory');
  eq(e.topic.status,'beta_live','topic marked beta_live');
  ok(Number(e.topic.betaLiveActivatedAt)>0,'beta activation timestamp stored');
  ok(e.topic.legacy.cutoverSnapshot&&e.topic.legacy.cutoverSnapshot.skill.mastery===70,'legacy snapshot captured before beta live');
  let a=e.ctx.PAD3Topic7LiveCutover.authorizeLive('D3.SHAPE',e.state);
  ok(a.allowed&&a.audience==='beta_guardian','non-dev beta guardian authorized');
  ok(e.state.devMode===false&&e.ls.getItem('pa_dev_unlocked')===null,'beta LIVE does not require DEV/local unlock');
  ok(!e.ctx.PAD3Topic7LiveCutover.authorizeLive('D3.MONEY',e.state).allowed,'other skill remains blocked');
  ok(e.ctx.PAD3Topic7LiveCutover.getStatus(e.state).betaLive,'status exposes beta LIVE');
  ok(e.getSaves()>0,'beta live evidence-state marker scheduled for cloud save');

  e.setKill(true);a=e.ctx.PAD3Topic7LiveCutover.authorizeLive('D3.SHAPE',e.state);ok(!a.allowed&&a.reason==='kill_switch_active','existing local kill switch still blocks beta LIVE');e.setKill(false);
  e.rollout.reset(e.state);eq(e.getMode(),'shadow','session reset fails closed to shadow');eq(e.topic.status,'beta_paused','beta evidence state paused not erased');

  e=makeEnv({enabled:false});s=await e.rollout.refresh(e.state);ok(!s.eligible&&s.reason==='rollout_disabled_or_invalid','remote OFF blocks rollout');eq(e.getMode(),'shadow','remote OFF remains shadow');
  e=makeEnv({oldConsent:true});s=await e.rollout.refresh(e.state);ok(!s.eligible&&s.reason==='consent_not_current','outdated guardian consent blocked');eq(e.getMode(),'shadow','outdated consent remains shadow');
  e=makeEnv({grade:2});s=await e.rollout.refresh(e.state);ok(!s.eligible&&s.reason==='grade_or_child_not_eligible','non-D3 learner blocked');eq(e.getMode(),'shadow','non-D3 learner remains shadow');
  e=makeEnv({errorTable:'qsv2_rollout_config'});s=await e.rollout.refresh(e.state);ok(!s.eligible&&s.reason==='rollout_check_failed','remote config failure fails closed');eq(e.getMode(),'shadow','remote failure remains shadow');
  e=makeEnv({errorTable:'guardian_consents'});s=await e.rollout.refresh(e.state);ok(!s.eligible&&s.reason==='rollout_check_failed','consent lookup failure fails closed');

  e=makeEnv({enabled:false,admin:true,devMode:true});e.ls.setItem('pa_dev_unlocked','1');
  let r=e.ctx.PAD3Topic7LiveCutover.activate(e.state);ok(r.ok&&r.audience==='admin_dev','historical admin controlled LIVE remains available when beta remote OFF');eq(e.getMode(),'live','admin controlled path still live');
  a=e.ctx.PAD3Topic7LiveCutover.authorizeLive('D3.SHAPE',e.state);ok(a.allowed&&a.audience==='admin_dev','admin controlled authorization preserved');
  e.ctx.PAD3Topic7LiveCutover.deactivate(e.state);eq(e.getMode(),'shadow','admin rollback still shadow');

  eq(REFRESH_MS,300000,'remote flag refresh every 5 minutes');eq(MAX_AGE_MS,900000,'authorization expires after 15 minutes without fresh gate');
  const rolloutSrc=fs.readFileSync(path.join(rootDir,'js/qsv2-beta-rollout-v3.42.0.js'),'utf8');
  ok(rolloutSrc.includes("from(table).select")||rolloutSrc.includes('client.from(table).select'),'rollout reads through Supabase client');
  ok(rolloutSrc.includes("'guardian_consents'")&&rolloutSrc.includes("'qsv2_rollout_config'"),'rollout requires both consent and remote config');
  ok(!/localStorage\.setItem|storage\(\)\.setItem/.test(rolloutSrc),'beta rollout stores no eligibility/user identity in localStorage');
  ok(!/prompt|chosenAnswer|answer_text|display_name|email/.test(rolloutSrc),'beta rollout captures no question content or direct identity fields');
  const sql=fs.readFileSync(path.join(rootDir,'supabase/schema/qsv2_beta_rollout_v1.sql'),'utf8');
  ok(sql.includes("'d3_topic7_beta_live',true,'consented_beta_guardians','D3.T7','D3.SHAPE'"),'tracked migration enables exact beta Topic 7 gate');
  ok(sql.includes('enable row level security')&&sql.includes('grant select')&&sql.includes('to authenticated'),'rollout config read is RLS/authenticated only');
  ok(!/user_id|child_id|email|display_name/.test(sql),'remote config table contains no user/child PII');
  console.log(JSON.stringify({status:'pass',checks,release:'3.42.0',audience:'authenticated current-consent D3 beta guardians',remoteGate:'d3_topic7_beta_live',refreshMinutes:5,authorizationTtlMinutes:15,defaultFallback:'shadow/legacy'},null,2));
})().catch(err=>{console.error(err);process.exit(1)});
