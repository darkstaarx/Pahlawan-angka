const test=require('node:test'),assert=require('node:assert/strict');
const {fixture}=require('./helpers/restu-stage-fixture.cjs');
function pixel(s,m,u,v){
 const c=s.sandbox.camera,h=2*Math.tan(c.fov*Math.PI/360)*(c.position.z-m.position.z),w=h*c.aspect;
 const fullX=.5+(m.position.x+(u-.5)*m.scale.x-c.position.x)/w;
 const fullY=.5-(m.position.y+(v-.5)*m.scale.y-c.position.y)/h;
 const win=c.view||{fullWidth:1000*c.aspect,fullHeight:1000,offsetX:0,offsetY:0,width:1000*c.aspect,height:1000};
 return[(fullX*win.fullWidth-win.offsetX)/win.width,(fullY*win.fullHeight-win.offsetY)/win.height];
}
for(const [w,h] of [[320,568],[390,844],[390,240],[768,1024],[1366,768],[1920,1080]])test(`background texture landmarks stay screen-locked through the real dive at ${w}×${h}`,()=>{
 const s=fixture(),c=s.sandbox.camera;c.aspect=w/h;c.fov=36;
 const vh=s.sandbox.worldH(-8),coverH=Math.max(vh,vh*c.aspect/(16/9));s.sandbox.bgBase={x:coverH*16/9,y:coverH};
 const a=s.getActive(),layers=[s.sandbox.bg,s.sandbox.groundOverlay],points=[[.25,.3],[.5,.5],[.72,.8]];
 s.setActive(null);s.background(1,null);
 const baseline=layers.map(m=>points.map(([u,v])=>pixel(s,m,u,v)));s.setActive(a);
 for(const t of [0,450,899,900,1000,1070,1249,1250,1380,1500,2000,2499,2999]){
  s.frame(t);c.position.x=Math.sin(t)*.12;c.position.y=Math.cos(t)*.09;
  const zoom=s.state.camZoom+s.state.camPunch,win=s.viewZoom(zoom,s.state.camFX,s.state.camFY);s.background(zoom,win);
  layers.forEach((m,i)=>points.forEach(([u,v],j)=>{
   const actual=pixel(s,m,u,v);assert.ok(Math.abs(actual[0]-baseline[i][j][0])<1e-9,`horizontal landmark at ${t}`);assert.ok(Math.abs(actual[1]-baseline[i][j][1])<1e-9,`vertical landmark at ${t}`);
  }));
 }
 s.getActive().state={...s.state,camZoom:1,camZoomTo:1,camPunch:0,heroPose:s.sandbox.hero.userData.e};s.cancel();
 assert.equal(c.view,null);assert.equal(s.sandbox.bg.scale.x,s.sandbox.bgBase.x);assert.equal(s.sandbox.bg.position.y,s.state.camY);
});
test('ordinary battle parallax retains its existing response outside Restu',()=>{
 const s=fixture();s.setActive(null);s.background(1,null);s.state.par=.72;
 const win=s.viewZoom(2,0,0);s.background(2,win);
 assert.ok(s.sandbox.bg.scale.x>s.sandbox.bgBase.x/2);assert.ok(s.sandbox.bg.scale.x<s.sandbox.bgBase.x);
});
test('Wira gets a complete surprise burst on the wide reveal, once per entry, with optional-art fallback',()=>{
 const s=fixture();s.data.surprised=null;const normalMap=s.sandbox.hero.material.map;
 s.frame(0);assert.equal(s.bubble.classList.contains('show'),false);
 s.frame(1249);assert.equal(s.bubble.classList.contains('show'),false);
 s.frame(1250);assert.equal(s.bubble.textContent,'Eh, Cikgu Dimensi!');assert.equal(s.bubble.classList.contains('restu-surprise'),true);
 assert.equal(s.bubble.classList.contains('show'),true);assert.equal(s.sandbox.hero.material.map,normalMap);
 s.bubble.textContent='unchanged';s.frame(1500);assert.equal(s.bubble.textContent,'unchanged','later frames do not restart dialogue');
 s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();assert.equal(s.bubble.classList.contains('show'),false);assert.equal(s.bubble.classList.contains('restu-surprise'),false);
 s.setActive({token:22,started:0,x:0,fired:{},result:{}});s.frame(1250);assert.equal(s.bubble.textContent,'Eh, Cikgu Dimensi!');
});
test('bubble follows the rendered Wira layout and stays inside narrow-stage horizontal/top margins',()=>{
 const s=fixture();s.frame(1250);s.applyLayout();const host=s.sandbox.host;
 s.sandbox.proj=(x,y)=>({x:host.clientWidth*(.5+x/6),y:host.clientHeight*(.5-y/6),ppu:100});
 for(const width of [320,360,390,768,1366]){
  host.clientWidth=width;s.bubble.offsetWidth=Math.min(width*.64,220);s.bubble.offsetHeight=62;s.placeSay();
  const left=parseFloat(s.bubble.style.left),top=parseFloat(s.bubble.style.top);
  assert.ok(left>=8);assert.ok(left+s.bubble.offsetWidth<=width-8);assert.ok(top>=74);
 }
});
test('real entry completion hides the surprise before handing control to the portal video',async()=>{
 const s=fixture();s.getActive().state={...s.state,heroPose:s.sandbox.hero.userData.e};s.cancel();
 const playing=s.play();for(let i=0;i<8;i++)await Promise.resolve();
 s.frame(1250);assert.equal(s.bubble.classList.contains('show'),true);
 s.timers.find(t=>t.ms===3000).resolve();await playing;
 assert.equal(s.bubble.classList.contains('show'),false);assert.equal(s.bubble.classList.contains('restu-surprise'),false);assert.equal(s.bubble.style.width,'');
});
// The foreground canvas is rendered after WebGL. Its transforms need their own
// regression; background-plane projection tests cannot observe this layer.
test('foreground grass and mote sizes stay fixed after impact while the actor camera settles',()=>{
 const vm=require('node:vm'),{extract}=require('./helpers/restu-stage-fixture.cjs');
 const s=fixture(),ctx=s.sandbox,draws=[],glows=[];
 ctx.fgLayer={width:1900,height:230};ctx.fgW=1000;ctx.fgMotes=[{x:.4,y:.5,d:1.2,s:3,ph:0,vy:0}];ctx.camWin=null;
 ctx.fx2={save(){},restore(){},drawImage(...args){draws.push(args.slice(1))},createRadialGradient(...args){glows.push(args);return{addColorStop(){}}},fillRect(){}};
 ctx.buildFront=()=>{throw Error('unexpected foreground rebuild')};
 vm.runInNewContext(extract('drawParallaxFront')+';this.drawFront=drawParallaxFront',ctx);
 let reference;
 for(const t of [1250,1300,1380,1500,1700,2000,2499,2999]){
  s.frame(t);ctx.camWin=s.viewZoom(s.state.camZoom+s.state.camPunch,s.state.camFX,s.state.camFY);
  ctx.drawFront(1000,700,0);
  const sample={grass:draws.at(-1),mote:glows.at(-1)};
  if(!reference)reference=sample;else assert.deepEqual(sample,reference,`foreground visibly reframed at ${t}ms`);
 }
 // Preserve the approved opening parallax and the ordinary battle effect.
 s.frame(450);ctx.camWin=s.viewZoom(s.state.camZoom,s.state.camFX,s.state.camFY);ctx.drawFront(1000,700,0);
 assert.notDeepEqual(draws.at(-1),reference.grass,'opening parallax is still active');
 s.setActive(null);s.state.camZoom=2;s.state.camPunch=0;ctx.drawFront(1000,700,0);const zoomed=draws.at(-1);
 s.state.camZoom=1.1;ctx.drawFront(1000,700,0);assert.notDeepEqual(draws.at(-1),zoomed,'ordinary parallax still responds to zoom');
});

