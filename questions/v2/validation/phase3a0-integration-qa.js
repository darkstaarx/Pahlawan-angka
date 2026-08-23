#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const repo=path.resolve(process.argv[2]||process.cwd());let passed=0,failed=0;const failures=[];
function ok(v,m,c){if(v){passed++;return true;}failed++;if(failures.length<80)failures.push({message:m,context:c||null});return false}
function versionAtLeast(v,min){const a=String(v).split('.').map(Number),b=String(min).split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false;}return true}
function txt(rel){return fs.readFileSync(path.join(repo,rel),'utf8')}
function json(rel){return JSON.parse(txt(rel))}
const version=txt('js/version.js'),index=txt('index.html'),sw=txt('sw.js'),adapter=txt('questions/v2/engine/legacy-adapter.js'),cut=txt('data/kssr/d3-topic7-live-cutover-v3.40.0.js'),roll=txt('js/qsv2-beta-rollout-v3.42.0.js'),p2d4=txt('questions/v2/validation/phase2d4-integration-qa.js'),curr=json('questions/v2/curriculum/kssr-e3-2024/d3.json');
const release=(version.match(/PA_APP_VERSION='([^']+)'/)||[])[1]||'';
ok(versionAtLeast(release,'3.43.0'),'release is at least 3.43.0');
for(const token of [
 'js/qsv2-beta-rollout-v3.42.0.js?v='+release,
 'js/cloud.js?v='+release,
 'd3-topic7-live-cutover-v3.40.0.js?v='+release,
 'questions/v2/dist/runtime.js?v='+release,
 'questions/v2/engine/legacy-adapter.js?v='+release,
 'js/app.js?v='+release,
 'js/dev-qsv2-live-v3.40.0.js?v='+release,
 'js/version.js?v='+release,
 'js/pwa.js?v='+release
])ok(index.includes(token),`index cache follows 3.43 release: ${token}`);
ok(sw.startsWith('// App shell v'+release),'service worker header follows 3.43 release');
ok(sw.includes('default SHADOW'),'service worker still documents SHADOW default');
ok(/var DEFAULT_MODE = 'shadow'/.test(adapter),'bridge DEFAULT_MODE remains shadow');
ok(adapter.includes('cutover.authorizeLive'),'bridge still delegates LIVE authorization');
ok(roll.includes("ROLLOUT_KEY='d3_topic7_beta_live'")&&roll.includes("AUDIENCE='consented_beta_guardians'"),'remote rollout remains D3 Topic 7 only');
ok(cut.includes("const SKILL_ID='D3.SHAPE'")&&cut.includes("const TOPIC_ID='D3.T7'"),'cutover remains scoped to D3.SHAPE / D3.T7');
ok(cut.includes("prep.topic.status='beta_live'")&&cut.includes("prep.topic.status='controlled_live'"),'beta and admin cutover paths retained');
ok(cut.includes('killActive()'),'kill switch still enforced');

const records=curr.standards||[];
ok(records.length===50,'D3 curriculum remains 50 records');
ok(records.filter(r=>r.status==='enabled').length===6,'enabled count stays 6');
ok(records.filter(r=>r.status==='enabled').every(r=>r.topicId==='D3.T7'),'no new D3 topic silently enabled');
ok(records.every(r=>r.competencyIdStatus==='canonical'),'all D3 competency IDs now canonical');

const runtimeFile=path.join(repo,'questions/v2/dist/runtime.js');ok(fs.existsSync(runtimeFile),'runtime artifact exists');
if(fs.existsSync(runtimeFile)){
 const c={console};c.window=c;vm.createContext(c);vm.runInContext(txt('questions/v2/dist/runtime.js'),c,{filename:'runtime.js'});
 const rt=c.PAQuestionSystemV2;ok(!!rt,'runtime API loads');
 if(rt){
  ok(rt.curriculum.length===50,'runtime bundles 50 D3 curriculum records');
  ok(rt.curriculum.every(r=>r.competencyIdStatus==='canonical'),'runtime bundles canonical full-year curriculum');
  const t7=rt.templates.filter(t=>t.grade===3&&t.topicId==='D3.T7');
  ok(t7.length===26,'Topic 7 template count unchanged at 26');
  ok(t7.filter(t=>t.responseType==='mcq').length===24,'Topic 7 battle MCQ count unchanged at 24');
  ok(t7.filter(t=>t.responseType==='interactive').length===2,'Topic 7 interactive count unchanged at 2');
  const topic7Generators=['geometry.classifyPrism','geometry.identifyPrism','geometry.identifyRegularPolygon','geometry.polygonKssrDiversity','geometry.prismFeatures','geometry.prismKssrDiversity','geometry.regularPolygonPattern','geometry.symmetryAxis','geometry.symmetryKssrDiversity'];
  ok(topic7Generators.every(k=>rt.listGenerators().includes(k)),'Topic 7 generator registry remains present after later phases');
  ok(['geometry','geometry2d'].every(k=>rt.listRenderers().includes(k)),'Topic 7 renderer registry remains present after later phases');
 }
}

ok(p2d4.includes("versionAtLeast(release,'3.42.0')"),'Phase 2D-4 historical integration accepts later release');
ok(p2d4.includes("'js/qsv2-beta-rollout-v3.42.0.js?v='+release"),'Phase 2D-4 rollout cache assertion follows current release');
ok(p2d4.includes("'d3-topic7-live-cutover-v3.40.0.js?v='+release"),'Phase 2D-4 cutover cache assertion follows current release');
const sqlFiles=fs.readdirSync(path.join(repo,'supabase/schema')).filter(n=>/3a0|full.?year|canonical/i.test(n));ok(sqlFiles.length===0,'no Supabase migration added for curriculum canonicalization');
for(const rel of ['questions/d3/core.js','js/battle.js','questions/index.js','data/kssr/d3-topic7-evidence-epoch-v3.39.0.js'])ok(fs.existsSync(path.join(repo,rel)),`critical existing ${rel} remains present`);

if(failures.length)console.error(JSON.stringify(failures,null,2));
console.log(JSON.stringify({status:failed?'fail':'pass',checks:passed+failed,passed,failed,version:release,d3Standards:50,canonical:50,mapped:44,enabled:6,liveTopic:'D3.T7 only',topic7Templates:26,defaultMode:'shadow',supabaseMigration:false},null,2));
process.exit(failed?1:0);
