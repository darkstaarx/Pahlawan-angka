const fs=require('fs');
const battle=fs.readFileSync('js/battle.js','utf8');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};

check(/if\(db\?\.hero==="bunga"\)\{[\s\S]*?phase-contact/.test(battle),'Bunga does not route stance directly to contact');
check(/else\{[\s\S]*?phase-movement[\s\S]*?phase-contact/.test(battle),'Wira three-phase sequence was removed');
check(/data-lab-step="movement"/.test(action),'Attack Lab movement control cannot be targeted');
check(/lab\.hero==='bunga'&&step==='movement'\)step='strike'/.test(action),'Bunga movement step does not redirect to strike');
check(/if\(lab\.hero==='bunga'\)[\s\S]*?attackLabStep\('strike'\)/.test(action),'Bunga playback is not stance-to-strike');
check(/bunga-two-phase \.paAttackLabSteps\{grid-template-columns:repeat\(2,1fr\)\}/.test(css),'Bunga lab is not a two-column sequence');
check(/bunga-two-phase \[data-lab-step="movement"\]\{display:none\}/.test(css),'Bunga movement button remains visible');
const release=version.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/);
check(!!release&&(+release[1]>3||(+release[1]===3&&(+release[2]>33||(+release[2]===33&&+release[3]>=0)))),'app version is older than Bunga two-phase v3.33.0');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
