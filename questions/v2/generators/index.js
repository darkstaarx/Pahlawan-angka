// questions/v2/generators/index.js
//
// Generator Library registry (blueprint §8). Generators produce
// mathematically valid parameters, an answer, and diagnostic distractors.
// They must not own curriculum routing.
//
// Phase 1: no generators are registered yet. This module only defines the
// registration contract so Phase 2 (D3 Topic 7 pilot) can add
// `generators/geometry/identifyPrism.js` etc. without inventing a new
// pattern.
//
// Not required by, or referenced from, index.html or production code.
//
// Phase 1.2 note: this in-memory registry is NOT the source of truth used
// by enabled-readiness validation (questions/v2/validation/cli.js,
// self-test.js) or by the browser runtime build
// (questions/v2/build/build.js). Both of those derive generator keys
// directly from authored script files on disk via
// questions/v2/engine/authored-registry.js, so validation can never drift
// from what actually ships. This module remains only as documentation of
// the registerGenerator(key, fn) call contract that an authored script
// file is expected to follow.

'use strict';

const registry = Object.create(null);

/**
 * Register a generator function under a dotted key, e.g. "geometry.identifyPrism".
 * @param {string} key
 * @param {(params: object, rng: () => number) => { value: any, distractors: any[], meta?: object }} fn
 */
function registerGenerator(key, fn) {
  if (typeof key !== 'string' || !key) {
    throw new Error('registerGenerator: key must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new Error(`registerGenerator: generator "${key}" must be a function`);
  }
  if (registry[key]) {
    throw new Error(`registerGenerator: "${key}" is already registered`);
  }
  registry[key] = fn;
}

function getGenerator(key) {
  return registry[key] || null;
}

function listGenerators() {
  return Object.keys(registry).sort();
}

module.exports = { registerGenerator, getGenerator, listGenerators };
