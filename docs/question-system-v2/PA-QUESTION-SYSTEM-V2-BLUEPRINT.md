# Pahlawan Angka — Question System v2 Blueprint

**Status:** Architecture lock / pre-implementation
**Scope:** Darjah 1–6 question-bank architecture
**Goal:** Separate curriculum truth, question content, reusable generation/rendering, and runtime selection so curriculum updates do not require battle/UI/runtime patch stacking.

## 1. Architecture decision

Question System v2 has six independent layers:

1. **Curriculum Registry** — what must be learned/assessed (SK/SP/competency, curriculum version, prerequisites).
2. **Question Bank Registry** — which archetypes/evidence families assess each competency.
3. **Generator Library** — reusable mathematical parameter generation and answer/distractor construction.
4. **Renderer Library** — reusable visual/representation engines.
5. **Selector Engine** — chooses competency/archetype/representation while controlling repetition.
6. **Validation Layer** — curriculum coverage, mathematical validity, ambiguity, representation, and regression checks.

Battle, rewards, hero animation, Cikgu Dimensi UI, parent mode and Supabase are consumers of Question System v2. They are not curriculum owners.

## 2. Non-negotiable rules

- No new year-specific runtime wrapper such as `const previous = banks.dX; banks.dX = ...`.
- No curriculum repair that depends on script load order.
- No `index.html`, `sw.js`, battle or UI edits merely to add a new curriculum archetype.
- Do not push new SP records directly into the live adaptive graph until executable coverage exists.
- Do not change global mastery calculation during the first migration phase.
- Preserve current production question system until v2 passes shadow/regression validation.
- A broad legacy skill is not sufficient evidence of KSSR coverage; evidence is tracked at competency/SP level.
- Numeric randomisation alone is not question diversity.

## 3. Target repository structure

```text
questions/
├── v2/
│   ├── curriculum/
│   │   ├── kssr-e3-2024/
│   │   │   ├── d1.json
│   │   │   ├── d2.json
│   │   │   └── d3.json
│   │   ├── kssr-semakan-2017/
│   │   │   ├── d1.json
│   │   │   ├── d2.json
│   │   │   ├── d3.json
│   │   │   ├── d4.json
│   │   │   ├── d5.json
│   │   │   └── d6.json
│   │   └── kp2027/
│   │       └── d1.json
│   │
│   ├── banks/
│   │   ├── kssr-e3-2024/
│   │   │   ├── d1/
│   │   │   ├── d2/
│   │   │   └── d3/
│   │   ├── kssr-semakan-2017/
│   │   │   ├── d1/
│   │   │   ├── d2/
│   │   │   ├── d3/
│   │   │   ├── d4/
│   │   │   ├── d5/
│   │   │   └── d6/
│   │   └── kp2027/
│   │       └── d1/
│   │
│   ├── generators/
│   │   ├── arithmetic/
│   │   ├── place-value/
│   │   ├── fractions/
│   │   ├── decimals/
│   │   ├── percentage/
│   │   ├── money/
│   │   ├── time/
│   │   ├── measurement/
│   │   ├── geometry/
│   │   └── data/
│   │
│   ├── renderers/
│   │   ├── number-line.js
│   │   ├── place-value.js
│   │   ├── number-bond.js
│   │   ├── array.js
│   │   ├── fraction-area.js
│   │   ├── hundred-square.js
│   │   ├── clock.js
│   │   ├── money.js
│   │   ├── ruler.js
│   │   ├── mass.js
│   │   ├── liquid-volume.js
│   │   ├── coordinate-grid.js
│   │   ├── geometry.js
│   │   ├── pictograph.js
│   │   ├── bar-chart.js
│   │   └── pie-chart.js
│   │
│   ├── engine/
│   │   ├── registry.js
│   │   ├── selector.js
│   │   ├── generator.js
│   │   ├── validator.js
│   │   └── legacy-adapter.js
│   │
│   └── schema/
│       ├── curriculum-standard.schema.json
│       └── question-template.schema.json
│
└── legacy/                 # existing system remains intact during migration
```

Exact physical placement may adapt to the repository, but ownership boundaries must remain.

## 4. Curriculum registry contract

Curriculum data describes **what**, never how to render a battle question.

Required fields per competency/SP:

```json
{
  "curriculumVersion": "KSSR-E3-2024",
  "grade": 3,
  "topicId": "D3.T7",
  "contentStandard": "7.1",
  "standardId": "7.1.1",
  "competencyId": "identify_prism",
  "titleMs": "Mengenal prisma",
  "prerequisites": [],
  "status": "enabled"
}
```

Allowed status values:

