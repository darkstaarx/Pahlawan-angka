const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
let checks=0;function check(value,message){assert(value,message);checks++}

const battle=read('js/battle.js'),parent=read('js/parent.js'),index=read('index.html');
check(/s\.correct\+\+;if\(!sess\.retryState\)s\.evidence\+\+/.test(battle),'a corrected retry must not add a second evidence unit');
check(/if\(!sess\.retryState\)\{s\.wrong\+\+;s\.evidence\+\+/.test(battle),'only the first wrong response may add negative evidence');
check(/if\(layerDelta>0&&!sess\.retryState&&!sess\.hint\)s\.probePass\+\+/.test(battle),'assisted or retried stretch items must not pass a probe');
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

check(/PALearnerReview\?\.encounters/.test(parent)&&/independentRate/.test(parent),'parent dashboard is not using encounter-level evidence');
check(/clean\?'betul sendiri':'jawapan betul'/.test(parent),'legacy records must not be labelled as independent answers');
check(/skillReviews\(learnerRows\(\),META\).*state==='strong'/.test(parent),'strong-skill count is not aligned to clean learner-review evidence');
for(const file of ['js/engine/intervention.js','js/engine/frontier.js','js/engine/adaptive.js','js/battle.js','js/parent.js','js/version.js','js/pwa.js']){
 check(index.includes(`${file}?v=3.57.1`),`${file} is not cache-busted for v3.57.1`);
}
check(read('js/version.js').includes("PA_APP_VERSION='3.57.1'"),'release version is not v3.57.1');
check(read('sw.js').includes('v3.57.1'),'service worker release comment is stale');

console.log(`PASS prelaunch adaptive evidence v3.57.1: ${checks} checks`);
