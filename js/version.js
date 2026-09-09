/* Pahlawan Angka — single source of truth for release version.
   Future releases should bump ONLY this value. */
globalThis.PA_APP_VERSION='3.62.12';

// sw.js imports this file before declaring its own cache listeners. Load the
// Year 2 extension only in worker context so first-install offline support also
// includes the new SP-level curriculum assets.
if(typeof importScripts==='function'&&typeof document==='undefined'){
  try{importScripts('./js/year2-sw-v3.62.12.js');}catch(error){console.warn('Year 2 offline extension tidak dapat dimuatkan:',error);}
}

(function syncVersionUi(){
  if(typeof document==='undefined')return;
  const render=()=>{
    document.documentElement.dataset.paAppVersion=globalThis.PA_APP_VERSION;
    document.querySelectorAll('[data-app-version]').forEach(el=>{
      el.textContent=`Pahlawan Angka · v${globalThis.PA_APP_VERSION}`;
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});
  else render();
})();
