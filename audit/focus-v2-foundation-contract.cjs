#!/usr/bin/env node
'use strict';
// Focus v2 Phase A/B contractual integrity checks. NOT the diagnosis engine.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const graph=read('data/kssr/knowledge-graph.json');
const map=read('data/focus-v2/foundation-map-v1.json');
const tags=read('data/focus-v2/question-tag-contract-v1.json');
const fixture=read('data/focus-v2/diagnosis-fixtures-v1.json');
const catalog=new Map(graph.skills.map(s=>[s.id,s]));
const nodes=new Map(map.foundations.map(n=>[n.id,n]));
assert.equal(catalog.size,114,'Graph baseline changed; rerun full audit');
assert.equal(nodes.size,map.foundations.length,'Duplicate atomic foundation IDs');
assert.equal(map.operationCurriculumCrosswalk.length,graph.skills.filter(s=>s.domain==='Operasi').length);
assert.equal(map.topicContexts.money.length,graph.skills.filter(s=>s.domain==='Wang').length);
assert.deepEqual(new Set(map.operations),new Set(['addition','subtraction','multiplication','division']));
const visit=new Set(),done=new Set();
function checkDAG(id) {
 if(done.has(id))return;
 assert(!visit.has(id),'Cyclic foundation prerequisite: '+id);
 const n=nodes.get(id);assert(n,'Unknown foundation: '+id);
 visit.add(id);
 for(const p of n.prerequisites){assert(nodes.has(p),'Bad foundation prerequisite '+p);checkDAG(p)}
 visit.delete(id);done.add(id);
 for(const x of n.curriculumAnchors)assert(catalog.has(x),'Invalid curriculum anchor '+x);
}
for(const id of nodes.keys())checkDAG(id);
for(const x of map.operationCurriculumCrosswalk){assert.equal(catalog.get(x.skillId)?.domain,'Operasi');assert(x.possibleOperationFamilies.every(s=>map.operations.includes(s)))}
for(const x of map.topicContexts.money){assert.equal(catalog.get(x.skillId)?.domain,'Wang');assert(x.concepts.every(id=>nodes.has(id)));assert(x.possibleOperations.every(op=>map.operations.includes(op)))}
for(const x of map.topicContexts.otherExamples){for(const id of x.sourceSkillIds)assert(catalog.has(id));for(const id of x.concepts)assert(nodes.has(id))}
assert.deepEqual(map.topicContexts.money.find(x=>x.skillId==='D2.4.5').possibleOperations,['division']);
assert(map.topicContexts.money.find(x=>x.skillId==='D2.4.5').concepts.includes('money.ringgit_sen'));
for(const id of ['D5.OPS','D6.OPS'])assert.equal(map.operationCurriculumCrosswalk.find(x=>x.skillId===id).status,'must_use_question_metadata');
assert(tags.examples.length>=5);
for(const e of tags.examples){
 assert(catalog.has(e.original.originSkillId),'Bad sample skill ID');
 for(const node of [...(e.tags.foundationIds||[]),...(e.tags.conceptIds||[])])assert(nodes.has(node),'Bad example atomic ID: '+node);
}
assert(fixture.cases.length>=8);
for(const c of fixture.cases){
 assert(catalog.has(c.originSkillId));
 assert(c.observations.length>0);
 assert(['insufficient_evidence','needs_contrast','candidate','verified'].includes(c.expected.state));
 assert(!c.expected.rootCause||nodes.has(c.expected.rootCause));
 assert(nodes.has(c.expected.nextProbe),'Invalid expected next probe '+c.expected.nextProbe);
 const uniqueFamilies=new Set(c.observations.map(o=>o.probe));
 assert(uniqueFamilies.size>=1);
 if(c.observations.length===1)assert.equal(c.expected.state,'insufficient_evidence','No single-event diagnosis');
}
console.log(JSON.stringify({status:'phase_a_b_contract_pass',curriculumSkills:catalog.size,operationSkills:map.operationCurriculumCrosswalk.length,moneySkills:map.topicContexts.money.length,atomicFoundations:nodes.size,goldenFixtureSpecifications:fixture.cases.length,note:'Fixtures assert schema/expected outputs only; no engine has been validated.'},null,2));
