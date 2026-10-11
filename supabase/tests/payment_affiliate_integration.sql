begin;
insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000091','pa-affiliate-test@example.invalid'),
('00000000-0000-4000-8000-000000000092','pa-buyer-test@example.invalid'),
('00000000-0000-4000-8000-000000000093','pa-admin-test@example.invalid');
insert into public.app_user_roles(user_id,role) values('00000000-0000-4000-8000-000000000093','admin') on conflict(user_id) do update set role='admin';
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000091',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select public.apply_affiliate_application('Test Affiliate','0123456789','Test Affiliate','Test Bank','1234567890');
do $$ begin
 begin perform public.admin_set_affiliate_approval((select id from public.affiliate_applications where user_id=auth.uid()),true,'TESTAFF');raise exception 'self approval accepted'; exception when insufficient_privilege then null;end;
 begin insert into public.payment_orders(external_uuid,user_id,family_id,plan,catalog_version,catalog_snapshot,amount_cents) values(gen_random_uuid(),auth.uid(),(select id from public.families where owner_user_id=auth.uid()),'premium',1,'{}',1);raise exception 'browser order write accepted'; exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000093',true);
set local role authenticated;
select public.admin_set_affiliate_approval((select id from public.affiliate_applications where display_name='Test Affiliate'),true,'TESTAFF');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000092',true);
set local role authenticated;
do $$ declare o public.payment_orders;begin
 o:=public.create_payment_order('premium','00000000-0000-4000-8000-000000000094','TESTAFF',1900);
 if o.amount_cents<>1900 or o.affiliate_id is null or (o.catalog_snapshot->>'commission_cents')::int<>900 then raise exception 'order snapshot/referral wrong';end if;
 perform public.create_payment_order('family_plus','00000000-0000-4000-8000-000000000095','TESTAFF',2900);
 if not public.claim_payment_bill(o.id) or public.claim_payment_bill(o.id) then raise exception 'bill claim not exclusive';end if;
 if exists(select 1 from public.affiliate_applications where user_id='00000000-0000-4000-8000-000000000091') then raise exception 'foreign affiliate visible';end if;
end $$;
reset role;
update public.payment_orders set billcode='testbill092' where external_uuid='00000000-0000-4000-8000-000000000095';
update public.payment_orders set billcode='testbill091' where external_uuid='00000000-0000-4000-8000-000000000094';
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
do $$ begin
 if public.complete_payment('testbill091','testref091','1',1800,'{}') then raise exception 'wrong amount accepted';end if;
 if not public.complete_payment('testbill091','testref091','1',1900,'{}') or not public.complete_payment('testbill091','testref091','1',1900,'{}') then raise exception 'completion failed';end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.affiliate_commissions where order_id=(select id from public.payment_orders where billcode='testbill091'))<>1 then raise exception 'duplicate commission';end if;
 if (select amount_cents from public.affiliate_commissions where order_id=(select id from public.payment_orders where billcode='testbill091'))<>900 then raise exception 'commission amount wrong';end if;
 if exists(select 1 from public.family_subscriptions where family_id=(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000092') and current_period_end is not null) then raise exception 'Lifetime expiry retained';end if;
 if (select plan from public.family_subscriptions where family_id=(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000092'))<>'premium' then raise exception 'entitlement not activated';end if;
end $$;
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
select public.complete_payment('testbill092','testref092','1',2900,'{}');
select public.complete_payment('testbill091','testref091','1',1900,'{}');
reset role;
do $$ begin
 if (select plan from public.family_subscriptions where family_id=(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000092'))<>'family_plus' then raise exception 'Plus downgraded';end if;
 if (select amount_cents from public.affiliate_commissions where order_id=(select id from public.payment_orders where billcode='testbill092'))<>1500 then raise exception 'Plus commission wrong';end if;
end $$;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000093',true);
set local role authenticated;
select public.admin_mark_commission_paid((select id from public.affiliate_commissions where order_id=(select id from public.payment_orders where billcode='testbill091')),'BANK TEST REF');
reset role;
select 'PASS auth restrictions, referral snapshot, exclusive bill claim, verified completion, idempotency and manual payout' as verification;
rollback;
