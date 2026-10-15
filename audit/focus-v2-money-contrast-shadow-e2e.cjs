#!/usr/bin/env node
'use strict';
// Exercises shadow hypotheses and the production Focus bridge with disposable
// in-memory profiles, including real basket/coin play in the live Gerai route.
// Requests other than GET/HEAD are blocked; the test never touches a real account.
const {createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const browserPath=process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base=process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8899/index.html';

async function playContrast(browser,name,moneyFails,plainFails,expectedCause,expectedNext=''){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>{window.__focusMessage=null;addEventListener('message',e=>{if(e.data?.type==='PA_FOCUS_MONEY_SHADOW_RESULT')window.__focusMessage=e.data.report})});
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
 await page.evaluate(()=>{
  window.PACommercial={requireFeature:()=>true,canUse:()=>true};
  window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};window.save=()=>{};window.enforceRestuLock=()=>false;
  db={schoolGrade:2,name:'Disposable Focus test',hero:'wira',level:1,coins:55,xp:100,skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},learnerReviewV1:{schema:1,encounters:[]}};sess={};initAll();
  const id='D2.4.2';db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:id,questionKey:'focus-card-'+i,outcome:'unresolved',mode:'kembara',archetypeId:'money_add'}));
  window.__before=JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters});window.__diagnosticStarted=PAWirayungLive.openMoneyShadow(id,true);
 });
 if(!await page.evaluate(()=>window.__diagnosticStarted))throw Error('Disposable profile could not start the diagnostic overlay');
 const frame=page.frameLocator('#paWirayungFrame');await page.locator('#paWirayungFrame').waitFor({timeout:15000});
 const src=await page.locator('#paWirayungFrame').getAttribute('src');
 if(!src?.includes('pa_origin_skill=D2.4.2')||!src.includes('pa_grade=2'))throw Error('Focus card did not pass its real origin and grade to Gerai: '+src);
 const progress=frame.locator('#fdProgress');await progress.waitFor({timeout:20000});
 const first=await progress.innerText(),probeCount=Number(first.match(/Probe 1 \/ (\d+)/)?.[1]||0);
 if(probeCount!==4)throw Error(`${name} expected two exact money/plain pairs (4 questions), got ${first}`);
 const types=[];
 for(let i=0;i<probeCount;i++){
  await progress.waitFor({timeout:10000});const current=await progress.innerText();types.push(current);
  const moneySide=current.endsWith('· money'),shouldFail=moneySide?moneyFails:plainFails;
  if(shouldFail){
   await frame.locator('.fd-choice[data-correct="false"]').first().click();await page.waitForTimeout(25);
   const neutral=await frame.locator('#fdNote').innerText(),green=await frame.locator('.fd-choice.good').count();
   if(!neutral.includes('Jawapan direkod')||green)throw Error(name+' revealed the answer before the matched contrast finished');
  }
  else await frame.locator('.fd-choice[data-correct="true"]').click();
  if(i<probeCount-1)await frame.locator('#fdProgress').filter({hasText:`Probe ${i+2} / ${probeCount}`}).waitFor({timeout:10000});
 }
 await frame.locator('#fdTitle').filter({hasText:/Semakan selesai|Semakan perlukan lebih bukti/}).waitFor({timeout:20000});
 const gameReport=await frame.locator('#fdPrompt').innerText(),parentText=await page.locator('#paFocusShadowSummary').innerText();
 const integrity=await page.evaluate(()=>window.__before===JSON.stringify({skills:db.skills,xp:db.xp,coins:db.coins,encounters:db.learnerReviewV1.encounters}));
 const savedReport=await page.evaluate(()=>db.focusDiagnosticsV1?.reports?.at(-1)||null),rawReport=await page.evaluate(()=>window.__focusMessage);
 const nextFocusIds=await page.evaluate(()=>PAFocusPractice.summary().items.map(x=>x.id));
 const parentReport=await page.locator('#paWirayungReport').innerText();
 const result={name,src,probeTypes:types,gameReport,parentText,integrity,savedReport,diagnosticEvidence:rawReport?.evidence?.diagnostic?.evidence,nextFocusIds,parentReport,pageErrors:errors};
 if(!savedReport||savedReport.diagnosticVersion!=='2.0.0-shadow'||savedReport.state!=='candidate'||savedReport.rootCause!==expectedCause||savedReport.nextSkillId!==expectedNext)throw Error(name+' unexpected persisted analysis: '+JSON.stringify(result));
 if(!integrity)throw Error(name+' changed mastery, rewards, or learner-review evidence');
 if(expectedNext&&(!nextFocusIds.includes(expectedNext)||nextFocusIds.includes('D2.4.2')))throw Error(name+' did not hand off the Focus card to the diagnosed operation: '+JSON.stringify(result));
 if(!expectedNext&&!nextFocusIds.includes('D2.4.2'))throw Error(name+' should keep the Wang card when the contrast points to money-context difficulty');
 if(!parentReport.includes('Semakan Kemahiran Fokus')||!parentReport.includes(expectedNext||'D2.4.2'))throw Error(name+' missing from the parent report: '+JSON.stringify(result));
 if(expectedNext){
  const recovered=await page.evaluate(next=>{const at=db.focusDiagnosticsV1.reports.at(-1).at;for(let i=0;i<5;i++)db.learnerReviewV1.encounters.push({grade:2,skillId:next,questionKey:'recovered-'+(i%2),outcome:'independent',mode:'practice',resolvedAt:at+i+1});return PAFocusPractice.summary().items.map(x=>x.id)},expectedNext);
  if(recovered.includes(expectedNext)||recovered.includes('D2.4.2'))throw Error(name+' did not retire the operation override while retaining the resolved Money diagnosis: '+JSON.stringify(recovered));
 }
 if(errors.length)throw Error(name+' browser errors: '+errors.join('; '));
 await context.close();return result;
}

