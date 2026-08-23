// questions/v2/engine/authored-registry.js
//
// Phase 1.2: the ONE consistent registration truth for "which generator
// keys / renderer keys actually exist", derived from authored source
// files on disk — the exact same files, discovered the exact same way
// (registry.listAuthoredScriptFiles), that questions/v2/build/build.js
// concatenates into the browser artifact:
//
//   authored generator files
//         |
//         v
//   authored script loader (engine/script-loader.js)
//         |
//         v
//   registered generator keys  <-- this module
//         |
//         v
//   validateEnabledReadiness()
//
// (symmetrically for renderer files/keys).
//
// This module intentionally does NOT read questions/v2/generators/index.js
// or questions/v2/renderers/index.js. Those two files define the
// registerGenerator/registerRenderer *contract* (shape/validation of a
// registration call) for Phase 2+ authoring docs, but they are a static,
// manually-populated registry with no automatic connection to the files
// under generators/** / renderers/** — using them as the readiness
// source of truth would silently diverge from what build.js actually
// ships in questions/v2/dist/runtime.js. See migration-gates / Phase 1.2
// notes: do not create a second independent generator/renderer registry.

'use strict';

const { GENERATORS_DIR, RENDERERS_DIR, listAuthoredScriptFiles } = require('./registry');
const { loadGenerators, loadRenderers } = require('./script-loader');

/**
 * Discover authored generator files under `dir` (default:
 * questions/v2/generators), execute them through the same isolated
 * script-loader the build uses, and return their registered keys —
 * sorted, de-duplicated by construction (script-loader throws on a
 * duplicate key within the same load).
 *
 * @param {string} [dir] override for testing; defaults to the real
 *   questions/v2/generators directory.
 * @returns {string[]}
 */
function loadAuthoredGeneratorKeys(dir) {
  const files = listAuthoredScriptFiles(dir || GENERATORS_DIR);
  const registry = loadGenerators(files);
  return Array.from(registry.keys()).sort();
}

/**
 * Same as loadAuthoredGeneratorKeys, for renderer files (default:
 * questions/v2/renderers).
 *
 * @param {string} [dir]
 * @returns {string[]}
 */
function loadAuthoredRendererKeys(dir) {
  const files = listAuthoredScriptFiles(dir || RENDERERS_DIR);
  const registry = loadRenderers(files);
  return Array.from(registry.keys()).sort();
}

module.exports = { loadAuthoredGeneratorKeys, loadAuthoredRendererKeys };
