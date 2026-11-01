const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('js/cpa-guidance-v1.js','utf8');
const battle=fs.readFileSync('js/battle.js','utf8');
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const journey=fs.readFileSync('jelajah-runtime.html','utf8');
const css=fs.readFileSync('css/cpa-guidance-v1.css','utf8');

class Element {
 constructor(tag){
  this.tagName=tag;this.className='';this.textContent='';this.children=[];this.parent=null;
  this.attrs={};this.dataset={};this.style={setProperty(){}};
  this.classList={add:()=>{},remove:()=>{}};
  this.isConnected=true;this.disabled=false;this.hidden=false;this.offsetParent={};
 }
 append(...items){for(const child of items){child.parent=this;this.children.push(child)}}
 appendChild(child){this.append(child);return child}
 replaceChildren(...children){this.children=[];this.append(...children)}
 setAttribute(key,value){this.attrs[key]=value}
 addEventListener(name,fn){this['on'+name]=fn}
 querySelector(sel){
  const match=node=>sel.match(/^\.([\w-]+)$/)?.[1]===node.className.split(' ')[0]||
    node.className.split(' ').includes(sel.replace('.',''))||
    sel.startsWith('.paCpaCell[data-index=')&&node.className.includes('paCpaCell')&&sel.includes('"'+node.dataset.index+'"');
  const find=node=>{for(const child of node.children){if(match(child))return child;const got=find(child);if(got)return got}return null};
  return find(this);
 }
 querySelectorAll(selector){
  if(selector!=='button:not([disabled]):not([hidden])')return [];
  let found=[];const visit=n=>{for(const child of n.children){if(child.tagName==='button'&&!child.disabled&&!child.hidden)found.push(child);visit(child)}};visit(this);return found;
 }
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);this.isConnected=false}
 focus(){}
}
const body=new Element('body');body.dataset.screen='segelDemo';
const document={body,createElement:tag=>new Element(tag),activeElement:body};
const window={PARapidLock:{isLocked:()=>false}};
vm.runInNewContext(code,{document,window}, {timeout:500});
const cpa=window.PACPA;

