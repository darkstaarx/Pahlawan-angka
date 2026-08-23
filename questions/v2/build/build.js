#!/usr/bin/env node
// questions/v2/build/build.js
//
// Node build step of the browser runtime boundary (Phase 1.1):
//
//   AUTHORING (curriculum/**, banks/**, generators/**, renderers/**)
//         -> NODE BUILD (this file)
//         -> BROWSER RUNTIME ARTIFACT (questions/v2/dist/runtime.js)
//              -> window.PAQuestionSystemV2
//
// Usage:
//   node questions/v2/build/build.js            # writes questions/v2/dist/runtime.js
//   node questions/v2/build/build.js --check     # builds in-memory, diffs against the
//                                                 # checked-in dist file, exits 1 on drift
//
// Determinism: the output depends ONLY on the content of the authored
// source files, never on wall-clock time, machine hostname, environment
// variables, or object/Map iteration order (everything is explicitly
// sorted first). Running this script twice against the same source tree
// always produces byte-identical output — verified in
// questions/v2/validation/self-test.js.
//
// This file is Node-only tooling. Nothing it produces is referenced by
// index.html in Phase 1.1.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const {
  V2_ROOT,
  loadCurriculumRecords,
  loadTemplates,
  listAuthoredScriptFiles,
  GENERATORS_DIR,
  RENDERERS_DIR,
} = require('../engine/registry');

const DIST_DIR = path.join(V2_ROOT, 'dist');
const RUNTIME_FILE = path.join(DIST_DIR, 'runtime.js');

/** Strip internal bookkeeping fields (prefixed "__") before embedding data in the artifact. */
function stripInternalFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k.startsWith('__')) out[k] = v;
  }
  return out;
}

