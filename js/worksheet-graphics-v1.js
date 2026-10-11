// Native canvas graphics for printed questions. Values come from authored diagrams,
// never from the answer. SVG, pictures and tables survive the PDF export.
(()=>{
'use strict';
const images=new Map();
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const svgUrl=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
const svgStyle='text{font-family:Arial,sans-serif;fill:#24334d}.kd-label{font-weight:900;fill:#1c2a43}.kd-line{stroke:#667792;stroke-width:2}.kd-grid{stroke:#cfd7e5;stroke-width:1}.kd-fill{fill:#4f83d1;stroke:#405b82;stroke-width:1.2}.kd-empty{fill:#fff;stroke:#8090a8;stroke-width:1.2}.kd-accent{fill:#4f83d1;stroke:#234a80;stroke-width:1}.kd-shape{fill:#edf3fc;stroke:#4c6488;stroke-width:3}';
function loadImage(src){
 const cache=!src.startsWith('data:');if(cache&&images.has(src))return images.get(src);
 const pending=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{images.delete(src);reject(new Error('Grafik soalan gagal dimuat. Semak sambungan dan cuba semula.'))};image.src=src});
 if(cache)images.set(src,pending);return pending;
}
function imageModel(node){return{kind:'image',src:node.getAttribute('src'),width:Number(node.getAttribute('width'))||58,height:Number(node.getAttribute('height'))||58,label:node.getAttribute('alt')||''}}
function svgModel(node){
 const clone=node.cloneNode(true),box=(node.getAttribute('viewBox')||'').split(/[ ,]+/).map(Number),width=box[2]||parseFloat(node.getAttribute('width'))||330,height=box[3]||parseFloat(node.getAttribute('height'))||190;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',width*4);clone.setAttribute('height',height*4);clone.removeAttribute('style');
 const style=document.createElementNS('http://www.w3.org/2000/svg','style');style.textContent=svgStyle;clone.insertBefore(style,clone.firstChild);
 return{kind:'svg',src:svgUrl(new XMLSerializer().serializeToString(clone)),width,height};
}
function fractionModel(node){
 const match=(node.getAttribute('aria-label')||'').match(/(\d+)\s+bahagian sama besar;\s*(\d+)\s+bahagian berlorek/);
 return match?{kind:'fraction',denominator:Number(match[1]),numerator:Number(match[2])}:null;
}
function fromQuestion(q){
 const root=document.createElement('div');root.innerHTML=String(q?.prompt||'');
 if(root.querySelector('script,iframe,canvas,video,input,button'))return null;
 const genericPictographs=new Map();
 for(const node of root.querySelectorAll('div')){const cells=Array.from(node.children);if(cells.length>=4&&cells.length%2===0&&cells.every(c=>c.tagName.toLowerCase()==='span')&&cells.filter((_,i)=>i%2).every(c=>/^(?:●\s*)+$/.test(clean(c.textContent))))genericPictographs.set(node,{kind:'pictograph',key:1,rows:cells.filter((_,i)=>i%2===0).map((c,i)=>({label:clean(c.textContent),count:(cells[i*2+1].textContent.match(/●/g)||[]).length}))})}
 const candidates=[...Array.from(root.querySelectorAll('.kd-pictograph,.moneyVisual,.paCountingSet,.fractionVisual,.coordVisual,table,svg,img')),...genericPictographs.keys()];
 const top=candidates.filter(node=>!candidates.some(parent=>parent!==node&&parent.contains(node))),graphics=[];
 for(const node of top){
  let graphic=null;
  if(genericPictographs.has(node))graphic=genericPictographs.get(node);
  else if(node.classList.contains('kd-pictograph')){
   const rows=Array.from(node.querySelectorAll('.kd-picto-row')).map(row=>({label:clean(row.querySelector('b')?.textContent),count:(row.querySelector('span')?.textContent.match(/●/g)||[]).length}));
   const key=Number((node.querySelector('small')?.textContent.match(/=\s*(\d+(?:\.\d+)?)/)||[])[1]||1);
   if(rows.length)graphic={kind:'pictograph',rows,key};
  }else if(node.classList.contains('moneyVisual')){
   const pieces=Array.from(node.children).map(piece=>piece.tagName.toLowerCase()==='img'?imageModel(piece):{kind:'money',label:clean(piece.textContent)});
   if(pieces.length)graphic={kind:'collection',pieces,columns:5};
  }else if(node.classList.contains('paCountingSet')){
   graphic={kind:'collection',pieces:Array.from(node.querySelectorAll('img')).map(imageModel),columns:5};
  }else if(node.classList.contains('fractionVisual'))graphic=fractionModel(node);
  else if(node.classList.contains('coordVisual'))graphic={kind:'grid',lines:node.textContent.split('\n')};
  else if(node.tagName.toLowerCase()==='table'){
   graphic={kind:'table',rows:Array.from(node.querySelectorAll('tr')).map(row=>Array.from(row.querySelectorAll('th,td')).map(cell=>clean(cell.textContent)))};
  }else if(node.tagName.toLowerCase()==='svg')graphic=svgModel(node);
  else if(node.tagName.toLowerCase()==='img')graphic=imageModel(node);
  if(!graphic)return null;
  graphics.push(graphic);node.remove();
 }
 if(q?.visualChoiceSpec?.kind==='fraction'){
  const choices=q.visualChoiceSpec.choices||[];
  if(!choices.length||choices.some(c=>c.invalid)||choices.some(c=>!Number.isFinite(Number(c.denominator??c.den))||!Number.isFinite(Number(c.numerator??c.num))))return null;
  graphics.push({kind:'fractionChoices',choices:choices.map(c=>({letter:c.letter,numerator:Number(c.numerator??c.num),denominator:Number(c.denominator??c.den)}))});
 }
 // A CSS-only or interactive diagram that is not understood must stay out of print.
 if(root.querySelector('[role="img"],.fractionVisual,.kd-pictograph,.paCountingSet'))return null;
 if(!graphics.length)return null;
 root.querySelectorAll('br').forEach(node=>node.replaceWith(document.createTextNode(' ')));
 root.querySelectorAll('div,p,small').forEach(node=>node.appendChild(document.createTextNode(' ')));
 return{prompt:clean(root.textContent),graphics,key:String(q.prompt)+JSON.stringify(q.visualChoiceSpec||null)};
}
function box(ctx,x,y,w,h,fill='#f7f9fc',stroke='#bbc6d8',r=10){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
function contained(ctx,image,x,y,w,h){const scale=Math.min(w/(image.naturalWidth||image.width),h/(image.naturalHeight||image.height));const dw=(image.naturalWidth||image.width)*scale,dh=(image.naturalHeight||image.height)*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function fruitIcon(ctx,label,x,y,size){
 const name=label.toLowerCase();ctx.save();ctx.translate(x,y);ctx.scale(size/48,size/48);ctx.lineWidth=2;ctx.strokeStyle='#536b35';
 if(/pisang/.test(name)){ctx.fillStyle='#ffd55c';ctx.beginPath();ctx.moveTo(8,8);ctx.bezierCurveTo(10,34,31,42,41,17);ctx.bezierCurveTo(34,46,8,44,5,17);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(14,7);ctx.bezierCurveTo(16,30,31,32,40,12);ctx.bezierCurveTo(36,37,16,39,11,15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#5d6b31';ctx.fillRect(7,5,8,6)}
 else if(/jambu/.test(name)){ctx.fillStyle='#8bca62';ctx.beginPath();ctx.ellipse(19,26,14,18,-.2,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#eaa6ad';ctx.beginPath();ctx.ellipse(32,28,11,15,.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff4d4';for(const [a,b] of [[29,22],[34,24],[28,29],[34,31],[30,35]]){ctx.beginPath();ctx.arc(a,b,1.6,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#427d38';ctx.beginPath();ctx.ellipse(23,8,7,3,-.5,0,Math.PI*2);ctx.fill()}
 else if(/mangga/.test(name)){ctx.fillStyle='#ffce5c';ctx.beginPath();ctx.moveTo(16,9);ctx.bezierCurveTo(39,3,47,30,28,43);ctx.bezierCurveTo(14,47,5,22,16,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#559d46';ctx.beginPath();ctx.ellipse(28,8,10,4,-.5,0,Math.PI*2);ctx.fill()}
 else{ctx.fillStyle='#6698ce';ctx.beginPath();ctx.arc(24,24,15,0,Math.PI*2);ctx.fill();ctx.stroke()}
 ctx.restore();
}
function fruitSource(label){return{epal:'apple',oren:'orange',limau:'orange',rambutan:'rambutan',pensel:'pencil',pemadam:'eraser',belon:'balloon'}[label.toLowerCase()]}
function fraction(ctx,n,d,x,y,w,h){
 for(let i=0;i<d;i++){box(ctx,x+i*w/d,y,w/d,h,i<n?'#74bba0':'#fff','#4c6488',0)}
}
async function renderGraphic(g,width){
 const canvas=document.createElement('canvas');canvas.width=width;let height=0;
 if(g.kind==='svg'||g.kind==='image')height=Math.min(360,Math.round(Math.min(width,680)*g.height/g.width));
 if(g.kind==='collection')height=Math.ceil(g.pieces.length/g.columns)*106+10;
 if(g.kind==='pictograph')height=g.rows.length*82+48;
 if(g.kind==='table')height=g.rows.length*56+8;
 if(g.kind==='grid')height=g.lines.length*35+20;
 if(g.kind==='fraction')height=96;
 if(g.kind==='fractionChoices')height=Math.ceil(g.choices.length/2)*112;
 if(!height||height>1200)throw new Error('Rajah ini terlalu besar untuk dicetak dengan jelas. Cuba worksheet lain.');
 canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 if(g.kind==='svg'||g.kind==='image'){const image=await loadImage(g.src);contained(ctx,image,0,0,width,height)}
 else if(g.kind==='collection'){
  const slot=Math.min(168,width/g.columns),span=Math.min(g.columns,g.pieces.length)*slot,start=(width-span)/2;
  for(let i=0;i<g.pieces.length;i++){const piece=g.pieces[i],x=start+(i%g.columns)*slot,y=Math.floor(i/g.columns)*106;
   if(piece.kind==='image'){const image=await loadImage(piece.src);contained(ctx,image,x+8,y+4,slot-16,92)}
   else{const coin=/sen$/.test(piece.label);if(coin){ctx.beginPath();ctx.arc(x+slot/2,y+49,42,0,Math.PI*2);ctx.fillStyle='#e3d3a5';ctx.fill();ctx.strokeStyle='#806e4e';ctx.stroke()}else box(ctx,x+8,y+10,slot-16,76,'#d9e5f2','#53647d');ctx.fillStyle='#24334d';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText(piece.label,x+slot/2,y+56);ctx.textAlign='left'}
  }
 }else if(g.kind==='pictograph'){
  for(let i=0;i<g.rows.length;i++){const row=g.rows[i],y=i*82;box(ctx,0,y,width,76,'#f7f9fc','#d8dfeb',8);ctx.fillStyle='#24334d';ctx.font='bold 22px Arial';ctx.fillText(row.label,16,y+44,180);
   const size=Math.min(52,(width-215-3*Math.max(0,row.count-1))/Math.max(1,row.count)),source=fruitSource(row.label),image=source?await loadImage('assets/questions/counting/'+source+'.png'):null;
   for(let j=0;j<row.count;j++){const x=205+j*(size+3);if(image)contained(ctx,image,x,y+12,size,52);else fruitIcon(ctx,row.label,x,y+12,size)}
  }
  ctx.fillStyle='#536174';ctx.font='19px Arial';ctx.fillText('Petunjuk: setiap gambar = '+g.key+' item',12,height-10);
 }else if(g.kind==='table'){
  const columns=Math.max(...g.rows.map(row=>row.length)),cell=width/columns;
  g.rows.forEach((row,i)=>row.forEach((text,j)=>{box(ctx,j*cell,i*56,cell,56,i===0?'#eaf0f8':'#fff','#a9b6ca',0);ctx.fillStyle='#24334d';ctx.font=(i===0?'bold ':'')+'20px Arial';ctx.fillText(text,j*cell+12,i*56+35,cell-24)}));
 }else if(g.kind==='grid'){ctx.font='bold 25px monospace';ctx.fillStyle='#24334d';g.lines.forEach((line,i)=>ctx.fillText(line,Math.max(10,(width-350)/2),30+i*35))}
 else if(g.kind==='fraction')fraction(ctx,g.numerator,g.denominator,Math.max(0,(width-460)/2),12,Math.min(width,460),66);
 else if(g.kind==='fractionChoices')g.choices.forEach((c,i)=>{const x=(i%2)*width/2,y=Math.floor(i/2)*112;ctx.fillStyle='#24334d';ctx.font='bold 22px Arial';ctx.fillText(c.letter,x+12,y+25);fraction(ctx,c.numerator,c.denominator,x+50,y+12,width/2-70,65)});
 return canvas;
}
async function render(model,width=970){
 const graphics=await Promise.all(model.graphics.map(g=>renderGraphic(g,width))),canvas=document.createElement('canvas');canvas.width=width;canvas.height=graphics.reduce((h,g)=>h+g.height+16,0)-16;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,canvas.height);let y=0;for(const g of graphics){ctx.drawImage(g,0,y);y+=g.height+16}return canvas;
}
window.PAWorksheetGraphics={fromQuestion,render,renderGraphic,loadImage};
})();
