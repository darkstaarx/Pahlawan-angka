// Run the real page-lock module and real Segel exit function together.
// Browser APIs are small test doubles; no game state is replaced by test logic.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
class Element{
 constructor(){this.listeners={};this.open=false;this.attributes={};}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
 emit(k,event={}){for(const fn of this.listeners[k]||[])fn(event);}
 querySelector(selector){return this.children[selector]??=new Element();}
 append(){}
 showModal(){this.open=true;}
 close(){this.open=false;}
 focus(){}
 set innerHTML(_){this.children={};}
}
const body=new Element();body.dataset={screen:'segelDemo'};
const dialog=new Element();const control=new Element();const listeners={};
const calls={paused:0,restored:0,login:0,hub:0};
const history={state:null,length:2,replaceState(s){this.state=s;},pushState(s){this.state=s;this.length++;},forward(){this.state={paPageLock:'guard'};listeners.popstate({state:this.state});},back(){}};
const context={console,history,location:{href:'https://preview.test/'},MutationObserver:class{observe(){}},document:{body,activeElement:control,createElement:tag=>tag==='dialog'?dialog:new Element(),querySelectorAll:selector=>selector==='[data-page-lock]'?[control]:[new Element()]},speechSynthesis:{cancel(){}},entryMode:{guestDemo:true},stage:{pause(){calls.paused++;}},demoOpenGeneration:1,runGeneration:1,run:{question:'preserved'},goLogin(){calls.login++;body.dataset.screen='login';},renderHub(){calls.hub++;},PADemo:{restoreGuest(){calls.restored++;}},addEventListener(k,fn){listeners[k]=fn;},removeEventListener(k){delete listeners[k];}};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync('js/page-lock-v1.js','utf8'),context);
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const start=segel.indexOf('window.closeSegelDemo=function(){');
const end=segel.indexOf('\n  window.restartSegelDemo=',start);
assert.ok(start>=0&&end>start,'real Segel close function located');
vm.runInContext(segel.slice(start,end),context);
context.closeSegelDemo();
assert.equal(dialog.open,true);
assert.deepEqual(calls,{paused:0,restored:0,login:0,hub:0});
assert.equal(context.run.question,'preserved');
dialog.querySelector('[data-stay]').emit('click');
assert.equal(dialog.open,false);assert.equal(context.PAPageLock.isLocked(),true);
context.closeSegelDemo();context.closeSegelDemo();
assert.equal(dialog.open,true);assert.equal(calls.login,0);
dialog.emit('cancel',{preventDefault(){}});
assert.equal(dialog.open,false);assert.equal(context.run.question,'preserved');
const count=history.length;
for(let i=0;i<3;i++){
 listeners.popstate({state:{paPageLock:'base'}});
 assert.equal(dialog.open,true);assert.equal(history.length,count);
 dialog.querySelector('[data-stay]').emit('click');
}
context.closeSegelDemo();dialog.querySelector('[data-unlock]').emit('click');
assert.deepEqual(calls,{paused:1,restored:1,login:1,hub:0});
assert.equal(context.run,null);assert.equal(context.entryMode,null);
assert.equal(dialog.open,false);assert.equal(listeners.beforeunload,undefined);
console.log('PASS: real demo exit blocked before state mutation; Continue/Escape preserve question; repeated exit/Back; Unlock runs exit exactly once and removes unload guard');
