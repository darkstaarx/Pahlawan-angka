# Pahlawan Angka v3.8.23

## v3.8.23 Style B battle scene

- Enlarged and moved hero/enemy inward without changing arena or question-panel height.
- Kept pets close behind the hero while preserving pet-first attack timing.
- Added restrained perspective contact shadows, ambient grading and floor depth.
- No changes to question, answer, hint, HUD or learning logic.

## v3.8.22 battle integration

- Pet stays close to the hero and only makes a short attack step; its FX travels to the enemy.
- Pet attacks first. Hero begins 420ms later and reaches finisher contact 880ms after pet impact.
- Softer image drop shadows plus stronger floor contact shadows blend hero, pet and enemy into the arena.
- Bunga no longer shows the generic equipped orange aura during her finisher.
- Bunga final blow now uses a transparent thorn-and-flower eruption from beneath the enemy.

## v3.8.21 pet visual correction

- Arif and Tiko pose PNGs now share a normalized visible-body height across all four frames.
- Arif is staged as a grounded companion beside Wira.
- Tiko is staged higher with a dedicated hover idle instead of standing on the arena floor.
- Aurora and Kucing Pembaris keep their legacy sizing and placement.

## Pet combo readability

- Arif and Tiko now use per-pet visual scaling rather than raw PNG canvas size.
- Normal attacks play hero first, then a distinct pet follow-up with unique FX.
- Finishers play the pet opener first, then preserve Wira/Bunga as the final blow.
- Defeat/shatter waits until the complete combo has finished.

## Khazanah

- Lencana kekal ganjaran pencapaian dan tidak dijual.
- Pet dan Aura kini dibeli menggunakan syiling.
- Hadiah pengenalan kedai: 50 syiling, sekali sahaja.
- Harga Pet: Aurora 120, Arif 160, Kucing Pembaris 180, Tiko 200.
- Harga Aura: 60, 90, 120 dan 120 syiling.
- Pemain lama mengekalkan koleksi yang sudah dimiliki.
- Dev Mode mempunyai butang `+500 Syiling Kedai`.

## Pet dan FX

- Arif Arnab Abakus dan Tiko Burung Waktu ditambah ke kedai dan battle.
- Kedua-duanya mempunyai pose front, anticipation, attack dan follow-through.
- Aurora, Kucing Pembaris, Arif dan Tiko mempunyai FX impact unik pada saat contact.

## QA

- Semua JavaScript lulus syntax check.
- Regression 37 kemahiran Darjah 2 lulus.
- Pembelian, insufficient balance, persistence dan pemisahan reward boss diuji.
- Semua aset baharu mempunyai alpha transparency dan path sah.
