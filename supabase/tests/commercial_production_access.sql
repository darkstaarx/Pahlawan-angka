begin;
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000060','pa-access-test@example.invalid');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000060',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
do $$ begin
 if (public.get_feature_access()->>'missions')::boolean then raise exception 'Free mission granted'; end if;
 begin perform public.claim_worksheet_download(); raise exception 'Free worksheet allowed'; exception when insufficient_privilege then null; end;
 begin
  insert into public.child_profiles(family_id,display_name,grade) select id,'Audit',1 from public.families where owner_user_id=auth.uid();
  raise exception 'Free profile allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.app_user_roles set role='admin' where user_id=auth.uid();
  raise exception 'Self role upgrade allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.family_subscriptions(family_id,plan,status) select id,'premium','active' from public.families where owner_user_id='00000000-0000-4000-8000-000000000060';
set local role authenticated;
do $$ declare f uuid; child uuid; begin
 if (public.get_feature_access()->>'profile_limit')::int<>2 or not pa_private.has_paid_access() or not (public.get_feature_access()->>'worksheet')::boolean then raise exception 'Standard matrix failed'; end if;
 if not (public.claim_worksheet_download()->>'allowed')::boolean then raise exception 'First standard download denied'; end if;
 if (public.claim_worksheet_download()->>'allowed')::boolean then raise exception 'Second standard download allowed'; end if;
 select id into f from public.families where owner_user_id=auth.uid();
 insert into public.child_profiles(family_id,display_name,grade) values(f,'Audit 1',1) returning id into child;
 insert into public.child_profiles(family_id,display_name,grade) values(f,'Audit 2',1);
 insert into public.game_saves(child_id) values(child);
 begin
  insert into public.child_profiles(family_id,display_name,grade) values(f,'Audit 3',1);
  raise exception 'Third standard profile allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.family_subscriptions set plan='family_plus' where family_id=f;
  raise exception 'Self plan upgrade allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.family_subscriptions set plan='family_plus',extra_profile_slots=1 where family_id in(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000060');
set local role authenticated;
do $$ begin
 if (public.get_feature_access()->>'profile_limit')::int<>6 or not (public.get_feature_access()->>'worksheet')::boolean then raise exception 'Plus/addon matrix failed'; end if;
if not (public.claim_worksheet_download()->>'allowed')::boolean or not (public.claim_worksheet_download()->>'allowed')::boolean then raise exception 'Plus repeated download denied'; end if;
end $$;
reset role;
update public.family_subscriptions set current_period_end=now()-interval '1 day' where family_id in(select id from public.families where owner_user_id='00000000-0000-4000-8000-000000000060');
set local role authenticated;
do $$ declare affected integer; begin
 if pa_private.has_paid_access() then raise exception 'Expired plan granted'; end if;
 begin perform public.claim_worksheet_download(); raise exception 'Expired worksheet allowed'; exception when insufficient_privilege then null; end;
 update public.game_saves set coins=999 where child_id in(select id from public.child_profiles);
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Expired save write allowed'; end if;
end $$;
reset role;
select 'PASS: free/standard/plus/addon/expiry, save writes, self-upgrade denied' as verification;
rollback;
