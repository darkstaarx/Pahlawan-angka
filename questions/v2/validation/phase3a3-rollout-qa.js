#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../../..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

const registry=require(path.join(repo,'questions/v2/engine/d3-rollout.js'));

ok(registry&&typeof registry.getState==='function','registry exports getState');
ok(typeof registry.isLiveAuthorized==='function','registry exports isLiveAuthorized (Phase 3A-4: replaces the retired isFixtureLiveAuthorized)');
ok(typeof registry.isFixtureLiveAuthorized==='undefined','the fixture-only test gate has been retired, not merely renamed');
eq(registry.defaultState,'SHADOW','default state remains SHADOW -- default-safe: an unlisted standardId never goes live');
eq(registry.curriculumVersion,'KSSR-E3-2024','registry curriculum version matches D3 corpus');
eq(registry.grade,3,'registry grade is 3');

// 1. All 44 mapped D3 non-T7 standards are explicitly listed -- no silent
// reliance on the absent-entry default for real curriculum content.
const allStandards=['1.1.1','1.1.2','1.2.1','1.3.1','1.4.1','1.4.2','2.1.1','2.1.2','2.2.1','3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.2.1','3.2.2','3.3.1','3.3.2','3.4.1','4.1.1','4.1.2','4.2.1','4.3.1','4.4.1','5.1.1','5.1.2','5.2.1','5.2.2','5.3.1','6.1.1','6.1.2','6.1.3','6.2.1','6.2.2','6.2.3','6.3.1','6.3.2','6.3.3','8.1.1','8.1.2','8.1.3','9.1.1','9.2.1','9.2.2'];
eq(Object.keys(registry._test.ENTRIES).sort(),[...allStandards].sort(),'registry explicitly lists exactly the 44 mapped D3 non-T7 standards');

// 2. Zero HOLD entries; every listed standard is LIVE. 6.3.3 has been
// explicitly cleared (no known content defect required it to remain
// held) and is now LIVE like every other mapped standard.
const entries=registry.listEntries();
eq(entries.length,44,'listEntries returns all 44 entries');
const holds=entries.filter(e=>e.state==='HOLD'),lives=entries.filter(e=>e.state==='LIVE');
eq(holds.length,0,'zero HOLD entries -- all 44 mapped standards are LIVE');
eq(lives.length,44,'all 44 standards are LIVE');
ok(lives.some(e=>e.standardId==='6.3.3'),'6.3.3 is now among the LIVE entries (explicitly cleared)');

// 3. isLiveAuthorized: no flag, no context, no fixture constant -- the
// registry entry alone is the authorization.
for(const sid of lives.map(e=>e.standardId)){
  ok(registry.isLiveAuthorized(sid),`${sid}: LIVE registry entry is authorized with no arguments beyond the standardId`);
}
ok(!registry.isLiveAuthorized('99.9.9'),'a standardId absent from the registry is never authorized');
ok(!registry.isLiveAuthorized(undefined),'undefined standardId is never authorized');
ok(!registry.isLiveAuthorized(null),'null standardId is never authorized');
// Confirm the function genuinely takes no flag/context argument -- passing
// one has no effect either way, proving there is no hidden gate left over.
ok(registry.isLiveAuthorized('1.1.1',{flags:{}})===true,'passing an unrelated second argument does not change the result for a LIVE standard');

// 3b. The HOLD mechanism itself remains fully supported by the rollout
// engine, even though no mapped D3 standard currently uses it. Proven via
// an adversarial edit to the same internal ENTRIES map getState() reads
// (mirroring the defense-in-depth pattern below), then reverted.
{
  const before=registry._test.ENTRIES['6.3.3'];
  registry._test.ENTRIES['6.3.3']='HOLD';
  eq(registry.getState('6.3.3'),'HOLD','HOLD state is still correctly recognised by getState() when an entry uses it');
  ok(!registry.isLiveAuthorized('6.3.3'),'a standard temporarily set to HOLD is correctly never live-authorized');
  registry._test.ENTRIES['6.3.3']=before;
  eq(registry.getState('6.3.3'),'LIVE','edit reverted -- 6.3.3 is LIVE again in the real registry');
  ok(registry.isLiveAuthorized('6.3.3'),'6.3.3 is live-authorized again after the revert');
}

// 4. Default-safe behavior: a standardId not present in ENTRIES at all
// (simulating a future curriculum addition without an explicit rollout
// decision) defaults to SHADOW, never LIVE.
{
  const before=registry._test.ENTRIES['9.9.9'];
  eq(registry.getState('9.9.9'),'SHADOW','an unlisted standardId defaults to SHADOW');
  ok(!registry.isLiveAuthorized('9.9.9'),'an unlisted standardId is never live-authorized by default');
  eq(before,undefined,'sanity: 9.9.9 was genuinely absent from ENTRIES, not accidentally present');
}

// 5. Unknown/garbage state strings normalise to the default rather than
// throwing or silently becoming LIVE.
eq(registry._test.normaliseState('nonsense'),'SHADOW','unknown state string normalises to SHADOW');
eq(registry._test.normaliseState(undefined),'SHADOW','undefined state normalises to SHADOW');
eq(registry._test.normaliseState('live'),'LIVE','lowercase live normalises correctly');
eq(registry._test.normaliseState('hold'),'HOLD','lowercase hold normalises correctly');

console.log(JSON.stringify({status:'pass',checks,liveStandards:lives.length,holdStandards:holds.map(e=>e.standardId),defaultState:registry.defaultState},null,2));
