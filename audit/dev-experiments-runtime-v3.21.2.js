const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/dev-experiments-v3.21.2.js','utf8');
let devOn=true,saves=0;
const html={dataset:{},removeAttribute(name){delete this[name];}};
const doc={
  documentElement:html,body:{dataset:{screen:'login'}},
  querySelector(){return null},querySelectorAll(){return[]},getElementById(){return null},
  createElement(){return{className:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},append(){},appendChild(){},querySelector(){return null},querySelectorAll(){return[]}}}
};
const db={devMode:true,worldResponse:{version:1},devWorldResponse:true,devWorldPreviewStage:3,devWorldPreviewChapter:'1'};
const sess={enemyTier:'boss',bossQuestionsAnswered:1,bossTypedUsed:0,coachAdaptive:false,devBankTest:false,guardianFocus:false,bossStretchCurrent:false};
const ctx={console,window:null,document:doc,db,sess,isDevMode:()=>devOn,setTimeout:()=>0,clearTimeout(){},save(){saves++}};ctx.window=ctx;
vm.runInNewContext(code,ctx,{filename:'dev-experiments-v3.21.2.js'});
const api=ctx.PADevExperiments;assert(api,'PADevExperiments missing');assert.equal(api.version,'3.21.2');
for(const key of ['worldResponse','devWorldResponse','devWorldPreviewStage','devWorldPreviewChapter'])assert.equal(Object.prototype.hasOwnProperty.call(db,key),false,`${key} not purged`);
assert(saves>=1,'retired world-state cleanup should persist once');
assert.equal(api.typedEligible({answer:42}),true);assert.equal(api.typedEligible({answer:'12.50'}),true);assert.equal(api.typedEligible({answer:'RM12.50'}),true);assert.equal(api.typedEligible({answer:'40%'}),true);
assert.equal(api.typedEligible({answer:'3/4'}),false);assert.equal(api.typedEligible({answer:'3:15'}),false);
assert.equal(api.typedMatch({answer:42},'42'),true);assert.equal(api.typedMatch({answer:'RM12.50'},'12.5'),true);assert.equal(api.typedMatch({answer:'40%'},'40'),true);
assert.equal(api.shouldTypedQuestion({answer:42}),true,'first safe boss typed candidate should appear from Q2');
sess.bossTypedUsed=1;sess.lastTypedBossQuestion=2;sess.bossQuestionsAnswered=2;assert.equal(api.shouldTypedQuestion({answer:42}),false,'second typed cannot be consecutive');
sess.bossQuestionsAnswered=3;assert.equal(api.shouldTypedQuestion({answer:42}),true,'second safe typed can appear at Q4');
sess.bossTypedUsed=2;assert.equal(api.shouldTypedQuestion({answer:42}),false,'hard max two');
sess.bossTypedUsed=0;sess.coachAdaptive=true;assert.equal(api.shouldTypedQuestion({answer:42}),false,'Auto Coach excluded');
sess.coachAdaptive=false;sess.devBankTest=true;db.devForceTypedAnswer=true;assert.equal(api.shouldTypedQuestion({answer:42}),true,'DEV force typed should work');assert.equal(api.shouldTypedQuestion({answer:'3/4'}),false,'DEV force still respects safe formats');
console.log('PASS v3.21.2 runtime: retired World state purged + safe boss typed maximum 2');
