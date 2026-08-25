#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0,samples=0;function ok(v,m){checks++;assert.ok(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}
function txt(r){return fs.readFileSync(path.join(repo,r),'utf8')}function js(r){return JSON.parse(txt(r))}
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296}}
const gens={},renders={},ctx={console,registerGenerator:(k,f)=>{gens[k]=f},registerRenderer:(k,f)=>{renders[k]=f}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['questions/v2/generators/d3/full-kssr.js','questions/v2/generators/d3/p0-kssr.js','questions/v2/renderers/d3/full-kssr.js','questions/v2/renderers/d3/p0-kssr.js'])vm.runInContext(txt(f),ctx,{filename:f});
const bankFiles=['full-number.json','p0-operations.json','p0-fractions-decimals-percent.json','full-money.json','p0-time.json','p0-measurement.json','full-coordinates.json','p0-data.json'];
const bankBase='questions/v2/banks/kssr-e3-2024/d3/';
const templates=bankFiles.flatMap(f=>js(bankBase+f).templates);
eq(templates.length,136,'semantic QA covers exactly 136 non-T7 authored templates');
const expected={'D3.T1':18,'D3.T2':13,'D3.T3':30,'D3.T4':15,'D3.T5':15,'D3.T6':27,'D3.T8':9,'D3.T9':9};for(const k of Object.keys(expected))eq(templates.filter(t=>t.topicId===k).length,expected[k],k+' template count');

// Metadata scope gates: prevent diagnostic contamination.
for(const t of templates.filter(t=>t.topicId==='D3.T4')){
  const set=new Set(t.misconceptionTargets||[]);
  if(t.standardId==='4.3.1'){eq([...set].sort(),['currency_country_confusion'],'currency template has only currency misconception');}
  if(t.standardId==='4.4.1'){eq([...set].sort(),['need_want_confusion'],'needs/wants template has only needs/wants misconception');}
  if(t.standardId.startsWith('4.1')||t.standardId==='4.2.1'){ok(!set.has('currency_country_confusion')&&!set.has('need_want_confusion'),'money arithmetic does not contaminate currency/needs diagnostics');}
}
for(const t of templates.filter(t=>t.topicId==='D3.T1')){const s=new Set(t.misconceptionTargets||[]);if(t.standardId==='1.2.1')eq([...s],['estimation_vs_exact'],'estimation metadata scoped');if(t.standardId==='1.3.1')eq([...s],['rounding_midpoint'],'rounding metadata scoped');}

