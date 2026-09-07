# Pahlawan Angka — Game Design V2
## RPG / MMO-Ready Presentation & Animation Direction

**Status:** Design source of truth — DRAFT / NOT an implementation approval  
**Repository:** darkstaarx/Pahlawan-angka  
**Purpose:** Give Claude Code, Codex, Astra, or any future implementation agent one stable reference for the intended V2 game direction without requiring repeated long prompts.

> IMPORTANT FOR AGENTS
>
> This document describes the target direction. **Do not modify production code merely because this file exists.**
> Only implement a phase when the user explicitly asks for that phase.
> Existing repository logic remains the source of truth unless an explicit implementation brief says otherwise.

---

# 1. PRODUCT INTENT

Pahlawan Angka must evolve from a mathematics quiz with game presentation into a **real-feeling 2D Malaysian mathematics JRPG**, while preserving the existing educational engine.

The child should feel:

> “I am exploring a game world and fighting enemies using Mathematics.”

rather than:

> “I am answering a worksheet with attack animations.”

The product remains:

- mobile-first;
- portrait-oriented;
- 2D;
- KSSR-aligned;
- suitable for pupils Darjah 1–6;
- credible to parents;
- child-friendly without preschool styling.

The V2 direction adds:

- stronger animation;
- stronger battle pacing;
- areas/worlds with narrative context;
- enemy personality;
- boss mechanics;
- collectibles/rewards;
- future co-op / MMO-style social play;
- reusable game systems instead of one-off animation hacks.

---

# 2. ABSOLUTE NON-GOALS

Unless a later explicit prompt overrides this section, V2 must **not**:

- rebuild the whole application from scratch;
- replace the existing question bank;
- replace the existing KSSR mapping;
- rewrite answer validation;
- replace the adaptive engine;
- change mastery logic merely for game feel;
- require an AI API at runtime;
- turn the product into a 3D game;
- copy the copyrighted UI, artwork, characters, maps, or assets of any reference game;
- sacrifice educational correctness for faster combat;
- create pay-to-win academic advantages.

Existing login, profiles, progression data, Supabase integration, worksheets, parent features, assessment logic and learning rules are to be preserved unless separately approved.

---

# 3. WORLD STRUCTURE — EACH DARJAH IS ITS OWN CAMPAIGN

The primary academic structure is:

```
Student Profile
    ↓
Choose / Assigned Darjah
    ↓
Darjah-specific World
    ↓
Area / Region
    ↓
Topic
    ↓
Landmark / Encounter
    ↓
Subtopic / Skill
    ↓
Battle / Activity / Boss
    ↓
Reward + Mastery + Story Progress
```

A Darjah 1 pupil must **not suddenly progress into Darjah 2/3 academic content as part of normal exploration**.

Each Darjah is a complete campaign/world using only content appropriate to that Darjah.

Example conceptual structure for Darjah 1:

- a village / town area;
- a forest or garden;
- a cave;
- a market;
- a clock/time landmark;
- a measurement-themed area;
- a shape/space area;
- a data-related area;
- topic bosses and a final Darjah 1 boss.

The exact names and mapping must be based on the actual KSSR/DSKP content in the repository, not invented loosely.

Names should feel like RPG world names first and school labels second. Avoid making every location sound like “Math Forest” or “Addition Cave” unless it genuinely suits the art direction.

---

# 4. CORE GAME LOOP

Target loop:

```
Explore
  ↓
Story beat / NPC / environmental event
  ↓
Encounter
  ↓
Math Battle
  ↓
Animation / Enemy reaction
  ↓
Reward / Collectible / Progress
  ↓
New landmark / shortcut / boss
  ↓
Continue exploration
```

Not every interaction should be a standard four-answer battle.

Variation may include:

- normal enemy encounters;
- short environmental math interactions;
- treasure/reward events;
- NPC requests;
- mini challenges;
- topic boss encounters;
- future co-op events.

All educational content must still come from approved, grade-appropriate logic.

---

# 5. BATTLE SCREEN V2

