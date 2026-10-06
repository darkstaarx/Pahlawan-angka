const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
const p=await b.newPage({viewport,serviceWorkers:'block'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('**/js/segel-demo-v2.1.0.js*',r=>{let s=fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8');s=s.replace('if(activePetConfig)setPetVisual(activePetConfig);','if(activePetConfig)setPetVisual(activePetConfig);window.__finisherQA={S,seals};');s=s.replace('window.PASegelDemo={','window.__bootFinisherQA=async()=>{screen("segelDemo");await boot();stage.resume();return stage};window.PASegelDemo={');return r.fulfill({contentType:'application/javascript',body:s})});
await p.goto('http://127.0.0.1:8765/.codex-wt-fix/');await p.waitForFunction(()=>window.__bootFinisherQA);
await p.evaluate(async()=>{window.__sounds=[];const old=playSfx;window.playSfx=function(n){__sounds.push(n);return old(n)};window.__testStage=await __bootFinisherQA();const q=__finisherQA;q.S.active=2;q.seals[2].damage=.8;window.__started=performance.now();__testStage.strike()});
await p.waitForSelector('#segelStage.finisher-focus');
const time=await p.evaluate(()=>performance.now()-__started);assert(time>=900&&time<1800,'charge duration');
await p.waitForTimeout(300);
const focus=await p.locator('.segelFinalFocus').evaluate(e=>({top:getComputedStyle(e,'::before').backgroundImage,bottom:getComputedStyle(e,'::after').backgroundImage,sounds:__sounds}));
assert(focus.top.includes('jurus-penamat-logo-sheet'));assert(focus.bottom.includes('jurus-penamat-logo-sheet'));assert(focus.sounds.includes('finisherSwing'));
await p.screenshot({path:path.join(root,'audit',`finisher-eye-${viewport.width}.png`)});
await p.waitForFunction(()=>document.querySelector('.segelFinisherImpact').style.display==='block');
await p.evaluate(()=>{window.__frameTimes=[];let last=performance.now(),end=last+1300;function sample(now){__frameTimes.push(now-last);last=now;if(now<end)requestAnimationFrame(sample)}requestAnimationFrame(sample)});
assert.equal(await p.evaluate(()=>__sounds.filter(n=>n==='glacierThunder').length),1);
await p.waitForFunction(()=>document.querySelector('.segelFinisherImpact').style.backgroundPosition.endsWith('100%'));
assert.equal(await p.locator('.segelFinisherImpact').first().evaluate(e=>getComputedStyle(e).mixBlendMode),'normal');
assert.equal(await p.locator('.segelFinisherImpact').count(),3);
await p.waitForTimeout(350);
await p.screenshot({path:path.join(root,'audit',`finisher-glacier-${viewport.width}.png`)});
await p.waitForTimeout(1600);
assert.equal(await p.locator('.segelFinisherImpact').evaluateAll(items=>items.filter(e=>getComputedStyle(e).display!=='none').length),0);
assert.deepEqual(errors,[]);const frames=await p.evaluate(()=>__frameTimes);frames.sort((a,b)=>a-b);console.log('PASS',viewport,{chargeMs:time,focus,glaciers:3,frameMedianMs:frames[Math.floor(frames.length*.5)],frameP95Ms:frames[Math.floor(frames.length*.95)]});await p.close();
}}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
