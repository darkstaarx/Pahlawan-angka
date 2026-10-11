# Production feature access

| Feature | Free | Akses Keluarga (premium) | Family Plus |
| --- | --- | --- | --- |
| Guest demo | Yes | Yes | Yes |
| Missions, Cikgu Dimensi, saved progress | No | Yes | Yes |
| Active child profiles | 0 | 2 | 5 |
| Focus practice, PDF reports, full worksheets | No | No | Yes |

Prices: RM19/RM29 during beta, RM29/RM49 after beta. Lifetime access uses active status and null current_period_end. Expired/cancelled access falls back to free. Trusted admins retain access. RM5 profile add-ons are recorded as extra_profile_slots and only extend an active paid plan.

Family Plus purchased_at records the purchase time; get_feature_access exposes new_features_until (two calendar months after purchase) for eligibility for future releases. No purchase dates are fabricated and no checkout/payment activation has been added.

Applied to Supabase project pxxekdeqlxwqwaqvfbnh:
1. commercial_production_access_v3
2. commercial_purchase_window_v1

Subscriptions and admin roles are read-only for browser clients. Existing saves are preserved/readable; paid restrictions protect progression writes. Profile creation/reactivation checks ownership and locks the family row to enforce limits. A payment backend must verify payment and write the plan/status/purchased_at/add-ons using server credentials. Never accept these fields from user metadata.

Validation: run node --test audit/commercial-production-access.test.js and execute supabase/tests/commercial_production_access.sql (rollback-only). Supabase security advisor reports no database warnings; existing leaked-password protection remains disabled.

Frontend v3.85.76 is prepared locally; release frontend together with the already-applied backend rules. Demo math/rendering remains publicly delivered static content: client controls govern the normal UI, database policies govern protected cloud writes. Server-side worksheet/report delivery would be needed to make downloadable content private.
