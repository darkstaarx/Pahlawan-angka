const fs=require('fs');
const commercial=fs.readFileSync('js/commercial-foundation-v3.25.0.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};

check(/const canUseDev=\(\)=>access\.role==='admin'/.test(commercial),'DEV access is not tied to the server-backed admin role');
check(/if\(!canUseDev\(\)&&count>=Number\(access\.profile_limit\|\|1\)&&!premium\(\)\)/.test(commercial),'admin does not bypass the profile limit or ordinary users bypass it too');
check(!/db\.devMode[^\n]*profile_limit|profile_limit[^\n]*db\.devMode/.test(commercial),'local DEV toggle incorrectly bypasses the profile limit');
const match=version.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/),parts=match?match.slice(1).map(Number):[];
check(parts.length===3&&(parts[0]>3||parts[0]===3&&(parts[1]>32||parts[1]===32&&parts[2]>=3)),'app version predates the unlimited-admin-profile feature');
check(/commercial-foundation-v3\.25\.0\.js\?v=3\.32\.[3-9]\d*/.test(html),'commercial access script is not cache-busted to an admin-profile-limit revision');

console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