The lower learning/question surface remains highly readable.

The upper game arena becomes substantially more expressive.

Conceptual portrait composition:

```
┌─────────────────────────────┐
│ AREA / ENCOUNTER / BOSS     │
│ Boss / Enemy HP             │
│                             │
│          ENEMY              │
│      idle / reactions       │
│                             │
│                   HERO      │
│                  + PET      │
│                             │
│ Combo / Energy / State      │
├─────────────────────────────┤
│        QUESTION CARD        │
│                             │
│          36 + 27 = ?        │
│                             │
│       answer choices        │
│                             │
│ Hint / feedback / timing    │
└─────────────────────────────┘
```

Question readability always takes priority over decorative effects.

---

# 6. NORMAL BATTLE FLOW

Current-feeling pattern to move away from:

```
answer → static attack image / slide → next question
```

Target correct-answer flow:

```
Answer accepted
→ answer UI locks
→ optional pet lead / reaction
→ hero anticipation
→ acceleration / launch
→ attack contact
→ separate VFX
→ hit-stop
→ camera response
→ enemy hit reaction
→ HP response
→ particles / number effect / environment response
→ hero recovery
→ next battle state
```

Target wrong-answer flow:

```
Wrong answer
→ readable learning feedback
→ enemy anticipation / charge
→ enemy attack variant
→ hero block / hit / dodge reaction as appropriate
→ HP / penalty response
→ existing hint / recovery logic
→ continue learning flow
```

The learning feedback must never be obscured by spectacle.

---

# 7. ANIMATION QUALITY STANDARD

Pahlawan Angka V2 animation should target the feel of a polished 2D indie/mobile JRPG.

For attacks, prioritize:

1. anticipation;
2. acceleration;
3. clear contact;
4. hit-stop;
5. reaction;
6. follow-through;
7. recovery.

Avoid:

- simple translate-left/right as the main motion;
- static pose swaps with no weight;
- character scale drift;
- baseline jumping;
- inconsistent head/body proportions;
- weapon geometry changing between frames;
- baked-in VFX that make reuse difficult;
- full-screen effects that obscure the question unnecessarily.

Character animation and attack VFX should be treated as separate systems whenever practical.

Typical normal attack target:

- approximately 0.8–1.3 seconds depending on hero;
- distinct anticipation;
- readable contact;
- short hit-stop;
- fast recovery;
- no unnecessary delay before the next learning action.

Exact timings are implementation-tunable, not hardcoded design law.

---

# 8. CHARACTER VISUAL LOCK

Existing production characters remain canonical.

Do not redesign a hero merely to make animation easier.

For each hero preserve:

- face;
- facial proportions;
- hairstyle;
- head size;
- body proportions;
- costume construction;
- costume colours;
- weapon/tool design;
- footwear;
- rendering style;
- line treatment;
- shading treatment;
- overall visual identity.

Current known character identities include:

- Wira — sword and shield;
- Bunga — fan / wind-oriented fighter;
- Pendekar — gauntlet / breaker-oriented fighter;
- Sidma — canonical Sigma staff.

Sidma's Sigma staff must not be replaced with a sword.

---

# 9. FUTURE MMORPG-LIKE CHARACTER ROLES

Character selection should eventually feel more like choosing a lightweight RPG role than simply choosing a portrait.

Possible combat identities:

### Wira — Vanguard
- defensive identity;
- protects team / creates shield value;
- reliable attack readability.

### Sidma — Tactician
- Sigma/combo identity;
- rewards accurate streaks;
- mathematically themed tactical presentation.

### Bunga — Support
- wind / recovery / team-energy identity;
- supportive visual language.

### Pendekar — Breaker
- armour break / stagger identity;
- strong impact animations.

IMPORTANT:

**The class must not change the academic standard of the question.**

A child must not receive harder/easier curriculum questions because a hero is “mage”, “tank”, etc.

Character roles alter the **game reward/presentation after the learning event**, not the curriculum.

---

# 10. FUTURE CO-OP / MULTIPLAYER DIRECTION