- `enabled` — bank + generator + validation are production-ready.
- `mapped` — curriculum mapped, but not executable yet.
- `legacy` — retained for compatibility/enrichment, not core completion.
- `retired` — must not contribute to current curriculum mastery.
- `needs_human_review` — source conflict/uncertainty prevents production claim.

## 5. Question template contract

Question templates define **how a competency can be evidenced**.

Required identity/evidence metadata:

```json
{
  "templateId": "D3-T7-711-identify-prism-picture-v1",
  "curriculumVersion": "KSSR-E3-2024",
  "grade": 3,
  "topicId": "D3.T7",
  "standardId": "7.1.1",
  "competencyId": "identify_prism",
  "archetypeId": "identify_from_picture",
  "familyKey": "D3.T7.7.1.1.identify_prism",
  "representation": "visual",
  "demand": "concept",
  "difficultyBand": 1,
  "misconceptionTargets": ["prism_vs_non_prism"],
  "generator": "geometry.identifyPrism",
  "renderer": "geometry",
  "responseType": "mcq"
}
```

Recommended `demand` values:

- `foundation`
- `concept`
- `procedure`
- `application`
- `reasoning`
- `transfer`

Recommended `representation` values:

- `concrete`
- `visual`
- `symbolic`
- `verbal`
- `story`
- `table`
- `number_line`
- `diagram`
- `graph`
- `mixed`

## 6. Evidence-family rule

A competency is not considered broadly evidenced merely because many numeric variants were answered.

Target per enabled SP/competency:

- minimum **3 distinct evidence families** where pedagogically appropriate;
- at least one non-procedural representation when the curriculum expects visual/contextual understanding;
- misconception-clearing evidence must be distinguishable from ordinary correct answers;
- delayed revisit/retention evidence remains separate from same-session fluency.

Example:

```text
Equivalent fraction
├── symbolic equivalence
├── visual area equivalence
└── reasoning / choose matching representation
```

Three variants of `2/4 = ?` are one family, not three.

## 7. Global anti-repetition selector

Anti-repetition belongs to the selector engine, not each grade bank.

Before choosing the next item, inspect recent history and penalise repetition of:

1. exact template/fingerprint;
2. `archetypeId`;
3. `competencyId` when alternatives are allowed;
4. `representation`;
5. `contextId`;
6. identical operation structure.

Selection must preserve pedagogical intent: do not avoid a competency that deliberately requires repeated practice; instead rotate its archetype/representation/context.

Minimum history metadata persisted per question attempt:

```text
curriculumVersion
grade
standardId
competencyId
archetypeId
familyKey
representation
demand
contextId
templateId
```

## 8. Generator library rules

Generators produce mathematically valid parameters, answer and diagnostic distractors. They must not own curriculum routing.

Requirements:

- deterministic mode available through seed for QA;
- domain constraints explicit;
- no ambiguous correct answers;
- unique response choices;
- distractors linked to misconception tags where possible;
- units generated consistently;
- exact-value equivalence checked where fractions/decimals/units can produce duplicate meanings;
- reusable across grades through parameters, not copied per grade.

Example bank constraint:

```json
{
  "generator": "arithmetic.multiply",
  "params": {
    "multiplicandDigits": 4,
    "multiplierSet": [1, 10, 100, 1000],
    "allowRemainder": false
  }
}
```

## 9. Renderer library rules

Renderers are reusable mathematical representation engines. A bank declares a renderer; it does not embed ad-hoc SVG/HTML unless the representation is genuinely unique.

Priority renderer set based on D1–D6 audits:

1. object counting / ten-frame
2. place-value / base-10
3. number bond
4. number line
5. fraction area / fraction bar
6. hundred-square percentage
7. clock
8. money pieces / financial document/table
9. ruler / length
10. mass
11. liquid volume
12. coordinate grid
13. geometry / symmetry / prism
14. pictograph
15. bar chart
16. pie chart

Existing Cikgu Dimensi representation engines should be reused where their contract is suitable rather than recreated.

## 10. Curriculum versioning

The runtime must resolve content through:

```text
curriculumVersion + grade + competencyId
```

Example coexistence:

```text
KSSR-E3-2024 / D1-D3
KSSR-SEMAKAN-2017 / D4-D6
KP2027 / D1
```

Do not silently combine mastery evidence across curriculum versions. A migration policy may explicitly map equivalent competencies later.

A curriculum update normally changes only:

```text
questions/v2/curriculum/<version>/...
questions/v2/banks/<version>/...
```

Generator/renderer code changes only when a genuinely new reusable mathematical interaction is required.

## 11. Legacy compatibility strategy

