/* Pahlawan Angka · ToyyibPay + affiliate UI
 * Additive browser module. The server remains the source of truth for access,
 * commissions, roles and payout state.
 */
(() => {
  'use strict';
  const root = window;
  const PLANS = { premium: { label: 'Akses Keluarga', price: 19, commission: 9 }, family_plus: { label: 'Family Plus', price: 29, commission: 15 } };
  const REF_KEY = 'pa_affiliate_referral_v1';
  const ORDER_KEY = 'pa_pending_payment_v1';
  const REF_TTL = 30 * 24 * 60 * 60 * 1000;
  let referralCaptured = false;
  const api = () => root.PACloud?.state;
  const client = () => api()?.client;
  const user = () => api()?.user;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value == null ? '' : value);
  const safeRef = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  const text = (tag, value, className) => { const el = document.createElement(tag); if (className) el.className = className; el.textContent = esc(value); return el; };
  const status = (host, message, good) => { if (!host) return; host.textContent = ''; host.append(text('span', message, good ? 'pa-ok' : 'pa-error')); };
  const rpc = async (name, args) => { const c = client(); if (!c?.rpc) throw new Error('Sila log masuk dahulu.'); const result = await c.rpc(name, args || {}); if (result?.error) throw result.error; return result?.data; };
  const functionCall = async (name, body) => { const c = client(); if (!c?.functions?.invoke) throw new Error('Perkhidmatan pembayaran belum tersedia.'); const result = await c.functions.invoke(name, { body }); if (result?.error) throw result.error; return result?.data; };
  async function loadCatalog() {
    const c = client(); if (!c?.from) return PLANS;
    const result = await c.from('plan_catalog').select('plan,price_cents,commission_cents,active').eq('active', true);
    if (result?.error) throw result.error;
    (result.data || []).forEach((item) => { if (PLANS[item.plan]) { PLANS[item.plan].price = Number(item.price_cents) / 100; PLANS[item.plan].commission = Number(item.commission_cents) / 100; } });
    document.querySelectorAll('[data-plan-price]').forEach(el=>{const plan=PLANS[el.dataset.planPrice];if(plan)el.textContent='RM'+plan.price;});
    return PLANS;
  }
  const loggedIn = () => !!user()?.id;
  const admin = () => String(root.PACommercial?.getAccess?.()?.role || '') === 'admin';

  function captureReferral() {
    if (referralCaptured) return;
    try {
      const ref = safeRef(new URLSearchParams(location.search).get('ref'));
      if (ref) localStorage.setItem(REF_KEY, JSON.stringify({ ref, expires: Date.now() + REF_TTL }));
      referralCaptured = true;
    } catch (_) {}
  }
  function referral() {
    try { const item = JSON.parse(localStorage.getItem(REF_KEY) || 'null'); if (!item || item.expires <= Date.now() || !safeRef(item.ref)) { localStorage.removeItem(REF_KEY); return ''; } return safeRef(item.ref); } catch (_) { return ''; }
  }
  function parentDetails() {
    const metadata = user()?.user_metadata || {};
    const name = String($('paCheckoutName')?.value || metadata.full_name || metadata.name || '').trim();
    const phone = String($('paCheckoutPhone')?.value || metadata.phone || '').trim();
    return { name: name.slice(0, 100), phone: phone.slice(0, 30) };
  }
  function validPhone(phone) { return /^[+\d][\d\s().-]{7,24}$/.test(phone); }

  function checkoutModal(plan) {
    $('paPricingOverlay')?.classList.add('hidden');
    let overlay = $('paCheckoutOverlay');
    if (overlay) { overlay.dataset.plan = plan; const line = overlay.querySelector('[data-pa-plan]'); if (line) { line.textContent = ''; line.append(text('span', `${PLANS[plan].label} · RM${PLANS[plan].price}`)); } overlay.classList.remove('hidden'); return overlay; }
    overlay = document.createElement('div'); overlay.id = 'paCheckoutOverlay'; overlay.className = 'pa-aff-overlay'; overlay.dataset.plan = plan; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
    const card = document.createElement('section'); card.className = 'pa-aff-dialog';
    const close = text('button', '×', 'pa-aff-close'); close.type = 'button'; close.setAttribute('aria-label', 'Tutup'); close.addEventListener('click', () => overlay.classList.add('hidden'));
    card.append(close, text('p', 'PEMBAYARAN SELAMAT', 'pa-eyebrow'));
    const heading = text('h2', 'Sambung dengan ToyyibPay'); card.append(heading);
    const planLine = document.createElement('p'); planLine.dataset.paPlan = '1'; planLine.append(text('span', `${PLANS[plan].label} · RM${PLANS[plan].price}`)); card.append(planLine);
    const form = document.createElement('form'); form.className = 'pa-aff-form';
    const nameLabel = text('label', 'Nama penjaga'); const name = document.createElement('input'); name.id = 'paCheckoutName'; name.required = true; name.maxLength = 100; name.autocomplete = 'name'; nameLabel.append(name);
    const phoneLabel = text('label', 'Nombor telefon'); const phone = document.createElement('input'); phone.id = 'paCheckoutPhone'; phone.required = true; phone.maxLength = 30; phone.inputMode = 'tel'; phone.autocomplete = 'tel'; phoneLabel.append(phone);
    const note = text('p', 'Bayaran akan dibuka dalam halaman ToyyibPay. Akses diaktifkan selepas bayaran disahkan oleh pelayan.', 'pa-aff-note');
    const message = document.createElement('div'); message.id = 'paCheckoutMessage'; message.setAttribute('aria-live', 'polite'); const submit = text('button', 'Teruskan ke ToyyibPay', 'pa-aff-primary'); submit.type = 'submit';
    form.append(nameLabel, phoneLabel, note, message, submit); form.addEventListener('submit', (event) => beginCheckout(event, overlay)); card.append(form); overlay.append(card); document.body.append(overlay);
    if (!loggedIn()) { status(message, 'Log masuk akaun penjaga dahulu.'); submit.disabled = true; }
    return overlay;
  }
  async function beginCheckout(event, overlay) {
    event.preventDefault(); const message = $('paCheckoutMessage'); const button = event.currentTarget.querySelector('button[type=submit]');
    if (!loggedIn()) return status(message, 'Log masuk akaun penjaga dahulu.');
    const plan = PLANS[overlay.dataset.plan] ? overlay.dataset.plan : 'premium'; const details = parentDetails();
    try { await loadCatalog(); } catch (_) { return status(message, 'Harga belum dapat disahkan. Cuba semula apabila sambungan tersedia.'); }
    if (details.name.length < 2) return status(message, 'Masukkan nama penjaga yang sah.');
    if (!validPhone(details.phone)) return status(message, 'Masukkan nombor telefon yang sah.');
    button.disabled = true; button.textContent = 'Menyediakan pembayaran…';
    try {
      const data = await functionCall('create-checkout', { plan, parent_name: details.name, phone: details.phone, affiliate_code: referral() || null, return_path: location.pathname, expected_price_cents: Math.round(PLANS[plan].price * 100) });
      const url = typeof data === 'string' ? data : data?.live_url || data?.url || data?.payment_url;
      if (!url || !/^https:\/\/(?:dev\.)?toyyibpay\.com\//i.test(url)) throw new Error('Pautan pembayaran tidak tersedia.');
      const order = data?.order_id || data?.bill_code || data?.id; if (order) localStorage.setItem(ORDER_KEY, JSON.stringify({ order: String(order).slice(0, 100), expires: Date.now() + 86400000 })); overlay.classList.add('hidden'); location.assign(url);
      if (order) pollOrder(order, (state) => status(message, state === 'paid' ? 'Bayaran disahkan. Akses akan dikemas kini.' : 'Menunggu pengesahan bayaran…', state === 'paid'));
    } catch (error) { status(message, error?.message || 'Pembayaran belum dapat dimulakan. Cuba semula.'); }
    finally { button.disabled = false; button.textContent = 'Teruskan ke ToyyibPay'; }
  }
  async function pollOrder(orderId, onStatus) {
    let attempts = 0; const poll = async () => { if (++attempts > 30) return; try { const c = client(); const uid = user()?.id; if (!c?.from || !uid) {setTimeout(poll,5000);return;} const result = await c.from('payment_orders').select('status').eq('id', String(orderId).slice(0, 100)).eq('user_id', uid).maybeSingle(); const state = result?.data?.status || 'pending'; onStatus?.(state); if (state === 'paid') { localStorage.removeItem(ORDER_KEY); await root.PACommercial?.refresh?.(); if(typeof root.showRewardToast==='function')root.showRewardToast('Bayaran disahkan. Pakej keluarga sudah aktif!'); return; } } catch (_) { onStatus?.('pending'); } setTimeout(poll, 5000); }; poll();
  }
  function mountCheckoutButtons() {
    document.querySelectorAll('[data-pa-checkout]').forEach((button) => { const plan = button.dataset.paCheckout === 'family_plus' ? 'family_plus' : 'premium'; button.dataset.paPrice = String(PLANS[plan].price); button.dataset.paCommission = String(PLANS[plan].commission); if (button.dataset.paBound) return; button.dataset.paBound = '1'; button.addEventListener('click', () => checkoutModal(plan)); });
  }

  function affiliateForm(host) {
    host.textContent = ''; host.append(text('h3', 'Daftar Rakan Affiliate — percuma'), text('p', 'Dapatkan komisen bagi setiap pembelian melalui pautan anda. Tiada yuran pendaftaran.'));
    const form = document.createElement('form'); form.className = 'pa-aff-form';
    const accountLabel = text('label', 'Akaun'); const account = document.createElement('input'); account.type = 'email'; account.value = user()?.email || user()?.user_metadata?.email || ''; account.readOnly = true; account.tabIndex = -1; accountLabel.append(account); form.append(accountLabel);
    [['name','Nama penuh','text'],['phone','Telefon','tel']].forEach(([key, label, type]) => { const wrap = text('label', label); const input = document.createElement('input'); input.name = key; input.type = type; input.required = true; input.maxLength = key === 'phone' ? 30 : 100; if (key === 'phone') { input.inputMode = 'tel'; input.autocomplete = 'tel'; } else input.autocomplete = 'name'; wrap.append(input); form.append(wrap); });
    form.append(text('p','Butiran bank boleh diisi kemudian sebelum pembayaran manual dibuat.','pa-aff-note'));
    const msg = document.createElement('div'); msg.setAttribute('aria-live', 'polite'); const submit = text('button', 'Daftar percuma', 'pa-aff-primary'); submit.type = 'submit'; form.append(msg, submit);
    form.addEventListener('submit', async (event) => { event.preventDefault(); if (!loggedIn()) return status(msg, 'Log masuk dahulu.'); const renderUserId = user()?.id; submit.disabled = true; const payload = Object.fromEntries(new FormData(form)); try { await functionCall('affiliate-application', { display_name: String(payload.name || '').trim(), phone: String(payload.phone || '').trim(), bank_name: '', account_number: '', account_name: '' }); if (user()?.id !== renderUserId) return; await renderAffiliate(host); } catch (error) { if (user()?.id === renderUserId) status(msg, error?.message || 'Pendaftaran belum dapat dihantar.'); } finally { submit.disabled = false; } }); host.append(form);
  }
  function payoutDetailsForm(host, application) {
    const section = document.createElement('section'); section.className = 'pa-aff-payout'; section.append(text('h3', 'Butiran pembayaran (pilihan)'), text('p', 'Isi sebelum meminta pembayaran manual. Maklumat ini hanya digunakan untuk bayaran komisen.', 'pa-aff-note'));
    const form = document.createElement('form'); form.className = 'pa-aff-form'; const fields = [['phone','Telefon untuk pengesahan','tel'],['bank_name','Nama bank','text'],['account_number','Nombor akaun','text'],['account_name','Nama pemegang akaun','text']];
    fields.forEach(([key, label, type]) => { const wrap = text('label', label); const input = document.createElement('input'); input.name = key; input.type = type; input.required = true; input.maxLength = key === 'phone' ? 30 : 120; if (key === 'phone') { input.inputMode = 'tel'; input.autocomplete = 'tel'; } if (key === 'account_number') input.inputMode = 'numeric'; wrap.append(input); form.append(wrap); });
    const msg = document.createElement('div'); msg.setAttribute('aria-live', 'polite'); const save = text('button', 'Simpan butiran bank', 'pa-aff-secondary'); save.type = 'submit'; form.append(msg, save);
    form.addEventListener('submit', async (event) => { event.preventDefault(); const renderUserId = user()?.id; if (!renderUserId || renderUserId !== application.user_id) return status(msg, 'Log masuk semula untuk mengemas kini butiran.'); save.disabled = true; const payload = Object.fromEntries(new FormData(form)); try { await functionCall('affiliate-application', { display_name: application.display_name, phone: String(payload.phone || '').trim(), bank_name: String(payload.bank_name || '').trim(), account_number: String(payload.account_number || '').trim(), account_name: String(payload.account_name || '').trim() }); if (user()?.id !== renderUserId) return; status(msg, 'Butiran pembayaran disimpan.', true); form.reset(); } catch (error) { if (user()?.id === renderUserId) status(msg, error?.message || 'Butiran pembayaran belum dapat disimpan.'); } finally { save.disabled = false; } }); section.append(form); host.append(section);
  }
  async function renderAffiliate(host) {
    host.textContent = '';
    try { await loadCatalog(); } catch (_) {}
    const priceNote = text('p', `Komisen semasa: Akses Keluarga RM${PLANS.premium.price.toFixed(2)} → RM${PLANS.premium.commission.toFixed(2)}, Family Plus RM${PLANS.family_plus.price.toFixed(2)} → RM${PLANS.family_plus.commission.toFixed(2)}.`); host.append(priceNote);
    if (!loggedIn()) { host.append(text('p', 'Log masuk akaun penjaga untuk mengurus affiliate.')); return; }
    const renderUserId = user().id;
    try {
      const application = await client().from('affiliate_applications').select('id,status,code,display_name,user_id').eq('user_id', renderUserId).maybeSingle();
      if (user()?.id !== renderUserId) return;
      if (application?.error) throw application.error;
      const data = application?.data ? { status: application.data.status, code: application.data.code } : null;
      if (!data?.status || data.status === 'none' || data.status === 'rejected') { affiliateForm(host); return; }
      host.append(text('p', data.status === 'pending' ? 'Permohonan sedang disemak.' : data.status === 'suspended' ? 'Status: Digantung. Pendaftaran semula tidak tersedia.' : 'Status: Aktif', 'pa-aff-status'));
      if (data.status === 'suspended') return;
      if (data.status !== 'approved') { affiliateForm(host); return; }
      const link = `${location.origin}${location.pathname}?ref=${encodeURIComponent(safeRef(data.code))}`; const box = document.createElement('div'); box.className = 'pa-aff-link'; box.append(text('label', 'Pautan rujukan anda')); const input = document.createElement('input'); input.readOnly = true; input.value = link; box.append(input); const copy = text('button', 'Salin pautan', 'pa-aff-secondary'); copy.type = 'button'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(link); copy.textContent = 'Disalin ✓'; } catch (_) { input.select(); } }); box.append(copy); host.append(box);
      const commissions = await client().from('affiliate_commissions').select('amount_cents,status').eq('affiliate_id', application.data.id);
      if (commissions?.error) throw commissions.error;
      if (user()?.id !== renderUserId) return;
      const rows = commissions.data || []; const activeRows = rows.filter((row) => row.status !== 'void'); const total = activeRows.reduce((sum, row) => sum + Number(row.amount_cents || 0), 0); const paid = activeRows.filter((row) => row.status === 'paid').reduce((sum, row) => sum + Number(row.amount_cents || 0), 0); const pending = activeRows.filter((row) => row.status === 'pending' || row.status === 'approved').reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);
      const metrics = document.createElement('div'); metrics.className = 'pa-aff-metrics'; [['Jualan dirujuk', String(activeRows.length)],['Jumlah komisen', `RM${(total / 100).toFixed(2)}`],['Belum dibayar', `RM${(pending / 100).toFixed(2)}`],['Dibayar', `RM${(paid / 100).toFixed(2)}`]].forEach(([label, value]) => { const card = document.createElement('div'); card.append(text('span', label), text('strong', value)); metrics.append(card); }); host.append(metrics);
      payoutDetailsForm(host, { ...application.data, user_id: renderUserId });
    } catch (error) { if (user()?.id === renderUserId) status(host, error?.message || 'Dashboard affiliate belum tersedia.'); }
  }
  async function renderAdmin(host) {
    const renderUserId=user()?.id;const affiliateLabels=new Map();
    if (!admin()) { host.hidden = true; return; } host.hidden = false; host.textContent = ''; host.append(text('h2', 'Semakan affiliate & bayaran manual'), text('p', 'Paparan ini hanya untuk peranan admin yang disahkan pelayan.'));
    const list = document.createElement('div'); list.className = 'pa-admin-list'; host.append(list); try {
      const result = await client().from('affiliate_applications').select('id,status,display_name,code').in('status', ['pending','approved','suspended']); if (result?.error) throw result.error;
      if(user()?.id!==renderUserId||!admin())return;
      (result.data || []).forEach((item) => { affiliateLabels.set(item.id,item.display_name+' · '+(item.code||''));const row = document.createElement('article'); row.className = 'pa-admin-row'; row.append(text('strong', item.display_name || 'Permohonan'), text('span', item.status || 'pending')); const actions = document.createElement('div');
        ['approve','reject'].forEach((decision) => { const button = text('button', decision === 'approve' ? 'Lulus' : 'Tolak', decision === 'approve' ? 'pa-aff-primary' : 'pa-aff-secondary'); button.type = 'button'; button.addEventListener('click', async () => { button.disabled = true; try { const code = decision === 'approve' ? (item.code || `PA${String(item.id).replace(/-/g, '').slice(0, 8)}`) : null; await rpc('admin_set_affiliate_approval', { p_application_id: item.id, p_approved: decision === 'approve', p_code: code }); row.remove(); } catch (error) { status(row, error?.message || 'Gagal menyimpan semakan.'); button.disabled = false; } }); actions.append(button); });
        const bankMessage=document.createElement('p');row.append(bankMessage);const bank = text('button', 'Lihat bank', 'pa-aff-secondary'); bank.type = 'button'; bank.addEventListener('click', async () => { try { const result = await rpc('admin_get_affiliate_bank_info', { p_affiliate_id: item.id }); const info=Array.isArray(result)?result[0]:result;if(user()?.id!==renderUserId||!admin())return; status(bankMessage, `Bank: ${info?.bank_name || '—'} · Akaun: ${info?.account_name || '—'} · ${info?.account_number || '—'}`, true); } catch (error) { status(bankMessage, error?.message || 'Maklumat bank belum tersedia.'); } }); actions.append(bank); row.append(actions); list.append(row); });
    } catch (error) { status(list, error?.message || 'Senarai permohonan belum tersedia.'); }
    try { const commissions = await client().from('affiliate_commissions').select('id,affiliate_id,amount_cents,status,payout_reference').in('status', ['pending','approved']); if (commissions?.error) throw commissions.error;if(user()?.id!==renderUserId||!admin())return; (commissions.data || []).forEach((item) => { const row = document.createElement('article'); row.className = 'pa-admin-row'; row.append(text('strong', `RM${(Number(item.amount_cents || 0) / 100).toFixed(2)}`), text('span', item.status),text('span',affiliateLabels.get(item.affiliate_id)||item.affiliate_id)); const reference = document.createElement('input'); reference.placeholder = 'Rujukan transaksi'; reference.maxLength = 120; const button = text('button', 'Tanda dibayar', 'pa-aff-primary'); button.type = 'button'; button.addEventListener('click', async () => { button.disabled = true; try { await rpc('admin_mark_commission_paid', { p_commission_id: item.id, p_payout_reference: reference.value.trim() }); row.remove(); } catch (error) { status(row, error?.message || 'Rekod belum dapat disimpan.'); button.disabled = false; } }); row.append(reference, button); list.append(row); }); } catch (error) { status(list, error?.message || 'Senarai komisen belum tersedia.'); }
  }
  let affiliateOverlay, affiliateContent, affiliateTrigger, lastUser = '', lastAdmin = false, previousFocus;
  function closeAffiliate() {
    if (!affiliateOverlay) return;
    affiliateOverlay.classList.add('hidden');
    document.body.classList.remove('pa-aff-modal-open');
    if (affiliateContent) affiliateContent.textContent = '';
    const focus = previousFocus; previousFocus = null;
    if (focus && typeof focus.focus === 'function' && document.contains(focus)) focus.focus();
  }
  function focusAffiliateDialog(event) {
    if (!affiliateOverlay || affiliateOverlay.classList.contains('hidden')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeAffiliate(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...affiliateOverlay.querySelectorAll('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function ensureAffiliateOverlay() {
    if (affiliateOverlay) return affiliateOverlay;
    affiliateOverlay = document.createElement('div'); affiliateOverlay.id = 'paAffiliateOverlay'; affiliateOverlay.className = 'pa-aff-overlay hidden'; affiliateOverlay.setAttribute('role', 'dialog'); affiliateOverlay.setAttribute('aria-modal', 'true'); affiliateOverlay.setAttribute('aria-labelledby', 'paAffiliateTitle');
    const dialog = document.createElement('section'); dialog.className = 'pa-aff-dialog';
    const header = document.createElement('div'); header.className = 'pa-aff-dialog-header';
    const heading = text('h2', 'Affiliate Pahlawan Angka'); heading.id = 'paAffiliateTitle';
    const close = text('button', '×', 'pa-aff-close'); close.type = 'button'; close.setAttribute('aria-label', 'Tutup affiliate'); close.addEventListener('click', closeAffiliate);
    header.append(heading, close); affiliateContent = document.createElement('div'); affiliateContent.id = 'paAffiliateContent'; dialog.append(header, affiliateContent); affiliateOverlay.append(dialog);
    affiliateOverlay.addEventListener('click', (event) => { if (event.target === affiliateOverlay) closeAffiliate(); }); document.body.append(affiliateOverlay); document.addEventListener('keydown', focusAffiliateDialog);
    return affiliateOverlay;
  }
  async function openAffiliate() {
    const overlay = ensureAffiliateOverlay(); previousFocus = document.activeElement; overlay.classList.remove('hidden'); document.body.classList.add('pa-aff-modal-open');
    const close = overlay.querySelector('.pa-aff-close'); if (close) close.focus();
    if (affiliateContent) await renderAffiliate(affiliateContent);
  }
  function ensureAffiliateTrigger(settings) {
    if (affiliateTrigger && affiliateTrigger.isConnected) return affiliateTrigger;
    affiliateTrigger = $('paAffiliateOpen');
    if (!affiliateTrigger) { affiliateTrigger = text('button', 'Rakan Affiliate · Daftar Percuma', 'pa-aff-trigger'); affiliateTrigger.id = 'paAffiliateOpen'; affiliateTrigger.type = 'button'; affiliateTrigger.setAttribute('aria-haspopup', 'dialog'); affiliateTrigger.addEventListener('click', openAffiliate); settings.insertBefore(affiliateTrigger, settings.firstChild); }
    return affiliateTrigger;
  }
  function mount() {
    captureReferral(); mountCheckoutButtons(); const currentUser = user()?.id || ''; const currentAdmin = admin(); const settings = $('settingsTab');
    if (settings) { ensureAffiliateTrigger(settings); ensureAffiliateOverlay(); }
    if (settings && !$('paAffiliateMount')) { const host = document.createElement('section'); host.id = 'paAffiliateMount'; host.className = 'card pa-aff-section'; host.hidden = true; settings.append(host); }
    if (settings && !$('paAffiliateAdmin')) { const host = document.createElement('section'); host.id = 'paAffiliateAdmin'; host.className = 'card pa-aff-section'; settings.append(host); }
    const changed = currentUser !== lastUser; if (changed && affiliateOverlay && !affiliateOverlay.classList.contains('hidden')) closeAffiliate();
    const adminHost = $('paAffiliateAdmin'); if (adminHost && (changed || currentAdmin !== lastAdmin)) renderAdmin(adminHost);
    lastUser = currentUser; lastAdmin = currentAdmin;
  }
  const refresh = async () => { try { await loadCatalog(); } catch (_) {} mountCheckoutButtons(); mount(); const adminHost = $('paAffiliateAdmin'); if (adminHost) renderAdmin(adminHost); if (affiliateOverlay && !affiliateOverlay.classList.contains('hidden') && affiliateContent) await renderAffiliate(affiliateContent); return PLANS; };
  root.PAPayments = Object.freeze({ plans: PLANS, refreshCatalog: loadCatalog, checkout: (plan) => checkoutModal(PLANS[plan] ? plan : 'premium'), pollOrder });
  root.PAAffiliate = Object.freeze({ captureReferral, getReferral: referral, refresh, renderAdmin, open: openAffiliate, close: closeAffiliate });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
  try { const pending = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null'); const returned = new URLSearchParams(location.search).get('payment_order'); if (returned && /^[0-9a-f-]{36}$/i.test(returned)) pollOrder(returned); else if (pending?.expires > Date.now()) pollOrder(pending.order); else localStorage.removeItem(ORDER_KEY); } catch (_) {}
  loadCatalog().then(mountCheckoutButtons).catch(() => {});
  window.setInterval(mount, 1200);
})();
