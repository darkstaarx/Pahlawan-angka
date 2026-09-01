# Adaptive Learner Review v1 — Telemetry Contract

Status: local schema/source contract only. It has not been applied to Supabase production and does not change the current adaptive engine.

## Purpose

This contract captures enough evidence to distinguish likely learning patterns without claiming to observe a child's intent or attention directly.

| Record | Created when | Purpose |
|---|---|---|
| `adaptive_question_exposures` | A question is shown | Records what the engine selected and why. |
| `adaptive_interaction_events` | A meaningful interaction occurs | Records attempts, hints and observable interventions in order. |
| `adaptive_encounter_outcomes` | The question encounter ends | Records one immutable summary for analysis and reporting. |

All records are append-only for browser clients. Retries are events within one exposure; they are not separate questions.

## Evidence, not labels

Telemetry stores observable facts such as active response time, repeated error tags, retry success and hint level. It does not store labels such as `lazy`, `not_attentive`, `guesser` or `understands`.

Those interpretations must be derived across multiple encounters:

- **Possible rapid guessing:** several rapid submissions relative to the same child's own recent baseline, inconsistent distractor patterns, then better accuracy after an attention prompt.
- **Possible detail-reading difficulty:** repeated `error_tag` values for missed units, keywords or requested operations, followed by success after a reading intervention without a concept hint.
- **Possible misconception:** the same misconception-tagged response across different item variants and formats.
- **Independent understanding:** first-attempt success across varied formats, followed by an unaided transfer or spaced-review success.
- **Hint dependence:** success after hints followed by failure on a new independence check.

A single encounter is never enough for a behavioural label. Reports should use calibrated language: `belum cukup bukti`, `corak mula kelihatan`, or `corak konsisten`.

## Privacy boundary

Allowed:

- opaque child, session, decision, exposure and event UUIDs;
- curriculum identifiers and engine reason codes;
- bounded timings and counts;
- normalized response class, distractor/error tag and response slot;
- non-reversible item variant hash used for diversity checks.

Prohibited:

- child or guardian names;
- question prompts, answer choices or raw typed answers;
- email, phone, address or school;
- IP address, user-agent or device fingerprint;
- free-text notes;
- inferred diagnoses stored as facts.

## Client write order

1. Insert one exposure before presenting a question.
2. Append events with monotonically increasing `event_index` values.
3. Insert one outcome when the encounter ends.
4. Reuse the same client UUIDs after an offline retry; uniqueness constraints make writes idempotent.

No client update or delete is allowed. Account/child erasure remains a privileged operation and cascades from `child_profiles`.

## Ownership and access

- Signed-out clients have no privileges.
- An authenticated guardian can insert and read only rows belonging to a child in their family.
- A row cannot point to an exposure belonging to a different child.
- Browser clients receive no update or delete grants or policies.
- Service-role access is intentionally outside the browser contract and must never be exposed in client code.

## Reporting boundary

The parent-facing report should show strengths, learning pattern, what helps, and the next action in child-friendly language. Counts, confidence thresholds and error tags stay in the internal evidence layer. Retention and transfer claims require later exposures using `spaced_review` and `transfer_check` selection reasons.
