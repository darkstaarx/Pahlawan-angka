-- Free: demo only. premium = Akses Keluarga (RM19), family_plus = Family Plus (RM29).
-- Lifetime purchases use active status and a null current_period_end.
create schema if not exists pa_private;
revoke all on schema pa_private from public, anon;
grant usage on schema pa_private to authenticated;
alter table public.family_subscriptions add column if not exists extra_profile_slots integer not null default 0 check(extra_profile_slots between 0 and 100);
alter table public.family_subscriptions enable row level security;
alter table public.app_user_roles enable row level security;
revoke insert,update,delete,truncate,references,trigger on public.family_subscriptions,public.app_user_roles from anon,authenticated;
grant select on public.family_subscriptions,public.app_user_roles to authenticated;

create or replace function public.get_commercial_access()
returns table(role text,plan text,status text,current_period_end timestamptz,profile_limit integer)
language sql security invoker set search_path='' stable as $$
  select coalesce(r.role,'guardian'),
    case when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then s.plan else 'free' end,
    case when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then s.status else 'inactive' end,
    s.current_period_end,
    case when r.role='admin' then 100
      when s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()) then
        case s.plan when 'family_plus' then 5+s.extra_profile_slots when 'premium' then 2+s.extra_profile_slots else 0 end
      else 0 end
  from (select auth.uid() as uid) u
  left join public.app_user_roles r on r.user_id=u.uid
  left join public.families f on f.owner_user_id=u.uid
  left join public.family_subscriptions s on s.family_id=f.id;
$$;
revoke all on function public.get_commercial_access() from public,anon;
grant execute on function public.get_commercial_access() to authenticated;

create or replace function pa_private.has_paid_access()
returns boolean language sql security invoker set search_path='' stable as $$
  select exists(select 1 from public.get_commercial_access() a
    where a.role='admin' or (a.plan in ('premium','family_plus') and a.status in ('active','trialing')));
$$;
revoke all on function pa_private.has_paid_access() from public,anon;
grant execute on function pa_private.has_paid_access() to authenticated;

create or replace function public.get_feature_access()
returns jsonb language sql security invoker set search_path='' stable as $$
  select jsonb_build_object('plan',a.plan,'profile_limit',a.profile_limit,'demo',true,
    'missions',a.role='admin' or a.plan in ('premium','family_plus'),
    'progress',a.role='admin' or a.plan in ('premium','family_plus'),
    'focus',a.role='admin' or a.plan='family_plus',
    'report',a.role='admin' or a.plan='family_plus',
    'worksheet',a.role='admin' or a.plan='family_plus') from public.get_commercial_access() a;
$$;
revoke all on function public.get_feature_access() from public,anon;
grant execute on function public.get_feature_access() to authenticated;

-- Serialize profile creation/reactivation, including concurrent requests.
-- Invoker preserves ownership RLS; row lock is on the caller's family.
create or replace function pa_private.enforce_profile_access()
returns trigger language plpgsql security invoker set search_path='' as $$
declare lim integer; owner_id uuid; existing_count integer;
begin
  if auth.uid() is null then return new; end if;
  if tg_op='UPDATE' and new.family_id<>old.family_id then raise exception 'Profile family cannot be changed' using errcode='42501'; end if;
  if not new.is_active then return new; end if;
  if tg_op='UPDATE' and old.is_active then return new; end if;
  select owner_user_id into owner_id from public.families where id=new.family_id for update;
  if owner_id is distinct from auth.uid() then raise exception 'Family ownership required' using errcode='42501'; end if;
  select profile_limit into lim from public.get_commercial_access();
  select count(*) into existing_count from public.child_profiles where family_id=new.family_id and is_active and id<>new.id;
  if coalesce(lim,0)=0 or existing_count>=lim then raise exception 'Paid profile limit reached' using errcode='42501'; end if;
  return new;
end;
$$;
revoke all on function pa_private.enforce_profile_access() from public,anon,authenticated;
drop trigger if exists enforce_profile_access on public.child_profiles;
create trigger enforce_profile_access before insert or update on public.child_profiles for each row execute function pa_private.enforce_profile_access();

-- Restrictive policies supplement existing ownership policies; keep old data readable.
do $$
declare t text;
begin
  foreach t in array array['game_saves','learning_attempts','inventory_items','play_sessions','daily_play_totals','player_rankings','qsv2_pilot_events','qsv2_shadow_events'] loop
    execute format('drop policy if exists paid_insert_access on public.%I',t);
    execute format('create policy paid_insert_access on public.%I as restrictive for insert to authenticated with check ((select pa_private.has_paid_access()))',t);
    execute format('drop policy if exists paid_update_access on public.%I',t);
    execute format('create policy paid_update_access on public.%I as restrictive for update to authenticated using ((select pa_private.has_paid_access())) with check ((select pa_private.has_paid_access()))',t);
  end loop;
end $$;
