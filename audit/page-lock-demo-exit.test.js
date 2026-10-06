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
const context={console,history,location:{href:'https://preview.test/'},MutationObserver:class{observe(){}},document:{body,getElementById(){return null;},readyState:'loading',addEventListener(k,fn){listeners['document:'+k]=fn;},activeElement:control,createElement:tag=>tag==='dialog'?dialog:new Element(),querySelectorAll:selector=>selector==='[data-page-lock]'?[control]:[new Element()]},speechSynthesis:{cancel(){}},entryMode:{guestDemo:true},stage:{pause(){calls.paused++;}},demoOpenGeneration:1,runGeneration:1,run:{question:'preserved'},goLogin(){calls.login++;body.dataset.screen='login';},renderHub(){calls.hub++;},db:{parentPin:'4826'},sess:{},swapDemoState(nextDb,nextSess){const prev={db:this.db,sess:this.sess};this.db=nextDb;this.sess=nextSess;return prev;},initAll(){},ensureProgression(){},openSegelDemo(){body.dataset.screen='segelDemo';},addEventListener(k,fn){listeners[k]=fn;},removeEventListener(k){delete listeners[k];}};
context.window=context;vm.createContext(context);
vm.runInContext('swapDemoState=(nextDb,nextSess)=>{const previous={db,sess};db=nextDb;sess=nextSess;return previous;}',context);
const app=fs.readFileSync('js/app.js','utf8');
const getter=app.split('\n').find(line=>line.startsWith('function pageLockParentPin()'));
assert.ok(getter);vm.runInContext(getter,context);
vm.runInContext(fs.readFileSync('js/demo-mode-v3.56.0.js','utf8'),context);
const realRestore=context.PADemo.restoreGuest;
context.PADemo.restoreGuest=()=>{calls.restored++;return realRestore();};
context.PADemo.start();
assert.equal(context.db.parentPin,undefined);
assert.equal(context.pageLockParentPin(),'4826','demo retains original guardian PIN');
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
// Every page, including login and parent pages, remains protected.
for(const screen of ['login','menuV2','missions','treasure','parent','setup','learning','result','segelDemo']){
 body.dataset.screen=screen;
 assert.equal(context.PAPageLock.isLocked(),true,screen);
 assert.equal(context.PAPageLock.requestExit(()=>calls.hub++),false,screen);
 dialog.querySelector('[data-exit-pin]').value='0000';
 dialog.querySelector('[data-pin-form]').emit('submit',{preventDefault(){}});
 assert.equal(dialog.open,true);assert.equal(calls.hub,0);
 assert.equal(context.PAPageLock.isLocked(),true);
 dialog.querySelector('[data-stay]').emit('click');
}
body.dataset.screen='segelDemo';
context.closeSegelDemo();
const pinInput=dialog.querySelector('[data-exit-pin]');
for(const pin of ['', '12', '0000']){
 pinInput.value=pin;
 dialog.querySelector('[data-pin-form]').emit('submit',{preventDefault(){}});
 assert.equal(context.PAPageLock.isLocked(),true);
 assert.equal(calls.login,0);assert.equal(context.run.question,'preserved');
}
pinInput.value='4826';dialog.querySelector('[data-pin-form]').emit('submit',{preventDefault(){}});
assert.deepEqual(calls,{paused:1,restored:1,login:1,hub:0});
assert.equal(context.run,null);assert.equal(context.entryMode,null);
assert.equal(dialog.open,false);assert.equal(listeners.beforeunload,undefined);
assert.equal(context.db.parentPin,'4826','original profile restored');
console.log('PASS: app-wide PIN validation, original guardian PIN through real demo state swap;  real demo exit blocked before state mutation; Continue/Escape preserve question; repeated exit/Back; Unlock runs exit exactly once and removes unload guard');
