#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

function buildCtx(){
  const ctx={console, Math, Date, Set, Array, Object, String, Number, JSON, RegExp};
  ctx.window=ctx; ctx.globalThis=ctx; ctx.sess={questionFingerprints:[],questionHistory:[],mode:'practice'};
  vm.createContext(ctx);
  function load(rel){vm.runInContext(fs.readFileSync(path.join(repo,rel),'utf8'),ctx,{filename:rel});}
  // Exact real production <script> order for everything that can affect
  // question-bank metadata, per index.html. Deliberately NOT simplified --
  // a prior version of this harness omitted kssr-archetypes-v3.9.0.js and
  // masked a real production-load-order metadata bug.
  load('data/kssr/knowledge-graph.js');
  load('data/kssr/mastery-knowledge-v1.js');
  load('data/kssr/alignment-v3.9.0.js');
  load('questions/helpers.js');
  load('questions/d1/core.js');
  for(let i=1;i<=8;i++)load(`questions/d2/topic-${i}.js`);
  load('questions/d3/core.js');
  load('questions/d4/core.js');
  load('questions/d5/core.js');
  load('questions/d6/core.js');
  load('questions/kssr-archetypes-v3.9.0.js');
  load('questions/kssr-content-v3.11.js');
  load('questions/index.js');
  return ctx;
}

function sample(ctx,id,n,mastery){
  const out=[];
  for(let i=0;i<n;i++){
    const q=ctx.generate(id,{mastery:mastery==null?50:mastery,evidence:5,confidence:60,correct:4,wrong:1});
    ok(q&&typeof q.prompt==='string'&&q.prompt.length>0,`${id}: sample has a prompt`);
    ok(q.answer!==undefined&&q.answer!==null,`${id}: sample has an answer`);
    ok(Array.isArray(q.wrong)&&q.wrong.length===3,`${id}: sample has exactly 3 wrong choices`);
    const choices=[q.answer,...q.wrong.map(w=>w.v)].map(x=>String(x).trim().toLowerCase());
    eq(new Set(choices).size,4,`${id}: 4 semantically unique choices`);
    ok(typeof q.archetypeId==='string'&&q.archetypeId.length>0,`${id}: has archetypeId`);
    ok(typeof q.representation==='string'&&q.representation.length>0,`${id}: has representation`);
    ok(typeof q.demand==='string'&&q.demand.length>0,`${id}: has demand`);
    ok(typeof q.difficultyBand==='number'&&q.difficultyBand>0,`${id}: has positive difficultyBand`);
    ok(Array.isArray(q.misconceptionTargets)&&q.misconceptionTargets.length>0,`${id}: has misconceptionTargets`);
    out.push(q);
  }
  return out;
}

// =======================================================================
// 1. D2.4.1-4.7 are no longer content-indistinguishable.
// =======================================================================
{
  const ctx=buildCtx();
  const archByskill={};
  for(const id of ['D2.4.1','D2.4.2','D2.4.3','D2.4.4','D2.4.5','D2.4.6','D2.4.7']){
    archByskill[id]=new Set(sample(ctx,id,120).map(q=>q.archetypeId));
  }
  const allSets=Object.values(archByskill).map(s=>[...s].sort().join(','));
  eq(new Set(allSets).size,7,'all 7 D2.4.x skills produce mutually distinct archetype sets');
  for(const [id,set] of Object.entries(archByskill)){
    ok([...set].every(a=>a.startsWith('money_')),`${id}: archetype is explicitly money-namespaced`);
  }
  ok(archByskill['D2.4.1'].size===3&&['money_recognise_value','money_recognise_total','money_recognise_compare'].every(a=>archByskill['D2.4.1'].has(a)),'D2.4.1 exposes all 3 genuine internal sub-modes (value/total/compare), matching moneyQ\'s authored mode pool');
  ok([...archByskill['D2.4.2']].every(a=>a==='money_add'),'D2.4.2 is tagged as addition');
  ok([...archByskill['D2.4.3']].every(a=>a==='money_subtract'),'D2.4.3 is tagged as subtraction');
  ok([...archByskill['D2.4.4']].every(a=>a==='money_multiply'),'D2.4.4 is tagged as multiplication');
  ok([...archByskill['D2.4.5']].every(a=>a==='money_divide'),'D2.4.5 is tagged as division');
  ok([...archByskill['D2.4.6']].every(a=>a==='money_save'),'D2.4.6 is tagged as savings');
  ok(archByskill['D2.4.7'].size>=4,'D2.4.7 exposes multiple genuine internal sub-modes, matching moneyQ\'s 5-mode pool');
}

