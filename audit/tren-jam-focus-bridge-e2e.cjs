#!/usr/bin/env node
'use strict';
const {createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const browserPath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base=process.env.TREN_JAM_AUDIT_URL||'http://127.0.0.1:8898/audit/tren-jam-focus-bridge-e2e.html';
(async()=>{
 const browser=await pw.chromium.launch({headless:true,executablePath:browserPath,args:['--no-sandbox']});
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.PAWirayungLive&&window.PAMenaraJam);
 const routes=[['D1.TIME',1,'baca'],['D2.5.1',2,'baca'],['D2.5.2',2,'unit'],['D2.5.3',2,'tamat'],['D3.TIME',3,'tamat'],['D4.TIME',4,'24jam'],['D5.TIME',5,'unit'],['D6.TIME',6,'zon']];
 const seen=[];
 for(const [skill,grade,expectedMode] of routes){
  const launch=await page.evaluate(({skill,grade})=>{db.schoolGrade=grade;return PAWirayungLive.tryStartFocus(skill)}, {skill,grade});
  if(!launch)throw Error('Tren Jam route rejected '+skill);
  const frame=page.frameLocator('#paWirayungFrame');await page.locator('#paWirayungFrame').waitFor();
  await frame.locator('#stageN').waitFor({timeout:12000});
  const src=await page.locator('#paWirayungFrame').getAttribute('src');
  if(!src.includes('menara-jam.html')||!src.includes('#d'+grade+'-'))throw Error(skill+' routed to wrong game/hash: '+src);
  const shouldDiagnose=/^D2\.5\./.test(skill);if(shouldDiagnose!==src.includes('pa_focus_diagnostic=time'))throw Error(skill+' diagnostic mode mismatch: '+src);
  const stage=await frame.locator('#stageN').innerText(),mode=await frame.locator('#mode').innerText();const expectedLabel=expectedMode==='baca'?'BACA':expectedMode==='unit'?'TUKAR':expectedMode==='tamat'?'WAKTU TAMAT':expectedMode==='24jam'?'SISTEM 24 JAM':'ZON MASA';if(!shouldDiagnose&&!mode.includes(expectedLabel))throw Error(skill+' opened wrong bank mode '+mode+' for '+expectedMode);seen.push({skill,src,stage,mode});
  if(skill==='D1.TIME'){await frame.locator('body').evaluate(()=>window.parent.postMessage({type:'PA_TREN_JAM_ROUND',version:1,nonce:new URLSearchParams(location.search).get('pa_nonce'),grade:1,skillId:'D1.TIME',mode:'baca',archetypeId:'read_clock',questionKey:'e2e:grade1:round1',misses:0,hints:0,at:Date.now()},location.origin));await page.waitForFunction(()=>db.learnerReviewV1?.encounters?.some(e=>e.skillId==='D1.TIME'),{timeout:8000});}
  await page.locator('#paWirayungExit').click();
 }
 // Verify the bridge persists an authentic evaluator result only for the same profile/grade/skill.
 const ordinary=await page.evaluate(()=>db.learnerReviewV1?.encounters?.find(e=>e.skillId==='D1.TIME')||null);if(!ordinary||ordinary.outcome!=='independent'||ordinary.archetypeId!=='read_clock')throw Error('Ordinary Tren Jam answers must be bridged into focus evidence: '+JSON.stringify(ordinary));
 await page.evaluate(()=>{db.schoolGrade=2;db.focusDiagnosticsV1={version:1,reports:[]};window.__beforeFocus=JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins});});
 await page.evaluate(()=>PAWirayungLive.tryStartFocus('D2.5.3'));
 const timeFrame=page.frameLocator('#paWirayungFrame');await timeFrame.locator('#stageN').waitFor({timeout:12000});
 await page.frameLocator('#paWirayungFrame').locator('body').evaluate(()=>{
  const families=['time_clock','time_units','time_elapsed'];
  const observations=families.flatMap((family)=>[1,2].map(i=>({purpose:'contrast',family,probe:family+':probe-'+i,result:family==='time_units'?'corrected':'independent'})));
  const report=window.PAFocusTimeDiagnosticV1.evaluate({observations,initialTimeWeak:true,originSkillId:'D2.5.3'});
  window.parent.postMessage({type:'PA_FOCUS_TIME_RESULT',version:1,nonce:new URLSearchParams(location.search).get('pa_nonce'),report},location.origin);
 });
 await page.waitForFunction(()=>db.focusDiagnosticsV1?.reports?.length===1,{timeout:10000});
 const stored=await page.evaluate(()=>({r:db.focusDiagnosticsV1.reports[0],clean:window.__beforeFocus===JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins}),text:document.querySelector('#paWirayungReport')?.innerText||''}));
 if(stored.r.nextSkillId!=='D2.5.2'||stored.r.state!=='candidate'||!stored.clean||!stored.text.includes('Calon fokus seterusnya'))throw Error('Unexpected Tren Jam persistence/report: '+JSON.stringify(stored));
 if(errors.length)throw Error('Browser errors: '+errors.join('; '));
 console.log(JSON.stringify({routes:seen,diagnosis:stored.r,parentReport:stored.text,profileAndRewardsUnchanged:stored.clean,pageErrors:errors},null,2));
 await context.close();await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
