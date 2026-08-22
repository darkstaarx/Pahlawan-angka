/* Cikgu Dimensi — merged-identity portal transition on v0.2.1 foundation. */
(function(root){
  'use strict';
  const BASE_ASSET='assets/coach/cikgu-wajar/welcome.webp';
  const AURA_ASSET='assets/coach/cikgu-dimensi/dimensional-aura.svg';
  const CUTIN_ASSET='assets/coach/cikgu-dimensi/dimensional-eye-cutin-v1.webp';
  function motionOK(){return !(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)}
  function characterMarkup(){
    return `<span class="dvDimensionalCharacter is-normal" aria-hidden="true"><span class="dvDimensionalPortrait"><img class="dvDimensionalBase" src="${BASE_ASSET}" alt=""><img class="dvDimensionalAura" src="${AURA_ASSET}" alt=""><i class="dvEyeGlow dvEyeGlowL"></i><i class="dvEyeGlow dvEyeGlowR"></i></span></span>`;
  }
  function setCharacterActive(node,active){
    if(!node)return;
    node.classList.toggle('is-active',!!active);
    node.classList.toggle('is-normal',!active);
    node.dataset.dimensiState=active?'active':'normal';
  }
  function ensure(){
    if(typeof document==='undefined')return null;
    let o=document.getElementById('dvPortalTransition');if(o)return o;
    o=document.createElement('div');o.id='dvPortalTransition';o.className='dvPortalTransition';o.setAttribute('aria-hidden','true');
    o.innerHTML=`<div class="dvPortalShade"></div><div class="dvEyeCutin"><img src="${CUTIN_ASSET}" alt=""><i></i></div><div class="dvPortalCall"><small>DIMENSIONAL MODE</small><b>Masa untuk Cikgu Dimensi!</b></div>`;
    document.body.appendChild(o);return o;
  }
  function open({onDone,duration=1050}={}){
    const o=ensure();if(!o){onDone?.();return}
    o.classList.remove('show','activate');void o.offsetWidth;o.classList.add('show');
    const ms=motionOK()?Math.max(1800,Number(duration)||0):0;
    if(ms===0){o.classList.add('activate');o.classList.remove('show','activate');onDone?.();return}
    const activateAt=Math.min(320,Math.max(180,Math.round(ms*.28)));
    setTimeout(()=>o.classList.add('activate'),activateAt);
    setTimeout(()=>{o.classList.remove('show','activate');onDone?.()},ms);
  }
  function deactivate(){const o=typeof document!=='undefined'?document.getElementById('dvPortalTransition'):null;if(!o)return;o.classList.remove('activate');setCharacterActive(o.querySelector('.dvDimensionalCharacter'),false)}
  root.PADimensionalPortal={open,ensure,deactivate,characterMarkup,setCharacterActive,baseAsset:BASE_ASSET,auraAsset:AURA_ASSET,cutinAsset:CUTIN_ASSET};
})(typeof window!=='undefined'?window:globalThis);
