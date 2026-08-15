const fs=require('fs'),assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const versions=fs.readdirSync('.').map(name=>name.match(/^BUILD-(\d+)\.(\d+)\.(\d+)\.md$/)).filter(Boolean)
  .map(match=>({text:`${match[1]}.${match[2]}.${match[3]}`,parts:match.slice(1).map(Number)}))
  .sort((a,b)=>a.parts[0]-b.parts[0]||a.parts[1]-b.parts[1]||a.parts[2]-b.parts[2]);

assert(versions.length,'No BUILD-x.y.z.md release marker found');
const expected=versions.at(-1).text;
const display=html.match(/Pahlawan Angka · v(\d+\.\d+\.\d+)/)?.[1];
const cache=sw.match(/CACHE_NAME='pahlawan-angka-v(\d+\.\d+\.\d+)(?:-[^']+)?'/)?.[1];
const pwa=html.match(/js\/pwa\.js\?v=(\d+\.\d+\.\d+)(?:-[^"']+)?/)?.[1];

assert.equal(display,expected,`Main-page version ${display||'missing'} != build ${expected}`);
assert.equal(cache,expected,`Service-worker cache ${cache||'missing'} != build ${expected}`);
assert.equal(pwa,expected,`PWA refresh token ${pwa||'missing'} != build ${expected}`);
console.log(`PASS version sync: v${expected} (display, cache, PWA token)`);
