const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'css/battle-scene-v3.8.28.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const battle=fs.readFileSync(path.join(root,'js/battle.js'),'utf8');
const asset=path.join(root,'assets/battlefields/nusantara-temple/arena-v1.png');

assert(fs.existsSync(asset)&&fs.statSync(asset).size>100000,'new arena missing');
assert(/Pahlawan Angka · v(?:3\.8\.(28|29|30|31)|3\.9\.0)/.test(html),'visible version');
assert(html.includes('battle-scene-v3.8.28.css?v=3.8.28'),'cache query');
['--pa-hero-h:112px','--pa-minion-h:86px','--pa-boss-h:128px','--pa-pet-box:45px','left:-7%!important','background-image:url'].forEach(x=>assert(css.includes(x),`missing ${x}`));
['.qcard','.question{','.answers{','.gameTop','.missionHud'].forEach(x=>assert(!css.includes(x),`out of scope ${x}`));
assert(!/#game \.battle\s*\{[^}]*\bheight\s*:/s.test(css),'arena height changed');
assert(/const heroLead=hasPet\?420:0/.test(battle),'pet-first timing changed');
assert(/setTimeout\(nextEnemy,enemyTransitionDelay\)/.test(battle),'respawn logic missing');

const viewports=[360,390,412].map(width=>{
  const arena=width-20,unit=width<=370?112:118,inset=arena*(width<=370?.08:.10);
  const lane=arena-(2*inset)-(2*unit);
  assert(lane>=35,`central lane ${width}`);
  assert(inset-(unit*.17)>=0,`Tiko clips ${width}`);
  return{viewport:width,lane:Math.round(lane)};
});
console.log(JSON.stringify({status:'pass',scope:'battle-only',background:'nusantara-temple/arena-v1.png',heroes:['wira','bunga'],pets:['aurora','arif','tiko','kucing-pembaris'],enemies:['minion','boss'],viewports},null,2));
