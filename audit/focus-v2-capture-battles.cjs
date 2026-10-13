#!/usr/bin/env node
// Capture only after the rendered answer control becomes visible, not q allocation.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');let pw;
try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
(async()=>{const browser=await pw.chromium.launch({executablePath:process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{for(const source of ['production','feature'])for(const device of ['desktop','android']){
 const context=await browser.newContext({serviceWorkers:'block',viewport:device==='android'?{width:360,height:640}:{width:1280,height:800},isMobile:device==='android',hasTouch:device==='android'}),p=await context.newPage();
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());await p.goto(source==='production'?'https://darkstaarx.github.io/Pahlawan-angka/':process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html',{waitUntil:'load'});await p.waitForFunction(()=>!!window.PADemo);
 for(const g of source==='feature'?[1,2,3,4,5,6]:[2]){
 await p.evaluate(()=>PADemo.open());await p.locator('[data-demo-grade="'+g+'"]').click();await p.locator('#paDemoStart').click();
 const skip=p.locator('.paSegelSkip');if(await skip.count()){await skip.waitFor({state:'visible',timeout:15000});await skip.click();await p.locator('.paSegelEntryCinematic').waitFor({state:'detached',timeout:20000})}
 await p.locator('#segelAnswers button').first().waitFor({state:'visible',timeout:30000});await p.waitForTimeout(700);
 await p.screenshot({path:path.join(__dirname,'focus-v2-e2e',source+'-'+device+'-d'+g+'-battle.png')});await p.evaluate(()=>{PASegelDemo.close();PADemo.restoreGuest()});console.log('Captured '+source+' '+device+' D'+g);
 }await context.close();
}}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
