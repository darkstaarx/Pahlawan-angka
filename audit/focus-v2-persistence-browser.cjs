#!/usr/bin/env node
// Guest component lifecycle; opens the public demo chooser on each cycle.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');let pw;
try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
(async()=>{const browser=await pw.chromium.launch({executablePath:process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),rows=[];
try{for(const source of ['production','feature'])for(const device of ['desktop','android']){
 const context=await browser.newContext({serviceWorkers:'block',viewport:device==='android'?{width:360,height:640}:{width:1280,height:800},isMobile:device==='android',hasTouch:device==='android'}),p=await context.newPage();
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());await p.goto(source==='production'?'https://darkstaarx.github.io/Pahlawan-angka/':process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html',{waitUntil:'load'});await p.waitForFunction(()=>!!window.PADemo);
 const snapshot=()=>p.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));const before=await snapshot();
 for(let g=1;g<=6;g++){await p.evaluate(()=>PADemo.open());await p.locator('[data-demo-grade="'+g+'"]').click();await p.locator('#paDemoStart').click();await p.waitForFunction(()=>!!PASegelDemo.state()?.q);await p.evaluate(()=>{PASegelDemo.close();PADemo.restoreGuest()})}
 const after=await snapshot(),profileKeys=['pa_coach_v6_full','pa_coach_v5'];
 const summarize=v=>{if(!v)return null;const d=JSON.parse(v);return{name:d.name,schoolGrade:d.schoolGrade,demoMode:d.demoMode,skills:Object.keys(d.skills||{}).length}};
 const pass=profileKeys.every(k=>before[k]===after[k]);rows.push({test:source+' '+device+' guest persistence retest',grade:'1–6',expected:'Learner profile keys unchanged after six lifecycle cycles',actual:{profileKeysBefore:profileKeys.map(k=>[k,summarize(before[k])]),profileKeysAfter:profileKeys.map(k=>[k,summarize(after[k])]),otherChangedKeys:[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>before[k]!==after[k]&&!profileKeys.includes(k))},status:pass?'PASS':'FAIL',evidence:'persistence-results.json'});await context.close();
}}finally{await browser.close();fs.writeFileSync(path.join(__dirname,'focus-v2-e2e/persistence-results.json'),JSON.stringify({rows},null,2))}console.log(JSON.stringify(rows,null,2));if(rows.some(x=>x.test.startsWith('feature')&&x.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
