#!/usr/bin/env node
/* Rebuild only after asset/dependency changes, on a LOCAL checkout.
 * Every entry is hashed against real source bytes; missing paths are fatal.
 * Manifest is NOT release-approved without browser QA A-I.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const cwd=process.cwd(),get=p=>fs.readFileSync(path.join(cwd,p));
const sw=get('sw.js').toString('utf8'),pos=sw.indexOf('const CORE_FILES=');
if(pos<0)throw Error('Offline core service worker missing');
const match=/const CORE_FILES=(\[[^\n]*\]);/.exec(sw.slice(pos,pos+35000));
if(!match)throw Error('Core URL inventory not found');
const core=JSON.parse(match[1]).filter(u=>u.startsWith('./'));
const src=JSON.parse(get('offline/offline-media-inventory-v1.json').toString());
if(src.schema!==1||!Array.isArray(src.files))throw Error('Offline media inventory invalid');
const allowedExtensions=/\.(?:js|css|html|webmanifest|png|webp|svg|jpg|jpeg|gif|mp3|wav|mp4)$/i;
function walk(dir){
 if(!fs.existsSync(dir))return [];
 let out=[];
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=path.posix.join(dir,item.name);
  if(item.isDirectory())out.push(...walk(rel));
  else if(item.isFile())out.push(rel);
 }
 return out;
}
const runtimeCode=[...walk('js'),...walk('css'),...walk('questions'),...walk('data'),'index.html'];
const referenced=new Set();
for(const file of runtimeCode){
 if(!/\.(?:js|css|html)$/.test(file))continue;
 const content=get(file).toString('utf8');
 for(const m of content.matchAll(/assets\/[a-zA-Z0-9_.+/-]+\.(?:png|webp|svg|jpg|jpeg|gif|mp3|wav|mp4)/gi)){
  // Remove accidental suffixes in generated template paths; any unresolved
  // dynamic file is an audit issue, not a silent runtime guarantee.
  if(!m[0].includes('..')&&fs.existsSync(path.join(cwd,m[0])))referenced.add(m[0]);
 }
}
const always=[...core.map(s=>s.replace(/^\.\//,'')),...src.files.map(f=>f.path),...referenced,
 'js/vendor/three.module.min.js','assets/icons/pahlawan-angka-crest-192.png'];
const known=new Set();
const common=always.filter(f=>{
 if(!f||f.includes('?')||f.includes('#')||!allowedExtensions.test(f))return false;
 if(!fs.existsSync(path.join(cwd,f)))throw Error('Missing offline asset: '+f);
 if(known.has(f))return false;
 known.add(f);return true;
});
const version=/PA_APP_VERSION='([^']+)'/.exec(get('js/version.js').toString('utf8'))?.[1];
if(!version)throw Error('App version unavailable');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(let grade=1;grade<=6;grade++){
 // Content currently shares pet, battle, animation and audio assets across grades.
 // Drop only clearly other-grade question media; shared graphics stay included.
 const active=common.filter(f=>!/^assets\/questions\/d[1-6]\//.test(f)||
   f.startsWith('assets/questions/d'+grade+'/'));
 const files=active.map(f=>{
  const data=get(f);
  return {path:'./'+f,bytes:data.length,sha256:sha(data)};
 });
 const fingerprint=sha(files.map(f=>f.path+':'+f.sha256).join('|')).slice(0,12);
 const doc={schema:1,version:'g'+grade+'-'+version+'-'+fingerprint,
  grade,scopes:['core'],files};
 const output=path.join(cwd,'offline','manifests','darjah-'+grade+'.json');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(doc,null,2)+'\n');
 console.log('Darjah',grade,'files',files.length,'raw bytes',files.reduce((n,x)=>n+x.bytes,0),'manifest',doc.version);
}
console.log('WARNING: Generated manifests require live browser offline-path coverage QA before release.');
