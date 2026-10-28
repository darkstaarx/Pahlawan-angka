/* Shared normal-round pacing. Original check() retains scoring/set completion. */
(()=>{'use strict';let timer=null,held=false;const queued=new WeakSet();
const hold=()=>{held=true;if(timer)clearTimeout(timer);timer=null;const b=document.getElementById('check');if(b)b.disabled=true};
function queueNext({question,current,isSolved,advance,button}){
 if(!question||queued.has(question))return;queued.add(question);
 if(button){button.textContent='Betul!';button.disabled=true;}
 if(timer)clearTimeout(timer);if(held)return;
 timer=setTimeout(()=>{timer=null;if(held||current()!==question||!isSolved())return;if(button)button.disabled=false;advance()},1000);
}
function feedback(){const selector='.fld,.abox,.tl,[class*=wk-]';const update=el=>{if(!(el instanceof Element)||!el.matches(selector))return;const bad=el.matches('.fld.bad,.abox.bad,.tl.nope,.wk-no');if(bad){if(!el.classList.contains('pa-error-focus'))el.classList.add('pa-error-focus');el.setAttribute('aria-invalid','true')}else if(el.classList.contains('pa-error-focus')){el.classList.remove('pa-error-focus');el.removeAttribute('aria-invalid')}};
 const observer=new MutationObserver(rows=>rows.forEach(row=>{if(row.type==='attributes')update(row.target);else row.addedNodes.forEach(n=>{update(n);n.querySelectorAll?.(selector).forEach(update)})}));observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});document.querySelectorAll(selector).forEach(update);
}
window.PAMiniGameFlow={queueNext,hold};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',feedback,{once:true});else feedback();
})();
