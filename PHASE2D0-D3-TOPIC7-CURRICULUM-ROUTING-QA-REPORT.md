# Phase 2D-0 — D3 Topic 7 Curriculum Identity / Routing Correction QA Report

**Status:** ready for guarded deployment on top of production commit `2421bf1f7a302453079ebac1292499b79c102a34`.

## Finding being corrected

The production compatibility skill `D3.SHAPE` is currently titled **Bentuk & perimeter asas** and its visible legacy bank only rotates rectangle perimeter, missing-side-from-perimeter, and rectangle-side-count items. That legacy coverage does not represent the reviewed D3 Topic 7 Question System v2 curriculum target, which contains:

- 7.1.1 identify prism
- 7.1.2 describe prism features
- 7.1.3 classify prism vs non-prism
- 7.2.1 identify regular polygon
- 7.2.2 create regular polygon pattern
- 7.3.1 identify/draw symmetry axis

## Safety decision

Phase 2D-0 **does not rename `D3.SHAPE`**. Existing profiles persist mastery under `db.skills['D3.SHAPE']`; changing that ID would fragment saved progress.

Phase 2D-0 also **does not change the learner-facing title yet**. The production bridge is still default SHADOW, so learners still see legacy perimeter questions. Relabelling the visible skill as Prisma/Poligon/Simetri before the LIVE switch would create a misleading title/question mismatch.

Instead this phase adds an explicit curriculum identity layer while keeping the learner path unchanged.

## New correction layer

`data/kssr/d3-topic7-curriculum-correction-v3.38.0.js`

It annotates the existing `D3.SHAPE` object with:

- compatibility/save key: `D3.SHAPE`
- curriculum topic: `D3.T7`
- target title: `Prisma, Poligon Sekata & Paksi Simetri`
- exact six standard IDs
- exact six competency IDs
- legacy question coverage (`perimeter`, `missing_side`, `rectangle_property`)
- legacy bank role: `shadow_fallback_only`
- target question system: `qsv2`
- explicit mastery compatibility warning

The correction is fail-open and contract-guarded: if the expected D3.SHAPE graph contract is missing or changed, it refuses to mutate the graph rather than guessing.

## Mastery continuity rule

Old `D3.SHAPE` evidence came from perimeter/sides. It must **not** silently become evidence that a learner has mastered Prisma/Poligon/Simetri.

The correction therefore records:

- `legacyEvidenceAcceptedForTopic7: false`
- `requiresEpochMigrationBeforeLive: true`

The current mastery profile title/concepts/thresholds are intentionally left unchanged during SHADOW. Phase 2D LIVE must perform an explicit evidence epoch/sub-mastery migration before the new curriculum target becomes learner-facing.

## Progression correction

Preserved:

- persistent skill ID `D3.SHAPE`
- Year 2 recovery for `D3.SHAPE -> D2.7.3`
- Year 2 stretch `D2.7.3 -> D3.SHAPE`
- existing `D4.PERIM` graph prerequisite for compatibility/history

Suppressed:

- active stretch `D3.SHAPE -> D4.PERIM`

That stretch was based on the old perimeter semantics and is no longer a valid automatic stretch from the corrected D3 Topic 7 identity.

## Learner-visible behavior after Phase 2D-0

Unchanged:

- QS v2 default remains SHADOW
- bridge still returns `null` in shadow
- learner still receives legacy D3.SHAPE question
- no LIVE button
- no battle/adaptive/mastery score rewrite
- no Supabase migration
- central shadow telemetry remains active

## Validation

### Phase 2D-0 dedicated QA

`node questions/v2/validation/phase2d0-curriculum-route-qa.js`

**36/36 checks passed.**

Verifies:

- D3.SHAPE object identity and ID remain unchanged
- no replacement D3.T7 persistent skill is created
- learner title remains unchanged while SHADOW
- exact D3.T7 standard/competency mapping
- save compatibility metadata
- legacy coverage declaration
- legacy evidence cannot silently count as Topic 7 evidence
- explicit pre-LIVE mastery migration gate
- recovery preservation
- only invalid D3.SHAPE -> D4.PERIM stretch is suppressed
- unrelated topology remains unchanged
- mastery metadata is non-operative during SHADOW
- idempotency
- contract mismatch refuses mutation
- actual registry remains total 50 / enabled 6 / mapped 44

### Existing QS v2 regressions

- build check: PASS
- self-test: **71/71**
- CLI: PASS (`mapped=44 enabled=6`)
- Prisma QA: **30,234/30,234**
- Polygon/symmetry QA: **37,037/37,037**
- Phase 2B routing QA: **13,559 checks, pass; defaultMode=shadow**
- Phase 2C shadow QA: **46/46; visibleParity=off===shadow**
- Phase 2C.1 central sync QA: **36/36**
- Phase 2D-0 curriculum route QA: **36/36**

Local QS total: **81,019 passing assertions/checks**, zero failures.

## Production deployment regressions required

The deployment agent must additionally run on the full current repo before committing:

- `node audit/content-integrity-v3.18.1.js`
- `node audit/adaptive-e2e-v3.12.1.js`

Both must exit 0.

## Files intended by this phase

New:

- `data/kssr/d3-topic7-curriculum-correction-v3.38.0.js`
- `questions/v2/validation/phase2d0-curriculum-route-qa.js`
- `PHASE2D0-D3-TOPIC7-CURRICULUM-ROUTING-QA-REPORT.md`

Modified by guarded installer:

- `index.html` — load correction after alignment + release cache bust
- `sw.js` — precache correction + release header
- `js/version.js` — 3.37.0 -> 3.38.0

No question bank, battle, adaptive algorithm, mastery score, Cikgu Dimensi routing, parent control, or Supabase schema is changed.
