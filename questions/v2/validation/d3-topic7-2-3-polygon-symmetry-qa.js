#!/usr/bin/env node
'use strict';
// Phase 2A-2 dedicated QA for D3 Topic 7.2 + 7.3.
// Drives the REAL bank/generator/renderer through the authored-script loader.
// Semantic correctness uses independent structured oracles; it never parses
// Bahasa Melayu labels to infer mathematical meaning.

const {
  loadTemplates, loadCurriculumRecords, GENERATORS_DIR, RENDERERS_DIR, listAuthoredScriptFiles,
} = require('../engine/registry');
const { loadGenerators, loadRenderers } = require('../engine/script-loader');

function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function hashSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function normAngles(a){return a.slice().map(Number).sort((x,y)=>x-y);}
function eq(a,b){return JSON.stringify(a)===JSON.stringify(b);}

const POLYGON = {
  pentagon:{sides:5}, hexagon:{sides:6}, heptagon:{sides:7}, octagon:{sides:8},
};
const SYMMETRY = {
  square:[0,45,90,135],
  rectangle:[0,90],
  equilateral_triangle:[30,90,150],
  isosceles_triangle:[90],
  regular_pentagon:[18,54,90,126,162],
  regular_hexagon:[0,30,60,90,120,150],
};
function shortestPeriod(seq){
  for(let p=1;p<=seq.length;p++){
    let ok=true;for(let i=p;i<seq.length;i++){if(seq[i]!==seq[i%p]){ok=false;break;}}
    if(ok)return seq.slice(0,p);
  }
  return seq.slice();
}
function repeat(unit,n){const out=[];for(let i=0;i<n;i++)out.push(unit[i%unit.length]);return out;}

let passed=0,failed=0; const failures=[];
function check(label,condition,context){if(condition){passed++;}else{failed++;if(failures.length<80)failures.push({label,context});}return condition;}

const {templates}=loadTemplates();
const {records}=loadCurriculumRecords();
const gens=loadGenerators(listAuthoredScriptFiles(GENERATORS_DIR));
const rends=loadRenderers(listAuthoredScriptFiles(RENDERERS_DIR));
const targetStandards=new Set(['7.2.1','7.2.2','7.3.1']);
const targetTemplates=templates.filter(t=>targetStandards.has(t.standardId));
const curriculumMap=new Map(records.map(r=>[`${r.curriculumVersion}::${r.grade}::${r.standardId}`,r]));

console.log('Question System v2 — D3 Topic 7.2/7.3 Polygon + Symmetry QA\n');
console.log(`Target templates: ${targetTemplates.length}`);
console.log(`Generators: ${Array.from(gens.keys()).sort().join(', ')}`);
console.log(`Renderers: ${Array.from(rends.keys()).sort().join(', ')}\n`);

check('exactly 14 approved Topic 7.2/7.3 templates',targetTemplates.length===14,{got:targetTemplates.length});
const expectedIds={
 '7.2.1':'identify_regular_polygon','7.2.2':'create_regular_polygon_pattern','7.3.1':'identify_and_draw_symmetry_axis'
};
for(const t of targetTemplates){
  const r=curriculumMap.get(`${t.curriculumVersion}::${t.grade}::${t.standardId}`);
  check(`${t.templateId}: curriculum xref exists`,!!r);
  if(r){check(`${t.templateId}: canonical competency matches`,t.competencyId===r.competencyId&&t.competencyId===expectedIds[t.standardId],{got:t.competencyId,expected:r.competencyId});check(`${t.templateId}: topic matches`,t.topicId===r.topicId&&t.topicId==='D3.T7');}
}

const BASE=Number(process.argv[2])||20260823;
const N=200;
const perTemplate={},perCompetency={},perArchetype={};
const coverage={polygon:new Set(),symmetry:new Set(),patternLengths:new Set()};

function validateMarkup(t,v,html,i){
  check(`${t.templateId} ${i}: renderer returns non-empty string`,typeof html==='string'&&html.length>20);
  const opens=(html.match(/<svg\b/g)||[]).length, closes=(html.match(/<\/svg>/g)||[]).length;
  check(`${t.templateId} ${i}: svg tags balanced`,opens===closes&&opens>=1,{opens,closes});
  check(`${t.templateId} ${i}: no leaked text artifacts`,!/undefined|NaN|\[object Object\]/.test(html));
  if(v.kind==='polygon_gallery') check(`${t.templateId} ${i}: gallery renders four figure ids`,(html.match(/data-figure-id=/g)||[]).length===4);
  if(v.kind==='symmetry_candidates') check(`${t.templateId} ${i}: four candidate axes rendered`,(html.match(/data-axis-id=/g)||[]).length===4);
  if(v.kind==='polygon_pattern_builder') check(`${t.templateId} ${i}: builder slot count rendered`,(html.match(/data-builder-slot=/g)||[]).length===v.slots);
}

