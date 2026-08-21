/* Cikgu Dimensi — merged-identity portal transition on v0.2.1 foundation. */
(function(root){
  'use strict';
  const BASE_ASSET='assets/coach/cikgu-wajar/welcome.webp';
  const AURA_ASSET='assets/coach/cikgu-dimensi/dimensional-aura.svg';
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
    o.innerHTML=`<div class="dvPortalShade"></div><div class="dvPortalRing"><i></i><i></i><i></i></div><div class="dvPortalTeacher">${characterMarkup()}<b>Cikgu Dimensi</b><small>Mari lihat cara lain.</small></div>`;
    document.body.appendChild(o);return o;
  }
  function open({onDone,duration=1050}={}){
    const o=ensure();if(!o){onDone?.();return}
    const char=o.querySelector('.dvDimensionalCharacter');
    o.classList.remove('show','activate');setCharacterActive(char,false);void o.offsetWidth;o.classList.add('show');
    const ms=motionOK()?Math.max(0,Number(duration)||0):0;
    if(ms===0){o.classList.add('activate');setCharacterActive(char,true);o.classList.remove('show','activate');setCharacterActive(char,false);onDone?.();return}
    const activateAt=Math.min(320,Math.max(180,Math.round(ms*.28)));
    setTimeout(()=>{o.classList.add('activate');setCharacterActive(char,true)},activateAt);
    setTimeout(()=>{o.classList.remove('show','activate');setCharacterActive(char,false);onDone?.()},ms);
  }
  function deactivate(){const o=typeof document!=='undefined'?document.getElementById('dvPortalTransition'):null;if(!o)return;o.classList.remove('activate');setCharacterActive(o.querySelector('.dvDimensionalCharacter'),false)}
  root.PADimensionalPortal={open,ensure,deactivate,characterMarkup,setCharacterActive,baseAsset:BASE_ASSET,auraAsset:AURA_ASSET};
})(typeof window!=='undefined'?window:globalThis);
