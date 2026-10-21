/* Enlarge a mini game's question panel content to fill the room it has
   (css/minigame-question-first-v1.css gives the panel the space). Sets --qz on
   each .panel: 1 (as authored) up to MAX, never shrinking below the design. */
(function(){
  'use strict';
  const MAX=1.6,ROOM=.95;   // keep 5% spare for text that appears while answering (hints, guides)
  function fit(panel){
    if(!panel||!panel.isConnected)return;
    panel.style.setProperty('--qz','1');
    const kids=[...panel.children].filter(el=>el.getClientRects().length);
    if(!kids.length)return;
    const cs=getComputedStyle(panel),gap=parseFloat(cs.rowGap)||0;
    const padH=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),padW=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
    const h=kids.reduce((n,el)=>n+el.getBoundingClientRect().height,0)+gap*(kids.length-1);
    const roomH=(panel.clientHeight-padH)*ROOM;
    if(h<=0||roomH<=0)return;
    // Height decides the zoom; then step back while anything overflows sideways.
    const wide=()=>panel.scrollWidth>panel.clientWidth+1||kids.some(el=>el.scrollWidth>el.clientWidth+1);
    let z=Math.floor(Math.max(1,Math.min(MAX,roomH/h))*100)/100;
    panel.style.setProperty('--qz',String(z));
    while(z>1&&wide()){z=Math.max(1,Math.round((z-.05)*100)/100);panel.style.setProperty('--qz',String(z))}
  }
  function watch(panel){
    let queued=false;
    const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fit(panel)})};
    new MutationObserver(run).observe(panel,{childList:true,subtree:true,characterData:true});
    if(typeof ResizeObserver==='function')new ResizeObserver(run).observe(panel);
    window.addEventListener('resize',run);
    run();
  }
  function boot(){document.querySelectorAll('.pa-game .panel').forEach(watch)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.PAMiniGamePanelFit={fit};
})();
