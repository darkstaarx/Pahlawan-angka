const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/..';
const context={db:{coachMemory:{},masteryRewards:{}},sess:{responseHistory:[],interventionCooldown:{}},console};
vm.createContext(context);
vm.runInContext(fs.readFileSync(root+'/js/engine/intervention.js','utf8'),context);

function history(rows){context.sess.responseHistory=rows.map((x,i)=>({skill:'D2.1.4',ok:x.ok,tag:x.tag||'',sec:x.sec||4,hint:!!x.hint,t:i+1}));}

history([{ok:false,tag:'place'},{ok:false,tag:'place'}]);
let intervention=context.evaluateIntervention('D2.1.4');
assert.equal(intervention.type,'misconception');
let plan=context.coachStrategyPlan('D2.1.4',intervention.type,intervention.tag);
assert.equal(plan.need,'concept');
assert.equal(plan.strategy,'contrast');
assert.deepEqual(Array.from(plan.ladder),['contrast','model','micro']);

history([{ok:false,tag:'operation',sec:.7},{ok:false,tag:'operation',sec:.8},{ok:false,tag:'operation',sec:.6}]);
plan=context.coachStrategyPlan('D2.1.4','guessing','guessing');
assert.equal(plan.need,'impulsive');
assert.equal(plan.strategy,'micro');

context.sess.responseHistory=[{skill:'D2.1.5',ok:true,hint:true,sec:4},{skill:'D2.1.5',ok:true,hint:true,sec:4},{skill:'D2.1.5',ok:false,tag:'place',hint:true,sec:4},{skill:'D2.1.5',ok:true,sec:4},{skill:'D2.1.5',ok:false,tag:'digit_value',sec:4}];
plan=context.coachStrategyPlan('D2.1.5','hint_dependence','hint');
assert.equal(plan.need,'scaffold');
assert.equal(plan.strategy,'micro');

context.recordCoachStrategyResult('D2.1.4','contrast',true);
const profile=context.coachSkillProfile('D2.1.4');
assert.equal(profile.strategySuccess.contrast,1);
assert.equal(profile.lastStrategy,'contrast');

const learning=fs.readFileSync(root+'/js/learning.js','utf8');
assert(learning.includes("strategyLadder"),'learning state must retain a strategy ladder');
assert(learning.includes("Cikgu Wajar tukar strategi"),'failed checkpoint must switch strategy');
const fallback=learning.slice(learning.indexOf('function learningFallback()'),learning.indexOf('function activateRestuLock'));
assert(fallback.indexOf('recordCoachStrategyResult(id,learningState.strategy,false)')<fallback.indexOf('db.restuLearningFailures'),'strategy ladder must exhaust before Restu failure count');

console.log(JSON.stringify({status:'pass',checks:13,strategies:['model','contrast','micro'],persistentProfile:true,restuPreserved:true},null,2));
