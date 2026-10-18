const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto,createHash}=require('node:crypto');
const source=fs.readFileSync('sw.js','utf8').replace(/const APP_SHELL=\[[\s\S]*?\];\r?\n\r?\nconst freshRequest/,"const APP_SHELL=['./index.html','./app.js','./assets/test.png'];\n\nconst freshRequest");
const scope='https://example.test/nested/';
const asset='./assets/test.png';
const hash=body=>createHash('sha256').update(body).digest('hex');
class ScopedRequest extends Request{
 constructor(input,options){super(typeof input==='string'?new URL(input,scope):input,options)}
}
class Storage{
 constructor(){this.data=new Map()}
 async keys(){return [...this.data.keys()]}
 async open(name){if(!this.data.has(name))this.data.set(name,new Cache(this));return this.data.get(name)}
 async delete(name){return this.data.delete(name)}
 async match(request,options){for(const cache of this.data.values()){const found=await cache.match(request,options);if(found)return found}}
}
class Cache{
 constructor(storage){this.storage=storage;this.data=new Map()}
 key(input){return typeof input==='string'?new URL(input,scope).href:input.url}
 async match(input,options){const key=this.key(input);for(const [url,response] of this.data){if(url===key||(options?.ignoreSearch&&url.split('?')[0]===key.split('?')[0]))return response.clone()}}
 async put(input,response){this.data.set(this.key(input),response.clone())}
 async addAll(requests){for(const request of requests){const response=await this.storage.fetch(request);if(response.status!==200)throw Error('shell failure');await this.put(request,response)}}
}
function harness(version,body,storage=new Storage(),override={}){
 const events={},calls=[],modes=[];
 const net=async request=>{
  const url=new URL(typeof request==='string'?request:request.url,scope);calls.push(url.href);modes.push(request.cache);
  return new Response(url.pathname.endsWith('test.png')?(override.networkBody??body):'shell');
 };
 storage.fetch=net;
 const self={PA_APP_VERSION:version,PA_ASSET_MANIFEST:override.manifest??{[asset]:hash(body)},location:{origin:'https://example.test',href:scope+'sw.js'},registration:{scope},addEventListener(type,fn){events[type]=fn},skipWaiting(){self.skipped=true}};
 const context={Request:ScopedRequest,Response,URL,Uint8Array,crypto:webcrypto,fetch:net,caches:storage,self,importScripts(){}};
 vm.runInNewContext(source,context);
 async function dispatch(type,request){let promise;events[type]({request,waitUntil(p){promise=p},respondWith(p){promise=p}});return promise}
 return {self,storage,calls,modes,install:()=>dispatch('install'),activate:()=>dispatch('activate'),get:url=>dispatch('fetch',new ScopedRequest(url))};
}
(async()=>{
 const a=harness('a','image-a');await a.install();await a.activate();
 assert(a.self.skipped);assert.equal(a.calls.filter(x=>x.endsWith('test.png')).length,1);
 const stable='pahlawan-angka-assets-v1';assert((await a.storage.keys()).includes(stable));
 const b=harness('b','image-a',a.storage);await b.install();await b.activate();
 assert.equal(b.calls.filter(x=>x.endsWith('test.png')).length,0,'unchanged release must not fetch artwork');
 assert(!(await a.storage.keys()).some(x=>x.includes('-va-')),'old app shell should be deleted');
 const before=b.calls.length;assert.equal(await(await b.get(scope+'assets/test.png?v=new-app')).text(),'image-a');
 assert.equal(b.calls.length,before,'query alias should use verified canonical hash');
 assert.equal(await(await b.get(scope+'assets/test.png?v=another-app')).text(),'image-a');
 assert.equal(b.calls.length,before,'another query must not download the same content');
 assert.equal((await b.storage.open(stable)).data.size,1,'query variants must share one stored body');
 const c=harness('c','image-c',a.storage);await c.install();
 assert.equal(c.calls.filter(x=>x.endsWith('test.png')).length,1);
 assert.equal(await(await c.get(scope+'assets/test.png')).text(),'image-c');
 assert.equal(await(await b.get(scope+'assets/test.png')).text(),'image-a','old worker must retain its content hash');
 const legacy=new Storage();await(await legacy.open('pahlawan-angka-vlegacy')).put(scope+'assets/test.png',new Response('image-a'));
 const migrated=harness('migrated','image-a',legacy);await migrated.install();await migrated.activate();
 assert.equal(migrated.calls.filter(x=>x.endsWith('test.png')).length,0,'valid legacy bytes should migrate without download');
 const wrongLegacy=new Storage();await(await wrongLegacy.open('pahlawan-angka-vlegacy')).put(scope+'assets/test.png',new Response('wrong'));
 const corrected=harness('corrected','image-a',wrongLegacy);await corrected.install();
 assert.equal(corrected.calls.filter(x=>x.endsWith('test.png')).length,1,'incorrect legacy bytes require download');
 const failed=harness('failed','expected',new Storage(),{networkBody:'wrong'});
 await assert.rejects(failed.install(),/hash mismatch/);assert(!failed.self.skipped);
 const missing=harness('missing','expected',new Storage(),{manifest:{}});
 await assert.rejects(missing.install(),/Missing asset hash/);assert(!missing.self.skipped);
 const quota=harness('quota','fresh-artwork');
 const fullCache=await quota.storage.open(stable);fullCache.put=async()=>{throw Error('QuotaExceededError')};
 assert.equal(await(await quota.get(scope+'assets/test.png')).text(),'fresh-artwork','online artwork must survive storage failures');
 assert.equal(quota.modes.at(-1),'no-cache','runtime must validate HTTP cache before hashing');
 console.log('PASS: unchanged update=0 asset fetches; changed hash=1; migration validates bytes; queries, nested scope, old workers and failed installs are safe');
})().catch(error=>{console.error(error);process.exitCode=1});
