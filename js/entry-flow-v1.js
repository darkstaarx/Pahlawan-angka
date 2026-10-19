/* Guardian entry: choose access, authenticate, pay, then create child profiles. */
(() => {
  'use strict';
  const KEY = 'pa_entry_intent_v1';
  const TTL = 86400000;
  const $ = id => document.getElementById(id);
  const cloud = () => window.PACloud?.state;
  let checking = false;
  let watching = '';
  function read() {
    try {
      const item = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (item?.expires > Date.now() && ['demo', 'purchase', 'login'].includes(item.kind)) return item;
    } catch (_) {}
    return null;
  }
  function write(kind, plan) {
    localStorage.setItem(KEY, JSON.stringify({ kind, plan, userId: cloud()?.user?.id || null, expires: Date.now() + TTL }));
  }
  function clear() { localStorage.removeItem(KEY); }
  function view(mode) { $('login')?.setAttribute('data-entry', mode); }
  function message(value) { const el = $('paEntryStatus'); if (el) el.textContent = value; }
  function showAuth(kind) {
    view('auth');
    const title = $('paEntryAuthTitle');
    if (title) title.textContent = kind === 'demo' ? 'Daftar & cuba demo percuma' : kind === 'purchase' ? 'Daftar untuk teruskan pembayaran' : 'Log masuk akaun penjaga';
    window.screen('login');
    $('googleAuthButton')?.focus();
  }
  function welcome() {
    clear(); view('welcome'); window.screen('login');
  }
  async function demo() {
    write('demo');
    if (cloud()?.user) { await beforeProfiles(); return; }
    showAuth('demo');
  }
  function plans() {
    write('purchase');
    showPlans();
  }
  // The plans are the app's one pricing component (PACommercial.openPricing) in entry mode.
  // #entryPlans is only the dark backdrop behind it, with a button to reopen the plans.
  function showPlans() {
    window.screen('entryPlans');
    $('paEntryPackages').hidden = false;
    $('paEntryPending').hidden = true;
    message('');
    window.PACommercial?.openPricing?.({ entry: true });
  }
  async function choose(plan) {
    if (!['premium', 'family_plus'].includes(plan)) return;
    write('purchase', plan);
    if (!cloud()?.user) return showAuth('purchase');
    await window.PACommercial?.refresh?.();
    if (!await beforeProfiles()) await window.PACloud?.resumeAfterConsent?.();
  }
  async function login() {
    write('login');
    if (cloud()?.user) {
      view('account'); window.PACloud?.setLoading?.(true, 'Menyambung profil dan kemajuan kamu…');
      await window.PACloud?.resumeAfterConsent?.(); return;
    }
    showAuth('login');
  }
  function returnOrder() {
    const value = new URLSearchParams(location.search).get('payment_order');
    const saved = read()?.orderId;
    return /^[0-9a-f-]{36}$/i.test(value || '') ? value : /^[0-9a-f-]{36}$/i.test(saved || '') ? saved : '';
  }
  function rememberOrder(orderId) {
    const intent = read();
    if (intent?.kind !== 'purchase' || !/^[0-9a-f-]{36}$/i.test(orderId || '')) return;
    localStorage.setItem(KEY, JSON.stringify({ ...intent, orderId, userId: cloud()?.user?.id || null }));
  }
  async function beforeProfiles() {
    const state = cloud();
    if (!state?.user) return false;
    // Cloud session restoration can finish before the remaining deferred modules.
    if (!window.PACommercial || !window.PAPayments) {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
      await window.PACommercial?.refresh?.();
    }
    let intent = read();
    if (intent?.userId && intent.userId !== state.user.id) { clear(); intent = null; }
    if (intent && !intent.userId) {
      intent.userId = state.user.id;
      localStorage.setItem(KEY, JSON.stringify(intent));
    }
    if (intent?.kind === 'demo') {
      // Demo never creates a child profile. Keep normal profile creation separate.
      clear(); state.needsOnboarding = false; view('account');
      window.screen('login'); window.PADemo?.open?.();
      return true;
    }
    const order = returnOrder();
    if (intent?.kind !== 'purchase' && !order) { if(intent?.kind==='login')clear(); view('account'); return false; }
    state.needsOnboarding = false;
    if (order) {
      window.screen('entryPlans');
      $('paEntryPackages').hidden = true;
      $('paEntryPending').hidden = false;
      message('Menunggu pengesahan bayaran. Profil anak dibuka selepas akses disahkan.');
      await checkPayment();
      if (watching !== order) {
        watching = order;
        window.PAPayments?.pollOrder?.(order, status => { if (status === 'paid') checkPayment(); });
      }
      return true;
    }
    if (window.PACommercial?.isPaid?.()) {
      clear(); view('account');
      // Existing buyers manage upgrades with the current-plan pricing dialog.
      if (intent?.plan === 'family_plus' && !window.PACommercial?.isPremium?.()) window.PACommercial.openPricing();
      return false;
    }
    showPlans();
    if (intent?.plan) window.PAPayments?.checkout?.(intent.plan);
    return true;
  }
  async function checkPayment() {
    if (checking || !cloud()?.user) return;
    checking = true;
    try {
      const state = cloud(); const userId = state.user.id; const orderId = returnOrder();
      if (!orderId) return;
      const result = await state.client.from('payment_orders').select('status,plan').eq('id', orderId).eq('user_id', userId).maybeSingle();
      if (cloud()?.user?.id !== userId) return;
      if (result.error) throw result.error;
      if (!result.data) { message('Pesanan tidak ditemui untuk akaun ini. Log masuk akaun yang digunakan semasa pembelian.'); return; }
      if (result.data.status !== 'paid') {
        message(result.data.status === 'failed' ? 'Bayaran belum berjaya. Semak status dengan bank sebelum cuba semula.' : 'Bayaran belum disahkan. Anda boleh semak semula sebentar lagi.');
        return;
      }
      await window.PACommercial.refresh();
      if (cloud()?.user?.id !== userId || !window.PACommercial.isPaid()) { message('Bayaran diterima. Akses sedang dikemas kini; tekan Semak bayaran sebentar lagi.'); return; }
      clear(); view('account');
      const url = new URL(location.href); url.searchParams.delete('payment_order');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      await window.PACloud.resumeAfterConsent();
    } catch (_) { message('Pengesahan belum dapat dimuat. Semak sambungan dan tekan Semak bayaran.'); }
    finally { checking = false; }
  }
  async function reopenBill() {
    const state = cloud(); if (!state?.user || !returnOrder()) return;
    try {
      const { data, error } = await state.client.from('payment_orders').select('billcode,status').eq('id', returnOrder()).eq('user_id', state.user.id).maybeSingle();
      if (error) throw error;
      if (data?.status === 'paid') return checkPayment();
      if (!/^[a-z0-9_-]{4,40}$/i.test(data?.billcode || '')) throw new Error('bill missing');
      location.assign(`https://toyyibpay.com/${data.billcode}`);
    } catch (_) { message('Bil tidak dapat dibuka. Hubungi bantuan sebelum membuat bayaran baharu.'); }
  }
  function mount() {
    // Preserve the order if Google sign-in is needed again after leaving the bank.
    const returned = new URLSearchParams(location.search).get('payment_order');
    if (/^[0-9a-f-]{36}$/i.test(returned || '')) {
      const previous = read();
      localStorage.setItem(KEY, JSON.stringify({ ...previous, kind: 'purchase', orderId: returned, expires: Date.now() + TTL }));
    }
    const pending = read();
    if (pending?.kind) showAuth(pending.kind);
    else view('welcome');
    document.querySelectorAll('[data-entry-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.entryAction;
      if (action === 'demo') demo();
      if (action === 'plans') plans();
      if (action === 'login') login();
      if (action === 'back') welcome();
      if (action === 'check') checkPayment();
      if (action === 'bill') reopenBill();
      if (action === 'pricing') showPlans();
    }));
    document.querySelectorAll('[data-entry-plan]').forEach(button => button.addEventListener('click', () => choose(button.dataset.entryPlan)));
  }
  window.PAEntry = { beforeProfiles, plans, choose, demo, login, welcome, checkPayment, rememberOrder };
  mount();
})();
