# Pahlawan Angka — Modular Build

This is the modular migration of the current working prototype.

## Structure

- `index.html` — lightweight UI shell
- `css/game.css` — all visual styling and animation CSS
- `js/app.js` — screen/session/app flow
- `js/battle.js` — answer handling + battle animation
- `js/engine/adaptive.js` — mastery/confidence/scheduler logic
- `js/parent.js` — parent dashboard/reporting
- `js/heroes.js` — Wira/Bunga registry and asset paths
- `questions/` — question generators separated by grade/topic
- `data/kssr/` — curriculum/knowledge graph
- `assets/` — real image files, no base64 inside HTML

## Important

The migration intentionally preserves current gameplay logic first.
Future changes to Bunga FX should touch only `css/game.css`, `js/battle.js`,
and/or `assets/fx/bunga/` rather than rewriting the full app.

## Hosting

Serve the repository through GitHub Pages, Vercel, Netlify, or any static web server.
Opening `index.html` directly from `file://` may work, but HTTP hosting is preferred.
