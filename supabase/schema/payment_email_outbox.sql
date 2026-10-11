-- Durable, private payment activation email outbox.
create schema if not exists pa_private;

create table if not exists pa_private.payment_email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.payment_orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text,
  plan text not null check (plan in ('premium','family_plus')),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists payment_email_outbox_pending_idx
  on pa_private.payment_email_outbox (available_at, created_at)
  where status = 'pending';

alter table pa_private.payment_email_outbox enable row level security;
revoke all on pa_private.payment_email_outbox from public, anon, authenticated;
grant usage on schema pa_private to service_role;
grant select, insert, update on pa_private.payment_email_outbox to service_role;

create or replace function pa_private.enqueue_payment_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare recipient text;
begin
  if new.status <> 'paid' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'paid' then
    return new;
  end if;

  select u.email into recipient from auth.users u where u.id = new.user_id;
  insert into pa_private.payment_email_outbox(order_id, user_id, recipient_email, plan, amount_cents)
  values (new.id, new.user_id, recipient, new.plan, new.amount_cents)
  on conflict (order_id) do nothing;
  return new;
end;
$$;

revoke all on function pa_private.enqueue_payment_email() from public, anon, authenticated;

drop trigger if exists payment_order_paid_email_outbox on public.payment_orders;
create trigger payment_order_paid_email_outbox
after insert or update of status on public.payment_orders
for each row execute function pa_private.enqueue_payment_email();

create or replace function pa_private.claim_payment_email_outbox(p_limit integer default 10)
returns table(id uuid, order_id uuid, user_id uuid, recipient_email text, plan text, amount_cents integer, attempts integer)
language sql
security definer
set search_path = ''
as $$
  with candidates as (
    select o.id
    from pa_private.payment_email_outbox o
    where o.status = 'pending' and o.available_at <= now()
    order by o.created_at
    for update skip locked
    limit least(greatest(coalesce(p_limit, 10), 1), 10)
  )
  update pa_private.payment_email_outbox o
  set status = 'processing', claimed_at = now(), attempts = o.attempts + 1
  from candidates c
  where o.id = c.id
  returning o.id, o.order_id, o.user_id, o.recipient_email, o.plan, o.amount_cents, o.attempts;
$$;

create or replace function pa_private.mark_payment_email_sent(p_id uuid)
returns boolean language sql security definer set search_path = '' as $$
  update pa_private.payment_email_outbox
  set status = 'sent', sent_at = now(), last_error = null
  where id = p_id and status = 'processing'
  returning true;
$$;

create or replace function pa_private.mark_payment_email_retry(p_id uuid, p_error text)
returns boolean language sql security definer set search_path = '' as $$
  update pa_private.payment_email_outbox
  set status = 'pending', available_at = now() + least(interval '1 hour', interval '1 minute' * power(2, least(attempts, 6))), last_error = left(coalesce(p_error, 'retryable delivery failure'), 500)
  where id = p_id and status = 'processing'
  returning true;
$$;

create or replace function pa_private.mark_payment_email_failed(p_id uuid, p_error text)
returns boolean language sql security definer set search_path = '' as $$
  update pa_private.payment_email_outbox
  set status = 'failed', last_error = left(coalesce(p_error, 'permanent delivery failure'), 500)
  where id = p_id and status = 'processing'
  returning true;
$$;

revoke all on function pa_private.claim_payment_email_outbox(integer) from public, anon, authenticated;
revoke all on function pa_private.mark_payment_email_sent(uuid) from public, anon, authenticated;
revoke all on function pa_private.mark_payment_email_retry(uuid, text) from public, anon, authenticated;
revoke all on function pa_private.mark_payment_email_failed(uuid, text) from public, anon, authenticated;
grant execute on function pa_private.claim_payment_email_outbox(integer) to service_role;
grant execute on function pa_private.mark_payment_email_sent(uuid) to service_role;
grant execute on function pa_private.mark_payment_email_retry(uuid, text) to service_role;
grant execute on function pa_private.mark_payment_email_failed(uuid, text) to service_role;

-- PostgREST exposes public RPCs; these wrappers remain service_role-only.
create or replace function public.claim_payment_email_outbox(p_limit integer default 10)
returns table(id uuid, order_id uuid, user_id uuid, recipient_email text, plan text, amount_cents integer, attempts integer)
language sql security invoker set search_path = '' as $$
  select * from pa_private.claim_payment_email_outbox(p_limit);
$$;
create or replace function public.mark_payment_email_sent(p_id uuid)
returns boolean language sql security invoker set search_path = '' as $$
  select pa_private.mark_payment_email_sent(p_id);
$$;
create or replace function public.mark_payment_email_retry(p_id uuid, p_error text)
returns boolean language sql security invoker set search_path = '' as $$
  select pa_private.mark_payment_email_retry(p_id, p_error);
$$;
create or replace function public.mark_payment_email_failed(p_id uuid, p_error text)
returns boolean language sql security invoker set search_path = '' as $$
  select pa_private.mark_payment_email_failed(p_id, p_error);
$$;
revoke all on function public.claim_payment_email_outbox(integer) from public, anon, authenticated;
revoke all on function public.mark_payment_email_sent(uuid) from public, anon, authenticated;
revoke all on function public.mark_payment_email_retry(uuid, text) from public, anon, authenticated;
revoke all on function public.mark_payment_email_failed(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_payment_email_outbox(integer) to service_role;
grant execute on function public.mark_payment_email_sent(uuid) to service_role;
grant execute on function public.mark_payment_email_retry(uuid, text) to service_role;
grant execute on function public.mark_payment_email_failed(uuid, text) to service_role;
