const fs=require('fs'),assert=require('assert');

const assetPath='assets/heroes/wira-chibi/frames/ice-combo-spritesheet-v2.webp';
const image=fs.readFileSync(assetPath);
assert.equal(image.toString('ascii',0,4),'RIFF','attack asset must remain a WebP');
assert.equal(image.toString('ascii',8,12),'WEBP','attack asset must remain a WebP');
assert.equal(image.toString('ascii',12,16),'VP8X','attack asset must retain alpha-capable dimensions');
const uint24le=offset=>image[offset]|(image[offset+1]<<8)|(image[offset+2]<<16);
assert.equal(uint24le(24)+1,2560,'sprite sheet width changed');
assert.equal(uint24le(27)+1,1024,'sprite sheet height changed');

const motion=fs.readFileSync('js/combat-motion-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
assert(motion.includes('const chibiAttackPivotX=['),'per-frame body pivots missing');
assert(motion.includes('const chibiAttackFootY=['),'per-frame foot pivots missing');
assert(motion.includes('top=p.y-height*chibiAttackFootY[frame]'),'attack is not grounded to measured feet');
assert(motion.includes("brightness(1.01) saturate(1.06)"),'attack colour correction missing');
assert(sw.includes(assetPath),'sprite sheet missing from app shell');
assert(index.includes('js/combat-motion-v1.js?v=3.62.24'),'renderer cache-bust missing');
assert(index.includes('js/version.js?v=3.62.24')&&index.includes('js/pwa.js?v=3.62.24'),'release cache-bust missing');
assert(version.includes("PA_APP_VERSION='3.62.24'"),'release version missing');
console.log('PASS: Wira Chibi attack palette, body pivots, baseline and release wiring');
