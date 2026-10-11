begin;

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
