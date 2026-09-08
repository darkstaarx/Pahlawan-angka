---
name: sprite-sheet
description: Slice a hero sprite sheet into aligned transparent WebP frames and measure which frames make the smoothest idle loop. Use when adding or replacing an animated hero pose (hub idle, battle idle) from a generated sprite sheet, when a sprite animation looks jittery or flickery, or when deciding how many frames a loop should use.
---

# Sprite sheets for Pahlawan Angka heroes

Turns a generated sprite sheet into frames the game can actually use, and
tells you which of those frames belong in the loop.

Everything here was derived by measuring two real Wira idle sheets. The
warnings are not hypothetical — each one cost a round trip before it was
understood.

## Running it

```bash
node .claude/skills/sprite-sheet/sprite.mjs slice <sheet> <outDir> --cols 4
node .claude/skills/sprite-sheet/sprite.mjs rank  <outDir>
```

`slice` writes `f1.webp…fN.webp`, a `contact.png`, and a `report.json`.
`rank` prints the smoothest cyclic order for every frame count.

This box has no Pillow and no ImageMagick. Both commands decode and encode
through headless Chromium, already installed at `/opt/pw-browsers/chromium`.
They need `playwright-core` resolvable from the working directory,
`~/.sprite-sheet`, or `/tmp/sprite-sheet-deps`:

```bash
mkdir -p /tmp/sprite-sheet-deps && cd /tmp/sprite-sheet-deps && npm i playwright-core
```

**Always open `contact.png` and look at it.** A clipped shield is obvious
there and completely invisible in the numbers.

## What the slicer does, and why each step exists

**Frame boundaries sit at the alpha valleys, not at equal divisions.** The
first Wira sheet was 1672px wide with 4 columns, so 418 looked like the
boundary. The real gutters were at x≈425, 843 and 1261, and cutting at
multiples of 418 sliced 7–14px off the shield in 6 of 8 frames. The slicer
searches a window around each nominal boundary and cuts at the lowest-alpha
column it finds.

Pass `--cols` whenever frames touch. Gutter counting can only detect
boundaries that are actually transparent, and overlapping sword glow hides
them — that sheet showed one clean gutter where there were three boundaries.
The script says so in a note when the count disagrees.

**Alignment anchors on the feet, never the bounding box.** The box shifts
with whatever the character is holding, so centring on it makes the body
swim sideways between frames. The slicer takes the horizontal midpoint of
the bottom 6% of solid pixels and plants that on the same spot every frame.

**Body height is measured separately from full height.** Normalising every
frame to the same total height is right until a frame is drawn with a
shorter prop — then that frame's *body* scales up to compensate and the
character appears to pump. This is exactly what happened to F3 of the second
sheet: its sword tip rose 1px above the head where the others rose 16px, so
after normalisation its body was visibly larger. `report.json` carries
`propRise` per frame and the slicer prints a WARNING when one frame is far
below the median. Regenerate that frame or drop it; it is a drawing problem,
not an alignment problem, and no anchor choice fixes it.

## Reading the rank table

Cost is the mean per-pixel colour and alpha difference over the union of two
silhouettes, judged at the size the sprite is actually displayed (178px for
the hub hero — see `.hubHeroCharacter` in `css/hub-adventure-v3.24.11.css`).
Lower is smoother. Roughly:

| Cost | Reads as |
|---|---|
| under 20 | genuinely smooth |
| 20–35 | acceptable with a crossfade |
| over 45 | visible jump, drop or regenerate the frame |

More frames is not smoother. On both sheets the best 3-frame cycle beat the
full set, because one bad frame poisons two transitions. The tool flags the
frame furthest from all the others; dropping it usually wins.

Ranking exported frames reads about 1–2 points higher than ranking straight
off the sheet, because the frames have been resampled twice. Use the numbers
to compare options against each other, not as absolute scores.

Do not mix frames from different sheets. Two generations of the same
character came out 6% apart in mean luminance; interleaving them strobes.

## Playing the loop

Crossfade, never a hard cut — and get the compositing right, because the
obvious way is wrong. Fading the outgoing layer to 0 while the incoming
layer rises to 1 makes total coverage dip to 75% at the midpoint, letting
the background show through as a brightness pulse once per transition.
Measured on the real page: 12% brightness swing, which reads plainly as
flicker.

Keep the outgoing frame fully opaque underneath, and raise only the incoming
frame on top:

```js
imgs.forEach((im, i) => {
  let opacity = 0, z = 0;
  if (i === prev && prev !== cur) { opacity = 1; z = 1; }   // stays solid
  if (i === cur) { opacity = progress; z = 2; }             // rises 0 -> 1
  im.style.opacity = opacity;
  im.style.zIndex = z;
});
```

Same measurement after the fix: 3.9%, and what remains is the character
moving across the background vignette, not flicker.

Layer the loop under the hub's existing `hubAdventureBreathe` transform
rather than replacing it — the frames supply cloth and glow motion, the
transform supplies the body sway.

## Getting a better sheet in the first place

See `PROMPTS.md` for the generation spec, a prompt that repairs a single bad
frame without regenerating the set, and a five-point check to run by eye
before measuring anything.
