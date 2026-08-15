// Load the post-bank curriculum integrity guard before the page becomes interactive.
(()=>{
  const src='questions/kssr-content-integrity-v3.18.1.js?v=3.18.1';
  if(document.querySelector(`script[src^="questions/kssr-content-integrity-v3.18.1.js"]`))return;
  if(document.readyState==='loading'){
    document.write(`<script src="${src}"><\/script>`);
    return;
  }
  const script=document.createElement('script');
  script.src=src;script.async=false;
  document.head.appendChild(script);
})();

(()=>{
  if(!('serviceWorker' in navigator))return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(registration=>{
      registration.update().catch(()=>{});
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='visible')registration.update().catch(()=>{});
      });
    }).catch(error=>console.warn('PWA service worker tidak dapat didaftarkan:',error));
  });
})();
