/* Pahlawan Angka — 2.5D worksheet graphics (HTML5 canvas).
   Paints the same semantic visual specs the app renders as SVG
   (questions/v2 renderers/d3/p0-kssr.js) as raised, lit blocks for print.
   Rules: draw only what the spec gives (never compute or reveal an answer),
   one light source (top-left), one ground shadow, PA print palette.
   window.PAWorksheet25D = { supports(spec), height(spec,width), draw(ctx,spec,width) } */
(function(root){
'use strict';
const C={ink:'#17263a',line:'#2b3d57',muted:'#5d6b80',face:'#e9eef8',accent:'#4f83d1',gold:'#f1c645',goldInk:'#8a6410',neg:'#f6d9d9',paper:'#ffffff',navy:'#0e2b4a'};
const D=14;                       // extrusion depth in px (2.5D)
const DX=D*.75,DY=-D*.6;          // extrusion direction: up and to the right
const KINDS=new Set(['bar_model','grouping','number_line','timeline','fraction_area','fraction_area_pair','mixed_number','hundred_grid','bar_chart','pictograph','pie_chart','clock','table','calendar','classification','ruler','container','scale','time_units','multi_chart']);
const TEXT_ONLY=new Set(['place_value_shift','place_value_decimal','decimal_operation']);

function hex(c){const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function shade(c,k){const[r,g,b]=hex(c),f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return`rgb(${f(r)},${f(g)},${f(b)})`}
function text(ctx,s,x,y,{size=20,weight='700',color=C.ink,align='center',max}={}){ctx.save();ctx.font=`${weight} ${size}px Arial`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
  let t=String(s??'');if(max){while(t.length>1&&ctx.measureText(t).width>max){if(size>12){size-=1;ctx.font=`${weight} ${size}px Arial`}else t=t.slice(0,-2)+'…'}}ctx.fillText(t,x,y);ctx.restore()}
function shadow(ctx,x,y,w,h){ctx.save();ctx.fillStyle='rgba(14,43,74,.16)';ctx.filter='blur(6px)';ctx.beginPath();ctx.ellipse(x+w/2+DX/2,y+h+6,w/2+8,8,0,0,Math.PI*2);ctx.fill();ctx.restore()}
/* A lit block: front face, top face, right face. d scales the depth. */
function block(ctx,x,y,w,h,color,{d=1,stroke=C.line,ground=true,lw=2}={}){
  const dx=DX*d,dy=DY*d;if(ground)shadow(ctx,x,y,w,h);
  ctx.save();ctx.lineJoin='round';ctx.lineWidth=lw;ctx.strokeStyle=stroke;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+w+dx,y+dy);ctx.lineTo(x+w,y);ctx.closePath();ctx.fillStyle=shade(color,.35);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+w,y);ctx.lineTo(x+w+dx,y+dy);ctx.lineTo(x+w+dx,y+h+dy);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fillStyle=shade(color,-.22);ctx.fill();ctx.stroke();
  const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,shade(color,.12));g.addColorStop(1,color);ctx.fillStyle=g;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);ctx.restore();
}
function cylinder(ctx,cx,cy,rx,ry,h,color){ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=1.6;
  ctx.beginPath();ctx.ellipse(cx,cy+h,rx,ry,0,0,Math.PI);ctx.lineTo(cx-rx,cy);ctx.ellipse(cx,cy,rx,ry,0,Math.PI,0,true);ctx.closePath();ctx.fillStyle=shade(color,-.25);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fillStyle=shade(color,.2);ctx.fill();ctx.stroke();ctx.restore()}
const num=v=>Number(v)||0;
const fit=(w,maxW)=>Math.min(w,maxW);

