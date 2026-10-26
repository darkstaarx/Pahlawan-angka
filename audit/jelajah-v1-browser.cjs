// Real browser + production WebGL stage; run against tools/serve-jelajah-preview.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const {scenarios}=require('../js/jelajah-scenarios-v1.js');
const base=process.env.PA_PREVIEW_URL||'http://127.0.0.1:4173';
async function solve(page,kind){
 const click=(action,value)=>page.locator(`[data-cg-action="${action}"]${value===undefined?'':`[data-cg-value="${value}"]`}`).click();
 if(kind==='bridge'){await click('move',1);await click('move',1);await click('check')}
 if(kind==='supply'){for(let i=0;i<3;i++)for(let n=0;n<4;n++)await click('serve',i);await click('check');for(let n=0;n<4;n++)await click('group');await click('check')}
 if(kind==='market'){await click('coin',1);await click('coin',2);await click('check')}
 if(kind==='cake'){await click('cut','equal');for(let i=0;i<4;i++)await click('serve',i);await click('check');await click('halve')}
 if(kind==='garden'){for(let i=0;i<2;i++)await click('rows',1);for(let i=0;i<3;i++)await click('cols',1);await click('check');await click('split');await click('rotate')}
 if(kind==='symmetry'){await click('axis','vertical');await click('fold');await click('axis','horizontal');await click('fold');await click('check')}
 await page.locator('[data-cg-next]').click();await page.locator('[data-step]').click();
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PA_BROWSER_PATH,headless:true,args:['--enable-unsafe-swiftshader']});
 const results=[];
 try{
  for(let grade=Number(process.env.PA_GRADE_START)||1;grade<=(Number(process.env.PA_GRADE_END)||6);grade++){
   const ctx=await browser.newContext({viewport:{width:grade===6?320:390,height:844},reducedMotion:'reduce'});
   await ctx.addInitScript(()=>{if(window===top){window.auditMessages=[];window.addEventListener('message',e=>{if(e.data?.source==='pa-jelajah')window.auditMessages.push(e.data)})}});
   const page=await ctx.newPage(),errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url())});
   await page.goto(base+'/demo-jelajah.html');
   await page.evaluate(()=>{localStorage.setItem('pa_coach_v6_full','PAID_LEARNER_SENTINEL');localStorage.setItem('paid-access-test','unchanged')});
   await page.selectOption('#grade',String(grade));
   assert.equal(await page.locator('#cards button:disabled').count(),3);
   await page.locator('[data-start]').click();
   const frame=await(await page.locator('iframe').elementHandle()).contentFrame();
   await frame.waitForFunction(()=>window.PASegelDemo?.state()?.q,{},{timeout:45000});
   for(let index=0;index<6;index++){
    await frame.waitForFunction(i=>{const r=window.PASegelDemo?.state();return r?.asked===i&&!r.locked&&r.q},index,{timeout:45000});
    const answer=await frame.evaluate(wrong=>wrong?PASegelDemo.state().q.wrong[0].v:PASegelDemo.state().q.answer,!!process.env.PA_TEST_MANUAL_WRONG&&index===0);
    await frame.locator('#segelAnswers button').filter({hasText:new RegExp('^'+answer+'$')}).click();
   }
   await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('AUTOPILOT'),{},{timeout:45000});
   assert.equal(await frame.locator('#segelAnswers').evaluate(e=>e.inert),true);
   await page.locator('#buy').click();
   const rects=await page.evaluate(()=>({main:document.querySelector('main').getBoundingClientRect().bottom,footer:document.querySelector('footer').getBoundingClientRect().top,over:document.documentElement.scrollWidth>innerWidth}));
   assert.ok(rects.main<=rects.footer);assert.equal(rects.over,false);
   await page.locator('#buy').click();
   await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Battle selesai'),{},{timeout:120000});
   const messages=await page.evaluate(()=>auditMessages),resolved=messages.filter(x=>x.type==='resolved');
   assert.equal(resolved.length,12);assert.deepEqual(resolved.slice(6).map(x=>x.correct),scenarios[grade].script);
   assert.ok(resolved.slice(0,6).every(x=>!x.simulated));assert.ok(resolved.slice(6).every(x=>x.simulated));
   assert.equal(await page.locator('#cards button:disabled').count(),0);
   // Completed cards stay unlocked during a replay. Leaving a live replay cancels its frame.
   await page.locator('[data-card="0"]').click();await page.locator('[data-start]').click();
   assert.equal(await page.locator('#cards button:disabled').count(),0);
   await page.locator('[data-card="1"]').click();assert.equal(await page.locator('iframe').count(),0);
   for(const card of [1,2]){
    await page.locator(`[data-card="${card}"]`).click();
    assert.ok((await page.locator('h2').textContent()).includes(scenarios[grade].topic));
    await page.locator('[data-step]').click();await solve(page,scenarios[grade].game);
    // Wrong answer offers diagnosis and an alternate model before independent retry.
    await page.locator('input[name=answer]').fill('999');await page.locator('#transfer button').click();
    await page.locator('[data-diagnostic="0"]').click();
    assert.ok((await page.locator('.alternate').textContent()).includes('Cuba cara lain'));
    await page.locator('[data-fresh]').click();
    await page.locator('input[name=answer]').fill(scenarios[grade].independent[card===2?3:2].answer);await page.locator('#transfer button').click();
    assert.ok(await page.locator(`[data-card="${card}"]`).evaluate(e=>e.classList.contains('done')));
    await page.locator('[data-replay]').click();assert.equal(await page.locator('[data-step]').count(),1);
   }
   await page.locator('[data-card="3"]').click();assert.ok((await page.locator('main').textContent()).includes('CONTOH ANALISIS'));
   await page.screenshot({path:`review/jelajah-d${grade}-analysis.png`});
   await page.locator('[data-card="2"]').click();await page.locator('[data-step]').click();
   assert.ok(await page.locator('#buy').isVisible());
   const layout=await page.evaluate(()=>({bottom:document.querySelector('footer').getBoundingClientRect().bottom,height:innerHeight,main:document.querySelector('main').getBoundingClientRect().bottom,top:document.querySelector('footer').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.ok(layout.bottom<=layout.height);assert.ok(layout.main<=layout.top);assert.equal(layout.overflow,false);
   await page.screenshot({path:`review/jelajah-d${grade}-coach.png`});
   assert.equal(await page.evaluate(()=>localStorage.getItem('pa_coach_v6_full')),'PAID_LEARNER_SENTINEL');
   assert.equal(await page.evaluate(()=>localStorage.getItem('paid-access-test')),'unchanged');
   assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
   await page.selectOption('#grade',String(grade===6?1:grade+1));assert.equal(await page.locator('#cards button:disabled').count(),3);
   results.push({grade,resolved:12,script:scenarios[grade].script,miniGameAndCoach:'passed',storage:'unchanged',networkWrites:0});console.log('PASS grade',grade);
   await ctx.close();
  }
  fs.writeFileSync(process.env.PA_TEST_MANUAL_WRONG?'review/jelajah-edge-results.json':'review/jelajah-browser-results.json',JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
