# Pahlawan Angka v3.25.0 — Commercial Foundation Phase 1

Base commit: `e8434b19caa314d262db8892d70b1ffb0ed54894`

## Deployment order

1. Run `supabase/schema/commercial_foundation_v1.sql` in Supabase SQL Editor.
2. The migration automatically assigns the existing Supabase Auth account `affierul@gmail.com` as `admin`.
3. Deploy the frontend patch.
4. Sign out and sign in again before testing DEV access.

If `affierul@gmail.com` does not yet exist in Supabase Auth, the migration stops without silently leaving production DEV unowned. Create or confirm that Auth account, then rerun the migration.

## Expected behaviour

- Localhost keeps developer access.
- The public site rejects triple-tap DEV for non-admin accounts.
- Unknown or unavailable subscription data fails safely to the Free plan.
- Free accounts can create up to two active child profiles.
- Pricing appears only in guardian/account surfaces.
- No real payment, checkout, mission limit or learning-help restriction is active.

## Validation

- JavaScript syntax checks: PASS.
- Student language/hint audit: 13,680 samples across 114 skills, PASS.
- `git diff --check`: PASS.
