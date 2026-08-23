#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'../../..');
const sourcePath=path.join(root,'data/kssr/d3-topic7-evidence-epoch-v3.39.0.js');
const source=fs.readFileSync(sourcePath,'utf8');
let pass=0,fail=0;
function ok(cond,msg){if(cond){pass++;return}fail++;console.error('FAIL:',msg)}
function eq(a,b,msg){ok(JSON.stringify(a)===JSON.stringify(b),msg+`\n expected=${JSON.stringify(b)}\n actual=${JSON.stringify(a)}`)}

function makeContext(){
  const stored={};let cloudSaves=0;
  const ctx={
    console,
    Date,
    JSON,
    Math,
    setTimeout:(fn)=>{fn();return 1},
    clearTimeout:()=>{},
    localStorage:{
      setItem:(k,v)=>{stored[k]=String(v)},
      getItem:k=>Object.prototype.hasOwnProperty.call(stored,k)?stored[k]:null,
      removeItem:k=>{delete stored[k]}
    },
    PACloud:{scheduleSave:()=>{cloudSaves++}},
    __stored:stored,
    __cloudSaves:()=>cloudSaves
  };
  ctx.globalThis=ctx;
  vm.createContext(ctx);
  vm.runInContext(source,ctx,{filename:'d3-topic7-evidence-epoch-v3.39.0.js'});
  return ctx;
}
function baseSkill(overrides={}){
  return Object.assign({mastery:82,confidence:77,evidence:19,correct:15,wrong:4,hints:3,mis:{shape:2},lastSeen:1700000000000,stability:66,probePass:1,probeFail:0},overrides);
}
function baseDb(grade=3,skill=baseSkill()){
  return {name:'Test',schoolGrade:grade,skills:{'D3.SHAPE':skill},lastSavedAt:100,other:{keep:true}};
}
function fam(v){v=String(v||'default').replace(/[^A-Za-z0-9._-]/g,'-');return v.startsWith('D3.T7.')?v:'D3.T7.test.'+v}
function tpl(v){v=String(v||'default').replace(/[^A-Za-z0-9-]/g,'-');return /^D3-T7-/.test(v)?v:'D3-T7-test-'+v+'-v1'}
function q(comp,extra={}){
  const standards={
    identify_prism:'7.1.1',describe_prism_features:'7.1.2',classify_prism_vs_non_prism:'7.1.3',
    identify_regular_polygon:'7.2.1',create_regular_polygon_pattern:'7.2.2',identify_and_draw_symmetry_axis:'7.3.1'
  };
  const out=Object.assign({
    source:'qsv2',qsv2Pilot:true,curriculumVersion:'KSSR-E3-2024',competencyId:comp,standardId:standards[comp],
    familyKey:`family.${comp}.a`,archetypeId:`arch.${comp}.a`,representation:'visual',demand:'concept',templateId:`tpl-${comp}-a`,
    prompt:'SECRET PROMPT',answer:'SECRET ANSWER'
  },extra);
  out.familyKey=fam(out.familyKey);out.templateId=tpl(out.templateId);return out;
}
function res(id,extra={}){return Object.assign({attemptId:id,finalCorrect:true,firstAttemptCorrect:true,usedHint:false,responseType:'mcq'},extra)}

const ctx=makeContext(),api=ctx.PAD3Topic7Evidence;
ok(!!api,'API exported');
eq(api.version,'3.39.0','version');
eq(api.schemaVersion,1,'schema version');
eq(api.topicId,'D3.T7','topic');
eq(api.compatibilitySkillId,'D3.SHAPE','compatibility ID');
eq(api.epochId,'D3.T7:qsv2:v1','epoch ID');
eq(Object.keys(api.competencySpecs),['identify_prism','describe_prism_features','classify_prism_vs_non_prism','identify_regular_polygon','create_regular_polygon_pattern','identify_and_draw_symmetry_axis'],'six exact competencies');
eq(Object.values(api.competencySpecs).map(x=>x.standardId),['7.1.1','7.1.2','7.1.3','7.2.1','7.2.2','7.3.1'],'six exact standards');
eq(api.competencySpecs.create_regular_polygon_pattern.performanceInteraction,'sequence_build','pattern performance requirement');
eq(api.competencySpecs.identify_and_draw_symmetry_axis.performanceInteraction,'draw_axis','symmetry performance requirement');

