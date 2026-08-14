const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const storage={};
const context=vm.createContext({
  console,Date,
  db:{rewards:{pets:{},auras:{},badges:{}},chapterStars:{},completedMissions:{}},
  sess:{bossDefeated:true,missionChapter:'1',missionHints:0},
  save(){storage.snapshot=JSON.stringify(context.db)},
  setTimeout(){return 0},
  document:{getElementById(){return null}},
  playSfx(){},showRewardToast(){},renderBattlePet(){},screen(){}
});

vm.runInContext(fs.readFileSync('js/rewards-v2.js','utf8'),context,{filename:'js/rewards-v2.js'});
vm.runInContext('processMissionRewards()',context);
const first=JSON.parse(storage.snapshot);
assert(first.rewards.badges.pemula,'first mission badge must unlock');
assert(first.rewards.badges.nombor,'chapter badge must unlock');
assert(first.rewards.badges.tanpaHint,'no-help badge must unlock');
assert(first.rewards.pets.aurora,'first boss pet must unlock');
assert(first.rewards.auras.numbers,'chapter aura must unlock');

context.db=JSON.parse(storage.snapshot);
vm.runInContext('ensureRewards()',context);
assert(context.db.rewards.pets.aurora,'pet must survive reload');
assert(context.db.rewards.auras.numbers,'aura must survive reload');
assert(context.db.rewards.badges.nombor,'badge must survive reload');

const progression=fs.readFileSync('js/progression.js','utf8');
assert(/function finishMission\(\)[\s\S]*processMissionRewards/.test(progression),'finishMission must call reward processor');
console.log('Reward pipeline PASS: finish -> unlock -> save -> reload');
