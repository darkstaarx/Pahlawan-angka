# Glacier placement review

Reviewed against c1c4d1b, the latest origin/main available in this workspace.

The DOM glacier used left:66%, bottom:7%, viewport-based dimensions and a
translate/scale transform. The seal is drawn through a perspective WebGL
camera, so those CSS values did not describe the seal's rendered location.
The old dimensions also distorted the 279 by 426.67 pixel sprite cells.

The impact now stores the struck seal's world ground point and tier height,
projects through the live camera each animation frame, and uses the actual
sprite-cell aspect ratio. The sprite's shared bottom alpha edge (99% of its
cell height) meets the seal floor. Its canvas height is 1.22 times the seal
height, making the largest visible ice silhouette approximately 1.1 times
the seal height. The target stays fixed to the struck tier after it breaks.

Validation: `node audit/glacier-seal-placement.cjs` passed for 390x844,
768x1024 and 1440x900. Checked horizontal centre and ground within 2 pixels,
cell aspect ratio, no CSS transform, resize after break, normal attack
isolation, end-of-animation cleanup and absence of runtime errors. The test
boots the real stage and calls its real strike and hitSeal methods; only
the preceding video is skipped to isolate placement. Test instrumentation
is injected by Playwright routing and does not enter the shipped module.

Inspected saved late-burst screenshots on phone and desktop. Separately
opened the normal guest demo through its buttons: a real question loaded
without JavaScript errors. Syntax and git diff whitespace checks passed.

Release: v3.85.14. The user authorized publication after reviewing the local
fix. Only the Glacier correction, cache-busted module URLs, version and its
QA evidence are included; unrelated changes in the older main checkout
are excluded.
