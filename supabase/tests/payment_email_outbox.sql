begin;

-- Run with the email worker disabled. This entire test rolls back, including any
-- unrelated row claimed while exercising the shared outbox.

-- Fixture: the signup trigger provisions a family for this Auth user.
insert into auth.users(id, email)
values ('00000000-0000-4000-8000-000000000121', 'pa-email-outbox-test@example.invalid');

do $$
declare
  family_id uuid;
  fixture_order_id uuid := '00000000-0000-4000-8000-000000000122';
begin
  select id into family_id from public.families where owner_user_id = '00000000-0000-4000-8000-000000000121';
  if family_id is null then raise exception 'fixture family was not provisioned'; end if;

  -- A pending order must not enqueue an email.
  insert into public.payment_orders(id, external_uuid, user_id, family_id, plan, catalog_version, catalog_snapshot, amount_cents, status, billcode)
  values (fixture_order_id, '00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000121', family_id, 'premium', 1, '{"plan":"premium"}', 1900, 'pending', 'email-test-bill');
  if exists (select 1 from pa_private.payment_email_outbox o where o.order_id = fixture_order_id) then
    raise exception 'pending order enqueued an email';
  end if;
end $$;

-- Complete the same order twice, matching a repeated provider callback.
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;
do $$
begin
  if not public.complete_payment('email-test-bill', 'email-test-ref', '1', 1900, '{"test":true}') then
    raise exception 'first payment completion failed';
  end if;
  if not public.complete_payment('email-test-bill', 'email-test-ref', '1', 1900, '{"test":true}') then
    raise exception 'repeated payment completion failed';
  end if;
end $$;

do $$
declare outbox_row pa_private.payment_email_outbox;
begin
  select * into outbox_row from pa_private.payment_email_outbox
  where order_id = '00000000-0000-4000-8000-000000000122';
  if outbox_row.id is null then raise exception 'paid order did not enqueue an email'; end if;
  if outbox_row.recipient_email <> 'pa-email-outbox-test@example.invalid' then raise exception 'recipient snapshot mismatch'; end if;
  if outbox_row.plan <> 'premium' or outbox_row.amount_cents <> 1900 then raise exception 'email payload snapshot mismatch'; end if;
  if (select count(*) from pa_private.payment_email_outbox where order_id = outbox_row.order_id) <> 1 then raise exception 'repeated callback duplicated outbox row'; end if;
end $$;

-- A claimed processing row must be excluded from the next claim.
do $$
declare first_claim uuid;
begin
  update pa_private.payment_email_outbox
  set created_at = '1900-01-01 00:00:00+00', available_at = now()
  where order_id = '00000000-0000-4000-8000-000000000122';
  select order_id into first_claim from public.claim_payment_email_outbox(1);
  if first_claim <> '00000000-0000-4000-8000-000000000122' then raise exception 'fixture was not the first outbox claim'; end if;
  if (select status from pa_private.payment_email_outbox where order_id = '00000000-0000-4000-8000-000000000122') <> 'processing' then raise exception 'claimed row is not processing'; end if;
  if exists (select 1 from public.claim_payment_email_outbox(1) where order_id = '00000000-0000-4000-8000-000000000122') then raise exception 'processing row was claimed again'; end if;
end $$;
reset role;

-- Browser roles cannot claim or mutate the private outbox.
set local role authenticated;
do $$
begin
  begin
    perform public.claim_payment_email_outbox(1);
    raise exception 'browser role claimed payment email outbox';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'pa_private' and c.relname = 'payment_email_outbox'
  ) then raise exception 'payment email outbox table missing'; end if;
  if not exists (
    select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
    where c.relname = 'payment_orders' and t.tgname = 'payment_order_paid_email_outbox'
  ) then raise exception 'paid-order outbox trigger missing'; end if;
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'pa_private' and table_name = 'payment_email_outbox'
      and grantee in ('anon', 'authenticated')
  ) then raise exception 'browser role can access payment email outbox'; end if;
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'pa_private' and table_name = 'payment_email_outbox'
      and grantee = 'service_role' and privilege_type = 'UPDATE'
  ) then raise exception 'service role cannot update payment email outbox'; end if;
  if not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'payment_orders'
      and grantee = 'service_role' and privilege_type = 'UPDATE'
  ) then raise exception 'service role cannot update payment orders'; end if;
end $$;

select 'PASS payment email outbox privacy and service role grants' as verification;
rollback;
