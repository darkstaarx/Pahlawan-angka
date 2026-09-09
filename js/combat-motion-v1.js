/* Wira and Sidma motion, rendered over the live arena. Gameplay owns
   damage; this layer owns only pixels, sound and the displayed HP deadline. */
(()=>{
 'use strict';
 const byId=id=>document.getElementById(id),cache=new Map();
 const paths={idle:'assets/heroes/wira/idle.webp',ready:'assets/heroes/wira/frames/anticipation-v1.webp',move:'assets/heroes/wira/attack.webp',follow:'assets/heroes/wira/frames/follow-through-v1.webp'};
 const chibiPaths={idle:'assets/heroes/wira-chibi/idle.webp',ready:'assets/heroes/wira-chibi/frames/anticipation-v1.webp',move:'assets/heroes/wira-chibi/attack.webp',follow:'assets/heroes/wira-chibi/frames/follow-through-v1.webp'};
 const contactPaths={
  wira:{dash:'assets/heroes/wira/frames/attack-dash-v2.webp',arc:'assets/heroes/wira/frames/attack-arc-v2.webp',pulse:'assets/heroes/wira/frames/attack-pulse-v2.webp'},
  wirachibi:{dash:'assets/heroes/wira-chibi/frames/attack-dash-v2.webp',arc:'assets/heroes/wira-chibi/frames/attack-arc-v2.webp',pulse:'assets/heroes/wira-chibi/frames/attack-pulse-v2.webp'}
 };
 const art={},chibiArt={},wiraContacts={},chibiContacts={},sidmaArt={};let canvas,ctx,active=null,raf=0,observer;
 const sidmaPaths={idle:'assets/heroes/sidma/idle.webp',ready:'assets/heroes/sidma/frames/attack-stance-v1.webp',dash:'assets/heroes/sidma/frames/skill2-dash-v1.webp',strike:'assets/heroes/sidma/frames/skill2-impact-v1.webp',follow:'assets/heroes/sidma/frames/recovery-v1.webp',cast:'assets/heroes/sidma/frames/cast-start-v1.webp',release:'assets/heroes/sidma/frames/release-v1.webp'};
 // Rumus Sigma's bolt. Kept out of the pose set so a slow decode delays the
 // projectile only, never the whole attack.
 const sidmaBoltPath='assets/fx/sidma/rumus-sigma/fx_sigma_projectile.webp';
 let sidmaBolt=null;
 const heroKey=()=>typeof db!=='undefined'?db?.hero:null;
 const isWira=id=>id==='wira'||id==='wirachibi';
 const heroArt=()=>heroKey()==='sidma'?sidmaArt:(heroKey()==='wirachibi'?chibiArt:art);
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),mix=(a,b,t)=>a+(b-a)*t;
 function load(src){
  if(!src)return null;if(cache.has(src))return cache.get(src);
  const record={ready:false};cache.set(src,record);
  const img=new Image();img.src=src;
  img.decode().then(()=>{
   const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
   const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
   const data=g.getImageData(0,0,c.width,c.height).data;let x=c.width,y=c.height,r=0,b=0;
   for(let iy=0;iy<c.height;iy++)for(let ix=0;ix<c.width;ix++)if(data[(iy*c.width+ix)*4+3]>25){x=Math.min(x,ix);r=Math.max(r,ix);y=Math.min(y,iy);b=Math.max(b,iy)}
   Object.assign(record,{img,x,y,w:r-x+1,h:b-y+1,ready:true});sync();
  }).catch(()=>{record.failed=true});return record;
 }
 Object.entries(paths).forEach(([key,src])=>art[key]=load(src));
 Object.entries(chibiPaths).forEach(([key,src])=>chibiArt[key]=load(src));
 Object.entries(contactPaths.wira).forEach(([key,src])=>wiraContacts[key]=load(src));
 Object.entries(contactPaths.wirachibi).forEach(([key,src])=>chibiContacts[key]=load(src));
 Object.entries(sidmaPaths).forEach(([key,src])=>sidmaArt[key]=load(src));
 sidmaBolt=load(sidmaBoltPath);
 function ensure(){
  const arena=byId('battleArena');if(!arena)return null;
  if(!canvas){canvas=document.createElement('canvas');canvas.className='paCombatMotion';canvas.setAttribute('aria-hidden','true');arena.appendChild(canvas);ctx=canvas.getContext('2d');}
  const rect=arena.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
  const width=arena.clientWidth,height=arena.clientHeight;
  if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio)}
  ctx.setTransform(ratio,0,0,ratio,0,0);
  return {arena,rect,width,height};
 }
 function clear(){if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height)}
 function geometry(img,asset,scene){
  if(!img||!asset?.ready)return null;
  const rect=img.getBoundingClientRect();if(rect.width<2||rect.height<2)return null;
  // All battle frames use contain, centred horizontally and bottom-aligned.
  const scale=Math.min(rect.width/asset.img.naturalWidth,rect.height/asset.img.naturalHeight);
  const left=rect.left-scene.rect.left-scene.arena.clientLeft+(rect.width-asset.img.naturalWidth*scale)/2+asset.x*scale;
  const top=rect.bottom-scene.rect.top-scene.arena.clientTop-asset.img.naturalHeight*scale+asset.y*scale;
  return {x:left+asset.w*scale/2,y:top+asset.h*scale,h:asset.h*scale,w:asset.w*scale};
 }
 function shadow(x,y,w,h,opacity){ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.scale(Math.max(1,w),Math.max(1,h));const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#020b12');g.addColorStop(.38,'#020b12b0');g.addColorStop(1,'#020b1200');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore()}
 const feet={idle:[[.19,.96],[.85,.99]],ready:[[.28,.99],[.71,.97]],move:[[.12,.98],[.68,.96]],strike:[[.16,.99],[.77,.98]],follow:[[.05,.99],[.47,.95]]};
 function grounded(a,p,pose){
  if(!a?.ready||!p)return;const w=p.h*a.w/a.h,s=p.h/290;
  shadow(p.x,p.y-3*s,w*.42,14*s,.3);
  if(pose)feet[pose].forEach(([fx,fy])=>shadow(p.x+(fx-.5)*w,p.y-(1-fy)*p.h+1,24*s,6*s,.85));
  else shadow(p.x,p.y,w*.28,5*s,.7);
 }
 function sprite(a,p,flash=false){ctx.save();ctx.filter=flash?'brightness(2) saturate(.4)':'brightness(.96) saturate(.96)';const w=p.h*a.w/a.h;ctx.drawImage(a.img,a.x,a.y,a.w,a.h,p.x-w/2,p.y-p.h,w,p.h);ctx.restore()}
 // Source-space foot pivots keep body scale independent of the painted Sigma
 // ring and cape. The artwork is drawn unmodified, including its own trail.
 const sidmaPivots={idle:[632,670],ready:[632,670],dash:[780,660],strike:[700,690],follow:[632,670],cast:[632,670],release:[632,670]};
 function heroGeometry(scene){
  const source=heroArt().idle,p=geometry(byId('heroIdle'),source,scene);
  if(p&&heroKey()==='sidma'){const scale=p.h/source.h;p.x+=(632-source.x-source.w/2)*scale;p.y+=(670-source.y-source.h)*scale;p.h=590*scale}
  return p;
 }
 function drawHero(key,set,pose,p,flash=false){
  if(key!=='sidma'){sprite(set[pose],p,flash);return}
  const a=set[pose],pivot=sidmaPivots[pose],scale=p.h/590;
  ctx.save();ctx.filter=flash?'brightness(2) saturate(.4)':'brightness(.96) saturate(.96)';
  ctx.drawImage(a.img,a.x,a.y,a.w,a.h,p.x+(a.x-pivot[0])*scale,p.y+(a.y-pivot[1])*scale,a.w*scale,a.h*scale);ctx.restore();
 }
 function heroShadow(key,set,pose,p){
  if(key!=='sidma'){grounded(set[pose],p,pose);return}
  const scale=p.h/590,pivot=sidmaPivots[pose];
  const contacts=pose==='dash'?[[820,660]]:pose==='strike'?[[650,688]]:[[465,666],[790,670]];
  shadow(p.x,p.y-2,100*scale,16*scale,.32);
  contacts.forEach(([x,y])=>shadow(p.x+(x-pivot[0])*scale,p.y+(y-pivot[1])*scale+1,45*scale,10*scale,.85));
 }
 function sync(){
  const arena=byId('battleArena');if(!arena)return;
  const supported=['wira','wirachibi','sidma'].includes(heroKey());arena.classList.toggle('paGroundedCombat',supported);
  const enemy=byId('enemySprite');load(enemy?.currentSrc||enemy?.getAttribute('src'));['enemyAnticipation','enemyAttack','enemyFollowThrough'].forEach(id=>{const img=byId(id);load(img?.currentSrc||img?.getAttribute('src'))});
  if(active||!canvas&&document.body.dataset.screen!=='game')return;
  const scene=ensure();clear();if(!supported||!scene||document.body.dataset.screen!=='game')return;
  if(byId('hero')?.classList.contains('attacking')||byId('enemy')?.classList.contains('attacking'))return;
  const enemyArt=load(enemy?.currentSrc||enemy?.getAttribute('src'));
  const hero=heroGeometry(scene);if(hero)heroShadow(heroKey(),heroArt(),'idle',hero);
  if(!byId('enemy')?.classList.contains('paDefeatShatter'))grounded(enemyArt,geometry(enemy,enemyArt,scene));
 }
 function reset(){cancelAnimationFrame(raf);raf=0;active=null;canvas?.setAttribute('data-phase','idle');byId('battleArena')?.classList.remove('paMotionActive');byId('battleArena')?.querySelectorAll?.('.paMotionDamage').forEach(el=>el.remove());clear();}
 function targetGeometry(){const scene=ensure(),img=byId('enemySprite');return scene?geometry(img,load(img?.currentSrc||img?.getAttribute('src')),scene):null}
 function damageAtTarget(amount){
  const p=targetGeometry(),arena=byId('battleArena');if(!p||!arena)return;
  const label=document.createElement('span');label.className='paMotionDamage';label.setAttribute('aria-hidden','true');label.textContent='−'+amount;label.style.left=p.x+'px';label.style.top=(p.y-p.h*.72)+'px';arena.appendChild(label);window.PABattlePresentation.later(()=>label.remove(),600);
 }
 // Rumus Sigma's bolt, launched on the release beat and landing on contact.
 function bolt(hero,enemy,t,min){
  const boltArt=sidmaBolt;if(!boltArt?.ready)return;
  const launch=620,land=900;if(t<launch||t>land)return;
  const q=clamp((t-launch)/(land-launch)),travelled=min?1:ease(q);
  const fromX=hero.x+hero.h*.08,fromY=hero.y-hero.h*.62;
  const toX=enemy.x,toY=enemy.y-enemy.h*.5;
  const h=hero.h*.34*(.82+q*.26),w=h*boltArt.w/boltArt.h;
  const x=mix(fromX,toX,travelled),y=mix(fromY,toY,travelled);
  ctx.save();ctx.globalAlpha=Math.min(1,q*6)*Math.min(1,(1-q)*7+.35);
  ctx.drawImage(boltArt.img,boltArt.x,boltArt.y,boltArt.w,boltArt.h,x-w/2,y-h/2,w,h);ctx.restore();
 }
 function fx(target,elapsed,color,damage,min){
  if(elapsed<0||elapsed>500)return;const q=elapsed/500,s=target.h/290;
  const px=target.x-target.w*.18,py=target.y-target.h*.5;
  ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,(9*(1-q))*s);
  ctx.beginPath();ctx.ellipse(px,py,(min?25:35+q*30)*s,12*s,-.55,-1.5,1.6);ctx.stroke();
  if(!min)for(let i=0;i<12;i++){const a=i*2.399,r=(15+q*(35+i%4*13))*s;ctx.fillStyle=color;ctx.fillRect(px+Math.cos(a)*r,py+Math.sin(a)*r,2,2)}
  ctx.font=`bold ${Math.max(16,30*s)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#102132';ctx.fillStyle='#fff';const y=py-target.h*.2-(min?0:ease(q)*22);ctx.strokeText('−'+damage,target.x,y);ctx.fillText('−'+damage,target.x,y);ctx.restore();
 }
 function begin(attackerId,targetId,finisher,damageAmount=null){
  const key=heroKey(),set=heroArt();if(finisher||!['wira','wirachibi','sidma'].includes(key)||active)return null;
  const pet=byId('battlePet'),hasPet=!!(pet&&!pet.classList.contains('hidden')&&db.rewards?.equippedPet);
  if(hasPet&&isWira(key))return null;
  sync();const scene=ensure(),enemyImg=byId('enemySprite'),enemyArt=load(enemyImg?.currentSrc||enemyImg?.getAttribute('src'));
  const contacts=key==='wirachibi'?chibiContacts:wiraContacts;
  const baseReady=Object.values(set).every(a=>a.ready),contactsReady=!isWira(key)||Object.values(contacts).every(a=>a.ready);
  if(!scene||!baseReady||!contactsReady||!enemyArt?.ready)return null;
  const hero=heroGeometry(scene),enemy=geometry(enemyImg,enemyArt,scene);if(!hero||!enemy)return null;
  const heroAttacks=attackerId==='hero'&&targetId==='enemy';if(!heroAttacks&&!(attackerId==='enemy'&&targetId==='hero'))return null;
  const variant=heroAttacks&&isWira(key)?(window.PAActionVariety?.pick?.(key)||{id:'dash'}):null;
  const renderSet=variant?{...set,strike:contacts[variant.id]||contacts.dash}:set;
  const enemyFrames=['enemyAnticipation','enemyAttack','enemyFollowThrough'].map(id=>{const img=byId(id);return load(img?.currentSrc||img?.getAttribute('src'))});
  const lead=heroAttacks&&hasPet?420:0;
  // Sidma alternates Rumus Sigma (stationary cast) and Jejak Sigma (dash).
  // The hero module owns the counter so the DOM fallback stays in step.
  const ranged=heroAttacks&&key==='sidma'&&window.PASidmaBattle?.getNextNormalSkill?.()===1;
  const sidmaContact=ranged?900:650;
  const contactDelay=(heroAttacks?(key==='sidma'?sidmaContact:470):390)+lead;
  const completionDelay=(heroAttacks?(ranged?1500:1400):1100)+lead;
  const min=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const requestedDamage=Number(damageAmount),visualDamage=heroAttacks&&(Number.isFinite(requestedDamage)?Math.max(0,requestedDamage):4);active={hero,enemy,enemyArt,enemyFrames,heroAttacks,scene,min,contactDelay,completionDelay,start:performance.now(),damage:heroAttacks?visualDamage:3,impacted:false,key,set:renderSet,lead,ranged,variant:variant?.id||null};
  if(heroAttacks&&key==='sidma')window.PASidmaBattle?.advanceNormalSkill?.();
  scene.arena.classList.add('paMotionActive');
  if(lead&&typeof triggerPetFollowUp==='function')triggerPetFollowUp(byId('enemy'),0);
  if(key==='sidma'&&heroAttacks)window.PABattlePresentation.later(()=>{if(typeof playSidmaSfx==='function')playSidmaSfx('release')},lead+(ranged?620:180));
  // These timers share the battle journey's cancellation boundary.
  window.PABattlePresentation.later(()=>{
   if(!active)return;active.impacted=true;
   if(key==='sidma'&&heroAttacks&&typeof playSidmaSfx==='function')playSidmaSfx('impact');
   else if(typeof playSfx==='function')playSfx(heroAttacks?'wiraSword':'hit');
  },contactDelay);
  window.PABattlePresentation.later(()=>{reset();sync()},completionDelay);
  raf=requestAnimationFrame(render);
  return {contactDelay,completionDelay,defeatDelay:contactDelay+300,motion:true};
 }
 function render(now){
  const a=active;if(!a)return;if(document.body.dataset.screen!=='game'){reset();return}
  const elapsed=now-a.start,t=elapsed-a.lead,hit=elapsed-a.contactDelay,hero={...a.hero},enemy={...a.enemy};let pose='idle',enemyArt=a.enemyArt;
  clear();const travel=Math.max(0,a.enemy.x-a.hero.x-a.enemy.w*.35-a.hero.h*.28);
  const s=a.hero.h/290;
  if(a.heroAttacks&&a.key==='sidma'&&a.ranged){
   // Rumus Sigma is a stationary cast: no travel, the bolt covers the gap.
   // Every phase is eased so the pose swaps never read as hard cuts.
   if(t<0)pose='idle';
   else if(t<200){pose='ready';hero.x-=a.min?0:3*s*ease(t/200)}
   else if(t<620){pose='cast';hero.x-=a.min?0:3*s;hero.h*=a.min?1:1+.03*Math.sin(clamp((t-200)/420)*Math.PI)}
   else if(t<800){pose='release';hero.x+=a.min?0:mix(-3*s,6*s,ease((t-620)/180))}
   else if(t<1150){pose='follow';hero.x+=a.min?0:6*s*(1-ease((t-800)/350))}
   else pose='follow';
   if(hit>=0&&!a.min)enemy.x+=12*s*Math.exp(-hit/190)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }else if(a.heroAttacks&&a.key==='sidma'){
   const sidmaTravel=Math.max(0,a.enemy.x-a.enemy.w*.2-a.hero.x-a.hero.h*.67);
   if(t<0)pose='idle';
   else if(t<180){pose='ready';hero.x-=a.min?0:4*s*ease(t/180)}
   else if(t<530){pose='dash';hero.x+=a.min?0:sidmaTravel*ease((t-180)/350)}
   else if(t<740){pose='strike';hero.x+=a.min?0:sidmaTravel}
   else if(t<1120){pose='dash';hero.x+=a.min?0:sidmaTravel*(1-ease((t-740)/380))}
   else if(t<1320)pose='follow';
   if(hit>=0&&!a.min)enemy.x+=12*s*Math.exp(-hit/190)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
   if(a.lead&&elapsed>=360&&elapsed<580&&!a.min)enemy.x+=5*s*Math.exp(-(elapsed-360)/100);
  }else if(a.heroAttacks){
   // Wira family uses the same four semantic beats. Wira Chibi only swaps art.
   // #3 anticipation -> #2 attack/movement -> #5/#4/#6 contact -> #7 follow-through.
   if(t<180){pose='ready';hero.x-=a.min?0:6*s*ease(t/180)}
   else if(t<430){pose='move';hero.x+=a.min?0:mix(-6*s,travel,ease((t-180)/250))}
   else if(t<620){pose='strike';hero.x+=a.min?0:travel}
   else if(t<900){pose='follow';hero.x+=a.min?0:travel}
   else{pose='follow';hero.x+=a.min?0:travel*(1-ease((t-900)/470))}
   const strikeT=clamp((t-390)/220),bump=Math.max(0,1-Math.pow(2*strikeT-1,2));
   hero.h*=1+(20/290)*bump;
   if(hit>=0&&!a.min)enemy.x+=12*s*Math.exp(-hit/190)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }else{
   const move=a.min?0:Math.max(0,a.enemy.x-a.hero.x-a.hero.w*.35-a.enemy.h*.28);
   if(t<170){enemy.x+=5*s*ease(t/170);enemyArt=a.enemyFrames[0]?.ready?a.enemyFrames[0]:enemyArt}
   else if(t<470){enemy.x-=move*ease((t-170)/220);enemyArt=a.enemyFrames[1]?.ready?a.enemyFrames[1]:enemyArt}
   else{enemy.x-=move*(1-ease((t-470)/430));enemyArt=t<680&&a.enemyFrames[2]?.ready?a.enemyFrames[2]:enemyArt}
   if(hit>=0&&!a.min)hero.x-=10*s*Math.exp(-hit/180)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }
  if(a.pose!==pose){a.pose=pose;canvas.setAttribute('data-phase',pose)}
  heroShadow(a.key,a.set,pose,hero);grounded(enemyArt,enemy);
  sprite(enemyArt,enemy,a.heroAttacks&&hit>=0&&hit<80);drawHero(a.key,a.set,pose,hero,!a.heroAttacks&&hit>=0&&hit<80);
  if(a.ranged)bolt(hero,enemy,t,a.min);
  const target=a.heroAttacks?enemy:hero;fx(target,hit,a.heroAttacks?(a.key==='sidma'?'#ffb849':'#a6efff'):'#ffcb9a',a.damage,a.min);
  raf=requestAnimationFrame(render);
 }
 window.PACombatMotion={begin,reset,sync,targetGeometry,damageAtTarget,isActive:()=>!!active};
 const mount=()=>{
  observer=new MutationObserver(()=>{if(active&&document.body.dataset.screen!=='game')reset();sync()});observer.observe(document.body,{attributes:true,attributeFilter:['data-screen']});
  const enemy=byId('enemySprite');if(enemy){enemy.addEventListener('load',sync);new MutationObserver(sync).observe(enemy,{attributes:true,attributeFilter:['src']})}
  if(typeof ResizeObserver!=='undefined'){const ro=new ResizeObserver(()=>{if(active){const scene=ensure();const hero=heroGeometry(scene),enemy=geometry(byId('enemySprite'),active.enemyArt,scene);if(hero&&enemy)Object.assign(active,{scene,hero,enemy});}else sync()});ro.observe(byId('battleArena'))}
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
