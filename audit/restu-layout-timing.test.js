const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,source}=require('./helpers/restu-stage-fixture.cjs');
function size(s,w,h){
 const c=s.sandbox.camera;c.aspect=w/h;
 const span=c.aspect>=1?1:Math.max(.78,.78+(c.aspect-.68)/.32*.22);
 const visH=Math.max(6*span/c.aspect,5.2);
 c.fov=2*Math.atan(visH/20)*180/Math.PI;
}
function screenBounds(s,mesh,width){
 const c=s.sandbox.camera,b=s.bounds(mesh),z=mesh.position.z;
 const visibleWidth=2*Math.tan(c.fov*Math.PI/360)*(10-z)*c.aspect/(s.state.camZoom+s.state.camPunch);
 return{left:(.5+(b.left-c.position.x)/visibleWidth)*width,right:(.5+(b.right-c.position.x)/visibleWidth)*width};
}
for(const [w,h] of [[320,568],[360,800],[390,844],[768,1024],[844,390],[1366,768],[1920,1080],[390,240],[600,768]]){
 test(`real render transforms preserve three separate groups at ${w}×${h}`,()=>{
  const s=fixture();size(s,w,h);
  s.sandbox.companion.visible=true;
  for(const t of [1250,1380,1500,1800,1999]){
   s.restoreLayout();s.frame(t);s.applyLayout();
   const hero=screenBounds(s,s.sandbox.hero,w),companion=screenBounds(s,s.sandbox.companion,w),teacher=screenBounds(s,s.mesh,w);
   const dome=screenBounds(s,s.sandbox.seals[0].front,w),pet=screenBounds(s,s.sandbox.pet,w);
   const left=Math.min(hero.left,companion.left),right=Math.max(dome.right,pet.right);
   const gap1=teacher.left-Math.max(hero.right,companion.right),gap2=Math.min(dome.left,pet.left)-teacher.right;
   assert.ok(gap1>=w*.035,`Wira gap ${gap1}px at ${t}`);
   assert.ok(gap2>=w*.035,`pet gap ${gap2}px at ${t}`);
   assert.ok(left>=w*.025,`left cut off ${left}`);assert.ok(right<=w*.975,`right cut off ${right}`);
   assert.ok(s.mesh.scale.x<0,'teacher stays left-facing');
  }
 });
}
test('repeated frames, resize and cancellation restore every original actor/shadow/dome transform',()=>{
 const s=fixture();s.frame(1500);const meshes=[s.sandbox.hero,s.sandbox.companion,s.sandbox.pet,s.mesh,s.fx,s.sandbox.heroShadow,s.sandbox.petShadow,s.sandbox.seals[0].front,s.sandbox.shell,s.sandbox.floorGlow,s.sandbox.backGlow,s.sandbox.wave,s.sandbox.flash];
 const original=meshes.map(m=>JSON.stringify([m.position,m.scale]));
 size(s,360,800);s.applyLayout();const first=meshes.map(m=>JSON.stringify([m.position,m.scale]));s.applyLayout();
 assert.deepEqual(meshes.map(m=>JSON.stringify([m.position,m.scale])),first,'no accumulating drift');
 s.restoreLayout();assert.deepEqual(meshes.map(m=>JSON.stringify([m.position,m.scale])),original);
 size(s,1920,1080);s.applyLayout();s.restoreLayout();assert.deepEqual(meshes.map(m=>JSON.stringify([m.position,m.scale])),original);
 size(s,360,800);s.applyLayout();s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();
 assert.deepEqual(meshes.map(m=>JSON.stringify([m.position,m.scale])),original);
 assert.equal(s.getActive(),null);
});
test('Restu impact particles and trails share the teacher transform and scale after camera punch',()=>{
 for(const [w,h] of [[360,800],[1920,1080]]){
  const s=fixture();size(s,w,h);s.frame(1500);s.applyLayout();
  const a=s.getActive(),tr=a.teacherTransform,p={restuToken:a.token,x:a.x,y:-1.92};
  const projected=s.projectFx(p);
  assert.equal(projected.x,tr.target+(a.x-tr.center)*tr.scale);
  assert.equal(projected.y,-1.92);assert.equal(projected.z,.24);assert.equal(projected.ppu,100*tr.scale);
  const trail=s.projectFx(p,a.x+.2,-1.82);
  assert.ok(Math.abs(trail.x-projected.x-.2*tr.scale)<1e-9);
  assert.equal(s.projectFx({...p,restuToken:-1}).x,a.x,'ordinary battle effects remain unchanged');
 }
});
test('completed landing holds exactly 500ms and the entry promise resolves without another delay',async()=>{
 const s=fixture();s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();
 assert.equal(s.endAt-s.landAt,500);assert.equal(s.afterLand,500);
 let done=false;const playing=s.play().then(()=>{done=true});
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.ok(s.getActive(),'real playRestuEntry started');
 assert.equal(s.timers.filter(t=>t.ms===s.endAt).length,1);
 s.frame(s.landAt);assert.equal(s.mesh.material.map,s.data.land.tex);assert.equal(done,false);
 s.frame(s.endAt-1);assert.equal(done,false);
 s.timers.find(t=>t.ms===s.endAt).resolve();await playing;
 assert.equal(done,true);assert.equal(s.getActive(),null);assert.equal(s.state.running,false);
 assert.ok(!s.timers.some(t=>t.ms===2500||t.ms===3600||t.ms===4200),'no old tail delay');
});
test('layout runs after late frame effects, restores before updates/resize, and cleanup precedes video',()=>{
 assert.ok(source.indexOf('if(restuActive?.wide)restuApplyLayout(restuActive);')<source.indexOf('renderer.render(scene,camera);'));
 assert.match(source,/raf=requestAnimationFrame\(frame\);\s+restoreRestuLayout\(\);\s+if\(!S.running\)return/);
 assert.match(source,/function resize\(\)\{\s+restoreRestuLayout\(\)/);
});
const alpha=require('./fixtures/restu-alpha-metrics.json').assets;
function calibratedFixture(tier){
 const s=fixture(),A=p=>alpha[p],image=p=>({metric:A(p).metrics[512]}),tex=p=>({image:image(p)});
 const joy='assets/pets/aurora/frames/joy-0-v1.webp',sad='assets/pets/aurora/frames/sad-0-v1.webp';
 const heroHeight=1.5*(1.22/400)*A(joy).height*A(joy).metrics[512].boxH;
 function entry(path,upp){const a=A(path),m=a.metrics[96],w=a.width*upp,h=a.height*upp;return{tex:tex(path),w,h,offX:-m.cx*w,offY:h*(.5-m.foot)}}
 function place(mesh,e,x,z,scale=1){mesh.material.map=e.tex;mesh.userData.e=e;mesh.position.set(x+e.offX*scale,-1.92+e.offY*scale,z);mesh.scale.set(e.w*scale,e.h*scale,1)}
 const idle='assets/heroes/wira/frames/idle-loop-0-v1.webp',surprise='assets/heroes/wira/frames/restu-surprised-v1.webp';
 place(s.sandbox.hero,entry(idle,heroHeight/(A(idle).height*A(idle).metrics[512].boxH)),-1.62,0);
 s.data.surprised=entry(surprise,heroHeight/(A(surprise).height*A(surprise).metrics[512].boxH));
 place(s.sandbox.pet,entry(sad,1.22/400),1.52,-.33);
 place(s.sandbox.companion,entry(joy,1.22/400),-2.14,.1,.58);s.sandbox.companion.visible=true;
 const anchors={anticipate:[.52,.92],fall:[.5,.96],preland:[.60,.916],land:[.55,.84]};
 for(const key of Object.keys(anchors)){
  const path=key==='land'?'assets/coach/cikgu-dimensi/full-body/summon-land-clean-v2.webp':`assets/coach/cikgu-dimensi/full-body/entry-v1/${key}-v1.webp`;
  const w=2.12*(key==='fall'?1.02:1),anchor=anchors[key];
  s.data[key]={tex:tex(path),w,h:w,offX:(anchor[0]-.5)*w,offY:(anchor[1]-.5)*w};
 }
 const path=`assets/fx/segel/${tier}-v2.webp`,a=A(path),m=a.metrics[96],h={gangsa:2.05,perak:2.18,emas:2.45}[tier]/m.boxH,w=h*a.width/a.height;
 const dome=s.sandbox.seals[0].front;dome.material={uniforms:{map:{value:tex(path)}}};dome.scale.set(w,h,1);dome.position.set(1.52-m.cx*w,-1.92+h*(m.ring-.5),-.02);
 return s;
}
for(const tier of ['gangsa','perak','emas'])test(`real WebP alpha geometry: ${tier}, 9 viewport shapes, surprise and mirrored landing`,()=>{
 for(const [w,h] of [[320,568],[360,800],[390,844],[768,1024],[844,390],[1366,768],[1920,1080],[390,240],[600,768]]){
  const s=calibratedFixture(tier);size(s,w,h);
  for(const t of [1250,1500,1750,1999]){
   s.restoreLayout();s.frame(t);s.applyLayout();
   const hs=[s.sandbox.hero,s.sandbox.companion].map(m=>screenBounds(s,m,w)),teacher=screenBounds(s,s.mesh,w),ds=[s.sandbox.pet,s.sandbox.seals[0].front].map(m=>screenBounds(s,m,w));
   const g1=teacher.left-Math.max(...hs.map(b=>b.right)),g2=Math.min(...ds.map(b=>b.left))-teacher.right;
   assert.ok(g1>=w*.035,`${tier} ${w}x${h} Wira gap ${g1}`);assert.ok(g2>=w*.035,`${tier} ${w}x${h} pet gap ${g2}`);
   assert.ok(Math.min(...hs.map(b=>b.left))>=w*.025);assert.ok(Math.max(...ds.map(b=>b.right))<=w*.975);
  }
 }
});
test('sampled WebP alpha evidence still matches the actual source assets',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 for(const [asset,record] of Object.entries(alpha))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',asset))).digest('hex'),record.sha256,asset);
});
