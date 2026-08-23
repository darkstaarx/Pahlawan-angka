# Question System v2 — Migration Gates

## Freeze rule
Until D3 Topic 7 pilot passes, do not merge any of the D1–D6 year-specific repair ZIPs directly into production as runtime wrappers.

## Keep from the six agent outputs
- SK/SP/curriculum maps
- coverage status and gaps
- archetype/evidence-family designs
- misconceptions
- representation requirements
- difficulty/demand labels
- useful generator constraints
- validation cases and known bugs

## Reject or refactor
- `previous = banks.dX` wrappers
- runtime monkey-patching
- script-load-order fixes
- dynamic loader hacks in `questions/index.js`
- grade-specific anti-repeat utilities
- duplicated random/math/chart helpers
- claims that MCQ recognition equals literal construction/drawing evidence

## Phase 1 — foundation only
1. Add `questions/v2/` skeleton.
2. Add JSON schemas.
3. Add registry loader that does not alter production selection.
4. Import D3 curriculum source-of-truth as mapped records.
5. Add validator CLI/tests.
6. No mastery rewrite.
7. No production bank replacement.

## Phase 2 — D3 Topic 7 pilot
1. Port Topic 7 archetypes into v2 bank definitions.
2. Move generic geometry generation/rendering into reusable libraries.
3. Run seeded validation.
4. Add legacy adapter behind feature flag.
5. Enable only D3 Topic 7 when tests pass.

## Rollback requirement
One flag or one adapter path must return D3 Topic 7 to the current legacy bank without reverting unrelated code.

## Phase 2B completion note — D3 Topic 7 controlled integration
- The six canonical Topic 7 SPs may be `enabled`; the remaining 44 D3 SPs stay `mapped`.
- Browser runtime is statically loaded; no dynamic loader is introduced.
- `questions/index.js` explicitly consults one legacy adapter before the existing bank loop.
- Default mode is `off`; `shadow` and `live` are opt-in; `killSwitch=true` overrides both.
- Only `D3.SHAPE` is eligible for v2 routing.
- Current battle UI routes MCQ templates only (16/18). The two literal interactive construction/drawing templates remain authored/validated but are not falsely treated as answer-button interactions.
- Gallery questions use visible A–D figure markers and A–D battle choices to prevent answer-label leakage.
- Missing runtime, bridge errors, unsupported response types, or explicit flag-off all fall back to the legacy bank.
