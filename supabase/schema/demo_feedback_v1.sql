-- Guest demo rating (1–5 stars) and optional comment, collected after the
-- free demo. Anonymous: no account, child, answers or URL. Browsers may only
-- insert; only admin SQL can read. One rating per anonymous funnel session.
create table if not exists public.demo_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) between 1 and 500),
  grade smallint check (grade is null or grade between 1 and 6),
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.demo_feedback enable row level security;
revoke all on public.demo_feedback from anon, authenticated;
grant insert (session_id, rating, comment, grade, is_test) on public.demo_feedback to anon, authenticated;
drop policy if exists anonymous_demo_feedback_insert on public.demo_feedback;
create policy anonymous_demo_feedback_insert on public.demo_feedback for insert to anon, authenticated with check (true);
create index if not exists demo_feedback_created_at_idx on public.demo_feedback(created_at);
comment on table public.demo_feedback is 'Anonymous guest demo ratings. Admin only reads. Exclude is_test.';

-- Handy summary for admin (run in SQL editor):
-- select count(*) as ratings, round(avg(rating),2) as average,
--        count(*) filter (where rating >= 4) as happy
-- from public.demo_feedback where not is_test;
