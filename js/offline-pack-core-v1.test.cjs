// Node 20+ mock smoke check, not a browser/PWA e2e test.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('js/offline-pack-core-v1.js','utf8');
const root={location:{href:'https://app.test/',origin:'https://app.test'},navigator:{onLine:true}};
const fake={window:root,URL,Request,Response,Headers,crypto:require('node:crypto').webcrypto,caches:{open:async()=>({match:async()=>null}),delete:async()=>true}};
vm.runInNewContext(source,fake);
const api=root.PAOfflinePackCore;
const pack={schema:1,version:'test1',scopes:['premium'],files:[{path:'./index.html',bytes:3}]};
assert.equal(api.manifest(pack).files.length,1);
assert.throws(()=>api.manifest({...pack,scopes:[]}),/Scope/);
assert.throws(()=>api.manifest({...pack,files:[{path:'https://bad.test/a'}]}),/tidak dibenarkan/);
(async()=>{await assert.rejects(api.start(pack),/entitlement/);console.log('PASS fail-closed validation + entitlement');})().catch(e=>{console.error(e);process.exitCode=1});
