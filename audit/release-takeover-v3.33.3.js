const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const profile=fs.readFileSync('js/profile-manager-v3.24.2.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const failures=[];
const check=(ok,message)=>{if(!ok)failures.push(message)};

for(const file of ['battle','version','pwa'])check(new RegExp('js/'+file+'\\.js\\?v=3\\.33\\.4').test(index),file+'.js is not wired to the current release');
check(/controllerchange[\s\S]+reloadingForController[\s\S]+location\.reload\(\)/.test(pwa),'new Service Worker controller does not reload the open tab');
check(/PA_APP_VERSION\|\|VERSION/.test(profile),'Profile Manager still overwrites the app footer with its module version');
check(/PA_APP_VERSION='3\.33\.4'/.test(version),'app version is not 3.33.4');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
if(failures.length)process.exit(1);
