const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/cikgu-mini-games-v1.0.0.js','utf8');
let listeners=[],renderCalls=0,contentCalls=0,advanced=0;
class El{constructor(){this.innerHTML='';this.textContent='';this.classList={add(){},remove(){}}}querySelectorAll(){return []}}
const els=Object.fromEntries(['visualCoachArena','visualCoachBoard','visualCoachCue','learningBody'].map(id=>[id,new El()]));
const ctx={console,document:{getElementById:id=>els[id],addEventListener:(name,cb)=>listeners.push(cb)},HEROES:{wira:{idle:'wira.webp',attack:'wira-attack.webp'},bunga:{idle:'bunga.webp',attack:'bunga-cast.webp'},sidma:{idle:'sidma.webp',attack:'sidma-cast.webp'}},learningState:null,renderVisualCoachArena(){renderCalls++},visualCoachContent(){contentCalls++;return 'fallback'},learningAdvance(){advanced++;ctx.learningState.stage++},window:null};ctx.window=ctx;
vm.runInNewContext(code,ctx);const api=ctx.PACoachGames;let checks=0;function check(test,message){assert(test,message);checks++}
const step=(s,a,v)=>api.reduce(s,a,v),finish=s=>step(s,'check');
// Exact reachable solutions and deliberately wrong actions, not just labels.
let s=api.create('cake');s=step(s,'cut','unequal');for(let i=0;i<4;i++)s=step(s,'serve',i);s=finish(s);check(!s.done&&s.phase===0,'unequal fourths rejected');s=step(s,'cut','equal');for(let i=0;i<4;i++)s=step(s,'serve',i);s=finish(s);check(s.phase===1&&!s.done);s=step(s,'halve');check(s.done&&/1\/4 = 2\/8/.test(api.diagram(s)));
s=api.create('bridge');check(!finish(s).done);for(let i=0;i<3;i++)s=step(s,'move',1);check(!finish(s).done,'overshoot rejected');s=step(s,'move',-1);check(finish(s).done);
s=api.create('supply');for(let i=0;i<12;i++)s=step(s,'serve',0);check(!finish(s).done&&finish(s).phase===0,'unequal distribution rejected');s=step(s,'reset');for(let i=0;i<12;i++)s=step(s,'serve',i%3);s=finish(s);check(s.phase===1&&!s.done);for(let i=0;i<4;i++)s=step(s,'group');s=finish(s);check(s.done&&/4 pet/.test(s.feedback));
s=api.create('garden');for(let i=0;i<2;i++)s=step(s,'rows',1);for(let i=0;i<3;i++)s=step(s,'cols',1);s=finish(s);check(s.phase===1&&!s.done);s=step(s,'rotate');check(!s.done,'must inspect decomposition first');s=step(s,'split');s=step(s,'rotate');check(s.done&&s.rows*s.cols===24);check(/6 baris × 4/.test(api.diagram(s)));
s=api.create('market');s=step(s,'coin',2);s=step(s,'coin',2);check(!finish(s).done);s=step(s,'undo');s=step(s,'coin',1);check(finish(s).done);
s=api.create('symmetry');s=step(s,'axis','diagonal');s=step(s,'fold');check(!finish(s).done&&s.seen.length===0);for(const a of ['vertical','horizontal']){s=step(s,'axis',a);s=step(s,'fold')}s=step(s,'rotate');check(finish(s).done&&s.seen.length===2);
// Deterministic fuzz: conservation, bounds, immutability, no free success.
let seed=12345;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
const actions=[['cut','equal'],['cut','unequal'],['serve',0],['serve',1],['serve',2],['serve',3],['serve',-1],['serve',99],['move',1],['move',-1],['move',99],['coin',1],['coin',2],['coin',99],['rows',1],['rows',-1],['cols',1],['cols',-1],['check'],['reset'],['group'],['undo'],['split'],['rotate'],['halve'],['axis','vertical'],['axis','horizontal'],['axis','diagonal'],['fold']];
for(const kind of Object.keys(api.definitions)){
 s=api.create(kind);for(let i=0;i<2000;i++){
  const before=JSON.stringify(s),[a,v]=actions[rnd(actions.length)],next=step(s,a,v);check(JSON.stringify(s)===before,'pure reducer');s=next;
  check(s.plates.reduce((a,b)=>a+b,0)<=4&&s.plates.every(n=>n>=0),'cake conservation');
  check(s.boxes.reduce((a,b)=>a+b,0)<=12&&s.boxes.every(n=>n>=0),'supply conservation');
  check(s.moved>=0&&s.moved<=5,'bounded moves');check(s.rows>=1&&s.rows<=5&&s.cols>=1&&s.cols<=7,'bounded array');
  if(kind==='market')check(s.jumps.reduce((a,b)=>a+b,0)===s.moved,'money conservation');
  if(kind==='symmetry')check(s.seen.every(x=>['vertical','horizontal'].includes(x))&&new Set(s.seen).size===s.seen.length,'valid distinct axes');
 }
}
const mappings={'D2.3.1':'cake','D1.ADD20':'bridge','D1.ADD100':'bridge','D2.2.1':'bridge','D2.2.4':'supply','D2.2.3':'garden','D2.4.3':'market'};
for(const [id,kind]of Object.entries(mappings)){check(api.selectGame(id,'','model')===kind);for(const strategy of ['contrast','micro'])check(api.selectGame(id,'',strategy)===null)}
for(const id of ['D1.FRAC','D2.5.3','D2.7.1','D2.7.2','D3.FRAC','D6.OPS'])check(api.selectGame(id,'','model')===null,'protected topic fallback');
check(api.selectGame('D3.SHAPE','Paksi simetri?')==='symmetry');check(api.selectGame('D3.SHAPE','Berapa muka kubus?')===null);
// Actual wrapper/event dispatch, including no auto-advance from object actions.
const event=(attrs)=>({target:{disabled:false,dataset:attrs,closest(selector){return selector==='#learningBody'?els.learningBody:this},hasAttribute(name){return name==='data-cg-next'?'cgNext'in attrs:name==='data-cg-answer'?'cgAnswer'in attrs:false}}});
for(const [id,kind]of Object.entries(mappings)){
 ctx.learningState={skillId:id,stage:0,strategy:'model',originalPrompt:''};ctx.renderVisualCoachArena(0,'',{});
 check(els.visualCoachBoard.innerHTML.includes(api.definitions[kind].hero+'.webp'),'fixed hero, not selected profile');
 check(ctx.visualCoachContent(0,'',{}).includes(kind==='cake'?'Jom belajar':'CONTOH LATIHAN'));
 const prior=advanced;listeners[0](event({cgNext:''}));check(advanced===prior+1&&ctx.learningState.stage===1);
 listeners[0](event({cgNext:''}));check(advanced===prior+1,'cannot skip unsolved game');
 listeners[0](event({cgAction:'check'}));check(advanced===prior+1,'incorrect check cannot auto advance');
 ctx.learningState.stage=2;ctx.visualCoachContent(2,'',{});const correct=api.definitions[kind].choices.indexOf(api.definitions[kind].answer);
 listeners[0](event({cgAnswer:String((correct+1)%3)}));check(!ctx.learningState.miniGame.recalled);
 listeners[0](event({cgAnswer:String(correct)}));check(ctx.learningState.miniGame.recalled);
 listeners[0](event({cgNext:''}));check(ctx.learningState.stage===3);
 const before=renderCalls;ctx.renderVisualCoachArena(3,'',{});check(renderCalls===before+1,'existing checkpoint renderer');check(ctx.visualCoachContent(3,'',{})==='fallback');
 ctx.learningState.stage=2;ctx.visualCoachContent(2,'',{});check(!ctx.learningState.miniGame.recalled,'re-entry must not reuse prior recall success');
}
check(listeners.length===1);api.install();check(listeners.length===1,'idempotent install');
const css=fs.readFileSync('css/cikgu-mini-games-v1.0.0.css','utf8');check(css.includes('prefers-reduced-motion'));check(css.includes('min-height:46px'));
check(!/localStorage|syncSave|learning_attempts|\bsave\(|\bfetch\(/.test(code),'no persistence/network hooks');
const pwa=fs.readFileSync('js/pwa.js','utf8'),sw=fs.readFileSync('sw.js','utf8');check(pwa.includes('loadGames'));check(sw.includes('./js/cikgu-mini-games-v1.0.0.js'));
console.log(`${checks} checks passed: six game solutions, wrong actions, conservation, mapping, event lifecycle, scope and cache wiring.`);
