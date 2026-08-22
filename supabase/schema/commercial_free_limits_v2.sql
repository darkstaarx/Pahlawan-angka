-- Pahlawan Angka commercial limits v2.
-- Free: 1 child profile. Premium: 2. Family Plus: 5.
create or replace function public.get_commercial_access()
returns table(role text,plan text,status text,current_period_end timestamptz,profile_limit integer)
language sql security invoker set search_path=public stable
as $$
  select coalesce(r.role,'guardian'),coalesce(s.plan,'free'),coalesce(s.status,'inactive'),s.current_period_end,
    case
      when coalesce(s.status,'inactive') in ('active','trialing') and s.plan='family_plus' then 5
      when coalesce(s.status,'inactive') in ('active','trialing') and s.plan='premium' then 2
      else 1
    end
  from (select auth.uid() as uid) u
  left join public.app_user_roles r on r.user_id=u.uid
  left join public.families f on f.owner_user_id=u.uid
  left join public.family_subscriptions s on s.family_id=f.id;
$$;

revoke all on function public.get_commercial_access() from public;
grant execute on function public.get_commercial_access() to authenticated;
