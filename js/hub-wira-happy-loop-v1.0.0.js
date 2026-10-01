/* Main-hub happy hero loop. Keeps the production hero/battle assets untouched. */
(function installHubHappyHeroLoop(){
  'use strict';
  const FRAME_COUNT=24,FRAME_MS=105,END_HOLD_MS=3000;
  const framePath=i=>`assets/heroes/wira-chibi/frames/hub-happy-v1/hub-happy-${String(i).padStart(2,'0')}-v1.png`;
  let image=null,timer=0,index=0,installed=false,running=false;
  const heroIsChibi=()=>typeof db!=='undefined'&&(db?.hero||'wira')==='wirachibi';
  const clear=()=>{if(timer){clearTimeout(timer);timer=0}running=false};
  const stop=()=>{clear(); if(image)image.removeAttribute('data-hub-happy-loop')};
  const tick=()=>{
    if(!image||!heroIsChibi()){stop();return}
    running=true;
    image.src=framePath(index);
    const hold=index===FRAME_COUNT-1;
    index=hold?0:index+1;
    timer=setTimeout(tick,hold?END_HOLD_MS:FRAME_MS);
  };
  const start=()=>{
    image=document.getElementById('hubHeroImg');
    if(!image||!heroIsChibi()){stop();return}
    if(running)return;
    image.dataset.hubHappyLoop='v1';
    index=0;
    tick();
  };
  const sync=()=>heroIsChibi()?start():stop();
  const install=()=>{
    if(typeof window.renderHub==='function'&&!installed){
      const original=window.renderHub;
      window.renderHub=function(){const result=original.apply(this,arguments);sync();return result};
      installed=true;
    }
    sync();
    if(!installed)setTimeout(install,100);
  };
  window.PAHubHappyHeroLoop={sync,start,stop};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
