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

const release=version.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/);
check(!!release&&(+release[1]>3||(+release[1]===3&&(+release[2]>32||(+release[2]===32&&+release[3]>=6)))),'app version is older than division-minion v3.32.6');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
