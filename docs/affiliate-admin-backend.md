# Affiliate admin backend

`supabase/schema/affiliate_admin_dashboard_v1.sql` adds authenticated wrappers for the standalone admin app. Each wrapper calls a private `SECURITY DEFINER` function that checks `public.app_user_roles.role = 'admin'` for `auth.uid()`. The wrappers are `SECURITY INVOKER`, use an empty search path, and are executable by `authenticated` only.

`public.admin_affiliate_dashboard()` returns `{ generated_at, affiliates, commissions, orders }`. Affiliate rows contain `id`, `display_name`, auth `email`, `code`, `status`, `created_at`, `bank_ready`, and `phone`. Commission rows contain commission status, amount, payout reference/time, and joined order plan, amount, status, paid time, and billcode. Order rows contain the affiliate order fields for client-side aggregates. The bulk snapshot never includes bank account name, bank name, or account number. Use existing `public.admin_get_affiliate_bank_info(affiliate_id)` when an admin opens payout details for one affiliate.

`public.admin_record_affiliate_payout(affiliate_id, commission_ids, p_reference, expected_amount_cents)` atomically marks a selected set as `paid`. It accepts at most 500 non-null IDs, locks selected commissions and orders in ID order, requires every commission to be `pending` or `approved` and its order to be `paid`, rejects duplicate IDs, requires a 3–120 character reference, and compares the locked total with `expected_amount_cents`. A second attempt fails because paid and void rows are not payable. It records the reference and timestamp but does not transfer money. The returned object is `{ count, amount_cents, reference }`.

The client should derive aggregates from the snapshot or group commissions by affiliate. No service key or direct table write is needed by the admin app.


## Admin portal

Open https://pahlawanangka.netlify.app/admin/ and sign in using an existing administrator account. This portal uses its own auth storage and does not modify game login or grant roles. The server authorizes each snapshot and payout request using the live role table. The frontend requires a fresh snapshot, selected commissions for one affiliate, a transfer reference, and confirmation that the bank transfer has already happened. No funds are transferred by this app.

CSV export follows the current search/status filters, includes affiliate identifiers and payout references, and escapes spreadsheet formulas. Bank numbers are fetched only when opening a payout review, and are cleared on close/logout. The game service worker bypasses `/admin` and `/admin/*`; no admin service worker or financial-response cache is registered.

## Validation

- `node audit/affiliate-admin.test.js`: money/status/deduplication, CSV safety, game-worker isolation.
- `node audit/affiliate-admin-browser.test.js`: desktop and 390px mobile fixture UI, bank lookup, payout confirmation/reference validation, single submission, refreshed paid ledger, refresh stale-selection guard, non-admin denial, session-expiry cleanup with a late bank response.
- Browser tests use a mocked Supabase client and never write real payouts. Set `PA_PLAYWRIGHT_PATH` if the bundled Playwright runtime is elsewhere.
- Live rollback SQL tests passed after migration: anon/non-admin dashboard and payout denial, snapshot account-number redaction, duplicate IDs, mixed unpaid-order selection atomicity, wrong affiliate/expected total, successful batch and repeat-payment rejection. All test fixtures and payment state were rolled back.
- The new backend was independently reviewed; overlapping payouts use deterministic row locks. Simultaneous multi-session database execution was not exercised.
- Supabase advisor reported only existing pg_net placement/password-protection warnings and intentional private-outbox RLS notices; this migration added no tables or broader policies.
