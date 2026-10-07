const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const files=['pet-collection-system.js','pet-stage-v1.0.0.js','khazanah-v2-v1.0.0.js','engine/production-journey.js','segel-demo-v2.1.0.js'];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,serviceWorkers:'block',viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const file of files)await page.route('**/js/'+file+'*',async route=>{
  let body=fs.readFileSync(path.join(root,'js',file),'utf8');
  if(file==='segel-demo-v2.1.0.js')body=body.replace('if(activePetConfig)setPetVisual(activePetConfig);','if(activePetConfig)setPetVisual(activePetConfig);window.__evoScene={S,companion,pet,hero,measure,measureHiRes,petCharH,GROUND};').replace('window.PASegelDemo={','window.__bootEvoQA=async()=>{screen("segelDemo");await boot();stage.resume();return stage};window.PASegelDemo={');
  if(file==='pet-stage-v1.0.0.js')body=body.replace('return {\n      setPet,','window.__petStageMesh=pet;return {\n      setPet,');
  await route.fulfill({body,contentType:'text/javascript'});
 });
 await page.route('**/assets/pets/evolution/fire/**',route=>route.fulfill({path:path.join(root,new URL(route.request().url()).pathname.split('/assets/')[1]?'assets/'+new URL(route.request().url()).pathname.split('/assets/')[1]:''),contentType:'image/webp'}));
 await page.goto('https://darkstaarx.github.io/Pahlawan-angka/',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>window.PetCollection&&window.__bootEvoQA);
 await page.evaluate(async()=>{window.__evoStage=await __bootEvoQA();window.__evoProfile={level:25,schoolGrade:1,petCollectionMigrationVersion:2,petProgressionVersion:4,petCollection:Object.fromEntries(Object.keys(PetCollection.catalog).map(id=>[id,{state:'tamed',bondXp:400}]))};PetCollection.ensure(__evoProfile)});
 const results=[];
 for(const width of [390,768]){
  await page.setViewportSize({width,height:width===390?844:1024});
  for(const id of ['aurora','ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau']){
   await page.evaluate(async id=>{const p=PetCollection.snapshot(__evoProfile).pets.find(p=>p.id===id);await __evoStage.setCompanion({id,name:p.name,evolutionTheme:p.evolutionTheme,idleSheet:p.assets.idleSprite,happySheet:p.assets.happySprite})},id);
   await page.waitForTimeout(600);
   const result=await page.evaluate(()=>{const {S,companion,measureHiRes,petCharH,GROUND}=__evoScene,m=measureHiRes(companion.material.map.image);return {scale:S.companionScale,frames:S.companionFrames.length,mirror:S.companionMirror,hold:S.companionHold,height:companion.scale.y*m.boxH,target:petCharH,foot:companion.position.y+(m.foot-.5)*companion.scale.y,ground:GROUND}});
   assert.equal(result.scale,1);assert.equal(result.frames,2);assert.equal(result.mirror,false);assert.deepEqual(result.hold,[2.8,.12]);assert(Math.abs(result.height/result.target-1)<.04);assert(Math.abs(result.foot-result.ground)<.04);results.push({width,id,...result});
   if(width===390)await page.screenshot({path:'/tmp/fire-battle-'+id+'.png'});
  }
 }
 await page.evaluate(()=>{db=__evoProfile;db.petCollection.aurora.bondXp=399;db.expedition={activePetId:'aurora'};db.rewards.equippedPet='aurora';PetCollection.ensure(db);screen('treasure');renderTreasure()});
 await page.waitForFunction(()=>window.__petStageMesh?.material.map?.image);
 await page.evaluate(()=>{db.petCollection.aurora.bondXp=400;PetCollection.ensure(db);renderTreasure()});
 await page.waitForFunction(()=>window.__petStageMesh.material.map.image.src.includes('/evolution/fire/aurora/'));
 assert((await page.locator('#petStageDesc').innerText()).includes('Bara'));
 await page.screenshot({path:'/tmp/fire-khazanah.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'audit/fire-evolution-browser.json'),JSON.stringify({results,khazanahSameIdRefresh:true,errors},null,2));
 await browser.close();console.log('PASS: six evolved pets on phone and tablet: height, grounded feet, two frames, blink timing and facing.');
})().catch(e=>{console.error(e);process.exit(1)});
