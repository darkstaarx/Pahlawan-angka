'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
const source=fs.readFileSync('js/fraction-lesson-v1.js','utf8');
new vm.Script(source);
const elements={};
function element(){return {events:{},style:{},value:'2',offsetHeight:180,isConnected:true,classList:{add(){},remove(){},toggle(){}},addEventListener(k,f){this.events[k]=f},click(){this.events.click()},querySelector(){return element()},querySelectorAll(){return []},insertAdjacentHTML(){}}}
const root={querySelector:k=>elements[k]??=element()};
const host={isConnected:true,querySelector:()=>root};let completed=0;
const context={window:{},document:{body:{}},clearTimeout(){},setTimeout(){}};
vm.createContext(context);
// Expose local state only in this audit, never in the shipped lesson.
const instrumented=source.replace(' message.textContent=lessons[lesson];\n',' message.textContent=lessons[lesson];\n');
const at=instrumented.lastIndexOf('\n}};');
vm.runInContext(instrumented.slice(0,at)+'\nwindow.test={move,partition,refine,state:()=>({lesson,pieces,completed})};'+instrumented.slice(at),context);
context.window.PAFractionLesson.mount(host,()=>completed++);
const t=context.window.test;
const go=()=>elements['.lesson-action'].click();
const answer=a=>elements['.choices'].events.click({target:{closest:()=>({dataset:{answer:a}})}});
const cell=i=>elements['.transfer'].events.click({target:{closest:()=>({dataset:{cell:String(i)}})}});
const stage=n=>ok(t.state().lesson===n,'stage '+n);
stage(0);elements['.finish'].click();ok(completed===0,'cannot finish early');
go();answer('1');stage(1);answer('1/2');stage(2);t.move(0,2);stage(2);t.move(0,1);stage(3);
go();answer('more');stage(4);answer('same');stage(5);
t.state().pieces.filter(p=>p.zone===0).forEach(p=>t.move(p.id,1));stage(6);go();stage(8);go();stage(8);
t.state().pieces.slice(0,3).forEach(p=>t.move(p.id,2));go();stage(9);go();stage(7);
ok(elements['.tutorial'].hidden,'free play hides teacher');elements['.help'].click();ok(!elements['.tutorial'].hidden,'help opens');elements['.close-help'].click();ok(elements['.tutorial'].hidden,'help closes');
elements['.challenge'].click();stage(10);cell(0);cell(1);go();stage(10);cell(2);cell(3);go();stage(11);go();stage(7);
ok(!elements['.finish'].hidden,'completion action unlocked');elements['.finish'].click();ok(completed===1,'completion callback');
for(let n=1;n<=10;n++){
 const p=t.partition(n);ok(p.length===n,'partition count');ok(Math.abs(p.reduce((s,x)=>s+x.w*x.h,0)-1)<1e-9,'whole conserved');
 p.forEach((x,i)=>{x.zone=i%3;ok(Math.abs(x.w*x.h-1/n)<1e-9,'equal pieces')});
 const r=t.refine(p);ok(r.length===(n<=5?n*2:n),'refinement limit');
 for(let z=0;z<3;z++){const area=a=>a.filter(x=>x.zone===z).reduce((s,x)=>s+x.w*x.h,0);ok(Math.abs(area(r)-area(p))<1e-9,'plate quantity conserved')}
}
ok(!/localStorage|supabase|\bsave\(/.test(source),'no persistence');
host._fractionCleanup();
console.log(checks+' fraction overlay checks passed (DOM stub, not browser QA).');
