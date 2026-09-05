/* Isolated motion study: no game state, storage, or production hooks. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d');
const files={bg:'battlefields/forest-temple/arena-v1.webp',idle:'heroes/wira/idle.webp',ready:'heroes/wira/frames/anticipation-v1.webp',strike:'heroes/wira/frames/attack-arc-v2.webp',follow:'heroes/wira/frames/follow-through-v1.webp',enemy:'enemies/operations/jeneral-tambah-tolak.webp'};
const art={};let running=false,time=0,last=0,impacted=false,clock=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');$('motion').checked=reduced.matches;
const audio=new Audio('../assets/audio/wira-heavy-metal-sword.wav');audio.volume=.35;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),mix=(a,b,t)=>a+(b-a)*t;
function crop(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>25){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return {img,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}}
function sprite(a,x,y,h,angle=0,flash=false){const w=h*a.w/a.h;ctx.save();ctx.translate(x,y);ctx.rotate(angle);if(flash)ctx.filter='brightness(2.5) saturate(.25)';ctx.drawImage(a.img,a.x,a.y,a.w,a.h,-w/2,-h,w,h);ctx.restore()}
function shadow(x,y,w,depth=13,opacity=.67){ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.scale(w,depth);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#020b12');g.addColorStop(.38,'#020b12b0');g.addColorStop(1,'#020b1200');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore()}
function phase(i,text){[...$('phases').children].forEach((el,n)=>el.classList.toggle('active',n===i));if($('caption').textContent!==text)$('caption').textContent=text}
function reset(){running=false;time=0;impacted=false;$('health').style.width='100%';$('hp').textContent='360 / 360 HP';$('attack').disabled=!art.enemy;audio.pause();audio.currentTime=0;phase(-1,'Bersedia untuk bertarung')}
function attack(){if(running||!art.enemy)return;reset();running=true;$('attack').disabled=true;phase(0,'TEBASAN AIS');}
$('attack').onclick=attack;$('reset').onclick=reset;document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();attack()}});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)reset()});
function frame(now){const dt=last?Math.min(now-last,40):0;last=now;clock+=dt;if(running)time+=dt*Number($('speed').value);const t=time,min=$('motion').checked;
ctx.clearRect(0,0,1280,720);if(!art.enemy){requestAnimationFrame(frame);return}
ctx.save();const hit=t-470;if(running&&!min&&hit>=0&&hit<200){const amp=6*(1-hit/200);ctx.translate(Math.sin(hit*.17)*amp,Math.cos(hit*.22)*amp*.55)}
const bg=art.bg.img,scale=Math.max(1280/bg.width,720/bg.height);ctx.drawImage(bg,(1280-bg.width*scale)/2,(720-bg.height*scale)/2,bg.width*scale,bg.height*scale);ctx.fillStyle='#071d244f';ctx.fillRect(0,0,1280,720);const vignette=ctx.createLinearGradient(0,0,0,720);vignette.addColorStop(0,'#05101bd9');vignette.addColorStop(.35,'#05101b00');vignette.addColorStop(1,'#05101b99');ctx.fillStyle=vignette;ctx.fillRect(0,0,1280,720);
const ground=590;let x=340,y=ground,pose=art.idle,angle=0;const idle=min?0:Math.sin(clock*.0025)*.65;
if(running){if(t<220){pose=art.ready;x-=18*ease(t/220);phase(0,'BERSEDIA')}else if(t<470){pose=art.ready;x=mix(322,680,ease((t-220)/250));phase(1,'TEBASAN AIS')}else if(t<550){pose=art.strike;x=690;phase(2,'HENTAMAN')}else if(t<850){pose=art.follow;x=mix(690,707,ease((t-550)/300));phase(3,'KENA TEPAT')}else{pose=art.idle;x=mix(707,340,ease((t-850)/420));phase(4,'KEMBALI')}}
if(min){x=340;y=ground}
let ex=955,ea=0;if(hit>=0&&running&&!min){ex+=34*Math.exp(-hit/220)*Math.sin(Math.min(hit/80,1)*Math.PI/2);ea=0}
// Feet are authored at different depths; contact shadows follow each sole,
// not the centre of the artwork (which includes weapons and transparent space).
const heroHeight=(pose===art.strike?310:290)+(running?0:idle);
const enemyHeight=335+idle;
const heroFeet=pose===art.ready?[[.28,.99],[.71,.97]]:pose===art.strike?[[.16,.99],[.77,.98]]:pose===art.follow?[[.05,.99],[.47,.95]]:[[.19,.96],[.85,.99]];
function grounded(a,cx,base,h,feet){const w=h*a.w/a.h;const points=feet.map(([fx,fy])=>[cx+(fx-.5)*w,base-(1-fy)*h]);const middle=(points[0][0]+points[1][0])/2;shadow(middle,base-6,Math.abs(points[1][0]-points[0][0])*.6+30,16,.32);points.forEach(([fx,fy])=>shadow(fx,fy+1,24,6,.85));}
grounded(pose,x,ground,heroHeight,heroFeet);grounded(art.enemy,ex,ground,enemyHeight,[[.20,.90],[.92,.99]]);
if(running&&!min&&t>260&&t<470){for(let i=3;i>0;i--){ctx.globalAlpha=.075*(4-i);sprite(pose,x-i*37,y,290)}ctx.globalAlpha=1;ctx.strokeStyle='#b5f6ef70';ctx.lineWidth=3;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x-190-i*11,465+i*19);ctx.lineTo(x-85,465+i*19);ctx.stroke()}}
sprite(art.enemy,ex,ground,enemyHeight,ea,hit>=0&&hit<95&&running);sprite(pose,x,y,heroHeight,angle);
if(running&&hit>=0&&hit<480){const q=hit/480,px=ex-(335*art.enemy.w/art.enemy.h)*.22,py=ground-enemyHeight*.48;ctx.save();ctx.globalAlpha=1-q;ctx.translate(px,py);ctx.rotate(-.55);ctx.shadowBlur=25;ctx.shadowColor='#72ebff';ctx.strokeStyle='#a0efff';ctx.lineWidth=14*(1-q)+1;ctx.beginPath();ctx.ellipse(-20,0,100+q*40,27,0,-1.3,1.5);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();ctx.shadowBlur=0;for(let i=0;i<18;i++){const a=i*2.399,r=25+q*(60+(i%5)*19);ctx.fillStyle=i%3?'#a6f4ff':'#fff';ctx.fillRect(Math.cos(a)*r,Math.sin(a)*r,3+(i%3),2)}ctx.restore();ctx.save();ctx.globalAlpha=clamp(hit/35)*(1-clamp((hit-300)/400));ctx.textAlign='center';ctx.font='bold 55px system-ui';ctx.lineWidth=6;ctx.strokeStyle='#123140';ctx.fillStyle='#edfcff';const dy=338-ease(hit/480)*65;ctx.strokeText('128',ex,dy);ctx.fillText('128',ex,dy);ctx.restore()}
ctx.restore();if(running&&t>=470&&!impacted){impacted=true;$('health').style.width=(232/360*100)+'%';$('hp').textContent='232 / 360 HP';if($('sound').checked){audio.currentTime=0;audio.play().catch(()=>{})}}
if(running&&t>=1320){running=false;$('attack').disabled=false;phase(-1,'TEBASAN SELESAI · MAINKAN SEMULA')}
requestAnimationFrame(frame)}
Promise.all(Object.entries(files).map(async([key,file])=>{const img=new Image();img.src='../assets/'+file;await img.decode();art[key]=key==='bg'?{img}:crop(img)})).then(()=>{reset();requestAnimationFrame(frame)}).catch(()=>{$('caption').textContent='Aset gagal dimuatkan. Buka preview melalui server tempatan.'});
window.PACombatPreview={play:attack,reset,getState:()=>({running,time,impacted,hp:impacted?232:360,loaded:Object.keys(art).length})};
})();
