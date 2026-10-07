# Level 5 Bara evolution

All six captured pets use their own Bond XP to unlock Bara at pet level 5 (400 XP). Existing XP, names and capture history are preserved. Only the equipped pet earns the existing 20 Bond XP on a legitimately completed Gembok; replay, demo and abandoned runs cannot award it.

Aurora retains the approved design. Kukupat gains a forged cannon and woven ember shell; Kumbis a volcanic mangosteen shell and flame leaf crown; Riya a fire flower and mane; Bunnis toasted cake layers and molten caramel details; Keryan a forged durian crown and flame horns. Each evolution keeps its original creature identity and companion pose.

Assets are transparent WebP: a 512×512 inventory sprite and a 1024×512 two-frame companion atlas per pet. Frames use a shared scale, centred body and matched baseline, with safe transparent margins. Detached alpha debris is removed when packing. The blink holds for 2.8 seconds open and 0.12 seconds closed.

Evolved companions use the trapped pet's visible height. Khazanah reloads its texture when an already-selected pet crosses the level gate. Fire art is pre-cached for offline use. Captured pets below level 5 and rescue targets retain their existing art.

Validation: `node js/pet-collection-system.test.js` (23 tests); `node audit/fire-sprite-quality.cjs` (requires sharp); `node audit/fire-evolution-browser.cjs` (requires Playwright and Chromium, checks the local modules against the deployed app at phone and tablet widths, including same-pet Khazanah evolution refresh).
