const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/dev-experiments-v3.21.1.js','utf8');
let devOn=true;
const doc={
  documentElement:{dataset:{}},
  body:{dataset:{screen:'login'}},
  querySelector(){return null},
  querySelectorAll(){return[]},
  getElementById(){return null},
  createElement(){return{className:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},append(){},appendChild(){},querySelector(){return null},querySelectorAll(){return[]}}}
};
const db={devMode:true,devWorldResponse:false};
const sess={enemyTier:'boss',bossQuestionsAnswered:1,bossTypedUsed:0,coachAdaptive:false,devBankTest:false,guardianFocus:false,bossStretchCurrent:false};
const ctx={console,window:null,document:doc,db,sess,isDevMode:()=>devOn,setTimeout:()=>0,clearTimeout(){},save(){},GRAPH:{skills:[]}};
ctx.window=ctx;
vm.runInNewContext(code,ctx,{filename:'dev-experiments-v3.21.1.js'});
const api=ctx.PADevExperiments;
assert(api,'PADevExperiments missing');
assert.equal(api.version,'3.21.1');
assert.equal(api.typedEligible({answer:42}),true);
assert.equal(api.typedEligible({answer:'12.50'}),true);
assert.equal(api.typedEligible({answer:'RM12.50'}),true);
assert.equal(api.typedEligible({answer:'40%'}),true);
assert.equal(api.typedEligible({answer:'3/4'}),false,'fractions intentionally fall back to choices');
assert.equal(api.typedEligible({answer:'3:15'}),false,'time strings intentionally fall back to choices');
assert.equal(api.typedMatch({answer:42},'42'),true);
assert.equal(api.typedMatch({answer:'RM12.50'},'12.5'),true);
assert.equal(api.typedMatch({answer:'40%'},'40'),true);
assert.equal(api.shouldTypedQuestion({answer:42}),true,'first safe boss typed candidate should appear from Q2');
sess.bossTypedUsed=1;sess.lastTypedBossQuestion=2;sess.bossQuestionsAnswered=2;
assert.equal(api.shouldTypedQuestion({answer:42}),false,'second typed item must not be back-to-back at Q3');
sess.bossQuestionsAnswered=3;
assert.equal(api.shouldTypedQuestion({answer:42}),true,'second safe typed candidate can appear at Q4');
sess.bossTypedUsed=2;
assert.equal(api.shouldTypedQuestion({answer:42}),false,'hard maximum is two typed boss items');
sess.bossTypedUsed=0;sess.coachAdaptive=true;
assert.equal(api.shouldTypedQuestion({answer:42}),false,'Auto Coach boss remains multiple choice');
sess.coachAdaptive=false;sess.devBankTest=true;db.devForceTypedAnswer=true;
assert.equal(api.shouldTypedQuestion({answer:42}),true,'DEV force can preview safe typed mode');
assert.equal(api.shouldTypedQuestion({answer:'3/4'}),false,'DEV force still respects safe formats');
assert.equal(api.worldEnabled(),false);
db.devWorldResponse=true;assert.equal(api.worldEnabled(),true);
devOn=false;assert.equal(api.worldEnabled(),false,'World Response must remain DEV-gated');
console.log('PASS v3.21.1 runtime: DEV World gate + safe boss typed maximum 2');
