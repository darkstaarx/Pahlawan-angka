-- Phase 5 (docs/PA-DIAGNOSTIC-BRAIN.md §8a "Phase 5: what already exists").
-- 1) learning_attempts.facets: the diagnostic brain's own short record of one answer
--    (PADiagnostic.cloudFacets in js/engine/diagnostic-brain-v1.js). Brain categories and
--    numbers only: operation, context, format, operands, the wrong number. Never question
--    text, names or free text. Covered by the current Privacy Notice (owner, 2026-10-24).
-- 2) admin_calibration_rows(): admin-only read for admin/kalibrasi.html, which rebuilds
--    each child's log and runs the same PADiagnostic.analyze(). Children are pseudonymous
--    (a hash), no names, no family or account ids.

alter table public.learning_attempts
  add column if not exists facets jsonb null;

alter table public.learning_attempts
  drop constraint if exists learning_attempts_facets_shape;
alter table public.learning_attempts
  add constraint learning_attempts_facets_shape check (
    facets is null or (jsonb_typeof(facets) = 'object' and pg_column_size(facets) <= 2048)
  );

comment on column public.learning_attempts.facets is
  'Diagnostic brain record of this answer (short keys as db.diagLog; wv = wrong value, numbers only; rt = later try). No question text.';

grant insert (facets) on table public.learning_attempts to authenticated;

create or replace function pa_private.admin_calibration_rows(p_days integer default 90)
returns jsonb language plpgsql security definer set search_path = '' stable
as $$
declare v_days integer := least(greatest(coalesce(p_days, 90), 1), 180);
declare v_result jsonb;
begin
  if not exists (select 1 from public.app_user_roles r where r.user_id = (select auth.uid()) and r.role = 'admin') then
    raise exception 'Admin required' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'generated_at', now(),
    'days', v_days,
    'rows', coalesce(jsonb_agg(jsonb_build_object(
      'c', substr(md5(a.child_id::text || ':pa-calibration'), 1, 10),
      'mine', (f.owner_user_id = (select auth.uid())),
      'g', a.grade,
      's', a.skill_id,
      'q', a.question_id,
      'k', a.is_correct,
      'h', a.used_hint,
      'ms', a.response_ms,
      'b', a.battle_type,
      'm', a.misconception_tag,
      't', (extract(epoch from a.occurred_at) * 1000)::bigint,
      'f', a.facets
    ) order by a.occurred_at, a.id), '[]'::jsonb)
  ) into v_result
  from (
    select * from public.learning_attempts
    where occurred_at >= now() - make_interval(days => v_days)
    order by occurred_at desc
    limit 40000
  ) a
  join public.child_profiles c on c.id = a.child_id
  join public.families f on f.id = c.family_id;
  return v_result;
end;
$$;
revoke all on function pa_private.admin_calibration_rows(integer) from public, anon, authenticated;
grant execute on function pa_private.admin_calibration_rows(integer) to authenticated;

create or replace function public.admin_calibration_rows(p_days integer default 90)
returns jsonb language sql security invoker set search_path = ''
as $$ select pa_private.admin_calibration_rows(p_days); $$;
revoke all on function public.admin_calibration_rows(integer) from public, anon, authenticated;
grant execute on function public.admin_calibration_rows(integer) to authenticated;
