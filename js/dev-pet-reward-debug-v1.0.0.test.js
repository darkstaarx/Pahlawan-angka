const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

global.GRAPH=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','kssr','knowledge-graph.json'),'utf8'));
require('./pet-collection-system.js');
const debug=require('./dev-pet-reward-debug-v1.0.0.js');
const fresh=()=>({schoolGrade:1,level:3,coins:7,skills:{'D1.N20':{mastery:30}}});

test('pet reward debug is read-only and follows the deterministic rescue cycle',()=>{
 const data=fresh(),before=structuredClone(data);
 const report=debug.inspect(data,{grade:1,level:3,rotation:0});
 assert.deepEqual(data,before);
 assert.equal(report.petId,'ketupatKura');
 assert.equal(report.threshold,10);
 assert.equal(report.eligible,true);
 assert.equal(report.rescueAfter,1);
});

test('pet reward debug exposes level gates without awarding a rescue',()=>{
 const report=debug.inspect(fresh(),{grade:1,level:1,rotation:4});
 assert.equal(report.petId,'durianKerbau');
 assert.equal(report.gate,25);
 assert.equal(report.eligible,false);
 assert.equal(report.rescueAwarded,false);
 assert.equal(report.rescueAfter,0);
});

test('near-unlock simulation predicts the real tame threshold and Bond XP',()=>{
 const report=debug.inspect(fresh(),{grade:1,level:3,rotation:0,nearUnlock:true});
 assert.equal(report.rescueBefore,9);
 assert.equal(report.rescueAfter,10);
 assert.equal(report.newlyTamed,true);
 assert.equal(report.stateAfter,'tamed');
 assert.equal(report.bondXpAfter-report.bondXpBefore,20);
});