/* ---------- each kind: [height(spec,W), draw(ctx,spec,W)] ---------- */
const K={};
K.bar_model=[v=>{const P=(v.parts||[]).map(num);return P.length>1&&P[0]>0&&P.slice(1).every(x=>x<0)?150:120},(ctx,v,W)=>{
  const P=(v.parts||[]).map(num);
  // "start, then take away": the removed parts are cut from the right end of the whole bar.
  if(P.length>1&&P[0]>0&&P.slice(1).every(x=>x<0)&&-P.slice(1).reduce((a,b)=>a+b,0)<P[0]){
    const L=v.labels||[],span=fit(W-120,780),x0=(W-span)/2,y=40,h=60;block(ctx,x0,y,span,h,C.face);
    let right=x0+span;ctx.save();ctx.font='700 20px Arial';const cut=P.slice(1).map((x,i)=>Math.max(ctx.measureText(String(L[i+1]??x)).width+26,span*(-x)/P[0]));ctx.restore();
    const xs=[];cut.forEach(w=>{right-=w;xs.push([right,w])});
    xs.reverse().forEach(([x,w],k)=>{const i=cut.length-k;block(ctx,x,y,w,h,C.neg,{d:1.25,ground:false});ctx.save();ctx.strokeStyle='rgba(160,60,60,.35)';ctx.lineWidth=1;ctx.beginPath();for(let t=-h;t<w;t+=12){ctx.moveTo(x+Math.max(0,t),y+Math.max(0,-t));ctx.lineTo(x+Math.min(w,t+h),y+Math.min(h,w-t))}ctx.stroke();ctx.restore();text(ctx,L[i]??P[i],x+w/2,y+h/2,{max:w-8})});
    const left=right-x0;text(ctx,L[0]??P[0],x0+span/2,y+h+30,{size:18,color:C.muted});ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,y+h+14);ctx.lineTo(x0,y+h+22);ctx.lineTo(x0+span,y+h+22);ctx.lineTo(x0+span,y+h+14);ctx.stroke();ctx.restore();
    text(ctx,'?',x0+left/2,y+h/2,{size:28,color:C.goldInk});return;
  }
  const p=v.parts||[],labels=v.labels||[],total=p.reduce((a,x)=>a+Math.abs(num(x)),0)||1,span=fit(W-80,760);
  ctx.save();ctx.font='700 20px Arial';const mins=p.map((x,i)=>ctx.measureText(String(labels[i]??x)).width+30);ctx.restore();
  let ws=p.map((x,i)=>Math.max(mins[i],span*Math.abs(num(x))/total));const sum=ws.reduce((a,b)=>a+b,0);if(sum>W-40)ws=ws.map(w=>w*(W-40)/sum);
  let x=(W-ws.reduce((a,b)=>a+b,0))/2;const y=40,h=60;
  for(let i=0,xs=x;i<p.length;xs+=ws[i],i++)block(ctx,xs,y,ws[i],h,num(p[i])<0?C.neg:C.face,{ground:i===0});
  ws.forEach((w,i)=>{text(ctx,labels[i]??p[i],x+w/2,y+h/2,{max:w-10});x+=w});
}];
K.grouping=[(v,W)=>{const per=Math.max(4,Math.min(6,Math.floor((W-40)/118))),g=v.unknownGroups?3:Math.max(1,Math.min(12,num(v.groups)||1));return 34+Math.ceil(g/per)*104+(v.unknownGroups?34:0)},(ctx,v,W)=>{
  const unknown=!!v.unknownGroups,g=unknown?3:Math.max(1,Math.min(12,num(v.groups)||1)),per=Math.max(4,Math.min(6,Math.floor((W-40)/118))),cols=Math.min(per,g)+(unknown?1:0),bw=92,gap=26,x0=(W-cols*(bw+gap)+gap)/2,q=String(v.each)==='?';
  for(let i=0;i<g;i++){const x=x0+(i%per)*(bw+gap),y=30+Math.floor(i/per)*104;block(ctx,x,y,bw,64,q?'#fff7d6':C.face);text(ctx,v.each,x+bw/2,y+32,{size:q?30:18,color:q?C.goldInk:C.ink,max:bw-10})}
  if(unknown){const x=x0+3*(bw+gap);text(ctx,'…',x+bw/2,62,{size:34});text(ctx,'? kumpulan',W/2,30+104+12,{size:20,color:C.goldInk})}
}];
function plank(ctx,x,y,w){block(ctx,x,y,w,14,'#d8c7a2',{d:.7,stroke:'#7a6644'})}
K.number_line=[()=>130,(ctx,v,W)=>{
  const vals=(v.values||[]).map(Number);let mi=Math.min(...vals),ma=Math.max(...vals);if(!isFinite(mi)||mi===ma){mi=0;ma=1}
  const x0=60,x1=W-60,y=56;plank(ctx,x0-20,y,x1-x0+40);
  vals.forEach((val,i)=>{const x=x0+(val-mi)/(ma-mi)*(x1-x0);block(ctx,x-5,y-28,10,28,C.accent,{d:.5,ground:false});text(ctx,(v.marks||[])[i]??val,x,y+44,{size:22})});
}];
K.timeline=[()=>150,(ctx,v,W)=>{
  const s=num(v.start),e=num(v.end)||1,raw=[s,...(v.markers||[]),e],labels=v.labels||[],x0=70,x1=W-70,y=70;plank(ctx,x0-24,y,x1-x0+48);
  raw.forEach((q,i)=>{const x=x0+(num(q)-s)/Math.max(1,e-s)*(x1-x0),last=i===raw.length-1;cylinder(ctx,x,y-10,9,4,10,i===0||last?C.navy:C.accent);
    const lab=i===0?(v.startLabel??s):last?(v.endLabel??e):(labels[i-1]??q),below=i===0||last||i%2===0;text(ctx,lab,x,below?y+44:y-36,{size:19,max:180})});
}];
function strip(ctx,n,d,x,y,w,h){const cw=w/d;for(let i=0;i<d;i++)block(ctx,x+i*cw,y,cw,h,i<n?C.accent:C.paper,{d:i<n?1:.6,ground:i===0,lw:1.6})}
K.fraction_area=[()=>120,(ctx,v,W)=>{const d=Math.max(1,num(v.denominator)||1),n=Math.max(0,num(v.numerator)),c=Math.max(1,Math.min(4,num(v.count)||1)),w=Math.min(300,(W-80)/c-30),x0=(W-c*(w+30)+30)/2;for(let k=0;k<c;k++)strip(ctx,n,d,x0+k*(w+30),36,w,62)}];
K.fraction_area_pair=[()=>120,(ctx,v,W)=>{const a=v.a||{},b=v.b||{},w=Math.min(300,(W-160)/2),x0=(W-2*w-90)/2;strip(ctx,num(a.numerator),Math.max(1,num(a.denominator)||1),x0,36,w,62);text(ctx,v.operation||'+',x0+w+45,67,{size:34});strip(ctx,num(b.numerator),Math.max(1,num(b.denominator)||1),x0+w+90,36,w,62)}];
K.mixed_number=[()=>120,(ctx,v,W)=>{const whole=Math.max(0,Math.min(4,num(v.whole))),n=num(v.numerator),d=Math.max(1,num(v.denominator)||1),k=whole+1,w=Math.min(190,(W-60)/k-24),x0=(W-k*(w+24)+24)/2;
  for(let i=0;i<whole;i++)strip(ctx,d,d,x0+i*(w+24),36,w,58);strip(ctx,n,d,x0+whole*(w+24),36,w,58)}];
