-- Pahlawan Angka commercial foundation v1.
-- Run in Supabase before deploying the v3.25.0 frontend.
create table if not exists public.app_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'guardian' check (role in ('guardian','admin')),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_subscriptions (
  family_id uuid primary key references public.families(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium','family_plus')),
  status text not null default 'inactive' check (status in ('inactive','trialing','active','past_due','cancelled','expired')),
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  updated_at timestamptz not null default now()
);

alter table public.app_user_roles enable row level security;
alter table public.family_subscriptions enable row level security;

grant select on table public.app_user_roles to authenticated;
grant select on table public.family_subscriptions to authenticated;

drop policy if exists "read own role" on public.app_user_roles;
create policy "read own role" on public.app_user_roles for select to authenticated using (user_id=auth.uid());

drop policy if exists "read own family subscription" on public.family_subscriptions;
create policy "read own family subscription" on public.family_subscriptions for select to authenticated using (
  exists(select 1 from public.families f where f.id=family_id and f.owner_user_id=auth.uid())
);

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

-- Production owner/admin. This must resolve to an existing Supabase Auth user.
do $$
declare admin_user_id uuid;
begin
  select id into admin_user_id
  from auth.users
  where lower(email)=lower('affierul@gmail.com')
  limit 1;

  if admin_user_id is null then
    raise exception 'Admin Auth user affierul@gmail.com was not found. Create or confirm the account, then rerun this migration.';
  end if;

  insert into public.app_user_roles(user_id,role)
  values(admin_user_id,'admin')
  on conflict(user_id) do update set role='admin',updated_at=now();
end $$;
