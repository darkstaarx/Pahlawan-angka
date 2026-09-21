/* Pahlawan Angka — single source of truth for release version.
   Future releases should bump ONLY this value. */
globalThis.PA_APP_VERSION='3.84.5';

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

/* Demo v2 owns its visual language. The bridge may use production interaction
   logic only for questions that explicitly opt in; answer formats alone must
   never replace the Demo's approved answer buttons. Browser-only because this
   file is also imported by the service worker. */
(function loadSegelInteractionBridge(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-segel-interaction-bridge]'))return;
  const script=document.createElement('script');
  script.src=`js/segel-interaction-bridge-v1.0.2.js?v=${globalThis.PA_APP_VERSION}`;
  script.async=false;
  script.dataset.segelInteractionBridge='1';
  document.head.appendChild(script);
})();

/* Demo v2 entry cinematic. v1.2.0 keeps the two-stage transition
   (video -> dark hold -> battle reveal) and adds a "Langkau" control that
   seeks to the last two seconds of the portal video rather than cutting it,
   so returning players still see Wira dissolve into particles. */
(function loadSegelEntryCinematic(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-segel-entry-cinematic]'))return;
  const script=document.createElement('script');
  script.src=`js/segel-entry-cinematic-v1.2.0.js?v=${globalThis.PA_APP_VERSION}`;
  script.async=false;
  script.dataset.segelEntryCinematic='1';
  document.head.appendChild(script);
})();
