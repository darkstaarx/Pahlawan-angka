# Profile Manager Product Lock — v3.24

## Signed-in navigation
Guardian Profile Manager -> Student Hub.

Child setup is not a standalone signed-in page.

## Hero art
Production identity always wins over mockup polish.

Profile/selection art must use the approved Wira/Bunga identity. v3.24 uses the current production idle artwork as an identity-safe placeholder crop.

When dedicated happy/inviting bust portraits are approved later:
- keep costume;
- keep face identity;
- keep hero colour language;
- use friendly smile / inviting party pose;
- replace only portrait src;
- do not redesign the Profile Manager component.

## Delete
Profile deletion is a guardian-only soft removal using `is_active=false`.
Never cascade-delete learning history from the UI.

## Grade edits
Never treat progression from one grade as chapter unlock evidence for another grade.
Archive grade-specific chapter state before changing grade.
