#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'focus-v2-e2e');fs.mkdirSync(out,{recursive:true});
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const executablePath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const rows=[],errors=[],requests=[];
const server=http.createServer((req,res)=>{
 const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return}
 const p=fs.existsSync(filename)&&fs.statSync(filename).isDirectory()?path.join(filename,'index.html'):filename;
 if(!fs.existsSync(p)){res.writeHead(404).end();return}
 const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg'};
 res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);
});
const add=(test,grade,expected,actual,status='PASS',evidence='results.json')=>{rows.push({test,grade,expected,actual,status,evidence});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),rows,errors,blockedMutationRequests:requests},null,2));console.log(status+' '+test+' D'+grade)};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const local='http://127.0.0.1:'+server.address().port;
 const browser=await pw.chromium.launch({executablePath,headless:true});
 try{
  for(const source of ['production','feature'])for(const device of ['desktop','android']){
   const context=await browser.newContext({serviceWorkers:'block',viewport:device==='android'?{width:360,height:640}:{width:1280,height:800},isMobile:device==='android',hasTouch:device==='android',deviceScaleFactor:1});
   await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){requests.push({source,device,method:r.request().method(),url:r.request().url()});return r.abort()}return r.continue()});
   const page=await context.newPage();page.on('pageerror',e=>errors.push({source,device,message:e.message}));
   const url=source==='production'?'https://darkstaarx.github.io/Pahlawan-angka/':local+'/index.html';
   await page.goto(url,{waitUntil:'load',timeout:60000});await page.locator('#paDemoButton').waitFor({state:'visible',timeout:30000});
   add(source+' '+device+' login','1–6','Login + demo visible',await page.locator('#googleAuthButton').count()+' Google button; '+await page.evaluate(()=>PA_APP_VERSION));
   await page.screenshot({path:path.join(out,source+'-'+device+'-login.png')});
   const initial=await page.evaluate(()=>JSON.stringify(['pa_coach_v6_full','pa_coach_v5'].map(k=>[k,localStorage.getItem(k)])));
   for(let grade=1;grade<=6;grade++){
    try{
     if(grade>1){await page.goto(url,{waitUntil:'load',timeout:60000});await page.locator('#paDemoButton').waitFor({state:'visible',timeout:30000})}
     await page.locator('#paDemoButton').click();await page.locator('[data-demo-grade="'+grade+'"]').click();await page.locator('#paDemoStart').click();
     await page.waitForFunction(()=>PASegelDemo.state()?.q&&document.querySelector('#segelAnswers button'),{},{timeout:25000});
     const q=await page.evaluate(()=>JSON.parse(JSON.stringify(PASegelDemo.state().q)));
     const answer=page.locator('#segelAnswers button').filter({hasText:new RegExp('^'+String(q.answer).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first();
     const wrong=page.locator('#segelAnswers button').filter({hasText:new RegExp('^'+String(q.wrong[0].label??q.wrong[0].v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first();
     await wrong.click();
     if(source==='feature'||grade===2)await page.screenshot({path:path.join(out,source+'-'+device+'-d'+grade+'-battle.png')});
     await page.locator('#segelHint').click();
     // Close the actual hint overlay via the rendered button when present.
     const close=page.locator('#segelRoot button, #segelDemoOverlay button').filter({hasText:/Cuba|Teruskan|Faham|Tutup/});
     if(await close.count())await close.first().click();
     await answer.click({timeout:5000});
     await page.waitForFunction(prompt=>PASegelDemo.state()?.locked||PASegelDemo.state()?.q?.prompt!==prompt,q.prompt,{timeout:5000});
     add(source+' '+device+' demo wrong/hint/correct',grade,'Valid question; wrong retry; hint; correct accepted',q.skill+' '+q.prompt+' = '+q.answer);
    }catch(e){add(source+' '+device+' demo wrong/hint/correct',grade,'Working answer flow',e.message.slice(0,600),'FAIL')}
    await page.evaluate(()=>{PASegelDemo.close();PADemo.restoreGuest()});
   }
   const after=await page.evaluate(()=>JSON.stringify(['pa_coach_v6_full','pa_coach_v5'].map(k=>[k,localStorage.getItem(k)])));add(source+' '+device+' guest persistence','1–6','No learner profile saved',initial===after?'Learner profile keys unchanged':'Learner profile changed: inspect evidence',initial===after?'PASS':'FAIL');
   await context.close();
  }
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:800}}),page=await context.newPage();
  await page.goto(local+'/audit/focus-v2-shadow-harness.html');add('Harness default off','1–6','No engine without opt-in',await page.evaluate(()=>typeof PAFocusDiagnosisV2),await page.evaluate(()=>typeof PAFocusDiagnosisV2==='undefined')?'PASS':'FAIL');
  await page.goto(local+'/audit/focus-v2-shadow-harness.html?shadow=1');await page.waitForFunction(()=>typeof runShadowAudit==='function');
  const shadow=await page.evaluate(()=>runShadowAudit());fs.writeFileSync(path.join(out,'runtime-metadata.json'),JSON.stringify(shadow,null,2));
  for(const r of shadow.rows)add('Oracle '+r.id,r.id.includes('d6')||r.id.includes('cross-grade')?6:r.id.includes('discount')?5:2,JSON.stringify(r.expected),JSON.stringify({state:r.actual.state,rootCause:r.actual.rootCause,nextProbe:r.actual.nextProbe}),r.pass?'PASS':'FAIL','runtime-metadata.json');
  add('Shadow review outcomes',2,'Independent/corrected/assisted/unresolved kept distinct',shadow.captures.map(x=>x.actual).join(', '),shadow.captures.every(x=>x.actual===x.expected)?'PASS':'FAIL');
  add('Shadow mastery integrity',2,'No mastery/reward/grade writes; clone review only',String(shadow.integrity),shadow.integrity?'PASS':'FAIL');
  add('Collector disposal',2,'In-memory session clears on close',String(shadow.closed),shadow.closed?'PASS':'FAIL');
  for(let g=1;g<=6;g++){const m=shadow.metadata.filter(x=>x.grade===g);add('Final runtime generation',g,'20 valid items per available skill; distinct variants',m.length+' skills; '+m.reduce((s,x)=>s+x.valid,0)+' valid; min unique '+Math.min(...m.map(x=>x.unique)),m.every(x=>x.valid===20&&x.unique>=2)?'PASS':'FAIL','runtime-metadata.json');add('Authored diagnostic metadata',g,'Final items carry complete diagnostic tags',m.reduce((s,x)=>s+x.tagged,0)+'/'+m.length*20+' tagged','BLOCKED','runtime-metadata.json')}
  await page.screenshot({path:path.join(out,'shadow-harness.png'),fullPage:true});await context.close();
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({date:new Date().toISOString(),rows,errors,blockedMutationRequests:requests},null,2));}
 console.log(JSON.stringify({tests:rows.length,pass:rows.filter(x=>x.status==='PASS').length,fail:rows.filter(x=>x.status==='FAIL').length,blocked:rows.filter(x=>x.status==='BLOCKED').length,errors},null,2));
})().catch(e=>{server.close();console.error(e);process.exitCode=1});
