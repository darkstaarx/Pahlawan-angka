-- Adaptive Learner Review v1 telemetry source contract.
--
-- LOCAL SOURCE ONLY: this file is not proof that the schema has been applied.
-- Client access is append-only (SELECT + INSERT). There are deliberately no
-- UPDATE or DELETE grants/policies. Privileged deletion remains possible for
-- account erasure, and child deletion cascades to all three tables.
--
-- Privacy boundary: never store child names, question/answer text, raw typed
-- answers, device fingerprints, IP addresses or user-agent strings here.

create table public.adaptive_question_exposures (
  id uuid primary key default gen_random_uuid(),
  client_exposure_id uuid not null,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  session_id uuid not null,
  decision_id uuid not null,
  schema_version smallint not null default 1 check (schema_version = 1),
  app_version text not null check (char_length(app_version) between 1 and 32),
  engine_version text not null check (char_length(engine_version) between 1 and 48),
  grade smallint not null check (grade between 1 and 6),
  skill_id text not null check (char_length(skill_id) between 1 and 96),
  subskill_id text null check (subskill_id is null or char_length(subskill_id) between 1 and 128),
  item_template_id text not null check (char_length(item_template_id) between 1 and 160),
  item_variant_hash text not null check (item_variant_hash ~ '^[a-f0-9]{16,128}$'),
  item_format text not null check (item_format in ('choice','typed','visual','word_problem','manipulative')),
  difficulty_band smallint not null check (difficulty_band between 1 and 5),
  selection_reason text not null check (selection_reason in (
    'baseline','practice','recovery','misconception_probe','independence_check',
    'transfer_check','spaced_review','mastery_check','challenge','balanced_fallback'
  )),
  selection_rank smallint null check (selection_rank is null or selection_rank between 1 and 50),
  target_misconception text null check (target_misconception is null or char_length(target_misconception) between 1 and 96),
  presented_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (child_id, client_exposure_id),
  unique (id, child_id)
);

create table public.adaptive_interaction_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null,
  exposure_id uuid not null,
  child_id uuid not null,
  schema_version smallint not null default 1 check (schema_version = 1),
  event_index smallint not null check (event_index between 1 and 100),
  event_type text not null check (event_type in (
    'answer_submitted','hint_requested','hint_shown','attention_prompt_shown',
    'answer_revised','encounter_abandoned'
  )),
  attempt_number smallint null check (attempt_number is null or attempt_number between 1 and 20),
  is_correct boolean null,
  response_slot smallint null check (response_slot is null or response_slot between 1 and 12),
  response_class text null check (response_class is null or char_length(response_class) between 1 and 64),
  error_tag text null check (error_tag is null or char_length(error_tag) between 1 and 96),
  hint_level smallint null check (hint_level is null or hint_level between 1 and 5),
  active_elapsed_ms integer not null check (active_elapsed_ms between 0 and 3600000),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (exposure_id, child_id)
    references public.adaptive_question_exposures(id, child_id) on delete cascade,
  unique (child_id, client_event_id),
  unique (exposure_id, event_index),
  check (
    (event_type in ('answer_submitted','answer_revised') and attempt_number is not null and is_correct is not null and hint_level is null)
    or
    (event_type in ('hint_requested','hint_shown') and hint_level is not null and attempt_number is null and is_correct is null and response_slot is null and response_class is null and error_tag is null)
    or
    (event_type in ('attention_prompt_shown','encounter_abandoned') and attempt_number is null and is_correct is null and response_slot is null and response_class is null and error_tag is null and hint_level is null)
  )
);

