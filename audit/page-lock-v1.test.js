const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const script=fs.readFileSync('js/page-lock-v1.js','utf8');
const css=fs.readFileSync('css/page-lock-v1.css','utf8');
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const closeSource=segel.slice(segel.indexOf('window.closeSegelDemo=function(){'),segel.indexOf('\n  window.restartSegelDemo='));
const fixture=`function pageLockParentPin(){return '4826'};let entryMode={guestDemo:true},demoOpenGeneration=0,runGeneration=0,run={answer:42};const stage={pause(){window.stagePaused=true}};window.PADemo={restoreGuest(){window.guestRestored=true}};function goLogin(){document.body.dataset.screen='login'};${closeSource}`;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const root='https://page-lock.test';
  await page.route(root+'/**',route=>route.fulfill({contentType:'text/html',body:route.request().url().endsWith('/outside')?'<h1>Outside</h1>':`<style>${css}</style><body data-screen="login"><header class="appHeader"></header><div class="mv2HeadRight"></div><div class="segelTop"></div><input id="answer"><button id="demoBack" onclick="closeSegelDemo()">Kembali</button><script>${fixture}</script><script>${script}</script></body>`}));
  await page.goto(root+'/outside');await page.goto(root+'/app');
  assert.equal(await page.evaluate(()=>PAPageLock.isLocked()),true);
  const count=await page.evaluate(()=>history.length);
  for(const screen of ['login','menuV2','missions','treasure','parent','setup','learning','result','segelDemo']){
   await page.evaluate(screen=>document.body.dataset.screen=screen,screen);
   await page.locator('#answer').fill('42');
   await page.evaluate(()=>history.back());
   await page.locator('dialog').waitFor({state:'visible'});
   await page.waitForFunction(()=>history.state?.paPageLock==='guard');
   assert.equal(await page.evaluate(()=>document.body.dataset.screen),screen);
   assert.equal(await page.locator('#answer').inputValue(),'42');
   assert.equal(await page.evaluate(()=>history.length),count);
   await page.locator('[data-exit-pin]').fill('0000');
   await page.locator('[data-unlock]').click();
   assert.equal(await page.evaluate(()=>PAPageLock.isLocked()),true);
   assert.equal(await page.locator('dialog').isVisible(),true);
   await page.locator('[data-stay]').click();
  }
  await page.locator('#demoBack').click();
  assert.equal(await page.evaluate(()=>!!window.stagePaused||!!window.guestRestored),false);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>PAPageLock.isLocked()),true);
  await page.locator('[data-page-lock]').first().click();
  await page.locator('[data-exit-pin]').fill('4826');await page.locator('[data-unlock]').click();
  assert.equal(await page.evaluate(()=>PAPageLock.isLocked()),false);
  await page.locator('[data-page-lock]').first().click();
  assert.equal(await page.evaluate(()=>PAPageLock.isLocked()),true);
  assert.equal(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}),true);
  await page.locator('#demoBack').click();
  await page.locator('[data-exit-pin]').fill('4826');await page.locator('[data-unlock]').click();
  assert.equal(await page.evaluate(()=>document.body.dataset.screen),'login');
  assert.equal(await page.evaluate(()=>!!window.stagePaused&&!!window.guestRestored),true);
  assert.equal(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}),false);
  await page.evaluate(()=>history.back());await page.waitForURL(root+'/outside');
  console.log('PASS: all pages, wrong/right guardian PIN, internal and browser Back, Escape, unlock/relock, preserved state, deliberate exit (390px)');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
