const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PA_BROWSER_PATH,headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  for(const route of ['/?landing_action=demo','/index.html?landing_action=demo']){
   await page.goto('http://127.0.0.1:4173'+route);
   assert.ok(page.url().endsWith('/demo-jelajah.html'));assert.equal(await page.locator('[data-grade]').count(),6);
  }
  await page.goto('http://127.0.0.1:4173/landing-approved-v1.html');
  await page.getByRole('button',{name:'Cuba Demo Percuma'}).click();
  await page.waitForURL('**/demo-jelajah.html');
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.frameLocator('#paApprovedLanding').getByRole('button',{name:'Cuba Demo Percuma'}).click();
  await page.waitForURL('**/demo-jelajah.html');
  await page.getByRole('button',{name:'Darjah 1',exact:true}).click();
  const stage=await(await page.locator('main iframe').elementHandle()).contentFrame();
  await stage.waitForFunction(()=>window.PASegelDemo?.state()?.q,{},{timeout:45000});
  assert.equal(await stage.locator('#segelAnswers button').count(),3);
  assert.ok((await page.locator('#status').textContent()).includes('Soalan 1/12'));
  await page.screenshot({path:'review/jelajah-landing-entry.png'});
  console.log('PASS query aliases, standalone and embedded landing CTA, real first battle question');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
