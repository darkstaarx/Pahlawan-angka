const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const motion=fs.readFileSync('js/combat-motion-v1.js','utf8');
for(const hero of ['wirachibi','sidma']){
 const requested=[];
 const context={db:{hero,rewards:{}},document:{readyState:'loading',getElementById:()=>null,addEventListener(){}},Image:class{set src(value){requested.push(value)}decode(){return new Promise(()=>{})}}};
 context.window=context;vm.runInNewContext(motion,context);
 assert(!requested.some(url=>url.includes('sidma')),'startup must not preload Sidma, including saved Sidma profiles');
 if(hero==='sidma'){
  context.PACombatMotion.begin('hero','enemy',false);
  assert(requested.some(url=>url.includes('skill2-impact-v1.webp')),'explicit archived Sidma attack can still lazy load its frames');
  const count=requested.length;context.PACombatMotion.begin('hero','enemy',false);
  assert.equal(requested.length,count,'legacy lazy loader must be idempotent');
 }
}
const sw=fs.readFileSync('sw.js','utf8');
assert(!/['"]\.\/assets\/[^'"]*(?:sidma|enemies\/minions\/)/i.test(sw),'retired artwork must not be precached');
assert(!fs.readFileSync('index.html','utf8').includes('src="assets/enemies/minions/askabus.webp"'),'hidden battle must not request Askabus');
assert(!fs.readFileSync('js/cikgu-manipulatives-v3.19.1.js','utf8').includes('sidma-push-v1.png'),'clock activity must not load retired Sidma artwork');
console.log('PASS: no retired precache/hidden images or startup Sidma preloads; explicit legacy lazy loading remains idempotent');