K.hundred_grid=[()=>330,(ctx,v,W)=>{const s=28,sh=Math.max(0,Math.min(100,num(v.shaded))),x0=(W-10*s)/2,y0=28;shadow(ctx,x0,y0,10*s,10*s);
  for(let r=9;r>=0;r--)for(let c=0;c<10;c++){const i=r*10+c;block(ctx,x0+c*s,y0+r*s,s,s,i<sh?C.accent:C.paper,{d:i<sh?.45:.15,ground:false,lw:1})}}];
K.bar_chart=[()=>300,(ctx,v,W)=>{const vals=(v.values||[]).map(Number),labs=v.labels||[],mx=Math.max(1,...vals),n=Math.max(1,vals.length),slot=Math.min(150,(W-120)/n),x0=(W-n*slot)/2,base=240,hmax=170;
  ctx.save();ctx.strokeStyle='#d5dce8';ctx.lineWidth=1;for(let k=0;k<=4;k++){const y=base-hmax*k/4;ctx.beginPath();ctx.moveTo(x0-10,y);ctx.lineTo(x0+n*slot+DX,y);ctx.stroke()}ctx.restore();
  vals.forEach((val,i)=>{const h=hmax*val/mx,x=x0+i*slot+slot*.2,w=slot*.5;block(ctx,x,base-h,w,h,i%2?C.gold:C.accent);text(ctx,val,x+w/2+DX/2,base-h-24,{size:18});text(ctx,labs[i],x+w/2,base+26,{size:18,max:slot-6})})}];