const db=baseDb(),legacyBefore=JSON.parse(JSON.stringify(db.skills['D3.SHAPE']));
const e1=api.ensure(db);
ok(e1.ok,'ensure succeeds');ok(e1.changed,'first ensure changes state');
eq(db.skills['D3.SHAPE'],legacyBefore,'ensure does not mutate legacy skill aggregate');
ok(!!db.qsv2Evidence,'qsv2 store created');
eq(db.qsv2Evidence.schemaVersion,1,'store schema');
ok(!!db.qsv2Evidence.topics['D3.T7'],'topic state created');
const topic=db.qsv2Evidence.topics['D3.T7'];
eq(topic.status,'prepared_shadow','prepared in shadow');
eq(topic.compatibilitySkillId,'D3.SHAPE','topic compatibility key');
eq(topic.legacy.semantic,'rectangle_perimeter_and_sides','legacy semantic declared');
eq(topic.legacy.acceptedForTarget,false,'legacy evidence rejected for target');
eq(topic.legacy.baseline.mastery,82,'legacy mastery snapshot preserved');
eq(topic.legacy.baseline.evidence,19,'legacy evidence snapshot preserved');
eq(topic.target.semantic,'prism_polygon_symmetry','target semantic declared');
eq(topic.target.minCleanCorrect,3,'minimum clean evidence rule');
eq(topic.target.minDistinctFamilies,2,'family diversity rule');
ok(topic.target.requireReasoningOrApplication===true,'higher-demand evidence required');
eq(Object.keys(topic.competencies),Object.keys(api.competencySpecs),'all competency buckets initialized');
ok(Number(db.lastSavedAt)>100,'migration updates lastSavedAt');
ok(!!ctx.__stored['pa_coach_v6_full'],'migration persists local save');
eq(ctx.__cloudSaves(),1,'migration schedules cloud save once');

const snapshotAfterFirst=JSON.stringify(db.qsv2Evidence);
const e2=api.ensure(db);
ok(e2.ok,'second ensure succeeds');ok(!e2.changed,'second ensure idempotent');
eq(JSON.stringify(db.qsv2Evidence),snapshotAfterFirst,'idempotent ensure preserves evidence store');
eq(ctx.__cloudSaves(),1,'idempotent ensure does not reschedule save');

// Legacy aggregate may continue moving during SHADOW, but target evidence stays isolated.
db.skills['D3.SHAPE'].mastery=99;db.skills['D3.SHAPE'].evidence=88;
const s0=api.summary(db);
ok(s0.ok,'summary succeeds');
eq(s0.totalAttempts,0,'legacy attempts not counted as target attempts');
eq(s0.totalClean,0,'legacy correct evidence not counted as target clean');
eq(s0.secureCompetencies,0,'legacy mastery does not secure competencies');
eq(s0.legacyEvidenceAcceptedForTarget,false,'summary exposes legacy rejection');
eq(topic.legacy.baseline.mastery,82,'legacy baseline remains historical snapshot');

// Validation rejects anything outside exact QS v2 Topic 7 mapping.
eq(api.record(db,{source:'legacy'},res('x1')).reason,'not_qsv2_topic7','legacy question rejected');
eq(api.record(db,q('identify_prism',{qsv2Pilot:false}),res('x2')).reason,'not_qsv2_topic7','non-pilot v2 rejected');
eq(api.record(db,q('unknown'),res('x3')).reason,'unknown_competency','unknown competency rejected');
eq(api.record(db,q('identify_prism',{standardId:'7.1.2'}),res('x4')).reason,'standard_competency_mismatch','standard mismatch rejected');
eq(api.record(db,q('identify_prism',{curriculumVersion:'OTHER'}),res('x5')).reason,'curriculum_version_mismatch','curriculum mismatch rejected');
eq(api.record(db,q('identify_prism'),res('')).reason,'attempt_id_required','attempt ID required');

// Clean evidence and dedupe.
let r=api.record(db,q('identify_prism',{familyKey:'prism.picture',representation:'visual',demand:'concept',templateId:'p1'}),res('a1'));
ok(r.accepted,'clean prism attempt accepted');
eq(r.status,'developing','one clean attempt developing');
eq(api.record(db,q('identify_prism'),res('a1')).reason,'duplicate_attempt','duplicate attempt rejected');
let c=topic.competencies.identify_prism;
eq(c.attempts,1,'attempt count');eq(c.cleanCorrect,1,'clean count');eq(c.assistedCorrect,0,'assisted count initially');eq(c.firstAttemptWrong,0,'first wrong initially');eq(c.families[fam('prism.picture')],1,'family tracked');eq(c.representations.visual,1,'representation tracked');eq(c.templates[tpl('p1')],1,'template tracked');

