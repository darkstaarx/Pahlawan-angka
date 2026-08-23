#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'../../..');
const correctionPath=path.join(root,'data/kssr/d3-topic7-curriculum-correction-v3.38.0.js');
const curriculumPath=path.join(root,'questions/v2/curriculum/kssr-e3-2024/d3.json');
const expectedStandards=['7.1.1','7.1.2','7.1.3','7.2.1','7.2.2','7.3.1'];
const expectedCompetencies=[
  'identify_prism','describe_prism_features','classify_prism_vs_non_prism',
  'identify_regular_polygon','create_regular_polygon_pattern','identify_and_draw_symmetry_axis'
];
let passed=0,failed=0;
function ok(cond,msg){if(cond){passed++;return;}failed++;console.error('FAIL:',msg)}
function eq(a,b,msg){ok(JSON.stringify(a)===JSON.stringify(b),`${msg}\n  actual=${JSON.stringify(a)}\n  expected=${JSON.stringify(b)}`)}

function fixture(){
  const ctx={console};ctx.globalThis=ctx;ctx.window=ctx;
  vm.createContext(ctx);
  vm.runInContext(`
    const GRAPH={skills:[
      {id:'D2.7.3',grade:2,chapter:'7',domain:'Ruang',title:'Masalah ruang',prereq:[],role:'core'},
      {id:'D3.SHAPE',grade:3,chapter:'7',domain:'Ruang',title:'Bentuk & perimeter asas',prereq:['D2.7.3'],role:'core',textbookUnit:'7',textbookUnitTitle:'Bentuk'},
      {id:'D4.PERIM',grade:4,chapter:'7',domain:'Ruang',title:'Perimeter',prereq:['D3.SHAPE'],role:'core'}
    ]};
    const META=Object.fromEntries(GRAPH.skills.map(x=>[x.id,x]));
    const REC={'D3.SHAPE':['D2.7.3'],'D4.PERIM':['D3.SHAPE']};
    const STR={'D2.7.3':'D3.SHAPE','D3.SHAPE':'D4.PERIM','D4.PERIM':'D5.AREA'};
    window.PAMasteryKB={profiles:{'D3.SHAPE':{
      id:'D3.SHAPE',title:'Bentuk & perimeter asas',concepts:['ciri bentuk','hubungan ruang','pengiraan'],
      misconceptions:['shape','area'],recoverySequence:['manipulative','diagram','formula'],evidence:{requiredClean:3}
    }}};
    window.__fixture={GRAPH,META,REC,STR,shape:META['D3.SHAPE'],perim:META['D4.PERIM']};
  `,ctx);
  return ctx;
}
const source=fs.readFileSync(correctionPath,'utf8');
const ctx=fixture();
const f=ctx.__fixture,originalShape=f.shape,originalPerimPrereq=JSON.stringify(f.perim.prereq);
vm.runInContext(source,ctx,{filename:correctionPath});
const s=ctx.PAD3Topic7CurriculumCorrection;

