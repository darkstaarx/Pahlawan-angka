// Cikgu Dimensi now opens the live mixed-practice battle, never old Learning Camp.
(()=>{'use strict';
 window.PAJelajahCoach={mount(host,scenario,options={}){
  const frame=document.createElement('iframe');frame.title='Cikgu Dimensi · Latihan campuran';frame.className='paJelajahCoachFrame';
  frame.src='jelajah-runtime.html?activity=focus&grade='+scenario.grade;const loading=document.createElement('div');loading.className='demo-loading';loading.setAttribute('role','status');loading.textContent='Cikgu tengah sediakan soalan…';host.replaceChildren(loading,frame);
  const receive=e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.source!=='pa-jelajah'||e.data.grade!==scenario.grade)return;
   if(e.data.type==='question')loading.remove();
   if(e.data.type==='focus-ready')frame.contentWindow.postMessage({source:'pa-jelajah-controller',type:'focus-start',grade:scenario.grade,snapshot:options.snapshot},location.origin);
   if(e.data.type==='finished')options.onComplete?.(e.data);
  };window.addEventListener('message',receive);
  return()=>{window.removeEventListener('message',receive);frame.remove()};
 }};
})();
