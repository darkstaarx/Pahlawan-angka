# Demo funnel tracking

Counts anonymous browser sessions (30 minutes of inactivity), **not exact unique people**. Reloads and repeat demos within a session count once per stage. Storage-blocked browsers may count more than once. DNT/GPC and network failures can undercount. Data is client-reported and may include bots; it is not billing or academic evidence.

Events: `website_visit`, `demo_open`, `demo_start` (first question rendered), `demo_complete` (successful result, not a technical failure). Only the guest demo emits game stages. No grade, identity, answers, scores, auth IDs, IP column, full URL or fbclid is sent in the application payload. The hosting/database providers still process ordinary request metadata.

UTM source, medium, campaign and content are preserved for the session. Without valid UTMs attribution remains unknown. No Meta Pixel is installed by this change; these metrics do not populate Meta Ads Manager landing-page-view reporting.

`?pa_tracking_test=1` marks QA data. Local/preview hosts are always QA. Always exclude `is_test` from reporting. Public roles can insert only bounded event fields; they cannot read, update or delete rows or set server timestamps. The primary key deduplicates sessions/stages. No service secret is in the browser.

## Admin reporting (Malaysia time)

```sql
select (created_at at time zone 'Asia/Kuala_Lumpur')::date as day_myt,
       event_name, count(distinct session_id) as sessions
from public.demo_funnel_events
where not is_test
group by 1,2 order by 1,2;

-- Use a cohort window on website_visit; stages can happen after midnight.
with cohort as (
  select * from public.demo_funnel_events
  where event_name='website_visit' and not is_test
    and created_at >= timestamptz '2026-10-16 00:00:00+08'
    and created_at < timestamptz '2026-10-17 00:00:00+08'
)
select c.utm_source,c.utm_campaign,c.utm_content,
       count(distinct c.session_id) as visits,
       count(distinct e.session_id) filter(where e.event_name='demo_open') as opened,
       count(distinct e.session_id) filter(where e.event_name='demo_start') as started,
       count(distinct e.session_id) filter(where e.event_name='demo_complete') as completed
from cohort c left join public.demo_funnel_events e
  on e.session_id=c.session_id and not e.is_test
group by 1,2,3;
```

Retention recommendation: an administrator should remove rows older than 90 days. No recurring job or paid service was created. QA rows are deliberately retained with `is_test=true` for verification. Earlier demo usage cannot be recovered.

Verification: `node --test audit/demo-funnel.test.js audit/demo-session-behaviour.test.js audit/segel-result-lifecycle.test.js`.
