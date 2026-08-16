const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('js/dev-boss-lab-v3.21.4.js','utf8');
const css=fs.readFileSync('css/boss-stage-dev-v3.21.4.css','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert(/devBossTest:true/.test(js),'DEV boss session flag missing');
assert(/regularMissionQuestions\|\|9/.test(js),'Boss jump does not skip minion phase');
assert(/return \{tier:'boss',chapter:String\(sess\.devBossChapter\)\}/.test(js),'Boss-stage override missing');
assert(/devBankTest:true/.test(js),'DEV bank-test protection missing');
assert(/Jump Terus Boss/.test(js),'DEV boss button missing');
assert(/--pa-boss-stage-extra-w:54px/.test(css),'Boss common scale increase missing');
assert(/--pa-boss-stage-inset:24px/.test(css),'Boss inward staging missing');
assert(/BOSS_LAB_VERSION='3\.21\.4'/.test(pwa),'PWA boss lab version missing');
assert(/dev-boss-lab-v3\.21\.4\.js/.test(sw)&&/boss-stage-dev-v3\.21\.4\.css/.test(sw),'SW boss lab assets missing');
assert(!/world-response-v3\.21\.0/.test(pwa+sw),'World Response returned');
console.log('PASS v3.21.4: boss scale/inward staging + DEV direct boss jump');
