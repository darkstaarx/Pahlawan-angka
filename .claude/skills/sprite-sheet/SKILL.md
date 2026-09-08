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

**Frames are scaled on body height, not total height** (`--anchor body`, the
default). Normalising to the same *total* height looks right until a frame is
drawn with a shorter prop: that frame then gets stretched until its body is
bigger than the others, and the character pumps once per loop. It is the most
visible defect this pipeline can produce and it is entirely self-inflicted —
a user spotted it as "kejap besar kejap kecil" before the numbers did.

Measured on a real 8-frame sheet whose sword length varied (`propRise` 4 to
20px): anchored on the full box the drawn body varied 12px of 315px (3.8%);
anchored on the body it varied 0px. Verified again on the rendered page —
body height, head top and foot centre all held to within 1px across the whole
cycle.

The slicer reserves headroom from the largest `fullH / bodyH` ratio on the
sheet, so the longest prop still fits inside the canvas. It prints the drawn
body spread every run and warns above 3%. `--anchor full` restores the old
behaviour; there is rarely a reason to use it.

What body anchoring does *not* fix is the prop itself — a frame drawn with a
shorter sword still shows a shorter sword. That is the art's own business and
far less noticeable than a body that changes size. `report.json` carries
`propRise` per frame and the slicer names any frame far below the median, so
you can decide whether to regenerate it.

## Ask what the order is before ranking anything

A sheet generated to a spec usually **already has an authored order** — frames
laid out left to right, wrapping to the next row. Ask, or check whether the
frames read as a sequence, before reaching for `rank`. `rank` exists to
rescue a sheet whose frames are independent drawings in arbitrary order. It is
not the default step, and running it on an ordered sheet throws away the
intent.

**The cost metric is blind to meaning.** It compares pixels; it does not know
what a face is. On a sheet with two deliberate blink frames it picked exactly
those two as the smoothest possible loop — they resembled each other more than
anything else on the sheet, so the "best" animation was a hero standing with
his eyes shut. Nothing in the numbers can catch that.

So before trusting any winning cycle, crop the heads and look at them. Eyes,
expression and gaze direction all matter and none of them are measurable here:

```js
// in a page.evaluate over the sliced frames — the head sits upper-right
const sx = Math.round(img.width * 0.42), sy = Math.round(img.height * 0.10);
ctx.drawImage(img, sx, sy, 190, 120, gx, gy, 190 * 2.4, 120 * 2.4);
```

Blink frames are an asset, not a defect. Keep them in the sequence at the
position the artist put them, give them their own shorter hold, and use a
faster transition into and out of them — a blink is a snap, not a dissolve.

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
