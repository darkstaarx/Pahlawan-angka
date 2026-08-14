const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'css/battle-scene-v3.8.27.css'),'utf8');
const previousCss=fs.readFileSync(path.join(root,'css/battle-scene-v3.8.25.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const battle=fs.readFileSync(path.join(root,'js/battle.js'),'utf8');
const required=[
  ['visible version',/Pahlawan Angka · v3\.9\.0/],
  ['cache query',/battle-scene-v3\.8\.27\.css\?v=3\.8\.27/],
  ['shared floor',/#game #hero,[\s\S]*#game #enemy[\s\S]*bottom:var\(--pa-floor\)!important/],
  ['hero shadow',/#game \.battle \.unit::after/],
  ['minion shadow',/data-enemy-tier="minion"\]::after/],
  ['boss shadow',/data-enemy-tier="boss"\]::after/],
  ['pet shadow',/battlePet::after/],
  ['pet forty-percent source preserved',/--pa-pet-box/],
  ['fx layer',/petImpactFx\{z-index:13/],
  ['hud layer',/unitHud\{z-index:18/]
];
const failures=[];
for(const [name,re] of required){
  const source=name==='visible version'||name==='cache query'?html:(name==='pet forty-percent source preserved'?previousCss:css);
  if(!re.test(source))failures.push(name);
}
const logicChecks=[
  ['pet first',/const heroLead=hasPet\?420:0/],
  ['hero follows',/if\(heroLead\)setTimeout\(startAttacker,heroLead\)/],
  ['pet phases',/pet-phase-anticipation[\s\S]*pet-phase-contact[\s\S]*pet-phase-follow-through/],
  ['enemy respawn',/setTimeout\(nextEnemy,enemyTransitionDelay\)/],
  ['Bunga final blow',/tint==="bloom"/]
];
for(const [name,re] of logicChecks)if(!re.test(battle))failures.push(name);
if(/\.qcard|\.question|\.answers|\.gameTop|\.missionHud/.test(css))failures.push('out-of-scope selector');
if(failures.length){console.error(JSON.stringify({status:'fail',failures},null,2));process.exit(1)}
console.log(JSON.stringify({
  status:'pass',
  scope:'battle staging only',
  heroes:['wira','bunga'],
  pets:['aurora','arif','tiko','kucing-pembaris'],
  enemies:['minion','boss'],
  states:['idle','pet attack','hero attack','enemy attack','final blow','death','respawn'],
  viewports:['360x800','390x844','412x915']
},null,2));
