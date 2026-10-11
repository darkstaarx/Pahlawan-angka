-- Payment + affiliate foundation. Apply after commercial_foundation_v1.sql.
create extension if not exists pgcrypto;
create schema if not exists pa_private;
revoke all on schema pa_private from public, anon;
grant usage on schema pa_private to authenticated;
alter table public.family_subscriptions add column if not exists purchased_at timestamptz;

create table if not exists public.plan_catalog (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('premium','family_plus')),
  version integer not null,
  price_cents integer not null check (price_cents > 0),
  commission_cents integer not null default 0 check (commission_cents >= 0 and commission_cents < price_cents),
  currency text not null default 'MYR' check (currency = 'MYR'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(plan, version)
);
create unique index if not exists plan_catalog_one_active on public.plan_catalog(plan) where active;
insert into public.plan_catalog(plan,version,price_cents,commission_cents)
values ('premium',1,1900,900),('family_plus',1,2900,1500)
on conflict (plan,version) do nothing;

create table if not exists public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  code text unique,
  display_name text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);
create table if not exists pa_private.affiliate_bank_info (
  affiliate_id uuid primary key references public.affiliate_applications(id) on delete cascade,
  phone text not null check (phone ~ '^[0-9]{9,12}$'),
  account_name text not null,
  bank_name text not null,
  account_number text not null,
  updated_at timestamptz not null default now()
);
create table if not exists pa_private.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  visitor_id text,
  clicked_at timestamptz not null default now()
);
create index if not exists affiliate_clicks_recent on pa_private.affiliate_clicks(code, clicked_at desc);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  external_uuid uuid not null unique,
  user_id uuid not null references auth.users(id),
  family_id uuid not null references public.families(id),
  plan text not null check (plan in ('premium','family_plus')),
  catalog_version integer not null,
  catalog_snapshot jsonb not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'MYR',
  status text not null default 'created' check (status in ('created','pending','paid','failed','cancelled')),
  billcode text unique,
  bill_claimed_at timestamptz,
  affiliate_code text,
  affiliate_id uuid references public.affiliate_applications(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.payment_orders(id) on delete cascade,
  provider_ref text not null,
  provider_status text not null,
  amount_cents integer not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(order_id, provider_ref)
);
create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.payment_orders(id),
  affiliate_id uuid not null references public.affiliate_applications(id),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending','approved','paid','void')),
  payout_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table pa_private.affiliate_clicks enable row level security;
revoke all on pa_private.affiliate_clicks from public,anon,authenticated;
alter table public.plan_catalog enable row level security;
alter table public.affiliate_applications enable row level security;
alter table pa_private.affiliate_bank_info enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.affiliate_commissions enable row level security;
grant select on public.plan_catalog to anon, authenticated;
grant select on public.affiliate_applications to authenticated;
grant select on public.payment_orders to authenticated;
grant select on public.affiliate_commissions to authenticated;
grant select,insert,update on pa_private.affiliate_bank_info to authenticated;

create or replace function pa_private.is_admin() returns boolean language sql security invoker set search_path='' stable as $$
  select exists(select 1 from public.app_user_roles where user_id=(select auth.uid()) and role='admin')
$$;
revoke all on function pa_private.is_admin() from public,anon;
grant execute on function pa_private.is_admin() to authenticated;

drop policy if exists plan_catalog_read_active on public.plan_catalog;
create policy plan_catalog_read_active on public.plan_catalog for select to anon,authenticated using (active);
drop policy if exists affiliate_application_own on public.affiliate_applications;
create policy affiliate_application_own on public.affiliate_applications for select to authenticated using (user_id=(select auth.uid()) or (select pa_private.is_admin()));
revoke insert,update,delete on public.affiliate_applications from anon,authenticated;
drop policy if exists affiliate_application_admin_update on public.affiliate_applications;
create policy affiliate_application_admin_update on public.affiliate_applications for update to authenticated using ((select pa_private.is_admin())) with check ((select pa_private.is_admin()));
drop policy if exists payment_orders_own_or_admin on public.payment_orders;
create policy payment_orders_own_or_admin on public.payment_orders for select to authenticated using (user_id=(select auth.uid()) or (select pa_private.is_admin()));
drop policy if exists commissions_own_or_admin on public.affiliate_commissions;
create policy commissions_own_or_admin on public.affiliate_commissions for select to authenticated using (exists(select 1 from public.affiliate_applications a where a.id=affiliate_id and a.user_id=(select auth.uid())) or (select pa_private.is_admin()));
drop policy if exists commissions_admin_update on public.affiliate_commissions;
create policy commissions_admin_update on public.affiliate_commissions for update to authenticated using ((select pa_private.is_admin())) with check ((select pa_private.is_admin()));
drop policy if exists bank_own_or_admin on pa_private.affiliate_bank_info;
create policy bank_own_or_admin on pa_private.affiliate_bank_info for all to authenticated using (exists(select 1 from public.affiliate_applications a where a.id=affiliate_id and (a.user_id=(select auth.uid()) or (select pa_private.is_admin())))) with check (exists(select 1 from public.affiliate_applications a where a.id=affiliate_id and (a.user_id=(select auth.uid()) or (select pa_private.is_admin()))));

