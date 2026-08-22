const fs=require('fs');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};
const js=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const version=fs.readFileSync('js/version.js','utf8');

for(const id of ['addition','subtraction','division']){
  check(new RegExp("id:'"+id+"'[^\\n]+bodyScale:1\\.25,footShiftX:0").test(js),id+' contact scale is not the approved 1.25');
}
check(/db\?\.hero==="bunga"[\s\S]*?phase-contact/.test(fs.readFileSync('js/battle.js','utf8')),'Bunga does not skip directly to contact');
check(/bunga-two-phase[^}]+paAttackLabSteps/.test(css),'Attack Lab two-phase layout is missing');
check(/bunga-two-phase[^}]+data-lab-step="movement"/.test(css),'Attack Lab movement control is not hidden for Bunga');
check(!/phase-(?:anticipation|movement)[^}]+scale\(1\.25\)/.test(css),'cancelled phase-wide 1.25 enlargement remains');
const release=version.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/);
check(!!release&&(+release[1]>3||(+release[1]===3&&(+release[2]>33||(+release[2]===33&&+release[3]>=1)))),'app version is older than the current Bunga contact calibration');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
