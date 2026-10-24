(function(){
  'use strict';
  const C=window.PACalibrationCore;
  const state={client:null,user:null,rows:[],loadId:0};
  const $=id=>document.getElementById(id);
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=String(text);if(cls)e.className=cls;return e};
  const denied=e=>['401','403','42501'].includes(String(e?.status||e?.code))||/admin required|unauthorized|forbidden/i.test(e?.message||'');
  function showApp(on){$('loginView').hidden=on===true;$('appView').hidden=on!==true}
  function msg(id,text){$(id).textContent=text||''}
  function client(){
    if(!state.client){
      if(!window.supabase?.createClient)throw Error('Sambungan login gagal dimuat. Muat semula halaman.');
      // Same project and storage key as admin/index.html, so one admin log in serves both pages.
      state.client=window.supabase.createClient('https://pxxekdeqlxwqwaqvfbnh.supabase.co','sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C',{
        auth:{persistSession:true,storageKey:'pa-affiliate-admin-auth',autoRefreshToken:true,detectSessionInUrl:true}});
    }
    return state.client;
  }
  async function load(){
    const id=++state.loadId;msg('appMessage','Memuatkan data…');
    try{
      const {data,error}=await client().rpc('admin_calibration_rows',{p_days:Number($('days').value)||90});
      if(id!==state.loadId)return;
      if(error){if(denied(error)){state.user=null;showApp(false);msg('authMessage','Akses ditolak. Gunakan akaun admin Pahlawan Angka.');return}throw error}
      state.rows=Array.isArray(data?.rows)?data.rows:[];showApp(true);
      msg('generatedAt','Data '+(data?.days||'')+' hari · dikemas kini '+new Date(data?.generated_at||Date.now()).toLocaleString('ms-MY',{timeZone:'Asia/Kuala_Lumpur'}));
      render();msg('appMessage','');
    }catch(e){if(id===state.loadId)msg('appMessage','Gagal memuatkan: '+(e?.message||e))}
  }
  function render(){
    const s=C.summarize(state.rows,{includeMine:$('mine').checked});
    const m=$('metrics');m.replaceChildren();
    [[s.answers,'Jawapan'],[s.children,'Murid'],[s.eligible,'Murid cukup data (≥5 jawapan, 30 hari)'],[s.facetsPct+'%','Jawapan ada data otak']].forEach(([v,l])=>{const d=el('div',null,'cal-metric');d.append(el('b',v),el('span',l));m.append(d)});
    const fb=$('findingRows');fb.replaceChildren();
    if(!s.findings.length){const tr=el('tr');const td=el('td','Belum ada dapatan. Data otak baru mula dikumpul.');td.colSpan=7;tr.append(td);fb.append(tr)}
    for(const f of s.findings){
      const tr=el('tr');tr.append(el('td',f.id),el('td',f.lens),el('td',f.kids,'num'),el('td',f.pct+'%','num'),el('td',f.high,'num'));
      const ev=el('td',null,'cal-ev');ev.textContent=Object.entries(f.evidence).map(([k,v])=>k+' '+(Math.round(v*10)/10)).join(' · ')||'—';
      tr.append(ev,el('td',f.example,'cal-ex'));fb.append(tr);
    }
    const cb=$('childRows');cb.replaceChildren();
    for(const c of s.list){
      const tr=el('tr');tr.append(el('td',c.code),el('td',c.grade,'num'),el('td',c.answers,'num'),el('td',c.recent,'num'),el('td',c.richPct+'%','num'));
      const td=el('td');if(!c.enough)td.append(el('span','kurang data','cal-tag'));c.findings.forEach(id=>td.append(el('span',id,'cal-tag')));tr.append(td);cb.append(tr);
    }
  }
  function downloadCsv(){
    const blob=new Blob([C.csv(state.rows,{includeMine:$('mine').checked})],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pa-kalibrasi-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  async function signIn(ev){
    ev.preventDefault();const b=$('loginForm').querySelector('button');b.disabled=true;msg('authMessage','Mengesahkan akaun…');
    try{const {data,error}=await client().auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;state.user=data.user;$('password').value='';msg('authMessage','');await load()}
    catch(e){msg('authMessage','Log masuk gagal. Semak e-mel dan kata laluan.')}finally{b.disabled=false}
  }
  async function google(){
    try{const {error}=await client().auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/admin/kalibrasi.html',queryParams:{prompt:'select_account'}}});if(error)throw error}
    catch(e){msg('authMessage','Login Google gagal. Cuba lagi.')}
  }
  async function logout(){try{await client().auth.signOut()}catch(_){}state.user=null;state.rows=[];showApp(false);msg('authMessage','Anda telah log keluar.')}
  $('loginForm').addEventListener('submit',signIn);$('googleButton').addEventListener('click',google);$('logoutButton').addEventListener('click',logout);
  $('refreshButton').addEventListener('click',load);$('days').addEventListener('change',load);$('mine').addEventListener('change',render);$('csvButton').addEventListener('click',downloadCsv);
  (async()=>{try{const {data}=await client().auth.getSession();if(data.session?.user){state.user=data.session.user;await load()}}catch(e){msg('authMessage',e?.message||'Ralat sambungan.')}})();
  window.__calibration={state,render,load}; // ujian sahaja
})();
