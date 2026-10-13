#!/usr/bin/env node
// Setup-assisted routing checks. All profiles are synthetic and saves/cloud disabled.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
let pw;try{pw=require('playwright')}catch{pw=createRequire('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright')}
const out=path.join(__dirname,'focus-v2-e2e');fs.mkdirSync(out,{recursive:true});
const local=process.env.FOCUS_AUDIT_URL||'http://127.0.0.1:8765/index.html';
(async()=>{const browser=await pw.chromium.launch({executablePath:process.env.FOCUS_AUDIT_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),rows=[];
try{for(const source of ['production','feature'])for(const device of ['desktop','android']){
 const context=await browser.newContext({serviceWorkers:'block',viewport:device==='android'?{width:360,height:640}:{width:1280,height:800},isMobile:device==='android',hasTouch:device==='android'});
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 const p=await context.newPage();await p.goto(source==='feature'?local:'https://darkstaarx.github.io/Pahlawan-angka/',{waitUntil:'load'});await p.waitForFunction(()=>window.PAFocusPractice&&window.PAWirayungLive);
 const check=(test,grade,pass,actual)=>{rows.push({test:source+' '+device+' '+test,grade,expected:test,actual,status:pass?'PASS':'FAIL',evidence:'routing-results.json'});console.log(rows.at(-1).status+' '+rows.at(-1).test)};
 for(let grade=1;grade<=6;grade++){
  const result=await p.evaluate(grade=>{
   PACommercial={requireFeature:()=>true,authorizeMission:async()=>true};PACloud={};save=()=>{};enforceRestuLock=()=>false;
   db={schoolGrade:grade,name:'Audit fixture',hero:'wira',skills:{},level:1,coins:0,xp:0,logs:[],coreFrontier:1,completedMissions:{},rewards:{pets:{},auras:{},badges:{}}};sess={};initAll();
   db.learnerReviewV1={schema:1,encounters:[]};PAFocusPractice.open();const empty=document.querySelectorAll('.focusPickCard').length===0;
   const money=grade===2?'D2.4.5':'D'+grade+'.MONEY';
   db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade,skillId:money,questionKey:'m-'+i,outcome:'unresolved',mode:'practice',archetypeId:grade>=5?'discount':'legacy'}));
   PAFocusPractice.open();const before=JSON.stringify(db),ids=[...document.querySelectorAll('.focusPickCard')].map(x=>x.dataset.skill);
   return {empty,money,ids,grade:db.schoolGrade,unchanged:before===JSON.stringify(db)};
  },grade);
  check('No focus before evidence',grade,result.empty,result.empty);check('Money card from varied evidence',grade,result.ids.includes(result.money),result.ids);
  try{
   await p.locator('.focusPickCard[data-skill="'+result.money+'"]').click();await p.locator('#paWirayungFrame').waitFor({timeout:15000});
   const src=await p.locator('#paWirayungFrame').getAttribute('src');check('Money route -> Wirayung',grade,src.includes('#d'+grade+'-'),src.replace(/pa_nonce=[^#]+/,'pa_nonce=<ephemeral>'));
   const frame=p.locator('#paWirayungFrame').contentFrame();await frame.locator('img[src*="wira"]').first().waitFor();await frame.locator('img[src*="wira"]').first().evaluate(i=>i.decode());
   check('Wira asset loaded',grade,await frame.locator('img[src*="wira"]').first().evaluate(i=>i.naturalWidth>0),'Loaded original Wira asset');
   if(grade===2)await p.screenshot({path:path.join(out,source+'-'+device+'-focus-wirayung.png')});
   await p.locator('#paWirayungExit').click();check('Wirayung exit keeps grade',grade,await p.evaluate(g=>db.schoolGrade===g,grade),await p.evaluate(()=>db.schoolGrade));
  }catch(e){check('Money route -> Wirayung',grade,false,e.message.slice(0,600));await p.evaluate(()=>PAWirayungLive.close())}
  const recovery=await p.evaluate(grade=>{
   const id=grade===2?'D2.4.5':'D'+grade+'.MONEY';db.learnerReviewV1.encounters.push(...Array.from({length:20},(_,i)=>({grade,skillId:id,questionKey:'new-'+i,outcome:'independent',mode:'practice'})));
   return PAFocusPractice.summary().items.some(x=>x.id===id);
  },grade);check('Recent independent evidence removes card',grade,!recovery,recovery);
 }
 // Real battle route on a synthetic local profile. Does not infer v2 recovery.
 try{const id=await p.evaluate(()=>{PAWirayungLive.close();db.schoolGrade=2;const id='D2.2.3';db.learnerReviewV1.encounters=Array.from({length:5},(_,i)=>({grade:2,skillId:id,questionKey:'op-'+i,outcome:'unresolved',mode:'practice'}));PAFocusPractice.open();return id});
 await p.locator('.focusPickCard[data-skill="'+id+'"]').click();await p.waitForFunction(()=>PAProductionJourney.state()?.route==='focus',{},{timeout:20000});
 const state=await p.evaluate(()=>{const r=PAProductionJourney.state();return{route:r.route,pool:r.pool,q:r.q,grade:db.schoolGrade}});check('Operations route -> focused battle',2,state.pool.length===1&&state.pool[0]===id,state);
 }catch(e){check('Operations route -> focused battle',2,false,e.message.slice(0,600))}
 await context.close();
}}finally{await browser.close();fs.writeFileSync(path.join(out,'routing-results.json'),JSON.stringify({rows},null,2))}if(rows.some(x=>x.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
