# v3.57.4 — Grounded Wira combat

Wira's ordinary solo attack now uses the approved motion preview: anticipation,
forward travel, ice slash, contact pause, follow-through and recovery. Enemy
counterattacks use the same grounded stage. Visible HP updates at contact;
gameplay HP, damage values, retry rules, Coach protection and rewards are unchanged.

The overlay uses alpha-cropped existing assets and measures live arena geometry.
It follows resize without interrupting the attack, caps canvas resolution at 2×,
supports reduced motion, and cancels at the existing battle journey boundary.
Question and result transitions wait for completion. Idle vertical bobbing is
removed for Wira's arena, with contact shadows under the feet.

Scope: Wira without an active pet. Pet combinations, existing finishers, Bunga
and Sidma continue through their existing renderers. Missing or undecoded assets
also fall back to the existing renderer. No new image assets were generated.

Validation: `node audit/combat-motion-v1.js` checks displayed HP timing in both
directions, gameplay-state integrity, stale journey callbacks, renderer phases,
reduced motion and fallback routing. The previous v3.57.3 behavioral checks also
pass; its historical release/hash assertions are not portable to this release
and Windows checkout line endings. Desktop and 390px browser checks covered a
correct answer, two wrong attempts, transition after attack, and the existing
finisher followed by a new enemy. Existing pet-first timing passed in the VM.

Preview files remain in `audit/combat-motion-preview.html` and its companion JS.
