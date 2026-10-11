create or replace function pa_private.get_daily_mission_access()
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();a record;fid uuid;day_key date:=(now() at time zone 'Asia/Kuala_Lumpur')::date;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into a from public.get_commercial_access();
 if a.role='admin' or a.plan in ('premium','family_plus') then return jsonb_build_object('allowed',true,'unlimited',true,'day',day_key);end if;
 select id into fid from public.families where owner_user_id=uid;
 return jsonb_build_object('allowed',not exists(select 1 from pa_private.mission_daily_usage where family_id=fid and mission_day=day_key),'unlimited',false,'day',day_key);
end;$$;
revoke all on function pa_private.get_daily_mission_access() from public,anon;
grant execute on function pa_private.get_daily_mission_access() to authenticated;
create or replace function public.get_daily_mission_access() returns jsonb language sql security invoker set search_path='' as $$select pa_private.get_daily_mission_access();$$;
revoke all on function public.get_daily_mission_access() from public,anon;
grant execute on function public.get_daily_mission_access() to authenticated;
