/* Pahlawan Angka — single source of truth for release version.
   Future releases should bump ONLY this value. */
globalThis.PA_APP_VERSION='3.75.3';

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

/* Demo v2 entry cinematic. The wrapper prepares the live Demo behind the
   supplied portrait video, then fades the video away only when both the video
   and Demo boot have completed. */
(function loadSegelEntryCinematic(){
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-segel-entry-cinematic]'))return;
  const script=document.createElement('script');
  script.src=`js/segel-entry-cinematic-v1.0.0.js?v=${globalThis.PA_APP_VERSION}`;
  script.async=false;
  script.dataset.segelEntryCinematic='1';
  document.head.appendChild(script);
})();
