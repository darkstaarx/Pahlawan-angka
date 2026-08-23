#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'../../..');
let pass=0,fail=0;
function check(cond,msg){if(cond){pass++;return}fail++;console.error('FAIL:',msg)}
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
function count(hay,needle){return hay.split(needle).length-1}

const index=read('index.html');
const sw=read('sw.js');
const app=read('js/app.js');
const version=read('js/version.js');
const correction=read('data/kssr/d3-topic7-curriculum-correction-v3.38.0.js');
const evidence=read('data/kssr/d3-topic7-evidence-epoch-v3.39.0.js');
const adapter=read('questions/v2/engine/legacy-adapter.js');
const cloud=read('js/cloud.js');
const releaseMatch=version.match(/PA_APP_VERSION='([^']+)'/);
const releaseVersion=releaseMatch?releaseMatch[1]:'';
function versionAtLeast(v,min){const a=String(v).split('.').map(Number),b=String(min).split('.').map(Number);for(let i=0;i<3;i++){const x=a[i]||0,y=b[i]||0;if(x!==y)return x>y}return true}

check(versionAtLeast(releaseVersion,'3.39.0'),'release version is at least 3.39.0');
check(index.includes('data/kssr/d3-topic7-evidence-epoch-v3.39.0.js?v=3.39.0'),'evidence epoch script loaded');
check(index.indexOf('d3-topic7-curriculum-correction-v3.38.0.js')<index.indexOf('d3-topic7-evidence-epoch-v3.39.0.js'),'evidence layer loads after curriculum correction');
check(index.indexOf('d3-topic7-evidence-epoch-v3.39.0.js')<index.indexOf('js/app.js?v='+releaseVersion),'evidence API loads before app init');
check(count(index,'d3-topic7-evidence-epoch-v3.39.0.js')===1,'evidence script loaded exactly once');
check(index.includes('js/app.js?v='+releaseVersion),'app cache-bust follows current release');
check(index.includes('js/version.js?v='+releaseVersion),'version cache-bust follows current release');
check(index.includes('js/pwa.js?v='+releaseVersion),'pwa cache-bust follows current release');
check(sw.startsWith('// App shell v'+releaseVersion),'service worker header follows current release');
check(sw.includes("'./data/kssr/d3-topic7-evidence-epoch-v3.39.0.js'"),'service worker precaches evidence module');
check(count(sw,'d3-topic7-evidence-epoch-v3.39.0.js')===1,'service worker precache has one evidence entry');

check(app.includes("function initAll(){GRAPH.skills.forEach(x=>initSkill(x.id));window.PAD3Topic7Evidence?.ensure?.(db)}"),'initAll performs lazy evidence migration');
check(count(app,'PAD3Topic7Evidence?.ensure?.(db)')===1,'app has one migration hook');
check(!app.includes('PAD3Topic7Evidence.record('),'Phase 2D-1 does not record learner answers yet');

check(adapter.includes("var DEFAULT_MODE = 'shadow'"),'QS v2 remains default SHADOW');
check(adapter.includes("if (mode === 'shadow')"),'shadow path remains explicit');
check(correction.includes("legacyEvidenceAcceptedForTopic7:false"),'Phase 2D-0 legacy-evidence rejection remains');
check(correction.includes("requiresEpochMigrationBeforeLive:true"),'pre-LIVE migration gate remains active');
check(correction.includes("const SKILL_ID='D3.SHAPE'"),'persistent compatibility skill remains D3.SHAPE');
check(correction.includes("const LEGACY_TITLE='Bentuk & perimeter asas'"),'legacy learner title contract remains');

check(evidence.includes("const STORE_KEY='qsv2Evidence'"),'parallel evidence store used');
check(evidence.includes("const EPOCH_ID='D3.T7:qsv2:v1'"),'explicit target evidence epoch');
check(evidence.includes("acceptedForTarget:false"),'legacy evidence excluded in epoch state');
check(evidence.includes("aggregateContinuesOutsideTargetEpoch:true"),'legacy aggregate explicitly outside target epoch');
check(evidence.includes("performanceInteraction:'sequence_build'"),'pattern construction evidence required');
check(evidence.includes("performanceInteraction:'draw_axis'"),'symmetry drawing evidence required');
check(evidence.includes("return {allowed:false,reason:'phase2d2_cutover_required'"),'2D-1 cannot authorize LIVE');
check(!evidence.includes('question.prompt'),'evidence recorder never reads prompt');
check(!evidence.includes('question.answer'),'evidence recorder never reads answer');
check(!evidence.includes('.from('),'evidence module performs no direct Supabase table write');

check(cloud.includes("state.client.from('game_saves').upsert"),'existing cloud save persists whole game state blob');
check(cloud.includes('state:snapshot'),'game save upsert stores JSON snapshot including additive extension');
check(!fs.existsSync(path.join(root,'supabase/schema/d3_topic7_evidence_epoch_v1.sql')),'no new Supabase schema migration introduced for evidence epoch');

const forbidden=['js/battle.js','js/engine/adaptive.js','data/kssr/mastery-knowledge-v1.js','questions/d3/core.js'];
for(const rel of forbidden)check(fs.existsSync(path.join(root,rel)),`existing ${rel} remains present`);

console.log(JSON.stringify({status:fail?'fail':'pass',checks:pass+fail,passed:pass,failed:fail,defaultMode:'shadow',compatibilitySkillId:'D3.SHAPE',evidenceEpoch:'D3.T7:qsv2:v1',liveAuthorization:'phase2d2_required'},null,2));
process.exit(fail?1:0);
