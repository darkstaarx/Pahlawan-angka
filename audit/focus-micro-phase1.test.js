'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../js/engine/focus-micro-diagnosis-v1.js');
const DAY=86400000;
const T=Date.UTC(2026,9,22);
const row=(o,a,b,k,t,opts={})=>({o,a:[a,b],k,t,s:'D5.OPS',sec:8,w:3,f:'symbolic',c:'plain',...opts});
const matched=(report,id)=>report.findings.find(x=>x.id===id);
const controls=[
 row('mul',5,6,1,T+1),
 row('mul',3,9,1,T+2),
 row('mul',5,9,1,T+3)
];
test('catalog lists all tables 2–12, cross-topic features and deferred tags',()=>{
 assert.equal(engine.CATALOG.length,22);
 assert.equal(new Set(engine.CATALOG.map(x=>x.id)).size,22);
 assert.equal(engine.CATALOG.filter(x=>x.status==='diaglog').length,18);
 assert.equal(engine.CATALOG.filter(x=>x.status==='needs_authored_item_tags').length,4);
 assert.deepEqual(engine.CATALOG.filter(x=>x.id.startsWith('mul.table.')).map(x=>x.id),
  Array.from({length:11},(_,i)=>'mul.table.'+(i+2)));
 assert.deepEqual(Object.keys(engine.FACT_FAMILIES).sort(),['add','div','mul','sub']);
});
test('single wrong answer never produces an exact-fact candidate',()=>{
 const x=engine.evaluate({diagLog:[row('mul',8,7,0,T),...controls]});
 assert.equal(matched(x,'mul.fact.7x8'),undefined);
});
test('3 distinct table-8 failures with other multiplication contrast generate a probe candidate',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,6,0,T+4),row('mul',8,7,0,T+5),row('mul',8,8,0,T+6),...controls
 ]});
 assert.equal(matched(x,'mul.table.8').status,'probe_candidate');
 assert.equal(matched(x,'mul.table.7'),undefined);
 assert.equal(x.writes,0);
});
test('7x8 and 8x7 are the same exact fact, repeated on separate days',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,7,0,T),row('mul',7,8,0,T+DAY),...controls
 ]});
 assert.equal(matched(x,'mul.fact.7x8').status,'probe_candidate');
 assert.equal(matched(x,'mul.fact.7x8').evidence.distinctFailedEquations,1);
});
test('repeated identical fact on one day with same format needs more evidence',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,7,0,T),row('mul',7,8,0,T+1000),...controls
 ]});
 assert.equal(matched(x,'mul.fact.7x8').status,'needs_more_evidence');
});
test('two subsequent independent exact-fact successes retire a previous signal',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,7,0,T),row('mul',7,8,0,T+DAY),
  row('mul',7,8,1,T+DAY*2),row('mul',8,7,1,T+DAY*3),...controls
 ]});
 assert.equal(matched(x,'mul.fact.7x8'),undefined);
});
test('one retry token is one exposure, not two pieces of evidence',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,7,0,T,{id:'question-token'}),
  row('mul',8,7,0,T,{id:'question-token'}),...controls
 ]});
 assert.equal(matched(x,'mul.fact.7x8'),undefined);
 assert.equal(x.evidence.usableRows,4);
});
test('guided, rapid and demo attempts are excluded',()=>{
 const source=[
  row('mul',8,7,0,T,{g:1}),
  row('mul',8,7,0,T+DAY,{sec:0.4}),
  row('mul',8,7,0,T+DAY*2,{mode:'demo'})
 ];
 const x=engine.evaluate({diagLog:source});
 assert.equal(x.evidence.usableRows,0);
 assert.equal(x.state,'insufficient_evidence');
});
test('an older-grade pupil is not assumed to have mastered early facts',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',8,7,0,T,{s:'D6.OPS'}),
  row('mul',7,8,0,T+DAY,{s:'D6.OPS'}),...controls
 ]});
 assert.equal(matched(x,'mul.fact.7x8').status,'probe_candidate');
});
test('zero-crossing borrowing is distinguishable from ordinary borrowing',()=>{
 const x=engine.evaluate({diagLog:[
  row('sub',402,175,0,T),row('sub',300,127,0,T+1),
  row('sub',52,18,1,T+2),row('sub',73,29,1,T+3)
 ]});
 assert.equal(matched(x,'sub.borrow.cross_zero').status,'probe_candidate');
 assert.equal(engine._test.columnsBorrow(1000,1).crossZero,true);
 assert.equal(engine._test.columnsBorrow(52,18).crossZero,false);
});
test('carry in ones is identified by actual operands rather than chapter title',()=>{
 const x=engine.evaluate({diagLog:[
  row('add',48,37,0,T),row('add',56,27,0,T+1),
  row('add',34,22,1,T+2),row('add',12,35,1,T+3)
 ]});
 assert.equal(matched(x,'add.carry.ones').status,'probe_candidate');
});
test('remainder contrast does not infer that all division is weak',()=>{
 const x=engine.evaluate({diagLog:[
  row('div',25,4,0,T),row('div',29,4,0,T+1),
  row('div',24,4,1,T+2),row('div',32,4,1,T+3)
 ]});
 assert.equal(matched(x,'div.remainder').status,'probe_candidate');
 assert.equal(matched(x,'div.fact.56by8'),undefined);
});
test('cm to m and decimals abstain without authored per-item evidence',()=>{
 const x=engine.evaluate({diagLog:[
  row('div',150,100,0,T),
  row('div',350,100,0,T+1)
 ]});
 assert(!matched(x,'measurement.cm_to_m'));
 assert(!matched(x,'decimal.column_alignment'));
 assert(x.deferredPatterns.includes('measurement.cm_to_m'));
});
test('bad operands, missing grade and out-of-range grade are ignored',()=>{
 const bad=[
  row('mul',8,7,0,T,{s:'D7.OPS'}),
  row('div',14,0,0,T+1),
  row('mul',8,-7,0,T+2),
  row('mul',8,7,0,T+3,{s:''})
 ];
 assert.equal(engine.evaluate({diagLog:bad}).evidence.usableRows,0);
});
test('shadow engine is pure and never routes, changes rewards or alters profile',()=>{
 const profile={schoolGrade:6,diagLog:[
  row('mul',8,7,0,T),row('mul',8,7,0,T+DAY),...controls
 ],mastery:{'D6.OPS':0.8},rewards:{aura:30}};
 const original=JSON.stringify(profile);
 const result=engine.evaluate(profile);
 assert.equal(JSON.stringify(profile),original);
 assert.equal(result.mode,'shadow_read_only');
 assert.equal(result.writes,0);
 assert.equal(result.note.includes('routing'),true);
});

