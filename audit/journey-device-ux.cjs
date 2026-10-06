const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),report=[];
const sizes=[{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:844,height:390},{width:360,height:640},{width:720,height:844},{width:960,height:844}];
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const viewport of sizes){
 const page=await browser.newPage({viewport,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('pa_coach_v6_full',JSON.stringify({name:'QA',schoolGrade:1,hero:'wira',skills:{},level:7,xp:0,coins:0,coreFrontier:1,petCollectionMigrationVersion:2,onboarding:{completed:true}})));
 // Entry cinematic is checked separately; expose the actual battle for these captures.
 await page.route('**/js/segel-entry-cinematic-v1.2.0.js*',route=>route.fulfill({contentType:'application/javascript',body:''}));
 await page.route('**/js/segel-demo-v2.1.0.js*',route=>{let code=fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8');code=code.replace('window.PASegelDemo={','window.__ux={paintQuestion,drawQuestion,finishRun,arenaForMeta,stage:()=>stage,run:()=>run};window.PASegelDemo={');return route.fulfill({contentType:'application/javascript',body:code});});
 await page.goto('http://127.0.0.1:8765/.codex-wt-fix/');await page.waitForFunction(()=>window.PAMenuV2&&window.__PA_LIVE_ASSET_REFRESHED);
 if(viewport.width===390){
  for(let grade=1;grade<=6;grade++){
   const expected=await page.evaluate(g=>{db.schoolGrade=g;initAll();ensureProgression();PAMenuV2.map();return new Set(GRAPH.skills.filter(x=>x.grade===g).map(x=>String(x.chapter))).size},grade);
   assert.equal(await page.locator('#missionGrid .missionCard').count(),expected);assert.equal(await page.locator('#missionGrid .missionCard:disabled').count(),0);
   await page.evaluate(()=>PAMenuV2.legacyMissions());assert.equal(await page.locator('#missionGrid .missionCard:disabled').count(),0);
  }
  await page.evaluate(()=>{db.schoolGrade=1;initAll()});
 }
 await page.evaluate(()=>{initAll();ensureProgression();PAMenuV2.map()});
 assert.equal(await page.locator('#missionGrid .missionCard').count(),8);
 assert.equal(await page.locator('#missionGrid .missionCard:disabled').count(),0);
 await page.screenshot({path:path.join(root,'audit',`journey-map-${viewport.width}.png`)});
 await page.locator('#missionGrid .missionCard').last().scrollIntoViewIfNeeded();
 assert(await page.locator('#missionGrid .missionCard').last().evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}),'last mission must be reachable');
 await page.evaluate(()=>PAMenuV2.topic('8'));await page.waitForFunction(()=>document.querySelector('#segelAnswers button')&&PAProductionJourney.state()?.session.q?.skill==='D1.DATA');
 await page.waitForTimeout(1200);
 await page.evaluate(()=>{PAProductionJourney.close(false);window.__skillIndex=0;window.chooseModeAndSkill=()=>['D1.N20','D1.FRAC','D1.MONEY'][Math.min(__skillIndex++,2)];openGembok({adaptive:true})});
 await page.waitForFunction(()=>PAProductionJourney.state()?.firstArenaMeta&&PAProductionJourney.state()?.session.q?.skill==='D1.N20');
 const first=await page.evaluate(()=>{window.__arenaCalls=[];const stage=__ux.stage(),original=stage.setArena;stage.setArena=function(url){__arenaCalls.push(url);return original.call(this,url)};return PAProductionJourney.state().firstArenaMeta.domain});
 await page.evaluate(()=>__ux.drawQuestion());assert.equal(await page.evaluate(()=>PAProductionJourney.state().session.q.skill),'D1.FRAC');
 assert.equal(await page.evaluate(()=>PAProductionJourney.state().firstArenaMeta.domain),first);
 await page.evaluate(()=>__ux.drawQuestion());assert.equal(await page.evaluate(()=>PAProductionJourney.state().session.q.skill),'D1.MONEY');
 assert.equal(await page.evaluate(()=>new Set(__arenaCalls).size),1,'changing topics must keep the arena asset');
 assert(await page.evaluate(()=>__arenaCalls.every(url=>url===__ux.arenaForMeta(PAProductionJourney.state().firstArenaMeta))),'arena must use the first selected theme');
 await page.evaluate(()=>{const q=generate('D1.FRAC',scoreState('D1.FRAC'),{battleTier:'gembok'});q.skill='D1.FRAC';__ux.paintQuestion(q,q.skill)});
 await page.waitForTimeout(500);await page.screenshot({path:path.join(root,'audit',`journey-battle-${viewport.width}.png`)});
 const metrics=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};const question=document.querySelector('#segelQuestion');return {viewport:{width:innerWidth,height:innerHeight},bodyWidth:document.body.scrollWidth,stage:rect(document.querySelector('#segelStage')),panel:rect(document.querySelector('.segelPanel')),answers:rect(document.querySelector('#segelAnswers')),questionScroll:question.scrollHeight>question.clientHeight+2}});
 assert(metrics.bodyWidth<=viewport.width+1,'horizontal overflow');assert(metrics.answers.bottom<=viewport.height+1,'answers outside viewport');assert(metrics.answers.right<=viewport.width+1,'answers outside width');
 // Resizing a running mission must keep its question, pet, and terrain anchor.
 const identity=await page.evaluate(()=>({id:PAProductionJourney.state().id,pet:PAProductionJourney.state().rescuePetId,token:PAProductionJourney.state().session.q.token}));
 await page.setViewportSize({width:viewport.height,height:viewport.width});await page.waitForTimeout(200);
 assert.deepEqual(await page.evaluate(()=>({id:PAProductionJourney.state().id,pet:PAProductionJourney.state().rescuePetId,token:PAProductionJourney.state().session.q.token})),identity);
 await page.setViewportSize(viewport);await page.waitForTimeout(200);
 await page.evaluate(()=>{const q={prompt:'Apakah pecahan bahagian kertas yang tidak ditanda?',answer:'1/4',wrong:[{v:'3/4'},{v:'1/1'},{v:'2/4'}],skill:'D1.FRAC'};__ux.paintQuestion(q,q.skill)});
 assert(await page.locator('#segelQuestion').evaluate(e=>e.clientHeight>=90),'short question must have readable space');
 await page.evaluate(()=>{const r=__ux.run();r.asked=10;r.tally.own=10;__ux.finishRun(true,'Aurora berjaya diselamatkan lagi!')});
 await page.locator('.resultCta button').last().scrollIntoViewIfNeeded();
 assert(await page.locator('.resultCta button').last().evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=0}),'result actions must be reachable');
 await page.screenshot({path:path.join(root,'audit',`journey-result-${viewport.width}.png`)});
 assert.deepEqual(errors,[]);report.push(metrics);console.log('PASS',viewport,metrics);await page.close();
}
fs.writeFileSync(path.join(root,'audit/journey-device-ux.json'),JSON.stringify(report,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
