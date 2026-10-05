/* Reusable generated bitmap sprites. Selection stays separate from artwork. */
(function(){
 'use strict';
 const folder='assets/teaching/d1-fractions-v2';
 const angles={h:0,v:90,grid:180};
 // Measured source frames in a 1792x896 reference canvas (source ratio 2:1).
 // Each physical piece gets its own equal-sized viewport, preserving count/area.
 const frames={epal:[[40,70,850,813,444,441],[930,74,1740,813,1334,443]],kek:[[82,70,827,828,453,424],[952,69,1694,827,1331,424]],coklat:[[121,98,825,787,474,431],[951,99,1660,788,1300,432]],kertas:[[114,96,854,788,485,443],[935,96,1664,788,1300,444]],reben:[[123,124,812,763,461,443],[968,123,1657,763,1311,444]],kad:[[70,109,850,822,460,447],[924,109,1706,822,1318,447]]};
 function textures(d,style){
   const [l,t,r,b,cx,cy]=frames[style][d===4?1:0];
   const boxes=d===4?[[l,t,cx,cy],[cx,t,r,cy],[l,cy,cx,b],[cx,cy,r,b]]:[[l,t,cx,b],[cx,t,r,b]];
   return `<div class="fraction-texture-grid" style="grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(${d===4?2:1},1fr)">${boxes.map(([x,y,x2,y2])=>`<span class="fraction-texture-cell"><img src="${folder}/${style}-sprite.png" alt="" style="width:${1792/(x2-x)*100}%;height:${896/(y2-y)*100}%;left:${-x/(x2-x)*100}%;top:${-y/(y2-y)*100}%"></span>`).join('')}</div>`;
 }
 function markup(n,d,style,layout='h'){
   const angle=angles[layout]||0,cols=2,rows=d===4?2:1;
   const marks=Array.from({length:d},(_,i)=>`<span class="fraction-piece-marker${i<n?' selected':''}" aria-hidden="true">${i<n?'<span class="fraction-piece-tick">✓</span>':''}</span>`).join('');
   return `<div class="fraction-art" role="img" aria-label="Satu ${style} dibahagi kepada ${d} bahagian sama besar. ${n} bahagian ditanda." data-layout="${layout}"><div class="fraction-art-turn" style="transform:rotate(${angle}deg)">${textures(d,style)}<div class="fraction-piece-layer ${style==='epal'||style==='kek'?'round':''}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${marks}</div></div></div>`;
 }
 function scene(task){
   const outer=document.createElement('div');outer.className='fraction-art fraction-art-interactive';outer.dataset.layout=task.layout;
   const turn=document.createElement('div');turn.className='fraction-art-turn';turn.style.transform=`rotate(${angles[task.layout]||0}deg)`;
   turn.innerHTML=textures(task.d,task.style);
   const row=document.createElement('div');row.className='fraction-piece-layer';if(task.style==='epal'||task.style==='kek')row.classList.add('round');
   row.style.gridTemplateColumns='repeat(2,1fr)';row.style.gridTemplateRows=`repeat(${task.d===4?2:1},1fr)`;row.setAttribute('role','group');row.setAttribute('aria-label','Pilih bahagian untuk dilorek');
   turn.append(row);outer.append(turn);return{outer,row};
 }
 window.PAFractionVisuals={markup,scene,frames};
})();
