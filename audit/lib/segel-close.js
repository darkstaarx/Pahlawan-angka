'use strict';
// The real Segel exit path for the page-lock audits: closeSegelDemo() plus
// the module state and helpers it reads (guest wrap-up flag, `$`, and the
// result back-button label). Throws when the source no longer matches.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
function segelCloseSource(){
 const segel=fs.readFileSync(path.join(root,'js/segel-demo-v2.1.0.js'),'utf8');
 const line=re=>{const m=segel.match(re);if(!m)throw new Error('Segel source missing '+re);return m[0].trim();};
 const slice=(from,to)=>{const a=segel.indexOf(from),b=segel.indexOf(to,a);if(a<0||b<=a)throw new Error('Segel source missing '+from);return segel.slice(a,b);};
 return [
  line(/^\s*let guestCompleted=.*$/m),
  line(/^\s*const \$ = .*$/m),
  slice('function setDoneBackLabel(','\n  function startRun('),
  slice('window.closeSegelDemo=function(){','\n  window.restartSegelDemo=')
 ].join('\n');
}
module.exports={segelCloseSource};