// =======================================================================
// 2/3. D2.5.1-5.3 are distinct; D2.5.2 conversion content is reachable.
// =======================================================================
{
  const ctx=buildCtx();
  const a1=new Set(sample(ctx,'D2.5.1',100).map(q=>q.archetypeId));
  const a2=new Set(sample(ctx,'D2.5.2',100).map(q=>q.archetypeId));
  const a3=new Set(sample(ctx,'D2.5.3',100).map(q=>q.archetypeId));
  eq([...a1],['time_read_clock'],'D2.5.1 is exclusively clock-reading');
  eq([...a2],['time_convert_unit'],'D2.5.2 is exclusively unit-conversion');
  ok(a3.size===2&&a3.has('time_duration_end')&&a3.has('time_duration_span'),'D2.5.3 exposes both genuine internal sub-modes (find-end-time / find-duration), matching the original topic-5.js 2-mode design');
  ok(a1.values().next().value!==a2.values().next().value,'D2.5.1 and D2.5.2 archetypes differ');
  // Prove the actual conversion competency (hour->minute / day->hour / week->day) is present.
  const qs=sample(ctx,'D2.5.2',150);
  const sawHourMin=qs.some(q=>/jam.*=.*minit/i.test(q.prompt));
  const sawDayHour=qs.some(q=>/hari.*=.*jam/i.test(q.prompt));
  const sawWeekDay=qs.some(q=>/minggu.*=.*hari/i.test(q.prompt));
  ok(sawHourMin&&sawDayHour&&sawWeekDay,'D2.5.2 genuinely covers all three original conversion relationships (hour-minute, day-hour, week-day)');
  ok(!qs.some(q=>/<svg|clockvisual|timelinevisual/i.test(q.prompt)),'D2.5.2 prompts are correctly tagged symbolic (no stray visual)');
  ok(qs.every(q=>q.representation==='symbolic'),'D2.5.2 representation is symbolic, not misclassified as visual');
}

// =======================================================================
// 4/5. D2.8.1-8.3 are distinct; D2.8.1 tally/data-collection is reachable.
// =======================================================================
{
  const ctx=buildCtx();
  const a1=sample(ctx,'D2.8.1',150),a2=sample(ctx,'D2.8.2',100),a3=sample(ctx,'D2.8.3',100);
  const set1=new Set(a1.map(q=>q.archetypeId)),set2=new Set(a2.map(q=>q.archetypeId)),set3=new Set(a3.map(q=>q.archetypeId));
  ok(set1.size>=1&&set2.size>=1&&set3.size>=1,'each D2.8.x skill produces at least one archetype');
  const sawTally=a1.some(q=>/gundalan/i.test(q.prompt));
  ok(sawTally,'D2.8.1 genuinely reaches tally-table (gundalan) data-collection content');
  const sawRawArrange=a1.some(q=>/Data dikumpul/.test(q.prompt)&&/disusun ke dalam jadual gundalan/.test(q.prompt));
  ok(sawRawArrange,'D2.8.1 reaches the raw-data-to-tally arrangement mode specifically');
}

// =======================================================================
// 6. Measurement instrument-reading content is reachable for 6.1-6.3.
// =======================================================================
{
  const ctx=buildCtx();
  for(const [id,label] of [['D2.6.1','panjang'],['D2.6.2','gram'],['D2.6.3','isi padu']]){
    const qs=sample(ctx,id,200);
    const readQs=qs.filter(q=>q.archetypeId==='read');
    ok(readQs.length>0,`${id}: instrument-reading ('read') mode is reachable`);
    ok(readQs.every(q=>q.representation==='visual'),`${id}: read mode is correctly tagged visual`);
  }
  // D2.6.4 must NOT gain a read mode (preserve its existing 3-mode scope exactly).
  const q64=sample(ctx,'D2.6.4',200);
  ok(!q64.some(q=>q.archetypeId==='read'),'D2.6.4 does not gain the new read mode (out of scope, preserved as-is)');
  eq(new Set(q64.map(q=>q.archetypeId)),new Set(['unit_choice','compare','operation']),'D2.6.4 retains exactly its original 3-mode pool');
}

