-- Rollback integration fixtures for payment_upgrade.sql.
begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000201','upgrade-buyer@example.invalid'),
('00000000-0000-4000-8000-000000000202','upgrade-full@example.invalid')
on conflict (id) do nothing;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000201',true);
select set_config('request.jwt.claim.role','authenticated',true);
reset role;

insert into public.family_subscriptions(family_id,plan,status,current_period_end)
select id,'premium','active',now()+interval '1 day' from public.families
where owner_user_id='00000000-0000-4000-8000-000000000201'
on conflict (family_id) do update set plan='premium',status='active',current_period_end=now()+interval '1 day';
set local role authenticated;

do $$
declare o public.payment_orders; retry public.payment_orders; routed public.payment_orders; duplicate public.payment_orders; accepted boolean;
begin
  -- Existing checkout RPC routes active premium -> family_plus to the upgrade path.
  routed:=public.create_payment_order('family_plus','00000000-0000-4000-8000-000000000211','IGNORED-REFERRAL',1000);
  o:=routed;
  if o.amount_cents<>1000 or o.affiliate_id is not null then raise exception 'upgrade amount/referral incorrect'; end if;
  if (o.catalog_snapshot->>'upgrade')::boolean is distinct from true
     or (o.catalog_snapshot->>'base_price_cents')::int<>1900
     or (o.catalog_snapshot->>'target_price_cents')::int<>2900
     or (o.catalog_snapshot->>'commission_cents')::int<>0 then raise exception 'upgrade snapshot incorrect'; end if;
  if (select plan from public.family_subscriptions where family_id=o.family_id)<>'premium' then raise exception 'subscription changed before callback'; end if;
  retry:=public.create_payment_order('family_plus','00000000-0000-4000-8000-000000000211','IGNORED-REFERRAL',1000);
  if retry.id<>o.id then raise exception 'upgrade idempotency failed'; end if;
  accepted:=false;
  begin perform public.create_payment_upgrade_order('00000000-0000-4000-8000-000000000212',2900); accepted:=true; exception when others then null; end;
  if accepted then raise exception 'spoof price accepted'; end if;
  duplicate:=public.create_payment_upgrade_order('00000000-0000-4000-8000-000000000213',1000);
  if duplicate.id<>o.id then raise exception 'duplicate pending upgrade was not resumed'; end if;
end $$;

reset role;
update public.payment_orders set status='pending',billcode='upgrade-test-bill'
where external_uuid='00000000-0000-4000-8000-000000000211';
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
do $$
begin
  if not public.complete_payment('upgrade-test-bill','upgrade-test-ref','1',1000,'{}') then raise exception 'upgrade completion failed'; end if;
end $$;
reset role;
do $$ begin
  if (select plan from public.family_subscriptions where family_id=(select family_id from public.payment_orders where billcode='upgrade-test-bill'))<>'family_plus' then raise exception 'upgrade entitlement missing'; end if;
  if exists(select 1 from public.affiliate_commissions where order_id=(select id from public.payment_orders where billcode='upgrade-test-bill')) then raise exception 'upgrade commission created'; end if;
end $$;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000201',true);
set local role authenticated;
do $$ declare accepted boolean:=false; begin
  begin perform public.create_payment_order('premium','00000000-0000-4000-8000-000000000215',null,1900); accepted:=true; exception when others then null; end;
  if accepted then raise exception 'family_plus allowed lower full purchase'; end if;
end $$;

-- Expired premium and free rows do not qualify as upgrades, but remain eligible for full purchase.
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000202',true);
reset role;
insert into public.family_subscriptions(family_id,plan,status,current_period_end)
select id,'premium','active',now()-interval '1 minute' from public.families where owner_user_id='00000000-0000-4000-8000-000000000202'
on conflict (family_id) do update set plan='premium',status='active',current_period_end=now()-interval '1 minute';
set local role authenticated;
do $$ declare accepted boolean:=false; po public.payment_orders; begin
  begin perform public.create_payment_upgrade_order('00000000-0000-4000-8000-000000000221',1000); accepted:=true; exception when others then null; end;
  if accepted then raise exception 'expired premium upgraded'; end if;
  po:=public.create_payment_order('premium','00000000-0000-4000-8000-000000000222',null,1900);
  if po.amount_cents<>1900 then raise exception 'full purchase rejected after expiry'; end if;
end $$;
reset role;
update public.family_subscriptions set plan='free',status='active',current_period_end=null where family_id=(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000202');
set local role authenticated;
do $$ declare po public.payment_orders; begin
  po:=public.create_payment_order('premium','00000000-0000-4000-8000-000000000223',null,1900);
  if po.amount_cents<>1900 then raise exception 'free family blocked full purchase'; end if;
end $$;

select 'PASS premium upgrade pricing, snapshots, ownership/idempotency, callback, expiry, and free purchase fixtures' as verification;
rollback;
