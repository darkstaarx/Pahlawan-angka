const fs=require('fs'),assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const versions=fs.readdirSync('.').map(name=>name.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean)
  .map(match=>({text:`${match[1]}.${match[2]}.${match[3]}`,parts:match.slice(1).map(Number)}))
  .sort((a,b)=>a.parts[0]-b.parts[0]||a.parts[1]-b.parts[1]||a.parts[2]-b.parts[2]);

assert(versions.length,'No BUILD-x.y.z.md release marker found');
const expected=versions.at(-1).text;
const cache=sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)(?:-[^']+)?'/)?.[1];
const guardTarget=pwa.match(/kssr-content-integrity-v(\d+\.\d+\.\d+)\.js/)?.[1];
assert(guardTarget,'PWA loader does not declare a content-integrity guard');
const guardPath=`questions/kssr-content-integrity-v${guardTarget}.js`;
assert(fs.existsSync(guardPath),`Missing ${guardPath}`);
const guard=fs.readFileSync(guardPath,'utf8');
const guardVersion=guard.match(/PAContentIntegrity=\{version:'(\d+\.\d+\.\d+)'/)?.[1];
const runtimeDisplay=guard.match(/textContent='Pahlawan Angka · v(\d+\.\d+\.\d+)'/)?.[1];

assert(/js\/pwa\.js(?:\?v=[^"']+)?/.test(html),'index.html does not load js/pwa.js');
assert.equal(cache,expected,`Service-worker cache ${cache||'missing'} != build ${expected}`);
assert.equal(guardTarget,expected,`PWA integrity target ${guardTarget||'missing'} != build ${expected}`);
assert.equal(guardVersion,expected,`Integrity guard ${guardVersion||'missing'} != build ${expected}`);
assert.equal(runtimeDisplay,expected,`Runtime display ${runtimeDisplay||'missing'} != build ${expected}`);
console.log(`PASS version sync: v${expected} (SW cache, PWA guard, runtime display)`);
