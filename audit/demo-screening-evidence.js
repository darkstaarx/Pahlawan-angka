'use strict';
const assert=require('assert'),fs=require('fs');
const demo=fs.readFileSync('js/demo-mode-v3.56.0.js','utf8');
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const css=fs.readFileSync('css/demo-mode-v3.56.0.css','utf8');

assert.match(demo,/Pilih Darjah/);
assert.match(demo,/const grades=\[1,2,3,4,5,6\]/);
assert.match(demo,/Darjah \$\{grade\}/);
assert.match(demo,/openSegelDemo\(\{guestDemo:true\}\)/);
assert.match(demo,/demoMode:true/);
assert.match(demo,/restoreGuest/);
assert.doesNotMatch(demo,/paDemoHeroes|PADemo\.hero|applyHeroToBattle\(\)|nextQ\(\)|battle\(\)|screen\('game'\)/);
assert.doesNotMatch(css,/paDemoHeroes/);
assert.match(segel,/entryMode\?\.guestDemo/);
assert.match(segel,/window\.PADemo\?\.restoreGuest\?\.\(\)/);
console.log('PASS: grade-only guest demo enters Segel and restores state on exit.');
