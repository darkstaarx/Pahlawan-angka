create table public.qsv2_shadow_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null unique,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  event_schema smallint not null default 1 check (event_schema = 1),
  app_version text not null check (char_length(app_version) between 1 and 32),
  source_hash text null check (source_hash is null or char_length(source_hash) <= 128),
  mode text not null default 'shadow' check (mode = 'shadow'),
  outcome text not null check (outcome in ('generated','fallback','error')),
  reason text not null check (reason in ('ok','runtime_missing','no_template','generator_missing','exception')),
  generation_ms integer not null check (generation_ms between 0 and 60000),
  standard_id text null check (standard_id is null or char_length(standard_id) <= 64),
  competency_id text null check (competency_id is null or char_length(competency_id) <= 128),
  template_id text null check (template_id is null or char_length(template_id) <= 160),
  fingerprint text null check (fingerprint is null or char_length(fingerprint) <= 160),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index qsv2_shadow_events_occurred_at_idx on public.qsv2_shadow_events (occurred_at desc);
create index qsv2_shadow_events_child_id_idx on public.qsv2_shadow_events (child_id);
create index qsv2_shadow_events_competency_idx on public.qsv2_shadow_events (competency_id, occurred_at desc);
create index qsv2_shadow_events_outcome_idx on public.qsv2_shadow_events (outcome, occurred_at desc);
alter table public.qsv2_shadow_events enable row level security;
revoke all on table public.qsv2_shadow_events from anon, authenticated;
grant insert, select on table public.qsv2_shadow_events to authenticated;
create policy qsv2_shadow_events_insert_family on public.qsv2_shadow_events for insert to authenticated with check (exists (select 1 from public.child_profiles c join public.families f on f.id=c.family_id where c.id=qsv2_shadow_events.child_id and f.owner_user_id=(select auth.uid())));
create policy qsv2_shadow_events_select_admin on public.qsv2_shadow_events for select to authenticated using (exists (select 1 from public.app_user_roles r where r.user_id=(select auth.uid()) and r.role='admin'));