test('library has exactly eleven topic families and no duplicated scoring engine',()=>{
 assert.equal(cpa.groups.length,11);
 assert.equal(new Set(cpa.groups).size,11);
 assert.doesNotMatch(code,/\b(?:generate|recordResponse|recordFrontierResponse|PATelemetry\.response|addXp|addCoins)\s*\(/);
});
test('classifies all 11 KSSR topic families from actual question metadata',()=>{
 const examples=[
  [{facets:{op:'add'}},{domain:'Operasi'},'place'],
  [{facets:{op:'mul'}},{domain:'Operasi'},'groups'],
  [{facets:{schema:'part_whole'}},{domain:'Operasi'},'word'],
  [{fractionTask:{type:'shade',d:4}},{domain:'Pecahan'},'fraction'],
  [{facets:{context:'money'}},{domain:'Operasi'},'money'],
  [{skill:'D2.TIME'},{domain:'Masa'},'time'],
  [{skill:'D2.MEASURE'},{domain:'Ukuran'},'measure'],
  [{skill:'D4.AREA'},{domain:'Ruang',title:'Luas segi empat'},'area'],
  [{skill:'D1.SHAPE'},{domain:'Ruang'},'shape'],
  [{skill:'D5.PERCENT'},{domain:'Peratus'},'ratio'],
  [{skill:'D2.DATA'},{domain:'Data'},'data']
 ];
 for(const [q,meta,kind] of examples)assert.equal(cpa.classify(q,meta),kind,kind);
});
test('unknown question does not create generic or invented teaching content',()=>{
 assert.equal(cpa.config({prompt:'?'},{}),null);
 assert.equal(cpa.open({question:{prompt:'?'},meta:{}}),false);
});
test('fraction model follows explicit task denominator, never inferred answer',()=>{
 assert.equal(cpa.config({answer:'7/9',fractionTask:{d:5}},{domain:'Pecahan'}).parts,5);
 assert.equal(cpa.config({answer:'7/9'},{domain:'Pecahan'}).grounded,false);
 assert.equal(cpa.config({answer:'7/9',fractionTask:{d:500}},{domain:'Pecahan'}).parts,8);
});
test('modal can be opened for a real skill and moved through C, P and A',()=>{
 const q={prompt:'Kek ini dibahagi sama besar',answer:'3/10',skill:'D2.FRACTION',fractionTask:{d:10}};
 assert.equal(cpa.open({question:q,meta:{domain:'Pecahan'},hint:'Kira bahagian dahulu.'}),true);
 const panel=body.children.find(c=>c.className==='paCpaOverlay');
 assert.ok(panel); assert.equal(panel.attrs['aria-modal'],'true');
 const stage=()=>panel.querySelector('.paCpaStep').textContent;
 assert.match(stage(),/BUAT/);
 assert.equal(panel.querySelector('.paCpaModel').querySelectorAll('button:not([disabled]):not([hidden])').length,10);
 panel.querySelector('.paCpaNext').onclick();assert.match(stage(),/LIHAT/);
 panel.querySelector('.paCpaNext').onclick();assert.match(stage(),/KIRA/);
 const eq=panel.querySelector('.paCpaEquation').textContent;
 assert.match(eq,/___/);assert.doesNotMatch(eq,/3\/10/);
 panel.querySelector('.paCpaNext').onclick();
 assert.equal(body.children.some(c=>c.className==='paCpaOverlay'),false);
 assert.equal(q.answer,'3/10');
});
test('parent rapid lock and timeLock prohibit opening coaching modal',()=>{
 body.dataset.screen='timeLock';
 assert.equal(cpa.open({question:{fractionTask:{d:4}},meta:{domain:'Pecahan'}}),false);
 body.dataset.screen='segelDemo';
 window.PARapidLock.isLocked=()=>true;
 assert.equal(cpa.open({question:{fractionTask:{d:4}},meta:{domain:'Pecahan'}}),false);
 window.PARapidLock.isLocked=()=>false;
});
test('normal battle and Segel both count a hint before opening the shared CPA UI',()=>{
 assert.match(battle,/function showHintOverlay\(help\)[\s\S]*?window\.PACPA\?\.open/);
 assert.match(battle,/window\.PALearnerReview\?\.hintUsed/);
 assert.match(segel,/function bindHint\(\)[\s\S]*?run\.usedHint=true/);
 assert.match(segel,/window\.PACPA\?\.open\?\.\(\{question:run\.q/);
 assert.match(segel,/window\.PACPA\?\.close\?\.\(\)/);
});
test('real runtime and demo load one shared JS and CSS, CSS keeps dialog mobile sized',()=>{
 for(const h of [index,journey]){
  assert.match(h,/js\/cpa-guidance-v1\.js\?v=1\.0\.0/);
  assert.match(h,/css\/cpa-guidance-v1\.css\?v=1\.0\.0/);
 }
 assert.match(css,/max-height:min\(92dvh,750px\)/);
 assert.match(css,/@media\(max-height:640px\)/);
});

test('each of the eleven models opens, supports real touch choice, and reaches the abstract prompt',()=>{
 const keys=[
  ['place',{facets:{op:'add'}},{domain:'Operasi'}],
  ['groups',{facets:{op:'mul'}},{domain:'Operasi'}],
  ['word',{facets:{schema:'part_whole'}},{domain:'Operasi'}],
  ['fraction',{fractionTask:{d:10}},{domain:'Pecahan'}],
  ['money',{}, {domain:'Wang'}],
  ['time',{}, {domain:'Masa'}],
  ['measure',{}, {domain:'Ukuran'}],
  ['area',{}, {domain:'Ruang',title:'Luas'}],
  ['shape',{}, {domain:'Ruang'}],
  ['ratio',{}, {domain:'Nisbah'}],
  ['data',{}, {domain:'Data'}],
 ];
 body.dataset.screen='game';
 for(const [family,q,meta] of keys){
  q.answer='DO_NOT_REVEAL_739';q.prompt='Soalan sebenar murid';
  assert.equal(cpa.open({question:q,meta}),true,family);
  const panel=body.children.find(c=>c.className==='paCpaOverlay');
  assert.ok(panel,family);
  const model=panel.querySelector('.paCpaModel');
  assert.ok(model.children.length>1,family);
  const touch=model.querySelectorAll('button:not([disabled]):not([hidden])');
  assert.ok(touch.length>0,'Concrete interaction missing: '+family);
  touch[0].onclick();
  panel.querySelector('.paCpaNext').onclick();
  assert.match(panel.querySelector('.paCpaStep').textContent,/LIHAT/,family);
  panel.querySelector('.paCpaNext').onclick();
  assert.match(panel.querySelector('.paCpaStep').textContent,/KIRA/,family);
  assert.ok(panel.querySelector('.paCpaEquation').textContent.length>0,family);
  assert.doesNotMatch(panel.querySelector('.paCpaEquation').textContent,/DO_NOT_REVEAL_739/,family);
  cpa.close();
  assert.equal(q.answer,'DO_NOT_REVEAL_739',family);
 }
});

test('when genuine operands exist the CPA model reflects the current question, not a dummy calculation',()=>{
 body.dataset.screen='game';
 const q={facets:{op:'mul',operands:[4,6]},answer:'24'};
 const cfg=cpa.config(q,{domain:'Operasi'});
 assert.equal(cfg.kind,'groups');
 assert.equal(cfg.actual[0],4);assert.equal(cfg.actual[1],6);
 cpa.open({question:q,meta:{domain:'Operasi'}});
 const panel=body.children.find(c=>c.className==='paCpaOverlay');
 const figure=panel.querySelector('.paCpaFigure');
 assert.equal(figure.children.length,4);
 assert.equal(figure.children[0].children.filter(c=>c.className==='paCpaDot').length,6);
 panel.querySelector('.paCpaNext').onclick();
 panel.querySelector('.paCpaNext').onclick();
 assert.equal(panel.querySelector('.paCpaEquation').textContent,'4 × 6 = ___');
 assert.doesNotMatch(panel.querySelector('.paCpaEquation').textContent,/24/);
 cpa.close();

 const p={facets:{op:'sub',operands:[42,8]},answer:'34'};
 assert.equal(cpa.config(p,{domain:'Operasi'}).kind,'place');
 cpa.open({question:p,meta:{domain:'Operasi'}});
 const place=body.children.find(c=>c.className==='paCpaOverlay');
 const columns=place.querySelector('.paCpaFigure').children;
 assert.equal(columns.length,3);
 assert.equal(columns[0].children[1].textContent,'0');
 assert.equal(columns[1].children[1].textContent,'4');
 assert.equal(columns[2].children[1].textContent,'2');
 place.querySelector('.paCpaNext').onclick();
 place.querySelector('.paCpaNext').onclick();
 assert.equal(place.querySelector('.paCpaEquation').textContent,'42 − 8 = ___');
 cpa.close();
 const ungrounded=cpa.config({facets:{op:'mul'}},{domain:'Operasi'});
 assert.equal(ungrounded.actual,null,'unspecified operands must not be invented');
});
