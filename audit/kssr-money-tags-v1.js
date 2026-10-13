#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let seed=17391;const math=Object.create(Math);math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const ctx={Math:math,console,window:{PAQuestionBanks:{}},sess:{questionHistory:[]}};vm.createContext(ctx);
for(const file of ['questions/helpers.js','questions/kssr-content-v3.11.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const expected={
 'D3.MONEY':new Set(['d3-money-total','d3-money-change','d3-money-unit_price','d3-money-budget']),
 'D4.MONEY':new Set(['d4-money-total','d4-money-change','d4-money-unit_price','d4-money-budget']),
 'D5.MONEY':new Set(['d5-money-total','d5-money-change','d5-money-unit_price','d5-money-budget']),
 'D6.MONEY':new Set(['d6-money-total','d6-money-change','d6-money-unit_price','d6-money-budget'])
};
for(const [skill,variants] of Object.entries(expected)){
 const seen=new Set();
 for(let i=0;i<160;i++){
  const q=ctx.window.PAQuestionBanks.d3(skill,{},false); // wrapper routes all D3+ skills through moneyTask
  assert.equal(q?.skill,undefined); // preserve legacy question shape; no skill mutation
  const tag=q?.focusDiagnosticV1;
  if(skill==='D1.MONEY'&&!tag)continue;
  assert(tag&&tag.tagOrigin==='authored',`${skill} item is untagged`);
  assert.equal(tag.originSkillId,skill);assert.equal(tag.contextDomain,'money');assert.equal(tag.diagnosticFamily,'money');
  assert(tag.arithmeticProfile?.operationFamilies?.length,'missing operation family');
  const o=tag.arithmeticProfile.operands;assert.equal(o.unit,'RM');
  if(tag.taskRole==='money_total')assert(Array.isArray(o.addends)&&o.addends.length===2,'total operands must retain two prices');
  if(tag.taskRole==='money_change')assert(Number.isFinite(o.paid)&&Number.isFinite(o.cost)&&Number.isFinite(o.change),'change operands must retain paid/cost/change');
  if(tag.taskRole==='money_unit_price')assert(Number.isFinite(o.unitPrice)&&Number.isFinite(o.quantity)&&Number.isFinite(o.total),'unit-price operands must retain price/quantity/total');
  if(tag.taskRole==='money_budget')assert(Number.isFinite(o.budget)&&Number.isFinite(o.spent)&&Number.isFinite(o.remaining),'budget operands must retain budget/spent/remaining');
  assert(tag.evidence?.variantFingerprint,'missing variant fingerprint');seen.add(tag.evidence.questionFamilyKey);
  ctx.sess.questionHistory.push({skillId:skill,archetypeId:q.archetypeId});
 }
 if(skill!=='D1.MONEY')assert.deepEqual(seen,variants,`${skill} mode coverage mismatch`);
}
 let combined=0;for(let i=0;i<120;i++){const q=ctx.window.PAQuestionBanks.d1('D1.MONEY',{},false);if(q?.focusDiagnosticV1){combined++;const t=q.focusDiagnosticV1;assert.equal(t.evidence.questionFamilyKey,'d1-money-combine');assert.deepEqual(Array.from(t.arithmeticProfile.operationFamilies),['addition']);assert.equal(t.contextDomain,'money');}}
assert(combined>0,'D1 combine did not appear');
for(const [skill,family,operation] of [['D2.4.2','addition','addition'],['D2.4.3','subtraction','subtraction'],['D2.4.4','multiplication','multiplication']]){
 let tagged=0;
 for(let i=0;i<120;i++){
  const q=ctx.window.PAQuestionBanks.d2t4(skill,{},false),t=q?.focusDiagnosticV1;
  assert(t&&t.tagOrigin==='authored',`${skill} must be tagged`);tagged++;
  assert.equal(t.originSkillId,skill);assert.equal(t.contextDomain,'money');assert.equal(t.diagnosticFamily,family);assert.deepEqual(Array.from(t.arithmeticProfile.operationFamilies),[operation]);
  assert(t.arithmeticProfile.operands&&Object.keys(t.arithmeticProfile.operands).length>1,'real money operands missing');assert(t.evidence?.variantFingerprint,'missing D2 fingerprint');
 }
 assert.equal(tagged,120);
}
let savingTagged=0,nonArithmeticUntagged=0;
for(let i=0;i<120;i++){
 const q=ctx.window.PAQuestionBanks.d2t4('D2.4.6',{},false),t=q?.focusDiagnosticV1;
 if(t){savingTagged++;assert.equal(t.diagnosticFamily,'subtraction');const o=t.arithmeticProfile.operands;assert(o.minuend>o.subtrahend&&o.minuend-o.subtrahend===Math.round(Number(String(q.answer).replace(/[^0-9.]/g,''))*100),'saving contrast operands must match answer');}
 else{nonArithmeticUntagged++;assert(String(q.archetypeId).includes('compare'),'only the non-arithmetic savings comparison may stay untagged');}
}
assert(savingTagged>0&&nonArithmeticUntagged>0,'savings and target arithmetic should be tagged while compare remains untagged');
 console.log('PASS kssr-money-tags-v1: D1 combine, D2.4.2/.3/.4/.6 arithmetic tags, D3-D6 moneyTask tags preserve outputs and exact operands; non-arithmetic compare abstains');
