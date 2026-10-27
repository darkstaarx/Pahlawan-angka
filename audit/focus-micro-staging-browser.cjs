#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const files=new Map([
 ['/tools/micro-diagnosis-staging.html','tools/micro-diagnosis-staging.html'],
 ['/js/engine/focus-micro-diagnosis-v1.js','js/engine/focus-micro-diagnosis-v1.js'],
 ['/js/dev-focus-micro-fixtures-v1.js','js/dev-focus-micro-fixtures-v1.js']
]);
const server=http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 const uri=new URL(req.url,'http://127.0.0.1').pathname;
 const relative=files.get(uri);
 if(!relative){res.writeHead(404);res.end('Not found');return}
 const file=path.join(root,relative);
 res.setHeader('Content-Type',relative.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8');
 res.end(fs.readFileSync(file));
});
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/tools/micro-diagnosis-staging.html';
 try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390,768]){
   const ctx=await browser.newContext({viewport:{width,height:830},serviceWorkers:'block'});
   const page=await ctx.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',request=>requests.push(request.url()));
   await page.goto(base,{waitUntil:'load'});
   assert.equal(await page.locator('h1').innerText(),'Makmal Otak Adaptif');
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'horizontal overflow at '+width);
   const expectedFiles=[...files.keys()].map(p=>'http://127.0.0.1:'+server.address().port+p);
   assert(requests.every(x=>expectedFiles.some(p=>x.split('?')[0]===p)),'unexpected external network requests '+JSON.stringify(requests));
   assert.equal(await page.locator('#case option').count(),16);
   for(let n=2;n<=12;n++){
    await page.selectOption('#case','table'+n);
    assert((await page.locator('#report').innerText()).includes('mul.table.'+n),'table '+n+' missing at width '+width);
    assert((await page.locator('#exercise').innerText()).includes('PASS'),'table '+n+' not passed');
   }
   await page.selectOption('#case','oneWrong');
   assert(!(await page.locator('#report').innerText()).includes('PERLU PENGESAHAN'),'single miss falsely labelled');
   await page.selectOption('#case','units');
   assert(!(await page.locator('#report').innerText()).includes('PERLU PENGESAHAN'),'cm->m falsely labelled');
   await page.selectOption('#case','table8');
   await page.locator('#choose-manual').click();
   const input=page.locator('#exercise input[type=number]');
   await input.fill('47');
   await page.locator('#exercise button[type=submit]').click();
   assert((await page.locator('#exercise').innerText()).includes('Jawapan sebenar: 48'),'manual wrong answer not recognised');
   await page.locator('#exercise button[type=button]').click();
   assert((await page.locator('#exercise').innerText()).includes('Soalan 2 daripada'),'question progression failed');
   assert.equal(errors.length,0,errors.join('; '));
   await ctx.close();
  }
  console.log('PASS: staging lab Chromium 320/390/768px; all sifir 2–12; abstention; manual grading; no unexpected requests or page errors.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exitCode=1;});