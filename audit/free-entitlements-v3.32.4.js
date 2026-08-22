const fs=require('fs');
const commercial=fs.readFileSync('js/commercial-foundation-v3.25.0.js','utf8');
const tools=fs.readFileSync('js/parent-learning-tools-v3.26.0.js','utf8');
const schema=fs.readFileSync('supabase/schema/commercial_free_limits_v2.sql','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};

check(/profile_limit:1/.test(commercial)&&/access\.profile_limit\|\|1/.test(commercial),'free frontend profile limit is not one');
check(/else 1\s+end/.test(schema),'Supabase commercial function does not return one profile for free access');
check(/s\.plan='premium' then 2/.test(schema)&&/s\.plan='family_plus' then 5/.test(schema),'paid profile limits changed unexpectedly');
check(/const worksheetLimit=\(\)=>allowed\(\)\?40:10/.test(tools),'worksheet plan limits are not 10 free / 40 paid');
check(/if\(state\.busy\)return;state\.count=Math\.min\(state\.count,worksheetLimit\(\)\)/.test(tools),'worksheet generator does not enforce the plan limit');
check(!/if\(!gate\(\)\|\|state\.busy\)return;state\.busy=true;status\('Cikgu Dimensi sedang menyusun worksheet/.test(tools),'free worksheet remains behind the old hard paywall');
check(/button\.disabled=!full&&n>10/.test(tools),'free worksheet picker does not disable counts above ten');
check(/PA_APP_VERSION='3\.32\.4'/.test(version),'app version is not 3.32.4');
check(/parent-learning-tools-v3\.26\.0\.js\?v=3\.32\.4/.test(html),'worksheet tool is not cache-busted');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
