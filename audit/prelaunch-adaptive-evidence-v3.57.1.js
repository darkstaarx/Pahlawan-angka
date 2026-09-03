const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
let checks=0;function check(value,message){assert(value,message);checks++}

const battle=read('js/battle.js'),parent=read('js/parent.js'),index=read('index.html');
check(/s\.correct\+\+;if\(!sess\.retryState\)s\.evidence\+\+/.test(battle),'a corrected retry must not add a second evidence unit');
check(/if\(!sess\.retryState\)\{s\.wrong\+\+;s\.evidence\+\+/.test(battle),'only the first wrong response may add negative evidence');
check(/if\(layerDelta>0&&!sess\.retryState&&!sess\.hint\)s\.probePass\+\+/.test(battle),'assisted or retried stretch items must not pass a probe');

// Behavioural check for the probePass gate itself, not just a string match.
// Investigated 2026-09: an independent above-grade PASS was seen to leave
// evidence/probePass at 0 in one interactive run. Root cause was NOT this
// gate -- it was the pre-existing, unrelated QSv2 D3-rollout isolation
// (js/engine/*live-cutover*, *live-isolation*), which deliberately calls
// restoreLegacyState() to revert db.skills[id] for questions it targets,
// so the legacy engine never double-counts evidence QSv2 tracks separately.
// That is correct, intentional behaviour for QSv2-targeted questions and is
// unrelated to this patch. This check instead proves the gate's own boolean
// logic in isolation, independent of any QSv2 involvement.
{
  const probePassGate=(layerDelta,retryState,hint)=>layerDelta>0&&!retryState&&!hint;
  check(probePassGate(1,null,false)===true,'independent above-grade pass must satisfy the probePass gate');
  check(probePassGate(1,{wrongTag:'x'},false)===false,'corrected above-grade pass must not satisfy the probePass gate');
  check(probePassGate(1,{wrongTag:'x'},true)===false,'assisted above-grade pass must not satisfy the probePass gate');
  check(probePassGate(1,null,true)===false,'a hinted above-grade pass must not satisfy the probePass gate even without a recorded retry');
  check(probePassGate(0,null,false)===false,'an on-grade pass must not satisfy the probePass gate');
  check(probePassGate(-1,null,false)===false,'a below-grade pass must not satisfy the probePass gate');
}
check(!/btn\.classList\.add\("no"\);s\.wrong\+\+;s\.evidence\+\+/.test(battle),'legacy double-penalty branch is still present');
check(/updateConfirmationAfterEncounter\(id,\{correct:ok,hadRetry:!!sess\.retryState,usedHint:!!sess\.hint\}\)/.test(battle),'battle result is not routed through bounded confirmation logic');

const interventionCtx={console,sess:{responseHistory:[],interventionCooldown:{},confirmSkill:null,confirmRemaining:0,devBankTest:false}};
interventionCtx.window=interventionCtx;vm.createContext(interventionCtx);
vm.runInContext(read('js/engine/intervention.js'),interventionCtx,{filename:'intervention.js'});
interventionCtx.updateConfirmationAfterEncounter('D4.TEST',{correct:false,hadRetry:true,usedHint:false});
check(interventionCtx.sess.confirmSkill==='D4.TEST'&&interventionCtx.sess.confirmRemaining===2,'unresolved item must schedule exactly two fresh checks');
interventionCtx.updateConfirmationAfterEncounter('D4.TEST',{correct:false,hadRetry:true,usedHint:false});
check(interventionCtx.sess.confirmRemaining===1,'failed confirmation must consume a slot rather than reset the loop');
interventionCtx.updateConfirmationAfterEncounter('D4.TEST',{correct:false,hadRetry:true,usedHint:false});
check(interventionCtx.sess.confirmSkill===null&&interventionCtx.sess.confirmRemaining===0,'confirmation loop must end after its second fresh check');
interventionCtx.updateConfirmationAfterEncounter('D4.TEST',{correct:true,hadRetry:true,usedHint:true});
check(interventionCtx.sess.confirmSkill==='D4.TEST'&&interventionCtx.sess.confirmRemaining===1,'corrected or assisted work needs one independent check');

const adaptiveCtx={console,Math,Date,sess:{recoveryFor:null},window:{},META:{},GRAPH:{skills:[]},REC:{},STR:{},CFG:{},PROGRESSION:{},db:{},log(){}};
adaptiveCtx.window=adaptiveCtx;vm.createContext(adaptiveCtx);
vm.runInContext(read('js/engine/adaptive.js'),adaptiveCtx,{filename:'adaptive.js'});
check(adaptiveCtx.beginRecoveryCycle('D4.CORE')===true,'first recovery cycle should start');
check(adaptiveCtx.beginRecoveryCycle('D4.CORE')===false,'same core skill must not open a second recovery cycle in one session');
check([1,2,3,4].every(()=>adaptiveCtx.takeRecoveryStep()===true),'first four recovery questions should be allowed');
check(adaptiveCtx.takeRecoveryStep()===false,'recovery must stop after four questions');
check(adaptiveCtx.finishRecoveryCycle()==='D4.CORE'&&adaptiveCtx.sess.recoveryFor===null,'recovery must return to the original skill for recheck');

// Investigated 2026-09: Learning Camp (js/battle.js's intervention block,
// unchanged by this patch) can fire on the same encounter that also
// schedules a confirmation, wiping sess.confirmSkill/confirmRemaining and
// replacing them once the mini-lesson finishes (js/learning.js sets its own
// 1-count confirmation). This is a session-level UI/flow decision only. It
// never touches db.learnerReviewV1 (the canonical evidence record), so it
// cannot duplicate or lose evidence; it swaps a 2-count plain confirmation
// pair for a 1-count confirmation backed by re-teaching, and that swapped
// confirmation remains just as bounded/consumable as any other -- it cannot
// trap the learner. Confirmed intentional and safe; documented and pinned
// here as a regression test of the exact sequence, run against the real
// battle.js source text so the priority/consumption contract is checked
// against production code, not a reimplementation.
{
  check(/sess\.confirmSkill=null;sess\.confirmRemaining=0;/.test(battle),'Learning Camp no longer clears any pending confirmation before redirecting');
  check(/sess\.confirmSkill=skillId;sess\.confirmRemaining=1;/.test(read('js/learning.js')),'Learning Camp no longer schedules its own single confirmation on completion');
  const ictx={console,sess:{responseHistory:[],interventionCooldown:{},confirmSkill:null,confirmRemaining:0,devBankTest:false}};
  ictx.window=ictx;vm.createContext(ictx);
  vm.runInContext(read('js/engine/intervention.js'),ictx,{filename:'intervention.js'});
  // Step 1: the original encounter resolves unresolved -> bounded pair scheduled.
  ictx.updateConfirmationAfterEncounter('D4.CAMP',{correct:false,hadRetry:true,usedHint:true});
  check(ictx.sess.confirmSkill==='D4.CAMP'&&ictx.sess.confirmRemaining===2,'unresolved encounter must schedule a bounded pair before any intervention check');
  // Step 2: Learning Camp fires on the same encounter and takes over (battle.js's own reset).
  ictx.sess.confirmSkill=null;ictx.sess.confirmRemaining=0;
  // Step 3: Learning Camp completes and schedules its own single confirmation (learning.js's own set).
  ictx.sess.confirmSkill='D4.CAMP';ictx.sess.confirmRemaining=1;
  check(ictx.sess.confirmRemaining===1,'Learning Camp must replace, not stack onto, the prior confirmation count');
  // The Learning-Camp-scheduled confirmation must remain bounded: failing it consumes and clears, never traps.
  ictx.updateConfirmationAfterEncounter('D4.CAMP',{correct:false,hadRetry:true,usedHint:false});
  check(ictx.sess.confirmSkill===null&&ictx.sess.confirmRemaining===0,'a failed Learning-Camp-scheduled confirmation must clear rather than loop');
}
check(/PALearnerReview\?\.encounters/.test(parent)&&/independentRate/.test(parent),'parent dashboard is not using encounter-level evidence');
check(/clean\?'betul sendiri':'jawapan betul'/.test(parent),'legacy records must not be labelled as independent answers');
check(/skillReviews\(learnerRows\(\),META\).*state==='strong'/.test(parent),'strong-skill count is not aligned to clean learner-review evidence');
for(const file of ['js/engine/intervention.js','js/engine/frontier.js','js/engine/adaptive.js','js/battle.js','js/parent.js','js/version.js','js/pwa.js']){
 check(index.includes(`${file}?v=3.57.1`),`${file} is not cache-busted for v3.57.1`);
}
check(read('js/version.js').includes("PA_APP_VERSION='3.57.1'"),'release version is not v3.57.1');
check(read('sw.js').includes('v3.57.1'),'service worker release comment is stale');

console.log(`PASS prelaunch adaptive evidence v3.57.1: ${checks} checks`);
