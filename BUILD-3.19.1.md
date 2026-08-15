# Pahlawan Angka v3.19.1

## Cikgu Wajar Visual Manipulatives

This release upgrades the teaching layer without changing the validated learning engine.

### Added
- `js/cikgu-manipulatives-v3.19.1.js`
- `css/cikgu-manipulatives-v3.19.1.css`
- `CIKGU-WAJAR-MANIPULATIVES-LOCK-v3.19.1.md`
- static + runtime audits for the new teaching layer.

### Learning changes
- Division is repaired from “slice one rock” to **12 objects shared equally into 3 groups**.
- Stronger manipulatives for place value, addition, subtraction, multiplication, fractions, money, time, measurement and data.
- New visual teaching coverage for **decimals, percentage, ratio and coordinates** so upper-primary concepts do not fall back to text-only coaching.
- Measurement chooses a ruler, scale, measuring vessel or conversion model based on the skill.
- Teaching interaction is deliberately short: **Lihat → manipulate one step → Semak Faham → existing checkpoints**.

### Architecture
- Curriculum integrity remains v3.18.1.
- Sensory foundation remains v3.19.0.
- App release / manipulative layer is v3.19.1.
- Loader now versions these layers independently instead of duplicating unchanged sensory files for every release.

### Safety / scope lock
No changes to question generation, mastery formula, competency evidence, adaptive routing, frontier unlock, battle damage, rewards, Restu logic or parent rules.
