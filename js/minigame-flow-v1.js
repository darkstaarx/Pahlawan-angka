/* Shared normal-round pacing. Original check() retains scoring/set completion. */
(()=>{'use strict';let timer=null,held=false;const queued=new WeakSet();
const hold=()=>{held=true;if(timer)clearTimeout(timer);timer=null;const b=document.getElementById('check');if(b)b.disabled=true};
function queueNext({question,current,isSolved,advance,button}){
 if(!question||queued.has(question))return;queued.add(question);
 if(button){button.textContent='Betul!';button.disabled=true;}
 if(timer)clearTimeout(timer);if(held)return;
 timer=setTimeout(()=>{timer=null;if(held||current()!==question||!isSolved())return;if(button)button.disabled=false;advance()},1000);
}
/* Slab-arrow SVG follows fun-isometric drawing rules; its focus ring animates, not the art. */
const cueArrow='<svg viewBox="0 0 68 48" aria-hidden="true"><g stroke="#06164c" stroke-width="2.6" stroke-linejoin="miter"><path d="M7 15H33V7L60 25V32L33 47V37H7Z" fill="#003673"/><path d="M7 8H33V1L60 21L33 39V30H7Z" fill="#0067d9"/><path d="M11 12H32V17H11Z" fill="#a8e4ff" stroke="none"/><path d="m37 8 12 10" stroke="#fff5d6" fill="none"/></g></svg>';
function offerCue(el){
 const offered=el.textContent.trim()==='Jom tengok cara';
 if(offered&&!el.dataset.paCue){el.dataset.paCue='1';el.classList.add('pa-worked-cue');el.setAttribute('aria-label','Jom tengok cara');el.innerHTML='<span class="pa-cue-arrow" aria-hidden="true">'+cueArrow+'<i class="pa-cue-cursor" aria-hidden="true"><svg viewBox="0 0 32 38"><path d="M3 2v25l7-6 5 11 6-3-5-10h10Z" fill="#fff" stroke="#06164c" stroke-width="2" stroke-linejoin="round"/></svg></i></span><span class="pa-cue-label">Jom tengok cara</span>'}
 else if(!offered&&el.dataset.paCue){delete el.dataset.paCue;el.classList.remove('pa-worked-cue');if(el.getAttribute('aria-label')==='Jom tengok cara')el.removeAttribute('aria-label')}
}
function feedback(){const selector='#hint,.fld,.abox,.tl,[class*=wk-]';const update=el=>{if(!(el instanceof Element)||!el.matches(selector))return;if(el.id==='hint'){offerCue(el);return}const bad=el.matches('.fld.bad,.abox.bad,.tl.nope,.wk-no');if(bad){if(!el.classList.contains('pa-error-focus'))el.classList.add('pa-error-focus');el.setAttribute('aria-invalid','true')}else if(el.classList.contains('pa-error-focus')){el.classList.remove('pa-error-focus');el.removeAttribute('aria-invalid')}};
 const observer=new MutationObserver(rows=>rows.forEach(row=>{update(row.target);if(row.type==='childList')row.addedNodes.forEach(n=>{update(n);n.querySelectorAll?.(selector).forEach(update)})}));observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});document.querySelectorAll(selector).forEach(update);
}
window.PAMiniGameFlow={queueNext,hold};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',feedback,{once:true});else feedback();
})();