function semanticCheck(t,raw,i){
  const v=raw.value, d=raw.distractors||[], m=raw.meta||{}, a=t.archetypeId;
  if(a==='identify_polygon_from_picture'){
    const f=v.visual.figures[0],o=POLYGON[f.polygonId];coverage.polygon.add(f.polygonId);
    check(`${t.templateId} ${i}: picture polygon known`,!!o);
    check(`${t.templateId} ${i}: answer equals pictured polygon`,v.answer.id===f.polygonId);
    check(`${t.templateId} ${i}: side metadata matches oracle`,o&&f.sides===o.sides&&m.semanticProperties.sideCount===o.sides);
  } else if(a==='identify_polygon_from_sides'){
    const o=POLYGON[v.answer.id];coverage.polygon.add(v.answer.id);
    check(`${t.templateId} ${i}: answer polygon known`,!!o);
    check(`${t.templateId} ${i}: structured side count uniquely identifies answer`,o&&m.semanticProperties.sideCount===o.sides);
    const valid=[v.answer].concat(d).filter(c=>POLYGON[c.id]&&POLYGON[c.id].sides===m.semanticProperties.sideCount);
    check(`${t.templateId} ${i}: semanticValidOptionCount === 1`,valid.length===1,{ids:valid.map(x=>x.id)});
  } else if(a==='select_named_regular_polygon'){
    const f=v.visual.figures.find(x=>x.id===v.answer.id);coverage.polygon.add(m.semanticProperties.polygonId);
    check(`${t.templateId} ${i}: answer points at rendered figure`,!!f);
    check(`${t.templateId} ${i}: rendered answer polygon matches target`,f&&f.polygonId===m.semanticProperties.polygonId);
    check(`${t.templateId} ${i}: gallery contains all four regular polygon ids`,new Set(v.visual.figures.map(x=>x.polygonId)).size===4);
  } else if(a==='continue_regular_polygon_pattern'){
    const seq=v.visual.sequence, unit=shortestPeriod(seq);coverage.patternLengths.add(unit.length);
    const expected=unit[seq.length%unit.length];
    check(`${t.templateId} ${i}: shown sequence has non-trivial repeating unit`,unit.length>=2&&unit.length<=3,{unit});
    check(`${t.templateId} ${i}: expected next derived independently`,v.answer.id===expected,{answer:v.answer.id,expected,seq});
    check(`${t.templateId} ${i}: metadata expectedNext agrees`,m.semanticProperties.expectedNextId===expected);
    const valid=[v.answer].concat(d).filter(c=>c.id===expected);
    check(`${t.templateId} ${i}: exactly one next-pattern option valid`,valid.length===1);
  } else if(a==='identify_smallest_repeating_unit'){
    const seq=v.visual.sequence, unit=shortestPeriod(seq);coverage.patternLengths.add(unit.length);
    const expectedId='unit:'+unit.join('-');
    check(`${t.templateId} ${i}: smallest unit length 2 or 3`,unit.length===2||unit.length===3,{unit});
    check(`${t.templateId} ${i}: answer encodes independently-derived smallest unit`,v.answer.id===expectedId,{answer:v.answer.id,expectedId});
    check(`${t.templateId} ${i}: generator unit matches independent unit`,eq(m.semanticProperties.unit,unit));
  } else if(a==='construct_regular_polygon_pattern'){
    const inter=v.interaction,unit=v.visual.unit,expected=repeat(unit,inter.slots);coverage.patternLengths.add(unit.length);
    check(`${t.templateId} ${i}: interactive sequence_build contract`,inter.type==='sequence_build'&&inter.slots>=6);
    check(`${t.templateId} ${i}: expected sequence exactly repeats displayed unit`,eq(inter.expectedSequence,expected),{unit,expected,got:inter.expectedSequence});
    check(`${t.templateId} ${i}: palette covers every required polygon`,new Set(inter.paletteIds).size===4&&expected.every(x=>inter.paletteIds.includes(x)));
    check(`${t.templateId} ${i}: answer encodes expected sequence`,v.answer.id==='sequence:'+expected.join('-'));
  } else if(a==='identify_symmetry_axis_count'){
    const sid=v.visual.shape.shapeId,axes=SYMMETRY[sid];coverage.symmetry.add(sid);
    check(`${t.templateId} ${i}: symmetry shape known`,!!axes);
    check(`${t.templateId} ${i}: axis count matches independent oracle`,axes&&Number(v.answer.id)===axes.length,{sid,answer:v.answer.id,axes});
    check(`${t.templateId} ${i}: structured axis angles match oracle`,axes&&eq(normAngles(m.semanticProperties.axisAngles),normAngles(axes)));
  } else if(a==='select_valid_symmetry_axis'){
    const sid=v.visual.shape.shapeId,axes=SYMMETRY[sid],cand=v.visual.candidates;coverage.symmetry.add(sid);
    check(`${t.templateId} ${i}: symmetry shape known`,!!axes);
    const valid=cand.filter(c=>axes&&axes.includes(Number(c.angle)));
    check(`${t.templateId} ${i}: semanticValidOptionCount === 1`,valid.length===1,{sid,candidates:cand.map(c=>c.angle),valid:valid.map(c=>c.angle)});
    check(`${t.templateId} ${i}: intended answer is the unique valid axis`,valid.length===1&&v.answer.id===valid[0].id,{answer:v.answer.id,valid:valid[0]&&valid[0].id});
    check(`${t.templateId} ${i}: every distractor angle guaranteed outside true-axis set`,d.every(x=>{const c=cand.find(y=>y.id===x.id);return c&&!axes.includes(Number(c.angle));}));
    const lineDistance=(a,b)=>{const d=Math.abs(Number(a)-Number(b))%180;return Math.min(d,180-d);};
    const wrongCand=cand.filter(c=>!axes.includes(Number(c.angle)));
    check(`${t.templateId} ${i}: wrong axes stay >= 12 degrees from every true axis for visual fairness`,wrongCand.every(c=>Math.min(...axes.map(a=>lineDistance(c.angle,a)))>=12),{sid,candidates:cand.map(c=>c.angle),axes});
    check(`${t.templateId} ${i}: candidate axes have distinct orientations`,new Set(cand.map(c=>String(c.angle))).size===4);
  } else if(a==='draw_valid_symmetry_axis'){
    const sid=v.visual.shape.shapeId,axes=SYMMETRY[sid],inter=v.interaction;coverage.symmetry.add(sid);
    check(`${t.templateId} ${i}: draw-axis interaction contract`,inter.type==='draw_axis'&&inter.requirement==='one_valid_axis'&&inter.angleToleranceDeg>0&&inter.mustPassThroughCenter===true&&inter.centerToleranceRatio>0&&inter.centerToleranceRatio<=0.1);
    check(`${t.templateId} ${i}: accepted axes exactly equal independent oracle`,axes&&eq(normAngles(inter.acceptedAxisAngles),normAngles(axes)),{sid,got:inter.acceptedAxisAngles,expected:axes});
    check(`${t.templateId} ${i}: metadata axis set equals oracle`,axes&&eq(normAngles(m.semanticProperties.axisAngles),normAngles(axes)));
  }
}

