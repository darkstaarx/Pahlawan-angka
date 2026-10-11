const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(require('path').join(__dirname,'..',p),'utf8');
const ctx={console,setTimeout(){},setInterval(){},window:null,document:{getElementById(){return null}}};
ctx.window=ctx;vm.createContext(ctx);
const source=read('js/menu-v2-v1.0.0.js').replace('  function startSpriteEngine()', '  window.__portraitTest={setPetPortrait};\n  function startSpriteEngine()');
vm.runInContext(source,ctx);
const values={},classes=new Set(),img={src:'',alt:'',style:{setProperty(k,v){values[k]=v}},classList:{toggle(k,on){on?classes.add(k):classes.delete(k)}},getAttribute(k){return this[k]},removeAttribute(k){delete this[k]}};
let checks=0;
for(const id of ['aurora','ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau']){
 for(const appearance of ['base','bara']){
  const pet={id,name:id,appearance,assets:{happy:id+'/'+appearance+'.webp'}};
  ctx.__portraitTest.setPetPortrait(img,pet);
  assert.equal(img.src,pet.assets.happy);assert.equal(img.alt,id);
  assert(values['--pet-face-zoom']>1);assert(!classes.has('hidden'));checks+=4;
 }
}
ctx.__portraitTest.setPetPortrait(img,{id:'new-pet',name:'New',assets:{happy:'body.webp',portrait:'face.webp'}});
assert.equal(img.src,'face.webp');assert.equal(values['--pet-face-zoom'],1);checks+=2;
img.onerror();assert.equal(img.src,'body.webp');checks++;
ctx.__portraitTest.setPetPortrait(img,{id:'unknown',name:'Unknown',assets:{happy:'unknown.webp'}});
assert.equal(values['--pet-face-zoom'],1);assert.equal(values['--pet-face-x'],.5);checks+=2;
ctx.__portraitTest.setPetPortrait(img,null);
assert(classes.has('hidden'));assert(!img.src);assert.equal(values['--pet-face-zoom'],1);checks+=3;
assert(read('index.html').includes('class="mv2PetPortrait"'));
const css=read('css/menu-v2-v1.0.0.css');
assert(css.lastIndexOf('/* Mobile home:')>css.indexOf('/* ---------- Header HUD refinement'));
assert(css.includes('var(--nav-h,72px) + env(safe-area-inset-bottom,0px) + 12px'));
checks+=3;
console.log(JSON.stringify({status:'pass',checks,coverage:['pet and appearance switches reset crop','dedicated portrait support and fallback','unknown and absent pets','mobile override order','navigation safe-area clearance']},null,2));