async function smokeRoute(browser,skill,grade,modes,expectedCount){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>{window.__moneyReport=null;addEventListener('message',e=>{if(e.data?.type==='PA_FOCUS_MONEY_SHADOW_RESULT')window.__moneyReport=e.data.report})});
 const query=new URLSearchParams({pa_focus_diagnostic:'money',pa_origin_skill:skill,pa_grade:String(grade),pa_focus_modes:modes,pa_nonce:'route-smoke'});
 await page.goto(base.replace(/index\.html(?:\?.*)?$/,'')+'gerai-wirayung.html?'+query.toString()+'#d'+grade+'-bayar',{waitUntil:'load'});
 try{await page.locator('#fdProgress').waitFor({timeout:20000})}catch(error){throw Error(`${skill} diagnostic overlay did not start; pageErrors=${errors.join('; ')}; ${error.message}`)}const progress=await page.locator('#fdProgress').innerText();
 const found=Number(progress.match(/Probe 1 \/ (\d+)/)?.[1]||0);
 if(found!==expectedCount)throw Error(`${skill} expected ${expectedCount} contrast questions, got ${progress}; errors=${errors.join('; ')}`);
 const probeFrame=page;
 for(let i=0;i<found;i++){
  const current=await probeFrame.locator('#fdProgress').innerText();
  const renderedChoices=(await probeFrame.locator('.fd-choice').allTextContents()).map(x=>x.trim()).filter(Boolean);
  if(renderedChoices.length!==4||new Set(renderedChoices).size!==4)throw Error(`${skill} probe ${i+1} must render four nonempty distinct answer choices; got ${JSON.stringify(renderedChoices)}`);
  if(current.endsWith('· plain')){
   const prompt=await probeFrame.locator('#fdPrompt').innerText();
   const discount=prompt.match(/^([\d.]+)\s*−\s*\(([\d.]+)%\s*×\s*([\d.]+)\)\s*=\s*\?$/),m=prompt.match(/([\d.]+)%\s*×\s*([\d.]+)\s*=\s*\?|([\d.]+)\s*([+−×÷])\s*([\d.]+)\s*=\s*\?/);
   if(!discount&&!m)throw Error(`${skill} plain probe is not a single exact operation: ${prompt}`);
   const expected=discount?Number(discount[1])-Number(discount[2])*Number(discount[3])/100:m[1]?Number(m[1])*Number(m[2])/100:(m[4]==='+'?Number(m[3])+Number(m[5]):m[4]==='−'?Number(m[3])-Number(m[5]):m[4]==='×'?Number(m[3])*Number(m[5]):Number(m[3])/Number(m[5]));
   const correct=await probeFrame.locator('.fd-choice[data-correct="true"]').innerText(),actual=Number(correct.replace(/,/g,''));
   if(!Number.isFinite(expected)||!Number.isFinite(actual)||Math.abs(expected-actual)>0.011)throw Error(`${skill} wrong paired plain answer: ${prompt} -> ${correct} (expected ${expected})`);
  }
  await probeFrame.locator('.fd-choice[data-correct="true"]').click();
  if(i<found-1)await probeFrame.locator('#fdProgress').filter({hasText:`Probe ${i+2} / ${found}`}).waitFor({timeout:10000});
 }
 await page.locator('#fdTitle').filter({hasText:/Semakan selesai|Semakan perlukan lebih bukti/}).waitFor({timeout:20000});
 const report=await page.evaluate(()=>window.__moneyReport);
 if(!report)throw Error(`${skill} did not produce a diagnostic report after its probes`);
 const expectedFamilies=new Set(modes.split(',').flatMap(mode=>({bayar:['money_unit','money_add','money_subtract','money_multiply','money_divide','money_problem','money_total','money_change','money_unit_price','money_budget'],baki:['money_subtract','money_change','money_budget'],bahagi:['money_divide'],simpanan:['money_subtract'],diskaun:['money_discount'],untung:['money_profit']}[mode]||[])));
 for(const family of expectedFamilies){const evidence=report.evidence?.diagnostic?.evidence?.byFamily?.[family];if(evidence&&evidence.uniquePairs!==2)throw Error(`${skill} ${family} produced ${evidence.uniquePairs} unique operand pairs; two are required`)}
 if(errors.length)throw Error(skill+' browser errors: '+errors.join('; '));
 await context.close();return {skill,grade,modes,probes:found,matchedPairs:Object.fromEntries(Object.entries(report.evidence.diagnostic.evidence.byFamily).map(([f,v])=>[f,v.uniquePairs]))};
}

