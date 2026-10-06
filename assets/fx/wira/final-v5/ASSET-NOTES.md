# Finisher artwork v5

Generated using the built-in image_gen tool, using the user's PAHLAWAN logo
as typography reference and the existing 11-frame glacier sheet as edit target.

Typography prompt: two isolated words JURUS and PENAMAT!, exactly spelled,
matching the chunky illustrated white/icy-blue PAHLAWAN letters, cobalt/navy
outlines, beveled faces and 3D extrusion; transparent background, no crest or
other text. A slight rightward slant and upward tilt convey movement. The
runtime displays each half of the sheet with an additional small skew/tilt.

Glacier prompt: preserve the reference's 4x3 row-major layout and 11 poses,
sparks through magic circle buildup into lightning and ice spikes; last cell
unused; true transparent background and spaces, no black/navy matte halo,
dark floor oval, rectangular patch, characters, labels or grid lines; crisp
cyan ice, white lightning and soft alpha glow. Clean up pixels as needed.

Output typography: 1774x887 RGBA. Glacier: 1171x1343 RGBA. Alpha spans 0..255.
Opaque dark pixels (alpha>100, max RGB<45): old glacier 13,755; new glacier 0.
All 11 cells contain solid effect pixels; cell 12 contains no alpha>100 and is
never displayed. Very faint alpha glow/speckle remains outside solid bounds.
Solid floor padding differs slightly by cell; runtime uses measured per-frame
floor anchors while keeping one fixed scale. No random rotation or zoom.

Both assets are saved in the project and included in the service-worker shell.
Normal alpha compositing is restored; screen blending is no longer required.
Local phone and desktop cutscene tests passed, screenshots inspected.
This version remains local and unpublished.
