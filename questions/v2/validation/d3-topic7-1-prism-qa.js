#!/usr/bin/env node
// questions/v2/validation/d3-topic7-1-prism-qa.js
//
// Dedicated QA harness for the D3 Topic 7.1 ("Prisma") pilot, Phase 2A-1.
//
// Exercises the REAL authored sources only:
//   - questions/v2/banks/kssr-e3-2024/d3/space-prism.json  (9 templates)
//   - questions/v2/generators/geometry/prism.js            (via the same
//     isolated script-loader / authored-registry used by build.js and
//     validation/cli.js — never a hand-rolled copy of the generator code)
//   - questions/v2/renderers/geometry/prism.js             (same loading path)
//
// This file does NOT reimplement question-generation logic (mode
// dispatch, distractor construction, prompt text). It only:
//   1. drives the real generator/renderer functions with a seeded RNG,
//   2. assembles the MCQ shape (answer + distractors) the same way the
//      Phase 2+ runtime engine eventually will (engine/generator.js is
//      not yet implemented — see its own file header — so that assembly
//      step is done here, structurally, not as duplicated content logic),
//   3. checks the result against an INDEPENDENT ground-truth fact table
//      (below) so a generator bug can't mark itself "correct" by
//      construction. The ground-truth table encodes only static geometry
//      facts (face/vertex/edge counts, base shapes) — never Bahasa
//      Melayu label text, and never substring-matched.
//
// Usage:
//   node questions/v2/validation/d3-topic7-1-prism-qa.js [seed]
//
// Exit code 0 = every check across every sample passed.
// Exit code 1 = at least one check failed (details printed, nothing hidden).

'use strict';

const path = require('path');
const {
  loadTemplates,
  loadCurriculumRecords,
  GENERATORS_DIR,
  RENDERERS_DIR,
  listAuthoredScriptFiles,
} = require('../engine/registry');
const { loadGenerators, loadRenderers } = require('../engine/script-loader');

// ---------------------------------------------------------------------------
// Seeded deterministic RNG (mulberry32). Pure function of its seed.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringHashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sha256Hex(text) {
  return require('crypto').createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Independent ground-truth oracle (static KSSR geometry facts only).
// Used ONLY to cross-check generator output; never used to build questions.
// ---------------------------------------------------------------------------
const GROUND_TRUTH = {
  square_prism: { kind: 'prism', solidKind: 'prism', baseShapeId: 'square', faces: 6, vertices: 8, edges: 12 },
  rectangular_prism: { kind: 'prism', solidKind: 'prism', baseShapeId: 'rectangle', faces: 6, vertices: 8, edges: 12 },
  triangular_prism: { kind: 'prism', solidKind: 'prism', baseShapeId: 'triangle', faces: 5, vertices: 6, edges: 9 },
  cone: { kind: 'non_prism', solidKind: 'cone', baseShapeId: 'circle' },
  sphere: { kind: 'non_prism', solidKind: 'sphere', baseShapeId: null },
  cylinder: { kind: 'non_prism', solidKind: 'cylinder', baseShapeId: 'circle' },
  square_pyramid: { kind: 'non_prism', solidKind: 'pyramid', baseShapeId: 'square' },
  triangular_pyramid: { kind: 'non_prism', solidKind: 'pyramid', baseShapeId: 'triangle' },
};
// solidKind + baseShapeId is a structured descriptor owned independently by
// this QA harness (not read from the generator's meta.semanticProperties)
// used to verify classify_by_properties semantic uniqueness below.
const PRISM_IDS = Object.keys(GROUND_TRUTH).filter((id) => GROUND_TRUTH[id].kind === 'prism');

// ---------------------------------------------------------------------------
// Report accumulators
// ---------------------------------------------------------------------------
let totalChecks = 0;
let failedChecks = 0;
const failures = [];
const perTemplate = {}; // templateId -> { samples, fingerprints: Map }
const perCompetency = {}; // competencyId -> sample count
const perArchetype = {}; // archetypeId -> sample count
const educationalFindings = [];

function check(label, condition, context) {
  totalChecks++;
  if (!condition) {
    failedChecks++;
    failures.push({ label, context: context || null });
  }
  return condition;
}