K.pictograph=[v=>Math.max(1,(v.labels||[]).length)*70+48,(ctx,v,W)=>{const labs=v.labels||[],vals=v.values||[];
  labs.forEach((lab,i)=>{const y=12+i*70;block(ctx,24,y,W-60,54,'#f6f8fc',{d:.35,ground:false,lw:1});text(ctx,lab,40,y+27,{align:'left',size:20,max:190});
    const count=Math.max(0,num(vals[i])),step=Math.min(60,(W-300)/Math.max(1,count));for(let j=0;j<count;j++)cylinder(ctx,260+j*step,y+22,22,9,10,C.gold)});
  text(ctx,`Petunjuk: setiap syiling = ${v.key||1}`,24,labs.length*70+30,{align:'left',size:18,weight:'400',color:C.muted})}];
K.pie_chart=[()=>290,(ctx,v,W)=>{const vals=(v.values||[]).map(Number),labs=v.labels||[],sum=vals.reduce((a,b)=>a+b,0)||1,cx=W/2,cy=120,rx=170,ry=95,h=26,cols=[C.accent,C.gold,'#9fc2ec','#f6dc8a','#6e9bd8','#e9c35a'];
  let a=-Math.PI/2;const segs=vals.map((val,i)=>{const s=a;a+=2*Math.PI*val/sum;return{s,e:a,i}});
  ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=1.5;
  segs.forEach(({s,e,i})=>{const s2=Math.max(s,0),e2=Math.min(e,Math.PI);if(e2<=s2)return;ctx.beginPath();ctx.ellipse(cx,cy+h,rx,ry,0,s2,e2);ctx.lineTo(cx+rx*Math.cos(e2),cy+ry*Math.sin(e2));ctx.ellipse(cx,cy,rx,ry,0,e2,s2,true);ctx.closePath();ctx.fillStyle=shade(cols[i%cols.length],-.3);ctx.fill();ctx.stroke()});
  segs.forEach(({s,e,i})=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.ellipse(cx,cy,rx,ry,0,s,e);ctx.closePath();ctx.fillStyle=cols[i%cols.length];ctx.fill();ctx.stroke()});ctx.restore();
  segs.forEach(({s,e,i})=>{const m=(s+e)/2,lab=String(labs[i]??'')+(v.showValues?` (${vals[i]})`:'');const lx=cx+Math.cos(m)*(rx+16),ly=cy+Math.sin(m)*(ry+16)+(Math.sin(m)>0?h:0);text(ctx,lab,lx,ly,{size:17,align:Math.cos(m)>.2?'left':Math.cos(m)<-.2?'right':'center'})})}];
K.clock=[()=>300,(ctx,v,W)=>{const cx=W/2,cy=140,r=118,h=num(v.hour),m=num(v.minute);shadow(ctx,cx-r,cy-r,2*r,2*r);
  cylinder(ctx,cx,cy-8,r,r,14,C.navy);ctx.save();ctx.beginPath();ctx.arc(cx,cy-8,r-12,0,Math.PI*2);ctx.fillStyle='#fffdf6';ctx.fill();ctx.restore();
  for(let i=1;i<=12;i++){const a=(i*30-90)*Math.PI/180;text(ctx,i,cx+Math.cos(a)*(r-36),cy-8+Math.sin(a)*(r-36),{size:20})}
  const hand=(ang,len,w,col)=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+3,cy-5);ctx.lineTo(cx+3+Math.cos(ang)*len,cy-5+Math.sin(ang)*len);ctx.stroke();ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(cx,cy-8);ctx.lineTo(cx+Math.cos(ang)*len,cy-8+Math.sin(ang)*len);ctx.stroke();ctx.restore()};
  hand(((h%12)*30+m*.5-90)*Math.PI/180,r*.5,9,C.ink);hand((m*6-90)*Math.PI/180,r*.76,6,C.accent);cylinder(ctx,cx,cy-10,8,8,3,C.gold)}];
