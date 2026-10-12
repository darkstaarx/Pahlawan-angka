#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');let pw;
try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
(async()=>{const browser=await pw.chromium.launch({executablePath:process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),rows=[];
try{for(const device of ['desktop','android']){
 const context=await browser.newContext({serviceWorkers:'block',viewport:device==='android'?{width:360,height:640}:{width:1280,height:800},isMobile:device==='android',hasTouch:device==='android'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));await page.goto(process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html',{waitUntil:'load'});await page.waitForTimeout(1000);
 rows.push({test:'Feature '+device+' fresh login regression',grade:'1–6',expected:'No null/undefined profile exceptions',actual:errors,status:errors.length?'FAIL':'PASS',evidence:'bootstrap-results.json'});
 const result=await page.evaluate(()=>{db={schoolGrade:2,name:'Audit fixture',skills:{},logs:[],level:1,xp:0,coins:0,coreFrontier:1};initAll();const before=JSON.stringify(db);PAParentTools.mount();updateDevQuickButton();return{worksheet:!!document.querySelector('.paWorksheetCard'),integrity:before===JSON.stringify(db)}});
 rows.push({test:'Feature '+device+' panel mounts after profile supplied',grade:2,expected:'Worksheet available; profile unchanged',actual:result,status:result.worksheet&&result.integrity?'PASS':'FAIL',evidence:'bootstrap-results.json'});await context.close();
}}finally{await browser.close();fs.writeFileSync(path.join(__dirname,'focus-v2-e2e/bootstrap-results.json'),JSON.stringify({rows},null,2))}console.log(JSON.stringify(rows,null,2));if(rows.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
