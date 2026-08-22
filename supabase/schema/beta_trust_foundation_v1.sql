-- Pahlawan Angka beta trust foundation v1.
-- Guardian consent records and privacy-minimised beta feedback.

create table if not exists public.guardian_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  privacy_version text not null check (char_length(privacy_version) between 1 and 30),
  terms_version text not null check (char_length(terms_version) between 1 and 30),
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.child_profiles(id) on delete set null,
  category text not null check (category in ('bug','confusing','content','suggestion','other')),
  message text not null check (char_length(message) between 10 and 2000),
  app_version text not null default 'unknown' check (char_length(app_version) between 1 and 30),
  screen text check (screen is null or char_length(screen) <= 50),
  client_context jsonb not null default '{}'::jsonb check (jsonb_typeof(client_context)='object'),
  status text not null default 'new' check (status in ('new','reviewing','resolved','closed')),
  created_at timestamptz not null default now()
);

alter table public.guardian_consents enable row level security;
alter table public.beta_feedback enable row level security;

grant select,insert,update on table public.guardian_consents to authenticated;
grant select,insert on table public.beta_feedback to authenticated;

drop policy if exists "guardian_consents_select_own" on public.guardian_consents;
create policy "guardian_consents_select_own" on public.guardian_consents for select to authenticated
using ((select auth.uid())=user_id);
drop policy if exists "guardian_consents_insert_own" on public.guardian_consents;
create policy "guardian_consents_insert_own" on public.guardian_consents for insert to authenticated
with check ((select auth.uid())=user_id);
drop policy if exists "guardian_consents_update_own" on public.guardian_consents;
create policy "guardian_consents_update_own" on public.guardian_consents for update to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists "beta_feedback_insert_own" on public.beta_feedback;
create policy "beta_feedback_insert_own" on public.beta_feedback for insert to authenticated
with check (
  (select auth.uid())=user_id and
  (child_id is null or exists(
    select 1 from public.child_profiles c join public.families f on f.id=c.family_id
    where c.id=child_id and f.owner_user_id=(select auth.uid())
  ))
);
drop policy if exists "beta_feedback_select_own_or_admin" on public.beta_feedback;
create policy "beta_feedback_select_own_or_admin" on public.beta_feedback for select to authenticated
using (
  (select auth.uid())=user_id or exists(
    select 1 from public.app_user_roles r
    where r.user_id=(select auth.uid()) and r.role='admin'
  )
);

create index if not exists beta_feedback_created_at_idx on public.beta_feedback(created_at desc);
create index if not exists beta_feedback_status_idx on public.beta_feedback(status,created_at desc);

comment on table public.guardian_consents is 'Versioned guardian acceptance of the privacy notice and beta terms.';
comment on table public.beta_feedback is 'Privacy-minimised guardian beta feedback. Never store child answers or question content here.';