// Assisted retry must not become clean evidence.
api.record(db,q('identify_prism',{familyKey:'prism.properties',representation:'text',demand:'reasoning',templateId:'p2'}),res('a2',{firstAttemptCorrect:false,usedHint:true}));
c=topic.competencies.identify_prism;
eq(c.attempts,2,'assisted attempt counted');eq(c.cleanCorrect,1,'assisted answer not clean');eq(c.assistedCorrect,1,'assisted correct tracked');eq(c.firstAttemptWrong,1,'first-attempt wrong tracked');eq(c.hintsUsed,1,'hint tracked');eq(c.reasoningOrApplicationClean,0,'assisted reasoning does not satisfy clean higher-demand');

// Three clean, two families, clean reasoning => secure for recognition/reasoning competency.
api.record(db,q('identify_prism',{familyKey:'prism.properties',representation:'text',demand:'reasoning',templateId:'p2'}),res('a3'));
api.record(db,q('identify_prism',{familyKey:'prism.discriminate',representation:'visual',demand:'reasoning',templateId:'p3'}),res('a4'));
c=topic.competencies.identify_prism;
eq(c.cleanCorrect,3,'three clean prism results');ok(c.reasoningOrApplicationClean>=1,'clean reasoning recorded');eq(api.competencyStatus(c),'secure','prism competency secure after explicit evidence rule');

// Pattern cannot become curriculum-secure on MCQ alone.
api.record(db,q('create_regular_polygon_pattern',{familyKey:'pat.continue',demand:'concept',templateId:'pat1'}),res('p1'));
api.record(db,q('create_regular_polygon_pattern',{familyKey:'pat.unit',demand:'reasoning',templateId:'pat2'}),res('p2'));
api.record(db,q('create_regular_polygon_pattern',{familyKey:'pat.unit2',demand:'reasoning',templateId:'pat3'}),res('p3'));
let pc=topic.competencies.create_regular_polygon_pattern;
eq(pc.cleanCorrect,3,'pattern has three clean MCQ results');ok(pc.reasoningOrApplicationClean>=1,'pattern reasoning present');eq(pc.requiredPerformanceSatisfied,false,'pattern construction still required');eq(api.competencyStatus(pc),'developing','pattern remains developing without construction');
api.record(db,q('create_regular_polygon_pattern',{familyKey:'pat.construct',demand:'application',templateId:'pat4',interaction:{type:'sequence_build'}}),res('p4',{responseType:'interactive',interactionType:'sequence_build'}));
pc=topic.competencies.create_regular_polygon_pattern;
eq(pc.requiredPerformanceSatisfied,true,'sequence-build satisfies pattern performance');eq(api.competencyStatus(pc),'secure','pattern secure only after clean construction evidence');

// Wrong interaction type must not satisfy symmetry drawing requirement.
api.record(db,q('identify_and_draw_symmetry_axis',{familyKey:'sym.count',demand:'concept',templateId:'s1'}),res('s1'));
api.record(db,q('identify_and_draw_symmetry_axis',{familyKey:'sym.select',demand:'reasoning',templateId:'s2'}),res('s2'));
api.record(db,q('identify_and_draw_symmetry_axis',{familyKey:'sym.other',demand:'application',templateId:'s3',interaction:{type:'sequence_build'}}),res('s3',{responseType:'interactive',interactionType:'sequence_build'}));
let sc=topic.competencies.identify_and_draw_symmetry_axis;
eq(sc.requiredPerformanceSatisfied,false,'wrong interaction does not satisfy draw-axis requirement');eq(api.competencyStatus(sc),'developing','symmetry remains developing without drawing');
api.record(db,q('identify_and_draw_symmetry_axis',{familyKey:'sym.draw',demand:'application',templateId:'s4',interaction:{type:'draw_axis'}}),res('s4',{responseType:'interactive',interactionType:'draw_axis'}));
sc=topic.competencies.identify_and_draw_symmetry_axis;
eq(sc.requiredPerformanceSatisfied,true,'draw-axis satisfies symmetry performance');eq(api.competencyStatus(sc),'secure','symmetry secure after drawing evidence');

// Incorrect final result records failure, never clean.
api.record(db,q('describe_prism_features',{familyKey:'feat.a',demand:'reasoning',templateId:'f1'}),res('f1',{finalCorrect:false,firstAttemptCorrect:false,usedHint:true}));
const fc=topic.competencies.describe_prism_features;
eq(fc.incorrect,1,'incorrect final tracked');eq(fc.cleanCorrect,0,'incorrect final not clean');

