// questions/v2/engine/registry.js
//
// Curriculum / Question Bank Registry loader (blueprint §1, §3).
//
// This module only READS questions/v2/curriculum and questions/v2/banks.
// It does not touch window.PAQuestionBanks, questions/index.js, or any
// production selection path. It is used by the Phase 1 validator CLI and
// by future (Phase 2+) legacy-adapter wiring, which will require this
// module explicitly rather than being auto-loaded by index.html.

'use strict';

const fs = require('fs');
const path = require('path');

const V2_ROOT = path.join(__dirname, '..');
const CURRICULUM_DIR = path.join(V2_ROOT, 'curriculum');
const BANKS_DIR = path.join(V2_ROOT, 'banks');
const GENERATORS_DIR = path.join(V2_ROOT, 'generators');
const RENDERERS_DIR = path.join(V2_ROOT, 'renderers');

const CURRICULUM_REGISTRY_SCHEMA_TAG = 'pa.qsv2.curriculum-registry.v1';

function walkFiles(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

function walkJsonFiles(dir) {
  return walkFiles(dir, '.json').sort();
}

/**
 * List "authored" generator/renderer script files under `dir` — i.e. every
 * `.js` file EXCEPT the top-level `index.js`, which is Node-side tooling
 * (the registerGenerator/registerRenderer registry + listGenerators/
 * listRenderers used by validation and build), not authored content.
 *
 * Authored files are plain scripts that call a global
 * `registerGenerator(key, fn)` / `registerRenderer(key, fn)` — no
 * `require`, no `module.exports`, no Node globals — so the exact same
 * source text can be Node-loaded (engine/script-loader.js) for validation
 * and concatenated verbatim into questions/v2/dist/runtime.js for the
 * browser. Phase 1.1 ships none; this normally returns [].
 *
 * Sorted for deterministic build output.
 */
function listAuthoredScriptFiles(dir) {
  return walkFiles(dir, '.js')
    .filter((f) => path.relative(dir, f) !== 'index.js')
    .sort();
}

/**
 * Load every curriculum-registry file (tagged with
 * schema === "pa.qsv2.curriculum-registry.v1") under questions/v2/curriculum.
 * Reference-only files (e.g. *-topics.json) are skipped.
 *
 * @returns {{ records: Array<object>, files: Array<string> }}
 */
function loadCurriculumRecords() {
  const files = walkJsonFiles(CURRICULUM_DIR);
  const records = [];
  const usedFiles = [];
  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`registry: failed to parse ${file}: ${err.message}`);
    }
    if (parsed && parsed.schema === CURRICULUM_REGISTRY_SCHEMA_TAG && Array.isArray(parsed.standards)) {
      usedFiles.push(file);
      for (const rec of parsed.standards) {
        records.push(Object.assign({ __sourceFile: path.relative(V2_ROOT, file) }, rec));
      }
    }
  }
  return { records, files: usedFiles };
}

/**
 * Load every question-template file under questions/v2/banks.
 * Convention: a bank file exports { schema: "pa.qsv2.template-set.v1", templates: [...] }.
 * Phase 1 ships no template files, so this normally returns an empty list.
 *
 * @returns {{ templates: Array<object>, files: Array<string> }}
 */
function loadTemplates() {
  const files = walkJsonFiles(BANKS_DIR);
  const templates = [];
  const usedFiles = [];
  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`registry: failed to parse ${file}: ${err.message}`);
    }
    if (parsed && parsed.schema === 'pa.qsv2.template-set.v1' && Array.isArray(parsed.templates)) {
      usedFiles.push(file);
      for (const tpl of parsed.templates) {
        templates.push(Object.assign({ __sourceFile: path.relative(V2_ROOT, file) }, tpl));
      }
    }
  }
  return { templates, files: usedFiles };
}

/** Build a standardId -> record index, scoped by curriculumVersion+grade. */
function indexCurriculumByStandard(records) {
  const index = new Map();
  for (const rec of records) {
    const key = `${rec.curriculumVersion}::${rec.grade}::${rec.standardId}`;
    index.set(key, rec);
  }
  return index;
}

/** Build a competencyId -> record[] index, scoped by curriculumVersion+grade. */
function indexCurriculumByCompetency(records) {
  const index = new Map();
  for (const rec of records) {
    const key = `${rec.curriculumVersion}::${rec.grade}::${rec.competencyId}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(rec);
  }
  return index;
}

module.exports = {
  V2_ROOT,
  CURRICULUM_DIR,
  BANKS_DIR,
  GENERATORS_DIR,
  RENDERERS_DIR,
  loadCurriculumRecords,
  loadTemplates,
  indexCurriculumByStandard,
  indexCurriculumByCompetency,
  listAuthoredScriptFiles,
};
