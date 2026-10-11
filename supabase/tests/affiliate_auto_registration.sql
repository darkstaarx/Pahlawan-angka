begin;

insert into auth.users(id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-4000-8000-000000000131', 'affiliate-auto@example.invalid', now(), '{}', '{}');
insert into auth.users(id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-4000-8000-000000000132', 'affiliate-pending@example.invalid', now(), '{}', '{}');
insert into auth.users(id, email, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-4000-8000-000000000133', 'affiliate-unconfirmed@example.invalid', '{}', '{}');
insert into public.affiliate_applications(user_id, display_name, status)
values ('00000000-0000-4000-8000-000000000132', 'Pending Wira', 'pending');

-- The RPC is verified-auth-only and must create exactly one auto-approved row.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000131', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000131","role":"authenticated","email_verified":true}', true);
set local role authenticated;
do $$
declare a public.affiliate_applications; b public.affiliate_applications;
begin
  select * into a from public.apply_affiliate_application('Wira Ujian','0123456789','','','');
  if a.status <> 'approved' or a.code is null or not a.approved_by_registration then raise exception 'registration was not auto-approved'; end if;
  select * into b from public.apply_affiliate_application('Wira Ujian','0123456789','Nama Akaun','Bank Ujian','123456');
  if b.id <> a.id or b.code <> a.code then raise exception 'duplicate registration changed identity/code'; end if;
  if (select count(*) from public.affiliate_applications where user_id=a.user_id) <> 1 then raise exception 'duplicate registration created row'; end if;
end $$;
reset role;

-- Trusted fixture inspection uses the SQL runner role.
do $$
declare a public.affiliate_applications; w pa_private.affiliate_welcome_email_outbox; b pa_private.affiliate_bank_info;
begin
  select * into a from public.affiliate_applications where user_id='00000000-0000-4000-8000-000000000131';
  select * into b from pa_private.affiliate_bank_info where affiliate_id=a.id;
  if b.phone <> '0123456789' or b.account_name <> 'Nama Akaun' then raise exception 'bank update snapshot mismatch'; end if;
  select * into w from pa_private.affiliate_welcome_email_outbox where affiliate_id=a.id;
  if w.id is null or w.recipient_email <> 'affiliate-auto@example.invalid' then raise exception 'welcome outbox snapshot missing'; end if;
  if (select count(*) from pa_private.affiliate_welcome_email_outbox where affiliate_id=a.id) <> 1 then raise exception 'welcome duplicated'; end if;
end $$;
reset role;

-- Existing pending registrations are upgraded safely and receive one welcome item.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000132', true);
set local role authenticated;
do $$
declare a public.affiliate_applications;
begin
  select * into a from public.apply_affiliate_application('Pending Wira','0123456788','','','');
  if a.status <> 'approved' or a.code is null then raise exception 'pending registration was not auto-approved'; end if;
end $$;
reset role;

do $$
declare a public.affiliate_applications; b pa_private.affiliate_bank_info;
begin
  select * into a from public.affiliate_applications where user_id='00000000-0000-4000-8000-000000000132';
  if (select count(*) from pa_private.affiliate_welcome_email_outbox where affiliate_id=a.id) <> 1 then raise exception 'pending registration welcome was not exactly once'; end if;
  select * into b from pa_private.affiliate_bank_info where affiliate_id=a.id;
  if b.phone is distinct from '0123456788' or b.account_name is not null or b.bank_name is not null or b.account_number is not null then raise exception 'phone-only signup did not preserve optional payout fields'; end if;
end $$;

-- Unconfirmed email and null phone are rejected by the definer function.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000131', true);
set local role authenticated;
do $$
begin
  begin
    perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000133', true);
    perform public.apply_affiliate_application('Unconfirmed', '0123456787','','','');
    raise exception 'unconfirmed email accepted';
  exception when others then if sqlstate <> '42501' then raise; end if; end;
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000131', true);
  begin perform public.apply_affiliate_application('Bad Phone', null,'','',''); raise exception 'null phone accepted';
  exception when others then if sqlstate <> 'P0001' or sqlerrm <> 'Valid phone required' then raise; end if; end;
end $$;
reset role;

-- A suspension is terminal for self-registration and the existing code remains stable.
-- Trusted fixture inspection uses the SQL runner role.
update public.affiliate_applications set status='suspended' where user_id='00000000-0000-4000-8000-000000000131';
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000131', true);
set local role authenticated;
do $$ begin
  begin perform public.apply_affiliate_application('Wira Ujian','0123456789','','',''); raise exception 'suspension was revived';
  exception when others then if sqlstate <> 'P0001' or sqlerrm <> 'Affiliate account suspended' then raise; end if; end;
end $$;
reset role;

-- Browser roles cannot claim or mutate the private welcome outbox.
set local role authenticated;
do $$
begin
  begin perform public.claim_affiliate_welcome_email_outbox(1); raise exception 'browser claimed welcome outbox';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$
begin
  if exists (select 1 from information_schema.role_table_grants where table_schema='pa_private' and table_name='affiliate_welcome_email_outbox' and grantee in ('anon','authenticated')) then raise exception 'browser can access welcome outbox'; end if;
  if not exists (select 1 from information_schema.role_table_grants where table_schema='pa_private' and table_name='affiliate_welcome_email_outbox' and grantee='service_role' and privilege_type='UPDATE') then raise exception 'service role cannot update welcome outbox'; end if;
end $$;

select 'PASS affiliate automatic registration and welcome outbox' as verification;
rollback;
