const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function fixture(){
 const elements=new Map(),classes=new Set();
 const node=id=>{
  if(!elements.has(id))elements.set(id,{hidden:true,attributes:{},setAttribute(k,v){this.attributes[k]=v;},focus(){this.focused=true;},querySelector(s){return node(s);},classList:{toggle(k,v){if(v)classes.add(k);else classes.delete(k);}}});
  return elements.get(id);
 };
 const locks=[];
 const c={document:{getElementById:node},window:{PAPageLock:{setResultState(v){locks.push(v);}}},run:{tally:{own:8,hint:4},asked:12,questionTarget:12,coveredTopics:['Nombor','Operasi']},entryMode:{guestDemo:true},db:{schoolGrade:1},$:node,devSubject:x=>x,devPetName:()=>'Aurora',popStars(){}};
 vm.createContext(c);
 const source=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
 vm.runInContext(source.slice(source.indexOf('  function setResultLifecycle('),source.indexOf('  function startRun(){')),c);
 c.coachLine=()=> 'Semua soalan sesi ini dijawab tepat.';
 return {c,node,locks,classes};
}

for(const won of [true,false])test(`result lifecycle disables old answering surface and focuses summary (won=${won})`,()=>{
 const f=fixture();f.c.finishRun(won,'Selesai');
 assert.equal(f.c.run.locked,true);
 assert.equal(f.node('.segelPanel').inert,true);
 assert.equal(f.node('.segelTop').attributes['aria-hidden'],'true');
 assert.equal(f.classes.has('segel-result-active'),true);
 assert.equal(f.node('segelDone').hidden,false);
 assert.equal(f.node('segelDone').focused,true);
 assert.deepEqual(f.locks,[true]);
 f.c.setResultLifecycle(false);
 assert.equal(f.node('.segelPanel').inert,false);
 assert.equal(f.node('.segelTop').attributes['aria-hidden'],'false');
 assert.equal(f.classes.has('segel-result-active'),false);
 assert.deepEqual(f.locks,[true,false]);
});
