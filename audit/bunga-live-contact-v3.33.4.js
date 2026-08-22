const fs=require('fs');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const battle=fs.readFileSync('js/battle.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};

for(const id of ['addition','subtraction','division'])check(new RegExp("id:'"+id+"'[^\\n]+bodyScale:1\\.55,footShiftX:0").test(action),id+' is not scale 1.55 with fixed X');
check(/const preloadedFrames=Object\.values\(variants\)\.flat\(\)\.map/.test(action),'attack frames are not preloaded');
check(/image\.decoding='async';image\.src=asset/.test(action),'preload does not initiate image decoding');
check(/PAActionVariety=\{variants,strikeFrame,preloadedFrames\}/.test(action),'preloaded frame references are not retained');
check(/if\(db\?\.hero==="bunga"\)[\s\S]*?phase-contact/.test(battle),'Bunga two-phase path is missing');
check(/hero-frame-strike[^}]+bottom:0!important[^}]+transform-origin:50% 100%!important/.test(css),'contact frame base is not fixed');
check(/action-variety-v3\.30\.0\.js\?v=3\.33\.4/.test(index),'action runtime is not cache-busted to 3.33.4');
check(/PA_APP_VERSION='3\.33\.4'/.test(version),'app version is not 3.33.4');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
