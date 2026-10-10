const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const nodes={};let checks=0;
function element(id='',classes=''){
 const set=new Set(classes.split(' ').filter(Boolean));
 const el={id,dataset:{},classList:{contains:c=>set.has(c),add:c=>set.add(c),toggle(c,on){on?set.add(c):set.delete(c)}},textContent:'',setAttribute(k,v){this[k]=v}};
 Object.defineProperty(el,'innerHTML',{get(){return this.html||''},set(s){this.html=s;for(const m of s.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){if(!nodes[m[1]])nodes[m[1]]=element(m[1],/class="([^"]*)"/.exec(m[0])?.[1]||'')}}});
 return el;
}
nodes.treasure=element('treasure');
const pets=[{id:'aurora',name:'Aurora <ami>',state:'tamed',active:true,level:10,appearance:'base',evolutionTheme:'fire',bondXp:920,assets:{happy:'aurora.webp'}},{id:'kura',name:'Kurapat',state:'tamed',active:false,level:5,appearance:'bara',assets:{happy:'kura.webp'}},{id:'hidden',name:'Secret',state:'unknown',active:false,assets:{happy:'hidden.webp'},levelGate:10,eligible:false}];
const ctx={console,db:{level:5,rewards:{pets:{},auras:{},badges:{}}},REWARD_PETS:{},REWARD_AURAS:{},REWARD_BADGES:{one:{}},PetCollection:{snapshot:()=>({pets,expedition:{rank:1}})},document:{readyState:'complete',getElementById:id=>nodes[id]||null,createElement:()=>element(),head:{appendChild(el){nodes[el.id]=el}}},renderTreasure:()=>42,openTreasure:()=>99};ctx.window=ctx;
vm.createContext(ctx);
const rewards=read('js/rewards-v2.js');vm.runInContext(rewards.slice(rewards.indexOf('function treasureTab(tab){'),rewards.indexOf('\nfunction renderTreasure')),ctx);
vm.runInContext(read('js/khazanah-v2-v1.0.0.js'),ctx);
assert(nodes.treasure.innerHTML.includes('<h1>Khazanah</h1>'));assert(!nodes.treasureAuraTab);assert.equal(ctx.renderTreasure(),42);checks+=3;
const roster=nodes.petCollection.innerHTML;
assert(roster.includes('Aurora &lt;ami&gt;'));assert(roster.includes('Ikut kamu'));assert(!roster.includes('kzActiveBadge'));assert(!roster.includes('kzFormChip'));assert(!roster.includes('Secret'));assert(roster.includes("openCollectionPet('kura')"));checks+=6;
assert.equal(nodes.petStageName.textContent,'Aurora <ami>');assert.equal(nodes.petStageDesc.textContent,'Tahap 10');assert.equal(nodes.kzPanelTitle.textContent,'Teman kamu');assert.equal(nodes.kzCollectionCount.textContent,'2/3 diselamatkan');checks+=4;
pets[0].appearance='bara';ctx.PAKhazanah.paint();assert.equal(nodes.petStageDesc.textContent,'Tahap 10 · Bara');checks++;
ctx.treasureTab('badges');assert(nodes.petCollection.classList.contains('hidden'));assert(!nodes.badgeCollection.classList.contains('hidden'));assert(nodes.treasureBadgeTab.classList.contains('active'));assert(nodes.petStage.classList.contains('hidden'));assert(nodes.petHuntTracker.classList.contains('hidden'));assert.equal(nodes.kzPanelTitle.textContent,'Trofi kamu');assert.equal(nodes.treasureBadgeTab['aria-pressed'],'true');checks+=7;
ctx.treasureTab('pets');assert(!nodes.petStage.classList.contains('hidden'));assert(!nodes.petCollection.classList.contains('hidden'));assert(nodes.badgeCollection.classList.contains('hidden'));assert.equal(nodes.treasureBadgeTab['aria-pressed'],'false');checks+=4;
pets[0].active=false;ctx.PAKhazanah.paint();assert.equal(nodes.petStageName.textContent,'Belum ada teman');assert.equal(nodes.petStageDesc.textContent,'');checks+=2;
const html=read('index.html');const shell=html.slice(html.indexOf('<section id="treasure"'),html.indexOf('<div id="unlockOverlay"'));assert(shell.includes('<h1>Khazanah</h1>'));assert(shell.includes('id="kzCollectionCount"'));assert(shell.includes('class="kzStageLabel"'));checks+=3;assert.equal((html.match(/js\/khazanah-v2-v1.0.0.js\?v=3.85.49/g)||[]).length,2);assert(html.includes('css/khazanah-v2-v1.0.0.css?v=3.85.49'));assert(html.includes('js/rewards-v2.js?v=3.85.49'));checks+=3;
console.log(JSON.stringify({status:'pass',checks,coverage:['Khazanah header','compact roster','escaped names','active form','collection counts','missing legacy aura tab','Trofi/stage visibility','empty active pet','cache URLs']},null,2));
