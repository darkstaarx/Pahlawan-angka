const fs=require('fs');
const app=fs.readFileSync('js/app.js','utf8');
const compat=fs.readFileSync('js/phase-3.6.4.js','utf8');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};

check(/Bahbahgi[^\n]+specialty:'division'/.test(app),'Bahbahgi is not registered as a division minion');
check(/divisionRound=\/\\bdiv\\b\|bahagi\|division\/i/.test(app),'division-aware minion routing is missing');
check(/Raja Bahagian Sama[^\n]+raja-bahagian-sama\.webp[^\n]+frames:'assets\/enemies\/fractions\/frames'/.test(app),'Chapter 3 fraction boss is not restored');
check(!/BOSS_BY_CHAPTER\['3'\]=\{name:'Bahbahgi'/.test(compat),'compatibility layer still promotes Bahbahgi to boss');

const bunga=(action.match(/bunga:\[([\s\S]*?)\n\s*\]/)||[])[1]||'';
const scales=Object.fromEntries([...bunga.matchAll(/id:'([^']+)'[^\n]+bodyScale:([\d.]+)/g)].map(x=>[x[1],Number(x[2])]));
check(scales.original===1.38&&scales.thorn===1.36,'compact-body Bunga frames are not calibrated to the movement body height');
check(scales.sweep===1.05&&scales.spiral===1,'already stable Bunga frames changed unexpectedly');
check(/PA_APP_VERSION='3\.32\.6'/.test(version),'app version is not 3.32.6');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
