// Run from repository root with Node 20+: node js/account-save-guard-v1.test.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('js/account-save-guard-v1.js','utf8');
const store=new Map(),window={localStorage:{
 getItem:key=>store.get(key)||null,
 setItem:(key,value)=>store.set(key,String(value)),
 removeItem:key=>store.delete(key)
}};
vm.runInNewContext(src,{window,Date,JSON,Error});
const safe=window.PAAccountSaveV1;
const id=n=>'00000000-0000-4000-8000-00000000000'+n;
(async()=>{
 assert.throws(()=>safe.bind(id('1'),id('2')),/disahkan/);
 safe.bind(id('1'),id('2'),{confirmedOwnership:true});
 safe.capture({cloudChildId:id('2'),xp:12,rewards:{pets:{ketupatKura:true}}});
 assert.equal(safe.status(),'local_only');
 safe.bind(id('1'),id('3'),{confirmedOwnership:true});
 assert.equal(safe.read(),null);
 assert.throws(()=>safe.capture({cloudChildId:id('2')}),/bukan milik/);
 safe.capture({cloudChildId:id('3'),xp:3});
 safe.bind(id('1'),id('2'),{confirmedOwnership:true});
 assert.equal(safe.read().profile.xp,12);
 const install=safe.installCloud({cloudChildId:id('2'),xp:2},99);
 assert.equal(install.installed,false); // local pending cannot be overwritten
 let deliver;
 const pending=safe.flush(()=>new Promise(resolve=>{deliver=resolve}));
 safe.capture({cloudChildId:id('2'),xp:14}); // save during network flight
 deliver({saved:true,server_revision:1});
 assert.equal((await pending).status,'pending');
 assert.equal(safe.read().profile.xp,14);
 assert.equal(safe.read().serverRevision,1);
 assert.equal((await safe.flush(async req=>({
   saved:false,reason:'revision_conflict',server_revision:3
 }))).status,'conflict');
 assert.equal(safe.read().profile.xp,14);
 safe.unbind();
 assert.equal(store.has('pa_coach_v6_full'),false);
 safe.bind(id('4'),id('5'),{confirmedOwnership:true});
 safe.capture({cloudChildId:id('5'),xp:20});
 let release;
 const flight=safe.flush(()=>new Promise(resolve=>{release=resolve}));
 safe.bind(id('1'),id('3'),{confirmedOwnership:true});
 release({saved:true,server_revision:1});
 assert.equal((await flight).status,'switched_account');
 assert.equal(safe.read().profile.xp,3);
 console.log('PASS: identity isolation, dirty preservation, CAS conflict, race, logout');
})().catch(error=>{console.error(error);process.exitCode=1});
