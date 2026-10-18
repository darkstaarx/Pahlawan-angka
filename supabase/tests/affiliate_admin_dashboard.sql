begin;

insert into auth.users(id,email) values
  ('00000000-0000-4000-8000-000000000199','affiliate-admin@example.invalid'),
  ('00000000-0000-4000-8000-000000000198','affiliate-owner@example.invalid'),
  ('00000000-0000-4000-8000-000000000197','affiliate-buyer@example.invalid')
on conflict (id) do nothing;
insert into public.app_user_roles(user_id,role) values ('00000000-0000-4000-8000-000000000199','admin') on conflict (user_id) do update set role='admin';
insert into public.affiliate_applications(id,user_id,status,code,display_name) values ('00000000-0000-4000-8000-000000000195','00000000-0000-4000-8000-000000000198','approved','BATCHTEST','Batch Test') on conflict (id) do nothing;
insert into pa_private.affiliate_bank_info(affiliate_id,phone,account_name,bank_name,account_number) values ('00000000-0000-4000-8000-000000000195','0123456789','Batch Test','Test Bank','999999') on conflict (affiliate_id) do nothing;
insert into public.payment_orders(id,external_uuid,user_id,family_id,plan,catalog_version,catalog_snapshot,amount_cents,status,billcode,paid_at,affiliate_id)
values
 ('00000000-0000-4000-8000-000000000194','00000000-0000-4000-8000-000000000193','00000000-0000-4000-8000-000000000197',(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000197'),'premium',1,'{"commission_cents":900}',1900,'paid','batch-paid-a',now(),'00000000-0000-4000-8000-000000000195'),
 ('00000000-0000-4000-8000-000000000192','00000000-0000-4000-8000-000000000191','00000000-0000-4000-8000-000000000197',(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000197'),'premium',1,'{"commission_cents":900}',1900,'paid','batch-paid-b',now(),'00000000-0000-4000-8000-000000000195'),
 ('00000000-0000-4000-8000-000000000190','00000000-0000-4000-8000-000000000189','00000000-0000-4000-8000-000000000197',(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000197'),'premium',1,'{"commission_cents":900}',1900,'pending','batch-unpaid',null,'00000000-0000-4000-8000-000000000195')
on conflict (id) do nothing;
insert into public.affiliate_commissions(id,order_id,affiliate_id,amount_cents,status)
values
 ('00000000-0000-4000-8000-000000000188','00000000-0000-4000-8000-000000000194','00000000-0000-4000-8000-000000000195',900,'pending'),
 ('00000000-0000-4000-8000-000000000187','00000000-0000-4000-8000-000000000192','00000000-0000-4000-8000-000000000195',900,'approved'),
 ('00000000-0000-4000-8000-000000000186','00000000-0000-4000-8000-000000000190','00000000-0000-4000-8000-000000000195',900,'pending')
on conflict (id) do nothing;

select set_config('request.jwt.claim.role','anon',true);
set local role anon;
do $$ begin
  begin perform public.admin_affiliate_dashboard(); raise exception 'anon dashboard access accepted'; exception when insufficient_privilege then null; end;
  begin perform public.admin_record_affiliate_payout(null,null,null,null); raise exception 'anon payout accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000198',true);
set local role authenticated;
do $$ begin
  begin perform public.admin_affiliate_dashboard(); raise exception 'non-admin dashboard access accepted'; exception when insufficient_privilege then null; end;
  begin perform public.admin_record_affiliate_payout(null,null,null,null); raise exception 'non-admin payout accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000199',true);
set local role authenticated;
do $$ declare v jsonb; failed boolean; begin
  v:=public.admin_affiliate_dashboard();
  if jsonb_array_length(v->'affiliates')<1 or jsonb_array_length(v->'commissions')<3 then raise exception 'dashboard snapshot incomplete'; end if;
  if v::text like '%999999%' then raise exception 'bulk snapshot leaked account number'; end if;
  failed:=false; begin perform public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000195',array['00000000-0000-4000-8000-000000000188'::uuid,'00000000-0000-4000-8000-000000000188'::uuid],'REF-DUP',1800); exception when others then failed:=true; end; if not failed then raise exception 'duplicate IDs accepted'; end if;
  failed:=false; begin perform public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000195',array['00000000-0000-4000-8000-000000000188'::uuid,'00000000-0000-4000-8000-000000000186'::uuid],'REF-MIX',1800); exception when others then failed:=true; end; if not failed then raise exception 'unpaid order accepted'; end if;
  if (select status from public.affiliate_commissions where id='00000000-0000-4000-8000-000000000188')<>'pending' then raise exception 'mixed batch changed pending commission'; end if;
  failed:=false; begin perform public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000195',array['00000000-0000-4000-8000-000000000188'::uuid],'REF-WRONGSUM',1); exception when others then failed:=true; end; if not failed then raise exception 'wrong expected total accepted'; end if;
  failed:=false; begin perform public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000000',array['00000000-0000-4000-8000-000000000188'::uuid],'REF-WRONGOWNER',900); exception when others then failed:=true; end; if not failed then raise exception 'wrong affiliate accepted'; end if;
  if (public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000195',array['00000000-0000-4000-8000-000000000188'::uuid,'00000000-0000-4000-8000-000000000187'::uuid],'REF-OK',1800)->>'count')<>'2' then raise exception 'batch payout count wrong'; end if;
  if (select count(*) from public.affiliate_commissions where id in ('00000000-0000-4000-8000-000000000188','00000000-0000-4000-8000-000000000187') and status='paid')<>2 then raise exception 'batch payout did not mark both'; end if;
  failed:=false; begin perform public.admin_record_affiliate_payout('00000000-0000-4000-8000-000000000195',array['00000000-0000-4000-8000-000000000188'::uuid],'REF-AGAIN',900); exception when others then failed:=true; end; if not failed then raise exception 'already-paid accepted'; end if;
end $$;
reset role;

do $$ begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='admin_affiliate_dashboard' and pg_get_function_result(p.oid)='jsonb') then raise exception 'dashboard RPC contract missing'; end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='admin_record_affiliate_payout' and pg_get_function_result(p.oid)='jsonb') then raise exception 'batch payout RPC contract missing'; end if;
end $$;

select 'PASS affiliate admin dashboard access controls, snapshot, and atomic payout safeguards' as verification;
rollback;
