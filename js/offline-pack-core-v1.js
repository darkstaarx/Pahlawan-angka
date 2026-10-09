/* Staged only. NO UI wiring: offline entitlements and sync must be verified before launch. */
(function(root){
'use strict';
const PREFIX='pa-offline-pack-v1-',MARK='__offline_pack_ready_v1';
let busy=false;
const fail=(m)=>{throw Error(m)};
function manifest(raw){
 if(!raw||raw.schema!==1||!/^[a-z0-9._-]{1,64}$/i.test(raw.version||''))fail('Manifest tidak sah');
 if(!Array.isArray(raw.scopes)||!raw.scopes.length||!Array.isArray(raw.files)||!raw.files.length)fail('Scope/fail kosong');
 const seen=new Set();
 const files=raw.files.map(f=>{
  if(!f||typeof f.path!=='string')fail('Laluan fail tidak sah');
  const u=new URL(f.path,root.location.href);
  if(u.origin!==root.location.origin||seen.has(u.href)||/\/(?:auth|rest|functions|api)\//.test(u.pathname))fail('Fail tidak dibenarkan');
  seen.add(u.href);
  const bytes=Number(f.bytes||0);
  if(!Number.isSafeInteger(bytes)||bytes<0)fail('Saiz fail tidak sah');
  if(f.sha256&&!/^[a-f\d]{64}$/i.test(f.sha256))fail('Checksum tidak sah');
  return {url:u.href,bytes,sha256:f.sha256||null};
 });
 return {version:raw.version,scopes:raw.scopes,files,estimatedBytes:files.reduce((a,f)=>a+f.bytes,0)};
}
const metaURL=()=>new URL(MARK,root.location.href).href;
async function inspect(raw){
 const m=manifest(raw),cache=await caches.open(PREFIX+m.version),receipt=await cache.match(metaURL());
 if(!receipt?.ok)return {ready:false,estimatedBytes:m.estimatedBytes,total:m.files.length};
 let old;try{old=await receipt.json()}catch(_){return {ready:false}}
 if(old.version!==m.version||old.files.length!==m.files.length)return {ready:false};
 for(const file of m.files){
  if(!old.files.some(x=>x.url===file.url&&x.sha256===file.sha256))return {ready:false};
  if(!(await cache.match(file.url))?.ok)return {ready:false};
 }
 return {ready:true,estimatedBytes:m.estimatedBytes,total:m.files.length};
}
const digest=async body=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',body)),b=>b.toString(16).padStart(2,'0')).join('');
async function reuseFromOlder(file,currentName){
 if(!file.sha256)return null;
 const keys=await caches.keys();
 for(const key of keys){
  if(!key.startsWith(PREFIX)||key===currentName)continue;
  const c=await caches.open(key),marker=await c.match(metaURL());
  if(!marker?.ok)continue;
  let manifest;try{manifest=await marker.json()}catch(_){continue}
  if(!manifest?.files?.some(f=>f.url===file.url&&f.sha256===file.sha256))continue;
  const content=await c.match(file.url);
  if(content?.ok&&await digest(await content.clone().arrayBuffer())===file.sha256)return content;
 }
 return null;
}
async function start(raw,{verifyEntitlement,signal,onProgress}={}){
 if(busy)fail('Muat turun sedang berjalan');
 const m=manifest(raw);
 if(typeof verifyEntitlement!=='function')fail('Pengesahan entitlement diperlukan');
 if(root.navigator.onLine===false)fail('Internet diperlukan untuk muat turun');
 const a=await verifyEntitlement();
 if(!a?.verified||!a.userId||!Array.isArray(a.scopes)||!m.scopes.every(s=>a.scopes.includes(s)))fail('Akses tidak disahkan');
 busy=true;let done=0,networkBytes=0;
 const emit=stage=>onProgress?.({stage,done,total:m.files.length,networkBytes,estimatedBytes:m.estimatedBytes});
 try{
  const cache=await caches.open(PREFIX+m.version);
  if((await inspect(raw)).ready)return {ready:true,reused:true,networkBytes:0};
  emit('downloading');
  for(const f of m.files){
   if(signal?.aborted)fail('Muat turun dihentikan');
   const old=await cache.match(f.url);
   if(old?.ok&&f.sha256&&await digest(await old.clone().arrayBuffer())===f.sha256){done++;emit('downloading');continue}
   const reusable=await reuseFromOlder(f,PREFIX+m.version);
   if(reusable){await cache.put(f.url,reusable.clone());done++;emit('downloading');continue}
   const response=await fetch(f.url,{cache:'reload',credentials:'same-origin',signal});
   if(!response.ok||response.type==='opaque')fail('Gagal muat turun: '+f.url);
   const body=await response.arrayBuffer();networkBytes+=body.byteLength;
   if(f.bytes&&body.byteLength!==f.bytes)fail('Saiz fail berubah: '+f.url);
   if(f.sha256&&await digest(body)!==f.sha256)fail('Checksum tidak sepadan: '+f.url);
   const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
   await cache.put(f.url,new Response(body,{status:200,headers}));
   done++;emit('downloading');
  }
  // Write verified marker only after all downloads; old ready packs are never deleted.
  await cache.put(metaURL(),new Response(JSON.stringify({version:m.version,files:m.files.map(f=>({url:f.url,sha256:f.sha256}))}),{headers:{'content-type':'application/json'}}));
  if(!(await inspect(raw)).ready)fail('Pengesahan fail cache gagal');
  try{await root.navigator.storage?.persist?.()}catch(_){}
  emit('complete');
  return {ready:true,version:m.version,networkBytes,files:done};
 }catch(e){emit('interrupted');throw e}finally{busy=false}
}
async function remove(version){
 if(!/^[a-z0-9._-]{1,64}$/i.test(version||''))fail('Versi tidak sah');
 return caches.delete(PREFIX+version); // Does not touch save data.
}
root.PAOfflinePackCore={manifest,inspect,start,remove};
})(typeof window!=='undefined'?window:self);
