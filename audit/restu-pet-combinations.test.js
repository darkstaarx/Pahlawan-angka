const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const pets=require('../js/pet-collection-system.js');
const {petStage,evidence}=require('./helpers/restu-pet-fixture.cjs');
const {pathToFileURL}=require('node:url');
const ROOT=path.resolve(__dirname,'..');
const views=[[320,568],[360,800],[390,844],[390,240],[768,1024],[844,390],[1366,768],[1920,1080],[600,768]];

test('evidence covers current production config paths and every selected frame of all twelve forms',()=>{
 const journey=fs.readFileSync(path.join(ROOT,'js/engine/production-journey.js'),'utf8');
 const code=journey.slice(journey.indexOf('  function petConfig('),journey.indexOf('  function activePetConfig('));
 const ctx={window:{PetCollection:pets}};vm.runInNewContext(code+';this.config=petConfig',ctx);
 assert.equal(evidence.variants.length,Object.keys(pets.catalog).length*2);
 for(const v of evidence.variants){
  const data={level:60,schoolGrade:2,rewards:{},petCollection:{},expedition:{},gembok:{},completedMissions:{}};pets.ensure(data);
  for(const id of Object.keys(pets.catalog)){Object.assign(data.petCollection[id],{state:'tamed',bondXp:500,appearance:'base'})}
  data.petCollection[v.id].appearance=v.form;data.expedition.activePetId=v.id;
  assert.equal(JSON.stringify(ctx.config(data,v.id)),JSON.stringify(v.config),v.key+' production config drift');
 }
 for(const [p,a] of Object.entries(evidence.assets)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,p))).digest('hex'),a.sha256,p+' asset drift');
  assert.equal(a.frames.length,a.sheet?(a.width/a.height>1.35?2:4):1,p+' all atlas slots sampled');
  for(const f of a.frames){assert.ok(f.m512.boxH>0&&f.m512.boxW>0,p);assert.ok(Number.isFinite(f.m96.foot))}
 }
});

test('all companion forms and independent rescue targets fit and stay grounded using real sizing, frames, camera and render functions',async()=>{
 const THREE=await import(pathToFileURL(path.join(ROOT,'js/vendor/three.module.min.js')).href);
 let choices=0,checks=0;
 for(const active of [null,...evidence.variants])for(const rescue of [null,...evidence.variants]){
  choices++;const {stage:s,c,pose,compFrames,petFrames}=await petStage(active,rescue);
  assert.equal(c.activePetConfig?.id||null,active?.id||null);assert.equal(c.rescuePetConfig?.id||null,rescue?.id||null);
  assert.equal(c.companion.visible,!!active);assert.equal(c.S.companionScale,active?.form==='bara'?.85:.58);
  const frames=active?compFrames:[null];
  for(const [w,h] of views){
   s.restoreLayout();const camera=new THREE.PerspectiveCamera(36,w/h,.1,100);camera.position.z=10;c.camera=camera;
   const span=camera.aspect>=1?1:Math.max(.78,.78+(camera.aspect-.68)/.32*.22),visH=Math.max(6*span/camera.aspect,5.2);
   camera.fov=2*Math.atan(visH/20)*180/Math.PI;camera.updateProjectionMatrix();c.S.camY=-1.92+.3*visH;
   function proj(x,y,z){camera.updateMatrixWorld();const v=new THREE.Vector3(x,y,z).project(camera);return{x:(v.x+1)*w/2,y:v.y}}
   function bounds(m){const b=s.bounds(m);return{left:proj(b.left,m.position.y,m.position.z).x,right:proj(b.right,m.position.y,m.position.z).x}}
   function normalFloor(z){return 2*(-1.92-c.S.camY)/(2*Math.tan(camera.fov*Math.PI/360)*(10-z))}
   for(let tier=0;tier<3;tier++){
    s.restoreLayout();c.S.active=tier;c.seals.forEach((q,i)=>q.front.visible=i===tier);
    for(const ce of frames)for(const pe of petFrames){
     s.restoreLayout();pose(ce,pe);c.S.camPunch=0;
     for(const t of [1100,1250,1500,2500]){
      s.restoreLayout();s.frame(t);camera.position.x=Math.sin(t)*.025;camera.position.y=c.S.camY+Math.cos(t)*.025;c.stepCamera(1/60);s.applyLayout();
      const hero=[c.hero,...(active?[c.companion]:[])].map(bounds),teacher=bounds(c.restuMesh),dome=bounds(c.seals[tier].front),pet=bounds(c.pet);
      const first=Math.min(...hero.map(b=>b.left)),last=Math.max(dome.right,pet.right);
      const g1=teacher.left-Math.max(...hero.map(b=>b.right)),g2=Math.min(dome.left,pet.left)-teacher.right;
      const label=`${active?.key||'none'} / ${rescue?.key||'Aurora fallback'} ${w}x${h} tier${tier} t${t}`;
      assert.ok(g1>w*.02&&g2>w*.02,label+' group overlap');assert.ok(first>=w*.02&&last<=w*.98,label+' clipped');
      assert.ok(pet.left>=dome.left-1&&pet.right<=dome.right+1,label+' pet escaped dome');
      for(const m of [c.hero,c.pet,...(active?[c.companion]:[])]){
       const e=m.userData.e,foot=m.position.y-e.offY*(m.scale.y/e.h);
       assert.ok(Math.abs(proj(m.position.x,foot,m.position.z).y-normalFloor(m.position.z))<1e-8,label+' floating feet');
      }
      checks++;
     }
    }
   }
  }
 }
 assert.equal(choices,169);assert.ok(checks>100000);console.log(`Verified ${choices} independent role/form configurations; ${checks} rendered-frame checks, ${views.length} viewport shapes, 3 dome tiers.`);
});

test('held-frame preview is limited to local audit pages and cannot alter ordinary battles',async()=>{
 const {fixture}=require('./helpers/restu-stage-fixture.cjs');const s=fixture(),active=s.getActive();
 for(const location of [{hostname:'pahlawanangka.netlify.app',pathname:'/audit/test.html'},{hostname:'127.0.0.1',pathname:'/index.html'}]){
  s.sandbox.location=location;assert.equal(await s.previewHold(1800),false);assert.equal(s.getActive(),active);
 }
});
test('local held preview freezes the real frame and cancels cleanly without changing the production deadline',async()=>{
 const {fixture}=require('./helpers/restu-stage-fixture.cjs');const s=fixture();s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();
 s.sandbox.location={hostname:'127.0.0.1',pathname:'/audit/cikgu-dimensi-entry-preview.html'};
 assert.equal(await s.previewHold(1800),true);s.frame(999999);const pose=s.mesh.material.map,zoom=s.state.camZoom;
 s.frame(1009999);assert.equal(s.mesh.material.map,pose);assert.equal(s.state.camZoom,zoom);assert.equal(s.getActive().previewAt,1800);
 assert.equal(s.endAt,4030);assert.ok(!s.timers.some(t=>t.ms===s.endAt),'held audit frame does not start the normal portal timer');
 s.cancel();assert.equal(s.getActive(),null);assert.equal(s.mesh.visible,false);assert.equal(s.bubble.classList.contains('show'),false);
});
