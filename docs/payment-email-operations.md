# Payment activation email operations

Set `EMAIL_DELIVERY_ENABLED=false` during initial setup and database fixture testing. The worker accepts the exact service-role bearer for controlled checks, or a dedicated `PAYMENT_EMAIL_WORKER_KEY` through the `x-payment-email-worker-key` header. The dedicated key must be at least 32 characters and must never be committed or exposed to the browser.

The scheduler SQL uses Vault secrets named `payment_email_project_url`, `payment_email_gateway_jwt`, and `payment_email_worker_key`. It fails before creating the five-minute `pg_cron` job if any secret is absent, the project URL is not HTTPS, or the worker key is too short. The gateway JWT is used only to satisfy the Edge Function gateway; the dedicated worker key is the application-level authorization.

Delivery is bounded to ten rows per invocation. A Gmail success whose outbox state cannot be persisted is reported as `reconciliation_required` and remains unresolved to avoid automatic duplicate sends. Network ambiguity follows the same manual reconciliation path. Retryable Gmail HTTP responses return rows to the pending queue with backoff.

OAuth testing uses a seven-day refresh token. This is a test limitation, not a production credential plan; replace it with the approved production OAuth configuration before opening payments to all customers.

## Verified deployment, 11 October 2026

The outbox migration and rollback SQL acceptance test passed. The worker and payment callback are deployed. Dedicated worker credentials are encrypted in Supabase Secrets and Vault; no service-role key is stored in Vault. The five-minute cron job is active.

With delivery enabled for the existing admin-only payment test, scheduled HTTP request 2 returned `200`, `processed:1`, `sent:1`, with no retry, failure, or reconciliation. The real no-affiliate test order `437894da-c914-4cd8-a1da-b0150d4e59e0` is marked `sent`, with one attempt, at `2026-10-11T12:55:02.505029Z`. Manual request 3 returned `200`, `processed:0`, proving the sent order was not resent. Gmail acceptance does not prove Inbox placement; recipient confirmation remains pending.

Unit tests cover MIME alternatives, authorization, retryable failures and ambiguous sends. Live affiliate acceptance, recipient layout confirmation and production OAuth configuration remain pending. General payments remain disabled; only the allowlisted test buyer can pay.

## Advisor notes

The private outbox deliberately has RLS enabled with no browser policies. Browser roles cannot access the queue or Vault decrypted secrets.

The managed `pg_net` extension is non-relocatable and currently reports `extension_in_public`. Its objects live in the unexposed `net` schema. Do not use `ALTER EXTENSION ... SET SCHEMA` or drop a populated request queue to clear this advisory. Supabase documents recreating it in `extensions` only after preserving needed responses and checking that no requests are pending: https://supabase.com/docs/guides/database/extensions/pg_net#troubleshooting.

Recipient verification (11 October 2026, 21:54 MYT): the buyer's Gmail contained the activation email in Spam, with Gmail stating similarity to earlier spam messages. Report not spam moved the message into Inbox. Logo, HTML layout, RM19 benefits, order reference and app CTA were visibly present. Delivery is verified; Inbox placement for other recipients remains unproven. No duplicate email was sent.
