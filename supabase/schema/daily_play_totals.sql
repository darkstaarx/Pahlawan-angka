-- One compact timer summary per child per local calendar day.
-- Applied to the production Supabase project with legacy play_sessions backfilled.
create table if not exists public.daily_play_totals (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  play_date date not null,
  active_seconds integer not null default 0 check (active_seconds >= 0),
  last_sync_reason text,
  updated_at timestamptz not null default now(),
  primary key (child_id, play_date)
);

alter table public.daily_play_totals enable row level security;

revoke all on table public.daily_play_totals from anon, authenticated;
grant select, insert, update on table public.daily_play_totals to authenticated;

drop policy if exists "daily_play_totals_family_select" on public.daily_play_totals;
create policy "daily_play_totals_family_select"
on public.daily_play_totals
for select
to authenticated
using (
  exists (
    select 1
    from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = daily_play_totals.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "daily_play_totals_family_insert" on public.daily_play_totals;
create policy "daily_play_totals_family_insert"
on public.daily_play_totals
for insert
to authenticated
with check (
  exists (
    select 1
    from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = daily_play_totals.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "daily_play_totals_family_update" on public.daily_play_totals;
create policy "daily_play_totals_family_update"
on public.daily_play_totals
for update
to authenticated
using (
  exists (
    select 1
    from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = daily_play_totals.child_id
      and f.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = daily_play_totals.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

insert into public.daily_play_totals (
  child_id,
  play_date,
  active_seconds,
  last_sync_reason,
  updated_at
)
select
  child_id,
  (started_at at time zone 'Asia/Kuala_Lumpur')::date,
  sum(active_seconds)::integer,
  'legacy_backfill',
  now()
from public.play_sessions
group by child_id, (started_at at time zone 'Asia/Kuala_Lumpur')::date
on conflict (child_id, play_date) do update
set active_seconds = greatest(
      public.daily_play_totals.active_seconds,
      excluded.active_seconds
    ),
    last_sync_reason = 'legacy_backfill',
    updated_at = now();
