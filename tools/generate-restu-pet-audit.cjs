/* Regenerate offline geometry evidence from production-selected assets.
   Set PA_AUDIT_CANVAS to the native Canvas module path if it is not on NODE_PATH. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require(process.env.PA_AUDIT_CANVAS||'@napi-rs/canvas');
const {extract}=require('../audit/helpers/restu-stage-fixture.cjs');
const pets=require('../js/pet-collection-system.js');
const root=path.resolve(__dirname,'..');
const journey=fs.readFileSync(path.join(root,'js/engine/production-journey.js'),'utf8');
const configFn=journey.slice(journey.indexOf('  function petConfig('),journey.indexOf('  function activePetConfig('));
const context={window:{PetCollection:pets}};vm.runInNewContext(configFn+';this.config=petConfig',context);
const variants=[];
for(const id of Object.keys(pets.catalog))for(const form of ['base','bara']){
 const data={level:60,schoolGrade:2,rewards:{},petCollection:{},expedition:{},gembok:{},completedMissions:{}};pets.ensure(data);
 for(const key of Object.keys(pets.catalog)){data.petCollection[key].state='tamed';data.petCollection[key].bondXp=500;data.petCollection[key].appearance='base'}
 data.petCollection[id].appearance=form;data.expedition.activePetId=id;
 variants.push({key:id+':'+form,id,form,config:context.config(data,id)});
}
const selected=new Map();
for(const v of variants)for(const [key,value] of Object.entries(v.config))if(['sad','happy','idle','sadSheet','happySheet','idleSheet'].includes(key))for(const p of [value].flat().filter(Boolean))selected.set(p,{sheet:selected.get(p)?.sheet||key.endsWith('Sheet')});
for(const phase of ['sad','joy'])for(let i=0;i<(phase==='sad'?8:2);i++)selected.set(`assets/pets/aurora/frames/${phase}-${i}-v1.webp`,{sheet:false});
const assets={};
const scope={document:{createElement(){return createCanvas(1,1)}},THREE:{CanvasTexture:class{constructor(image){this.image=image}},SRGBColorSpace:'srgb'},load:async p=>({image:await loadImage(path.join(root,p))})};
vm.runInNewContext(extract('measureAt')+'\n'+extract('sheetFrames')+';this.measure=measureAt;this.crop=sheetFrames',scope);
function measurement(img){const out={width:img.width,height:img.height};for(const n of [96,512]){const c=createCanvas(n,n);out['m'+n]=scope.measure(img,n,c.getContext('2d'))}return out}
(async()=>{
 for(const [p,{sheet}] of selected){
  const bytes=fs.readFileSync(path.join(root,p)),image=await loadImage(bytes);
  const frames=sheet?(await scope.crop(p)).map(t=>t.image):[image];
  assets[p]={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:image.width,height:image.height,sheet,frames:frames.map(measurement)};
 }
 fs.writeFileSync(path.join(root,'audit/fixtures/restu-pet-metrics.json'),JSON.stringify({method:'Production petConfig/sheetFrames/measureAt; native Canvas, alpha 18/150, 96/512px. All selected logical frames.',variants,assets},null,2)+'\n');
 process.stdout.write(JSON.stringify({variants:variants.length,assets:selected.size,frames:Object.values(assets).reduce((n,a)=>n+a.frames.length,0)})+'\n');
})();
