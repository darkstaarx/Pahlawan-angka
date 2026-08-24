#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

const registry=require(path.join(repo,'questions/v2/engine/d3-rollout.js'));

ok(registry&&typeof registry.getState==='function','registry exports getState');
ok(typeof registry.isFixtureLiveAuthorized==='function','registry exports isFixtureLiveAuthorized');
eq(registry.defaultState,'SHADOW','default state is SHADOW');
eq(registry.curriculumVersion,'KSSR-E3-2024','registry curriculum version matches D3 corpus');
eq(registry.grade,3,'registry grade is 3');

// 1. Absent entries default to SHADOW (any of the 44 non-T7, non-fixture,
// non-HOLD standards).
const untouched=['1.1.1','3.1.1','4.1.1','5.1.1','8.1.1','9.1.1','6.1.1'];
for(const sid of untouched){
  eq(registry.getState(sid),'SHADOW',`${sid} defaults to SHADOW when absent from registry`);
  ok(!registry.isFixtureLiveAuthorized(sid,{flags:{[registry.fixtureAuthFlag]:true}}),`${sid} is never fixture-authorized regardless of flags`);
}

// 2. The one fixture entry reads LIVE.
eq(registry.getState(registry.fixtureStandardId),'LIVE','fixture standard reads LIVE');
eq(registry.fixtureStandardId,'2.1.1','fixture standard is the documented 2.1.1');

// 3. The one HOLD entry reads HOLD.
eq(registry.getState('6.3.3'),'HOLD','6.3.3 reads HOLD');

// 4. isFixtureLiveAuthorized requires BOTH the exact fixture id AND the
// explicit flag -- every other combination must be false.
ok(!registry.isFixtureLiveAuthorized(registry.fixtureStandardId,{}),'fixture without flags is not authorized');
ok(!registry.isFixtureLiveAuthorized(registry.fixtureStandardId,{flags:{}}),'fixture with empty flags is not authorized');
ok(!registry.isFixtureLiveAuthorized(registry.fixtureStandardId,{flags:{[registry.fixtureAuthFlag]:false}}),'fixture with flag=false is not authorized');
ok(!registry.isFixtureLiveAuthorized(registry.fixtureStandardId,{flags:{[registry.fixtureAuthFlag]:'true'}}),'fixture with truthy-but-non-boolean flag is not authorized (strict ===true)');
ok(registry.isFixtureLiveAuthorized(registry.fixtureStandardId,{flags:{[registry.fixtureAuthFlag]:true}}),'fixture with exact flag=true IS authorized');

// 5. Defense in depth: a standard other than the fixture is NEVER
// authorized even when it independently reads LIVE from some future
// registry edit, and even when the exact flag is supplied. We simulate a
// "misconfigured" registry entry by patching the internal ENTRIES map
// directly (the same object the real getState() reads) to prove the
// fixture check in isFixtureLiveAuthorized is not registry-driven.
{
  const before=registry._test.ENTRIES['9.1.1'];
  registry._test.ENTRIES['9.1.1']='LIVE';
  eq(registry.getState('9.1.1'),'LIVE','adversarial edit: registry now reports 9.1.1 as LIVE');
  ok(!registry.isFixtureLiveAuthorized('9.1.1',{flags:{[registry.fixtureAuthFlag]:true}}),'defense in depth: 9.1.1 marked LIVE is still never fixture-authorized');
  if(before===undefined)delete registry._test.ENTRIES['9.1.1'];else registry._test.ENTRIES['9.1.1']=before;
  eq(registry.getState('9.1.1'),'SHADOW','adversarial edit reverted');
}

// 6. listEntries is sorted, well-formed, and matches the two documented
// entries exactly (no silent scope creep).
const entries=registry.listEntries();
eq(entries,[{standardId:'2.1.1',state:'LIVE'},{standardId:'6.3.3',state:'HOLD'}],'registry contains exactly the two documented R2 entries, sorted');

// 7. Unknown/garbage state strings normalise to the default rather than
// throwing or silently becoming LIVE.
eq(registry._test.normaliseState('nonsense'),'SHADOW','unknown state string normalises to SHADOW');
eq(registry._test.normaliseState(undefined),'SHADOW','undefined state normalises to SHADOW');
eq(registry._test.normaliseState('live'),'LIVE','lowercase live normalises correctly');

console.log(JSON.stringify({status:'pass',checks,fixtureStandardId:registry.fixtureStandardId,holdStandardId:'6.3.3',defaultState:registry.defaultState},null,2));
