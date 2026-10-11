-- One worksheet per guardian family per Malaysia calendar day; Plus unlimited.
create table if not exists pa_private.worksheet_daily_usage (
 family_id uuid not null references public.families(id) on delete cascade,
 download_day date not null, downloads integer not null check(downloads=1),
 created_at timestamptz not null default now(), primary key(family_id,download_day)
);
alter table pa_private.worksheet_daily_usage enable row level security;
revoke all on pa_private.worksheet_daily_usage from public,anon,authenticated;
create or replace function pa_private.claim_worksheet_download()
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); a record; fid uuid; claimed integer; day_key date:=(now() at time zone 'Asia/Kuala_Lumpur')::date;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into a from public.get_commercial_access();
 if a.role='admin' or a.plan='family_plus' then return jsonb_build_object('allowed',true,'unlimited',true,'day',day_key); end if;
 if a.plan<>'premium' or a.status not in ('active','trialing') then raise exception 'Paid worksheet access required' using errcode='42501'; end if;
 select id into fid from public.families where owner_user_id=uid;
 if fid is null then raise exception 'Family not found' using errcode='42501'; end if;
 insert into pa_private.worksheet_daily_usage(family_id,download_day,downloads) values(fid,day_key,1)
 on conflict(family_id,download_day) do nothing returning downloads into claimed;
 return jsonb_build_object('allowed',claimed is not null,'unlimited',false,'remaining',0,'day',day_key);
end;
$$;
revoke all on function pa_private.claim_worksheet_download() from public,anon;
grant execute on function pa_private.claim_worksheet_download() to authenticated;
create or replace function public.claim_worksheet_download()
returns jsonb language sql security invoker set search_path='' as $$ select pa_private.claim_worksheet_download(); $$;
revoke all on function public.claim_worksheet_download() from public,anon;
grant execute on function public.claim_worksheet_download() to authenticated;
-- Preserve purchase-window fields while changing worksheet entitlement.
create or replace function public.get_feature_access() returns jsonb language sql security invoker set search_path='' stable as $$
 select jsonb_build_object('plan',a.plan,'profile_limit',a.profile_limit,'demo',true,
 'missions',a.role='admin' or a.plan in ('premium','family_plus'),'progress',a.role='admin' or a.plan in ('premium','family_plus'),
 'focus',a.role='admin' or a.plan='family_plus','report',a.role='admin' or a.plan='family_plus',
 'worksheet',a.role='admin' or a.plan in ('premium','family_plus'),
 'worksheet_daily_limit',case when a.role='admin' or a.plan='family_plus' then null when a.plan='premium' then 1 else 0 end,
 'purchased_at',s.purchased_at,'new_features_until',case when a.plan='family_plus' then s.purchased_at+interval '2 months' else null end)
 from public.get_commercial_access() a left join public.families f on f.owner_user_id=auth.uid()
 left join public.family_subscriptions s on s.family_id=f.id;
$$;
revoke all on function public.get_feature_access() from public,anon;
grant execute on function public.get_feature_access() to authenticated;

-- Direct client access is denied; only the checked private function writes usage.
drop policy if exists deny_direct_worksheet_usage on pa_private.worksheet_daily_usage;
create policy deny_direct_worksheet_usage on pa_private.worksheet_daily_usage for all to authenticated using(false) with check(false);
