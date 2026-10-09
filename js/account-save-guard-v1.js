/* Pahlawan Angka - account-bound facade around the existing JSON game snapshot.
   STAGED. Does not create another gameplay state or change reward calculations. */
(function(root){
'use strict';
const PREFIX='pa_account_save_v1:',LEGACY='pa_coach_v6_full';
let owner=null;
const valid=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const copy=value=>JSON.parse(JSON.stringify(value));
const key=(userId,childId)=>{
 if(!valid(userId)||!valid(childId))throw Error('ID akaun/profil tidak sah');
 return PREFIX+userId+':'+childId;
};
const store=()=>root.localStorage;
function rawRead(userId,childId){
 const raw=store().getItem(key(userId,childId));
 if(!raw)return null;
 let env;try{env=JSON.parse(raw)}catch(_){throw Error('Data simpanan rosak; jangan overwrite')}
 if(env.schema!==1||env.userId!==userId||env.childId!==childId||
   !env.profile||env.profile.cloudChildId!==childId||
   !Number.isSafeInteger(env.sequence)||env.sequence<0||
   !Number.isSafeInteger(env.serverRevision)||env.serverRevision<0)
   throw Error('Identiti atau struktur simpanan tidak sah');
 return env;
}
function bind(userId,childId,{confirmedOwnership=false}={}){
 key(userId,childId);
 if(!confirmedOwnership)throw Error('Pemilikan profil mesti disahkan semasa online login');
 owner={userId,childId};
 // Old single-key snapshot is imported only for the now-verified child.
 if(!rawRead(userId,childId)){
  const raw=store().getItem(LEGACY);
  if(raw){
   let legacy;try{legacy=JSON.parse(raw)}catch(_){legacy=null}
   if(legacy?.cloudChildId===childId){
    const env={schema:1,userId,childId,serverRevision:0,sequence:1,
      dirty:true,conflict:false,updatedAt:Date.now(),profile:copy(legacy)};
    store().setItem(key(userId,childId),JSON.stringify(env));
   }
  }
 }
 return read();
}
function unbind({clearLegacy=true}={}){
 owner=null;
 if(clearLegacy)store().removeItem(LEGACY); // separate authenticated identities
}
function ensure(){if(!owner)throw Error('Akaun belum disahkan');return owner}
function read(){const {userId,childId}=ensure();const value=rawRead(userId,childId);return value?copy(value):null}
function capture(profile,{mirrorLegacy=true}={}){
 const {userId,childId}=ensure();
 if(!profile||profile.cloudChildId!==childId)throw Error('Progress bukan milik profil aktif');
 const previous=rawRead(userId,childId);
 const next={schema:1,userId,childId,serverRevision:previous?.serverRevision||0,
  sequence:(previous?.sequence||0)+1,dirty:true,conflict:!!previous?.conflict,
  updatedAt:Date.now(),profile:copy(profile)};
 // Atomic from the application's perspective: write durable per-account first.
 store().setItem(key(userId,childId),JSON.stringify(next));
 if(mirrorLegacy)store().setItem(LEGACY,JSON.stringify(next.profile));
 return copy(next);
}
function installCloud(profile,serverRevision){
 const {userId,childId}=ensure();
 if(!profile||profile.cloudChildId!==childId)throw Error('Cloud snapshot wrong profile');
 if(!Number.isSafeInteger(serverRevision)||serverRevision<0)throw Error('Cloud revision tidak sah');
 const current=rawRead(userId,childId);
 if(current?.dirty||current?.conflict)return {installed:false,reason:'local_pending',local:copy(current)};
 if(current&&current.serverRevision>serverRevision)return {installed:false,reason:'older_cloud',local:copy(current)};
 const next={schema:1,userId,childId,serverRevision,sequence:current?.sequence||0,
  dirty:false,conflict:false,updatedAt:Date.now(),profile:copy(profile)};
 store().setItem(key(userId,childId),JSON.stringify(next));
 store().setItem(LEGACY,JSON.stringify(next.profile));
 return {installed:true,local:copy(next)};
}
function markSynced(sequence,revision){
 const {userId,childId}=ensure();
 const entry=rawRead(userId,childId);
 if(!entry||!Number.isSafeInteger(revision)||revision<=entry.serverRevision)return false;
 if(sequence>entry.sequence||sequence<0)return false;
 entry.serverRevision=revision;
 entry.dirty=entry.sequence!==sequence;
 entry.conflict=false;
 store().setItem(key(userId,childId),JSON.stringify(entry));
 return true;
}
function markConflict(expectedRevision,remoteRevision){
 const {userId,childId}=ensure(),entry=rawRead(userId,childId);
 if(!entry||entry.serverRevision!==expectedRevision)return false;
 entry.conflict=true;entry.remoteRevision=remoteRevision;entry.dirty=true;
 store().setItem(key(userId,childId),JSON.stringify(entry));
 return true;
}
async function flush(send){
 if(typeof send!=='function')throw Error('Transport CAS tidak tersedia');
 const identity=ensure(),local=read();
 if(!local)return {status:'empty'};
 if(local.conflict)return {status:'conflict',local};
 if(!local.dirty)return {status:'synced',revision:local.serverRevision};
 const {userId,childId}=identity;
 const response=await send({userId,childId,expectedRevision:local.serverRevision,profile:copy(local.profile)});
 // Account switching while request is in flight must NOT mark the new account.
 if(!owner||owner.userId!==userId||owner.childId!==childId)
  return {status:'switched_account'};
 if(response?.saved===true&&Number.isSafeInteger(response.server_revision)){
  markSynced(local.sequence,response.server_revision);
  const now=read();return {status:now.dirty?'pending':'synced',revision:now.serverRevision};
 }
 if(response?.reason==='revision_conflict'){
  markConflict(local.serverRevision,response.server_revision);
  return {status:'conflict',remoteRevision:response.server_revision,local:read()};
 }
 return {status:'pending'};
}
root.PAAccountSaveV1={bind,unbind,read,capture,installCloud,markSynced,markConflict,flush,
 status:()=>{const e=owner?read():null;return e?.conflict?'conflict':e?.dirty?'local_only':e?'synced':'unbound';}};
})(typeof window!=='undefined'?window:self);
