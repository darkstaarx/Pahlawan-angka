const fs=require('fs'),assert=require('assert');
const sw=fs.readFileSync('sw.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const versions=fs.readdirSync('.').map(name=>name.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean)
  .map(match=>({text:`${match[1]}.${match[2]}.${match[3]}`,parts:match.slice(1).map(Number)}))
  .sort((a,b)=>a.parts[0]-b.parts[0]||a.parts[1]-b.parts[1]||a.parts[2]-b.parts[2]);
assert(versions.length,'No BUILD-x.y.z.md release marker found');
const expected=versions.at(-1).text;
const readConst=name=>pwa.match(new RegExp(`const ${name}='(\\d+\\.\\d+\\.\\d+)'`))?.[1];
const appVersion=readConst('APP_VERSION'),integrityVersion=readConst('INTEGRITY_VERSION'),sensoryVersion=readConst('SENSORY_VERSION'),manipVersion=readConst('MANIPULATIVE_VERSION');
const cache=sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)(?:-[^']+)?'/)?.[1];
assert.equal(appVersion,expected,`PWA app version ${appVersion||'missing'} != build ${expected}`);
assert.equal(cache,expected,`Service-worker cache ${cache||'missing'} != build ${expected}`);
assert.equal(manipVersion,expected,`Manipulative release ${manipVersion||'missing'} != build ${expected}`);
const integrityPath=`questions/kssr-content-integrity-v${integrityVersion}.js`,sensoryPath=`js/sensory-learning-v${sensoryVersion}.js`,manipPath=`js/cikgu-manipulatives-v${manipVersion}.js`;
for(const path of [integrityPath,sensoryPath,manipPath])assert(fs.existsSync(path),`Missing ${path}`);
const sensory=fs.readFileSync(sensoryPath,'utf8'),manip=fs.readFileSync(manipPath,'utf8');
assert.equal(sensory.match(/const VERSION='(\d+\.\d+\.\d+)'/)?.[1],sensoryVersion,'Sensory module/version mismatch');
assert.equal(manip.match(/const VERSION='(\d+\.\d+\.\d+)'/)?.[1],expected,'Manipulative module/version mismatch');
assert(/Pahlawan Angka · v\$\{VERSION\}/.test(manip),'Current release does not control runtime version label');
assert(new RegExp(`sensory-learning-v${sensoryVersion.replace(/\./g,'\\.')}`).test(sw),'SW missing sensory module');
assert(new RegExp(`cikgu-manipulatives-v${expected.replace(/\./g,'\\.')}`).test(sw),'SW missing current manipulative module');
console.log(`PASS version sync: app v${expected}; integrity v${integrityVersion}; sensory v${sensoryVersion}; manipulatives v${manipVersion}`);