Question System v2 must be introduced in parallel.

Phase 1 runtime behaviour:

```text
legacy adaptive engine
      ↓
legacy skill id
      ↓
legacy-adapter
      ↓
IF v2 registry has an enabled equivalent AND shadow/pilot flag permits
    generate v2 item
ELSE
    use current production bank
```

No broad skill is retired until all mapped competencies are executable and validated.

## 12. Findings from the six audits that become architecture requirements

### D1
- Broad nodes are too coarse for independent KSSR competency evidence.
- Numeric variation is not cognitive variation.
- Curriculum version must distinguish Edisi 3 from legacy DSKP placement.
- Avoid solving quality problems by adding another wrapping script.

### D2
- Existing visual helpers are not sufficient if assessment generators never use them.
- Different SPs must not share an identical cognitive generator unless the evidence contract explicitly allows it.
- Automated ambiguity checks are mandatory for fraction equivalence and chart ties.
- Fixed/small prompt pools must fail variety QA.

### D3
- Curriculum registry can exist before runtime activation.
- 50 SP baseline demonstrates why mapped and enabled statuses must be separate.
- New SPs must not enter the adaptive graph before generator/evidence/state readiness.
- D3 is the pilot grade because its audit already has explicit curriculum source-of-truth and coverage baseline.

### D4
- Competency/archetype rotation is better than numeric-only randomisation.
- Evidence metadata is useful, but mastery must not be rewritten until evidence persists across sessions.
- Multiple-choice recognition cannot be claimed equivalent to literal construct/draw outcomes.

### D5
- Year-specific runtime repair wrappers and dynamic loader ordering are technical debt.
- Useful metadata (`competencyId`, `archetypeId`, `representation`, `demand`, `misconceptionTargets`) should become universal schema fields.
- Generic helper logic, tables, charts and anti-repeat logic should move out of the D5 repair file into shared libraries.

### D6
- Coverage improvements in operations, fractions, decimals, percentage, ratio, time zones, space/data and financial literacy should be preserved as bank specifications.
- Script-order dependency between depth/repair layers is unacceptable in v2.
- Year 6 Money's archetype breadth is a useful content model, not a runtime architecture model.

## 13. Pilot migration — Darjah 3

D3 is the first production pilot.

### Step A — curriculum import

Import the audited D3 SP registry into:

```text
questions/v2/curriculum/kssr-e3-2024/d3.json
```

All 50 SP records start as `mapped` unless a v2 executable bank is implemented and validated.

### Step B — Topic 7 first

Migrate the reviewed Topic 7 archetypes without the legacy wrapper pattern:

- 7.1.1 identify prism
- 7.1.2 prism features
- 7.1.3 prism vs non-prism
- 7.2.1 regular polygon
- 7.2.2 polygon pattern
- 7.3.1 symmetry

Place bank/template definitions under:

```text
questions/v2/banks/kssr-e3-2024/d3/space.json
```

(Corrected in Phase 1.1 — see "Phase 1.1 addendum" at the end of this
document. Template metadata is JSON; `.js` under `banks/` is not used.)

### Step C — shadow validation

For each D3 Topic 7 template:

- generate at least 500 seeded samples;
- assert one valid answer;
- assert unique distractors;
- assert required metadata;
- assert expected representation/demand distribution;
- inspect structural fingerprints;
- verify no out-of-scope perimeter/area items count toward Topic 7.

### Step D — pilot gate

Only enable D3 Topic 7 through `legacy-adapter` when all tests pass. Other D3 skills continue using production legacy banks.

## 14. Validation gates

### Gate 1 — schema
- all curriculum records validate;
- all templates validate;
- no unknown curriculum version/grade/SP references.

### Gate 2 — mathematical integrity
- >=500 seeded samples per template during migration;
- 0 ambiguous answers;
- 0 duplicate response meanings;
- 0 invalid unit/domain states.

### Gate 3 — curriculum evidence
- each enabled competency maps to at least one valid template;
- target breadth documented per competency;
- visual-required competencies have suitable representation evidence.

### Gate 4 — repetition
- no exact prompt repeat within configured recent window;
- archetype repetition measured;
- representation/context concentration reported.

### Gate 5 — runtime regression
- battle receives a question with existing compatible answer contract;
- hint/diagnostic fields remain compatible;
- no changes to battle animation, rewards, parent UI or Supabase;
- legacy fallback works when a v2 competency is not enabled.

### Gate 6 — curriculum-version isolation
- evidence from different curriculum versions is not silently merged.

## 15. Migration order after D3 pilot

