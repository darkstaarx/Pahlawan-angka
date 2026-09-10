'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
global.window=global;global.matchMedia=()=>({matches:false});
global.document={querySelectorAll:()=>[],getElementById:()=>null,body:{classList:{add(){},remove(){}}}};
global.db={skills:{'D3.SUB10000':{mastery:82,confidence:74,evidence:8,correct:7}}};
global.sess={hp:5,ehp:5,retryState:null,hint:false,hintLevel:0,dimension:null};
global.save=()=>{};let resumes=0,cancels=0;global.nextQ=()=>{resumes++};global.PABattlePresentation={cancel:()=>{cancels++},generation:()=>9};
for(const f of ['js/engine/dimensional-memory.js','js/engine/representations/place-value.js','js/engine/dimensional-catalog.js','js/engine/dimensional-view.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
let passed=0;function ok(cond,name){if(!cond)throw new Error(`FAIL: ${name}`);passed++;console.log(`PASS ${passed}: ${name}`)}

const C=global.PADimensionalCatalog,M=global.PADimensionalMemory,P=global.PAPlaceValueEngine,V=global.PADimensionalView;
let d=C.diagnoseRegrouping({wrongEvidenceCount:1,distinctWrongItems:1,samePatternCount:1,history:{mastery:82,confidence:74,evidence:8,correct:7}});
ok(d.failureType==='CARELESS_RECHECK'&&d.confidence<.8,'strong prior + isolated wrong routes to minimal recheck');

d=C.diagnoseRegrouping({wrongEvidenceCount:2,distinctWrongItems:2,samePatternCount:2,prerequisitePassed:false,history:{}});
ok(d.failureType==='PREREQUISITE_INSECURE','failed discriminator routes prerequisite before regrouping');

d=C.diagnoseRegrouping({wrongEvidenceCount:2,distinctWrongItems:2,samePatternCount:2,prerequisitePassed:true,history:{}});
ok(d.failureType==='REGROUPING_MISCONCEPTION','passed prerequisite + repeated pattern routes regrouping concept');

ok(V.policy({stage:'CUBA',strategy:'BASE_TEN_EXCHANGE',event:'CHECK_FAIL'})==='FAHAM','base-ten understanding failure returns to FAHAM for another dimension');

const beforeMastery=JSON.stringify(global.db.skills['D3.SUB10000']);M.recordGuidedOutcome('D3.SUB10000','PASS','FULL_SUPPORT');M.recordUnderstandingCheck('D3.SUB10000','PASS',{strategyId:'BASE_TEN_EXCHANGE',representationId:'R2_PLACE_VALUE'});M.recordIndependentTransfer('D3.SUB10000','FAIL',{strategyId:'BASE_TEN_EXCHANGE',representationId:'R2_PLACE_VALUE'});
ok(JSON.stringify(global.db.skills['D3.SUB10000'])===beforeMastery&&!M.snapshot('D3.SUB10000').preferredEffectiveRepresentations.includes('R2_PLACE_VALUE'),'guided/check success plus transfer fail does not mutate mastery or create preferred representation');

M.recordIndependentTransfer('D3.SUB10000','PASS',{strategyId:'BASE_TEN_EXCHANGE',representationId:'R2_PLACE_VALUE'});
ok(M.snapshot('D3.SUB10000').preferredEffectiveRepresentations[0]==='R2_PLACE_VALUE','independent KSSR transfer success records effective representation');

const ordered=C.orderStrategies({preferredEffectiveRepresentations:['R7_DECOMPOSITION'],failedStrategies:{}});
ok(ordered[0].representationId==='R7_DECOMPOSITION'&&ordered.some(x=>x.representationId==='R2_PLACE_VALUE'),'prior effective representation influences ordering without hard-lock');

d=C.diagnoseRegrouping({wrongEvidenceCount:1,distinctWrongItems:1,samePatternCount:1,history:{mastery:20,confidence:20,evidence:1,correct:0}});
ok(d.failureType==='UNKNOWN'&&d.misconceptionId===null,'one random wrong does not assert a misconception');

const ex=P.exchangeBaseTen(P.stateFromNumber(52),'TENS','ONES',{expectedValue:52});
ok(ex.ok&&ex.event==='TEN_EXCHANGED'&&P.placeValueValue(ex.state)===52&&ex.state.TENS===4&&ex.state.ONES===12,'base-ten exchange emits semantic event and preserves value invariant');

const dec=P.decompositionScenario(73,28);
ok(dec.ok&&dec.event==='DECOMPOSITION_SELECTED'&&dec.invariant&&dec.result===45,'decomposition is a distinct representation with the same subtraction invariant');

global.sess.dimension=V._test.freshDimension();global.sess.dimension.active=true;global.sess.dimension.outcome='SUCCESS';global.sess.dimension.originalQuestionToken='q-old';
const first=V.continueBattle(),second=V.continueBattle();
ok(first===true&&second===false&&resumes===1&&cancels===1,'battle resume is idempotent and creates exactly one next question');

console.log(`\n${passed}/11 focused Phase 2 checks passed.`);
