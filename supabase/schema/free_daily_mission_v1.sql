create or replace function public.get_commercial_access()
returns table(role text,plan text,status text,current_period_end timestamptz,profile_limit integer)
language sql security invoker set search_path='' stable as $$
  select coalesce(r.role,'guardian'),
    case when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then s.plan else 'free' end,
    case when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then s.status else 'inactive' end,
    s.current_period_end,
    case when r.role='admin' then 100
      when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then
        case s.plan when 'family_plus' then 5+s.extra_profile_slots when 'premium' then 2+s.extra_profile_slots else 1 end
      else 1 end
  from (select auth.uid() as uid) u
  left join public.app_user_roles r on r.user_id=u.uid
  left join public.families f on f.owner_user_id=u.uid
  left join public.family_subscriptions s on s.family_id=f.id;
$$;
revoke all on function public.get_commercial_access() from public,anon;
grant execute on function public.get_commercial_access() to authenticated;


create or replace function pa_private.has_paid_access() returns boolean language sql security invoker set search_path='' stable as $$
 select auth.uid() is not null and exists(select 1 from public.families where owner_user_id=auth.uid());
$$;
create table if not exists pa_private.mission_daily_usage(
 family_id uuid not null references public.families(id) on delete cascade,
 mission_day date not null, started_at timestamptz not null default now(),primary key(family_id,mission_day)
);
alter table pa_private.mission_daily_usage enable row level security;
revoke all on pa_private.mission_daily_usage from public,anon,authenticated;
create policy deny_direct_mission_usage on pa_private.mission_daily_usage for all to authenticated using(false) with check(false);
create or replace function pa_private.claim_daily_mission()
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();a record;fid uuid;claimed uuid;day_key date:=(now() at time zone 'Asia/Kuala_Lumpur')::date;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into a from public.get_commercial_access();
 if a.role='admin' or a.plan in ('premium','family_plus') then return jsonb_build_object('allowed',true,'unlimited',true,'day',day_key);end if;
 select id into fid from public.families where owner_user_id=uid;
 if fid is null or not exists(select 1 from public.child_profiles where family_id=fid and is_active) then raise exception 'Child profile required' using errcode='42501';end if;
 insert into pa_private.mission_daily_usage(family_id,mission_day) values(fid,day_key) on conflict do nothing returning family_id into claimed;
 return jsonb_build_object('allowed',claimed is not null,'unlimited',false,'day',day_key);
end;$$;
revoke all on function pa_private.claim_daily_mission() from public,anon;
grant execute on function pa_private.claim_daily_mission() to authenticated;
create or replace function public.claim_daily_mission() returns jsonb language sql security invoker set search_path='' as $$select pa_private.claim_daily_mission();$$;
revoke all on function public.claim_daily_mission() from public,anon;
grant execute on function public.claim_daily_mission() to authenticated;
