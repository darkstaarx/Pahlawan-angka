#!/usr/bin/env node
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('js/hero-wira-finisher-v1.0.0.js'),css=read('css/hero-wira-finisher-v1.0.0.css'),battle=read('js/battle.js'),html=read('index.html'),sw=read('sw.js');let pass=0,fail=0;
const check=(ok,label)=>{if(ok){pass++;console.log('PASS',label)}else{fail++;console.error('FAIL',label)}};
check(/form:1080,arc:1190,compress:1360,impact:1420,aftermath:1600,end:1750/.test(js),'Wira illustrated finisher timeline is locked');
check(/wiraFinishing\?1420/.test(battle),'Wira damage contact is synchronized at 1420ms');
check(/wira-frost-seal/.test(css)&&/wiraIceBurst/.test(js)&&/wiraIceEnd/.test(js),'Illustrated seal, burst and aftermath layers are present');
check(!/createElement\('i'\)|seal\.children/.test(js),'CSS-generated seal arcs are fully retired');
check(/hero-wira-finisher-v1\.0\.0\.js\?v=3\.54\.2/.test(html),'Wira finisher module loads at release v3.54.2');
check(html.indexOf('hero-wira-finisher-v1.0.0.js')<html.indexOf('hero-sidma-v1.0.0.js'),'Wrapper order preserves Wira then Sidma then Bunga');
check(sw.includes('./js/hero-wira-finisher-v1.0.0.js')&&sw.includes('./css/hero-wira-finisher-v1.0.0.css'),'Wira finisher files are available offline');
const assets=[...js.matchAll(/'(assets\/fx\/wira\/final-v2\/[^']+)'/g)].map(x=>x[1]);
check(assets.length===4&&assets.every(p=>fs.existsSync(path.join(root,p))&&sw.includes(`./${p}`)),'All four transparent Wira FX assets exist and are cached');
check(!/assets\/heroes\/bunga|assets\/heroes\/sidma/.test(js),'Wira module does not reference Bunga or Sidma artwork');
console.log(`\n${pass} passed, ${fail} failed`);if(fail)process.exit(1);
