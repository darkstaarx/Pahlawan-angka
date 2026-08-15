// Pahlawan Angka release loader.
(()=>{
  const APP_VERSION='3.19.1';
  const INTEGRITY_VERSION='3.18.1';
  const SENSORY_VERSION='3.19.0';
  const MANIPULATIVE_VERSION='3.19.1';
  const guard=`questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js?v=${INTEGRITY_VERSION}`;
  const sensoryCss=`css/sensory-learning-v${SENSORY_VERSION}.css?v=${SENSORY_VERSION}`;
  const sensoryJs=`js/sensory-learning-v${SENSORY_VERSION}.js?v=${SENSORY_VERSION}`;
  const manipCss=`css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css?v=${MANIPULATIVE_VERSION}`;
  const manipJs=`js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js?v=${MANIPULATIVE_VERSION}`;

  if(document.readyState==='loading'){
    if(!document.querySelector(`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`))document.write(`<script src="${guard}"><\/script>`);
    if(!document.querySelector(`link[href^="css/sensory-learning-v${SENSORY_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${sensoryCss}">`);
    if(!document.querySelector(`script[src^="js/sensory-learning-v${SENSORY_VERSION}.js"]`))document.write(`<script src="${sensoryJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${manipCss}">`);
    if(!document.querySelector(`script[src^="js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js"]`))document.write(`<script src="${manipJs}"><\/script>`);
  }else{
    const loadCss=(src,selector)=>{
      if(document.querySelector(selector))return;
      const l=document.createElement('link');l.rel='stylesheet';l.href=src;document.head.appendChild(l);
    };
    const loadScript=(src,selector,onload)=>{
      if(document.querySelector(selector)){onload?.();return}
      const s=document.createElement('script');s.src=src;s.async=false;if(onload)s.onload=onload;document.head.appendChild(s);
    };
    const loadManip=()=>{
      loadCss(manipCss,`link[href^="css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css"]`);
      loadScript(manipJs,`script[src^="js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js"]`);
    };
    const loadSensory=()=>{
      loadCss(sensoryCss,`link[href^="css/sensory-learning-v${SENSORY_VERSION}.css"]`);
      loadScript(sensoryJs,`script[src^="js/sensory-learning-v${SENSORY_VERSION}.js"]`,loadManip);
    };
    loadScript(guard,`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`,loadSensory);
  }

  window.PARelease={version:APP_VERSION,integrity:INTEGRITY_VERSION,sensory:SENSORY_VERSION,manipulatives:MANIPULATIVE_VERSION};
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
