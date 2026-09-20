# Pet collection asset contract

## Audited source of truth

The approved roster is `assets/pets/collection/mockups/pet-roster-v1.png`. The five extracted base sprites are the approved full-colour designs. Their original `idle.png` files remain unchanged.

Aurora does not currently have `happy` or `sad` files. Its real runtime set is `front.webp`, `battle.webp`, `standby-v2.webp`, `attack-v2.webp`, `hub/adventure-v1.webp`, and anticipation/follow-through frame pairs in PNG and WebP. Therefore the collection UI contract is intentionally separate: each new pet has `idle.png`, `happy.png`, and `sad.png` in its existing folder. `happy.png` is a byte-for-byte copy of the approved idle art; `sad.png` changes facial emotion only.

All new collection states use 1254 × 1254 RGBA PNG canvases with transparent backgrounds. The approved source cutouts sometimes touch an outer canvas edge, so runtime `happy.png` and `sad.png` are uniformly scaled to 90% and centred, creating a 63 px transparent safety inset without changing proportions. UI code should use `object-fit: contain`; it must not assume that the subject fills an identical bounding box because the approved silhouettes differ by species and accessories.

## Base-form checklist

| Pet ID | Folder | Base design invariant | idle | happy | sad |
| --- | --- | --- | --- | --- | --- |
| `ketupatKura` | `ketupat-kura` | Turtle, woven ketupat shell, bamboo cannon and gold rope | ✓ | ✓ | ✓ |
| `harimauBunga` | `harimau-bunga` | Tiger whose tail fur organically becomes a hibiscus plume | ✓ | ✓ | ✓ |
| `kumbangManggis` | `kumbang-manggis` | Mangosteen beetle, leafy crown and gold trim | ✓ | ✓ | ✓ |
| `arnabKekLapis` | `arnab-kek-lapis` | Rabbit with ears made from layered Sarawak cake | ✓ | ✓ | ✓ |
| `durianKerbau` | `durian-kerbau` | Normal buffalo wearing a separate durian-shaped paddy caping | ✓ | ✓ | ✓ |

## Evolution file matrix and art direction

Evolution filenames are reserved but must not be requested by runtime until reviewed art exists. Base art is the fallback for all stages meanwhile.

| Stage | Level | Reserved directory | Direction |
| --- | ---: | --- | --- |
| Base | 1 | `<pet>/` | Approved roster design, no additions |
| Evolution I | 10 | `<pet>/evolution-1/` | Subtle growth and one culturally grounded detail; preserve species and silhouette identity |
| Evolution II | 25 | `<pet>/evolution-2/` | Stronger material finish and companion presence; retain the same core palette and defining prop |
| Final Evolution | 45 | `<pet>/evolution-3/` | Ceremonial polish and fuller silhouette while remaining friendly, readable, and cosmetic only |

Each future stage must provide `idle.png`, `happy.png`, and `sad.png` on the same 1254 × 1254 transparent canvas. Art review must verify these pet-specific rules:

- Kura: cannon remains bamboo and shell remains woven ketupat, never military realism.
- Harimau: the hibiscus must grow organically from tail fur, never appear pasted on.
- Kumbang: preserve mangosteen segmentation, leafy crown, six-legged beetle readability, and gold trim.
- Arnab: ears remain structurally made from kek lapis Sarawak; patterns may become richer without turning into ordinary fur ears.
- Kerbau: body remains a normal buffalo; only the separate caping uses durian form and spikes.

No evolution art should confer maths hints, speed, damage, mastery, timer, or other gameplay advantage.

## Generation record

The five `sad.png` files were produced with the built-in image generation tool as precise facial-expression edits of each approved `idle.png`. The shared prompt locked pose, silhouette, camera, scale, costume, palette, texture, accessories, transparent alpha, and square framing; it requested only raised inner eyebrows, watery eyes, and a small worried frown suitable for children. The five `happy.png` files derive directly from the approved sources rather than regenerated interpretations. Both runtime states receive the same deterministic 90% canvas normalization; original `idle.png` files remain byte-for-byte untouched.
