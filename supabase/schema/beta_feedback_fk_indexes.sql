-- Supporting indexes for beta feedback ownership foreign keys.
-- Applied live after beta_trust_foundation_v1.

create index if not exists beta_feedback_user_id_idx
  on public.beta_feedback (user_id);

create index if not exists beta_feedback_child_id_idx
  on public.beta_feedback (child_id)
  where child_id is not null;
