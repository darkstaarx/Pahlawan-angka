-- Safe lifetime premium -> family_plus upgrade order.
-- Apply after payment_affiliate_private_wrappers.sql and payment_lifetime_expiry_fix.sql.

create or replace function pa_private.create_payment_upgrade_order(
  p_external_uuid uuid,
  p_expected_price_cents integer default null
)
returns public.payment_orders
language plpgsql
security definer
set search_path=''
as $$
declare
  f public.families;
  s public.family_subscriptions;
  base_catalog public.plan_catalog;
  target_catalog public.plan_catalog;
  o public.payment_orders;
  upgrade_price integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  if p_external_uuid is null then
    raise exception 'External order id required';
  end if;

  -- Serialize all upgrade attempts for this family before reading entitlement state.
  select * into f from public.families where owner_user_id=auth.uid() for update;
  if f.id is null then
    raise exception 'Family owner required' using errcode='42501';
  end if;

  select * into o from public.payment_orders
  where external_uuid=p_external_uuid;
  if o.id is not null then
    if o.user_id<>auth.uid() or o.family_id<>f.id or o.plan<>'family_plus'
       or coalesce((o.catalog_snapshot->>'upgrade')::boolean,false) is distinct from true then
      raise exception 'External order belongs to another order';
    end if;
    if p_expected_price_cents is not null and p_expected_price_cents<>o.amount_cents then
      raise exception 'Plan price changed';
    end if;
    return o;
  end if;

  select * into s from public.family_subscriptions
  where family_id=f.id for update;
  if s.family_id is null or s.plan<>'premium'
     or s.status not in ('active','trialing')
     or (s.current_period_end is not null and s.current_period_end<=now()) then
    if s.plan='family_plus' and s.status in ('active','trialing')
       and (s.current_period_end is null or s.current_period_end>now()) then
      raise exception 'Family already has family_plus access';
    end if;
    raise exception 'Active premium subscription required';
  end if;

  select * into base_catalog from public.plan_catalog
  where plan='premium' and active for update;
  select * into target_catalog from public.plan_catalog
  where plan='family_plus' and active for update;
  if base_catalog.id is null or target_catalog.id is null then
    raise exception 'Plan catalog unavailable';
  end if;
  upgrade_price := target_catalog.price_cents-base_catalog.price_cents;
  if upgrade_price<=0 then
    raise exception 'Upgrade price unavailable';
  end if;
  if p_expected_price_cents is not null and p_expected_price_cents<>upgrade_price then
    raise exception 'Plan price changed';
  end if;

  -- Never reuse a full-price family_plus order as a discounted upgrade.
  if exists (
    select 1 from public.payment_orders x
    where x.family_id=f.id and x.plan='family_plus'
      and x.status in ('created','pending')
      and coalesce((x.catalog_snapshot->>'upgrade')::boolean,false) is distinct from true
  ) then
    raise exception 'Existing family_plus payment pending';
  end if;
  -- Resume a matching pending upgrade so a browser retry with a fresh UUID
  -- cannot create another bill. Never mutate its amount or snapshot.
  select x.* into o
  from public.payment_orders x
  where x.family_id=f.id and x.plan='family_plus'
    and x.status in ('created','pending')
    and coalesce((x.catalog_snapshot->>'upgrade')::boolean,false)=true
  order by x.created_at
  limit 1;
  if o.id is not null then
    if o.amount_cents<>upgrade_price then
      raise exception 'Existing upgrade price changed';
    end if;
    return o;
  end if;

  insert into public.payment_orders(
    external_uuid,user_id,family_id,plan,catalog_version,catalog_snapshot,
    amount_cents,currency,affiliate_code,affiliate_id
  ) values (
    p_external_uuid,auth.uid(),f.id,target_catalog.plan,target_catalog.version,
    jsonb_build_object(
      'upgrade',true,
      'base_plan',base_catalog.plan,
      'target_plan',target_catalog.plan,
      'base_catalog_version',base_catalog.version,
      'target_catalog_version',target_catalog.version,
      'base_price_cents',base_catalog.price_cents,
      'target_price_cents',target_catalog.price_cents,
      'price_cents',upgrade_price,
      'commission_cents',0,
      'currency',target_catalog.currency
    ),
    upgrade_price,target_catalog.currency,null,null
  ) returning * into o;
  return o;
end;
$$;

revoke all on function pa_private.create_payment_upgrade_order(uuid,integer) from public,anon;
grant execute on function pa_private.create_payment_upgrade_order(uuid,integer) to authenticated;

create or replace function public.create_payment_upgrade_order(
  p_external_uuid uuid,
  p_expected_price_cents integer default null
)
returns public.payment_orders
language sql
security invoker
set search_path=''
as $$ select pa_private.create_payment_upgrade_order(p_external_uuid,p_expected_price_cents); $$;

revoke all on function public.create_payment_upgrade_order(uuid,integer) from public,anon;
grant execute on function public.create_payment_upgrade_order(uuid,integer) to authenticated;

-- Keep normal full-price purchases valid for families whose row is active but free.
create or replace function pa_private.create_payment_order(
  p_plan text,
  p_external_uuid uuid,
  p_affiliate_code text default null,
  p_expected_price_cents integer default null
)
returns public.payment_orders
language plpgsql
security definer
set search_path=''
as $$
declare c public.plan_catalog; f public.families; a public.affiliate_applications; o public.payment_orders;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into f from public.families where owner_user_id=auth.uid() for update;
  if f.id is null then raise exception 'Family owner required' using errcode='42501'; end if;
  -- Keep the existing checkout API compatible: an active premium -> family_plus
  -- request is always a server-priced upgrade, regardless of referral input.
  if p_plan='family_plus' and exists(
    select 1 from public.family_subscriptions
    where family_id=f.id and plan='premium' and status in ('active','trialing')
      and (current_period_end is null or current_period_end>now())
  ) then
    return pa_private.create_payment_upgrade_order(p_external_uuid,p_expected_price_cents);
  end if;
  select * into c from public.plan_catalog where plan=p_plan and active for update;
  if c.id is null then raise exception 'Unknown plan'; end if;
  if p_expected_price_cents is not null and p_expected_price_cents<>c.price_cents then raise exception 'Plan price changed'; end if;
  if exists(select 1 from public.family_subscriptions where family_id=f.id and status in ('active','trialing') and (current_period_end is null or current_period_end>now()) and plan in ('premium','family_plus')) then raise exception 'Family already has paid access'; end if;
  select * into o from public.payment_orders where external_uuid=p_external_uuid;
  if o.id is not null then
    if o.user_id<>auth.uid() or o.plan<>p_plan then raise exception 'External order belongs to another order'; end if;
    return o;
  end if;
  if p_affiliate_code is not null then
    select * into a from public.affiliate_applications where lower(code)=lower(trim(p_affiliate_code)) and status='approved';
    if a.id is null or a.user_id=auth.uid() then a := null; end if;
  end if;
  insert into public.payment_orders(external_uuid,user_id,family_id,plan,catalog_version,catalog_snapshot,amount_cents,affiliate_code,affiliate_id)
  values(p_external_uuid,auth.uid(),f.id,c.plan,c.version,jsonb_build_object('plan',c.plan,'version',c.version,'price_cents',c.price_cents,'commission_cents',c.commission_cents,'currency',c.currency),c.price_cents,nullif(trim(p_affiliate_code),''),a.id)
  returning * into o;
  return o;
end;
$$;

revoke all on function pa_private.create_payment_order(text,uuid,text,integer) from public,anon,authenticated;
grant execute on function pa_private.create_payment_order(text,uuid,text,integer) to authenticated;
