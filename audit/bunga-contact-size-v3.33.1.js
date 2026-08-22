const fs=require('fs');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const battle=fs.readFileSync('js/battle.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};

for(const id of ['addition','subtraction','division']){
  check(new RegExp("id:'"+id+"'[^\\n]+bodyScale:1\\.25,footShiftX:0").test(action),id+' is not enlarged with a fixed X anchor');
}
check(/hero-frame-strike[^}]+bottom:0!important[^}]+transform-origin:50% 100%!important/.test(css),'battle contact frame is not anchored to its base');
check(/data-step="strike"[^}]+scale\(var\(--pa-lab-contact-scale,1\)\)[^}]+transform-origin:50% 100%/.test(css),'Attack Lab does not preview the same bottom-anchored scale');
check(/lab\.hero==='bunga'&&step==='movement'\)step='strike'/.test(action),'Bunga movement step was reintroduced');
check(/if\(db\?\.hero==="bunga"\)[\s\S]*?phase-contact/.test(battle),'Bunga no longer uses its two-phase battle path');
const release=version.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/);
check(!!release&&(+release[1]>3||(+release[1]===3&&(+release[2]>33||(+release[2]===33&&+release[3]>=1)))),'app version is older than Bunga contact size v3.33.1');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
