#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let writes=0,cloud=0;
const ctx={console,Date,Math,JSON,setTimeout:f=>f(),localStorage:{setItem:()=>writes++},PACloud:{scheduleSave:()=>cloud++}};vm.createContext(ctx);
for(const p of ['data/kssr/d3-topic7-evidence-epoch-v3.39.0.js','data/kssr/d3-nonT7-live-isolation-v1.0.0.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),ctx);
for(const demo of [true,false]){
 const state={schoolGrade:3,demoMode:demo,skills:{'D3.SHAPE':{mastery:67,evidence:4,confidence:55}}},before=JSON.stringify(state.skills),w=writes,c=cloud;
 const prepared=ctx.PAD3Topic7Evidence.ensure(state);assert(prepared.ok);assert.equal(JSON.stringify(state.skills),before);
 assert.equal(writes-w,demo?0:1);assert.equal(cloud-c,demo?0:1);
 const q={source:'qsv2',qsv2Live:true,topicId:'D3.T2',legacySkillId:'D3.ADD',standardId:'2.1.1',competencyId:'add',curriculumVersion:'KSSR-E3-2024',familyKey:'add',representation:'symbolic',demand:'procedure',templateId:'test'},w2=writes,c2=cloud;
 assert(ctx.PAD3NonT7LiveIsolation.record(state,q,{attemptId:'test-1',finalCorrect:true,firstAttemptCorrect:true}).accepted);
 assert.equal(writes-w2,demo?0:1);assert.equal(cloud-c2,demo?0:1);assert.equal(JSON.stringify(state.skills),before);
}
console.log('PASS: demo migrations never persist/schedule cloud; normal migrations still persist; legacy mastery unchanged (16 assertions)');