// ---------------------------------------------------------------------------
// Load real authored sources (same isolated loading path as build.js/cli.js)
// ---------------------------------------------------------------------------
const { templates } = loadTemplates();
const { records: curriculumRecords } = loadCurriculumRecords();

const generatorFiles = listAuthoredScriptFiles(GENERATORS_DIR);
const rendererFiles = listAuthoredScriptFiles(RENDERERS_DIR);
const generators = loadGenerators(generatorFiles);
const renderers = loadRenderers(rendererFiles);

console.log('Question System v2 — D3 Topic 7.1 (Prisma) QA harness\n');
console.log(`Templates loaded: ${templates.length}`);
console.log(`Generator keys: ${Array.from(generators.keys()).sort().join(', ')}`);
console.log(`Renderer keys: ${Array.from(renderers.keys()).sort().join(', ')}\n`);

// --- Check 12 / 17: every template exercised, and cross-referenced to curriculum ---
const prismStandardIds = new Set(['7.1.1', '7.1.2', '7.1.3']);
const prismTemplates = templates.filter((t) => t.topicId === 'D3.T7' && prismStandardIds.has(t.standardId));
check('exactly 12 D3 Topic 7.1 prism templates are present to exercise', prismTemplates.length === 12, {
  found: prismTemplates.length,
});

