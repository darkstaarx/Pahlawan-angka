// questions/v2/engine/generator.js
//
// Runtime item-generation entry point (blueprint §1 item 3 / §8).
// Given a validated, "enabled" template, this will eventually call the
// registered generator (questions/v2/generators) and hand the result to
// the registered renderer (questions/v2/renderers) to produce a battle-
// ready question object.
//
// Phase 1: intentionally not implemented. No template is "enabled" yet
// (see questions/v2/curriculum/kssr-e3-2024/d3.json), so there is nothing
// for this to generate from, and nothing in production calls this module.

'use strict';

function generateFromTemplate() {
  throw new Error(
    'questions/v2/engine/generator.js: not implemented in Phase 1. ' +
    'No template is enabled yet; production continues to use questions/index.js.'
  );
}

module.exports = { generateFromTemplate };