test('table 2 and table 12 are detected with same generic logic',()=>{
 for(const n of [2,12]){
  const x=engine.evaluate({diagLog:[
   row('mul',n,4,0,T),row('mul',n,7,0,T+100),
   row('mul',3,5,1,T+200),row('mul',6,9,1,T+300)
  ]},{maxFindings:50});
  assert.equal(matched(x,'mul.table.'+n).status,'probe_candidate');
 }
});
test('one rule generates exact fact candidates for any multiplication fact, not 7x8 only',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',4,9,0,T),row('mul',9,4,0,T+DAY),
  row('mul',5,6,1,T+DAY*2),row('mul',3,8,1,T+DAY*3)
 ]},{maxFindings:50});
 assert.equal(matched(x,'mul.fact.4x9').status,'probe_candidate');
 assert.equal(engine._test.exactFact({op:'mul',a:1,b:8}).id,'mul.fact.1x8');
 assert.equal(engine._test.exactFact({op:'mul',a:14,b:8}),null);
});
test('any valid exact division fact can be retested, rather than only 56/8',()=>{
 const x=engine.evaluate({diagLog:[
  row('div',48,6,0,T),row('div',48,6,0,T+DAY),
  row('div',36,6,1,T+DAY*2),row('div',24,6,1,T+DAY*3)
 ]});
 assert.equal(matched(x,'div.fact.48by6').status,'probe_candidate');
 assert.equal(engine._test.exactFact({op:'div',a:8,b:8}).id,'div.fact.8by8');
 assert.equal(engine._test.exactFact({op:'div',a:100,b:25}),null);
});
test('addition and subtraction candidates are created from operands, not enumerated facts',()=>{
 const add=engine.evaluate({diagLog:[
  row('add',4,9,0,T),row('add',9,4,0,T+DAY),
  row('add',2,7,1,T+DAY*2),row('add',5,6,1,T+DAY*3)
 ]});
 const sub=engine.evaluate({diagLog:[
  row('sub',13,6,0,T),row('sub',13,6,0,T+DAY),
  row('sub',15,7,1,T+DAY*2),row('sub',17,9,1,T+DAY*3)
 ]});
 assert.equal(matched(add,'add.fact.4plus9').status,'probe_candidate');
 assert.equal(matched(sub,'sub.fact.13minus6').status,'probe_candidate');
});
test('two wrong answers in separate contexts are not merged into exact plain fact evidence',()=>{
 const x=engine.evaluate({diagLog:[
  row('div',48,6,0,T,{c:'money'}),row('div',48,6,0,T+DAY,{c:'measurement'}),
  row('div',36,6,1,T+2*DAY),row('div',24,6,1,T+3*DAY)
 ]});
 assert.equal(matched(x,'div.fact.48by6'),undefined);
});
test('a single wrong factor or unusually fast response cannot create a 2-to-12 table candidate',()=>{
 const x=engine.evaluate({diagLog:[
  row('mul',12,7,0,T),row('mul',12,9,0,T+100,{sec:.2}),
  row('mul',3,6,1,T+200),row('mul',4,5,1,T+300)
 ]},{maxFindings:50});
 assert.equal(matched(x,'mul.table.12'),undefined);
});
