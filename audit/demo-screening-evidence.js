'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'2',classList:{add(){},remove(){},toggle(){}},appendChild(){}});return elements.get(id)};
const originalDb={name:'existing',coins:99},originalSess={mode:'original'};
const c={console,db:originalDb,sess:originalSess,META:{test:{title:'Membanding nombor'}},GRAPH:{skills:[{id:'test',grade:2,role:'core'}]},document:{readyState:'loading',addEventListener(){},getElementById:element,querySelectorAll:()=>[],querySelector:()=>element('card'),createElement:()=>element('new')},location:{},swapDemoState(db,sess){const previous={db:c.db,sess:c.sess};c.db=db;c.sess=sess;return previous},initAll(){},ensureProgression(){},applyHeroToBattle(){},updateMissionHud(){},nextQ(){},battle(){},screen(){}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('js/demo-mode-v3.56.0.js','utf8'),c);
function answer(ok,retry,hint){c.sess.q={prompt:'Compare',answer:200,hint:'Compare hundreds',competencyId:'compare'};c.sess.retryState=retry?{}:null;c.PADemo.record('test',ok,hint)}
c.PADemo.start();for(let i=0;i<9;i++)answer(true,false,false);answer(true,true,true);
assert.deepStrictEqual(JSON.parse(JSON.stringify(c.PADemo.summary())),{total:10,first:9,correct:10,hints:1,independent:9});
c.PADemo.finish();assert.strictEqual(c.db,originalDb);assert.strictEqual(c.sess,originalSess);assert.equal(c.db.coins,99);
assert.match(element('resultScore').innerHTML,/9\/10/);assert.match(element('resultCoach').textContent,/1 percubaan salah/);assert.match(element('resultCoach').textContent,/1 soalan dibetulkan/);assert.equal(element('resultStars').textContent,'');
c.PADemo.start();assert.equal(c.PADemo.summary().total,0);answer(true,false,true);answer(true,true,false);answer(false,true,true);
assert.deepStrictEqual(JSON.parse(JSON.stringify(c.PADemo.summary())),{total:3,first:1,correct:2,hints:2,independent:0});c.PADemo.finish();assert.match(element('resultCoach').textContent,/1 soalan belum berjaya/);
c.PADemo.start();for(let i=0;i<10;i++)answer(true,false,false);c.PADemo.finish();assert.match(element('resultCoach').textContent,/Semua soalan dijawab betul tanpa petunjuk/);assert.doesNotMatch(element('resultCoach').textContent,/Cadangan latihan/);
// Execute real mission accounting to ensure retry state reaches the demo recorder.
vm.runInContext(fs.readFileSync('js/progression.js','utf8'),c);vm.runInContext('ensureProgression=()=>{};updateMissionHud=()=>{}',c);
c.PADemo.start();c.sess.q={prompt:'Compare',answer:200,hint:'Hundreds'};c.sess.retryState={};c.recordMissionAnswer(true,'test',true);assert.equal(c.PADemo.summary().first,0);assert.equal(c.PADemo.summary().hints,1);assert.equal(c.sess.missionAnswered,1);
vm.runInContext(fs.readFileSync('questions/helpers.js','utf8'),c);
for(let count=23;count<=87;count++){const svg=c.dotsEstimateVisual(count),points=[...svg.matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)].map(m=>[+m[1],+m[2]]);assert.equal(points.length,count);for(let i=0;i<count;i++){assert(points[i][0]>=8&&points[i][0]<=278&&points[i][1]>=8&&points[i][1]<=166);for(let j=0;j<i;j++)assert(Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1])>8)}}
console.log('PASS: corrected answers, first-attempt hints, unresolved answers, perfect run, session reset, state restoration, mission integration and 65 estimation sizes.');