// Category fields are allowlisted so free text cannot leak into the cloud-synced game save.
const malicious=q('identify_regular_polygon');malicious.familyKey='D3.T7.SECRET PROMPT';malicious.templateId='SECRET-ANSWER';malicious.representation='essay';malicious.demand='free_text';
const mr=api.record(db,malicious,res('privacy1'));
ok(mr.accepted,'categorical evidence accepts question while sanitising unsafe metadata');
const mc=topic.competencies.identify_regular_polygon;
eq(mc.families.unknown,1,'unsafe family metadata reduced to unknown');
eq(mc.templates.unknown,1,'unsafe template metadata reduced to unknown');
eq(mc.demands.unknown,1,'unsafe demand metadata reduced to unknown');

// Store must never capture question prompt or answer content.
const serialized=JSON.stringify(db.qsv2Evidence);
ok(!serialized.includes('SECRET PROMPT'),'prompt content not persisted');ok(!serialized.includes('SECRET ANSWER'),'answer content not persisted');

// LIVE remains impossible in Phase 2D-1 even when evidence structure is ready.
const live=api.canActivateLive(db);
eq(live.allowed,false,'2D-1 cannot authorize live');eq(live.reason,'phase2d2_cutover_required','explicit 2D-2 cutover required');eq(live.legacyEvidenceAcceptedForTarget,false,'live gate preserves legacy rejection');

// Unsupported schema refuses instead of guessing/mutating.
const bad=baseDb();bad.qsv2Evidence={schemaVersion:99,topics:{}};
const badBefore=JSON.stringify(bad);
const badResult=api.ensure(bad);
eq(badResult.ok,false,'unsupported store schema rejected');eq(badResult.reason,'unsupported_store_schema','unsupported schema reason');eq(JSON.stringify(bad),badBefore,'unsupported schema leaves state untouched');

// Non-D3 profile with zero historical D3 evidence is not expanded unnecessarily.
const irrelevant=baseDb(2,baseSkill({mastery:0,confidence:8,evidence:0,correct:0,wrong:0,hints:0,lastSeen:0,stability:0,probePass:0,probeFail:0}));
const ir=api.ensure(irrelevant);
eq(ir.ok,false,'irrelevant untouched profile skipped');eq(ir.reason,'not_applicable','not-applicable reason');ok(!irrelevant.qsv2Evidence,'no unnecessary store on irrelevant profile');

// Historical D3 evidence on a different current grade still gets migration protection.
const historical=baseDb(4,baseSkill({evidence:2,correct:1,wrong:1}));
const hr=api.ensure(historical);
ok(hr.ok,'historical D3 evidence on older child migrated');eq(historical.qsv2Evidence.topics['D3.T7'].legacy.acceptedForTarget,false,'historical legacy evidence remains excluded');

// Dedupe list is bounded.
const bounded=baseDb();api.ensure(bounded);
for(let i=0;i<135;i++)api.record(bounded,q('identify_regular_polygon',{familyKey:'poly.'+(i%3),demand:i%2?'reasoning':'concept',templateId:'poly.'+(i%3)}),res('b'+i));
eq(bounded.qsv2Evidence.topics['D3.T7'].recentAttemptIds.length,120,'recent attempt IDs bounded');
eq(bounded.qsv2Evidence.topics['D3.T7'].recentAttemptIds[0],'b15','bounded list drops oldest IDs only');

// Summary is separate from legacy numeric mastery and reports competency security only.
const finalSummary=api.summary(db);
ok(finalSummary.ok,'final summary succeeds');eq(finalSummary.compatibilitySkillId,'D3.SHAPE','summary keeps compatibility ID');eq(finalSummary.competencies.identify_prism.status,'secure','summary reports prism secure');eq(finalSummary.competencies.create_regular_polygon_pattern.status,'secure','summary reports pattern secure');eq(finalSummary.competencies.identify_and_draw_symmetry_axis.status,'secure','summary reports symmetry secure');eq(finalSummary.curriculumSecure,false,'topic not secure while remaining competencies lack evidence');

console.log(JSON.stringify({status:fail?'fail':'pass',checks:pass+fail,passed:pass,failed:fail,topicId:api.topicId,compatibilitySkillId:api.compatibilitySkillId,epochId:api.epochId,legacyEvidenceAcceptedForTarget:false,liveAuthorization:'phase2d2_required'},null,2));
process.exit(fail?1:0);