async function smokeProductionFallback(browser,skill,grade){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.PAWirayungLive,{timeout:20000});
 const launched=await page.evaluate(({skill,grade})=>{
  window.PACommercial={requireFeature:()=>true,canUse:()=>true};window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};window.save=()=>{};window.enforceRestuLock=()=>false;
  db={schoolGrade:grade,name:'Disposable Focus fallback',hero:'wira',level:1,coins:0,xp:0,skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},learnerReviewV1:{schema:1,encounters:[]}};sess={};initAll();return PAWirayungLive.tryStartFocus(skill);
 },{skill,grade});
 if(!launched)throw Error(`${skill} did not retain the ordinary Gerai route`);
 const frame=page.locator('#paWirayungFrame');await frame.waitFor({timeout:10000});const src=await frame.getAttribute('src');
 if(!src||src.includes('pa_focus_diagnostic=money'))throw Error(`${skill} opened a contrast exam despite having no matching authored bank: ${src}`);
 if(!src.includes(`#d${grade}-`))throw Error(`${skill} ordinary Gerai route lost its grade: ${src}`);
 const game=page.frameLocator('#paWirayungFrame');await game.locator('#go').waitFor({timeout:15000});
 const gameFrame=page.frames().find(frame=>frame.url().includes('gerai-wirayung.html'));if(!gameFrame)throw Error('Real Gerai iframe was not created');
 if(await game.locator('#fdProgress').count())throw Error(`${skill} replaced the real Gerai interaction with the diagnostic overlay`);
 if(errors.length)throw Error(`${skill} browser errors: ${errors.join('; ')}`);
 await context.close();return {skill,grade,ordinaryGameFallback:true,src};
}

