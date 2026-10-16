-- No identity, learning data or raw URL is accepted. Rows are private to admin SQL.
create table public.demo_funnel_events (
  session_id uuid not null,
  event_name text not null check (event_name in ('website_visit','demo_open','demo_start','demo_complete')),
  created_at timestamptz not null default now(),
  is_test boolean not null default false,
  utm_source text check (utm_source is null or length(utm_source) between 1 and 120),
  utm_medium text check (utm_medium is null or length(utm_medium) between 1 and 120),
  utm_campaign text check (utm_campaign is null or length(utm_campaign) between 1 and 120),
  utm_content text check (utm_content is null or length(utm_content) between 1 and 120),
  primary key (session_id,event_name)
);
alter table public.demo_funnel_events enable row level security;
revoke all on public.demo_funnel_events from anon, authenticated;
grant insert (session_id,event_name,is_test,utm_source,utm_medium,utm_campaign,utm_content) on public.demo_funnel_events to anon, authenticated;
create policy anonymous_funnel_insert on public.demo_funnel_events for insert to anon, authenticated with check (true);
create index demo_funnel_events_created_at_idx on public.demo_funnel_events(created_at);
comment on table public.demo_funnel_events is 'Unverified anonymous browser sessions, not unique people. Admin only reads. Exclude is_test. No child data. Purge after 90 days.';
