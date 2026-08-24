#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));let checks=0;
function ok(v,m){checks++;assert(v,m)}function txt(r){return fs.readFileSync(path.join(repo,r),'utf8')}function j(r){return JSON.parse(txt(r))}function versionAtLeast(v,min){const a=String(v).split('.').map(Number),b=String(min).split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false;}return true}
const version=txt('js/version.js'),index=txt('index.html'),sw=txt('sw.js'),adapter=txt('questions/v2/engine/legacy-adapter.js'),self=txt('questions/v2/validation/self-test.js'),p3a0=txt('questions/v2/validation/phase3a0-integration-qa.js');
const release=(version.match(/PA_APP_VERSION='([^']+)'/)||[])[1]||'';
ok(versionAtLeast(release,'3.44.0'),'release at least 3.44.0');
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
])ok(index.includes(token),`cache bust follows release: ${token}`);
ok(sw.startsWith('// App shell v'+release),'service worker header follows current release');
ok(sw.includes('full Darjah 3 authored SHADOW bank'),'service worker documents full D3 authoring');
ok(/var DEFAULT_MODE = 'shadow'/.test(adapter),'bridge DEFAULT_MODE remains shadow');
ok(adapter.includes("var D3_SHADOW_TOPICS = {'D3.T1':true,'D3.T2':true,'D3.T3':true,'D3.T4':true,'D3.T5':true,'D3.T6':true,'D3.T8':true,'D3.T9':true}"),'exact non-T7 shadow topic map');
for(const skill of ['D3.N10000','D3.PV10000','D3.ADD10000','D3.SUB10000','D3.MUL','D3.DIV','D3.FRAC','D3.DEC','D3.PERCENT','D3.MONEY','D3.TIME','D3.MEASURE','D3.POSITION','D3.DATA'])ok(adapter.includes("'"+skill+"':true"),`shadow skill map contains ${skill}`);
ok(adapter.includes("mode = isPilot ? configuredMode(root) : (isD3Shadow && !kill ? 'shadow' : 'off')"),'non-T7 routing forced shadow-only');
ok(adapter.includes("qsv2Pilot: tpl.topicId === 'D3.T7'"),'pilot metadata limited to Topic 7');
ok(adapter.includes("qsv2ShadowBatch: tpl.topicId !== 'D3.T7'"),'all non-T7 authored content tagged shadow batch');

const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(txt('questions/v2/dist/runtime.js'),c,{filename:'runtime.js'});const rt=c.PAQuestionSystemV2;
ok(!!rt,'runtime loads');
ok(rt.curriculum.length===50,'runtime curriculum 50');
ok(rt.curriculum.filter(r=>r.status==='enabled').length===6,'enabled remains exactly 6');
ok(rt.curriculum.filter(r=>r.status==='enabled').every(r=>r.topicId==='D3.T7'),'only Topic 7 enabled');
ok(rt.curriculum.filter(r=>r.status==='mapped').length===44,'44 non-T7 records remain mapped');
ok(rt.templates.length===158,'full runtime template total 158');
const nonT7=rt.templates.filter(t=>t.topicId!=='D3.T7');
ok(nonT7.length===132,'132 non-T7 authored templates');
ok(rt.templates.filter(t=>t.topicId==='D3.T1').length===18,'T1 18 templates');
ok(rt.templates.filter(t=>t.topicId==='D3.T4').length===15,'T4 15 templates');
ok(rt.templates.filter(t=>t.topicId==='D3.T8').length===9,'T8 9 templates');
const t7=rt.templates.filter(t=>t.topicId==='D3.T7');
ok(t7.length===26&&t7.filter(t=>t.responseType==='mcq').length===24&&t7.filter(t=>t.responseType==='interactive').length===2,'Topic 7 remains 26/24/2');
for(const k of ['d3.fullKssr','d3.p0Kssr','geometry.classifyPrism','geometry.identifyPrism','geometry.identifyRegularPolygon','geometry.polygonKssrDiversity','geometry.prismFeatures','geometry.prismKssrDiversity','geometry.regularPolygonPattern','geometry.symmetryAxis','geometry.symmetryKssrDiversity'])ok(rt.listGenerators().includes(k),`generator retained ${k}`);
for(const k of ['d3full','d3p0','geometry','geometry2d'])ok(rt.listRenderers().includes(k),`renderer retained ${k}`);
ok(self.includes('exactly 158 approved D3 templates are registered'),'self-test exact full-year template count');
ok(self.includes("'d3.fullKssr'")&&self.includes("'d3.p0Kssr'"),'self-test exact D3 generator inventory');
ok(self.includes("'d3full'")&&self.includes("'d3p0'"),'self-test exact D3 renderer inventory');
ok(p3a0.includes("versionAtLeast(release,'3.43.0')"),'Phase 3A-0 historical integration forward-compatible');
ok(p3a0.includes('Topic 7 generator registry remains present after later phases'),'Phase 3A-0 preserves Topic 7 generator invariant');
ok(p3a0.includes('Topic 7 renderer registry remains present after later phases'),'Phase 3A-0 preserves Topic 7 renderer invariant');

for(const rel of ['questions/d3/core.js','questions/index.js','js/battle.js','js/app.js','data/kssr/d3-topic7-evidence-epoch-v3.39.0.js','data/kssr/d3-topic7-live-cutover-v3.40.0.js','js/qsv2-beta-rollout-v3.42.0.js'])ok(fs.existsSync(path.join(repo,rel)),`critical ${rel} remains present`);
const migrations=fs.readdirSync(path.join(repo,'supabase/schema')).filter(n=>/3a1|full.?d3|full.?year.?author/i.test(n));ok(migrations.length===0,'no Supabase migration for full D3 authoring');

console.log(JSON.stringify({status:'pass',checks,version:release,d3TopicsAuthored:'9/9',standards:50,nonT7Templates:132,totalTemplates:158,enabledTopic:'D3.T7 only',nonT7Mode:'shadow-only',supabaseMigration:false,learnerVisibleExpansion:false},null,2));
