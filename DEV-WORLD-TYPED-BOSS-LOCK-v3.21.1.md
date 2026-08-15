# Pahlawan Angka — DEV World + Typed Boss Lock v3.21.1

## World Response experiment
World Response is **not a normal-user feature in this patch**.
It is visible only when:
1. Developer Mode is unlocked; and
2. `World Response: ON` is enabled in the DEV panel.

DEV stage previews are presentation-only and must not modify learning evidence.

## Boss typed answer rule
A normal mission boss may use free-response typing only when the generated correct answer has a safely normalisable format.

Hard rules:
- maximum **2 typed questions per boss encounter**;
- no requirement to reach 2;
- if only one safe item appears, use one;
- if none are safe, keep all A/B/C/D;
- when two are used, they must not be consecutive;
- typed mode does not receive extra mastery/evidence weight;
- Auto Coach, Guardian Focus and boss stretch remain multiple-choice to avoid contaminating diagnostic/probe evidence.

## Safe formats v3.21.1
- integer/decimal numeric;
- money numeric values (`RM` optional for pupil input);
- percentage numeric values (`%` optional for pupil input).

Not yet safe:
- fraction notation;
- time notation;
- coordinates;
- ratio/remainder/text answers;
- multi-part responses.

Those formats must automatically fall back to normal choices.