async function smokeLiveGeraiDiagnosis(browser){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:430,height:900}}),page=await context.newPage(),errors=[];
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
 await page.evaluate(()=>{
  window.PACommercial={requireFeature:()=>true,canUse:()=>true};window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};window.save=()=>{};window.enforceRestuLock=()=>false;
  db={schoolGrade:2,name:'Disposable Live Gerai test',hero:'wira',level:1,coins:55,xp:100,skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},learnerReviewV1:{schema:1,encounters:[]}};sess={};initAll();
  db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:'D2.4.2',questionKey:'live-focus-'+i,outcome:'unresolved',mode:'kembara',archetypeId:'money_add'}));
  window.__liveStarted=PAWirayungLive.tryStartFocus('D2.4.2');
 });
 if(!await page.evaluate(()=>window.__liveStarted))throw Error('D2.4.2 Focus route failed to launch');
 const frameEl=page.locator('#paWirayungFrame');await frameEl.waitFor({timeout:10000});const src=await frameEl.getAttribute('src');
 if(!src?.includes('pa_focus_live=money')||src.includes('pa_focus_diagnostic=money'))throw Error('Focus did not launch the real Gerai live-diagnostic route: '+src);
 const game=page.frameLocator('#paWirayungFrame');await game.locator('#go').waitFor({timeout:15000});
 const gameFrame=page.frames().find(frame=>frame.url().includes('gerai-wirayung.html'));if(!gameFrame)throw Error('The live Gerai iframe did not load');
 await gameFrame.waitForFunction(()=>typeof window.__geraiDebug==='function',{timeout:10000});
 const seenDays=[];
 for(let round=1;round<=2;round++){
  const day=await game.locator('#dayLbl').innerText();seenDays.push(day);
  const debug=await gameFrame.evaluate(()=>window.__geraiDebug());
  if(debug.mode!=='bayar'||!Array.isArray(debug.items)||debug.items.length!==2)throw Error('Expected a real two-item checkout round; got '+JSON.stringify(debug));
  if(debug.focusFamily!=='money_add'||JSON.stringify(debug.focusOperands)===JSON.stringify(debug.focusPlainOperands))throw Error('The plain operation must be a distinct but matched addition probe: '+JSON.stringify(debug));
  for(const id of debug.items)await game.locator(`#shelf .item[data-id="${id}"]`).click();
  await game.locator('#go').click();await game.locator('#stepLbl').filter({hasText:'KIRA'}).waitFor({timeout:5000});
  let remaining=debug.target;
  for(const [amount,label] of [[500,'RM5'],[100,'RM1'],[50,'50 sen'],[20,'20 sen'],[10,'10 sen']]){
   const count=Math.floor(remaining/amount);for(let i=0;i<count;i++)await game.locator(`#purse .money[aria-label="Letak ${label}"]`).click();remaining-=count*amount;
  }
  if(remaining)throw Error('Test coin denominations could not represent target '+debug.target);
  await game.locator('#go').click();
  const finishText=(await game.locator('#stamp').innerText())+' '+(await game.locator('#bText').innerText());
  if(/RM\d/.test(finishText))throw Error('The live contrast revealed the contextual answer before the plain probe: '+finishText);
  if(round===1)await game.locator('#dayLbl').filter({hasText:'Ke-2'}).waitFor({timeout:12000});
 }
 const diagnostic=game.locator('#focusDiagnostic');await diagnostic.waitFor({timeout:15000});
 for(let i=0;i<2;i++){
  const note=await game.locator('#fdNote').innerText();if(!/tanpa tunjuk|Keputusan hanya dipaparkan/i.test(note))throw Error('Live Gerai plain probes must withhold correctness feedback: '+note);
  await game.locator('.fd-choice[data-correct="false"]').first().click();
  if(i===0)await game.locator('#fdProgress').filter({hasText:'Soalan nombor 2 / 2'}).waitFor({timeout:5000});
 }
 await game.locator('#fdTitle').filter({hasText:'Semakan selesai'}).waitFor({timeout:10000});
 await page.waitForFunction(()=>db.focusDiagnosticsV1?.reports?.length===1,{timeout:10000});
 const result=await page.evaluate(()=>({report:db.focusDiagnosticsV1.reports.at(-1),moneyEvents:db.wirayungProgress?.events?.length||0,next:PAFocusPractice.summary().items.map(x=>x.id)}));
 if(result.moneyEvents!==2||result.report.state!=='candidate'||result.report.rootCause!=='operation.addition'||result.report.nextSkillId!=='D2.2.1'||result.report.testedDemand!=='tambah nombor asas'||!result.next.includes('D2.2.1'))throw Error('Real Gerai did not transfer scoped paired evidence to Focus: '+JSON.stringify(result));
 if(errors.length)throw Error('Live Gerai page errors: '+errors.join('; '));
 await context.close();return {src,actualGeraiRounds:seenDays.length,report:result.report,nextFocus:result.next};
}