const curriculumByStandard = new Map();
for (const rec of curriculumRecords) {
  curriculumByStandard.set(`${rec.curriculumVersion}::${rec.grade}::${rec.standardId}`, rec);
}
for (const tpl of prismTemplates) {
  const key = `${tpl.curriculumVersion}::${tpl.grade}::${tpl.standardId}`;
  const rec = curriculumByStandard.get(key);
  check(`template ${tpl.templateId}: curriculum cross-reference exists for standardId ${tpl.standardId}`, !!rec, {
    templateId: tpl.templateId,
  });
  if (rec) {
    check(
      `template ${tpl.templateId}: competencyId matches curriculum record (${tpl.competencyId} === ${rec.competencyId})`,
      tpl.competencyId === rec.competencyId,
      { templateId: tpl.templateId }
    );
    check(
      `template ${tpl.templateId}: topicId matches curriculum record`,
      tpl.topicId === rec.topicId,
      { templateId: tpl.templateId }
    );
  }
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------
const BASE_SEED = Number(process.argv[2]) || 20260823;
const SAMPLES_PER_TEMPLATE = 200; // 9 templates x 200 = 1800 total, 600 per competency (>= 500 required)

function runSample(tpl, index, seed) {
  const rngSeed = stringHashSeed(`${seed}::${tpl.templateId}::${index}`);
  const rng = mulberry32(rngSeed);

  const genFn = generators.get(tpl.generator);
  if (!genFn) {
    check(`template ${tpl.templateId}: generator "${tpl.generator}" is registered`, false);
    return null;
  }

  let raw;
  try {
    raw = genFn(tpl.params, rng);
  } catch (err) {
    check(`template ${tpl.templateId} sample ${index}: generator does not throw`, false, {
      error: err.message,
    });
    return null;
  }
  check(`template ${tpl.templateId} sample ${index}: generator does not throw`, true);

  const value = raw && raw.value;
  const distractors = (raw && raw.distractors) || [];
  const meta = (raw && raw.meta) || {};

  // --- check 2: answer exists ---
  const hasAnswer = !!(value && value.answer && typeof value.answer.id === 'string' && value.answer.id.length > 0);
  check(`template ${tpl.templateId} sample ${index}: answer exists`, hasAnswer, { templateId: tpl.templateId });
  if (!hasAnswer) return null;

  // --- check 4: exactly 3 distractors for MCQ contract ---
  check(
    `template ${tpl.templateId} sample ${index}: exactly 3 distractors`,
    tpl.responseType !== 'mcq' || distractors.length === 3,
    { templateId: tpl.templateId, got: distractors.length }
  );

  // --- check 5: distractor IDs unique ---
  const distractorIds = distractors.map((d) => d.id);
  const uniqueDistractorIds = new Set(distractorIds);
  check(
    `template ${tpl.templateId} sample ${index}: distractor IDs unique`,
    uniqueDistractorIds.size === distractorIds.length,
    { templateId: tpl.templateId, ids: distractorIds }
  );

  // --- check 6: distractor labels unique where relevant ---
  const distractorLabels = distractors.map((d) => d.labelMs);
  const uniqueDistractorLabels = new Set(distractorLabels);
  check(
    `template ${tpl.templateId} sample ${index}: distractor labels unique`,
    uniqueDistractorLabels.size === distractorLabels.length,
    { templateId: tpl.templateId, labels: distractorLabels }
  );

  // --- check 7: answer does not duplicate distractor ID ---
  check(
    `template ${tpl.templateId} sample ${index}: answer ID not duplicated among distractors`,
    !uniqueDistractorIds.has(value.answer.id),
    { templateId: tpl.templateId }
  );

  // --- check 8/9: answer does not duplicate distractor meaning / no ambiguous MCQ ---
  check(
    `template ${tpl.templateId} sample ${index}: answer label not duplicated among distractors`,
    !uniqueDistractorLabels.has(value.answer.labelMs),
    { templateId: tpl.templateId }
  );

  // --- check 16: misconception metadata present ---
  const hasMisconceptionMeta = Array.isArray(meta.misconceptionTargets) && meta.misconceptionTargets.length > 0;
  check(
    `template ${tpl.templateId} sample ${index}: misconceptionTargets metadata present`,
    hasMisconceptionMeta,
    { templateId: tpl.templateId }
  );
  const distractorsHaveTags = distractors.every((d) => typeof d.misconceptionTag === 'string' && d.misconceptionTag.length > 0);
  check(
    `template ${tpl.templateId} sample ${index}: every distractor carries a misconceptionTag`,
    distractorsHaveTags,
    { templateId: tpl.templateId }
  );

  // --- check 18: generated metadata matches template intent ---
  check(
    `template ${tpl.templateId} sample ${index}: meta.archetype matches template archetypeId`,
    meta.archetype === tpl.archetypeId,
    { templateId: tpl.templateId, got: meta.archetype, expected: tpl.archetypeId }
  );
  const metaTargetsSorted = Array.isArray(meta.misconceptionTargets) ? meta.misconceptionTargets.slice().sort() : [];
  const tplTargetsSorted = Array.isArray(tpl.misconceptionTargets) ? tpl.misconceptionTargets.slice().sort() : [];
  check(
    `template ${tpl.templateId} sample ${index}: meta.misconceptionTargets matches template's declared targets`,
    JSON.stringify(metaTargetsSorted) === JSON.stringify(tplTargetsSorted),
    { templateId: tpl.templateId }
  );

  // --- check 19: no leaked artifacts (hygiene, not semantic label parsing) ---
  const allLabels = [value.promptMs, value.answer.labelMs].concat(distractorLabels).filter((s) => typeof s === 'string');
  const noArtifacts = allLabels.every((s) => !/undefined|NaN|\[object Object\]|null/i.test(s)) &&
    (typeof value.promptMs !== 'string' || value.promptMs.trim().length > 0);
  check(`template ${tpl.templateId} sample ${index}: no leaked undefined/NaN/null text in wording`, noArtifacts, {
    templateId: tpl.templateId,
  });

  // --- educational correctness: cross-check against independent ground truth ---
  educationalCorrectnessCheck(tpl, value, distractors, index);

  // --- check 10/11: render visual questions and validate SVG/HTML structure ---
  if (tpl.renderer) {
    const rendFn = renderers.get(tpl.renderer);
    check(`template ${tpl.templateId} sample ${index}: renderer "${tpl.renderer}" is registered`, !!rendFn, {
      templateId: tpl.templateId,
    });
    if (rendFn) {
      let html;
      try {
        html = rendFn(value, tpl.params);
      } catch (err) {
        check(`template ${tpl.templateId} sample ${index}: renderer does not throw`, false, { error: err.message });
        html = null;
      }
      if (html !== null) {
        check(`template ${tpl.templateId} sample ${index}: renderer does not throw`, true);
        validateRenderedMarkup(tpl, value, html, index);
      }
    }
  }

  // --- fingerprint / repetition tracking (check 20) ---
  if (!perTemplate[tpl.templateId]) perTemplate[tpl.templateId] = { samples: 0, fingerprints: new Map() };
  perTemplate[tpl.templateId].samples++;
  const fp = meta.fingerprint || 'NO_FINGERPRINT';
  perTemplate[tpl.templateId].fingerprints.set(fp, (perTemplate[tpl.templateId].fingerprints.get(fp) || 0) + 1);

  perCompetency[tpl.competencyId] = (perCompetency[tpl.competencyId] || 0) + 1;
  perArchetype[tpl.archetypeId] = (perArchetype[tpl.archetypeId] || 0) + 1;

  return { value, distractors, meta, fingerprint: fp };
}

/**
 * Independent ground-truth cross-check. Only reads GROUND_TRUTH (static
 * facts) and structured ids/values already on the generator's output —
 * never parses Bahasa Melayu label text.
 */
function educationalCorrectnessCheck(tpl, value, distractors, index) {
  const archetype = tpl.archetypeId;

  if (archetype === 'identify_from_picture' || archetype === 'identify_from_properties' || archetype === 'discriminate_solids') {
    const answerId = value.answer.id.replace(/^fig_\d+_/, ''); // discriminate mode prefixes figure ids
    const truth = GROUND_TRUTH[answerId];
    check(`template ${tpl.templateId} sample ${index}: identified solid id is a known prism`, !!truth && truth.kind === 'prism', {
      answerId,
    });
  }

  if (archetype === 'count_faces') {
    const solidId = value.visual.figures[0].solidId;
    const truth = GROUND_TRUTH[solidId];
    const answerCount = Number(value.answer.id);
    check(
      `template ${tpl.templateId} sample ${index}: face count answer matches ground truth for ${solidId}`,
      truth && answerCount === truth.faces,
      { solidId, answerCount, expected: truth && truth.faces }
    );
    // no distractor may equal the true face count
    const anyDistractorMatchesTruth = distractors.some((d) => Number(d.id) === truth.faces);
    check(
      `template ${tpl.templateId} sample ${index}: no distractor face count equals the true value`,
      !anyDistractorMatchesTruth,
      { solidId }
    );
  }

  if (archetype === 'identify_base') {
    const solidId = value.visual.figures[0].solidId;
    const truth = GROUND_TRUTH[solidId];
    check(
      `template ${tpl.templateId} sample ${index}: base shape answer matches ground truth for ${solidId}`,
      truth && value.answer.id === truth.baseShapeId,
      { solidId, answerId: value.answer.id, expected: truth && truth.baseShapeId }
    );
  }

  if (archetype === 'reason_vertices_edges') {
    // Prompt states baseCount + faces; answer is either edges or vertices.
    // Recover which prism the prompt describes via (faces) among PRISM_IDS
    // whose (faces) is unique enough for cross-check, else check both.
    const answerValue = Number(value.answer.id);
    const candidates = PRISM_IDS.filter(
      (id) => GROUND_TRUTH[id].edges === answerValue || GROUND_TRUTH[id].vertices === answerValue
    );
    check(
      `template ${tpl.templateId} sample ${index}: reasoned edge/vertex count matches a real prism's ground truth`,
      candidates.length > 0,
      { answerValue }
    );
  }

  if (archetype === 'select_prism_from_set' || archetype === 'classify_by_properties') {
    const rawAnswerId = value.answer.id.replace(/^fig_\d+_/, '');
    const truth = GROUND_TRUTH[rawAnswerId];
    if (archetype === 'select_prism_from_set') {
      check(
        `template ${tpl.templateId} sample ${index}: selected solid is genuinely a prism`,
        !!truth && truth.kind === 'prism',
        { rawAnswerId }
      );
    }

    if (archetype === 'classify_by_properties') {
      // Independent semantic-uniqueness check. The descriptor is derived
      // solely from this file's own GROUND_TRUTH table, keyed by the raw
      // solid id — never from the generator's meta.semanticProperties,
      // and never by parsing the Bahasa Melayu promptMs text. Label
      // uniqueness (checked earlier, generically, for all archetypes) is
      // NOT used as a proxy for this: two different solids can carry
      // different labels while both still satisfying the same described
      // property set, which is exactly the bug this check exists to catch.
      check(
        `template ${tpl.templateId} sample ${index}: classify_by_properties answer id is a known solid`,
        !!truth,
        { rawAnswerId }
      );

      if (truth) {
        const descriptor = { solidKind: truth.solidKind, baseShapeId: truth.baseShapeId };
        const satisfiesDescriptor = (id) => {
          const t = GROUND_TRUTH[id];
          return !!t && t.solidKind === descriptor.solidKind && t.baseShapeId === descriptor.baseShapeId;
        };

        check(
          `template ${tpl.templateId} sample ${index}: intended answer satisfies its own structured descriptor`,
          satisfiesDescriptor(rawAnswerId),
          { rawAnswerId, descriptor }
        );

        const candidateIds = [rawAnswerId].concat(
          distractors.map((d) => d.id.replace(/^fig_\d+_/, ''))
        );
        const semanticValidOptionCount = candidateIds.filter(satisfiesDescriptor).length;

        check(
          `template ${tpl.templateId} sample ${index}: classify_by_properties has exactly one semantically valid option (semanticValidOptionCount === 1)`,
          semanticValidOptionCount === 1,
          { candidateIds, semanticValidOptionCount, descriptor }
        );
      }
    }
  }

  if (archetype === 'compare_prism_non_prism') {
    const rawAnswerId = value.answer.id.replace(/^fig_\d+_/, '');
    const truth = GROUND_TRUTH[rawAnswerId];
    check(
      `template ${tpl.templateId} sample ${index}: "which is NOT a prism" answer is genuinely non-prism`,
      !!truth && truth.kind === 'non_prism',
      { rawAnswerId }
    );
    // every distractor (the actual prisms) must genuinely be prisms
    const allDistractorsArePrisms = distractors.every((d) => {
      const id = d.id.replace(/^fig_\d+_/, '');
      return GROUND_TRUTH[id] && GROUND_TRUTH[id].kind === 'prism';
    });
    check(
      `template ${tpl.templateId} sample ${index}: all distractors in "NOT a prism" question are genuinely prisms`,
      allDistractorsArePrisms
    );
  }
}

/** Structural HTML/SVG validity: balanced tags + figure count matches visual.figures. */
function validateRenderedMarkup(tpl, value, html, index) {
  const openTags = (html.match(/<([a-zA-Z][\w-]*)(\s[^>]*)?>/g) || []).map((t) => t.match(/^<([a-zA-Z][\w-]*)/)[1]);
  const selfClosing = new Set(['ellipse', 'circle', 'rect', 'polygon', 'path']); // used self-closed with "/>"
  const closeTags = (html.match(/<\/([a-zA-Z][\w-]*)>/g) || []).map((t) => t.match(/^<\/([a-zA-Z][\w-]*)/)[1]);

  // Count only non-self-closing opens (svg, div) against their closes.
  const opensNeedingClose = openTags.filter((t) => !selfClosing.has(t) && !html.includes(`<${t}${''}`.match ? '' : ''));
  const stack = [];
  let balanced = true;
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)(\s[^>]*)?\/?>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const isClose = m[1] === '/';
    const tag = m[2];
    const isSelfClose = /\/>\s*$/.test(m[0]);
    if (selfClosing.has(tag) || isSelfClose) continue;
    if (!isClose) stack.push(tag);
    else {
      const last = stack.pop();
      if (last !== tag) {
        balanced = false;
      }
    }
  }
  balanced = balanced && stack.length === 0;
  check(`template ${tpl.templateId} sample ${index}: rendered markup has balanced tags`, balanced, { templateId: tpl.templateId });

  const expectedFigures = (value.visual && value.visual.figures && value.visual.figures.length) || 0;
  const actualFigureAttrs = (html.match(/data-figure-id="/g) || []).length;
  check(
    `template ${tpl.templateId} sample ${index}: rendered figure count matches visual.figures.length`,
    actualFigureAttrs === expectedFigures,
    { templateId: tpl.templateId, expected: expectedFigures, got: actualFigureAttrs }
  );

  const svgCount = (html.match(/<svg[\s>]/g) || []).length;
  check(
    `template ${tpl.templateId} sample ${index}: one <svg> per figure`,
    svgCount === expectedFigures,
    { templateId: tpl.templateId }
  );
}

// ---------------------------------------------------------------------------
// Main sampling run (base seed)
// ---------------------------------------------------------------------------
for (const tpl of prismTemplates) {
  for (let i = 0; i < SAMPLES_PER_TEMPLATE; i++) {
    runSample(tpl, i, BASE_SEED);
  }
}

// --- check 13: every competency reaches >= 500 samples ---
for (const compId of ['identify_prism', 'describe_prism_features', 'classify_prism_vs_non_prism']) {
  check(`competency "${compId}" reaches >= 500 samples`, (perCompetency[compId] || 0) >= 500, {
    got: perCompetency[compId] || 0,
  });
}

const totalSamples = Object.values(perCompetency).reduce((a, b) => a + b, 0);
check('total samples across all competencies >= 1500', totalSamples >= 1500, { got: totalSamples });

// --- check 14: identical seed reproduces identical output ---
const rerunFingerprintLog = [];
for (const tpl of prismTemplates) {
  for (let i = 0; i < 20; i++) {
    // small re-run sample for determinism check, isolated rng
    const rngSeed = stringHashSeed(`${BASE_SEED}::${tpl.templateId}::${i}`);
    const rng = mulberry32(rngSeed);
    const genFn = generators.get(tpl.generator);
    const raw = genFn(tpl.params, rng);
    rerunFingerprintLog.push(raw.meta.fingerprint);
  }
}
const firstRunFingerprintLog = [];
for (const tpl of prismTemplates) {
  for (let i = 0; i < 20; i++) {
    const rngSeed = stringHashSeed(`${BASE_SEED}::${tpl.templateId}::${i}`);
    const rng = mulberry32(rngSeed);
    const genFn = generators.get(tpl.generator);
    const raw = genFn(tpl.params, rng);
    firstRunFingerprintLog.push(raw.meta.fingerprint);
  }
}
check(
  'identical seed reproduces identical output (same fingerprint sequence)',
  JSON.stringify(firstRunFingerprintLog) === JSON.stringify(rerunFingerprintLog)
);

// --- check 15: different seeds produce meaningful variation ---
const altSeedFingerprints = [];
for (const tpl of prismTemplates) {
  for (let i = 0; i < 20; i++) {
    const rngSeed = stringHashSeed(`${BASE_SEED + 999}::${tpl.templateId}::${i}`);
    const rng = mulberry32(rngSeed);
    const genFn = generators.get(tpl.generator);
    const raw = genFn(tpl.params, rng);
    altSeedFingerprints.push(raw.meta.fingerprint);
  }
}
let differingCount = 0;
for (let i = 0; i < firstRunFingerprintLog.length; i++) {
  if (firstRunFingerprintLog[i] !== altSeedFingerprints[i]) differingCount++;
}
check(
  'a different seed produces meaningfully different output (>=20% of positions differ)',
  differingCount / firstRunFingerprintLog.length >= 0.2,
  { differingCount, of: firstRunFingerprintLog.length }
);

// ---------------------------------------------------------------------------
// Report summary
// ---------------------------------------------------------------------------
console.log('--- Per-template sample counts ---');
for (const tpl of prismTemplates) {
  const t = perTemplate[tpl.templateId] || { samples: 0, fingerprints: new Map() };
  const distinctFp = t.fingerprints.size;
  const maxRepeat = Math.max(0, ...Array.from(t.fingerprints.values()));
  console.log(
    `  ${tpl.templateId}: samples=${t.samples} distinctFingerprints=${distinctFp} maxRepeatCount=${maxRepeat}`
  );
}

console.log('\n--- Per-competency sample counts ---');
for (const [k, v] of Object.entries(perCompetency)) console.log(`  ${k}: ${v}`);

console.log('\n--- Per-archetype sample counts ---');
for (const [k, v] of Object.entries(perArchetype)) console.log(`  ${k}: ${v}`);

console.log(`\n${totalChecks - failedChecks} passed, ${failedChecks} failed (of ${totalChecks} checks across ${totalSamples} samples)`);
if (failures.length > 0) {
  console.log('\n--- Failures ---');
  failures.slice(0, 50).forEach((f) => {
    console.log(`  FAIL  ${f.label}` + (f.context ? `  ${JSON.stringify(f.context)}` : ''));
  });
  if (failures.length > 50) console.log(`  ... and ${failures.length - 50} more`);
}

// Export summary for the report-generation step to consume without re-running.
module.exports = {
  totalChecks,
  failedChecks,
  totalSamples,
  perTemplate,
  perCompetency,
  perArchetype,
  baseSeed: BASE_SEED,
  samplesPerTemplate: SAMPLES_PER_TEMPLATE,
};

if (require.main === module) {
  process.exitCode = failedChecks > 0 ? 1 : 0;
}
