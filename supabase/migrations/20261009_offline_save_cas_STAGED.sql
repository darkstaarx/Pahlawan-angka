-- STAGED offline CAS migration: do not apply to production yet.
-- Direct upserts MUST be retired to enforce conflict safety.
begin;
alter table public.game_saves
  add column if not exists server_revision bigint not null default 0;

create or replace function public.save_game_snapshot_cas(
  p_child_id uuid,p_expected_revision bigint,p_state jsonb
)
returns table(saved boolean,server_revision bigint,reason text,remote_state jsonb)
language plpgsql security definer set search_path=''
as $$
declare v_revision bigint;v_remote jsonb;
begin
 if auth.uid() is null then
  raise exception 'Authentication required' using errcode='28000';
 end if;
 if not exists(
  select 1 from public.child_profiles cp
  join public.families f on cp.family_id=f.id
  where cp.id=p_child_id and cp.is_active and f.owner_user_id=auth.uid()
 ) then
  raise exception 'Child profile not authorized' using errcode='42501';
 end if;
 if p_expected_revision is null or p_expected_revision<0 or
    p_state is null or jsonb_typeof(p_state)<>'object' or
    coalesce(p_state->>'cloudChildId','')<>p_child_id::text then
  raise exception 'Invalid save payload' using errcode='22023';
 end if;

 -- An existing row can only be updated if the revision still matches.
 update public.game_saves gs set
   state=p_state,
   xp=greatest(0,coalesce((p_state->>'xp')::integer,0)),
   coins=greatest(0,coalesce((p_state->>'coins')::integer,0)),
   level=greatest(1,coalesce((p_state->>'level')::integer,1)),
   active_mission_chapter=p_state->>'activeMissionChapter',
   client_updated_at=clock_timestamp(),
   server_revision=gs.server_revision+1
 where gs.child_id=p_child_id and gs.server_revision=p_expected_revision
 returning gs.server_revision into v_revision;

 -- First-time row only; cannot recreate a missing row using a stale rev > 0.
 if v_revision is null and p_expected_revision=0 then
  insert into public.game_saves(
   child_id,schema_version,state,xp,coins,level,
   active_mission_chapter,client_updated_at,server_revision)
  values(
   p_child_id,1,p_state,
   greatest(0,coalesce((p_state->>'xp')::integer,0)),
   greatest(0,coalesce((p_state->>'coins')::integer,0)),
   greatest(1,coalesce((p_state->>'level')::integer,1)),
   p_state->>'activeMissionChapter',clock_timestamp(),1)
  on conflict(child_id) do nothing
  returning public.game_saves.server_revision into v_revision;
 end if;
 if v_revision is not null then
  return query select true,v_revision,'saved'::text,null::jsonb;
  return;
 end if;
 select gs.server_revision,gs.state into v_revision,v_remote
 from public.game_saves gs where gs.child_id=p_child_id;
 return query select false,coalesce(v_revision,0),'revision_conflict'::text,v_remote;
end;
$$;
revoke all on function public.save_game_snapshot_cas(uuid,bigint,jsonb) from public;
revoke all on function public.save_game_snapshot_cas(uuid,bigint,jsonb) from anon;
grant execute on function public.save_game_snapshot_cas(uuid,bigint,jsonb) to authenticated;

-- RELEASE MIGRATION STAGE 2 ONLY: Revoke direct writes after all deployed
-- clients have switched to RPC. Otherwise older app versions bypass CAS.
-- revoke insert,update on public.game_saves from authenticated;
commit;