async function smokeLiveSavingsGerai(browser){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:430,height:900}}),page=await context.newPage(),errors=[];
 await context.route('**/*',route=>['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive,{timeout:20000});
 await page.evaluate(()=>{
  window.PACommercial={requireFeature:()=>true,canUse:()=>true};window.PACloud={state:{},scheduleSave:()=>{},syncSaveNow:()=>{}};window.save=()=>{};window.enforceRestuLock=()=>false;
  db={schoolGrade:2,name:'Disposable Savings test',hero:'wira',level:1,coins:0,xp:0,skills:{},logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}},learnerReviewV1:{schema:1,encounters:[]}};sess={};initAll();
  db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:'D2.4.6',questionKey:'savings-focus-'+i,outcome:'unresolved',mode:'kembara',archetypeId:'money_subtract'}));
  window.__savingsStarted=PAWirayungLive.tryStartFocus('D2.4.6');
 });
 if(!await page.evaluate(()=>window.__savingsStarted))throw Error('D2.4.6 Focus route failed to launch');
 const game=page.frameLocator('#paWirayungFrame');await page.locator('#paWirayungFrame').waitFor({timeout:10000});await game.locator('#go').waitFor({timeout:15000});
 const gameFrame=page.frames().find(frame=>frame.url().includes('gerai-wirayung.html'));if(!gameFrame)throw Error('The live savings Gerai iframe did not load');
 await gameFrame.waitForFunction(()=>typeof window.__geraiDebug==='function'&&window.__geraiDebug()?.mode==='simpanan',{timeout:15000});const seen=[];
 for(let round=1;round<=2;round++){
  await gameFrame.waitForFunction(()=>window.__geraiDebug?.()?.mode==='simpanan',{timeout:15000});
  const debug=await gameFrame.evaluate(()=>window.__geraiDebug());
  if(debug.mode!=='simpanan'||debug.focusFamily!=='money_subtract'||debug.focusOperands.task!=='savings'||debug.focusOperands.minuend-debug.focusOperands.subtrahend!==debug.target/100)throw Error('D2.4.6 did not play its tagged savings scenario: '+JSON.stringify(debug));
  await game.locator('#say').filter({hasText:/menerima|disimpan|simpan/i}).waitFor({timeout:5000});const prompt=await game.locator('#say').innerText();seen.push(prompt);
  if(!/menerima|disimpan|simpan/i.test(prompt))throw Error('Savings scenario did not use savings context: '+prompt);
  for(const id of debug.items)await game.locator(`#shelf .item[data-id="${id}"]`).click();
  await game.locator('#go').click();await game.locator('#stepLbl').filter({hasText:'KIRA'}).waitFor({timeout:5000});
  let remaining=debug.target;
  for(const [amount,label] of [[500,'RM5'],[100,'RM1'],[50,'50 sen'],[20,'20 sen'],[10,'10 sen']]){
   const count=Math.floor(remaining/amount);for(let i=0;i<count;i++)await game.locator(`#purse .money[aria-label="Letak ${label}"]`).click();remaining-=count*amount;
  }
  if(remaining)throw Error('Test coin denominations could not represent savings '+debug.target);
  await game.locator('#go').click();if(round===1)await game.locator('#dayLbl').filter({hasText:'Ke-2'}).waitFor({timeout:12000});
 }
 await game.locator('#focusDiagnostic').waitFor({timeout:15000});
 for(let i=0;i<2;i++){
  const current=await game.locator('#fdProgress').innerText(),probe=await game.locator('#fdPrompt').innerText();if(!current.includes(`Soalan nombor ${i+1} / 2`)||!/[−-]/.test(probe))throw Error('Expected matched plain subtraction probe after savings: '+JSON.stringify({current,probe}));
  await game.locator('.fd-choice[data-correct="false"]').first().click();
  if(i===0)await game.locator('#fdProgress').filter({hasText:'Soalan nombor 2 / 2'}).waitFor({timeout:5000});
 }
 await game.locator('#fdTitle').filter({hasText:'Semakan selesai'}).waitFor({timeout:10000});
 await page.waitForFunction(()=>db.focusDiagnosticsV1?.reports?.length===1,{timeout:10000});
 const result=await page.evaluate(()=>({events:db.wirayungProgress?.events||[],report:db.focusDiagnosticsV1.reports.at(-1),parent:document.querySelector('#paWirayungReport')?.innerText||'',next:PAFocusPractice.summary().items.map(x=>x.id)}));
 const savings=result.events.filter(e=>e.grade===2&&e.mode==='simpanan');
 if(savings.length!==2||result.report.skillId!=='D2.4.6'||result.report.rootCause!=='operation.subtraction'||result.report.nextSkillId!=='D2.2.2'||!result.report.parentText.includes('Latihan simpanan wang boleh dibuat sendiri')||!result.parent.includes('D2.4.6')||!result.parent.includes('kiraan tolak nombor tanpa konteks wang'))throw Error('Savings evidence did not reach its exact skill and parent wording: '+JSON.stringify(result));
 if(errors.length)throw Error('Savings Gerai page errors: '+errors.join('; '));
 await context.close();return {playedSavingsRounds:savings.length,scenarios:seen,report:result.report,parentReport:result.parent,nextFocus:result.next};
}

