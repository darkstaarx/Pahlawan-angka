#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}
function loadRuntime(){const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8'),c,{filename:'runtime.js'});return c.PAQuestionSystemV2}
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
const rt=loadRuntime();
const nonT7Topics=['D3.T1','D3.T2','D3.T3','D3.T4','D3.T5','D3.T6','D3.T8','D3.T9'];
const remainingTopics=['D3.T1','D3.T4','D3.T8'];
const allRecords=rt.curriculum.filter(r=>r.curriculumVersion==='KSSR-E3-2024'&&r.grade===3);
const nonT7Records=allRecords.filter(r=>nonT7Topics.includes(r.topicId));
const nonT7Templates=rt.templates.filter(t=>t.curriculumVersion==='KSSR-E3-2024'&&t.grade===3&&nonT7Topics.includes(t.topicId));
const remainingTemplates=nonT7Templates.filter(t=>remainingTopics.includes(t.topicId));
const p0Templates=nonT7Templates.filter(t=>['D3.T2','D3.T3','D3.T5','D3.T6','D3.T9'].includes(t.topicId));
const t7=rt.templates.filter(t=>t.topicId==='D3.T7');

eq(allRecords.length,50,'D3 curriculum remains 50 standards');
eq(nonT7Records.length,44,'all 44 non-Topic-7 standards covered by full-year authoring');
ok(nonT7Records.every(r=>r.status==='mapped'),'all 44 non-T7 standards remain mapped');
ok(nonT7Records.every(r=>r.competencyIdStatus==='canonical'),'all non-T7 standards use canonical competency IDs');
eq(nonT7Templates.length,136,'exactly 136 non-T7 authored templates');
eq(p0Templates.length,94,'P0 authored bank now includes fluency-balance additions, exactly 94 templates');
eq(remainingTemplates.length,42,'T1/T4/T8 add exactly 42 templates');
eq(rt.templates.length,162,'full D3 runtime contains 162 templates');
eq(t7.length,26,'Topic 7 template total remains 26');
eq(t7.filter(t=>t.responseType==='mcq').length,24,'Topic 7 battle MCQ remains 24');
eq(t7.filter(t=>t.responseType==='interactive').length,2,'Topic 7 interactive remains 2');

const expectedTopicCounts={'D3.T1':18,'D3.T2':13,'D3.T3':30,'D3.T4':15,'D3.T5':15,'D3.T6':27,'D3.T7':26,'D3.T8':9,'D3.T9':9};
for(const [topic,count] of Object.entries(expectedTopicCounts))eq(rt.templates.filter(t=>t.topicId===topic).length,count,`${topic} authored template count`);

for(const rec of nonT7Records){
 const ts=nonT7Templates.filter(t=>t.standardId===rec.standardId&&t.competencyId===rec.competencyId&&t.topicId===rec.topicId);
 const expected=(rec.standardId==='2.1.1'||rec.standardId==='2.1.2')?5:3;
 eq(ts.length,expected,`${rec.standardId} has exactly ${expected} authored templates`);
 eq(new Set(ts.map(t=>t.archetypeId)).size,expected,`${rec.standardId} has ${expected} distinct archetypes`);
 ok(new Set(ts.map(t=>t.representation)).size>=2,`${rec.standardId} has representation diversity`);
 ok(new Set(ts.map(t=>t.demand)).size>=2,`${rec.standardId} has cognitive-demand diversity`);
 ok(ts.every(t=>t.responseType==='mcq'),`${rec.standardId} authored battle bank remains MCQ`);
}

ok(rt.listGenerators().includes('d3.p0Kssr'),'P0 generator retained');
ok(rt.listGenerators().includes('d3.fullKssr'),'T1/T4/T8 generator registered');
ok(rt.listRenderers().includes('d3p0'),'P0 renderer retained');
ok(rt.listRenderers().includes('d3full'),'T1/T4/T8 renderer registered');

let samples=0;
for(let ti=0;ti<nonT7Templates.length;ti++){
 const tpl=nonT7Templates[ti],gen=rt._generators[tpl.generator],rend=rt._renderers[tpl.renderer];
 ok(typeof gen==='function',`generator exists ${tpl.templateId}`);
 ok(typeof rend==='function',`renderer exists ${tpl.templateId}`);
 for(let s=0;s<40;s++){
  const raw=gen(tpl.params||{},_test.makeRng(5300000+ti*97+s));
  ok(raw&&raw.value&&raw.value.answer&&Array.isArray(raw.distractors)&&raw.distractors.length===3,`generator contract ${tpl.templateId}`);
  ok(raw.meta&&raw.meta.fingerprint&&raw.meta.archetype===tpl.archetypeId,`metadata contract ${tpl.templateId}`);
  const rawLabels=[raw.value.answer,...raw.distractors].map(x=>String(x.labelMs).trim().toLowerCase());
  eq(new Set(rawLabels).size,4,`raw choices unique ${tpl.templateId}`);
  const q=_test.assembleLegacyQuestion(rt,tpl,raw);
  ok(q&&q.source==='qsv2'&&q.qsv2Pilot===false&&q.qsv2ShadowBatch===true,`full-year shadow tags ${tpl.templateId}`);
  const qLabels=[q.answer,...q.wrong.map(x=>x.v)].map(x=>String(x).trim().toLowerCase());
  eq(new Set(qLabels).size,4,`adapted choices unique ${tpl.templateId}`);
  ok(typeof rend(raw.value,tpl.params||{})==='string',`renderer smoke ${tpl.templateId}`);
  samples++;
 }
}

// T8 must be genuinely visual: no coordinate competency may be authored without a grid representation.
const coordinateTemplates=nonT7Templates.filter(t=>t.topicId==='D3.T8');
eq(coordinateTemplates.length,9,'nine coordinate templates');
ok(coordinateTemplates.every(t=>/grid/.test(t.representation)),'all coordinate templates declare grid-based evidence');
for(const tpl of coordinateTemplates){
 const raw=rt._generators[tpl.generator](tpl.params||{},_test.makeRng(880000+tpl.templateId.length));
 ok(raw.value.visual&&raw.value.visual.kind==='coordinate_grid',`${tpl.templateId} produces coordinate grid`);
}

// Shadow-only production routing across every non-T7 legacy skill.
const skillTopic={
 'D3.N10000':'D3.T1','D3.PV10000':'D3.T1',
 'D3.ADD10000':'D3.T2','D3.SUB10000':'D3.T2','D3.MUL':'D3.T2','D3.DIV':'D3.T2',
 'D3.FRAC':'D3.T3','D3.DEC':'D3.T3','D3.PERCENT':'D3.T3',
 'D3.MONEY':'D3.T4','D3.TIME':'D3.T5','D3.MEASURE':'D3.T6',
 'D3.POSITION':'D3.T8','D3.DATA':'D3.T9'
};
const root={document:{},localStorage:storage(),performance:{now:()=>123.45},PAQuestionSystemV2:rt,PA_QSV2_FLAGS:{},PAD3Topic7LiveCutover:{authorizeLive:id=>({allowed:id==='D3.SHAPE'})}};
const bridge=createBridge(root);
for(const [skill,topic] of Object.entries(skillTopic)){
 const out=bridge.tryGenerate(skill,{mastery:55},{history:[],rng:_test.makeRng(991000+skill.length)});
 eq(out,null,`${skill} remains learner-invisible SHADOW`);
 ok(bridge.lastShadow&&bridge.lastShadow.question,`${skill} produces inspectable shadow question`);
 const q=bridge.lastShadow.question;
 ok(q.qsv2ShadowBatch===true&&q.qsv2Pilot===false,`${skill} tagged full-year shadow`);
 eq(rt.getTemplate(q.templateId).topicId,topic,`${skill} shadow stays in ${topic}`);
}
// Topic 7 live mode cannot accidentally expose any non-T7 topic.
bridge.setPilotMode('live',false);
for(const skill of Object.keys(skillTopic)){
 eq(bridge.tryGenerate(skill,{mastery:60},{history:[],rng:_test.makeRng(992000+skill.length)}),null,`${skill} cannot become LIVE through Topic 7 flag`);
}
const live=bridge.tryGenerate('D3.SHAPE',{mastery:60},{history:[],rng:_test.makeRng(993000)});
ok(live&&live.source==='qsv2'&&live.qsv2Pilot===true,'historical Topic 7 LIVE path remains functional');

console.log(JSON.stringify({status:'pass',checks,d3Standards:50,nonT7Standards:44,nonT7Templates:136,remainingTemplates:42,p0Templates:94,totalTemplates:162,samples,topic7:{templates:26,battle:24,interactive:2},shadowSkills:Object.keys(skillTopic),contentBank:'D3 9/9 topics authored',learnerVisibleExpansion:false},null,2));
