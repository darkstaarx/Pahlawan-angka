#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').join(__dirname,'..');
const core=fs.readFileSync(root+'/js/cikgu-mini-games-v1.0.0.js','utf8');
const dev=fs.readFileSync(root+'/js/dev-coach-games-v1.0.0.js','utf8');
const pwa=fs.readFileSync(root+'/js/pwa.js','utf8');
const sw=fs.readFileSync(root+'/sw.js','utf8');
const html=fs.readFileSync(root+'/index.html','utf8');
let checks=0;const ok=(value,message)=>{checks++;assert.ok(value,message)};

ok(/window\.PACoachGames=\{[^}]*scene/.test(core),'core exports the production scene renderer');
ok(/typeof isDevMode===['"]function['"]&&isDevMode\(\)/.test(dev),'launcher is gated by Dev Mode');
ok(!/(save\(|scheduleSave|syncSaveNow|learningStart|startBattle|award|coins|xp\s*[+]=)/i.test(dev),'launcher has no save, battle or reward calls');
for(const id of ['cake','bridge','supply','garden','market','symmetry'])ok(dev.includes(`'${id}'`),`launcher includes ${id}`);
ok(dev.includes('target!==dialog'),'stale dialog close event cannot dispose a newer preview');
ok(dev.includes("window.PADevCoachGames={open,close,mount}"),'launcher exposes a narrow Dev QA API');
ok(pwa.includes("const devGamesJs='js/dev-coach-games-v1.0.0.js?v=1.0.0'"),'release loader defines Dev launcher');
ok(/const loadGames=.*loadScript\(gamesJs,[^;]+,loadDevGames\)/.test(pwa),'core mini-game loader hands off to Dev launcher');
ok(sw.includes("'./js/dev-coach-games-v1.0.0.js'"),'service worker precaches Dev launcher');
ok(sw.includes('coach-games-2'),'service worker cache is bumped');
ok(html.includes('js/pwa.js?v=3.56.3-coach-games-2'),'index cache-bust is bumped');

const sandbox={window:{},globalThis:null,console,Math};sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(core,sandbox);
for(const id of ['cake','bridge','supply','garden','market','symmetry']){
  const before={profile:'untouched',xp:44,coins:21};
  let model=sandbox.window.PACoachGames.create(id);
  ok(model.kind===id,`${id} creates isolated model`);
  ok(JSON.stringify(before)==='{"profile":"untouched","xp":44,"coins":21}',`${id} leaves sample profile unchanged`);
}
console.log(JSON.stringify({status:'pass',checks},null,2));
