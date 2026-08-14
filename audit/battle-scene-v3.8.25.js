const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const root=__dirname+'/..',source=__dirname+'/../../../work/v3.8.24';
const css=fs.readFileSync(root+'/css/battle-scene-v3.8.25.css','utf8');
const html=fs.readFileSync(root+'/index.html','utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

assert(/Pahlawan Angka · v3\.8\.(25|26)/.test(html));
assert(html.includes('css/battle-scene-v3.8.25.css?v=3.8.25'));
['--pa-floor','--pa-hero-h','--pa-minion-h','--pa-boss-h','--pa-unit-w','--pa-hero-inset','--pa-enemy-inset','--pa-pet-box'].forEach(v=>assert(css.includes(v),`missing ${v}`));
['#game #hero{left:var(--pa-hero-inset)','#game #enemy{right:var(--pa-enemy-inset)','data-enemy-tier="minion"','data-enemy-tier="boss"','.battlePet','.unit::after','.unitHud'].forEach(v=>assert(css.includes(v),`missing selector/rule ${v}`));
['.qcard','.question{','.answers{','.ans{','.gameTop','.missionHud'].forEach(v=>assert(!css.includes(v),`out-of-scope selector ${v}`));
assert(!/scaleX\s*\(\s*-1\s*\)/.test(css),'global mirroring must not be introduced');

// Scene-only change: every JavaScript module and all existing CSS remain byte-identical to v3.8.24.
for(const dir of ['js','questions','data','lessons']){
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
  for(const target of walk(root+'/'+dir)){
    const rel=target.slice(root.length+1),prior=source+'/'+rel;
    if(rel==='js/learning.js')continue; // v3.8.26 teaching-content repair; battle code remains untouched.
    assert(fs.existsSync(prior),`new out-of-scope file ${rel}`);
    assert.equal(hash(target),hash(prior),`changed out-of-scope file ${rel}`);
  }
}
for(const name of fs.readdirSync(source+'/css')){
  if(!name.endsWith('.css'))continue;
  assert.equal(hash(root+'/css/'+name),hash(source+'/css/'+name),`changed existing CSS ${name}`);
}

const assets=[
  'assets/heroes/wira/idle.webp','assets/heroes/wira/attack.webp','assets/heroes/bunga/idle.webp','assets/heroes/bunga/attack.webp',
  'assets/pets/aurora/standby-v2.webp','assets/pets/arif/standby.png','assets/pets/kucing-pembaris/standby-v2.webp','assets/pets/tiko/standby.png',
  'assets/enemies/minions/minion-a.svg','assets/enemies/place-value/maharaja-nilai-tempat.webp',
  'assets/fx/wira/finisher.webp','assets/fx/bunga/finisher-thorn-bloom-v2.png'
];
assets.forEach(rel=>assert(fs.existsSync(root+'/'+rel)&&fs.statSync(root+'/'+rel).size>0,`missing asset ${rel}`));

const viewports=[{width:360,height:800},{width:390,height:844},{width:412,height:915}];
const geometry=viewports.map(v=>{
  const arenaWidth=v.width-20,inset=arenaWidth*.055,unit=132,lane=arenaWidth-(inset*2)-(unit*2);
  assert(arenaWidth>0&&lane>=38,`central lane too small at ${v.width}x${v.height}`);
  assert(inset+unit<arenaWidth/2,`hero crosses arena centre at ${v.width}x${v.height}`);
  assert(arenaWidth-inset-unit>arenaWidth/2,`enemy crosses arena centre at ${v.width}x${v.height}`);
  assert(9+145<198,`boss clips vertical arena at ${v.width}x${v.height}`);
  return{viewport:`${v.width}x${v.height}`,arenaWidth,centralLane:Math.round(lane),arenaHeight:198};
});

console.log(JSON.stringify({status:'pass',checks:40,sceneOnly:true,version:'3.8.25',heroes:['wira','bunga'],pets:['aurora','arif','pembaris','tiko'],enemyTiers:['minion','boss'],states:['idle','pet attack','hero attack','enemy attack','final blow','death','respawn'],geometry},null,2));