1. D3 Topic 7 pilot.
2. D3 remaining P0 gaps.
3. D1 — competency granularity + early visual/concrete evidence.
4. D2 — fix known invalid/ambiguous generators and visual gap.
5. D4 — migrate broad existing archetype coverage.
6. D5 — extract coverage patch content into v2 bank/shared utilities.
7. D6 — consolidate depth + space/data + money into one v2 registry.
8. Only after persistence is proven: competency/evidence-family mastery upgrade.

## 16. Definition of done for Question System v2 architecture

Architecture is considered established when:

- D3 Topic 7 can run from v2 without monkey-patching the D3 bank;
- removing/replacing a D3 bank file does not require changing `index.html` script order;
- curriculum data can list mapped but disabled SPs safely;
- validator can report coverage and generation quality independently of battle;
- legacy system remains functional for all non-migrated grades/topics;
- a future curriculum folder can coexist without forking battle/adaptive/UI code.

## 17. Phase 1.1 addendum — architecture hardening (no content migration)

Applied after Phase 1 was reviewed and accepted, before any Topic 7 content
was ported. Question System v2 remained completely dormant/additive
throughout. Full detail: `questions/v2/README.md`,
`questions/v2/build/README.md`.

### 17.1 Bank/template source of truth (resolves §3/§13 ambiguity)

**Rule:** question bank/template metadata is **JSON**, always. A bank file
looks like `questions/v2/banks/<curriculumVersion>/<grade>/<topic>.json`
(e.g. `banks/kssr-e3-2024/d3/space.json`), tagged
`"schema": "pa.qsv2.template-set.v1"` with a `templates: [...]` array, each
entry validated against `question-template.schema.json`.

Executable JavaScript lives **only** in:
- `questions/v2/generators/` — reusable parameter/answer/distractor generation,
- `questions/v2/renderers/` — reusable visual representation engines,
- `questions/v2/engine/` and `questions/v2/build/` — runtime/build infrastructure.

There must never be duplicate template metadata maintained in both a `.js`
bank file and a `.json` record. §13 Step B's `space.js` reference above is
corrected to `space.json` accordingly. `questions/v2/engine/registry.js`
already only reads `banks/**/*.json` — it required no change.

### 17.2 Browser runtime boundary (resolves the Node-vs-browser gap)

Question System v2's Node-side files (`fs`, `path`, `require`) are
validation/build tooling only; Pahlawan Angka's production runtime is a
static browser app with no bundler. Phase 1.1 adds an explicit build
boundary instead of any per-grade script loader or async runtime fetch:

```text
AUTHORING (curriculum/**, banks/**, generators/**, renderers/**)
        ↓
NODE BUILD  (questions/v2/build/build.js)
        ↓
BROWSER RUNTIME ARTIFACT  (questions/v2/dist/runtime.js)
        → window.PAQuestionSystemV2
```

`questions/v2/dist/runtime.js` is a generated, deterministic, dependency-
free artifact. It is **not** referenced by `index.html` in Phase 1.1 — it
exists and is verified, but nothing loads it into the live page yet.
Generator/renderer authoring files are plain scripts calling a global
`registerGenerator(key, fn)` / `registerRenderer(key, fn)` (no
`module.exports`, no Node globals), so the exact same file text can be
Node-loaded for validation and byte-concatenated into the browser bundle —
see `questions/v2/build/README.md` for the full contract.

### 17.3 Hardened cross-reference validation

`validateTemplateSet` now resolves a template to exactly one curriculum
record via `(curriculumVersion, grade, standardId)`, then requires the
template's `competencyId` **and** `topicId` to match that same record — not
merely to exist somewhere in the curriculum set. A template naming a real
competencyId that belongs to a *different* SP is rejected.

### 17.4 Enabled-readiness gate

A record's `status` string alone was never sufficient evidence that v2
coverage exists. `validateEnabledReadiness` now requires, for every
`status="enabled"` record: at least one template that exactly targets it,
a registered `generator` key, a registered non-null `renderer` key, and an
overall-valid template set. `"mapped"` records are exempt — they are not
required to have any executable template yet.

### 17.5 D3 Topic 7 competencyId — canonical vs provisional

The six D3 Topic 7 `competencyId` values are now canonical (human-reviewed,
locked for the pilot): `identify_prism`, `describe_prism_features`,
`classify_prism_vs_non_prism`, `identify_regular_polygon`,
`create_regular_polygon_pattern`, `identify_and_draw_symmetry_axis`. Every
D3 curriculum record now carries `competencyIdStatus: "canonical" |
"provisional"`. The remaining 44 D3 `competencyId` values stay
auto-generated/provisional pending later review. No `status` field changed
— all 50 D3 SPs remain `"mapped"`.
