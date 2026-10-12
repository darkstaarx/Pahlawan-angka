#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const generators={},renderers={},ctx={console,registerGenerator:(k,f)=>generators[k]=f,registerRenderer:(k,f)=>renderers[k]=f};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['questions/v2/generators/d3/full-kssr.js','questions/v2/renderers/d3/full-kssr.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const gen=generators['d3.fullKssr'],render=renderers.d3full;
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function cents(v){return Math.round(Number(String(v).replace(/^RM/,''))*100);}
const modes=['money_add','money_subtract','money_compare','money_mixed_change','money_mixed_budget','money_mixed_error','money_multiply','money_divide','money_unit_price'];
let count=0,small=0,large=0,transactionValues=0,ledgerValues=0;
for(const mode of modes)for(const difficultyBand of [1,2,3])for(let i=0;i<100;i++){
  const q=gen({mode,difficultyBand},rng(9000+count++));assert(q&&q.value&&q.value.answer&&q.distractors.length===3,mode);
  const answer=Number(q.value.answer.id);if(Number.isFinite(answer)){assert(Number.isInteger(answer)&&answer>=0&&answer<=1000000,mode+' answer range');}
  const labels=[q.value.answer].concat(q.distractors).map(x=>x.labelMs);assert.equal(new Set(labels).size,4,mode+' duplicate choices');
  for(const d of q.distractors){const n=Number(d.id);if(Number.isFinite(n)&&Number.isFinite(answer)){assert.notEqual(Math.abs(n-answer),1,mode+' arbitrary one-sen distractor');assert(Number.isInteger(n));}}
  const v=q.value.visual||{},html=render(q.value,{});if(mode!=='money_mixed_error')assert(html.length>20,mode+' visual');
  if(mode==='money_add')assert(!html.includes('Jumlah harga'),'addition answer is not exposed in price visual');
  if(mode==='money_mixed_change')assert(!html.includes('Jumlah harga')&&!html.includes(moneyLabel(q.meta.semanticProperties.costCents)),'change answer is not exposed in purchase visual');
  if(mode==='money_compare'){
    assert.equal((html.match(/<table/g)||[]).length,2,'comparison visual uses one table per receipt');
    assert.equal((html.match(/white-space:nowrap/g)||[]).length,12,'receipt labels and values must not split');
    assert(html.includes('Item 1')&&html.includes('Item 2')&&html.includes('Item 3'),'receipt rows have clear labels');
  }
  if(mode==='money_multiply')assert.equal(v.amounts.length,v.quantity,'multiplication units match');
  if(mode==='money_subtract'||mode==='money_mixed_budget'){assert(!/[+−]/.test(html),mode+' visual exposes operation signs');ledgerValues++;}
  if(mode==='money_add'||mode==='money_compare'||mode==='money_mixed_change'||mode==='money_multiply'){
    (v.amounts||[]).concat(v.a||[],v.b||[]).forEach(x=>assert.equal(cents(x)%5,0,mode+' transaction not 5 sen'));transactionValues++;
  }
  if(difficultyBand===1)small++;if(difficultyBand===3)large++;
}
for(const mode of modes)for(const difficultyBand of [1,2,3])for(const edge of [0,0.999999999]){
  const q=gen({mode,difficultyBand},()=>edge);assert(q&&q.value&&q.value.answer&&q.distractors.length===3,mode+' endpoint RNG');
}
assert(small>0&&large>0,'small/large bands covered');
console.log(JSON.stringify({status:'pass',samples:count,small,large,transactionValues,ledgerValues}));

function moneyLabel(c){return 'RM'+(Number(c)/100).toFixed(2);}
