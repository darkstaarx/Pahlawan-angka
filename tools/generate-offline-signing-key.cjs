// Run locally: node tools/generate-offline-signing-key.cjs
// Never put PA_OFFLINE_SIGNING_JWK in client bundles, commits, or logs.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {webcrypto}=require('node:crypto');
(async()=>{
 const folder=path.resolve('.secrets'),privatePath=path.join(folder,'pa-offline-signing-private.jwk.json');
 const publicPath=path.join(folder,'pa-offline-signing-public.jwk.json');
 if(fs.existsSync(privatePath))throw Error('Refusing to overwrite an existing signing key');
 fs.mkdirSync(folder,{recursive:true,mode:0o700});
 const pair=await webcrypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const privateJwk=await webcrypto.subtle.exportKey('jwk',pair.privateKey);
 const publicJwk=await webcrypto.subtle.exportKey('jwk',pair.publicKey);
 fs.writeFileSync(privatePath,JSON.stringify(privateJwk),{flag:'wx',mode:0o600});
 fs.writeFileSync(publicPath,JSON.stringify(publicJwk,null,2)+'\n',{flag:'wx',mode:0o600});
 fs.chmodSync(privatePath,0o600);
 console.log('Signing keypair created locally. DO NOT COMMIT .secrets/.');
 console.log('Private key must be installed as Supabase PA_OFFLINE_SIGNING_JWK secret.');
 console.log('Pin matching PUBLIC JWK into js/offline-entitlement-v1.js before release.');
})().catch(err=>{console.error(err.message);process.exitCode=1});