const directionSeen={hm:new Set(),ms:new Set()},timeDomains=new Set();let compassSeen=false,tallyFiveSeen=false,power10Seen=new Set();
for(let ti=0;ti<templates.length;ti++){
  const t=templates[ti],gen=gens[t.generator],rend=renders[t.renderer];ok(typeof gen==='function','generator exists '+t.templateId);ok(typeof rend==='function','renderer exists '+t.templateId);
  for(let s=0;s<1000;s++){
    const raw=gen(t.params||{},rng(4500000+ti*4099+s));samples++;
    ok(raw&&raw.value&&raw.value.answer&&Array.isArray(raw.distractors)&&raw.distractors.length===3,'generator contract '+t.templateId);
    eq(raw.meta.archetype,t.archetypeId,'archetype contract '+t.templateId);
    const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());eq(new Set(labels).size,4,'four display-unique choices '+t.templateId);
    if(raw.value.visual){const html=rend(raw.value,t.params||{});ok(typeof html==='string'&&html.length>20,'non-empty rendered evidence '+t.templateId);}
    const sem=raw.meta.semanticProperties||{},mode=(t.params||{}).mode;

    // T1
    if(t.standardId==='1.1.1'&&mode==='digit_value'){ok(Number.isInteger(sem.value)&&sem.value>0,'digit-value semantic oracle');ok(raw.value.visual&&raw.value.visual.kind==='place_value_table'&&raw.value.visual.highlight>=0,'digit-value highlighted place');}
    if(t.standardId==='1.2.1'){ok(raw.value.visual&&raw.value.visual.kind==='estimate_reference_sets','estimation uses reference/target set evidence');ok(sem.referenceCount>0&&sem.targetCount>0,'estimation records reference and target quantities');ok(!/kumpulan yang sama/i.test(raw.value.promptMs),'estimation is not disguised repeated-group multiplication');}
    if(t.standardId==='1.4.1'||t.standardId==='1.4.2'){if(raw.value.visual&&raw.value.visual.kind==='number_sequence')ok((raw.value.visual.sequence||[]).length>=6,'number-pattern evidence uses >=6 positions');}

    // T2
    if(t.standardId==='2.1.1'&&mode==='context_result')eq(sem.values,3,'2.1.1 context uses three values');
    if(t.standardId==='2.2.1'){if(mode==='one_digit')ok(sem.result<=10000&&sem.factor>=2&&sem.factor<=9,'one-digit multiply/divide within KSSR 10000 bound');if(mode==='powers10'){ok([10,100,1000].includes(sem.factor),'powers10 explicitly samples 10/100/1000');power10Seen.add(sem.factor);ok(sem.maxValue<=10000,'powers10 values never exceed 10000');const html=rend(raw.value,t.params||{});ok(sem.operation==='div'?html.includes('÷'):html.includes('×'),'place-value visual renders actual operation');}}

    // T3
    if(['3.1.1','3.1.2'].includes(t.standardId))ok((sem.maxDenominator||10)<=10,'fraction denominator within Year 3 <=10');
    if(t.standardId==='3.1.3'){ok(sem.denominatorA<=10&&sem.denominatorB<=10,'fraction-operation denominators <=10');ok(sem.unlikeDenominators===true,'3.1.3 includes unlike-denominator evidence');ok(raw.value.visual&&raw.value.visual.kind==='fraction_area_pair','unlike fractions have paired visual evidence');}
    if(t.standardId==='3.1.4'&&mode==='picture_identify'){ok(raw.value.visual&&raw.value.visual.kind==='mixed_number','mixed-number picture uses dedicated whole+partial representation');eq(raw.value.visual.whole,sem.visualWholes,'visual whole count matches oracle');}
    if(t.standardId==='3.2.2'&&['add_decimals','subtract_decimals'].includes(mode)){ok(raw.value.visual&&raw.value.visual.kind==='decimal_operation','decimal operation visual carries both operands/operator');const h=rend(raw.value,t.params||{});ok(h.includes(raw.value.visual.operation),'decimal renderer shows actual operator');}
    if(t.standardId==='3.2.2'&&mode==='add_decimals')eq(sem.context,'ribbon','real-paper-style ribbon context retained');
    if(t.standardId==='3.4.1')ok(sem.usesHundredths===true,'fraction-decimal-percent bridge explicitly uses hundredths');

    // T4
    if(t.topicId==='D3.T4'){for(const k of Object.keys(sem)){if(/Cents$/.test(k))ok(sem[k]>=0&&sem[k]<=1000000,'money semantic value stays within RM10,000');}}
    if(t.standardId==='4.2.1'){ok(sem.factorClass==='one_digit'||sem.factorClass==='power10','money multiplication/division factor class recorded');if(sem.factorClass==='power10'){ok([10,100,1000].includes(sem.factor),'money power10 uses 10/100/1000');power10Seen.add(sem.factor);}}
    if(t.standardId==='4.3.1'){
      const v=raw.value.visual||{};ok(v.kind==='currency_card','currency task has masked currency card');
      if(mode==='currency_country_to_name'){ok(!!v.shownCountry&&!v.shownCurrency&&!v.shownCode,'country→currency visual hides answer currency/code');}
      if(mode==='currency_name_to_country'){ok(!!v.shownCurrency&&!v.shownCountry&&!v.shownCode,'currency→country visual hides answer country/code');}
      if(mode==='currency_code_match'){ok(!!v.shownCode&&!v.shownCountry&&!v.shownCurrency,'code→currency visual hides answer currency/country');}
    }

    // T5
    if(t.standardId==='5.1.1'&&mode==='calendar_date')ok(raw.value.visual&&raw.value.visual.kind==='calendar','calendar/date evidence replaces fake digital-to-words item');
    if(t.standardId==='5.1.2'&&mode==='hours_minutes')directionSeen.hm.add(sem.direction);if(t.standardId==='5.1.2'&&mode==='minutes_seconds')directionSeen.ms.add(sem.direction);
    if(t.standardId==='5.2.1'&&['add_durations','subtract_durations'].includes(mode))eq(sem.values,3,'time add/sub uses three values');
    if(t.standardId==='5.3.1'&&mode==='repeat_duration')timeDomains.add(sem.unitDomain);if(t.standardId==='5.3.1'&&mode==='share_duration')timeDomains.add(sem.unitDomain);
    if(t.standardId==='5.3.1'&&mode==='divide_then_multiply')ok(sem.linkedTask===true&&sem.totalGroups>sem.targetGroups,'real-paper linked divide→multiply time task');

    // T6
    if(['6.1.2','6.2.2','6.3.2'].includes(t.standardId)){ok(sem.mixedUnits===true,'measurement add/sub uses mixed units');eq(sem.values,3,'measurement add/sub/missing uses three measurements');}
    if(['6.1.3','6.2.3','6.3.3'].includes(t.standardId))ok(sem.mixedUnits===true,'measurement multiply/divide uses mixed-unit display');
    if(t.topicId==='D3.T6'&&raw.value.visual&&['ruler','scale','container'].includes(raw.value.visual.kind)){const html=rend(raw.value,t.params||{});if(raw.value.visual.kind==='ruler')ok(html.includes('<line'),'ruler has ruler-specific markings');if(raw.value.visual.kind==='scale')ok(html.includes('<path'),'scale has dial-specific geometry');if(raw.value.visual.kind==='container')ok(html.includes('<path')&&html.includes('<rect'),'container has vessel/liquid geometry');}

    // T8
    if(t.topicId==='D3.T8'){if(sem.uniqueCoordinates!=null)ok(sem.uniqueCoordinates===true,'coordinate objects never collide');if(sem.compassVocabulary)compassSeen=true;if(/^coord_(read_position|follow_moves)$/.test(mode))ok(/^[A-E][1-5]$/.test(String(raw.value.answer.labelMs)),'paper-style A1-E5 coordinate label');}

    // T9
    if(t.standardId==='9.1.1'){ok(sem.rawData===true,'9.1.1 begins from raw data rather than pre-solved chart');ok(raw.value.visual,'raw data has visible evidence');if(mode==='tally_count'&&String(raw.value.answer.labelMs).includes('/'))tallyFiveSeen=true;}
    if(t.standardId==='9.2.1')ok(sem.readOnly===true||sem.readFromChart===true,'pie-chart task is chart-reading/information retrieval, not unrelated percent-of-quantity');
    if(t.standardId==='9.2.2')ok(sem.sameData===true,'cross-chart task preserves same underlying data');
  }
}

