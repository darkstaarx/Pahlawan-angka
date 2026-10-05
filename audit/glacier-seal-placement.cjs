const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const url=process.env.GLACIER_QA_URL||'http://127.0.0.1:8765/.codex-wt-fix/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const results=[];
  for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]){
   const page=await browser.newPage({viewport,serviceWorkers:'block'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/js/segel-demo-v2.1.0.js*',async route=>{
    let source=process.env.GLACIER_QA_URL ? await (await route.fetch()).text() : fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8');
    source=source.replace('await playFinisherVideo(lifecycle);','/* Skip only the video in placement QA. */');
    source=source.replace('if(activePetConfig)setPetVisual(activePetConfig);',`if(activePetConfig)setPetVisual(activePetConfig);
      window.__glacierStage={S,seals,camera,scene,renderer,host,finisherImpact,placeFinalImpact,
        snapshot(){const r=finisherImpact.getBoundingClientRect(),h=host.getBoundingClientRect();
          const t=finalImpactTarget,vh=2*Math.tan(camera.fov*Math.PI/360)*(camera.position.z-t.z),p=h.height/vh;
          return {rect:{x:r.x-h.x,y:r.y-h.y,w:r.width,h:r.height},
            target:{x:h.width/2+(t.x-camera.position.x)*p,y:h.height/2-(t.y-camera.position.y)*p,height:t.height*p},
            transform:getComputedStyle(finisherImpact).transform,frame:finisherImpact.style.backgroundPosition};}
      };`);
    source=source.replace('window.PASegelDemo={','window.__bootGlacierQA=async()=>{screen("segelDemo");await boot();stage.resume();return stage}; window.PASegelDemo={');
    await route.fulfill({contentType:'application/javascript',body:source});
   });
   await page.goto(url);await page.waitForFunction(()=>window.__bootGlacierQA);
   await page.evaluate(async()=>{window.__qaStage=await window.__bootGlacierQA()});
   await page.waitForTimeout(1700);
   // Normal attack never displays the final glacier.
   await page.evaluate(()=>window.__qaStage.strike());
   assert.equal(await page.locator('.segelFinisherImpact').evaluate(e=>Number(getComputedStyle(e).opacity)),0);
   await page.evaluate(()=>{const q=window.__glacierStage;q.S.active=2;q.seals[2].damage=.8;q.S.shake=0;window.__qaStage.strike()});
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.segelFinisherImpact')).display==='block');
   await page.waitForFunction(()=>document.querySelector('.segelFinisherImpact').style.backgroundPosition.endsWith('100%'));
   const sample=await page.evaluate(()=>window.__glacierStage.snapshot());
   assert(Math.abs(sample.rect.x+sample.rect.w*.5-sample.target.x)<2,'glacier centre misses seal');
   assert(Math.abs(sample.rect.y+sample.rect.h*.99-sample.target.y)<2,'glacier base misses seal ground');
   assert(Math.abs(sample.rect.w/sample.rect.h-(1116/4)/(1280/3))<.001,'sheet cell distorted');
   assert.equal(sample.transform,'none');
   await page.screenshot({path:path.join(root,'audit',`glacier-seal-${viewport.width}.png`)});
   // Breaking advances the active tier; the burst must retain its struck seal.
   await page.evaluate(()=>window.__qaStage.hitSeal());
   await page.setViewportSize({width:viewport.width+40,height:viewport.height});
   await page.waitForTimeout(100);
   const resized=await page.evaluate(()=>window.__glacierStage.snapshot());
   assert(Math.abs(resized.rect.x+resized.rect.w*.5-resized.target.x)<2,'resize loses anchor');
   await page.waitForTimeout(900);
   assert.equal(await page.locator('.segelFinisherImpact').evaluate(e=>getComputedStyle(e).display),'none');
   assert.deepEqual(errors,[],'browser runtime errors');
   results.push({viewport,sample,resized,errors});await page.close();
  }
  fs.writeFileSync(path.join(root,'audit/glacier-seal-placement.json'),JSON.stringify({url,results},null,2));
  console.log('PASS: 3 viewports; projected seal centre/ground, cell aspect, resize after break, normal attack isolation, cleanup, no runtime errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
