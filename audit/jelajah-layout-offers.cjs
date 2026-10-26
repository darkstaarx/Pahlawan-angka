const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PA_BROWSER_PATH,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1365,height:900}});
  await page.goto('http://127.0.0.1:4173/demo-jelajah.html');
  await page.locator('#buy').click();
  assert.equal(await page.locator('#offers a').count(),2);
  assert.ok(await page.evaluate(()=>document.querySelector('main').getBoundingClientRect().bottom<=document.querySelector('footer').getBoundingClientRect().top));
  await page.screenshot({path:'review/jelajah-desktop.png'});
  const pricingPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Lihat Pakej'}).click();const pricing=await pricingPromise;
  await pricing.getByRole('heading',{name:'Pilih akses untuk keluarga'}).waitFor({timeout:45000});
  assert.ok(await pricing.locator('#paPricingOverlay').isVisible());await pricing.close();
  const signupPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Daftar Percuma'}).click();const signup=await signupPromise;
  await signup.getByText('Daftar Akses Mesra',{exact:true}).waitFor({timeout:45000});
  await signup.close();
  console.log('PASS desktop layout, original pricing flow and original free registration entry');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
