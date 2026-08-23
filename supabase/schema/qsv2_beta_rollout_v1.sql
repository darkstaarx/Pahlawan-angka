-- Pahlawan Angka QS v2 beta rollout control v1.
-- Production migration name: qsv2_beta_rollout_v1
-- Applied to project pxxekdeqlxwqwaqvfbnh before app deployment.
create table if not exists public.qsv2_rollout_config (
  rollout_key text primary key check (char_length(rollout_key) between 1 and 80),
  enabled boolean not null default false,
  audience text not null check (audience in ('consented_beta_guardians')),
  topic_id text not null check (char_length(topic_id) between 1 and 40),
  skill_id text not null check (char_length(skill_id) between 1 and 40),
  config_version integer not null default 1 check (config_version >= 1),
  updated_at timestamptz not null default now()
);
alter table public.qsv2_rollout_config enable row level security;
grant select on table public.qsv2_rollout_config to authenticated;
drop policy if exists "qsv2_rollout_config_select_authenticated" on public.qsv2_rollout_config;
create policy "qsv2_rollout_config_select_authenticated" on public.qsv2_rollout_config for select to authenticated using (true);
insert into public.qsv2_rollout_config (rollout_key,enabled,audience,topic_id,skill_id,config_version,updated_at)
values ('d3_topic7_beta_live',true,'consented_beta_guardians','D3.T7','D3.SHAPE',1,now())
on conflict (rollout_key) do update set enabled=excluded.enabled,audience=excluded.audience,topic_id=excluded.topic_id,skill_id=excluded.skill_id,config_version=excluded.config_version,updated_at=now();
comment on table public.qsv2_rollout_config is 'Non-PII remote rollout flags for Question System v2 beta features. Disable enabled to fail closed to SHADOW/legacy.';
