const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/cikgu-manipulatives-v3.19.1.js','utf8');
class ClassList{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}toggle(v,on){on?this.s.add(v):this.s.delete(v)}contains(v){return this.s.has(v)}}
class El{constructor(){this.classList=new ClassList();this.dataset={};this.style={setProperty(){}};this.innerHTML='';this.textContent='';this.src='';this.offsetWidth=1}querySelector(){return null}}
const els={visualCoachArena:new El(),visualCoachBoard:new El(),visualCoachHero:new El(),visualCoachPet:new El(),visualCoachCue:new El()};
const version=new El();let advanced=0,originalRenderCalls=0,originalInteractCalls=0,originalContentCalls=0;
const document={documentElement:{dataset:{}},baseURI:'https://example.test/',querySelector:s=>s==='.loginVersion'?version:null,getElementById:id=>els[id]||null};
function oldMode(key,m){if(key==='groups'&&/bahagi/i.test(m?.title||''))return'divide';if(key==='fraction')return'fraction';if(key==='measure')return'measure';return null}
const ctx={console,document,URL,setTimeout:(fn)=>{fn();return 1},matchMedia:()=>({matches:false}),visualCoachMode:oldMode,renderVisualCoachArena(){originalRenderCalls++},visualCoachInteract(){originalInteractCalls++},visualCoachContent(){originalContentCalls++;return'old'},learningAdvance(){advanced++},terrainThemeFor:()=> 'number',TERRAIN_BY_THEME:{number:'arena.webp'},HEROES:{wira:{idle:'idle.webp',anticipation:'ant.webp'}},REWARD_PETS:{},db:{hero:'wira',rewards:{}},META:{'D2.2.4':{id:'D2.2.4',title:'Bahagi'},'D2.6.1':{id:'D2.6.1',title:'Panjang'}},learningState:{skillId:'D2.2.4'},PASensory:{setIntensity(){}},playSfx(){},window:null};
ctx.window=ctx;ctx.globalThis=ctx;ctx.window.matchMedia=ctx.matchMedia;
vm.runInNewContext(code,ctx,{filename:'cikgu-manipulatives-v3.19.1.js'});
const api=ctx.PACikguManipulatives;assert(api,'PACikguManipulatives not exported');
assert.equal(api.version,'3.19.1');assert.equal(version.textContent,'Pahlawan Angka · v3.19.1');
assert.equal(ctx.visualCoachMode('decimal',{domain:'Perpuluhan'}),'decimal');assert.equal(ctx.visualCoachMode('percent',{domain:'Peratus'}),'percent');assert.equal(ctx.visualCoachMode('ratio',{domain:'Nisbah'}),'ratio');assert.equal(ctx.visualCoachMode('coord',{domain:'Koordinat'}),'coord');
assert.equal(api.measureKind({id:'D2.6.1',title:'Panjang'}),'ruler');assert.equal(api.measureKind({id:'D2.6.2',title:'Jisim'}),'scale');assert.equal(api.measureKind({id:'D2.6.3',title:'Isi padu'}),'jug');
ctx.renderVisualCoachArena(1,'groups',{id:'D2.2.4',title:'Bahagi'});assert.equal(originalRenderCalls,0,'enhanced division should bypass legacy renderer');assert(/Agih sama rata/.test(els.visualCoachBoard.innerHTML),'division interaction scene missing');assert.equal((els.visualCoachBoard.innerHTML.match(/<span>/g)||[]).length,3,'division should show exactly 3 groups');assert.equal((els.visualCoachBoard.innerHTML.match(/<i/g)||[]).length,12,'division should distribute 12 objects');
ctx.visualCoachInteract('divide');assert.equal(originalInteractCalls,0,'enhanced division should bypass legacy interaction');assert.equal(advanced,1,'successful manipulation should advance exactly one teaching stage');assert(/12 ÷ 3 = 4/.test(els.visualCoachBoard.innerHTML),'division result missing after interaction');
const decimalCopy=ctx.visualCoachContent(2,'decimal',{domain:'Perpuluhan'});assert(/0\.4/.test(decimalCopy)&&/0\.04/.test(decimalCopy),'decimal concept check missing');assert.equal(originalContentCalls,0,'enhanced decimal should bypass legacy content');
ctx.renderVisualCoachArena(3,'general',{id:'X',title:'Other'});assert.equal(originalRenderCalls,1,'non-enhanced/checkpoint render must fall back to legacy renderer');
assert(/40\/100 = 40%/.test(api.scene('percent',2,{})),'percent visual bridge missing');assert(/4 : 6 = 2 : 3/.test(api.scene('ratio',2,{})),'ratio simplification bridge missing');assert(/\(3, 2\)/.test(api.scene('coord',2,{})),'coordinate result missing');
console.log('PASS Cikgu Wajar manipulatives v3.19.1 runtime integration');
