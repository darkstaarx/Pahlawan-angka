const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const battle=fs.readFileSync('js/battle.js','utf8');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};

check(/js\/battle\.js\?v=3\.33\.2/.test(index),'battle.js is not cache-busted to 3.33.2');
check(/js\/version\.js\?v=3\.33\.2/.test(index),'version.js is not cache-busted to 3.33.2');
check(/js\/pwa\.js\?v=3\.33\.2/.test(index),'PWA registration is not refreshed');
check(/if\(db\?\.hero==="bunga"\)\{[\s\S]*?phase-contact/.test(battle),'Bunga two-phase branch is missing from the delivered battle file');
check(/id:'addition'[^\n]+bodyScale:1\.25/.test(action),'enlarged Bunga contact mapping is missing');
check(/PA_APP_VERSION='3\.33\.2'/.test(version),'app version is not 3.33.2');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
