-- CHIP (chip-in.asia) replaces ToyyibPay for new checkouts.
-- Same logic as payment_lifetime_expiry_fix.sql; only the provider label now
-- follows the bill: CHIP purchase UUID -> 'chip', legacy ToyyibPay code -> 'toyyibpay'.
-- Run in the Supabase SQL editor before enabling CHIP checkout.

create or replace function pa_private.complete_payment(p_billcode text,p_provider_ref text,p_status text,p_amount_cents integer,p_payload jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare o public.payment_orders; current_plan text; v_provider text;
begin
  select * into o from public.payment_orders where billcode=p_billcode for update;
  if o.id is null or p_status <> '1' or p_amount_cents <> o.amount_cents then return false; end if;
  -- CHIP purchase ids are UUIDs; older ToyyibPay bill codes are short codes.
  v_provider := case when p_billcode ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then 'chip' else 'toyyibpay' end;
  insert into public.payment_transactions(order_id,provider_ref,provider_status,amount_cents,raw_payload) values(o.id,p_provider_ref,p_status,p_amount_cents,p_payload) on conflict do nothing;
  if o.status='paid' then return true; end if;
  perform 1 from public.families where id=o.family_id for update;
  select plan into current_plan from public.family_subscriptions where family_id=o.family_id and status in ('active','trialing') and (current_period_end is null or current_period_end>now()) for update;
  if current_plan='family_plus' and o.plan='premium' then
    update public.payment_orders set status='paid',paid_at=now() where id=o.id;
    if o.affiliate_id is not null then insert into public.affiliate_commissions(order_id,affiliate_id,amount_cents) values(o.id,o.affiliate_id,(o.catalog_snapshot->>'commission_cents')::integer) on conflict(order_id) do nothing; end if;
    return true;
  end if;
  insert into public.family_subscriptions(family_id,plan,status,provider,provider_subscription_id,purchased_at)
  values(o.family_id,o.plan,'active',v_provider,p_billcode,now())
  on conflict(family_id) do update set plan=excluded.plan,status='active',current_period_end=null,provider=v_provider,provider_subscription_id=p_billcode,purchased_at=now(),updated_at=now();
  update public.payment_orders set status='paid',paid_at=now() where id=o.id;
  if o.affiliate_id is not null then
    insert into public.affiliate_commissions(order_id,affiliate_id,amount_cents) values(o.id,o.affiliate_id,(o.catalog_snapshot->>'commission_cents')::integer) on conflict(order_id) do nothing;
  end if;
  return true;
end $$;
revoke all on function pa_private.complete_payment(text,text,text,integer,jsonb) from public,anon,authenticated;

