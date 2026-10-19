/* Darjah 5 2.5D scene kit, shared by the Year 5 bank and the UASA completion layer.
   Scenes follow the Year 1 measurement visuals (kssrDiagram paU6Scene): inline SVG on a soft panel,
   solids drawn as raised slabs — darker side faces under a lighter top face — with a white highlight
   edge. Every scene carries an aria-label with the values a pupil needs to answer. */
(function(root){
 'use strict';
 if(root.PAD5Scenes)return;
 const f1=n=>Number(n).toFixed(1);
 const svgText=(x,y,s,size=14,fill='#243d5e',anchor='middle')=>`<text x="${f1(x)}" y="${f1(y)}" style="font:900 ${size}px Nunito,system-ui,sans-serif;fill:${fill};text-anchor:${anchor}">${s}</text>`;
 const scene=(h,aria,body)=>(h=Math.ceil(h),`<div class="kssrDiagram paU6Scene paD5Scene"><svg viewBox="0 0 340 ${h}" role="img" aria-label="${aria}"><rect x="1" y="1" width="338" height="${h-2}" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${body}</svg></div>`);
 const poly=(pts,fill,stroke='#36577a',w=2)=>`<polygon points="${pts.map(([x,y])=>f1(x)+','+f1(y)).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
 function slab(pts,top,side,depth=7){
  const dx=depth*.55,dy=depth;
  return {sides:pts.map((p,i)=>{const q=pts[(i+1)%pts.length];return poly([p,q,[q[0]+dx,q[1]+dy],[p[0]+dx,p[1]+dy]],side,'#4d6c83',1)}).join(''),face:poly(pts,top)};
 }
 function personToken(x,y,size=1){
  const r=5*size,b=7*size;
  return `<g><path d="M${f1(x-b+1.5)} ${f1(y+b+1.5)} Q${f1(x-b+1.5)} ${f1(y-2)} ${f1(x+1.5)} ${f1(y-2)} Q${f1(x+b+1.5)} ${f1(y-2)} ${f1(x+b+1.5)} ${f1(y+b+1.5)} Z" fill="#1f437f"/><path d="M${f1(x-b)} ${f1(y+b)} Q${f1(x-b)} ${f1(y-3)} ${f1(x)} ${f1(y-3)} Q${f1(x+b)} ${f1(y-3)} ${f1(x+b)} ${f1(y+b)} Z" fill="#2f5ea8"/><circle cx="${f1(x+1.2)}" cy="${f1(y-9*size+1.2)}" r="${f1(r)}" fill="#1f437f"/><circle cx="${f1(x)}" cy="${f1(y-9*size)}" r="${f1(r)}" fill="#3d6fb6"/><circle cx="${f1(x-1.6*size)}" cy="${f1(y-10.6*size)}" r="${f1(1.6*size)}" fill="#fff" opacity=".75"/></g>`;
 }
 function bucketScene(text){
  const body=`<path d="M108 48 L126 128 Q170 141 214 128 L232 48 Z" fill="#cfe2fb" stroke="#36577a" stroke-width="2.2"/><path d="M232 48 L214 128 Q205 131 198 132 L214 50 Z" fill="#a9c4ea"/><path d="M122 60 L136 122" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>`;
  return scene(150,`Baldi berisi ${text} sirap`,`<ellipse cx="170" cy="138" rx="62" ry="7" fill="#2f5ea8" opacity=".12"/><path d="M110 50 Q170 -8 230 50" fill="none" stroke="#4d6c83" stroke-width="3.5" stroke-linecap="round"/>${body}<ellipse cx="170" cy="48" rx="62" ry="12" fill="#eaf3ff" stroke="#36577a" stroke-width="2.2"/><ellipse cx="170" cy="51" rx="54" ry="8.5" fill="#7cc0ea" stroke="#2686bd" stroke-width="1.4"/><path d="M140 49 q12 -4 26 0" stroke="#fff" stroke-width="2" opacity=".75" fill="none"/><rect x="118" y="78" width="104" height="30" rx="9" fill="#fff" stroke="#9fb9de" stroke-width="1.5"/>${svgText(170,99,text,17)}`);
 }
 function roadScene(A,B,km){
  const road=slab([[56,100],[284,100],[294,86],[66,86]],'#c9d3df','#97a6b8',7),pin=x=>`<ellipse cx="${x}" cy="94" rx="11" ry="4" fill="#1f437f" opacity=".25"/><path d="M${x} 93 L${x-8} 76 A9 9 0 1 1 ${x+8} 76 Z" fill="#2f5ea8" stroke="#1f437f" stroke-width="1.5"/><circle cx="${x}" cy="72" r="3.6" fill="#fff"/>`;
  return scene(148,`Jarak dari ${A} ke ${B} ialah ${km} km`,`${road.sides}${road.face}<path d="M74 93 H286" stroke="#fff" stroke-width="2.4" stroke-dasharray="10 8"/>${pin(68)}${pin(284)}<path d="M74 44 H278" stroke="#36577a" stroke-width="1.8"/><path d="M74 37 v14 M278 37 v14" stroke="#36577a" stroke-width="1.8"/><rect x="138" y="24" width="64" height="26" rx="8" fill="#fff" stroke="#9fb9de" stroke-width="1.5"/>${svgText(170,42,`${km} km`,15,'#2f5ea8')}${svgText(20,132,A,13,'#243d5e','start')}${svgText(320,132,B,13,'#243d5e','end')}`);
 }
 function pictographScene(houses,s,key){
  const rows=houses.map((h,i)=>{const y=30+i*30;return `<path d="M66 ${y+14} H324" stroke="#dbe5f2" stroke-width="1.2"/>${svgText(58,y+5,h,13,'#243d5e','end')}${Array.from({length:s[i]},(_,j)=>personToken(80+j*26,y)).join('')}`}).join('');
  return scene(166,`Piktograf: ${houses.map((h,i)=>`${h} ${s[i]} simbol`).join(', ')}. Setiap simbol mewakili ${key} orang murid.`,`${rows}${personToken(80,151,.85)}${svgText(96,155,`mewakili ${key} orang murid`,13,'#243d5e','start')}`);
 }
 // Regular polygon standing on a flat edge, with its side count in the middle.
 function polygon(sides,text=`${sides} sisi`){
  const cx=170,cy=80,r=62,turn=sides%2===0?Math.PI/sides:0,pts=Array.from({length:sides},(_,i)=>{const a=-Math.PI/2+turn+i*2*Math.PI/sides;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]});
  const s=slab(pts,'#f9d978','#d6a63a');
  return scene(160,`Poligon sekata ${sides} sisi`,s.sides+s.face+svgText(cx,cy+6,text,16));
 }
 // Rectangle l × w with a right-angled triangle on its right side; the triangle's height is the shared side w.
 function compositeArea(l,w,b){
  const k=Math.min(200/(l+b),88/w),x0=48,y0=18,W=l*k,H=w*k,B=b*k,xr=x0+W,yb=y0+H;
  const rect=slab([[x0,y0],[xr,y0],[xr,yb],[x0,yb]],'#bfe8ee','#7fbcc6'),tri=slab([[xr,yb],[xr+B,yb],[xr,y0]],'#f9e19a','#d6ab47');
  return scene(yb+44,`Gabungan segi empat tepat ${l} cm × ${w} cm dan segi tiga bersudut tegak dengan tapak ${b} cm. Tinggi segi tiga sama dengan lebar segi empat tepat.`,
   rect.sides+tri.sides+rect.face+tri.face+`<path d="M${f1(x0+5)} ${f1(y0+5)} h${f1(W-10)}" stroke="#fff" stroke-width="2.4" opacity=".85"/>`
   +svgText(x0+W/2,yb+27,`${l} cm`,13)+svgText(x0-8,y0+H/2+5,`${w} cm`,13,'#243d5e','end')+svgText(xr+B/2,yb+27,`${b} cm`,13));
 }
 // Rectangle W × H with an a × b corner cut from the top right.
 function lShape(W,H,a,b){
  const k=Math.min(220/W,100/H),x0=52,y0=16,xn=x0+(W-a)*k,xe=x0+W*k,yn=y0+b*k,yb=y0+H*k;
  const s=slab([[x0,y0],[xn,y0],[xn,yn],[xe,yn],[xe,yb],[x0,yb]],'#dbe8fb','#9fb9de');
  return scene(yb+40,`Bentuk L daripada segi empat tepat ${W} cm × ${H} cm dengan satu penjuru ${a} cm × ${b} cm dipotong.`,
   s.sides+s.face+`<path d="M${f1(x0+5)} ${f1(y0+5)} H${f1(xn-5)}" stroke="#fff" stroke-width="2.4" opacity=".85"/>`
   +svgText((x0+xe)/2,yb+27,`${W} cm`,13)+svgText(x0-8,(y0+yb)/2+5,`${H} cm`,13,'#243d5e','end')
   +svgText((xn+xe)/2,yn-7,`${a} cm`,12,'#3d5a80')+svgText(xn-6,(y0+yn)/2+5,`${b} cm`,12,'#3d5a80','end'));
 }
 // Pie chart as a thick disc: coloured sectors on the top ellipse and a darker band on the front half.
 function pie(parts){
  const colors=[['#f4bb3a','#c48d1c'],['#4fb4c8','#2f8798'],['#7b6bd6','#5546a8'],['#ef7f65','#c2563f']],cx=104,cy=68,rx=82,ry=46,t=14,pt=(a,dy=0)=>[cx+rx*Math.cos(a),cy+ry*Math.sin(a)+dy];
  let acc=0;const segs=parts.map((p,i)=>{const a0=-Math.PI/2+acc/50*Math.PI;acc+=p.value;return {a0,a1:-Math.PI/2+acc/50*Math.PI,c:colors[i%4],p}});
  const band=segs.map(s=>{const lo=Math.max(s.a0,0),hi=Math.min(s.a1,Math.PI);if(hi<=lo)return '';const [x0,y0]=pt(lo),[x1,y1]=pt(hi);return `<path d="M${f1(x0)} ${f1(y0)} A${rx} ${ry} 0 0 1 ${f1(x1)} ${f1(y1)} L${f1(x1)} ${f1(y1+t)} A${rx} ${ry} 0 0 0 ${f1(x0)} ${f1(y0+t)} Z" fill="${s.c[1]}" stroke="#213b67" stroke-width="1"/>`}).join('');
  const top=segs.map(s=>{const [x0,y0]=pt(s.a0),[x1,y1]=pt(s.a1);return `<path d="M${cx} ${cy} L${f1(x0)} ${f1(y0)} A${rx} ${ry} 0 ${s.a1-s.a0>Math.PI?1:0} 1 ${f1(x1)} ${f1(y1)} Z" fill="${s.c[0]}" stroke="#213b67" stroke-width="1.6" stroke-linejoin="round"/>`}).join('');
  const legend=segs.map((s,i)=>{const y=30+i*28,sw=slab([[208,y-11],[222,y-11],[222,y+3],[208,y+3]],s.c[0],s.c[1],4);return sw.sides+sw.face+svgText(230,y,`${s.p.label} ${s.p.value}%`,13,'#243d5e','start')}).join('');
  return scene(150,`Carta pai: ${parts.map(p=>`${p.label} ${p.value}%`).join(', ')}`,`<ellipse cx="${cx}" cy="${cy+t+6}" rx="${rx}" ry="${ry}" fill="#2f5ea8" opacity=".08"/>${band}${top}${legend}`);
 }
 root.PAD5Scenes={version:'1.0.0',f1,svgText,scene,poly,slab,personToken,bucket:bucketScene,road:roadScene,pictograph:pictographScene,polygon,compositeArea,lShape,pie};
})(typeof window!=='undefined'?window:globalThis);
