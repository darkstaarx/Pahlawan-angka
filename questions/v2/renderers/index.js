// questions/v2/renderers/index.js
//
// Renderer Library registry (blueprint §9). Renderers are reusable visual
// representation engines (number line, place value, clock, geometry, ...).
// A bank declares a renderer key; it should not embed ad-hoc SVG/HTML
// unless the representation is genuinely unique.
//
// Phase 1: no renderers are registered yet. Existing Cikgu Dimensi
// representation engines should be reused where their contract is
// suitable (blueprint §9) rather than recreated here in Phase 2.
//
// Not required by, or referenced from, index.html or production code.
//
// Phase 1.2 note: this in-memory registry is NOT the source of truth used
// by enabled-readiness validation (questions/v2/validation/cli.js,
// self-test.js) or by the browser runtime build
// (questions/v2/build/build.js). Both of those derive renderer keys
// directly from authored script files on disk via
// questions/v2/engine/authored-registry.js, so validation can never drift
// from what actually ships. This module remains only as documentation of
// the registerRenderer(key, fn) call contract that an authored script
// file is expected to follow.

'use strict';

const registry = Object.create(null);

/**
 * Register a renderer function under a short key, e.g. "geometry".
 * @param {string} key
 * @param {(question: object, params: object) => string} fn returns markup/SVG
 */
function registerRenderer(key, fn) {
  if (typeof key !== 'string' || !key) {
    throw new Error('registerRenderer: key must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new Error(`registerRenderer: renderer "${key}" must be a function`);
  }
  if (registry[key]) {
    throw new Error(`registerRenderer: "${key}" is already registered`);
  }
  registry[key] = fn;
}

function getRenderer(key) {
  return registry[key] || null;
}

function listRenderers() {
  return Object.keys(registry).sort();
}

module.exports = { registerRenderer, getRenderer, listRenderers };