async function smokeRouterPlans(browser){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.PAGeraiWirayung,{timeout:20000});
 const plans=await page.evaluate(()=>Object.fromEntries(['D1.MONEY','D2.4.2','D2.4.3','D2.4.4','D2.4.5','D2.4.6','D3.MONEY','D4.MONEY','D5.MONEY','D6.MONEY'].map(skill=>[skill,window.PAGeraiWirayung.planFor({schoolGrade:Number((/^D(\d)/.exec(skill)||[])[1]),learnerReviewV1:{encounters:[]}},skill)])));
 for(const skill of Object.keys(plans))if(!plans[skill])throw Error(`${skill} has diagnostic content but no ordinary Gerai plan`);
 if(plans['D2.4.5'].modes.join(',')!=='bahagi')throw Error('D2.4.5 division does not route through Gerai bahagi: '+JSON.stringify(plans['D2.4.5']));
 if(plans['D2.4.6'].modes.join(',')!=='simpanan')throw Error('D2.4.6 savings does not route through the dedicated savings mode: '+JSON.stringify(plans['D2.4.6']));
 await context.close();return plans;
}

async function smokeLiveFamilySelection(browser,origin,grade,modes,expectedFamily,expectedBand){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 const url=new URL('gerai-wirayung.html',base);url.searchParams.set('pa_focus_live','money');url.searchParams.set('pa_origin_skill',origin);url.searchParams.set('pa_focus_modes',modes);url.hash='d'+grade+'-'+modes.replaceAll(',','-');
 await page.goto(url.href,{waitUntil:'load'});await page.waitForFunction(()=>window.__geraiDebug?.()?.focusFamily,{timeout:15000});
 const result=await page.evaluate(()=>window.__geraiDebug());
 if(result.focusFamily!==expectedFamily||result.focusBand!==expectedBand)throw Error(`Live family mismatch for ${origin}/${modes}: `+JSON.stringify(result));
 if(JSON.stringify(result.focusOperands)===JSON.stringify(result.focusPlainOperands))throw Error('Money and plain probes reused the same values: '+JSON.stringify(result));
 if(origin==='D2.4.6'&&(result.mode!=='simpanan'||result.focusOperands.task!=='savings'||result.focusOperands.minuend-result.focusOperands.subtrahend!==result.focusOperands.result))throw Error('D2.4.6 did not start a correctly tagged savings scenario: '+JSON.stringify(result));
 await context.close();return {origin,modes,family:result.focusFamily,demandBand:result.focusBand,operands:result.focusOperands,plainOperands:result.focusPlainOperands};
}

