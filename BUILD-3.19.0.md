# Pahlawan Angka v3.19.0

## Sensory Learning Foundation

This release adds a reusable sensory-feedback layer on top of the validated v3.18.1 learning engine. It does **not** alter curriculum logic, mastery formulas, adaptive routing, combat damage, or question generation.

### Added
- `js/sensory-learning-v3.19.0.js`: event/intensity controller and learning-state feedback hooks.
- `css/sensory-learning-v3.19.0.css`: low/medium/high sensory responses with reduced-motion support.
- `SENSORY-LEARNING-LOCK-v3.19.md`: product lock and intensity rules for future agents.
- `audit/sensory-learning-v3.19.0.js`: release invariants.

### Behaviour
- Question arrival: low-intensity settle.
- First wrong answer: calm reflection cue, no haptic punishment.
- Hint: calm Cikgu Wajar cue.
- Correct answer: competency-labelled signal + subtle optional haptic.
- Genuine mastery: high-intensity mastery moment only when mastery >=85 and required competency evidence is complete.
- Boss/final blow remains peak intensity; mastery overlay is suppressed during boss resolution.

### PWA
- App cache bumped to v3.19.0.
- Existing v3.18.1 KSSR integrity guard remains the curriculum-integrity version and is loaded before the v3.19 sensory layer.