// =======================================================================
// 7. D2.2.5 can generate add/sub/mul/div appropriately.
// =======================================================================
{
  const ctx=buildCtx();
  const qs=sample(ctx,'D2.2.5',400);
  const hasAdd=qs.some(q=>/lagi\. Berapakah jumlah/.test(q.prompt));
  const hasSub=qs.some(q=>/tinggal/.test(q.prompt));
  const hasMul=qs.some(q=>/Setiap kotak mempunyai/.test(q.prompt));
  const hasDiv=qs.some(q=>/dibahagi sama rata/.test(q.prompt));
  ok(hasAdd,'D2.2.5 reaches addition word problems');
  ok(hasSub,'D2.2.5 reaches subtraction word problems');
  ok(hasMul,'D2.2.5 reaches multiplication word problems');
  ok(hasDiv,'D2.2.5 reaches division word problems');
}

// =======================================================================
// Operations restoration: D2.1.8 compare mode, D2.2.1/2.2 3-value variation.
// =======================================================================
{
  const ctx=buildCtx();
  const q18=sample(ctx,'D2.1.8',300);
  const hasCompareMode=q18.some(q=>/beza bilangan/.test(q.prompt));
  ok(hasCompareMode,'D2.1.8 regains its compare/difference word-problem archetype');

  const q221=sample(ctx,'D2.2.1',400),q222=sample(ctx,'D2.2.2',400);
  const has3Add=q221.some(q=>(q.prompt.match(/\+/g)||[]).length===2);
  const has3Sub=q222.some(q=>(q.prompt.match(/−/g)||[]).length===2);
  ok(has3Add,'D2.2.1 regains optional 3-value addition');
  ok(has3Sub,'D2.2.2 regains optional 3-value subtraction');
}

// =======================================================================
// 8. Restored paths retain valid adaptive metadata (already checked inline
// by sample() for every skill above; explicit summary assertion here).
// =======================================================================
ok(checks>100,'a substantial number of metadata/uniqueness checks ran across all restored skills');

// =======================================================================
// Money-specific validation (separate section per task requirements).
// =======================================================================
{
  const ctx=buildCtx();
  // RM/sen formatting correctness: spot-check via regex on real output.
  const q44=sample(ctx,'D2.4.4',200);
  ok(q44.every(q=>/^(RM\d+(\.\d{2})?|\d+ sen)$/.test(q.answer)),'D2.4.4 answers use correct RM/sen notation throughout');
  // multiplication correctness: price x qty
  let mulVerified=0;
  for(const q of q44){
    const m=q.prompt.match(/^(RM(\d+(?:\.\d+)?)|(\d+) sen) × (\d+) = \?$/);
    if(!m)continue;
    const unitCents=m[2]?Math.round(parseFloat(m[2])*100):Number(m[3]);
    const qty=Number(m[4]);
    const expectedCents=unitCents*qty;
    const gotCents=/^RM/.test(q.answer)?Math.round(parseFloat(q.answer.slice(2))*100):Number(q.answer.replace(' sen',''));
    eq(gotCents,expectedCents,`D2.4.4 multiplication is arithmetically correct: ${q.prompt} -> ${q.answer}`);
    mulVerified++;
  }
  ok(mulVerified>5,'multiple D2.4.4 direct-symbol multiplication samples were arithmetically verified');

  // division correctness
  const q45=sample(ctx,'D2.4.5',200);
  let divVerified=0;
  for(const q of q45){
    const m=q.prompt.match(/^(RM(\d+(?:\.\d+)?)|(\d+) sen) ÷ (\d+) = \?$/);
    if(!m)continue;
    const totalCents=m[2]?Math.round(parseFloat(m[2])*100):Number(m[3]);
    const divisor=Number(m[4]);
    const expectedCents=totalCents/divisor;
    const gotCents=/^RM/.test(q.answer)?Math.round(parseFloat(q.answer.slice(2))*100):Number(q.answer.replace(' sen',''));
    eq(gotCents,expectedCents,`D2.4.5 division is arithmetically correct: ${q.prompt} -> ${q.answer}`);
    divVerified++;
  }
  ok(divVerified>3,'multiple D2.4.5 direct-symbol division samples were arithmetically verified');

  // 4.1 never receives 4.7-style application scenarios (shopping/spending story language)
  const q41=sample(ctx,'D2.4.1',300);
  ok(!q41.some(q=>/kedai|membeli|dibayar|baki wang/i.test(q.prompt)),'D2.4.1 never drifts into 4.7-style shopping/application scenarios');
  ok(q41.every(q=>q.demand==='concept'),'D2.4.1 demand consistently stays at concept level');

  // savings uses income/spending correctly (income - spending = savings)
  const q46=sample(ctx,'D2.4.6',300);
  let savingsVerified=0;
  for(const q of q46){
    const m=q.prompt.match(/(?:mempunyai|menerima)\s*<b>(RM(\d+(?:\.\d+)?)|(\d+) sen)<\/b>[\s\S]*?(?:berbelanja|bernilai)\s*<b>(RM(\d+(?:\.\d+)?)|(\d+) sen)<\/b>/);
    if(!m)continue;
    const haveCents=m[2]?Math.round(parseFloat(m[2])*100):Number(m[3]);
    const spendCents=m[5]?Math.round(parseFloat(m[5])*100):Number(m[6]);
    const expectedCents=haveCents-spendCents;
    const gotCents=/^RM/.test(q.answer)?Math.round(parseFloat(q.answer.slice(2))*100):Number(q.answer.replace(' sen',''));
    eq(gotCents,expectedCents,`D2.4.6 savings is arithmetically correct: ${q.prompt.replace(/\s+/g,' ')} -> ${q.answer}`);
    savingsVerified++;
  }
  ok(savingsVerified>3,'multiple D2.4.6 savings samples were arithmetically verified (income - spending)');

  // mastery-tiering genuinely activates now that `s` is threaded through.
  const lowKinds=new Set(sample(ctx,'D2.4.4',60,10).map(q=>q.kind));
  const highKinds=new Set(sample(ctx,'D2.4.4',60,90).map(q=>q.kind));
  ok([...lowKinds].some(k=>/FOUNDATION/.test(k)),'low mastery reaches FOUNDATION difficulty tier');
  ok([...highKinds].some(k=>/STRETCH/.test(k)),'high mastery reaches STRETCH difficulty tier');
}