K.table=[v=>((v.rows||[]).length+1)*54+24,(ctx,v,W)=>{const hs=v.headers||[],rows=v.rows||[],cols=Math.max(hs.length,...rows.map(r=>r.length),1),cw=Math.min(220,(W-60)/cols),x0=(W-cols*cw)/2,rh=54,H=(rows.length+1)*rh;
  block(ctx,x0,12,cols*cw,H,C.paper,{d:.6});ctx.fillStyle=C.navy;ctx.fillRect(x0,12,cols*cw,rh);
  hs.forEach((t,j)=>text(ctx,t,x0+j*cw+cw/2,12+rh/2,{size:18,color:'#fff',max:cw-12}));
  ctx.save();ctx.strokeStyle='#c6cfdd';ctx.lineWidth=1;rows.forEach((r,i)=>{const y=12+(i+1)*rh;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+cols*cw,y);ctx.stroke();r.forEach((t,j)=>text(ctx,t,x0+j*cw+cw/2,y+rh/2,{size:18,weight:'400',max:cw-12}))});
  for(let j=1;j<cols;j++){ctx.beginPath();ctx.moveTo(x0+j*cw,12);ctx.lineTo(x0+j*cw,12+H);ctx.stroke()}ctx.restore()}];
K.calendar=[v=>Math.ceil((num(v.startDay)+(num(v.days)||30))/7)*52+92,(ctx,v,W)=>{const names=['Ah','Is','Se','Ra','Kh','Ju','Sa'],s=58,x0=(W-7*s)/2,start=num(v.startDay),days=num(v.days)||30,hi=num(v.highlight);
  text(ctx,`${v.month??''} ${v.year??''}`,W/2,20,{size:22});names.forEach((n,i)=>text(ctx,n,x0+i*s+s/2,52,{size:16,color:C.muted}));
  for(let d=1;d<=days;d++){const k=start+d-1,x=x0+(k%7)*s,y=70+Math.floor(k/7)*52;block(ctx,x+3,y,s-10,42,d===hi?C.gold:C.paper,{d:d===hi?.7:.2,ground:false,lw:1});text(ctx,d,x+s/2-2,y+21,{size:17,weight:d===hi?'900':'400'})}}];
K.classification=[()=>96,(ctx,v,W)=>{const items=v.items||[];ctx.save();ctx.font='700 19px Arial';const ws=items.map(t=>ctx.measureText(String(t)).width+34);ctx.restore();
  let rows=[[]],cur=0;ws.forEach((w,i)=>{if(cur+w>W-60&&rows.at(-1).length){rows.push([]);cur=0}rows.at(-1).push(i);cur+=w+20});
  rows.slice(0,2).forEach((r,ri)=>{const tot=r.reduce((a,i)=>a+ws[i]+20,-20);let x=(W-tot)/2;r.forEach(i=>{block(ctx,x,16+ri*44,ws[i],34,'#fff7d6',{d:.4,ground:false,lw:1.4});text(ctx,items[i],x+ws[i]/2,33+ri*44,{size:19});x+=ws[i]+20})})}];
