# Cikgu Dimensi entry v1 — draft movement preview

Built-in imagegen generated three new transparent key-pose sprites from the approved idle-v1.webp and summon-land-clean-v2.webp references. Existing idle, landing and summon FX assets were preserved.

## Deliverables

- assets/coach/cikgu-dimensi/full-body/entry-v1/anticipate-v1.webp
- assets/coach/cikgu-dimensi/full-body/entry-v1/fall-v1.webp
- assets/coach/cikgu-dimensi/full-body/entry-v1/preland-v1.webp
- audit/cikgu-dimensi-entry-preview.html (interactive HTML5 Canvas preview)
- audit/cikgu-dimensi-entry-preview.webp (looping 800x520 movement preview)

All three source sprites are 1254x1254 RGBA. Lossless WebP exports use exact=True and were compared byte-for-byte after RGBA decoding to their generated PNG masters. Alpha range is 0..255. Generated PNG masters remain in the Codex generated_images folder. The animated preview is a rendered scene, not a sprite atlas.

## Prompt set

Common identity/style: Use case identity-preserve. One full-body sprite of the exact same Cikgu Dimensi. First reference locks face, hair, proportions, outfit and painted 2.5D style; second reference locks the three-quarter viewer-right orientation and eventual near right palm landing. Preserve youthful chibi face, large brown eyes, swept spiky brown hair with one broad pale-blue forelock, navy and royal-blue robes, cyan lining, gold geometric trim, white collar, cyan belt gem, charcoal trousers and gold-trimmed blue boots. Closed blue/gold book securely clipped at left hip, ornate gold/cyan crystal staff secured to back, hands empty. Full silhouette with padding on a square genuine transparent RGBA canvas. No external FX, aura, ring, portal, particles, ground, cast shadow, text, background, duplicate characters or sprite sheet.

Anticipation: Natural shallow crouch before jumping down. Both knees moderately bent, torso forward, determined friendly gaze downwards, both arms drawn backward, feet ready to launch. Both hands clear of ground. Preserve reference identity and outfit; change body pose and robe drape only.

Fall: Mid-air vertical downward fall. Elongated body, torso slightly forward, legs hanging down with knees soft, one knee slightly ahead, toes down. Arms swept upwards/back by air resistance. Cape and loose sleeves flutter strongly upwards. Head looks down toward landing target. Not a crouch, seated pose, sideways run or ground contact.

Preland: Airborne immediately before the approved landing. Torso leaning low forward, knees drawing up asymmetrically, near right arm reaching forward/down with spread open palm and visible fingers. Palm has not yet touched ground. Other arm behind for balance; both feet suspended, one tucked beneath and one forward. Cape/hair tips trail upward. Same camera and facing direction as existing landing.

## Motion and validation

Timeline is 4s plus a 1s hold in the looping export. Portal reveal and preparation precede the launch, accelerated fall and hand extension. Contact time is 2.74s. The existing summon FX is a separate draw layer and uses exactly the landing transform. Runtime checks verified FX absent at 2.73s and drawn at 2.86s. All six local sprite/FX assets loaded through the same Canvas drawing script. Reduced-motion mode renders standing idle directly. The final land frame fades out as idle fades in.

Source anchors are normalized in the preview. Common pixel scale compensates for the taller 1024x1536 idle canvas. Root inspected rendered preparation, preland, impact and standing frames. Preview is key-pose based, with brief pose blending; it is not a finished in-between-frame animation. No Restu rules, scoring, game entry hooks or production deployment changed.

## Integrated scene v2 (2026-10-26)

The main HTML preview now uses the real Segel Three.js arena and the production Restu sequence. The pose-only draft remains at cikgu-dimensi-pose-preview-v1.html and the original animated WebP remains a pose study. The integrated scene holds a 3.65x face close-up, uses the arena parallax implementation while pulling back to full view before contact, mirrors teacher and FX left, and completes the landing before the existing Restu video. It retains the existing three rapid wrong-answer trigger, guardian PIN/review, and the current retry question. All new bitmap assets are WebP. The isolated preview has a local-only stage boot helper, synthetic demo state, test PIN1234 and no cloud/learner saves.

Validation:73 targeted regressions passed; independent Astra review found no material issue within the reviewed scope. Actual WebGL rendering/browser focus could not be visually inspected because local browser control is disabled in Work settings. Frame math, FX contact gating, cancellation, fallbacks, reduced motion and production retry gates were exercised through the real functions in VM tests. No Netlify deployment was made for this scene.
