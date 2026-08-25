#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}
function loadRuntime(){const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8'),c,{filename:'runtime.js'});return c.PAQuestionSystemV2}
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
const rt=loadRuntime();
const topics=['D3.T2','D3.T3','D3.T5','D3.T6','D3.T9'];
const p0Records=rt.curriculum.filter(r=>r.curriculumVersion==='KSSR-E3-2024'&&r.grade===3&&topics.includes(r.topicId));
eq(p0Records.length,30,'exactly 30 P0 standards');
ok(p0Records.every(r=>r.status==='mapped'),'all P0 authored standards remain mapped');
ok(p0Records.every(r=>r.competencyIdStatus==='canonical'),'all P0 standards use canonical competency IDs');
const p0Templates=rt.templates.filter(t=>t.curriculumVersion==='KSSR-E3-2024'&&t.grade===3&&topics.includes(t.topicId));
eq(p0Templates.length,94,'exactly 94 Phase 3A-1 + fluency-balance templates');
ok(p0Templates.every(t=>t.responseType==='mcq'),'all Phase 3A-1 templates are MCQ');
ok(p0Templates.every(t=>t.generator==='d3.p0Kssr'),'all Phase 3A-1 templates use reviewed generator');
ok(p0Templates.every(t=>t.renderer==='d3p0'),'all Phase 3A-1 templates use reviewed renderer');
ok(rt.listGenerators().includes('d3.p0Kssr'),'P0 generator registered');
ok(rt.listRenderers().includes('d3p0'),'P0 renderer registered');

for(const rec of p0Records){
  const ts=p0Templates.filter(t=>t.standardId===rec.standardId&&t.competencyId===rec.competencyId&&t.topicId===rec.topicId);
  const expected=(rec.standardId==='2.1.1'||rec.standardId==='2.1.2')?5:3;
  eq(ts.length,expected,`${rec.standardId} has exactly ${expected} distinct authored archetypes`);
  eq(new Set(ts.map(t=>t.archetypeId)).size,expected,`${rec.standardId} archetypes unique`);
  ok(new Set(ts.map(t=>t.representation)).size>=2,`${rec.standardId} uses at least two representations`);
  ok(new Set(ts.map(t=>t.demand)).size>=2,`${rec.standardId} uses at least two cognitive demands`);
}

// R2 regression: decimal largest-choice generation must never collapse two
// distinct raw values onto the same 2-decimal display label. Stress the exact
// archetype that escaped the earlier shallow sweep.
{
  const tpl=p0Templates.find(t=>t.archetypeId==='select_largest_decimal');
  ok(!!tpl,'R2 select_largest_decimal template exists');
  const gen=tpl&&rt._generators[tpl.generator];
  ok(typeof gen==='function','R2 select_largest_decimal generator exists');
  for(let seed=0;seed<10000;seed++){
    const raw=gen(tpl.params||{},_test.makeRng(8800000+seed));
    const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
    eq(new Set(labels).size,4,`R2 select_largest_decimal unique choices seed ${seed}`);
  }
}

// R2 hardening: 50 out of 100 previously made the complement distractor
// equal the correct 50% answer. Stress the notation-writing archetype too.
{
  const tpl=p0Templates.find(t=>t.archetypeId==='number_out_of_100_to_percent');
  ok(!!tpl,'R2 number_out_of_100_to_percent template exists');
  const gen=tpl&&rt._generators[tpl.generator];
  ok(typeof gen==='function','R2 number_out_of_100_to_percent generator exists');
  for(let seed=0;seed<10000;seed++){
    const raw=gen(tpl.params||{},_test.makeRng(8900000+seed));
    const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
    eq(new Set(labels).size,4,`R2 number_out_of_100_to_percent unique choices seed ${seed}`);
  }
}

let samples=0;
for(let ti=0;ti<p0Templates.length;ti++){
  const tpl=p0Templates[ti],gen=rt._generators[tpl.generator];
  ok(typeof gen==='function',`generator exists ${tpl.templateId}`);
  for(let s=0;s<60;s++){
    const raw=gen(tpl.params||{},_test.makeRng(3100000+ti*100+s));
    ok(raw&&raw.value&&raw.value.answer&&Array.isArray(raw.distractors)&&raw.distractors.length===3,`generator shape ${tpl.templateId}`);
    ok(raw.meta&&raw.meta.fingerprint&&raw.meta.archetype===tpl.archetypeId,`metadata ${tpl.templateId}`);
    const labels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
    eq(new Set(labels).size,4,`unique raw choices ${tpl.templateId}`);
    const q=_test.assembleLegacyQuestion(rt,tpl,raw);
    ok(q&&q.source==='qsv2'&&q.qsv2Pilot===false&&q.qsv2ShadowBatch===true,`shadow batch tags ${tpl.templateId}`);
    ok(typeof q.prompt==='string'&&q.prompt.length>0,`assembled prompt ${tpl.templateId}`);
    const qv=[q.answer,...q.wrong.map(x=>x.v)].map(x=>String(x).trim().toLowerCase());
    eq(new Set(qv).size,4,`assembled choices ${tpl.templateId}`);
    samples++;
  }
}

// Visual-evidence minimums for concepts whose meaning is representation-dependent.
const visualCompetencies=[
 'identify_equivalent_fractions','simplify_proper_fractions','add_subtract_proper_fractions',
 'identify_improper_fractions_and_mixed_numbers','convert_hundredths_fractions_to_decimals',
 'represent_percent_on_hundred_grid','relate_fractions_decimals_percent',
 'read_record_time_of_activities','convert_hours_minutes_seconds','add_subtract_time_values',
 'solve_mixed_addition_subtraction_time','multiply_divide_time',
 'convert_metres_centimetres','convert_kilograms_grams','convert_litres_millilitres',
 'collect_classify_organize_data','read_interpret_pie_chart','relate_pictograph_bar_chart_pie_chart'
];
for(const comp of visualCompetencies){
  const ts=p0Templates.filter(t=>t.competencyId===comp);
  ok(ts.some(t=>!['symbolic','textual','contextual'].includes(t.representation)),`${comp} has concrete/visual representation evidence`);
}

// Shadow routing: visible learner remains legacy while v2 generation is inspectable.
const root={document:{},localStorage:storage(),performance:{now:()=>123.4},PAQuestionSystemV2:rt,PA_QSV2_FLAGS:{},PAD3Topic7LiveCutover:{authorizeLive:id=>({allowed:id==='D3.SHAPE'})}};
const bridge=createBridge(root);
const skillTopics={
 'D3.ADD10000':'D3.T2','D3.SUB10000':'D3.T2','D3.MUL':'D3.T2','D3.DIV':'D3.T2',
 'D3.FRAC':'D3.T3','D3.DEC':'D3.T3','D3.PERCENT':'D3.T3','D3.TIME':'D3.T5','D3.MEASURE':'D3.T6','D3.DATA':'D3.T9'
};
for(const [skill,topic] of Object.entries(skillTopics)){
  const history=[],seen=new Set();let lastComp=null;
  for(let i=0;i<100;i++){
    const out=bridge.tryGenerate(skill,{mastery:[25,55,85][i%3]},{history,rng:_test.makeRng(410000+i*97+skill.length)});
    eq(out,null,`${skill} SHADOW never replaces visible legacy question`);
    ok(bridge.lastShadow&&bridge.lastShadow.question,`${skill} produces inspectable shadow question`);
    const q=bridge.lastShadow.question;
    eq(q.qsv2Pilot,false,`${skill} is not Topic 7 pilot live content`);
    eq(q.qsv2ShadowBatch,true,`${skill} tagged shadow batch`);
    const tpl=rt.getTemplate(q.templateId);eq(tpl.topicId,topic,`${skill} shadow question stays in intended topic`);
    if(lastComp&&p0Records.filter(r=>r.legacySkills&&r.legacySkills.includes(skill)).length>1)ok(q.competencyId!==lastComp||history.slice(-1)[0].competencyId!==q.competencyId,`${skill} avoids immediate same-competency repeat when alternatives exist`);
    seen.add(q.templateId);lastComp=q.competencyId;
    history.push({skillId:skill,competencyId:q.competencyId,templateId:q.templateId,source:'legacy',archetypeId:q.archetypeId,representation:q.representation,demand:q.demand});
    if(history.length>60)history.shift();
  }
  ok(seen.size>=Math.min(3,p0Templates.filter(t=>rt.getCurriculumRecord('KSSR-E3-2024',3,t.standardId).legacySkills.includes(skill)).length),`${skill} surfaces multiple templates`);
}

// Even if Topic 7 is explicitly LIVE, P0 remains SHADOW-only.
bridge.setPilotMode('live',false);
for(const skill of Object.keys(skillTopics)){
  const out=bridge.tryGenerate(skill,{mastery:60},{history:[],rng:_test.makeRng(9000+skill.length)});
  eq(out,null,`${skill} cannot become learner-visible through Topic 7 LIVE flag`);
  ok(bridge.lastShadow&&bridge.lastShadow.question&&bridge.lastShadow.question.qsv2ShadowBatch===true,`${skill} still shadow-generates while Topic 7 LIVE`);
}
// Historical Topic 7 live path still works.
const live=bridge.tryGenerate('D3.SHAPE',{mastery:60},{history:[],rng:_test.makeRng(9999)});
ok(live&&live.source==='qsv2'&&live.qsv2Pilot===true,'Topic 7 LIVE remains independently functional');

console.log(JSON.stringify({status:'pass',checks,standards:p0Records.length,templates:p0Templates.length,samples,topics,shadowSkills:Object.keys(skillTopics),learnerVisibleExpansion:false,topic7LivePreserved:true},null,2));
