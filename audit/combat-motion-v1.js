// Contract tests for HP timing and battle-journey cancellation.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const baseline=fs.readFileSync('audit/battle-runtime-blockers-v3.57.3.js','utf8');
const fixture=baseline.slice(baseline.indexOf('class Classes'),baseline.indexOf('const h=battleHarness()'));
const sandbox={require,fs,vm,console,URL};vm.createContext(sandbox);vm.runInContext(fixture+';this.make=battleHarness;',sandbox);
function setup(){
 const h=sandbox.make(),c=h.context;
 for(const id of ['heroHp','enemyHp'])h.ids[id]={style:{}};
 c.db.hero='wira';c.sess.hp=20;c.sess.ehp=12;c.sess.enemyMaxHp=12;
 let resets=0;
 c.PACombatMotion={begin:(from,to,finisher)=>finisher?null:{contactDelay:from==='hero'?470:390,completionDelay:1400,motion:true},reset:()=>resets++,sync(){}};
 return {...h,resets:()=>resets};
}
for(const from of ['hero','enemy']){
 const h=setup(),c=h.context,target=from==='hero'?'enemy':'hero';
 const info=c.triggerImpact(from,target,'ice',false);
 if(from==='hero')c.sess.ehp-=4;else c.sess.hp-=3;
 c.battle();assert.equal(h.ids.enemyHp.style.width,'100%');assert.equal(h.ids.heroHp.style.width,'100%');
 const callback=h.callbacks.find(x=>x.delay===info.contactDelay);assert(callback);
 callback.fn();
 assert.equal(h.ids.enemyHp.style.width,from==='hero'?(8/12*100)+'%':'100%');
 assert.equal(h.ids.heroHp.style.width,from==='enemy'?'85%':'100%');
 assert.equal(c.sess.ehp,from==='hero'?8:12,'presentation changed gameplay HP');
}
const h=setup(),c=h.context;c.triggerImpact('hero','enemy','ice',false);const stale=h.callbacks.at(-1).fn;
c.cancelBattlePresentationTimers();c.sess.hp=16;c.sess.ehp=6;c.battle();stale();
assert.equal(h.ids.heroHp.style.width,'80%');assert.equal(h.ids.enemyHp.style.width,'50%');assert(h.resets()>0);assert.equal(c.PABattlePresentation.pending(),0);
const release=fs.readFileSync('js/version.js','utf8').match(/PA_APP_VERSION='([^']+)'/)[1];
const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
for(const file of ['js/combat-motion-v1.js','css/combat-motion-v1.css','js/battle.js','js/version.js','js/pwa.js'])assert(index.includes(`${file}?v=${release}`),file+' cache-bust');
for(const file of ['js/combat-motion-v1.js','css/combat-motion-v1.css'])assert(sw.includes(file));
console.log('PASS: hero/enemy impact HP timing, model integrity, stale-journey cancellation, release wiring');

// Exercise the actual renderer's dispatch/cancellation with a deterministic
// canvas and decoded assets. Browser QA covers the real artwork and layout.
async function rendererChecks(){
 const noop=()=>{},classes=new Set(),timers=[],frames=new Map();let id=0,reduced=false;
 const context2d=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(4*4*4).fill(255)}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
 const make=(left=0)=>({classList:{contains:n=>classes.has(n),add:n=>classes.add(n),remove:n=>classes.delete(n),toggle:(n,on)=>on?classes.add(n):classes.delete(n)},style:{},getBoundingClientRect:()=>({left,top:0,bottom:100,width:100,height:100}),getAttribute:()=>null,setAttribute:noop,addEventListener:noop,appendChild:noop,clientWidth:390,clientHeight:220,clientLeft:0,clientTop:0});
 const ids={battleArena:make(),hero:make(),enemy:make(250),heroIdle:make(),enemySprite:make(250),battlePet:make()};
 ids.enemySprite.currentSrc='assets/enemies/minions/askabus.webp';
 const document={readyState:'loading',body:{dataset:{screen:'game'}},getElementById:n=>ids[n],addEventListener:noop,createElement:()=>({...make(),width:4,height:4,getContext:()=>context2d})};
 const c={document,console,performance:{now:()=>0},db:{hero:'wira',rewards:{}},Image:class{naturalWidth=4;naturalHeight=4;decode(){return Promise.resolve()}},matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:n=>frames.delete(n),MutationObserver:class{observe(){}},PABattlePresentation:{later:(fn,delay)=>timers.push({fn,delay})}};
 c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('js/combat-motion-v1.js','utf8'),c);await Promise.resolve();await Promise.resolve();c.PACombatMotion.sync();await Promise.resolve();await Promise.resolve();
 const motion=c.PACombatMotion;
 assert.equal(motion.begin('hero','enemy',true),null,'finisher must retain existing renderer');
 c.db.rewards.equippedPet='aurora';assert.equal(motion.begin('hero','enemy',false),null,'pet combo must retain existing renderer');c.db.rewards.equippedPet=null;
 for(const from of ['hero','enemy'])for(const minimal of [false,true]){
  reduced=minimal;const info=motion.begin(from,from==='hero'?'enemy':'hero',false);assert(info?.motion);
  const render=frames.get(id);for(const time of [0,250,470,550,900,1300])render(time);
  motion.reset();assert(!motion.isActive());assert(!classes.has('paMotionActive'));
 }
 c.db.hero='bunga';assert.equal(motion.begin('hero','enemy',false),null);c.db.hero='sidma';assert.equal(motion.begin('hero','enemy',false),null);
 console.log('PASS: renderer phases, both attack directions, reduced motion, reset, pet/finisher/other-hero fallback');
}
rendererChecks().catch(error=>{console.error(error);process.exitCode=1});
