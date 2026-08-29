#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const source=fs.readFileSync('js/profile-manager-v3.24.2.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(/profileSelectPromise=null/.test(source),'profile selection in-flight guard missing');
assert(/if\(profileSelectPromise\)return profileSelectPromise/.test(source),'overlapping profile selections are not deduplicated');
assert(/const mayNavigate=document\.body\.dataset\.screen==='login'/.test(source),'late profile completion is not screen-gated');
assert(/if\(!mayNavigate\)return/.test(source),'active battle can still be replaced by late navigation');
assert(/finally\{profileSelectPromise=null\}/.test(source),'profile selection guard is not released');
assert(/PA_APP_VERSION='3\.55\.1'/.test(version),'release version is not 3.55.1');
assert(/js\/version\.js\?v=3\.55\.1/.test(html)&&/js\/pwa\.js\?v=3\.55\.1/.test(html),'release loader cache bust is stale');

function extractFunction(text,name){
  const start=text.indexOf(`async function ${name}(`);assert(start>=0,`${name} missing`);
  const open=text.indexOf('{',start);let depth=0;
  for(let i=open;i<text.length;i++){
    if(text[i]==='{')depth++;
    else if(text[i]==='}'&&--depth===0)return text.slice(start,i+1);
  }
  throw new Error(`${name} is incomplete`);
}

(async()=>{
  let resolveCloud,hubCalls=0,cloudCalls=0;
  const cloudWait=new Promise(resolve=>{resolveCloud=resolve});
  const context={
    profileById:()=>({id:'child-1'}),refreshProfiles:async()=>{},
    cloud:()=>({selectChild:async()=>{cloudCalls++;await cloudWait}}),
    document:{body:{dataset:{screen:'login'}}},db:{onboarding:{completed:true}},
    window:{PAOnboarding:null},renderHub:()=>{hubCalls++}
  };
  vm.createContext(context);
  vm.runInContext(`let profileSelectPromise=null;${extractFunction(source,'selectProfile')};globalThis.testSelect=selectProfile`,context);
  const first=context.testSelect('child-1'),second=context.testSelect('child-1');
  context.document.body.dataset.screen='game';resolveCloud();await Promise.all([first,second]);
  assert.strictEqual(cloudCalls,1,'double tap started overlapping cloud profile reads');
  assert.strictEqual(hubCalls,0,'late cloud completion pulled active battle back to Hub');
  console.log('PASS v3.55.1: double tap deduplicated and late profile completion cannot replace active battle');
})().catch(error=>{console.error(error);process.exitCode=1});
