const fs=require('fs'),assert=require('assert');

const assetPath='assets/heroes/wira-chibi/frames/ice-combo-spritesheet-v2.webp';
const image=fs.readFileSync(assetPath);
assert.equal(image.toString('ascii',0,4),'RIFF','attack asset must remain a WebP');
assert.equal(image.toString('ascii',8,12),'WEBP','attack asset must remain a WebP');
assert.equal(image.toString('ascii',12,16),'VP8X','attack asset must expose its extended dimensions');
const uint24le=offset=>image[offset]|(image[offset+1]<<8)|(image[offset+2]<<16);
assert.equal(uint24le(24)+1,2560,'clean sprite sheet width changed');
assert.equal(uint24le(27)+1,1024,'clean sprite sheet height changed');

const motion=fs.readFileSync('js/combat-motion-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
assert(motion.includes("chibiAttackGrid={columns:5,rows:4,frames:17,frameMs:70}"),'17-frame grid contract missing');
assert(motion.includes("key==='wirachibi'?chibiContact:470"),'Wira Chibi contact timing is not isolated');
assert(motion.includes("if(hasPet&&key==='wira')return null"),'Wira Chibi pet-first route is not enabled');
assert(motion.includes('drawChibiAttack(hero,t,a.min)'),'sprite attack is not rendered');
assert(sw.includes(assetPath),'sprite sheet missing from app shell');
assert(index.includes('js/combat-motion-v1.js?v=3.62.24'),'renderer cache-bust missing');
assert(index.includes('js/version.js?v=3.62.24')&&index.includes('js/pwa.js?v=3.62.24'),'release cache-bust missing');
assert(version.includes("PA_APP_VERSION='3.62.24'"),'release version missing');
console.log('PASS: Wira Chibi 17-frame ice combo asset, timing, pet route and release wiring');
