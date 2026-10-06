const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
   const page=await browser.newPage({viewport,serviceWorkers:'block',ignoreHTTPSErrors:process.env.QA_IGNORE_HTTPS_ERRORS==='1'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/css/wira-two-scene-finisher-v1.0.0.css*',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(root,'css/wira-two-scene-finisher-v1.0.0.css'),'utf8')}));
   await page.route('**/js/segel-demo-v2.1.0.js*',r=>{
    let s=fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8');
    s=s.replace('await playFinisherVideo(lifecycle);','/* Skip cinematic only; test real live attack. */');
    s=s.replace("const sfx = name => {", "const sfx = name => { (window.__qaSounds ||= []).push(name);");
    s=s.replace('if(activePetConfig)setPetVisual(activePetConfig);','if(activePetConfig)setPetVisual(activePetConfig); window.__glacier={S,seals,glacierLayers,glacierShards};');
    s=s.replace('window.PASegelDemo={','window.__bootGlacier=async()=>{screen("segelDemo");await boot();stage.resume();return stage}; window.PASegelDemo={');
    return r.fulfill({contentType:'application/javascript',body:s});
   });
   await page.goto(process.env.GLACIER_QA_URL||'https://deploy-preview-23--pahlawanangka.netlify.app/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__bootGlacier,{timeout:60000});
   await page.evaluate(async()=>{window.__stage=await window.__bootGlacier()});
   await page.waitForTimeout(1700);
   await page.evaluate(()=>window.__stage.strike());
   assert.equal(await page.locator('.segelFinisherImpact').first().evaluate(e=>Number(getComputedStyle(e).opacity)),0);
   await page.evaluate(()=>{
    const q=window.__glacier;q.S.active=2;q.seals[2].damage=.8;
    window.__qaSounds=[];window.__samples=[];window.__done=false;
    function sample(){if(q.S.iceT>=0)window.__samples.push({time:q.S.iceT,broken:q.seals[2].broken,
     layers:q.glacierLayers.map(e=>({side:Number(e.dataset.glacierSide)||0,height:parseFloat(e.style.height),display:getComputedStyle(e).display,frame:Number(e.dataset.glacierFrame)})),
     shards:q.glacierShards.flat().filter(e=>getComputedStyle(e).display==='block').map(e=>({opacity:Number(e.style.opacity),transform:e.style.transform}))});
     if(!window.__done)requestAnimationFrame(sample);
    }sample();window.__attack=window.__stage.strike().then(()=>{window.__done=true;window.__beforeBreak=q.seals[2].broken;window.__outcome=window.__stage.hitSeal();return window.__stage.waitFinalImpact()});
   });
   await page.waitForFunction(()=>window.__samples.some(s=>s.shards.length>0));
   await page.screenshot({path:`/tmp/glacier-fracture-${viewport.width}.png`});
   await page.evaluate(()=>window.__attack);
   const result=await page.evaluate(()=>({samples:window.__samples,sounds:window.__qaSounds,before:window.__beforeBreak,outcome:window.__outcome,ice:window.__glacier.S.iceT}));
   assert.equal(result.sounds.filter(x=>x==='glacierThunder').length,3);
   assert.equal(result.before,false);assert.equal(result.outcome.broken,true);assert.equal(result.ice,-1);
   assert(result.samples.length>15);assert(result.samples.every(s=>!s.broken),'seal shattered before glacier ended');
   assert(result.samples.some(s=>s.shards.some(p=>p.opacity>0&&p.opacity<1)),'missing fracture fade');
   for(const sample of result.samples){for(const layer of sample.layers)if(layer.display==='block'){
    const duration=layer.side?.78:1.08,delay=layer.side===-1?.12:layer.side===1?.24:0;
    assert(sample.time-delay<duration+.001,'held final frame');
   }}
   const scale=result.samples.find(s=>s.time>.4&&s.time<.7).layers;
   assert(Math.abs(scale[1].height/scale[0].height-.76*1.10)<.001);
   assert(Math.abs(scale[2].height/scale[0].height-.76*1.03)<.001);
   assert.equal(await page.locator('.segelGlacierShard').first().evaluate(e=>getComputedStyle(e).display),'none');
   // Cancel during impact: no late thunder or fragments leak into another screen.
   await page.evaluate(()=>{window.__stage.reset();const q=window.__glacier;q.S.active=2;q.seals[2].damage=.8;window.__qaSounds=[];window.__cancelAttack=window.__stage.strike()});
   await page.waitForFunction(()=>window.__glacier.S.iceT>=0);
   await page.evaluate(()=>window.__stage.cancel());await page.evaluate(()=>window.__cancelAttack);
   await page.waitForTimeout(500);
   assert(await page.locator('.segelGlacierShard').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
   assert((await page.evaluate(()=>window.__qaSounds.filter(x=>x==='glacierThunder').length))<3);
   assert.deepEqual(errors,[]);
   console.log('PASS',viewport,'three thunder hits, left +10%, right +3%, immediate fracture/fade, seal breaks after animation, normal isolation, cancellation');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
