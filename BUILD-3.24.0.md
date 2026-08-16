# Pahlawan Angka v3.24.0 — Profile Manager + Two-Page Child Flow

Expected baseline:
`a7c954d40f6c64e16587b9c9c43a74ecf1bcc960`

## Product change

For signed-in guardians the three-screen flow is reduced to two real pages:

1. **Akaun Ibu Bapa / Profile Manager**
2. **Hub Murid**

The old `setup` screen remains only as a legacy/offline fallback. Signed-in navigation to `goSetup()` is intercepted and returns to Profile Manager.

Create/Edit child is an overlay inside Profile Manager, not a third route.

## Profile Manager

Each profile shows:
- original Wira/Bunga production art as a cropped portrait;
- child name;
- grade;
- hero;
- level / coin snapshot;
- compact XP treatment;
- active profile status;
- `⋮` actions.

Actions:
- open child -> Hub Murid;
- edit child;
- soft-delete child;
- create new child;
- logout.

## Create / Edit

One reusable editor handles:
- display name;
- school grade 1–6;
- Wira / Bunga;
- create and edit modes.

For hero identity consistency, v3.24.0 deliberately reuses:
- `assets/heroes/wira/idle.webp`
- `assets/heroes/bunga/idle.webp`

The generated UI mockup art is **not shipped**.

The hero card uses a bust crop, party-selection glow, selected badge and `Jom!` invitation treatment. A future approved happy-bust asset can replace only the image source without changing the component.

## Grade change safety

Changing a profile's school grade does not copy chapter progress into another grade.

Before changing grade, v3.24.0 archives:
- `coreFrontier`
- `completedMissions`
- `chapterStars`
- `activeMissionChapter`

under `gradeProgressArchive[oldGrade]`.

If a child returns to a previously used grade, that grade's chapter state is restored. Skill evidence itself is preserved.

## Delete behavior

Delete is intentionally **soft delete**:
`child_profiles.is_active = false`

No hard-delete query is used. Existing game saves, learning attempts and related records remain intact.

The production Supabase schema already contains `is_active`; no DDL migration is required.

## Hub

The Hub now has:
- back button -> Profile Manager for signed-in users;
- compact `↔ Tukar profil` action on the hero card.

## Preserved

No change to:
- question banks / v3.22 depth;
- v3.23 Year 6 curriculum repair;
- mastery thresholds;
- Cikgu Wajar;
- Daily Quest;
- battle / boss / FX;
- typed-answer logic;
- parent learning dashboard;
- Supabase schema;
- World Response (remains retired).
