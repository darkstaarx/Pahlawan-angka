// questions/v2/engine/validator.js
//
// Validation Layer (blueprint §1 item 6, migration gates Phase 1 item 5).
//
// Deliberately dependency-free: the rest of this repository ships no
// package.json / node_modules, so this implements just the subset of
// JSON Schema (draft 2020-12) actually used by
// questions/v2/schema/*.schema.json, rather than pulling in a library.
// Supported keywords: type, required, properties, enum, pattern,
// minLength, minimum, maximum, items, uniqueItems.

'use strict';

const fs = require('fs');
const path = require('path');

function loadSchema(name) {
  const file = path.join(__dirname, '..', 'schema', name);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const CURRICULUM_SCHEMA = loadSchema('curriculum-standard.schema.json');
const TEMPLATE_SCHEMA = loadSchema('question-template.schema.json');

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value; // 'string' | 'number' | 'boolean' | 'object' | 'undefined'
}

function matchesType(value, type) {
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  return typeOf(value) === type;
}

/**
 * Validate `value` against a (small subset of) JSON Schema `schema`.
 * Pushes human-readable error strings into `errors`, prefixed with `pathLabel`.
 */
function validateAgainstSchema(value, schema, errors, pathLabel) {
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => matchesType(value, t))) {
      errors.push(`${pathLabel}: expected type ${types.join('|')}, got ${typeOf(value)}`);
      return; // further checks on a wrongly-typed value are not meaningful
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathLabel}: value "${value}" not in allowed set [${schema.enum.join(', ')}]`);
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${pathLabel}: string shorter than minLength ${schema.minLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${pathLabel}: "${value}" does not match pattern ${schema.pattern}`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${pathLabel}: ${value} below minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${pathLabel}: ${value} above maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.uniqueItems) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push(`${pathLabel}: duplicate array item ${key}`);
        }
        seen.add(key);
      }
    }
    if (schema.items) {
      value.forEach((item, i) => validateAgainstSchema(item, schema.items, errors, `${pathLabel}[${i}]`));
    }
  }

  if (schema.type === 'object' || (Array.isArray(schema.type) && schema.type.includes('object'))) {
    if (typeOf(value) === 'object') {
      for (const req of schema.required || []) {
        if (!(req in value)) {
          errors.push(`${pathLabel}: missing required field "${req}"`);
        }
      }
      for (const [key, subSchema] of Object.entries(schema.properties || {})) {
        if (value[key] !== undefined) {
          validateAgainstSchema(value[key], subSchema, errors, `${pathLabel}.${key}`);
        }
      }
    }
  }
}

function validateCurriculumRecord(record) {
  const errors = [];
  const label = record && record.standardId ? `curriculum[${record.standardId}]` : 'curriculum[?]';
  validateAgainstSchema(record, CURRICULUM_SCHEMA, errors, label);
  return { valid: errors.length === 0, errors };
}