test('actual Three.js projection matrices keep arena landmarks fixed through impact and settling',async()=>{
 const {pathToFileURL}=require('node:url'),path=require('node:path');
 const THREE=await import(pathToFileURL(path.join(__dirname,'../js/vendor/three.module.min.js')).href);
 for(const [width,height] of [[360,800],[390,240],[1366,768]]){
  const s=fixture(),ctx=s.sandbox,c=new THREE.PerspectiveCamera(36,width/height,.1,100);c.position.z=10;ctx.camera=c;
  ctx.bg=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());ctx.bg.position.z=-8;
  ctx.groundOverlay=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());ctx.groundOverlay.position.z=-7.45;
  const layers=[ctx.bg,ctx.groundOverlay],points=[[.25,.3],[.5,.5],[.72,.8]];
  function actualProjection(m,u,v){c.updateMatrixWorld();m.updateMatrixWorld();return new THREE.Vector3(u-.5,v-.5,0).applyMatrix4(m.matrixWorld).project(c).toArray().slice(0,2)}
  const a=s.getActive();s.setActive(null);s.background(1,null);
  const baseline=layers.map(m=>points.map(([u,v])=>actualProjection(m,u,v)));s.setActive(a);
  for(const t of [1250,1380,1500,1700,2200,2499,2999]){
   s.frame(t);c.position.x=Math.sin(t)*.12;c.position.y=Math.cos(t)*.09;
   const zoom=s.state.camZoom+s.state.camPunch,win=s.viewZoom(zoom,s.state.camFX,s.state.camFY);s.background(zoom,win);
   layers.forEach((m,i)=>points.forEach(([u,v],j)=>{
    const actual=actualProjection(m,u,v);actual.forEach((n,k)=>assert.ok(Math.abs(n-baseline[i][j][k])<1e-8,`${width}x${height}: matrix landmark changed at ${t}`));
   }));
  }
 }
});
