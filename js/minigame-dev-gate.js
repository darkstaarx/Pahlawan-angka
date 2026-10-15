/* DEV controls are visible only when the owning Pahlawan Angka app is in DEV.
   Local standalone previews also honor the app's existing local DEV unlock. */
(()=>{
  'use strict';
  function enabled(){
    const isLocal=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    try{
      const app=window.parent;
      // `db` is a top-level lexical binding in the host app, not a window property.
      // Let the host's own guard decide whether its selected profile has DEV access.
      if(app!==window&&typeof app.isDevMode==='function'&&app.isDevMode()===true)return true;
    }catch(_){}
    try{if(isLocal&&localStorage.getItem('pa_dev_unlocked')==='1')return true}catch(_){}
    return false;
  }
  window.PAMiniGameDev={enabled};
})();
