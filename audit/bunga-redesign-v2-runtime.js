#!/usr/bin/env node
const fs=require('fs');
const vm=require('vm');
let delegatedPrepare=0,delegatedClear=0;
const context={
  console,
  setTimeout:()=>1,
  clearTimeout:()=>{},
  document:{getElementById:()=>null,querySelectorAll:()=>[]},
  db:{hero:'bunga',rewards:{}},
  HEROES:{bunga:{frames:{},fx:{}}}
};
context.window=context;
context.prepareHeroAttackVariant=()=>{delegatedPrepare++};
context.clearHeroAttackVariant=()=>{delegatedClear++};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../js/hero-bunga-v2.0.0.js'),'utf8'),context);

const check=(ok,label)=>{if(!ok){console.error('FAIL',label);process.exitCode=1}else console.log('PASS',label)};
check(context.PABungaBattle.getNextNormalSkill()===1,'Bunga begins with Kelopak Pecahan');
context.prepareHeroAttackVariant(null,false);
check(context.PABungaBattle.getNextNormalSkill()===2,'Second normal attack selects Bulatan Harmoni');
context.prepareHeroAttackVariant(null,false);
check(context.PABungaBattle.getNextNormalSkill()===1,'Normal attack rotation returns to Kelopak Pecahan');
context.prepareHeroAttackVariant(null,true);
check(context.PABungaBattle.getNextNormalSkill()===1,'Finisher does not consume the normal-skill rotation');
check(delegatedPrepare===0,'Bunga never leaks into the legacy attack preparation');
context.db.hero='wira';
context.prepareHeroAttackVariant(null,false);
context.clearHeroAttackVariant(null);
check(delegatedPrepare===1&&delegatedClear===1,'Non-Bunga heroes delegate to their existing hooks');
check(context.PABungaBattle.TIMING.skill1.impact===500&&context.PABungaBattle.TIMING.skill2.impact===1050,'Normal contact timings stay synchronized with battle.js');
check(context.PABungaBattle.TIMING.finisher.impact===1550,'Teorem Mekar impact stays synchronized at 1550ms');
