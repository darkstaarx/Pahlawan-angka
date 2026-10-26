/* Pahlawan Angka — Tahun 1 fraction pictures (v3 drawing inside the v2 API).
   Pemilik 2026-10-26: the bitmap-sprite version misaligned in the battle card
   (marker layer and cropped texture cells drifted apart, rows overlapped and
   clipped). Every picture is now one SVG in the shared 2.5D style: a themed,
   raised object divided into equal parts. Selected ("dipilih/ditanda") parts are
   shaded in the object's colour with a ✓ badge — the textbook "lorek"
   convention — and unselected parts stay pale. The interactive "lorek" scene uses
   the same drawing; each part is the touch target and drives the existing
   buttons created by js/fraction-answers-v1.js (kept for keyboard/screen-reader
   use), so the answer pipeline is unchanged.
   API: window.PAFractionVisuals = { markup(n,d,style,layout), scene(task) } */
(function(){
 'use strict';
 const f=n=>Number(n).toFixed(1);
 const NAMES={epal:'epal',kek:'kek',coklat:'coklat',kertas:'kertas',reben:'reben',kad:'kad'};
 // [shaded fill, shaded side, outline]; unselected parts use the pale pair.
 const THEME={
  epal:{on:'#ef5b55',side:'#b8322f',edge:'#7f2420'},
  kek:{on:'#f49ac1',side:'#c76592',edge:'#7a3a5b'},
  coklat:{on:'#9a5a32',side:'#6b3a1c',edge:'#3f2210'},
  kertas:{on:'#5b9df0',side:'#2f6fc4',edge:'#1d4a86'},
  reben:{on:'#a77ee0',side:'#7448b8',edge:'#4b2a80'},
  kad:{on:'#f4bb3a',side:'#c48d1c',edge:'#7a5410'}
 };
 const PALE={top:'#f6f1e7',side:'#d8cfbf'};
 const W=340,H=170;
 const lighten=(hex,k=.35)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v+(255-v)*k));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
 const poly=(pts,fill,stroke,w=1.6,attrs='')=>`<polygon${attrs} points="${pts.map(([x,y])=>f(x)+','+f(y)).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
 const tick=(x,y)=>`<g class="fraction-tick" aria-hidden="true"><circle cx="${f(x+1)}" cy="${f(y+1.5)}" r="10" fill="#0b4f80" opacity=".35"/><circle cx="${f(x)}" cy="${f(y)}" r="10" fill="#0b77b4" stroke="#fff" stroke-width="2"/><path d="M${f(x-4.5)} ${f(y)} l3.2 3.4 l6-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
 const round=style=>style==='epal'||style==='kek';

 // Rectangular objects: part boxes [x,y,w,h] in a grid that fits the 340×170 scene.
 function boxes(d,style,layout){
  let cols,rows;
  if(style==='reben'){cols=d;rows=1}
  else if(d===2){cols=layout==='v'?1:2;rows=layout==='v'?2:1}
  else {cols=layout==='h'?4:2;rows=layout==='h'?1:2}
  const maxW=style==='reben'?280:(cols===4?264:cols===1?150:200),maxH=style==='reben'?52:(rows===2?118:style==='coklat'?96:104);
  const cw=maxW/cols,ch=maxH/rows,x0=(W-maxW)/2-5,y0=(H-maxH)/2+2;
  const out=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)out.push([x0+c*cw,y0+r*ch,cw,ch]);
  return {out,x0,y0,maxW,maxH};
 }
 // Draws one part; `on` decides the shade. Returns svg markup with data-part.
 function rectPart(i,[x,y,w,h],style,on,gap){
  const T=THEME[style],top=on?T.on:PALE.top,side=on?T.side:PALE.side,g=gap/2,d=8,dx=d*.55,dy=d*.55;
  const X=x+g,Y=y+g,Wd=w-gap,Hd=h-gap;
  let deco='';
  if(style==='coklat'){deco=`<rect x="${f(X+5)}" y="${f(Y+5)}" width="${f(Wd-10)}" height="${f(Hd-10)}" rx="3" fill="none" stroke="${on?lighten(T.on,.25):'#e9e0cf'}" stroke-width="2"/>`}
  else if(style==='kertas'){deco=`<path d="M${f(X+8)} ${f(Y+Hd*.35)} H${f(X+Wd-8)} M${f(X+8)} ${f(Y+Hd*.6)} H${f(X+Wd-14)}" stroke="${on?lighten(T.on,.45):'#e4dccd'}" stroke-width="2" stroke-linecap="round"/>`}
  else if(style==='kad'){deco=`<circle cx="${f(X+Wd/2)}" cy="${f(Y+Hd/2)}" r="${f(Math.min(Wd,Hd)*.16)}" fill="none" stroke="${on?lighten(T.on,.45):'#e9e0cf'}" stroke-width="2.2"/>`}
  else if(style==='reben'){deco=`<path d="M${f(X)} ${f(Y+Hd*.5)} H${f(X+Wd)}" stroke="${on?lighten(T.on,.4):'#ece4d6'}" stroke-width="3" stroke-dasharray="6 5"/>`}
  return `<g class="fraction-part${on?' selected':''}" data-part="${i}">`
   +poly([[X+Wd,Y],[X+Wd+dx,Y-dy],[X+Wd+dx,Y+Hd-dy],[X+Wd,Y+Hd]],side,'#5d4a36',1)
   +poly([[X,Y],[X+dx,Y-dy],[X+Wd+dx,Y-dy],[X+Wd,Y]],lighten(top),'#5d4a36',1)
   +`<rect class="fraction-face" x="${f(X)}" y="${f(Y)}" width="${f(Wd)}" height="${f(Hd)}" rx="${style==='kad'?8:4}" fill="${top}" stroke="${on?T.edge:'#8b7a63'}" stroke-width="${on?2.4:1.6}"/>`
   +deco+(on?tick(X+Wd-13,Y+13):'')+`</g>`;
 }
 // Round objects (apple, cake): a thick disc split into equal sectors.
 function roundParts(d,style,sel){
  const T=THEME[style],cx=170,cy=88,rx=92,ry=52,t=style==='kek'?18:13;
  const pt=(a,dy=0)=>[cx+rx*Math.cos(a),cy+ry*Math.sin(a)+dy];
  const segs=Array.from({length:d},(_,i)=>({i,a0:-Math.PI/2+i*2*Math.PI/d,a1:-Math.PI/2+(i+1)*2*Math.PI/d,on:sel.has(i)}));
  const band=segs.map(s=>{const lo=Math.max(s.a0,0),hi=Math.min(s.a1,Math.PI);if(hi<=lo)return '';const [x0,y0]=pt(lo),[x1,y1]=pt(hi);
   return `<path class="fraction-band" data-part="${s.i}" d="M${f(x0)} ${f(y0)} A${rx} ${ry} 0 0 1 ${f(x1)} ${f(y1)} L${f(x1)} ${f(y1+t)} A${rx} ${ry} 0 0 0 ${f(x0)} ${f(y0+t)} Z" fill="${s.on?T.side:PALE.side}" stroke="#5d4a36" stroke-width="1"/>`}).join('');
  const tops=segs.map(s=>{const [x0,y0]=pt(s.a0),[x1,y1]=pt(s.a1),m=(s.a0+s.a1)/2,[tx,ty]=[cx+rx*.55*Math.cos(m),cy+ry*.55*Math.sin(m)];
   const extra=style==='kek'?`<path d="M${f(cx+rx*.82*Math.cos(s.a0+.12))} ${f(cy+ry*.82*Math.sin(s.a0+.12))} A${f(rx*.82)} ${f(ry*.82)} 0 0 1 ${f(cx+rx*.82*Math.cos(s.a1-.12))} ${f(cy+ry*.82*Math.sin(s.a1-.12))}" fill="none" stroke="${s.on?'#fff':'#efe6d6'}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" opacity=".9"/>`:'';
   return `<g class="fraction-part${s.on?' selected':''}" data-part="${s.i}"><path class="fraction-face" d="M${cx} ${cy} L${f(x0)} ${f(y0)} A${rx} ${ry} 0 0 1 ${f(x1)} ${f(y1)} Z" fill="${s.on?T.on:PALE.top}" stroke="${s.on?T.edge:'#8b7a63'}" stroke-width="${s.on?2.4:1.6}" stroke-linejoin="round"/>${extra}${s.on?tick(tx,ty):''}</g>`}).join('');
  const stem=style==='epal'?`<path d="M${cx} ${cy-ry+2} q-2 -14 4 -22" stroke="#6b4a2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${cx+4} ${cy-ry-14} q18 -10 28 2 q-14 10 -28 -2 Z" fill="#5fae4f" stroke="#3a7a30" stroke-width="1.4"/>`:`<rect x="${cx-3}" y="${cy-ry-18}" width="6" height="16" rx="2" fill="#ffd36d" stroke="#c48d1c"/><path d="M${cx} ${cy-ry-26} q-5 6 0 9 q5 -3 0 -9 Z" fill="#ff8a3d"/>`;
  return `<ellipse cx="${cx+4}" cy="${cy+t+8}" rx="${rx}" ry="${ry*.9}" fill="#2f5ea8" opacity=".08"/>${band}${tops}${style==='epal'?'':stem}${style==='epal'?stem:''}`;
 }
 function drawing(n,d,style,layout,sel){
  style=THEME[style]?style:'kertas';
  if(round(style))return roundParts(d,style,sel);
  const {out,x0,y0,maxW,maxH}=boxes(d,style,layout),gap=style==='coklat'?6:style==='reben'?5:7;
  const base=style==='reben'?`<path d="M${f(x0-18)} ${f(y0+6)} l18 8 v${f(maxH-28)} l-18 8 Z M${f(x0+maxW+22)} ${f(y0+6)} l-18 8 v${f(maxH-28)} l18 8 Z" fill="${THEME.reben.side}" opacity=".55"/>`:'';
  return `<ellipse cx="${W/2}" cy="${f(y0+maxH+10)}" rx="${f(maxW/2+10)}" ry="7" fill="#2f5ea8" opacity=".08"/>`+base+out.map((b,i)=>rectPart(i,b,style,sel.has(i),gap)).join('');
 }
 function svgFor(n,d,style,layout,sel,interactive){
  return `<svg class="fraction-svg" viewBox="0 0 ${W} ${H}"${interactive?'':' aria-hidden="true"'} focusable="false"><rect x="1" y="1" width="${W-2}" height="${H-2}" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${drawing(n,d,style,layout,sel)}</svg>`;
 }
 function markup(n,d,style,layout='h'){
  const sel=new Set(Array.from({length:n},(_,i)=>i));
  const name=NAMES[style]||'objek';
  return `<div class="fraction-art" role="img" aria-label="Satu ${name} dibahagi kepada ${d} bahagian sama besar. ${n} bahagian ditanda." data-layout="${layout}" data-style="${style}">${svgFor(n,d,style,layout,sel,false)}</div>`;
 }
 // Interactive "lorek": the picture's parts are the touch targets. The caller
 // appends one button per part to `row` (screen-reader/keyboard path); tapping a
 // part clicks the matching button, and the button's .selected state re-shades it.
 function scene(task){
  const outer=document.createElement('div');outer.className='fraction-art fraction-art-interactive';
  outer.dataset.layout=task.layout;outer.dataset.style=task.style;
  const sel=new Set();
  const paint=()=>{outer.querySelector('svg')?.remove();outer.insertAdjacentHTML('afterbegin',svgFor(0,task.d,task.style,task.layout,sel,true));
   outer.querySelectorAll('[data-part]').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',()=>{const b=row.children[Number(el.dataset.part)];if(b&&!b.disabled)b.click()})})};
  const row=document.createElement('div');row.className='fraction-piece-layer fraction-piece-buttons';
  row.setAttribute('role','group');row.setAttribute('aria-label','Pilih bahagian untuk dilorek');
  const sync=()=>{sel.clear();Array.from(row.children).forEach((b,i)=>{if(b.classList.contains('selected'))sel.add(i)});paint()};
  new MutationObserver(sync).observe(row,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
  paint();outer.append(row);
  return{outer,row};
 }
 window.PAFractionVisuals={markup,scene};
})();
