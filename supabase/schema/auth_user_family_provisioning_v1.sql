-- Ensure every Auth identity (email or OAuth) has an account and family.
create or replace function public.provision_family_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.families (owner_user_id)
  values (new.id)
  on conflict (owner_user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.provision_family_for_auth_user() from public;

drop trigger if exists provision_family_after_auth_signup on auth.users;
create trigger provision_family_after_auth_signup
after insert on auth.users
for each row execute function public.provision_family_for_auth_user();

insert into public.accounts (user_id)
select u.id from auth.users u
left join public.accounts a on a.user_id=u.id
where a.user_id is null
on conflict (user_id) do nothing;

insert into public.families (owner_user_id)
select u.id from auth.users u
left join public.families f on f.owner_user_id=u.id
where f.owner_user_id is null
on conflict (owner_user_id) do nothing;