revoke insert,update,delete on public.payment_orders,public.payment_transactions,public.affiliate_commissions from anon,authenticated;

create or replace function public.create_payment_order(p_plan text, p_external_uuid uuid, p_affiliate_code text default null, p_expected_price_cents integer default null)
returns public.payment_orders language plpgsql security definer set search_path='' as $$
declare c public.plan_catalog; f public.families; a public.affiliate_applications; o public.payment_orders;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into f from public.families where owner_user_id=auth.uid();
  if f.id is null then raise exception 'Family owner required' using errcode='42501'; end if;
  select * into c from public.plan_catalog where plan=p_plan and active for update;
  if c.id is null then raise exception 'Unknown plan'; end if;
  if p_expected_price_cents is not null and p_expected_price_cents <> c.price_cents then raise exception 'Plan price changed'; end if;
  if exists(select 1 from public.family_subscriptions where family_id=f.id and status in ('active','trialing') and (current_period_end is null or current_period_end>now()) and (plan='family_plus' or p_plan='premium')) then raise exception 'Family already has paid access'; end if;
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
  on conflict(external_uuid) do nothing
  returning * into o;
  return o;
end $$;
revoke all on function public.create_payment_order(text,uuid,text,integer) from public,anon;
grant execute on function public.create_payment_order(text,uuid,text,integer) to authenticated;

