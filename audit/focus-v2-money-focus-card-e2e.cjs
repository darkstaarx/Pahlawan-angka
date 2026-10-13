#!/usr/bin/env node
'use strict';
// Disposable browser proof for the real Focus-card -> shadow Wang mini-game route.
// The page is localhost only, uses a synthetic profile, and blocks all writes/network mutations.
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const root=path.resolve(__dirname,'..');
const outDir=path.join(__dirname,'focus-v2-e2e');fs.mkdirSync(outDir,{recursive:true});
const base=process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html?focus-shadow=money';
const browserPath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

(async()=>{
 const browser=await pw.chromium.launch({executablePath:browserPath,headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage();
 const checks=[];
 const check=(name,pass,actual)=>{checks.push({name,status:pass?'PASS':'FAIL',actual});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
 try{
  await page.goto(base,{waitUntil:'load'});
  await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
  const setup=await page.evaluate(()=>{
   window.PACommercial={requireFeature:()=>true,canUse:()=>true};
   window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};
   window.save=()=>{};window.enforceRestuLock=()=>false;
   db={schoolGrade:2,name:'Focus-card disposable fixture',hero:'wira',level:1,coins:55,xp:100,
    skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},
    learnerReviewV1:{schema:1,encounters:[]}};
   sess={};
   initAll();
   const id='D2.4.2';
   db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:id,questionKey:'focus-card-'+i,outcome:'unresolved',mode:'kembara',archetypeId:'money_add'}));
   window.__focusShadowProfileBefore=JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters});
   PAFocusPractice.open();
   return {cardCount:document.querySelectorAll('.focusPickCard').length,cardIds:[...document.querySelectorAll('.focusPickCard')].map(x=>x.dataset.skill)};
  });
  check('Focus picker exposes Wang card',setup.cardIds.includes('D2.4.2'),setup);
  await page.locator('.focusPickCard[data-skill="D2.4.2"]').click();
  await page.locator('#paWirayungFrame').waitFor({timeout:15000});
  const src=await page.locator('#paWirayungFrame').getAttribute('src');
  check('Focus card launches isolated Wang shadow overlay',!!src&&src.includes('focus-v2-money-contrast-harness.html')&&src.includes('bridge=1'),src?.replace(/nonce=[^&]+/,'nonce=<ephemeral>'));
  const frame=page.frameLocator('#paWirayungFrame');
  const shell=frame.locator('[data-gerai-diagnostic-shell="1"]');
  await shell.waitFor({timeoutMs:15000});
  check('Diagnostic probe uses Gerai visual shell',await shell.count()===1,await shell.getAttribute('aria-label'));
  const wira=frame.locator('img[src*="kedai-ajaib/wira-idle.webp"]');
  check('Gerai Wira asset is present',await wira.count()===1,await wira.getAttribute('src'));
  await page.screenshot({path:path.join(outDir,'money-focus-card-gerai-shell.png'),fullPage:true});
  await frame.getByRole('button',{name:'Jalankan senario contoh'}).click();
  await frame.getByText('Pada awalnya, latihan menunjukkan Wang mencabar. Ujian susulan mendapati asas Wang boleh dibuat sendiri, tetapi tambah nombor besar masih mengelirukan. Fokus seterusnya ialah nilai tempat dan tambah nombor besar.').waitFor({timeout:20000});
  const inner=await page.locator('#paWirayungFrame').contentFrame().locator('#details').innerText();
  check('Mini-game returns candidate root cause',inner.includes('"rootCause": "add.place_value"')&&inner.includes('"nextSkillId": "D2.2.1"'),inner.slice(0,1200));
  const appSummary=await page.locator('#paFocusShadowSummary').innerText();
  check('Parent summary returns to app overlay',appSummary.includes('Calon fokus: D2.2.1')&&appSummary.includes('tambah nombor besar masih mengelirukan'),appSummary);
  const integrity=await page.evaluate(()=>{const unchanged=window.__focusShadowProfileBefore===JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters});return{unchanged,masteryXpCoinsUnchanged:unchanged,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters.length}});
  check('Synthetic profile and rewards remain unchanged',integrity.unchanged,integrity);
  const report={status:checks.every(x=>x.status==='PASS')?'focus_v2_money_focus_card_e2e_pass':'focus_v2_money_focus_card_e2e_fail',base,checks,profileIntegrity:integrity};
  fs.writeFileSync(path.join(outDir,'money-focus-card-e2e.json'),JSON.stringify(report,null,2)+'\n');
  if(!checks.every(x=>x.status==='PASS'))process.exitCode=1;
 }catch(error){
  checks.push({name:'unexpected browser failure',status:'FAIL',actual:String(error.stack||error)});
  fs.writeFileSync(path.join(outDir,'money-focus-card-e2e.json'),JSON.stringify({status:'focus_v2_money_focus_card_e2e_fail',base,checks},null,2)+'\n');
  console.error(error);process.exitCode=1;
 }finally{await context.close();await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
