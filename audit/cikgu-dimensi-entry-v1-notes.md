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

## Timing correction (2026-10-26, 3.87.61 draft)

The owner's “0.5s” means cut only 0.5s from the original tail, adding 0.5s back relative
to the earlier 2500ms cut (fac379d). It did not mean hold the landing for only 500ms.
Final deadline is 3000ms: full land at 1500ms, 1500ms hold, then the portal video. The
camera retains its original 1000ms settle after full land and rests another 500ms.
Background lock, Wira burst dialogue, pre-impact animation and responsive gaps remain.
The entry-promise test explicitly checks 2500+500=3000ms, and background/layout suites
cover the restored tail. This supersedes the incorrect 2000ms deadline in 3.87.60.

## Post-impact foreground zoom fix (2026-10-26, 3.87.62 draft)

The owner still saw zoom after impact. The arena planes were fixed, but the independent
2D foreground pass (`drawParallaxFront`) still enlarged grass by zoom^1.25, panned it
with the camera crop, and varied mote size throughout the landing hold. Earlier tests
only observed the WebGL background planes. From contact until completion, foreground
grass/motes now use a fixed center/scale; pre-contact and ordinary battle parallax stay
intact. The 3000ms entry, speech and actor framing are preserved.

A new regression captures the real foreground drawImage/gradient geometry at 1250..2999ms
and requires identical framing and mote size, while confirming opening and ordinary
parallax still respond. A second test uses the checked-in Three.js camera/mesh matrices
to verify arena/ground-overlay landmark projections at real impact/settling beats.
Astra found no material issue. Actual impact continuity still needs browser playback:
local browser control remains disabled. GitHub only; no Netlify deployment.

Verification: 108 targeted tests passed. Running the new foreground regression against the previous HEAD reproduces the bug at 1700ms while the background-plane tests still pass.

## Actor grounding (2026-10-26, 3.87.63 draft)

The fixed arena exposed another mismatch: world GROUND still changed screen row as the
actor-camera crop settled. Render clusters now invert that crop per mesh depth to retain
the original floor row. Grounding starts once the pull-back reaches the arena (zoom <=1.2)
and continues through impact/landing; teacher particles use the same corrected anchor.
The initial close-up/dive, left-facing poses, spacing, fixed background/foreground, speech
and 3000ms deadline remain. Render transforms still restore before updates, resize and cancel.

A surprise texture swap also used the previous canvas position for one tick. The same-tick
swap now applies the difference between old/new offsets to preserve Wira's feet; cleanup
uses the same helper. Successful Restu entry finishes leftover hero hops and pet lifts,
so transient motion cannot leak into the shot or replay after cleanup. Required-asset
loading failure leaves the normal motion state untouched.

Five new regressions execute actual entry/calibration/pose helpers with real WebP alpha
metrics, and actual checked-in Three.js camera matrices: seven viewport shapes x three
dome tiers x eleven reveal/landing beats, checking Wira, pet, companion, dome and both
shadows. They also execute the first normal hop tick after completion/cancellation.
Against the previous reaction/layout functions, the new tests reproduce the one-frame
pose pop and screen-floor displacement. Astra's hop-replay finding was fixed by finishing
transients rather than restoring stale jump state; final review found no material issue.
Actual browser continuity still needs playback because local browser control is disabled.
GitHub only; no Netlify deployment.

Final verification: 113 targeted tests passed; JavaScript syntax and diff checks passed.

## Full companion/target audit (2026-10-26, 3.87.64 draft)

169 independent role/form selections passed 172,800 rendered-frame geometry checks:
none/fallback and all six species x Asas/Bara, nine viewport shapes, three dome tiers,
all selected idle/sad animation frames, and four camera beats. The harness executes real
production petConfig, setPetVisual/setRescuePetVisual, customPetFrames, entry/petUpp,
pose/layout and camera functions, with actual Three.js projection matrices. It verifies
separate identities, companion scale/orientation, group gaps, no clipping, pet inside the
dome, and grounded feet. Evidence uses all 118 logical frames from 59 selected asset files,
measured with actual sheetFrames/measureAt at 96/512px and locked to SHA-256 hashes.
Regenerate using `tools/generate-restu-pet-audit.cjs` with the native Canvas module available.

The real-browser preview now selects companion and target independently, including different
forms of the same species. Its synthetic profiles never write learner storage. A local
/audit/-only stage hook holds the real landing frame for inspection; production entry still
uses the unchanged 3000ms deadline. Unchecking the hold runs the real video/PIN sequence.

Browser control became available this session. Visually checked desktop and 390x844 phone
samples: Kukupat Asas + Keryan Asas; Riya Bara + Bunnis Asas; Keryan Bara + Kumbis Asas;
Bunnis Bara + Kukupat Asas. The normal animation/video reached guardian PIN with no browser
console errors. These are representative visual samples, alongside exhaustive matrix checks.
Screenshot proof is saved in the task's local visualization output folder. Astra reviewed
without material findings. GitHub only; no Netlify deployment.

Final verification for 3.87.64: 117 targeted tests passed; preview syntax, diff checks and the unchanged 835-asset manifest passed.
