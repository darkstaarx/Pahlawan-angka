#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
const {createBridge,_test}=require(path.join(repo,'questions/v2/engine/legacy-adapter.js'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}
function makeRng(seed){return _test.makeRng(seed)}
function loadRuntime(){const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(repo,'questions/v2/dist/runtime.js'),'utf8'),c,{filename:'runtime.js'});return c.PAQuestionSystemV2}
const runtime=loadRuntime();
const topicTemplates=runtime.templates.filter(t=>t.curriculumVersion==='KSSR-E3-2024'&&t.grade===3&&t.topicId==='D3.T7');
const battle=topicTemplates.filter(t=>t.responseType==='mcq');
const interactive=topicTemplates.filter(t=>t.responseType==='interactive');
eq(topicTemplates.length,26,'D3 Topic 7 authored template total');
eq(battle.length,24,'D3 Topic 7 battle-compatible MCQ total');
eq(Array.from(interactive,t=>t.templateId).sort(),['D3-T7-722-polygon-pattern-construct-v1','D3-T7-731-symmetry-draw-axis-v1'],'interactive performance templates remain exactly two');
const added=[
 'D3-T7-712-prism-feature-statement-v1','D3-T7-713-prism-why-prism-v1','D3-T7-713-prism-why-not-prism-v1',
 'D3-T7-721-polygon-relative-clue-v1','D3-T7-721-polygon-why-regular-v1','D3-T7-722-pattern-position-v1',
 'D3-T7-731-symmetry-fold-card-v1','D3-T7-731-symmetry-shape-from-count-v1'
];
for(const id of added)ok(!!runtime.getTemplate(id),`new template present ${id}`);
eq(runtime.listGenerators().includes('geometry.prismKssrDiversity'),true,'prism diversity generator registered');
eq(runtime.listGenerators().includes('geometry.polygonKssrDiversity'),true,'polygon diversity generator registered');
eq(runtime.listGenerators().includes('geometry.symmetryKssrDiversity'),true,'symmetry diversity generator registered');

// Every live MCQ must assemble to a four-choice battle item, render safely,
// and avoid the adult/abstract phrase identified during mobile smoke testing.
let liveSamples=0;
for(let ti=0;ti<battle.length;ti++){
 const tpl=battle[ti],gen=runtime._generators[tpl.generator];ok(typeof gen==='function',`generator exists ${tpl.templateId}`);
 for(let i=0;i<40;i++){
  const raw=gen(tpl.params||{},makeRng(100000+ti*1000+i));
  const q=_test.assembleLegacyQuestion(runtime,tpl,raw);
  ok(q&&q.source==='qsv2'&&q.qsv2Pilot===true,`assembled qsv2 ${tpl.templateId}`);
  ok(typeof q.prompt==='string'&&q.prompt.length>0,`prompt ${tpl.templateId}`);
  ok(q.answer!==undefined&&Array.isArray(q.wrong)&&q.wrong.length===3,`4-choice shape ${tpl.templateId}`);
  const choices=[q.answer,...q.wrong.map(x=>x.v)].map(x=>String(x).trim().toLowerCase());
  eq(new Set(choices).size,4,`unique choices ${tpl.templateId}`);
  ok(!/unit ulangan|ulangan terkecil/i.test(q.prompt),`child-friendly pattern wording ${tpl.templateId}`);
  liveSamples++;
 }
}

// Semantic checks for the eight new archetypes.
const newModes=[
 ['D3-T7-712-prism-feature-statement-v1','prism_feature_statement'],
 ['D3-T7-713-prism-why-prism-v1','explain_why_prism'],
 ['D3-T7-713-prism-why-not-prism-v1','explain_why_not_prism'],
 ['D3-T7-721-polygon-relative-clue-v1','infer_polygon_from_relative_clue'],
 ['D3-T7-721-polygon-why-regular-v1','explain_regular_polygon'],
 ['D3-T7-722-pattern-position-v1','find_polygon_at_pattern_position'],
 ['D3-T7-731-symmetry-fold-card-v1','choose_fold_line_for_symmetry'],
 ['D3-T7-731-symmetry-shape-from-count-v1','choose_shape_from_axis_count']
];
let semanticSamples=0;
for(let x=0;x<newModes.length;x++){
 const [id,arch]=newModes[x],tpl=runtime.getTemplate(id),gen=runtime._generators[tpl.generator];
 eq(tpl.archetypeId,arch,`archetype contract ${id}`);
 for(let i=0;i<250;i++){
  const raw=gen(tpl.params||{},makeRng(900000+x*1000+i));
  ok(raw.meta&&raw.meta.semanticProperties,`semantic properties ${id}`);
  eq(raw.meta.archetype,arch,`generator archetype ${id}`);
  eq(raw.distractors.length,3,`three distractors ${id}`);
  const labels=[raw.value.answer,...raw.distractors].map(c=>String(c.labelMs).toLowerCase());eq(new Set(labels).size,4,`semantic unique choices ${id}`);
  const s=raw.meta.semanticProperties;
  if(id==='D3-T7-712-prism-feature-statement-v1')ok(/2 tapak/.test(raw.value.answer.labelMs)&&s.baseCount===2,'feature statement proves two bases');
  if(id==='D3-T7-713-prism-why-prism-v1')ok(/2 tapak/.test(raw.value.answer.labelMs)&&/tiada permukaan melengkung/.test(raw.value.answer.labelMs),'why-prism criterion');
  if(id==='D3-T7-713-prism-why-not-prism-v1')ok(/^reason:/.test(raw.value.answer.id)&&s.solidId,'why-not-prism structured reason');
  if(id==='D3-T7-721-polygon-relative-clue-v1')ok(s.sideCount>=5&&s.sideCount<=8,'relative clue side range');
  if(id==='D3-T7-721-polygon-why-regular-v1')ok(s.regular===true&&/sama panjang/.test(raw.value.answer.labelMs),'regularity reason');
  if(id==='D3-T7-722-pattern-position-v1')eq(s.expectedNextId,s.unit[(s.targetPosition-1)%s.unit.length],'pattern position oracle');
  if(id==='D3-T7-731-symmetry-fold-card-v1')ok(s.axisAngles.includes(s.answerAngle),'fold line is true symmetry axis');
  if(id==='D3-T7-731-symmetry-shape-from-count-v1')ok(s.axisCount>=1&&s.axisCount<=6,'axis-count target range');
  semanticSamples++;
 }
}

