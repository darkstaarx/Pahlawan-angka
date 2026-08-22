const fs=require('fs');
const css=fs.readFileSync('css/hero-pose-normalization-v3.8.31.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('js/version.js','utf8');

function check(ok,message){ if(!ok) throw new Error(message); }

check(/body\.hero-bunga #game #hero \.hero-frame-idle\s*\{[^}]*scale\(1\.06\)/s.test(css),'Bunga idle scale changed unexpectedly');
check(/body\.hero-bunga #game #hero \.hero-frame-anticipation\s*\{[^}]*scale\(1\.39\)/s.test(css),'Bunga stance is not compensated for internal canvas padding');
check(/hero-pose-normalization-v3\.8\.31\.css\?v=3\.33\.6/.test(html),'stance stylesheet is not cache-busted');
check(/PA_APP_VERSION='3\.33\.6'/.test(version),'app version is not 3.33.6');
console.log('PASS bunga-visible-body-scale-v3.33.6');
