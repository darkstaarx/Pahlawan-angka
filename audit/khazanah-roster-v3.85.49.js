// Render the real carousel module against a deterministic layout and dialog fixture.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;
async function run(prebuilt,reduced){
 const nodes={},frames=[];let ctx;let clock=1000;
 function element(id='',classes='',tag='div'){
  const set=new Set(classes.split(' ').filter(Boolean));
  const el={id,tag,dataset:{},style:{setProperty(){}},listeners:{},classList:{contains:c=>set.has(c),add:c=>set.add(c),remove:c=>set.delete(c),toggle(c,on){on?set.add(c):set.delete(c)}},textContent:'',clientWidth:400,scrollLeft:0,children:[],setAttribute(k,v){this[k]=v},addEventListener(k,fn){this.listeners[k]=fn},querySelectorAll(selector){return this.children.filter(x=>selector==='button'?x.tag==='button':selector==='[data-pet-id]'?x.dataset.petId!==undefined:selector==='[data-form]'?x.dataset.form!==undefined:selector[0]==='.'?x.classList.contains(selector.slice(1)):false)},querySelector(s){return this.querySelectorAll(s)[0]||null},getBoundingClientRect(){return{left:this.parent?this.offsetLeft-this.parent.scrollLeft:0,width:this.offsetWidth||this.clientWidth}},scrollTo(options){this.lastScroll=options;this.scrollLeft=Math.max(0,options.left);this.listeners.scroll?.()},focus(){ctx.document.activeElement=this},animate(frames,options){this.motion={frames,options};return{finished:Promise.resolve()}},showModal(){this.open=true},close(){this.open=false}};
  Object.defineProperty(el,'innerHTML',{get(){return this.html||''},set(s){this.html=s;this.children=[];let cardIndex=0,currentCard=null;for(const m of s.matchAll(/<([a-z]+)\b([^>]*)>/g)){const attrs=m[2],nodeId=/\bid="([^"]+)"/.exec(attrs)?.[1]||'',cls=/\bclass="([^"]*)"/.exec(attrs)?.[1]||'',child=element(nodeId,cls,m[1]);for(const a of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)){child.dataset[a[1].replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=a[2]};if(attrs.includes('disabled'))child.disabled=true;if(child.dataset.petId!==undefined){child.offsetLeft=50+cardIndex++*318;child.offsetWidth=300;child.parent=this;currentCard=child}if(m[1]==='button'&&currentCard)currentCard.children.push(child);this.children.push(child);if(nodeId)nodes[nodeId]=child}}});return el;
 }
 const append=el=>{nodes[el.id]=el};nodes.treasure=element('treasure');
 const html=read('index.html'),shell=html.slice(html.indexOf('<section id="treasure"'),html.indexOf('<div id="unlockOverlay"'));
 if(prebuilt){nodes.treasure.innerHTML=shell;nodes.treasure.dataset.kz='1'}
 const pets=[{id:'aurora',name:'Aurora <ami>',species:'Musang',rarity:'Starter',state:'tamed',active:true,level:8,appearance:'base',evolutionStage:1,evolutionUnlocked:true,bondXp:720,assets:{happy:'aurora.webp'}},{id:'kura',name:'Kukupat',species:'Kura-Kura Ketupat',rarity:'Common',state:'encountered',active:false,level:1,appearance:'base',rescues:3,rescueThreshold:12,assets:{happy:'kura.webp'}},{id:'hidden',name:'Secret',state:'unseen',active:false,assets:{happy:'hidden.webp'},levelGate:10,eligible:false},...Array.from({length:3},(_,i)=>({id:'pending'+i,name:'Secret'+i,state:'unseen',active:false,assets:{happy:'hidden.webp'},levelGate:12+i,eligible:false}))];
 ctx={console,Date:{now:()=>clock},requestAnimationFrame:fn=>{frames.push(fn);return frames.length},matchMedia:()=>({matches:reduced}),db:{level:5,rewards:{pets:{},auras:{},badges:{}}},REWARD_PETS:{},REWARD_AURAS:{},REWARD_BADGES:{one:{}},PetCollection:{snapshot:()=>({pets,expedition:{rank:1}}),equip:(db,id)=>{pets.forEach(p=>p.active=p.id===id);return true},setAppearance:(db,id,form)=>{pets.find(p=>p.id===id).appearance=form;return true}},document:{readyState:'complete',getElementById:id=>nodes[id]||null,createElement:tag=>element('','',tag),head:{appendChild:append},body:{appendChild:append}},renderTreasure:()=>42,openTreasure:()=>99};ctx.window=ctx;vm.createContext(ctx);
 const rewards=read('js/rewards-v2.js');vm.runInContext(rewards.slice(rewards.indexOf('function treasureTab(tab){'),rewards.indexOf('\nfunction renderTreasure')),ctx);
 vm.runInContext(read('js/khazanah-v2-v1.0.0.js'),ctx);
 const flush=()=>{let guard=0;while(frames.length){assert(++guard<100);frames.shift()()}};
 const settle=async()=>{flush();await new Promise(setImmediate);flush()};
 assert.equal(ctx.renderTreasure(),42);await settle();const wrappedRender=ctx.renderTreasure;vm.runInContext(read('js/khazanah-v2-v1.0.0.js'),ctx);assert.equal(ctx.renderTreasure,wrappedRender);checks++;
 assert(!nodes.petStage);assert(nodes.petCollection.innerHTML.includes('Aurora &lt;ami&gt;'));assert(!nodes.petCollection.innerHTML.includes('Secret'));assert(nodes.petCollection.innerHTML.includes('Belum Dijinakkan'));assert.equal(nodes.kzCollectionCount.textContent,'1/6 diselamatkan');checks+=5;
 const deck=nodes.petCollection,cards=deck.querySelectorAll('[data-pet-id]');
 const checkStack=index=>{assert.equal(cards.filter(c=>c.classList.contains('is-focus')).length,1);assert.equal(cards[index].dataset.depth,'0');assert.deepEqual(cards.map(c=>c.dataset.depth).sort(),['0','1','2','3','4','5']);assert.equal(cards.filter(c=>c['aria-hidden']==='true').length,5);assert.equal(cards.filter(c=>!c.querySelector('button').disabled).length,1);checks+=5};
 checkStack(0);assert(!nodes.kzDeckPrev.disabled);assert(!nodes.kzDeckNext.disabled);checks+=2;
 nodes.kzDeckNext.onclick();assert(cards[1].classList.contains('is-focus'));assert.equal(pets[0].active,true);if(!reduced){assert.equal(cards[0].motion.options.duration,520);assert(cards[0].motion.frames[2].transform.includes('rotateY'));assert.equal(deck['aria-busy'],'true');nodes.kzDeckNext.onclick();assert(cards[1].classList.contains('is-focus'));checks+=4}await settle();checkStack(1);checks+=2;
 let prevented=false;deck.listeners.keydown({key:'ArrowRight',preventDefault(){prevented=true}});await settle();assert(prevented);checkStack(2);checks++;
 nodes.kzDeckDots.querySelectorAll('button')[5].onclick();await settle();checkStack(5);nodes.kzDeckNext.onclick();await settle();checkStack(0);nodes.kzDeckPrev.onclick();await settle();checkStack(5);
 // A horizontal gesture advances the stack, but a vertical gesture leaves it alone.
 const event=(x,y=80)=>({pointerId:7,clientX:x,clientY:y,button:0,isPrimary:true,cancelable:true,preventDefault(){}});
 deck.listeners.pointerdown(event(180));deck.listeners.pointermove(event(80));clock+=150;deck.listeners.pointerup(event(80));await settle();checkStack(0);assert.equal(pets[0].active,true);checks++;
 let preventedClick=false;deck.listeners.click({preventDefault(){preventedClick=true},stopPropagation(){}});assert(preventedClick);clock+=500;checks++;
 deck.listeners.pointerdown(event(180));deck.listeners.pointermove(event(178,160));deck.listeners.pointerup(event(178,160));await settle();checkStack(0);
 nodes.kzDeckNext.onclick();await settle();pets[0].bondXp++;ctx.renderTreasure();await settle();assert(deck.querySelectorAll('[data-pet-id]')[1].classList.contains('is-focus'));checks++;
 ctx.openCollectionPet('kura');const dialog=nodes.petDetailSheet;assert(dialog.open);assert(dialog.innerHTML.includes('Kukupat'));assert(dialog.innerHTML.includes('Belum Dijinakkan'));assert(dialog.innerHTML.includes('Lagi 9 misi'));assert(!dialog.querySelector('.kzEquip'));assert(!dialog.querySelector('.kzRename'));assert(!dialog.innerHTML.includes('Belum ditemui'));checks+=7;
 dialog.querySelector('.kzSheetClose').onclick();assert(!dialog.open);checks++;
 ctx.openCollectionPet('hidden');assert(dialog.innerHTML.includes('Belum ditemui'));assert(!dialog.innerHTML.includes('Secret'));assert(dialog.innerHTML.includes('unseen'));checks+=3;
 ctx.openCollectionPet('aurora');assert(dialog.querySelector('.kzEquip').disabled);assert(dialog.querySelector('.kzRename'));assert(dialog.querySelector('.kzEvolution'));assert.equal(dialog.querySelectorAll('[data-form]').length,2);checks+=4;
 dialog.querySelectorAll('[data-form]')[1].onclick();await settle();assert.equal(pets[0].appearance,'bara');assert(dialog.innerHTML.includes('kzCardForm'));checks+=2;
 const sameCards=deck.querySelectorAll('[data-pet-id]');ctx.renderTreasure();await settle();assert.equal(deck.querySelectorAll('[data-pet-id]')[0],sameCards[0]);checks++;
 ctx.treasureTab('badges');await settle();assert(nodes.kzPetGallery.classList.contains('hidden'));assert(!nodes.badgeCollection.classList.contains('hidden'));assert.equal(nodes.treasureBadgeTab['aria-pressed'],'true');checks+=3;
 ctx.treasureTab('pets');await settle();assert(!nodes.kzPetGallery.classList.contains('hidden'));assert(nodes.badgeCollection.classList.contains('hidden'));checks+=2;
 const p=ctx.PAKhazanah.petPresentation({...pets[1],state:'unseen',encounters:1,rescues:0,rescueThreshold:null});assert(p.known);assert.equal(p.status,'Belum Dijinakkan');assert.equal(p.threshold,null);checks+=3;
 assert(shell.includes('<h1>Khazanah</h1>'));assert(shell.includes('id="kzPetGallery"'));assert(shell.includes('class="kzDeck"'));checks+=3;
}
(async()=>{
 for(const prebuilt of [false,true])for(const reduced of [false,true])await run(prebuilt,reduced);
 const html=read('index.html'),version=/PA_APP_VERSION='([^']+)'/.exec(read('js/version.js'))[1];assert(html.includes(`css/khazanah-v2-v1.0.0.css?v=${version}`));assert.equal((html.match(new RegExp(`js/khazanah-v2-v1.0.0.js\\?v=${version}`,'g'))||[]).length,1);checks+=2;
 console.log(JSON.stringify({status:'pass',checks,coverage:['static/generated shells','six-card depth stack','cyclic roll animation and motion guard','pointer swipe vs vertical scroll','swipe click suppression','arrows/dots/keyboard','reduced motion','preview does not equip','known/unknown statuses','modal actions/forms','selection on refresh','Trofi visibility']},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
