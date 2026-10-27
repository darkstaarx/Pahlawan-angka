'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const micro=require('../js/engine/focus-micro-diagnosis-v1.js');
const fixtures=require('../js/dev-focus-micro-fixtures-v1.js');
const brain=require('../js/engine/diagnostic-brain-v1.js');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fakeDom(){
 const all=[];
 const createElement=tag=>{
  const el={tagName:tag.toUpperCase(),children:[],dataset:{},style:{},className:'',hidden:false,
   addEventListener(){},setAttribute(){},appendChild(n){n.parentNode=this;this.children.push(n);all.push(n);return n},
   remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);all.splice(all.indexOf(this),1)},
   replaceChildren(){this.children=[]}};
  return el;
 };
 const body=createElement('body'),head=createElement('head');
 const document={body,head,readyState:'complete',createElement,
  getElementById(id){return all.find(n=>n.id===id)||null}};
 return document;
}
function labSetup(){
 const calls=[],document=fakeDom();
 const telemetry={response:function(){calls.push([...arguments]);return 'original-return'}};
 let unlocked=true;
 const window={PATelemetry:telemetry,PADiagnostic:brain,PAFocusMicroV1:micro,PADevMicroFixturesV1:fixtures};
 const sess={devBankTest:true,mode:'dev'};
 const sandbox={window,document,META:{'D5.OPS':{title:'Darab',domain:'Nombor'}},sess,isDevMode:()=>unlocked,console,Date,
  MutationObserver:class {observe(){}}};
 vm.runInNewContext(read('js/dev-focus-micro-lab-v1.js'),sandbox,{filename:'js/dev-focus-micro-lab-v1.js'});
 return {window,document,sess,calls,api:window.PADevFocusMicroLabV1,lock:()=>{unlocked=false}};
}
function send(t,o,a,b,correct,mode='dev'){
 const q={skill:'D5.OPS',token:String(t),prompt:a+' '+{mul:'×',div:'÷',add:'+',sub:'−'}[o]+' '+b+' = ?',answer:0};
 return t; // used below via helper
}
test('DEV bank answers do not enter primary diagnostic or local learning telemetry',()=>{
 const db={diagLog:[],demoMode:false,schoolGrade:5},sess={devBankTest:true,mode:'dev'};
 const writes=[],rapid=[];
 const window={PADiagnostic:null,PARapidLock:{observe:(...args)=>rapid.push(args)}};
 const context={window,db,sess,localStorage:{setItem(...args){writes.push(args)},getItem(){return null}},
  sessionStorage:{getItem(){return 'x'},setItem(){}},Date,Math,JSON};
 vm.runInNewContext(read('js/engine/diagnostic-brain-v1.js'),context);
 assert.equal(window.PADiagnostic.record('D5.OPS',false,'fact',8,false,{token:'q',prompt:'8 × 7 = ?'},'dev-first-attempt'),false);
 assert.equal(db.diagLog.length,0);
 vm.runInNewContext(read('js/engine/telemetry.js'),context);
 assert.equal(window.PATelemetry.response('D5.OPS',false,'fact',8,false,{token:'q',prompt:'8 × 7 = ?'},'dev-first-attempt'),false);
 assert.equal(db.diagLog.length,0);
 assert.equal(writes.length,0);
 assert.equal(rapid.length,0);
 sess.devBankTest=false;sess.mode='practice';
 // Normal telemetry path should still be able to run and produce a brain record.
 assert.equal(window.PATelemetry.response('D5.OPS',false,'fact',8,false,{token:'regular',prompt:'8 × 7 = ?'},'practice-first-attempt'),true);
 assert.equal(db.diagLog.length,1);
 assert.equal(writes.length,1);
 assert.equal(rapid.length,1);
});
test('DEV observer sees first attempts without suppressing original telemetry',()=>{
 const t=labSetup();
 assert.equal(t.api.startMonitoring('dev'),true);
 let i=0;
 for(const [a,b,ok] of [[8,6,false],[5,6,true],[8,7,false],[3,9,true],[8,8,false],[5,9,true]]){
  const q={skill:'D5.OPS',token:'q'+(++i),prompt:a+' × '+b+' = ?',answer:a*b};
  const mode=ok?'dev':'dev-first-attempt';
  assert.equal(t.window.PATelemetry.response('D5.OPS',ok,'fact',8,false,q,mode),'original-return');
  if(!ok)assert.equal(t.window.PATelemetry.response('D5.OPS',true,'correct',12,true,q,'dev-retry'),'original-return');
 }
 assert.equal(t.api.status().captured,6);
 assert.equal(t.calls.length,9);
 const report=t.api.inspect();
 assert.equal(report.micro.findings.find(x=>x.id==='mul.table.8')?.status,'probe_candidate');
 assert(Array.isArray(report.main.findings));
 assert.equal(report.micro.writes,0);
 t.api.stopMonitoring();assert.equal(t.api.status().watching,false);
});
test('mixed game capture ignores DEV bank runs and observes only genuine regular battle first answers',()=>{
 const t=labSetup();
 assert.equal(t.api.startMonitoring('game'),true);
 const q={skill:'D5.OPS',token:'q1',prompt:'4 × 9 = ?',answer:36};
 t.window.PATelemetry.response('D5.OPS',false,'fact',8,false,q,'dev-first-attempt');
 assert.equal(t.api.status().captured,0);
 t.sess.devBankTest=false;t.sess.mode='practice';
 t.window.PATelemetry.response('D5.OPS',false,'fact',8,false,q,'practice-first-attempt');
 t.window.PATelemetry.response('D5.OPS',true,'correct',11,true,q,'practice-retry');
 assert.equal(t.api.status().captured,1,'retry must not count again');
 assert.equal(t.api.inspect().micro.evidence.usableRows,1);
});
test('DEV observer cannot be activated or inspected without authorised isDevMode',()=>{
 const t=labSetup();t.lock();
 assert.equal(t.api.startMonitoring('game'),false);
 assert.equal(t.api.inspect(),null);
});
