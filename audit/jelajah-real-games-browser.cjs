/* Browser audit: mounts every fixed production mapping, answers three manual
 * rounds, then explicitly starts two real PAWorked rounds. */
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
  else if(d.kind==='shade'||d.kind==='tray'){for(let i=0;i<d.need.k;i++)document.querySelector(`.livebox [data-i="${i}"],.livebox [data-g="${i}"]`)?.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  else if(d.form&&!d.form.fields){
   const f=d.form;let values;
   if(['int','dec'].includes(f.type))values={v:f.v};
   else if(f.type==='frac')values={n:f.n,d:f.d};
   else{let n=f.N,den=f.D;const gcd=(a,b)=>b?gcd(b,a%b):a,k=gcd(n,den);n/=k;den/=k;values=f.type==='improper'?{n,d:den}:{w:Math.floor(n/den),n:n%den,d:den}}
   for(const [key,value] of Object.entries(values)){const field=document.getElementById('F_'+key);if(!field)continue;field.click();for(const ch of String(value))document.querySelector(`#tiles [data-k="${ch}"]`)?.click()}
  }
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
  await page.evaluate(({src,grade})=>{eval(src);window.__mgDone=null;window.__mgManual=null;window.__mgStartAuto=null;document.querySelector('main').innerHTML='<div class="activity-host" id="gameTestHost"></div>';window.__mgCleanup=PAJelajahMiniGame.mount(document.querySelector('#gameTestHost'),{grade},{onManualComplete:x=>{window.__mgManual=x;window.__mgStartAuto=x.startAutopilot},onComplete:x=>window.__mgDone=x,onExit:()=>{}})},{src:mountSource,grade});
  const fr=await (await page.locator('iframe.pa-jelajah-production-game').elementHandle()).contentFrame();
  await fr.locator('#check').waitFor();await fr.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await page.screenshot({path:`review/jelajah-final-minigame-d${grade}.png`});
  const bounds=await page.evaluate(()=>({frame:document.querySelector('main iframe').getBoundingClientRect().bottom,cta:document.querySelector('footer').getBoundingClientRect().top}));assert.ok(bounds.frame<=bounds.cta);
  for(let i=0;i<3;i++){console.log('round',grade,i,await fr.evaluate(()=>window.__kekDebug?.()||window.__bengkelDebug?.()||window.__lbDebug?.()||window.__dapurDebug?.()||window.__gudangDebug?.()));await answer(fr);await fr.waitForTimeout(850);console.log('manual',await page.evaluate(()=>window.__mgManual));}
  await page.waitForFunction(()=>window.__mgManual?.successes>=3,null,{timeout:30000});
  assert.equal(await page.evaluate(()=>window.__mgStartAuto?.()),true);
  const next=page.locator('.pa-jelajah-next');await next.click();await fr.locator('.wk-wrap').waitFor({timeout:30000});const before=await fr.evaluate(()=>PAJelajahGameRuntime.state().stepClicks);await fr.waitForTimeout(2500);assert.equal(await fr.evaluate(()=>PAJelajahGameRuntime.state().stepClicks),before,'no advance without click');for(let step=0;step<100&&!await page.evaluate(()=>!!window.__mgDone);step++){await next.click();await fr.waitForTimeout(950);}
  await page.waitForFunction(()=>window.__mgDone?.successes>=3&&window.__mgDone?.workedRounds===2,null,{timeout:60000});
  const worked=await fr.evaluate(()=>window.PAJelajahGameRuntime?.state?.());
  assert.ok((worked?.stepClicks||0)>=2,'autopilot clicked real PAWorked steps');
  assert.equal(await page.locator('iframe.pa-jelajah-production-game').count(),1);assert.deepEqual(errors,[]);
  console.log('PASS production game grade',grade,'manual',await page.evaluate(()=>window.__mgDone.successes),'worked',await page.evaluate(()=>window.__mgDone.workedRounds));await ctx.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