create or replace function public.claim_payment_bill(p_order_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  update public.payment_orders set status='pending',bill_claimed_at=now()
  where id=p_order_id and user_id=auth.uid() and billcode is null and bill_claimed_at is null;
  return found;
end $$;
revoke all on function public.claim_payment_bill(uuid) from public,anon;
grant execute on function public.claim_payment_bill(uuid) to authenticated;

create or replace function public.apply_affiliate_application(p_display_name text,p_phone text,p_account_name text,p_bank_name text,p_account_number text)
returns public.affiliate_applications language plpgsql security definer set search_path='' as $$
declare r public.affiliate_applications; existing_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_phone !~ '^[0-9]{9,12}$' or nullif(trim(p_account_name),'') is null or nullif(trim(p_bank_name),'') is null or nullif(trim(p_account_number),'') is null then raise exception 'Complete payout details required'; end if;
  select status into existing_status from public.affiliate_applications where user_id=auth.uid();
  insert into public.affiliate_applications(user_id,display_name,status,code,approved_at,approved_by)
  values(auth.uid(),left(nullif(trim(p_display_name),''),120),case when existing_status='rejected' then 'pending' else coalesce(existing_status,'pending') end,case when existing_status='approved' then (select code from public.affiliate_applications where user_id=auth.uid()) else null end,case when existing_status='approved' then (select approved_at from public.affiliate_applications where user_id=auth.uid()) else null end,case when existing_status='approved' then (select approved_by from public.affiliate_applications where user_id=auth.uid()) else null end)
  on conflict(user_id) do update set display_name=excluded.display_name,status=case when affiliate_applications.status='rejected' then 'pending' else affiliate_applications.status end
  returning * into r;
  insert into pa_private.affiliate_bank_info(affiliate_id,phone,account_name,bank_name,account_number)
  values(r.id,p_phone,left(trim(p_account_name),120),left(trim(p_bank_name),120),left(trim(p_account_number),80))
  on conflict(affiliate_id) do update set phone=excluded.phone,account_name=excluded.account_name,bank_name=excluded.bank_name,account_number=excluded.account_number,updated_at=now();
  return r;
end $$;
revoke all on function public.apply_affiliate_application(text,text,text,text,text) from public,anon;
grant execute on function public.apply_affiliate_application(text,text,text,text,text) to authenticated;

create or replace function pa_private.complete_payment(p_billcode text,p_provider_ref text,p_status text,p_amount_cents integer,p_payload jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare o public.payment_orders; current_plan text;
begin
  select * into o from public.payment_orders where billcode=p_billcode for update;
  if o.id is null or p_status <> '1' or p_amount_cents <> o.amount_cents then return false; end if;
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
  values(o.family_id,o.plan,'active','toyyibpay',p_billcode,now())
  on conflict(family_id) do update set plan=excluded.plan,status='active',current_period_end=null,provider='toyyibpay',provider_subscription_id=p_billcode,purchased_at=now(),updated_at=now();
  update public.payment_orders set status='paid',paid_at=now() where id=o.id;
  if o.affiliate_id is not null then
    insert into public.affiliate_commissions(order_id,affiliate_id,amount_cents) values(o.id,o.affiliate_id,(o.catalog_snapshot->>'commission_cents')::integer) on conflict(order_id) do nothing;
  end if;
  return true;
end $$;
revoke all on function pa_private.complete_payment(text,text,text,integer,jsonb) from public,anon,authenticated;

create or replace function public.complete_payment(p_billcode text,p_provider_ref text,p_status text,p_amount_cents integer,p_payload jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required' using errcode='42501'; end if;
  return pa_private.complete_payment(p_billcode,p_provider_ref,p_status,p_amount_cents,p_payload);
end $$;
revoke all on function public.complete_payment(text,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.complete_payment(text,text,text,integer,jsonb) to service_role;

create or replace function public.admin_set_affiliate_approval(p_application_id uuid,p_approved boolean,p_code text)
returns public.affiliate_applications language plpgsql security definer set search_path='' as $$
declare r public.affiliate_applications;
begin
  if not pa_private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if p_approved and (p_code is null or p_code !~ '^[A-Za-z0-9_-]{4,40}$') then raise exception 'Invalid affiliate code'; end if;
  update public.affiliate_applications set status=case when p_approved then 'approved' else 'rejected' end,code=case when p_approved then lower(p_code) else null end,approved_at=case when p_approved then now() else null end,approved_by=auth.uid() where id=p_application_id returning * into r;
  return r;
end $$;
revoke all on function public.admin_set_affiliate_approval(uuid,boolean,text) from public,anon;
grant execute on function public.admin_set_affiliate_approval(uuid,boolean,text) to authenticated;

create or replace function public.admin_mark_commission_paid(p_commission_id uuid,p_payout_reference text)
returns public.affiliate_commissions language plpgsql security definer set search_path='' as $$
declare r public.affiliate_commissions;
begin
  if not pa_private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if p_payout_reference is null or length(trim(p_payout_reference)) < 3 then raise exception 'Payout reference required'; end if;
  update public.affiliate_commissions set status='paid',payout_reference=left(trim(p_payout_reference),120),paid_at=now() where id=p_commission_id and status in ('pending','approved') returning * into r;
  if r.id is null then raise exception 'Commission not payable'; end if;
  return r;
end $$;
revoke all on function public.admin_mark_commission_paid(uuid,text) from public,anon;
grant execute on function public.admin_mark_commission_paid(uuid,text) to authenticated;

create or replace function public.admin_get_affiliate_bank_info(p_affiliate_id uuid)
returns table(phone text,account_name text,bank_name text,account_number text,updated_at timestamptz)
language sql security definer set search_path='' as $$
  select b.phone,b.account_name,b.bank_name,b.account_number,b.updated_at
  from pa_private.affiliate_bank_info b
  where b.affiliate_id=p_affiliate_id and pa_private.is_admin()
$$;
revoke all on function public.admin_get_affiliate_bank_info(uuid) from public,anon;
grant execute on function public.admin_get_affiliate_bank_info(uuid) to authenticated;

create or replace function public.record_affiliate_click(p_code text,p_visitor_id text default null)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.affiliate_applications where lower(code)=lower(trim(p_code)) and status='approved') then return false; end if;
  insert into pa_private.affiliate_clicks(code,visitor_id) values(lower(trim(p_code)),left(p_visitor_id,128)); return true;
end $$;
revoke all on function public.record_affiliate_click(text,text) from public,anon;
grant execute on function public.record_affiliate_click(text,text) to authenticated;
