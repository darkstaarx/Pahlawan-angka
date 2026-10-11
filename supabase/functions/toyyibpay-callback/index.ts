import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { createHash } from 'node:crypto';
import { corsHeaders, json, requireConfig } from '../_shared/http.ts';

function md5(value: string) { return createHash('md5').update(value, 'utf8').digest('hex'); }

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? undefined;
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TOYYIBPAY_SECRET_KEY, TOYYIBPAY_BASE_URL } = requireConfig('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'TOYYIBPAY_SECRET_KEY', 'TOYYIBPAY_BASE_URL');
    if (!['https://toyyibpay.com', 'https://dev.toyyibpay.com'].includes(TOYYIBPAY_BASE_URL.replace(/\/$/, ''))) return json({ error: 'Payment provider configuration invalid' }, 500, origin);
    const input = await req.formData();
    const get = (key: string) => String(input.get(key) ?? '');
    const status = get('status'); const orderId = get('order_id'); const refno = get('refno'); const billcode = get('billcode'); const amount = get('amount'); const receivedHash = get('hash');
    if (!status || !orderId || !refno || !billcode || !amount || !receivedHash || !/^[A-Za-z0-9_-]{4,40}$/.test(billcode)) return json({ error: 'Invalid callback' }, 400, origin);
    const expectedHash = md5(`${TOYYIBPAY_SECRET_KEY}${status}${orderId}${refno}ok`);
    if (receivedHash.toLowerCase() !== expectedHash) return json({ error: 'Invalid callback signature' }, 401, origin);
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const orderResponse = await service.from('payment_orders').select('id,external_uuid,billcode,amount_cents').eq('external_uuid', orderId).eq('billcode', billcode).single();
    if (orderResponse.error || !orderResponse.data) return json({ error: 'Order not found' }, 404, origin);
    const transactions = await fetch(`${TOYYIBPAY_BASE_URL.replace(/\/$/, '')}/index.php/api/getBillTransactions`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ billCode: billcode, billpaymentStatus: '1' }) });
    const txText = await transactions.text(); let tx: any[] = []; try { tx = JSON.parse(txText); } catch { tx = []; }
    const providerTx = Array.isArray(tx) ? tx.find((row) => String(row.billpaymentStatus) === '1' && Math.round(Number(row.billpaymentAmount) * 100) === Number(orderResponse.data.amount_cents)) : undefined;
    const providerRef = providerTx?.billpaymentInvoiceNo || refno;
    if (status === '1' && (!providerTx || !providerRef || Math.round(Number(providerTx.billpaymentAmount) * 100) !== Number(orderResponse.data.amount_cents))) return json({ error: 'Payment verification failed' }, 400, origin);
    const { data: completed, error } = await service.rpc('complete_payment', { p_billcode: billcode, p_provider_ref: providerRef ?? refno, p_status: status, p_amount_cents: Math.round(Number(providerTx?.billpaymentAmount ?? amount) * 100), p_payload: { status, order_id: orderId, billcode, amount, refno } });
    if (error) return json({ error: 'Payment completion failed' }, 500, origin);
    return json({ ok: completed === true }, 200, origin);
  } catch (error) { return json({ error: 'Callback failed' }, 500, origin); }
});
