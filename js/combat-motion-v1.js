/* Canonical-image combat presentation. Gameplay owns damage; this layer owns
   pixels, sound and the displayed HP deadline. Every hero uses its approved
   idle image; motion is expressed with transforms and abstract effects. */
(()=>{
 'use strict';
 const byId=id=>document.getElementById(id),cache=new Map();
 const paths={wira:'assets/heroes/wira/idle.webp',bunga:'assets/heroes/bunga/idle.webp',sidma:'assets/heroes/sidma/idle.webp'};
 const art={};let canvas,ctx,active=null,raf=0,observer;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),mix=(a,b,t)=>a+(b-a)*t;
 const heroKey=()=>{const key=typeof db!=='undefined'?db?.hero:null;return key==='wirachibi'?'wira':paths[key]?key:null};
 function load(src){
  if(!src)return null;if(cache.has(src))return cache.get(src);
  const record={ready:false};cache.set(src,record);const img=new Image();img.src=src;
  const decoded=()=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x=c.width,y=c.height,r=-1,b=-1;for(let iy=0;iy<c.height;iy++)for(let ix=0;ix<c.width;ix++)if(d[(iy*c.width+ix)*4+3]>25){x=Math.min(x,ix);r=Math.max(r,ix);y=Math.min(y,iy);b=Math.max(b,iy)}Object.assign(record,{img,x,y,w:Math.max(1,r-x+1),h:Math.max(1,b-y+1),ready:true});sync()};
  (img.decode?img.decode():Promise.resolve()).then(decoded).catch(()=>{record.failed=true});return record;
 }
 Object.entries(paths).forEach(([key,src])=>art[key]=load(src));
 function ensure(){const arena=byId('battleArena');if(!arena)return null;if(!canvas){canvas=document.createElement('canvas');canvas.className='paCombatMotion';canvas.setAttribute('aria-hidden','true');arena.appendChild(canvas);ctx=canvas.getContext('2d')}const ratio=Math.min(window.devicePixelRatio||1,3),width=arena.clientWidth,height=arena.clientHeight;if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio)}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.imageSmoothingEnabled=true;if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';return {arena,rect:arena.getBoundingClientRect(),width,height}}
 function clear(){if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height)}
 function geometry(img,a,scene){if(!img||!a?.ready)return null;const rect=img.getBoundingClientRect();if(rect.width<2||rect.height<2)return null;const scale=Math.min(rect.width/a.img.naturalWidth,rect.height/a.img.naturalHeight);const left=rect.left-scene.rect.left-scene.arena.clientLeft+(rect.width-a.img.naturalWidth*scale)/2+a.x*scale;const top=rect.bottom-scene.rect.top-scene.arena.clientTop-a.img.naturalHeight*scale+a.y*scale;return {x:left+a.w*scale/2,y:top+a.h*scale,h:a.h*scale,w:a.w*scale}}
 function shadow(x,y,w,h,opacity){ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.scale(Math.max(1,w),Math.max(1,h));const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#020b12');g.addColorStop(.38,'#020b12b0');g.addColorStop(1,'#020b1200');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore()}
 function grounded(a,p){if(!a?.ready||!p)return;const s=p.h/290;shadow(p.x,p.y-3*s,p.w*.42,14*s,.3);shadow(p.x,p.y+1,Math.max(18,p.w*.28),6*s,.75)}
 function sprite(a,p,flash=false,scaleX=1){if(!a?.ready||!p)return;ctx.save();ctx.filter=flash?'brightness(2) saturate(.4)':'brightness(.96) saturate(.96)';const w=p.h*a.w/a.h*scaleX;ctx.translate(p.x,p.y-p.h);ctx.scale(scaleX,1);ctx.drawImage(a.img,a.x,a.y,a.w,a.h,-w/(2*scaleX),0,w/scaleX,p.h);ctx.restore()}
 function heroGeometry(scene){const key=heroKey();return key?geometry(byId('heroIdle'),art[key],scene):null}
 function drawBolt(hero,enemy,t,min,color,contact){
  const launch=Math.max(0,contact-280),landing=contact;
  if(min){if(t<contact-30||t>contact+30)return}
  else if(t<launch||t>landing)return;
  const q=min?1:clamp((t-launch)/(landing-launch));
  const x=mix(hero.x+hero.w*.18,enemy.x,q),y=mix(hero.y-hero.h*.58,enemy.y-enemy.h*.52,q),s=hero.h/290;
  ctx.save();ctx.globalAlpha=min?Math.max(0,1-Math.abs(t-contact)/30):Math.min(1,q*6)*Math.min(1,(1-q)*7+.35);
  ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=14*s;ctx.beginPath();ctx.arc(x,y,Math.max(5,12*s),0,Math.PI*2);ctx.fill();ctx.restore()
 }
 function fx(target,elapsed,color,damage,min){if(elapsed<0||elapsed>500)return;const q=elapsed/500,s=target.h/290,px=target.x-target.w*.18,py=target.y-target.h*.5;ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,9*(1-q)*s);ctx.beginPath();ctx.ellipse(px,py,(min?25:35+q*30)*s,12*s,-.55,-1.5,1.6);ctx.stroke();if(!min)for(let i=0;i<12;i++){const aa=i*2.399,r=(15+q*(35+i%4*13))*s;ctx.fillStyle=color;ctx.fillRect(px+Math.cos(aa)*r,py+Math.sin(aa)*r,2,2)}ctx.font=`bold ${Math.max(16,30*s)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#102132';ctx.fillStyle='#fff';const yy=py-target.h*.2-(min?0:ease(q)*22);ctx.strokeText('−'+damage,target.x,yy);ctx.fillText('−'+damage,target.x,yy);ctx.restore()}
 function sync(){const arena=byId('battleArena');if(!arena)return;const supported=!!paths[heroKey()];arena.classList.toggle('paGroundedCombat',supported);const enemy=byId('enemySprite');load(enemy?.currentSrc||enemy?.getAttribute('src'));if(active||!canvas&&document.body.dataset.screen!=='game')return;const scene=ensure();clear();if(!supported||!scene||document.body.dataset.screen!=='game')return;if(byId('hero')?.classList.contains('attacking')||byId('enemy')?.classList.contains('attacking'))return;const enemyArt=load(enemy?.currentSrc||enemy?.getAttribute('src'));const hero=heroGeometry(scene);if(hero)grounded(art[heroKey()],hero);if(!byId('enemy')?.classList.contains('paDefeatShatter'))grounded(enemyArt,geometry(enemy,enemyArt,scene))}
 function reset(){cancelAnimationFrame(raf);raf=0;active=null;canvas?.setAttribute('data-phase','idle');byId('battleArena')?.classList.remove('paMotionActive');byId('battleArena')?.querySelectorAll?.('.paMotionDamage').forEach(el=>el.remove());clear()}
 function targetGeometry(){const scene=ensure(),img=byId('enemySprite');return scene?geometry(img,load(img?.currentSrc||img?.getAttribute('src')),scene):null}
 function damageAtTarget(amount){const p=targetGeometry(),arena=byId('battleArena');if(!p||!arena)return;const label=document.createElement('span');label.className='paMotionDamage';label.setAttribute('aria-hidden','true');label.textContent='−'+amount;label.style.left=p.x+'px';label.style.top=(p.y-p.h*.72)+'px';arena.appendChild(label);window.PABattlePresentation?.later?.(()=>label.remove(),600)}
 function begin(attackerId,targetId,finisher,damageAmount=null){
  const key=heroKey();
  if(finisher||!key||!paths[key]||active)return null;
  sync();
  const scene=ensure(),enemyImg=byId('enemySprite'),enemyArt=load(enemyImg?.currentSrc||enemyImg?.getAttribute('src'));
  if(!scene||!art[key]?.ready||!enemyArt?.ready)return null;
  const heroAttacks=attackerId==='hero'&&targetId==='enemy';
  if(!heroAttacks&&!(attackerId==='enemy'&&targetId==='hero'))return null;
  const hero=heroGeometry(scene),enemy=geometry(enemyImg,enemyArt,scene);if(!hero||!enemy)return null;
  const enemyFrames=['enemyAnticipation','enemyAttack','enemyFollowThrough'].map(id=>{const img=byId(id);return load(img?.currentSrc||img?.getAttribute('src'))});
  const pet=byId('battlePet'),hasPet=!!(pet&&!pet.classList.contains('hidden')&&typeof db!=='undefined'&&db.rewards?.equippedPet),lead=heroAttacks&&hasPet?420:0;
  const contact=heroAttacks?(key==='wira'?470:key==='sidma'?900:620):390,completion=heroAttacks?(key==='sidma'?1500:key==='wira'?1400:1250):1100,min=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numericDamage=Number(damageAmount),damage=heroAttacks&&damageAmount!=null&&Number.isFinite(numericDamage)?Math.max(0,numericDamage):heroAttacks?4:3;
  active={hero,enemy,enemyArt,enemyFrames,heroAttacks,scene,min,contactDelay:contact+lead,completionDelay:completion+lead,start:performance.now(),damage,impacted:false,key,lead,contact};
  scene.arena.classList.add('paMotionActive');
  if(lead&&typeof triggerPetFollowUp==='function')triggerPetFollowUp(byId('enemy'),0);
  window.PABattlePresentation?.later?.(()=>{if(active){active.impacted=true;typeof playSfx==='function'&&playSfx(heroAttacks?(key==='wira'?'wiraSword':'hit'):'hit')}},contact+lead);
  window.PABattlePresentation?.later?.(()=>{reset();sync()},completion+lead);
  raf=requestAnimationFrame(render);
  return {contactDelay:contact+lead,completionDelay:completion+lead,defeatDelay:contact+lead+300,motion:true}
 }
 function render(now){
  const a=active;if(!a)return;if(document.body.dataset.screen!=='game'){reset();return}
  const elapsed=now-a.start,t=elapsed-a.lead,hit=elapsed-a.contactDelay,hero={...a.hero},enemy={...a.enemy};let enemyArt=a.enemyArt;
  clear();const travel=Math.max(0,a.enemy.x-a.hero.x-a.enemy.w*.35-a.hero.h*.28),s=a.hero.h/290;
  if(a.heroAttacks){
   if(a.key==='wira'){
    if(t<220)hero.x-=a.min?0:6*s*ease(Math.max(0,t)/220);
    else if(t<470)hero.x+=a.min?0:mix(-6*s,travel,ease((t-220)/250));
    else if(t<550)hero.x+=a.min?0:travel;
    else if(t<1000)hero.x+=a.min?0:travel*(1-ease((t-550)/450));
   }else if(t>=0&&t<180)hero.x-=a.min?0:4*s*ease(t/180);
   else if(t>=180&&t<520)hero.x+=a.min?0:2*s*Math.sin(Math.PI*(t-180)/340);
  }else{
   const move=a.min?0:Math.max(0,a.enemy.x-a.hero.x-a.hero.w*.35-a.enemy.h*.28);
   if(t<170){enemy.x+=5*s*ease(t/170);if(a.enemyFrames[0]?.ready)enemyArt=a.enemyFrames[0]}
   else if(t<470){enemy.x-=move*ease((t-170)/220);if(a.enemyFrames[1]?.ready)enemyArt=a.enemyFrames[1]}
   else{enemy.x-=move*(1-ease((t-470)/430));if(t<680&&a.enemyFrames[2]?.ready)enemyArt=a.enemyFrames[2]}
   if(hit>=0&&!a.min)hero.x-=10*s*Math.exp(-hit/180)*Math.sin(Math.min(hit/60,1)*Math.PI/2);
  }
  if(a.pose!=='attack'){a.pose='attack';canvas.setAttribute('data-phase',a.heroAttacks?'attack':'enemy-attack')}
  grounded(art[a.key],hero);grounded(enemyArt,enemy);sprite(enemyArt,enemy,a.heroAttacks&&hit>=0&&hit<80);
  sprite(art[a.key],hero,!a.heroAttacks&&hit>=0&&hit<80,a.heroAttacks&&a.key==='wira'&&t>250&&t<570?1.04:1);
  if(a.heroAttacks&&a.key!=='wira')drawBolt(hero,enemy,t,a.min,a.key==='sidma'?'#ffb849':'#b4edff',a.contact);
  fx(a.heroAttacks?enemy:hero,hit,a.heroAttacks?(a.key==='sidma'?'#ffb849':a.key==='bunga'?'#b4edff':'#a6efff'):'#ffcb9a',a.damage,a.min);
  raf=requestAnimationFrame(render)
 }
 window.PACombatMotion={begin,reset,sync,targetGeometry,damageAtTarget,isActive:()=>!!active};
 const mount=()=>{observer=new MutationObserver(()=>{if(active&&document.body.dataset.screen!=='game')reset();sync()});observer.observe(document.body,{attributes:true,attributeFilter:['data-screen']});const enemy=byId('enemySprite');if(enemy){enemy.addEventListener('load',sync);new MutationObserver(sync).observe(enemy,{attributes:true,attributeFilter:['src']})}if(typeof ResizeObserver!=='undefined'){const ro=new ResizeObserver(()=>{if(active){const scene=ensure(),hero=heroGeometry(scene),enemy=geometry(byId('enemySprite'),active.enemyArt,scene);if(hero&&enemy)Object.assign(active,{scene,hero,enemy})}else sync()});ro.observe(byId('battleArena'))}sync()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
