# Asking an image model for a usable sprite sheet

Image models do not satisfy pixel specs. Telling one that "the sword tip must
rise 16px above the head" does nothing. What works is naming the failure mode
in visual language, and naming it prominently enough that it survives a long
prompt.

Two Wira sheets have been generated so far. Both failed the same way:

| Sheet | What broke |
|---|---|
| 8 frames, 2 rows | F1 drawn with no ice shards on the blade; every other frame had them |
| 4 frames, 1 row | F3 drawn with a much shorter sword |

Both times it was the sword. Whatever the character is holding is the thing
that drifts, so it gets its own paragraph rather than one clause in a list.

## Full sheet

```
Generate a horizontal sprite sheet: 1 row, 4 frames, transparent PNG.

Character: chibi Malaysian boy hero, spiky dark-brown hair, blue headband
with gold crescent-and-star, navy-and-gold coat with songket pattern,
glowing blue ice sword raised in the left hand, Malaysian flag shield on
the right arm, brown boots. Wide battle-ready stance, three-quarter view
facing right.

This is a 4-frame IDLE BREATHING LOOP of ONE character, not four separate
drawings. Frame 4 must lead back into frame 1 seamlessly.

THE SWORD IS THE MOST IMPORTANT THING TO KEEP CONSTANT. In all four frames
the sword must be the exact same length, the exact same width, held at the
exact same angle, with the exact same number of floating ice shards around
the blade and the same glow intensity. Do not shorten it, do not lengthen
it, do not change how far the tip rises above the head, do not add or
remove shards. If any single element is identical across the four frames,
it must be the sword.

ONLY these things change across the frames:
- chest and shoulders rise slightly on frames 2 and 3, settle on frame 4
- head bobs up about 3 pixels on frame 3
- headband ribbon drifts back, then settles

Everything else stays pixel-identical: camera distance, crop, character
height, feet position, stance, lighting and shadow direction, colours,
coat and songket pattern, shield artwork, shield angle, face and eyes.

Layout: all four frames the same size, feet resting on the same baseline
in every frame, at least 40px of empty transparent space between frames
and around all edges. No frame may overlap its neighbour. No background,
no ground line, no drop shadow, no text, no frame numbers, no borders.
```

Ask for **one row**. A two-row sheet drifts in scale between the rows — the
first Wira sheet's second row sat 12px higher with a 6px mean height
difference. Normalisation hides it, but a single row never introduces it.

Ask for **generous gutters**. Without them, neighbouring frames overlap and
the boundaries have to be recovered from alpha valleys instead of read off
the layout.

## Repairing one frame

Higher success rate than regenerating the set, and it cannot drift, because
the model is editing a frame that is already correct rather than inventing
four at once.

```
Here is frame 1 of my idle animation. Produce one new frame that is
identical to it in every way except: the chest and shoulders are raised
slightly as if breathing in, and the headband ribbon drifts a little
further back.

The sword must be exactly the same — same length, same angle, same width,
same ice shards, same glow. The character must be exactly the same size,
standing in exactly the same spot, with the feet on the same line.

Transparent background, nothing else in the image.
```

## Check by eye before measuring

Five things, all visible without tooling. Catching one here saves a round
trip.

1. **Prop length.** How far does the sword tip rise above the head in each
   frame? One frame clearly lower means that frame is bad.
2. **Glow detail.** Roughly the same number of ice shards everywhere, or is
   one frame bare?
3. **Feet.** Do the back heels sit on the same line across frames?
4. **Layout.** One row, with clear empty space between every frame?
5. **Background.** Actually transparent, not white and not black.

All five pass, run `slice` then `rank`. Any one fails, fix that frame first —
the measurements will only tell you the same thing more slowly.