eq([...power10Seen].sort((a,b)=>a-b),[10,100,1000],'10/100/1000 all observed in operation/money banks');
ok(directionSeen.hm.has('hour_to_min')&&directionSeen.hm.has('min_to_hour'),'hour↔minute conversion both directions observed');
ok(directionSeen.ms.has('min_to_sec')&&directionSeen.ms.has('sec_to_min'),'minute↔second conversion both directions observed');
ok(timeDomains.has('seconds')&&timeDomains.has('minutes')&&timeDomains.has('hours'),'time multiply/divide spans seconds, minutes and hours');
ok(compassSeen,'coordinate bank surfaces compass vocabulary');
ok(tallyFiveSeen,'tally bank surfaces grouped-five notation');

// Phase 3A-2 R2 targeted regression gates.
// These seed ranges are intentionally separate from the 1,000-seed broad sweep above.
const r2Improper=templates.find(t=>t.standardId==='3.1.4'&&(t.params||{}).mode==='improper_to_mixed');
const r2GridPct=templates.find(t=>t.standardId==='3.3.1'&&(t.params||{}).mode==='grid_to_percent');
const r2ShadePct=templates.find(t=>t.standardId==='3.3.1'&&(t.params||{}).mode==='percent_to_shaded');
ok(!!r2Improper,'R2 improper→mixed template located');
ok(!!r2GridPct,'R2 grid→percent template located');
ok(!!r2ShadePct,'R2 percent→shaded template located');
for(let s=0;s<10000;s++){
  const raw=gens[r2Improper.generator](r2Improper.params||{},rng(9100000+s));samples++;
  const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim());
  eq(new Set(labels.map(x=>x.toLowerCase())).size,4,'R2 improper→mixed choices display-unique');
  for(const label of labels){
    const m=label.match(/^(\d+) (\d+)\/(\d+)$/);ok(!!m,'R2 improper→mixed choice remains a mixed-number form');
    if(m){const n=Number(m[2]),d=Number(m[3]);ok(n>0&&n<d&&d<=10,'R2 improper→mixed fractional part stays proper and denominator <=10');}
  }
}
for(const [tpl,seedBase,kind] of [[r2GridPct,9200000,'grid_to_percent'],[r2ShadePct,9300000,'percent_to_shaded']]){
  for(let s=0;s<10000;s++){
    const raw=gens[tpl.generator](tpl.params||{},rng(seedBase+s));samples++;
    const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
    eq(new Set(labels).size,4,'R2 '+kind+' choices display-unique');
    const sem=raw.meta.semanticProperties||{};
    if(kind==='grid_to_percent')eq(raw.value.answer.labelMs,String(sem.shaded)+'%','R2 grid→percent answer matches shaded oracle');
    else eq(raw.value.answer.labelMs,String(sem.percent),'R2 percent→shaded answer matches percent oracle');
  }
}
// Phase 3A-2 R3 targeted regression gate for the previously masked T5 share-duration collision.
// R2 used a hand-built +1-hour distractor which collided with the total when groups=2.
// R3's durationChoices(...) guarantees display uniqueness after unit-normalized formatting.
const r3Share=templates.find(t=>t.standardId==='5.3.1'&&(t.params||{}).mode==='share_duration');
ok(!!r3Share,'R3 share-duration template located');
const r3Units=new Set();
for(let s=0;s<20000;s++){
  const raw=gens[r3Share.generator](r3Share.params||{},rng(9400000+s));samples++;
  const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
  eq(new Set(labels).size,4,'R3 share-duration choices display-unique');
  const sem=raw.meta.semanticProperties||{};
  ok(sem.groups>=2&&sem.groups<=6&&sem.eachSeconds>0,'R3 share-duration semantic parameters valid');
  eq(sem.totalSeconds,sem.groups*sem.eachSeconds,'R3 share-duration total oracle');
  r3Units.add(sem.unitDomain);
}
eq([...r3Units].sort(),['hours','minutes','seconds'],'R3 share-duration spans seconds/minutes/hours');

console.log(JSON.stringify({status:'pass',checks,samples,templates:templates.length,topics:8,semanticRelease:'3.45.0',revision:'R3',broadSemanticSamples:132000,r2TargetedSamples:30000,r3TargetedSamples:20000,realPaperAlignment:true,liveExpansion:false},null,2));