function validateQuestionTemplate(template) {
  const errors = [];
  const label = template && template.templateId ? `template[${template.templateId}]` : 'template[?]';
  validateAgainstSchema(template, TEMPLATE_SCHEMA, errors, label);
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a whole curriculum set: per-record schema validation, duplicate
 * standardId detection, and prerequisite references that point at an
 * unknown SP within the same curriculumVersion+grade.
 */
function validateCurriculumSet(records) {
  const errors = [];
  const seenStandardIds = new Map(); // key -> standardId already seen for that scope
  const knownKeys = new Set(records.map((r) => `${r.curriculumVersion}::${r.grade}::${r.standardId}`));

  for (const rec of records) {
    const { errors: recErrors } = validateCurriculumRecord(rec);
    errors.push(...recErrors);

    const scopeKey = `${rec.curriculumVersion}::${rec.grade}`;
    const dupKey = `${scopeKey}::${rec.standardId}`;
    if (seenStandardIds.has(dupKey)) {
      errors.push(`curriculum[${rec.standardId}]: duplicate standardId within ${scopeKey}`);
    }
    seenStandardIds.set(dupKey, true);

    for (const prereq of rec.prerequisites || []) {
      const prereqKey = `${scopeKey}::${prereq}`;
      if (!knownKeys.has(prereqKey)) {
        errors.push(`curriculum[${rec.standardId}]: prerequisite references unknown SP "${prereq}" in ${scopeKey}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Build a (curriculumVersion, grade, standardId) -> single curriculum record index. */
function buildStandardIndex(curriculumRecords) {
  const index = new Map();
  for (const rec of curriculumRecords) {
    index.set(`${rec.curriculumVersion}::${rec.grade}::${rec.standardId}`, rec);
  }
  return index;
}

/**
 * A template "exactly matches" a curriculum record when it targets the same
 * (curriculumVersion, grade, standardId) AND its competencyId/topicId agree
 * with that record. This is intentionally stricter than checking
 * competencyId/topicId existence independently (Phase 1.1 hardening): a
 * template that names a real competencyId belonging to a *different* SP
 * must fail, not silently pass.
 */
function isExactMatch(template, curriculumRecord) {
  return (
    template.curriculumVersion === curriculumRecord.curriculumVersion &&
    template.grade === curriculumRecord.grade &&
    template.standardId === curriculumRecord.standardId &&
    template.competencyId === curriculumRecord.competencyId &&
    template.topicId === curriculumRecord.topicId
  );
}

/**
 * Validate a whole template set: per-template schema validation, duplicate
 * templateId detection, and a hardened curriculum cross-reference check.
 *
 * The cross-reference check resolves the template to ONE exact curriculum
 * record via (curriculumVersion, grade, standardId), then asserts that the
 * template's competencyId and topicId match THAT SAME record — not merely
 * that they exist somewhere in the curriculum set. A template naming
 * standardId=7.1.1 but a competencyId that actually belongs to 7.2.1 is
 * rejected, even though both the SP and the competencyId are individually
 * "known".
 */
function validateTemplateSet(templates, curriculumRecords) {
  const errors = [];
  const seenTemplateIds = new Set();
  const standardIndex = buildStandardIndex(curriculumRecords);

  for (const tpl of templates) {
    const { errors: tplErrors } = validateQuestionTemplate(tpl);
    errors.push(...tplErrors);

    if (tpl.templateId) {
      if (seenTemplateIds.has(tpl.templateId)) {
        errors.push(`template[${tpl.templateId}]: duplicate templateId`);
      }
      seenTemplateIds.add(tpl.templateId);
    }

    if (tpl.curriculumVersion && tpl.grade !== undefined && tpl.standardId) {
      const stdKey = `${tpl.curriculumVersion}::${tpl.grade}::${tpl.standardId}`;
      const record = standardIndex.get(stdKey);
      if (!record) {
        errors.push(`template[${tpl.templateId || '?'}]: references unknown SP "${tpl.standardId}" for ${tpl.curriculumVersion} grade ${tpl.grade}`);
      } else {
        if (tpl.competencyId !== record.competencyId) {
          errors.push(
            `template[${tpl.templateId || '?'}]: competencyId "${tpl.competencyId}" does not match the curriculum record for standardId "${tpl.standardId}" ` +
            `(that record's competencyId is "${record.competencyId}")`
          );
        }
        if (tpl.topicId !== record.topicId) {
          errors.push(
            `template[${tpl.templateId || '?'}]: topicId "${tpl.topicId}" does not match the curriculum record for standardId "${tpl.standardId}" ` +
            `(that record's topicId is "${record.topicId}")`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Enabled-readiness gate (Phase 1.1 hardening): a curriculum record having
 * status="enabled" is not, by itself, evidence that it is safe to enable.
 * This checks the substantive conditions blueprint §11/migration-gates
 * expect before Question System v2 may claim coverage for an SP:
 *
 *   - at least one template exactly targets that SP (see isExactMatch);
 *   - every such template's `generator` key is registered;
 *   - every such template's non-null `renderer` key is registered;
 *   - the template set as a whole still passes validateTemplateSet.
 *
 * Records with status !== "enabled" (e.g. "mapped") are not checked here —
 * mapped records are explicitly allowed to have zero executable templates.
 *
 * @param {Array<object>} curriculumRecords
 * @param {Array<object>} templates
 * @param {Iterable<string>} availableGeneratorKeys keys registered in questions/v2/generators
 * @param {Iterable<string>} availableRendererKeys keys registered in questions/v2/renderers
 */
function validateEnabledReadiness(curriculumRecords, templates, availableGeneratorKeys, availableRendererKeys) {
  const errors = [];
  const genSet = new Set(availableGeneratorKeys || []);
  const rendSet = new Set(availableRendererKeys || []);

  const setResult = validateTemplateSet(templates, curriculumRecords);
  if (!setResult.valid) {
    for (const e of setResult.errors) {
      errors.push(`enabled-readiness: blocked by template-set validation error: ${e}`);
    }
  }

  // Only schema-valid templates can count as evidence for readiness.
  const schemaValidTemplates = templates.filter((t) => validateQuestionTemplate(t).valid);

  for (const rec of curriculumRecords) {
    if (rec.status !== 'enabled') continue;

    const matching = schemaValidTemplates.filter((t) => isExactMatch(t, rec));

    if (matching.length === 0) {
      errors.push(
        `enabled-readiness[${rec.standardId}]: status="enabled" requires at least one valid template exactly ` +
        `targeting curriculumVersion="${rec.curriculumVersion}" grade=${rec.grade} standardId="${rec.standardId}" ` +
        `(competencyId="${rec.competencyId}", topicId="${rec.topicId}"), but none was found`
      );
      continue;
    }

    for (const t of matching) {
      if (!t.generator || !genSet.has(t.generator)) {
        errors.push(
          `enabled-readiness[${rec.standardId}]: template "${t.templateId}" references generator "${t.generator}", which is not registered`
        );
      }
      if (t.renderer != null && !rendSet.has(t.renderer)) {
        errors.push(
          `enabled-readiness[${rec.standardId}]: template "${t.templateId}" references renderer "${t.renderer}", which is not registered`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Report mapped vs enabled (and other status) counts per curriculumVersion+grade. */
function statusReport(records) {
  const byScope = new Map();
  for (const rec of records) {
    const scopeKey = `${rec.curriculumVersion} / D${rec.grade}`;
    if (!byScope.has(scopeKey)) {
      byScope.set(scopeKey, { mapped: 0, enabled: 0, legacy: 0, retired: 0, needs_human_review: 0, total: 0 });
    }
    const bucket = byScope.get(scopeKey);
    bucket.total += 1;
    if (bucket[rec.status] !== undefined) bucket[rec.status] += 1;
  }
  return byScope;
}

module.exports = {
  CURRICULUM_SCHEMA,
  TEMPLATE_SCHEMA,
  validateCurriculumRecord,
  validateQuestionTemplate,
  validateCurriculumSet,
  validateTemplateSet,
  validateEnabledReadiness,
  isExactMatch,
  statusReport,
};
