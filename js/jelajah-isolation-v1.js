/* Loaded BEFORE any game script, only by the generated preview runtime. */
(()=>{'use strict';
 const memory=()=>{const values=new Map();return {getItem:k=>values.get(String(k))??null,setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(String(k)),clear:()=>values.clear(),key:i=>[...values.keys()][i]??null,get length(){return values.size}}};
 Object.defineProperty(window,'localStorage',{value:memory()});
 Object.defineProperty(window,'sessionStorage',{value:memory()});
 Object.defineProperty(navigator,'serviceWorker',{value:{register:()=>Promise.reject(new Error('Service worker disabled in development preview'))}});
 navigator.sendBeacon=()=>false;
 const originalFetch=window.fetch.bind(window);
 window.fetch=(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.href);
  const method=options.method||input?.method||'GET';
  if(url.origin!==location.origin||method!=='GET')return Promise.reject(new Error('Demo Jelajah: network write blocked'));
  return originalFetch(input,options);
 };
 const open=XMLHttpRequest.prototype.open;
 XMLHttpRequest.prototype.open=function(method,url,...args){if(method!=='GET'||new URL(url,location.href).origin!==location.origin)throw new Error('Demo Jelajah: external request blocked');return open.call(this,method,url,...args)};
})();
