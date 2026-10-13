#!/usr/bin/env node
'use strict';
// Browser proof for the playable Time contrast harness plus focused evaluator
// guardrails. Uses a synthetic in-memory profile and never writes app data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const root=path.resolve(__dirname,'..'),diag=require(path.join(root,'js/engine/focus-time-diagnostic-v1.js'));
const outDir=path.join(__dirname,'focus-v2-e2e');fs.mkdirSync(outDir,{recursive:true});
const base=process.env.FOCUS_TIME_AUDIT_URL||'http://127.0.0.1:8765/audit/focus-v2-time-contrast-harness.html?run=example';
const checks=[],check=(name,pass,actual)=>{checks.push({name,status:pass?'PASS':'FAIL',actual});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
const rows=(family,result,count,prefix)=>Array.from({length:count},(_,i)=>({family,result,purpose:'contrast',probe:`${prefix}-${i}`}));
const observationScenarios={
 clock:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_clock','unresolved',2,'clock-fail'),...rows('time_units','independent',2,'unit-ok')]}),
 units:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_clock','independent',2,'clock-ok'),...rows('time_units','corrected',2,'unit-fail')]}),
 elapsed:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_clock','independent',2,'clock-ok'),...rows('time_units','independent',2,'unit-ok'),...rows('time_elapsed','unresolved',2,'elapsed-fail')]}),
 single:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_clock','unresolved',1,'clock-fail'),...rows('time_units','independent',2,'unit-ok')]}),
 mixed:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_clock','unresolved',2,'clock-fail'),...rows('time_units','unresolved',2,'unit-fail')]}),
 noSignal:diag.evaluate({initialTimeWeak:false,observations:[...rows('time_clock','unresolved',2,'clock-fail'),...rows('time_units','independent',2,'unit-ok')]}),
 conflict:diag.evaluate({initialTimeWeak:true,observations:[{family:'time_clock',result:'independent',purpose:'contrast',probe:'same'},{family:'time_clock',result:'unresolved',purpose:'contrast',probe:'same'},...rows('time_units','independent',2,'unit-ok')]}),
 initialOnly:diag.evaluate({initialTimeWeak:true,observations:[...rows('time_elapsed','unresolved',5,'initial').map(x=>({...x,purpose:'initial_signal'}))]})
};
check('clock weakness maps to D2.5.1',observationScenarios.clock.rootCause==='time.read_clock',observationScenarios.clock);
check('unit weakness maps to D2.5.2',observationScenarios.units.rootCause==='time.unit_relationship',observationScenarios.units);
check('elapsed operation weakness needs clock and unit success',observationScenarios.elapsed.rootCause==='time.timeline_operation',observationScenarios.elapsed);
check('single miss abstains',observationScenarios.single.rootCause===null,observationScenarios.single.state);
check('mixed weaknesses abstain',observationScenarios.mixed.rootCause===null,observationScenarios.mixed.state);
check('no initial Masa signal abstains',observationScenarios.noSignal.state==='insufficient_evidence',observationScenarios.noSignal.state);
check('conflicting duplicate probe is discarded',observationScenarios.conflict.rootCause===null&&observationScenarios.conflict.evidence.uniqueTaggedQuestions===2,observationScenarios.conflict.evidence);
check('initial Kembara failures do not become root-cause votes',observationScenarios.initialOnly.rootCause===null&&observationScenarios.initialOnly.evidence.uniqueTaggedQuestions===0,observationScenarios.initialOnly.evidence);

(async()=>{
 const browserPath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const browser=await pw.chromium.launch({executablePath:browserPath,headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}}),mutations=[];
 await context.route('**/*',route=>{if(['GET','HEAD'].includes(route.request().method()))return route.continue();mutations.push({url:route.request().url(),method:route.request().method()});return route.abort()});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
 try{
  await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>document.querySelector('#details')?.textContent.includes('time.timeline_operation'),{timeout:20000});
  const report=JSON.parse(await page.locator('#details').innerText());
  check('real D2 time generators produce elapsed-operation candidate',report.rootCause==='time.timeline_operation'&&report.nextSkillId==='D2.5.3',report);
  check('early weakness signal and contrast pools stay separate',report.initialSignal.nonindependent===5&&report.evidence.clock.independent===2&&report.evidence.units.independent===2&&report.evidence.elapsed.nonindependent===2,report.evidence);
  check('shadow run leaves mastery, XP and coins untouched',report.integrity.masteryXpCoinsUnchanged&&report.integrity.writes===0,report.integrity);
  check('harness has no browser runtime errors',errors.length===0,errors);
  await page.goto(base.replace('?run=example',''),{waitUntil:'load'});
  await page.getByRole('button',{name:'Main sendiri'}).click();
  const manualPhase=await page.locator('#phase').innerText();
  check('manual mode starts directly at the 6-probe mini-game',await page.locator('#game:not(.hidden) .choice').count()===4&&manualPhase.includes('Mini-game')&&!manualPhase.includes('Kembara'),manualPhase);
  await page.goto(base.replace('/audit/focus-v2-time-contrast-harness.html?run=example','/index.html?focus-shadow=time&autostart=1&run=example'),{waitUntil:'domcontentloaded'});
  await page.locator('#paFocusShadowSummary:not([hidden])').waitFor({timeout:20000});
  const src=await page.locator('#paWirayungFrame').getAttribute('src'),summary=await page.locator('#paFocusShadowSummary').innerText();
  check('Focus route opens the Time mini-game overlay',!!src&&src.includes('focus-v2-time-contrast-harness.html')&&src.includes('bridge=1'),src?.replace(/nonce=[^&]+/,'nonce=<ephemeral>'));
  check('Time result returns a parent-facing summary to the app',summary.includes('Calon fokus: D2.5.3')&&summary.includes('operasi garis masa'),summary);
  await page.goto(base.replace('/audit/focus-v2-time-contrast-harness.html?run=example','/index.html?focus-shadow=time'),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
  await page.evaluate(()=>{
   window.PACommercial={requireFeature:()=>true};
   db={schoolGrade:2,name:'Masa Focus disposable fixture',skills:{},xp:100,coins:55,learnerReviewV1:{schema:1,encounters:Array.from({length:5},(_,i)=>({grade:2,skillId:'D2.5.3',questionKey:'time-focus-'+i,outcome:'unresolved',mode:'practice',archetypeId:'find_end'}))}};
   window.PAFocusPractice.open();
  });
  const timeCard=page.locator('.focusPickCard[data-skill="D2.5.3"]');
  const timeCardCount=await timeCard.count(),focusDeck=await page.locator('#focusPickerDeck').innerText();
  check('Kembara-derived Focus card recommends Masa from its failed practice history',timeCardCount===1,focusDeck);
  await timeCard.click();await page.locator('#paWirayungFrame').waitFor({timeout:10000});
  const actualRoute=await page.locator('#paWirayungFrame').getAttribute('src');
  check('Selecting the Masa Focus card opens the six-probe playable game',!!actualRoute&&actualRoute.includes('focus-v2-time-contrast-harness.html')&&!(actualRoute.includes('run=example')),actualRoute?.replace(/nonce=[^&]+/,'nonce=<ephemeral>'));
  const liveGame=page.frameLocator('#paWirayungFrame');await liveGame.getByRole('button',{name:'Main sendiri'}).click();
  await liveGame.locator('#phase').waitFor({timeout:10000});
  const phase=await liveGame.locator('#phase').innerText();
  check('Card-launched game starts at the first diagnostic probe',phase.includes('Mini-game · baca jam'),phase);
  check('local shadow integration sends no network mutations',mutations.length===0,mutations);
 }catch(error){checks.push({name:'browser run',status:'FAIL',actual:String(error.stack||error)});console.error(error)}
 finally{await context.close();await browser.close()}
 const result={status:checks.every(x=>x.status==='PASS')?'focus_v2_time_mini_game_e2e_pass':'focus_v2_time_mini_game_e2e_fail',base,checks,scenarioResults:Object.fromEntries(Object.entries(observationScenarios).map(([k,v])=>[k,{state:v.state,rootCause:v.rootCause,nextSkillId:v.nextSkillId,reasonCode:v.reasonCode,writes:v.writes}]))};
 fs.writeFileSync(path.join(outDir,'time-mini-game-e2e.json'),JSON.stringify(result,null,2)+'\n');
 if(!checks.every(x=>x.status==='PASS'))process.exitCode=1;
 console.log(JSON.stringify(result,null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
