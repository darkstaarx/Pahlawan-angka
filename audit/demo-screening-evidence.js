'use strict';
const assert=require('assert'),fs=require('fs');
const demo=fs.readFileSync('js/demo-mode-v3.56.0.js','utf8');
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const css=fs.readFileSync('css/demo-mode-v3.56.0.css','utf8');
const graph=JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json','utf8'));

function demoQuestionCount(grade){
  const topics=new Set(graph.skills
    .filter(skill=>skill.grade===grade&&skill.role==='core')
    .map(skill=>skill.domain||`Bab ${skill.chapter||'lain'}`));
  return {topics:topics.size,questions:topics.size*2};
}

assert.match(demo,/Pilih Darjah/);
assert.match(demo,/const grades=\[1,2,3,4,5,6\]/);
assert.match(demo,/Darjah \$\{grade\}/);
assert.match(demo,/openSegelDemo\(\{guestDemo:true\}\)/);
assert.match(demo,/demoMode:true/);
assert.match(demo,/restoreGuest/);
assert.match(demo,/topics\.size\*2/);
assert.doesNotMatch(demo,/paDemoHeroes|PADemo\.hero|applyHeroToBattle\(\)|nextQ\(\)|battle\(\)|screen\('game'\)/);
assert.doesNotMatch(css,/paDemoHeroes/);
assert.match(segel,/entryMode\?\.guestDemo/);
assert.match(segel,/window\.PADemo\?\.restoreGuest\?\.\(\)/);
assert.match(segel,/function guestTopicPlan\(grade\)/);
assert.match(segel,/return \[\.\.\.first,\.\.\.second\]/);
assert.match(segel,/questionTarget:entryMode\?\.guestDemo\?pool\.length:MAX_Q/);
const d1=demoQuestionCount(1),d6=demoQuestionCount(6);
assert.equal(d1.questions,16);
assert.equal(d6.questions,24);
assert(d6.questions>d1.questions);
console.log(`PASS: guest demo enters Segel safely; D1 has ${d1.questions} questions and D6 has ${d6.questions}, with two per topic.`);
