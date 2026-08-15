const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('css/pet-staging-v3.14.3.css','utf8'),rewards=fs.readFileSync('js/rewards-v2.js','utf8'),progression=fs.readFileSync('js/progression.js','utf8');
assert(html.includes('pet-staging-v3.14.3.css?v=3.14.3'),'pet staging override must load last');
assert(css.includes('left:-30px!important')&&css.includes('left:-38px!important'),'pet and rabbit need independent rear-left slots');
assert(css.includes('--pa-pet-box:68px'),'rabbit must be larger than the default pet');
assert(css.includes('battle-pet-attack{width:154%!important'),'landscape attack art must be pose-normalised');
assert(rewards.includes("battleScale:1.14")&&rewards.includes("id:'arif'"),'rabbit art scale must be explicit');
assert(css.includes('.loadoutThumb.equipped::after')&&progression.includes("classList.toggle('equipped'"),'hub portraits need an active marker');
console.log('PASS pet staging: separate slot, larger rabbit, normalised attacks and profile loadout');
