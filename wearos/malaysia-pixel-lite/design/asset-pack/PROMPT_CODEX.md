# Copy-paste prompt untuk Codex

Build a functioning, installable **Wear OS round digital watch face prototype** using the **Malaysia Pixel Lite V1** asset pack in the current working folder.

## Inputs

1. Read `README_MULA_DI_SINI.md`, `layout.json`, and inspect `preview_showcase.png` and `layout_wireframe.png`.
2. Use original transparent `assets_png/*.png`, composited in the ordering defined by `layout.json`. Every layer is a full **480x480** RGBA canvas so its upper-left should align at 0,0.
3. `reference_only/original_lite_mockup.png` is a STYLE REFERENCE only. Never use it as the actual background because its data/time/widgets are baked into the picture.
4. The assets are pixel art. Preserve sharp edges; do not blur/downsample unnecessarily.

## Objective

Generate a real wearable watch face using Android's current supported Watch Face Format (WFF) / Wear OS project methodology, with compatible build files and reproducible Windows instructions. First inspect the installed Android SDK and available toolchain. **Verify correct current WFF manifest/schema/build requirements from official docs**; don't invent non-existent XML tags or use obsolete Jetpack watchface methods where disallowed. If any input requires manual steps in Samsung Watch Face Studio, provide exact steps instead of claiming full automation.

## Functional requirements

- The date and digital time MUST update from the watch system clock. Use device 12/24-hour settings where supported; show AM/PM only for 12h.
- The three bottom data regions are steps, **watch** battery, and an optional configurable weather complication. The icons and frames are separate static decoration; **do not** hardcode any values or duplicate system-provided icons.
- If unsupported data cannot be safely read within WFF, use a supported system-provided complication or hide it as a graceful fallback. Never display fictitious values.
- Ensure the clock/time/date layout remains readable over the KL silhouette on a small round display. Optional skyline and stripe layers may be disabled as needed.
- Create minimalist AOD using `12_aod_bg.png`, with real live time only and no animated elements. Respect ambient rendering and OLED considerations.
- Support 450x450/480x480 round watches gracefully through coordinate scaling.
- No battery-expensive perpetual animation. Avoid unrelated phone permissions and network requests.

## Deliverables

1. Complete project source and instructions to build an APK/AAB or an editor-importable watch face project using the appropriate current toolchain.
2. At least one **real emulator screenshot** after successful build/install (not an image-composited fake) with confirmation of date/time changing.
3. Evidence that the background is layered, not a flattened mockup.
4. Test report: time/date, battery, steps (if available), weather complication (if available), ambient/AOD, round safe zone, small screen readability.
5. Clearly list functionality not completed rather than describing it as working.

Build the smallest runnable prototype first. Don't publish to Google Play or register accounts without user approval.