The current single-player architecture should avoid decisions that make future multiplayer unnecessarily difficult.

Target future experience:

```
Darjah World
   ↓
Village / Shared Area
   ↓
Party / Co-op Event
   ↓
Shared Encounter
   ↓
Synchronized Question
   ↓
Players answer independently
   ↓
Correct players attack
   ↓
Team boss state
   ↓
Reward / mastery / progression
```

Possible party size for early co-op prototype:

- 2–4 players first;
- potentially larger event groups later if performance and moderation justify it.

Do not prematurely build a massive persistent MMO architecture.

---

# 11. SPEED VS ACCURACY IN MULTIPLAYER

Do not make “fastest tap wins” the primary educational rule.

Preferred model:

- correctness is mandatory for positive contribution;
- faster correct answers determine earlier attack order;
- speed may provide a **small** bonus;
- accuracy, streak, mastery or class mechanics determine meaningful contribution;
- wrong answers must not be rewarded through random guessing.

Example:

```
Question appears
→ Player A correct at 3.2s → attacks first
→ Player B correct at 4.8s → attacks second
→ Player C correct at 6.1s → attacks third
→ Player D wrong → no positive attack contribution / receives battle consequence
```

The design should allow slower but accurate pupils to remain valuable to the party.

---

# 12. CO-OP COMBO SYSTEM

Future group combat may include:

- sequential attacks based on correct-answer completion;
- team combo meter;
- “all correct” combo;
- role synergy;
- boss stagger/barrier systems;
- collective phase objectives.

Example:

```
4/4 correct
→ KOMBO PAHLAWAN
→ combined cinematic
→ boss armour break
```

This must remain short enough that repeated combat does not become tedious.

---

# 13. BOSS DESIGN

Bosses must not simply be normal enemies with more HP.

A boss may include:

- phase transitions;
- armour / shield;
- stagger;
- environmental mechanics;
- number objects;
- short math mini-games;
- cinematic attack windows;
- topic-specific mechanics;
- future co-op mechanics.

Example pattern:

```
Normal math battle
→ boss reaches phase threshold
→ battle UI transitions
→ short topic-relevant mini-game
→ success breaks shield / exposes weak point
→ hero special attack
→ return to normal battle
```

The mini-game must reinforce the actual topic rather than being unrelated arcade filler.

---

# 14. EXAMPLE BOSS MINI-GAME PRINCIPLE

Example only:

Boss presents number objects:

```
8   14   6
```

Prompt:

```
14 − ? = 8
```

Player selects `6`.

Success:

```
object breaks
→ boss staggers
→ armour drops
→ hero launches special attack
```

The real implementation must use grade/topic-appropriate content from the repository.

---

# 15. COLLECTIBLES / PROGRESSION

The adventure may reward:

- costume cosmetics;
- weapon skins;
- aura effects;
- profile frames;
- titles;
- badges;
- pets;
- emotes;
- collectible cards;
- exploration items;
- future mounts if appropriate.

Avoid pay-to-win academic stats.

The reward loop should make progress visible without invalidating learning mastery.

---

# 16. SOCIAL SAFETY DIRECTION

Because the audience includes young children, do not assume open text or voice chat.

Safer social primitives include:

- preset emotes;
- predefined phrases;
- party invite codes;
- classroom / approved friend groups;
- parent/teacher controls;
- constrained cooperative interactions.

Examples:

- “Jom!”
- “Bagus!”
- “Terima kasih!”
- “Saya perlukan bantuan!”

Any future open communication feature requires a separate safety/moderation design review.

---

# 17. TECHNICAL DIRECTION

Pahlawan Angka can remain a web/HTML5 application.

“HTML” here should be understood as a modern game-capable web stack:

- existing web application / React-style UI where applicable;
- JavaScript / TypeScript game logic;
- Canvas / WebGL for game rendering;
- spritesheets;
- particles;
- shaders where justified;
- Supabase / realtime backend for future multiplayer.

Do **not** migrate to Unity/Godot/3D solely because it sounds more “game-like”.

