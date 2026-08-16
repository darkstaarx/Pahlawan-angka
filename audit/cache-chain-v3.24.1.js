const fs=require('fs'),assert=require('assert');
const root=process.argv[2]||'.';
const read=p=>fs.readFileSync(`${root}/${p}`,'utf8');

const index=read('index.html');
const pwa=read('js/pwa.js');
const sw=read('sw.js');
const pm=read('js/profile-manager-v3.24.1.js');

assert(/js\/pwa\.js\?v=3\.24\.1/.test(index),'index still loads stale pwa cache key');
assert(!/js\/pwa\.js\?v=3\.18\.0/.test(index),'old pwa 3.18.0 cache key remains');
assert(/APP_VERSION='3\.24\.1'/.test(pwa),'APP_VERSION not 3.24.1');
assert(/PROFILE_MANAGER_VERSION='3\.24\.1'/.test(pwa),'profile version not 3.24.1');
assert(/profile-manager-v\$\{PROFILE_MANAGER_VERSION\}/.test(pwa),'profile filename is not version-driven');
assert(/CACHE_NAME='pahlawan-angka-v3\.24\.1'/.test(sw),'SW cache not bumped');
assert(/cache:'reload'/.test(sw),'SW does not force fresh requests');
assert(/clients\.map\(client=>client\.navigate\(client\.url\)/.test(sw),'one-time activation refresh missing');
assert(/profile-manager-v3\.24\.1\.js/.test(sw),'new profile JS absent from app shell');
assert(/profile-manager-v3\.24\.1\.css/.test(sw),'new profile CSS absent from app shell');
assert(/const VERSION='3\.24\.1'/.test(pm),'profile manager internal version not bumped');
assert(/profile-happy-v1\.webp/.test(pm),'approved happy portraits not wired');
assert(!/Portrait sementara menggunakan art production asal/.test(pm),'old temporary helper wording remains');

console.log('PASS v3.24.1: cache chain fully versioned and happy portraits wired');
