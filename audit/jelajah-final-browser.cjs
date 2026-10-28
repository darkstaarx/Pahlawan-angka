const assert=require('node:assert/strict'),fs=require('node:fs');const{chromium}=require('playwright');const{scenarios}=require('../js/jelajah-scenarios-v1.js');
(async()=>{const b=await chromium.launch({executablePath:process.env.PA_BROWSER_PATH,headless:true,args:['--enable-unsafe-swiftshader']});const results=[];try{
 for(let grade=Number(process.env.PA_GRADE_START)||1;grade<=(Number(process.env.PA_GRADE_END)||6);grade++){
  const ctx=await b.newContext({viewport:{width:grade===6?320:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173/demo-jelajah.html');await p.evaluate(()=>{localStorage.setItem('pa_coach_v6_full','paid-sentinel');window.msgs=[];addEventListener('message',e=>msgs.push(e.data))});
  await p.locator(`[data-grade="${grade}"]`).click();const f=await(await p.locator('main iframe').elementHandle()).contentFrame();
  await f.waitForFunction(()=>window.PASegelDemo?.state()?.q,{},{timeout:45000});
  for(let n=0;n<6;n++){
   await f.waitForFunction(i=>{const r=PASegelDemo.state();return r.asked===i&&!r.locked},n,{timeout:45000});
   async function answer(value){
    const written=f.locator('#segelQuestion .paWaForm');
    if(await written.count()){
     const parts=String(value).split('.');for(const [i,group] of ['whole','fraction'].entries()){const fields=written.locator(`[data-group="${group}"]`),count=await fields.count(),digits=(parts[i]||'').padStart(count,'0');for(let j=0;j<count;j++)await fields.nth(j).fill(digits[j]||'0')}
     if(await written.locator('.paWaDivisionInput').count())await written.locator('.paWaDivisionInput').fill(String(value));await written.locator('button[type=submit]').click();return;
    }
    const input=f.locator('#segelAnswers input');if(await input.count()){await input.fill(String(value));await f.locator('#segelAnswers button[type=submit]').click()}else await f.locator('#segelAnswers button').getByText(String(value),{exact:true}).click();
   }
   if(n===0){await answer(await f.evaluate(()=>PASegelDemo.state().q.wrong[0].v));await f.waitForFunction(()=>!PASegelDemo.state().locked&&PASegelDemo.state().retryOpen);assert.equal(await f.evaluate(()=>PASegelDemo.state().asked),0)}
   await answer(await f.evaluate(()=>PASegelDemo.state().q.answer));
  }
  await p.locator('#autopilotDialog').waitFor({state:'visible',timeout:45000});assert.equal(await f.evaluate(()=>PASegelDemo.state().asked),6);await p.waitForTimeout(500);assert.equal(await f.evaluate(()=>PASegelDemo.state().asked),6);
  await p.keyboard.press('Escape');assert.ok(await p.locator('#autopilotDialog').isVisible());await p.locator('#startAutopilot').click();await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Battle selesai'),{},{timeout:120000});
  const rows=await p.evaluate(()=>msgs.filter(x=>x.type==='resolved'));assert.equal(rows.length,12);assert.deepEqual(rows.slice(6).map(x=>x.correct),scenarios[grade].script);
  await p.locator('[data-card="2"]').click();const c=await(await p.locator('main iframe').elementHandle()).contentFrame();
  await c.locator('#learning.on').waitFor({timeout:15000});await c.locator('#learningBody .learningNext').click();
  await c.locator('#visualCoachBoard button').first().click();
  await c.waitForFunction(()=>learningState.stage===2,{},{timeout:10000});
  const choices=await c.locator('#learningBody button').count();assert.ok(choices>=2);await c.locator('#learningBody button').first().click();
  await c.waitForFunction(()=>learningState.stage===3,{},{timeout:10000});
  await c.locator('#learningBody .learningAnswers button').nth(1).click();await c.locator('[data-diagnostic="yes"]').click();await c.locator('[data-retry]').click();
  await c.locator('#learningBody .learningAnswers button').getByText(scenarios[grade].coachQuestions[2].answer,{exact:true}).click();await c.waitForFunction(()=>learningState.stage===4);
  await c.locator('#learningBody .learningAnswers button').getByText(scenarios[grade].coachQuestions[1].answer,{exact:true}).click();
  await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Cikgu Dimensi selesai'));
  await p.locator('[data-card="3"]').click();assert.ok((await p.locator('main').textContent()).includes('Contoh laporan berdasarkan simulasi demo. Ini bukan penilaian sebenar anak anda.'));
  assert.equal(await p.evaluate(()=>localStorage.getItem('pa_coach_v6_full')),'paid-sentinel');
  await p.screenshot({path:`review/jelajah-final-d${grade}.png`});assert.deepEqual(errors,[]);results.push({grade,battle:12,autopilotStart:'explicit',manualWrongRetry:'pass',realCoach:'pass',isolation:'pass'});console.log('PASS final grade',grade);await ctx.close();
 }
 fs.writeFileSync(`review/jelajah-final-results-${results[0].grade}-${results.at(-1).grade}.json`,JSON.stringify(results,null,2));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