const meter=v=>{const val=num(v.value),max=Math.max(val,num(v.max)||val||1);return{val,pct:Math.max(0,Math.min(1,val/max)),label:v.mixedLabel||`${val} ${v.label||''}`.trim()}};
K.ruler=[()=>130,(ctx,v,W)=>{const{pct,label}=meter(v),x0=80,w=W-160;block(ctx,x0,50,w,34,'#efd9a3',{stroke:'#7a6644'});
  ctx.save();ctx.strokeStyle='#5b4a2c';for(let i=0;i<=10;i++){const x=x0+i*w/10;ctx.beginPath();ctx.moveTo(x,50);ctx.lineTo(x,i%5?62:70);ctx.stroke()}ctx.restore();
  block(ctx,x0,26,w*pct,12,C.accent,{d:.4,ground:false});text(ctx,label,W/2,110,{size:20})}];
K.time_units=[()=>110,(ctx,v,W)=>{const{val,pct}=meter(v),x0=80,w=W-160;block(ctx,x0,30,w,44,C.paper,{d:.6});block(ctx,x0,30,Math.max(4,w*pct),44,C.face,{d:.6,ground:false});text(ctx,`${val} ${v.label||''}`.trim(),W/2,52,{size:22})}];
K.container=[()=>250,(ctx,v,W)=>{const{pct,label}=meter(v),cx=W/2,top=30,hgt=160,rx=70,ry=16;shadow(ctx,cx-rx,top,2*rx,hgt);
  ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=2;const lvl=top+hgt-hgt*pct;
  if(pct>0){ctx.beginPath();ctx.moveTo(cx-rx,lvl);ctx.lineTo(cx-rx,top+hgt);ctx.ellipse(cx,top+hgt,rx,ry,0,Math.PI,0,true);ctx.lineTo(cx+rx,lvl);ctx.closePath();ctx.fillStyle='rgba(79,131,209,.45)';ctx.fill();ctx.beginPath();ctx.ellipse(cx,lvl,rx,ry,0,0,Math.PI*2);ctx.fillStyle='rgba(79,131,209,.6)';ctx.fill();ctx.stroke()}
  ctx.beginPath();ctx.moveTo(cx-rx,top);ctx.lineTo(cx-rx,top+hgt);ctx.ellipse(cx,top+hgt,rx,ry,0,Math.PI,0,true);ctx.lineTo(cx+rx,top);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,top,rx,ry,0,0,Math.PI*2);ctx.stroke();
  for(let i=1;i<5;i++){const y=top+hgt-i*hgt/5;ctx.beginPath();ctx.moveTo(cx+rx-18,y);ctx.lineTo(cx+rx,y);ctx.stroke()}ctx.restore();text(ctx,label,cx,top+hgt+42,{size:20})}];
K.scale=[()=>230,(ctx,v,W)=>{const{pct,label}=meter(v),cx=W/2,cy=130,r=100;block(ctx,cx-130,cy+10,260,40,C.face);
  ctx.save();ctx.lineWidth=6;ctx.strokeStyle=C.navy;ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*7/6,Math.PI*11/6);ctx.stroke();const a=(-150+120*pct)*Math.PI/180;ctx.lineCap='round';ctx.strokeStyle=C.accent;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*(r-14),cy+Math.sin(a)*(r-14));ctx.stroke();ctx.restore();
  cylinder(ctx,cx,cy-3,9,9,3,C.gold);text(ctx,label,cx,cy+30,{size:20})}];
K.multi_chart=[(v,W)=>height(v.pictograph,W)+height(v.bar,W)+20,(ctx,v,W)=>{draw(ctx,v.pictograph,W);ctx.save();ctx.translate(0,height(v.pictograph,W)+20);draw(ctx,v.bar,W);ctx.restore()}];

function supports(spec){return!!spec&&(KINDS.has(spec.kind)||TEXT_ONLY.has(spec.kind))&&(spec.kind!=='multi_chart'||(supports(spec.pictograph)&&supports(spec.bar)))}
function textOnly(spec){return!!spec&&TEXT_ONLY.has(spec.kind)}
function height(spec,W){const k=K[spec?.kind];return k?Math.round(k[0](spec,W)):0}
function draw(ctx,spec,W){const k=K[spec?.kind];if(k)k[1](ctx,spec,W)}
root.PAWorksheet25D={supports,textOnly,height,draw,strip,block,kinds:[...KINDS]};
})(typeof window!=='undefined'?window:globalThis);
