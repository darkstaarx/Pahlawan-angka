const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

assert.equal(manifest.name,'Pahlawan Angka');
assert.equal(manifest.display,'standalone');
assert.equal(manifest.orientation,'portrait-primary');
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
for(const size of ['192x192','512x512'])assert(manifest.icons.some(icon=>icon.sizes===size&&icon.purpose==='any'),`missing ${size}`);
assert(manifest.icons.some(icon=>icon.sizes==='512x512'&&icon.purpose==='maskable'),'missing maskable');
for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)),`missing ${icon.src}`);

assert(/rel="manifest" href="manifest\.webmanifest\?v=3\.9\.0"/.test(html));
assert(/apple-touch-icon/.test(html));
assert(/Pahlawan Angka · v3\.9\.0/.test(html));
assert(/brandMark[\s\S]*pa-64\.png\?v=3\.8\.31/.test(html));
assert(html.includes('⚔ 1-Hit Kill: OFF'),'functional Dev sword removed');
assert(html.includes('hubQuickIcon">⚔'),'functional mission sword removed');

const shellMatch=sw.match(/const APP_SHELL=\[([\s\S]*?)\];/);
assert(shellMatch,'app shell missing');
const shell=vm.runInNewContext(`[${shellMatch[1]}]`);
for(const url of shell){
  if(url==='./')continue;
  const clean=url.replace(/^\.\//,'').split('?')[0];
  assert(fs.existsSync(path.join(root,clean)),`cached path missing: ${url}`);
}
assert(sw.includes("pahlawan-angka-v3.9.0"));
assert(/event\.request\.mode==='navigate'/.test(sw));
assert(/ignoreSearch:true/.test(sw));
console.log(JSON.stringify({status:'pass',version:'3.9.0',installable:true,offlineShellFiles:shell.length,icons:manifest.icons.map(x=>`${x.sizes}:${x.purpose}`),functionalSwordIconsPreserved:true},null,2));
