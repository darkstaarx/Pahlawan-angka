const fs=require('fs');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};
const js=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const version=fs.readFileSync('js/version.js','utf8');

for(const id of ['addition','subtraction','division']){
  check(new RegExp("id:'"+id+"'[^\\n]+bodyScale:1\\.25,footShiftX:0").test(js),id+' is not scale 1.25 with stable X anchor');
}
check((css.match(/scale\(1\.25\)!important/g)||[]).length>=1,'shared stance/movement scale 1.25 is missing');
check(/phase-anticipation[\s\S]+phase-movement[\s\S]+transform-origin:50% 100%/.test(css),'stance and movement do not share the bottom anchor');
check(/PA_APP_VERSION='3\.32\.8'/.test(version),'app version is not 3.32.8');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
