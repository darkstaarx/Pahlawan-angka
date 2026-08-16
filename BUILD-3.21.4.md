# Pahlawan Angka v3.21.4

## Boss Scale + DEV Direct Boss Jump

Baseline: `9c11039c7bfab507d60a3d479f98391f61363898`.

### Product changes
- Boss common visual box is enlarged further so a boss reads clearly larger than Wira/Bunga.
- Boss is shifted inward from the right edge to avoid crop and distant-looking staging.
- Shared bottom anchor remains unchanged; existing per-pose alpha-padding normalisation remains intact.
- DEV Mode gains **Boss Fight Test**.
- Developer can choose an available chapter boss and jump directly to the first boss question without completing the 9-minion-question phase.
- Direct boss test uses DEV bank-test mode so normal mission XP/coin/skill rewards are not awarded by the standard mission recorder.
- Existing Boss Typed Answer lab is preserved. Force Typed can still be used during DEV boss testing.
- World Response remains retired.
- Real hero/pet victory frames remain pending; no CSS-only victory motion is reintroduced.

### Untouched
Question generation, mastery formula, adaptive routing, Cikgu Wajar, Daily Quest, parent time controls, Supabase schema.
