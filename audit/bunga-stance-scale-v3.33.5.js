const fs=require('fs');
const css=fs.readFileSync('css/hero-pose-normalization-v3.8.31.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('js/version.js','utf8');

function check(ok,message){ if(!ok) throw new Error(message); }

check(/body\.hero-bunga #game #hero \.hero-frame-idle\s*\{[^}]*scale\(1\.06\)/s.test(css),'Bunga idle scale is not 1.06');
check(/body\.hero-bunga #game #hero \.hero-frame-anticipation\s*\{[^}]*scale\(1\.06\)/s.test(css),'Bunga attack stance does not match idle scale 1.06');
check(/hero-pose-normalization-v3\.8\.31\.css\?v=3\.33\.5/.test(html),'Bunga stance stylesheet is not cache-busted');
check(/PA_APP_VERSION='3\.33\.5'/.test(version),'app version is not 3.33.5');
console.log('PASS bunga-stance-scale-v3.33.5');
