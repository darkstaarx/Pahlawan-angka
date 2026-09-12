const fs=require('fs'),assert=require('assert');

const assetPath='assets/heroes/wira-chibi/frames/ice-combo-spritesheet-v2.webp';
const image=fs.readFileSync(assetPath);
assert.equal(image.toString('ascii',0,4),'RIFF','redrawn attack asset must be WebP');
assert.equal(image.toString('ascii',8,12),'WEBP','redrawn attack asset must be WebP');
assert.equal(image.toString('ascii',12,16),'VP8X','redrawn attack asset must retain alpha');
const uint24le=offset=>image[offset]|(image[offset+1]<<8)|(image[offset+2]<<16);
assert.equal(uint24le(24)+1,2560,'redrawn sheet width changed');
assert.equal(uint24le(27)+1,1024,'redrawn sheet height changed');

const motion=fs.readFileSync('js/combat-motion-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
assert(motion.includes(`chibiAttackSheetPath='${assetPath}'`),'renderer is not using the redrawn sheet');
assert(motion.includes('height=p.h*1.25'),'redrawn sheet scale calibration missing');
assert(motion.includes('const chibiAttackPivotX=[.455'),'redrawn frame pivots missing');
assert(sw.includes(assetPath),'redrawn sheet missing from app shell');
assert(index.includes('js/combat-motion-v1.js?v=3.62.24'),'renderer cache-bust missing');
assert(index.includes('js/version.js?v=3.62.24')&&index.includes('js/pwa.js?v=3.62.24'),'release cache-bust missing');
assert(version.includes("PA_APP_VERSION='3.62.24'"),'release version missing');
console.log('PASS: Wira Chibi production redraw, alpha sheet, scale, pivots and release wiring');
