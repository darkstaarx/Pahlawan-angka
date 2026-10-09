/* Offline entitlement receipt verification - STAGED ONLY.
 * A real public JWK must be pinned in this code as part of the release.
 * No secret or user-editable premium flag is used. */
(function(root){
'use strict';
const KID='pa-p256-v1',AUD='pahlawan-angka-offline',KEY='pa_offline_signed_receipt_v1:';
// Deployment blocker: PIN this value to the signer public P-256 JWK before release.
const PINNED_PUBLIC_JWK=null;
const validId=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const encoded=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]+$/.test(s)&&s.length<=4096;
function decode(s){
 if(!encoded(s))throw Error('Resit offline tidak sah');
 const b=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
 return Uint8Array.from(b,c=>c.charCodeAt(0));
}
async function verify(receipt,expectedUserId){
 if(!validId(expectedUserId)||!receipt||!encoded(receipt.payload)||!encoded(receipt.signature))
  return {verified:false,reason:'invalid_receipt'};
 if(!PINNED_PUBLIC_JWK||!root.crypto?.subtle)
  return {verified:false,reason:'not_configured'};
 try{
  const publicKey=await root.crypto.subtle.importKey('jwk',PINNED_PUBLIC_JWK,
   {name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const input=new TextEncoder().encode(receipt.payload);
  if(!await root.crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,decode(receipt.signature),input))
   return {verified:false,reason:'invalid_signature'};
  const data=JSON.parse(new TextDecoder().decode(decode(receipt.payload)));
  const correct=data.v===1&&data.aud===AUD&&data.kid===KID&&data.sub===expectedUserId&&
   ['premium','family_plus'].includes(data.plan)&&Array.isArray(data.scopes)&&
   data.scopes.includes('core')&&
   data.scopes.every(s=>['core','worksheet_plus'].includes(s))&&
   (data.plan==='family_plus'||!data.scopes.includes('worksheet_plus'));
  return correct?{verified:true,userId:data.sub,plan:data.plan,scopes:data.scopes,
   issuedAt:data.issued_at}:{verified:false,reason:'identity_or_scope_mismatch'};
 }catch(_){return {verified:false,reason:'invalid_receipt'}}
}
async function remember(receipt,id){
 const proof=await verify(receipt,id);
 if(!proof.verified)throw Error('Resit pembelian offline gagal disahkan');
 root.localStorage.setItem(KEY+id,JSON.stringify(receipt));
 return proof;
}
async function restore(id){
 if(!validId(id))return {verified:false,reason:'invalid_user'};
 const raw=root.localStorage.getItem(KEY+id);
 if(!raw)return {verified:false,reason:'not_activated'};
 try{return await verify(JSON.parse(raw),id)}catch(_){return {verified:false,reason:'invalid_receipt'}}
}
root.PAOfflineEntitlement={verify,remember,restore};
})(typeof window!=='undefined'?window:self);
