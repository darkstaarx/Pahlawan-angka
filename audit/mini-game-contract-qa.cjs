const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const gated=['gerai-wirayung.html','menara-jam.html','kedai-kek.html','bengkel-ajaib.html'];
const guard=read('js/minigame-dev-gate.js');
assert.match(guard,/app\.isDevMode\(\)===true/,'DEV UI must check the owning app DEV state');
assert.match(guard,/pa_dev_unlocked/,'local standalone testing must use the app DEV unlock');
assert.doesNotMatch(guard,/URLSearchParams|\.search/,'query strings must not unlock DEV controls');
function gateState(hostname,{parentDev=false,unlocked=false}={}){
 const current={};
 current.parent=parentDev?{db:{},isDevMode:()=>true}:current;
 const context={window:current,location:{hostname},localStorage:{getItem:key=>key==='pa_dev_unlocked'&&unlocked?'1':null}};
 vm.runInNewContext(guard,context);
 return current.PAMiniGameDev.enabled();
}
assert.equal(gateState('darkstaarx.github.io'),false,'public standalone page must never show DEV controls');
assert.equal(gateState('darkstaarx.github.io',{parentDev:true}),true,'authenticated app DEV mode may show controls');
assert.equal(gateState('127.0.0.1',{unlocked:true}),true,'local DEV unlock may show controls');
assert.equal(gateState('127.0.0.1'),false,'local page without DEV unlock must hide controls');
for(const path of gated){
 const source=read(path);
 assert.match(source,/minigame-dev-gate\.js/ ,`${path} must load the shared DEV gate`);
 assert.match(source,/id="devBtn" hidden/,`${path} DEV control must start hidden`);
 assert.match(source,/PAMiniGameDev.*enabled/,`${path} must check DEV state before exposing controls`);
}
for(const path of [...gated,'tapak-bina.html']){
 const source=read(path),scripts=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());
 scripts.forEach((script,index)=>new vm.Script(script,{filename:`${path} inline script ${index+1}`}));
}

const time=read('menara-jam.html');
assert.match(time,/const HELP2=/,'Tren Jam needs a distinct second clue');
assert.match(time,/HELP2\[q\.mode\]/,'Tren Jam clue two must use non-answer guidance');
assert.doesNotMatch(time,/HELP\[q\.mode\]\.a/,'Tren Jam must not expose an answer helper to Wira hints');
const money=read('gerai-wirayung.html');
assert.match(money,/hints>=2/,'Gerai Wirayung must cap clues at two');
assert.doesNotMatch(money,/hint2===1\?M\(\)\.strategy\(m\):M\(\)\.answer\(m\)/,'Gerai clue two must not reveal the answer');
for(const path of ['kedai-kek.html','bengkel-ajaib.html','tapak-bina.html','menara-jam.html'])
 assert.match(read(path),/hints>=2/,`${path} must cap clues at two`);

for(const path of ['js/focus-mini-games-live-bridge.js','js/tapak-bina-live-bridge.js','js/wirayung-live-bridge.js'])
 assert.match(read(path),/PALearnerReview/ ,`${path} must connect mini-game evidence to learner review`);
assert.match(read('js/parent.js'),/PALearnerReview\?\.parentSummary/,'Parent Ringkasan must consume learner-review evidence');

console.log('PASS: DEV-only controls, two non-answer clues, and learner-review-to-parent-summary links are guarded.');
