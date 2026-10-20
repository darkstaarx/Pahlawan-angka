// CHIP success_callback: CHIP POSTs the purchase object here once it is paid.
// Trust nothing from the body beyond the purchase id: the signature must
// verify, then the purchase is re-read from CHIP before access is granted.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { json, requireConfig } from '../_shared/http.ts';
import { chipPurchaseId, chipRequest, verifyChipSignature } from '../_shared/chip.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CHIP_SECRET_KEY, CHIP_BRAND_ID } = requireConfig('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CHIP_SECRET_KEY', 'CHIP_BRAND_ID');
    const rawBody = new Uint8Array(await req.arrayBuffer());
    if (!(await verifyChipSignature(CHIP_SECRET_KEY, rawBody, req.headers.get('X-Signature')))) return json({ error: 'Invalid callback signature' }, 401);

    let event: any;
    try { event = JSON.parse(new TextDecoder().decode(rawBody)); } catch { return json({ error: 'Invalid callback' }, 400); }
    const purchaseId = event?.id;
    if (!chipPurchaseId(purchaseId)) return json({ error: 'Invalid callback' }, 400);

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const orderResponse = await service.from('payment_orders').select('id,external_uuid,billcode,amount_cents').eq('billcode', purchaseId).single();
    if (orderResponse.error || !orderResponse.data) return json({ error: 'Order not found' }, 404);
    const order = orderResponse.data;

    // Source of truth: the purchase as CHIP reports it now.
    const purchase = await chipRequest(CHIP_SECRET_KEY, `/purchases/${purchaseId}/`);
    if (!purchase) return json({ error: 'Payment verification unavailable' }, 502);
    const total = Number(purchase?.purchase?.total);
    const paid = purchase.status === 'paid'
      && purchase.brand_id === CHIP_BRAND_ID
      && purchase.reference === order.external_uuid
      && String(purchase?.purchase?.currency ?? 'MYR').toUpperCase() === 'MYR'
      && total === Number(order.amount_cents);
    if (!paid) {
      console.error('chip_callback_not_paid', { status: purchase.status, amount_match: total === Number(order.amount_cents) });
      return json({ ok: false }, 200);
    }

    const { data: completed, error } = await service.rpc('complete_payment', {
      p_billcode: purchaseId,
      p_provider_ref: purchaseId,
      p_status: '1',
      p_amount_cents: total,
      p_payload: { provider: 'chip', purchase_id: purchaseId, status: purchase.status, reference: purchase.reference, total, currency: purchase?.purchase?.currency ?? null, event_type: event?.event_type ?? null },
    });
    if (error) return json({ error: 'Payment completion failed' }, 500);
    if (completed === true && Deno.env.get('EMAIL_DELIVERY_ENABLED') === 'true') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-payment-emails`, { method: 'POST', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }, signal: controller.signal });
      } catch { /* Email delivery is independent of payment confirmation. */ }
      finally { clearTimeout(timeout); }
    }
    return json({ ok: completed === true }, 200);
  } catch (_error) { return json({ error: 'Callback failed' }, 500); }
});
