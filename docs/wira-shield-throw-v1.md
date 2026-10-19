# Wira Chibi: shield throw v1

Adds a second regular attack alongside the existing ice sword combo. A successful Chibi attack alternates slash, shield throw, slash. The shield launches from Wira's empty hand, hits once at 1050 ms, and returns before the 1320 ms sequence ends. Pet assistance adds the existing 420 ms lead. Gameplay damage and finishers keep their existing owners.

Assets retain real alpha transparency. PNGs are the original image_gen output; WebPs are lossless copies with identical decoded RGBA pixels.

Generated with built-in image_gen using only assets/heroes/wira-chibi/idle.webp as the visual reference.

## Verification

- `node audit/wira-chibi-shield-throw.test.cjs`: passes alternation, one contact deadline, pet lead, decode fallback, reduced motion, cancellation and gameplay-state integrity.
- `node audit/loading-cache-install.test.cjs`: passes asset hash and cache update checks.
- `node tools/generate-asset-manifest.cjs --check`: current, 784 assets.
- Syntax and diff checks pass.
- Local Edge browser preview inspected at 1024px and 390px widths, with real decoded sprites at release, contact, return and idle; no browser errors. Preview: `audit/wira-shield-throw-preview.html`.

## Release pose prompt

Use case: identity-preserving game sprite pose edit. This exact Wira Chibi reference is the canonical production character. Create ONE NEW transparent full-body attack-release sprite for Wira THROWING HIS SHIELD to the RIGHT of the image. Preserve the exact character identity, small compact chibi anatomy, head size, facial features, brown spiky hair, blue headband with yellow crescent and star, blue/gold warrior armor with red chest jewel and diamond belt gem, brown leather boots and golden knee armor, cape and warm painted shading from the reference. Wira stands on the same ground level and faces screen RIGHT toward his enemy. His LEFT arm (on viewer's RIGHT, formerly the shield arm) is fully extended toward screen RIGHT with an EMPTY OPEN gloved hand, fingers showing a throwing follow-through. The shield has just LEFT HIS HAND and is OFF CANVAS: NO SHIELD anywhere in this image, no shield attached to his arm or back. His RIGHT hand (viewer's LEFT) still holds his normal glowing cyan ice sword with gold hilt, lowered diagonally to screen LEFT, inactive with only a restrained glow. Torso rotates into the throw, left foot slightly forward, broad feet planted, no jumping, energetic compact readable throwing pose. Expression determined and focused, mouth closed. Scarf/cape tails trail left. Match the reference's actual rounded sprite rendering, dark clean contours, short limbs, softly painted volume and detail density. No extra hands, no extra weapons, no projectile, no text, no speed lines, no aura, no cast shadow, no background. Keep all hair, sword, boots, hand and cape inside the frame, crop reasonably close with modest transparent margin, actual alpha transparency. It must read as one action frame from this exact Wira's existing sprite pack, not a new costume.

## Projectile prompt

Use case: precise-object-edit / standalone game projectile asset. From this exact Wira Chibi reference, create ONLY his blue and gold shield, isolated on true transparent alpha background. The shield matches the one worn on the viewer's RIGHT of the reference: broad curved kite/heater shape, thick beveled warm golden rim, rich royal blue enamel face, a clearly readable yellow crescent and many-pointed yellow star emblem, small cyan diamond at the lower tip, tiny gold rivets. Preserve the exact same warm hand-painted mobile RPG sprite material finish, rounded gold bevels, dark brown contour and deep blue shading as the reference. Three-quarter frontal view with the emblem clearly facing the viewer, top rounded/angled shoulders and pointed bottom. It is a thrown projectile asset intended to spin in code, so render it UPRIGHT and STILL, NO motion trails or effects. Entire shield inside frame with generous transparent margin. No character, no hand, no arm, no straps sticking out, no sword, no stand, no scenery, no glow cloud, no text or watermark. One shield only.