create table public.adaptive_encounter_outcomes (
  id uuid primary key default gen_random_uuid(),
  client_encounter_id uuid not null,
  exposure_id uuid not null,
  child_id uuid not null,
  schema_version smallint not null default 1 check (schema_version = 1),
  completion_status text not null check (completion_status in ('completed','abandoned','timed_out','interrupted')),
  attempt_count smallint not null check (attempt_count between 0 and 20),
  hint_count smallint not null check (hint_count between 0 and 20),
  max_hint_level smallint null check (max_hint_level is null or max_hint_level between 1 and 5),
  first_attempt_correct boolean null,
  final_correct boolean null,
  corrected_after_retry boolean not null default false,
  corrected_after_hint boolean not null default false,
  rapid_submission_count smallint not null default 0 check (rapid_submission_count between 0 and 20),
  focus_loss_count smallint not null default 0 check (focus_loss_count between 0 and 100),
  active_time_ms integer not null check (active_time_ms between 0 and 3600000),
  wall_time_ms integer not null check (wall_time_ms between 0 and 86400000),
  final_error_tag text null check (final_error_tag is null or char_length(final_error_tag) between 1 and 96),
  ended_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (exposure_id, child_id)
    references public.adaptive_question_exposures(id, child_id) on delete cascade,
  unique (child_id, client_encounter_id),
  unique (exposure_id),
  check (active_time_ms <= wall_time_ms),
  check (rapid_submission_count <= attempt_count),
  check ((hint_count = 0 and max_hint_level is null) or (hint_count > 0 and max_hint_level is not null)),
  check (not corrected_after_retry or (attempt_count >= 2 and final_correct = true)),
  check (not corrected_after_hint or (hint_count > 0 and final_correct = true)),
  check (first_attempt_correct is distinct from true or final_correct = true),
  check (
    (completion_status = 'completed' and attempt_count > 0 and first_attempt_correct is not null and final_correct is not null)
    or completion_status <> 'completed'
  )
);

create index adaptive_exposures_child_time_idx
  on public.adaptive_question_exposures (child_id, presented_at desc);
create index adaptive_exposures_child_skill_idx
  on public.adaptive_question_exposures (child_id, skill_id, presented_at desc);
create index adaptive_exposures_reason_idx
  on public.adaptive_question_exposures (selection_reason, presented_at desc);
create index adaptive_events_exposure_time_idx
  on public.adaptive_interaction_events (exposure_id, occurred_at);
create index adaptive_events_child_type_idx
  on public.adaptive_interaction_events (child_id, event_type, occurred_at desc);
create index adaptive_outcomes_child_time_idx
  on public.adaptive_encounter_outcomes (child_id, ended_at desc);
create index adaptive_outcomes_child_skill_join_idx
  on public.adaptive_encounter_outcomes (child_id, exposure_id);

alter table public.adaptive_question_exposures enable row level security;
alter table public.adaptive_interaction_events enable row level security;
alter table public.adaptive_encounter_outcomes enable row level security;

revoke all on table public.adaptive_question_exposures from anon, authenticated;
revoke all on table public.adaptive_interaction_events from anon, authenticated;
revoke all on table public.adaptive_encounter_outcomes from anon, authenticated;
grant select, insert on table public.adaptive_question_exposures to authenticated;
grant select, insert on table public.adaptive_interaction_events to authenticated;
grant select, insert on table public.adaptive_encounter_outcomes to authenticated;

create policy adaptive_exposures_insert_owned
on public.adaptive_question_exposures for insert to authenticated
with check (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_question_exposures.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

create policy adaptive_exposures_select_owned
on public.adaptive_question_exposures for select to authenticated
using (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_question_exposures.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

create policy adaptive_events_insert_owned
on public.adaptive_interaction_events for insert to authenticated
with check (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_interaction_events.child_id
      and f.owner_user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.adaptive_question_exposures x
    where x.id = adaptive_interaction_events.exposure_id
      and x.child_id = adaptive_interaction_events.child_id
  )
);

create policy adaptive_events_select_owned
on public.adaptive_interaction_events for select to authenticated
using (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_interaction_events.child_id
      and f.owner_user_id = (select auth.uid())
  )
);

create policy adaptive_outcomes_insert_owned
on public.adaptive_encounter_outcomes for insert to authenticated
with check (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_encounter_outcomes.child_id
      and f.owner_user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.adaptive_question_exposures x
    where x.id = adaptive_encounter_outcomes.exposure_id
      and x.child_id = adaptive_encounter_outcomes.child_id
  )
);

create policy adaptive_outcomes_select_owned
on public.adaptive_encounter_outcomes for select to authenticated
using (
  exists (
    select 1 from public.child_profiles c
    join public.families f on f.id = c.family_id
    where c.id = adaptive_encounter_outcomes.child_id
      and f.owner_user_id = (select auth.uid())
  )
);
