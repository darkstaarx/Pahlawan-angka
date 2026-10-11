begin;
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000079','pa-mission-test@example.invalid');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000079',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
do $$ declare fid uuid; child uuid;begin
 if (public.get_feature_access()->>'profile_limit')::int<>1 then raise exception 'Free profile limit wrong';end if;
 select id into fid from public.families where owner_user_id=auth.uid();
 insert into public.child_profiles(family_id,display_name,grade) values(fid,'Free child',1) returning id into child;
 insert into public.game_saves(child_id) values(child);
 begin insert into public.child_profiles(family_id,display_name,grade) values(fid,'Second child',1);raise exception 'Second free profile allowed';exception when insufficient_privilege then null;end;
 if not (public.claim_daily_mission()->>'allowed')::boolean then raise exception 'First free mission denied';end if;
 if (public.claim_daily_mission()->>'allowed')::boolean then raise exception 'Second free mission allowed';end if;
 begin perform public.claim_worksheet_download();raise exception 'Free worksheet allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
insert into public.family_subscriptions(family_id,plan,status) select id,'premium','active' from public.families where owner_user_id='00000000-0000-4000-8000-000000000079';
set local role authenticated;
do $$ begin
 if not (public.claim_daily_mission()->>'allowed')::boolean or not (public.claim_daily_mission()->>'allowed')::boolean then raise exception 'Paid unlimited missions denied';end if;
 if not (public.claim_worksheet_download()->>'allowed')::boolean or (public.claim_worksheet_download()->>'allowed')::boolean then raise exception 'Standard worksheet quota wrong';end if;
end $$;
reset role;
update public.family_subscriptions set plan='family_plus' where family_id in(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000079');
set local role authenticated;
do $$ begin
 if not (public.claim_worksheet_download()->>'allowed')::boolean or not (public.claim_worksheet_download()->>'allowed')::boolean then raise exception 'Plus unlimited worksheets denied';end if;
end $$;
reset role;
select 'PASS free: 1 profile/mission, paid: unlimited missions, standard: 1 worksheet, plus: unlimited' as verification;
rollback;
