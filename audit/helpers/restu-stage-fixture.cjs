const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require.resolve('../../js/segel-demo-v2.1.0.js'),'utf8');
function extract(name){
 const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);
 const open=source.indexOf('{',start);let depth=0,quote=null,escaped=false,line=false,block=false;
 for(let i=open;i<source.length;i++){
  const c=source[i],n=source[i+1];
  if(line){if(c==='\n')line=false;continue}if(block){if(c==='*'&&n==='/'){block=false;i++}continue}
  if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue}
  if('"\'`'.includes(c)){quote=c;continue}if(c==='/'&&n==='/'){line=true;i++;continue}if(c==='/'&&n==='*'){block=true;i++;continue}
  if(c==='{')depth++;if(c==='}'&&--depth===0)return source.slice(source.slice(start-6,start)==='async '?start-6:start,i+1);
 }throw Error(name);
}
function vector(x=0,y=0,z=0){return{x,y,z,set(x,y,z=1){Object.assign(this,{x,y,z});return this},clone(){return vector(this.x,this.y,this.z)},copy(v){return this.set(v.x,v.y,v.z)},multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}}}
function mesh(x=0,w=1,h=2,z=0,metric={cx:0,boxW:1}){return {position:vector(x,h/2-1.92,z),scale:vector(w,h,1),visible:true,material:{map:{image:{metric}},opacity:1},userData:{e:{tex:{image:{metric}},w,h,offX:0,offY:h/2}}}}
function fixture(){
 const hero=mesh(-1.62,1.4,2.2),pet=mesh(1.52,1.1,1.4,-.33),teacher=mesh(0,2.12,2.12,.24);
 const dome=mesh(1.52,2.55,2.5,-.02),companion=mesh(-2.14,.9,1.1,.1);companion.visible=false;
 const timers=[];
 const classes=new Set();
 const sayEl={textContent:'',style:{},offsetWidth:170,offsetHeight:62,classList:{add(...xs){xs.forEach(x=>classes.add(x))},remove(...xs){xs.forEach(x=>classes.delete(x))},contains:x=>classes.has(x)}};
 const bg=mesh(0,16,10,-8),groundOverlay=mesh(0,16,10,-7.45);
 const sandbox={Math,WeakMap,performance:{now:()=>0},GROUND:-1.92,HERO_HOME:-1.62,SEAL_X:1.52,
  S:{active:0,heroLock:null,running:false,camZoom:1,camZoomTo:1,camPunch:0,camFX:0,camFY:0,camK:8,par:0,parTo:0,introT:-1,camY:0,dark:0,darkTo:0,speedFx:0,shake:0},
  hero,pet,companion,heroShadow:mesh(-1.62,2,.1),petShadow:mesh(1.52,1.12,.1),
  restuMesh:teacher,restuFx:mesh(0,2.12,2.12,.18),seals:[{front:dome}],shell:mesh(1.52),floorGlow:mesh(1.52),backGlow:mesh(1.52),wave:mesh(1.52),flash:mesh(1.52),
  camera:{aspect:1,fov:36,position:vector(0,0,10),view:null,clearViewOffset(){this.view=null},setViewOffset(fullWidth,fullHeight,offsetX,offsetY,width,height){this.view={fullWidth,fullHeight,offsetX,offsetY,width,height,enabled:true}}},
  restuAlphaCache:new WeakMap(),measureHiRes:img=>img.metric,
  swap(m,e){m.userData.e=e;m.material.map=e.tex;m.scale.set(e.w,e.h,1)},
  sayEl,sayTimer:0,clearTimeout(){},bg,groundOverlay,bgBase:{x:16,y:10},worldH:z=>2*Math.tan(sandbox.camera.fov*Math.PI/360)*(10-z),
  host:{clientWidth:390,clientHeight:844,classList:{add(){},remove(){},toggle(){}}},restuNamePlate(){},fxFlash(){},fxCharge(){},fxRing(){},fxSparks(){},fxGlows(){},fxSymbols(){},fxParts:[],reduceMotion:true,
  restuActive:null,restuLoaded:null,restuPendingCancel:null,restuToken:0,last:0,introShown:false,applyParallax(){},resize(){},
  wait(ms){return new Promise(resolve=>timers.push({ms,resolve}))},loadRestu:async()=>sandbox.restuLoaded,
  proj(x,y,z=0){return{x,y,z,ppu:100}},
 };
 const constants=source.slice(source.indexOf('    const RESTU_FACE='),source.indexOf('    let restuName='));
 const names=['viewZoom','applyParallax','placeSay','hideSay','showRestuSurprise','setRestuPose','applyRestuHeroReaction','restuOnce','restuLayout','restuBounds','restoreRestuLayout','restuApplyLayout','restuFrame','restuProjectFx','restoreRestuState','cancelRestuEntry','playRestuEntry'];
 vm.runInNewContext(`${constants}\n${names.map(extract).join('\n')}\nthis.api={bubble:sayEl,placeSay,showSurprise:showRestuSurprise,hideSay,background:applyParallax,viewZoom,layout:restuLayout,bounds:restuBounds,restoreLayout:restoreRestuLayout,applyLayout:()=>restuApplyLayout(restuActive),projectFx:restuProjectFx,restore:restoreRestuState,cancel:cancelRestuEntry,play:playRestuEntry,afterLand:RESTU_AFTER_LAND,landAt:RESTU_T_LAND,endAt:RESTU_MS,frame:restuFrame,setData(d){restuLoaded=d},setActive(a){restuActive=a},getActive(){return restuActive}}`,sandbox);
 const data=Object.fromEntries(['anticipate','fall','preland','land'].map((key,i)=>[key,{tex:{key,image:{metric:{cx:.08-i*.025,boxW:.84}}},w:2.12,h:2.12,offX:.1+i*.04,offY:1}]));
 sandbox.api.setData(data);sandbox.api.setActive({token:1,started:0,duration:sandbox.api.endAt,x:0,fired:{},result:{}});
 return {...sandbox.api,sandbox,data,timers,mesh:teacher,fx:sandbox.restuFx,state:sandbox.S};
}
module.exports={fixture,extract,source,vector,mesh};
