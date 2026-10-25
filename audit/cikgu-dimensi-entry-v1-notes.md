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

## Approved cinematic spacing and quick cut (2026-10-26, 3.87.59 draft)

Preserves the owner's approved epic close-up/parallax/dive/impact. The full landing pose
starts at 1500ms; the existing Portal Restu video follows at 2500ms with no additional tail.
The wide shot computes three groups from actual visible alpha bounds, including the equipped
companion with Wira and the rescue pet with its active dome. Viewport projection and camera
punch determine a common scale only when needed, with a 5.5% viewport gap between groups.
All temporary positions/scales are restored before each tick, resize, cancellation and video.
Impact particles/trails/radii share Cikgu's render transform, and owned particles are cleared
when the entry ends. The existing trigger, retry question, PIN and review stay unchanged.

Evidence: `audit/restu-layout-timing.test.js` executes real production functions. It checks
9 viewport shapes (320x568, 360x800, 390x844, 768x1024, 844x390, 1366x768, 1920x1080,
390x240 and 600x768), surprise/landing states, Gangsa/Perak/Emas artwork, companion spacing,
no clipped silhouettes, repeated frames, resize, cancel, FX alignment and the actual entry
promise deadline. Native Canvas WebP measurements use the real `measureAt()` and are locked
to source asset SHA-256 hashes in `fixtures/restu-alpha-metrics.json`. These are geometry
checks, not browser screenshots. Actual browser/device visual verification remains pending:
local browser control is disabled in Work settings. Astra reviewed the final helper lifecycle
and FX fix with no remaining material findings. GitHub update only; no Netlify deployment.

Final verification: 95 targeted tests passed; JavaScript syntax and diff whitespace checks passed. Asset manifest remains current at 835 assets; this update changes no bitmap assets.

## Faster cut, fixed background and Wira speech (2026-10-26, 3.87.60 draft)

Supersedes the one-second tail above: full landing at 1500ms, hold 500ms, then existing
video at 2000ms. Restu-only inverse-zoom and crop-center compensation keep texture landmarks
fixed on screen for both arena image and ground overlay, independently at each layer's depth.
Approved actor-camera motion and foreground effects remain. Normal battle parallax keeps its
original response outside Restu; ending/cancelling restores the normal arena framing.

On the wide reveal, Wira's existing dialogue element displays “Eh, Cikgu Dimensi!” in a
spiky surprise burst, with the full sentence immediately visible. The optional reaction-art
fallback still gets the bubble. It follows Wira's final render position and clears with its
timer/classes/fixed width on entry completion/cancellation, before the video.

`audit/restu-background-bubble.test.js` executes the real production functions to compare
texture-landmark projections across six viewport shapes and all actual dive/impact camera
beats, including shake. It also checks ordinary parallax, one-shot/replay/optional-art speech,
mobile placement margins and completion cleanup. The actual entry promise test now asserts
500ms after landing and a 2000ms deadline. Astra found no material issue. Browser visual
inspection is still unavailable because local browser control is disabled in Work settings.
GitHub only; no production deployment.

Final verification for 3.87.60: 105 targeted tests passed; JavaScript syntax and diff checks passed.
