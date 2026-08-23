// questions/v2/engine/script-loader.js
//
// Loads "authored" generator/renderer script files (see
// registry.listAuthoredScriptFiles) the same way the browser build does:
// each file is a plain script that calls a global `registerGenerator(key,
// fn)` / `registerRenderer(key, fn)` — no `require`, no `module.exports`.
//
// This lets the exact same file text be:
//   1. Node-loaded here for validation/unit-testing (this module), and
//   2. concatenated verbatim into questions/v2/dist/runtime.js by
//      questions/v2/build/build.js for the browser.
//
// Phase 1.1 ships zero authored generator/renderer files — this module
// exists so the mechanism itself is implemented and tested (see
// validation/self-test.js) ahead of Phase 2 content.
//
// Isolation (Phase 1.2): execution uses `node:vm` (`vm.createContext` +
// `vm.Script`), which gives the script its own fresh V8 context/global
// object — NOT `new Function()`. This matters because `new Function()`
// only withholds identifiers that are injected as per-module wrapper
// arguments in Node (`require`, `module`, `exports`, `__dirname`,
// `__filename`); it does NOT withhold genuine ambient Node globals such
// as `process`, `global`, or `Buffer`, which remain reachable from any
// `new Function()`-created function because they live on the real global
// object. A fresh `vm` context has none of that — only the exact
// identifiers explicitly placed into its sandbox object (here: just the
// register function) plus the context's own fresh built-ins (Object,
// Array, Math, JSON, ...). This is not a hostile-code sandbox; it exists
// so the authoring contract is genuinely what it claims to be, so
// Node-validated behavior matches the browser runtime, and so a
// generator/renderer can never accidentally come to depend on a Node
// global that won't exist when questions/v2/dist/runtime.js runs in a
// browser.

'use strict';

const fs = require('fs');
const vm = require('vm');

/**
 * Execute `source` with a single global identifier `registerFnName` bound
 * to `registerFn`, inside a fresh `vm` context that has no `process`,
 * `require`, `module`, `exports`, `__dirname`, `__filename`, or any other
 * Node-specific global — matching what the file will see when it runs
 * inside questions/v2/dist/runtime.js in a browser.
 *
 * @param {string} source raw script text
 * @param {string} registerFnName e.g. "registerGenerator"
 * @param {(key: string, fn: Function) => void} registerFn
 * @param {string} [filenameForErrors]
 */
function runAuthoredScript(source, registerFnName, registerFn, filenameForErrors) {
  const filename = filenameForErrors || 'authored-script.js';
  // A bare, empty-prototype sandbox: the ONLY identifier available to the
  // authored script is the register function itself. vm.createContext
  // "contextifies" this object into the global object of a brand-new V8
  // context, which comes with its own fresh standard-library built-ins
  // (Object, Array, Math, JSON, etc.) but nothing Node-specific.
  const sandbox = Object.create(null);
  sandbox[registerFnName] = registerFn;
  const context = vm.createContext(sandbox, {
    codeGeneration: { strings: false, wasm: false },
  });
  try {
    const script = new vm.Script(`'use strict';\n${source}`, { filename });
    script.runInContext(context, { timeout: 2000, displayErrors: true });
  } catch (err) {
    const where = filenameForErrors ? ` in ${filenameForErrors}` : '';
    throw new Error(`script-loader: error executing authored script${where}: ${err.message}`);
  }
}

/**
 * Load a list of authored generator files, registering each into a fresh
 * in-memory map. Does not touch questions/v2/generators/index.js's global
 * registry (keeps this side-effect-free / re-runnable for tests).
 *
 * @param {Array<string>} files absolute paths, e.g. from registry.listAuthoredScriptFiles
 * @returns {Map<string, Function>}
 */
function loadGenerators(files) {
  const registry = new Map();
  const register = (key, fn) => {
    if (typeof key !== 'string' || !key) throw new Error('registerGenerator: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error(`registerGenerator: "${key}" must be a function`);
    if (registry.has(key)) throw new Error(`registerGenerator: "${key}" is already registered`);
    registry.set(key, fn);
  };
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    runAuthoredScript(source, 'registerGenerator', register, file);
  }
  return registry;
}

/** Same as loadGenerators, for renderer files. */
function loadRenderers(files) {
  const registry = new Map();
  const register = (key, fn) => {
    if (typeof key !== 'string' || !key) throw new Error('registerRenderer: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error(`registerRenderer: "${key}" must be a function`);
    if (registry.has(key)) throw new Error(`registerRenderer: "${key}" is already registered`);
    registry.set(key, fn);
  };
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    runAuthoredScript(source, 'registerRenderer', register, file);
  }
  return registry;
}

module.exports = { runAuthoredScript, loadGenerators, loadRenderers };
