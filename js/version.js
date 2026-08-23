/* Pahlawan Angka — single source of truth for release version.
   Future releases should bump ONLY this value. */
globalThis.PA_APP_VERSION='3.37.0';

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
