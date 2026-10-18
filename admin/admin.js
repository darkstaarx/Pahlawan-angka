(function () {
  'use strict';
  const C = window.PAAffiliateAdminCore;
  const state = { client:null, user:null, data:null, selected:null, selectedIds:new Set(), epoch:0, loadId:0, bankId:0, loading:false, payoutBusy:false };
  const $ = id => document.getElementById(id);
  const put = (id, value) => { $(id).textContent=String(value ?? ''); };
  const element = (tag,value,cls) => { const e=document.createElement(tag); if(value!=null)e.textContent=String(value); if(cls)e.className=cls; return e; };
  const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('ms-MY',{dateStyle:'medium',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(value)) : '—';
  const rowLabel = row => row.order_reference || row.order_id || '—';
  const label = value => ({approved:'Diluluskan',pending:'Menunggu',rejected:'Ditolak',suspended:'Digantung',paid:'Dibayar',void:'Dibatalkan',unpaid:'Belum dibayar'}[value] || value || '—');
  const denied = error => ['401','403','42501'].includes(String(error?.status || error?.code)) || /admin required|unauthorized|forbidden/i.test(error?.message || '');
  const active = (epoch,uid) => epoch===state.epoch && uid===state.user?.id;
  function message(id,value,good=false){ put(id,value); $(id).classList.toggle('success',good); }
  function showApp(on){ $('loginView').hidden=on===true; $('appView').hidden=on!==true; }
  function client(){
    if(!state.client){
      if(!window.supabase?.createClient)throw Error('Sambungan login gagal dimuat. Muat semula halaman.');
      state.client=window.supabase.createClient('https://pxxekdeqlxwqwaqvfbnh.supabase.co','sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C',{
        auth:{persistSession:true,storageKey:'pa-affiliate-admin-auth',autoRefreshToken:true,detectSessionInUrl:true}
      });
    }
    return state.client;
  }
  function closeModal(force=false){
    if(state.payoutBusy&&!force)return;
    state.bankId++; $('modal').hidden=true; $('bankDetails').replaceChildren(); $('reviewSummary').replaceChildren();
    $('payoutReference').value=''; $('transferDone').checked=false; put('modalMessage','');
  }
  function closeDrawer(force=false){
    if(state.payoutBusy&&!force)return;
    closeModal(force); $('detailDrawer').classList.remove('open'); $('detailDrawer').setAttribute('aria-hidden','true'); $('detailDrawer').inert=true;
    $('drawerBody').replaceChildren(); put('drawerName','Affiliate'); state.selected=null; state.selectedIds.clear();
  }
  function clearUi(){
    state.epoch++; state.loadId++; state.loading=false; state.payoutBusy=false; state.data=null;
    closeDrawer(true); ['metrics','affiliateList','ledgerTable'].forEach(id=>$(id).replaceChildren());
    put('appMessage',''); put('generatedAt',''); $('refreshButton').disabled=false; $('recordButton').disabled=false;
  }
  async function load(){
    if(!state.user||state.payoutBusy)return;
    const epoch=state.epoch,uid=state.user.id,loadId=++state.loadId;
    closeDrawer(); state.loading=true; $('refreshButton').disabled=true; message('appMessage','Memuatkan rekod…');
    try{
      const {data,error}=await client().rpc('admin_affiliate_dashboard');
      if(!active(epoch,uid)||loadId!==state.loadId)return;
      if(error)throw error;
      if(!Array.isArray(data?.affiliates)||!Array.isArray(data?.commissions))throw Error('Invalid snapshot');
      closeDrawer(); state.data=data; showApp(true); render(); message('appMessage','Data dikemas kini.',true);
    }catch(error){
      if(!active(epoch,uid)||loadId!==state.loadId)return;
      clearUi();
      if(denied(error)){state.user=null;showApp(false);message('authMessage','Akses ditolak. Gunakan akaun admin Pahlawan Angka.');}
      else{showApp(true);message('appMessage','Rekod belum dapat dimuatkan. Semak sambungan dan tekan Segar semula.');}
    }finally{
      if(active(epoch,uid)&&loadId===state.loadId){state.loading=false;$('refreshButton').disabled=false;}
    }
  }
  function rowsFor(id){return C.uniqueRows(state.data?.commissions || []).filter(row=>row.affiliate_id===id);}
  function affiliates(){
    const query=$('affiliateSearch').value.trim().toLowerCase(),status=$('affiliateStatus').value;
    return (state.data?.affiliates || []).filter(a=>(status==='all'||a.status===status)&&[a.display_name,a.email,a.code].join(' ').toLowerCase().includes(query));
  }
  function ledgerRows(){
    const visible=new Set(affiliates().map(a=>a.id)),byId=new Map((state.data?.affiliates||[]).map(a=>[a.id,a]));
    const rows=(state.data?.commissions||[]).filter(r=>visible.has(r.affiliate_id)).map(r=>({...r,display_name:byId.get(r.affiliate_id)?.display_name,email:byId.get(r.affiliate_id)?.email,code:byId.get(r.affiliate_id)?.code}));
    return C.filterRows(rows,{status:$('commissionStatus').value});
  }
  function render(){
    const totals=C.aggregate(state.data.commissions),cards=[['Jualan referral sah',totals.referrals],['Komisen belum dibayar',C.money(totals.payable_cents)],['Komisen dibayar',C.money(totals.paid_cents)],['Rakan affiliate',state.data.affiliates.length]];
    $('metrics').replaceChildren(...cards.map(([title,value])=>{const e=element('div',null,'metric');e.append(element('span',title),element('strong',value));return e;}));
    put('generatedAt','Dikemas kini '+date(state.data.generated_at)+' · Waktu Malaysia');renderAffiliates();renderLedger();
  }
  function renderAffiliates(){
    const host=$('affiliateList');host.replaceChildren();const rows=affiliates();
    if(!rows.length){host.append(element('div',state.data?.affiliates?.length?'Tiada affiliate yang sepadan.':'Belum ada affiliate berdaftar.','empty'));return;}
    rows.forEach(a=>{
      const button=element('button',null,'affiliate-row');button.type='button';
      const info=element('span'),totals=C.aggregate(rowsFor(a.id));
      info.append(element('strong',a.display_name||a.email||'Affiliate'),element('small',[a.email,a.code].filter(Boolean).join(' · ')),element('small',totals.referrals+' jualan · Belum dibayar '+C.money(totals.payable_cents)));
      button.append(info,element('span',label(a.status),'badge'+(a.status==='approved'?'':' inactive')));
      button.addEventListener('click',()=>openDrawer(a));host.append(button);
    });
  }
  function renderLedger(){
    const host=$('ledgerTable');host.replaceChildren();const rows=ledgerRows();
    $('csvButton').disabled=!rows.length;
    if(!rows.length){host.append(element('div','Belum ada rekod komisen untuk paparan ini. Komisen muncul selepas bayaran referral disahkan.','empty'));return;}
    const table=element('table',null,'table'),head=element('thead'),header=element('tr'),body=element('tbody');
    ['Pesanan / pakej','Affiliate','Komisen','Status','Tarikh jualan','Rujukan bayaran','Tarikh dibayar'].forEach(t=>header.append(element('th',t)));head.append(header);
    rows.slice().sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).forEach(r=>{
      const tr=element('tr'),status=C.isPayable(r)?'Belum dibayar':r.status==='pending'||r.status==='approved'?'Semak status pesanan':label(r.status);
      [rowLabel(r)+' · '+(r.order_plan==='family_plus'?'Family Plus':'Akses Keluarga'),r.display_name||r.email||'—',C.money(r.amount_cents),status,date(r.order_paid_at||r.created_at),r.payout_reference||'—',date(r.paid_at)].forEach(v=>tr.append(element('td',v)));body.append(tr);
    });table.append(head,body);host.append(table);
  }
  function openDrawer(affiliate){
    if(state.loading||state.payoutBusy||!state.data)return;
    const same=state.selected?.id===affiliate.id;if(!same)state.selectedIds.clear();closeModal();state.selected=affiliate;
    $('detailDrawer').inert=false;$('detailDrawer').classList.add('open');$('detailDrawer').setAttribute('aria-hidden','false');put('drawerName',affiliate.display_name||affiliate.email);
    const body=$('drawerBody');body.replaceChildren();const rows=rowsFor(affiliate.id),totals=C.aggregate(rows),payable=rows.filter(C.isPayable);
    body.append(element('p',affiliate.email,'muted'),element('p','Belum dibayar '+C.money(totals.payable_cents)+' · Dibayar '+C.money(totals.paid_cents),'detail-summary'),element('p',affiliate.bank_ready?'Butiran bank telah dilengkapkan.':'Butiran bank belum lengkap. Sahkan dengan affiliate sebelum transfer.','muted'));
    const card=element('div',null,'detail-card');card.append(element('p','Pautan referral','muted'));
    const wrap=element('div',null,'referral'),link=element('input'),copy=element('button','Salin','button secondary');link.readOnly=true;link.setAttribute('aria-label','Pautan referral');link.value=affiliate.code?'https://pahlawanangka.netlify.app/?ref='+encodeURIComponent(affiliate.code):'Kod belum tersedia';copy.disabled=!affiliate.code;
    copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(link.value);copy.textContent='Disalin';}catch{link.select();copy.textContent='Pilih & salin';}});wrap.append(link,copy);card.append(wrap);body.append(card);
    if(!payable.length){body.append(element('div','Tiada komisen yang boleh dibayar untuk affiliate ini.','empty'));return;}
    body.append(element('p','Pilih komisen untuk semakan. Rekodkan hanya selepas pindahan bank selesai.','muted'));
    const all=element('label',null,'check'),allBox=element('input');allBox.type='checkbox';allBox.id='selectAll';allBox.checked=payable.every(r=>state.selectedIds.has(r.id));all.append(allBox,element('span','Pilih semua yang boleh dibayar'));body.append(all);
    allBox.addEventListener('change',()=>{payable.forEach(r=>allBox.checked?state.selectedIds.add(r.id):state.selectedIds.delete(r.id));openDrawer(affiliate);});
    const holder=element('div');holder.id='drawerRows';payable.forEach(r=>{
      const line=element('label',null,'selectable'),box=element('input');box.type='checkbox';box.checked=state.selectedIds.has(r.id);box.addEventListener('change',()=>{box.checked?state.selectedIds.add(r.id):state.selectedIds.delete(r.id);allBox.checked=payable.every(v=>state.selectedIds.has(v.id));});line.append(box,element('span',rowLabel(r)),element('strong',C.money(r.amount_cents)));holder.append(line);
    });body.append(holder);const review=element('button','Semak pindahan','button primary');review.id='reviewButton';review.addEventListener('click',openReview);body.append(review);
  }
  async function openReview(){
    if(state.loading||state.payoutBusy||!state.selected)return;
    const affiliate=state.selected,rows=rowsFor(affiliate.id).filter(r=>state.selectedIds.has(r.id)&&C.isPayable(r));
    if(!rows.length){message('appMessage','Pilih sekurang-kurangnya satu komisen.');return;}
    closeModal();const bankId=++state.bankId,epoch=state.epoch,uid=state.user.id;
    put('reviewSummary',affiliate.display_name+' · '+rows.length+' komisen · '+C.money(C.sum(rows)));put('bankDetails','Memuatkan butiran bank…');$('modal').hidden=false;$('payoutReference').focus();
    try{
      const {data,error}=await client().rpc('admin_get_affiliate_bank_info',{p_affiliate_id:affiliate.id});
      if(!active(epoch,uid)||bankId!==state.bankId||$('modal').hidden)return;
      if(error)throw error;const bank=Array.isArray(data)?data[0]:data;$('bankDetails').replaceChildren();
      if(!bank){put('bankDetails','Butiran bank belum tersedia. Sahkan penerima dan akaun bank secara terus sebelum transfer.');return;}
      [['Nama akaun',bank.account_name],['Bank',bank.bank_name],['Nombor akaun',bank.account_number],['Telefon',bank.phone]].forEach(([k,v])=>$('bankDetails').append(element('p',k+': '+(v||'—'))));
    }catch{
      if(active(epoch,uid)&&bankId===state.bankId)put('bankDetails','Butiran bank gagal dimuatkan. Tutup dan cuba semula.');
    }
  }
  async function recordPayout(){
    if(state.loading||state.payoutBusy||!state.user||!state.selected)return;
    const reference=$('payoutReference').value.trim(),rows=rowsFor(state.selected.id).filter(r=>state.selectedIds.has(r.id)&&C.isPayable(r));
    if(reference.length<3||reference.length>120){message('modalMessage','Masukkan rujukan pindahan (3–120 aksara).');return;}
    if(!$('transferDone').checked){message('modalMessage','Sahkan bahawa pindahan bank sudah dibuat.');return;}
    if(!rows.length){message('modalMessage','Tiada komisen yang boleh direkodkan.');return;}
    const epoch=state.epoch,uid=state.user.id,args={p_affiliate_id:state.selected.id,p_commission_ids:rows.map(r=>r.id),p_reference:reference,p_expected_amount_cents:C.sum(rows)};
    state.payoutBusy=true;$('recordButton').disabled=true;$('refreshButton').disabled=true;message('modalMessage','Menyimpan rekod…');
    try{
      const {error}=await client().rpc('admin_record_affiliate_payout',args);
      if(!active(epoch,uid))return;if(error)throw error;
      state.payoutBusy=false;closeDrawer();await load();if(active(epoch,uid)&&state.data)message('appMessage','Bayaran direkodkan. Rujukan: '+reference,true);
    }catch(error){
      if(!active(epoch,uid))return;state.payoutBusy=false;closeDrawer();await load();
      if(active(epoch,uid)&&state.data)message('appMessage','Rekod belum dapat disahkan. Semak sejarah terkini dan rujukan '+reference+' sebelum cuba lagi. Jangan buat transfer kedua.');
    }finally{if(active(epoch,uid)){state.payoutBusy=false;$('recordButton').disabled=false;$('refreshButton').disabled=false;}}
  }
  function downloadCsv(){
    if(!state.data)return;const blob=new Blob(['\uFEFF'+C.toCsv(ledgerRows())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=element('a');link.href=url;link.download='komisen-affiliate-'+new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(new Date())+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function signIn(event){
    event.preventDefault();const button=$('loginForm').querySelector('button');button.disabled=true;message('authMessage','Mengesahkan akaun…');
    try{const {data,error}=await client().auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;clearUi();state.user=data.user||data.session?.user;$('password').value='';await load();}
    catch(error){clearUi();state.user=null;showApp(false);message('authMessage',/invalid login|invalid credentials/i.test(error?.message||'')?'E-mel atau kata laluan tidak tepat.':'Login gagal. Semak sambungan dan cuba lagi.');}finally{button.disabled=false;}
  }
  async function logout(){
    clearUi();state.user=null;showApp(false);$('loginForm').reset();message('authMessage','Anda telah log keluar.',true);
    try{await client().auth.signOut({scope:'local'});}catch{}finally{try{localStorage.removeItem('pa-affiliate-admin-auth');}catch{}}
  }
  async function google(){
    $('googleButton').disabled=true;try{const {error}=await client().auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/admin/',queryParams:{prompt:'select_account'}}});if(error)throw error;}catch{message('authMessage','Login Google belum dapat dibuka. Cuba lagi atau gunakan e-mel.');$('googleButton').disabled=false;}
  }
  async function bootstrap(){
    try{
      client().auth.onAuthStateChange((event,session)=>{setTimeout(()=>{
        if(event==='SIGNED_OUT'||(event==='TOKEN_REFRESHED'&&!session)){clearUi();state.user=null;showApp(false);}
        else if(event==='SIGNED_IN'&&session?.user&&state.user&&session.user.id!==state.user.id){clearUi();state.user=session.user;load();}
      },0);});
      const {data,error}=await client().auth.getSession();if(error)throw error;if(data.session?.user){clearUi();state.user=data.session.user;await load();}
    }catch{message('authMessage','Sambungan login gagal dimuat. Semak internet dan muat semula halaman.');}
  }
  $('detailDrawer').inert=true;
  $('loginForm').addEventListener('submit',signIn);$('googleButton').addEventListener('click',google);$('logoutButton').addEventListener('click',logout);$('refreshButton').addEventListener('click',load);
  $('affiliateSearch').addEventListener('input',()=>{renderAffiliates();renderLedger();});$('affiliateStatus').addEventListener('change',()=>{renderAffiliates();renderLedger();});$('commissionStatus').addEventListener('change',renderLedger);$('csvButton').addEventListener('click',downloadCsv);
  $('closeDrawer').addEventListener('click',()=>closeDrawer());$('closeModal').addEventListener('click',()=>closeModal());$('recordButton').addEventListener('click',recordPayout);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!$('modal').hidden)closeModal();else closeDrawer();}});
  bootstrap();
}());