// =======================================================================
// 10-14. Preserved skills unchanged, D1/D3/battle/app/Supabase unaffected,
// build/runtime integrity -- verified externally by the deploy process via
// git diff and build.js --check; this file additionally re-confirms the
// explicitly-preserved D2 skills still function and were not accidentally
// touched by the routing edits.
// =======================================================================
{
  const ctx=buildCtx();
  for(const id of ['D2.1.1','D2.1.2','D2.1.3','D2.1.4','D2.1.5','D2.1.6','D2.1.7','D2.2.3','D2.2.4','D2.3.1','D2.3.2','D2.3.3','D2.3.4','D2.7.1','D2.7.2','D2.7.3']){
    sample(ctx,id,20);
  }
  ok(true,'every explicitly-preserved D2 skill still generates valid output');
}

// =======================================================================
// D2.1.3 vs D2.1.7: discovered during implementation to share one
// undifferentiated pool via year2Sequence, despite being materially
// distinct curriculum competencies (D2.1.7's own prereq is D2.1.3).
// Fixed via a small, routing-level split of year2Sequence's already-
// authored 3-mode pool -- no new content, no new architecture.
// =======================================================================
{
  const ctx=buildCtx();
  const a13=new Set(sample(ctx,'D2.1.3',150).map(q=>q.archetypeId));
  const a17=new Set(sample(ctx,'D2.1.7',150).map(q=>q.archetypeId));
  eq([...a13].sort(),['internal','next'],'D2.1.3 (Rangkaian nombor) uses sequence-completion modes only');
  eq([...a17].sort(),['next','rule'],'D2.1.7 (Pola nombor) uses pattern-rule modes, distinct from D2.1.3');
  ok([...a13].join(',')!==[...a17].join(','),'D2.1.3 and D2.1.7 are no longer content-indistinguishable');
}

console.log(JSON.stringify({status:'pass',checks,restoredSkills:['D2.4.1..7','D2.5.1..3','D2.8.1..3','D2.6.1..3','D2.1.8','D2.2.1','D2.2.2','D2.2.5','D2.1.3','D2.1.7'],newArchetypeNamespaces:['money_*','time_*'],additionalFixIncluded:'D2.1.3/D2.1.7 routing split via year2Sequence (discovered during implementation, met the small-routing-fix criteria, included per explicit authorization)'},null,2));
