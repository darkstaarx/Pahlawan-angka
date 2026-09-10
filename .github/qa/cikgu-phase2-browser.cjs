const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const OUT='qa-phase2'; fs.mkdirSync(OUT,{recursive:true});
const PILOT='Y3-PV-A2', SKILL='D3.SUB10000';
const results={checks:[],errors:[],warnings:[],states:[],paths:{},screenshots:[]};
function check(name,ok,detail=null){results.checks.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` :: ${detail}`:''}`);if(!ok)throw new Error(name+(detail?`: ${detail}`:''));}
async function snap(page,name){const file=path.join(OUT,`${name}.png`);await page.screenshot({path:file,fullPage:true});results.screenshots.push(file);}
async function stage(page,expected,name){await page.waitForFunction(s=>window.PADimensionalView&&typeof sess!=='undefined'&&sess?.dimension?.stage===s,expected,{timeout:5000});const m=await page.evaluate(()=>({stage:sess.dimension.stage,path:sess.dimension.path,strategy:sess.dimension.strategy?.id,rep:sess.dimension.strategy?.representationId,context:sess.dimension.evidenceContext,active:sess.dimension.active,overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth,panel:document.querySelector('.dvPanel')?.getBoundingClientRect().toJSON?.()||null,buttons:[...document.querySelectorAll('#dimensionalViewOverlay button')].map(b=>({text:b.textContent.trim(),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})),bodyText:document.getElementById('dvBody')?.innerText||''}));results.states.push({name,...m});check(`${name}: stage ${expected}`,m.stage===expected);check(`${name}: no horizontal overflow`,!m.overflowX);await snap(page,name);return m;}
async function createPage(browser,{width=390,height=844,reducedMotion='no-preference',strong=false}={}){
 const context=await browser.newContext({viewport:{width,height},reducedMotion});
 await context.addInitScript(({strong})=>{
   const skill=strong?{mastery:88,confidence:90,evidence:12,correct:11,wrong:1,hints:0,mis:{},lastSeen:Date.now(),stability:86,probePass:3,probeFail:0}:{mastery:18,confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0};
   localStorage.setItem('pa_dev_unlocked','1');
   localStorage.setItem('pa_coach_v6_full',JSON.stringify({schoolGrade:3,skills:{'D3.SUB10000':skill},devMode:true,hero:'wira',xp:0,coins:0,level:1,completedMissions:{},chapterStars:{},totalCorrect:0,totalQuestions:0,daily:{date:new Date().toISOString().slice(0,10),correct:0,claimed:false}}));
 },{strong});
 const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());if(m.type()==='warning')results.warnings.push(m.text())});
 page.on('pageerror',e=>results.errors.push(`PAGEERROR: ${e.message}`));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'}); await page.waitForTimeout(800);
 await page.waitForFunction(()=>window.PADevCikguDimensi?.runtimeReady?.(true)===true,{timeout:8000});
 return {context,page};
}
async function resetTutorMemory(page){await page.evaluate(()=>{if(db){delete db.dimensionalView;db.skills['D3.SUB10000']={mastery:18,confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0}}});}
async function openPilot(page,diagnosis={failureType:'UNKNOWN',confidence:.55,needsDiscriminator:true,evidenceCount:2}){
 await page.evaluate(({PILOT,SKILL,diagnosis})=>{
   startDevSkill(SKILL);
   const q=sess.q||{token:`QA-${Date.now()}`};
   if(!q.dimensional)q.dimensional={prototypeId:PILOT,curriculumVersion:'SEMAKAN_2017_DPK_EDISI_3',transferStage:'ENTRY',operands:{minuend:52,subtrahend:27}};
   const ok=PADimensionalView.start({prototypeId:PILOT,skillId:SKILL,evidenceCount:diagnosis.evidenceCount||2,diagnosis,question:q}); if(!ok)throw new Error('pilot start returned false');
 },{PILOT,SKILL,diagnosis});
 await page.waitForSelector('#dimensionalViewOverlay.show',{timeout:5000});
}
async function completeBaseToStrategy2(page){
 await stage(page,'FAHAM','01-faham');
 await page.getByRole('button',{name:'10 sa'}).click();
 let b=await stage(page,'BINA','02-bina');
 const rods=b.buttons.filter(x=>/^$/.test(x.text));
 const tenButton=page.locator('#dimensionalViewOverlay button.dvTenRod').first();
 const box=await tenButton.boundingBox(); results.paths.baseTenTouchTarget=box;
 await tenButton.click();
 await stage(page,'SAMBUNG','03-sambung');
 await page.getByRole('button',{name:'Cuba sendiri'}).click();
 await stage(page,'CUBA','04-cuba-base-ten');
 await page.locator('#dvCheckAnswer').fill('0'); await page.getByRole('button',{name:'Semak'}).click();
 const s2=await stage(page,'FAHAM','05-strategy2-faham');
 check('Strategy 2 is decomposition',s2.strategy==='DECOMPOSITION'&&s2.rep==='R7_DECOMPOSITION',JSON.stringify({strategy:s2.strategy,rep:s2.rep}));
 await page.getByRole('button',{name:'60 + 13'}).click();
 await stage(page,'BINA','06-strategy2-bina');
 await page.getByRole('button',{name:'(60 − 20) + (13 − 8)'}).click();
 await stage(page,'SAMBUNG','07-strategy2-sambung');
 await page.getByRole('button',{name:'Cuba sendiri'}).click();
 await stage(page,'CUBA','08-strategy2-cuba');
 await page.locator('#dvCheckAnswer').fill('36'); await page.getByRole('button',{name:'Semak'}).click();
 await stage(page,'GUNA','09-guna');
}
async function finishTransferAndResume(page){
 const pre=await page.evaluate(()=>({token:String(sess.q?.token||''),hp:sess.hp,ehp:sess.ehp,mastery:db.skills['D3.SUB10000']?.mastery,coins:db.coins,generation:PABattlePresentation?.generation?.(),pending:PABattlePresentation?.pending?.(),qAnswer:sess.dimension.transferQuestion?.answer}));
 await page.locator('#dvCleanAnswer').fill(String(pre.qAnswer)); await page.getByRole('button',{name:'Hantar'}).click();
 await page.waitForFunction(()=>sess?.dimension?.stage==='COMPLETE');
 const completion=await page.evaluate(()=>({outcome:sess.dimension.outcome,memory:PADimensionalMemory.snapshot('D3.SUB10000'),mastery:db.skills['D3.SUB10000']?.mastery}));
 check('Independent transfer succeeds',completion.outcome==='SUCCESS');
 check('Tutor guided flow did not inflate global mastery',completion.mastery===pre.mastery,`${pre.mastery} -> ${completion.mastery}`);
 await page.getByRole('button',{name:'Kembali ke pertempuran'}).click(); await page.waitForTimeout(250);
 const post=await page.evaluate(()=>({token:String(sess.q?.token||''),hp:sess.hp,ehp:sess.ehp,mastery:db.skills['D3.SUB10000']?.mastery,coins:db.coins,generation:PABattlePresentation?.generation?.(),pending:PABattlePresentation?.pending?.(),active:sess.dimension.active,resumeScheduled:sess.dimension.resumeScheduled,overlay:document.getElementById('dimensionalViewOverlay')?.classList.contains('show'),screen:document.body.dataset.screen}));
 check('Battle resumed with a fresh question token',post.token!==pre.token,`${pre.token} -> ${post.token}`);
 check('Tutor overlay removed from active view',post.overlay===false);
 check('Resume is idempotent',post.resumeScheduled===true&&post.active===false);
 check('No damage during teaching/resume',post.hp===pre.hp&&post.ehp===pre.ehp,JSON.stringify({pre:{hp:pre.hp,ehp:pre.ehp},post:{hp:post.hp,ehp:post.ehp}}));
 check('No reward during teaching/resume',post.coins===pre.coins,`${pre.coins} -> ${post.coins}`);
 await snap(page,'10-battle-resumed'); results.paths.resume={pre,post};
}
async function pathCareless(browser){
 const {context,page}=await createPage(browser,{strong:true});
 await openPilot(page,{failureType:'CARELESS_RECHECK',confidence:.76,misconceptionId:'PV-005',evidenceCount:1});
 const m=await stage(page,'FAHAM','path-a-careless');
 check('Path A is minimal recheck',m.path==='CARELESS'&&/bahagian sa sekali lagi/.test(m.bodyText)&&!/Tukar satu puluh/.test(m.bodyText));
 await page.getByRole('button',{name:'Cuba soalan baru'}).click(); await stage(page,'GUNA','path-a-guna');
 results.paths.A={path:m.path,text:m.bodyText}; await context.close();
}
async function pathPrereq(browser){
 const {context,page}=await createPage(browser,{}); await openPilot(page);
 await stage(page,'FAHAM','path-b-faham'); await page.getByRole('button',{name:'1 sa'}).click();
 const b=await stage(page,'BINA','path-b-prerequisite-bina');
 const d=await page.evaluate(()=>({path:sess.dimension.path,failureType:sess.dimension.diagnosis?.failureType,passed:sess.dimension.prerequisitePassed}));
 check('Path B diagnoses prerequisite insecurity',d.path==='PREREQUISITE'&&d.failureType==='PREREQUISITE_INSECURE'&&d.passed===false,JSON.stringify(d));
 check('Path B repairs equivalence before procedure',/1 puluh = 10 sa/.test(b.bodyText)); results.paths.B=d; await context.close();
}
async function pathCAndSwitch(browser,{reduced=false,width=390,height=844}={}){
 const {context,page}=await createPage(browser,{width,height,reducedMotion:reduced?'reduce':'no-preference'}); await openPilot(page);
 await completeBaseToStrategy2(page); await finishTransferAndResume(page);
 const mem=await page.evaluate(()=>PADimensionalMemory.snapshot('D3.SUB10000'));
 check('Strategy failure recorded in teaching memory',(mem.strategyAttempts||[]).some(x=>x.strategyId==='BASE_TEN_EXCHANGE'&&x.result==='FAIL'));
 check('Successful independent representation recorded',(mem.preferredEffectiveRepresentations||[]).includes('R7_DECOMPOSITION'));
 results.paths[reduced?'reduced':'C']={memory:mem}; await context.close();
}
async function naturalEvidenceTrigger(browser){
 const {context,page}=await createPage(browser,{});
 const info=await page.evaluate(({SKILL})=>{
   startDevSkill(SKILL);
   let tries=0;
   while(tries++<120&&!PADimensionalView.eligibleQuestion(SKILL,sess.q))nextQ();
   const q=sess.q;
   if(!PADimensionalView.eligibleQuestion(SKILL,q))return {ok:false,reason:'no eligible generated question',q};
   const arrays=Object.values(q).filter(v=>Array.isArray(v));
   const opts=arrays.find(a=>a.some(x=>x&&typeof x==='object'&&'tag'in x&&'v'in x))||[];
   const wrong=opts.find(x=>['units_only','place'].includes(x.tag)&&String(x.v)!==String(q.answer));
   const btn=[...document.querySelectorAll('.ans')].find(b=>wrong&&b.dataset.v===String(wrong.v));
   if(!wrong||!btn)return {ok:false,reason:'qualifying wrong option/button unavailable',keys:Object.keys(q),opts,buttons:[...document.querySelectorAll('.ans')].map(b=>({v:b.dataset.v,text:b.textContent}))};
   beginHintRetry(wrong,btn,q);
   const first=PADimensionalMemory.snapshot(SKILL);
   const active1=!!sess.dimension?.active;
   sess.retryState=null; nextQ();
   tries=0;while(tries++<120&&!PADimensionalView.eligibleQuestion(SKILL,sess.q))nextQ();
   const q2=sess.q; const arrays2=Object.values(q2).filter(v=>Array.isArray(v));const opts2=arrays2.find(a=>a.some(x=>x&&typeof x==='object'&&'tag'in x&&'v'in x))||[];const wrong2=opts2.find(x=>['units_only','place'].includes(x.tag)&&String(x.v)!==String(q2.answer));const btn2=[...document.querySelectorAll('.ans')].find(b=>wrong2&&b.dataset.v===String(wrong2.v));
   if(!wrong2||!btn2)return {ok:false,reason:'second qualifying wrong unavailable'};
   beginHintRetry(wrong2,btn2,q2);
   return {ok:true,active1,active2:!!sess.dimension?.active,stage:sess.dimension?.stage,evidence1:first.independentEvidenceCount,evidence2:PADimensionalMemory.snapshot(SKILL).independentEvidenceCount,q1:q.token,q2:q2.token,wrongTag:wrong.tag,wrongTag2:wrong2.tag};
 },{SKILL});
 check('Natural first-wrong adapter records evidence',info.ok&&info.evidence1>=1,JSON.stringify(info));
 check('One unsupported wrong does not immediately launch full misconception lesson',info.active1===false,JSON.stringify(info));
 check('Repeated natural-assessment evidence can launch Cikgu',info.active2===true&&info.stage==='FAHAM',JSON.stringify(info));
 results.paths.naturalEvidence=info; await context.close();
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
   await naturalEvidenceTrigger(browser);
   await pathCareless(browser);
   await pathPrereq(browser);
   await pathCAndSwitch(browser);
   await pathCAndSwitch(browser,{reduced:true});
   const {context,page}=await createPage(browser,{width:360,height:800}); await openPilot(page); const small=await stage(page,'FAHAM','small-360x800-faham');check('360px portrait has no horizontal overflow',!small.overflowX);await context.close();
 }finally{await browser.close();}
 const phaseErrors=results.errors.filter(x=>!/favicon|Failed to load resource/i.test(x));
 check('No Phase 2 browser console/page errors',phaseErrors.length===0,JSON.stringify(phaseErrors));
 fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(results,null,2));
 console.log(`QA_SUMMARY checks=${results.checks.filter(x=>x.ok).length}/${results.checks.length} screenshots=${results.screenshots.length} warnings=${results.warnings.length} errors=${phaseErrors.length}`);
})().catch(err=>{results.fatal=String(err.stack||err);fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(results,null,2));console.error(err);process.exit(1)});
