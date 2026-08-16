// Pahlawan Angka v3.21.6 — alpha-aware finisher artwork hotspots.
(()=>{
  'use strict';
  const VERSION='3.21.6';
  const cache=new Map();

  const q=(s,r=document)=>r.querySelector(s);

  function visibleEnemyFrame(){
    if(window.PACombatTargetAnchor?.activeEnemyFrame){
      return window.PACombatTargetAnchor.activeEnemyFrame(q('#enemy'));
    }
    const enemy=q('#enemy');
    if(!enemy)return null;
    return [...enemy.querySelectorAll('.enemy-frame')].find(img=>{
      const cs=getComputedStyle(img),r=img.getBoundingClientRect();
      return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05&&r.width>2&&r.height>2;
    })||q('#enemySprite');
  }

  function alphaHotspot(img,mode){
    if(!img?.complete||!img.naturalWidth||!img.naturalHeight)return null;
    const key=`${img.currentSrc||img.src}|${mode}`;
    if(cache.has(key))return cache.get(key);

    try{
      const maxDim=256,scale=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));
      const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
      const data=ctx.getImageData(0,0,w,h).data;
      let minX=w,minY=h,maxX=-1,maxY=-1;

      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const a=data[(y*w+x)*4+3];
        if(a>12){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
      }
      if(maxX<minX||maxY<minY)throw new Error('empty alpha');

      let hx=.5,hy=.65;
      if(mode==='bunga-ground'){
        // Root/vine must emerge from the actual lower opaque portion of the artwork.
        const bandStart=minY+(maxY-minY)*.70;
        let sx=0,sw=0;
        for(let y=Math.floor(bandStart);y<=maxY;y++)for(let x=minX;x<=maxX;x++){
          const a=data[(y*w+x)*4+3];
          if(a>12){const weight=a/255;sx+=x*weight;sw+=weight;}
        }
        hx=(sw?sx/sw:(minX+maxX)/2)/w;
        hy=maxY/h;
      }else{
        // Ice strike: use alpha-weighted centre of the lower 65% of visible artwork.
        // This follows the visible strike mass, not the transparent canvas centre.
        const bandStart=minY+(maxY-minY)*.35;
        let sx=0,sy=0,sw=0;
        for(let y=Math.floor(bandStart);y<=maxY;y++)for(let x=minX;x<=maxX;x++){
          const a=data[(y*w+x)*4+3];
          if(a>12){const weight=a/255;sx+=x*weight;sy+=y*weight;sw+=weight;}
        }
        hx=(sw?sx/sw:(minX+maxX)/2)/w;
        hy=(sw?sy/sw:(minY+maxY)/2)/h;
      }

      const out={
        x:Math.max(.02,Math.min(.98,hx)),
        y:Math.max(.02,Math.min(.98,hy)),
        bounds:{minX:minX/w,maxX:maxX/w,minY:minY/h,maxY:maxY/h},
        source:`${img.naturalWidth}x${img.naturalHeight}`
      };
      cache.set(key,out);return out;
    }catch(err){
      const fallback=mode==='bunga-ground'?{x:.18,y:.88}:{x:.30,y:.66};
      cache.set(key,fallback);return fallback;
    }
  }

  function placeWira(){
    const enemy=q('#enemy'),frame=visibleEnemyFrame(),fx=q('#iceFx');
    if(!enemy||!frame||!fx)return false;
    if(!fx.complete||!fx.naturalWidth){
      fx.addEventListener('load',placeWira,{once:true});return false;
    }
    const er=enemy.getBoundingClientRect(),fr=frame.getBoundingClientRect();
    const hotspot=alphaHotspot(fx,'wira-strike');if(!hotspot)return false;

    const renderedH=parseFloat(getComputedStyle(fx).height)||145;
    const renderedW=renderedH*(fx.naturalWidth/fx.naturalHeight);
    const targetX=fr.left-er.left+fr.width*.53;
    const targetY=fr.top-er.top+fr.height*.58;

    enemy.style.setProperty('--pa-wira-fx-left',`${targetX-hotspot.x*renderedW}px`);
    enemy.style.setProperty('--pa-wira-fx-top',`${targetY-hotspot.y*renderedH}px`);
    enemy.style.setProperty('--pa-wira-hotspot-x',`${hotspot.x*100}%`);
    enemy.style.setProperty('--pa-wira-hotspot-y',`${hotspot.y*100}%`);
    enemy.dataset.wiraFxHotspot=`${Math.round(hotspot.x*100)},${Math.round(hotspot.y*100)}`;
    return true;
  }

  function placeBunga(){
    const enemy=q('#enemy'),frame=visibleEnemyFrame(),fx=q('#bloomFx');
    if(!enemy||!frame||!fx)return false;
    if(!fx.complete||!fx.naturalWidth){
      fx.addEventListener('load',placeBunga,{once:true});return false;
    }
    const er=enemy.getBoundingClientRect(),fr=frame.getBoundingClientRect();
    const hotspot=alphaHotspot(fx,'bunga-ground');if(!hotspot)return false;

    const renderedW=Math.max(fr.width*2.15,260);
    const renderedH=renderedW*(fx.naturalHeight/fx.naturalWidth);
    const targetX=fr.left-er.left+fr.width*.50;
    const targetY=fr.bottom-er.top-2;

    enemy.style.setProperty('--pa-bunga-fx-w',`${renderedW}px`);
    enemy.style.setProperty('--pa-bunga-fx-left',`${targetX-hotspot.x*renderedW}px`);
    enemy.style.setProperty('--pa-bunga-fx-top',`${targetY-hotspot.y*renderedH}px`);
    enemy.style.setProperty('--pa-bunga-hotspot-x',`${hotspot.x*100}%`);
    enemy.style.setProperty('--pa-bunga-hotspot-y',`${hotspot.y*100}%`);
    enemy.dataset.bungaFxHotspot=`${Math.round(hotspot.x*100)},${Math.round(hotspot.y*100)}`;
    return true;
  }

  function placeForHero(){
    if((db?.hero||'wira')==='bunga')return placeBunga();
    return placeWira();
  }

  // v3.21.5 synchronises live target geometry first. This outer wrapper then
  // calibrates the actual artwork alpha hotspot before the delayed contact beat.
  const previousImpact=window.triggerImpact;
  if(typeof previousImpact==='function'){
    window.triggerImpact=function(attackerId,targetId,tint,finisher){
      const result=previousImpact.apply(this,arguments);
      if(attackerId==='hero'&&targetId==='enemy'&&finisher){
        placeForHero();
        requestAnimationFrame(placeForHero);
      }
      return result;
    };
  }

  // Keep DEV boss tests easy to inspect after changing hero / boss.
  window.PAFinisherHotspots={
    version:VERSION,
    analyze:alphaHotspot,
    wira:placeWira,
    bunga:placeBunga,
    recalibrate:placeForHero,
    cache
  };
  document.documentElement.dataset.finisherHotspots=VERSION;
  const version=q('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
