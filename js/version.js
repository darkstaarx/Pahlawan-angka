/* Pahlawan Angka — single source of truth for release version.
   Future releases should bump ONLY this value. */
globalThis.PA_APP_VERSION='3.75.1';

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

/* Demo rescue uses the same production response renderer without making the
   51KB Segel scene own or duplicate that engine. This loader is browser-only;
   version.js is also imported by the service worker. */
(function loadSegelInteractionBridge(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-segel-interaction-bridge]'))return;
  const script=document.createElement('script');
  script.src=`js/segel-interaction-bridge-v1.0.0.js?v=${globalThis.PA_APP_VERSION}`;
  script.async=false;
  script.dataset.segelInteractionBridge='1';
  document.head.appendChild(script);
})();
