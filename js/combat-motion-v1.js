/* Wira's approved motion study, rendered over the live arena. Gameplay owns
   damage; this layer owns only pixels, sound and the displayed HP deadline. */
(()=>{
 'use strict';
 const byId=id=>document.getElementById(id),cache=new Map();
 const paths={idle:'assets/heroes/wira/idle.webp',ready:'assets/heroes/wira/frames/anticipation-v1.webp',strike:'assets/heroes/wira/frames/attack-arc-v2.webp',follow:'assets/heroes/wira/frames/follow-through-v1.webp'};
 const art={};let canvas,ctx,active=null,raf=0,observer;
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
 const feet={idle:[[.19,.96],[.85,.99]],ready:[[.28,.99],[.71,.97]],strike:[[.16,.99],[.77,.98]],follow:[[.05,.99],[.47,.95]]};
 function grounded(a,p,pose){
  if(!a?.ready||!p)return;const w=p.h*a.w/a.h,s=p.h/290;
  shadow(p.x,p.y-3*s,w*.42,14*s,.3);
  if(pose)feet[pose].forEach(([fx,fy])=>shadow(p.x+(fx-.5)*w,p.y-(1-fy)*p.h+1,24*s,6*s,.85));
  else shadow(p.x,p.y,w*.28,5*s,.7);
 }
 function sprite(a,p,flash=false){ctx.save();ctx.filter=flash?'brightness(2) saturate(.4)':'brightness(.96) saturate(.96)';const w=p.h*a.w/a.h;ctx.drawImage(a.img,a.x,a.y,a.w,a.h,p.x-w/2,p.y-p.h,w,p.h);ctx.restore()}
 function sync(){
  const arena=byId('battleArena');if(!arena)return;
  const wira=typeof db!=='undefined'&&db?.hero==='wira';arena.classList.toggle('paGroundedWira',wira);
  const enemy=byId('enemySprite');load(enemy?.currentSrc||enemy?.getAttribute('src'));['enemyAnticipation','enemyAttack','enemyFollowThrough'].forEach(id=>{const img=byId(id);load(img?.currentSrc||img?.getAttribute('src'))});
  if(active||!canvas&&document.body.dataset.screen!=='game')return;
  const scene=ensure();clear();if(!wira||!scene||document.body.dataset.screen!=='game')return;
  if(byId('hero')?.classList.contains('attacking')||byId('enemy')?.classList.contains('attacking'))return;
  const enemyArt=load(enemy?.currentSrc||enemy?.getAttribute('src'));
  grounded(art.idle,geometry(byId('heroIdle'),art.idle,scene),'idle');
  if(!byId('enemy')?.classList.contains('paDefeatShatter'))grounded(enemyArt,geometry(enemy,enemyArt,scene));
 }
 function reset(){cancelAnimationFrame(raf);raf=0;active=null;byId('battleArena')?.classList.remove('paMotionActive');clear();}
 function fx(target,elapsed,color,damage,min){
  if(elapsed<0||elapsed>500)return;const q=elapsed/500,s=target.h/290;
  const px=target.x-target.w*.18,py=target.y-target.h*.5;
  ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,(9*(1-q))*s);
  ctx.beginPath();ctx.ellipse(px,py,(min?25:35+q*30)*s,12*s,-.55,-1.5,1.6);ctx.stroke();
  if(!min)for(let i=0;i<12;i++){const a=i*2.399,r=(15+q*(35+i%4*13))*s;ctx.fillStyle=color;ctx.fillRect(px+Math.cos(a)*r,py+Math.sin(a)*r,2,2)}
  ctx.font=`bold ${Math.max(16,30*s)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#102132';ctx.fillStyle='#fff';const y=py-target.h*.2-(min?0:ease(q)*22);ctx.strokeText('−'+damage,target.x,y);ctx.fillText('−'+damage,target.x,y);ctx.restore();
 }
 function begin(attackerId,targetId,finisher){
  if(finisher||typeof db==='undefined'||db?.hero!=='wira'||active)return null;
  const pet=byId('battlePet');if(pet&&!pet.classList.contains('hidden')&&db.rewards?.equippedPet)return null;
  sync();const scene=ensure(),enemyImg=byId('enemySprite'),enemyArt=load(enemyImg?.currentSrc||enemyImg?.getAttribute('src'));
  if(!scene||!Object.values(art).every(a=>a.ready)||!enemyArt?.ready)return null;
  const hero=geometry(byId('heroIdle'),art.idle,scene),enemy=geometry(enemyImg,enemyArt,scene);if(!hero||!enemy)return null;
  const heroAttacks=attackerId==='hero'&&targetId==='enemy';if(!heroAttacks&&!(attackerId==='enemy'&&targetId==='hero'))return null;
  const enemyFrames=['enemyAnticipation','enemyAttack','enemyFollowThrough'].map(id=>{const img=byId(id);return load(img?.currentSrc||img?.getAttribute('src'))});
  const contactDelay=heroAttacks?470:390,completionDelay=heroAttacks?1400:1100;
  const min=matchMedia('(prefers-reduced-motion: reduce)').matches;
  active={hero,enemy,enemyArt,enemyFrames,heroAttacks,scene,min,contactDelay,completionDelay,start:performance.now(),damage:heroAttacks?4:3,impacted:false};
  scene.arena.classList.add('paMotionActive');
  // These timers share the battle journey's cancellation boundary.
  window.PABattlePresentation.later(()=>{
   if(!active)return;active.impacted=true;
   if(typeof playSfx==='function')playSfx(heroAttacks?'wiraSword':'hit');
  },contactDelay);
  window.PABattlePresentation.later(()=>{reset();sync()},completionDelay);
  raf=requestAnimationFrame(render);
  return {contactDelay,completionDelay,defeatDelay:contactDelay+300,motion:true};
 }
 function render(now){
  const a=active;if(!a)return;if(document.body.dataset.screen!=='game'){reset();return}
  const t=now-a.start,hit=t-a.contactDelay,hero={...a.hero},enemy={...a.enemy};let pose='idle',enemyArt=a.enemyArt;
  clear();const travel=Math.max(0,a.enemy.x-a.hero.x-a.enemy.w*.35-a.hero.h*.28);
  const s=a.hero.h/290;
  if(a.heroAttacks){
   if(t<220){pose='ready';hero.x-=a.min?0:6*s*ease(t/220)}
   else if(t<470){pose='ready';hero.x+=a.min?0:mix(-6*s,travel,ease((t-220)/250))}
   else if(t<550){pose='strike';hero.x+=a.min?0:travel;hero.h*=310/290}
   else if(t<850){pose='follow';hero.x+=a.min?0:travel}
   else hero.x+=a.min?0:travel*(1-ease((t-850)/470));
   if(hit>=0&&!a.min)enemy.x+=12*s*Math.exp(-hit/190)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }else{
   const move=a.min?0:Math.max(0,a.enemy.x-a.hero.x-a.hero.w*.35-a.enemy.h*.28);
   if(t<170){enemy.x+=5*s*ease(t/170);enemyArt=a.enemyFrames[0]?.ready?a.enemyFrames[0]:enemyArt}
   else if(t<470){enemy.x-=move*ease((t-170)/220);enemyArt=a.enemyFrames[1]?.ready?a.enemyFrames[1]:enemyArt}
   else{enemy.x-=move*(1-ease((t-470)/430));enemyArt=t<680&&a.enemyFrames[2]?.ready?a.enemyFrames[2]:enemyArt}
   if(hit>=0&&!a.min)hero.x-=10*s*Math.exp(-hit/180)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }
  grounded(art[pose],hero,pose);grounded(enemyArt,enemy);
  sprite(enemyArt,enemy,a.heroAttacks&&hit>=0&&hit<80);sprite(art[pose],hero,!a.heroAttacks&&hit>=0&&hit<80);
  const target=a.heroAttacks?enemy:hero;fx(target,hit,a.heroAttacks?'#a6efff':'#ffcb9a',a.damage,a.min);
  raf=requestAnimationFrame(render);
 }
 window.PACombatMotion={begin,reset,sync,isActive:()=>!!active};
 const mount=()=>{
  observer=new MutationObserver(()=>{if(active&&document.body.dataset.screen!=='game')reset();sync()});observer.observe(document.body,{attributes:true,attributeFilter:['data-screen']});
  const enemy=byId('enemySprite');if(enemy){enemy.addEventListener('load',sync);new MutationObserver(sync).observe(enemy,{attributes:true,attributeFilter:['src']})}
  if(typeof ResizeObserver!=='undefined'){const ro=new ResizeObserver(()=>{if(active){const scene=ensure();const hero=geometry(byId('heroIdle'),art.idle,scene),enemy=geometry(byId('enemySprite'),active.enemyArt,scene);if(hero&&enemy)Object.assign(active,{scene,hero,enemy});}else sync()});ro.observe(byId('battleArena'))}
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
