# Pahlawan Angka — Combat Polish Lock v3.21.2

## World Response
World Response is cancelled. Do not surface its Hub card, world map, landmark state, DEV preview or stored experiment state unless a future product decision explicitly reintroduces a redesigned concept.

## Boss presentation
- Idle, anticipation, contact and follow-through frames use the same boss box.
- All boss frames anchor to the same bottom baseline.
- Boss attack travel may translate horizontally but must not resize through `scale()`.
- Contact shadow should travel with the boss enough to preserve grounding.

## Victory
- Boss defeat triggers a brief celebratory beat before the existing checkpoint.
- Hero celebrates and the selected visible pet celebrates at the same time.
- Animate inner visual artwork, not the unit wrapper, so feet/base position stays stable.
- Keep the beat short enough to finish before the existing boss checkpoint takes focus.

## Terrain grade
- All topic terrains should be less saturated and slightly darker than their source artwork.
- Never lower opacity/filter of the entire battle container because that also degrades hero/pet/enemy clarity.
- Tone the background on a dedicated layer behind the combatants.

## Boss typed answers
Retain the v3.21.1 rule: maximum two safely-normalisable typed items per normal boss, with one or zero acceptable and no forced quota.