// Learner wording/hints that were awkward in the live phone smoke test.
const polygonSource=fs.readFileSync(path.join(repo,'questions/v2/generators/geometry/polygon-symmetry.js'),'utf8');
ok(polygonSource.includes('Bahagian manakah yang diulang untuk membina corak ini?'),'repeating-pattern prompt uses child-friendly language');
ok(!polygonSource.includes('Apakah unit ulangan TERKECIL bagi corak ini?'),'old abstract repeating-unit wording removed');
const prismSource=fs.readFileSync(path.join(repo,'questions/v2/generators/geometry/prism.js'),'utf8');
ok(prismSource.includes('Prisma dinamakan mengikut bentuk dua tapaknya yang sama.'),'base prompt explains prism naming');
const patternTpl=runtime.getTemplate('D3-T7-722-polygon-pattern-unit-v1'),patternRaw=runtime._generators[patternTpl.generator](patternTpl.params,makeRng(123));
const patternQ=_test.assembleLegacyQuestion(runtime,patternTpl,patternRaw);ok(!/unit pola/i.test(patternQ.hint),'pattern hint avoids abstract unit-pola wording');
const symTpl=runtime.getTemplate('D3-T7-731-symmetry-count-v1'),symRaw=runtime._generators[symTpl.generator](symTpl.params,makeRng(456));
const symQ=_test.assembleLegacyQuestion(runtime,symTpl,symRaw);ok(!/garis itu/i.test(symQ.hint),'symmetry hint works even when no candidate line is drawn');

// Anti-repeat scheduler: no competency inside the previous two questions,
// and no exact template inside the previous six while alternatives exist.
const history=[],rng=makeRng(20260823),seenTemplates=new Set(),compCounts={};let maxGap=0,lastAt={};
for(let i=0;i<240;i++){
 const tpl=_test.selectTemplate(runtime,'D3.SHAPE',{mastery:[20,50,85][i%3],evidence:6,confidence:70},history,rng);
 ok(!!tpl,`scheduler item ${i}`);
 const recent2=history.slice(-2).map(x=>x.competencyId);ok(!recent2.includes(tpl.competencyId),`2-question competency cooldown ${i}`);
 const recent6=history.slice(-6).map(x=>x.templateId);ok(!recent6.includes(tpl.templateId),`6-question template cooldown ${i}`);
 seenTemplates.add(tpl.templateId);compCounts[tpl.competencyId]=(compCounts[tpl.competencyId]||0)+1;
 if(lastAt[tpl.competencyId]!=null)maxGap=Math.max(maxGap,i-lastAt[tpl.competencyId]);lastAt[tpl.competencyId]=i;
 history.push({competencyId:tpl.competencyId,templateId:tpl.templateId,archetypeId:tpl.archetypeId,representation:tpl.representation,demand:tpl.demand});if(history.length>60)history.shift();
}
eq(seenTemplates.size,24,'scheduler surfaces all 24 battle templates');
const counts=Object.values(compCounts);eq(Object.keys(compCounts).length,6,'scheduler covers six competencies');ok(Math.max(...counts)-Math.min(...counts)<=2,'competency distribution remains balanced');ok(maxGap<=8,'no competency disappears for long stretches');

// Default/control safety remains unchanged.
const storage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};const root={document:{},localStorage:storage,PAQuestionSystemV2:runtime,PA_QSV2_FLAGS:{}};const bridge=createBridge(root);
eq(bridge.getMode(),'shadow','default stays SHADOW');eq(bridge.getStatus().battleCompatibleTemplates,24,'status exposes 24 battle MCQs');

console.log(JSON.stringify({status:'pass',checks,topicTemplates:topicTemplates.length,battleCompatible:24,interactive:2,liveSamples,semanticSamples,antiRepeat:{competencyCooldown:2,templateCooldown:6,seenTemplates:seenTemplates.size,maxGap},defaultMode:'shadow'},null,2));