For the V2 game presentation layer, an implementation agent may evaluate:

- PixiJS;
- Phaser;
- the existing renderer plus targeted improvements.

Three.js is optional and should only be introduced where it provides clear value. It is not a default requirement for a 2D game.

Blender is a **production tool**, not necessarily the runtime.

Possible Blender uses:

- boss asset construction;
- perspective references;
- prerendered effects;
- props;
- environment elements;
- procedural asset work;
- complex motion reference.

The visible game should still preserve the locked 2D identity.

---

# 18. AI RUNTIME POLICY

Pahlawan Angka V2 does **not** require ChatGPT, Claude or another AI API during normal child gameplay.

Preferred:

- approved question bank;
- deterministic answer validation;
- existing adaptive logic;
- predefined or authored story/dialogue;
- assets generated during development;
- server/realtime systems only where gameplay requires them.

AI is primarily a **development tool**, not a runtime dependency.

---

# 19. REFERENCE GAMES — INTERACTION ONLY

Agents may study high-level interaction principles from games such as:

### Pokémon
Reference:
- battle readability;
- clear ownership of turns/actions;
- obvious HP/status feedback.

Do not copy its UI/art/assets.

### Sea of Stars
Reference:
- 2D anticipation;
- attack contact;
- hit-stop;
- follow-through;
- combat weight.

Do not copy animations/assets.

### Cookie Run: Kingdom
Reference:
- short expressive skills;
- readable character personality;
- compact mobile VFX.

Do not copy UI/assets.

### Paper Mario / Super Mario RPG
Reference:
- boss interaction;
- lightweight timed or contextual mechanics;
- fights that are more than HP depletion.

Do not copy minigames literally.

### Prodigy Math Game
Reference:
- education-to-adventure loop;
- map/encounter/reward framing.

Do not clone visual design.

### MapleStory
Reference:
- readable 2D social/town feel;
- multiple player silhouettes;
- party/event potential.

Do not copy maps/assets.

### Honkai: Star Rail
Reference only at the conceptual level:
- camera choreography;
- strong finisher presentation;
- readable skill identity.

Pahlawan Angka remains lightweight 2D.

---

# 20. MULTIPLAYER-READY ANIMATION RULE

When designing animation now, assume a future screen may contain multiple heroes.

Therefore:

- each hero needs a readable silhouette;
- each hero needs a distinct attack rhythm;
- VFX must not cover the entire screen by default;
- simultaneous skills need layering rules;
- camera effects cannot make four-player combat unreadable;
- damage/answer feedback must remain distinguishable;
- particles must have performance budgets.

Do not create a system where every hero uses a giant full-screen explosion for every correct answer.

---

# 21. CURRENT PRIORITY — ANIMATION FIRST

Although this document captures the wider V2 direction, the **current implementation priority is animation**, not the full world/MMO system.

The first proof of concept should prove that the existing battle can look and feel like a real polished 2D game without damaging the learning engine.

Recommended vertical slice:

### Hero
Sidma

### Required showcase
- idle;
- normal attack variants;
- anticipation;
- launch;
- contact;
- follow-through;
- recovery;
- enemy hit reaction;
- one enemy attack;
- Sidma hit/block reaction;
- special / critical attack;
- boss interaction or finisher.

Character FX and attack FX should be separate.

The canonical Sidma character and Sigma staff must remain unchanged.

---

# 22. SIDMA ANIMATION PROOF-OF-CONCEPT TARGET

A successful Sidma test should demonstrate:

```
Idle
→ Deep Load
→ Launch
→ Contact
→ Hit Stop
→ Enemy Reaction
→ Follow Through
→ Recovery
→ Idle
```

Acceptance criteria:

- no frame-to-frame scale drift;
- no canvas jump;
- no character position popping;
- stable baseline;
- stable head/body proportions;
- Sigma staff geometry remains canonical;
- attack reads clearly on a phone screen;
- VFX remains separate from character sprite where practical;
- animation feels weighted rather than translated;
- transition back to idle is clean;
- question/learning UI remains readable.

