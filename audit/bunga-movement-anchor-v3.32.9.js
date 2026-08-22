const fs=require('fs');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};
const js=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const version=fs.readFileSync('js/version.js','utf8');

for(const id of ['addition','subtraction','division']){
  check(new RegExp("id:'"+id+"'[^\\n]+bodyScale:1\\.00,footShiftX:0").test(js),id+' contact calibration changed unexpectedly');
}
check(/phase-movement \.hero-frame-follow-through\{[\s\S]*?transform:translate\(-50%,20%\) scale\(\.98\)!important/.test(css),'battle movement does not apply the 20% landmark correction');
check(/img\[data-step="movement"\]\[data-hero="bunga"\]\{transform:translate\(7%,20%\)\}/.test(css),'Attack Lab does not mirror the movement correction');
check(!/phase-(?:anticipation|movement)[^}]+scale\(1\.25\)/.test(css),'cancelled phase-wide 1.25 enlargement remains');
check(/PA_APP_VERSION='3\.32\.9'/.test(version),'app version is not 3.32.9');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
