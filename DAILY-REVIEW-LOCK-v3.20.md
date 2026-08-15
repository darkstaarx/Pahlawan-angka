# Pahlawan Angka — Daily Review Lock v3.20

Status: **LOCKED PRODUCT LOOP**  
Baseline: v3.19.1 + `.nojekyll` Pages recovery commit `809dc2a`.

## Core rule
Daily Quest exists to protect learning retention, not to maximise time-in-app.

## Locked behaviour
- Daily Quest is **8 questions**.
- It is available once per local calendar day and can be resumed if interrupted.
- Completing the 8-question review ends the daily loop; the card changes to **“Cukup untuk hari ini · sambung esok”**.
- There is **no daily streak / consecutive-day punishment**.
- Completion reward is one-time only. Do not make the child repeat the Daily Quest to farm currency.
- Daily completion does not require perfect accuracy. Wrong answers become evidence for future review.
- A correct answer after a hint is recorded as supported success, not clean independent proof.

## Selection hierarchy
Daily review should prefer, in this order where evidence supports it:
1. Parent Focus.
2. Recent/repeated misconception evidence.
3. Mandatory competency evidence that is still incomplete.
4. Skills whose review interval is due/overdue.
5. Fragile mastery/confidence/stability.
6. Limited unseen/current-frontier coverage only when stronger review candidates are unavailable.

## Breadth controls
- Parent Focus is capped at 3/8 questions.
- Normal skills are capped at 2/8 where the available pool allows it.
- Avoid the same skill in consecutive questions when another valid skill is available.
- A clean confirmation required after Cikgu Wajar/intervention may override the prebuilt queue.

## Spaced-review memory
Persist per-skill:
- last practice;
- last independent correct;
- last wrong;
- last hint-supported response;
- practice / clean / wrong / hint counts;
- misconception tags seen during review.

`lastSeen` should be updated when practice evidence is recorded so the existing adaptive engine's spacing signal becomes meaningful.

## Safety / wellbeing
- Do not optimise Daily Quest for session length.
- Do not add loss aversion, streak freeze, streak rescue, countdown pressure, shame, or punishment for missing a day.
- Parent play-time controls remain authoritative.
- Daily Quest may coexist with normal missions, but its completion reward is never repeatable that day.

## Do not change without a new product decision
- 8-question daily target.
- no-streak rule;
- one-time reward rule;
- Parent Focus cap;
- clean-vs-hint evidence distinction;
- mandatory competency evidence awareness;
- local-calendar-day reset.
