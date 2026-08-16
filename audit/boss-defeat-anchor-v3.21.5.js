const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('js/combat-defeat-anchor-v3.21.5.js','utf8');
const css=fs.readFileSync('css/combat-defeat-anchor-v3.21.5.css','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert(/activeEnemyFrame/.test(js),'active rendered frame lookup missing');
assert(/getBoundingClientRect\(\)/.test(js),'rendered rectangle snapshot missing');
assert(/frameRect\.left-arenaRect\.left/.test(js),'arena-relative x anchoring missing');
assert(/frameRect\.top-arenaRect\.top/.test(js),'arena-relative y anchoring missing');
assert(/window\.triggerMonsterDefeat=createAnchoredDefeat/.test(js),'old defeat trigger not replaced');
assert(/enemy\.querySelectorAll\('\.monster-defeat-layer'\)/.test(js),'legacy wrapper defeat cleanup missing');
assert(/paDefeatSourceCrack/.test(css),'in-place source flash missing');
assert(!/@keyframes\s+paDefeatFrameFlash[^}]*transform:/s.test(css),'source crack must not overwrite transform');
assert(/DEFEAT_ANCHOR_VERSION='3\.21\.5'/.test(pwa),'loader version missing');
assert(/combat-defeat-anchor-v3\.21\.5/.test(sw),'SW defeat layer missing');
console.log('PASS v3.21.5: boss defeat shatter is anchored to the currently rendered frame rectangle');
