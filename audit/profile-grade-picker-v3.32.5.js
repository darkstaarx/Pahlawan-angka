const fs=require('fs');
const manager=fs.readFileSync('js/profile-manager-v3.24.2.js','utf8');
const onboarding=fs.readFileSync('js/guardian-onboarding-v3.25.1.js','utf8');
const picker=fs.readFileSync('js/custom-picker-v3.25.6.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};

check(/const gradeSelect=\$\('pmChildGrade'\)/.test(manager)&&/gradeSelect\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/.test(manager),'profile editor does not synchronize its themed grade trigger');
check(/gradeSelect'\)\.value=String\(draft\.grade\);\$\('gradeSelect'\)\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/.test(onboarding),'guardian onboarding does not synchronize the setup grade trigger');
check(/select\.addEventListener\('change',\(\)=>\{trigger\.querySelector\('span'\)\.textContent=selectedLabel\(select\)/.test(picker),'themed picker does not respond to synthetic change events');
check(/PA_APP_VERSION='3\.32\.5'/.test(version),'app version is not 3.32.5');
check(/profileJs=`js\/profile-manager-v\$\{PROFILE_MANAGER_VERSION\}\.js\?v=\$\{APP_VERSION\}`/.test(pwa),'profile manager does not use the current app version for cache busting');
check(/guardian-onboarding-v3\.25\.1\.js\?v=3\.32\.5/.test(html),'guardian onboarding is not cache-busted');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