function sortedCurriculum() {
  const { records } = loadCurriculumRecords();
  return records
    .map(stripInternalFields)
    .sort((a, b) => {
      const ka = `${a.curriculumVersion}::${a.grade}::${a.standardId}`;
      const kb = `${b.curriculumVersion}::${b.grade}::${b.standardId}`;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
}

function sortedTemplates() {
  const { templates } = loadTemplates();
  return templates
    .map(stripInternalFields)
    .sort((a, b) => (a.templateId < b.templateId ? -1 : a.templateId > b.templateId ? 1 : 0));
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Read authored generator/renderer files as {relPath, source} sorted by relPath. */
function readAuthoredSources(dir, rootLabel) {
  return listAuthoredScriptFiles(dir).map((file) => ({
    relPath: `${rootLabel}/${path.relative(dir, file).split(path.sep).join('/')}`,
    source: fs.readFileSync(file, 'utf8'),
  }));
}

/** Defensive escaping so authored/curriculum text can never break out of a <script> tag if misused. */
function escapeScriptClose(text) {
  return text.split('</script').join('<\\/script');
}

/**
 * Build the full questions/v2/dist/runtime.js source text, purely as a
 * function of the current contents of questions/v2/curriculum, banks,
 * generators, and renderers. No timestamps, no randomness.
 */
function buildRuntimeSource(opts) {
  const generatorsDir = (opts && opts.generatorsDir) || GENERATORS_DIR;
  const renderersDir = (opts && opts.renderersDir) || RENDERERS_DIR;
  const curriculum = sortedCurriculum();
  const templates = sortedTemplates();
  const generatorSources = readAuthoredSources(generatorsDir, 'generators');
  const rendererSources = readAuthoredSources(renderersDir, 'renderers');

  const manifest = {
    curriculumCount: curriculum.length,
    templateCount: templates.length,
    generatorFiles: generatorSources.map((g) => g.relPath),
    rendererFiles: rendererSources.map((r) => r.relPath),
  };
  const sourceHash = sha256(
    JSON.stringify({
      curriculum,
      templates,
      generatorSources: generatorSources.map((g) => [g.relPath, g.source]),
      rendererSources: rendererSources.map((r) => [r.relPath, r.source]),
    })
  );

  const curriculumJson = escapeScriptClose(JSON.stringify(curriculum, null, 2));
  const templatesJson = escapeScriptClose(JSON.stringify(templates, null, 2));
  const manifestJson = JSON.stringify(manifest, null, 2);

  const generatorBlocks = generatorSources
    .map(
      (g) =>
        `  // ---- generators/${g.relPath.replace(/^generators\//, '')} ----\n` +
        `  (function (registerGenerator) {\n${escapeScriptClose(g.source)}\n  })(registerGenerator);\n`
    )
    .join('\n');

  const rendererBlocks = rendererSources
    .map(
      (r) =>
        `  // ---- renderers/${r.relPath.replace(/^renderers\//, '')} ----\n` +
        `  (function (registerRenderer) {\n${escapeScriptClose(r.source)}\n  })(registerRenderer);\n`
    )
    .join('\n');

  return `// questions/v2/dist/runtime.js
// GENERATED FILE — do not hand-edit.
// Regenerate with: node questions/v2/build/build.js
//
// Question System v2 browser runtime (Phase 1.1). Dormant: nothing in
// index.html references this file yet. It exposes a single stable
// namespace, window.PAQuestionSystemV2, with read-only curriculum/template
// data and the (currently empty) generator/renderer registries.
//
// Deterministic build: this file's content is a pure function of
// questions/v2/curriculum/**, questions/v2/banks/**, questions/v2/generators/**,
// and questions/v2/renderers/** at build time. sourceHash below is a
// sha256 over exactly those inputs — re-running the build against an
// unchanged source tree reproduces this file byte-for-byte.

(function (global) {
  'use strict';

  var CURRICULUM = ${curriculumJson};
  var TEMPLATES = ${templatesJson};
  var BUILD_MANIFEST = ${manifestJson};
  var SOURCE_HASH = ${JSON.stringify(sourceHash)};

  var generators = Object.create(null);
  var renderers = Object.create(null);

  function registerGenerator(key, fn) {
    if (typeof key !== 'string' || !key) throw new Error('registerGenerator: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error('registerGenerator: "' + key + '" must be a function');
    if (generators[key]) throw new Error('registerGenerator: "' + key + '" is already registered');
    generators[key] = fn;
  }

  function registerRenderer(key, fn) {
    if (typeof key !== 'string' || !key) throw new Error('registerRenderer: key must be a non-empty string');
    if (typeof fn !== 'function') throw new Error('registerRenderer: "' + key + '" must be a function');
    if (renderers[key]) throw new Error('registerRenderer: "' + key + '" is already registered');
    renderers[key] = fn;
  }

${generatorBlocks}${rendererBlocks}
  function getCurriculumRecord(curriculumVersion, grade, standardId) {
    for (var i = 0; i < CURRICULUM.length; i++) {
      var r = CURRICULUM[i];
      if (r.curriculumVersion === curriculumVersion && r.grade === grade && r.standardId === standardId) return r;
    }
    return null;
  }

  function listCurriculumByStatus(curriculumVersion, grade, status) {
    return CURRICULUM.filter(function (r) {
      return r.curriculumVersion === curriculumVersion && r.grade === grade && r.status === status;
    });
  }

  function getTemplate(templateId) {
    for (var i = 0; i < TEMPLATES.length; i++) {
      if (TEMPLATES[i].templateId === templateId) return TEMPLATES[i];
    }
    return null;
  }

  function listGenerators() {
    return Object.keys(generators).sort();
  }

  function listRenderers() {
    return Object.keys(renderers).sort();
  }

  global.PAQuestionSystemV2 = {
    sourceHash: SOURCE_HASH,
    buildManifest: BUILD_MANIFEST,
    curriculum: CURRICULUM,
    templates: TEMPLATES,
    getCurriculumRecord: getCurriculumRecord,
    listCurriculumByStatus: listCurriculumByStatus,
    getTemplate: getTemplate,
    listGenerators: listGenerators,
    listRenderers: listRenderers,
    _generators: generators,
    _renderers: renderers
  };
})(typeof window !== 'undefined' ? window : this);
`;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const generated = buildRuntimeSource();

  if (checkOnly) {
    const existing = fs.existsSync(RUNTIME_FILE) ? fs.readFileSync(RUNTIME_FILE, 'utf8') : null;
    if (existing === generated) {
      console.log('OK: questions/v2/dist/runtime.js is up to date with current sources.');
      process.exitCode = 0;
    } else {
      console.log('DRIFT: questions/v2/dist/runtime.js does not match a fresh build of current sources.');
      console.log('Run: node questions/v2/build/build.js');
      process.exitCode = 1;
    }
    return;
  }

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(RUNTIME_FILE, generated, 'utf8');
  console.log(`Wrote ${path.relative(V2_ROOT, RUNTIME_FILE)} (${generated.length} bytes)`);
}

module.exports = { buildRuntimeSource };

if (require.main === module) {
  main();
}
