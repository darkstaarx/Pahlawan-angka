const fs=require('fs'),path=require('path'),assert=require('assert');
const src=fs.readFileSync(path.resolve(__dirname,'../js/cloud.js'),'utf8');

assert(/saveWaiters:\[\]/.test(src),'save waiter queue is missing');
assert(/if\(state\.saveInFlight\)\{state\.savePending=true;return new Promise\(resolve=>state\.saveWaiters\.push\(resolve\)\);\}/.test(src),'in-flight saves must return a waiter');
assert(/delete snapshot\._avatarSource;/.test(src),'save payload must continue stripping _avatarSource');
assert(/if\(!state\.user\|\|!state\.childId\|\|!db\|\|sess\?\.demoMode\|\|sess\?\.devBattlefield\|\|db\?\.demoMode\)\{settleSaveWaiters\(false\);return false;\}/.test(src),'unavailable saves must settle queued waiters');
assert(/let snapshot,savedAt;\s*let error;\s*try\{\s*if\(!db\.lastSavedAt\)/.test(src),'local persistence and snapshot preparation must be inside the failure path');
assert(/if\(changed\|\|pending\)state\.saveTimer=setTimeout\(\(\)=>\{void syncSaveNow\(\)\.catch/.test(src),'pending snapshots must trigger a follow-up save');
assert(/else settleSaveWaiters\(true\);/.test(src),'waiters must resolve only after the final save');
assert(/settleSaveWaiters\(false\);/.test(src),'waiters must resolve false on save failure');
assert(!/if\(state\.saveInFlight\)\{state\.savePending=true;return false;\}/.test(src),'in-flight saves must not return immediately');

function deferredSaveModel({prepare=()=>({}),write}){
  const state={user:{id:'user'},childId:'child',db:{lastSavedAt:1},saveInFlight:false,savePending:false,saveWaiters:[]};
  const settle=result=>state.saveWaiters.splice(0).forEach(resolve=>resolve(result));
  let releaseWrite;
  const pendingWrite=new Promise(resolve=>{releaseWrite=resolve;});
  async function syncSaveNow(){
    if(!state.user||!state.childId||!state.db){settle(false);return false;}
    if(state.saveInFlight){state.savePending=true;return new Promise(resolve=>state.saveWaiters.push(resolve));}
    state.saveInFlight=true;
    let error;
    try{prepare();await write(pendingWrite);}catch(saveError){error=saveError;}
    state.saveInFlight=false;
    if(error){state.savePending=true;settle(false);return false;}
    const pending=state.savePending;state.savePending=false;
    if(!pending)settle(true);
    return true;
  }
  return {state,syncSaveNow,releaseWrite};
}

(async()=>{
  const unavailable=deferredSaveModel({write:async deferred=>deferred});
  const first=unavailable.syncSaveNow();
  const queued=unavailable.syncSaveNow();
  unavailable.state.user=null;
  assert.strictEqual(await unavailable.syncSaveNow(),false,'unavailable follow-up must fail immediately');
  assert.strictEqual(await queued,false,'unavailable follow-up must settle queued waiters false');
  unavailable.releaseWrite();
  assert.strictEqual(await first,true,'original save must retain its write result');

  let preparationAttempts=0;
  const preparationFailure=deferredSaveModel({prepare:()=>{preparationAttempts++;throw new Error('snapshot preparation failed');},write:async()=>{throw new Error('write must not run');}});
  const failed=await preparationFailure.syncSaveNow();
  assert.strictEqual(failed,false,'preparation failures must return false');
  assert.strictEqual(preparationFailure.state.saveInFlight,false,'preparation failures must reset saveInFlight');
  assert.strictEqual(preparationAttempts,1,'preparation must run once');
  console.log('PASS cloud save race: executable deferred-write model settles unavailable waiters and preparation failures');
})().catch(error=>{console.error(error);process.exitCode=1;});