ok(!!s&&s.applied===true,'correction applies');
ok(s.reason==='ok','status reason ok');
ok(f.META['D3.SHAPE']===originalShape,'D3.SHAPE object identity retained');
ok(f.META['D3.SHAPE'].id==='D3.SHAPE','persistent skill id unchanged');
ok(!f.META['D3.T7'],'no replacement persistent skill D3.T7 created');
ok(f.META['D3.SHAPE'].title==='Bentuk & perimeter asas','learner-facing title intentionally unchanged during SHADOW');
ok(s.learnerTitleChanged===false,'status confirms no learner title flip');
ok(f.META['D3.SHAPE'].curriculumTopicId==='D3.T7','curriculum topic identity corrected');
ok(f.META['D3.SHAPE'].curriculumTargetTitleMs==='Prisma, Poligon Sekata & Paksi Simetri','target curriculum title recorded');
eq(Array.from(f.META['D3.SHAPE'].curriculumStandardIds),expectedStandards,'exact six standard IDs');
eq(Array.from(f.META['D3.SHAPE'].curriculumCompetencyIds),expectedCompetencies,'exact six competency IDs');
ok(f.META['D3.SHAPE'].saveCompatibilityId==='D3.SHAPE','save compatibility key explicit');
eq(Array.from(f.META['D3.SHAPE'].legacyQuestionCoverage),['perimeter','missing_side','rectangle_property'],'legacy coverage explicitly documented');
ok(f.META['D3.SHAPE'].legacyQuestionRole==='shadow_fallback_only','legacy bank explicitly fallback-only');
ok(f.META['D3.SHAPE'].masteryCompatibility.legacyEvidenceAcceptedForTopic7===false,'legacy perimeter evidence cannot silently count as Topic 7 evidence');
ok(f.META['D3.SHAPE'].masteryCompatibility.requiresEpochMigrationBeforeLive===true,'mastery epoch migration gate recorded');
eq(Array.from(f.META['D3.SHAPE'].prereq),['D2.7.3'],'prerequisite preserved');
eq(Array.from(f.REC['D3.SHAPE']),['D2.7.3'],'recovery preserved');
ok(!Object.prototype.hasOwnProperty.call(f.STR,'D3.SHAPE'),'invalid D3.SHAPE -> D4.PERIM stretch removed');
ok(f.STR['D2.7.3']==='D3.SHAPE','valid Year 2 -> Year 3 stretch preserved');
ok(f.STR['D4.PERIM']==='D5.AREA','unrelated stretch preserved');
ok(JSON.stringify(f.perim.prereq)===originalPerimPrereq,'D4.PERIM graph prerequisite left unchanged for compatibility');
const p=ctx.PAMasteryKB.profiles['D3.SHAPE'];
ok(p.title==='Bentuk & perimeter asas','mastery profile learner-facing title not silently relabelled');
eq(Array.from(p.concepts),['ciri bentuk','hubungan ruang','pengiraan'],'mastery concepts not silently reinterpreted');
ok(p.curriculumTarget.topicId==='D3.T7','mastery profile receives non-operative target metadata');
ok(p.evidenceCompatibility.legacyEvidenceAcceptedForTarget===false,'mastery profile marks legacy evidence incompatible with target');

// Idempotency: running twice keeps the semantic contract stable.
vm.runInContext(source,ctx,{filename:correctionPath});
eq(Array.from(f.META['D3.SHAPE'].curriculumStandardIds),expectedStandards,'idempotent standards');
ok(!Object.prototype.hasOwnProperty.call(f.STR,'D3.SHAPE'),'idempotent stretch suppression');

// Cross-check against the actual authored curriculum source of truth.
const curriculumDoc=JSON.parse(fs.readFileSync(curriculumPath,'utf8'));
const curriculum=curriculumDoc.standards||[];
const enabled=curriculum.filter(r=>r.topicId==='D3.T7'&&r.status==='enabled');
eq(enabled.map(r=>r.standardId).sort(),[...expectedStandards].sort(),'correction standards equal enabled D3.T7 registry standards');
eq(enabled.map(r=>r.competencyId).sort(),[...expectedCompetencies].sort(),'correction competencies equal enabled D3.T7 registry competencies');
ok(curriculum.length===50,'D3 curriculum remains 50 records');
ok(curriculum.filter(r=>r.status==='enabled').length===6,'enabled count remains 6');
ok(curriculum.filter(r=>r.status==='mapped').length===44,'mapped count remains 44');

// Guard behavior: mismatch means no mutation instead of guessing.
const bad=fixture();
vm.runInContext(`__fixture.META['D3.SHAPE'].domain='Ukuran'`,bad);
vm.runInContext(source,bad,{filename:correctionPath});
ok(bad.PAD3Topic7CurriculumCorrection.applied===false,'contract mismatch refuses correction');
ok(bad.PAD3Topic7CurriculumCorrection.reason==='skill_contract_mismatch','contract mismatch reason stable');
ok(bad.__fixture.STR['D3.SHAPE']==='D4.PERIM','refused correction leaves stretch untouched');

console.log(JSON.stringify({status:failed?'fail':'pass',checks:passed+failed,passed,failed,compatibilitySkillId:'D3.SHAPE',curriculumTopicId:'D3.T7',learnerTitleChanged:false,legacyEvidenceAcceptedForTopic7:false,enabled:6,mapped:44},null,2));
process.exit(failed?1:0);
