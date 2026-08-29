#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let pass=0,fail=0;
function check(ok,label){if(ok){pass++;console.log('PASS',label)}else{fail++;console.error('FAIL',label)}}
const heroes=read('js/heroes.js'),battle=read('js/battle.js'),moduleJs=read('js/hero-bunga-v2.0.0.js'),moduleCss=read('css/hero-bunga-v2.0.0.css'),html=read('index.html'),sw=read('sw.js'),version=read('js/version.js');
const assets=[...heroes.matchAll(/'((?:assets\/heroes\/bunga\/redesign-v1\/)[^']+)'/g)].map(x=>x[1]);
check(assets.length>=20,'Bunga v2 asset map is complete');
check(assets.every(p=>fs.existsSync(path.join(root,p))),'Every mapped Bunga v2 asset exists');
check(new Set(assets).size>=20,'Bunga body and FX layers are separately addressable');
check(assets.every(p=>p.includes('/runtime/')&&p.endsWith('.webp')),'Every mapped Bunga v2 asset uses optimized WebP runtime media');
check(/getNextNormalSkill/.test(moduleJs)&&/runSkill1/.test(moduleJs)&&/runSkill2/.test(moduleJs),'Two normal skills alternate through isolated module');
check(/finisher:\{form:1080,compress:1390,impact:1550,end:1810\}/.test(moduleJs),'Teorem Mekar form/compress/impact timeline is locked');
check(/!finisher&&pet/.test(battle),'Pet assist remains excluded from all finishers');
check(/bungaFinishing\?null/.test(battle)||/sidmaFinishing\|\|bungaFinishing/.test(battle),'Generic finisher shake/pulse is suppressed for Bunga');
check(/TEOREM MEKAR/.test(battle),'Bunga cinematic title is Teorem Mekar');
check(/hero-bunga-v2\.0\.0\.css/.test(html)&&/hero-bunga-v2\.0\.0\.js/.test(html),'Bunga module CSS/JS is loaded');
check(html.indexOf('hero-sidma-v1.0.0.js')<html.indexOf('hero-bunga-v2.0.0.js'),'Wrapper order preserves Sidma then Bunga delegation');
check(/finisher-bloom\{display:none!important\}/.test(moduleCss),'Legacy Bunga thorn finisher is hidden');
check(/attacking:not\(\.charging-finisher\).*animation:none/.test(moduleCss.replace(/\n/g,' ')),'Generic melee motion is disabled for stationary Bunga');
check(!/assets\/heroes\/wira/.test(moduleJs)&&!/assets\/heroes\/sidma/.test(moduleJs),'Bunga module does not reference Wira/Sidma assets');
check(/PA_APP_VERSION='3\.55\.2'/.test(version)&&/hero-bunga-v2\.0\.0\.js\?v=3\.54\.1/.test(html),'Bunga polish remains loaded under app release 3.55.2');
check(/bungaFinalRing/.test(moduleJs)&&/bunga-final-ring/.test(moduleCss),'Teorem Mekar uses a second geometric compression ring');
check(assets.every(p=>sw.includes(`./${p}`)),'Every mapped Bunga runtime asset is available offline');
console.log(`\n${pass} passed, ${fail} failed`);if(fail)process.exit(1);
