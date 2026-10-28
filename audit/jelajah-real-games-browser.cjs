/* Browser audit: mounts every fixed production mapping and answers two real rounds. */
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const {loadPlaywright,browserPath}=require('./lib/browser');
const root=require('node:path').resolve(__dirname,'..');
const {chromium}=loadPlaywright();
const base=process.env.PA_PREVIEW_URL||'http://127.0.0.1:4173';
const mountSource=fs.readFileSync(root+'/js/jelajah-minigame-v2.js','utf8');
async function answer(frame){
 await frame.waitForFunction(()=>window.__gudangDebug?.()||window.__kekDebug?.()||window.__bengkelDebug?.()||window.__lbDebug?.()||window.__dapurDebug?.(),null,{timeout:30000});
 await frame.evaluate(()=>{
  const d=window.__gudangDebug?.()||window.__kekDebug?.()||window.__bengkelDebug?.()||window.__lbDebug?.()||window.__dapurDebug?.();
  if(d.kind==='pick'){const choices=[...document.querySelectorAll('[data-o],#tiles button,.tiles button,#answers button,.opts button')];const b=choices.find(x=>x.dataset.o===String(d.correct))||choices.find(x=>x.dataset.id===String(d.correct)||x.textContent.trim()===String(d.correct));if(b)b.click();}
  else if(d.kind==='build'&&d.rack?.mode==='add'){const n=d.rack.cols;for(let i=n-1;i>=0;i--){const v=Math.floor(d.need.v/10**i)%10;const f=document.querySelector(`[data-f="a${i}"]`);if(f)f.click();for(const ch of String(v)){const k=document.querySelector(`[data-k="${ch}"]`);if(k)k.click();}}}
  else if(d.kind==='build'&&d.target!=null){const s=document.querySelector('#slide');if(s){s.value=String(d.target);s.dispatchEvent(new Event('input',{bubbles:true}));}}
  else if((d.form?.fields||d.fields)){const vals=(d.form?.fields||d.fields).map(f=>String(f.v));for(let i=0;i<vals.length;i++){document.querySelector(`#F${i},#f${i},#F_${i}`)?.click();for(const ch of vals[i])document.querySelector(`[data-k="${ch}"]`)?.click();if(i<vals.length-1)document.querySelector('[data-k="⇥"]')?.click();}}
  document.querySelector('#check')?.click();
 });
 await frame.waitForTimeout(350);
}
(async()=>{
 cp.execFileSync(process.execPath,['tools/build-jelajah-minigames.cjs'],{cwd:root});
 const browser=await chromium.launch({executablePath:browserPath('C:/Users/affie/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'),headless:true,args:['--enable-unsafe-swiftshader']});
 try{for(let grade=Number(process.env.PA_GRADE_START)||1;grade<=(Number(process.env.PA_GRADE_END)||6);grade++){
  const ctx=await browser.newContext({viewport:{width:grade===6?320:390,height:844}}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/demo-jelajah.html');
  await page.getByRole('button',{name:'Darjah '+grade,exact:true}).click();
  await page.evaluate(({src,grade})=>{eval(src);window.__mgDone=null;document.querySelector('main').innerHTML='<div class="activity-host" id="gameTestHost"></div>';window.__mgCleanup=PAJelajahMiniGame.mount(document.querySelector('#gameTestHost'),{grade},{onComplete:x=>window.__mgDone=x,onExit:()=>{}})},{src:mountSource,grade});
  const fr=await (await page.locator('iframe.pa-jelajah-production-game').elementHandle()).contentFrame();
  await fr.locator('#check').waitFor();await fr.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await page.screenshot({path:`review/jelajah-final-minigame-d${grade}.png`});
  const bounds=await page.evaluate(()=>({frame:document.querySelector('main iframe').getBoundingClientRect().bottom,cta:document.querySelector('footer').getBoundingClientRect().top}));assert.ok(bounds.frame<=bounds.cta);
  for(let i=0;i<2;i++){await answer(fr);await fr.locator('#check').click().catch(()=>{});await fr.waitForTimeout(350);}
  await page.waitForFunction(()=>window.__mgDone?.successes>=2,null,{timeout:30000});
  assert.equal(await page.locator('iframe.pa-jelajah-production-game').count(),1);assert.deepEqual(errors,[]);
  console.log('PASS production game grade',grade,'successes',await page.evaluate(()=>window.__mgDone.successes));await ctx.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
