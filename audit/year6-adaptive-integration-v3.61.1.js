// Integration audit — D6 v3.61.1 persistent SP evidence and mastery gates.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const load=[
 'questions/kssr-content-integrity-v3.18.1.js',
 'questions/kssr-assessment-depth-v3.22.0.js',
 'questions/kssr-year6-space-data-v3.23.0.js',
 'questions/kssr-year6-curriculum-v3.60.3.js',
 'questions/kssr-year6-experience-v3.60.4.js',
 'questions/kssr-year6-money-real-v3.60.5.js',
 'data/kssr/year6-competencies-v2.js',
 'questions/kssr-year6-v2-runtime-v3.61.0.js',
 'questions/kssr-year6-v2-unit1-v3.61.0.js',
 'questions/kssr-year6-v2-unit2-v3.61.0.js',
 'questions/kssr-year6-v2-unit45-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-angle-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-circle-v3.61.0.js',
 'questions/kssr-year6-v2-unit6-space-v3.61.0.js',
 'questions/kssr-year6-v2-unit7-v3.61.0.js',
 'questions/kssr-year6-v2-unit8-v3.61.0.js',
 'questions/kssr-year6-curriculum-v2-v3.61.0.js',
 'questions/kssr-year6-adaptive-v3.61.1.js'
];
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)],N=(v,tag)=>({v,label:v,tag});
const tidyNumber=(v,d=2)=>Number(Number(v).toFixed(d)),moneyFmtUpper=v=>'RM'+Number(v).toFixed(2);
const Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>({prompt,answer,wrong:(wrong||[]).slice(0,3),hint,kind,diagnostic,formatShift});
const skills={};
const scoreState=id=>skills[id]||(skills[id]={mastery:80,confidence:80,evidence:12,correct:10,wrong:2,competencies:{}});
const sess={questionHistory:[],questionFingerprints:[]};
const ctx={console,Math,R,pick,N,Q,tidyNumber,moneyFmtUpper,scoreState,sess,document:{querySelector(){return null},documentElement:{dataset:{},setAttribute(){}}},
 barChart:()=>'',recordFrontierResponse(){},masteryEvidenceDecision(){return{secure:true,provisional:false,status:'secure',clean:true,reasons:[]}},
 powerLevel(){return 3},lessonSpecFor(id){return{title:id}},updateFrontier(){},canStretch(){return true},META:{},GRAPH:{skills:[],recovery_map:{},stretch_map:{}},
 PAQuestionBanks:{d6:id=>Q('legacy '+id,1,[N(2,'x'),N(3,'x'),N(4,'x')],'legacy','legacy')}};
ctx.window=ctx;vm.createContext(ctx);
for(const file of load)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});

assert.equal(ctx.PAY6Adaptive.version,'3.61.1');
assert.equal(ctx.PAContentIntegrity.year6CompetencyVersion,'3.61.1');
let recorded=0;
for(const id of ctx.PAY6CompetencyV2.activeSkills){
 const route=ctx.PAY6CompetencyV2.routes[id],bucket=scoreState(id).competencies;
 assert.equal(ctx.PAContentIntegrity.requirementStatus(id,bucket).ok,false,id+' began falsely secure');
 for(let i=0;i<route.length;i++){
   const node=route[i];ctx.recordFrontierResponse(id,true,3,false,{competencyId:node});recorded++;
   assert.equal(bucket[node].clean,1,id+'/'+node+' clean evidence not persisted');
   assert.equal(ctx.PAContentIntegrity.requirementStatus(id,bucket).ok,i===route.length-1,id+' gate changed at wrong node');
 }
}

const retryState=scoreState('D6.NUMBERS'),retryNode='1.1.1';
retryState.competencies[retryNode]={attempts:0,correct:0,clean:0};
sess.retryState={wrongTag:'place'};
ctx.recordFrontierResponse('D6.NUMBERS',true,5,false,{competencyId:retryNode});
assert.equal(retryState.competencies[retryNode].correct,1,'correct retry was not recorded');
assert.equal(retryState.competencies[retryNode].clean,0,'correct retry incorrectly unlocked clean proof');
sess.retryState=null;
ctx.recordFrontierResponse('D6.NUMBERS',true,5,false,{competencyId:retryNode});
assert.equal(retryState.competencies[retryNode].clean,1,'independent correct answer did not unlock clean proof');

const root=path.join(__dirname,'..');
const pwa=fs.readFileSync(path.join(root,'js/pwa.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const version=fs.readFileSync(path.join(root,'js/version.js'),'utf8');
assert(/Y6_ADAPTIVE_VERSION='3\.61\.1'/.test(pwa),'adaptive loader version missing');
assert(/loadY6V2Final=.*loadY6Adaptive/.test(pwa),'dynamic finalizer -> adaptive load order missing');
const parserFinal=pwa.indexOf('if(!document.querySelector(`script[src^="questions/kssr-year6-curriculum-v2-v');
const parserAdaptive=pwa.indexOf('if(!document.querySelector(`script[src^="questions/kssr-year6-adaptive-v');
assert(parserFinal>=0&&parserAdaptive>parserFinal,'parser-time adaptive script loaded before finalizer');
assert(/year6Adaptive:Y6_ADAPTIVE_VERSION/.test(pwa),'release metadata missing');
assert(sw.includes("'./questions/kssr-year6-adaptive-v3.61.1.js'"),'adaptive file absent from offline shell');
assert(/PA_APP_VERSION='3\.62\.7'/.test(version),'release version stale');
assert(/js\/version\.js\?v=3\.62\.7/.test(html)&&/js\/pwa\.js\?v=3\.62\.7/.test(html),'HTML cache bust stale');

console.log(JSON.stringify({status:'PASS',version:ctx.PAY6Adaptive.version,skills:ctx.PAY6CompetencyV2.activeSkills.length,uniqueStandards:ctx.PAY6CompetencyV2.uniqueStandardCount,recorded,gates:'all curriculum routes require clean SP evidence',loaderAndOfflineShell:'PASS'},null,2));
