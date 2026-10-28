// Injected by the local preview server only. Production landing wiring is unchanged.
window.addEventListener('message',event=>{
 const landing=document.getElementById('paApprovedLanding');
 if(event.origin!==location.origin||event.source!==landing?.contentWindow)return;
 if(event.data?.type!=='pa-approved-landing-action'||event.data.action!=='demo')return;
 event.stopImmediatePropagation();
 location.assign('/demo-jelajah.html');
},true);
