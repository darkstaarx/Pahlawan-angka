import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders, json, requireConfig } from '../_shared/http.ts';

const PLAN_SET = new Set(['premium', 'family_plus']);
type PaymentOrder = { id: string; external_uuid: string; billcode: string | null; amount_cents: number };

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? undefined;
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
  let stage = 'configuration';
  try {
    const paymentsEnabled = Deno.env.get('PAYMENTS_ENABLED') === 'true';
    const adminTestMode = Deno.env.get('PAYMENTS_ADMIN_TEST_MODE') === 'true';
    const testUserIds = new Set((Deno.env.get('PAYMENTS_TEST_USER_IDS') ?? '').split(',').map(id => id.trim()).filter(Boolean));
    if (!paymentsEnabled && !adminTestMode) return json({ error: 'Pembayaran belum dibuka. Konfigurasi gateway sedang disiapkan.' },503,origin);
    const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, TOYYIBPAY_SECRET_KEY, CATEGORY_CODE, APP_URL, TOYYIBPAY_BASE_URL } = requireConfig('SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'TOYYIBPAY_SECRET_KEY', 'CATEGORY_CODE', 'APP_URL', 'TOYYIBPAY_BASE_URL');
    if (!['https://toyyibpay.com', 'https://dev.toyyibpay.com'].includes(TOYYIBPAY_BASE_URL.replace(/\/$/, ''))) return json({ error: 'Payment provider configuration invalid' }, 500, origin);
    const token = req.headers.get('Authorization');
    if (!token?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401, origin);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: token } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return json({ error: 'Authentication required' }, 401, origin);
    if (!paymentsEnabled && !testUserIds.has(user.id)) {
      const { data: role, error: roleError } = await authClient.from('app_user_roles').select('role').eq('user_id', user.id).single();
      if (roleError || role?.role !== 'admin') return json({ error: 'Pembayaran belum dibuka. Ujian gateway sedang dijalankan.' }, 503, origin);
    }
    const body = await req.json();
    const plan = String(body.plan ?? '');
    if (!PLAN_SET.has(plan)) return json({ error: 'Unknown plan' }, 400, origin);
    const externalUuid = String(body.external_uuid ?? crypto.randomUUID());
    if (!/^[0-9a-f-]{36}$/i.test(externalUuid)) return json({ error: 'external_uuid must be UUID' }, 400, origin);
    const phone = String(body.phone ?? '').replace(/\D/g, '');
    const parentName = String(body.parent_name ?? '').trim().slice(0, 60);
    if (!parentName || !/^\d{9,12}$/.test(phone) || !user.email) return json({ error: 'Valid parent name and phone are required' }, 400, origin);
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: rawOrder, error } = await authClient.rpc('create_payment_order', { p_plan: plan, p_external_uuid: externalUuid, p_affiliate_code: body.affiliate_code ? String(body.affiliate_code) : null, p_expected_price_cents: Number.isInteger(body.expected_price_cents) ? body.expected_price_cents : null }).single();
    const order = rawOrder as PaymentOrder | null;
    if (error || !order) return json({ error: 'Could not create order' }, 400, origin);
    if (order.billcode) return json({ order_id: order.id, external_uuid: order.external_uuid, bill_code: order.billcode, live_url: `${TOYYIBPAY_BASE_URL.replace(/\/$/, '')}/${order.billcode}` }, 200, origin);
    stage = 'claim_bill';
    const { data: claimed, error: claimError } = await authClient.rpc('claim_payment_bill', { p_order_id: order.id });
    if (claimError || claimed !== true) return json({ error: 'Checkout is already being prepared' }, 409, origin);
    const amount = Number(order.amount_cents);
    const appUrl = APP_URL.replace(/\/$/, '');
    const providerUrl = TOYYIBPAY_BASE_URL.replace(/\/$/, '');
    const form = new URLSearchParams({ userSecretKey: TOYYIBPAY_SECRET_KEY, categoryCode: CATEGORY_CODE, billName: `Pahlawan Angka ${plan}`, billDescription: `Pahlawan Angka ${plan} order`, billPriceSetting: '1', billPayorInfo: '1', billAmount: String(amount), billReturnUrl: `${appUrl}/?payment_order=${encodeURIComponent(order.id)}`, billCallbackUrl: `${SUPABASE_URL}/functions/v1/toyyibpay-callback`, billExternalReferenceNo: order.external_uuid, billTo: parentName, billEmail: user.email, billPhone: phone, billPaymentChannel: '2' });
    stage = 'provider_request';
    const response = await fetch(`${providerUrl}/index.php/api/createBill`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    const result = await response.text();
    let parsed: any;
    try { parsed = JSON.parse(result); } catch { parsed = null; }
    const billcode = parsed?.[0]?.BillCode;
    if (!billcode || !/^[A-Za-z0-9_-]{4,40}$/.test(billcode)) return json({ error: 'Payment provider could not create a bill' }, 502, origin);
    const { error: updateError } = await service.from('payment_orders').update({ billcode, status: 'pending' }).eq('id', order.id).eq('user_id', user.id);
    if (updateError) { console.error('checkout_order_update_failure', { code: updateError.code }); return json({ error: 'Order could not be prepared' }, 500, origin); }
    return json({ order_id: order.id, external_uuid: order.external_uuid, bill_code: billcode, live_url: `${providerUrl}/${billcode}` }, 200, origin);
  } catch (error) {
    console.error('checkout_failure', { stage, kind: error instanceof Error ? error.name : 'unknown' });
    return json({ error: 'Checkout failed' }, 500, origin);
  }
});
