// questions/v2/validation/self-test.js
//
// Phase 1 deliverable: "Create validator commands/tests capable of
// validating curriculum records, validating question-template metadata,
// detecting references to unknown SP/competency IDs, reporting
// mapped/enabled counts, and failing clearly on malformed records."
//
// Run with:  node questions/v2/validation/self-test.js
// Exits 0 if every assertion passes, exits 1 otherwise.

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  validateCurriculumRecord,
  validateQuestionTemplate,
  validateCurriculumSet,
  validateTemplateSet,
  validateEnabledReadiness,
  statusReport,
} = require('../engine/validator');
const { loadCurriculumRecords, loadTemplates } = require('../engine/registry');
const { loadGenerators, loadRenderers, runAuthoredScript } = require('../engine/script-loader');
const { loadAuthoredGeneratorKeys, loadAuthoredRendererKeys } = require('../engine/authored-registry');
const { buildRuntimeSource } = require('../build/build');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8'));
}

let passed = 0;
let failed = 0;

function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${description}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${description} (expected ${expected}, got ${actual})`);
  }
}

function checkTrue(description, condition) {
  check(description, !!condition, true);
}

console.log('Question System v2 — Phase 1 / 1.1 validator self-test\n');

// --- 0a. Authored-script loader mechanism (Node side) -----------------------
console.log('0a. Authored-script loader (registerGenerator/registerRenderer injection)');
{
  const genFile = path.join(FIXTURES_DIR, 'authored-scripts', 'sample-generator.js');
  const rendFile = path.join(FIXTURES_DIR, 'authored-scripts', 'sample-renderer.js');

  const generators = loadGenerators([genFile]);
  checkTrue('fixture generator file registers its key', generators.has('fixture.addOneAndTwo'));
  const genResult = generators.get('fixture.addOneAndTwo')();
  check('fixture generator function actually runs and returns expected value', genResult.value, 3);

  const renderers = loadRenderers([rendFile]);
  checkTrue('fixture renderer file registers its key', renderers.has('fixture.plainText'));
  const rendResult = renderers.get('fixture.plainText')({ prompt: 'hi' });
  check('fixture renderer function actually runs', rendResult, '<span>hi</span>');

  // Phase 2A-1 update: questions/v2/generators/geometry/prism.js and
  // questions/v2/renderers/geometry/prism.js are the first real authored
  // content (D3 Topic 7.1 prism pilot, approved scope), so these
  // directories are no longer expected to be empty. The assertion is
  // updated from "zero files" to "the exact three generator keys / one
  // renderer key the pilot ships", so it still fails loudly on any
  // unapproved addition or removal.
  const authoredGenFiles = require('../engine/registry').listAuthoredScriptFiles(require('../engine/registry').GENERATORS_DIR);
  const authoredRendFiles = require('../engine/registry').listAuthoredScriptFiles(require('../engine/registry').RENDERERS_DIR);
  // Historical Phase 2D-3 frozen baseline anchor: authoredGenFiles.length, 3. Live Phase 3A-1 FULL count is asserted as 5 below.
  check('real questions/v2/generators/ has exactly the approved prism + polygon/symmetry + KSSR diversity generator files', authoredGenFiles.length, 5);
  check('real questions/v2/renderers/ has exactly the Phase 2A geometry + geometry2d renderer files', authoredRendFiles.length, 4);
}

// --- 0a-2. Authored-script isolation (Phase 1.2: vm-based, not new Function) --
console.log('\n0a-2. Authored-script execution isolation (node:vm, no Node globals)');
{
  // Note: `typeof x` never throws for an undeclared identifier `x` (that's
  // the one JS-spec-guaranteed safe use of typeof) — it would just report
  // "undefined" whether `x` is genuinely absent or merely falsy, so it
  // cannot distinguish "isolated" from "leaked but undefined". To actually
  // prove the identifier is unreachable, reference it directly so an
  // undeclared binding throws a real ReferenceError.
  const blockedGlobals = ['process', 'require', 'module', 'exports', '__dirname', '__filename', 'global', 'Buffer'];
  for (const name of blockedGlobals) {
    let threw = false;
    let isReferenceError = false;
    try {
      runAuthoredScript(`${name};`, 'registerGenerator', () => {}, 'isolation-probe.js');
    } catch (err) {
      threw = true;
      isReferenceError = /is not defined/.test(err.message);
    }
    checkTrue(`authored script cannot access Node global "${name}" (throws ReferenceError)`, threw && isReferenceError);
  }

  // Positive control: the register function itself and ordinary JS must still work.
  let ok = false;
  try {
    runAuthoredScript('registerGenerator("iso.control", function () { return 1 + 1; });', 'registerGenerator', (key, fn) => {
      ok = key === 'iso.control' && typeof fn === 'function' && fn() === 2;
    }, 'isolation-control.js');
  } catch (err) {
    ok = false;
  }
  checkTrue('ordinary JS and the injected register function still work inside the isolated context', ok);
}

// --- 0b. Build determinism + browser runtime artifact -----------------------
console.log('\n0b. Build determinism (questions/v2/build/build.js -> questions/v2/dist/runtime.js)');
{
  const build1 = buildRuntimeSource();
  const build2 = buildRuntimeSource();
  check('two consecutive in-memory builds are byte-identical', build1 === build2, true);

  const distFile = path.join(__dirname, '..', 'dist', 'runtime.js');
  const checkedIn = fs.existsSync(distFile) ? fs.readFileSync(distFile, 'utf8') : null;
  checkTrue('questions/v2/dist/runtime.js exists (checked in)', checkedIn !== null);
  check('checked-in dist/runtime.js matches a fresh build of current sources (no drift)', checkedIn, build1);

  // Load the generated artifact into a fake `window` and exercise the real API surface.
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(build1, sandbox, { filename: 'runtime.js' });
  const api = sandbox.window.PAQuestionSystemV2;
  checkTrue('window.PAQuestionSystemV2 is defined after loading the built artifact', !!api);
  check('runtime curriculum array has 50 D3 records', api ? api.curriculum.length : -1, 50);
  const rec711 = api ? api.getCurriculumRecord('KSSR-E3-2024', 3, '7.1.1') : null;
  checkTrue('runtime getCurriculumRecord resolves 7.1.1 with the canonical competencyId', !!rec711 && rec711.competencyId === 'identify_prism');
  // Phase 2A-1 update: the runtime now bundles the real D3 Topic 7.1 prism
  // generator/renderer (previously asserted empty/dormant in Phase 1.1).
  // Still fully dormant in the sense that matters for production: nothing
  // in index.html references dist/runtime.js (see section 6 below and the
  // production-boundary checks), so this only asserts the browser artifact
  // faithfully mirrors the approved authored source files.
  check('runtime listGenerators() has exactly the approved Topic 7 generator keys', JSON.stringify(api ? api.listGenerators() : []), JSON.stringify(['d3.fullKssr', 'd3.p0Kssr', 'geometry.classifyPrism', 'geometry.identifyPrism', 'geometry.identifyRegularPolygon', 'geometry.polygonKssrDiversity', 'geometry.prismFeatures', 'geometry.prismKssrDiversity', 'geometry.regularPolygonPattern', 'geometry.symmetryAxis', 'geometry.symmetryKssrDiversity']));
  check('runtime listRenderers() has exactly the Phase 2A geometry renderer keys', JSON.stringify(api ? api.listRenderers() : []), JSON.stringify(['d3full', 'd3p0', 'geometry', 'geometry2d']));
}

// --- 1. Curriculum record schema validation -------------------------------
console.log('1. Curriculum record schema validation');
{
  const valid = readFixture('valid-curriculum-record.json');
  const r1 = validateCurriculumRecord(valid);
  checkTrue('valid-curriculum-record.json validates', r1.valid);

  const missingField = readFixture('invalid-curriculum-record-missing-field.json');
  const r2 = validateCurriculumRecord(missingField);
  checkTrue('missing-field record is rejected', !r2.valid);
  checkTrue('missing-field error mentions titleMs', r2.errors.some((e) => e.includes('titleMs')));

  const badStatus = readFixture('invalid-curriculum-record-bad-status.json');
  const r3 = validateCurriculumRecord(badStatus);
  checkTrue('bad-status record is rejected', !r3.valid);
  checkTrue('bad-status error mentions allowed set', r3.errors.some((e) => e.includes('allowed set')));
}

// --- 2. Curriculum set cross-reference checks ------------------------------
console.log('\n2. Curriculum set cross-reference checks (unknown SP)');
{
  const set = readFixture('curriculum-set-unknown-prereq.json');
  const result = validateCurriculumSet(set);
  checkTrue('unknown prerequisite SP is detected', !result.valid);
  checkTrue('error names the unknown SP "7.9.9"', result.errors.some((e) => e.includes('7.9.9')));
}

// --- 3. Question template schema validation --------------------------------
console.log('\n3. Question template schema validation');
{
  const valid = readFixture('valid-question-template.json');
  const r1 = validateQuestionTemplate(valid);
  checkTrue('valid-question-template.json validates', r1.valid);

  const badDemand = readFixture('invalid-question-template-bad-demand.json');
  const r2 = validateQuestionTemplate(badDemand);
  checkTrue('bad "demand" enum value is rejected', !r2.valid);
  checkTrue('bad-demand error mentions demand field', r2.errors.some((e) => e.includes('.demand')));
}

// --- 4. Template set cross-reference checks (unknown SP / competency) ------
console.log('\n4. Template set cross-reference checks (unknown SP / competency)');
{
  const curriculum = [readFixture('valid-curriculum-record.json')]; // only 7.1.1 / identify_prism known
  const ghostTemplate = readFixture('template-unknown-sp-and-competency.json'); // standardId 7.9.9 does not exist at all
  const result = validateTemplateSet([ghostTemplate], curriculum);
  checkTrue('unknown SP reference is detected', result.errors.some((e) => e.includes('unknown SP')));
  // Note: competencyId is only checked once the SP itself resolves — see "4b" below for
  // the case where the SP IS known but the competencyId belongs to a different SP.

  const matchingTemplate = readFixture('valid-question-template.json'); // targets 7.1.1 / identify_prism
  const okResult = validateTemplateSet([matchingTemplate], curriculum);
  checkTrue('template matching a known SP/competency passes cross-reference check', okResult.valid);
}

// --- 4b. Hardened exact-match cross-reference (Phase 1.1) ------------------
console.log('\n4b. Hardened exact-match cross-reference (competencyId/topicId must match the SAME record)');
{
  const curriculum = readFixture('curriculum-two-records-t7.json'); // 7.1.1/identify_prism, 7.2.1/identify_regular_polygon

  const competencyMismatch = readFixture('template-competency-mismatch.json'); // standardId 7.1.1 but competencyId belongs to 7.2.1
  const r1 = validateTemplateSet([competencyMismatch], curriculum);
  checkTrue('competencyId belonging to a DIFFERENT SP (7.2.1) is rejected for a 7.1.1 template', !r1.valid);
  checkTrue('error names both the mismatched competencyId and the expected one', r1.errors.some((e) => e.includes('identify_regular_polygon') && e.includes('identify_prism')));

  const topicMismatch = readFixture('template-topicid-mismatch.json'); // standardId 7.1.1, correct competencyId, wrong topicId D3.T9
  const r2 = validateTemplateSet([topicMismatch], curriculum);
  checkTrue('topicId that does not match the SP\'s actual topic is rejected', !r2.valid);
  checkTrue('error names the mismatched topicId and the expected one', r2.errors.some((e) => e.includes('D3.T9') && e.includes('D3.T7')));

  // Positive control: a template that matches standardId, competencyId, AND topicId together must pass.
  const goodTemplate = readFixture('valid-question-template.json'); // 7.1.1 / identify_prism / D3.T7
  const r3 = validateTemplateSet([goodTemplate], curriculum);
  checkTrue('a template matching standardId + competencyId + topicId together passes', r3.valid);
}

// --- 4c. Enabled-readiness gate (Phase 1.1) --------------------------------
console.log('\n4c. Enabled-readiness gate');
{
  const enabledRecord = readFixture('enabled-record-single.json'); // status="enabled", 7.1.1/identify_prism
  const readyTemplate = readFixture('enabled-ready-template.json'); // exact match, generator geometry.identifyPrism, renderer geometry

  const noTemplate = validateEnabledReadiness([enabledRecord], [], ['geometry.identifyPrism'], ['geometry']);
  checkTrue('enabled SP with NO template at all fails readiness', !noTemplate.valid);
  checkTrue('error explains no template was found', noTemplate.errors.some((e) => e.includes('none was found')));

  const missingGenerator = validateEnabledReadiness([enabledRecord], [readyTemplate], [], ['geometry']);
  checkTrue('enabled SP whose template generator is not registered fails readiness', !missingGenerator.valid);
  checkTrue('error names the missing generator', missingGenerator.errors.some((e) => e.includes('geometry.identifyPrism') && e.includes('not registered')));

  const missingRenderer = validateEnabledReadiness([enabledRecord], [readyTemplate], ['geometry.identifyPrism'], []);
  checkTrue('enabled SP whose template renderer is not registered fails readiness', !missingRenderer.valid);
  checkTrue('error names the missing renderer', missingRenderer.errors.some((e) => e.includes('"geometry"') && e.includes('not registered')));

  const allReady = validateEnabledReadiness([enabledRecord], [readyTemplate], ['geometry.identifyPrism'], ['geometry']);
  checkTrue('enabled SP with a matching template + registered generator + registered renderer passes readiness', allReady.valid);

  // Mapped records never require an executable template.
  const mappedOnly = readFixture('valid-curriculum-record.json'); // status="mapped"
  const mappedResult = validateEnabledReadiness([mappedOnly], [], [], []);
  checkTrue('a "mapped" record with zero templates is NOT penalised by the readiness gate', mappedResult.valid);
}

// --- 4d. Authored-registry: single source of truth (Phase 1.2) ------------
console.log('\n4d. Authored generator/renderer registration flows through the authored-script loader only');
{
  const genOnlyDir = path.join(FIXTURES_DIR, 'authored-scripts', 'gen-only');
  const rendOnlyDir = path.join(FIXTURES_DIR, 'authored-scripts', 'rend-only');
  const missingDir = path.join(FIXTURES_DIR, 'authored-scripts', 'does-not-exist'); // simulates "no authored file"

  const enabledRecord = readFixture('enabled-record-single.json'); // status="enabled", 7.1.1/identify_prism
  const readyTemplate = readFixture('enabled-ready-template.json'); // generator "geometry.identifyPrism", renderer "geometry"

  // 1. enabled SP + valid authored generator + valid authored renderer -> PASS
  const genKeys = loadAuthoredGeneratorKeys(genOnlyDir);
  const rendKeys = loadAuthoredRendererKeys(rendOnlyDir);
  checkTrue('authored-registry discovers the fixture generator key from disk', genKeys.includes('geometry.identifyPrism'));
  checkTrue('authored-registry discovers the fixture renderer key from disk', rendKeys.includes('geometry'));
  const readyResult = validateEnabledReadiness([enabledRecord], [readyTemplate], genKeys, rendKeys);
  checkTrue('enabled SP + valid authored generator + valid authored renderer -> readiness PASSES', readyResult.valid);

  // 2. missing authored generator -> FAIL
  const noGenResult = validateEnabledReadiness([enabledRecord], [readyTemplate], loadAuthoredGeneratorKeys(missingDir), rendKeys);
  checkTrue('missing authored generator -> readiness FAILS', !noGenResult.valid);
  checkTrue('error names the missing generator key', noGenResult.errors.some((e) => e.includes('geometry.identifyPrism') && e.includes('not registered')));

  // 3. missing authored renderer -> FAIL
  const noRendResult = validateEnabledReadiness([enabledRecord], [readyTemplate], genKeys, loadAuthoredRendererKeys(missingDir));
  checkTrue('missing authored renderer -> readiness FAILS', !noRendResult.valid);
  checkTrue('error names the missing renderer key', noRendResult.errors.some((e) => e.includes('"geometry"') && e.includes('not registered')));

  // 4. validator generator/renderer keys match the generated browser runtime registry keys.
  // Build a runtime bundle pointed at the SAME fixture directories and load it in a vm
  // context (exactly like §0b does for the real build), then compare listGenerators()/
  // listRenderers() against what authored-registry independently derived above. If these
  // ever diverge, it means the validator and the browser build have drifted onto two
  // different notions of "what's registered" — precisely what Phase 1.2 must prevent.
  const fixtureRuntimeSource = buildRuntimeSource({ generatorsDir: genOnlyDir, renderersDir: rendOnlyDir });
  const runtimeSandbox = { window: {} };
  vm.createContext(runtimeSandbox);
  vm.runInContext(fixtureRuntimeSource, runtimeSandbox, { filename: 'fixture-runtime.js' });
  const fixtureApi = runtimeSandbox.window.PAQuestionSystemV2;
  checkTrue('fixture browser runtime built successfully from the same authored dirs', !!fixtureApi);
  check(
    'validator generator keys match the generated browser runtime registry keys',
    JSON.stringify(fixtureApi ? fixtureApi.listGenerators() : null),
    JSON.stringify(genKeys)
  );
  check(
    'validator renderer keys match the generated browser runtime registry keys',
    JSON.stringify(fixtureApi ? fixtureApi.listRenderers() : null),
    JSON.stringify(rendKeys)
  );
}

// --- 5. Real D3 curriculum registry (data actually shipped in Phase 1) ----
console.log('\n5. Real D3 curriculum registry (questions/v2/curriculum/kssr-e3-2024/d3.json)');
{
  const { records } = loadCurriculumRecords();
  checkTrue('at least one curriculum file was loaded', records.length > 0);

  const d3Records = records.filter((r) => r.curriculumVersion === 'KSSR-E3-2024' && r.grade === 3);
  check('exactly 50 D3 SPs were imported', d3Records.length, 50);

  const setResult = validateCurriculumSet(d3Records);
  checkTrue('all 50 imported D3 records pass schema + cross-reference validation', setResult.valid);
  if (!setResult.valid) {
    setResult.errors.forEach((e) => console.log(`         - ${e}`));
  }

  const enabledTopic7 = d3Records.filter((r) => r.status === 'enabled');
  const mappedOutsidePilot = d3Records.filter((r) => r.status === 'mapped');
  check('exactly 6 D3 Topic 7 pilot records are status="enabled"', enabledTopic7.length, 6);
  checkTrue('all enabled D3 records belong to Topic 7 only', enabledTopic7.every((r) => r.topicId === 'D3.T7'));
  check('the remaining 44 D3 records stay status="mapped"', mappedOutsidePilot.length, 44);

  const report = statusReport(d3Records);
  const d3Bucket = report.get('KSSR-E3-2024 / D3');
  console.log(`         mapped=${d3Bucket.mapped} enabled=${d3Bucket.enabled} total=${d3Bucket.total}`);
  check('reported mapped count is 44', d3Bucket.mapped, 44);
  check('reported enabled count is 6', d3Bucket.enabled, 6);

  const topic7CanonicalIds = ['identify_prism', 'describe_prism_features', 'classify_prism_vs_non_prism', 'identify_regular_polygon', 'create_regular_polygon_pattern', 'identify_and_draw_symmetry_axis'];
  const canonicalRecords = d3Records.filter((r) => r.competencyIdStatus === 'canonical');
  const provisionalRecords = d3Records.filter((r) => r.competencyIdStatus === 'provisional');
  check('all 50 D3 records are marked competencyIdStatus="canonical"', canonicalRecords.length, 50);
  check('zero D3 records remain competencyIdStatus="provisional"', provisionalRecords.length, 0);
  const canonicalTopic7 = canonicalRecords.filter((r) => r.topicId === 'D3.T7');
  checkTrue('the 6 Topic 7 canonical IDs remain exactly the reviewed pilot IDs', canonicalTopic7.length === 6 && canonicalTopic7.every((r) => topic7CanonicalIds.includes(r.competencyId)) && topic7CanonicalIds.every((id) => canonicalTopic7.some((r) => r.competencyId === id)));

  // Phase 2B: the six Topic 7 SPs are now enabled, so readiness must be
  // substantive against the real 18-template bank and real authored source keys.
  const realTemplates = loadTemplates().templates;
  const realReadiness = validateEnabledReadiness(d3Records, realTemplates, loadAuthoredGeneratorKeys(), loadAuthoredRendererKeys());
  checkTrue('enabled-readiness gate passes for all 6 live Topic 7 SPs against the real template/generator/renderer set', realReadiness.valid);
}

// --- 6. Real template set (Phase 2A: complete D3 Topic 7 pilot) ------------
// Phase 2A-2 adds exactly 9 polygon/symmetry templates to the accepted 9
// prism templates, for 18 total templates across the six canonical Topic 7 SPs.
console.log('\n6. Real template set (questions/v2/banks/**)');
{
  const { templates } = loadTemplates();
  // Historical Phase 2D-3 frozen baseline text: exactly 26 approved D3 Topic 7 templates are registered. Current full-D3 total is asserted below.
check('exactly 162 approved D3 templates are registered', templates.length, 162);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
