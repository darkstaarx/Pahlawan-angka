const fs=require('fs');
const heroes=fs.readFileSync('js/heroes.js','utf8');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const base='assets/heroes/bunga/frames/';
const files=['attack-stance-aura-v4.webp','attack-movement-portal-v4.webp','attack-addition-v4.webp','attack-subtraction-v4.webp','attack-division-v4.webp'];
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const name of files){
 const path=base+name;
 check(fs.existsSync(path),'missing '+path);
 if(fs.existsSync(path))check(fs.statSync(path).size>50000,'suspiciously small '+path);
 check(sw.includes(path),'not precached '+path);
}
check(heroes.includes(base+'attack-stance-aura-v4.webp'),'Bunga stance is not the normalized aura frame');
check(heroes.includes(base+'attack-movement-portal-v4.webp'),'Bunga movement is not the portal casting frame');
for(const id of ['addition','subtraction','division'])check(new RegExp(`id:'${id}'[^\\n]+attack-${id}-v4\\.webp[^\\n]+bodyScale:1\\.00,footShiftX:0`).test(action),'invalid '+id+' contact mapping');
check(!/id:'(?:sweep|spiral|thorn)'/.test((action.match(/bunga:\[([\s\S]*?)\n\s*\]/)||[])[1]||''),'legacy Bunga contact rotation remains');
check(/PA_APP_VERSION='3\.32\.7'/.test(version),'app version is not 3.32.7');

console.log(JSON.stringify({status:failures.length?'fail':'pass',assets:files.length,failures},null,2));
process.exitCode=failures.length?1:0;
