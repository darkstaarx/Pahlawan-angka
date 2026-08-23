#!/usr/bin/env node
// questions/v2/validation/cli.js
//
// Standalone validator command for the Question System v2 registry.
// Does not import, require, or affect any production file.
//
// Usage:
//   node questions/v2/validation/cli.js
//
// Exit code 0 = all curriculum records and templates are valid.
// Exit code 1 = at least one validation error was found.

'use strict';

const path = require('path');
const { loadCurriculumRecords, loadTemplates } = require('../engine/registry');
const { validateCurriculumSet, validateTemplateSet, validateEnabledReadiness, statusReport } = require('../engine/validator');
const { loadAuthoredGeneratorKeys, loadAuthoredRendererKeys } = require('../engine/authored-registry');
const { buildRuntimeSource } = require('../build/build');

function main() {
  const { records, files: curriculumFiles } = loadCurriculumRecords();
  const { templates, files: templateFiles } = loadTemplates();

  const rel = (f) => path.relative(process.cwd(), f);

  console.log('Question System v2 — registry validator\n');
  console.log(`Curriculum files loaded: ${curriculumFiles.length}`);
  curriculumFiles.forEach((f) => console.log(`  - ${rel(f)}`));
  console.log(`Curriculum records: ${records.length}`);

  console.log(`\nTemplate files loaded: ${templateFiles.length}`);
  templateFiles.forEach((f) => console.log(`  - ${rel(f)}`));
  console.log(`Templates: ${templates.length}`);

  const curriculumResult = validateCurriculumSet(records);
  const templateResult = validateTemplateSet(templates, records);

  console.log('\n--- Curriculum validation ---');
  if (curriculumResult.valid) {
    console.log('OK: all curriculum records valid.');
  } else {
    console.log(`FAILED: ${curriculumResult.errors.length} error(s):`);
    curriculumResult.errors.forEach((e) => console.log(`  - ${e}`));
  }

  console.log('\n--- Template validation ---');
  if (templateResult.valid) {
    console.log('OK: all templates valid.');
  } else {
    console.log(`FAILED: ${templateResult.errors.length} error(s):`);
    templateResult.errors.forEach((e) => console.log(`  - ${e}`));
  }

  console.log('\n--- Enabled-readiness gate ---');
  // Single source of truth (Phase 1.2): generator/renderer keys come from
  // the authored source files on disk, loaded through the same isolated
  // script-loader the build uses — not from a separately maintained
  // registry — so readiness validation can never diverge from what
  // questions/v2/dist/runtime.js actually ships.
  const readinessResult = validateEnabledReadiness(records, templates, loadAuthoredGeneratorKeys(), loadAuthoredRendererKeys());
  if (readinessResult.valid) {
    console.log('OK: every "enabled" record (if any) has a ready, valid template.');
  } else {
    console.log(`FAILED: ${readinessResult.errors.length} error(s):`);
    readinessResult.errors.forEach((e) => console.log(`  - ${e}`));
  }

  console.log('\n--- Mapped vs enabled counts ---');
  const report = statusReport(records);
  for (const [scope, counts] of report.entries()) {
    console.log(
      `${scope}: total=${counts.total} mapped=${counts.mapped} enabled=${counts.enabled} ` +
      `legacy=${counts.legacy} retired=${counts.retired} needs_human_review=${counts.needs_human_review}`
    );
  }

  console.log('\n--- Build artifact drift (questions/v2/dist/runtime.js) ---');
  const fs = require('fs');
  const distFile = path.join(__dirname, '..', 'dist', 'runtime.js');
  const freshBuild = buildRuntimeSource();
  const checkedIn = fs.existsSync(distFile) ? fs.readFileSync(distFile, 'utf8') : null;
  const buildUpToDate = checkedIn === freshBuild;
  if (buildUpToDate) {
    console.log('OK: dist/runtime.js matches a fresh build of current sources.');
  } else {
    console.log('DRIFT: dist/runtime.js does not match current sources. Run: node questions/v2/build/build.js');
  }

  const ok = curriculumResult.valid && templateResult.valid && readinessResult.valid && buildUpToDate;
  process.exitCode = ok ? 0 : 1;
}

main();
