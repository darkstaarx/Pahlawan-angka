/* Wira's speech bubble (#wsay) in a mini game: sit beside Wira, not over his
   face or the pet's. Each time the bubble shows, it is placed from the right
   of Wira's face to the edge of the scene, and its text steps down a size
   while it would still reach the pet's head. If there is too little room
   (a very narrow scene) the page's own placement stays. */
(function(){
  'use strict';
  const FACE=.72,MIN_W=150,SIZES=[0,11,10];   // 0 = the page's own font size
  const css=document.createElement('style');
  css.textContent='.wsay.wsay-side::after{left:-9px;top:16px;bottom:auto;width:12px;height:12px;border-right:0;border-top:0;'+
    'border-left:inherit;border-bottom:inherit;transform:rotate(45deg)}'+
    '.wk-on .wsay{display:none}';   // during "Jom tengok cara" the steps speak in the panel
  document.head.appendChild(css);
  function place(s){
    s.classList.remove('wsay-side');s.style.left=s.style.right=s.style.top=s.style.maxWidth=s.style.fontSize='';
    if(s.classList.contains('hide'))return;
    const scene=document.querySelector('.scene'),wira=scene&&scene.querySelector('.wira'),box=s.offsetParent;
    if(!scene||!wira||!box)return;
    const sc=scene.getBoundingClientRect(),w=wira.getBoundingClientRect(),o=box.getBoundingClientRect();
    const left=Math.max(sc.left+8,w.left+w.width*FACE),width=sc.right-8-left;
    if(width<MIN_W)return;
    s.classList.add('wsay-side');
    s.style.left=(left-o.left)+'px';s.style.right='auto';s.style.top=(sc.top+8-o.top)+'px';s.style.maxWidth=width+'px';
    const pet=document.querySelector('#visitor,#pet');if(!pet)return;
    const p=pet.getBoundingClientRect(),head=p.top+p.height*.12;
    for(const f of SIZES){s.style.fontSize=f?f+'px':'';if(sc.top+8+s.offsetHeight<=head||left+s.offsetWidth<p.left)break}
  }
  function watch(){
    const s=document.getElementById('wsay');if(!s)return;
    let queued=false,mo=null;
    const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;place(s);mo.takeRecords()})};   // our own class and style changes are not news
    (mo=new MutationObserver(run)).observe(s,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',run);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
