# Pet progression

This document is the canonical product specification for pet progression. Future pet work must preserve these three separate loops and the cosmetic-only boundary.

## Philosophy

Pets are visible companions, not power systems. Every one of the six pets is previewed in Khazanah from the start. Wira level establishes normal rescue access; completed effort or strong independent answers may earn early access. Owned pets, including Aurora, can be rescued again.

## 1. Wira-level eligibility

The player level (`db.level`) establishes normal rescue eligibility:

| Pet | Rarity | Required Wira level |
| --- | --- | ---: |
| Aurora | Starter | 1 |
| Kura-Kura Ketupat | Common | 3 |
| Kumbang Manggis | Uncommon | 7 |
| Harimau Bunga | Rare | 12 |
| Arnab Kek Lapis | Epic | 18 |
| Kerbau Durian | Legendary | 25 |

Early access advances at most one tier after 10 first questions with at least 85% answered correctly without hints or retries, or 8 completed missions. It advances at most two tiers after 20 first questions with at least 95% independent correct, or 20 completed missions. Accuracy aggregates the newest eight completed Gembok records with measured first-attempt fields; historical records contribute to effort only. Hints and retries never count as independent correct, and repeated attempts never add samples. Speed is not an eligibility condition.

Earned access is saved by grade and retained. It does not raise Wira level, alter learning evidence, or instantly tame a pet. A mission reserves its chosen pet and eligibility before answers begin; abandoned missions give no rescue progress and do not count as completed effort.

## 2. Curriculum rescue and taming

Curriculum-ratio rescues are the only way to tame a pet. A real completed 10-seal Gembok run credits only its pre-assigned eligible pet. Rescue thresholds remain `ceil(unique curriculum skills in the selected grade × rarity multiplier)`: Common 70%, Uncommon 100%, Rare 140%, Epic 180%, Legendary 240%. Aurora uses the Common rescue multiplier while retaining Starter rarity and existing ownership.

Selection uses persistent smooth weighted round robin, with base weights Aurora 2, Kura 8, Kumbang 5, Harimau 3, Arnab 2, Kerbau 1. Once normal access or ownership reaches Kumbang, Aurora/Kura weights are multiplied by 0.28. Pets one tier early receive half their base weight; two tiers early receive one quarter. Every eligible pet remains in rotation, including owned pets. A saved schedule produces the same next selection after reload; repeated assignment of the same live mission retains its reserved pet. Completion never duplicates ownership or awards Bond XP twice.

There is no gacha, random tame, coin purchase, boss route, battle route, or legacy tame route.

## 3. Equipped-pet Bond XP and evolution

After a real completed 10-seal Gembok run, manual or adaptive, the currently equipped tamed pet receives exactly 20 Bond XP once for that run. Unequipped pets receive none. The award excludes demos, incomplete or cancelled runs, Learning Camp, legacy battle, hints, individual answers, and rescue progress.

Pet level is `1 + floor(Bond XP / 100)`, capped at 60. Evolution is data and UI state only:

| Rarity | Evolution milestones |
| --- | --- |
| Common | L10, L25, L45 |
| Uncommon | L12, L30, L50 |
| Rare | L15, L35, L55 |
| Epic | L18, L40, L60 |
| Legendary | L20, L45, L60 |

Aurora Starter uses the Common milestones until a separate design is approved. UI states are `Bentuk Asas`, `Evolusi 1`, `Evolusi 2`, and `Evolusi 3`, with the next milestone or maximum state shown truthfully.

No evolved art may be faked, swapped, generated, or referenced. Evolution remains data/UI state until approved evolved transparent WebP assets exist.

## Non-gameplay boundary and migration

Pets never modify player XP, coins, questions, adaptive selection, timing, seals, scores, evidence, or gameplay effectiveness. The existing rescue-ratio migration removes only its historical pre-ratio erroneous awards. Later progression migrations are additive field normalization only and must preserve legitimate tamed pets, rescue counts, Bond XP, levels, unrelated learner data, coins, skills, and Gembok history.
