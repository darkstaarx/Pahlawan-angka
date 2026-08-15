const fs=require('fs'),assert=require('assert');
const sw=fs.readFileSync('sw.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const versions=fs.readdirSync('.').map(name=>name.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean)
  .map(match=>({text:`${match[1]}.${match[2]}.${match[3]}`,parts:match.slice(1).map(Number)}))
  .sort((a,b)=>a.parts[0]-b.parts[0]||a.parts[1]-b.parts[1]||a.parts[2]-b.parts[2]);
assert(versions.length,'No BUILD-x.y.z.md release marker found');
const expected=versions.at(-1).text;
const readConst=name=>pwa.match(new RegExp(`const ${name}='(\\d+\\.\\d+\\.\\d+)'`))?.[1];
const appVersion=readConst('APP_VERSION'),integrityVersion=readConst('INTEGRITY_VERSION'),sensoryVersion=readConst('SENSORY_VERSION'),manipVersion=readConst('MANIPULATIVE_VERSION'),dailyVersion=readConst('DAILY_REVIEW_VERSION'),worldVersion=readConst('WORLD_RESPONSE_VERSION'),devVersion=readConst('DEV_EXPERIMENTS_VERSION');
const cache=sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)(?:-[^']+)?'/)?.[1];
assert.equal(appVersion,expected,`PWA app version ${appVersion||'missing'} != build ${expected}`);
assert.equal(cache,expected,`Service-worker cache ${cache||'missing'} != build ${expected}`);
assert.equal(integrityVersion,'3.18.1','Curriculum integrity layer changed unexpectedly');
assert.equal(sensoryVersion,'3.19.0','Sensory foundation layer changed unexpectedly');
assert.equal(manipVersion,'3.19.1','Cikgu manipulative layer changed unexpectedly');
assert.equal(dailyVersion,'3.20.0','Daily review layer changed unexpectedly');
assert.equal(worldVersion,'3.21.0','World response learning layer changed unexpectedly');
assert.equal(devVersion,expected,`Dev experiments release ${devVersion||'missing'} != build ${expected}`);
const paths=[`questions/kssr-content-integrity-v${integrityVersion}.js`,`js/sensory-learning-v${sensoryVersion}.js`,`js/cikgu-manipulatives-v${manipVersion}.js`,`js/daily-spaced-review-v${dailyVersion}.js`,`js/world-response-v${worldVersion}.js`,`js/dev-experiments-v${devVersion}.js`];
for(const path of paths)assert(fs.existsSync(path),`Missing ${path}`);
const dev=fs.readFileSync(paths[5],'utf8');
assert.equal(dev.match(/const VERSION='(\d+\.\d+\.\d+)'/)?.[1],expected,'Dev experiment module/version mismatch');
assert(/Pahlawan Angka · v\$\{VERSION\}/.test(dev),'Current patch does not control runtime version label');
assert(new RegExp(`dev-experiments-v${expected.replace(/\./g,'\\.')}`).test(sw),'SW missing current dev experiment module');
console.log(`PASS version sync: app v${expected}; integrity v${integrityVersion}; sensory v${sensoryVersion}; manipulatives v${manipVersion}; daily v${dailyVersion}; world v${worldVersion}; dev experiments v${devVersion}`);
