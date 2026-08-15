const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/..';
const context={console,Date,Math,setTimeout:()=>{},clearTimeout:()=>{}};
context.window=context;
context.PROGRESSION={regularMissionQuestions:10,missionQuestions:15,missionBoost:1};
context.gradeLabel=n=>`Darjah ${n}`;
context.log=()=>{};
vm.createContext(context);
for(const file of ['data/kssr/knowledge-graph.js','data/kssr/mastery-knowledge-v1.js','js/engine/intervention.js','js/engine/adaptive.js','js/engine/frontier.js']){
  vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),context,{filename:file});
}

function reset(grade=3){
  const skills={};
  for(const m of vm.runInContext('GRAPH.skills',context))skills[m.id]={mastery:m.grade===grade?18:0,confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0};
  context.db={schoolGrade:grade,skills,coreFrontier:1,focus:null,logs:[],coachMemory:{},masteryRewards:{}};
  context.sess={coachAdaptive:true,missionAnswered:0,recent:[],responseHistory:[],interventionCooldown:{},confirmSkill:null,confirmRemaining:0,recoveryFor:null};
}
function frontierResponse(id,ok,{sec=5,hint=false,representation='symbolic',demand='procedure',kind='q',formatShift=false}={}){
  context.recordFrontierResponse(id,ok,sec,hint,{representation,demand,kind,formatShift});
}

// Two independent items with the same misconception trigger concept repair.
reset();
context.recordCoachResponse('D3.PV10000',false,'place',5,false,'item-a');
context.recordCoachResponse('D3.PV10000',false,'place',6,false,'item-b');
let intervention=context.evaluateIntervention('D3.PV10000');
assert.equal(intervention.type,'misconception');
assert.equal(context.coachStrategyPlan('D3.PV10000',intervention.type,intervention.tag).strategy,'contrast');

// A retry of the same item is not two independent misconceptions.
reset();
context.recordCoachResponse('D3.PV10000',false,'place',5,false,'same-item');
context.recordCoachResponse('D3.PV10000',false,'place',6,true,'same-item');
assert.equal(context.evaluateIntervention('D3.PV10000'),null);

// Three hinted responses trigger scaffold-fading support.
reset();
for(let i=0;i<3;i++)context.recordCoachResponse('D3.N10000',true,'correct',6,true,'hint-'+i);
intervention=context.evaluateIntervention('D3.N10000');
assert.equal(intervention.type,'hint_dependence');
assert.equal(context.coachStrategyPlan('D3.N10000',intervention.type,intervention.tag).need,'scaffold');

// A wrong answer locks the next fresh question to the same skill for confirmation.
reset();
context.scheduleConfirmation('D3.N10000',1);
assert.equal(context.chooseModeAndSkill(),'D3.N10000');
assert.equal(context.sess.mode,'confirm');
context.consumeConfirmation('D3.N10000');
assert.equal(context.sess.confirmSkill,null);

// Repeated weak evidence opens prerequisite recovery rather than advancing.
reset();
context.sess.coach=context.ensureCoachSession();
context.sess.coach.currentSkill='D3.N10000';
for(let i=0;i<3;i++)frontierResponse('D3.N10000',false,{kind:'weak-'+i});
context.sess.confirmSkill=null;context.sess.confirmRemaining=0;
const recovery=context.chooseCoachFrontierSkill();
assert(vm.runInContext(`REC['D3.N10000'].includes('${recovery}')`,context));
assert.equal(context.sess.mode,'recover');

// Clean, unassisted, varied evidence secures a skill and advances.
reset();
context.sess.coach=context.ensureCoachSession();
context.sess.coach.currentSkill='D3.N10000';
frontierResponse('D3.N10000',true,{representation:'symbolic',demand:'procedure',kind:'direct'});
frontierResponse('D3.N10000',true,{representation:'visual',demand:'concept',kind:'model'});
frontierResponse('D3.N10000',true,{representation:'context',demand:'application',kind:'story'});
frontierResponse('D3.N10000',true,{representation:'symbolic',demand:'reasoning',kind:'missing'});
assert.equal(context.sess.coach.secure['D3.N10000'],true);
assert.notEqual(context.chooseCoachFrontierSkill(),'D3.N10000');

// Mere exposure to four domains must not end placement early.
reset();
context.sess.coach=context.ensureCoachSession();
for(const id of ['D3.N10000','D3.ADD10000','D3.FRAC','D3.MONEY']){
  frontierResponse(id,true,{kind:id+'-1'});frontierResponse(id,false,{kind:id+'-2'});
}
context.sess.missionAnswered=8;
assert.equal(context.coachCoveredDomains(),4);
assert.equal(context.coachResolvedDomains(),0);
assert.equal(context.shouldFinishAdaptiveCoach(),false);
context.sess.missionAnswered=15;
assert.equal(context.shouldFinishAdaptiveCoach(),true);

console.log(JSON.stringify({status:'pass',profiles:['consistent-misconception','same-item-retry','hint-dependent','confirmation','weak-recovery','strong-advance','unresolved-medium'],checks:19,earlyFinishRequiresResolvedDomains:true,maxQuestions:15},null,2));
