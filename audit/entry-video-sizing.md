# Entry video sizing

Reproduced on https://pahlawanangka.netlify.app/ at 1264x629: the 720x1280
video occupied a 1264x2247 DOM box inside a 1264x629 overlay, despite
object-fit:contain. Its intrinsic size expanded the grid track.

The video is now absolutely positioned within the fixed overlay, with
explicit width/height and min/max bounds. Contain applies in every
orientation so the complete portrait frame is visible. The overlay keeps
its existing grid only for the skip button.

Verified using the actual Netlify demo with only the patched entry module
injected through browser routing. Desktop 1264x629 and 1440x900, phone
390x844 and landscape 844x390 passed: video box equals viewport, natural
metadata is 720x1280, contain, skip click, overlay cleanup, real question
loaded and no runtime errors. Screenshots inspected on desktop. No video
timing, audio, or battle geometry changes.

Netlify served app version 3.84.57 during this check, while the current
repository already contains 3.85.14. This patch remains local.
