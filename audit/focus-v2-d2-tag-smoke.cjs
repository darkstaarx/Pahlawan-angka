#!/usr/bin/env node
'use strict';
// Phase B tagged D2 parity smoke: does not run or alter live Focus/mastery.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const math=Object.create(Math);
let seed=1981;
math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const ctx={console,Math:math,window:{PAQuestionBanks:{}}};
vm.createContext(ctx);
for(const p of ['questions/helpers.js','questions/d2/topic-2.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),ctx,{filename:p});
const tally={money:0,operations:0,variants:{}};
for(let i=0;i<250;i++){
 const money=vm.runInContext('moneyQ("D2.4.5",false,{mastery:'+((i%4)*25)+'})',ctx);
 const operation=ctx.window.PAQuestionBanks.d2t2('D2.2.4',{mastery:(i%4)*25},false);
 for(const [type,q,id] of [['money',money,'D2.4.5'],['operations',operation,'D2.2.4']]){
  assert(q&&q.answer!==undefined&&Array.isArray(q.wrong)&&q.wrong.length===3,'Malformed generated question');
  const t=q.focusDiagnosticV1;
  assert(t,'Missing foundation diagnostic tag '+id);
  assert.equal(t.originSkillId,id);
  assert.equal(t.arithmeticProfile.operationFamilies[0],'division');
  assert(t.probes.foundationIds.length>0);
  const o=t.arithmeticProfile.operands;
  assert(Number.isInteger(o.divisor)&&o.divisor>=2,'Bad divisor');
  if(o.unit==='sen')assert.equal(o.totalMinorUnits,o.divisor*o.quotientMinorUnits,'Money division arithmetic invariant');
  else assert.equal(o.dividend,o.divisor*o.quotient+(o.remainder||0),'Integer division invariant');
  assert.equal(t.tagOrigin,'authored');
  const k=t.evidence.questionFamilyKey;
  tally.variants[k]=(tally.variants[k]||0)+1;
  tally[type]++;
 }
}
assert(tally.variants['d2-money-equal-share']>=250);
assert(Object.keys(tally.variants).some(x=>x.includes('remainder')));
assert(Object.keys(tally.variants).some(x=>x.includes('basic-fact')));
console.log(JSON.stringify({status:'focus_v2_d2_tag_smoke_pass',generated:tally,scope:'branch D2 division source generator only, not full app runtime'},null,2));
