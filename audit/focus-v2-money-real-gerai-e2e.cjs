#!/usr/bin/env node
'use strict';
// Plays the opt-in diagnostic probes in the actual Gerai page through the
// Focus card. Uses a disposable in-memory profile and blocks non-GET requests.
const {createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const browserPath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base=process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html';

async function runScenario(browser,name,answers,expectedCause,expectedNext){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
 await page.evaluate(()=>{
  window.PACommercial={requireFeature:()=>true,canUse:()=>true};
  window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};window.save=()=>{};window.enforceRestuLock=()=>false;
  db={schoolGrade:2,name:'Disposable Focus test',hero:'wira',level:1,coins:55,xp:100,skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},learnerReviewV1:{schema:1,encounters:[]}};sess={};initAll();
  const id='D2.4.2';db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:id,questionKey:'focus-card-'+i,outcome:'unresolved',mode:'kembara',archetypeId:'money_add'}));
  window.__before=JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters});PAFocusPractice.open();
 });
 await page.locator('.focusPickCard[data-skill="D2.4.2"]').click();
 const frame=page.frameLocator('#paWirayungFrame');
 await page.locator('#paWirayungFrame').waitFor({timeout:15000});
 const src=await page.locator('#paWirayungFrame').getAttribute('src');
 if(!src?.includes('gerai-wirayung.html?pa_focus_diagnostic=money'))throw Error('Focus card did not launch real Gerai: '+src);
 const prompt=frame.locator('#fdPrompt');await prompt.waitFor({timeout:20000});
 const types=[];
 for(let i=0;i<6;i++){
  try{await frame.locator('#fdProgress').filter({hasText:`Probe ${i+1} / 6`}).waitFor({timeout:15000})}catch(e){const buttons=await frame.locator('.fd-choice').evaluateAll(xs=>xs.map(x=>({text:x.textContent,disabled:x.disabled}))).catch(()=>[]);throw new Error(`${name} expected probe ${i+1}; current progress=${await frame.locator('#fdProgress').innerText().catch(()=>'<missing>')}, title=${await frame.locator('#fdTitle').innerText().catch(()=>'<missing>')}, note=${await frame.locator('#fdNote').innerText().catch(()=>'<missing>')}, buttons=${JSON.stringify(buttons)}, errors=${JSON.stringify(errors)}; ${e.message}`)}
  await frame.locator('.fd-choice').first().waitFor({timeout:15000});
  types.push(await frame.locator('#fdProgress').innerText());
  if(answers[i]===0){await frame.locator('.fd-choice').nth(0).click()}
  else if(answers[i]===2){await frame.locator('.fd-choice').nth(1).click();await frame.locator('.fd-choice').nth(0).click()}
  else{for(let attempt=0;attempt<5;attempt++){const enabled=frame.locator('.fd-choice:not(:disabled)'),count=await enabled.count();if(count<=1)break;await enabled.nth(1).click()}}
 }
 await frame.locator('#fdTitle').filter({hasText:/Semakan selesai|Semakan perlukan lebih bukti/}).waitFor({timeout:20000});
 const parentText=await page.locator('#paFocusShadowSummary').innerText();
 const gameReport=await frame.locator('#fdPrompt').innerText();
 const integrity=await page.evaluate(()=>window.__before===JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters}));
 const savedReport=await page.evaluate(()=>db.focusDiagnosticsV1?.reports?.at(-1)||null);
 const nextFocusIds=await page.evaluate(()=>PAFocusPractice.summary().items.map(x=>x.id));
 const parentReport=await page.locator('#paWirayungReport').innerText();
 const result={name,src,parentText,gameReport,probeTypes:types,integrity,savedReport,nextFocusIds,parentReport,pageErrors:errors};
 if(!parentText.includes(expectedCause)||!parentText.includes(expectedNext))throw Error(name+' unexpected diagnosis: '+JSON.stringify(result));
 if(!integrity)throw Error(name+' changed synthetic production profile');
 if(!savedReport||savedReport.nextSkillId!==expectedNext||savedReport.skillId!=='D2.4.2')throw Error(name+' did not save the diagnostic separately: '+JSON.stringify(result));
 if(!nextFocusIds.includes(expectedNext)||nextFocusIds.includes('D2.4.2'))throw Error(name+' did not replace the Wang mini-game card with its diagnosed focus: '+JSON.stringify(result));
 if(!parentReport.includes('Semakan Kemahiran Fokus')||!parentReport.includes(expectedNext))throw Error(name+' saved diagnosis is missing from the parent report: '+JSON.stringify(result));
 if(errors.length)throw Error(name+' browser errors: '+errors.join('; '));
 await context.close();return result;
}

(async()=>{
 const browser=await pw.chromium.launch({executablePath:browserPath,headless:true});
 try{
  const largeDigits=await runScenario(browser,'basic-and-small-pass-large-fail',[0,0,0,0,1,1],'tambah nombor besar','D2.2.1');
  const moneyBasics=await runScenario(browser,'money-basics-fail-operations-pass',[1,1,0,0,0,0],'nilai asas wang','D2.4.1');
  const corrected=await runScenario(browser,'corrected-money-basics-stay-nonindependent',[2,2,0,0,0,0],'nilai asas wang','D2.4.1');
  console.log(JSON.stringify({status:'focus_v2_money_real_gerai_e2e_pass',scenarios:[largeDigits,moneyBasics,corrected]},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
