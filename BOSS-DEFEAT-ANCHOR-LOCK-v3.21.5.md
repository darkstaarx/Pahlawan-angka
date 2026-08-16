# Boss Defeat Anchor Lock — v3.21.5

Boss defeat FX must originate from the exact rendered frame and exact rendered position at the moment defeat begins.

Do not:
- clone an assumed idle sprite into a generic wrapper;
- re-center defeat art relative to the arena;
- overwrite the source frame transform during the crack stage;
- change boss scale or foot anchor just for defeat.

The defeat snapshot must remain compatible with idle, anticipation, contact, follow-through and future real hurt/defeat frame assets.
