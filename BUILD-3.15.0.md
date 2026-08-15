# Pahlawan Angka v3.15.0

## Supabase cloud foundation

- Replaced the demo-first login surface with guardian email/password authentication.
- Added local-first cloud saves and automatic migration of an existing device save into the guardian's first child profile.
- Added child profile switching without requiring child email accounts.
- Added learning-attempt sync and versioned save snapshots.
- Added active play-session tracking that ignores background time.
- Added a visible elapsed-time counter, guardian daily/session limits, and an optional hard lock.
- Added a parent wellbeing panel and a child-friendly rest screen.
- Pinned `@supabase/supabase-js` to v2.111.0 and used only the public publishable key in the browser.

## Security model

- Parent authentication owns all family data through RLS.
- Competitive ranking remains server-authoritative and cannot be written by the browser.
- Local saves remain available if cloud loading fails.
