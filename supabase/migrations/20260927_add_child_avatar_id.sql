-- Child avatars are intentionally independent from hero_id: hero_id remains the
-- battle/companion selection used by combat rendering.
alter table if exists public.child_profiles
  add column if not exists avatar_id text;

alter table if exists public.child_profiles
  alter column avatar_id set default 'avatar-01';

update public.child_profiles
set avatar_id='avatar-01'
where avatar_id is null;

-- Keep older rows valid while allowing the client to use a nullable column on
-- installations that have not yet backfilled all data.
comment on column public.child_profiles.avatar_id is 'Pupil profile avatar asset id; defaults to avatar-01 and is separate from hero_id.';

-- New clients call this additive overload. The existing three-argument RPC is
-- deliberately left intact for older clients and the web client retries it if
-- this overload is not deployed yet.
create or replace function public.create_initial_child(
  child_display_name text,
  child_grade integer,
  child_hero_id text,
  child_avatar_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  family_id uuid;
  child_id uuid;
begin
  select id into family_id from public.families where owner_user_id=auth.uid() limit 1;
  if family_id is null then raise exception 'Family profile not found'; end if;
  insert into public.child_profiles(family_id,display_name,grade,hero_id,avatar_id,is_active)
  values(family_id,child_display_name,child_grade,coalesce(child_hero_id,'wira'),coalesce(child_avatar_id,'avatar-01'),true)
  returning id into child_id;
  return child_id;
end;
$$;

revoke all on function public.create_initial_child(text,integer,text,text) from public;
grant execute on function public.create_initial_child(text,integer,text,text) to authenticated;