The exact implementation pipeline can use fixed-frame spritesheets, runtime transforms, particles, WebGL effects, or a hybrid if the result remains stable and maintainable.

---

# 23. PETS

Pets are part of the Pahlawan Angka identity but must not clutter combat.

Current design direction:

- pet remains significantly smaller than hero;
- pet may lead a standard attack sequence briefly;
- pet effects should be lightweight;
- pets should not appear in every cinematic finisher unless explicitly designed;
- multiplayer must maintain visual clarity.

---

# 24. IMPLEMENTATION PHASES

Do not attempt the entire V2 in one unreviewed rewrite.

### Phase 0 — Repository Audit
Read only.
Document:
- battle architecture;
- animation architecture;
- asset pipeline;
- state ownership;
- rendering constraints;
- regression risks.

No code changes.

### Phase 1 — Sidma Animation Vertical Slice
Implement one hero combat showcase in the existing battle.

Do not change learning logic.

### Phase 2 — Enemy + Boss Feel
Add:
- enemy animation variants;
- hit reaction;
- boss phase presentation;
- one topic-appropriate mini-game prototype.

### Phase 3 — Generalized Animation System
Only after the vertical slice is approved:
- reusable state machine;
- reusable FX layers;
- timing tokens;
- camera system;
- character configuration;
- performance controls.

### Phase 4 — Other Heroes
Apply the proven pipeline to:
- Bunga;
- Wira;
- Pendekar.

### Phase 5 — Area / Story Presentation
Begin world-area integration.

### Phase 6 — Multiplayer Prototype
Only after single-player game feel is stable:
- small party;
- synchronized question;
- server-authoritative validation/timing;
- attack ordering;
- shared boss state.

---

# 25. AGENT WORKING METHOD

When explicitly asked to implement a phase, the preferred loop is:

```
inspect repo
→ identify canonical assets and logic
→ propose minimal architecture
→ implement isolated change
→ run application
→ observe real animation
→ capture visual/runtime evidence
→ fix timing/layout/drift
→ test again
→ run regressions
→ report
```

Agents should not judge animation quality from code alone.

Visual runtime verification is required.

For animation work, inspect:

- frame consistency;
- hero scale;
- baseline;
- enemy scale;
- weapon geometry;
- camera movement;
- particle overlap;
- question readability;
- portrait phone behavior;
- desktop behavior where supported;
- reduced-motion behavior if applicable;
- console/runtime errors.

---

# 26. SOURCE-OF-TRUTH PRIORITY

If an agent finds a conflict, use this priority:

1. explicit latest user instruction;
2. canonical production assets in the repository;
3. current working learning/business logic;
4. this Game Design V2 document;
5. older audit/design notes;
6. external reference games.

Never override the current curriculum/assessment logic merely to match a visual mockup.

---

# 27. DEFINITION OF SUCCESS

The V2 transformation succeeds when a parent or pupil can watch the first battle and perceive:

- a real game character;
- a living enemy;
- purposeful attack timing;
- responsive impact;
- readable learning;
- progression;
- personality;
- a sense of place;
- anticipation of what happens next.

The desired reaction is:

> “This feels like a game that teaches Mathematics.”

not:

> “This is a quiz with decorative animations.”

---

# 28. SHORT START PROMPT FOR FUTURE AGENTS

When a future agent already has repository access, the user should be able to say:

> Read `docs/GAME-DESIGN-V2.md` as the design source of truth. Inspect the actual repository and canonical production assets before proposing changes. Do not redesign characters or alter question/KSSR/adaptive logic. Work only on the explicitly requested phase. Run and visually verify the real game before reporting completion.

For the immediate animation proof of concept:

> Read `docs/GAME-DESIGN-V2.md`. Execute Phase 0 first as a read-only audit focused on the existing battle and Sidma animation pipeline. Do not modify code yet. Identify the smallest production-safe path to a polished Sidma normal attack with anticipation, launch, contact, hit-stop, enemy reaction, follow-through and recovery while preserving the exact canonical Sidma and Sigma staff.
