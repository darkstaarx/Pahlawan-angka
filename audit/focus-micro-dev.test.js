'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const engine=require('../js/engine/focus-micro-diagnosis-v1.js');
const f=require('../js/dev-focus-micro-fixtures-v1.js');
const report=key=>engine.evaluate({diagLog:f.automatic(key)});
test('All table 2-12 fixtures plus original edge-case scenarios use deterministic data',()=>{
 assert.equal(Object.keys(f.SCENARIOS).length,16);
 for(const k of Object.keys(f.SCENARIOS)){
  const rows=f.automatic(k);assert.equal(rows.length,f.SCENARIOS[k].items.length);
  assert(rows.every(x=>x.s==='D6.OPS'&&x.sec===8&&x.t>0));
 }
});

test('all table 2–12 scenarios generate the appropriate table candidate without special-case code',()=>{
 for(let n=2;n<=12;n++){
  const result=report('table'+n);
  assert.equal(result.findings.find(x=>x.id==='mul.table.'+n)?.status,'probe_candidate',
   'Expected candidate for sifir '+n);
 }
});

test('Sifir 8 scenario: repeated failures with controls generate probe candidate',()=>{
 const x=report('table8');
 assert(x.findings.some(t=>t.id==='mul.table.8'&&t.status==='probe_candidate'));
 assert.equal(x.writes,0);
});
test('One wrong 8x7 must abstain from labelling fact weakness',()=>{
 assert.equal(report('oneWrong').findings.length,0);
});
test('7x8 repeated on different days is a candidate only',()=>{
 const x=report('exactFact');
 assert(x.findings.some(t=>t.id==='mul.fact.7x8'&&t.status==='probe_candidate'));
});
test('Borrowing across zero with correct ordinary borrowing produces check candidate',()=>{
 assert(report('borrowZero').findings.some(t=>t.id==='sub.borrow.cross_zero'&&t.status==='probe_candidate'));
});
test('Remainder questions contrasted with exact division produce check candidate',()=>{
 assert(report('remainder').findings.some(t=>t.id==='div.remainder'&&t.status==='probe_candidate'));
});
test('Centimetre conversion is intentionally unsupported without authored unit tags',()=>{
 const x=report('units');
 assert.equal(x.findings.length,0);
 assert(x.deferredPatterns.includes('measurement.cm_to_m'));
});
test('Manual answer grading and partially completed session use fresh responses',()=>{
 const s=f.SCENARIOS.table8;
 assert.equal(f.answerOf(s.items[0]),48);
 assert.equal(f.answerOf({op:'div',a:340,b:100}),3.4);
 const rows=f.toLog('table8',[false,true,false,true]);
 assert.equal(rows.length,4);
 assert.equal(rows[0].k,0);
 assert.equal(rows[1].k,1);
 assert.equal(engine.evaluate({diagLog:rows}).writes,0);
 assert.throws(()=>f.toLog('table8',[true,null]),TypeError);
});
test('Fixtures and evaluator never mutate supplied response data',()=>{
 const source=[false,true,false,true,false,true];
 const before=JSON.stringify(source);
 f.toLog('table8',source);assert.equal(JSON.stringify(source),before);
 const records=f.automatic('table8');const saved=JSON.stringify(records);
 engine.evaluate({diagLog:records});assert.equal(JSON.stringify(records),saved);
});
test('DEV browser module compiles and is gated by original isDevMode',()=>{
 const src=fs.readFileSync(path.join(root,'js/dev-focus-micro-lab-v1.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(src));
 assert.match(src,/isDevMode/);
 assert.match(src,/devBankTest/);
 assert.match(src,/original\.apply\(this,args\)/);
 assert.doesNotMatch(src,/localStorage\.setItem|supabase\.from|fetch\(/);
});
test('Host registers modules exactly once, in evaluator -> fixtures -> UI order',()=>{
 const src=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const files=['js/engine/focus-micro-diagnosis-v1.js','js/dev-focus-micro-fixtures-v1.js','js/dev-focus-micro-lab-v1.js'];
 let cursor=-1;
 for(const file of files){
  assert.equal(src.split(file).length,2,file+' must appear once');
  const at=src.indexOf(file);assert(at>cursor,file+' script order');cursor=at;
 }
});
