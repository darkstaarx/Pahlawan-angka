const fs=require('fs');
const battle=fs.readFileSync('js/battle.js','utf8');
const questions=fs.readFileSync('questions/kssr-assessment-depth-v3.22.0.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');

function check(ok,message){if(!ok)throw new Error(message);}

check(/if\(db\?\.hero!=="bunga"\)setTimeout\(\(\)=>\{clearHeroPhases\(\);attacker\.classList\.add\("phase-follow-through"\)/.test(battle),'Bunga finisher can still enter follow-through');
check(/setTimeout\(\(\)=>\{clearHeroPhases\(\);attacker\.classList\.add\("phase-contact"\)\},heroLead\+finisherContact\)/.test(battle),'finisher contact phase missing');
check(/shown=n===value\?'':n/.test(questions),'number-line target tick still prints its answer');
check(/const depthJs=`questions\/kssr-assessment-depth-v\$\{DEPTH_VERSION\}\.js\?v=\$\{APP_VERSION\}`/.test(pwa),'question generator is not cache-busted with app version');
check(/js\/pwa\.js\?v=3\.33\.7/.test(html),'release loader is not cache-busted');
check(/PA_APP_VERSION='3\.33\.7'/.test(version),'app version is not 3.33.7');
console.log('PASS bunga-finisher-numberline-v3.33.7');
