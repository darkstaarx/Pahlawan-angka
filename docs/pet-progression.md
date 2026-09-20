# Pet progression

This document is the canonical product specification for pet progression. Future pet work must preserve these three separate loops and the cosmetic-only boundary.

## Philosophy

Pets are visible companions, not power systems. Every one of the six pets is previewed in Khazanah from the start. A Wira level gate controls whether rescue progress may begin; it never hides a pet.

## 1. Wira-level eligibility

The player level (`db.level`) gates rescue eligibility only:

| Pet | Rarity | Required Wira level |
| --- | --- | ---: |
| Aurora | Starter | 1 |
| Kura-Kura Ketupat | Common | 3 |
| Kumbang Manggis | Uncommon | 7 |
| Harimau Bunga | Rare | 12 |
| Arnab Kek Lapis | Epic | 18 |
| Kerbau Durian | Legendary | 25 |

A run may be assigned to an ineligible pet as a sneak preview, but it records no rescue progress and cannot tame that pet. Khazanah must state the gate rather than showing a misleading rescue counter.

## 2. Curriculum rescue and taming

Curriculum-ratio rescues are the only way to tame a pet. A real completed 10-seal Gembok run credits only its pre-assigned pet, subject to that pet's Wira-level gate. Rescue thresholds remain `ceil(unique curriculum skills in the selected grade × rarity multiplier)`: Common 70%, Uncommon 100%, Rare 140%, Epic 180%, Legendary 240%. The stable configured rotation implements the 5:3:2:1:1 Common:Uncommon:Rare:Epic:Legendary ratio.

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