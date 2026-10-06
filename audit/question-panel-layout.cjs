const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/affie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const viewport of (process.env.QUESTION_QA_SINGLE?[{width:390,height:844}]:[{width:486,height:924},{width:390,height:844},{width:360,height:640},{width:844,height:390}])){
 const p=await b.newPage({viewport,serviceWorkers:'block'});
 await p.route('**/js/segel-demo-v2.1.0.js*',async r=>{const s=fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8').replace('window.PASegelDemo={','window.__paintLayoutQA=q=>{run.q=q;paintQuestion(q,q.skill)};window.PASegelDemo={');await r.fulfill({contentType:'application/javascript',body:s})});
 await p.goto('http://127.0.0.1:8765/.codex-wt-fix/');await p.locator('#paDemoButton').click();await p.locator('#paDemoStart').click();
 await p.waitForFunction(()=>document.querySelector('#segelQuestion').innerText.trim().length>5);await p.waitForSelector('.paSegelEntryCinematic',{state:'detached',timeout:20000});
 const result=await p.evaluate(()=>{const item=PAD1FractionBank.items.find(x=>x.mode==='unmarked_symbol'&&x.model.style==='kertas');const q=PAD1FractionBank.materialise(item);q.skill='D1-F';window.__paintLayoutQA(q);
 const e=document.getElementById('segelQuestion'),a=document.getElementById('segelAnswers');return {height:e.clientHeight,content:e.scrollHeight,answers:a.getBoundingClientRect().toJSON(),prompt:e.innerText,visual:!!e.querySelector('.fraction-art'),display:getComputedStyle(e.firstChild).display}});
 assert(result.visual);assert.equal(result.display,'block');assert(result.answers.bottom<=viewport.height,'answers outside viewport');
 if(viewport.height>=844)assert(result.content<=result.height+2,'short visual question needs scroll');
 await p.screenshot({path:path.join(root,'audit',`question-panel-${viewport.width}.png`)});
 // A lengthy prompt must stay accessible, without pushing the answers away.
 await p.evaluate(()=>{const q=Q('<p>'+('Baca cerita ini dengan teliti. '.repeat(35))+'</p>','1/4',[N('1/2'),N('3/4'),N('1/1')],'Baca soalan.');window.__paintLayoutQA(q)});
 await p.waitForTimeout(100);
 const long=await p.locator('#segelQuestion').evaluate(e=>{e.scrollTop=e.scrollHeight;return {scroll:e.scrollTop,height:e.clientHeight,content:e.scrollHeight,text:e.innerText.slice(0,100),overflow:getComputedStyle(e).overflowY}});
 assert(long.scroll>0,'long prompt cannot scroll');
 await p.evaluate(()=>window.__paintLayoutQA(PAD1FractionBank.materialise(PAD1FractionBank.items.find(x=>x.group==='lorek'))));
 assert.equal(await p.locator('#segelQuestion').evaluate(e=>getComputedStyle(e).display),'none','shade instruction duplicated');
 assert(await p.locator('#segelAnswers .d1-fraction-answer').count());
 console.log('PASS',viewport,result,long,'interactive shade preserved');await p.close();
}}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
