# Victory Asset Lock — v3.21.3

Victory animation must not be simulated by moving one idle image with CSS.

Before victory motion is re-enabled, each supported hero and equipped pet needs dedicated animation artwork with:
- at least two distinct victory poses/frames per hero animation set;
- dedicated pet celebration frames appropriate to that pet;
- consistent canvas dimensions within each character set;
- consistent bottom foot/ground anchor;
- visible-size normalisation against the existing battle idle pose;
- transparent backgrounds;
- mobile-ready WebP/PNG assets.

Until those assets exist, boss victory uses the existing boss defeat/banner/checkpoint sequence only.