function run(t,i,seed,record=true){
  const fn=gens.get(t.generator);check(`${t.templateId}: generator registered`,!!fn);if(!fn)return null;
  let raw;try{raw=fn(t.params,mulberry32(hashSeed(`${seed}::${t.templateId}::${i}`)));check(`${t.templateId} ${i}: generator no throw`,true);}catch(e){check(`${t.templateId} ${i}: generator no throw`,false,{error:e.message});return null;}
  const v=raw&&raw.value,d=raw&&raw.distractors||[],m=raw&&raw.meta||{};
  if(!v){check(`${t.templateId} ${i}: value exists`,false);return null;}
  check(`${t.templateId} ${i}: answer exists`,!!(v.answer&&typeof v.answer.id==='string'&&v.answer.id));
  check(`${t.templateId} ${i}: prompt non-empty`,typeof v.promptMs==='string'&&v.promptMs.trim().length>0);
  check(`${t.templateId} ${i}: archetype matches template`,m.archetype===t.archetypeId);
  check(`${t.templateId} ${i}: misconception metadata matches template`,eq((m.misconceptionTargets||[]).slice().sort(),t.misconceptionTargets.slice().sort()));
  check(`${t.templateId} ${i}: fingerprint present`,typeof m.fingerprint==='string'&&m.fingerprint.length>5);
  if(t.responseType==='mcq'){
    check(`${t.templateId} ${i}: exactly 3 distractors`,d.length===3,{got:d.length});
    const ids=d.map(x=>x.id),labels=d.map(x=>x.labelMs);
    check(`${t.templateId} ${i}: distractor ids unique`,new Set(ids).size===ids.length);
    check(`${t.templateId} ${i}: distractor labels unique`,new Set(labels).size===labels.length,{labels});
    check(`${t.templateId} ${i}: answer id not duplicated`,!ids.includes(v.answer.id));
    check(`${t.templateId} ${i}: answer label not duplicated`,!labels.includes(v.answer.labelMs));
    check(`${t.templateId} ${i}: distractor misconception tags present`,d.every(x=>typeof x.misconceptionTag==='string'&&x.misconceptionTag.length>0));
  } else {
    check(`${t.templateId} ${i}: interactive has zero MCQ distractors`,t.responseType==='interactive'&&d.length===0);
    check(`${t.templateId} ${i}: interaction contract exists`,!!v.interaction&&typeof v.interaction.type==='string');
  }
  check(`${t.templateId} ${i}: wording hygiene`,!/[\b](undefined|NaN|null)[\b]|\[object Object\]/.test([v.promptMs,v.answer&&v.answer.labelMs].concat(d.map(x=>x.labelMs)).join(' ')));
  semanticCheck(t,raw,i);
  if(t.renderer){const rf=rends.get(t.renderer);check(`${t.templateId}: renderer registered`,!!rf);if(rf){try{const html=rf(v,t.params);validateMarkup(t,v.visual,html,i);}catch(e){check(`${t.templateId} ${i}: renderer no throw`,false,{error:e.message});}}}
  if(record){perTemplate[t.templateId]||(perTemplate[t.templateId]={samples:0,fps:new Map()});const b=perTemplate[t.templateId];b.samples++;b.fps.set(m.fingerprint,(b.fps.get(m.fingerprint)||0)+1);perCompetency[t.competencyId]=(perCompetency[t.competencyId]||0)+1;perArchetype[t.archetypeId]=(perArchetype[t.archetypeId]||0)+1;}
  return raw;
}

