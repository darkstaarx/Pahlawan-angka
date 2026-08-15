const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/combat-polish-v3.21.2.js','utf8');
function classes(init=[]){const s=new Set(init);return{add(...x){x.forEach(v=>s.add(v))},remove(...x){x.forEach(v=>s.delete(v))},contains(x){return s.has(x)},has:x=>s.has(x)}}
const arena={children:[],classList:classes(),firstChild:null,querySelector(sel){if(sel===':scope > .paTerrainToneLayer')return this.children.find(x=>x.className==='paTerrainToneLayer')||null;if(sel==='.paVictoryFx')return this.children.find(x=>x.className==='paVictoryFx')||null;return null},insertBefore(el){this.children.unshift(el);this.firstChild=this.children[0]},appendChild(el){this.children.push(el)},};
const hero={classList:classes()},pet={classList:classes(),};
const nodes={battleArena:arena,hero,battlePet:pet};
const doc={documentElement:{dataset:{}},querySelector(){return null},getElementById:id=>nodes[id]||null,createElement(){return{className:'',classList:classes(),setAttribute(){},remove(){const i=arena.children.indexOf(this);if(i>=0)arena.children.splice(i,1)},innerHTML:''}}};
let oldVictory=0,oldTerrain=0,oldEnemy=0,oldScreen=[];let timers=[];
const db={rewards:{equippedPet:'aurora'}};
const ctx={console,window:null,document:doc,db,setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout(){},triggerBossVictory:()=>oldVictory++,setBattleTerrain:()=>oldTerrain++,applyEnemyVariant:()=>oldEnemy++,screen:id=>oldScreen.push(id)};ctx.window=ctx;
vm.runInNewContext(code,ctx,{filename:'combat-polish-v3.21.2.js'});
assert(ctx.PACombatPolish&&ctx.PACombatPolish.version==='3.21.2');
assert(arena.querySelector(':scope > .paTerrainToneLayer'),'terrain layer not created');
ctx.triggerBossVictory();assert.equal(oldVictory,1);assert(hero.classList.has('paVictory'),'hero did not celebrate');assert(pet.classList.has('paPetVictory'),'equipped pet did not celebrate');assert(arena.classList.has('paVictoryActive'));
ctx.setBattleTerrain();assert.equal(oldTerrain,1);assert(arena.querySelector(':scope > .paTerrainToneLayer'));
ctx.screen('hub');assert.equal(oldScreen.at(-1),'hub');assert(!hero.classList.has('paVictory'),'victory state should clear when leaving game');
pet.classList.add('hidden');ctx.PACombatPolish.startVictoryCelebration();assert(!pet.classList.has('paPetVictory'),'hidden/unequipped presentation must not celebrate');
console.log('PASS v3.21.2 runtime: terrain tone layer + hero/pet victory hooks');
