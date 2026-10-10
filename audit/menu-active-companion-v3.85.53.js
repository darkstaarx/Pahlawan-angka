const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function img(){const classes=new Set();return{src:'',alt:'',classList:{toggle(k,on){on?classes.add(k):classes.delete(k)},add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},getAttribute(k){return this[k]},removeAttribute(k){this[k]=''}}}
const nodes={mv2Pet:img(),mv2PetFace:img(),petSlot:{},mv2PetHappy:{...img(),setAttribute(k,v){this[k]=v},getContext(){return{clearRect(){},drawImage(){}}}}},pets=[];
const ctx={console,db:{rewards:{equippedPet:'legacy'}},REWARD_PETS:{legacy:{id:'legacy',name:'Legacy',front:'legacy-own.webp'}},document:{getElementById:id=>nodes[id]},setTimeout(){},setInterval(){},clearTimeout(){},clearInterval(){},PetCollection:{snapshot:()=>({pets})}};ctx.window=ctx;vm.createContext(ctx);
let source=read('js/menu-v2-v1.0.0.js');source=source.replace('  function startSpriteEngine()', '  window.__petTest={renderPetFrame,setPetArt,activeMenuPet};\n  function startSpriteEngine()');vm.runInContext(source,ctx);
const api=ctx.__petTest;let checks=0;
for(const id of ['aurora','ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau'])for(const appearance of ['base','bara']){
 const pet={id,name:id+' chosen',active:true,appearance,front:'obsolete-default.webp',assets:{happy:`${id}/${appearance}/happy.webp`}};pets.splice(0,pets.length,pet);
 for(let tick=0;tick<4;tick++){api.renderPetFrame();assert.equal(nodes.mv2Pet.alt,pet.name);assert(!nodes.mv2Pet.classList.contains('hidden'));if(id==='aurora'&&appearance==='base')assert(nodes.mv2Pet.src.startsWith('assets/pets/aurora/frames/joy-'));else assert.equal(nodes.mv2Pet.src,pet.assets.happy);checks+=3}
 api.setPetArt(nodes.mv2PetFace,pet);assert.equal(nodes.mv2PetFace.src,pet.assets.happy);assert.equal(nodes.mv2PetFace.alt,pet.name);assert(nodes.petSlot.title.includes(pet.name));checks+=3;
}
pets.length=0;api.renderPetFrame();assert(nodes.mv2Pet.classList.contains('hidden'));assert.equal(nodes.mv2Pet.src,'');checks+=2;
ctx.PetCollection=null;api.renderPetFrame();assert.equal(nodes.mv2Pet.src,'legacy-own.webp');assert.equal(nodes.mv2Pet.alt,'Legacy');checks+=2;
ctx.PetCollection={snapshot:()=>({pets:[{id:'kura',name:'Kukupat',active:true,appearance:'bara',assets:{happy:'missing-own.webp'}}]})};api.renderPetFrame();nodes.mv2Pet.onerror();assert(nodes.mv2Pet.classList.contains('hidden'));assert(!nodes.mv2Pet.src.includes('aurora'));checks+=2;
const html=read('index.html'),version=/PA_APP_VERSION='([^']+)'/.exec(read('js/version.js'))[1];assert(html.includes('id="mv2Pet" class="mv2PetSprite hidden" alt=""'));assert(html.includes(`js/menu-v2-v1.0.0.js?v=${version}`));assert(html.includes('assets/ui/menu-v2/kembara-dimensi-book-v7.webp'));assert(read('sw.js').includes("'./assets/ui/menu-v2/kembara-dimensi-book-v7.webp'"));checks+=4;
console.log(JSON.stringify({status:'pass',checks,coverage:['six companions in base/Bara','animation ticks','selected art matches active card','profile selection changes','no active pet','legacy own-art fallback','missing asset never becomes Aurora','new book cache']},null,2));
