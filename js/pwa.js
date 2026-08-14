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
