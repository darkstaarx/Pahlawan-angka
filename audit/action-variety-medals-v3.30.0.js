const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const battle=read('js/battle.js'),action=read('js/action-variety-v3.30.0.js');
const rewards=read('js/rewards-v2.js'),progress=read('js/progression.js');
const html=read('index.html'),sw=read('sw.js'),version=read('js/version.js');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};
const parseVersion=v=>{
  const m=v.match(/PA_APP_VERSION='(\d+)\.(\d+)\.(\d+)'/);
  return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null;
};
const atLeast=(current,minimum)=>{
  for(let i=0;i<3;i++){
    if(current[i]>minimum[i])return true;
    if(current[i]<minimum[i])return false;
  }
  return true;
};
const MIN_VERSION=[3,30,0];
const currentVersion=parseVersion(version);
check(!!currentVersion&&atLeast(currentVersion,MIN_VERSION),'version is below the minimum required 3.30.0 for this feature');
check((action.match(/id:'original'/g)||[]).length===2,'both original contact attacks are not retained');
check((action.match(/id:'(?:dash|arc|pulse)'/g)||[]).length===3,'Wira does not have original plus three new contact attacks');
check((action.match(/id:'(?:sweep|spiral|thorn)'/g)||[]).length===3,'Bunga does not have original plus three new contact attacks');
check(/if\(finisher\)return/.test(action),'finisher is not excluded from regular variants');
check(!/triggerPetFollowUp/.test(action),'action module changes pet combo');
check(/prepareHeroAttackVariant\(attacker,finisher\)/.test(battle),'battle does not prepare variants');
check(/action-variety-v3\.30\.0\.css/.test(html)&&/action-variety-v3\.30\.0\.js/.test(html),'app shell HTML is missing action files');
check(/action-variety-v3\.30\.0\.css/.test(sw)&&/action-variety-v3\.30\.0\.js/.test(sw),'service worker is missing action files');
check((rewards.match(/target:/g)||[]).length>=10,'fewer than ten progress medals');
check(/unlockedAt/.test(rewards)&&/toLocaleDateString\('ms-MY'/.test(rewards),'earned date is not shown');
check(/badgeProgress/.test(rewards)&&/kemajuan/.test(rewards),'locked medal progress is not shown');
check(/evaluateMilestoneBadges/.test(progress),'milestones are not evaluated during progression');
console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
