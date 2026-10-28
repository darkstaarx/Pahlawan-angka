(() => {'use strict';
const frame=document.getElementById('paApprovedLanding');if(!frame)return;
function act(action,plan){if(action==='demo'){location.assign('/demo-jelajah.html');return}if(!window.PAEntry)return;if(action==='login')window.PAEntry.login();else if(action==='plans')window.PAEntry.plans();else if(action==='choose'&&['family_plus','premium'].includes(plan))window.PAEntry.choose(plan);}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;const data=event.data;if(data?.type==='pa-approved-landing-height'&&Number.isFinite(data.height)&&data.height>=300&&data.height<=15000){frame.style.height=Math.ceil(data.height)+'px';return;}if(data?.type==='pa-approved-landing-action')act(data.action,data.plan);});
// The frame may have posted its height before this deferred script ran; ask again.
const measure=()=>frame.contentWindow?.postMessage({type:'pa-approved-landing-measure'},location.origin);measure();frame.addEventListener('load',measure);
const params=new URLSearchParams(location.search),action=params.get('landing_action'),plan=params.get('landing_plan');if(['demo','login','plans','choose'].includes(action)){params.delete('landing_action');params.delete('landing_plan');history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash);act(action,plan);}
})();
