const fs=require('fs'),assert=require('assert');
const sw=fs.readFileSync('sw.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const sensoryPath='js/sensory-learning-v3.19.0.js';
const versions=fs.readdirSync('.').map(name=>name.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean)
  .map(match=>({text:`${match[1]}.${match[2]}.${match[3]}`,parts:match.slice(1).map(Number)}))
  .sort((a,b)=>a.parts[0]-b.parts[0]||a.parts[1]-b.parts[1]||a.parts[2]-b.parts[2]);
assert(versions.length,'No BUILD-x.y.z.md release marker found');
const expected=versions.at(-1).text;
const cache=sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)(?:-[^']+)?'/)?.[1];
const appVersion=pwa.match(/const APP_VERSION='(\d+\.\d+\.\d+)'/)?.[1];
const guardTarget=pwa.match(/const INTEGRITY_VERSION='(\d+\.\d+\.\d+)'/)?.[1];
assert(guardTarget,'PWA loader does not declare integrity version');
const guardPath=`questions/kssr-content-integrity-v${guardTarget}.js`;
assert(fs.existsSync(guardPath),`Missing ${guardPath}`);
assert(fs.existsSync(sensoryPath),`Missing ${sensoryPath}`);
const sensory=fs.readFileSync(sensoryPath,'utf8');
const sensoryVersion=sensory.match(/const VERSION='(\d+\.\d+\.\d+)'/)?.[1];
const runtimeDisplay=sensory.match(/Pahlawan Angka · v\$\{VERSION\}/)?expected:null;
assert.equal(cache,expected,`Service-worker cache ${cache||'missing'} != build ${expected}`);
assert.equal(appVersion,expected,`PWA app version ${appVersion||'missing'} != build ${expected}`);
assert.equal(sensoryVersion,expected,`Sensory release ${sensoryVersion||'missing'} != build ${expected}`);
assert(runtimeDisplay,'Runtime display version is not controlled by current release layer');
console.log(`PASS version sync: app v${expected}; curriculum integrity v${guardTarget}`);
