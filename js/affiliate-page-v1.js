/* affiliate.html: sign up as an affiliate without entering the app (owner, 2026-10-25).
   Same Supabase project and default session storage as js/cloud.js, so the account and the login carry
   over to the app. The application goes through the existing `affiliate-application` edge function
   (pa_private.apply_affiliate_application: approved at registration, welcome e-mail queued). */
(function(){
  'use strict';
  const URL_='https://pxxekdeqlxwqwaqvfbnh.supabase.co',KEY='sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C';
  const APP_URL='https://pahlawanangka.netlify.app/';
  const $=id=>document.getElementById(id);
  const views=['loading','vAuth','vDetails','vLink','vNote'];
  const show=id=>views.forEach(v=>{const el=$(v);if(el)el.hidden=v!==id});
  const say=(id,text,ok)=>{const el=$(id);if(!el)return;el.textContent=text||'';el.className='msg'+(text?(ok?' ok':' err'):'')};
  const safeRef=v=>String(v||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,32);
  const money=c=>'RM'+(Number(c)/100).toFixed(Number(c)%100?2:0);
  let client=null,mode='register',busy=false;

  function sb(){
    if(client)return client;
    if(!window.supabase?.createClient)throw Error('Sambungan gagal dimuat. Muat semula halaman.');
    client=window.supabase.createClient(URL_,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }
  function authError(e){
    const raw=String(e?.message||e||'').toLowerCase();
    if(raw.includes('invalid login'))return 'E-mel atau kata laluan tidak tepat.';
    if(raw.includes('already registered')||raw.includes('already been registered'))return 'E-mel ini sudah berdaftar. Pilih "Sudah ada akaun".';
    if(raw.includes('email not confirmed'))return 'Sahkan e-mel anda dahulu. Semak peti masuk (dan folder spam).';
    if(raw.includes('rate limit')||raw.includes('too many'))return 'Terlalu banyak cubaan. Cuba lagi sebentar.';
    if(raw.includes('password'))return 'Kata laluan minimum 8 aksara.';
    return 'Tidak berjaya. Cuba lagi.';
  }

  async function loadRates(){
    try{
      const {data,error}=await sb().from('plan_catalog').select('plan,price_cents,commission_cents,active').eq('active',true);
      if(error||!data)return;
      for(const r of data){
        if(r.plan==='premium'){$('pPrice').textContent=money(r.price_cents);$('pComm').textContent=money(r.commission_cents)}
        if(r.plan==='family_plus'){$('fPrice').textContent=money(r.price_cents);$('fComm').textContent=money(r.commission_cents)}
      }
    }catch(_){}
  }

  async function route(){
    let session=null;
    try{session=(await sb().auth.getSession()).data.session}catch(e){show('vNote');$('noteTitle').textContent='Tidak dapat disambung';$('noteText').textContent=e.message||'Muat semula halaman.';return}
    if(!session){show('vAuth');return}
    const user=session.user;
    let app=null;
    try{
      const r=await sb().from('affiliate_applications').select('status,code,display_name').eq('user_id',user.id).maybeSingle();
      if(r.error)throw r.error;app=r.data;
    }catch(_){app=null}
    if(app&&app.status==='suspended'){
      show('vNote');$('noteTitle').textContent='Akaun affiliate digantung';$('noteText').textContent='Hubungi kami jika anda rasa ini satu kesilapan.';return;
    }
    if(app&&app.status==='approved'&&app.code){renderLink(app.code);return}
    $('acct').value=user.email||'';
    if(!$('name').value)$('name').value=(user.user_metadata?.full_name||user.user_metadata?.name||'').slice(0,120);
    show('vDetails');
  }

  function renderLink(code){
    const ref=safeRef(code),link=APP_URL+'?ref='+encodeURIComponent(ref);
    $('refLink').value=link;$('refCode').textContent=ref;
    // Owner (2026-10-25): stronger hooks. Three ready posts; claims stay true to the product (no invented
    // testimonials, since the affiliate posts as themselves).
    const CAPTIONS=[
      ['Game vs latihan','Anak boleh main game berjam-jam, tapi buat latihan Matematik 10 minit dah mengeluh? 😩\n\nPahlawan Angka tukar latihan Matematik jadi game. Setiap jawapan betul, Wira menyerang dan pecahkan gembok untuk selamatkan haiwan peliharaan. Ikut silibus KSSR Tahun 1 hingga 6.\n\nCuba demo percuma dulu, tak perlu bayar 👇\n'],
      ['UASA','UASA makin dekat, tapi anak masih kira guna jari? 🤔\n\nPahlawan Angka latih sifir, tambah, tolak, pecahan, wang dan masa ikut KSSR Tahun 1 hingga 6, dalam bentuk game. Ibu bapa boleh nampak kemajuan anak.\n\nDemo percuma di sini 👇\n'],
      ['Screen time','Screen time anak tak semestinya membazir. 📱➡️🧠\n\n15 minit sehari dengan Pahlawan Angka: anak rasa macam main game, tapi sebenarnya sedang latih Matematik ikut KSSR Tahun 1 hingga 6.\n\nCuba demo percuma 👇\n']
    ];
    let pick=0;
    const tabs=$('capTabs');tabs.textContent='';
    const apply=i=>{pick=i;const caption=CAPTIONS[i][1]+link;$('caption').textContent=caption;$('wa').href='https://wa.me/?text='+encodeURIComponent(caption);
      [...tabs.children].forEach((b,j)=>b.setAttribute('aria-selected',String(j===i)))};
    CAPTIONS.forEach(([label],i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=label;b.onclick=()=>apply(i);tabs.appendChild(b)});
    apply(0);
    $('tryApp').href='./';   // own purchases earn no commission, so the app opens without the ref
    if(navigator.share){$('nativeShare').hidden=false;$('nativeShare').onclick=()=>navigator.share({title:'Pahlawan Angka',text:$('caption').textContent}).catch(()=>{})}
    show('vLink');
  }
  async function copy(text,okText){
    try{await navigator.clipboard.writeText(text);say('linkMsg',okText,true)}
    catch(_){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');say('linkMsg',okText,true)}catch(__){say('linkMsg','Tekan lama pada pautan untuk salin.')}t.remove()}
  }

  function setMode(m){
    mode=m;$('tReg').setAttribute('aria-selected',String(m==='register'));$('tLog').setAttribute('aria-selected',String(m==='login'));
    $('authBtn').textContent=m==='register'?'Daftar':'Log masuk';$('password').autocomplete=m==='register'?'new-password':'current-password';say('authMsg','');
  }
  async function google(){
    if(!$('consent').checked){say('authMsg','Tandakan persetujuan dahulu.');return}
    const b=$('google');b.disabled=true;
    try{
      const {error}=await sb().auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});
      if(error)throw error;
    }catch(_){b.disabled=false;say('authMsg','Log masuk Google belum tersedia. Cuba e-mel.')}
  }
  async function submitAuth(ev){
    ev.preventDefault();if(busy)return;
    const email=$('email').value.trim().toLowerCase(),password=$('password').value;
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){say('authMsg','Masukkan e-mel yang sah.');return}
    if(password.length<8){say('authMsg','Kata laluan minimum 8 aksara.');return}
    if(mode==='register'&&!$('consent').checked){say('authMsg','Tandakan persetujuan dahulu.');return}
    busy=true;$('authBtn').disabled=true;say('authMsg','');
    try{
      if(mode==='register'){
        const {data,error}=await sb().auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
        if(error)throw error;
        if(!data.session){say('authMsg','Hampir siap! Kami hantar e-mel pengesahan ke '+email+'. Klik pautan dalam e-mel itu dan anda akan kembali ke sini.',true);return}
      }else{
        const {error}=await sb().auth.signInWithPassword({email,password});if(error)throw error;
      }
      await route();
    }catch(e){say('authMsg',authError(e))}
    finally{busy=false;$('authBtn').disabled=false}
  }
  async function join(ev){
    ev.preventDefault();if(busy)return;
    const name=$('name').value.trim();let phone=$('phone').value.replace(/\D/g,'');
    if(!name){say('joinMsg','Isi nama penuh.');return}
    if(!/^[0-9]{9,12}$/.test(phone)){say('joinMsg','Nombor telefon tidak sah. Contoh: 0123456789.');return}
    busy=true;$('joinBtn').disabled=true;say('joinMsg','Menyediakan pautan anda…',true);
    try{
      const r=await sb().functions.invoke('affiliate-application',{body:{display_name:name,phone,account_name:'',bank_name:'',account_number:''}});
      if(r.error){let detail='';try{detail=(await r.error.context?.clone?.().json())?.error||''}catch(_){}throw Error(detail||r.error.message)}
      say('joinMsg','');await route();
    }catch(e){
      const raw=String(e?.message||'').toLowerCase();
      say('joinMsg',raw.includes('verified')?'Sahkan e-mel anda dahulu, kemudian cuba lagi.':raw.includes('suspended')?'Akaun affiliate ini digantung.':'Tidak berjaya mendaftar. Cuba lagi sebentar.');
    }finally{busy=false;$('joinBtn').disabled=false}
  }
  async function logout(){try{await sb().auth.signOut()}catch(_){}setMode('register');show('vAuth')}

  function boot(){
    $('tReg').onclick=()=>setMode('register');$('tLog').onclick=()=>setMode('login');
    $('google').onclick=google;$('fAuth').addEventListener('submit',submitAuth);$('vDetails').addEventListener('submit',join);
    document.querySelectorAll('[data-logout]').forEach(b=>b.addEventListener('click',logout));
    $('copyLink').onclick=()=>copy($('refLink').value,'Pautan disalin.');
    $('copyCaption').onclick=()=>copy($('caption').textContent,'Ayat dan pautan disalin.');
    try{sb().auth.onAuthStateChange(ev=>{if(ev==='SIGNED_IN'||ev==='SIGNED_OUT')route()})}catch(_){}
    loadRates();route();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.__affiliatePage={route,renderLink};   // tests only
})();
