// Pahlawan Angka release loader.
(()=>{
  const APP_VERSION='3.19.0';
  const INTEGRITY_VERSION='3.18.1';
  const guard=`questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js?v=${INTEGRITY_VERSION}`;
  const sensoryCss=`css/sensory-learning-v${APP_VERSION}.css?v=${APP_VERSION}`;
  const sensoryJs=`js/sensory-learning-v${APP_VERSION}.js?v=${APP_VERSION}`;

  if(document.readyState==='loading'){
    if(!document.querySelector(`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`))document.write(`<script src="${guard}"><\/script>`);
    if(!document.querySelector(`link[href^="css/sensory-learning-v${APP_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${sensoryCss}">`);
    if(!document.querySelector(`script[src^="js/sensory-learning-v${APP_VERSION}.js"]`))document.write(`<script src="${sensoryJs}"><\/script>`);
  }else{
    const loadScript=(src,selector,onload)=>{
      if(document.querySelector(selector)){onload?.();return}
      const s=document.createElement('script');s.src=src;s.async=false;if(onload)s.onload=onload;document.head.appendChild(s);
    };
    const loadSensory=()=>{
      if(!document.querySelector(`link[href^="css/sensory-learning-v${APP_VERSION}.css"]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=sensoryCss;document.head.appendChild(l)}
      loadScript(sensoryJs,`script[src^="js/sensory-learning-v${APP_VERSION}.js"]`);
    };
    loadScript(guard,`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`,loadSensory);
  }
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