(async()=>{
 const browser=await pw.chromium.launch({executablePath:browserPath,headless:true});
 try{
  if(process.env.FOCUS_SAVINGS_ONLY){const liveSavings=await smokeLiveSavingsGerai(browser);console.log(JSON.stringify({status:'focus_v2_money_savings_e2e_pass',liveSavings},null,2));return}
  const moneyWeak=await playContrast(browser,'money-context-weak',true,false,'money.add');
  const operationWeak=await playContrast(browser,'plain-addition-weak',false,true,'operation.addition','D2.2.1');
  const routes=[];
  for(const args of [['D1.MONEY',1,'bayar',4],['D2.4.2',2,'bayar',4],['D2.4.3',2,'baki',4],['D2.4.4',2,'bayar',4],['D2.4.5',2,'bahagi',4],['D2.4.6',2,'simpanan',4],['D3.MONEY',3,'bayar,baki',16],['D4.MONEY',4,'bayar,baki',16],['D5.MONEY',5,'diskaun,baki',12],['D5.MONEY',5,'baki',8],['D6.MONEY',6,'diskaun,untung',8],['D6.MONEY',6,'baki',8]])routes.push(await smokeRoute(browser,...args));
  const routerPlans=await smokeRouterPlans(browser);
  const liveFamilies=[];
  for(const args of [['D2.4.6',2,'simpanan','money_subtract','small-number'],['D3.MONEY',3,'baki,bayar','money_change','two-digit'],['D4.MONEY',4,'bayar,baki','money_total','three-digit'],['D5.MONEY',5,'baki,diskaun','money_change','three-digit'],['D6.MONEY',6,'diskaun,untung','money_discount','three-digit'],['D6.MONEY',6,'untung,baki','money_profit','three-digit']])liveFamilies.push(await smokeLiveFamilySelection(browser,...args));
  const fallbacks=[];for(const args of [['D1.MONEY',1],['D2.4.1',2],['D2.4.2',2],['D2.4.3',2],['D2.4.4',2],['D2.4.5',2],['D2.4.6',2],['D2.4.7',2],['D3.MONEY',3],['D4.MONEY',4],['D5.MONEY',5],['D6.MONEY',6]])fallbacks.push(await smokeProductionFallback(browser,...args));
  const liveGerai=await smokeLiveGeraiDiagnosis(browser);
  const liveSavings=await smokeLiveSavingsGerai(browser);
  console.log(JSON.stringify({status:'focus_v2_money_live_gerai_e2e_pass',scenarios:[moneyWeak,operationWeak],gradeRoutes:routes,routerPlans,liveFamilies,unsupportedRoutes:fallbacks,liveGerai,liveSavings},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
