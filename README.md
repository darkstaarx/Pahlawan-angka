# Pahlawan Angka — Phase 2.3 Learning Engine Dev Build

This build keeps Developer Mode enabled and adds the first full learning-intervention loop.

## Learning Engine
- First wrong answer triggers same-skill confirmation rather than random topic hopping.
- Learning Camp triggers on:
  - 2 repeated identical misconception signals,
  - 3 wrong answers within 5 attempts on the same skill,
  - 3 fast wrong answers (guessing pattern),
  - 3 hint-dependent attempts within 5.
- Learning Camp is interaction-gated, not timer-gated.
- Five stages: Faham → Bina → Sambung → Cuba → Guna.
- Pedagogy follows a CPA-style progression: concrete/virtual representation → pictorial model → abstract symbols → transfer.
- Two final checkpoints are required before returning to battle.
- Repeated checkpoint failure falls back to a prerequisite as “Misi Asas”.
- Successful Learning Camp restores HP and awards a small learning recovery reward.

## Reward logic (no shop/assets yet)
- Correct answer: +1 coin.
- Every 5-answer streak: +5 coins.
- Enemy/boss rewards retained.
- Daily quest retained.
- First time a skill crosses 85 mastery: +50 coins.
- Learning Camp completion: +10 coins, +15 XP and small HP recovery.
- Wrong answers give no XP/coins to prevent guessing/farming.

## Dev tools
- All grade topics unlocked.
- Exact skill question-bank testing.
- Force Misconception Learning Camp.
- Force Guessing Learning Camp.
- Dev question bank test still does not mutate mastery/coins/XP.


## Phase 2.5
Auto Coach now uses continuous frontier search (30–45 questions), rapid mastery acceleration, cross-grade stretch, and per-domain working-frontier profiling. Mission Mode remains 10 questions.
