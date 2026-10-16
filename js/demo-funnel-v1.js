// Anonymous session counts only. Never send profiles, answers, scores or full URLs.
(()=>{'use strict';
  const endpoint='https://pxxekdeqlxwqwaqvfbnh.supabase.co/rest/v1/demo_funnel_events';
  const key='sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C';
  const events=new Set(['website_visit','demo_open','demo_start','demo_complete']);
  const storageKey='pa_demo_funnel_v1', ttl=30*60*1000;
  const params=new URLSearchParams(location.search);
  const test=params.get('pa_tracking_test')==='1'||!['pahlawanangka.netlify.app','darkstaarx.github.io'].includes(location.hostname);
  const disabled=navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
  let session, pending=new Set();
  const clean=value=>typeof value==='string'&&/^[\p{L}\p{N} _|.():+\/-]{1,120}$/u.test(value)?value:null;
  const attribution=()=>Object.fromEntries(['source','medium','campaign','content'].map(name=>['utm_'+name,clean(params.get('utm_'+name))]));
  function fresh(){return {id:crypto.randomUUID(),at:Date.now(),test,attribution:attribution(),sent:[]};}
  function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(session));}catch(_){}}
  function current(){
    if(!session){try{session=JSON.parse(sessionStorage.getItem(storageKey));}catch(_){} }
    const incoming=attribution(), changed=Object.values(incoming).some(Boolean)&&JSON.stringify(incoming)!==JSON.stringify(session?.attribution);
    if(!session||!Number.isFinite(session.at)||Date.now()-session.at>ttl||session.test!==test||changed||!/^[0-9a-f-]{36}$/i.test(session.id)||!Array.isArray(session.sent))session=fresh();
    session.at=Date.now(); save(); return session;
  }
  async function track(event){
    if(disabled||!events.has(event))return;
    try{
      const s=current(), token=s.id+':'+event;
      if(s.sent.includes(event)||pending.has(token))return;
      pending.add(token);
      const payload={session_id:s.id,event_name:event,is_test:s.test,...s.attribution};
      let delivered=false;
      try{
        for(let attempt=0;attempt<3;attempt++){
          try{
            const response=await fetch(endpoint,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload),keepalive:true,credentials:'omit'});
            if(response.ok||response.status===409){delivered=true;break;}
            if(response.status<500&&response.status!==429)break;
          }catch(_){}
          if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));
        }
        if(delivered){s.sent.push(event);save();}
      }finally{pending.delete(token);}
    }catch(_){} // Tracking must never interrupt gameplay or login.
  }
  window.PADemoFunnel=Object.freeze({track});
  const visit=()=>track('website_visit');
  window.addEventListener('online',visit);
  visit();
})();
