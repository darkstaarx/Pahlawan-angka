// Produce a static development artifact, without Git metadata, tools or secrets.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.jelajah-publish');
fs.mkdirSync(out,{recursive:true});
for(const name of ['assets','js','css','data','questions','lessons','preview'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
for(const name of fs.readdirSync(root))if(/\.html$/.test(name))fs.copyFileSync(path.join(root,name),path.join(out,name));
// The preview root is the guest grade selector; real account routes remain in offer.
fs.copyFileSync(path.join(root,'demo-jelajah.html'),path.join(out,'index.html'));
fs.writeFileSync(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n');
fs.writeFileSync(path.join(out,'sw.js'),"self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',event=>event.waitUntil(self.registration.unregister()));");
console.log(out);