for(const t of targetTemplates)for(let i=0;i<N;i++)run(t,i,BASE,true);
for(const id of Object.values(expectedIds))check(`competency ${id} >=500 samples`,(perCompetency[id]||0)>=500,{got:perCompetency[id]||0});
check('total Phase 2A-2 samples >=1500',Object.values(perCompetency).reduce((a,b)=>a+b,0)>=1500);
check('all four regular polygon types exercised',coverage.polygon.size===4,{got:Array.from(coverage.polygon)});
check('all six symmetry shapes exercised',coverage.symmetry.size===6,{got:Array.from(coverage.symmetry)});
check('both pattern unit lengths 2 and 3 exercised',coverage.patternLengths.has(2)&&coverage.patternLengths.has(3),{got:Array.from(coverage.patternLengths)});

// Determinism uses full generated JSON, not fingerprint only.
let same=true,diff=0,total=0;
for(const t of targetTemplates)for(let i=0;i<30;i++){
  const fn=gens.get(t.generator);
  const s1=JSON.stringify(fn(t.params,mulberry32(hashSeed(`${BASE}::${t.templateId}::${i}`))));
  const s2=JSON.stringify(fn(t.params,mulberry32(hashSeed(`${BASE}::${t.templateId}::${i}`))));
  const s3=JSON.stringify(fn(t.params,mulberry32(hashSeed(`${BASE+991}::${t.templateId}::${i}`))));
  if(s1!==s2)same=false;if(s1!==s3)diff++;total++;
}
check('identical seed reproduces byte-identical generated JSON',same);
check('different seed changes >=20% generated samples',diff/total>=0.2,{diff,total,ratio:diff/total});

console.log('\n--- Per-template diversity ---');
for(const t of targetTemplates){const b=perTemplate[t.templateId];const max=Math.max(...b.fps.values());console.log(`  ${t.templateId}: samples=${b.samples} distinctFingerprints=${b.fps.size} maxRepeat=${max}`);}
console.log('\n--- Per-competency samples ---');for(const [k,v] of Object.entries(perCompetency))console.log(`  ${k}: ${v}`);
console.log('\n--- Coverage ---');console.log('  polygons:',Array.from(coverage.polygon).sort().join(', '));console.log('  symmetry shapes:',Array.from(coverage.symmetry).sort().join(', '));console.log('  pattern unit lengths:',Array.from(coverage.patternLengths).sort().join(', '));
console.log(`\n${passed} passed, ${failed} failed (across ${Object.values(perCompetency).reduce((a,b)=>a+b,0)} samples)`);
if(failures.length){console.log('\n--- Failures (first 80) ---');for(const f of failures)console.log('  FAIL',f.label,f.context?JSON.stringify(f.context):'');}
process.exitCode=failed?1:0;
