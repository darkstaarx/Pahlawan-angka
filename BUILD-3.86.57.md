# v3.86.57 — Remove the affiliate admin panel from Tetapan

- The admin-only "Semakan affiliate & bayaran manual" panel (Lulus / Tolak / Lihat bank) is no longer mounted in the parent Tetapan tab (`js/payment-affiliate-v1.js`). Its text was also unreadable on the dark theme. Affiliate review is done in Supabase.

## Data change (Supabase, not in this repo)
- affierul@gmail.com had the admin role but no `family_subscriptions` row, so `get_commercial_access()` returned plan 'free' and the app treated the account as unpaid (e.g. no Lapor Bug tab).
- Added Family Plus, active, no expiry, provider `manual`, ref `owner-grant`.
