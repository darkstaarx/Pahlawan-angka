create or replace function public.get_feature_access() returns jsonb language sql security invoker set search_path='' stable as $$
 select jsonb_build_object('plan',a.plan,'profile_limit',a.profile_limit,'demo',true,
 'missions',auth.uid() is not null,'progress',auth.uid() is not null,'mission_daily_limit',case when a.role='admin' or a.plan in ('premium','family_plus') then null else 1 end,
 'focus',a.role='admin' or a.plan='family_plus','report',a.role='admin' or a.plan='family_plus',
 'worksheet',a.role='admin' or a.plan in ('premium','family_plus'),
 'worksheet_daily_limit',case when a.role='admin' or a.plan='family_plus' then null when a.plan='premium' then 1 else 0 end,
 'purchased_at',s.purchased_at,'new_features_until',case when a.plan='family_plus' then s.purchased_at+interval '2 months' else null end)
 from public.get_commercial_access() a left join public.families f on f.owner_user_id=auth.uid()
 left join public.family_subscriptions s on s.family_id=f.id;
$$;
revoke all on function public.get_feature_access() from public,anon;
grant execute on function public.get_feature_access() to authenticated;

