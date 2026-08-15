const fs=require('fs'),assert=require('assert');
const audio=fs.readFileSync('js/audio.js','utf8'),sw=fs.readFileSync('sw.js','utf8'),license=fs.readFileSync('assets/audio/forest-battle-ambience.LICENSE.txt','utf8');
const asset='assets/audio/forest-battle-ambience.mp3',size=fs.statSync(asset).size;
assert(size>500000&&size<800000,'forest ambience should be a real compressed recording under 800 KB');
assert(audio.includes(`new Audio('${asset}')`)&&audio.includes('forest.loop=true'),'forest recording must loop through the battle audio lifecycle');
assert(audio.includes("activeMode==='ambient'?.5")&&audio.includes("activeMode==='boss'?.28"),'mobile playback levels must be clearly audible and duck during bosses');
assert(sw.includes(`'./${asset}'`),'forest ambience must be available offline');
assert(license.includes('TinyWorlds')&&license.includes('CC0 1.0'),'source and CC0 license must be documented');
console.log('PASS forest ambience: real CC0 loop, mobile volume, boss ducking and offline cache');
