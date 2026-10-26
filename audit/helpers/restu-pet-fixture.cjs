const fs=require('node:fs'),vm=require('node:vm');
const {fixture,extract,source,mesh}=require('./restu-stage-fixture.cjs');
const evidence=require('../fixtures/restu-pet-metrics.json');
const core=require('../fixtures/restu-alpha-metrics.json').assets;
const all={...evidence.assets};for(const [p,a] of Object.entries(core))all[p]={...a,frames:[{width:a.width,height:a.height,m96:a.metrics[96],m512:a.metrics[512]}]};
function texture(p,slot=0){const a=all[p];if(!a)throw Error('unmeasured production asset '+p);const f=a.frames[slot];return{image:{...f,asset:p,slot}}}
async function petStage(active,rescue){
 const stage=fixture(),c=stage.sandbox;c.measure=i=>i.m96;c.measureHiRes=i=>i.m512;
 Object.assign(c,{PET_UPP:1.22/400,COMPANION_SCALE:.58,PET_SHEET_HOLD:[2.6,2.6,2.6,2.6],PET_IDLE_HOLD:Array(8).fill(1),petVisualGeneration:0,rescuePetVisualGeneration:0,activePetConfig:null,rescuePetConfig:null,tAcc:0,COMPANION_HOME:-2.14,dt:0,damp:(x,y,k,dt)=>x+(y-x)*(1-Math.exp(-k*dt))});
 c.petJoy=[0,1].map(i=>texture(`assets/pets/aurora/frames/joy-${i}-v1.webp`));c.petSad=Array.from({length:8},(_,i)=>texture(`assets/pets/aurora/frames/sad-${i}-v1.webp`));
 c.petCharH=c.PET_UPP*c.petSad[0].image.height*c.petSad[0].image.m512.boxH;
 c.load=async p=>texture(p);c.sheetFrames=async p=>p?all[p].frames.map((_,i)=>texture(p,i)):[];
 const entries=source.match(/    const petEntries=.*;/)[0];
 vm.runInNewContext(['entry','heroCalibratedUpp','sealEntry','restuEntry','petUpp','customPetFrames','swapCompanion','setPetVisual','setRescuePetVisual'].map(extract).join('\n')+'\n'+entries+'\nthis.art={entry,heroCalibratedUpp,sealEntry,restuEntry};',c);
 c.petJoyE=c.petJoy.map(t=>c.art.entry(t,c.PET_UPP));c.petSadE=c.petSad.map(t=>c.art.entry(t,c.PET_UPP));
 Object.assign(c.S,{companionFeet:-2.14,rescued:false,companionScale:.58});
 await c.setPetVisual(active?.config||null);await c.setRescuePetVisual(rescue?.config||null);
 const heroH=1.5*c.PET_UPP*c.petJoy[0].image.height*c.petJoy[0].image.m512.boxH;
 const idle=texture('assets/heroes/wira/frames/idle-loop-0-v1.webp'),surprise=texture('assets/heroes/wira/frames/restu-surprised-v1.webp');
 const heroE=c.art.entry(idle,c.art.heroCalibratedUpp(idle,heroH));stage.data.surprised=c.art.entry(surprise,c.art.heroCalibratedUpp(surprise,heroH));
 const anchors={anticipate:[.52,.92],fall:[.5,.96],preland:[.60,.916],land:[.55,.84]};
 for(const k in anchors){const p=k==='land'?'assets/coach/cikgu-dimensi/full-body/summon-land-clean-v2.webp':`assets/coach/cikgu-dimensi/full-body/entry-v1/${k}-v1.webp`;stage.data[k]=c.art.restuEntry(texture(p),anchors[k],k==='fall'?1.02:1)}
 c.seals=['gangsa','perak','emas'].map((tier,i)=>{const e=c.art.sealEntry(texture(`assets/fx/segel/${tier}-v2.webp`),[2.05,2.18,2.45][i]);const front=mesh(1.52);c.swap(front,e);front.position.set(1.52+e.offX,-1.92+e.offY,-.02);return{front,e}});
 c.heroShadow.position.set(-1.62,-1.88,-.01);c.petShadow.position.set(1.52,-1.89,-.33);
 c.bg.material.color=c.groundOverlay.material.color={setScalar(){}};c.camWin=null;vm.runInNewContext(extract('cameraFrame')+';this.stepCamera=cameraFrame',c);
 const compAnchor=source.slice(source.indexOf('      S.companionFeet=damp('),source.indexOf('      // Bayang Aurora kekal'));
 function pose(compE,petE){
  c.swap(c.hero,heroE);c.hero.position.set(-1.62+heroE.offX,-1.92+heroE.offY,0);c.S.heroLock=null;
  if(compE){c.swapCompanion(compE);vm.runInNewContext(compAnchor,c)}
  c.swap(c.pet,petE);c.pet.position.set(1.52+petE.offX,-1.92+petE.offY,-.3);
  const a=stage.getActive();a.fired={};a.heroSurprised=false;a.layoutWidths=null;
 }
 return{stage,c,pose,compFrames:c.S.companionFrames,petFrames:c.S.petFrames};
}
module.exports={petStage,evidence,texture};
