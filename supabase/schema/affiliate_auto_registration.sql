-- Automatic affiliate registration and first-registration welcome outbox.
-- Apply after payment_affiliate_private_wrappers.sql and payment_email_outbox.sql.
create extension if not exists pgcrypto;
create schema if not exists pa_private;

alter table pa_private.affiliate_bank_info
  alter column phone set not null,
  alter column account_name drop not null,
  alter column bank_name drop not null,
  alter column account_number drop not null;

alter table public.affiliate_applications
  add column if not exists approved_by_registration boolean not null default false;
create unique index if not exists affiliate_applications_code_ci
  on public.affiliate_applications(lower(code)) where code is not null;

create table if not exists pa_private.affiliate_welcome_email_outbox (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null unique references public.affiliate_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text,
  affiliate_code text not null,
  commission_snapshot jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index if not exists affiliate_welcome_outbox_pending_idx
  on pa_private.affiliate_welcome_email_outbox(available_at, created_at)
  where status = 'pending';
alter table pa_private.affiliate_welcome_email_outbox enable row level security;
revoke all on pa_private.affiliate_welcome_email_outbox from public, anon, authenticated;
grant select, insert, update on pa_private.affiliate_welcome_email_outbox to service_role;

create or replace function pa_private.enqueue_affiliate_welcome_email()
returns trigger language plpgsql security definer set search_path = '' as $$
declare recipient text; snapshot jsonb;
begin
  if new.status <> 'approved' or not new.approved_by_registration then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'approved' then return new; end if;
  select u.email into recipient from auth.users u where u.id = new.user_id;
  select coalesce(jsonb_object_agg(plan, jsonb_build_object('price_cents', price_cents, 'commission_cents', commission_cents, 'currency', currency)), '{}'::jsonb)
    into snapshot from public.plan_catalog where active;
  insert into pa_private.affiliate_welcome_email_outbox
    (affiliate_id,user_id,recipient_email,affiliate_code,commission_snapshot)
  values (new.id,new.user_id,recipient,new.code,coalesce(snapshot,'{}'::jsonb))
  on conflict (affiliate_id) do nothing;
  return new;
end;
$$;
revoke all on function pa_private.enqueue_affiliate_welcome_email() from public, anon, authenticated;
drop trigger if exists affiliate_first_registration_welcome on public.affiliate_applications;
create trigger affiliate_first_registration_welcome
after insert or update of status, approved_by_registration on public.affiliate_applications
for each row execute function pa_private.enqueue_affiliate_welcome_email();

create or replace function pa_private.apply_affiliate_application(
  p_display_name text, p_phone text, p_account_name text, p_bank_name text, p_account_number text
) returns public.affiliate_applications
language plpgsql security definer set search_path = '' as $$
declare
  r public.affiliate_applications; existing public.affiliate_applications;
  supplied_bank boolean := coalesce(nullif(trim(p_account_name),''),'') <> ''
    or coalesce(nullif(trim(p_bank_name),''),'') <> ''
    or coalesce(nullif(trim(p_account_number),''),'') <> '';
  base_code text := 'PA' || upper(substr(encode(extensions.digest(auth.uid()::text, 'sha256'), 'hex'), 1, 8));
  candidate text := base_code; n integer := 0;
begin
  if auth.uid() is null or not exists (select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null) then
    raise exception 'Verified authentication required' using errcode = '42501';
  end if;
  if nullif(trim(p_display_name),'') is null or length(trim(p_display_name)) > 120 then
    raise exception 'Name required';
  end if;
  if coalesce(p_phone,'') !~ '^[0-9]{9,12}$' then raise exception 'Valid phone required'; end if;
  if supplied_bank and (nullif(trim(p_account_name),'') is null or nullif(trim(p_bank_name),'') is null or nullif(trim(p_account_number),'') is null) then
    raise exception 'Complete payout details required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  select * into existing from public.affiliate_applications where user_id = auth.uid() for update;
  if existing.id is not null and existing.status = 'suspended' then raise exception 'Affiliate account suspended'; end if;
  if existing.id is not null and existing.code is not null then candidate := existing.code; end if;
  if existing.id is null then
    loop
      begin
        insert into public.affiliate_applications(user_id,display_name,status,code,approved_at,approved_by_registration)
        values(auth.uid(),left(trim(p_display_name),120),'approved',candidate,now(),true) returning * into r;
        exit;
      exception when unique_violation then
        n := n + 1; candidate := base_code || lpad(n::text, 2, '0');
        if n > 20 then raise exception 'Could not allocate affiliate code'; end if;
      end;
    end loop;
  else
    if existing.status in ('pending','rejected') or existing.code is null then
      loop
        begin
          update public.affiliate_applications set display_name=left(trim(p_display_name),120),status='approved',approved_at=coalesce(approved_at,now()),approved_by_registration=true,code=candidate where id=existing.id returning * into r;
          exit;
        exception when unique_violation then
          n := n + 1; candidate := base_code || lpad(n::text, 2, '0');
          if n > 20 then raise exception 'Could not allocate affiliate code'; end if;
        end;
      end loop;
    else
      update public.affiliate_applications set display_name=left(trim(p_display_name),120) where id=existing.id returning * into r;
    end if;
  end if;
  if supplied_bank then
    insert into pa_private.affiliate_bank_info(affiliate_id,phone,account_name,bank_name,account_number)
    values(r.id,p_phone,left(trim(p_account_name),120),left(trim(p_bank_name),120),left(trim(p_account_number),80))
    on conflict (affiliate_id) do update set phone=excluded.phone,account_name=excluded.account_name,bank_name=excluded.bank_name,account_number=excluded.account_number,updated_at=now();
  else
    insert into pa_private.affiliate_bank_info(affiliate_id,phone)
    values(r.id,p_phone)
    on conflict (affiliate_id) do update set phone=excluded.phone,updated_at=now();
  end if;
  return r;
end;
$$;
revoke all on function pa_private.apply_affiliate_application(text,text,text,text,text) from public, anon, authenticated;
grant execute on function pa_private.apply_affiliate_application(text,text,text,text,text) to authenticated;

create or replace function pa_private.claim_affiliate_welcome_email_outbox(p_limit integer default 10)
returns table(id uuid, affiliate_id uuid, user_id uuid, recipient_email text, affiliate_code text, commission_snapshot jsonb, attempts integer)
language sql security definer set search_path = '' as $$
  with candidates as (select o.id from pa_private.affiliate_welcome_email_outbox o where o.status='pending' and o.available_at <= now() order by o.created_at for update skip locked limit least(greatest(coalesce(p_limit,10),1),10))
  update pa_private.affiliate_welcome_email_outbox o set status='processing',claimed_at=now(),attempts=o.attempts+1 from candidates c where o.id=c.id
  returning o.id,o.affiliate_id,o.user_id,o.recipient_email,o.affiliate_code,o.commission_snapshot,o.attempts;
$$;
create or replace function pa_private.mark_affiliate_welcome_email_sent(p_id uuid) returns boolean language sql security definer set search_path='' as $$ update pa_private.affiliate_welcome_email_outbox set status='sent',sent_at=now(),last_error=null where id=p_id and status='processing' returning true; $$;
create or replace function pa_private.mark_affiliate_welcome_email_retry(p_id uuid,p_error text) returns boolean language sql security definer set search_path='' as $$ update pa_private.affiliate_welcome_email_outbox set status='pending',available_at=now()+least(interval '1 hour',interval '1 minute'*power(2,least(attempts,6))),last_error=left(coalesce(p_error,'retryable delivery failure'),500) where id=p_id and status='processing' returning true; $$;
create or replace function pa_private.mark_affiliate_welcome_email_failed(p_id uuid,p_error text) returns boolean language sql security definer set search_path='' as $$ update pa_private.affiliate_welcome_email_outbox set status='failed',last_error=left(coalesce(p_error,'permanent delivery failure'),500) where id=p_id and status='processing' returning true; $$;
revoke all on function pa_private.claim_affiliate_welcome_email_outbox(integer),pa_private.mark_affiliate_welcome_email_sent(uuid),pa_private.mark_affiliate_welcome_email_retry(uuid,text),pa_private.mark_affiliate_welcome_email_failed(uuid,text) from public,anon,authenticated;
grant execute on function pa_private.claim_affiliate_welcome_email_outbox(integer),pa_private.mark_affiliate_welcome_email_sent(uuid),pa_private.mark_affiliate_welcome_email_retry(uuid,text),pa_private.mark_affiliate_welcome_email_failed(uuid,text) to service_role;

create or replace function public.claim_affiliate_welcome_email_outbox(p_limit integer default 10) returns table(id uuid,affiliate_id uuid,user_id uuid,recipient_email text,affiliate_code text,commission_snapshot jsonb,attempts integer) language sql security invoker set search_path='' as $$ select * from pa_private.claim_affiliate_welcome_email_outbox(p_limit); $$;
create or replace function public.mark_affiliate_welcome_email_sent(p_id uuid) returns boolean language sql security invoker set search_path='' as $$ select pa_private.mark_affiliate_welcome_email_sent(p_id); $$;
create or replace function public.mark_affiliate_welcome_email_retry(p_id uuid,p_error text) returns boolean language sql security invoker set search_path='' as $$ select pa_private.mark_affiliate_welcome_email_retry(p_id,p_error); $$;
create or replace function public.mark_affiliate_welcome_email_failed(p_id uuid,p_error text) returns boolean language sql security invoker set search_path='' as $$ select pa_private.mark_affiliate_welcome_email_failed(p_id,p_error); $$;
revoke all on function public.claim_affiliate_welcome_email_outbox(integer),public.mark_affiliate_welcome_email_sent(uuid),public.mark_affiliate_welcome_email_retry(uuid,text),public.mark_affiliate_welcome_email_failed(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_affiliate_welcome_email_outbox(integer),public.mark_affiliate_welcome_email_sent(uuid),public.mark_affiliate_welcome_email_retry(uuid,text),public.mark_affiliate_welcome_email_failed(uuid,text) to service_role;
