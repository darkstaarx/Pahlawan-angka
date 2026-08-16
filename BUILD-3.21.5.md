# Pahlawan Angka v3.21.5 — Combat Target Anchor

Baseline: `693560cd9d5756fe60502ad500a1e12aa0a65e60`.

This revised v3.21.5 supersedes the earlier defeat-only draft.

## Fixes
- Normal hit flash/slash/burst follow the actual rendered enemy body.
- Wira final-blow ice strike lands on the actual rendered boss body.
- Bunga final-blow vine/root grows from the actual rendered boss foot position.
- Boss defeat/shatter snapshots the actual visible frame at the actual rendered position.
- One shared geometry source (`getBoundingClientRect`) is used so future boss size/staging adjustments do not desynchronise FX.

## Preserved
v3.21.4 boss scale/inward staging + DEV direct boss jump.
v3.21.3 victory asset lock.
v3.21.2 boss typed-answer experiment.
World Response remains retired.
