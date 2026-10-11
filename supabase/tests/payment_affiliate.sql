begin;

do $$
declare premium public.plan_catalog; plus public.plan_catalog;
begin
  select * into premium from public.plan_catalog where plan='premium' and active;
  select * into plus from public.plan_catalog where plan='family_plus' and active;
  if premium.price_cents <> 1900 or premium.commission_cents <> 900 then raise exception 'premium catalog mismatch'; end if;
  if plus.price_cents <> 2900 or plus.commission_cents <> 1500 then raise exception 'family_plus catalog mismatch'; end if;
  if premium.version is null or plus.version is null then raise exception 'catalog versions missing'; end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='create_payment_order') then raise exception 'order RPC missing'; end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='complete_payment') then raise exception 'service completion RPC missing'; end if;
  if exists (select 1 from information_schema.role_table_grants where table_name='payment_orders' and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE')) then raise exception 'browser can mutate orders'; end if;
end $$;

select 'PASS payment catalog, order immutability, and service completion contract' as verification;
rollback;
