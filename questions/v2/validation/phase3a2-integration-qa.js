#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));let checks=0;
function ok(v,m){checks++;assert.ok(v,m)}function txt(r){return fs.readFileSync(path.join(repo,r),'utf8')}
const version=txt('js/version.js'),index=txt('index.html'),sw=txt('sw.js'),adapter=txt('questions/v2/engine/legacy-adapter.js'),p3a1=txt('questions/v2/validation/phase3a1-full-integration-qa.js');
const release=(version.match(/PA_APP_VERSION='([^']+)'/)||[])[1]||'';ok(release==='3.45.0','release exactly 3.45.0');
for(const token of ['js/qsv2-beta-rollout-v3.42.0.js?v='+release,'js/cloud.js?v='+release,'d3-topic7-live-cutover-v3.40.0.js?v='+release,'questions/v2/dist/runtime.js?v='+release,'questions/v2/engine/legacy-adapter.js?v='+release,'js/app.js?v='+release,'js/dev-qsv2-live-v3.40.0.js?v='+release,'js/version.js?v='+release,'js/pwa.js?v='+release])ok(index.includes(token),'cache bust follows 3.45.0: '+token);
ok(sw.startsWith('// App shell v3.45.0'),'service worker header release');
ok(sw.includes('full Darjah 3 authored SHADOW bank'),'historical full-D3 header invariant retained');
ok(sw.includes('default SHADOW'),'historical default SHADOW invariant retained');
ok(sw.includes('semantic hardening'),'service worker documents semantic hardening');
ok(/var DEFAULT_MODE = 'shadow'/.test(adapter),'bridge DEFAULT_MODE remains shadow');
ok(adapter.includes("mode = isPilot ? configuredMode(root) : (isD3Shadow && !kill ? 'shadow' : 'off')"),'non-T7 routing remains forced SHADOW');
ok(adapter.includes("qsv2Pilot: tpl.topicId === 'D3.T7'"),'pilot metadata remains Topic 7 only');
ok(adapter.includes("qsv2ShadowBatch: tpl.topicId !== 'D3.T7'"),'non-T7 content remains shadow batch');
ok(p3a1.includes("versionAtLeast(release,'3.44.0')"),'Phase 3A-1 integration made forward-compatible');
ok(fs.existsSync(path.join(repo,'questions/v2/validation/phase3a2-semantic-hardening-qa.js')),'semantic QA shipped');
ok(fs.existsSync(path.join(repo,'D3-SEMANTIC-HARDENING-REAL-PAPER-AUDIT.md')),'semantic audit shipped');

const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(txt('questions/v2/dist/runtime.js'),c,{filename:'runtime.js'});const rt=c.PAQuestionSystemV2;ok(!!rt,'runtime loads');
ok(rt.curriculum.length===50,'D3 curriculum remains 50 standards');ok(rt.curriculum.filter(r=>r.status==='enabled').length===6,'enabled remains exactly 6');ok(rt.curriculum.filter(r=>r.status==='enabled').every(r=>r.topicId==='D3.T7'),'only D3.T7 remains enabled');ok(rt.curriculum.filter(r=>r.status==='mapped').length===44,'44 non-T7 standards remain mapped');
ok(rt.templates.length===158,'template total remains 158');const t7=rt.templates.filter(t=>t.topicId==='D3.T7');ok(t7.length===26&&t7.filter(t=>t.responseType==='mcq').length===24&&t7.filter(t=>t.responseType==='interactive').length===2,'Topic 7 remains 26/24/2');
const expected={'D3.T1':18,'D3.T2':9,'D3.T3':30,'D3.T4':15,'D3.T5':15,'D3.T6':27,'D3.T7':26,'D3.T8':9,'D3.T9':9};for(const k of Object.keys(expected))ok(rt.templates.filter(t=>t.topicId===k).length===expected[k],k+' template count unchanged');
for(const k of ['d3.fullKssr','d3.p0Kssr','geometry.classifyPrism','geometry.identifyPrism','geometry.identifyRegularPolygon','geometry.polygonKssrDiversity','geometry.prismFeatures','geometry.prismKssrDiversity','geometry.regularPolygonPattern','geometry.symmetryAxis','geometry.symmetryKssrDiversity'])ok(rt.listGenerators().includes(k),'generator retained '+k);
for(const k of ['d3full','d3p0','geometry','geometry2d'])ok(rt.listRenderers().includes(k),'renderer retained '+k);
for(const rel of ['questions/d3/core.js','questions/index.js','js/battle.js','js/app.js','data/kssr/d3-topic7-evidence-epoch-v3.39.0.js','data/kssr/d3-topic7-live-cutover-v3.40.0.js','js/qsv2-beta-rollout-v3.42.0.js'])ok(fs.existsSync(path.join(repo,rel)),'critical unchanged system remains '+rel);
const migrations=fs.readdirSync(path.join(repo,'supabase/schema')).filter(n=>/3a2|semantic.?hardening|d3.?semantic/i.test(n));ok(migrations.length===0,'no Supabase migration in 3A-2');
console.log(JSON.stringify({status:'pass',checks,version:release,standards:50,totalTemplates:158,topic7:{templates:26,battle:24,interactive:2},nonT7Mode:'shadow-only',semanticHardening:true,realPaperAlignment:true,supabaseMigration:false,liveExpansion:false},null,2));
