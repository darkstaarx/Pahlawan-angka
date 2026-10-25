const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {fixture,extract,source}=require('./helpers/restu-stage-fixture.cjs');
const alpha=require('./fixtures/restu-alpha-metrics.json').assets;
function realArt(s,tier){
 const ctx=s.sandbox;ctx.heroShadow.position.set(-1.62,-1.88,-.01);ctx.petShadow.position.set(1.52,-1.89,-.33);ctx.measure=img=>img.low;ctx.measureHiRes=img=>img.metric;
 vm.runInNewContext(['entry','heroCalibratedUpp','sealEntry','restuEntry'].map(extract).join('\n')+';this.art={entry,heroCalibratedUpp,sealEntry,restuEntry}',ctx);
 const tex=path=>{const a=alpha[path];return{image:{width:a.width,height:a.height,metric:a.metrics[512],low:a.metrics[96]}}};
 const joy=tex('assets/pets/aurora/frames/joy-0-v1.webp');const target=1.5*(1.22/400)*joy.image.height*joy.image.metric.boxH;
 const idle=tex('assets/heroes/wira/frames/idle-loop-0-v1.webp'),surprise=tex('assets/heroes/wira/frames/restu-surprised-v1.webp');
 function put(mesh,e,x,z,k=1){ctx.swap(mesh,e);mesh.position.set(x+e.offX*k,-1.92+e.offY*k,z);mesh.scale.set(e.w*k,e.h*k,1)}
 put(ctx.hero,ctx.art.entry(idle,ctx.art.heroCalibratedUpp(idle,target)),-1.62,0);
 s.data.surprised=ctx.art.entry(surprise,ctx.art.heroCalibratedUpp(surprise,target));
 put(ctx.pet,ctx.art.entry(tex('assets/pets/aurora/frames/sad-0-v1.webp'),1.22/400),1.52,-.33);
 put(ctx.companion,ctx.art.entry(joy,1.22/400),-2.14,.1,.58);ctx.companion.visible=true;
 const anchors={anticipate:[.52,.92],fall:[.5,.96],preland:[.60,.916],land:[.55,.84]};
 for(const key in anchors){const path=key==='land'?'assets/coach/cikgu-dimensi/full-body/summon-land-clean-v2.webp':`assets/coach/cikgu-dimensi/full-body/entry-v1/${key}-v1.webp`;s.data[key]=ctx.art.restuEntry(tex(path),anchors[key],key==='fall'?1.02:1)}
 const e=ctx.art.sealEntry(tex(`assets/fx/segel/${tier}-v2.webp`),{gangsa:2.05,perak:2.18,emas:2.45}[tier]);
 put(ctx.seals[0].front,e,1.52,-.02);return e;
}
test('the first surprised-pose frame preserves Wira feet with the new canvas offsets immediately',()=>{
 const s=fixture();realArt(s,'emas');const h=s.sandbox.hero,old=h.userData.e,footX=h.position.x-old.offX;
 assert.ok(Math.abs(old.offY-s.data.surprised.offY)>.01,'actual art has a meaningful anchor change');
 s.frame(1250);
 assert.equal(h.userData.e,s.data.surprised);
 assert.ok(Math.abs(h.position.y-h.userData.e.offY+1.92)<1e-12,'no one-frame vertical pop');
 assert.ok(Math.abs(h.position.x-h.userData.e.offX-footX)<1e-12,'no horizontal pose pop');
});
test('actual camera matrices keep Wira, pet, companion, dome and shadows on their floor rows through reveal and settling',async()=>{
 const {pathToFileURL}=require('node:url'),path=require('node:path'),THREE=await import(pathToFileURL(path.join(__dirname,'../js/vendor/three.module.min.js')).href);
 for(const tier of ['gangsa','perak','emas'])for(const [w,h] of [[320,568],[390,844],[390,240],[768,1024],[844,390],[1366,768],[1920,1080]]){
  const s=fixture(),ctx=s.sandbox,domeE=realArt(s,tier),c=new THREE.PerspectiveCamera(36,w/h,.1,100);c.position.z=10;ctx.camera=c;
  const span=c.aspect>=1?1:Math.max(.78,.78+(c.aspect-.68)/.32*.22),visibleH=Math.max(6*span/c.aspect,5.2);
  c.fov=2*Math.atan(visibleH/20)*180/Math.PI;c.updateProjectionMatrix();s.state.camY=-1.92+.30*visibleH;c.position.y=s.state.camY;
  ctx.bg.material.color=ctx.groundOverlay.material.color={setScalar(){}};ctx.camWin=null;
  vm.runInNewContext(extract('cameraFrame')+';this.stepCamera=cameraFrame',ctx);
  const actors=[ctx.hero,ctx.pet,ctx.companion,ctx.seals[0].front,ctx.heroShadow,ctx.petShadow];
  function projectY(y,z){c.updateMatrixWorld();return new THREE.Vector3(0,y,z).project(c).y}
  const baseline=actors.map(m=>projectY(-1.92,m.position.z));
  for(const t of [1100,1249,1250,1266,1380,1500,1516,1800,2200,2500,2999]){
   s.restoreLayout();s.frame(t);c.position.x=Math.sin(t)*.12;c.position.y=s.state.camY+Math.cos(t)*.09;ctx.stepCamera(1/60);
   assert.equal(s.getActive().grounded,true);s.applyLayout();
   actors.forEach((mesh,i)=>{
    const e=mesh.userData.e;
    const k=mesh.scale.y/e.h;
    const offset=i===4?.04:i===5?.03:i===3?domeE.offY:e.offY;
    const floor=mesh.position.y-offset*k;
    const actual=projectY(floor,mesh.position.z);
    assert.ok(Math.abs(actual-baseline[i])<1e-8,`${tier} ${w}x${h} actor${i} lifted at ${t}: ${actual-baseline[i]}`);
   });
   const tr=s.getActive().teacherTransform;
   assert.ok(Math.abs(projectY(tr.ground,.24)-projectY(s.floorY(.24),.24))<1e-10,'particles share Cikgu floor');
  }
 }
});
for(const cancel of [false,true])test(`an interrupted hop/pet lift finishes without replay after Restu ${cancel?'cancellation':'completion'}`,async()=>{
 const s=fixture(),ctx=s.sandbox;s.getActive().state={...s.state,heroPose:ctx.hero.userData.e};s.cancel();
 Object.assign(s.state,{hopT:.1,hopFrom:-.2,hopDur:.34,heroLift:.45,petFeet:-1.22,petY:-1.22});
 const playing=s.play();for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(s.state.hopT,-1);assert.equal(s.state.heroLift,0);assert.equal(s.state.petFeet,-1.92);
 s.frame(1500);s.applyLayout();
 if(cancel)s.cancel();else s.timers.find(t=>t.ms===3000).resolve();await playing;
 // Execute the real next-tick hop/anchor code, not a second copy of its formula.
 const start=source.indexOf('      S.heroFeet=damp(S.heroFeet,S.heroX,15,fdt);'),end=source.indexOf('      hero.material.opacity=S.heroFade;',start);
 Object.assign(ctx,{fdt:.016,dt:.016,damp:(x,y,k,dt)=>y+(x-y)*Math.exp(-k*dt)});vm.runInNewContext(source.slice(start,end),ctx);
 assert.equal(s.state.hopT,-1);assert.equal(s.state.heroLift,0);assert.equal(s.state.petY,-1.92);assert.equal(s.state.petFeet,-1.92);
 assert.ok(Math.abs(ctx.hero.position.y-ctx.hero.userData.e.offY+1.92)<1e-12);
});
test('failed entry loading leaves ordinary jump state alone',async()=>{
 const s=fixture();s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();
 Object.assign(s.state,{hopT:.1,heroLift:.45,petFeet:-1.22,petY:-1.22});s.sandbox.loadRestu=async()=>null;
 const r=await s.play();assert.equal(r.failed,true);assert.equal(s.state.hopT,.1);assert.equal(s.state.heroLift,.45);assert.equal(s.state.petFeet,-1.22);
});
