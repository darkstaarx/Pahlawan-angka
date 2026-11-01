'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Jelajah uses the live guest journey and loads floating CTA only there',()=>{
 const page=read('demo-jelajah.html'),landing=read('js/approved-landing-v1.js');
 assert.match(landing,/demo-jelajah\.html/);
 assert.match(page,/js\/jelajah-v1\.js/);
 assert.match(page,/css\/jelajah-floating-cta-v1\.css\?v=3\.87\.99/);
 assert.match(page,/js\/jelajah-floating-cta-v1\.js\?v=3\.87\.99/);
 assert.doesNotMatch(read('index.html'),/jelajah-floating-cta-v1/);
});
test('four accessible SVG tabs and both real guardian offer routes',()=>{
 const script=read('js/jelajah-floating-cta-v1.js'),css=read('css/jelajah-floating-cta-v1.css');
 assert.doesNotThrow(()=>new Function(script));
 for(const name of ['kemahiran','peta','cikgu','koleksi'])assert.match(script,new RegExp(name));
 assert.match(script,/mode=daftar/);assert.match(script,/mode=pakej/);
 assert.match(script,/rel="noopener noreferrer"/);
 assert.match(script,/cards\.hidden/);
 assert.match(script,/step\(index\)\?\.click\(\)/);
 assert.match(css,/grid-template-rows:auto auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.tour\.paJelajahRunning #cards\{display:none!important\}/);
});
test('guest stage stays on the original engine and session remains a demonstration',()=>{
 const flow=read('js/jelajah-v1.js'),scenario=read('js/jelajah-scenarios-v1.js');
 assert.match(flow,/jelajah-runtime\.html\?grade=/);
 assert.match(flow,/data-card/);
 assert.match(flow,/autopilot-ready/);
 assert.match(scenario,/scriptSteps:Array\.from\(\{length:6\}/);
 assert.match(read('js/version.js'),/PA_APP_VERSION='3\.87\.99'/);
 const sw=read('sw.js');
 assert.match(sw,/\.\/js\/jelajah-floating-cta-v1\.js/);
 assert.match(sw,/\.\/css\/jelajah-floating-cta-v1\.css/);
});
