const fs=require('fs'),assert=require('assert');
const pwa=fs.readFileSync('js/pwa.js','utf8'),sw=fs.readFileSync('sw.js','utf8');
const versions=fs.readdirSync('.').map(n=>n.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean).map(m=>({v:`${m[1]}.${m[2]}.${m[3]}`,p:m.slice(1).map(Number)})).sort((a,b)=>a.p[0]-b.p[0]||a.p[1]-b.p[1]||a.p[2]-b.p[2]);assert(versions.length);const expected=versions.at(-1).v;
const c=n=>pwa.match(new RegExp(`const ${n}='(\\d+\\.\\d+\\.\\d+)'`))?.[1];
assert.equal(c('APP_VERSION'),expected);assert.equal(c('FINISHER_HOTSPOT_VERSION'),expected);assert.equal(c('TARGET_ANCHOR_VERSION'),'3.21.5');assert.equal(c('BOSS_LAB_VERSION'),'3.21.4');assert.equal(c('COMBAT_POLISH_VERSION'),'3.21.3');
assert.equal(sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)'/)?.[1],expected);assert(!/world-response-v3\.21\.0/.test(pwa+sw));
console.log(`PASS version sync v${expected}`);
