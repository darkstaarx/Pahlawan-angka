/* Build isolated copies of the real production games for Demo Jelajah. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const games=['gudang-harta.html','kedai-kek.html','bengkel-ajaib.html','lombong-permata.html','dapur-ramuan.html'];
const out=path.join(root,'preview');fs.mkdirSync(out,{recursive:true});
const bridge=`<script>(function(){'use strict';var q=new URLSearchParams(location.search),g=Number(q.get('grade'))||0;document.addEventListener('pointerdown',function(){try{window.parent.postMessage({source:'pa-jelajah',type:'interaction',grade:g},location.origin)}catch(_){}} ,{once:true});document.addEventListener('DOMContentLoaded',function(){var d=document.getElementById('devBtn');if(d){d.hidden=true;d.style.display='none'}var x=document.getElementById('dev');if(x){x.hidden=true;x.style.display='none'}});})();</script>`;
// This is deliberately inside the game IIFE: it can call the real generator and
// worked renderer, while the query guard keeps the surface absent in production.
const runtime=`<script>(function(){'use strict';var src=document.currentScript,root=src&&src.parentNode;})();</script>`;
for(const file of games){let html=fs.readFileSync(path.join(root,file),'utf8');const inject=`<meta name="robots" content="noindex,nofollow" data-jelajah-production="1"><base href="../"><script src="js/jelajah-isolation-v1.js"></script>${bridge}`;if(html.includes('<head>'))html=html.replace('<head>','<head>'+inject);else html=inject+html;html=html.replace(/<body([^>]*)>/, '<body$1 data-jelajah-production="1">');
  const marker='resetAll();startRound();';
  const runtimeCode=`
/* Jelajah-only controller. It exposes only real game state/actions and only when
   the parent supplied jelajah=1; no synthetic question or worked copy exists. */
(function(){
  const qp=new URLSearchParams(location.search);
  if(qp.get('jelajah')!=='1')return;
  let stepClicks=0;
  const right=()=>{try{return window.__wkRight?.()||null}catch(_){return null}};
  const clickStep=()=>{
    const r=right();if(!r)return false;
    let el=null;
    if(String(r).startsWith('tap:')){const [,row,col]=String(r).split(':');el=document.querySelector('.wk-tap[data-row="'+row+'"][data-col="'+col+'"]')}
    else if(r==='go')el=document.querySelector('.wk-go:not(:disabled)');
    else el=[...document.querySelectorAll('.wk-t:not(:disabled)')].find(x=>String(x.dataset.v)===String(r));
    if(!el)return false;stepClicks++;el.click();return true;
  };
  window.PAJelajahGameRuntime={
    beginWorked:function(index){
      try{
        if(solved&&typeof check==='function')check();
        if(typeof workedPlan==='function'&&workedPlan()){misses=3;offerWorked();return true}
        if(typeof tryWorked!=='function'||!Array.isArray(WK_TRY))return false;
        const want=Number(qp.get('grade'))||0,mode=cfg?.modes?.[served%cfg.modes.length],items=WK_TRY.filter(x=>new RegExp('^d'+want+'-').test(String(x[1]))&&(!mode||String(x[1]).includes('-'+mode)));
        const item=items[(Number(index)||0)%Math.max(1,items.length)]||WK_TRY[(Number(index)||0)%WK_TRY.length];
        tryWorked(item);return true;
      }catch(_){return false}
    },
    startWorked:function(){const h=document.getElementById('hint');if(!h||h.textContent!=='Jom tengok cara')return false;h.click();return true},
    next:function(){return clickStep()},
    state:function(){return {solved:!!solved,worked:!!q?.worked,offer:!!workedOffer,step:right(),stepClicks}}
  };
})();
`;
  if(html.includes(marker))html=html.replace(marker,runtimeCode+'\n'+marker);else throw new Error(`worked runtime anchor missing in ${file}`);
  const target=path.join(out,'jelajah-game-'+file);fs.writeFileSync(target,html);}
console.log(`Built ${games.length} isolated production game copies in preview/`);
