const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/sensory-learning-v3.19.0.js','utf8');
class ClassList{constructor(){this.s=new Set()}add(...x){x.forEach(v=>this.s.add(v))}remove(...x){x.forEach(v=>this.s.delete(v))}contains(x){return this.s.has(x)}}
class El{
  constructor(){this.classList=new ClassList();this.dataset={};this.children=[];this.textContent='';this.offsetWidth=1;this._html='';}
  appendChild(e){this.children.push(e);return e}
  setAttribute(){}
  querySelector(sel){if(sel==='.paLearningSignal')return this.children.find(x=>x.classList.contains('paLearningSignal'))||null;if(sel==='.paMasteryMoment')return this.children.find(x=>x.classList.contains('paMasteryMoment'))||null;return null}
  set innerHTML(v){this._html=v}get innerHTML(){return this._html}
}
const card=new El(),feedback=new El(),arena=new El(),version=new El(),body=new El();
const events=[],vibrations=[],store=new Map();
const document={body,documentElement:new El(),querySelector(sel){if(sel.includes('.loginVersion'))return version;if(sel.includes('.qcard'))return card;return null},getElementById(id){if(id==='feedback')return feedback;if(id==='battleArena')return arena;return null},createElement(){return new El()}};
let score={mastery:84,competencies:{core:{clean:0}}};let calls={next:0,wrong:0,hint:0,resolve:0};
const ctx={console,document,navigator:{vibrate:v=>vibrations.push(v)},sessionStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail}},setTimeout:(fn)=>{fn();return 1},clearTimeout:()=>{},META:{S1:{title:'Tambah tiga nombor',domain:'Operasi'}},PAContentIntegrity:{requirements:{S1:[['core']]},requirementStatus:(id,b)=>({ok:Number(b?.core?.clean||0)>0})},scoreState:()=>score,sess:{q:{skill:'S1',competencyId:'add_three'},enemyTier:'minion'},nextQ(){calls.next++},beginHintRetry(){calls.wrong++},hint(){calls.hint++},resolveAnswer(o,b,q,ok){calls.resolve++;if(ok){score.mastery=86;score.competencies.core={clean:1}}},matchMedia:()=>({matches:false})};
ctx.window=ctx;ctx.window.matchMedia=ctx.matchMedia;ctx.window.dispatchEvent=e=>events.push(e);ctx.globalThis=ctx;
vm.runInNewContext(code,ctx,{filename:'sensory-learning-v3.19.0.js'});
assert.equal(version.textContent,'Pahlawan Angka · v3.19.0');
ctx.beginHintRetry({},new El(),ctx.sess.q);assert.equal(calls.wrong,1);assert.equal(vibrations.length,0,'wrong answer must not vibrate');
ctx.hint();assert.equal(calls.hint,1);assert.equal(vibrations.length,0,'hint must not vibrate');
ctx.resolveAnswer({},new El(),ctx.sess.q,true);assert.equal(calls.resolve,1);assert(vibrations.includes(18),'correct answer should use tiny haptic');assert(events.some(e=>e.detail?.type==='mastery'),'mastery sensory event missing');
ctx.nextQ();assert.equal(calls.next,1);assert(events.some(e=>e.detail?.type==='question'),'question sensory event missing');
console.log('PASS sensory runtime v3.19.0 wrappers');
