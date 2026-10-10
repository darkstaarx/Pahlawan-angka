// Render the real carousel module against a deterministic layout and dialog fixture.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
function run(prebuilt,reduced){
 const nodes={},frames=[];let ctx;
 function element(id='',classes='',tag='div'){
  const set=new Set(classes.split(' ').filter(Boolean));
  const el={id,tag,dataset:{},style:{setProperty(){}},listeners:{},classList:{contains:c=>set.has(c),add:c=>set.add(c),toggle(c,on){on?set.add(c):set.delete(c)}},textContent:'',clientWidth:400,scrollLeft:0,children:[],setAttribute(k,v){this[k]=v},addEventListener(k,fn){this.listeners[k]=fn},querySelectorAll(selector){return this.children.filter(x=>selector==='button'?x.tag==='button':selector==='[data-pet-id]'?x.dataset.petId!==undefined:selector==='[data-form]'?x.dataset.form!==undefined:selector[0]==='.'?x.classList.contains(selector.slice(1)):false)},querySelector(s){return this.querySelectorAll(s)[0]||null},getBoundingClientRect(){return{left:this.parent?this.offsetLeft-this.parent.scrollLeft:0,width:this.offsetWidth||this.clientWidth}},scrollTo(options){this.lastScroll=options;this.scrollLeft=Math.max(0,options.left);this.listeners.scroll?.()},showModal(){this.open=true},close(){this.open=false}};
  Object.defineProperty(el,'innerHTML',{get(){return this.html||''},set(s){this.html=s;this.children=[];let cardIndex=0;for(const m of s.matchAll(/<([a-z]+)\b([^>]*)>/g)){const attrs=m[2],nodeId=/\bid="([^"]+)"/.exec(attrs)?.[1]||'',cls=/\bclass="([^"]*)"/.exec(attrs)?.[1]||'',child=element(nodeId,cls,m[1]);for(const a of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)){child.dataset[a[1].replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=a[2]};if(attrs.includes('disabled'))child.disabled=true;if(child.dataset.petId!==undefined){child.offsetLeft=50+cardIndex++*318;child.offsetWidth=300;child.parent=this}this.children.push(child);if(nodeId)nodes[nodeId]=child}}});return el;
 }
 const append=el=>{nodes[el.id]=el};nodes.treasure=element('treasure');
 const html=read('index.html'),shell=html.slice(html.indexOf('<section id="treasure"'),html.indexOf('<div id="unlockOverlay"'));
 if(prebuilt){nodes.treasure.innerHTML=shell;nodes.treasure.dataset.kz='1'}
 const pets=[{id:'aurora',name:'Aurora <ami>',species:'Musang',rarity:'Starter',state:'tamed',active:true,level:8,appearance:'base',evolutionStage:1,evolutionUnlocked:true,bondXp:720,assets:{happy:'aurora.webp'}},{id:'kura',name:'Kukupat',species:'Kura-Kura Ketupat',rarity:'Common',state:'encountered',active:false,level:1,appearance:'base',rescues:3,rescueThreshold:12,assets:{happy:'kura.webp'}},{id:'hidden',name:'Secret',state:'unseen',active:false,assets:{happy:'hidden.webp'},levelGate:10,eligible:false}];
 ctx={console,requestAnimationFrame:fn=>{frames.push(fn);return frames.length},matchMedia:()=>({matches:reduced}),db:{level:5,rewards:{pets:{},auras:{},badges:{}}},REWARD_PETS:{},REWARD_AURAS:{},REWARD_BADGES:{one:{}},PetCollection:{snapshot:()=>({pets,expedition:{rank:1}}),equip:(db,id)=>{pets.forEach(p=>p.active=p.id===id);return true},setAppearance:(db,id,form)=>{pets.find(p=>p.id===id).appearance=form;return true}},document:{readyState:'complete',getElementById:id=>nodes[id]||null,createElement:tag=>element('','',tag),head:{appendChild:append},body:{appendChild:append}},renderTreasure:()=>42,openTreasure:()=>99};ctx.window=ctx;vm.createContext(ctx);
 const rewards=read('js/rewards-v2.js');vm.runInContext(rewards.slice(rewards.indexOf('function treasureTab(tab){'),rewards.indexOf('\nfunction renderTreasure')),ctx);
 vm.runInContext(read('js/khazanah-v2-v1.0.0.js'),ctx);
 const flush=()=>{let guard=0;while(frames.length){assert(++guard<100);frames.shift()()}};
 assert.equal(ctx.renderTreasure(),42);flush();const wrappedRender=ctx.renderTreasure;vm.runInContext(read('js/khazanah-v2-v1.0.0.js'),ctx);assert.equal(ctx.renderTreasure,wrappedRender);checks++;
 assert(!nodes.petStage);assert(nodes.petCollection.innerHTML.includes('Aurora &lt;ami&gt;'));assert(!nodes.petCollection.innerHTML.includes('Secret'));assert(nodes.petCollection.innerHTML.includes('Belum Dijinakkan'));assert.equal(nodes.kzCollectionCount.textContent,'1/3 diselamatkan');checks+=5;
 const deck=nodes.petCollection,cards=deck.querySelectorAll('[data-pet-id]');assert(cards[0].classList.contains('is-focus'));assert(nodes.kzDeckPrev.disabled);assert(!nodes.kzDeckNext.disabled);checks+=3;
 nodes.kzDeckNext.onclick();flush();assert(cards[1].classList.contains('is-focus'));assert.equal(deck.lastScroll.behavior,reduced?'instant':'smooth');assert.equal(pets[0].active,true);checks+=3;
 let prevented=false;deck.listeners.keydown({key:'ArrowRight',preventDefault(){prevented=true}});flush();assert(prevented);assert(cards[2].classList.contains('is-focus'));assert(nodes.kzDeckNext.disabled);checks+=3;
 nodes.kzDeckDots.querySelectorAll('button')[0].onclick();flush();assert(cards[0].classList.contains('is-focus'));checks++;
 deck.scrollLeft=318;deck.listeners.scroll();flush();assert(cards[1].classList.contains('is-focus'));assert.equal(pets[0].active,true);pets[0].bondXp++;ctx.renderTreasure();flush();assert(deck.querySelectorAll('[data-pet-id]')[1].classList.contains('is-focus'));checks+=3;
 ctx.openCollectionPet('kura');const dialog=nodes.petDetailSheet;assert(dialog.open);assert(dialog.innerHTML.includes('Kukupat'));assert(dialog.innerHTML.includes('Belum Dijinakkan'));assert(dialog.innerHTML.includes('Lagi 9 misi'));assert(!dialog.querySelector('.kzEquip'));assert(!dialog.querySelector('.kzRename'));assert(!dialog.innerHTML.includes('Belum ditemui'));checks+=7;
 dialog.querySelector('.kzSheetClose').onclick();assert(!dialog.open);checks++;
 ctx.openCollectionPet('hidden');assert(dialog.innerHTML.includes('Belum ditemui'));assert(!dialog.innerHTML.includes('Secret'));assert(dialog.innerHTML.includes('unseen'));checks+=3;
 ctx.openCollectionPet('aurora');assert(dialog.querySelector('.kzEquip').disabled);assert(dialog.querySelector('.kzRename'));assert(dialog.querySelector('.kzEvolution'));assert.equal(dialog.querySelectorAll('[data-form]').length,2);checks+=4;
 dialog.querySelectorAll('[data-form]')[1].onclick();flush();assert.equal(pets[0].appearance,'bara');assert(dialog.innerHTML.includes('kzCardForm'));checks+=2;
 const sameCards=deck.querySelectorAll('[data-pet-id]');ctx.renderTreasure();flush();assert.equal(deck.querySelectorAll('[data-pet-id]')[0],sameCards[0]);checks++;
 ctx.treasureTab('badges');flush();assert(nodes.kzPetGallery.classList.contains('hidden'));assert(!nodes.badgeCollection.classList.contains('hidden'));assert.equal(nodes.treasureBadgeTab['aria-pressed'],'true');checks+=3;
 ctx.treasureTab('pets');flush();assert(!nodes.kzPetGallery.classList.contains('hidden'));assert(nodes.badgeCollection.classList.contains('hidden'));checks+=2;
 const p=ctx.PAKhazanah.petPresentation({...pets[1],state:'unseen',encounters:1,rescues:0,rescueThreshold:null});assert(p.known);assert.equal(p.status,'Belum Dijinakkan');assert.equal(p.threshold,null);checks+=3;
 assert(shell.includes('<h1>Khazanah</h1>'));assert(shell.includes('id="kzPetGallery"'));assert(shell.includes('class="kzDeck"'));checks+=3;
}
for(const prebuilt of [false,true])for(const reduced of [false,true])run(prebuilt,reduced);
const html=read('index.html'),version=/PA_APP_VERSION='([^']+)'/.exec(read('js/version.js'))[1];assert(html.includes(`css/khazanah-v2-v1.0.0.css?v=${version}`));assert.equal((html.match(new RegExp(`js/khazanah-v2-v1.0.0.js\\?v=${version}`,'g'))||[]).length,1);checks+=2;
console.log(JSON.stringify({status:'pass',checks,coverage:['static/generated shells','carousel arrows/dots/keyboard','reduced motion','preview does not equip','encountered status and remaining missions','unknown silhouette','detail actions/forms','retained carousel selection','Trofi visibility','cache URLs']},null,2));
