# questions/v2/build/ — Node build → browser runtime boundary

Pahlawan Angka's production app is a static, bundler-free browser page.
`questions/v2`'s Node-side files (`fs`, `path`, `require`) exist for
validation/build tooling only and cannot run in the browser as-is. This
folder is the one, explicit place that gap is closed — no per-grade
script loaders, no dynamic `fetch()` of JSON at runtime, no new
`index.html` script-load-order dependency.

```text
AUTHORING
  questions/v2/curriculum/**/*.json
  questions/v2/banks/**/*.json
  questions/v2/generators/**/*.js   (excluding generators/index.js)
  questions/v2/renderers/**/*.js    (excluding renderers/index.js)
        ↓
NODE BUILD
  node questions/v2/build/build.js
        ↓
BROWSER RUNTIME ARTIFACT
  questions/v2/dist/runtime.js  →  window.PAQuestionSystemV2
```

## Run it

```sh
node questions/v2/build/build.js          # (re)generate questions/v2/dist/runtime.js
node questions/v2/build/build.js --check  # exit 1 if the checked-in file is stale
```

`questions/v2/validation/self-test.js` also runs the build twice in-memory
and diffs the output against itself and against the checked-in
`dist/runtime.js`, so drift is caught automatically.

## Determinism

The generated file's bytes are a pure function of the current content of
the four authoring directories above:

- curriculum records are sorted by `curriculumVersion::grade::standardId`;
- templates are sorted by `templateId`;
- generator/renderer files are discovered and sorted by relative path;
- internal bookkeeping fields (`__sourceFile`, added by `engine/registry.js`
  while loading) are stripped before embedding;
- **no timestamp, hostname, or random value is ever written into the
  file.** A `sourceHash` (sha256 over the exact sorted inputs) is embedded
  instead, so provenance/change-detection doesn't require the file to
  differ between two builds of identical sources.

Running the build twice against an unchanged source tree produces
byte-identical output.

## Generator / renderer authoring contract

`questions/v2/generators/index.js` and `questions/v2/renderers/index.js`
are **not** authored content — they're the Node-side registry/tooling
modules (`registerGenerator`/`registerRenderer`, `listGenerators`/
`listRenderers`) used by the validator and by this build script. They are
excluded from bundling.

An actual generator or renderer file (Phase 2+, e.g.
`generators/geometry/identifyPrism.js`) must be a **plain script**:

```js
// generators/geometry/identifyPrism.js
registerGenerator('geometry.identifyPrism', function (params, rng) {
  // ... return { value, distractors, meta }
});
```

Rules for these files:

- call the global `registerGenerator(key, fn)` / `registerRenderer(key, fn)`
  directly — do not declare it, it's injected;
- **no** `require`, `module.exports`, `import`/`export`, or any other
  Node-specific or ES-module syntax;
- **no** access to `window`, `document`, `fs`, or other host globals — pure
  functions of their parameters only, per blueprint §8/§9 (seedable via an
  injected `rng`, no ambient state);
- one file may call `registerGenerator`/`registerRenderer` more than once
  if it defines a small family of closely related keys.

This one convention lets the exact same file be:

1. **Node-loaded** for validation/unit-testing, via
   `questions/v2/engine/script-loader.js` (`new Function('registerGenerator',
   source)(registerFn)` — no `vm`/`eval` of untrusted input, this only ever
   runs the repo's own checked-in files);
2. **Browser-bundled** verbatim by `build.js`, which wraps each file's raw
   source in an IIFE inside `questions/v2/dist/runtime.js` and calls it
   with that build's local `registerGenerator`/`registerRenderer`.

No second syntax, no transpilation, no bundler dependency.

## What's NOT done yet

- `questions/v2/dist/runtime.js` is generated and verified but **not**
  referenced from `index.html`. Nothing routes to it.
- `questions/v2/generators/` and `questions/v2/renderers/` contain zero
  authored files in Phase 1.1 — the mechanism above is proven using
  fixtures under `questions/v2/validation/fixtures/authored-scripts/`
  only, which are test-only and must not be copied into the real
  directories.
