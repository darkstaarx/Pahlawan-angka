const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function node(){const classes=new Set(['hidden']);return{src:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,v){v?classes.add(x):classes.delete(x)}},getAttribute(k){return this[k]},setAttribute(k,v){this[k]=v},removeAttribute(k){this[k]=''}}}
let draws=[],pets=[],loaded=true;
const nodes={mv2Pet:node(),mv2PetFace:node(),petSlot:node(),mv2PetHappy:{...node(),getContext(){return{clearRect(){},drawImage(...args){draws.push(args)}}}}};
function Image(){this.complete=loaded;this.naturalWidth=loaded?1024:0;this.naturalHeight=loaded?1024:0}
const ctx={console,Image,document:{getElementById:id=>nodes[id]},db:{},PetCollection:{snapshot:()=>({pets})},setTimeout(){},setInterval(){},clearTimeout(){},clearInterval(){}};ctx.window=ctx;vm.createContext(ctx);
const source=read('js/menu-v2-v1.0.0.js').replace('  function startSpriteEngine()', '  window.testRender=renderPetFrame;\n  function startSpriteEngine()');vm.runInContext(source,ctx);
let checks=0;
for(const id of ['aurora','ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau'])for(const appearance of ['base','bara']){
 const happySprite=id==='aurora'&&appearance==='base'?null:`${id}/${appearance}/sheet.webp`;
 const pet={id,name:id,active:true,appearance,assets:{happySprite,happy:`${id}/${appearance}/happy.webp`}};pets=[pet];draws=[];
 for(let i=0;i<4;i++){ctx.testRender();assert.equal(nodes.petSlot.title,`Ketuk ${id} untuk bermain`);checks++}
 if(happySprite){assert.equal(draws.length,4);assert.equal(nodes.mv2PetHappy['aria-label'],id);assert(nodes.mv2Pet.classList.contains('hidden'));assert(!nodes.mv2PetHappy.classList.contains('hidden'));assert.equal(new Set(draws.map(a=>`${a[1]},${a[2]}`)).size,4);draws.forEach(a=>{assert.equal(a[0].src,happySprite);assert.deepEqual(a.slice(3),[512,512,0,0,512,512])});checks+=9}
 else{assert.equal(draws.length,0);assert(nodes.mv2Pet.src.includes('/joy-'));checks+=2}
}
loaded=false;pets=[{id:'slow',name:'Slow',active:true,assets:{happySprite:'slow-sheet.webp',happy:'slow-own.webp'}}];ctx.testRender();assert.equal(nodes.mv2Pet.src,'slow-own.webp');assert(nodes.mv2PetHappy.classList.contains('hidden'));checks+=2;
pets=[];ctx.testRender();assert(nodes.mv2Pet.classList.contains('hidden'));assert(nodes.mv2PetHappy.classList.contains('hidden'));checks+=2;
assert(read('js/pet-collection-system.js').includes('happySprite:`${fireRoot}/happy-sprite-v1.webp`'));assert(!read('js/pet-collection-system.js').includes('happySprite:`${fireRoot}/companion-idle'));checks+=2;
console.log(JSON.stringify({status:'pass',checks,coverage:'All six base/Bara selections, 2x2 frame crops, Aurora joy loop, asset loading fallback and no selected pet'}));
